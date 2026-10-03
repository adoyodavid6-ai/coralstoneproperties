"use client";

import { COOKIE_CONSENT_KEY } from "./CookieConsent";

/**
 * "Change cookie preferences" control for the Data Protection page. Clears the
 * stored consent and reloads so the consent banner reappears — giving visitors
 * a real way to withdraw or change analytics consent (Kenya DPA 2019).
 */
export function CookieSettingsButton() {
  const reset = () => {
    try {
      localStorage.removeItem(COOKIE_CONSENT_KEY);
    } catch {
      /* ignore storage errors (e.g. private mode) */
    }
    location.reload();
  };

  return (
    <button
      type="button"
      onClick={reset}
      className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
    >
      Change cookie preferences
    </button>
  );
}
