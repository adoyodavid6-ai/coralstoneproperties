/**
 * Client-safe Kenyan MSISDN normaliser → `2547XXXXXXXX` / `2541XXXXXXXX`,
 * or null if invalid. Mirrors the server-side check in `mpesa.ts` (which can't
 * be imported into client components — it pulls in server-only code).
 */
export function normalizePhone(input: string): string | null {
  let d = String(input ?? "").replace(/\D/g, "");
  if (d.startsWith("0")) d = "254" + d.slice(1);
  else if (/^(7|1)\d{8}$/.test(d)) d = "254" + d;
  return /^254(7|1)\d{8}$/.test(d) ? d : null;
}
