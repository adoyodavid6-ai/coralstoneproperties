/**
 * Thin Resend transport + a branded HTML wrapper, shared by the subscriber
 * funnel (confirmation mails + campaign broadcasts).
 *
 * Server-only — imported exclusively from "use server" actions and async
 * server components. Returns `null` from the senders when Resend isn't
 * configured, so callers can degrade gracefully (mirrors src/lib/leads).
 *
 * Config (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY   from the Resend dashboard (starts with "re_")
 *   LEADS_FROM       optional sender; defaults to Resend's shared onboarding
 *                    address, which can only deliver to your own verified
 *                    inbox. Once you verify a domain, set e.g.
 *                    "CoralStone <hello@yourdomain.com>".
 */

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const RESEND_BATCH_ENDPOINT = "https://api.resend.com/emails/batch";
const DEFAULT_FROM = "CoralStone <onboarding@resend.dev>";

/** Resend caps a single batch send at 100 messages. */
export const BATCH_LIMIT = 100;

export function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

export function brandFrom(): string {
  return process.env.LEADS_FROM || DEFAULT_FROM;
}

export function esc(value: string): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap body HTML in the CoralStone email shell (matches the lead-notification
 * styling). `cta` renders a button; `footerHtml` holds raw, pre-escaped markup
 * such as the unsubscribe line.
 */
export function renderEmail(opts: {
  heading: string;
  bodyHtml: string;
  cta?: { label: string; href: string };
  footerHtml?: string;
}): string {
  const button = opts.cta
    ? `<div style="margin:24px 0 8px">
         <a href="${esc(opts.cta.href)}" style="display:inline-block;background:#ff8559;color:#16425b;font-weight:700;font-size:15px;text-decoration:none;padding:12px 24px;border-radius:10px">${esc(opts.cta.label)}</a>
       </div>`
    : "";

  const footer = opts.footerHtml
    ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid #d9dcd6;color:#5c7f96;font-size:12px;line-height:1.6">${opts.footerHtml}</div>`
    : "";

  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#16425b;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff8559">CoralStone Properties</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px">${esc(opts.heading)}</div>
    </div>
    <div style="border:1px solid #d9dcd6;border-top:0;border-radius:0 0 12px 12px;padding:20px 24px;color:#16425b;font-size:14px;line-height:1.7">
      ${opts.bodyHtml}
      ${button}
      ${footer}
    </div>
  </div>`;
}

type Message = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  /** Extra SMTP-ish headers, e.g. List-Unsubscribe. */
  headers?: Record<string, string>;
};

function toPayload(msg: Message) {
  return {
    from: brandFrom(),
    to: Array.isArray(msg.to) ? msg.to : [msg.to],
    subject: msg.subject,
    html: msg.html,
    ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
    ...(msg.headers ? { headers: msg.headers } : {}),
  };
}

/**
 * Send one email. Returns `true`/`false` on success/failure, or `null` when
 * Resend isn't configured.
 */
export async function sendEmail(msg: Message): Promise<boolean | null> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(toPayload(msg)),
    });
    if (!res.ok) {
      console.error(`[email] Resend responded ${res.status}: ${await res.text().catch(() => "")}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] Resend request failed:", err);
    return false;
  }
}

/**
 * Send many personalised emails in batches of up to BATCH_LIMIT. Returns how
 * many were accepted vs. failed. `null` (not configured) counts everything as
 * failed from the caller's perspective, so check isResendConfigured() first.
 */
export async function sendBatch(messages: Message[]): Promise<{ sent: number; failed: number }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || messages.length === 0) return { sent: 0, failed: messages.length };

  let sent = 0;
  let failed = 0;

  for (let i = 0; i < messages.length; i += BATCH_LIMIT) {
    const chunk = messages.slice(i, i + BATCH_LIMIT);
    try {
      const res = await fetch(RESEND_BATCH_ENDPOINT, {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify(chunk.map(toPayload)),
      });
      if (res.ok) {
        sent += chunk.length;
      } else {
        failed += chunk.length;
        console.error(`[email] batch ${res.status}: ${await res.text().catch(() => "")}`);
      }
    } catch (err) {
      failed += chunk.length;
      console.error("[email] batch request failed:", err);
    }
  }

  return { sent, failed };
}
