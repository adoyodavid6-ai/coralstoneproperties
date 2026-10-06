"use client";

import { useBookings } from "@/lib/booking/BookingProvider";
import { Panel, Field, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

/**
 * Short-let fee model (guest service fee, host commission, levy, cleaning). This
 * is a local working copy held by the BookingProvider — a planning tool for the
 * Airbnb-style economics, not a server-persisted setting.
 */
export function FeeModelPanel() {
  const { fees, updateFees } = useBookings();

  const pctInput = (label: string, value: number, onPct: (frac: number) => void) => (
    <Field label={label}>
      <div className="flex items-center gap-1.5">
        <input
          className={cn(inputClass, "figure")}
          inputMode="decimal"
          value={Math.round(value * 1000) / 10}
          onChange={(e) => onPct((Number(e.target.value) || 0) / 100)}
        />
        <span className="text-sm text-ink-soft">%</span>
      </div>
    </Field>
  );

  return (
    <Panel title="Fee model (planning)">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {pctInput("Guest service fee", fees.guestServiceFeePct, (v) => updateFees({ guestServiceFeePct: v }))}
        {pctInput("Host commission", fees.hostServiceFeePct, (v) => updateFees({ hostServiceFeePct: v }))}
        {pctInput("Tourism levy", fees.taxPct, (v) => updateFees({ taxPct: v }))}
        <Field label="Cleaning fee (× nightly)">
          <input
            className={cn(inputClass, "figure")}
            inputMode="decimal"
            value={fees.cleaningFeeRate}
            onChange={(e) => updateFees({ cleaningFeeRate: Number(e.target.value) || 0 })}
          />
        </Field>
      </div>
      <p className="mt-3 text-xs text-ink-soft">
        Guest pays: nights + cleaning + service fee (+ levy). Owner receives: nights + cleaning − commission.
        Stored locally in this browser.
      </p>
    </Panel>
  );
}
