"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Logo } from "@/components/ui/Logo";
import { SubscribeForm } from "./SubscribeForm";
import { cn } from "@/lib/cn";
import { SOCIAL_PLATFORMS, type SocialLinks, type SocialPlatform } from "@/lib/social";
import { Instagram, LinkedIn, TikTok, YouTube } from "@/components/ui/icons";

const SOCIAL_ICON: Record<SocialPlatform, (p: { className?: string }) => React.ReactNode> = {
  tiktok: TikTok,
  youtube: YouTube,
  instagram: Instagram,
  linkedin: LinkedIn,
};

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

const MAX_LINKS = Math.max(...COLUMNS.map((c) => c.links.length));
// Static class names so Tailwind can see them: place the link list under its title on md+.
const COL_START = ["md:col-start-1", "md:col-start-2", "md:col-start-3", "md:col-start-4"];

export function Footer({ socials }: { socials: SocialLinks }) {
  const { t } = useLocale();
  const pathname = usePathname();
  // Which section's links are showing. Hover (desktop), focus (keyboard) or tap (touch) switches it.
  const [active, setActive] = useState(COLUMNS[0].title);

  // The admin console runs its own chrome — hide the public footer there.
  if (pathname?.startsWith("/admin")) return null;

  const activeIndex = Math.max(0, COLUMNS.findIndex((c) => c.title === active));
  const current = COLUMNS[activeIndex];

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
          {/* Social profiles — URLs are managed at /admin/social. Unset ones stay greyed out. */}
          <ul aria-label="CoralStones on social media" className="mt-5 flex items-center gap-2.5">
            {SOCIAL_PLATFORMS.map(({ id, label }) => {
              const Icon = SOCIAL_ICON[id];
              const href = socials[id];
              return (
                <li key={id}>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`CoralStones on ${label}`}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-accent"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </a>
                  ) : (
                    <span
                      aria-label={`${label} — coming soon`}
                      title={`${label} — coming soon`}
                      className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-white/35"
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* All four section titles on one line; the hovered (or tapped) section's links show below. */}
        <div className="min-w-0">
          <div role="tablist" aria-label="Footer sections" className="flex items-end justify-between gap-2 border-b border-white/10 pb-3 md:grid md:grid-cols-4 md:gap-3">
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
                    "relative justify-self-start bg-gradient-to-r from-accent to-[#a9c8dc] bg-clip-text text-left font-sans font-semibold leading-tight text-transparent transition-opacity",
                    "text-[clamp(14px,4.1vw,24.5px)]",
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

          {/* Links stack vertically under the active section's title (full width on phones).
              The min height fits the longest list so the footer doesn't jump while hovering. */}
          <nav
            id="footer-links"
            role="tabpanel"
            aria-labelledby={`footer-tab-${current.title}`}
            className="grid grid-cols-4 gap-3 pt-4"
            style={{ minHeight: `${MAX_LINKS * 1.75 + 1}rem` }}
          >
            <ul className={cn("col-span-4 flex flex-col gap-2 text-sm md:col-span-1", COL_START[activeIndex])}>
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
