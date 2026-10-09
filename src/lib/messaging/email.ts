import "server-only";
import { renderEmail, sendEmail, esc } from "@/lib/email/resend";
import { SITE_URL } from "@/lib/site";

/**
 * Notify a thread participant that a new message is waiting. Deliberately
 * CONTENT-FREE: no message body, no counterpart name/email/phone — just a nudge
 * and a link back into the on-platform thread. Keeps the conversation (and any
 * PII) on CoralStones. No-ops when Resend isn't configured (sendEmail → null).
 */
export async function sendNewMessageEmail(opts: {
  to: string;
  propertyTitle: string;
  threadPath: string; // e.g. "/account/messages/<id>" or "/host/messages/<id>"
}): Promise<void> {
  if (!opts.to) return;
  const href = `${SITE_URL}${opts.threadPath}`;
  const html = renderEmail({
    heading: "You have a new message",
    bodyHtml: `<p>There's a new message about <strong>${esc(opts.propertyTitle)}</strong> on CoralStones.</p>
      <p>For your security we keep conversations on-platform — open the thread to read and reply.</p>`,
    cta: { label: "Open conversation", href },
    footerHtml: "You're receiving this because you have an active conversation on CoralStones Properties.",
  });
  await sendEmail({ to: opts.to, subject: `New message · ${opts.propertyTitle}`, html });
}
