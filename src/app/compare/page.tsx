"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { Property } from "@/lib/types";
import { useCompare } from "@/lib/compare/CompareProvider";
import { fetchListingsByIds } from "@/lib/data/actions";
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
  const [items, setItems] = useState<Property[]>([]);

  const idKey = ids.join(",");
  useEffect(() => {
    let active = true;
    if (!ids.length) {
      setItems([]);
      return;
    }
    fetchListingsByIds(ids).then((r) => {
      if (active) setItems(r);
    });
    return () => {
      active = false;
    };
    // idKey captures the id set; ids reference may change each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  if (ids.length === 0) {
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

      <div className="mt-6">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr>
              <th className="w-16 sm:w-40" />
              {items.map((p) => (
                <th key={p.id} className="p-1 align-top sm:p-2">
                  <div className="relative overflow-hidden rounded-xl border border-line bg-surface-raised">
                    <button
                      onClick={() => remove(p.id)}
                      aria-label="Remove from comparison"
                      className="absolute right-1 top-1 z-10 grid h-6 w-6 place-items-center rounded-full bg-surface-raised/90 text-primary shadow-card sm:right-2 sm:top-2 sm:h-7 sm:w-7"
                    >
                      <Close className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </button>
                    <Link href={`/property/${p.slug}`} className="block aspect-[4/3]">
                      <SmartImage src={p.images[0]} alt={p.title} />
                    </Link>
                    <Link href={`/property/${p.slug}`} className="block p-1.5 sm:p-3">
                      <span className="font-serif text-xs leading-snug text-primary hover:text-accent sm:text-sm">
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
                <th scope="row" className="p-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-soft sm:p-3 sm:text-xs">
                  {r.label}
                </th>
                {items.map((p) => (
                  <td key={p.id} className="break-words p-2 text-xs text-primary sm:p-3 sm:text-sm">
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
