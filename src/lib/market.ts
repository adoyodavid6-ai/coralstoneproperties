import type { Country } from "./types";

/** Indicative, country-specific financing assumptions for the decision tools (demo values). */
export interface MarketFinance {
  /** Typical mortgage interest rate (%) — slider default. */
  rate: number;
  rateMin: number;
  rateMax: number;
  /** Stamp duty / transfer tax as a share of the purchase price. */
  stampDuty: number;
  /** Conveyancing / legal fees as a share of the purchase price. */
  legal: number;
}

// Rough market-typical figures — real rates would come from a lender/gov adapter later.
export const MARKET_FINANCE: Record<Country, MarketFinance> = {
  Kenya: { rate: 14.5, rateMin: 9, rateMax: 20, stampDuty: 0.04, legal: 0.015 },
  Uganda: { rate: 19, rateMin: 14, rateMax: 24, stampDuty: 0.015, legal: 0.02 },
  Tanzania: { rate: 17, rateMin: 13, rateMax: 22, stampDuty: 0.01, legal: 0.02 },
  Rwanda: { rate: 16, rateMin: 11, rateMax: 21, stampDuty: 0.01, legal: 0.015 },
};

export function marketFinance(country: Country): MarketFinance {
  return MARKET_FINANCE[country] ?? MARKET_FINANCE.Kenya;
}
