"use client";

import { useRouter } from "next/navigation";

/** Returns to the list the visitor came from (restoring their filter + scroll),
 *  or the homepage if they landed here directly. */
export default function BackLink() {
  const router = useRouter();
  return (
    <button
      type="button"
      className="backtop"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) router.back();
        else router.push("/");
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5m6-6-6 6 6 6" />
      </svg>
      Back to recalls
    </button>
  );
}
