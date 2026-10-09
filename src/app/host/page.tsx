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
  const upcoming = bookings.filter((b) => b.status === "paid" || b.status === "release_pending").length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Listings" value={String(listings.length)} />
        <Stat label="Upcoming" value={String(upcoming)} sub="paid, awaiting stay" />
        <Stat label="In escrow" value={formatMoney(earnings.held, cur)} sub="held until check-in" />
        <Stat label="Paid out" value={formatMoney(earnings.released, cur)} />
      </div>

      {payouts.length === 0 && (
        <div className="rounded-2xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
          Add a payout method so we can release your earnings after guests check in.{" "}
          <Link href="/host/payout-settings" className="font-semibold underline">
            Set up payouts →
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
