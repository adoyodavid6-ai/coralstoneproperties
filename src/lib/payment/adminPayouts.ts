import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { convertBetween } from "@/lib/format";
import type { Currency } from "@/lib/types";

/**
 * Admin read models for escrow oversight: which bookings hold funds, the payout
 * ledger, and a headline held/released figure (≈ normalised to KES). Reads only
 * — mutations (release/refund) live in payout.ts and are called from the admin
 * page's server actions.
 */

export type EscrowBooking = {
  id: string;
  propertyTitle: string;
  status: string;
  currency: string;
  ownerPayout: number;
  releaseDueAt: string | null;
  createdAt: string;
  releasable: boolean;
};

export type PayoutLedgerRow = {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  receipt: string | null;
  createdAt: string;
};

export type EscrowSummary = { heldKes: number; releasedKes: number; heldCount: number; releasedCount: number };

const ESCROW_STATES = ["paid", "release_pending", "payout_completed", "payout_failed", "refund_pending"];

export async function getEscrowBookings(): Promise<EscrowBooking[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await sb
    .from("bookings")
    .select("id, status, currency, release_due_at, created_at, totals, properties(title)")
    .in("status", ESCROW_STATES)
    .order("created_at", { ascending: false });

  const rows = (data as Record<string, unknown>[] | null) ?? [];
  return rows.map((b) => {
    const totals = (b.totals ?? {}) as { ownerPayout?: number };
    const prop = (b.properties ?? {}) as { title?: string };
    const releaseDueAt = (b.release_due_at as string | null) ?? null;
    const status = (b.status as string) ?? "";
    return {
      id: String(b.id),
      propertyTitle: prop.title ?? "Listing",
      status,
      currency: (b.currency as string) ?? "KES",
      ownerPayout: Number(totals.ownerPayout ?? 0),
      releaseDueAt,
      createdAt: (b.created_at as string) ?? "",
      releasable: status === "paid" && Boolean(releaseDueAt) && String(releaseDueAt) <= today,
    };
  });
}

export async function getEscrowSummary(rows?: EscrowBooking[]): Promise<EscrowSummary> {
  const list = rows ?? (await getEscrowBookings());
  let heldKes = 0;
  let releasedKes = 0;
  let heldCount = 0;
  let releasedCount = 0;
  for (const b of list) {
    const kes = convertBetween(b.ownerPayout, b.currency as Currency, "KES");
    if (b.status === "paid" || b.status === "release_pending") {
      heldKes += kes;
      heldCount += 1;
    } else if (b.status === "payout_completed") {
      releasedKes += kes;
      releasedCount += 1;
    }
  }
  return { heldKes, releasedKes, heldCount, releasedCount };
}

export async function listRecentPayouts(limit = 50): Promise<PayoutLedgerRow[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("payouts")
    .select("id, booking_id, amount, currency, method, status, receipt, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data as Record<string, unknown>[] | null) ?? [];
  return rows.map((p) => ({
    id: String(p.id),
    bookingId: String(p.booking_id),
    amount: Number(p.amount ?? 0),
    currency: (p.currency as string) ?? "KES",
    method: (p.method as string) ?? "",
    status: (p.status as string) ?? "",
    receipt: (p.receipt as string | null) ?? null,
    createdAt: (p.created_at as string) ?? "",
  }));
}
