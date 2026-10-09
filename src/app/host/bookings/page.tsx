import { requireOwner } from "@/lib/auth/roles";
import { getHostBookings } from "@/lib/host/service";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<string, string> = {
  pending: "bg-surface-muted text-ink-soft",
  paid: "bg-warning-soft text-warning",
  release_pending: "bg-warning-soft text-warning",
  payout_completed: "bg-verified-soft text-verified",
  payout_failed: "bg-danger-soft text-danger",
  cancelled: "bg-surface-muted text-ink-soft",
  refunded: "bg-surface-muted text-ink-soft",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending payment",
  paid: "Held in escrow",
  release_pending: "Payout processing",
  payout_completed: "Paid out",
  payout_failed: "Payout failed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const fmt = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function HostBookings() {
  const user = await requireOwner("/host/bookings");
  const bookings = await getHostBookings(user.id);

  if (bookings.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-surface-raised p-10 text-center text-sm text-ink-soft">
        No bookings yet. When a guest books one of your listings it appears here, with the payout held in
        escrow until check-in.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-surface-raised">
      {bookings.map((b) => (
        <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="min-w-0">
            <p className="truncate font-medium text-primary">{b.propertyTitle}</p>
            <p className="text-xs text-ink-soft">
              {b.guestName} · {fmt(b.checkIn)} → {fmt(b.checkOut)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="figure text-sm font-semibold text-primary">
              {formatMoney(b.ownerPayout, b.currency as Currency)}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${STATUS_TONE[b.status] ?? "bg-surface-muted text-ink-soft"}`}>
              {STATUS_LABEL[b.status] ?? b.status}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
}
