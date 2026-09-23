import type { Currency, ListingIntent, Property, PropertyType } from "./types";
import { getAllProperties } from "./data/properties";
import { convertBetween, daysOnMarket } from "./format";

export type SortKey = "relevance" | "priceAsc" | "priceDesc" | "newest" | "mostViewed";

export interface SearchFilters {
  q?: string;
  intent?: ListingIntent | "all";
  type?: PropertyType | "all";
  country?: string;
  county?: string;
  area?: string;
  minPrice?: number;
  maxPrice?: number;
  /** Currency the min/max price bounds are expressed in (listings are compared in a common base). */
  priceCurrency?: Currency;
  beds?: number; // minimum
  verifiedOnly?: boolean;
  reducedOnly?: boolean;
  hasMedia?: boolean; // video or 3D
  lifestyle?: string[]; // accessibility / lifestyle filters
  sort?: SortKey;
}

/** Parse URLSearchParams (or a plain record) into typed filters. */
export function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): SearchFilters {
  const one = (v: string | string[] | undefined) =>
    Array.isArray(v) ? v[0] : v;
  const num = (v: string | string[] | undefined) => {
    const s = one(v);
    const n = s ? Number(s) : NaN;
    return Number.isFinite(n) ? n : undefined;
  };
  return {
    q: one(sp.q) || undefined,
    intent: (one(sp.intent) as SearchFilters["intent"]) || "all",
    type: (one(sp.type) as SearchFilters["type"]) || "all",
    country: one(sp.country) || undefined,
    county: one(sp.county) || undefined,
    area: one(sp.area) || undefined,
    minPrice: num(sp.minPrice),
    maxPrice: num(sp.maxPrice),
    priceCurrency: (one(sp.priceCur) as Currency) || "KES",
    beds: num(sp.beds),
    verifiedOnly: one(sp.verified) === "1",
    reducedOnly: one(sp.reduced) === "1",
    hasMedia: one(sp.media) === "1",
    lifestyle: sp.lifestyle
      ? (Array.isArray(sp.lifestyle) ? sp.lifestyle : [sp.lifestyle])
      : undefined,
    sort: (one(sp.sort) as SortKey) || "relevance",
  };
}

function matchesKeyword(p: Property, q: string): boolean {
  const hay = [
    p.title,
    p.area,
    p.county,
    p.country,
    p.estate ?? "",
    p.type,
    p.intent,
    ...p.amenities,
    ...p.lifestyle,
  ]
    .join(" ")
    .toLowerCase();
  // naive AND-of-terms — stands in for Postgres FTS + pg_trgm later
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => hay.includes(term));
}

/** Cheap relevance score: boost, verification depth, recency, engagement. */
function relevanceScore(p: Property): number {
  let s = 0;
  if (p.boostTier === "spotlight") s += 40;
  if (p.boostTier === "featured") s += 25;
  s += p.verified.length * 6;
  s += Math.max(0, 30 - daysOnMarket(p.listedOn)) * 0.5;
  s += Math.log10(p.viewCount + 1) * 3;
  return s;
}

export function searchProperties(
  filters: SearchFilters,
  source: Property[] = getAllProperties(),
): Property[] {
  let list = source.filter((p) => {
    if (filters.q && !matchesKeyword(p, filters.q)) return false;
    if (filters.intent && filters.intent !== "all" && p.intent !== filters.intent)
      return false;
    if (filters.type && filters.type !== "all" && p.type !== filters.type)
      return false;
    if (filters.country && p.country !== filters.country) return false;
    if (filters.county && p.county !== filters.county) return false;
    if (filters.area && p.area !== filters.area) return false;
    // Prices are stored per-listing in local currency; compare in a common base (KES).
    if (filters.minPrice != null || filters.maxPrice != null) {
      const pc = filters.priceCurrency ?? "KES";
      const priceKes = convertBetween(p.price, p.currency, "KES");
      if (filters.minPrice != null && priceKes < convertBetween(filters.minPrice, pc, "KES"))
        return false;
      if (filters.maxPrice != null && priceKes > convertBetween(filters.maxPrice, pc, "KES"))
        return false;
    }
    if (filters.beds != null && (p.beds ?? 0) < filters.beds) return false;
    if (filters.verifiedOnly && !p.verified.some((v) => v.kind === "listing"))
      return false;
    if (filters.reducedOnly && !p.previousPrice) return false;
    if (filters.hasMedia && !(p.hasVideo || p.has3dTour)) return false;
    if (
      filters.lifestyle?.length &&
      !filters.lifestyle.every((l) => p.lifestyle.includes(l))
    )
      return false;
    return true;
  });

  const sort = filters.sort ?? "relevance";
  list = [...list].sort((a, b) => {
    switch (sort) {
      case "priceAsc":
        return a.price - b.price;
      case "priceDesc":
        return b.price - a.price;
      case "newest":
        return daysOnMarket(a.listedOn) - daysOnMarket(b.listedOn);
      case "mostViewed":
        return b.viewCount - a.viewCount;
      default:
        return relevanceScore(b) - relevanceScore(a);
    }
  });

  return list;
}

export interface CountryOption {
  country: string;
  counties: { county: string; areas: string[] }[];
}

/** Country → city → area cascade for the location filter, across East African markets. */
export function locationOptions(): CountryOption[] {
  const map = new Map<string, Map<string, Set<string>>>();
  for (const p of getAllProperties()) {
    if (!map.has(p.country)) map.set(p.country, new Map());
    const cities = map.get(p.country)!;
    if (!cities.has(p.county)) cities.set(p.county, new Set());
    cities.get(p.county)!.add(p.area);
  }
  return [...map.entries()]
    .map(([country, cities]) => ({
      country,
      counties: [...cities.entries()]
        .map(([county, areas]) => ({ county, areas: [...areas].sort() }))
        .sort((a, b) => a.county.localeCompare(b.county)),
    }))
    .sort((a, b) => a.country.localeCompare(b.country));
}

export const LIFESTYLE_FILTERS = [
  "Family friendly",
  "Pet friendly",
  "Backup water",
  "Backup power",
  "Ground floor",
];
