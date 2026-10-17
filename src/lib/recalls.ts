/**
 * RecallGuardian data layer.
 *
 * Source of truth: the Government of Canada "Recalls and Safety Alerts" open
 * data feed, which bundles the Canadian Food Inspection Agency (CFIA),
 * Health Canada, and Transport Canada into one JSON file.
 *
 * The raw feed is a flat, date-ordered list with ~200 granular categories and
 * no barcode / UPC / VIN. Everything downstream (grouping, severity, ranking)
 * is ours, and lives here so the website and the iOS app can stay identical.
 */

export const FEED_URL =
  "https://recalls-rappels.canada.ca/sites/default/files/opendata-donneesouvertes/HCRSAMOpenData.json";

/** One record exactly as it arrives in the feed. */
interface RawRecall {
  NID: string;
  Title: string;
  URL: string;
  Organization: string;
  Product: string | null;
  Issue: string | null;
  "What you should do": string | null;
  Category: string;
  "Recall class": string | null;
  "Last updated": string | null;
  Archived: string;
}

export type Tier = "critical" | "high" | "standard";
export type Group =
  | "food"
  | "medicine"
  | "kids"
  | "vehicles"
  | "household"
  | "other";

/** Our normalized, ranked recall. */
export interface Recall {
  nid: string;
  slug: string;
  title: string;
  product: string;
  issue: string;
  whatToDo: string;
  category: string;
  agency: string;
  recallClass: string;
  lastUpdated: string; // YYYY-MM-DD, "" if unknown
  archived: boolean;
  sourceUrl: string;
  group: Group;
  tier: Tier;
  score: number;
}

export const GROUPS: { id: Group; label: string }[] = [
  { id: "food", label: "Food" },
  { id: "medicine", label: "Medicine" },
  { id: "kids", label: "Kids" },
  { id: "vehicles", label: "Vehicles" },
  { id: "household", label: "Household" },
  { id: "other", label: "Other" },
];

const AGENCY_NAMES: Record<string, string> = {
  CFIA: "Canadian Food Inspection Agency",
  TC: "Transport Canada",
  HC: "Health Canada",
  "Consumer product safety": "Health Canada — Consumer product safety",
  "Medical devices": "Health Canada — Medical devices",
  "Drugs and health products": "Health Canada — Drugs and health products",
  "Marketed health products": "Health Canada — Marketed health products",
  "Controlled substances and cannabis": "Health Canada — Controlled substances",
  "Communications and Public Affairs Branch": "Health Canada",
};

const has = (text: string, needles: string[]) =>
  needles.some((n) => text.includes(n));

const KID_WORDS = [
  "child car seat",
  "booster seat",
  "infant",
  "toy",
  "toys and games",
  "stroller",
];
const FOOD_WORDS = [
  "food",
  "fresh",
  "frozen",
  "processed",
  "dairy",
  "meat",
  "poultry",
  "fish",
  "seafood",
  "fruit",
  "vegetable",
  "nuts",
  "grain",
  "candy",
  "confection",
  "snack",
  "condiment",
  "herb",
  "spice",
  "egg",
  "bread",
  "canned",
  "alcoholic",
  "beverage",
];
const MED_WORDS = [
  "drug",
  "natural health",
  "medical device",
  "biologic",
  "vaccine",
  "veterinary",
  "radiopharm",
  "homeopathic",
  "cardiovascular",
  "anaesthesiology",
  "orthopaedic",
  "neurology",
  "haematology",
  "radiology",
  "chemistry",
  "microbiology",
  "pathology",
  "immunology",
  "dental",
  "ophthalmology",
  "surgery",
  "hospital",
  "gastroenterology",
  "obstetrics",
  "gynaecology",
  "health product",
];
const VEHICLE_WORDS = [
  "car",
  "suv",
  "truck",
  "van",
  "motorcycle",
  "rv ",
  "rv trailer",
  "trailer",
  "motorhome",
  "bus",
  "a.t.v",
  "atv",
  "snowmobile",
  "minivan",
  "vehicle",
  "tire",
  "chassis",
  "moped",
  "scooter",
  "tricycle",
];
const HOUSEHOLD_WORDS = [
  "household",
  "appliance",
  "chemical",
  "tool",
  "furniture",
  "kitchenware",
  "tableware",
  "electronic",
  "clothing",
  "footwear",
  "jewellery",
  "sports",
  "fitness",
  "beauty",
  "personal care",
  "outdoor",
  "hobby",
  "craft",
  "cannabis",
  "specialized products",
];

function classifyGroup(cat: string, org: string): Group {
  const c = cat.toLowerCase();
  const o = org.toLowerCase();
  // Kids first — a child car seat is a Transport Canada recall but belongs here.
  if (has(c, KID_WORDS)) return "kids";
  if (o === "cfia" || has(c, FOOD_WORDS)) return "food";
  if (
    has(c, MED_WORDS) ||
    o.includes("medical devices") ||
    o.includes("drugs and health") ||
    o.includes("marketed health")
  )
    return "medicine";
  if (o === "tc" || has(c, VEHICLE_WORDS)) return "vehicles";
  if (o.includes("consumer product") || has(c, HOUSEHOLD_WORDS))
    return "household";
  return "other";
}

