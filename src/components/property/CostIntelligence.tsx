"use client";

import { useMemo, useState } from "react";
import type { Currency, Property } from "@/lib/types";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { convertBetween, formatMoney, resolveCurrency } from "@/lib/format";
import { marketFinance } from "@/lib/market";
import { Trend, Sparkle } from "@/components/ui/icons";

/** Amortised monthly repayment. */
function monthlyRepayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

function Row({
  label,
  amount,
  from,
  to,
  hint,
  strong,
}: {
  label: string;
  amount: number;
  from: Currency;
  to: Currency;
  hint?: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className={strong ? "font-semibold text-primary" : "text-sm text-ink-soft"}>
        {label}
        {hint && <span className="ml-1 text-xs text-ink-soft/70">({hint})</span>}
      </span>
      <span
        className={`figure ${strong ? "text-lg font-semibold text-primary" : "text-sm text-primary"}`}
      >
        {formatMoney(convertBetween(amount, from, to), to)}
      </span>
    </div>
  );
}

export function CostIntelligence({ property }: { property: Property }) {
  const { currency, t } = useLocale();
  const isBuy = property.intent === "sale" || property.type === "off_plan";
  // All costs are computed in the listing's native currency, then shown in the display target.
  const native = property.currency;
  const target = resolveCurrency(currency, native);

  // ---- True monthly cost (rentals) ----
  const rent = property.pricePeriod === "month" ? property.price : property.price * 30;
  const utilities = Math.round((rent * 0.06) / 10) * 10; // ~6% of rent, currency-agnostic
  const service = property.serviceCharge ?? 0;
  const amortisedDeposit = Math.round(rent / 12); // 1 month deposit spread over a year
  const trueMonthly = rent + utilities + service + amortisedDeposit;

  // ---- Mortgage (buys) — interactive, with country-specific presets ----
  const fin = marketFinance(property.country);
  const [depositPct, setDepositPct] = useState(20);
  const [rate, setRate] = useState(fin.rate);
  const [years, setYears] = useState(20);

  const mortgage = useMemo(() => {
    const deposit = (property.price * depositPct) / 100;
    const principal = property.price - deposit;
    const repayment = monthlyRepayment(principal, rate, years);
    const rates = Math.round(property.price * 0.00005); // land rates / rent estimate, scales with currency
    const insurance = Math.round((property.price * 0.0025) / 12);
    const svc = property.serviceCharge ?? 0;
    // Upfront (one-off) purchase costs — country-specific stamp duty + legal fees.
    const stampDuty = Math.round(property.price * fin.stampDuty);
    const legal = Math.round(property.price * fin.legal);
    const upfront = deposit + stampDuty + legal;
    return {
      deposit, principal, repayment, rates, insurance, svc,
      total: repayment + rates + insurance + svc,
      stampDuty, legal, upfront,
    };
  }, [property.price, property.serviceCharge, depositPct, rate, years, fin.stampDuty, fin.legal]);

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* True monthly cost */}
      <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
        <div className="flex items-center gap-2 text-accent">
          <Trend className="h-5 w-5" />
          <h3 className="font-serif text-lg text-primary">{t("pdp.trueCost")}</h3>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Not just the {isBuy ? "price" : "rent"} — every real cost, itemised.
        </p>
        <div className="mt-4 divide-y divide-line">
          {isBuy ? (
            <>
              <Row label="Mortgage repayment" amount={mortgage.repayment} from={native} to={target} />
              <Row label="Rates / land rent" amount={mortgage.rates} from={native} to={target} />
              <Row label="Service charge" amount={mortgage.svc} from={native} to={target} />
              <Row label="Insurance" amount={mortgage.insurance} from={native} to={target} />
              <Row label="True monthly cost" amount={mortgage.total} from={native} to={target} strong />
            </>
          ) : (
            <>
              <Row label={property.pricePeriod === "night" ? "Rent (≈30 nights)" : "Rent"} amount={rent} from={native} to={target} />
              <Row label="Est. utilities" amount={utilities} from={native} to={target} />
              <Row label="Service charge" amount={service} from={native} to={target} />
              <Row label="Deposit (amortised)" amount={amortisedDeposit} from={native} to={target} hint="1 mo / 12" />
              <Row label="True monthly cost" amount={trueMonthly} from={native} to={target} strong />
            </>
          )}
        </div>
        <p className="mt-3 text-xs text-ink-soft/80">
          Indicative estimates. Utilities and rates are modelled, not billed.
        </p>
      </section>

      {/* Mortgage snapshot */}
      {isBuy ? (
        <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
          <div className="flex items-center gap-2 text-accent">
            <Sparkle className="h-5 w-5" />
            <h3 className="font-serif text-lg text-primary">{t("pdp.mortgage")}</h3>
          </div>

          <div className="mt-4 rounded-xl bg-surface-muted p-4 text-center">
            <p className="text-xs text-ink-soft">Estimated monthly repayment</p>
            <p className="figure mt-1 text-3xl font-semibold text-primary">
              {formatMoney(convertBetween(mortgage.repayment, native, target), target)}
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              on {formatMoney(convertBetween(mortgage.principal, native, target), target)} financed
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <Slider label="Deposit" value={depositPct} min={5} max={50} step={5} suffix="%" onChange={setDepositPct} />
            <Slider label="Interest rate" value={rate} min={fin.rateMin} max={fin.rateMax} step={0.5} suffix="%" onChange={setRate} />
            <Slider label="Tenure" value={years} min={5} max={25} step={1} suffix=" yrs" onChange={setYears} />
          </div>

          {/* Upfront (one-off) costs — country-specific */}
          <div className="mt-5 rounded-xl border border-line p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              Estimated upfront ({property.country})
            </p>
            <div className="mt-2 divide-y divide-line">
              <Row label={`Deposit (${depositPct}%)`} amount={mortgage.deposit} from={native} to={target} />
              <Row label="Stamp duty" amount={mortgage.stampDuty} from={native} to={target} hint={`${(fin.stampDuty * 100).toFixed(fin.stampDuty * 100 % 1 === 0 ? 0 : 1)}%`} />
              <Row label="Legal / conveyancing" amount={mortgage.legal} from={native} to={target} />
              <Row label="Total upfront" amount={mortgage.upfront} from={native} to={target} strong />
            </div>
          </div>

          <p className="mt-4 text-xs text-ink-soft/80">
            Presets reflect typical {property.country} bank rates and transfer costs. A
            pre-qualification form would route to partner lenders.
          </p>
        </section>
      ) : (
        <section className="rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
          <div className="flex items-center gap-2 text-accent">
            <Sparkle className="h-5 w-5" />
            <h3 className="font-serif text-lg text-primary">Rental snapshot</h3>
          </div>
          <div className="mt-4 space-y-3">
            <Row label="Headline rent" amount={rent} from={native} to={target} strong />
            <Row label="Deposit (typical)" amount={rent} from={native} to={target} hint="1 month" />
            <Row label="Est. move-in cost" amount={rent * 2 + (property.serviceCharge ?? 0)} from={native} to={target} />
          </div>
          <p className="mt-4 text-xs text-ink-soft/80">
            Move-in typically covers first month plus a one-month deposit.
          </p>
        </section>
      )}
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm text-ink-soft">{label}</span>
        <span className="figure text-sm font-semibold text-primary">
          {value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[#FF8559]"
        aria-label={label}
      />
    </div>
  );
}
