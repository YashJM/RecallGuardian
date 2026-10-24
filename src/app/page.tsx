import { getRecalls, GROUPS, whoAtRisk, getRecallExtras } from "@/lib/recalls";
import Feed from "@/components/Feed";

// How many top items to fetch real product photos for (drives the photo nudge).
const PHOTO_ENRICH = 30;

const TIER_RANK: Record<string, number> = { critical: 0, high: 1, standard: 2 };

// Rebuild the homepage from fresh feed data hourly.
export const revalidate = 3600;

const HOMEPAGE_LIMIT = 120;

function formatDay(d: string): string {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function Home() {
  const all = await getRecalls();
  const base = all.filter((r) => !r.archived).slice(0, HOMEPAGE_LIMIT);
  const newest = all.reduce(
    (max, r) => (r.lastUpdated > max ? r.lastUpdated : max),
    ""
  );

  // Fetch real product photos for the top slice.
  const toEnrich = base.slice(0, PHOTO_ENRICH);
  const photos = new Map(
    await Promise.all(
      toEnrich.map(
        async (r) => [r.nid, (await getRecallExtras(r)).imageUrl] as const
      )
    )
  );

  // Protection-first, with a within-tier nudge for recalls that have a photo
  // (a photo can never lift a lower tier above a higher one).
  const ranked = base
    .map((r, i) => ({ r, i }))
    .sort((a, b) => {
      const ta = TIER_RANK[a.r.tier] ?? 9;
      const tb = TIER_RANK[b.r.tier] ?? 9;
      if (ta !== tb) return ta - tb;
      const pa = photos.get(a.r.nid) ? 0 : 1;
      const pb = photos.get(b.r.nid) ? 0 : 1;
      if (pa !== pb) return pa - pb;
      return a.i - b.i;
    })
    .map((x) => x.r);

  const active = ranked.map((r) => ({
    ...r,
    atRisk: whoAtRisk(r),
    imageUrl: photos.get(r.nid) ?? null,
  }));

  const counts: Record<string, number> = { all: active.length };
  for (const g of GROUPS) counts[g.id] = 0;
  for (const r of active) counts[r.group] = (counts[r.group] ?? 0) + 1;

  const defaultGroup = counts.food > 0 ? "food" : "all";

  return (
    <main className="wrap">
      <div className="page-head">
        <span className="u">Updated daily · CFIA · Health Canada · Transport Canada</span>
        <h1>Canada&rsquo;s recalls, ranked</h1>
        <p className="sub">
          Every Canadian safety recall in one place, ordered by how much it
          matters to a household &mdash; food and medicine first. Each one opens
          to plain-language steps, who&rsquo;s at risk, and the official notice.
        </p>
        {newest && (
          <p className="synced mono">Data current to {formatDay(newest)}</p>
        )}
      </div>

      <Feed recalls={active} counts={counts} initial={defaultGroup} />
    </main>
  );
}
