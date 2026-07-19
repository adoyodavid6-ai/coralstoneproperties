import type { Currency, DisplayCurrency, PricePeriod, Property } from "./types";

const CURRENCY_SYMBOL: Record<Currency, string> = {
  KES: "KSh",
  UGX: "USh",
  TZS: "TSh",
  RWF: "FRw",
  USD: "$",
  GBP: "£",
};

/**
 * Indicative FX expressed as units-per-1-KES (demo values — real rates via adapter later).
 * KES is the internal base; each listing is priced and displayed in its own currency.
 */
const FX_FROM_KES: Record<Currency, number> = {
  KES: 1,
  UGX: 28.7, // ~3,700 UGX / USD
  TZS: 20.2, // ~2,600 TZS / USD
  RWF: 10.1, // ~1,300 RWF / USD
  USD: 1 / 129,
  GBP: 1 / 164,
};

export function convert(amountKes: number, to: Currency): number {
  return amountKes * FX_FROM_KES[to];
}

/** Convert an amount between any two East African / diaspora currencies. */
export function convertBetween(amount: number, from: Currency, to: Currency): number {
  if (from === to) return amount;
  return convert(amount / FX_FROM_KES[from], to);
}

/** Resolve the price-toggle display mode against a listing's native currency. */
export function resolveCurrency(display: DisplayCurrency, native: Currency): Currency {
  return display === "local" ? native : display;
}

export function formatMoney(
  amount: number,
  currency: Currency = "KES",
  opts: { compact?: boolean } = {},
): string {
  const symbol = CURRENCY_SYMBOL[currency];
  if (opts.compact && amount >= 1_000_000) {
    return `${symbol} ${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  }
  const rounded = Math.round(amount);
  return `${symbol} ${rounded.toLocaleString("en-KE")}`;
}

const PERIOD_SUFFIX: Record<PricePeriod, string> = {
  total: "",
  month: "/mo",
  night: "/night",
  day: "/day",
};

/** Full price label with period suffix. `display` may be "local" (each listing in its own currency). */
export function priceLabel(property: Property, display: DisplayCurrency = "local"): string {
  const target = resolveCurrency(display, property.currency);
  const amount = convertBetween(property.price, property.currency, target);
  return `${formatMoney(amount, target)}${PERIOD_SUFFIX[property.pricePeriod]}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-KE");
}

/** "3 days ago" / "Today" — for days-on-market and listed dates. */
export function daysOnMarket(isoDate: string, now = new Date("2026-07-09")): number {
  const then = new Date(isoDate).getTime();
  return Math.max(0, Math.round((now.getTime() - then) / 86_400_000));
}

export function relativeDays(isoDate: string): string {
  const d = daysOnMarket(isoDate);
  if (d === 0) return "Today";
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  if (d < 30) return `${Math.floor(d / 7)} week${d < 14 ? "" : "s"} ago`;
  return `${Math.floor(d / 30)} month${d < 60 ? "" : "s"} ago`;
}
