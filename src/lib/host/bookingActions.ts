"use server";

/**
 * Host actions on their own bookings. Since guests pay the host directly
 * (CoralStones never touches the money), the host is the one who confirms a
 * payment actually landed — flipping the booking to `confirmed` — or declines
 * it. Scoped to bookings the caller owns.
 */

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type Result = { ok: true } | { ok: false; error: string };

async function setStatus(bookingId: string, next: "confirmed" | "declined"): Promise<Result> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "owner" && user.role !== "admin")) {
    return { ok: false, error: "Only the host can do that." };
  }
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Not available right now." };

  // Scope to a booking this owner actually owns.
  const { data: b } = await sb.from("bookings").select("id, owner_id, status").eq("id", bookingId).maybeSingle();
  if (!b || (b.owner_id !== user.id && user.role !== "admin")) {
    return { ok: false, error: "Booking not found." };
  }
  const { error } = await sb.from("bookings").update({ status: next }).eq("id", bookingId);
  if (error) return { ok: false, error: "Could not update the booking." };
  revalidatePath("/host/bookings");
  return { ok: true };
}

export async function confirmBookingReceived(bookingId: string): Promise<Result> {
  return setStatus(bookingId, "confirmed");
}

export async function declineBooking(bookingId: string): Promise<Result> {
  return setStatus(bookingId, "declined");
}
