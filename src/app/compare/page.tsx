"use client";

import Link from "next/link";
import type { Property } from "@/lib/types";
import { useCompare } from "@/lib/compare/CompareProvider";
import { PROPERTIES } from "@/lib/data/properties";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import {
  priceLabel,
  formatMoney,
  formatNumber,
  convertBetween,
  resolveCurrency,
} from "@/lib/format";
import { INTENT_LABEL, TYPE_LABEL } from "@/lib/labels";
import { SmartImage } from "@/components/ui/SmartImage";
import { VerifiedStrip } from "@/components/ui/VerifiedBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Close } from "@/components/ui/icons";

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { currency } = useLocale();
  const items = PROPERTIES.filter((p) => ids.includes(p.id));

  if (items.length === 0) {
    return (
      <div className="container-page grid min-h-[50vh] place-items-center py-20 text-center">
        <div className="max-w-md">
          <h1 className="font-serif text-3xl font-semibold text-primary">Nothing to compare yet</h1>
          <p className="mt-3 text-ink-soft">
            Add listings with the <span className="font-medium text-primary">Compare</span> button on any
            property card, then review them side by side here.
          </p>
          <ButtonLink href="/search" className="mt-6">Browse properties</ButtonLink>
        </div>
      </div>
    );
  }

  const money = (amount: number, native: Property["currency"]) => {
    const target = resolveCurrency(currency, native);
    return formatMoney(convertBetween(amount, native, target), target);
  };

  const rows: { label: string; render: (p: Property) => React.ReactNode }[] = [
    { label: "Price", render: (p) => <span className="figure font-semibold text-primary">{priceLabel(p, currency)}</span> },
    { label: "Listing", render: (p) => `${INTENT_LABEL[p.intent]} · ${TYPE_LABEL[p.type]}` },
    { label: "Location", render: (p) => `${p.area}, ${p.county} · ${p.country}` },
    { label: "Bedrooms", render: (p) => (p.beds == null ? "—" : p.beds === 0 ? "Studio" : p.beds) },
    { label: "Bathrooms", render: (p) => p.baths ?? "—" },
    { label: "Internal size", render: (p) => (p.size ? `${formatNumber(p.size)} ${p.sizeUnit}` : "—") },
    { label: "Plot size", render: (p) => (p.plotSize ? `${p.plotSize} ${p.plotSizeUnit}` : "—") },
    { label: "Service charge", render: (p) => (p.serviceCharge ? `${money(p.serviceCharge, p.currency)}/mo` : "—") },
    { label: "Verified", render: (p) => <VerifiedStrip kinds={p.verified.map((v) => v.kind)} size="sm" max={3} /> },
    { label: "Amenities", render: (p) => p.amenities.slice(0, 6).join(", ") },
  ];

  return (
    <div className="container-page py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Side by side</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-primary">Compare properties</h1>
          <p className="mt-1 text-sm text-ink-soft">
            <span className="figure">{items.length}</span> selected · prices shown in your chosen currency.
          </p>
        </div>
        <button onClick={clear} className="text-sm font-medium text-ink-soft hover:text-danger">
          Clear all
        </button>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th className="w-32 sm:w-40" />
              {items.map((p) => (
                <th key={p.id} className="p-2 align-top">
                  <div className="relative overflow-hidden rounded-xl border border-line bg-surface-raised">
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="Remove from comparison"
                      className="absolute right-2 top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-surface-raised/90 text-primary shadow-card"
                    >
                      <Close className="h-4 w-4" />
                    </button>
                    <Link href={`/property/${p.slug}`} className="block aspect-[4/3]">
                      <SmartImage src={p.images[0]} alt={p.title} />
                    </Link>
                    <Link href={`/property/${p.slug}`} className="block p-3">
                      <span className="font-serif text-sm leading-snug text-primary hover:text-accent">
                        {p.title}
                      </span>
                    </Link>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.label} className="border-t border-line align-top transition-colors hover:bg-brand-soft/40">
                <th scope="row" className="p-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-soft">
                  {r.label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="p-3 text-sm text-primary">
                    {r.render(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
