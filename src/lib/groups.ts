/**
 * Recall groups — browser-safe. Kept separate from recalls.ts (which uses
 * Node's https client to download the feed) so client components can import
 * the group list without pulling server code into the browser bundle.
 */

export type Group =
  | "food"
  | "medicine"
  | "kids"
  | "vehicles"
  | "household"
  | "other";

export const GROUPS: { id: Group; label: string }[] = [
  { id: "food", label: "Food" },
  { id: "medicine", label: "Medicine" },
  { id: "kids", label: "Kids" },
  { id: "vehicles", label: "Vehicles" },
  { id: "household", label: "Household" },
  { id: "other", label: "Other" },
];
