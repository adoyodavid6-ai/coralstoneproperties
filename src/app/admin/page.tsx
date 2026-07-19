"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAdmin } from "@/lib/admin/AdminStore";
import { formatMoney } from "@/lib/format";
import { STATUS_META } from "@/lib/admin/types";
import type { PropertyStatus } from "@/lib/types";
import { Panel, StatusPill } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

function StatCard({
  label,
  value,
  sub,
  href,
}: {
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card transition-shadow hover:shadow-float">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="figure mt-2 text-3xl font-semibold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export default function AdminOverview() {
  const { properties, reports, pricing, agents, audit } = useAdmin();

  const stats = useMemo(() => {
    const byStatus = {} as Record<PropertyStatus, number>;
    for (const p of properties) byStatus[p.status] = (byStatus[p.status] ?? 0) + 1;
    const featured = properties.filter((p) => p.boostTier === "featured").length;
    const spotlight = properties.filter((p) => p.boostTier === "spotlight").length;
    const feeOf = (id: string) => pricing.boostTiers.find((b) => b.id === id)?.feePerWeek ?? 0;
    const weeklyBoost = featured * feeOf("featured") + spotlight * feeOf("spotlight");
    const verified = properties.filter((p) =>
      p.verified.some((v) => v.kind === "listing" || v.kind === "title"),
    ).length;
    return { byStatus, featured, spotlight, weeklyBoost, verified };
  }, [properties, pricing]);

  const openReports = reports.filter((r) => r.status === "open").length;
  const pending = stats.byStatus.pending_review ?? 0;

  const statusOrder: PropertyStatus[] = [
    "active",
    "pending_review",
    "under_offer",
    "reserved",
    "withdrawn",
    "draft",
    "sold",
    "let",
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Overview</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything on the site at a glance — {properties.length} listings, {agents.length} agents.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Total listings" value={properties.length} href="/admin/listings" />
        <StatCard label="Active" value={stats.byStatus.active ?? 0} sub="live on the site" />
        <StatCard
          label="Pending review"
          value={pending}
          sub={pending ? "needs moderation" : "queue clear"}
          href="/admin/moderation"
        />
        <StatCard label="Open reports" value={openReports} href="/admin/moderation" />
        <StatCard label="Verified" value={stats.verified} sub="listing/title checked" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        {/* Monetisation snapshot */}
        <Panel title="Monetisation snapshot" actions={<Link href="/admin/pricing" className="text-sm font-medium text-accent hover:underline">Manage pricing</Link>}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-ink-soft">Boost revenue / week</p>
              <p className="figure mt-1 text-2xl font-semibold text-primary">
                {formatMoney(stats.weeklyBoost, "KES", { compact: true })}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                {stats.featured} featured · {stats.spotlight} spotlight
              </p>
            </div>
            {pricing.plans.map((plan) => (
              <div key={plan.id}>
                <p className="text-xs uppercase tracking-wide text-ink-soft">{plan.name} / mo</p>
                <p className="figure mt-1 text-2xl font-semibold text-primary">
                  {plan.pricePerMonth === 0 ? "Free" : formatMoney(plan.pricePerMonth, plan.currency, { compact: true })}
                </p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  {plan.listingCap == null ? "Unlimited listings" : `${plan.listingCap} listings`}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {/* Status breakdown */}
        <Panel title="Listings by status">
          <ul className="space-y-2.5">
            {statusOrder
              .filter((s) => (stats.byStatus[s] ?? 0) > 0)
              .map((s) => {
                const n = stats.byStatus[s] ?? 0;
                const pct = Math.round((n / properties.length) * 100);
                return (
                  <li key={s} className="flex items-center gap-3">
                    <StatusPill status={s} />
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className={cn("h-full rounded-full", STATUS_META[s].tone === "good" ? "bg-verified" : "bg-accent")}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="figure w-8 text-right text-sm text-primary">{n}</span>
                  </li>
                );
              })}
          </ul>
        </Panel>
      </div>

      {/* Recent activity */}
      <Panel title="Recent activity" actions={<Link href="/admin/settings" className="text-sm font-medium text-accent hover:underline">Full audit log</Link>}>
        {audit.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">
            No admin actions yet — changes you make will be logged here.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {audit.slice(0, 8).map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="text-primary">
                  <span className="figure text-xs text-ink-soft">{a.action}</span> — {a.target}:{" "}
                  <span className="text-ink-soft">{a.detail}</span>
                </span>
                <time className="figure shrink-0 text-xs text-ink-soft">
                  {new Date(a.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
