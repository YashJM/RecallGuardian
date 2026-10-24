import type { MetadataRoute } from "next";
import { getRecalls } from "@/lib/recalls";
import { HUBS } from "@/lib/hubs";

const BASE = "https://recallguardian.ca";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const all = await getRecalls();
  const recalls = all.map((r) => ({
    url: `${BASE}/recall/${r.slug}`,
    lastModified: r.lastUpdated ? new Date(r.lastUpdated) : new Date(),
    changeFrequency: "monthly" as const,
    priority: r.tier === "critical" ? 0.8 : r.tier === "high" ? 0.6 : 0.4,
  }));

  // Category hub landing pages — high priority, change often.
  const hubs = HUBS.map((h) => ({
    url: `${BASE}/${h.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));

  return [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...hubs,
    ...recalls,
  ];
}
