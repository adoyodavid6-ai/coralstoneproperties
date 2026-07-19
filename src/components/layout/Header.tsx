"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALES } from "@/lib/i18n/dictionaries";
import type { DisplayCurrency } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Globe, Chevron, Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// "Local" shows each listing in its own East African currency; USD/GBP convert for the diaspora.
const CURRENCIES: { value: DisplayCurrency; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
];

export function Header() {
  const { t, locale, setLocale, currency, setCurrency } = useLocale();
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // The admin console runs its own chrome — hide the public header there.
  if (pathname?.startsWith("/admin")) return null;

  const nav = [
    { key: "nav.buy", href: "/search?intent=sale" },
    { key: "nav.rent", href: "/search?intent=rent" },
    { key: "nav.land", href: "/search?type=land" },
    { key: "nav.commercial", href: "/search?type=commercial" },
    { key: "nav.offplan", href: "/search?type=off_plan" },
    { key: "nav.shortlet", href: "/search?intent=short_let" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-header/95 backdrop-blur-md">
      {/* Fading white hairline along the header's bottom edge */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
        }}
      />
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Logo variant="full-dark" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Property categories">
          {nav.map((n) => (
            <Link
              key={n.key}
              href={n.href}
              className="relative px-3 py-2 text-sm font-medium text-white/85 transition-colors after:absolute after:inset-x-3 after:bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-rose after:transition-transform after:duration-300 after:ease-out hover:text-white hover:after:scale-x-100"
            >
              {t(n.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Currency toggle (diaspora) */}
          <div className="hidden items-center rounded-full border border-line-strong bg-surface-raised p-0.5 sm:flex">
            {CURRENCIES.map((c) => (
              <button
                key={c.value}
                onClick={() => setCurrency(c.value)}
                aria-pressed={currency === c.value}
                className={cn(
                  "figure rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                  currency === c.value ? "bg-ink-black text-white" : "text-ink-soft hover:text-primary",
                )}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLocale(locale === "en" ? "sw" : "en")}
            className="hidden items-center gap-1.5 rounded-full border border-line-strong bg-surface-raised px-3 py-1.5 text-sm font-medium text-primary hover:border-accent hover:text-accent sm:inline-flex"
            aria-label="Switch language"
          >
            <Globe className="h-4 w-4" />
            {LOCALES.find((l) => l.code === locale)?.short}
          </button>

          {/* white fill reads best on the brand-bright band */}
          <ButtonLink href="/search" variant="inverse" size="sm" className="hidden md:inline-flex">
            {t("nav.list")}
          </ButtonLink>

          <button
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/25 text-white lg:hidden"
            aria-label="Menu"
            aria-expanded={open}
          >
            {open ? <Close className="h-5 w-5" /> : <Chevron className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-line bg-surface-raised lg:hidden">
          <nav className="container-page grid gap-1 py-3" aria-label="Mobile navigation">
            {nav.map((n) => (
              <Link
                key={n.key}
                href={n.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-base font-medium text-primary hover:bg-accent-soft"
              >
                {t(n.key)}
              </Link>
            ))}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-line pt-3">
              <div className="flex items-center rounded-full border border-line-strong p-0.5">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCurrency(c.value)}
                    className={cn(
                      "figure rounded-full px-3 py-1.5 text-sm",
                      currency === c.value ? "bg-ink-black text-white" : "text-ink-soft",
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setLocale(locale === "en" ? "sw" : "en")}
                className="inline-flex items-center gap-1.5 rounded-full border border-line-strong px-4 py-1.5 text-sm font-medium text-primary"
              >
                <Globe className="h-4 w-4" />
                {LOCALES.find((l) => l.code === locale)?.label}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
