"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { Currency } from "@/lib/types";
import { calcBooking, nightsBetween } from "./calc";
import { DEFAULT_FEES, type Booking, type BookingFees, type BookingStatus } from "./types";

const KEY = "anchorstone_bookings_v1";

export interface CreateBookingInput {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  currency: Currency;
  unit: "night" | "day";
  nightlyRate: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  guestName: string;
}

interface BookingCtx {
  ready: boolean;
  fees: BookingFees;
  bookings: Booking[];
  createBooking: (input: CreateBookingInput) => Booking;
  setStatus: (id: string, status: BookingStatus) => void;
  updateFees: (patch: Partial<BookingFees>) => void;
  /** Bookings a given property already holds (for basic availability checks). */
  bookingsFor: (propertyId: string) => Booking[];
}

const Ctx = createContext<BookingCtx | null>(null);

interface Persisted {
  fees: BookingFees;
  bookings: Booking[];
}

let seq = 0;

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>({ fees: DEFAULT_FEES, bookings: [] });
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Persisted>;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState({
          fees: { ...DEFAULT_FEES, ...(parsed.fees ?? {}) },
          bookings: parsed.bookings ?? [],
        });
      }
    } catch {
      /* ignore malformed storage */
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* quota / private mode */
    }
  }, [state]);

  const createBooking: BookingCtx["createBooking"] = (input) => {
    const nights = nightsBetween(input.checkIn, input.checkOut);
    const breakdown = calcBooking(input.nightlyRate, nights, state.fees);
    seq += 1;
    const booking: Booking = {
      id: `bk_${Date.now().toString(36)}_${seq}`,
      propertyId: input.propertyId,
      propertySlug: input.propertySlug,
      propertyTitle: input.propertyTitle,
      currency: input.currency,
      unit: input.unit,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      guests: input.guests,
      guestName: input.guestName,
      status: "confirmed",
      createdAt: Date.now(),
      ...breakdown,
    };
    setState((s) => ({ ...s, bookings: [booking, ...s.bookings] }));
    return booking;
  };

  const setStatus: BookingCtx["setStatus"] = (id, status) =>
    setState((s) => ({
      ...s,
      bookings: s.bookings.map((b) => (b.id === id ? { ...b, status } : b)),
    }));

  const updateFees: BookingCtx["updateFees"] = (patch) =>
    setState((s) => ({ ...s, fees: { ...s.fees, ...patch } }));

  const bookingsFor: BookingCtx["bookingsFor"] = (propertyId) =>
    state.bookings.filter((b) => b.propertyId === propertyId && b.status !== "cancelled");

  return (
    <Ctx.Provider
      value={{ ready, fees: state.fees, bookings: state.bookings, createBooking, setStatus, updateFees, bookingsFor }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useBookings(): BookingCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBookings must be used within BookingProvider");
  return c;
}
