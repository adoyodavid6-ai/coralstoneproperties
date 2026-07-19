"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { TYPE_LABEL } from "@/lib/labels";
import { LIFESTYLE_FILTERS, type CountryOption } from "@/lib/search";
import type { PropertyType } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Close } from "@/components/ui/icons";

const INTENTS = [
  { v: "all", label: "Any" },
  { v: "sale", label: "Buy" },
  { v: "rent", label: "Rent" },
  { v: "short_let", label: "Short-let" },
];

const TYPES: (PropertyType | "all")[] = [
  "all",
  "apartment",
  "house",
  "townhouse",
  "land",
  "commercial",
  "off_plan",
  "venue",
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-primary">{label}</label>
      {children}
    </div>
  );
}

const selectClass =
  "w-full rounded-lg border border-line-strong bg-surface-raised px-3 py-2.5 text-sm text-primary focus:border-accent focus:outline-none";

export function FilterPanel({
  locations,
}: {
  locations: CountryOption[];
}) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useLocale();

  const get = (k: string) => params.get(k) ?? "";
  const [country, setCountry] = useState(get("country"));
  const [county, setCounty] = useState(get("county"));
  const [lifestyle, setLifestyle] = useState<string[]>(params.getAll("lifestyle"));

  const counties = useMemo(
    () => locations.find((l) => l.country === country)?.counties ?? [],
    [locations, country],
  );
  const areas = useMemo(
    () => counties.find((c) => c.county === county)?.areas ?? [],
    [counties, county],
  );

  const apply = (form: HTMLFormElement) => {
    const data = new FormData(form);
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    const sort = params.get("sort");
    if (sort) next.set("sort", sort);

    for (const key of ["intent", "type", "country", "county", "area", "minPrice", "maxPrice", "priceCur", "beds"]) {
      const val = String(data.get(key) ?? "").trim();
      if (val && val !== "all" && val !== "0") next.set(key, val);
    }
    if (data.get("verified")) next.set("verified", "1");
    if (data.get("reduced")) next.set("reduced", "1");
    if (data.get("media")) next.set("media", "1");
    for (const l of lifestyle) next.append("lifestyle", l);

    router.push(`/search?${next.toString()}`);
  };

  const clearAll = () => {
    setCountry("");
    setCounty("");
    setLifestyle([]);
    const q = params.get("q");
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  const toggleLifestyle = (l: string) =>
    setLifestyle((prev) =>
      prev.includes(l) ? prev.filter((x) => x !== l) : [...prev, l],
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        apply(e.currentTarget);
      }}
      className="space-y-5"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg text-primary">{t("search.filters")}</h2>
        <button
          type="button"
          onClick={clearAll}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-hover"
        >
          <Close className="h-3.5 w-3.5" />
          {t("search.clear")}
        </button>
      </div>

      <Field label="Intent">
        <select name="intent" defaultValue={get("intent") || "all"} className={selectClass}>
          {INTENTS.map((i) => (
            <option key={i.v} value={i.v}>{i.label}</option>
          ))}
        </select>
      </Field>

      <Field label="Property type">
        <select name="type" defaultValue={get("type") || "all"} className={selectClass}>
          {TYPES.map((tp) => (
            <option key={tp} value={tp}>
              {tp === "all" ? "Any type" : TYPE_LABEL[tp as PropertyType]}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Country">
        <select
          name="country"
          value={country}
          onChange={(e) => {
            setCountry(e.target.value);
            setCounty("");
          }}
          className={selectClass}
        >
          <option value="">All East Africa</option>
          {locations.map((l) => (
            <option key={l.country} value={l.country}>{l.country}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="City / region">
          <select
            name="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            className={selectClass}
            disabled={!country}
          >
            <option value="">Any</option>
            {counties.map((c) => (
              <option key={c.county} value={c.county}>{c.county}</option>
            ))}
          </select>
        </Field>
        <Field label="Area">
          <select name="area" defaultValue={get("area")} className={selectClass} disabled={!county}>
            <option value="">Any</option>
            {areas.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Price range">
        <div className="flex items-center gap-2">
          <input
            name="minPrice"
            type="number"
            inputMode="numeric"
            placeholder="Min"
            defaultValue={get("minPrice")}
            className={cn(selectClass, "figure")}
          />
          <input
            name="maxPrice"
            type="number"
            inputMode="numeric"
            placeholder="Max"
            defaultValue={get("maxPrice")}
            className={cn(selectClass, "figure")}
          />
          <select
            name="priceCur"
            defaultValue={get("priceCur") || "KES"}
            aria-label="Price currency"
            className="figure shrink-0 rounded-lg border border-line-strong bg-surface-raised px-2 py-2.5 text-sm text-primary focus:border-accent focus:outline-none"
          >
            {(["KES", "UGX", "TZS", "RWF", "USD", "GBP"] as const).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <p className="mt-1 text-xs text-ink-soft/80">
          Listings across markets are compared in your chosen currency.
        </p>
      </Field>

      <Field label="Minimum bedrooms">
        <select name="beds" defaultValue={get("beds")} className={selectClass}>
          <option value="">Any</option>
          {[1, 2, 3, 4, 5].map((b) => (
            <option key={b} value={b}>{b}+</option>
          ))}
        </select>
      </Field>

      <fieldset className="space-y-2.5">
        <legend className="mb-1 text-sm font-semibold text-primary">Trust & media</legend>
        {[
          { name: "verified", label: t("search.verifiedOnly") },
          { name: "reduced", label: "Price reduced only" },
          { name: "media", label: "Has video or 3D tour" },
        ].map((c) => (
          <label key={c.name} className="flex cursor-pointer items-center gap-2.5 text-sm text-primary">
            <input
              type="checkbox"
              name={c.name}
              defaultChecked={get(c.name) === "1"}
              className="h-4 w-4 rounded border-line-strong text-accent accent-[#2D4E6C]"
            />
            {c.label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-primary">Lifestyle & accessibility</legend>
        <div className="flex flex-wrap gap-2">
          {LIFESTYLE_FILTERS.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => toggleLifestyle(l)}
              aria-pressed={lifestyle.includes(l)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                lifestyle.includes(l)
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line-strong text-ink-soft hover:border-accent",
              )}
            >
              {l}
            </button>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        className="w-full rounded-full bg-ink-black py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
      >
        Show results
      </button>
    </form>
  );
}
