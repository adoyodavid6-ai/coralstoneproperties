"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Logo } from "@/components/ui/Logo";
import { SubscribeForm } from "./SubscribeForm";
import { cn } from "@/lib/cn";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Buy", href: "/search?intent=sale" },
      { label: "Rent", href: "/search?intent=rent" },
      { label: "Land & plots", href: "/search?type=land" },
      { label: "Off-plan", href: "/search?type=off_plan" },
      { label: "Short-lets", href: "/search?intent=short_let" },
      { label: "List a property", href: "/list" },
      { label: "My trips", href: "/bookings" },
      { label: "Saved & compare", href: "/saved" },
    ],
  },
  {
    title: "Intelligence",
    links: [
      { label: "Mortgage & affordability", href: "/mortgage" },
      { label: "What's my property worth?", href: "/valuation" },
      { label: "Area guides", href: "/area-guides" },
      { label: "Diaspora hub", href: "/diaspora" },
      { label: "SACCO & group-buying", href: "/sacco" },
    ],
  },
  {
    title: "Trust",
    links: [
      { label: "How verification works", href: "/verification" },
      { label: "Report a listing", href: "/report" },
      { label: "Anti-fraud policy", href: "/anti-fraud" },
      { label: "Data protection", href: "/data-protection" },
      { label: "Find a conveyancer", href: "/conveyancers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "Premium Marketing & Sales", href: "/premium-marketing" },
      { label: "For agents & agencies", href: "/pricing#plans" },
      { label: "Developer packages", href: "/pricing#developer" },
      { label: "Contact us", href: "/contact" },
      { label: "Terms & privacy", href: "/terms" },
    ],
  },
];

export function Footer() {
  const { t } = useLocale();
  const pathname = usePathname();
  // Which section's links are showing. Hover (desktop), focus (keyboard) or tap (touch) switches it.
  const [active, setActive] = useState(COLUMNS[0].title);

  // The admin console runs its own chrome — hide the public footer there.
  if (pathname?.startsWith("/admin")) return null;

  const current = COLUMNS.find((c) => c.title === active) ?? COLUMNS[0];

  return (
    <footer className="relative mt-20 overflow-hidden bg-surface-dark text-white/80">
      <div className="hairline-gradient" aria-hidden />

      {/* Newsletter band — full width so it isn't cramped in the brand column */}
      <div className="relative border-b border-white/10">
        <div className="container-page flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md">
            <h3 className="font-sans text-base font-semibold text-white">Stay in the loop</h3>
            <p className="mt-1 text-sm leading-relaxed text-white/70">
              New verified listings and East African market insight — straight to your inbox.
            </p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[22rem]">
            <SubscribeForm />
          </div>
        </div>
      </div>

      <div className="container-page relative grid grid-cols-1 gap-8 py-9 md:grid-cols-[1fr_2.6fr] md:gap-12">
        <div>
          <Logo variant="full-dark" />
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">
            {t("footer.tagline")} We check the agent, the agency, the listing and
            the title — so East Africa can buy, rent and invest without fear.
          </p>
        </div>

        {/* All four section titles on one line; the hovered (or tapped) section's links show below. */}
        <div className="min-w-0">
          <div role="tablist" aria-label="Footer sections" className="flex items-end justify-between gap-3 border-b border-white/10 pb-3">
            {COLUMNS.map((col) => {
              const isActive = col.title === current.title;
              return (
                <button
                  key={col.title}
                  type="button"
                  role="tab"
                  id={`footer-tab-${col.title}`}
                  aria-selected={isActive}
                  aria-controls="footer-links"
                  onMouseEnter={() => setActive(col.title)}
                  onFocus={() => setActive(col.title)}
                  onClick={() => setActive(col.title)}
                  className={cn(
                    "relative bg-gradient-to-r from-accent to-[#a9c8dc] bg-clip-text font-sans font-semibold leading-tight text-transparent transition-opacity",
                    "text-[clamp(15px,4.4vw,24.5px)]",
                    isActive ? "opacity-100" : "opacity-70 hover:opacity-100",
                  )}
                >
                  {col.title}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-3 left-0 h-0.5 w-full origin-left bg-gradient-to-r from-accent to-[#a9c8dc] transition-transform duration-200",
                      isActive ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </button>
              );
            })}
          </div>

          <nav
            id="footer-links"
            role="tabpanel"
            aria-labelledby={`footer-tab-${current.title}`}
            className="min-h-[4.5rem] pt-4"
          >
            <ul className="flex flex-wrap gap-x-6 gap-y-2.5 text-sm">
              {current.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-white/75 transition-colors hover:text-accent-on-dark">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Oversized display watermark — clipped at the footer's bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-serif font-semibold leading-none text-white/[0.05]"
        style={{ fontSize: "clamp(3rem, 9vw, 8rem)", marginBottom: "-0.24em" }}
      >
        CoralStones
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-4 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} CoralStones Properties. {t("footer.rights")}</p>
          <p className="figure">Nairobi · Mombasa · Kisumu</p>
        </div>
      </div>
    </footer>
  );
}
