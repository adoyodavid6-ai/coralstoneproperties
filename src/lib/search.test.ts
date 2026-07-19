import { describe, it, expect } from "vitest";
import { searchProperties } from "./search";

describe("price filtering across currencies", () => {
  it("compares listings in a common base, not raw local numbers", () => {
    // A 10,000,000 KES minimum. A UGX 4,500,000 rental (~157k KES) must be
    // excluded even though its raw number is smaller; a KES 135M villa passes.
    const res = searchProperties({ minPrice: 10_000_000, priceCurrency: "KES" });
    expect(res.find((p) => p.slug === "2-bed-apartment-kololo-furnished")).toBeUndefined();
    expect(res.find((p) => p.slug === "5-bed-villa-karen-1-acre")).toBeDefined();
  });

  it("respects the chosen price currency", () => {
    // 200,000,000 TZS min (~10M KES) filters the same way as ~10M KES.
    const res = searchProperties({ minPrice: 200_000_000, priceCurrency: "TZS" });
    expect(res.find((p) => p.slug === "2-bed-apartment-kololo-furnished")).toBeUndefined();
  });
});

describe("country filtering", () => {
  it("isolates a single market", () => {
    const ug = searchProperties({ country: "Uganda" });
    expect(ug.length).toBeGreaterThan(0);
    expect(ug.every((p) => p.country === "Uganda")).toBe(true);
  });
});

describe("keyword search", () => {
  it("matches on country name", () => {
    const res = searchProperties({ q: "Rwanda" });
    expect(res.length).toBeGreaterThan(0);
    expect(res.every((p) => p.country === "Rwanda")).toBe(true);
  });
});
