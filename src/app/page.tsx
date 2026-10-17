import { getRecalls, GROUPS } from "@/lib/recalls";
import Feed from "@/components/Feed";

// Rebuild the homepage from fresh feed data once a day.
export const revalidate = 86400;

const HOMEPAGE_LIMIT = 120;

export default async function Home() {
  const all = await getRecalls();
  const active = all.filter((r) => !r.archived).slice(0, HOMEPAGE_LIMIT);

  const counts: Record<string, number> = { all: active.length };
  for (const g of GROUPS) counts[g.id] = 0;
  for (const r of active) counts[r.group] = (counts[r.group] ?? 0) + 1;

  return (
    <main className="wrap">
      <div className="page-head">
        <span className="eyebrow">
          <span className="dot" />
          <span className="u">Updated daily · CFIA · Health Canada · Transport Canada</span>
        </span>
        <h1>Canada&rsquo;s recalls, ranked</h1>
        <p className="sub">
          Every Canadian safety recall in one place, ordered by how much it
          matters to a household — food and medicine first. Tap any recall for
          the official Government of Canada notice.
        </p>
      </div>

      <Feed recalls={active} counts={counts} />
    </main>
  );
}
