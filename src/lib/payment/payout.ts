import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { decryptSecret } from "@/lib/host/crypto";
import { b2cPayout, isMpesaB2CConfigured } from "./mpesaB2C";
import { initTransfer, isFlutterwaveConfigured, refundTransaction } from "./flutterwave";
import { SITE_URL } from "@/lib/site";

/**
 * Escrow release orchestration — NOT a "use server" module (those are
 * client-callable and this decrypts payout secrets). Callers are the admin
 * release action and the scheduled release cron.
 *
 * `releaseBooking` guards status='paid' AND release_due_at <= today (after
 * check-in), then creates an idempotent `payouts` row and fires the rail:
 * M-Pesa → Daraja B2C, bank → Flutterwave Transfer. Final settlement arrives
 * async on the payout callbacks. With no rail/account configured it completes a
 * demo payout so the flow is testable end-to-end.
 */

export type ReleaseResult =
  | { ok: true; status: "payout_completed" | "release_pending"; demo?: boolean }
  | { ok: false; error: string };

type PayoutSecret = { msisdn?: string; bankName?: string; accountNumber?: string; bankCode?: string };

const today = () => new Date().toISOString().slice(0, 10);

export async function releaseBooking(opts: {
  bookingId: string;
  actor: string;
  force?: boolean; // skip the after-check-in gate (admin override)
}): Promise<ReleaseResult> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Database not configured." };

  const { data: b } = await sb
    .from("bookings")
    .select("id, owner_id, currency, status, release_due_at, totals")
    .eq("id", opts.bookingId)
    .maybeSingle();
  if (!b) return { ok: false, error: "Booking not found." };
  if (b.status !== "paid") return { ok: false, error: `Booking is "${b.status}", not held in escrow.` };
  if (!opts.force && (!b.release_due_at || String(b.release_due_at) > today())) {
    return { ok: false, error: "Not releasable yet — funds release after check-in." };
  }
  if (!b.owner_id) return { ok: false, error: "No owner linked to this booking." };

  const amount = Number((b.totals as { ownerPayout?: number })?.ownerPayout ?? 0);
  if (!(amount > 0)) return { ok: false, error: "No owner payout amount on this booking." };
  const currency = (b.currency as string) ?? "KES";

  // Idempotency: block if a non-failed payout already exists; version the key per attempt.
  const { data: priors } = await sb.from("payouts").select("id, status").eq("booking_id", b.id);
  const attempts = priors ?? [];
  if (attempts.some((p) => p.status !== "failed")) {
    return { ok: false, error: "A payout for this booking is already in progress or complete." };
  }
  const idempotencyKey = `${b.id}:v${attempts.length + 1}`;

  // Default payout account (may be absent → demo payout).
  const { data: acct } = await sb
    .from("payout_accounts")
    .select("id, method, display_label, secret_enc")
    .eq("owner_id", b.owner_id)
    .eq("status", "active")
    .eq("is_default", true)
    .maybeSingle();

  const secret: PayoutSecret = acct ? (JSON.parse(decryptSecret(acct.secret_enc as string) ?? "{}") as PayoutSecret) : {};
  const mpesaReady = acct?.method === "mpesa" && isMpesaB2CConfigured() && Boolean(secret.msisdn);
  const bankReady = acct?.method === "bank" && isFlutterwaveConfigured() && Boolean(secret.accountNumber);
  const method: "mpesa_b2c" | "flw_transfer" | "demo" = mpesaReady ? "mpesa_b2c" : bankReady ? "flw_transfer" : "demo";

  // Create the ledger row first (processing), and move the booking to release_pending.
  const { data: payout, error: insErr } = await sb
    .from("payouts")
    .insert({
      booking_id: b.id,
      owner_id: b.owner_id,
      payout_account_id: acct?.id ?? null,
      amount,
      currency,
      method,
      recipient_ref: acct?.display_label ?? "demo",
      status: "processing",
      idempotency_key: idempotencyKey,
      requested_by: opts.actor,
    })
    .select("id")
    .single();
  if (insErr || !payout) return { ok: false, error: "Could not open a payout record." };

  await sb.from("bookings").update({ status: "release_pending" }).eq("id", b.id).eq("status", "paid");

  // Demo: no live rail — settle immediately so the flow is testable.
  if (method === "demo") {
    await sb
      .from("payouts")
      .update({ status: "completed", receipt: `DEMO-${idempotencyKey}`, completed_at: new Date().toISOString() })
      .eq("id", payout.id);
    await sb.from("bookings").update({ status: "payout_completed" }).eq("id", b.id);
    return { ok: true, status: "payout_completed", demo: true };
  }

  // Live rails — settlement completes async on the callback/webhook.
  if (method === "mpesa_b2c") {
    const r = await b2cPayout({
      amount,
      phone: secret.msisdn!,
      remarks: `CoralStones payout ${b.id}`,
      resultUrl: `${SITE_URL}/api/mpesa/b2c/result`,
      timeoutUrl: `${SITE_URL}/api/mpesa/b2c/timeout`,
      occasion: idempotencyKey,
    });
    if (!r.ok) return fail(sb, b.id, payout.id, r.error);
    await sb.from("payouts").update({ provider_ref: r.conversationId ?? null }).eq("id", payout.id);
    return { ok: true, status: "release_pending" };
  }

  // bank → Flutterwave transfer
  const r = await initTransfer({
    accountBank: secret.bankCode || "",
    accountNumber: secret.accountNumber!,
    amount,
    currency,
    narration: `CoralStones payout ${b.id}`,
    reference: idempotencyKey,
    beneficiaryName: secret.bankName,
  });
  if (!r.ok) return fail(sb, b.id, payout.id, r.error);
  await sb.from("payouts").update({ provider_ref: r.transferId ?? null }).eq("id", payout.id);
  return { ok: true, status: "release_pending" };
}

