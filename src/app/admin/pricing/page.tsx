"use client";

import { useAdmin } from "@/lib/admin/AdminStore";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";
import { Panel, Toggle, Field, inputClass } from "@/components/admin/ui";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const CURRENCIES: Currency[] = ["KES", "UGX", "TZS", "RWF", "USD", "GBP"];

export default function AdminPricing() {
  const { properties, pricing, updateBoostTier, updatePlan, addPlan, deletePlan } = useAdmin();

  const countBoost = (id: string) => properties.filter((p) => p.boostTier === id).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Pricing &amp; monetisation</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Set placement fees and subscription plans. These drive the platform&apos;s revenue.
        </p>
      </div>

      {/* Boost tiers */}
      <Panel title="Boost / featured placement">
        <div className="grid gap-4 sm:grid-cols-2">
          {pricing.boostTiers.map((b) => {
            const live = countBoost(b.id);
            return (
              <div key={b.id} className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-lg capitalize text-primary">{b.label}</h3>
                  <Toggle on={b.active} onChange={(v) => updateBoostTier(b.id, { active: v })} label={`${b.label} active`} />
                </div>
                <p className="mt-1 text-sm text-ink-soft">{b.blurb}</p>
                <div className="mt-3 flex items-end gap-3">
                  <Field label="Fee / week" className="w-40">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink-soft">{b.currency}</span>
                      <input
                        className={cn(inputClass, "figure")}
                        inputMode="numeric"
                        value={b.feePerWeek}
                        onChange={(e) => updateBoostTier(b.id, { feePerWeek: Number(e.target.value) || 0 })}
                      />
                    </div>
                  </Field>
                  <div className="pb-2 text-sm text-ink-soft">
                    <span className="figure font-medium text-primary">{live}</span> live ·{" "}
                    <span className="figure font-medium text-primary">
                      {formatMoney(live * b.feePerWeek, b.currency, { compact: true })}
                    </span>{" "}
                    / wk
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      {/* Subscription plans */}
      <Panel
        title="Subscription plans"
        actions={<Button size="sm" variant="outline" onClick={() => addPlan()}>+ Add plan</Button>}
      >
        <div className="grid gap-4 md:grid-cols-3">
          {pricing.plans.map((plan) => (
            <div key={plan.id} className="flex flex-col rounded-xl border border-line p-4">
              <div className="flex items-center justify-between gap-2">
                <input
                  className={cn(inputClass, "font-serif text-base font-medium")}
                  value={plan.name}
                  onChange={(e) => updatePlan(plan.id, { name: e.target.value })}
                />
                <Toggle on={plan.active} onChange={(v) => updatePlan(plan.id, { active: v })} label={`${plan.name} active`} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Field label="Price / mo">
                  <input
                    className={cn(inputClass, "figure")}
                    inputMode="numeric"
                    value={plan.pricePerMonth}
                    onChange={(e) => updatePlan(plan.id, { pricePerMonth: Number(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Currency">
                  <select className={inputClass} value={plan.currency} onChange={(e) => updatePlan(plan.id, { currency: e.target.value as Currency })}>
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <Field label="Listing cap (blank = unlimited)" className="mt-2">
                <input
                  className={cn(inputClass, "figure")}
                  inputMode="numeric"
                  value={plan.listingCap ?? ""}
                  onChange={(e) => updatePlan(plan.id, { listingCap: e.target.value === "" ? null : Number(e.target.value) || 0 })}
                />
              </Field>

              <Field label="Features (one per line)" className="mt-2">
                <textarea
                  className={cn(inputClass, "min-h-24 resize-y text-xs")}
                  value={plan.features.join("\n")}
                  onChange={(e) => updatePlan(plan.id, { features: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
                />
              </Field>

              <button
                onClick={() => { if (confirm(`Delete the ${plan.name} plan?`)) deletePlan(plan.id); }}
                className="mt-3 text-xs font-medium text-ink-soft hover:text-danger"
              >
                Delete plan
              </button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
