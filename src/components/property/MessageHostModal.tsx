"use client";

/**
 * "Message host" — the on-platform replacement for the old WhatsApp/Call
 * buttons. Opens a composer that posts the first message through the
 * `messageHost` server action (which creates/reuses the thread). If the visitor
 * isn't signed in, we route them to sign-in with a `next` back to this page.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/lib/types";
import { messageHost } from "@/lib/messaging/actions";
import { Close, CheckShield } from "@/components/ui/icons";

export function MessageHostModal({
  property,
  trigger,
}: {
  property: Property;
  /** Render-prop for the opener button so callers control its styling. */
  trigger: (open: () => void) => React.ReactNode;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState(
    `Hi, I'm interested in "${property.title}". Is it still available?`,
  );
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!body.trim()) {
      setError("Please enter a message.");
      return;
    }
    setStatus("sending");
    setError("");
    const nextPath = typeof window !== "undefined" ? window.location.pathname : `/property/${property.slug}`;
    const res = await messageHost({
      propertyId: property.id,
      propertySlug: property.slug,
      propertyTitle: property.title,
      body,
      nextPath,
    });
    if (res.ok) {
      setThreadId(res.threadId);
      setStatus("done");
    } else if ("needsAuth" in res) {
      router.push(res.signInUrl);
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  return (
    <>
      {trigger(() => setOpen(true))}
      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-primary/50 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-float"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="font-serif text-xl text-primary">Message the host</h3>
              <button
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-primary"
                aria-label="Close"
              >
                <Close className="h-5 w-5" />
              </button>
            </div>

            {status === "done" ? (
              <div className="py-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified-soft text-verified">
                  <CheckShield className="h-8 w-8" />
                </span>
                <p className="mt-4 font-serif text-lg text-primary">Message sent</p>
                <p className="mt-1 text-sm text-ink-soft">
                  We&apos;ve kept this on-platform so everything is traceable. You&apos;ll get replies in your inbox.
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <button
                    onClick={() => router.push(threadId ? `/account/messages/${threadId}` : "/account/messages")}
                    className="rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white"
                  >
                    Go to inbox
                  </button>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-full border border-line-strong px-6 py-2.5 text-sm font-medium text-primary"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form className="mt-4 space-y-3" onSubmit={submit}>
                <textarea
                  rows={4}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
                />
                <p className="text-xs text-ink-soft">
                  Keep messages on CoralStones — phone numbers and emails are removed automatically so your
                  conversation stays safe and traceable.
                </p>
                {error && (
                  <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full rounded-full bg-ink-black py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {status === "sending" ? "Sending…" : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
