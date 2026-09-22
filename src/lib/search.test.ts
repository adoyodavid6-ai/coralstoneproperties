import { describe, it, expect } from "vitest";
import { searchProperties } from "./search";
import { convertBetween } from "./format";

describe("price filtering across currencies", () => {
  it("compares listings in a common base, not raw local numbers", () => {
    // A 10,000,000 KES minimum keeps the 135M KES Karen villa, and every result
    // really is above the bound once converted to a common base.
    const res = searchProperties({ minPrice: 10_000_000, priceCurrency: "KES" });
    expect(res.find((p) => p.slug === "5-bed-villa-karen-1-acre")).toBeDefined();
    expect(
      res.every((p) => convertBetween(p.price, p.currency, "KES") >= 10_000_000),
    ).toBe(true);
  });

  it("respects the chosen price currency", () => {
    // 200,000,000 TZS min (~10M KES) is converted before comparison.
    const min = 200_000_000;
    const res = searchProperties({ minPrice: min, priceCurrency: "TZS" });
    const boundKes = convertBetween(min, "TZS", "KES");
    expect(
      res.every((p) => convertBetween(p.price, p.currency, "KES") >= boundKes),
    ).toBe(true);
  });
});

describe("country filtering", () => {
  it("isolates the live market and hides pre-launch ones", () => {
    const ke = searchProperties({ country: "Kenya" });
    expect(ke.length).toBeGreaterThan(0);
    expect(ke.every((p) => p.country === "Kenya")).toBe(true);
    // Uganda is "Coming soon" — none of its inventory is surfaced yet.
    expect(searchProperties({ country: "Uganda" })).toHaveLength(0);
  });
});

describe("keyword search", () => {
  it("matches on country name", () => {
    const res = searchProperties({ q: "Kenya" });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.country === "Kenya")).toBe(true);
  });
});
