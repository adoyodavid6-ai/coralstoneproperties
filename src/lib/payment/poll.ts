"use client";

import { pollMpesaBooking } from "@/lib/payment/actions";

/** Terminal outcome of an M-Pesa STK push, as surfaced to the UI. */
export type MpesaFinal =
  | {
      kind: "paid";
      bookingId: string;
      propertySlug: string;
      propertyTitle: string;
      guestTotal: number;
      currency: string;
      checkIn: string;
      checkOut: string;
      nights: number;
    }
  | { kind: "failed"; error: string }
  | { kind: "timeout" };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Poll an in-flight M-Pesa payment until it settles or times out (~2 min by
 * default). Shared by the booking widget and the reserve-deposit flow. Transient
 * poll errors are ignored so a blip doesn't abort a live payment.
 */
export async function pollMpesa(
  checkoutRequestId: string,
  tries = 30,
  intervalMs = 4000,
): Promise<MpesaFinal> {
  for (let i = 0; i < tries; i++) {
    await sleep(intervalMs);
    const p = await pollMpesaBooking(checkoutRequestId);
    if (!p.ok) continue; // transient — keep waiting
    if (p.status === "paid") {
      return {
        kind: "paid",
        bookingId: p.bookingId,
        propertySlug: p.propertySlug,
        propertyTitle: p.propertyTitle,
        guestTotal: p.guestTotal,
        currency: p.currency,
        checkIn: p.checkIn,
        checkOut: p.checkOut,
        nights: p.nights,
      };
    }
    if (p.status === "failed") return { kind: "failed", error: p.error };
  }
  return { kind: "timeout" };
}
