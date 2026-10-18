import Link from "next/link";
import type { Recall } from "@/lib/recalls";
import { CatGlyph, Medallion, WarnIcon } from "./icons";

const TIER_LABEL = { critical: "Critical", high: "High", standard: "Standard" };

function relativeDate(d: string): string {
  if (!d) return "";
  const days = Math.floor((Date.now() - new Date(d).getTime()) / 86_400_000);
  if (Number.isNaN(days)) return "";
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} wk ago`;
  if (days < 365) return `${Math.floor(days / 30)} mo ago`;
  return `${Math.floor(days / 365)} yr ago`;
}

/**
 * Feed row: a product-photo thumbnail (real when we have one, a small category
 * tile when we don't) alongside severity, title, and the who's-at-risk line.
 * Useful and distinct whether or not a photo exists.
 */
export default function RecallCard({
  r,
}: {
  r: Recall & { atRisk?: string | null; imageUrl?: string | null };
}) {
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
