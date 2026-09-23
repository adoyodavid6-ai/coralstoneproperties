"use client";

import { useState } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield } from "@/components/ui/icons";
import { sendValuationLead } from "@/lib/leads/actions";

const inputCls = "w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-primary placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

const FACTORS = [
  { title: "Location", body: "The single biggest driver of value. Proximity to CBD, schools, transport and amenities can double or halve the price per sq m within a 5km radius." },
  { title: "Land size & title type", body: "In Kenya, freehold is worth more than leasehold. Plot size and approved user matter. A title with an encumbrance trades at a discount." },
  { title: "Property size & condition", body: "Price per sq m typically rises for smaller, well-finished units. Larger units may have lower per-sq-m values but higher absolute prices." },
  { title: "Development around it", body: "New road access, a nearby mall or school announcement, or an upcoming metro station can add 20–40% to values in 2–3 years." },
  { title: "Market timing", body: "The Nairobi residential market broadly moves in 5–7 year cycles. Buying in a down cycle and holding through recovery is the most reliable EA wealth-building strategy." },
];

const BENCHMARKS = [
  { area: "Kilimani, Nairobi",     type: "2BR apartment",    range: "KSh 8M – 18M",    yield: "6–8%" },
  { area: "Karen, Nairobi",        type: "4BR villa",         range: "KSh 30M – 120M",  yield: "3–5%" },
  { area: "Nyali, Mombasa",        type: "3BR villa",         range: "KSh 18M – 55M",   yield: "5–7%" },
  { area: "Milimani, Kisumu",      type: "4BR house",         range: "KSh 15M – 45M",   yield: "5–7%" },
  { area: "Runda, Nairobi",        type: "5BR villa",         range: "KSh 60M – 250M",  yield: "3–4%" },
  { area: "Diani, Kwale",          type: "Plot (0.25 acres)", range: "KSh 3M – 20M",    yield: "—" },
];

export default function ValuationPage() {
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [form, setForm] = useState({ country: "", city: "", type: "", size: "", condition: "", name: "", email: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const ready = form.country && form.city && form.type && form.name && form.email;

  async function submit() {
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const res = await sendValuationLead({
      country: form.country,
      city: form.city,
      propertyType: form.type,
      size: form.size,
      condition: form.condition,
      name: form.name,
      email: form.email,
      company,
    });
    setPending(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  }

  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">Property intelligence</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          What&apos;s my property worth?
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-white/65">
          Get a free indicative valuation from our team of certified valuers — and understand
          the key factors driving values in your area.
        </p>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">

          {/* What drives value */}
          <div>
            <p className="eyebrow">What we look at</p>
            <h2 className="mt-3 font-serif text-2xl font-semibold text-primary">
              Five factors that set your property&apos;s value
            </h2>
            <div className="mt-8 space-y-5">
              {FACTORS.map((f, i) => (
                <div key={f.title} className="flex gap-4">
                  <span className="figure grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-semibold text-accent">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold text-primary">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.body}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Market benchmarks */}
            <div className="mt-10">
              <p className="eyebrow">Market benchmarks</p>
              <h3 className="mt-3 font-serif text-xl font-semibold text-primary">Current price ranges by area</h3>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line text-left">
                      <th className="pb-3 font-semibold text-primary">Area</th>
                      <th className="pb-3 font-semibold text-primary">Type</th>
                      <th className="pb-3 font-semibold text-primary">Price range</th>
                      <th className="pb-3 font-semibold text-primary">Rental yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {BENCHMARKS.map((b) => (
                      <tr key={b.area}>
                        <td className="py-3 font-medium text-primary">{b.area}</td>
                        <td className="py-3 text-ink-soft">{b.type}</td>
                        <td className="py-3 figure text-ink-soft">{b.range}</td>
                        <td className="py-3 figure text-accent">{b.yield}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-xs text-ink-soft">Prices as of Q1 2026. Contact us for a specific property assessment.</p>
            </div>
          </div>

          {/* Valuation request form */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
              {done ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
                    <CheckShield className="h-7 w-7 text-accent" />
                  </span>
                  <h3 className="mt-4 font-serif text-lg font-semibold text-primary">Request received</h3>
                  <p className="mt-2 text-sm text-ink-soft">Our valuer will be in touch within 2 business days with an indicative range.</p>
                  <ButtonLink href="/search" variant="coral" className="mt-6">Browse listings</ButtonLink>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-lg font-semibold text-primary">Request a free valuation</h2>
                  <p className="mt-1 text-sm text-ink-soft">Free indicative valuation — our team responds within 2 business days.</p>
                  <div className="mt-5 space-y-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-primary">Country</label>
                      <select className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)}>
                        <option value="">Select country…</option>
                        <option>Kenya</option><option disabled>Uganda — coming soon</option><option disabled>Tanzania — coming soon</option><option disabled>Rwanda — coming soon</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-primary">City / Area</label>
                      <input className={inputCls} placeholder="e.g. Kilimani, Nairobi" value={form.city} onChange={(e) => set("city", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-primary">Property type</label>
                      <select className={inputCls} value={form.type} onChange={(e) => set("type", e.target.value)}>
                        <option value="">Select…</option>
                        <option>Apartment</option><option>House / Villa</option><option>Land / Plot</option><option>Commercial</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-primary">Size</label>
                        <input className={inputCls} placeholder="e.g. 120 sq m" value={form.size} onChange={(e) => set("size", e.target.value)} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-primary">Condition</label>
                        <select className={inputCls} value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                          <option value="">Select…</option>
                          <option>New / off-plan</option><option>Good</option><option>Average</option><option>Needs work</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-primary">Your name</label>
                      <input className={inputCls} placeholder="Full name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-primary">Email address</label>
                      <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                    </div>
                    {/* Honeypot — hidden from real users, catches bots */}
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="hidden"
                    />
                    {error && (
                      <p className="rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
                        {error}
                      </p>
                    )}
                    <button
                      type="button"
                      disabled={!ready || pending}
                      onClick={submit}
                      className={`w-full rounded-full py-3 text-sm font-semibold transition-all ${ready && !pending ? "bg-accent text-white hover:bg-accent-hover" : "cursor-not-allowed bg-line text-ink-soft"}`}
                    >
                      {pending ? "Sending…" : "Request valuation"}
                    </button>
                    <p className="text-xs text-ink-soft text-center">Free for buyers and sellers. No obligation.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
