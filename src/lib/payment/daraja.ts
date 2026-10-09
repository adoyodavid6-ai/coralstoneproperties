import "server-only";

/**
 * Shared Safaricom Daraja helpers (base URL + OAuth token), used by both the
 * STK-push collection path (mpesa.ts keeps its own copy to avoid churn) and the
 * B2C payout path (mpesaB2C.ts). Reads the same MPESA_* credentials.
 */

export type DarajaEnv = "sandbox" | "production";

export function darajaEnv(): DarajaEnv {
  return (process.env.MPESA_ENV ?? "sandbox").toLowerCase() === "production" ? "production" : "sandbox";
}

export function darajaBaseUrl(): string {
  return darajaEnv() === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";
}

export async function darajaAccessToken(): Promise<string> {
  const key = process.env.MPESA_CONSUMER_KEY ?? "";
  const secret = process.env.MPESA_CONSUMER_SECRET ?? "";
  const creds = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch(`${darajaBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${creds}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Daraja auth failed (${res.status}): ${await res.text().catch(() => "")}`);
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) throw new Error("Daraja auth: no access_token in response");
  return json.access_token;
}
