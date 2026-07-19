"use client";

import type { Property } from "@/lib/types";
import { priceLabel } from "@/lib/format";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

/** Currency-aware price, reactive to the diaspora currency toggle. Always monospace. */
export function Price({
  property,
  className,
}: {
  property: Property;
  className?: string;
}) {
  const { currency } = useLocale();
  return (
    <span className={cn("figure", className)}>{priceLabel(property, currency)}</span>
  );
}
