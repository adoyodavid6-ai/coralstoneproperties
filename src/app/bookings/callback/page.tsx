import Link from "next/link";
import { confirmBookingPayment } from "@/lib/payment/actions";
import { CheckShield, Calendar } from "@/components/ui/icons";
import { formatMoney } from "@/lib/format";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });

export default async function BookingCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ tx_ref?: string; transaction_id?: string; status?: string }>;
}) {
  const { tx_ref, transaction_id, status } = await searchParams;

  const result = await confirmBookingPayment(
    tx_ref ?? "",
    transaction_id ?? "",
    status ?? "",
  );

  if (!result.ok) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-danger-soft text-danger">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </span>
        <h1 className="mt-5 font-serif text-2xl text-primary">Payment not completed</h1>
        <p className="mt-2 text-sm text-ink-soft">{result.error}</p>
        <p className="mt-1 text-xs text-ink-soft">
          No charge was made. If you believe this is an error, contact{" "}
          <a href="mailto:support@coralstone.co" className="text-accent underline">
            support@coralstone.co
          </a>{" "}
          with reference: <span className="figure">{tx_ref ?? "—"}</span>
        </p>
        <Link
          href="/search"
          className="mt-8 inline-flex rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to listings
        </Link>
      </div>
    );
  }

  const nightLabel = `${result.nights} ${result.nights === 1 ? "night" : "nights"}`;

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-verified-soft text-verified">
        <CheckShield className="h-9 w-9" />
      </span>

      <h1 className="mt-5 font-serif text-2xl text-primary">Booking confirmed</h1>
      <p className="mt-1 text-sm text-ink-soft">{result.propertyTitle}</p>

      <div className="mt-6 w-full max-w-xs rounded-2xl border border-line bg-surface-raised p-5 text-left shadow-card">
        <dl className="space-y-2 text-sm">
          <Row label="Confirmation" value={<span className="figure text-xs">{result.bookingId}</span>} />
          <Row
            label="Dates"
            value={
              <span className="figure">
                {fmtDate(result.checkIn)} → {fmtDate(result.checkOut)}
              </span>
            }
          />
          <Row label="Duration" value={nightLabel} />
          <div className="border-t border-line pt-2">
            <Row
              label="Total paid"
              value={
                <span className="figure font-semibold text-primary">
                  {formatMoney(result.guestTotal, result.currency as "KES")}
                </span>
              }
            />
          </div>
        </dl>
      </div>

      <p className="mt-5 text-xs text-ink-soft">
        A receipt has been sent to your email. Save your confirmation number for reference.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          href={`/property/${result.propertySlug}`}
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-primary hover:bg-surface-raised"
        >
          View property
        </Link>
        <Link
          href="/bookings"
          className="inline-flex items-center gap-2 rounded-full bg-ink-black px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          <Calendar className="h-4 w-4" />
          My trips
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-ink-soft">{label}</dt>
      <dd className="text-right text-primary">{value}</dd>
    </div>
  );
}
