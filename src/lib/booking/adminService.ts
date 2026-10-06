/**
 * Server-side read of the live `bookings` table for the admin console. Uses the
 * service-role client (bookings are RLS-locked). Normalises the jsonb `totals`
 * into a flat row the admin ledger can render — including the payment method and
 * the M-Pesa receipt / Flutterwave reference.
 */
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type AdminBookingMethod = "mpesa" | "card" | "other";
export type AdminBookingKind = "stay" | "reservation_deposit";

export type AdminBooking = {
  id: string;
  propertyTitle: string;
  propertySlug: string;
  guestName: string | null;
  guestEmail: string | null;
  phone: string | null;
  currency: string;
  status: string; // pending | paid | cancelled | confirmed
  method: AdminBookingMethod;
  kind: AdminBookingKind;
  amount: number;
  nights: number;
  checkIn: string;
  checkOut: string;
  reference: string | null; // M-Pesa receipt or Flutterwave ref
  createdAt: string;
};

type Totals = {
  guestTotal?: number;
  nights?: number;
  method?: string;
  kind?: string;
  mpesa_phone?: string;
  mpesa_receipt?: string;
  mpesa_amount?: number;
  flw_ref?: string;
  propertyTitle?: string;
} | null;

export async function getBookings(): Promise<AdminBooking[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];

  const { data, error } = await sb
    .from("bookings")
    .select(
      "id,status,currency,check_in,check_out,guest_name,guest_email,created_at,totals,properties(slug,title)",
    )
    .order("created_at", { ascending: false })
    .limit(500);

  if (error) {
    console.error("[bookings] admin list failed:", error.message);
    return [];
  }

  return (data ?? []).map((r): AdminBooking => {
    const t = (r.totals ?? {}) as Totals;
    const prop = Array.isArray(r.properties) ? r.properties[0] : r.properties;
    const method: AdminBookingMethod =
      t?.method === "mpesa" ? "mpesa" : t?.flw_ref ? "card" : "other";
    return {
      id: r.id as string,
      propertyTitle: (prop?.title as string) ?? t?.propertyTitle ?? "—",
      propertySlug: (prop?.slug as string) ?? "",
      guestName: (r.guest_name as string) ?? null,
      guestEmail: (r.guest_email as string) ?? null,
      phone: t?.mpesa_phone ?? null,
      currency: (r.currency as string) ?? "KES",
      status: (r.status as string) ?? "pending",
      method,
      kind: t?.kind === "reservation_deposit" ? "reservation_deposit" : "stay",
      amount: Number(t?.guestTotal ?? t?.mpesa_amount ?? 0),
      nights: Number(t?.nights ?? 0),
      checkIn: r.check_in as string,
      checkOut: r.check_out as string,
      reference: t?.mpesa_receipt ?? t?.flw_ref ?? null,
      createdAt: r.created_at as string,
    };
  });
}
