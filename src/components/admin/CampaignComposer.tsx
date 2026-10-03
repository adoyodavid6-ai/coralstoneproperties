"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendCampaign } from "@/lib/subscribers/actions";
import { Field, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

/**
 * Compose + broadcast an email to all confirmed subscribers. On success the
 * router refreshes so the new row appears in the campaign history below.
 */
export function CampaignComposer({
  audience,
  resendReady,
}: {
  audience: number;
  resendReady: boolean;
}) {
  const router = useRouter();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  const disabled = status === "sending" || audience === 0 || !resendReady;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    if (!confirm(`Send "${subject}" to ${audience} confirmed subscriber${audience === 1 ? "" : "s"}?`)) {
      return;
    }
    setStatus("sending");
    setMessage("");

    const res = await sendCampaign({ subject, body });

    if (res.ok) {
      setStatus("done");
      setSubject("");
      setBody("");
      setMessage(
        `Sent to ${res.sent} subscriber${res.sent === 1 ? "" : "s"}` +
          (res.failed ? ` (${res.failed} failed)` : "") +
          ".",
      );
      router.refresh();
    } else {
      setStatus("error");
      setMessage(res.error ?? "Send failed.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!resendReady && (
        <p className="rounded-xl bg-warning-soft px-4 py-3 text-sm text-warning">
          Email sending isn&apos;t configured yet. Set <code>RESEND_API_KEY</code> (and verify a sending domain)
          to broadcast.
        </p>
      )}

      <Field label="Subject">
        <input
          className={inputClass}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="New verified listings in Nairobi this week"
          maxLength={200}
        />
      </Field>

      <Field label="Message">
        <textarea
          className={cn(inputClass, "min-h-44 resize-y")}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"Write your update here.\n\nLeave a blank line between paragraphs."}
          maxLength={20000}
        />
      </Field>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={disabled}
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-ink-black transition-colors hover:brightness-95 disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : `Send to ${audience} confirmed`}
        </button>
        {message && (
          <span
            className={cn("text-sm", status === "error" ? "text-danger" : "text-verified")}
            role="status"
          >
            {message}
          </span>
        )}
      </div>
      <p className="text-xs text-ink-soft">
        An unsubscribe link is added to every email automatically. Plain text — leave a blank line between
        paragraphs.
      </p>
    </form>
  );
}
