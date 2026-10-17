import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRecalls,
  getRecallByNid,
  getRelated,
  nidFromSlug,
} from "@/lib/recalls";
import RecallCard from "@/components/RecallCard";

// Rebuild each recall page from fresh data once a day; render unknown ones on demand.
export const revalidate = 86400;
export const dynamicParams = true;

// Pre-render only the most recent recalls at build time (fast builds); every
// other recall renders on first visit and is then cached (ISR via dynamicParams).
const PRERENDER_LIMIT = 500;

export async function generateStaticParams() {
  const all = await getRecalls();
  return [...all]
    .filter((r) => r.lastUpdated)
    .sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated))
    .slice(0, PRERENDER_LIMIT)
    .map((r) => ({ slug: r.slug }));
}

async function load(slug: string) {
  return getRecallByNid(nidFromSlug(slug));
}

const TIER_LABEL = { critical: "Critical", high: "High", standard: "Standard" };

function formatDate(d: string): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) return { title: "Recall not found" };
  const desc =
    (r.issue || r.product || `${TIER_LABEL[r.tier]} recall in Canada.`).slice(
      0,
      155
    );
  return {
    title: `${r.title} — recall`,
    description: desc,
    alternates: { canonical: `/recall/${r.slug}` },
    openGraph: {
      title: `${r.title} — Canadian recall`,
      description: desc,
      url: `https://recallguardian.ca/recall/${r.slug}`,
      type: "article",
    },
  };
}

export default async function RecallPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await load(slug);
  if (!r) notFound();
  const related = await getRelated(r);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: r.title,
    datePublished: r.lastUpdated || undefined,
    dateModified: r.lastUpdated || undefined,
    articleSection: r.category,
    publisher: {
      "@type": "Organization",
      name: "RecallGuardian",
    },
    about: {
      "@type": "Thing",
      name: r.product || r.title,
    },
    isBasedOn: r.sourceUrl,
    inLanguage: "en-CA",
  };

  return (
    <main className="wrap">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div style={{ paddingTop: "clamp(20px,4vw,36px)" }}>
        <article className={`detail ${r.tier}`}>
          <div className="bar" />
          <div className="body">
            <div className="meta" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <span className={`pill ${r.tier}`}>{TIER_LABEL[r.tier]} priority</span>
              <span className="cat">{r.category}</span>
              {r.recallClass && <span className="cat">· {r.recallClass}</span>}
              {r.lastUpdated && (
                <span className="date mono" style={{ marginLeft: "auto" }}>
                  Updated {formatDate(r.lastUpdated)}
                </span>
              )}
            </div>

            <h1>{r.title}</h1>

            {r.product && (
              <div className="block">
                <span className="u">Affected product</span>
                <p>{r.product}</p>
              </div>
            )}

            {r.issue && (
              <div className="block">
                <span className="u">The issue</span>
                <p>{r.issue}</p>
              </div>
            )}

            {r.whatToDo && (
              <div className="block">
                <span className="u">What you should do</span>
                <p>{r.whatToDo}</p>
              </div>
            )}

            <div className="block">
              <span className="u">Issued by</span>
              <p>{r.agency}</p>
            </div>

            <div className="block">
              <a className="src" href={r.sourceUrl} target="_blank" rel="noopener">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
                Read the official Government of Canada notice
              </a>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 10 }}>
                RecallGuardian re-ranks and rewrites recalls in plain language.
                The official notice is the authoritative source — confirm model
                numbers, dates and remedies there.
              </p>
            </div>

            <Link className="backlink" href="/">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5m6-6-6 6 6 6" />
              </svg>
              All recalls
            </Link>
          </div>
        </article>

        {related.length > 0 && (
          <section className="related">
            <h2>More {r.group} recalls</h2>
            <div className="feed">
              {related.map((x) => (
                <RecallCard key={x.nid} r={x} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
