/**
 * PII scrubbing for on-platform messages.
 *
 * The whole point of in-app threads is that buyer and owner talk WITHOUT a
 * direct back-channel. So before any message body is stored we strip the things
 * people use to take the conversation off-platform: phone numbers, emails, and
 * the obvious "find me on WhatsApp/Telegram" handles. Replaced with a marker so
 * the recipient sees that something was removed rather than silently losing it.
 *
 * Pure + server-safe (no imports) so it can be unit-tested and reused anywhere.
 */

const MARKER = "[contact removed — please keep messages on CoralStones]";

// Email addresses.
const EMAIL = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
// Phone-ish runs: optional +, then 7+ digits possibly broken by spaces / - ( ).
const PHONE = /\+?\d[\d\s().-]{6,}\d/g;
// "whatsapp 0712..." / "telegram: @handle" style nudges (the number/handle is
// usually caught by PHONE too, but this strips the lead-in word + handle).
const OFF_PLATFORM = /\b(whats\s?app|telegram|signal|viber|insta(?:gram)?|snap(?:chat)?)\b[:\s]*@?[\w.]*/gi;

/** Scrub PII from a message body. Returns `{ clean, changed }`. */
export function scrubPII(input: string): { clean: string; changed: boolean } {
  const clean = input
    .replace(EMAIL, MARKER)
    .replace(OFF_PLATFORM, MARKER)
    .replace(PHONE, MARKER)
    // collapse repeated markers if several patterns hit adjacent text
    .replace(new RegExp(`(?:${MARKER.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*){2,}`, "g"), `${MARKER} `)
    .trim();
  return { clean, changed: clean !== input.trim() };
}

/** First name / token only — never surface a full name to the counterpart. */
export function firstNameOnly(name: string | null | undefined): string {
  const n = (name ?? "").trim().split(/\s+/)[0];
  return n || "";
}
