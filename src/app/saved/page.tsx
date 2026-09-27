"use client";

import { useEffect, useState } from "react";
import type { Property } from "@/lib/types";
import { fetchListingsByIds } from "@/lib/data/actions";
import { PropertyCard } from "@/components/ui/PropertyCard";
import { ButtonLink } from "@/components/ui/Button";

export default function SavedPage() {
  const [items, setItems] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let stored: string[] = [];
    try {
      stored = JSON.parse(localStorage.getItem("vpl.saved") ?? "[]");
    } catch {
      stored = [];
    }
    if (!stored.length) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }
    fetchListingsByIds(stored).then((r) => {
      setItems(r);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container-page py-8">
      <p className="eyebrow">Your shortlist</p>
      <h1 className="mt-2 font-serif text-3xl font-semibold text-primary">Saved properties</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Saved on this device. Sign-in sync across devices is coming with accounts.
      </p>

      {!loading && items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-line-strong bg-surface-raised p-14 text-center">
          <h2 className="font-serif text-xl text-primary">Nothing saved yet</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Tap the heart on any listing to save it here.
          </p>
          <ButtonLink href="/search" className="mt-6">Browse properties</ButtonLink>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <PropertyCard key={p.id} property={p} priority={i < 3} />
          ))}
        </div>
      )}
    </div>
  );
}
