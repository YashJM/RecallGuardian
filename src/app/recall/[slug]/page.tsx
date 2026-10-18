import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getRecalls,
  getRecallByNid,
  getRelated,
  getRecallExtras,
  whoAtRisk,
  recallSteps,
  nidFromSlug,
} from "@/lib/recalls";
import RecallCard from "@/components/RecallCard";
import { CatGlyph, Medallion, WarnIcon, OutboundIcon, PinIcon } from "@/components/icons";

// Rebuild each recall page from fresh data hourly; render unknown ones on demand.
export const revalidate = 3600;
export const dynamicParams = true;

// Pre-render only the most recent recalls at build time (fast builds); every
// other recall renders on first visit and is then cached (ISR via dynamicParams).
// Kept modest because each prerendered page also fetches its official notice
// (for the product photo + distribution); the rest render on-demand via ISR.
const PRERENDER_LIMIT = 48;

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
  const desc = (r.issue || r.product || `${TIER_LABEL[r.tier]} recall in Canada.`).slice(0, 155);
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

  const [related, extras] = await Promise.all([getRelated(r), getRecallExtras(r)]);
  const atRisk = whoAtRisk(r);
  const steps = recallSteps(r);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: r.title,
    datePublished: r.lastUpdated || undefined,
    dateModified: r.lastUpdated || undefined,
    articleSection: r.category,
    image: extras.imageUrl || undefined,
    publisher: { "@type": "Organization", name: "RecallGuardian" },
    about: { "@type": "Thing", name: r.product || r.title },
    isBasedOn: r.sourceUrl,
    inLanguage: "en-CA",
  };

  return (
    <main className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ paddingTop: "clamp(20px,4vw,34px)" }}>
        <article className={`detail ${r.tier}`}>
          <div className="bar" />
          <div className="body">
            <div className="lead">
              <div>
                <div className="metaline">
                  <Medallion group={r.group} sm />
                  <span>{r.category}</span>
                  {r.recallClass && <span>· {r.recallClass}</span>}
                  {r.lastUpdated && <span className="mono">· Updated {formatDate(r.lastUpdated)}</span>}
                </div>
                <h1>{r.title}</h1>
                <div className="riskrow">
                  <span className={`prio ${r.tier}`}>{TIER_LABEL[r.tier]} priority</span>
                </div>
              </div>
              <div className="photo">
                {extras.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={extras.imageUrl} alt={`Recalled product: ${r.title}`} loading="lazy" />
                ) : (
                  <CatGlyph group={r.group} />
                )}
              </div>
            </div>

            {atRisk && (
              <div className="riskrow" style={{ marginTop: 22 }}>
                <div className="risk-big">
                  <WarnIcon />
                  <span className="t">
                    <b>Most at risk</b>
                    {atRisk}
                  </span>
                </div>
              </div>
            )}

            {steps.length > 0 && (
              <div className="section">
                <span className="u">What you should do</span>
                <ol className="steps">
                  {steps.map((s, i) => (
                    <li key={i}>
                      <span className="n">{i + 1}</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {r.issue && (
              <div className="section">
                <span className="u">The issue</span>
                <p>{r.issue}</p>
              </div>
            )}

            {r.product && (
              <div className="section">
                <span className="u">Affected product</span>
                <p>{r.product}</p>
              </div>
            )}

            {extras.distribution && (
              <div className="section">
                <span className="u">Where it was sold</span>
                <p>
                  <span className="province" style={{ marginRight: 8 }}>
                    <PinIcon />
                    {extras.distribution}
                  </span>
                  <span style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
                    Reported in the official notice — confirm there.
                  </span>
                </p>
              </div>
            )}

            <div className="section">
              <span className="u">Issued by</span>
              <p>{r.agency}</p>
            </div>

            <div className="section">
              <a className="srcbtn" href={r.sourceUrl} target="_blank" rel="noopener">
                <OutboundIcon />
                Read the official Government of Canada notice
              </a>
              <p style={{ color: "var(--muted)", fontSize: "0.82rem", marginTop: 10, maxWidth: "66ch" }}>
                RecallGuardian ranks, illustrates and rewrites recalls in plain
                language. The official notice is authoritative — confirm model
                numbers, lot codes, dates and remedies there.
              </p>
            </div>

            <Link className="backlink" href="/">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
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
                <RecallCard key={x.nid} r={{ ...x, atRisk: whoAtRisk(x) }} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
