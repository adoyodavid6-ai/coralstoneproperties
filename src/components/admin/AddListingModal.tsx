"use client";

import { useState } from "react";
import { useAdmin, type NewListingInput } from "@/lib/admin/AdminStore";
import type { Country, Currency, ListingIntent, PricePeriod, PropertyType } from "@/lib/types";
import { INTENT_LABEL, TYPE_LABEL } from "@/lib/labels";
import { Button } from "@/components/ui/Button";
import { Close } from "@/components/ui/icons";
import { Field, inputClass } from "./ui";
import { cn } from "@/lib/cn";

const TYPES = Object.keys(TYPE_LABEL) as PropertyType[];
const INTENTS = Object.keys(INTENT_LABEL) as ListingIntent[];
const CURRENCIES: Currency[] = ["KES", "UGX", "TZS", "RWF", "USD", "GBP"];
const COUNTRIES: Country[] = ["Kenya", "Uganda", "Tanzania", "Rwanda"];
const PERIODS: PricePeriod[] = ["total", "month", "night"];

export function AddListingModal({ onClose }: { onClose: () => void }) {
  const { agents, addListing } = useAdmin();
  const [f, setF] = useState({
    title: "",
    type: "apartment",
    intent: "sale",
    price: "",
    currency: "KES",
    pricePeriod: "total",
    country: "Kenya",
    county: "",
    area: "",
    beds: "",
    baths: "",
    size: "",
    agentId: agents[0]?.id ?? "",
  });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const valid = f.title.trim() && f.area.trim() && f.county.trim() && Number(f.price) > 0;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    const input: NewListingInput = {
      title: f.title.trim(),
      type: f.type as PropertyType,
      intent: f.intent as ListingIntent,
      price: Number(f.price),
      currency: f.currency as Currency,
      pricePeriod: f.pricePeriod as PricePeriod,
      country: f.country as Country,
      county: f.county.trim(),
      area: f.area.trim(),
      beds: f.beds === "" ? undefined : Number(f.beds),
      baths: f.baths === "" ? undefined : Number(f.baths),
      size: f.size === "" ? undefined : Number(f.size),
      agentId: f.agentId,
    };
    addListing(input);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={onClose}>
      <form
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-surface-raised p-6 shadow-float"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-primary">New listing</h2>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-ink-soft hover:bg-surface-muted" aria-label="Close">
            <Close className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-1 text-sm text-ink-soft">Created as <strong>pending review</strong> for moderation.</p>

        <div className="mt-5 space-y-4">
          <Field label="Title">
            <input className={inputClass} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. 3-bed apartment in Kilimani" />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <select className={inputClass} value={f.type} onChange={(e) => set("type", e.target.value)}>
                {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </Field>
            <Field label="Intent">
              <select className={inputClass} value={f.intent} onChange={(e) => set("intent", e.target.value)}>
                {INTENTS.map((i) => <option key={i} value={i}>{INTENT_LABEL[i]}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Price">
              <input className={cn(inputClass, "figure")} inputMode="numeric" value={f.price} onChange={(e) => set("price", e.target.value)} />
            </Field>
            <Field label="Currency">
              <select className={inputClass} value={f.currency} onChange={(e) => set("currency", e.target.value)}>
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Period">
              <select className={inputClass} value={f.pricePeriod} onChange={(e) => set("pricePeriod", e.target.value)}>
                {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Country">
              <select className={inputClass} value={f.country} onChange={(e) => set("country", e.target.value)}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="City / county">
              <input className={inputClass} value={f.county} onChange={(e) => set("county", e.target.value)} placeholder="Nairobi" />
            </Field>
            <Field label="Area">
              <input className={inputClass} value={f.area} onChange={(e) => set("area", e.target.value)} placeholder="Kilimani" />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Beds"><input className={cn(inputClass, "figure")} inputMode="numeric" value={f.beds} onChange={(e) => set("beds", e.target.value)} /></Field>
            <Field label="Baths"><input className={cn(inputClass, "figure")} inputMode="numeric" value={f.baths} onChange={(e) => set("baths", e.target.value)} /></Field>
            <Field label="Size (sqm)"><input className={cn(inputClass, "figure")} inputMode="numeric" value={f.size} onChange={(e) => set("size", e.target.value)} /></Field>
          </div>

          <Field label="Assign agent">
            <select className={inputClass} value={f.agentId} onChange={(e) => set("agentId", e.target.value)}>
              {agents.map((a) => <option key={a.id} value={a.id}>{a.name} · {a.agency}</option>)}
            </select>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={!valid}>Create listing</Button>
        </div>
      </form>
    </div>
  );
}
