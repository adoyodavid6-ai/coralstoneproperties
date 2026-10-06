"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { initPayment, verifyPayment, isFlutterwaveConfigured } from "./flutterwave";
import { isMpesaConfigured, normalizeMsisdn, stkPush, stkQuery } from "./mpesa";
import { RESERVATION_DEPOSIT_KES } from "./reservation";
import { sendPropertyEnquiry } from "@/lib/leads/actions";
import type { BookingBreakdown } from "@/lib/booking/types";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export type StartPaymentInput = {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  currency: string;
  unit: "night" | "day";
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail: string;
  breakdown: BookingBreakdown;
};

export type StartPaymentResult =
  | { ok: true; paymentUrl: string }
  | { ok: true; demo: true; bookingId: string }
  | { ok: false; error: string };

/**
 * Insert a `pending` booking (service-role, bypasses RLS). Returns the new
 * booking id, or null on failure. `extraTotals` is merged into the stored
 * breakdown (used to stash the M-Pesa checkout id / phone).
 */
async function insertPendingBooking(
  supabase: SupabaseClient,
  input: StartPaymentInput,
  extraTotals?: Record<string, unknown>,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      property_id: input.propertyId,
      guest_name: input.guestName,
      guest_email: input.guestEmail || null,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: input.guests,
      unit: input.unit,
      currency: input.currency,
      status: "pending",
      totals: extraTotals ? { ...input.breakdown, ...extraTotals } : input.breakdown,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[payment] Supabase insert failed:", error?.message);
    return null;
  }
  return data.id as string;
}

