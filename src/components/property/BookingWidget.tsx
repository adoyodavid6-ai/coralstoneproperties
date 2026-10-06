"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Property } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useBookings } from "@/lib/booking/BookingProvider";
import { calcBooking, nightsBetween } from "@/lib/booking/calc";
import { VerifiedStrip } from "@/components/ui/VerifiedBadge";
import { CheckShield, Star, Calendar, Users } from "@/components/ui/icons";
import { cn } from "@/lib/cn";
import { startBookingPayment, startMpesaBooking } from "@/lib/payment/actions";
import { normalizePhone } from "@/lib/payment/phone";
import { pollMpesa } from "@/lib/payment/poll";

const inputCls =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

/** Do two [in, out) date ranges overlap? */
function overlaps(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

/**
 * Airbnb-style booking box for stays billed by the day: short-let homes (nights)
 * and event venues (days). Pick dates, see the full rate + fees breakdown, and
 * reserve. Guests are billed; owners settle minus the platform commission.
 */
export function BookingWidget({ property }: { property: Property }) {
  const { fees, createBooking, bookingsFor } = useBookings();

  const perDay = property.pricePeriod === "day" || property.type === "venue";
  const unit: "night" | "day" = perDay ? "day" : "night";
  const capacity = property.capacity;
  const nUnit = (n: number) => `${n} ${unit}${n === 1 ? "" : "s"}`;

  const [today, setToday] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(perDay ? Math.min(100, capacity ?? 100) : 2);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // M-Pesa only settles in KES; card/Flutterwave covers every currency.
  const mpesaAvailable = property.currency === "KES";
  const [method, setMethod] = useState<"card" | "mpesa">(mpesaAvailable ? "mpesa" : "card");
  const [payError, setPayError] = useState("");
  const [waitMsg, setWaitMsg] = useState(""); // M-Pesa STK "check your phone" status
  const [confirmed, setConfirmed] = useState<
    { id: string; nights: number; demo: boolean; method: "card" | "mpesa" } | null
  >(null);
  const [isPending, startTransition] = useTransition();

  // Guard against setState after unmount (navigation during the ~2min M-Pesa poll).
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setToday(new Date().toISOString().slice(0, 10));
  }, []);

  const maxGuests = property.beds ? Math.max(2, property.beds * 2) : 4;
  const nights = nightsBetween(checkIn, checkOut);
  const breakdown = useMemo(
    () => calcBooking(property.price, nights, fees),
    [property.price, nights, fees],
  );

  const clash = useMemo(() => {
    if (nights < 1) return false;
    return bookingsFor(property.id).some((b) => overlaps(checkIn, checkOut, b.checkIn, b.checkOut));
  }, [checkIn, checkOut, nights, bookingsFor, property.id]);

  const emailValid = email === "" || isEmail(email);
  const phoneValid = normalizePhone(phone) !== null;
  const money = (n: number) => formatMoney(n, property.currency);
  const baseOk = nights >= 1 && !clash && name.trim().length > 1;
  const canBook = method === "mpesa" ? baseOk && phoneValid : baseOk && isEmail(email);

  const commonInput = () => ({
    propertyId: property.id,
    propertySlug: property.slug,
    propertyTitle: property.title,
    currency: property.currency,
    unit,
    checkIn,
    checkOut,
    guests,
    guestName: name.trim(),
    guestEmail: email.trim(),
    breakdown,
  });

  // Mirror a confirmed booking into local "My trips" (the bookings page is
  // device-local). The Flutterwave redirect path can't do this; M-Pesa & demo can.
  const recordLocalBooking = () =>
    createBooking({
      propertyId: property.id,
      propertySlug: property.slug,
      propertyTitle: property.title,
      currency: property.currency,
      unit,
      nightlyRate: property.price,
      checkIn,
      checkOut,
      guests,
      guestName: name.trim(),
    });

  const reserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBook || isPending) return;
    setPayError("");
    setWaitMsg("");

    startTransition(async () => {
      if (method === "card") {
        const result = await startBookingPayment(commonInput());
        if ("paymentUrl" in result) {
          // Real payment — redirect to the Flutterwave hosted page (even if unmounting).
          window.location.href = result.paymentUrl;
          return;
        }
        if (!alive.current) return;
        if (!result.ok) {
          setPayError(result.error);
          return;
        }
        // Demo fallback (Flutterwave not configured).
        recordLocalBooking();
        setConfirmed({ id: result.bookingId, nights, demo: true, method: "card" });
        return;
      }

      // M-Pesa: trigger the STK push, then poll until it settles.
      const started = await startMpesaBooking({ ...commonInput(), phone: phone.trim() });
      if (!alive.current) return;
      if (!started.ok) {
        setPayError(started.error);
        return;
      }
      if ("demo" in started) {
        recordLocalBooking();
        setConfirmed({ id: started.bookingId, nights, demo: true, method: "mpesa" });
        return;
      }

      setWaitMsg(`Check your phone — enter your M-Pesa PIN to pay ${money(breakdown.guestTotal)}.`);
      const final = await pollMpesa(started.checkoutRequestId);
      if (!alive.current) return;
      setWaitMsg("");
      if (final.kind === "paid") {
        recordLocalBooking();
        setConfirmed({ id: final.bookingId, nights, demo: false, method: "mpesa" });
        return;
      }
      if (final.kind === "failed") {
        setPayError(final.error);
        return;
      }
      setPayError(
        "We didn't get confirmation in time. If you completed the payment it will reflect shortly — check My Trips or contact support.",
      );
    });
  };

  if (confirmed) {
    return (
      <div className="rounded-2xl bg-surface-raised/80 p-6 text-center shadow-card ring-1 ring-line backdrop-blur-xl">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-verified-soft text-verified">
          <CheckShield className="h-8 w-8" />
        </span>
        <p className="mt-4 font-serif text-lg text-primary">
          {perDay ? "Date reserved" : "Booking confirmed"}
        </p>
        <p className="mt-1 text-sm text-ink-soft">
          {nUnit(confirmed.nights)} · {money(breakdown.guestTotal)} paid.
          Confirmation <span className="figure">{confirmed.id}</span>.
        </p>
        <p className="mt-2 text-xs text-ink-soft">
          {confirmed.demo
            ? "Demo reservation — payment gateway not yet active."
            : confirmed.method === "mpesa"
              ? "Paid via M-Pesa. Saved to your trips."
              : "Payment received. Saved to your trips."}
        </p>
        <Link
          href="/bookings"
          className="mt-5 inline-flex rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover"
        >
          {perDay ? "View your bookings" : "View your trips"}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={reserve} className="rounded-2xl bg-surface-raised/80 p-5 shadow-card ring-1 ring-line backdrop-blur-xl">
      <div className="flex items-baseline justify-between gap-2">
        <p>
          <span className="figure text-2xl font-semibold text-primary">{money(property.price)}</span>
          <span className="text-sm text-ink-soft"> / {unit}</span>
        </p>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-accent">
          <Star className="h-3.5 w-3.5" /> {perDay ? "Event venue" : "Short-let"}
        </span>
      </div>

      {perDay && capacity != null && (
        <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-soft">
          <Users className="h-4 w-4 text-accent" />
          Hosts up to <span className="figure text-primary">{capacity}</span> guests
        </p>
      )}

      {/* Dates */}
      <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-lg border border-line-strong">
        <label className="border-r border-line-strong p-2.5">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            {perDay ? "From" : "Check-in"}
          </span>
          <input
            type="date"
            value={checkIn}
            min={today || undefined}
            onChange={(e) => setCheckIn(e.target.value)}
            className="figure mt-0.5 w-full bg-transparent text-sm text-primary outline-none"
          />
        </label>
        <label className="p-2.5">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
            {perDay ? "To" : "Check-out"}
          </span>
          <input
            type="date"
            value={checkOut}
            min={checkIn || today || undefined}
            onChange={(e) => setCheckOut(e.target.value)}
            className="figure mt-0.5 w-full bg-transparent text-sm text-primary outline-none"
          />
        </label>
      </div>

      {/* Guests */}
      <label className="mt-3 block">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {perDay ? "Expected guests" : "Guests"}
        </span>
        {perDay ? (
          <input
            type="number"
            min={1}
            max={capacity ?? undefined}
            value={guests}
            onChange={(e) => {
              const v = Number(e.target.value) || 1;
              setGuests(Math.max(1, capacity ? Math.min(capacity, v) : v));
            }}
            className={cn(inputCls, "figure mt-1")}
          />
        ) : (
          <select className={cn(inputCls, "mt-1")} value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
            {Array.from({ length: maxGuests }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? "s" : ""}</option>
            ))}
          </select>
        )}
      </label>

      {clash && (
        <p className="mt-3 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
          Those dates overlap an existing booking — please choose another {unit}.
        </p>
      )}

      {/* Breakdown */}
      {nights >= 1 && !clash && (
        <dl className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
          <Row label={`${money(property.price)} × ${nUnit(nights)}`} value={money(breakdown.nightsSubtotal)} />
          <Row label={perDay ? "Cleaning & setup" : "Cleaning fee"} value={money(breakdown.cleaningFee)} />
          <Row label="Service fee" value={money(breakdown.guestServiceFee)} />
          {breakdown.tax > 0 && <Row label="Tourism levy" value={money(breakdown.tax)} />}
          <div className="flex items-center justify-between border-t border-line pt-2.5 font-semibold text-primary">
            <dt>Total</dt>
            <dd className="figure">{money(breakdown.guestTotal)}</dd>
          </div>
        </dl>
      )}

      {/* Guest details */}
      <label className="mt-4 block">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {perDay ? "Booking name" : "Your name"}
        </span>
        <input className={cn(inputCls, "mt-1")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      </label>

      <label className="mt-3 block">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {method === "mpesa" ? "Email (optional)" : "Email"}
        </span>
        <input
          type="email"
          className={cn(inputCls, "mt-1", !emailValid && "border-danger focus:border-danger focus:ring-danger/20")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
        {!emailValid && <p className="mt-1 text-xs text-danger">Enter a valid email address.</p>}
      </label>

      {/* Payment method — M-Pesa STK push (KES listings) or card/other via Flutterwave. */}
      {mpesaAvailable && (
        <div className="mt-4">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">Pay with</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {(["mpesa", "card"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  method === m
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line-strong text-primary hover:border-accent",
                )}
              >
                {m === "mpesa" ? "M-Pesa" : "Card / other"}
              </button>
            ))}
          </div>
        </div>
      )}

      {method === "mpesa" && (
        <label className="mt-3 block">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">M-Pesa phone number</span>
          <input
            type="tel"
            inputMode="numeric"
            className={cn(inputCls, "figure mt-1", phone !== "" && !phoneValid && "border-danger focus:border-danger focus:ring-danger/20")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="07XX XXX XXX"
          />
          {phone !== "" && !phoneValid && (
            <p className="mt-1 text-xs text-danger">Enter a valid Safaricom number.</p>
          )}
        </label>
      )}

      {waitMsg && (
        <p className="mt-3 flex items-center gap-2 rounded-lg bg-accent-soft px-3 py-2 text-xs text-accent">
          <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {waitMsg}
        </p>
      )}

      {payError && (
        <p className="mt-3 rounded-lg bg-danger-soft px-3 py-2 text-xs text-danger">{payError}</p>
      )}

      <button
        type="submit"
        disabled={!canBook || isPending}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose text-sm font-semibold text-ink-black transition-[filter] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          <Calendar className="h-4 w-4" />
        )}
        {isPending
          ? method === "mpesa"
            ? "Waiting for M-Pesa…"
            : "Redirecting to payment…"
          : nights >= 1
            ? `Pay ${money(breakdown.guestTotal)}${method === "mpesa" ? " with M-Pesa" : ""}`
            : "Reserve"}
      </button>
      <p className="mt-2 text-center text-xs text-ink-soft">
        {method === "mpesa"
          ? "Lipa na M-Pesa · a PIN prompt will pop up on your phone"
          : "Secure checkout via Flutterwave · Visa, Mastercard, mobile money"}
      </p>

      {/* Host trust */}
      <div className="mt-5 border-t border-line pt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-primary">Hosted by {property.agent.name}</span>
        </div>
        <div className="mt-2"><VerifiedStrip kinds={property.agent.verified} size="sm" /></div>
      </div>
    </form>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-soft">
      <dt>{label}</dt>
      <dd className="figure text-primary">{value}</dd>
    </div>
  );
}
