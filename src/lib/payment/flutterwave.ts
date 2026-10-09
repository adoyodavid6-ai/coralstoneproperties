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
        title: "CoralStones Properties",
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

// ---------------------------------------------------------------------------
// Transfers (payouts) — used to disburse a held booking to a host BANK account.
// (M-Pesa payouts go via Daraja B2C in mpesaB2C.ts.) Uses the same FLW_SECRET_KEY.
// ---------------------------------------------------------------------------

export interface FlwTransferParams {
  accountBank: string; // bank code, e.g. "044"
  accountNumber: string;
  amount: number;
  currency: string; // e.g. "KES"
  narration: string;
  reference: string; // our idempotent payout reference
  beneficiaryName?: string;
}

export interface FlwTransferResult {
  ok: boolean;
  transferId?: string; // FLW transfer id (for reconciliation)
  status?: string; // NEW | PENDING | SUCCESSFUL | FAILED
  error?: string;
}

export async function initTransfer(params: FlwTransferParams): Promise<FlwTransferResult> {
  const key = secretKey();
  if (!key) return { ok: false, error: "FLW_SECRET_KEY is not configured." };
  try {
    const res = await fetch(`${FLW_API}/transfers`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        account_bank: params.accountBank,
        account_number: params.accountNumber,
        amount: Math.round(params.amount),
        currency: params.currency,
        narration: params.narration.slice(0, 100),
        reference: params.reference,
        beneficiary_name: params.beneficiaryName,
      }),
    });
    const json = (await res.json().catch(() => ({}))) as {
      status?: string;
      message?: string;
      data?: { id?: number | string; status?: string };
    };
    if (!res.ok || json.status !== "success") {
      return { ok: false, error: json.message ?? `Transfer failed (${res.status})` };
    }
    return { ok: true, transferId: json.data?.id != null ? String(json.data.id) : undefined, status: json.data?.status };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Transfer request failed." };
  }
}

export async function getTransfer(transferId: string): Promise<{ status: string } | null> {
  const key = secretKey();
  if (!key) return null;
  const res = await fetch(`${FLW_API}/transfers/${transferId}`, {
    headers: { Authorization: `Bearer ${key}` },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { status?: string } };
  return { status: json.data?.status ?? "unknown" };
}

/** Refund a collected card/mobile-money charge (guest cancellation path). */
export async function refundTransaction(
  transactionId: string,
  amount?: number,
): Promise<{ ok: boolean; error?: string }> {
  const key = secretKey();
  if (!key) return { ok: false, error: "FLW_SECRET_KEY is not configured." };
  try {
    const res = await fetch(`${FLW_API}/transactions/${transactionId}/refund`, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify(amount ? { amount: Math.round(amount) } : {}),
    });
    const json = (await res.json().catch(() => ({}))) as { status?: string; message?: string };
    if (!res.ok || json.status !== "success") {
      return { ok: false, error: json.message ?? `Refund failed (${res.status})` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Refund request failed." };
  }
}
