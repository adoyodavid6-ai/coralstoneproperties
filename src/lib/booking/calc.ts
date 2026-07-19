import type { BookingBreakdown, BookingFees } from "./types";

/** Whole nights between two ISO dates (checkout − checkin). 0 if invalid. */
export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const a = new Date(checkIn).getTime();
  const b = new Date(checkOut).getTime();
  if (Number.isNaN(a) || Number.isNaN(b) || b <= a) return 0;
  return Math.round((b - a) / 86_400_000);
}

/**
 * Cost a stay end to end — both the guest bill and the owner payout — from the
 * nightly rate, the number of nights and the platform fee config.
 */
export function calcBooking(
  nightlyRate: number,
  nights: number,
  fees: BookingFees,
): BookingBreakdown {
  const nightsSubtotal = nightlyRate * nights;
  const cleaningFee = nights > 0 ? Math.round(nightlyRate * fees.cleaningFeeRate) : 0;
  const guestServiceFee = Math.round(nightsSubtotal * fees.guestServiceFeePct);
  const tax = Math.round((nightsSubtotal + cleaningFee) * fees.taxPct);
  const guestTotal = nightsSubtotal + cleaningFee + guestServiceFee + tax;

  const hostServiceFee = Math.round((nightsSubtotal + cleaningFee) * fees.hostServiceFeePct);
  const ownerPayout = nightsSubtotal + cleaningFee - hostServiceFee;
  const platformRevenue = guestServiceFee + hostServiceFee;

  return {
    nights,
    nightlyRate,
    nightsSubtotal,
    cleaningFee,
    guestServiceFee,
    tax,
    guestTotal,
    hostServiceFee,
    ownerPayout,
    platformRevenue,
  };
}
