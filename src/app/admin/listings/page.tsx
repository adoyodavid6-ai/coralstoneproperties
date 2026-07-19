"use client";

import { useMemo, useState } from "react";
import { useAdmin } from "@/lib/admin/AdminStore";
import { formatMoney } from "@/lib/format";
import { INTENT_LABEL, TYPE_LABEL } from "@/lib/labels";
import { STATUS_META } from "@/lib/admin/types";
import type { PropertyStatus, PropertyType } from "@/lib/types";
import { SmartImage } from "@/components/ui/SmartImage";
import { Button } from "@/components/ui/Button";
import { StatusPill, inputClass } from "@/components/admin/ui";
import { ListingEditor } from "@/components/admin/ListingEditor";
import { AddListingModal } from "@/components/admin/AddListingModal";
import { Search } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const STATUS_FILTERS: (PropertyStatus | "all")[] = [
  "all",
  "pending_review",
  "active",
  "under_offer",
  "withdrawn",
  "draft",
];

export default function AdminListings() {
  const { properties, setStatus, setBoost } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatusF] = useState<PropertyStatus | "all">("all");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return properties.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (type !== "all" && p.type !== type) return false;
      if (needle && !`${p.title} ${p.area} ${p.county}`.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [properties, q, status, type]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-primary">Listings</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {rows.length} of {properties.length} listings — edit price, status, boost and verification.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>+ New listing</Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-surface-raised p-3">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or location…"
            className={cn(inputClass, "pl-9")}
          />
        </div>
        <select className={cn(inputClass, "w-auto")} value={status} onChange={(e) => setStatusF(e.target.value as PropertyStatus | "all")}>
          {STATUS_FILTERS.map((s) => (
            <option key={s} value={s}>{s === "all" ? "All statuses" : STATUS_META[s].label}</option>
          ))}
        </select>
        <select className={cn(inputClass, "w-auto")} value={type} onChange={(e) => setType(e.target.value as PropertyType | "all")}>
          <option value="all">All types</option>
          {(Object.keys(TYPE_LABEL) as PropertyType[]).map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-line bg-surface-raised shadow-card">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Boost</th>
              <th className="px-4 py-3 font-medium">Verified</th>
              <th className="px-4 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((p) => (
              <tr key={p.id} className="hover:bg-surface-muted/50">
                <td className="px-4 py-3">
                  <button onClick={() => setEditingId(p.id)} className="flex items-center gap-3 text-left">
                    <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md">
                      <SmartImage src={p.images[0]} alt="" sizes="56px" />
                    </span>
                    <span className="min-w-0">
                      <span className="block max-w-56 truncate font-medium text-primary hover:text-accent">{p.title}</span>
                      <span className="figure block text-xs text-ink-soft">{p.area}, {p.county}</span>
                    </span>
                  </button>
                </td>
                <td className="px-4 py-3 text-ink-soft">
                  <span className="block text-primary">{TYPE_LABEL[p.type]}</span>
                  <span className="text-xs">{INTENT_LABEL[p.intent]}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="figure font-medium text-primary">{formatMoney(p.price, p.currency, { compact: true })}</span>
                  <span className="block text-xs text-ink-soft">{p.pricePeriod === "total" ? "" : `/${p.pricePeriod}`} {p.currency}</span>
                </td>
                <td className="px-4 py-3"><StatusPill status={p.status} /></td>
                <td className="px-4 py-3">
                  {p.boostTier ? (
                    <span className="rounded-full bg-accent-soft px-2 py-0.5 text-xs font-medium capitalize text-accent">{p.boostTier}</span>
                  ) : (
                    <button onClick={() => setBoost(p.id, "featured")} className="text-xs text-ink-soft hover:text-accent">— boost</button>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className="figure text-sm text-primary">{p.verified.length}</span>
                  <span className="text-xs text-ink-soft"> badges</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    {p.status === "pending_review" && (
                      <>
                        <button onClick={() => setStatus(p.id, "active")} className="rounded-lg bg-verified px-2.5 py-1 text-xs font-semibold text-white hover:brightness-95">Approve</button>
                        <button onClick={() => setStatus(p.id, "draft")} className="rounded-lg border border-line-strong px-2.5 py-1 text-xs font-medium text-ink-soft hover:text-danger">Reject</button>
                      </>
                    )}
                    <button onClick={() => setEditingId(p.id)} className="rounded-lg border border-line-strong px-2.5 py-1 text-xs font-medium text-primary hover:border-accent hover:text-accent">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-14 text-center text-sm text-ink-soft">No listings match those filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingId && <ListingEditor propertyId={editingId} onClose={() => setEditingId(null)} />}
      {adding && <AddListingModal onClose={() => setAdding(false)} />}
    </div>
  );
}
