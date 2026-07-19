"use client";

import { useState } from "react";
import { useAdmin } from "@/lib/admin/AdminStore";
import type { Currency, PricePeriod, PropertyStatus, VerificationKind } from "@/lib/types";
import { INTENT_LABEL, TYPE_LABEL, VERIFICATION_META } from "@/lib/labels";
import { STATUS_META } from "@/lib/admin/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { Close } from "@/components/ui/icons";
import { Field, inputClass } from "./ui";
import { cn } from "@/lib/cn";

const CURRENCIES: Currency[] = ["KES", "UGX", "TZS", "RWF", "USD", "GBP"];
const PERIODS: PricePeriod[] = ["total", "month", "night"];
const STATUSES: PropertyStatus[] = [
  "draft",
  "pending_review",
  "active",
  "under_offer",
  "reserved",
  "sold",
  "let",
  "withdrawn",
];
const KINDS: VerificationKind[] = ["listing", "agent", "agency", "title", "developer"];

export function ListingEditor({ propertyId, onClose }: { propertyId: string; onClose: () => void }) {
  const { properties, updateListing, setStatus, setBoost, toggleVerification, deleteListing } =
    useAdmin();
  const property = properties.find((p) => p.id === propertyId);

  const [form, setForm] = useState(() => ({
    title: property?.title ?? "",
    price: String(property?.price ?? 0),
    currency: String(property?.currency ?? "KES"),
    pricePeriod: String(property?.pricePeriod ?? "total"),
    beds: property?.beds != null ? String(property.beds) : "",
    baths: property?.baths != null ? String(property.baths) : "",
    size: property?.size != null ? String(property.size) : "",
    description: property?.description ?? "",
  }));
  const [saved, setSaved] = useState(false);

  if (!property) {
    // Deleted out from under us.
    onClose();
    return null;
  }

  const save = () => {
    updateListing(property.id, {
      title: form.title,
      price: Number(form.price) || 0,
      currency: form.currency as Currency,
      pricePeriod: form.pricePeriod as PricePeriod,
      beds: form.beds === "" ? undefined : Number(form.beds),
      baths: form.baths === "" ? undefined : Number(form.baths),
      size: form.size === "" ? undefined : Number(form.size),
      sizeUnit: form.size === "" ? undefined : property.sizeUnit ?? "sqm",
      description: form.description,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-lg flex-col overflow-y-auto bg-surface-raised shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-line bg-surface-raised px-5 py-3.5">
          <h2 className="font-serif text-lg text-primary">Edit listing</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-ink-soft hover:bg-surface-muted hover:text-primary" aria-label="Close">
            <Close className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-5">
          {/* Preview */}
          <div className="flex gap-3">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg">
              <SmartImage src={property.images[0]} alt={property.title} sizes="112px" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-primary">{property.title}</p>
              <p className="text-xs text-ink-soft">
                {TYPE_LABEL[property.type]} · {INTENT_LABEL[property.intent]}
              </p>
              <p className="figure text-xs text-ink-soft">
                {property.area}, {property.county}
              </p>
            </div>
          </div>

          {/* Core fields */}
          <Field label="Title">
            <input className={inputClass} value={form.title} onChange={(e) => set("title", e.target.value)} />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price" className="col-span-1">
              <input className={cn(inputClass, "figure")} inputMode="numeric" value={form.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label="Currency">
              <select className={inputClass} value={form.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Period">
              <select className={inputClass} value={form.pricePeriod} onChange={(e) => set("pricePeriod", e.target.value)}>
                {PERIODS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Beds">
              <input className={cn(inputClass, "figure")} inputMode="numeric" value={form.beds} onChange={(e) => set("beds", e.target.value)} />
            </Field>
            <Field label="Baths">
              <input className={cn(inputClass, "figure")} inputMode="numeric" value={form.baths} onChange={(e) => set("baths", e.target.value)} />
            </Field>
            <Field label="Size (sqm)">
              <input className={cn(inputClass, "figure")} inputMode="numeric" value={form.size} onChange={(e) => set("size", e.target.value)} />
            </Field>
          </div>

          <Field label="Description">
            <textarea className={cn(inputClass, "min-h-24 resize-y")} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </Field>

          <div className="flex items-center gap-3">
            <Button onClick={save}>Save changes</Button>
            {saved && <span className="text-sm font-medium text-verified">Saved ✓</span>}
          </div>

          <hr className="border-line" />

          {/* Status */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Status</p>
            <select
              className={inputClass}
              value={property.status}
              onChange={(e) => setStatus(property.id, e.target.value as PropertyStatus)}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>{STATUS_META[s].label}</option>
              ))}
            </select>
          </div>

          {/* Boost */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Boost placement</p>
            <div className="flex gap-2">
              {([null, "featured", "spotlight"] as const).map((tier) => {
                const on = (property.boostTier ?? null) === tier;
                return (
                  <button
                    key={tier ?? "none"}
                    onClick={() => setBoost(property.id, tier)}
                    className={cn(
                      "flex-1 rounded-lg border px-3 py-2 text-sm font-medium capitalize transition-colors",
                      on ? "border-accent bg-accent text-white" : "border-line-strong text-ink-soft hover:border-accent hover:text-accent",
                    )}
                  >
                    {tier ?? "None"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Verification */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-soft">Verification badges</p>
            <div className="space-y-2">
              {KINDS.map((kind) => {
                const on = property.verified.some((v) => v.kind === kind);
                return (
                  <label key={kind} className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-line px-3 py-2">
                    <span>
                      <span className="text-sm font-medium text-primary">{VERIFICATION_META[kind].label}</span>
                      <span className="block text-xs text-ink-soft">{VERIFICATION_META[kind].guarantee.slice(0, 64)}…</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleVerification(property.id, kind)}
                      className="h-5 w-5 shrink-0 accent-[var(--color-verified)]"
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <hr className="border-line" />

          <button
            onClick={() => {
              if (confirm(`Delete "${property.title}"? This cannot be undone.`)) {
                deleteListing(property.id);
                onClose();
              }
            }}
            className="w-full rounded-lg border border-danger/40 px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger-soft"
          >
            Delete listing
          </button>
        </div>
      </div>
    </div>
  );
}
