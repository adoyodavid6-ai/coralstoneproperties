import { requireOwner } from "@/lib/auth/roles";
import { getHostEarnings } from "@/lib/host/service";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HostEarnings() {
  const user = await requireOwner("/host/earnings");
  const e = await getHostEarnings(user.id);
  const cur = e.currency as Currency;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Confirmed</p>
          <p className="figure mt-2 text-2xl font-semibold text-primary">{formatMoney(e.confirmed, cur)}</p>
          <p className="mt-1 text-xs text-ink-soft">Payments you&apos;ve confirmed receiving directly.</p>
        </div>
        <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">Awaiting confirmation</p>
          <p className="figure mt-2 text-2xl font-semibold text-primary">{formatMoney(e.pending, cur)}</p>
          <p className="mt-1 text-xs text-ink-soft">Across {e.bookingsCount} booking(s).</p>
        </div>
      </div>
      <p className="text-sm text-ink-soft">
        Guests pay you directly to your payment details — CoralStones never holds the money. Confirm
        each payment from your Bookings tab once it lands in your account.
      </p>
    </div>
  );
}
