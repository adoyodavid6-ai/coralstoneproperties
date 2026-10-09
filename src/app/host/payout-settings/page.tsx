import { requireOwner } from "@/lib/auth/roles";
import { listMyPayoutAccountsMasked } from "@/lib/host/payoutAccounts";
import { PayoutSettings } from "@/components/host/PayoutSettings";

export const dynamic = "force-dynamic";

export default async function HostPayoutSettings() {
  await requireOwner("/host/payout-settings");
  const accounts = await listMyPayoutAccountsMasked();

  return (
    <div>
      <h1 className="font-serif text-xl font-semibold text-primary">Payout settings</h1>
      <p className="mt-1 mb-5 text-sm text-ink-soft">
        Tell us where to send your earnings. We release your share to your default method after each
        guest checks in.
      </p>
      <PayoutSettings accounts={accounts} />
    </div>
  );
}
