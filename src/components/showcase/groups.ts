import type { ShowcaseGroup } from "./types";

/**
 * Homepage dataset switches — the properties on the ring swap in and out as the
 * visitor flicks between these, so the same 3D stage shows every kind of listing
 * interchangeably.
 */
export const HOME_GROUPS: ShowcaseGroup[] = [
  { id: "all", label: "Everything", test: () => true },
  { id: "sale", label: "For sale", test: (p) => p.intent === "sale" },
  { id: "rent", label: "To rent", test: (p) => p.intent === "rent" },
  { id: "land", label: "Land & plots", test: (p) => p.type === "land" },
  { id: "off_plan", label: "Off-plan", test: (p) => p.type === "off_plan" },
  { id: "short_let", label: "Short-let", test: (p) => p.intent === "short_let" },
  { id: "venue", label: "Event venues", test: (p) => p.type === "venue" },
];
