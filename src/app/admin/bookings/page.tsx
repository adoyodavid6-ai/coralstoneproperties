"use client";

import { useMemo } from "react";
import { useBookings } from "@/lib/booking/BookingProvider";
import { formatMoney, convertBetween } from "@/lib/format";
import { Panel, Field, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" });

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="figure mt-2 text-2xl font-semibold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export default function AdminBookings() {
  const { fees, bookings, setStatus, updateFees } = useBookings();

  // Cross-currency totals are normalised to KES for a single headline figure.
  const kes = (n: number, from: (typeof bookings)[number]["currency"]) =>
    convertBetween(n, from, "KES");

  const totals = useMemo(() => {
    const active = bookings.filter((b) => b.status !== "cancelled");
    let gross = 0, revenue = 0, payoutDue = 0, paidOut = 0;
    for (const b of active) {
      gross += kes(b.guestTotal, b.currency);
      revenue += kes(b.platformRevenue, b.currency);
      if (b.status === "paid_out") paidOut += kes(b.ownerPayout, b.currency);
      else payoutDue += kes(b.ownerPayout, b.currency);
    }
    return { count: active.length, gross, revenue, payoutDue, paidOut };
  }, [bookings]);

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
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Short-let bookings &amp; billing</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The Airbnb-style model: guests are billed the stay plus a service fee; owners are paid out
          minus the platform commission. Totals shown ≈ in KES across currencies.
        </p>
      </div>

      {/* Revenue summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Bookings" value={String(totals.count)} sub="active reservations" />
        <StatCard label="Gross booking value" value={`≈ ${formatMoney(totals.gross, "KES", { compact: true })}`} sub="guest payments" />
        <StatCard label="Platform revenue" value={`≈ ${formatMoney(totals.revenue, "KES", { compact: true })}`} sub="service + commission" />
        <StatCard label="Owner payouts due" value={`≈ ${formatMoney(totals.payoutDue, "KES", { compact: true })}`} sub={`${formatMoney(totals.paidOut, "KES", { compact: true })} paid`} />
      </div>

      {/* Fee configuration */}
      <Panel title="Fee model">
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
        </p>
      </Panel>

      {/* Ledger */}
      <Panel title={`Bookings ledger (${bookings.length})`}>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">
            No bookings yet — reserve a short-let on the site to see it here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-3 py-3 font-medium">Property / guest</th>
                  <th className="px-3 py-3 font-medium">Dates</th>
                  <th className="px-3 py-3 text-right font-medium">Guest total</th>
                  <th className="px-3 py-3 text-right font-medium">Platform</th>
                  <th className="px-3 py-3 text-right font-medium">Owner payout</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bookings.map((b) => (
                  <tr key={b.id} className={cn("hover:bg-surface-muted/50", b.status === "cancelled" && "opacity-50")}>
                    <td className="px-3 py-3">
                      <span className="block max-w-56 truncate font-medium text-primary">{b.propertyTitle}</span>
                      <span className="text-xs text-ink-soft">{b.guestName} · {b.guests} guest{b.guests > 1 ? "s" : ""}</span>
                    </td>
                    <td className="figure px-3 py-3 text-ink-soft">
                      {fmtDate(b.checkIn)}–{fmtDate(b.checkOut)}
                      <span className="block text-xs">{b.nights} {b.unit}{b.nights > 1 ? "s" : ""}</span>
                    </td>
                    <td className="figure px-3 py-3 text-right text-primary">{formatMoney(b.guestTotal, b.currency, { compact: true })}</td>
                    <td className="figure px-3 py-3 text-right text-accent">{formatMoney(b.platformRevenue, b.currency, { compact: true })}</td>
                    <td className="figure px-3 py-3 text-right text-primary">{formatMoney(b.ownerPayout, b.currency, { compact: true })}</td>
                    <td className="px-3 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                          b.status === "cancelled"
                            ? "bg-surface-muted text-ink-soft ring-line"
                            : b.status === "paid_out"
                              ? "bg-verified-soft text-verified ring-verified/20"
                              : "bg-warning-soft text-warning ring-warning/20",
                        )}
                      >
                        {b.status === "paid_out" ? "Paid out" : b.status === "cancelled" ? "Cancelled" : "Payout due"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {b.status === "confirmed" && (
                          <>
                            <button onClick={() => setStatus(b.id, "paid_out")} className="rounded-lg bg-verified px-2.5 py-1 text-xs font-semibold text-white hover:brightness-95">Mark paid</button>
                            <button onClick={() => setStatus(b.id, "cancelled")} className="rounded-lg border border-line-strong px-2.5 py-1 text-xs font-medium text-ink-soft hover:text-danger">Cancel</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