export async function startBookingPayment(input: StartPaymentInput): Promise<StartPaymentResult> {
  if (!isFlutterwaveConfigured()) {
    return { ok: true, demo: true, bookingId: `bk_demo_${Date.now().toString(36)}` };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database not configured." };

  const bookingId = await insertPendingBooking(supabase, input);
  if (!bookingId) return { ok: false, error: "Could not save booking. Please try again." };

  try {
    const paymentUrl = await initPayment({
      txRef: bookingId,
      amount: input.breakdown.guestTotal,
      currency: input.currency,
      customerEmail: input.guestEmail,
      customerName: input.guestName,
      redirectUrl: `${SITE_URL}/bookings/callback`,
      description: `Booking: ${input.propertyTitle} (${input.checkIn} → ${input.checkOut})`,
      meta: {
        propertyId: input.propertyId,
        propertySlug: input.propertySlug,
        propertyTitle: input.propertyTitle,
      },
    });

    return { ok: true, paymentUrl };
  } catch (err) {
    console.error("[payment] Flutterwave init failed:", err);
    // Roll back the pending booking so the slot isn't held
    await supabase.from("bookings").delete().eq("id", bookingId);
    return { ok: false, error: "Payment gateway error. Please try again." };
  }
}

export type ConfirmPaymentResult =
  | { ok: true; bookingId: string; propertySlug: string; propertyTitle: string; guestTotal: number; currency: string; checkIn: string; checkOut: string; nights: number }
  | { ok: false; error: string };

export async function confirmBookingPayment(
  txRef: string,
  transactionId: string,
  status: string,
): Promise<ConfirmPaymentResult> {
  if (status !== "successful") {
    const supabase = getSupabaseAdmin();
    if (supabase && txRef) {
      await supabase.from("bookings").update({ status: "cancelled" }).eq("id", txRef);
    }
    return { ok: false, error: "Payment was not completed." };
  }

  if (!txRef || !transactionId) {
    return { ok: false, error: "Invalid payment reference." };
  }

  let flwRef: string | undefined;

  try {
    const verified = await verifyPayment(transactionId);
    if (!verified.verified || verified.txRef !== txRef) {
      return { ok: false, error: "Payment verification failed." };
    }
    flwRef = verified.flwRef;
  } catch (err) {
    console.error("[payment] Flutterwave verify error:", err);
    return { ok: false, error: "Could not verify payment. Contact support." };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database not configured." };

  const { data: booking, error } = await supabase
    .from("bookings")
    .update({ status: "paid" })
    .eq("id", txRef)
    .eq("status", "pending") // idempotency guard — won't double-confirm
    .select("id, property_id, currency, check_in, check_out, totals, properties(slug, title)")
    .single();

  if (error || !booking) {
    // Possibly already confirmed (idempotent retry) — fetch current state
    const { data: existing } = await supabase
      .from("bookings")
      .select("id, currency, check_in, check_out, totals, properties(slug, title)")
      .eq("id", txRef)
      .single();

    if (existing) {
      const totals = existing.totals as BookingBreakdown;
      const prop = (existing.properties as unknown as { slug: string; title: string } | null);
      return {
        ok: true,
        bookingId: txRef,
        propertySlug: prop?.slug ?? "",
        propertyTitle: prop?.title ?? "",
        guestTotal: totals?.guestTotal ?? 0,
        currency: (existing.currency as string) ?? "KES",
        checkIn: existing.check_in as string,
        checkOut: existing.check_out as string,
        nights: totals?.nights ?? 0,
      };
    }

    console.error("[payment] Booking update failed:", error?.message);
    return { ok: false, error: "Could not confirm booking. Contact support." };
  }

  // Merge flw_ref into totals
  const totals = booking.totals as BookingBreakdown;
  if (flwRef) {
    await supabase
      .from("bookings")
      .update({ totals: { ...totals, flw_ref: flwRef, flw_transaction_id: transactionId } })
      .eq("id", txRef);
  }

  const prop = (booking.properties as unknown as { slug: string; title: string } | null);
  return {
    ok: true,
    bookingId: booking.id as string,
    propertySlug: prop?.slug ?? "",
    propertyTitle: prop?.title ?? "",
    guestTotal: totals?.guestTotal ?? 0,
    currency: (booking.currency as string) ?? "KES",
    checkIn: booking.check_in as string,
    checkOut: booking.check_out as string,
    nights: totals?.nights ?? 0,
  };
}

// ── Verification fee (listing) ─────────────────────────────────────────────
// Same Flutterwave plumbing as bookings. The listing enquiry is already saved
// as a lead before this runs, so an abandoned payment never loses the enquiry.

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
  if (!isFlutterwaveConfigured()) return { ok: true, demo: true };

  try {
    const txRef = `verif_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    const paymentUrl = await initPayment({
      txRef,
      amount: input.amount,
      currency: input.currency || "KES",
      customerEmail: input.email,
      customerName: input.name,
      redirectUrl: `${SITE_URL}/list/callback?tier=${encodeURIComponent(input.tierLabel)}`,
      description: `Verification (${input.tierLabel}): ${input.listingTitle}`.slice(0, 200),
      meta: { kind: "verification", tier: input.tier, listingTitle: input.listingTitle },
    });
    return { ok: true, paymentUrl };
  } catch (err) {
    console.error("[verification] Flutterwave init failed:", err);
    return { ok: false, error: "Payment gateway error. Please try again." };
  }
}

export type ConfirmVerificationResult =
  | { ok: true; amount: number; currency: string }
  | { ok: false; error: string };

export async function confirmVerificationPayment(
  transactionId: string,
  status: string,
): Promise<ConfirmVerificationResult> {
  if (status !== "successful") return { ok: false, error: "Payment was not completed." };
  if (!transactionId) return { ok: false, error: "Invalid payment reference." };
  try {
    const v = await verifyPayment(transactionId);
    if (!v.verified) return { ok: false, error: "Payment verification failed." };
    return { ok: true, amount: v.amount, currency: v.currency };
  } catch (err) {
    console.error("[verification] verify error:", err);
    return { ok: false, error: "Could not verify payment. Please contact support." };
  }
}

// ── M-Pesa (Daraja STK Push to a Till / Buy Goods) ───────────────────────────────

/** A confirmed-booking payload, shared by the Flutterwave and M-Pesa flows. */
type BookingConfirmation = {
  bookingId: string;
  propertySlug: string;
  propertyTitle: string;
  guestTotal: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  nights: number;
};

type BookingRow = {
  id: string;
  currency: string | null;
  check_in: string;
  check_out: string;
  totals: BookingBreakdown | null;
  properties: { slug: string; title: string } | { slug: string; title: string }[] | null;
};

function toConfirmation(row: BookingRow): BookingConfirmation {
  const totals = row.totals ?? ({} as BookingBreakdown);
  const prop = Array.isArray(row.properties) ? row.properties[0] : row.properties;
  return {
    bookingId: row.id,
    propertySlug: prop?.slug ?? "",
    propertyTitle: prop?.title ?? "",
    guestTotal: totals.guestTotal ?? 0,
    currency: row.currency ?? "KES",
    checkIn: row.check_in,
    checkOut: row.check_out,
    nights: totals.nights ?? 0,
  };
}

export type StartMpesaInput = StartPaymentInput & { phone: string };

export type StartMpesaResult =
  | { ok: true; checkoutRequestId: string; bookingId: string }
  | { ok: true; demo: true; bookingId: string }
  | { ok: false; error: string };

/**
 * Kick off an M-Pesa STK push for a booking. Creates the `pending` booking,
 * stashes the Daraja CheckoutRequestID on it (so the callback/poll can match),
 * and returns the id for the client to poll. Falls back to a demo booking when
 * M-Pesa isn't configured — mirroring the Flutterwave path.
 */
export async function startMpesaBooking(input: StartMpesaInput): Promise<StartMpesaResult> {
  if (input.currency !== "KES") {
    return { ok: false, error: "M-Pesa is available for KES listings only." };
  }
  const phone = normalizeMsisdn(input.phone);
  if (!phone) {
    return { ok: false, error: "Enter a valid Safaricom number, e.g. 07XX XXX XXX." };
  }

  if (!isMpesaConfigured()) {
    return { ok: true, demo: true, bookingId: `bk_demo_${Date.now().toString(36)}` };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database not configured." };

  const bookingId = await insertPendingBooking(supabase, input, { method: "mpesa", mpesa_phone: phone });
  if (!bookingId) return { ok: false, error: "Could not save booking. Please try again." };

  const push = await stkPush({
    amount: input.breakdown.guestTotal,
    phone,
    accountRef: bookingId.replace(/-/g, "").slice(0, 12),
    description: `Booking ${input.propertyTitle}`,
    callbackUrl: `${SITE_URL}/api/mpesa/callback`,
  });

  if (!push.ok || !push.checkoutRequestId) {
    // Mark cancelled (not deleted) so the slot isn't held but the attempt is
    // kept for audit/reconciliation.
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    return { ok: false, error: push.error ?? "Could not start the M-Pesa payment. Please try again." };
  }

  await supabase
    .from("bookings")
    .update({
      totals: {
        ...input.breakdown,
        method: "mpesa",
        mpesa_phone: phone,
        mpesa_checkout_request_id: push.checkoutRequestId,
        mpesa_merchant_request_id: push.merchantRequestId,
      },
    })
    .eq("id", bookingId);

  return { ok: true, checkoutRequestId: push.checkoutRequestId, bookingId };
}

export type MpesaPollResult =
  | { ok: true; status: "pending" }
  | ({ ok: true; status: "paid" } & BookingConfirmation)
  | { ok: true; status: "failed"; error: string }
  | { ok: false; error: string };

/**
 * Poll an in-flight M-Pesa payment. Reads the booking (the async callback may
 * have already settled it); if still pending, asks Daraja directly via STK
 * Query so confirmation works even when the callback is delayed or never lands.
 */
export async function pollMpesaBooking(checkoutRequestId: string): Promise<MpesaPollResult> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database not configured." };

  const { data: row } = await supabase
    .from("bookings")
    .select("id, status, currency, check_in, check_out, totals, properties(slug, title)")
    .eq("totals->>mpesa_checkout_request_id", checkoutRequestId)
    .maybeSingle();

  // Not found could be a brief read-replica lag just after insert — treat as
  // pending so the client keeps polling rather than failing hard.
  if (!row) return { ok: true, status: "pending" };

  if (row.status === "paid") {
    return { ok: true, status: "paid", ...toConfirmation(row as unknown as BookingRow) };
  }
  if (row.status === "cancelled") {
    return { ok: true, status: "failed", error: "Payment was cancelled or not completed." };
  }

  const bookingCols = "id, currency, check_in, check_out, totals, properties(slug, title)";

  // Still pending in our DB — ask Daraja (authoritative).
  try {
    const q = await stkQuery(checkoutRequestId);
    if (q.settled) {
      if (q.success) {
        // Re-read fresh totals before writing so we never clobber an
        // mpesa_receipt the async callback may have already stored. The guarded
        // update is a no-op if the callback got there first — then the fresh
        // re-read below returns the already-settled (receipt-bearing) row.
        const { data: fresh } = await supabase.from("bookings").select(bookingCols).eq("id", row.id).maybeSingle();
        const freshTotals = (fresh?.totals ?? row.totals ?? {}) as BookingBreakdown;
        await supabase
          .from("bookings")
          .update({ status: "paid", totals: { ...freshTotals, mpesa_result_desc: q.resultDesc } })
          .eq("id", row.id)
          .eq("status", "pending");
        const { data: settled } = await supabase.from("bookings").select(bookingCols).eq("id", row.id).maybeSingle();
        return {
          ok: true,
          status: "paid",
          ...toConfirmation((settled ?? fresh ?? row) as unknown as BookingRow),
        };
      }
      const { data: fresh } = await supabase.from("bookings").select("totals").eq("id", row.id).maybeSingle();
      const freshTotals = (fresh?.totals ?? row.totals ?? {}) as BookingBreakdown;
      await supabase
        .from("bookings")
        .update({ status: "cancelled", totals: { ...freshTotals, mpesa_result_code: q.resultCode, mpesa_result_desc: q.resultDesc } })
        .eq("id", row.id)
        .eq("status", "pending");
      return { ok: true, status: "failed", error: q.resultDesc ?? "Payment was not completed." };
    }
  } catch (err) {
    // Transient query error — keep the client polling.
    console.error("[payment] M-Pesa STK query error:", err);
  }

  return { ok: true, status: "pending" };
}

// ── Reservation deposit (sale listings, M-Pesa) ──────────────────────────────────
// A flat refundable deposit that registers interest with the verified agent. The
// enquiry is also captured as a lead (so the agent is notified even if the push
// is abandoned). Reuses the booking row + pollMpesaBooking/callback machinery.

export type StartReservationInput = {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  name: string;
  phone: string;
  email?: string;
  message?: string;
};

export type StartReservationResult =
  | { ok: true; checkoutRequestId: string; bookingId: string; amount: number }
  | { ok: true; demo: true; bookingId: string; amount: number }
  | { ok: false; error: string };

export async function startReservationDeposit(input: StartReservationInput): Promise<StartReservationResult> {
  const name = (input.name ?? "").trim();
  const phone = normalizeMsisdn(input.phone);
  if (name.length < 2) return { ok: false, error: "Please add your name." };
  if (!phone) return { ok: false, error: "Enter a valid Safaricom number, e.g. 07XX XXX XXX." };

  const amount = RESERVATION_DEPOSIT_KES;

  // Capture the enquiry regardless of whether the payment completes (best-effort).
  void sendPropertyEnquiry({
    action: "reserve",
    propertyId: input.propertyId,
    propertyTitle: input.propertyTitle,
    name,
    phone: input.phone,
    email: input.email,
    message: input.message
      ? `${input.message}\n\n(Reservation deposit of KES ${amount} initiated via M-Pesa.)`
      : `Reservation deposit of KES ${amount} initiated via M-Pesa.`,
  }).catch((err) => {
    console.error("[payment] Reservation enquiry capture failed:", err);
  });

  if (!isMpesaConfigured()) {
    return { ok: true, demo: true, bookingId: `bk_demo_${Date.now().toString(36)}`, amount };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database not configured." };

  const today = new Date().toISOString().slice(0, 10);
  const baseTotals = {
    kind: "reservation_deposit",
    guestTotal: amount,
    nights: 0,
    method: "mpesa",
    mpesa_phone: phone,
    propertyTitle: input.propertyTitle,
  };

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      property_id: input.propertyId,
      guest_name: name,
      guest_email: input.email?.trim() || null,
      check_in: today,
      check_out: today,
      guests: 1,
      unit: "day",
      currency: "KES",
      status: "pending",
      totals: baseTotals,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[payment] Reservation insert failed:", error?.message);
    return { ok: false, error: "Could not start the reservation. Please try again." };
  }
  const bookingId = data.id as string;

  const push = await stkPush({
    amount,
    phone,
    accountRef: bookingId.replace(/-/g, "").slice(0, 12),
    description: `Deposit ${input.propertyTitle}`,
    callbackUrl: `${SITE_URL}/api/mpesa/callback`,
  });

  if (!push.ok || !push.checkoutRequestId) {
    // Keep the row as a cancelled audit record rather than deleting it.
    await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    return { ok: false, error: push.error ?? "Could not start the M-Pesa payment. Please try again." };
  }

  await supabase
    .from("bookings")
    .update({
      totals: {
        ...baseTotals,
        mpesa_checkout_request_id: push.checkoutRequestId,
        mpesa_merchant_request_id: push.merchantRequestId,
      },
    })
    .eq("id", bookingId);

  return { ok: true, checkoutRequestId: push.checkoutRequestId, bookingId, amount };
}
