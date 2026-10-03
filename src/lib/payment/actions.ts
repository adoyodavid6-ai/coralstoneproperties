"use server";

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { initPayment, verifyPayment, isFlutterwaveConfigured } from "./flutterwave";
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

export async function startBookingPayment(input: StartPaymentInput): Promise<StartPaymentResult> {
  if (!isFlutterwaveConfigured()) {
    return { ok: true, demo: true, bookingId: `bk_demo_${Date.now().toString(36)}` };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) return { ok: false, error: "Database not configured." };

  const { data: booking, error: insertError } = await supabase
    .from("bookings")
    .insert({
      property_id: input.propertyId,
      guest_name: input.guestName,
      guest_email: input.guestEmail,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: input.guests,
      unit: input.unit,
      currency: input.currency,
      status: "pending",
      totals: input.breakdown,
    })
    .select("id")
    .single();

  if (insertError || !booking) {
    console.error("[payment] Supabase insert failed:", insertError?.message);
    return { ok: false, error: "Could not save booking. Please try again." };
  }

  try {
    const paymentUrl = await initPayment({
      txRef: booking.id,
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
    await supabase.from("bookings").delete().eq("id", booking.id);
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
