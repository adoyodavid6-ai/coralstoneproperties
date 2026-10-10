import Link from "next/link";
import { confirmVerificationPayment } from "@/lib/payment/actions";
import { CheckShield } from "@/components/ui/icons";
import { formatMoney } from "@/lib/format";

// Paystack redirects here after a listing verification-fee payment
// (`?reference=…&trxref=…`).
export default async function ListVerificationCallbackPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string; trxref?: string; tier?: string }>;
}) {
  const { reference, trxref, tier } = await searchParams;
  const result = await confirmVerificationPayment(reference ?? trxref ?? "");

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
        <p className="mt-1 max-w-sm text-xs text-ink-soft">
          Your listing enquiry was still received — our team will be in touch. You can retry the
          verification payment anytime, or email{" "}
          <a href="mailto:support@coralstonesproperties.co.ke" className="text-accent underline">
            support@coralstonesproperties.co.ke
          </a>
          .
        </p>
        <Link
          href="/list"
          className="mt-8 inline-flex rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back to listing
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-verified-soft text-verified">
        <CheckShield className="h-9 w-9" />
      </span>
      <h1 className="mt-5 font-serif text-2xl text-primary">Verification payment received</h1>
      <p className="mt-1 text-sm text-ink-soft">
        {tier ? `${tier} verification` : "Verification"} ·{" "}
        {formatMoney(result.amount, (result.currency || "KES") as "KES")} paid
      </p>
      <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-soft">
        Thank you — your listing is now queued for verification. Our team will review the details
        and, once the checks pass, publish it with a verified badge. We&apos;ll email you at each step.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-primary hover:bg-surface-raised"
        >
          Browse listings
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-ink-black px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
