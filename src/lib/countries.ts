import type { Country } from "./types";

/** Which markets are trading vs. still on the roadmap. */
export type MarketStatus = "live" | "coming_soon";

export interface MarketInfo {
  name: Country;
  flag: string;
  status: MarketStatus;
  /** Representative cities, for taglines / placeholders. */
  cities: string;
}

/**
 * Single source of truth for country availability.
 * Kenya is live; the rest are "Coming soon" — flip a `status` here when a
 * market launches and the pickers + inventory filter follow automatically.
 */
export const MARKETS: MarketInfo[] = [
  { name: "Kenya",    flag: "🇰🇪", status: "live",        cities: "Nairobi, Mombasa, Kisumu" },
  { name: "Uganda",   flag: "🇺🇬", status: "coming_soon", cities: "Kampala, Entebbe, Jinja" },
  { name: "Tanzania", flag: "🇹🇿", status: "coming_soon", cities: "Dar es Salaam, Zanzibar, Arusha" },
  { name: "Rwanda",   flag: "🇷🇼", status: "coming_soon", cities: "Kigali, Musanze, Rubavu" },
];

export const LIVE_MARKETS = MARKETS.filter((m) => m.status === "live");

/** Country names we currently trade in — the only inventory surfaced publicly. */
export const LIVE_COUNTRIES: Country[] = LIVE_MARKETS.map((m) => m.name);

export function isCountryLive(country: Country): boolean {
  return LIVE_COUNTRIES.includes(country);
}
