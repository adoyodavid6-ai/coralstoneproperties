import Link from "next/link";
import { requireOwner } from "@/lib/auth/roles";
import { getHostListings, getHostBookings, getHostEarnings } from "@/lib/host/service";
import { listMyPayoutAccountsMasked } from "@/lib/host/payoutAccounts";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

export const dynamic = "force-dynamic";

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="figure mt-2 text-2xl font-semibold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export default async function HostOverview() {
  const user = await requireOwner("/host");
  const [listings, bookings, earnings, payouts] = await Promise.all([
    getHostListings(user.id),
    getHostBookings(user.id),
    getHostEarnings(user.id),
    listMyPayoutAccountsMasked(),
  ]);
  const cur = earnings.currency as Currency;
  const toConfirm = bookings.filter((b) => b.status === "payment_reported").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Listings" value={String(listings.length)} />
        <Stat label="To confirm" value={String(toConfirm)} sub="guest reported payment" />
        <Stat label="Confirmed" value={formatMoney(earnings.confirmed, cur)} sub="paid to you directly" />
        <Stat label="Awaiting" value={formatMoney(earnings.pending, cur)} sub="not yet confirmed" />
      </div>

      {payouts.length === 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
          Add your payment details so guests can pay you directly when they book.{" "}
          <Link href="/host/payout-settings" className="font-semibold underline">
            Set up payment details →
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/host/bookings" className="rounded-full bg-ink-black px-5 py-2 font-medium text-white">
          View bookings
        </Link>
        <Link href="/host/messages" className="rounded-full border border-line-strong px-5 py-2 font-medium text-primary">
          Messages
        </Link>
      </div>
    </div>
  );
}
