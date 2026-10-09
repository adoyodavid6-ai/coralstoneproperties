import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Read models for the host dashboard. Service-role reads scoped by the owner's
 * property ids. `ownerPayout` comes from the booking `totals` JSONB computed at
 * booking time (src/lib/booking/types.ts) — no recompute here. Defensive about
 * columns/tables that only exist after Stage C (escrow/payouts), so the
 * dashboard renders during the rollout.
 */

export type HostListing = {
  id: string;
  slug: string;
  title: string;
  status: string;
  intent: string;
  type: string;
};

export type HostBooking = {
  id: string;
  propertyId: string;
  propertyTitle: string;
  guestName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  currency: string;
  ownerPayout: number;
  createdAt: string;
};

export type HostEarnings = {
  currency: string;
  held: number; // paid, awaiting release
  released: number; // paid out
  bookingsCount: number;
};

async function ownerProperties(ownerId: string): Promise<HostListing[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("properties")
    .select("id, slug, title, status, intent, type")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false });
  return (data as HostListing[] | null) ?? [];
}

export async function getHostListings(ownerId: string): Promise<HostListing[]> {
  return ownerProperties(ownerId);
}

export async function getHostBookings(ownerId: string): Promise<HostBooking[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const props = await ownerProperties(ownerId);
  if (props.length === 0) return [];
  const titleById = new Map(props.map((p) => [p.id, p.title]));

  const { data } = await sb
    .from("bookings")
    .select("*")
    .in(
      "property_id",
      props.map((p) => p.id),
    )
    .order("created_at", { ascending: false });

  const rows = (data as Record<string, unknown>[] | null) ?? [];
  return rows.map((b) => {
    const totals = (b.totals ?? {}) as Record<string, unknown>;
    return {
      id: String(b.id),
      propertyId: String(b.property_id),
      propertyTitle: titleById.get(String(b.property_id)) ?? "Listing",
      guestName: (b.guest_name as string) ?? "Guest",
      checkIn: (b.check_in as string) ?? "",
      checkOut: (b.check_out as string) ?? "",
      status: (b.status as string) ?? "pending",
      currency: (b.currency as string) ?? "KES",
      ownerPayout: Number(totals.ownerPayout ?? 0),
      createdAt: (b.created_at as string) ?? "",
    };
  });
}

export async function getHostEarnings(ownerId: string): Promise<HostEarnings> {
  const bookings = await getHostBookings(ownerId);
  const currency = bookings[0]?.currency ?? "KES";
  let held = 0;
  let released = 0;
  for (const b of bookings) {
    if (b.status === "paid" || b.status === "release_pending") held += b.ownerPayout;
    if (b.status === "payout_completed") released += b.ownerPayout;
  }
  return { currency, held, released, bookingsCount: bookings.length };
}
