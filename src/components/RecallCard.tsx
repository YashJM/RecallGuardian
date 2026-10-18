import Link from "next/link";
import type { Recall } from "@/lib/recalls";
import { Medallion, WarnIcon } from "./icons";

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
 * Information-led feed row: severity + category + plain-language title, and the
 * "who's at risk" line when we can derive one (no extra fetch), otherwise the
 * hazard. Distinct and useful even with no product photo.
 */
export default function RecallCard({
  r,
}: {
  r: Recall & { atRisk?: string | null };
}) {
  return (
    <Link className={`rrow ${r.tier}`} href={`/recall/${r.slug}`}>
      <span className="rail" aria-hidden="true" />
      <div className="rbody">
        <div className="rmeta">
          <span className={`prio ${r.tier}`}>{TIER_LABEL[r.tier]}</span>
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
    </Link>
  );
}