async function fail(
  sb: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  bookingId: string,
  payoutId: string,
  error?: string,
): Promise<ReleaseResult> {
  await sb.from("payouts").update({ status: "failed", result_desc: error ?? "payout failed" }).eq("id", payoutId);
  await sb.from("bookings").update({ status: "payout_failed" }).eq("id", bookingId);
  return { ok: false, error: error ?? "Payout failed." };
}

export type RefundResult =
  | { ok: true; status: "refunded" | "refund_pending" }
  | { ok: false; error: string };

/**
 * Refund a held booking to the guest (cancellation / owner decline). Only
 * allowed from 'paid' — once funds are released we don't claw back here. For a
 * card charge we hit Flutterwave's refund API and settle to 'refunded';
 * otherwise we park it at 'refund_pending' for an admin to complete manually
 * (M-Pesa B2C reversal to the guest), then finalise with markBookingRefunded.
 */
export async function refundBooking(opts: { bookingId: string; actor: string }): Promise<RefundResult> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Database not configured." };

  const { data: b } = await sb
    .from("bookings")
    .select("id, status, totals")
    .eq("id", opts.bookingId)
    .maybeSingle();
  if (!b) return { ok: false, error: "Booking not found." };
  if (b.status !== "paid") return { ok: false, error: `Only held (paid) bookings can be refunded here (is "${b.status}").` };

  await sb.from("bookings").update({ status: "refund_pending" }).eq("id", b.id).eq("status", "paid");

  const totals = (b.totals ?? {}) as { flw_transaction_id?: string };
  if (totals.flw_transaction_id && isFlutterwaveConfigured()) {
    const r = await refundTransaction(totals.flw_transaction_id);
    if (r.ok) {
      await sb.from("bookings").update({ status: "refunded" }).eq("id", b.id);
      return { ok: true, status: "refunded" };
    }
    return { ok: true, status: "refund_pending" }; // parked; admin completes manually
  }
  return { ok: true, status: "refund_pending" };
}

/** Admin finalises a manual refund (e.g. after an M-Pesa reversal to the guest). */
export async function markBookingRefunded(bookingId: string): Promise<{ ok: boolean }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false };
  const { error } = await sb
    .from("bookings")
    .update({ status: "refunded" })
    .eq("id", bookingId)
    .eq("status", "refund_pending");
  return { ok: !error };
}
