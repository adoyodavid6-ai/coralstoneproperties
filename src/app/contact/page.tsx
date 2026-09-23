"use client";

import { useState } from "react";
import { CheckShield, Phone, Globe, Pin } from "@/components/ui/icons";
import { ButtonLink } from "@/components/ui/Button";
import { sendContactLead } from "@/lib/leads/actions";

const OFFICES = [
  { flag: "🇰🇪", city: "Nairobi", country: "Kenya", address: "Upper Hill, Nairobi", phone: "+254 700 000 000", email: "kenya@coralstone.co" },
];

const inputCls = "w-full rounded-lg border border-line bg-surface-raised px-3.5 py-2.5 text-sm text-primary placeholder:text-ink-soft/60 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 transition-colors";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [company, setCompany] = useState(""); // honeypot
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const ready = form.name && form.email && form.message;

  async function submit() {
    if (!ready || pending) return;
    setPending(true);
    setError("");
    const res = await sendContactLead({ ...form, company });
    setPending(false);
    if (res.ok) setSent(true);
    else setError(res.error ?? "Something went wrong. Please try again.");
  }

  return (
    <>
      <section className="bg-surface-dark px-6 py-16 text-center">
        <p className="eyebrow text-white/60">We&apos;re here to help</p>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-white sm:text-5xl">Contact us</h1>
        <p className="mx-auto mt-4 max-w-md text-base text-white/65">
          Whether you have a question about a listing, need help with verification, or want
          to list a property — our team across East Africa is ready.
        </p>
      </section>

      <section className="container-page py-14 sm:py-18">
        <div className="grid gap-12 lg:grid-cols-[1fr_420px]">

          {/* Form */}
          <div>
            <h2 className="font-serif text-2xl font-semibold text-primary">Send us a message</h2>
            <p className="mt-2 text-sm text-ink-soft">We respond within one business day.</p>

            {sent ? (
              <div className="mt-8 flex flex-col items-center rounded-2xl border border-line bg-surface-raised p-10 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-accent-soft">
                  <CheckShield className="h-7 w-7 text-accent" />
                </span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-primary">Message sent!</h3>
                <p className="mt-2 text-sm text-ink-soft">We&apos;ll be in touch within one business day.</p>
                <ButtonLink href="/" variant="coral" className="mt-6">Back to home</ButtonLink>
              </div>
            ) : (
              <div className="mt-6 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-primary">Full name</label>
                    <input className={inputCls} placeholder="Your name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-primary">Email address</label>
                    <input className={inputCls} type="email" placeholder="you@example.com" value={form.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-primary">Subject</label>
                  <select className={inputCls} value={form.subject} onChange={(e) => set("subject", e.target.value)}>
                    <option value="">Select a topic…</option>
                    <option>Question about a listing</option>
                    <option>I want to list a property</option>
                    <option>Verification query</option>
                    <option>Report fraud or a problem</option>
                    <option>Agent / agency account</option>
                    <option>Technical support</option>
                    <option>Partnership enquiry</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-primary">Message</label>
                  <textarea
                    className={`${inputCls} min-h-32 resize-y`}
                    placeholder="Tell us how we can help…"
                    value={form.message}
                    onChange={(e) => set("message", e.target.value)}
                  />
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
                  className={`rounded-full px-8 py-3 text-sm font-semibold transition-all ${ready && !pending ? "bg-accent text-white hover:bg-accent-hover" : "cursor-not-allowed bg-line text-ink-soft"}`}
                >
                  {pending ? "Sending…" : "Send message"}
                </button>
              </div>
            )}
          </div>

          {/* Side info */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-line bg-surface-raised p-6">
              <h3 className="font-semibold text-primary">WhatsApp support</h3>
              <p className="mt-1 text-sm text-ink-soft">For urgent listing queries, message us directly.</p>
              <a
                href="https://wa.me/254700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Phone className="h-4 w-4" />
                Open WhatsApp
              </a>
            </div>

            <div className="rounded-2xl border border-line bg-surface-raised p-6">
              <h3 className="font-semibold text-primary">General enquiries</h3>
              <p className="mt-2 text-sm text-ink-soft">
                <span className="text-primary font-medium">Email:</span>{" "}
                <a href="mailto:hello@coralstone.co" className="text-accent hover:brightness-90">hello@coralstone.co</a>
              </p>
              <p className="mt-1.5 text-sm text-ink-soft">
                <span className="text-primary font-medium">Support hours:</span> Mon–Fri 08:00–18:00 EAT
              </p>
            </div>

            <div className="rounded-2xl border border-line bg-surface-raised p-6">
              <h3 className="font-semibold text-primary">Fraud reports</h3>
              <p className="mt-1 text-sm text-ink-soft">
                To report a fraudulent listing urgently, use our dedicated fraud line.
              </p>
              <a href="mailto:fraud@coralstone.co" className="mt-3 inline-block text-sm font-semibold text-accent hover:brightness-90">
                fraud@coralstone.co →
              </a>
            </div>
          </div>
        </div>

        {/* Office locations */}
        <div className="mt-16">
          <h2 className="font-serif text-2xl font-semibold text-primary">Our offices</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {OFFICES.map((o) => (
              <div key={o.city} className="rounded-2xl border border-line bg-surface-raised p-5">
                <span className="text-2xl">{o.flag}</span>
                <h3 className="mt-2 font-semibold text-primary">{o.city}</h3>
                <p className="text-xs text-ink-soft">{o.country}</p>
                <div className="mt-3 space-y-1 text-sm text-ink-soft">
                  <p className="flex items-start gap-1.5"><Pin className="mt-0.5 h-3.5 w-3.5 shrink-0" />{o.address}</p>
                  <p className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 shrink-0" />{o.phone}</p>
                  <p className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 shrink-0" />
                    <a href={`mailto:${o.email}`} className="text-accent hover:brightness-90">{o.email}</a>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
