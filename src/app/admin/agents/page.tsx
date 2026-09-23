"use client";

import { useAdmin } from "@/lib/admin/AdminStore";
import type { VerificationKind } from "@/lib/types";
import { VERIFICATION_META } from "@/lib/labels";
import { Avatar } from "@/components/ui/Avatar";
import { Panel, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/cn";

const AGENT_KINDS: VerificationKind[] = ["agent", "agency", "developer"];

export default function AdminAgents() {
  const { agents, properties, updateAgent, toggleAgentVerification } = useAdmin();

  const listingCount = (agentId: string) => properties.filter((p) => p.agent.id === agentId).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Agents &amp; agencies</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Grant or revoke verification and adjust the earned response/deal stats.
        </p>
      </div>

      <Panel>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-3 py-3 font-medium">Agent</th>
                <th className="px-3 py-3 font-medium">Verification</th>
                <th className="px-3 py-3 font-medium">Response (min)</th>
                <th className="px-3 py-3 font-medium">Deals</th>
                <th className="px-3 py-3 font-medium">Listings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {agents.map((a) => (
                <tr key={a.id} className="hover:bg-surface-muted/50">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full">
                        <Avatar name={a.name} src={a.avatarUrl} sizes="40px" />
                      </span>
                      <span>
                        <span className="block font-medium text-primary">{a.name}</span>
                        <span className="block text-xs text-ink-soft">{a.agency}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {AGENT_KINDS.map((k) => {
                        const on = a.verified.includes(k);
                        return (
                          <button
                            key={k}
                            onClick={() => toggleAgentVerification(a.id, k)}
                            title={VERIFICATION_META[k].guarantee}
                            className={cn(
                              "rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
                              on ? "bg-verified text-white" : "border border-line-strong text-ink-soft hover:border-verified hover:text-verified",
                            )}
                          >
                            {on ? "✓ " : ""}{k}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className={cn(inputClass, "figure w-20")}
                      inputMode="numeric"
                      value={a.responseMins}
                      onChange={(e) => updateAgent(a.id, { responseMins: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <input
                      className={cn(inputClass, "figure w-20")}
                      inputMode="numeric"
                      value={a.completedDeals}
                      onChange={(e) => updateAgent(a.id, { completedDeals: Number(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <span className="figure text-primary">{listingCount(a.id)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
