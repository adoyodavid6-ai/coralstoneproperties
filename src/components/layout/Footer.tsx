"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Logo } from "@/components/ui/Logo";
import { SubscribeForm } from "./SubscribeForm";
import { CONTACT_EMAILS } from "@/lib/contact";

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
      { label: "Verified conveyancers", href: "/conveyancers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Pricing", href: "/pricing" },
      { label: "For agents & agencies", href: "/pricing#plans" },
      { label: "Developer packages", href: "/pricing#developer" },
      { label: "Contact", href: "/contact" },
      { label: "Terms & privacy", href: "/terms" },
    ],
  },
];

// Footer nav renders as two columns; each stacks two sections.
// Left: Explore + Intelligence. Right: Trust + Company.
const COLUMN_GROUPS = [COLUMNS.slice(0, 2), COLUMNS.slice(2, 4)];

export function Footer() {
  const { t } = useLocale();
  const pathname = usePathname();

  // The admin console runs its own chrome — hide the public footer there.
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="relative mt-20 overflow-hidden bg-surface-dark text-white/80">
      <div className="hairline-gradient" aria-hidden />

      <div className="container-page relative grid gap-10 py-14 md:grid-cols-[1.6fr_repeat(2,1fr)]">
        <div>
          <Logo variant="full-dark" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
            {t("footer.tagline")} We check the agent, the agency, the listing and
            the title — so East Africa can buy, rent and invest without fear.
          </p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-3 py-1.5">M-Pesa</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">MTN MoMo</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">Airtel Money</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">EN · SW</span>
            <span className="rounded-full bg-white/10 px-3 py-1.5">USSD ready</span>
          </div>

          <div className="mt-6 flex flex-col gap-1.5 text-sm">
            {CONTACT_EMAILS.map((c) => (
              <a
                key={c.address}
                href={`mailto:${c.address}`}
                className="text-white/70 transition-colors hover:text-white"
              >
                {c.address}
              </a>
            ))}
          </div>

          <div className="mt-8 border-t border-white/10 pt-6">
            <SubscribeForm />
          </div>
        </div>

        {COLUMN_GROUPS.map((group) => (
          <div key={group[0].title} className="space-y-8">
            {group.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h4 className="font-sans text-sm font-semibold text-white">{col.title}</h4>
                <ul className="mt-3 space-y-2.5 text-sm">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        ))}
      </div>

      {/* Oversized display watermark — clipped at the footer's bottom edge */}
      <div
        aria-hidden
        className="pointer-events-none select-none whitespace-nowrap text-center font-serif font-semibold leading-none text-white/[0.05]"
        style={{ fontSize: "clamp(4rem, 14vw, 13rem)", marginBottom: "-0.24em" }}
      >
        CoralStone
      </div>

      <div className="relative border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-white/60 sm:flex-row">
          <p>© {new Date().getFullYear()} CoralStone Properties Listings. {t("footer.rights")}</p>
          <p className="figure">Nairobi · Mombasa · Kisumu</p>
        </div>
      </div>
    </footer>
  );
}
