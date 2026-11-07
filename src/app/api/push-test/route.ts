import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPushes, type ApnsEnv } from "@/lib/apns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Send ONE test notification to verify APNs end to end (POLL_SECRET-guarded).
 *
 * Body (optional): { token } — defaults to the most recently registered device.
 * Tries production first; if Apple says the token belongs to the other
 * environment (a dev build's sandbox token), retries on sandbox. Returns
 * Apple's exact response for each attempt. Never prunes tokens.
 */
export async function POST(req: Request) {
  const secret = process.env.POLL_SECRET;
  const header = req.headers.get("authorization") || "";
  if (!secret || header !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let token = "";
  try {
    const body = await req.json();
    if (typeof body?.token === "string") token = body.token.trim();
  } catch {
    // no body — fall back to the latest device
  }

  try {
    if (!token) {
      const { data } = await supabaseAdmin()
        .from("devices")
        .select("token")
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      token = (data?.token as string) ?? "";
    }
    if (!token) {
      return NextResponse.json(
        { ok: false, error: "no registered devices — turn on alerts in the app first" },
        { status: 404 }
      );
    }

    const message = {
      token,
      title: "RecallGuardian test alert",
      body: "Push alerts are working. You'll hear from us when a new recall matches what you follow.",
    };

    const attempts: { env: ApnsEnv; sent: boolean; status?: number; reason?: string }[] = [];
    for (const env of ["production", "sandbox"] as ApnsEnv[]) {
      const r = await sendPushes([message], env);
      const err = r.errors[0];
      attempts.push({ env, sent: r.sent === 1, status: err?.status, reason: err?.reason });
      if (r.sent === 1) break;
      // Only retry on sandbox when the token looks like it's from the other environment.
      if (err?.reason !== "BadDeviceToken") break;
    }

    const delivered = attempts.find((a) => a.sent);
    return NextResponse.json({
      ok: Boolean(delivered),
      deliveredVia: delivered?.env ?? null,
      token: `${token.slice(0, 8)}…`,
      attempts,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
