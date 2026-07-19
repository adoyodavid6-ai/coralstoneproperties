"use client";

import { useAdmin } from "@/lib/admin/AdminStore";
import { Panel, Toggle } from "@/components/admin/ui";

export default function AdminSettings() {
  const { flags, audit, toggleFlag } = useAdmin();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Platform feature flags and the tamper-evident action log.</p>
      </div>

      {/* Feature flags */}
      <Panel title="Feature flags">
        <ul className="divide-y divide-line">
          {flags.map((f) => (
            <li key={f.id} className="flex items-center justify-between gap-4 py-3.5">
              <div>
                <p className="font-medium text-primary">{f.label}</p>
                <p className="text-sm text-ink-soft">{f.description}</p>
              </div>
              <Toggle on={f.enabled} onChange={() => toggleFlag(f.id)} label={f.label} />
            </li>
          ))}
        </ul>
      </Panel>

      {/* Audit log */}
      <Panel title={`Audit log (${audit.length})`}>
        {audit.length === 0 ? (
          <p className="py-6 text-center text-sm text-ink-soft">No actions recorded yet.</p>
        ) : (
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 border-b border-line bg-surface-raised text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="py-2 pr-3 font-medium">When</th>
                  <th className="py-2 pr-3 font-medium">Action</th>
                  <th className="py-2 pr-3 font-medium">Target</th>
                  <th className="py-2 font-medium">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {audit.map((a) => (
                  <tr key={a.id}>
                    <td className="figure whitespace-nowrap py-2 pr-3 text-xs text-ink-soft">
                      {new Date(a.ts).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="figure py-2 pr-3 text-xs text-accent">{a.action}</td>
                    <td className="py-2 pr-3 text-primary">{a.target}</td>
                    <td className="py-2 text-ink-soft">{a.detail}</td>
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
