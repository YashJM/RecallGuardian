import Link from "next/link";
import type { Recall } from "@/lib/recalls";
import { CatGlyph, Medallion, WarnIcon } from "./icons";

const TIER_LABEL = { critical: "Critical", high: "High", standard: "Standard" };

type Item = Recall & { atRisk?: string | null; imageUrl?: string | null };

function relativeDate(d: string): string {
  if (!d) return "";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

/** Thumbnail feed row: product photo + severity + title + who's-at-risk. */
export default function RecallCard({ r }: { r: Item }) {
  return (
    <Link className={`rrow ${r.tier}`} href={`/recall/${r.slug}`}>
      <div className="rmain">
        {r.imageUrl ? (
          <span className="thumb">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.imageUrl} alt={`Recalled product: ${r.title}`} loading="lazy" />
          </span>
        ) : (
          <span className={`thumb tile ${r.group}`} aria-hidden="true">
            <CatGlyph group={r.group} />
          </span>
        )}
        <div className="rbody">
          <div className="rmeta">
            <span className={`sev ${r.tier}`}>
              <span className="d" aria-hidden="true" />
              {TIER_LABEL[r.tier]}
            </span>
            <Medallion group={r.group} sm />
            <span className="cat">{r.category}</span>
            {r.lastUpdated && <span className="rdate">{relativeDate(r.lastUpdated)}</span>}
          </div>
          <h3>{r.title}</h3>
          {r.atRisk ? (
            <span className="atrisk">
              <WarnIcon />
              <span>Most at risk: {r.atRisk}</span>
            </span>
          ) : (
            (r.issue || r.product) && <span className="hazard">{r.issue || r.product}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

/** Showcase hero card: a big product image for the most urgent recall. */
export function RecallHero({ r }: { r: Item }) {
  return (
    <Link className={`hero ${r.tier}`} href={`/recall/${r.slug}`}>
      <div className="hero-img">
        {r.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={r.imageUrl} alt={`Recalled product: ${r.title}`} />
        ) : (
          <span className={`tile ${r.group}`} aria-hidden="true">
            <CatGlyph group={r.group} />
          </span>
        )}
        <span className={`sev solid ${r.tier}`}>
          <span className="d" aria-hidden="true" />
          {TIER_LABEL[r.tier]}
        </span>
        <span className="hero-meta">
          {r.category}
          {r.lastUpdated ? ` · ${relativeDate(r.lastUpdated)}` : ""}
        </span>
      </div>
      <div className="hero-body">
        <h2>{r.title}</h2>
        {r.atRisk && (
          <span className="atrisk">
            <WarnIcon />
            <span>Most at risk: {r.atRisk}</span>
          </span>
        )}
      </div>
    </Link>
  );
}
