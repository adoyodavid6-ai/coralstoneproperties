import { NextResponse } from "next/server";

/**
 * Daraja B2C queue-timeout callback. Fired when Safaricom can't process the
 * request in time. We leave the payout in `processing` (the reconciliation job
 * / result callback is authoritative) and just acknowledge so Daraja stops
 * retrying.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.warn("[mpesa-b2c] queue timeout:", body.slice(0, 500));
  } catch {
    // ignore
  }
  return NextResponse.json({ ResultCode: 0, ResultDesc: "Accepted" });
}
