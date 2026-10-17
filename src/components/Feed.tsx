"use client";

import { useState } from "react";
import { GROUPS, type Group, type Recall } from "@/lib/recalls";
import RecallCard from "./RecallCard";

export default function Feed({
  recalls,
  counts,
}: {
  recalls: Recall[];
  counts: Record<string, number>;
}) {
  const [active, setActive] = useState<Group | "all">("all");
  const shown =
    active === "all" ? recalls : recalls.filter((r) => r.group === active);

  return (
    <>
      <div className="filterbar" role="tablist" aria-label="Filter recalls by category">
        <button
          type="button"
          role="tab"
          aria-selected={active === "all"}
          className={`fchip ${active === "all" ? "on" : ""}`}
          onClick={() => setActive("all")}
        >
          All<span className="count">{counts.all}</span>
        </button>
        {GROUPS.map((g) => (
          <button
            key={g.id}
            type="button"
            role="tab"
            aria-selected={active === g.id}
            className={`fchip ${active === g.id ? "on" : ""}`}
            onClick={() => setActive(g.id)}
          >
            {g.label}
            {counts[g.id] ? <span className="count">{counts[g.id]}</span> : null}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="empty">No recalls in this category right now.</p>
      ) : (
        <div className="feed">
          {shown.map((r) => (
            <RecallCard key={r.nid} r={r} />
          ))}
        </div>
      )}
    </>
  );
}
