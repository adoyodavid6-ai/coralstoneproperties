"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { Search } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import type { ListingIntent } from "@/lib/types";

const INTENT_TABS: { key: ListingIntent | "all"; label: string; labelSw: string }[] = [
  { key: "sale", label: "Buy", labelSw: "Nunua" },
  { key: "rent", label: "Rent", labelSw: "Kodisha" },
  { key: "short_let", label: "Short-let", labelSw: "Kifupi" },
];

export function SearchBar({
  variant = "hero",
  defaultQ = "",
  defaultIntent = "sale",
}: {
  variant?: "hero" | "compact";
  defaultQ?: string;
  defaultIntent?: ListingIntent | "all";
}) {
  const router = useRouter();
  const { t, locale } = useLocale();
  const [q, setQ] = useState(defaultQ);
  const [intent, setIntent] = useState<ListingIntent | "all">(defaultIntent);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (intent !== "all") params.set("intent", intent);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className={cn("w-full", variant === "hero" && "max-w-2xl")}>
      {variant === "hero" && (
        <div className="mb-2 flex gap-1.5" role="tablist" aria-label="Listing intent">
          {INTENT_TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={intent === tab.key}
              onClick={() => setIntent(tab.key)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors",
                intent === tab.key
                  ? "bg-ink-black text-white shadow-card"
                  : "bg-surface-raised text-ink-soft ring-1 ring-line hover:text-primary",
              )}
            >
              {locale === "sw" ? tab.labelSw : tab.label}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={submit}
        className={cn(
          "flex items-center gap-2 rounded-full border bg-surface-raised p-1.5 shadow-float",
          variant === "hero" ? "border-line" : "border-line-strong",
        )}
      >
        <span className="pl-3 text-accent">
          <Search className="h-5 w-5" />
        </span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("hero.searchPlaceholder")}
          aria-label="Search properties"
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[15px] text-primary placeholder:text-ink-soft/70 focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex h-11 items-center gap-2 rounded-full bg-ink-black px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          <Search className="h-4 w-4 sm:hidden" />
          <span className="hidden sm:inline">{t("hero.search")}</span>
        </button>
      </form>
    </div>
  );
}
