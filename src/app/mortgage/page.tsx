"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Trend } from "@/components/ui/icons";

const inputCls = "w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-primary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

function currency(n: number) {
  return n >= 1_000_000
    ? `KSh ${(n / 1_000_000).toFixed(2)}M`
    : `KSh ${n.toLocaleString()}`;
}

const LENDERS = [
  { name: "KCB Bank Kenya", rate: "12.5%", max: "KSh 50M", term: "25 years", note: "Largest mortgage book in Kenya" },
  { name: "Stanbic Bank Kenya", rate: "13%", max: "KSh 100M", term: "20 years", note: "Strong for USD-denominated mortgages" },
  { name: "Absa Bank Kenya", rate: "12.5%", max: "KSh 30M", term: "25 years", note: "Fast processing; online applications" },
  { name: "NCBA Bank", rate: "13%", max: "KSh 50M", term: "20 years", note: "Good diaspora mortgage options" },
  { name: "Housing Finance Group", rate: "12%", max: "KSh 20M", term: "25 years", note: "Specialises in residential mortgages" },
  { name: "SACCO loan", rate: "7–12%", max: "3× share capital", term: "10 years", note: "Lowest rate — requires SACCO membership" },
];

export default function MortgagePage() {
  const [price,    setPrice]    = useState("6500000");
  const [deposit,  setDeposit]  = useState("20");
  const [rate,     setRate]     = useState("12.5");
  const [years,    setYears]    = useState("20");

  const calc = useMemo(() => {
    const p = parseFloat(price.replace(/,/g, "")) || 0;
    const d = parseFloat(deposit) / 100;
    const r = parseFloat(rate) / 100 / 12;
    const n = parseFloat(years) * 12;
    const loan = p * (1 - d);
    if (loan <= 0 || r <= 0 || n <= 0) return null;
    const monthly = loan * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const total   = monthly * n;
    const interest = total - loan;
    return { loan, monthly, total, interest, deposit: p * d };
  }, [price, deposit, rate, years]);

  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">Financial intelligence</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          Mortgage &amp; affordability
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
          Calculate your monthly repayments, compare lenders, and understand what you can
          actually afford — before you start viewing properties.
        </p>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="grid gap-12 lg:grid-cols-[1fr_380px]">

          {/* Calculator */}
          <div>
            <p className="eyebrow">Repayment calculator</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">Estimate your monthly payments</h2>

            <div className="mt-8 space-y-6">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-primary">Property price (KSh)</label>
                <input className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="6,500,000" />
              </div>
              <div>
                <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-primary">
                  <span>Deposit</span>
                  <span className="figure text-accent">{deposit}%</span>
                </label>
                <input type="range" min="10" max="50" step="5" value={deposit} onChange={(e) => setDeposit(e.target.value)}
                  className="w-full accent-[#ff8559]" />
                <div className="mt-1 flex justify-between text-xs text-ink-soft">
                  <span>10%</span><span>50%</span>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-primary">
                    <span>Interest rate</span>
                    <span className="figure text-accent">{rate}%</span>
                  </label>
                  <input type="range" min="7" max="22" step="0.5" value={rate} onChange={(e) => setRate(e.target.value)}
                    className="w-full accent-[#ff8559]" />
                  <div className="mt-1 flex justify-between text-xs text-ink-soft"><span>7%</span><span>22%</span></div>
                </div>
                <div>
                  <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-primary">
                    <span>Loan term</span>
                    <span className="figure text-accent">{years} yrs</span>
                  </label>
                  <input type="range" min="5" max="25" step="5" value={years} onChange={(e) => setYears(e.target.value)}
                    className="w-full accent-[#ff8559]" />
                  <div className="mt-1 flex justify-between text-xs text-ink-soft"><span>5</span><span>25</span></div>
                </div>
              </div>
            </div>

            {/* Results */}
            {calc && (
              <div className="mt-8 rounded-2xl border-2 border-accent bg-accent-soft p-6">
                <p className="text-sm font-semibold text-accent">Your estimated repayments</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    { label: "Monthly repayment", value: currency(Math.round(calc.monthly)), big: true },
                    { label: "Total loan amount",  value: currency(Math.round(calc.loan)) },
                    { label: "Deposit required",   value: currency(Math.round(calc.deposit)) },
                    { label: "Total interest paid",value: currency(Math.round(calc.interest)) },
                    { label: "Total repaid",       value: currency(Math.round(calc.total)) },
                  ].map((r) => (
                    <div key={r.label} className={r.big ? "col-span-full rounded-xl bg-accent/10 px-4 py-3" : "rounded-xl bg-white/60 px-4 py-3"}>
                      <p className="text-xs text-ink-soft">{r.label}</p>
                      <p className={`figure font-semibold ${r.big ? "mt-1 text-2xl text-accent" : "mt-0.5 text-base text-primary"}`}>{r.value}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-xs text-ink-soft">
                  Indicative only. Actual repayments depend on lender fees, valuation costs and insurance requirements.
                </p>
              </div>
            )}

            {/* Affordability rule */}
            <div className="mt-6 rounded-xl border border-line bg-surface-raised p-5">
              <div className="flex items-center gap-2">
                <Trend className="h-4 w-4 text-accent" />
                <p className="text-sm font-semibold text-primary">The 30% rule</p>
              </div>
              <p className="mt-2 text-sm text-ink-soft">
                Most lenders in East Africa require that mortgage repayments do not exceed
                <strong className="text-primary"> 30–35% of your net monthly income</strong>.
                If your estimated monthly repayment is KSh 65,000, you should earn at least
                KSh 186,000–217,000 net per month to qualify.
              </p>
            </div>
          </div>

          {/* Side: lender comparison */}
          <div>
            <p className="eyebrow">Lender comparison</p>
            <h2 className="mt-3 font-serif text-xl font-semibold text-primary">Kenya mortgage market 2026</h2>
            <div className="mt-5 space-y-3">
              {LENDERS.map((l) => (
                <div key={l.name} className="rounded-xl border border-line bg-surface-raised p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-primary">{l.name}</p>
                    <span className="figure shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent">{l.rate}</span>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 text-xs text-ink-soft">
                    <span>Max: {l.max}</span>
                    <span>Term: {l.term}</span>
                  </div>
                  <p className="mt-1.5 text-xs text-ink-soft">{l.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-ink-soft">Rates indicative as of Q1 2026. Contact lenders directly for current terms.</p>
          </div>
        </div>
      </section>

      {/* Other costs to budget */}
      <section className="bg-surface-muted py-14">
        <div className="container-page max-w-2xl mx-auto">
          <p className="eyebrow">Don&apos;t forget the other costs</p>
          <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">Budget for these on top of your deposit</h2>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-left"><th className="pb-3 font-semibold text-primary">Cost</th><th className="pb-3 font-semibold text-primary">Typical amount (Kenya)</th></tr></thead>
              <tbody className="divide-y divide-line">
                {[
                  { cost: "Stamp duty",           amount: "4% of purchase price" },
                  { cost: "Legal / conveyancing", amount: "1–1.5% of purchase price" },
                  { cost: "Valuation fee",         amount: "KSh 10,000 – 50,000" },
                  { cost: "Bank arrangement fee",  amount: "1–2% of loan amount" },
                  { cost: "Mortgage protection insurance", amount: "0.3–0.5% p.a. of loan" },
                  { cost: "Property insurance",    amount: "0.1–0.3% p.a. of property value" },
                  { cost: "Survey / inspection",   amount: "KSh 15,000 – 80,000" },
                  { cost: "Title registration",    amount: "KSh 5,000 – 20,000" },
                ].map((r) => (
                  <tr key={r.cost}><td className="py-3 text-ink-soft">{r.cost}</td><td className="py-3 figure font-medium text-primary">{r.amount}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Ready to find your home?</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/search?intent=sale" variant="coral">Browse properties for sale</ButtonLink>
          <ButtonLink href="/sacco" variant="inverse">Explore SACCO &amp; group-buying</ButtonLink>
        </div>
      </section>
    </>
  );
}
