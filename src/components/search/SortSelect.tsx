"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/LocaleProvider";

const OPTIONS: { v: string; key: string }[] = [
  { v: "relevance", key: "search.sort.relevance" },
  { v: "priceAsc", key: "search.sort.priceAsc" },
  { v: "priceDesc", key: "search.sort.priceDesc" },
  { v: "newest", key: "search.sort.newest" },
  { v: "mostViewed", key: "search.sort.mostViewed" },
];

export function SortSelect() {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();

  const onChange = (value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value === "relevance") next.delete("sort");
    else next.set("sort", value);
    router.push(`/search?${next.toString()}`);
  };

  return (
    <label className="inline-flex items-center gap-2 text-sm text-ink-soft">
      <span className="hidden sm:inline">{t("search.sort")}:</span>
      <select
        value={params.get("sort") ?? "relevance"}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-line-strong bg-surface-raised px-3 py-2 text-sm font-medium text-primary focus:border-accent focus:outline-none"
      >
        {OPTIONS.map((o) => (
          <option key={o.v} value={o.v}>{t(o.key)}</option>
        ))}
      </select>
    </label>
  );
}
