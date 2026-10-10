"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALES } from "@/lib/i18n/dictionaries";
import type { DisplayCurrency } from "@/lib/types";
import { ButtonLink } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Globe, Close, Chevron, User, Check } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const CURRENCIES: { value: DisplayCurrency; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "USD", label: "USD" },
  { value: "GBP", label: "GBP" },
];

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="16" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

type NavChild = { label: string; href: string; comingSoon?: boolean };
type NavItem = { key: string; href: string; children?: NavChild[] };

const NAV: NavItem[] = [
  {
    key: "nav.buy",
    href: "/search?intent=sale",
    children: [
      { label: "🇰🇪 Kenya",    href: "/search?intent=sale&country=Kenya" },
      { label: "🇺🇬 Uganda",   href: "/search?intent=sale&country=Uganda",   comingSoon: true },
      { label: "🇹🇿 Tanzania", href: "/search?intent=sale&country=Tanzania", comingSoon: true },
      { label: "🇷🇼 Rwanda",   href: "/search?intent=sale&country=Rwanda",   comingSoon: true },
    ],
  },
  {
    key: "nav.rent",
    href: "/search?intent=rent",
    children: [
      { label: "Apartments",          href: "/search?intent=rent&type=apartment" },
      { label: "Houses & Villas",     href: "/search?intent=rent&type=house" },
      { label: "Serviced Residences", href: "/search?intent=rent" },
      { label: "Commercial",          href: "/search?intent=rent&type=commercial" },
    ],
  },
  {
    key: "nav.land",
    href: "/search?type=land",
    children: [
      { label: "Residential Plots",  href: "/search?type=land" },
      { label: "Agricultural Land",  href: "/search?type=land" },
      { label: "Commercial Land",    href: "/search?type=land" },
      { label: "Beach & Lake Plots", href: "/search?type=land" },
    ],
  },
  {
    key: "nav.commercial",
    href: "/search?type=commercial",
    children: [
      { label: "Office Spaces",        href: "/search?type=commercial" },
      { label: "Retail & Showrooms",   href: "/search?type=commercial" },
      { label: "Warehouses & Go-Downs",href: "/search?type=commercial" },
      { label: "Mixed-Use Buildings",  href: "/search?type=commercial" },
    ],
  },
  {
    key: "nav.offplan",
    href: "/search?type=off_plan",
    children: [
      { label: "Apartments",         href: "/search?type=off_plan" },
      { label: "Gated Communities",  href: "/search?type=off_plan" },
      { label: "Mixed Developments", href: "/search?type=off_plan" },
      { label: "Student Housing",    href: "/search?type=off_plan" },
    ],
  },
  {
    key: "nav.shortlet",
    href: "/search?intent=short_let",
    children: [
      { label: "Event Spaces",          href: "/search?intent=short_let&type=venue" },
      { label: "Airbnb-Style Apartments", href: "/search?intent=short_let&type=apartment" },
      { label: "Weekend Villas",        href: "/search?intent=short_let&type=house" },
      { label: "Serviced Suites",       href: "/search?intent=short_let" },
      { label: "Beachfront Cottages",   href: "/search?intent=short_let" },
    ],
  },
];

