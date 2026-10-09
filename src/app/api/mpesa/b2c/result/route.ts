import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Daraja B2C result callback — Safaricom POSTs the definitive payout outcome
 * here after a `b2cPayout` request. We match the `payouts` row by the
 * ConversationID stashed at request time and settle it (and the booking).
 *
 * Mirrors the STK callback contract: unauthenticated + retried, so the update
 * is idempotent (guarded on status='processing') and we always reply 200.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResultParam = { Key: string; Value?: string | number };

export async function POST(req: Request) {
  let body: {
    Result?: {
      ResultCode?: number | string;
      ResultDesc?: string;
      ConversationID?: string;
      ResultParameters?: { ResultParameter?: ResultParam[] };
    };
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }

  const r = body?.Result;
  const conversationId = r?.ConversationID;
  const code = Number(r?.ResultCode);
  const sb = getSupabaseAdmin();

  if (sb && conversationId) {
    const { data: payout } = await sb
      .from("payouts")
      .select("id, booking_id, status")
      .eq("provider_ref", conversationId)
      .maybeSingle();

    if (payout && payout.status === "processing") {
      if (code === 0) {
        const params = r?.ResultParameters?.ResultParameter ?? [];
        const receipt = params.find((p) => p.Key === "TransactionReceipt")?.Value;
        await sb
          .from("payouts")
          .update({
            status: "completed",
            result_code: String(code),
            result_desc: r?.ResultDesc ?? null,
            receipt: receipt != null ? String(receipt) : null,
            completed_at: new Date().toISOString(),
          })
          .eq("id", payout.id)
          .eq("status", "processing");
        await sb.from("bookings").update({ status: "payout_completed" }).eq("id", payout.booking_id);
      } else {
        await sb
          .from("payouts")
          .update({ status: "failed", result_code: String(code), result_desc: r?.ResultDesc ?? null })
          .eq("id", payout.id)
          .eq("status", "processing");
        await sb.from("bookings").update({ status: "payout_failed" }).eq("id", payout.booking_id);
      }
    }
  }

  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
