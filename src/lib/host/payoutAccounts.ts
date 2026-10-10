"use server";

/**
 * Host PAYMENT methods — the account details a guest uses to pay the host
 * DIRECTLY (CoralStones never collects the money). Because guests must be able
 * to pay, these are not secrets: we store the structured `details` plus a
 * ready-to-show `instructions` string, and reveal `instructions` only to a
 * guest who has made a booking request (via the requestBooking action).
 *
 * Writes are scoped to the caller's owner id; the table itself stays RLS-locked
 * (service-role only), so nothing leaks to the anon key.
 */

import { getCurrentUser } from "@/lib/auth/dal";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { normalizeMsisdn } from "@/lib/payment/mpesa";

export type PaymentMethod = {
  id: string;
  method: "mpesa" | "bank";
  display_label: string;
  instructions: string;
  is_default: boolean;
  status: string;
};

export type AddPaymentInput = {
  method: "mpesa" | "bank";
  mpesaChannel?: "phone" | "till" | "paybill";
  phone?: string;
  till?: string;
  paybill?: string;
  account?: string; // paybill account reference
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
};

type Result = { ok: true } | { ok: false; error: string };

async function requireOwnerId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "owner" && user.role !== "admin")) return null;
  return user.id;
}

/** Build the structured details + the guest-facing instruction + a short label. */
function buildMethod(input: AddPaymentInput):
  | { details: Record<string, string>; instructions: string; label: string }
  | { error: string } {
  if (input.method === "mpesa") {
    const channel = input.mpesaChannel ?? "phone";
    if (channel === "till") {
      const till = (input.till ?? "").replace(/\D/g, "");
      if (!till) return { error: "Enter your M-Pesa Till number." };
      return {
        details: { channel, till },
        instructions: `Lipa na M-Pesa → Buy Goods and Services → Till number ${till}`,
        label: `M-Pesa Till ${till}`,
      };
    }
    if (channel === "paybill") {
      const paybill = (input.paybill ?? "").replace(/\D/g, "");
      const account = (input.account ?? "").trim();
      if (!paybill || !account) return { error: "Enter your Paybill number and account reference." };
      return {
        details: { channel, paybill, account },
        instructions: `Lipa na M-Pesa → Pay Bill → Business no. ${paybill}, Account ${account}`,
        label: `M-Pesa Paybill ${paybill}`,
      };
    }
    const phone = normalizeMsisdn(input.phone ?? "");
    if (!phone) return { error: "Enter a valid Safaricom number, e.g. 07XX XXX XXX." };
    const pretty = `0${phone.slice(3)}`;
    return {
      details: { channel: "phone", phone },
      instructions: `Send money on M-Pesa to ${pretty}`,
      label: `M-Pesa ${pretty}`,
    };
  }

  const bankName = (input.bankName ?? "").trim();
  const accountName = (input.accountName ?? "").trim();
  const accountNumber = (input.accountNumber ?? "").trim();
  if (!bankName || !accountNumber) return { error: "Enter the bank name and account number." };
  return {
    details: { bankName, accountName, accountNumber },
    instructions: `Bank transfer to ${bankName}, Account ${accountNumber}${accountName ? ` (${accountName})` : ""}`,
    label: `${bankName} ${accountNumber.slice(-4).padStart(accountNumber.length, "•")}`,
  };
}

/** The current host's payment methods (host sees their own full instructions). */
export async function listMyPayoutAccountsMasked(): Promise<PaymentMethod[]> {
  const ownerId = await requireOwnerId();
  const sb = getSupabaseAdmin();
  if (!ownerId || !sb) return [];
  const { data } = await sb
    .from("payout_accounts")
    .select("id, method, display_label, instructions, is_default, status")
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .order("is_default", { ascending: false });
  return (data as PaymentMethod[] | null) ?? [];
}

export async function addPayoutAccount(input: AddPaymentInput): Promise<Result> {
  const ownerId = await requireOwnerId();
  if (!ownerId) return { ok: false, error: "Only hosts can add payment details." };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Payment details aren't available right now." };

  const built = buildMethod(input);
  if ("error" in built) return { ok: false, error: built.error };

  const { count } = await sb
    .from("payout_accounts")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("status", "active");

  const { error } = await sb.from("payout_accounts").insert({
    owner_id: ownerId,
    method: input.method,
    display_label: built.label,
    details: built.details,
    instructions: built.instructions,
    is_default: !count, // first method becomes the default
  });
  return error ? { ok: false, error: "Could not save the payment method." } : { ok: true };
}

export async function setDefaultPayoutAccount(id: string): Promise<Result> {
  const ownerId = await requireOwnerId();
  const sb = getSupabaseAdmin();
  if (!ownerId || !sb) return { ok: false, error: "Not available." };
  await sb.from("payout_accounts").update({ is_default: false }).eq("owner_id", ownerId);
  const { error } = await sb
    .from("payout_accounts")
    .update({ is_default: true })
    .eq("id", id)
    .eq("owner_id", ownerId);
  return error ? { ok: false, error: "Could not update the default." } : { ok: true };
}

export async function disablePayoutAccount(id: string): Promise<Result> {
  const ownerId = await requireOwnerId();
  const sb = getSupabaseAdmin();
  if (!ownerId || !sb) return { ok: false, error: "Not available." };
  const { error } = await sb
    .from("payout_accounts")
    .update({ status: "disabled", is_default: false })
    .eq("id", id)
    .eq("owner_id", ownerId);
  return error ? { ok: false, error: "Could not remove the method." } : { ok: true };
}
