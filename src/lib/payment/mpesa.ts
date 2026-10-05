// Server-only — Safaricom Daraja "Lipa na M-Pesa Online" (STK Push) client.
// Supports Buy Goods (Till) and PayBill. NEVER import from client components.
//
// Config (Vercel → Settings → Environment Variables):
//   MPESA_ENV               "sandbox" (default) | "production"
//   MPESA_CONSUMER_KEY      Daraja app Consumer Key
//   MPESA_CONSUMER_SECRET   Daraja app Consumer Secret
//   MPESA_PASSKEY           Lipa na M-Pesa Online passkey
//   MPESA_SHORTCODE         Business short code / store number used to build the
//                           password (for Buy Goods this is the HEAD OFFICE/store
//                           number; for PayBill it's the paybill).
//   MPESA_TILL              Buy-Goods Till number (PartyB). Optional — defaults to
//                           MPESA_SHORTCODE (i.e. PayBill mode) when unset.
//   MPESA_TRANSACTION_TYPE  "CustomerBuyGoodsOnline" (default, Till) |
//                           "CustomerPayBillOnline"

type MpesaEnv = "sandbox" | "production";

function mpesaEnv(): MpesaEnv {
  return (process.env.MPESA_ENV ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
}

function baseUrl(): string {
  return mpesaEnv() === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

function cfg() {
  const txType =
    process.env.MPESA_TRANSACTION_TYPE === "CustomerPayBillOnline"
      ? "CustomerPayBillOnline"
      : "CustomerBuyGoodsOnline";
  return {
    key: process.env.MPESA_CONSUMER_KEY ?? "",
    secret: process.env.MPESA_CONSUMER_SECRET ?? "",
    passkey: process.env.MPESA_PASSKEY ?? "",
    shortcode: process.env.MPESA_SHORTCODE ?? "",
    till: process.env.MPESA_TILL ?? "",
    txType,
  };
}

export function isMpesaConfigured(): boolean {
  const c = cfg();
  return Boolean(c.key && c.secret && c.passkey && c.shortcode);
}

/**
 * Normalise a Kenyan number to Safaricom MSISDN form `2547XXXXXXXX` / `2541XXXXXXXX`.
 * Accepts `07…`, `01…`, `7…`, `1…`, `254…`, `+254…`. Returns null if invalid.
 */
export function normalizeMsisdn(input: string): string | null {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (/^(7|1)\d{8}$/.test(d)) d = "254" + d;
  if (!/^254(7|1)\d{8}$/.test(d)) return null;
  return d;
}

function timestamp(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return (
    d.getFullYear().toString() +
    p(d.getMonth() + 1) +
    p(d.getDate()) +
    p(d.getHours()) +
    p(d.getMinutes()) +
    p(d.getSeconds())
  );
}

function password(shortcode: string, passkey: string, ts: string): string {
  return Buffer.from(`${shortcode}${passkey}${ts}`).toString("base64");
}

async function accessToken(): Promise<string> {
  const c = cfg();
  const creds = Buffer.from(`${c.key}:${c.secret}`).toString("base64");
  const res = await fetch(`${baseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`M-Pesa auth failed (${res.status}): ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("M-Pesa auth: no access_token in response");
  return json.access_token;
}

export interface StkPushParams {
  amount: number; // whole KES
  phone: string; // normalised 2547…
  accountRef: string; // ≤12 chars shown on the customer's statement
  description: string;
  callbackUrl: string;
}

export interface StkPushResult {
  ok: boolean;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  error?: string;
}

/** Trigger an STK push (the PIN prompt on the customer's phone). */
export async function stkPush(params: StkPushParams): Promise<StkPushResult> {
  const c = cfg();
  const token = await accessToken();
  const ts = timestamp();
  const buyGoods = c.txType === "CustomerBuyGoodsOnline";
  const partyB = buyGoods ? c.till || c.shortcode : c.shortcode;

  const res = await fetch(`${baseUrl()}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: c.shortcode,
      Password: password(c.shortcode, c.passkey, ts),
      Timestamp: ts,
      TransactionType: c.txType,
      Amount: Math.max(1, Math.round(params.amount)),
      PartyA: params.phone,
      PartyB: partyB,
      PhoneNumber: params.phone,
      CallBackURL: params.callbackUrl,
      AccountReference: params.accountRef.slice(0, 12),
      TransactionDesc: (params.description || "Payment").slice(0, 20),
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    CheckoutRequestID?: string;
    MerchantRequestID?: string;
    ResponseCode?: string;
    errorMessage?: string;
    ResponseDescription?: string;
  };

  if (!res.ok || json.ResponseCode !== "0" || !json.CheckoutRequestID) {
    return {
      ok: false,
      error: json.errorMessage || json.ResponseDescription || `STK push failed (${res.status})`,
    };
  }
  return {
    ok: true,
    checkoutRequestId: json.CheckoutRequestID,
    merchantRequestId: json.MerchantRequestID,
  };
}

export interface StkQueryResult {
  /** Daraja returned a terminal (settled) state. */
  settled: boolean;
  success: boolean;
  resultCode?: string;
  resultDesc?: string;
  /** Still awaiting the customer (not settled). */
  pending?: boolean;
  error?: string;
}

/**
 * Authoritative status check — asks Daraja directly. Used as the source of truth
 * when polling, so confirmation works even if the async callback never lands.
 */
export async function stkQuery(checkoutRequestId: string): Promise<StkQueryResult> {
  const c = cfg();
  const token = await accessToken();
  const ts = timestamp();

  const res = await fetch(`${baseUrl()}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      BusinessShortCode: c.shortcode,
      Password: password(c.shortcode, c.passkey, ts),
      Timestamp: ts,
      CheckoutRequestID: checkoutRequestId,
    }),
    cache: "no-store",
  });

  const json = (await res.json().catch(() => ({}))) as {
    ResultCode?: string | number;
    ResultDesc?: string;
    errorCode?: string;
    errorMessage?: string;
  };

  if (json.ResultCode != null) {
    const code = String(json.ResultCode);
    return { settled: true, success: code === "0", resultCode: code, resultDesc: json.ResultDesc };
  }

  // No ResultCode yet → Daraja is still processing (commonly errorCode 500.001.1001).
  if (json.errorMessage) {
    const processing =
      (json.errorCode ?? "").includes("500.001.1001") || /processed|processing/i.test(json.errorMessage);
    if (processing) return { settled: false, success: false, pending: true };
    return { settled: false, success: false, error: json.errorMessage };
  }
  return { settled: false, success: false, pending: true };
}
