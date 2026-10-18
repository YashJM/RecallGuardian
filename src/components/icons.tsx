import type { Group } from "@/lib/recalls";

const PATHS: Record<Group, React.ReactNode> = {
  food: (
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11M18 3c-1.5 0-3 2-3 5s1 4 3 4v9" />
  ),
  medicine: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <path d="M12 8v8" />
    </>
  ),
  kids: (
    <>
      <circle cx="12" cy="7" r="3" />
      <path d="M6 21c0-4 2.7-7 6-7s6 3 6 7" />
    </>
  ),
  vehicles: (
    <>
      <path d="M3 13l2-5h14l2 5M5 13h14v4H5z" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </>
  ),
  household: <path d="M4 11 12 4l8 7M6 10v9h12v-9" />,
  other: <path d="M4 8l8-4 8 4v8l-8 4-8-4V8M4 8l8 4m0 0 8-4m-8 4v8" />,
};

/** The line glyph for a category (stroked, inherits currentColor). */
export function CatGlyph({ group }: { group: Group }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {PATHS[group]}
    </svg>
  );
}

/** Colored category medallion. */
export function Medallion({ group, sm }: { group: Group; sm?: boolean }) {
  return (
    <span className={`med ${group}${sm ? " sm" : ""}`} aria-hidden="true">
      <CatGlyph group={group} />
    </span>
  );
}

export function WarnIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2 1 21h22L12 2Zm0 6 7 12H5l7-12Zm-1 3h2v4h-2Zm0 5h2v2h-2Z" />
    </svg>
  );
}

export function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5Z" />
    </svg>
  );
}

export function OutboundIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
