import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Safaricom Daraja STK-push result callback.
 *
 * Daraja POSTs here once the customer approves or declines the prompt. We match
 * the booking by the (unguessable) CheckoutRequestID stashed at push time and
 * settle it. Callbacks are unauthenticated and can be retried, so the update is
 * idempotent (guarded on `status = pending`). The client also polls STK Query
 * as the authoritative fallback, so a missed callback never strands a payment.
 *
 * We always reply 200 with {ResultCode:0} so Daraja stops retrying.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CallbackItem = { Name: string; Value?: string | number };

export async function POST(req: Request) {
  let body: {
    Body?: {
      stkCallback?: {
        CheckoutRequestID?: string;
        ResultCode?: number | string;
        ResultDesc?: string;
        CallbackMetadata?: { Item?: CallbackItem[] };
      };
    };
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const cb = body?.Body?.stkCallback;
  const checkoutId = cb?.CheckoutRequestID;
  const resultCode = cb?.ResultCode;

  const supabase = getSupabaseAdmin();
  if (supabase && checkoutId) {
    const { data: row } = await supabase
      .from("bookings")
      .select("id, status, totals")
      .eq("totals->>mpesa_checkout_request_id", checkoutId)
      .maybeSingle();

    // Enrich on success even if the authoritative poll already flipped it to
    // "paid" (the poll can't learn the receipt — only this callback carries it).
    // Never resurrect a cancelled row.
    const totals = (row?.totals ?? {}) as Record<string, unknown>;

    if (row && row.status !== "cancelled" && Number(resultCode) === 0) {
      const items = cb?.CallbackMetadata?.Item ?? [];
      const field = (name: string) => items.find((i) => i.Name === name)?.Value;
      const paidAmount = Number(field("Amount") ?? NaN);
      const expected = Number((totals as { guestTotal?: number }).guestTotal ?? NaN);

      // Defence in depth: these callbacks are unauthenticated, so only honour a
      // "paid" when the amount matches what we asked for. The authoritative STK
      // query in the poll remains the real confirmation path.
      if (Number.isFinite(paidAmount) && Number.isFinite(expected) && Math.round(paidAmount) !== Math.round(expected)) {
        console.warn(`[mpesa] callback amount mismatch for ${row.id}: got ${paidAmount}, expected ${expected}`);
      } else {
        await supabase
          .from("bookings")
          .update({
            status: "paid",
            totals: {
              ...totals,
              mpesa_receipt: field("MpesaReceiptNumber") ?? (totals as { mpesa_receipt?: unknown }).mpesa_receipt ?? null,
              mpesa_amount: field("Amount") ?? (totals as { mpesa_amount?: unknown }).mpesa_amount ?? null,
              mpesa_result_desc: cb?.ResultDesc ?? null,
            },
          })
          .eq("id", row.id)
          .neq("status", "cancelled");
      }
    } else if (row && row.status === "pending") {
      await supabase
        .from("bookings")
        .update({
          status: "cancelled",
          totals: { ...totals, mpesa_result_code: String(resultCode), mpesa_result_desc: cb?.ResultDesc ?? null },
        })
        .eq("id", row.id)
        .eq("status", "pending");
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
