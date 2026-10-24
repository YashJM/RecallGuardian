import type { Group } from "./recalls";

/**
 * Category hub (landing) pages. Each ranks for a broad head-term search
 * ("food recalls Canada") and funnels into the individual recall pages.
 * The URL slug is SEO-facing and can differ from the internal group id
 * (e.g. /baby-kids -> group "kids").
 */
export interface Hub {
  slug: string;
  group: Group;
  label: string; // short nav label
  h1: string;
  lead: string; // intro paragraph (plain language, keyword-natural)
  metaTitle: string;
  metaDescription: string;
}

export const HUBS: Hub[] = [
  {
    slug: "food",
    group: "food",
    label: "Food",
    h1: "Food recalls in Canada",
    lead: "Every current Canadian food recall and allergy alert — undeclared allergens, Listeria, Salmonella and E. coli contamination — ranked by how much it matters to your household and rewritten in plain language. Sourced from the Canadian Food Inspection Agency (CFIA) and updated daily.",
    metaTitle: "Food Recalls in Canada",
    metaDescription:
      "Current Canadian food recalls and allergy alerts (CFIA), ranked by risk and explained in plain language — undeclared allergens, Listeria, Salmonella, E. coli. Updated daily.",
  },
  {
    slug: "medicine",
    group: "medicine",
    label: "Medicine",
    h1: "Drug & health product recalls in Canada",
    lead: "Recalls and safety alerts for drugs, natural health products and consumer health items from Health Canada — ranked by household risk, with plain-language guidance on what to do and who is most affected. Updated daily.",
    metaTitle: "Drug & Health Product Recalls in Canada",
    metaDescription:
      "Current Health Canada drug and health product recalls and safety alerts, ranked by risk and explained in plain language with clear next steps. Updated daily.",
  },
  {
    slug: "baby-kids",
    group: "kids",
    label: "Baby & kids",
    h1: "Baby & kids product recalls in Canada",
    lead: "Recalls for toys, cribs, strollers, car seats and other children's products — the hazards that matter most to parents, ranked and explained in plain language. Sourced from Health Canada and Transport Canada, updated daily.",
    metaTitle: "Baby & Kids Product Recalls in Canada",
    metaDescription:
      "Current Canadian recalls for toys, cribs, strollers and car seats, ranked by risk and explained in plain language for parents. Health Canada & Transport Canada, updated daily.",
  },
  {
    slug: "vehicles",
    group: "vehicles",
    label: "Vehicles",
    h1: "Vehicle recalls in Canada",
    lead: "Current Transport Canada vehicle and tire recalls, organized by manufacturer and ranked by safety risk — rewritten in plain language with a link to the official notice so you can check your own vehicle. Updated daily.",
    metaTitle: "Vehicle Recalls in Canada",
    metaDescription:
      "Current Transport Canada vehicle and tire recalls by manufacturer, ranked by safety risk and explained in plain language with the official notice. Updated daily.",
  },
  {
    slug: "household",
    group: "household",
    label: "Household",
    h1: "Household & appliance recalls in Canada",
    lead: "Recalls for appliances, electronics, tools and other household products from Health Canada — ranked by risk of fire, shock or injury and explained in plain language. Updated daily.",
    metaTitle: "Household & Appliance Recalls in Canada",
    metaDescription:
      "Current Canadian household and appliance recalls from Health Canada — fire, shock and injury hazards ranked by risk and explained in plain language. Updated daily.",
  },
];

export function getHub(slug: string): Hub | undefined {
  return HUBS.find((h) => h.slug === slug);
}
