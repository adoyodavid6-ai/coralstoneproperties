import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Server-only lookup of an owner's default payment instructions. NOT a
 * "use server" action (those are client-callable — this must not let a client
 * fetch arbitrary owners' details). Called inside requestBooking after a
 * booking row exists, so the guest only ever sees instructions for a property
 * they actually requested to book.
 */
export async function getOwnerDefaultPayment(
  ownerId: string,
): Promise<{ instructions: string; label: string } | null> {
  const sb = getSupabaseAdmin();
  if (!sb || !ownerId) return null;
  const { data } = await sb
    .from("payout_accounts")
    .select("display_label, instructions")
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .eq("is_default", true)
    .maybeSingle();
  if (!data?.instructions) return null;
  return { instructions: data.instructions as string, label: (data.display_label as string) ?? "" };
}
