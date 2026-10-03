"use server";

/**
 * Subscriber funnel — server actions.
 *
 *  • subscribe()     public double opt-in: stores a 'pending' subscriber and
 *                    emails a confirmation link. No mail is sent to anyone who
 *                    hasn't clicked through, protecting consent + deliverability.
 *  • sendCampaign()  admin-only: broadcasts an email to every CONFIRMED
 *                    subscriber via Resend and records the send in `campaigns`.
 *
 * Both degrade gracefully when Supabase / Resend aren't configured (mirrors
 * src/lib/leads/actions.ts).
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";
import { SITE_URL } from "@/lib/site";
import {
  sendEmail,
  sendBatch,
  renderEmail,
  esc,
  isResendConfigured,
} from "@/lib/email/resend";
import { assertAdmin } from "./service";

const GENERIC_ERROR = "Sorry — something went wrong. Please try again in a moment.";

function clean(value: unknown, max = 5000): string {
  return String(value ?? "").trim().slice(0, max);
}
function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ── Public subscribe (double opt-in) ─────────────────────────────────────────

export type SubscribeResult = {
  ok: boolean;
  /** true when we accepted the signup and a confirmation mail is on its way. */
  pending?: boolean;
  /** true when the address was already confirmed. */
  already?: boolean;
  error?: string;
};

export type SubscribeInput = {
  email: string;
  name?: string;
  source?: string;
  /** Honeypot — real users never fill this; bots do. */
  company?: string;
};

export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  if (clean(input.company, 100)) return { ok: true, pending: true }; // silently drop bots

  const email = clean(input.email, 200).toLowerCase();
  const name = clean(input.name, 120) || null;
  const source = clean(input.source, 40) || "footer";

  if (!isEmail(email)) return { ok: false, error: "Please enter a valid email address." };

  const sb = getSupabaseAdmin();
  if (!sb) {
    // Nothing to persist to — don't block the visitor, but make the gap loud.
    console.warn(`[subscribers] Supabase not configured — signup not stored: ${email}`);
    return { ok: true, pending: true };
  }

  // Look up any existing row for this email.
  const { data: existing } = await sb
    .from("subscribers")
    .select("id,status,token")
    .eq("email", email)
    .maybeSingle();

  if (existing?.status === "confirmed") {
    return { ok: true, already: true };
  }

  // New token each time we (re)issue a confirmation, so stale links can't be
  // reused after an unsubscribe.
  const token = crypto.randomUUID();

  if (existing) {
    const { error } = await sb
      .from("subscribers")
      .update({ status: "pending", token, name, source })
      .eq("id", existing.id);
    if (error) {
      console.error("[subscribers] re-subscribe update failed:", error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
  } else {
    const { error } = await sb
      .from("subscribers")
      .insert({ email, name, source, status: "pending", token });
    if (error) {
      console.error("[subscribers] insert failed:", error.message);
      return { ok: false, error: GENERIC_ERROR };
    }
  }

  // Fire the confirmation email. If Resend isn't set up the row stays pending
  // and an admin can confirm manually; we still report success to the visitor.
  const confirmUrl = `${SITE_URL}/subscribe/confirm?token=${encodeURIComponent(token)}`;
  await sendEmail({
    to: email,
    subject: "Confirm your CoralStones subscription",
    html: renderEmail({
      heading: "One quick step",
      bodyHtml: `<p>Thanks for signing up for CoralStones property updates. Please confirm your email address to start receiving new verified listings and market insight.</p>`,
      cta: { label: "Confirm my subscription", href: confirmUrl },
      footerHtml: `If you didn't request this, you can safely ignore this email — no messages will be sent until you confirm.`,
    }),
  });

  return { ok: true, pending: true };
}

// ── Admin broadcast ───────────────────────────────────────────────────────────

export type SendCampaignResult = {
  ok: boolean;
  sent?: number;
  failed?: number;
  error?: string;
};

export type SendCampaignInput = {
  subject: string;
  /** Plain text; newlines become paragraph breaks. */
  body: string;
};

export async function sendCampaign(input: SendCampaignInput): Promise<SendCampaignResult> {
  await assertAdmin();

  const subject = clean(input.subject, 200);
  const body = clean(input.body, 20000);
  if (!subject || !body) return { ok: false, error: "Add a subject and a message." };

  if (!isResendConfigured()) {
    return { ok: false, error: "Email sending isn't configured yet (set RESEND_API_KEY)." };
  }

  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Database isn't configured." };

  const { data: recipients, error } = await sb
    .from("subscribers")
    .select("email,token")
    .eq("status", "confirmed");
  if (error) {
    console.error("[campaigns] recipient fetch failed:", error.message);
    return { ok: false, error: GENERIC_ERROR };
  }
  if (!recipients || recipients.length === 0) {
    return { ok: false, error: "No confirmed subscribers to send to yet." };
  }

  // Plain-text body → escaped paragraphs.
  const bodyHtml = body
    .split(/\n{2,}/)
    .map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  const messages = recipients.map((r) => {
    const unsubUrl = `${SITE_URL}/unsubscribe?token=${encodeURIComponent(r.token)}`;
    return {
      to: r.email as string,
      subject,
      html: renderEmail({
        heading: subject,
        bodyHtml,
        footerHtml: `You're receiving this because you subscribed to CoralStones updates. <a href="${esc(unsubUrl)}" style="color:#5c7f96">Unsubscribe</a>.`,
      }),
      headers: { "List-Unsubscribe": `<${unsubUrl}>` },
    };
  });

  const { sent, failed } = await sendBatch(messages);

  // Store a representative copy (generic unsubscribe footer) for the history.
  const archiveHtml = renderEmail({
    heading: subject,
    bodyHtml,
    footerHtml: `You're receiving this because you subscribed to CoralStones updates.`,
  });
  await sb.from("campaigns").insert({
    subject,
    body_html: archiveHtml,
    status: failed > 0 && sent === 0 ? "failed" : "sent",
    sent_at: new Date().toISOString(),
    recipient_count: sent,
  });

  if (sent === 0) return { ok: false, error: "Send failed — check the server logs and Resend setup." };
  return { ok: true, sent, failed };
}
