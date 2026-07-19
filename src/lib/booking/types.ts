import type { Currency } from "@/lib/types";

/**
 * Platform fee configuration for the short-let (Airbnb-style) model. All fees
 * are ratios so they stay correct across every listing currency:
 *  - guestServiceFeePct: added on top of the stay, charged to the guest.
 *  - hostServiceFeePct:  commission the platform deducts from the owner payout.
 *  - cleaningFeeRate:     a flat cleaning fee expressed as × the nightly rate.
 *  - taxPct:              tourism levy / VAT applied to stay + cleaning.
 */
export interface BookingFees {
  guestServiceFeePct: number;
  hostServiceFeePct: number;
  cleaningFeeRate: number;
  taxPct: number;
}

/** Fully-costed booking breakdown — a snapshot taken at reservation time. */
export interface BookingBreakdown {
  nights: number;
  nightlyRate: number;
  nightsSubtotal: number;
  cleaningFee: number;
  guestServiceFee: number;
  tax: number;
  /** What the guest pays. */
  guestTotal: number;
  /** Commission the platform keeps from the host. */
  hostServiceFee: number;
  /** What the owner receives after commission. */
  ownerPayout: number;
  /** Platform take = guest service fee + host commission. */
  platformRevenue: number;
}

export type BookingStatus = "confirmed" | "cancelled" | "paid_out";

export interface Booking extends BookingBreakdown {
  id: string;
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  currency: Currency;
  /** Billing unit: nights for short-lets, days for event venues. */
  unit: "night" | "day";
  checkIn: string; // ISO date (yyyy-mm-dd)
  checkOut: string;
  guests: number;
  guestName: string;
  status: BookingStatus;
  createdAt: number; // epoch ms
}

export const DEFAULT_FEES: BookingFees = {
  guestServiceFeePct: 0.12, // 12% guest service fee
  hostServiceFeePct: 0.03, // 3% host commission
  cleaningFeeRate: 0.5, // cleaning fee = half a night
  taxPct: 0.0, // no levy by default
};
