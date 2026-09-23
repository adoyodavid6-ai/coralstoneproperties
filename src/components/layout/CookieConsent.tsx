"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { CheckShield } from "@/components/ui/icons";

/**
 * Cookie consent gate.
 *
 * Vercel Analytics is only mounted once the visitor explicitly accepts, so no
 * analytics cookie/beacon fires before consent — required under the Kenya Data
 * Protection Act 2019 and GDPR (for diaspora visitors). The choice is stored in
 * localStorage so the banner shows once per browser.
 */
const STORAGE_KEY = "coralstone_cookie_consent";
type Consent = "accepted" | "declined";

export function CookieConsent() {
  // undefined = not yet read (SSR + first paint); null = read, no decision made.
  const [consent, setConsent] = useState<Consent | null | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(stored === "accepted" || stored === "declined" ? stored : null);
  }, []);

  const decide = (choice: Consent) => {
    try {
      localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      /* ignore storage errors (e.g. private mode) */
    }
    setConsent(choice);
  };

  return (
    <>
      {/* Analytics only loads after explicit opt-in. */}
      {consent === "accepted" && <Analytics />}

      {consent === null && (
        <div
          role="dialog"
          aria-label="Cookie consent"
          className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-line bg-surface-raised p-5 shadow-float sm:inset-x-4 sm:bottom-4"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
                <CheckShield className="h-4 w-4" />
              </span>
              <p className="text-sm leading-relaxed text-ink-soft">
                We use essential cookies to run the site, plus optional analytics cookies to
                understand how it&apos;s used. You can accept or decline analytics.{" "}
                <Link href="/data-protection" className="font-semibold text-accent hover:brightness-90">
                  Privacy policy
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 gap-2.5">
              <button
                type="button"
                onClick={() => decide("declined")}
                className="rounded-full border border-line-strong bg-surface-raised px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                Decline
              </button>
              <button
                type="button"
                onClick={() => decide("accepted")}
                className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
