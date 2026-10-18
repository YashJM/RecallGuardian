import Link from "next/link";
import type { Recall } from "@/lib/recalls";
import { CatGlyph, Medallion } from "./icons";

const TIER_LABEL = { critical: "Critical", high: "High", standard: "Standard" };

/**
 * Scan-style feed card: photo-led with a severity tag in the corner. The feed
 * uses the category tile as the image (fast, no per-item fetch); the real
 * product photo appears on the recall's own page.
 */
export default function RecallCard({ r }: { r: Recall }) {
  const hazard = r.issue || r.product || r.category;
  return (
    <Link className="rcard" href={`/recall/${r.slug}`}>
      <div className={`photo tile ${r.group}`}>
        <CatGlyph group={r.group} />
        <span className="corner">
          <span className={`prio ${r.tier}`}>{TIER_LABEL[r.tier]}</span>
        </span>
      </div>
      <div className="b">
        <h3>{r.title}</h3>
        <div className="foot">
          <Medallion group={r.group} sm />
          <span className="metaline" style={{ minWidth: 0 }}>
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
                maxWidth: "15ch",
              }}
            >
              {hazard}
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
