import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_GROUPS = new Set(["food", "medicine", "kids", "vehicles", "household"]);
const VALID_THRESHOLDS = new Set(["critical", "high", "all"]);

/**
 * Register / update a device for push alerts. Called by the iOS app on launch
 * and whenever the user changes their alert preferences. Anonymous — the APNs
 * token is the identity; no accounts.
 *
 * Body: { token, categories?: string[], threshold?: string, enabled?: bool, platform?: string }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const token = typeof body.token === "string" ? body.token.trim() : "";
  if (!/^[0-9a-fA-F]{64,}$/.test(token)) {
    return NextResponse.json({ error: "invalid token" }, { status: 400 });
  }

  const categories = Array.isArray(body.categories)
    ? [...new Set(body.categories.filter((c): c is string => typeof c === "string" && VALID_GROUPS.has(c)))]
    : [];
  const threshold =
    typeof body.threshold === "string" && VALID_THRESHOLDS.has(body.threshold) ? body.threshold : "all";
  const enabled = body.enabled === undefined ? true : Boolean(body.enabled);
  const platform = typeof body.platform === "string" ? body.platform : "ios";

  try {
    const { error } = await supabaseAdmin()
      .from("devices")
      .upsert(
        { token, categories, threshold, enabled, platform, updated_at: new Date().toISOString() },
        { onConflict: "token" }
      );
    if (error) throw error;
  } catch {
    return NextResponse.json({ error: "store failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
