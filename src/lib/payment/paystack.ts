// Server-only — Paystack client for CoralStones-collected income (owner
// verification fees, commissions). NEVER import from client components.
//
// Config (Vercel → Settings → Environment Variables):
//   PAYSTACK_SECRET_KEY            from the Paystack dashboard (sk_...)
//   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY optional (pk_..., inline flows)
//
// Amounts are passed in major units (KES) and converted to the subunit here.

const PAYSTACK_API = "https://api.paystack.co";

function secretKey(): string {
  return process.env.PAYSTACK_SECRET_KEY ?? "";
}

export function isPaystackConfigured(): boolean {
  return secretKey().length > 0;
}

export interface PaystackInitParams {
  email: string;
  amount: number; // major units (e.g. whole KES)
  currency?: string; // default KES
  reference: string;
  callbackUrl: string;
  metadata?: Record<string, unknown>;
}

/** Initialise a transaction; returns the hosted checkout URL to redirect to. */
export async function initPayment(params: PaystackInitParams): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");

  const res = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    cache: "no-store",
    body: JSON.stringify({
      email: params.email,
      amount: Math.round(params.amount * 100), // subunit (cents)
      currency: params.currency ?? "KES",
      reference: params.reference,
      callback_url: params.callbackUrl,
      metadata: params.metadata,
    }),
  });
  const json = (await res.json().catch(() => ({}))) as {
    status?: boolean;
    message?: string;
    data?: { authorization_url?: string };
  };
  if (!res.ok || !json.status || !json.data?.authorization_url) {
    throw new Error(`Paystack init failed (${res.status}): ${json.message ?? ""}`);
  }
  return json.data.authorization_url;
}

export interface PaystackVerifyResult {
  verified: boolean;
  status: string;
  amount: number; // major units
  currency: string;
  reference: string;
}

export async function verifyPayment(reference: string): Promise<PaystackVerifyResult> {
  const key = secretKey();
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not configured");

  const res = await fetch(`${PAYSTACK_API}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Paystack verify failed (${res.status}): ${await res.text().catch(() => "")}`);
  }
  const json = (await res.json()) as {
    status?: boolean;
    data?: { status?: string; amount?: number; currency?: string; reference?: string };
  };
  const data = json.data;
  return {
    verified: json.status === true && data?.status === "success",
    status: data?.status ?? "unknown",
    amount: (data?.amount ?? 0) / 100,
    currency: data?.currency ?? "",
    reference: data?.reference ?? reference,
  };
}
