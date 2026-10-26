import { NextResponse } from "next/server";
import { fetchRecallsConditional, type Recall, type FeedValidators } from "@/lib/recalls";
import { supabaseAdmin } from "@/lib/supabase";
import { sendPushes, type PushMessage } from "@/lib/apns";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Only recalls updated within this window are eligible to notify, so a feed
// reorder or a late backfill can never fire a burst of stale alerts.
const RECENCY_DAYS = 14;
// Per-device: at or above this many new recalls in one run, send ONE digest
// instead of a flood of individual notifications.
const DIGEST_THRESHOLD = 3;
// Hard safety cap on pushes per run.
const MAX_PUSHES = 2000;
const FEED_META_KEY = "feed_meta";

const GROUP_LABEL: Record<string, string> = {
  food: "food",
  medicine: "health product",
  kids: "kids product",
  vehicles: "vehicle",
  household: "household",
};
const TIER_RANK: Record<string, number> = { critical: 0, high: 1, standard: 2 };
const THRESHOLD_MAX: Record<string, number> = { critical: 0, high: 1, all: 2 };

function authorized(req: Request): boolean {
  const secret = process.env.POLL_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  const bearer = header.startsWith("Bearer ") ? header.slice(7) : "";
  const url = new URL(req.url);
  return bearer === secret || url.searchParams.get("secret") === secret;
}

/** "3 food, 1 vehicle" from a list of new recalls. */
function summarize(recalls: Recall[]): string {
  const counts = new Map<string, number>();
  for (const r of recalls) counts.set(r.group, (counts.get(r.group) ?? 0) + 1);
  return [...counts.entries()]
    .map(([g, n]) => `${n} ${GROUP_LABEL[g] ?? g}${n === 1 ? "" : "s"}`)
    .join(", ");
}

async function run() {
  const db = supabaseAdmin();

  // Cheap conditional fetch: a 304 means nothing changed since last poll.
  const { data: metaRow } = await db.from("kv").select("value").eq("key", FEED_META_KEY).maybeSingle();
  const prev = (metaRow?.value as FeedValidators) ?? undefined;
  const feed = await fetchRecallsConditional(prev);
  if (!feed.changed || !feed.recalls) return { unchanged: true };

  await db.from("kv").upsert({
    key: FEED_META_KEY,
    value: { etag: feed.etag, lastModified: feed.lastModified },
    updated_at: new Date().toISOString(),
  });

  const all = feed.recalls;
  const live = all.filter((r) => !r.archived && r.group !== "other");

  // First run ever: adopt everything as "already seen" and notify nobody.
  const { count } = await db.from("seen_recalls").select("*", { count: "exact", head: true });
  if (!count) {
    const rows = all.map((r) => ({ nid: r.nid }));
    for (let i = 0; i < rows.length; i += 1000) {
      await db.from("seen_recalls").upsert(rows.slice(i, i + 1000), { onConflict: "nid" });
    }
    return { firstRun: true, seeded: rows.length };
  }

  // Which of the current live recalls are new to us?
  const liveNids = live.map((r) => r.nid);
  const seen = new Set<string>();
  for (let i = 0; i < liveNids.length; i += 1000) {
    const { data } = await db.from("seen_recalls").select("nid").in("nid", liveNids.slice(i, i + 1000));
    data?.forEach((row) => seen.add(row.nid as string));
  }

  const cutoff = Date.now() - RECENCY_DAYS * 86_400_000;
  const fresh = (r: Recall) => {
    const t = new Date(r.lastUpdated).getTime();
    return Number.isNaN(t) ? false : t >= cutoff;
  };
  const newRecalls = live.filter((r) => !seen.has(r.nid) && fresh(r));

  // Always record new NIDs as seen (even unnotified) so we never reconsider them.
  const toMarkSeen = live.filter((r) => !seen.has(r.nid)).map((r) => ({ nid: r.nid }));

  let result = { sent: 0, failed: 0, pruned: 0, digests: 0 };
  if (newRecalls.length > 0) {
    const { data: devices } = await db
      .from("devices")
      .select("token, categories, threshold")
      .eq("enabled", true);

    const messages: PushMessage[] = [];
    for (const d of devices ?? []) {
      const cats = new Set((d.categories as string[]) ?? []);
      const tMax = THRESHOLD_MAX[(d.threshold as string) ?? "all"] ?? 2;
      const matched = newRecalls.filter(
        (r) => cats.has(r.group) && (TIER_RANK[r.tier] ?? 2) <= tMax
      );
      if (matched.length === 0) continue;

      if (matched.length >= DIGEST_THRESHOLD) {
        // One digest instead of a flood.
        messages.push({
          token: d.token as string,
          title: `${matched.length} new recalls`,
          body: `${summarize(matched)} — tap to review.`,
        });
        result.digests++;
      } else {
        for (const r of matched) {
          messages.push({
            token: d.token as string,
            title: `New ${GROUP_LABEL[r.group] ?? ""} recall`.replace(/\s+/g, " ").trim(),
            body: r.title,
            nid: r.nid,
            slug: r.slug,
          });
        }
      }
      if (messages.length >= MAX_PUSHES) break;
    }

    if (messages.length > 0) {
      const push = await sendPushes(messages);
      result = { ...result, sent: push.sent, failed: push.failed, pruned: push.deadTokens.length };
      if (push.deadTokens.length > 0) {
        await db.from("devices").delete().in("token", push.deadTokens);
      }
    }
  }

  for (let i = 0; i < toMarkSeen.length; i += 1000) {
    await db.from("seen_recalls").upsert(toMarkSeen.slice(i, i + 1000), { onConflict: "nid" });
  }

  return { firstRun: false, newRecalls: newRecalls.length, ...result };
}

export async function GET(req: Request) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  try {
    const out = await run();
    return NextResponse.json({ ok: true, ...out });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

export const POST = GET;
