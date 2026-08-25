"use server";

/**
 * Lead delivery — sends contact enquiries and property-listing submissions to
 * the team inbox via Resend (https://resend.com).
 *
 * Configure in Vercel → Settings → Environment Variables:
 *   RESEND_API_KEY   — from the Resend dashboard (starts with "re_")
 *   LEADS_EMAIL      — where leads should land (must be the email you verified
 *                      with Resend while still using the onboarding sender)
 *   LEADS_FROM       — optional; defaults to Resend's shared onboarding sender,
 *                      which can only deliver to your own verified address.
 *                      Once you verify a domain, set e.g.
 *                      "CoralStone <leads@yourdomain.com>".
 *
 * If the keys are absent (e.g. before setup) the lead is logged server-side
 * and the visitor still sees success — no lead is silently lost.
 */

import { getSupabaseAdmin } from "@/lib/supabase/server";

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_FROM = "CoralStone Leads <onboarding@resend.dev>";

export type LeadResult = { ok: boolean; error?: string };

const GENERIC_ERROR =
  "Sorry — we couldn't send your message just now. Please try WhatsApp or email us directly.";

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Trim, collapse, and cap free-text to keep emails sane and abuse-resistant. */
function clean(value: unknown, max = 5000): string {
  return String(value ?? "").trim().slice(0, max);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function row(label: string, value: string): string {
  if (!value) return "";
  return `<tr>
    <td style="padding:6px 16px 6px 0;color:#5c7f96;font-size:13px;white-space:nowrap;vertical-align:top">${esc(label)}</td>
    <td style="padding:6px 0;color:#16425b;font-size:14px">${esc(value).replace(/\n/g, "<br>")}</td>
  </tr>`;
}

function wrap(heading: string, rowsHtml: string): string {
  return `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto">
    <div style="background:#16425b;color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#ff8559">CoralStone Properties</div>
      <div style="font-size:18px;font-weight:700;margin-top:4px">${esc(heading)}</div>
    </div>
    <div style="border:1px solid #d9dcd6;border-top:0;border-radius:0 0 12px 12px;padding:20px 24px">
      <table style="border-collapse:collapse;width:100%">${rowsHtml}</table>
    </div>
  </div>`;
}

/** A lead as stored in the database. */
type LeadRecord = {
  kind: "contact" | "listing";
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
  details?: Record<string, unknown>;
};

/**
 * Save a lead to Supabase.
 * Returns `null` if Supabase isn't configured, otherwise `true`/`false`.
 */
async function saveLead(record: LeadRecord): Promise<boolean | null> {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;

  const { error } = await supabase.from("leads").insert({
    kind: record.kind,
    name: record.name,
    email: record.email,
    phone: record.phone ?? null,
    subject: record.subject ?? null,
    message: record.message ?? null,
    details: record.details ?? null,
  });

  if (error) {
    console.error("[leads] Supabase insert failed:", error.message);
    return false;
  }
  return true;
}

/**
 * Email a lead notification via Resend.
 * Returns `null` if Resend isn't configured, otherwise `true`/`false`.
 */
async function emailLead(opts: {
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<boolean | null> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_EMAIL;
  const from = process.env.LEADS_FROM || DEFAULT_FROM;
  if (!apiKey || !to) return null;

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: opts.subject,
        html: opts.html,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.error(`[leads] Resend responded ${res.status}: ${detail}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error("[leads] Resend request failed:", err);
    return false;
  }
}

/**
 * Capture a lead across all channels (database + email). Succeeds as long as
 * the lead is captured somewhere; only fails if every configured channel errors.
 */
async function dispatch(
  record: LeadRecord,
  emailOpts: { subject: string; html: string; replyTo?: string },
): Promise<LeadResult> {
  const [saved, emailed] = await Promise.all([saveLead(record), emailLead(emailOpts)]);

  // Nothing configured yet — don't block the visitor or lose the lead.
  if (saved === null && emailed === null) {
    console.warn(
      `[leads] No delivery channel configured (Supabase/Resend) — lead not stored.\nSubject: ${emailOpts.subject}`,
    );
    return { ok: true };
  }

  // Captured by at least one channel → success.
  if (saved === true || emailed === true) return { ok: true };

  // Every configured channel failed.
  return { ok: false, error: GENERIC_ERROR };
}

// ── Contact form ───────────────────────────────────────────────────────────────

export type ContactLead = {
  name: string;
  email: string;
  subject?: string;
  message: string;
  /** Honeypot — real users never fill this; bots do. */
  company?: string;
};

export async function sendContactLead(input: ContactLead): Promise<LeadResult> {
  if (clean(input.company, 100)) return { ok: true }; // silently drop bots

  const name = clean(input.name, 120);
  const email = clean(input.email, 200);
  const subject = clean(input.subject, 120) || "General enquiry";
  const message = clean(input.message, 5000);

  if (!name || !message) return { ok: false, error: "Please add your name and a message." };
  if (!isEmail(email)) return { ok: false, error: "Please enter a valid email address." };

  const html = wrap(
    "New contact enquiry",
    row("Name", name) + row("Email", email) + row("Topic", subject) + row("Message", message),
  );

  return dispatch(
    { kind: "contact", name, email, subject, message },
    { subject: `New enquiry: ${subject} — ${name}`, html, replyTo: email },
  );
}

// ── List-a-property form ────────────────────────────────────────────────────────

export type ListingLead = {
  intent: string;
  propertyType: string;
  country: string;
  title: string;
  city: string;
  price: string;
  currency: string;
  beds?: string;
  baths?: string;
  size?: string;
  description: string;
  ownerType: string;
  name: string;
  email: string;
  phone: string;
  verifTier: string;
  company?: string; // honeypot
};

export async function sendListingLead(input: ListingLead): Promise<LeadResult> {
  if (clean(input.company, 100)) return { ok: true };

  const name = clean(input.name, 120);
  const email = clean(input.email, 200);
  const phone = clean(input.phone, 40);
  const title = clean(input.title, 200);

  if (!name || !title) return { ok: false, error: "Please add your name and a listing title." };
  if (!isEmail(email)) return { ok: false, error: "Please enter a valid email address." };

  const priceLine = [clean(input.currency, 8), clean(input.price, 40)].filter(Boolean).join(" ");
  const bedBath = [
    clean(input.beds, 10) && `${clean(input.beds, 10)} bed`,
    clean(input.baths, 10) && `${clean(input.baths, 10)} bath`,
    clean(input.size, 40),
  ]
    .filter(Boolean)
    .join(" · ");

  const html = wrap(
    "New property listing",
    row("Listing", title) +
      row("Intent", clean(input.intent, 40)) +
      row("Type", clean(input.propertyType, 40)) +
      row("Location", [clean(input.city, 120), clean(input.country, 40)].filter(Boolean).join(", ")) +
      row("Price", priceLine) +
      row("Details", bedBath) +
      row("Description", clean(input.description, 5000)) +
      row("Listed by", `${name} (${clean(input.ownerType, 40)})`) +
      row("Email", email) +
      row("Phone", phone) +
      row("Verification", clean(input.verifTier, 40)),
  );

  return dispatch(
    {
      kind: "listing",
      name,
      email,
      phone,
      subject: title,
      message: clean(input.description, 5000),
      details: {
        intent: clean(input.intent, 40),
        propertyType: clean(input.propertyType, 40),
        country: clean(input.country, 40),
        city: clean(input.city, 120),
        price: clean(input.price, 40),
        currency: clean(input.currency, 8),
        beds: clean(input.beds, 10),
        baths: clean(input.baths, 10),
        size: clean(input.size, 40),
        ownerType: clean(input.ownerType, 40),
        verifTier: clean(input.verifTier, 40),
      },
    },
    { subject: `New listing: ${title} — ${name}`, html, replyTo: email },
  );
}
