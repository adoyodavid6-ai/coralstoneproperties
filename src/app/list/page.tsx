"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { CheckShield, Check, Pin, Camera, Phone, Users, Sparkle, Chevron } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { sendListingLead } from "@/lib/leads/actions";

// ── Types ────────────────────────────────────────────────────────────────────
type Intent = "sale" | "rent" | "short_let";
type PropertyType = "house" | "apartment" | "land" | "commercial" | "off_plan";
type Country = "Kenya" | "Uganda" | "Tanzania" | "Rwanda";
type OwnerType = "owner" | "agent" | "developer";
type VerifTier = "basic" | "standard" | "title";
type Currency = "KES" | "USD" | "GBP";

type FormData = {
  intent: Intent | "";
  propertyType: PropertyType | "";
  country: Country | "";
  title: string;
  city: string;
  price: string;
  currency: Currency;
  beds: string;
  baths: string;
  size: string;
  description: string;
  ownerType: OwnerType | "";
  name: string;
  email: string;
  phone: string;
  verifTier: VerifTier | "";
};

const EMPTY: FormData = {
  intent: "", propertyType: "", country: "",
  title: "", city: "", price: "", currency: "KES",
  beds: "", baths: "", size: "",
  description: "",
  ownerType: "", name: "", email: "", phone: "", verifTier: "",
};

// ── Static data ───────────────────────────────────────────────────────────────
const INTENTS: { value: Intent; label: string; sub: string }[] = [
  { value: "sale",      label: "For sale",   sub: "Outright purchase" },
  { value: "rent",      label: "For rent",   sub: "Monthly tenancy" },
  { value: "short_let", label: "Short-let",  sub: "Days / weeks" },
];

const TYPES: { value: PropertyType; label: string; emoji: string }[] = [
  { value: "house",      label: "House / Villa",    emoji: "🏡" },
  { value: "apartment",  label: "Apartment / Flat", emoji: "🏢" },
  { value: "land",       label: "Land & Plots",     emoji: "🌍" },
  { value: "commercial", label: "Commercial",        emoji: "🏬" },
  { value: "off_plan",   label: "Off-plan",          emoji: "🏗️" },
];

const COUNTRIES: { value: Country; flag: string; cities: string }[] = [
  { value: "Kenya",    flag: "🇰🇪", cities: "Nairobi, Mombasa, Kisumu" },
  { value: "Uganda",   flag: "🇺🇬", cities: "Kampala, Entebbe, Jinja" },
  { value: "Tanzania", flag: "🇹🇿", cities: "Dar es Salaam, Zanzibar, Arusha" },
  { value: "Rwanda",   flag: "🇷🇼", cities: "Kigali, Musanze, Rubavu" },
];

const OWNER_TYPES: { value: OwnerType; label: string; sub: string }[] = [
  { value: "owner",     label: "Property owner",    sub: "I own this property" },
  { value: "agent",     label: "Licensed agent",    sub: "Representing a client" },
  { value: "developer", label: "Developer",          sub: "New project / off-plan" },
];

const VERIF_TIERS: { value: VerifTier; label: string; price: string; sub: string; highlight?: boolean }[] = [
  { value: "basic",    label: "Basic",      price: "KSh 1,000", sub: "Listing photos, location and details confirmed." },
  { value: "standard", label: "Standard",   price: "KSh 2,500", sub: "Basic + agent identity & licence checked.", highlight: true },
  { value: "title",    label: "Full Title", price: "KSh 5,000", sub: "Title deed search + full ownership confirmation." },
];

const CURRENCIES: Currency[] = ["KES", "USD", "GBP"];

// ── Small helpers ─────────────────────────────────────────────────────────────
function PillRadio<T extends string>({
  options, value, onChange, className,
}: {
  options: { value: T; label: string; sub?: string; emoji?: string }[];
  value: T | "";
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap gap-3", className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex flex-col items-start rounded-xl border px-4 py-3 text-left text-sm transition-all",
            value === o.value
              ? "border-accent bg-accent-soft text-accent ring-1 ring-accent"
              : "border-line bg-surface-raised text-ink-soft hover:border-accent/40 hover:text-ink",
          )}
        >
          {o.emoji && <span className="mb-1 text-xl leading-none">{o.emoji}</span>}
          <span className="font-semibold text-inherit leading-snug">{o.label}</span>
          {o.sub && <span className="mt-0.5 text-xs text-ink-soft">{o.sub}</span>}
        </button>
      ))}
    </div>
  );
}

