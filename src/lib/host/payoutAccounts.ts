"use server";

/**
 * Host payout-account actions. Owners add/manage their M-Pesa or bank payout
 * destinations here. Raw details are encrypted ({@link encryptSecret}) before
 * they ever touch Postgres; reads return ONLY masked columns (never
 * `secret_enc`). Every call re-checks the owner role and scopes writes to the
 * caller's `owner_id`. Decryption lives elsewhere (payout orchestration), never
 * in a "use server" module — those are client-callable.
 */

import { getCurrentUser } from "@/lib/auth/dal";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { encryptSecret, isPayoutCryptoConfigured } from "./crypto";
import { normalizeMsisdn } from "@/lib/payment/mpesa";

export type MaskedPayoutAccount = {
  id: string;
  method: "mpesa" | "bank";
  display_label: string;
  is_default: boolean;
  verified: boolean;
  status: string;
};

export type AddPayoutInput = {
  method: "mpesa" | "bank";
  msisdn?: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  bankCode?: string;
};

type Result = { ok: true } | { ok: false; error: string };

const last4 = (s: string) => s.replace(/\D/g, "").slice(-4);

async function requireOwnerId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (!user || (user.role !== "owner" && user.role !== "admin")) return null;
  return user.id;
}

/** Masked payout accounts for the current host. Never returns secret_enc. */
export async function listMyPayoutAccountsMasked(): Promise<MaskedPayoutAccount[]> {
  const ownerId = await requireOwnerId();
  const sb = getSupabaseAdmin();
  if (!ownerId || !sb) return [];
  const { data } = await sb
    .from("payout_accounts")
    .select("id, method, display_label, is_default, verified, status")
    .eq("owner_id", ownerId)
    .eq("status", "active")
    .order("is_default", { ascending: false });
  return (data as MaskedPayoutAccount[] | null) ?? [];
}

export async function addPayoutAccount(input: AddPayoutInput): Promise<Result> {
  const ownerId = await requireOwnerId();
  if (!ownerId) return { ok: false, error: "Only hosts can add payout details." };
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Payout details aren't available right now." };
  if (!isPayoutCryptoConfigured())
    return { ok: false, error: "Payout details can't be saved yet — secure storage isn't configured." };

  let secret: string;
  let label: string;
  if (input.method === "mpesa") {
    const msisdn = normalizeMsisdn(input.msisdn ?? "");
    if (!msisdn) return { ok: false, error: "Enter a valid Safaricom number, e.g. 07XX XXX XXX." };
    secret = JSON.stringify({ msisdn });
    label = `M-Pesa •••• ${last4(msisdn)}`;
  } else {
    const account = (input.accountNumber ?? "").trim();
    if (!input.bankName?.trim() || !account)
      return { ok: false, error: "Enter the bank name and account number." };
    secret = JSON.stringify({
      bankName: input.bankName.trim(),
      accountName: (input.accountName ?? "").trim(),
      accountNumber: account,
      bankCode: (input.bankCode ?? "").trim(),
    });
    label = `${input.bankName.trim()} •••• ${last4(account)}`;
  }

  const enc = encryptSecret(secret);
  if (!enc) return { ok: false, error: "Could not secure the details. Please try again." };

  const { count } = await sb
    .from("payout_accounts")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", ownerId)
    .eq("status", "active");

  const { error } = await sb.from("payout_accounts").insert({
    owner_id: ownerId,
    method: input.method,
    display_label: label,
    secret_enc: enc,
    is_default: !count, // first active account becomes the default
  });
  return error ? { ok: false, error: "Could not save the payout account." } : { ok: true };
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
  return error ? { ok: false, error: "Could not remove the account." } : { ok: true };
}
