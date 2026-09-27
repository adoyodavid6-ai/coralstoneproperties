/**
 * Async listing data-access layer — the real query layer that replaces the
 * synchronous mock helpers in `properties.ts`.
 *
 * - When Supabase is configured it reads live inventory from Postgres (only
 *   `status = 'active'` rows are visible to the anon key via RLS).
 * - When it is NOT configured (e.g. local dev without keys) it transparently
 *   falls back to the bundled demo seed, so the site always renders.
 *
 * All exports are async. `getActiveListings()` is memoised per render pass with
 * React `cache()`, so a page that needs the list, the featured set and similar
 * homes only hits the database once.
 */
import { cache } from "react";
import type { Agent, AreaGuide, Property } from "@/lib/types";
import { getSupabasePublic } from "@/lib/supabase/public";
import { isCountryLive } from "@/lib/countries";
import * as mock from "./properties";

// Joined select: every property column plus its agent row.
const SELECT = "*, agent:agents(*)";

function arr<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function mapAgent(a: Record<string, unknown> | null | undefined): Agent {
  const row = a ?? {};
  return {
    id: (row.id as string) ?? "ag_unknown",
    name: (row.name as string) ?? "CoralStone agent",
    agency: (row.agency as string) ?? "",
    avatarUrl: (row.avatar_url as string) ?? "",
    verified: arr(row.verified),
    responseMins: Number(row.response_mins ?? 0),
    completedDeals: Number(row.completed_deals ?? 0),
    phone: (row.phone as string) ?? "",
    whatsapp: (row.whatsapp as string) ?? "",
  };
}

function fallbackAreaGuide(r: Record<string, unknown>): AreaGuide {
  return {
    country: r.country as AreaGuide["country"],
    county: (r.county as string) ?? "",
    area: (r.area as string) ?? "",
    security: 0,
    waterReliability: 0,
    powerReliability: 0,
    roadAccess: 0,
  };
}

function num(v: unknown): number | undefined {
  return v == null ? undefined : Number(v);
}

/** Map a joined DB row into the camelCase `Property` shape the UI consumes. */
function mapRow(r: Record<string, any>): Property {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    type: r.type,
    intent: r.intent,
    status: r.status,
    price: Number(r.price),
    currency: r.currency,
    pricePeriod: r.price_period,
    previousPrice: num(r.previous_price),
    beds: r.beds ?? undefined,
    baths: r.baths ?? undefined,
    capacity: r.capacity ?? undefined,
    size: num(r.size),
    sizeUnit: r.size_unit ?? undefined,
    plotSize: num(r.plot_size),
    plotSizeUnit: r.plot_size_unit ?? undefined,
    furnishing: r.furnishing ?? undefined,
    yearBuilt: r.year_built ?? undefined,
    country: r.country,
    county: r.county,
    area: r.area,
    estate: r.estate ?? undefined,
    lat: Number(r.lat ?? 0),
    lng: Number(r.lng ?? 0),
    serviceCharge: num(r.service_charge),
    titleType: r.title_type ?? undefined,
    amenities: arr(r.amenities),
    lifestyle: arr(r.lifestyle),
    images: arr(r.images),
    hasVideo: r.has_video ?? undefined,
    has3dTour: r.has_3d_tour ?? undefined,
    hasDrone: r.has_drone ?? undefined,
    verified: arr(r.verified),
    boostTier: r.boost_tier ?? undefined,
    description: r.description ?? "",
    aiAssistedDescription: r.ai_assisted_description ?? undefined,
    agent: mapAgent(r.agent),
    area_guide: (r.area_guide as AreaGuide) ?? fallbackAreaGuide(r),
    listedOn: r.listed_on,
    viewCount: r.view_count ?? 0,
    saveCount: r.save_count ?? 0,
    completionPercent: r.completion_percent ?? undefined,
    handoverDate: r.handover_date ?? undefined,
  };
}

/**
 * All publicly-visible listings (active, in a live market). Reads the DB when
 * configured, else the demo seed. Memoised for the current render pass.
 */
export const getActiveListings = cache(async (): Promise<Property[]> => {
  const sb = getSupabasePublic();
  if (!sb) return mock.getAllProperties();

  const { data, error } = await sb.from("properties").select(SELECT).eq("status", "active");
  if (error) {
    console.error("[listings] active fetch failed:", error.message);
    return [];
  }
  return (data ?? []).map(mapRow).filter((p) => isCountryLive(p.country));
});

export async function getListingBySlug(slug: string): Promise<Property | undefined> {
  return (await getActiveListings()).find((p) => p.slug === slug);
}

export async function getFeatured(limit = 6): Promise<Property[]> {
  return [...(await getActiveListings())]
    .filter((p) => p.boostTier)
    .sort((a, b) => (a.boostTier === "spotlight" ? -1 : 1) - (b.boostTier === "spotlight" ? -1 : 1))
    .slice(0, limit);
}

/** Most-engaged active listings (views + saves), excluding any given ids. */
export async function getTrending(limit = 6, excludeIds: string[] = []): Promise<Property[]> {
  const exclude = new Set(excludeIds);
  return [...(await getActiveListings())]
    .filter((p) => !exclude.has(p.id))
    .sort((a, b) => b.viewCount + b.saveCount * 4 - (a.viewCount + a.saveCount * 4))
    .slice(0, limit);
}

export async function getSimilar(property: Property, limit = 3): Promise<Property[]> {
  return (await getActiveListings())
    .filter(
      (p) =>
        p.id !== property.id &&
        (p.area === property.area || p.type === property.type) &&
        p.intent === property.intent,
    )
    .sort((a, b) => Math.abs(a.price - property.price) - Math.abs(b.price - property.price))
    .slice(0, limit);
}

/** Hydrate a set of listings by id (for saved / compare pages). Order-agnostic. */
export async function getListingsByIds(ids: string[]): Promise<Property[]> {
  const want = new Set(ids);
  return (await getActiveListings()).filter((p) => want.has(p.id));
}

/** Slugs for sitemap / static params. */
export async function getAllSlugs(): Promise<{ slug: string }[]> {
  return (await getActiveListings()).map((p) => ({ slug: p.slug }));
}
