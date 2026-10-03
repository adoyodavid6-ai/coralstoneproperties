"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";
import { sendPropertyEnquiry } from "@/lib/leads/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { convertBetween, formatMoney, resolveCurrency } from "@/lib/format";
import { Price } from "@/components/ui/Price";
import { SaveButton } from "@/components/ui/SaveButton";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedStrip } from "@/components/ui/VerifiedBadge";
import {
  Whatsapp,
  Phone,
  Calendar,
  CheckShield,
  Clock,
  Close,
  Star,
} from "@/components/ui/icons";

type Action = "enquire" | "book" | "reserve" | "offer";

const ACTION_COPY: Record<Action, { title: string; cta: string; note: string }> = {
  enquire: {
    title: "Enquire about this property",
    cta: "Send enquiry",
    note: "Your contact details are shared only with the verified agent for this listing.",
  },
  book: {
    title: "Book a viewing",
    cta: "Request viewing",
    note: "Pick a slot and the agent confirms by SMS and email. Virtual viewings available.",
  },
  reserve: {
    title: "Reserve this property",
    cta: "Request to reserve",
    note: "Tell the agent you'd like to reserve. They'll confirm the deposit amount and payment options — no payment is taken on this step.",
  },
  offer: {
    title: "Make an offer",
    cta: "Submit offer",
    note: "Offers are logged with a full audit trail. The agent can accept, counter or decline.",
  },
};

export function ConversionRail({ property }: { property: Property }) {
  const { t, currency } = useLocale();
  const target = resolveCurrency(currency, property.currency);
  const [action, setAction] = useState<Action | null>(null);
  const agent = property.agent;

  const waText = encodeURIComponent(
    `Hi ${agent.name}, I'm interested in "${property.title}" on CoralStones Properties Listings.`,
  );

  const open = (a: Action) => setAction(a);

  return (
    <div className="rounded-2xl bg-surface-raised/80 p-5 shadow-card ring-1 ring-line backdrop-blur-xl">
      {/* Price */}
      <div className="flex items-center justify-between gap-2">
        <Price property={property} className="text-2xl font-semibold text-primary" />
        <SaveButton id={property.id} variant="inline" />
      </div>
      {property.previousPrice && (
        <p className="mt-1 text-sm text-ink-soft">
          <span className="figure line-through">
            {formatMoney(convertBetween(property.previousPrice, property.currency, target), target)}
          </span>{" "}
          <span className="font-medium text-verified">reduced</span>
        </p>
      )}

      {/* Primary CTAs */}
      <div className="mt-4 grid gap-2.5">
        <button
          onClick={() => open("enquire")}
          className="h-12 rounded-full bg-ink-black text-sm font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {t("pdp.enquire")}
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <a
            href={`https://wa.me/${agent.whatsapp}?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-verified text-sm font-medium text-white transition hover:brightness-95"
          >
            <Whatsapp className="h-4 w-4" />
            {t("pdp.whatsapp")}
          </a>
          <a
            href={`tel:${agent.phone}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
          >
            <Phone className="h-4 w-4" />
            {t("pdp.call")}
          </a>
        </div>
        <button
          onClick={() => open("book")}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line-strong text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
        >
          <Calendar className="h-4 w-4" />
          {t("pdp.book")}
        </button>
        <div className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => open("reserve")}
            className="h-11 rounded-full bg-accent text-sm font-medium text-white transition-colors hover:bg-accent-hover"
          >
            {t("pdp.reserve")}
          </button>
          <button
            onClick={() => open("offer")}
            className="h-11 rounded-full border border-accent text-sm font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            {t("pdp.offer")}
          </button>
        </div>
      </div>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
        <CheckShield className="h-3.5 w-3.5 text-verified" />
        Every enquiry is logged so your request is traceable and nothing slips through.
      </p>

      {/* Agent card */}
      <div className="mt-5 border-t border-line pt-5">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 overflow-hidden rounded-full">
            <Avatar name={agent.name} src={agent.avatarUrl} />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-primary">{agent.name}</p>
            <p className="truncate text-sm text-ink-soft">{agent.agency}</p>
          </div>
        </div>
        <div className="mt-3">
          <VerifiedStrip kinds={agent.verified} size="sm" />
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-surface-muted px-3 py-2">
            <dt className="flex items-center gap-1 text-xs text-ink-soft">
              <Clock className="h-3.5 w-3.5" /> Responds in
            </dt>
            <dd className="figure font-semibold text-primary">~{agent.responseMins} min</dd>
          </div>
          <div className="rounded-lg bg-surface-muted px-3 py-2">
            <dt className="flex items-center gap-1 text-xs text-ink-soft">
              <Star className="h-3.5 w-3.5" /> Completed
            </dt>
            <dd className="figure font-semibold text-primary">{agent.completedDeals} deals</dd>
          </div>
        </dl>
      </div>

      {/* Modal */}
      {action && (
        <ActionModal action={action} property={property} onClose={() => setAction(null)} />
      )}
    </div>
  );
}

function ActionModal({
  action,
  property,
  onClose,
}: {
  action: Action;
  property: Property;
  onClose: () => void;
}) {
  const copy = ACTION_COPY[action];
  const [form, setForm] = useState({ name: "", phone: "", offer: "", message: "" });
  const [company, setCompany] = useState(""); // honeypot
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending") return;
    if (!form.name.trim() || !form.phone.trim()) {
      setError("Please add your name and phone number.");
      return;
    }
    setStatus("sending");
    setError("");
    const res = await sendPropertyEnquiry({
      action,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyUrl: typeof window !== "undefined" ? window.location.href : undefined,
      agentName: property.agent?.name,
      name: form.name,
      phone: form.phone,
      offer: action === "offer" ? form.offer : undefined,
      message: form.message,
      company,
    });
    if (res.ok) setStatus("done");
    else {
      setStatus("error");
      setError(res.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-primary/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-surface-raised p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="font-serif text-xl text-primary">{copy.title}</h3>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-full border border-line-strong text-primary"
            aria-label="Close"
          >
            <Close className="h-5 w-5" />
          </button>
        </div>

        {status === "done" ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified-soft text-verified">
              <CheckShield className="h-8 w-8" />
            </span>
            <p className="mt-4 font-serif text-lg text-primary">Request sent</p>
            <p className="mt-1 text-sm text-ink-soft">
              Your request has reached the CoralStones team, who will pass it to the verified
              agent for this listing. We&apos;ll be in touch shortly.
            </p>
            <button
              onClick={onClose}
              className="mt-5 rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white"
            >
              Done
            </button>
          </div>
        ) : (
          <form className="mt-4 space-y-3" onSubmit={submit}>
            <input
              required
              placeholder="Your name"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            <input
              required
              type="tel"
              placeholder="Phone (with country code)"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              className="figure w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
            {action === "offer" && (
              <input
                type="text"
                inputMode="numeric"
                placeholder="Your offer amount"
                value={form.offer}
                onChange={(e) => set("offer", e.target.value)}
                className="figure w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            )}
            <textarea
              rows={3}
              placeholder="Message (optional)"
              value={form.message}
              onChange={(e) => set("message", e.target.value)}
              className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
            />
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
            <p className="text-xs text-ink-soft">{copy.note}</p>
            {error && (
              <p className="rounded-lg border border-danger/30 bg-danger-soft px-3 py-2 text-xs text-danger" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full bg-ink-black py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
            >
              {status === "sending" ? "Sending…" : copy.cta}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
