"use client";

import { useState } from "react";
import { CheckShield, Flag } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { sendReportLead } from "@/lib/leads/actions";

const REASONS = [
  "Ghost listing — property does not exist",
  "Fake agent — agent is not licensed",
  "Misleading photos or description",
  "Wrong price or hidden fees",
  "Suspicious / forged title deed",
  "Duplicate listing",
  "Agent soliciting payment outside the platform",
  "Other",
];

const inputCls = "w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-primary placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

export default function ReportPage() {
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [form, setForm] = useState({ listingUrl: "", reason: "", details: "", name: "", email: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const ready = form.reason && form.details.length >= 20;

  async function submit() {
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const res = await sendReportLead({ ...form, company });
    setPending(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  }

  if (done) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-accent-soft text-accent">
          <CheckShield className="h-10 w-10" />
        </span>
        <h1 className="mt-6 font-serif text-3xl font-semibold text-primary">Report received</h1>
        <p className="mt-3 max-w-sm text-ink-soft">
          We review every report as quickly as we can. The listing will be
          flagged and suspended if evidence supports the claim.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/search" variant="coral">Continue browsing</ButtonLink>
          <ButtonLink href="/" variant="outline">Back to home</ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="bg-surface-dark px-6 py-14 text-center">
        <p className="eyebrow text-white/60">Help keep the platform safe</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white">Report a listing</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-white/65">
          If you encounter a suspicious listing, fake agent or fraudulent activity, report it here.
          We investigate every report as quickly as we can.
        </p>
      </section>

      <section className="container-page py-14">
        <div className="mx-auto max-w-xl">

          {/* What happens */}
          <div className="mb-8 rounded-xl border border-brand-soft bg-brand-soft/40 px-5 py-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Flag className="h-4 w-4 text-accent" />
              What happens after you report
            </p>
            <ul className="mt-2 space-y-1 text-xs text-ink-soft">
              <li>• The listing is flagged and placed under review immediately</li>
              <li>• We investigate as quickly as we can</li>
              <li>• The listing is suspended if the report is substantiated</li>
              <li>• Repeat offenders are permanently banned from the platform</li>
              <li>• You may be contacted for additional evidence</li>
            </ul>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-primary">
                Listing URL or reference <span className="text-xs font-normal text-ink-soft">(optional but helpful)</span>
              </label>
              <input className={inputCls} placeholder="e.g. https://coralstonesproperties.co.ke/property/xxx or listing ref" value={form.listingUrl} onChange={(e) => set("listingUrl", e.target.value)} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-primary">Reason for report</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => set("reason", r)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-all ${form.reason === r ? "border-accent bg-accent-soft text-accent" : "border-line text-ink-soft hover:border-accent/40 hover:text-ink"}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-primary">
                Details <span className="text-xs font-normal text-ink-soft">at least 20 characters</span>
              </label>
              <textarea
                className={`${inputCls} min-h-28 resize-y`}
                placeholder="Describe what you found. Include any evidence — inconsistent photos, suspicious requests, contact details that do not match…"
                value={form.details}
                onChange={(e) => set("details", e.target.value)}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-primary">Your name <span className="text-xs font-normal text-ink-soft">(optional)</span></label>
                <input className={inputCls} placeholder="Anonymous if preferred" value={form.name} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-primary">Your email <span className="text-xs font-normal text-ink-soft">(optional)</span></label>
                <input className={inputCls} type="email" placeholder="For follow-up if needed" value={form.email} onChange={(e) => set("email", e.target.value)} />
              </div>
            </div>

            <p className="text-xs text-ink-soft">
              Reports are anonymous unless you choose to provide contact details. False reports made
              in bad faith may result in account suspension.
            </p>

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
              className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-all ${ready && !pending ? "bg-accent text-white hover:bg-accent-hover" : "cursor-not-allowed bg-line text-ink-soft"}`}
            >
              <Flag className="h-4 w-4" />
              {pending ? "Submitting…" : "Submit report"}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