export function Header() {
  const { t, locale, setLocale, currency, setCurrency } = useLocale();
  const [open, setOpen]         = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState<string | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currencyRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close the currency menu on an outside click or Escape (click-to-open, so it
  // stays put while you pick — no finicky hover timing).
  useEffect(() => {
    if (!currencyOpen) return;
    const onDown = (e: MouseEvent) => {
      if (currencyRef.current && !currencyRef.current.contains(e.target as Node)) {
        setCurrencyOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCurrencyOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [currencyOpen]);

  if (pathname?.startsWith("/admin")) return null;

  const activeCurrency =
    CURRENCIES.find((c) => c.value === currency)?.label ?? "Local";

  function openNav(key: string) {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveNav(key);
  }

  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveNav(null), 180);
  }

  return (
    <header className="sticky top-0 z-40 bg-header/95 backdrop-blur-lg">
      {/* White fading hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 25%, rgba(255,255,255,0.35) 75%, transparent 100%)",
        }}
      />

      {/* Sub-header (top utility bar) — desktop only; mobile keeps these in the menu */}
      <div className="relative hidden bg-[#1f3b43] lg:block">
        {/* White fading hairline between sub-header and main header */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.3) 75%, transparent 100%)",
          }}
        />
        <div className="container-page flex h-9 items-center justify-end gap-4">
          {/* Currency dropdown */}
          <div ref={currencyRef} className="relative">
            <button
              type="button"
              onClick={() => setCurrencyOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={currencyOpen}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white/70 transition-colors hover:text-white"
            >
              Currency
              <span aria-hidden className="text-white/30">·</span>
              <span className="figure text-rose">{activeCurrency}</span>
              <Chevron
                className={cn(
                  "h-3 w-3 opacity-50 transition-transform duration-200",
                  currencyOpen && "rotate-180",
                )}
              />
            </button>

            {currencyOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1.5 w-36 overflow-hidden rounded-xl border border-line bg-surface-raised shadow-float animate-rise"
              >
                <ul className="py-1.5">
                  {CURRENCIES.map((c) => (
                    <li key={c.value}>
                      <button
                        type="button"
                        role="menuitemradio"
                        aria-checked={currency === c.value}
                        onClick={() => {
                          setCurrency(c.value);
                          setCurrencyOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center justify-between gap-2 px-4 py-2 text-sm transition-colors",
                          currency === c.value
                            ? "font-semibold text-accent"
                            : "text-ink-soft hover:bg-accent-soft hover:text-accent",
                        )}
                      >
                        {c.label}
                        {currency === c.value && <Check className="h-3.5 w-3.5" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Language */}
          <button
            onClick={() => setLocale(locale === "en" ? "sw" : "en")}
            aria-label="Switch language"
            className="inline-flex items-center gap-1 text-xs font-semibold text-white/50 transition-colors hover:text-white/85"
          >
            <Globe className="h-3.5 w-3.5" />
            {LOCALES.find((l) => l.code === locale)?.short}
          </button>

          <span aria-hidden className="h-3.5 w-px bg-white/15" />

          <Link
            href="/account"
            className="-ml-[0.2cm] inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <User className="h-4 w-4" />
            Account
          </Link>
        </div>
      </div>

      <div className="container-page flex h-16 items-center gap-6">
        <Logo variant="full-dark" />

        {/* Desktop nav */}
        <nav
          className="hidden flex-1 items-center justify-center gap-0.5 lg:flex"
          aria-label="Property categories"
        >
          {NAV.map((n) => {
            const isOpen = activeNav === n.key;
            return (
              <div
                key={n.key}
                className="relative"
                onMouseEnter={() => n.children && openNav(n.key)}
                onMouseLeave={() => n.children && scheduleClose()}
              >
                {/* Nav link + chevron */}
                <Link
                  href={n.href}
                  className={cn(
                    "flex items-center gap-1 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                    isOpen
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                  )}
                >
                  {t(n.key)}
                  {n.children && (
                    <Chevron
                      className={cn(
                        "h-3 w-3 opacity-50 transition-transform duration-200",
                        isOpen && "rotate-180",
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown panel — shown/hidden via JS state, not CSS hover */}
                {n.children && isOpen && (
                  <div
                    className="absolute left-1/2 top-full z-50 mt-1.5 w-52 -translate-x-1/2 rounded-xl border border-line bg-surface-raised shadow-float animate-rise"
                    onMouseEnter={() => openNav(n.key)}
                    onMouseLeave={scheduleClose}
                  >
                    <ul className="py-1.5">
                      {n.children.map((child) =>
                        child.comingSoon ? (
                          <li key={child.label}>
                            <span
                              aria-disabled
                              title="Coming soon"
                              className="flex cursor-not-allowed items-center justify-between gap-2.5 px-4 py-2.5 text-sm text-ink-soft/50"
                            >
                              {child.label}
                              <span className="rounded-full bg-surface-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-ink-soft">
                                Soon
                              </span>
                            </span>
                          </li>
                        ) : (
                          <li key={child.label}>
                            <Link
                              href={child.href}
                              onClick={() => setActiveNav(null)}
                              className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink-soft transition-colors hover:bg-accent-soft hover:text-accent"
                            >
                              {child.label}
                            </Link>
                          </li>
                        ),
                      )}
                    </ul>
                    <div className="border-t border-line px-4 py-2.5">
                      <Link
                        href={n.href}
                        onClick={() => setActiveNav(null)}
                        className="text-xs font-semibold text-accent hover:brightness-90"
                      >
                        View all →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Utility — right */}
        <div className="ml-auto flex items-center gap-4 lg:ml-0">
          <Link
            href="/pricing"
            className="hidden text-sm font-medium text-white/65 transition-colors hover:text-white lg:inline-flex"
          >
            Pricing
          </Link>

          {/* List CTA — desktop only (mobile users get it in the menu).
              Wrapped because ButtonLink's base `inline-flex` overrides `hidden`. */}
          <span className="hidden lg:inline-flex">
            <ButtonLink href="/list" variant="coral" size="sm">
              {t("nav.list")}
            </ButtonLink>
          </span>

          {/* Hamburger */}
          <button
            onClick={() => { setOpen((v) => !v); setExpanded(null); }}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
          >
            {open ? (
              <Close className="h-5 w-5" />
            ) : (
              <HamburgerIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/10 bg-header lg:hidden">
          <nav className="container-page py-3" aria-label="Mobile navigation">
            {NAV.map((n) => (
              <div key={n.key}>
                <div className="flex items-center">
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {t(n.key)}
                  </Link>
                  {n.children && (
                    <button
                      onClick={() =>
                        setExpanded((v) => (v === n.key ? null : n.key))
                      }
                      aria-expanded={expanded === n.key}
                      className="grid h-9 w-9 place-items-center rounded-full text-white/40 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <Chevron
                        className={cn(
                          "h-3.5 w-3.5 transition-transform duration-200",
                          expanded === n.key && "rotate-180",
                        )}
                      />
                    </button>
                  )}
                </div>

                {/* Accordion children */}
                {n.children && expanded === n.key && (
                  <div className="mb-2 ml-4 border-l border-white/10 pl-4">
                    {n.children.map((child) =>
                      child.comingSoon ? (
                        <span
                          key={child.label}
                          aria-disabled
                          className="flex items-center justify-between gap-2 py-2.5 text-sm text-white/30"
                        >
                          {child.label}
                          <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white/50">
                            Soon
                          </span>
                        </span>
                      ) : (
                        <Link
                          key={child.label}
                          href={child.href}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2 py-2.5 text-sm text-white/50 transition-colors hover:text-accent"
                        >
                          {child.label}
                        </Link>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}

            <Link
              href="/pricing"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              Pricing
            </Link>
            <Link
              href="/account"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <User className="h-4 w-4" />
              Account
            </Link>
          </nav>

          <div className="container-page flex items-center justify-between border-t border-white/10 py-4">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm font-medium text-white/60">
                Currency
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as DisplayCurrency)}
                  aria-label="Display currency"
                  className="figure rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-sm font-semibold text-white focus:border-rose focus:outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c.value} value={c.value} className="text-ink">
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className="h-4 w-px bg-white/15" />
              <button
                onClick={() => setLocale(locale === "en" ? "sw" : "en")}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-white/40 transition-colors hover:text-white/75"
              >
                <Globe className="h-4 w-4" />
                {LOCALES.find((l) => l.code === locale)?.label}
              </button>
            </div>
            <ButtonLink
              href="/list"
              variant="coral"
              size="sm"
              onClick={() => setOpen(false)}
            >
              {t("nav.list")}
            </ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
