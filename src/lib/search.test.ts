import { describe, it, expect } from "vitest";
import { searchProperties } from "./search";
import { ALL_PROPERTIES } from "./data/properties";
import { convertBetween } from "./format";

// The public inventory is empty while demo listings are off, so the filter
// logic is exercised against the dormant seed set directly.

describe("price filtering across currencies", () => {
  it("compares listings in a common base, not raw local numbers", () => {
    // A 10,000,000 KES minimum. A UGX 4,500,000 rental (~157k KES) must be
    // excluded even though its raw number is smaller; a KES 135M villa passes.
    const res = searchProperties(
      { minPrice: 10_000_000, priceCurrency: "KES" },
      ALL_PROPERTIES,
    );
    expect(res.find((p) => p.slug === "2-bed-apartment-kololo-furnished")).toBeUndefined();
    expect(res.find((p) => p.slug === "5-bed-villa-karen-1-acre")).toBeDefined();
  });

  it("respects the chosen price currency", () => {
    // 200,000,000 TZS min (~10M KES) is converted before comparison.
    const min = 200_000_000;
    const res = searchProperties(
      { minPrice: min, priceCurrency: "TZS" },
      ALL_PROPERTIES,
    );
    const boundKes = convertBetween(min, "TZS", "KES");
    expect(
      res.every((p) => convertBetween(p.price, p.currency, "KES") >= boundKes),
    ).toBe(true);
  });
});

describe("country filtering", () => {
  it("isolates a single market", () => {
    const ke = searchProperties({ country: "Kenya" }, ALL_PROPERTIES);
    expect(ke.length).toBeGreaterThan(0);
    expect(ke.every((p) => p.country === "Kenya")).toBe(true);
  });
});

describe("keyword search", () => {
  it("matches on country name", () => {
    const res = searchProperties({ q: "Kenya" }, ALL_PROPERTIES);
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.country === "Kenya")).toBe(true);
  });
});

describe("public inventory", () => {
  it("is empty while demo listings are off — no seed data leaks to the site", () => {
    expect(searchProperties({})).toHaveLength(0);
  });
});
