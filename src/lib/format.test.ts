import { describe, it, expect } from "vitest";
import {
  convertBetween,
  formatMoney,
  resolveCurrency,
} from "./format";

describe("currency conversion", () => {
  it("is identity for the same currency", () => {
    expect(convertBetween(500, "UGX", "UGX")).toBe(500);
  });

  it("round-trips between currencies without drift", () => {
    const kes = 1_000_000;
    const usd = convertBetween(kes, "KES", "USD");
    expect(convertBetween(usd, "USD", "KES")).toBeCloseTo(kes, 0);
  });

  it("orders East African currencies sensibly against KES", () => {
    // 1 KES buys more UGX/TZS/RWF than it does USD.
    expect(convertBetween(1, "KES", "UGX")).toBeGreaterThan(1);
    expect(convertBetween(1, "KES", "USD")).toBeLessThan(1);
  });
});

describe("formatMoney", () => {
  it("uses the correct native symbol", () => {
    expect(formatMoney(1000, "KES")).toContain("KSh");
    expect(formatMoney(1000, "UGX")).toContain("USh");
    expect(formatMoney(1000, "TZS")).toContain("TSh");
    expect(formatMoney(1000, "RWF")).toContain("FRw");
    expect(formatMoney(1000, "USD")).toContain("$");
  });
});

describe("resolveCurrency", () => {
  it("maps 'local' to the listing's native currency", () => {
    expect(resolveCurrency("local", "TZS")).toBe("TZS");
  });
  it("passes through an explicit display currency", () => {
    expect(resolveCurrency("USD", "TZS")).toBe("USD");
  });
});
