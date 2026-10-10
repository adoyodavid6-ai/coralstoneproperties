import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/roles";
import { getHostBookings } from "@/lib/host/service";
import { confirmBookingReceived, declineBooking } from "@/lib/host/bookingActions";
import { formatMoney } from "@/lib/format";
import type { Currency } from "@/lib/types";

export const dynamic = "force-dynamic";

async function confirmAction(formData: FormData) {
  "use server";
  await confirmBookingReceived(String(formData.get("id") ?? ""));
  revalidatePath("/host/bookings");
}

async function declineAction(formData: FormData) {
  "use server";
  await declineBooking(String(formData.get("id") ?? ""));
  revalidatePath("/host/bookings");
}

const STATUS_TONE: Record<string, string> = {
  pending: "bg-surface-muted text-ink-soft",
  awaiting_payment: "bg-warning-soft text-warning",
  payment_reported: "bg-warning-soft text-warning",
  confirmed: "bg-verified-soft text-verified",
  paid: "bg-verified-soft text-verified",
  declined: "bg-danger-soft text-danger",
  cancelled: "bg-surface-muted text-ink-soft",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  awaiting_payment: "Awaiting payment",
  payment_reported: "Payment reported",
  confirmed: "Confirmed",
  paid: "Confirmed",
  declined: "Declined",
  cancelled: "Cancelled",
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
            {b.status === "payment_reported" && (
              <div className="flex gap-1.5">
                <form action={confirmAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="rounded-full bg-ink-black px-3 py-1 text-xs font-medium text-white">
                    Confirm received
                  </button>
                </form>
                <form action={declineAction}>
                  <input type="hidden" name="id" value={b.id} />
                  <button className="rounded-full border border-line-strong px-3 py-1 text-xs font-medium text-ink-soft hover:border-danger hover:text-danger">
                    Decline
                  </button>
                </form>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
