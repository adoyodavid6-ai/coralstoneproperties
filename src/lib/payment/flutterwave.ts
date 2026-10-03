// Server-only — never import from client components or "use client" files.

const FLW_API = "https://api.flutterwave.com/v3";

function secretKey(): string {
  return process.env.FLW_SECRET_KEY ?? "";
}

export function isFlutterwaveConfigured(): boolean {
  return secretKey().length > 0;
}

export interface FlwPaymentParams {
  txRef: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  redirectUrl: string;
  description: string;
  meta?: Record<string, unknown>;
}

export async function initPayment(params: FlwPaymentParams): Promise<string> {
  const key = secretKey();
  if (!key) throw new Error("FLW_SECRET_KEY is not configured");

  const res = await fetch(`${FLW_API}/payments`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tx_ref: params.txRef,
      amount: params.amount,
      currency: params.currency,
      redirect_url: params.redirectUrl,
      customer: {
        email: params.customerEmail,
        name: params.customerName,
      },
      customizations: {
        title: "CoralStone Properties",
        description: params.description,
      },
      meta: params.meta,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Flutterwave init failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as { status: string; data?: { link?: string }; message?: string };
  if (json.status !== "success" || !json.data?.link) {
    throw new Error(`Flutterwave: ${json.message ?? "unexpected response"}`);
  }

  return json.data.link;
}

export interface FlwVerifyResult {
  verified: boolean;
  status: string;
  amount: number;
  currency: string;
  txRef: string;
  flwRef: string;
}

export async function verifyPayment(transactionId: string): Promise<FlwVerifyResult> {
  const key = secretKey();
  if (!key) throw new Error("FLW_SECRET_KEY is not configured");

  const res = await fetch(`${FLW_API}/transactions/${transactionId}/verify`, {
    headers: { Authorization: `Bearer ${key}` },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Flutterwave verify failed (${res.status}): ${body}`);
  }

  const json = (await res.json()) as {
    status: string;
    data?: { status: string; amount: number; currency: string; tx_ref: string; flw_ref: string };
  };
  const data = json.data;

  return {
    verified: json.status === "success" && data?.status === "successful",
    status: data?.status ?? "unknown",
    amount: data?.amount ?? 0,
    currency: data?.currency ?? "",
    txRef: data?.tx_ref ?? "",
    flwRef: data?.flw_ref ?? "",
  };
}
