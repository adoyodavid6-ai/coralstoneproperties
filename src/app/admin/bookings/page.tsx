import { getBookings } from "@/lib/booking/adminService";
import type { AdminBooking } from "@/lib/booking/adminService";
import type { Currency } from "@/lib/types";
import { formatMoney, convertBetween } from "@/lib/format";
import { Panel } from "@/components/admin/ui";
import { FeeModelPanel } from "@/components/admin/FeeModelPanel";
import { cn } from "@/lib/cn";

// Live data from Supabase — always render per request.
export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

// Mask the guest's M-Pesa number — PII, shown only partially in the console.
const maskPhone = (p: string) => (p.length >= 8 ? `${p.slice(0, 6)}•••${p.slice(-2)}` : p);

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="figure mt-2 text-2xl font-semibold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  paid: "bg-verified-soft text-verified ring-verified/20",
  confirmed: "bg-verified-soft text-verified ring-verified/20",
  pending: "bg-warning-soft text-warning ring-warning/20",
  cancelled: "bg-surface-muted text-ink-soft ring-line",
  release_pending: "bg-warning-soft text-warning ring-warning/20",
  payout_completed: "bg-verified-soft text-verified ring-verified/20",
  payout_failed: "bg-danger-soft text-danger ring-danger/20",
  refund_pending: "bg-warning-soft text-warning ring-warning/20",
  refunded: "bg-surface-muted text-ink-soft ring-line",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
        STATUS_TONE[status] ?? STATUS_TONE.cancelled,
      )}
    >
      {status}
    </span>
  );
}

function MethodPill({ method }: { method: AdminBooking["method"] }) {
  const label = method === "mpesa" ? "M-Pesa" : method === "card" ? "Card" : "—";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium ring-1",
        method === "mpesa"
          ? "bg-verified-soft text-verified ring-verified/20"
          : method === "card"
            ? "bg-accent-soft text-accent ring-accent/20"
            : "bg-surface-muted text-ink-soft ring-line",
      )}
    >
      {label}
    </span>
  );
}

export default async function AdminBookings() {
  const bookings = await getBookings();

  const paid = bookings.filter((b) => b.status === "paid");
  const pending = bookings.filter((b) => b.status === "pending");
  // Normalise paid amounts to KES for a single headline figure.
  const grossPaidKes = paid.reduce(
    (sum, b) => sum + convertBetween(b.amount, b.currency as Currency, "KES"),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Payments &amp; bookings</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Live from Supabase — short-let/venue bookings and sale reservation deposits, with the
          payment method and M-Pesa receipt / Flutterwave reference. Totals ≈ in KES across currencies.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={String(bookings.length)} sub="all records" />
        <StatCard label="Paid" value={String(paid.length)} sub="completed payments" />
        <StatCard label="Pending" value={String(pending.length)} sub="awaiting payment" />
        <StatCard
          label="Gross paid"
          value={`≈ ${formatMoney(grossPaidKes, "KES", { compact: true })}`}
          sub="paid, normalised to KES"
        />
      </div>

      <Panel title={`Payments ledger (${bookings.length})`}>
        {bookings.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">
            No bookings or deposits yet. Once a payment is made on the site (or in demo mode with a
            configured gateway), it appears here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-3 py-3 font-medium">Property / guest</th>
                  <th className="px-3 py-3 font-medium">Type</th>
                  <th className="px-3 py-3 font-medium">Method</th>
                  <th className="px-3 py-3 text-right font-medium">Amount</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Reference</th>
                  <th className="px-3 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {bookings.map((b) => (
                  <tr key={b.id} className={cn("hover:bg-surface-muted/50", b.status === "cancelled" && "opacity-60")}>
                    <td className="px-3 py-3">
                      <span className="block max-w-56 truncate font-medium text-primary">{b.propertyTitle}</span>
                      <span className="text-xs text-ink-soft">
                        {b.guestName || "—"}
                        {b.phone ? ` · ${maskPhone(b.phone)}` : ""}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-ink-soft">
                      {b.kind === "reservation_deposit" ? (
                        "Deposit"
                      ) : (
                        <>
                          Stay
                          {b.nights > 0 && (
                            <span className="block text-xs">
                              {b.nights} night{b.nights > 1 ? "s" : ""}
                            </span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <MethodPill method={b.method} />
                    </td>
                    <td className="figure px-3 py-3 text-right text-primary">
                      {formatMoney(b.amount, b.currency as Currency, { compact: true })}
                    </td>
                    <td className="px-3 py-3">
                      <StatusPill status={b.status} />
                    </td>
                    <td className="figure px-3 py-3 text-xs text-ink-soft">{b.reference || "—"}</td>
                    <td className="figure px-3 py-3 text-ink-soft">{fmtDate(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <FeeModelPanel />
    </div>
  );
}
