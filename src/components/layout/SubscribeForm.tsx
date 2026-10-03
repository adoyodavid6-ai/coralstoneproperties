"use client";

import { useState } from "react";
import { subscribe } from "@/lib/subscribers/actions";

/**
 * Compact newsletter signup for the footer. Double opt-in: on success the
 * visitor is told to check their inbox for a confirmation link (handled by the
 * `subscribe` server action). Includes a honeypot field for bot resistance.
 */
export function SubscribeForm() {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setMessage("");

    const res = await subscribe({ email, company, source: "footer" });

    if (res.ok) {
      setStatus("done");
      setEmail("");
      setMessage(
        res.already
          ? "You're already subscribed — thanks!"
          : "Almost there — check your inbox to confirm your subscription.",
      );
    } else {
      setStatus("error");
      setMessage(res.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="w-full">
      {status === "done" ? (
        <p className="rounded-xl bg-white/10 px-4 py-3 text-sm text-white" role="status">
          {message}
        </p>
      ) : (
        <form onSubmit={onSubmit} noValidate>
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="footer-subscribe-email">
              Email address
            </label>
            <input
              id="footer-subscribe-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            {/* Honeypot — visually hidden, ignored by humans. */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="hidden"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="shrink-0 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-ink-black transition-colors hover:brightness-95 disabled:opacity-60"
            >
              {status === "sending" ? "…" : "Subscribe"}
            </button>
          </div>
          {status === "error" && (
            <p className="mt-2 text-xs text-accent" role="alert">
              {message}
            </p>
          )}
          <p className="mt-2 text-xs text-white/50">
            We&apos;ll only email what&apos;s useful. Unsubscribe anytime.
          </p>
        </form>
      )}
    </div>
  );
}
