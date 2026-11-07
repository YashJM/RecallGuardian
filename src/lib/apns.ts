import http2 from "node:http2";
import { importPKCS8, SignJWT } from "jose";
import { supabaseAdmin } from "./supabase";

/**
 * Minimal token-based APNs provider.
 *
 * Auth is a short JWT (ES256) signed with your .p8 key. Apple throttles how
 * often you may mint a new one (TooManyProviderTokenUpdates if < ~20 min
 * apart) but a token is valid ~1h, so we cache the signed JWT in Supabase and
 * reuse it for ~50 min across the frequent poll runs.
 */

const JWT_CACHE_KEY = "apns_jwt";
const JWT_MAX_AGE_MS = 50 * 60 * 1000;

export type ApnsEnv = "production" | "sandbox";

function host(env?: ApnsEnv): string {
  // TestFlight + App Store builds use production; a dev build's token is sandbox.
  const target = env ?? (process.env.APNS_ENV === "sandbox" ? "sandbox" : "production");
  return target === "sandbox"
    ? "https://api.sandbox.push.apple.com"
    : "https://api.push.apple.com";
}

async function providerToken(): Promise<string> {
  const db = supabaseAdmin();
  const { data } = await db.from("kv").select("value").eq("key", JWT_CACHE_KEY).maybeSingle();
  const cached = data?.value as { jwt: string; iat: number } | undefined;
  if (cached && Date.now() - cached.iat < JWT_MAX_AGE_MS) return cached.jwt;

  const keyId = must("APNS_KEY_ID");
  const teamId = must("APNS_TEAM_ID");
  const p8 = must("APNS_P8").replace(/\\n/g, "\n");
  const key = await importPKCS8(p8, "ES256");
  const jwt = await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId })
    .setIssuer(teamId)
    .setIssuedAt()
    .sign(key);

  await db.from("kv").upsert({ key: JWT_CACHE_KEY, value: { jwt, iat: Date.now() }, updated_at: new Date().toISOString() });
  return jwt;
}

function must(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set`);
  return v;
}

export interface PushMessage {
  token: string;
  title: string;
  body: string;
  // Present for a single-recall alert; omitted for a digest (opens the feed).
  nid?: string;
  slug?: string;
  // Marks an "N new recalls" summary so the app opens the feed on tap.
  digest?: boolean;
}

// All recall alerts share one thread so they stack in Notification Center
// instead of scattering.
const THREAD_ID = "recall-alerts";

export interface PushResult {
  sent: number;
  failed: number;
  deadTokens: string[]; // tokens Apple says are invalid/unregistered — prune these
  errors: { token: string; status: number; reason: string }[];
}

/**
 * Send a batch of notifications over one HTTP/2 connection. `env` overrides
 * APNS_ENV (used by the push-test endpoint to try both environments).
 */
export async function sendPushes(messages: PushMessage[], env?: ApnsEnv): Promise<PushResult> {
  const result: PushResult = { sent: 0, failed: 0, deadTokens: [], errors: [] };
  if (messages.length === 0) return result;

  const jwt = await providerToken();
  const topic = must("APNS_BUNDLE_ID");
  const session = http2.connect(host(env));

  const done = new Promise<void>((resolve, reject) => {
    session.on("error", reject);
    session.on("close", () => resolve());
  });

  try {
    await Promise.all(
      messages.map(
        (m) =>
          new Promise<void>((resolve) => {
            const payload = JSON.stringify({
              aps: {
                alert: { title: m.title, body: m.body },
                sound: "default",
                "thread-id": THREAD_ID,
              },
              ...(m.nid ? { nid: m.nid } : {}),
              ...(m.slug ? { slug: m.slug } : {}),
              ...(m.digest ? { digest: true } : {}),
            });
            const req = session.request({
              ":method": "POST",
              ":path": `/3/device/${m.token}`,
              authorization: `bearer ${jwt}`,
              "apns-topic": topic,
              "apns-push-type": "alert",
              "apns-priority": "10",
              "content-type": "application/json",
            });
            let status = 0;
            let data = "";
            req.on("response", (h) => { status = Number(h[":status"]) || 0; });
            req.setEncoding("utf8");
            req.on("data", (c) => { data += c; });
            req.on("end", () => {
              if (status === 200) {
                result.sent++;
              } else {
                result.failed++;
                // 410 Unregistered, or 400 BadDeviceToken -> token is dead.
                const reason = (() => { try { return JSON.parse(data).reason; } catch { return ""; } })();
                result.errors.push({ token: m.token, status, reason });
                if (status === 410 || reason === "BadDeviceToken" || reason === "Unregistered") {
                  result.deadTokens.push(m.token);
                }
              }
              resolve();
            });
            req.on("error", (e) => {
              result.failed++;
              result.errors.push({ token: m.token, status: 0, reason: e.message });
              resolve();
            });
            req.end(payload);
          })
      )
    );
  } finally {
    session.close();
    await done.catch(() => {});
  }

  return result;
}
