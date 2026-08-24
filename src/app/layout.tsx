import type { Metadata } from "next";
import { Poppins, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { CompareProvider } from "@/lib/compare/CompareProvider";
import { BookingProvider } from "@/lib/booking/BookingProvider";
import { MotionProvider } from "@/lib/motion/MotionProvider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CompareBar } from "@/components/ui/CompareBar";
import { SITE_URL } from "@/lib/site";

// Self-hosted, optimised fonts (no render-blocking <link> to Google).
// All-sans type system: Poppins carries body AND display; JetBrains Mono for figures.
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-jetbrains-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "CoralStone Properties Listings — East Africa's trust-first property portal",
    template: "%s · CoralStone Properties Listings",
  },
  description:
    "Buy, rent, and invest with confidence across East Africa. Every agent, agency, listing and title on CoralStone Properties Listings is checked — so you never chase a ghost listing again.",
  keywords: [
    "East Africa property",
    "verified listings",
    "houses for sale Nairobi",
    "apartments to rent Kampala",
    "property for sale Dar es Salaam",
    "houses for sale Kigali",
    "off-plan East Africa",
  ],
  openGraph: {
    title: "CoralStone Properties Listings",
    description:
      "East Africa's trust-first property portal. Verified agents, listings and titles across Kenya, Uganda, Tanzania and Rwanda.",
    type: "website",
    siteName: "CoralStone Properties Listings",
    locale: "en_KE",
  },
  twitter: {
    card: "summary_large_image",
    title: "CoralStone Properties Listings",
    description:
      "East Africa's trust-first property portal. Verified agents, listings and titles across Kenya, Uganda, Tanzania and Rwanda.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${poppins.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen flex flex-col bg-surface text-ink antialiased">
        <LocaleProvider>
          <CompareProvider>
            <BookingProvider>
            <MotionProvider>
              {/* Skip link — keyboard-navigable (WCAG 2.2 AA) */}
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-ink-black"
              >
                Skip to content
              </a>
              <Header />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
              <CompareBar />
            </MotionProvider>
            </BookingProvider>
          </CompareProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