function Field({
  label, hint, children,
}: {
  label: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-primary">
        {label}
        {hint && <span className="ml-1.5 text-xs font-normal text-ink-soft">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-primary placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

// ── Progress bar ──────────────────────────────────────────────────────────────
const STEPS = ["Listing type", "Property details", "Photos & description", "Contact & verify"];

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-8">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-accent">
          Step {step} of {STEPS.length}
        </span>
        <span className="text-xs text-ink-soft">{STEPS[step - 1]}</span>
      </div>
      <div className="h-1 w-full overflow-hidden rounded-full bg-line">
        <div
          className="h-full rounded-full bg-accent transition-all duration-500"
          style={{ width: `${(step / STEPS.length) * 100}%` }}
        />
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ListPropertyPage() {
  const [step, setStep]       = useState<1 | 2 | 3 | 4 | 5>(1);
  const [data, setData]       = useState<FormData>(EMPTY);
  const [submitted, setSubmit] = useState(false);
  const [pending, setPending]  = useState(false);
  const [error, setError]      = useState("");
  const [company, setCompany]  = useState(""); // honeypot

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  async function submit() {
    if (!canAdvance() || pending) return;
    setPending(true);
    setError("");
    const res = await sendListingLead({ ...data, company });
    setPending(false);
    if (res.ok) setSubmit(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  }

  const showBedBath = data.propertyType !== "land" && data.propertyType !== "commercial";

  function canAdvance() {
    if (step === 1) return data.intent && data.propertyType && data.country;
    if (step === 2) return data.title && data.city && data.price;
    if (step === 3) return data.description.length >= 20;
    if (step === 4) return data.ownerType && data.name && data.email && data.phone && data.verifTier;
    return true;
  }

  function next() { if (canAdvance()) setStep((s) => (s < 5 ? ((s + 1) as typeof step) : s)); }
  function back() { setStep((s) => (s > 1 ? ((s - 1) as typeof step) : s)); }

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-accent-soft text-accent">
          <CheckShield className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-primary">
          Listing submitted!
        </h1>
        <p className="mt-3 max-w-sm text-ink-soft">
          Our team will review your listing within 24 hours. Once verified, it goes
          live across the platform.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" variant="coral">Back to home</ButtonLink>
          <ButtonLink href="/search" variant="outline">Browse listings</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-surface-dark px-6 py-14 text-center">
        <p className="eyebrow text-white/60">CoralStone Properties Listings</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">
          List on East Africa&apos;s<br />
          <span className="text-rose">verified</span> platform
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/65">
          Your property in front of thousands of serious, pre-vetted buyers and
          tenants across Kenya, Uganda, Tanzania and Rwanda — with a verified badge
          that builds trust before the first enquiry.
        </p>
      </section>

      {/* ── Trust strip ───────────────────────────────────────────────────── */}
      <section className="border-b border-line bg-surface-muted">
        <div className="container-page grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            { icon: <CheckShield className="h-5 w-5 text-accent" />, label: "Verified badge", sub: "Builds buyer trust instantly" },
            { icon: <Sparkle className="h-5 w-5 text-accent" />,     label: "Live in 24 hrs",  sub: "After our quick review" },
            { icon: <Users className="h-5 w-5 text-accent" />,        label: "Serious buyers",  sub: "Pre-qualified audience" },
          ].map((t) => (
            <div key={t.label} className="flex items-center gap-3 px-6 py-5">
              <span className="shrink-0">{t.icon}</span>
              <div>
                <p className="text-sm font-semibold text-primary">{t.label}</p>
                <p className="text-xs text-ink-soft">{t.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Form ──────────────────────────────────────────────────────────── */}
      <section className="container-page py-14 sm:py-18">
        <div className="mx-auto max-w-2xl">
          {step < 5 && <ProgressBar step={step} />}

          {/* ── Step 1: Listing type ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-8">
              <Field label="What is the purpose of this listing?">
                <PillRadio
                  options={INTENTS}
                  value={data.intent}
                  onChange={(v) => set("intent", v)}
                  className="mt-2"
                />
              </Field>

              <Field label="Property type">
                <PillRadio
                  options={TYPES}
                  value={data.propertyType}
                  onChange={(v) => set("propertyType", v)}
                  className="mt-2"
                />
              </Field>

              <Field label="Country">
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => set("country", c.value)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                        data.country === c.value
                          ? "border-accent bg-accent-soft ring-1 ring-accent"
                          : "border-line bg-surface-raised hover:border-accent/40",
                      )}
                    >
                      <span className="text-2xl leading-none">{c.flag}</span>
                      <div>
                        <p className={cn("text-sm font-semibold", data.country === c.value ? "text-accent" : "text-primary")}>
                          {c.value}
                        </p>
                        <p className="text-xs text-ink-soft">{c.cities}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {/* ── Step 2: Property details ──────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <Field label="Listing title" hint='e.g. "4-bed villa in Karen, Nairobi"'>
                <input
                  className={inputCls}
                  placeholder="Give your property a clear, descriptive title"
                  value={data.title}
                  onChange={(e) => set("title", e.target.value)}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City / Area">
                  <input
                    className={inputCls}
                    placeholder={data.country ? `e.g. ${COUNTRIES.find(c => c.value === data.country)?.cities.split(",")[0]}` : "City or neighbourhood"}
                    value={data.city}
                    onChange={(e) => set("city", e.target.value)}
                  />
                </Field>

                <Field label="Price" hint="asking price">
                  <div className="flex gap-2">
                    <select
                      className={cn(inputCls, "w-24 shrink-0")}
                      value={data.currency}
                      onChange={(e) => set("currency", e.target.value as Currency)}
                    >
                      {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <input
                      className={inputCls}
                      placeholder={data.intent === "short_let" ? "per night" : "0"}
                      value={data.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                  </div>
                </Field>
              </div>

              {showBedBath && (
                <div className="grid gap-4 sm:grid-cols-3">
                  <Field label="Bedrooms">
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      placeholder="e.g. 3"
                      value={data.beds}
                      onChange={(e) => set("beds", e.target.value)}
                    />
                  </Field>
                  <Field label="Bathrooms">
                    <input
                      className={inputCls}
                      type="number"
                      min="0"
                      placeholder="e.g. 2"
                      value={data.baths}
                      onChange={(e) => set("baths", e.target.value)}
                    />
                  </Field>
                  <Field label="Size" hint="sq m / acres">
                    <input
                      className={inputCls}
                      placeholder="e.g. 180"
                      value={data.size}
                      onChange={(e) => set("size", e.target.value)}
                    />
                  </Field>
                </div>
              )}

              {!showBedBath && (
                <Field label="Plot / floor size" hint="acres or sq m">
                  <input
                    className={inputCls}
                    placeholder="e.g. 0.5 acres"
                    value={data.size}
                    onChange={(e) => set("size", e.target.value)}
                  />
                </Field>
              )}
            </div>
          )}

          {/* ── Step 3: Description & photos ─────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <Field label="Property description" hint="at least 20 characters">
                <textarea
                  className={cn(inputCls, "min-h-36 resize-y")}
                  placeholder="Describe the property — highlights, condition, nearby amenities, access roads, any unique features…"
                  value={data.description}
                  onChange={(e) => set("description", e.target.value)}
                />
                <p className="mt-1 text-right text-xs text-ink-soft">
                  {data.description.length} characters
                </p>
              </Field>

              {/* Photo upload zone — UI only in V1 */}
              <Field label="Photos" hint="up to 20 photos · JPG, PNG, WEBP">
                <div className="mt-1 flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-line-strong bg-surface px-6 py-10 text-center transition-colors hover:border-accent hover:bg-accent-soft/30">
                  <Camera className="h-8 w-8 text-ink-soft" />
                  <div>
                    <p className="text-sm font-semibold text-primary">Drag photos here or click to upload</p>
                    <p className="mt-0.5 text-xs text-ink-soft">
                      High-quality photos lead to{" "}
                      <span className="font-semibold text-accent">3× more enquiries</span>
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border border-line px-4 py-1.5 text-xs font-semibold text-ink-soft transition-colors hover:border-accent hover:text-accent"
                  >
                    Choose files
                  </button>
                </div>
              </Field>

              <div className="rounded-xl border border-brand-soft bg-brand-soft/40 px-5 py-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <Sparkle className="h-4 w-4 text-accent" />
                  AI listing assistant
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  After you submit, our AI will suggest improvements to your title and
                  description to maximise search visibility — reviewed by our team before going live.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 4: Contact & verification ────────────────────────────── */}
          {step === 4 && (
            <div className="space-y-8">
              <div className="space-y-5">
                <h3 className="font-serif text-lg font-semibold text-primary">Your details</h3>

                <Field label="You are listing as">
                  <PillRadio
                    options={OWNER_TYPES}
                    value={data.ownerType}
                    onChange={(v) => set("ownerType", v)}
                    className="mt-2"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <input
                      className={inputCls}
                      placeholder="Your legal name"
                      value={data.name}
                      onChange={(e) => set("name", e.target.value)}
                    />
                  </Field>
                  <Field label="Email">
                    <input
                      className={inputCls}
                      type="email"
                      placeholder="you@example.com"
                      value={data.email}
                      onChange={(e) => set("email", e.target.value)}
                    />
                  </Field>
                </div>

                <Field label="WhatsApp / phone number">
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={data.phone}
                    onChange={(e) => set("phone", e.target.value)}
                  />
                </Field>
              </div>

              {/* Verification tier */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-primary">Verification tier</h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    Verified listings receive{" "}
                    <span className="font-semibold text-primary">2.5× more enquiries</span> than
                    unverified ones.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {VERIF_TIERS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => set("verifTier", t.value)}
                      className={cn(
                        "relative flex flex-col rounded-xl border p-4 text-left transition-all",
                        data.verifTier === t.value
                          ? "border-accent bg-accent-soft ring-1 ring-accent"
                          : "border-line bg-surface-raised hover:border-accent/40",
                        t.highlight && data.verifTier !== t.value && "border-brand-soft bg-brand-soft/30",
                      )}
                    >
                      {t.highlight && (
                        <span className="absolute right-3 top-3 rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">
                          Popular
                        </span>
                      )}
                      <p className={cn("text-sm font-semibold", data.verifTier === t.value ? "text-accent" : "text-primary")}>
                        {t.label}
                      </p>
                      <p className="figure mt-1 text-base font-semibold text-primary">{t.price}</p>
                      <p className="mt-2 text-xs leading-relaxed text-ink-soft">{t.sub}</p>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-ink-soft">
                  Verification is optional but strongly recommended. Payment is handled
                  after submission. See{" "}
                  <Link href="/pricing" className="text-accent underline underline-offset-2">
                    full pricing details
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {/* ── Navigation buttons ────────────────────────────────────────── */}
          <div className={cn("mt-10 flex", step > 1 ? "justify-between" : "justify-end")}>
            {step > 1 && (
              <button
                type="button"
                onClick={back}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:text-primary"
              >
                <Chevron className="h-4 w-4 rotate-90" />
                Back
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={next}
                disabled={!canAdvance()}
                className={cn(
                  "flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold transition-all",
                  canAdvance()
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "cursor-not-allowed bg-line text-ink-soft",
                )}
              >
                Continue
                <Chevron className="h-4 w-4 -rotate-90" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!canAdvance() || pending}
                className={cn(
                  "flex items-center gap-2 rounded-full px-7 py-2.5 text-sm font-semibold transition-all",
                  canAdvance() && !pending
                    ? "bg-accent text-white hover:bg-accent-hover"
                    : "cursor-not-allowed bg-line text-ink-soft",
                )}
              >
                <CheckShield className="h-4 w-4" />
                {pending ? "Submitting…" : "Submit for verification"}
              </button>
            )}
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

          {step === 4 && error && (
            <p className="mt-4 rounded-lg border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          )}

          {step === 1 && (
            <p className="mt-4 text-center text-xs text-ink-soft">
              Already listed with us?{" "}
              <Link href="/pricing" className="text-accent hover:brightness-90">
                View agent plans →
              </Link>
            </p>
          )}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="bg-surface-muted py-14">
        <div className="container-page">
          <p className="eyebrow mb-6 text-center">How it works</p>
          <div className="grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: <Pin className="h-6 w-6 text-accent" />,
                step: "01",
                title: "Submit your listing",
                body: "Fill in the details, upload photos, and choose your verification tier. Takes less than 10 minutes.",
              },
              {
                icon: <CheckShield className="h-6 w-6 text-accent" />,
                step: "02",
                title: "We verify",
                body: "Our team checks photos, location, agent credentials and — for land — the title deed within 24 hours.",
              },
              {
                icon: <Phone className="h-6 w-6 text-accent" />,
                step: "03",
                title: "Enquiries arrive",
                body: "Serious buyers and tenants find your verified listing and contact you directly via enquiry, WhatsApp or call.",
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 rounded-2xl border border-line bg-surface-raised p-6 shadow-card">
                <div className="shrink-0">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft">
                    {s.icon}
                  </div>
                </div>
                <div>
                  <p className="figure text-xs font-semibold text-accent">{s.step}</p>
                  <h3 className="mt-1 font-semibold text-primary">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ────────────────────────────────────────────────────── */}
      <section className="bg-surface-dark py-12 text-center">
        <p className="font-semibold text-white">Need help listing or want a managed service?</p>
        <p className="mt-1 text-sm text-white/55">
          Talk to our team — we'll handle the whole process for you.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/pricing" variant="coral" size="sm">
            View agent plans
          </ButtonLink>
          <ButtonLink href="/" variant="inverse" size="sm">
            Back to home
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
