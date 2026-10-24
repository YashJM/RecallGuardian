import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getRecalls, whoAtRisk, getRecallExtras } from "@/lib/recalls";
import { HUBS, getHub } from "@/lib/hubs";
import RecallCard, { RecallHero } from "@/components/RecallCard";
import { Medallion } from "@/components/icons";

export const revalidate = 3600;
// Only the known hub slugs are valid pages; anything else is a 404.
export const dynamicParams = false;

const PHOTO_ENRICH = 24;
const LIST_LIMIT = 60;
const BASE = "https://recallguardian.ca";

export function generateStaticParams() {
  return HUBS.map((h) => ({ category: h.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  const hub = getHub(category);
  if (!hub) return {};
  return {
    title: hub.metaTitle,
    description: hub.metaDescription,
    alternates: { canonical: `/${hub.slug}` },
    openGraph: {
      title: `${hub.metaTitle} — RecallGuardian`,
      description: hub.metaDescription,
      url: `${BASE}/${hub.slug}`,
      type: "website",
    },
  };
}

function formatDay(d: string): string {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long", day: "numeric" });
}

export default async function CategoryHub({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const hub = getHub(category);
  if (!hub) notFound();

  const all = await getRecalls();
  const inGroup = all.filter((r) => !r.archived && r.group === hub.group).slice(0, LIST_LIMIT);
  const newest = inGroup.reduce((max, r) => (r.lastUpdated > max ? r.lastUpdated : max), "");

  // Enrich real product photos for the top slice (same budget as the homepage).
  const toEnrich = inGroup.slice(0, PHOTO_ENRICH);
  const photos = new Map(
    await Promise.all(
      toEnrich.map(async (r) => [r.nid, (await getRecallExtras(r)).imageUrl] as const)
    )
  );

  const items = inGroup.map((r) => ({
    ...r,
    atRisk: whoAtRisk(r),
    imageUrl: photos.get(r.nid) ?? null,
  }));

  const hero = items[0];
  const rows = items.slice(1);

  // ItemList structured data helps search engines understand the collection.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hub.metaTitle,
    description: hub.metaDescription,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 20).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE}/recall/${r.slug}`,
      name: r.title,
    })),
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="page-head">
        <span className="u">Updated daily · official Government of Canada data</span>
        <h1>{hub.h1}</h1>
        <p className="sub">{hub.lead}</p>
        {newest && <p className="synced mono">Data current to {formatDay(newest)}</p>}
      </div>

      {/* Browse other categories — internal links for crawl + navigation. */}
      <nav className="hubnav" aria-label="Recall categories">
        <Link className="hubchip" href="/">All recalls</Link>
        {HUBS.map((h) => (
          <Link
            key={h.slug}
            className={`hubchip ${h.slug === hub.slug ? "on" : ""}`}
            href={`/${h.slug}`}
            aria-current={h.slug === hub.slug ? "page" : undefined}
          >
            <Medallion group={h.group} sm />
            {h.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <p className="empty">No current recalls in this category right now. Check back soon.</p>
      ) : (
        <>
          {hero && <RecallHero r={hero} />}
          <div className="feed">
            {rows.map((r) => (
              <RecallCard key={r.nid} r={r} />
            ))}
          </div>
        </>
      )}

      <p className="hubfoot">
        Showing the most relevant {hub.label.toLowerCase()} recalls, ranked by household risk.{" "}
        <Link href="/">Search or browse every Canadian recall →</Link>
      </p>
    </main>
  );
}
