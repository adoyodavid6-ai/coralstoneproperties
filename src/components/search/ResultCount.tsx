"use client";

import { useLocale } from "@/lib/i18n/LocaleProvider";

export function ResultCount({ count }: { count: number }) {
  const { t } = useLocale();
  return (
    <p className="text-sm text-ink-soft">
      <span className="figure font-semibold text-primary">{count}</span>{" "}
      {t("search.results")}
    </p>
  );
}
