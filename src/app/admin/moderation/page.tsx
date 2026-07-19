"use client";

import Link from "next/link";
import { useAdmin } from "@/lib/admin/AdminStore";
import { formatMoney, relativeDays } from "@/lib/format";
import { TYPE_LABEL, INTENT_LABEL } from "@/lib/labels";
import { SmartImage } from "@/components/ui/SmartImage";
import { Panel, StatusPill } from "@/components/admin/ui";
import { Flag } from "@/components/ui/icons";

export default function AdminModeration() {
  const { properties, reports, setStatus, resolveReport } = useAdmin();

  const pending = properties.filter((p) => p.status === "pending_review");
  const openReports = reports.filter((r) => r.status === "open");
  const byId = (id: string) => properties.find((p) => p.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Moderation</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Approve new listings before they go live, and act on reported ones. AI proposes, you dispose.
        </p>
      </div>

      {/* Pending review */}
      <Panel title={`Pending review (${pending.length})`}>
        {pending.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">Queue is clear — nothing awaiting review.</p>
        ) : (
          <ul className="divide-y divide-line">
            {pending.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-4 py-3">
                <span className="relative h-14 w-20 shrink-0 overflow-hidden rounded-md">
                  <SmartImage src={p.images[0]} alt="" sizes="80px" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-primary">{p.title}</p>
                  <p className="figure text-xs text-ink-soft">
                    {TYPE_LABEL[p.type]} · {INTENT_LABEL[p.intent]} · {formatMoney(p.price, p.currency, { compact: true })} · {p.area}, {p.county}
                  </p>
                  <p className="text-xs text-ink-soft">Submitted {relativeDays(p.listedOn)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/admin/listings" className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-primary hover:border-accent hover:text-accent">Review</Link>
                  <button onClick={() => setStatus(p.id, "draft")} className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-danger">Reject</button>
                  <button onClick={() => setStatus(p.id, "active")} className="rounded-lg bg-verified px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95">Approve &amp; publish</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* Reports */}
      <Panel title={`Reported listings (${openReports.length})`}>
        {openReports.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">No open reports.</p>
        ) : (
          <ul className="divide-y divide-line">
            {openReports.map((r) => {
              const p = byId(r.propertyId);
              return (
                <li key={r.id} className="flex flex-wrap items-start gap-4 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger">
                    <Flag className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-primary">
                      {r.reason}
                      {p && <span className="ml-2 align-middle"><StatusPill status={p.status} /></span>}
                    </p>
                    <p className="mt-0.5 text-sm text-ink-soft">{r.detail}</p>
                    <p className="mt-1 text-xs text-ink-soft">
                      On <span className="text-primary">{p?.title ?? "unknown listing"}</span> · reported {relativeDays(r.reportedOn)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => resolveReport(r.id, "dismiss")} className="rounded-lg border border-line-strong px-3 py-1.5 text-xs font-medium text-ink-soft hover:text-primary">Dismiss</button>
                    <button onClick={() => resolveReport(r.id, "takedown")} className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95">Uphold &amp; withdraw</button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
