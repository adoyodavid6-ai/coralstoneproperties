"use client";

import Link from "next/link";
import { useBookings } from "@/lib/booking/BookingProvider";
import { formatMoney } from "@/lib/format";
import { ButtonLink } from "@/components/ui/Button";
import { Calendar, CheckShield } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default function BookingsPage() {
  const { bookings, ready, setStatus } = useBookings();

  return (
    <div className="container-page py-10">
      <header className="mb-6">
        <p className="eyebrow">Your stays</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-primary sm:text-4xl">My trips</h1>
        <p className="mt-2 text-ink-soft">Short-let reservations you&apos;ve made across East Africa.</p>
      </header>

      {!ready ? (
        <p className="text-ink-soft">Loading…</p>
      ) : bookings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line-strong bg-surface-raised p-14 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-accent-soft text-accent">
            <Calendar className="h-7 w-7" />
          </span>
          <h2 className="mt-5 font-serif text-xl text-primary">No trips yet</h2>
          <p className="mt-2 text-sm text-ink-soft">Find a short-let and book your dates.</p>
          <div className="mt-5">
            <ButtonLink href="/search?intent=short_let" variant="coral">Browse short-lets</ButtonLink>
          </div>
        </div>
      ) : (
        <ul className="space-y-4">
          {bookings.map((b) => (
            <li key={b.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
              <div className="min-w-0 flex-1">
                <Link href={`/property/${b.propertySlug}`} className="font-serif text-lg text-primary hover:text-accent">
                  {b.propertyTitle}
                </Link>
                <p className="figure mt-1 text-sm text-ink-soft">
                  {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)} · {b.nights} {b.unit}{b.nights > 1 ? "s" : ""} · {b.guests} guest{b.guests > 1 ? "s" : ""}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-soft">
                  <CheckShield className="h-3.5 w-3.5 text-verified" />
                  Confirmation <span className="figure">{b.id}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="figure text-lg font-semibold text-primary">{formatMoney(b.guestTotal, b.currency)}</p>
                <span
                  className={cn(
                    "mt-1 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1",
                    b.status === "cancelled"
                      ? "bg-surface-muted text-ink-soft ring-line"
                      : b.status === "paid_out"
                        ? "bg-verified-soft text-verified ring-verified/20"
                        : "bg-accent-soft text-accent ring-accent/20",
                  )}
                >
                  {b.status === "paid_out" ? "Completed" : b.status === "cancelled" ? "Cancelled" : "Confirmed"}
                </span>
                {b.status === "confirmed" && (
                  <button
                    onClick={() => setStatus(b.id, "cancelled")}
                    className="mt-2 block text-xs font-medium text-ink-soft hover:text-danger"
                  >
                    Cancel booking
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
