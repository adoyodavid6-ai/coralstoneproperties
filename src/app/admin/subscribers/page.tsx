import { getSubscribers, getSubscriberStats } from "@/lib/subscribers/service";
import { Panel } from "@/components/admin/ui";
import { SubscribersExport } from "@/components/admin/SubscribersExport";
import { cn } from "@/lib/cn";

// Live data from Supabase — always render per request.
export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="figure mt-2 text-2xl font-semibold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  confirmed: "bg-verified-soft text-verified ring-verified/20",
  pending: "bg-warning-soft text-warning ring-warning/20",
  unsubscribed: "bg-surface-muted text-ink-soft ring-line",
};

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
        STATUS_TONE[status] ?? STATUS_TONE.unsubscribed,
      )}
    >
      {status}
    </span>
  );
}

export default async function AdminSubscribers() {
  const [subscribers, stats] = await Promise.all([getSubscribers(), getSubscriberStats()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Subscribers</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everyone who signed up for CoralStone updates. Only <span className="font-medium">confirmed</span>{" "}
          subscribers receive broadcasts. This is live data from Supabase.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={String(stats.total)} sub="all signups" />
        <StatCard label="Confirmed" value={String(stats.confirmed)} sub="mailable audience" />
        <StatCard label="Pending" value={String(stats.pending)} sub="awaiting confirmation" />
        <StatCard label="Unsubscribed" value={String(stats.unsubscribed)} sub="opted out" />
      </div>

      <Panel
        title={`Subscriber list (${subscribers.length})`}
        actions={<SubscribersExport rows={subscribers} />}
      >
        {subscribers.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">
            No subscribers yet. Once Supabase is configured, signups from the site footer appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-3 py-3 font-medium">Email</th>
                  <th className="px-3 py-3 font-medium">Name</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Source</th>
                  <th className="px-3 py-3 font-medium">Subscribed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-surface-muted/50">
                    <td className="px-3 py-3 font-medium text-primary">{s.email}</td>
                    <td className="px-3 py-3 text-ink-soft">{s.name || "—"}</td>
                    <td className="px-3 py-3">
                      <StatusPill status={s.status} />
                    </td>
                    <td className="px-3 py-3 text-ink-soft">{s.source || "—"}</td>
                    <td className="figure px-3 py-3 text-ink-soft">{fmtDate(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}
