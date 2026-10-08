/**
 * Inventory search for the AI concierge.
 *
 * Runs over `getActiveListings()` (live Supabase inventory, or the bundled demo
 * seed when Supabase isn't configured) and filters in-process. Inventory is
 * small enough that a JS filter is simpler and cheaper than round-tripping a
 * bespoke query per chat turn, and it keeps the tool identical in both modes.
 *
 * Returns compact rows — just what the model needs to describe a match and link
 * to it. Full detail is fetched on demand via `getListingBySlug`.
 */
import { getActiveListings } from "@/lib/data/listings";
import { priceLabel } from "@/lib/format";
import type { Country, ListingIntent, Property, PropertyType } from "@/lib/types";

export interface ListingSearchFilters {
  intent?: ListingIntent;
  type?: PropertyType;
  country?: Country;
  /** City / region, matched case-insensitively against county, area or estate. */
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  limit?: number;
}

export interface ListingSummary {
  slug: string;
  title: string;
  type: PropertyType;
  intent: ListingIntent;
  price: string;
  location: string;
  beds?: number;
  baths?: number;
  verified: string[];
  url: string;
}

function toSummary(p: Property): ListingSummary {
  return {
    slug: p.slug,
    title: p.title,
    type: p.type,
    intent: p.intent,
    price: priceLabel(p),
    location: [p.estate, p.area, p.county, p.country].filter(Boolean).join(", "),
    beds: p.beds,
    baths: p.baths,
    verified: p.verified.map((v) => v.kind),
    url: `/property/${p.slug}`,
  };
}

/**
 * Filter active inventory. Price bounds are compared in each listing's own
 * currency (the model is told to pass budgets in the listing currency — KES for
 * Kenya), matching how the site itself prices listings.
 */
export async function searchListings(
  filters: ListingSearchFilters,
): Promise<{ count: number; results: ListingSummary[] }> {
  const all = await getActiveListings();
  const needle = filters.location?.trim().toLowerCase();

  const matched = all.filter((p) => {
    if (filters.intent && p.intent !== filters.intent) return false;
    if (filters.type && p.type !== filters.type) return false;
    if (filters.country && p.country !== filters.country) return false;
    if (needle) {
      const hay = `${p.county} ${p.area} ${p.estate ?? ""}`.toLowerCase();
      if (!hay.includes(needle)) return false;
    }
    if (filters.minPrice != null && p.price < filters.minPrice) return false;
    if (filters.maxPrice != null && p.price > filters.maxPrice) return false;
    if (filters.minBeds != null && (p.beds ?? 0) < filters.minBeds) return false;
    return true;
  });

  // Cheapest first — the most useful default ordering for a budget-led search.
  matched.sort((a, b) => a.price - b.price);

  const limit = Math.min(Math.max(filters.limit ?? 5, 1), 10);
  return {
    count: matched.length,
    results: matched.slice(0, limit).map(toSummary),
  };
}
