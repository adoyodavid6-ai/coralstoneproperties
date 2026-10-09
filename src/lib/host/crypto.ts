import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

/**
 * App-level AES-256-GCM encryption for payout secrets (phone / account number).
 *
 * The 32-byte key is derived (SHA-256) from PAYOUT_ENC_KEY — a non-NEXT_PUBLIC
 * env var that never reaches the browser. Ciphertext format is a single string:
 *   v1:<base64(iv[12] | authTag[16] | ciphertext)>
 * so it stores cleanly in a `text` column and round-trips through supabase-js.
 *
 * Decryption happens ONLY server-side at payout time. Returns null when no key
 * is configured so callers degrade gracefully (demo mode / setup pending).
 */

function key(): Buffer | null {
  const raw = process.env.PAYOUT_ENC_KEY;
  if (!raw) return null;
  // Accept any-length secret; derive a fixed 32-byte key deterministically.
  return createHash("sha256").update(raw, "utf8").digest();
}

export function isPayoutCryptoConfigured(): boolean {
  return Boolean(process.env.PAYOUT_ENC_KEY);
}

export function encryptSecret(plaintext: string): string | null {
  const k = key();
  if (!k) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", k, iv);
  const ct = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${Buffer.concat([iv, tag, ct]).toString("base64")}`;
}

export function decryptSecret(stored: string | null | undefined): string | null {
  const k = key();
  if (!k || !stored || !stored.startsWith("v1:")) return null;
  try {
    const buf = Buffer.from(stored.slice(3), "base64");
    const iv = buf.subarray(0, 12);
    const tag = buf.subarray(12, 28);
    const ct = buf.subarray(28);
    const decipher = createDecipheriv("aes-256-gcm", k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(ct), decipher.final()]).toString("utf8");
  } catch {
    return null;
  }
}
