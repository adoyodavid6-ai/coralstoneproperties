import { getCampaigns, getSubscriberStats } from "@/lib/subscribers/service";
import { isResendConfigured } from "@/lib/email/resend";
import { Panel } from "@/components/admin/ui";
import { CampaignComposer } from "@/components/admin/CampaignComposer";

// Live data from Supabase — always render per request.
export const dynamic = "force-dynamic";

const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export default async function AdminEmail() {
  const [campaigns, stats] = await Promise.all([getCampaigns(), getSubscriberStats()]);
  const resendReady = isResendConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Email broadcasts</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Compose an update and send it to your{" "}
          <span className="font-medium text-primary">{stats.confirmed}</span> confirmed subscriber
          {stats.confirmed === 1 ? "" : "s"}. Every send is logged below.
        </p>
      </div>

      <Panel title="Compose broadcast">
        <CampaignComposer audience={stats.confirmed} resendReady={resendReady} />
      </Panel>

      <Panel title={`Sent history (${campaigns.length})`}>
        {campaigns.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">
            No broadcasts sent yet. Your first campaign will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-3 py-3 font-medium">Subject</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 text-right font-medium">Recipients</th>
                  <th className="px-3 py-3 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {campaigns.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-muted/50">
                    <td className="px-3 py-3 font-medium text-primary">{c.subject}</td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          c.status === "sent"
                            ? "inline-flex rounded-full bg-verified-soft px-2.5 py-0.5 text-xs font-semibold text-verified ring-1 ring-verified/20"
                            : "inline-flex rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-semibold text-warning ring-1 ring-warning/20"
                        }
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="figure px-3 py-3 text-right text-primary">{c.recipientCount}</td>
                    <td className="figure px-3 py-3 text-ink-soft">
                      {c.sentAt ? fmtDateTime(c.sentAt) : "—"}
                    </td>
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
