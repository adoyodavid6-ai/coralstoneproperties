"use server";

/**
 * CoralStones-collected income (owner verification fees, commissions) via
 * Paystack. Booking payments are NOT here — guests pay hosts directly (see
 * src/lib/booking/ownerDirect.ts). The listing enquiry is already saved as a
 * lead before this runs, so an abandoned payment never loses the enquiry.
 */

import { initPayment, verifyPayment, isPaystackConfigured } from "./paystack";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export type StartVerificationInput = {
  listingTitle: string;
  tier: string;
  tierLabel: string;
  amount: number;
  currency: string;
  name: string;
  email: string;
};

export type StartVerificationResult =
  | { ok: true; paymentUrl: string }
  | { ok: true; demo: true }
  | { ok: false; error: string };

export async function startVerificationPayment(input: StartVerificationInput): Promise<StartVerificationResult> {
  if (!input.amount || input.amount <= 0) return { ok: false, error: "Invalid verification fee." };
  // Gateway not configured → caller shows the normal (free) confirmation instead.
  if (!isPaystackConfigured()) return { ok: true, demo: true };
  if (!input.email) return { ok: false, error: "An email is required for payment." };

  try {
    const reference = `verif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const paymentUrl = await initPayment({
      email: input.email,
      amount: input.amount,
      currency: input.currency || "KES",
      reference,
      callbackUrl: `${SITE_URL}/list/callback?tier=${encodeURIComponent(input.tierLabel)}`,
      metadata: { kind: "verification", tier: input.tier, listingTitle: input.listingTitle, name: input.name },
    });
    return { ok: true, paymentUrl };
  } catch (err) {
    console.error("[verification] Paystack init failed:", err);
    return { ok: false, error: "Payment gateway error. Please try again." };
  }
}

export type ConfirmVerificationResult =
  | { ok: true; amount: number; currency: string }
  | { ok: false; error: string };

export async function confirmVerificationPayment(reference: string): Promise<ConfirmVerificationResult> {
  if (!reference) return { ok: false, error: "Invalid payment reference." };
  try {
    const v = await verifyPayment(reference);
    if (!v.verified) return { ok: false, error: "Payment was not completed." };
    return { ok: true, amount: v.amount, currency: v.currency };
  } catch (err) {
    console.error("[verification] verify error:", err);
    return { ok: false, error: "Could not verify payment. Please contact support." };
  }
}
