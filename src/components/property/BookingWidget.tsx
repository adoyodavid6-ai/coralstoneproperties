"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Property } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useBookings } from "@/lib/booking/BookingProvider";
import { calcBooking, nightsBetween } from "@/lib/booking/calc";
import { VerifiedStrip } from "@/components/ui/VerifiedBadge";
import { CheckShield, Star, Calendar, Users } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const inputCls =
  "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent/20";

/** Do two [in, out) date ranges overlap? */
function overlaps(aIn: string, aOut: string, bIn: string, bOut: string) {
  return aIn < bOut && bIn < aOut;
}

/**
 * Airbnb-style booking box for stays billed by the day: short-let homes (nights)
 * and event venues (days). Pick dates, see the full rate + fees breakdown, and
 * reserve. Guests are billed; owners settle minus the platform commission.
 */
export function BookingWidget({ property }: { property: Property }) {
  const { fees, createBooking, bookingsFor } = useBookings();

  // Venues are hired by the day and sized by guest capacity; short-lets by night.
  const perDay = property.pricePeriod === "day" || property.type === "venue";
  const unit = perDay ? "day" : "night";
  const capacity = property.capacity;
  const nUnit = (n: number) => `${n} ${unit}${n === 1 ? "" : "s"}`;

  const [today, setToday] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(perDay ? Math.min(100, capacity ?? 100) : 2);
  const [name, setName] = useState("");
  const [confirmed, setConfirmed] = useState<{ id: string; nights: number } | null>(null);

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

  const canBook = nights >= 1 && !clash && name.trim().length > 1;
  const money = (n: number) => formatMoney(n, property.currency);

  const reserve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canBook) return;
    const booking = createBooking({
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
    setConfirmed({ id: booking.id, nights });
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
          Demo reservation — the live product settles via M-Pesa / card and messages the host.
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

      {/* Guest name */}
      <label className="mt-4 block">
        <span className="block text-[11px] font-medium uppercase tracking-wide text-ink-soft">
          {perDay ? "Booking name" : "Your name"}
        </span>
        <input className={cn(inputCls, "mt-1")} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
      </label>

      <button
        type="submit"
        disabled={!canBook}
        className="mt-4 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-rose text-sm font-semibold text-ink-black transition-[filter] hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Calendar className="h-4 w-4" />
        {nights >= 1 ? `Reserve · ${money(breakdown.guestTotal)}` : "Reserve"}
      </button>
      <p className="mt-2 text-center text-xs text-ink-soft">You won&apos;t be charged yet — demo checkout.</p>

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
