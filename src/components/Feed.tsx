"use client";

import { useState } from "react";
import { GROUPS, type Group, type Recall } from "@/lib/recalls";
import RecallCard from "./RecallCard";
import { Medallion } from "./icons";

export default function Feed({
  recalls,
  counts,
}: {
  recalls: Recall[];
  counts: Record<string, number>;
}) {
  const [active, setActive] = useState<Group | "all">("all");
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const shown = recalls.filter((r) => {
    if (active !== "all" && r.group !== active) return false;
    if (!q) return true;
    return `${r.title} ${r.product} ${r.category} ${r.agency}`
      .toLowerCase()
      .includes(q);
  });

  return (
    <>
      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a product, brand, or food…"
          aria-label="Search recalls"
        />
        <button type="submit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4-4" />
          </svg>
          Search
        </button>
      </form>

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
        {GROUPS.map((g) =>
          counts[g.id] ? (
            <button
              key={g.id}
              type="button"
              role="tab"
              aria-selected={active === g.id}
              className={`fchip ${active === g.id ? "on" : ""}`}
              onClick={() => setActive(g.id)}
            >
              <Medallion group={g.id} sm />
              {g.label}
              <span className="count">{counts[g.id]}</span>
            </button>
          ) : null
        )}
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
