"use client";

import { useState } from "react";
import { GROUPS, type Group, type Recall } from "@/lib/recalls";
import RecallCard, { RecallHero } from "./RecallCard";
import { Medallion } from "./icons";

type Item = Recall & { atRisk?: string | null; imageUrl?: string | null };

const QUICK = ["Milk", "Eggs", "Cheese", "Peanut", "Wheat", "Beef", "Chicken", "Romaine"];

export default function Feed({
  recalls,
  counts,
  initial = "all",
}: {
  recalls: Item[];
  counts: Record<string, number>;
  initial?: Group | "all";
}) {
  const [active, setActive] = useState<Group | "all">(initial);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [withPhoto, setWithPhoto] = useState(false);
  const [query, setQuery] = useState("");

  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  // Filters COMBINE: category + severity + photo + search, all together.
  const shown = recalls.filter((r) => {
    if (active !== "all" && r.group !== active) return false;
    if (criticalOnly && r.tier !== "critical") return false;
    if (withPhoto && !r.imageUrl) return false;
    if (q) {
      return `${r.title} ${r.product} ${r.category} ${r.agency} ${r.issue}`
        .toLowerCase()
        .includes(q);
    }
    return true;
  });

  const hero = !searching ? shown[0] : undefined;
  const rows = hero ? shown.slice(1) : shown;

  return (
    <>
      <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Product, brand or ingredient — e.g. cheese, peanut, Honda"
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

      <div className="quickrow">
        <span className="lbl">Quick check:</span>
        {QUICK.map((w) => (
          <button key={w} type="button" className="qchip" onClick={() => setQuery(w)}>
            {w}
          </button>
        ))}
        {searching && (
          <button type="button" className="qchip clear" onClick={() => setQuery("")}>
            Clear ✕
          </button>
        )}
      </div>

      {/* Filters stay visible and combine with search. */}
      <div className="filterbar" role="tablist" aria-label="Filter recalls">
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
        <span className="fdivider" aria-hidden="true" />
        <button
          type="button"
          className={`tchip ${criticalOnly ? "on" : ""}`}
          aria-pressed={criticalOnly}
          onClick={() => setCriticalOnly((v) => !v)}
        >
          Critical
        </button>
        <button
          type="button"
          className={`tchip ${withPhoto ? "on" : ""}`}
          aria-pressed={withPhoto}
          onClick={() => setWithPhoto((v) => !v)}
        >
          With photo
        </button>
      </div>

      {searching && (
        <p className="block-h" style={{ marginTop: 16 }}>
          <span className="cnt" style={{ marginLeft: 0 }}>
            {shown.length} result{shown.length === 1 ? "" : "s"} for &ldquo;{query.trim()}&rdquo;
          </span>
        </p>
      )}

      {shown.length === 0 ? (
        <p className="empty">
          {searching
            ? `No current recalls match “${query.trim()}”. That’s good news — but double-check the official site for older or archived recalls.`
            : "Nothing matches these filters."}
        </p>
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
    </>
  );
}
