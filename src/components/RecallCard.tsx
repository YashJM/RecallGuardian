import Link from "next/link";
import type { Recall } from "@/lib/recalls";

const TIER_LABEL = { critical: "Critical", high: "High", standard: "Standard" };

function formatDate(d: string): string {
  if (!d) return "";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RecallCard({ r }: { r: Recall }) {
  return (
    <Link className={`rc ${r.tier}`} href={`/recall/${r.slug}`}>
      <span className="stripe" aria-hidden="true" />
      <div className="pad">
        <div className="meta">
          <span className={`pill ${r.tier}`}>{TIER_LABEL[r.tier]}</span>
          <span className="cat">{r.category}</span>
          {r.lastUpdated && <span className="date">{formatDate(r.lastUpdated)}</span>}
        </div>
        <h3>{r.title}</h3>
        {(r.issue || r.product) && (
          <p className="issue">{r.issue || r.product}</p>
        )}
      </div>
    </Link>
  );
}