const CRITICAL_WORDS = [
  ...FOOD_WORDS,
  "drug",
  "natural health",
  "medical device",
  "biologic",
  "vaccine",
  "child car seat",
  "booster seat",
  "infant",
  "toy",
];
const HIGH_WORDS = [
  ...VEHICLE_WORDS,
  "household",
  "appliance",
  "chemical",
  "cannabis",
  "beauty",
  "personal care",
  "outdoor",
];

function classifyTier(cat: string, org: string, group: Group): Tier {
  if (group === "food" || group === "medicine" || group === "kids")
    return "critical";
  const c = cat.toLowerCase();
  if (org.toLowerCase() === "cfia" || has(c, CRITICAL_WORDS)) return "critical";
  if (org.toLowerCase() === "tc" || has(c, HIGH_WORDS)) return "high";
  return "standard";
}

const TIER_WEIGHT: Record<Tier, number> = { critical: 3, high: 2, standard: 1 };

function classMultiplier(recallClass: string): number {
  const c = recallClass.toLowerCase();
  if (c.includes("type i") && !c.includes("type ii")) return 1.5;
  if (c.includes("type ii") && !c.includes("type iii")) return 1.2;
  if (c.includes("type iii")) return 1.0;
  return 1.1;
}

function recencyBoost(lastUpdated: string): number {
  if (!lastUpdated) return 0.7;
  const days = (Date.now() - new Date(lastUpdated).getTime()) / 86_400_000;
  if (Number.isNaN(days)) return 0.7;
  if (days <= 30) return 1.4;
  if (days <= 90) return 1.2;
  if (days <= 365) return 1.0;
  return 0.7;
}

function clean(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .replace(/​/g, "") // zero-width spaces that appear in some titles
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, " ") // strip any stray HTML
    .replace(/&amp;/gi, "&")
    .replace(/\.(?=[A-Z])/g, ". ") // the feed concatenates sentences
    .replace(/\s+/g, " ")
    .trim();
}

export function slugify(title: string, nid: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70)
    .replace(/-+$/g, "");
  return `${base || "recall"}-${nid}`;
}

/** The NID is the last numeric segment of the slug — stable even if a title changes. */
export function nidFromSlug(slug: string): string {
  const m = slug.match(/-(\d+)$/);
  return m ? m[1] : slug;
}

function normalize(r: RawRecall): Recall {
  const title = clean(r.Title) || clean(r.Product) || "Safety recall";
  const category = r.Category || "Other";
  const agencyRaw = r.Organization || "";
  const group = classifyGroup(category, agencyRaw);
  const tier = classifyTier(category, agencyRaw, group);
  const lastUpdated = (r["Last updated"] || "").trim();
  const score =
    TIER_WEIGHT[tier] *
    classMultiplier(r["Recall class"] || "") *
    recencyBoost(lastUpdated);

  return {
    nid: r.NID,
    slug: slugify(title, r.NID),
    title,
    product: clean(r.Product),
    issue: clean(r.Issue),
    whatToDo: clean(r["What you should do"]),
    category,
    agency: AGENCY_NAMES[agencyRaw] || agencyRaw || "Government of Canada",
    recallClass: (r["Recall class"] || "").trim(),
    lastUpdated,
    archived: r.Archived === "1",
    sourceUrl: r.URL,
    group,
    tier,
    score: Math.round(score * 1000) / 1000,
  };
}

// In-memory memo. The feed is ~15MB, over Next's fetch-cache limit, so we hold
// it in module scope and refresh on a TTL instead of relying on the data cache.
let memo: { data: Recall[]; ts: number } | null = null;
const TTL_MS = 60 * 60 * 1000; // 1h — the gov bulk file updates ~daily, so this is plenty fresh

export async function getRecalls(): Promise<Recall[]> {
  if (memo && Date.now() - memo.ts < TTL_MS) return memo.data;
  const res = await fetch(FEED_URL, { cache: "no-store" });
  if (!res.ok) {
    if (memo) return memo.data; // serve stale rather than nothing
    throw new Error(`Recalls feed returned ${res.status}`);
  }
  const raw = (await res.json()) as RawRecall[];
  const data = raw
    .map(normalize)
    .sort((a, b) => b.score - a.score || b.lastUpdated.localeCompare(a.lastUpdated));
  memo = { data, ts: Date.now() };
  return data;
}

export async function getRecallByNid(nid: string): Promise<Recall | undefined> {
  const all = await getRecalls();
  return all.find((r) => r.nid === nid);
}

export async function getRelated(recall: Recall, n = 4): Promise<Recall[]> {
  const all = await getRecalls();
  return all
    .filter((r) => r.nid !== recall.nid && r.group === recall.group)
    .slice(0, n);
}
