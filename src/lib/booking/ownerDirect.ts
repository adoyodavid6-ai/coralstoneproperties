"use server";

/**
 * Owner-direct booking flow. CoralStones does NOT collect money for bookings:
 * the guest requests to book, is shown the host's own payment instructions,
 * pays the host directly, then reports the payment; the host confirms receipt.
 *
 * `requestBooking` creates the booking and returns the host's payment
 * instructions for THIS booking only. `reportBookingPayment` records the guest's
 * payment reference. Both degrade gracefully when Supabase isn't configured.
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getOwnerDefaultPayment } from "@/lib/host/paymentLookup";
import type { BookingBreakdown } from "@/lib/booking/types";

export type RequestBookingInput = {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  currency: string;
  unit: "night" | "day";
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  breakdown: BookingBreakdown;
};

export type RequestBookingResult =
  | {
      ok: true;
      bookingId: string;
      payment: { instructions: string; label: string } | null;
    }
  | { ok: false; error: string };

export async function requestBooking(input: RequestBookingInput): Promise<RequestBookingResult> {
  if (!input.guestName.trim()) return { ok: false, error: "Please add your name." };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Bookings aren't available right now." };

  const { data: prop } = await sb
    .from("properties")
    .select("owner_id")
    .eq("id", input.propertyId)
    .maybeSingle();
  const ownerId = (prop?.owner_id as string | null) ?? null;

  const { data, error } = await sb
    .from("bookings")
    .insert({
      property_id: input.propertyId,
      owner_id: ownerId,
      guest_name: input.guestName.trim(),
      guest_email: input.guestEmail?.trim() || null,
      check_in: input.checkIn,
      check_out: input.checkOut,
      guests: input.guests,
      unit: input.unit,
      currency: input.currency,
      status: "awaiting_payment",
      totals: { ...input.breakdown, guest_phone: input.guestPhone?.trim() || null },
    })
    .select("id")
    .single();
  if (error || !data) return { ok: false, error: "Could not create the booking. Please try again." };

  const payment = ownerId ? await getOwnerDefaultPayment(ownerId) : null;
  return { ok: true, bookingId: data.id as string, payment };
}

export async function reportBookingPayment(input: {
  bookingId: string;
  reference: string;
}): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Not available right now." };

  const { data: b } = await sb.from("bookings").select("totals, status").eq("id", input.bookingId).maybeSingle();
  if (!b) return { ok: false, error: "Booking not found." };

  const totals = (b.totals ?? {}) as Record<string, unknown>;
  const { error } = await sb
    .from("bookings")
    .update({
      status: "payment_reported",
      totals: { ...totals, payment_reference: input.reference.trim(), reported_at: new Date().toISOString() },
    })
    .eq("id", input.bookingId)
    .eq("status", "awaiting_payment");
  return error ? { ok: false, error: "Could not record your payment." } : { ok: true };
}
