import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * Flutterwave transfer webhook — settles a bank payout. FLW signs webhooks with
 * a secret-hash header (`verif-hash`) that must equal FLW_WEBHOOK_SECRET; we
 * reject anything else. Matches the `payouts` row by the transfer id we stored
 * as `provider_ref`. Idempotent (guarded on status='processing'), always 200 so
 * FLW stops retrying.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expected = process.env.FLW_WEBHOOK_SECRET;
  const got = req.headers.get("verif-hash");
  if (!expected || got !== expected) {
    // Unverified — acknowledge without acting (don't leak which it was).
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  let body: { event?: string; data?: { id?: number | string; status?: string; reference?: string } };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ status: "ok" });
  }

  const data = body?.data;
  const transferId = data?.id != null ? String(data.id) : "";
  const status = (data?.status ?? "").toUpperCase();
  const sb = getSupabaseAdmin();

  if (sb && transferId) {
    const { data: payout } = await sb
      .from("payouts")
      .select("id, booking_id, status")
      .eq("provider_ref", transferId)
      .maybeSingle();

    if (payout && payout.status === "processing") {
      if (status === "SUCCESSFUL") {
        await sb
          .from("payouts")
          .update({ status: "completed", result_desc: status, receipt: transferId, completed_at: new Date().toISOString() })
          .eq("id", payout.id)
          .eq("status", "processing");
        await sb.from("bookings").update({ status: "payout_completed" }).eq("id", payout.booking_id);
      } else if (status === "FAILED") {
        await sb
          .from("payouts")
          .update({ status: "failed", result_desc: status })
          .eq("id", payout.id)
          .eq("status", "processing");
        await sb.from("bookings").update({ status: "payout_failed" }).eq("id", payout.booking_id);
      }
    }
  }

  return NextResponse.json({ status: "ok" });
}
