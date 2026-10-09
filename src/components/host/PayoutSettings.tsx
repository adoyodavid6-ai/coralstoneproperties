"use client";

/**
 * Host payout-method manager. Shows masked accounts only (the real number never
 * leaves the server) and lets the host add an M-Pesa or bank destination, pick
 * a default, or remove one. All mutations go through the payoutAccounts server
 * actions; we refresh the server component after each.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPayoutAccount,
  setDefaultPayoutAccount,
  disablePayoutAccount,
  type MaskedPayoutAccount,
} from "@/lib/host/payoutAccounts";

export function PayoutSettings({ accounts }: { accounts: MaskedPayoutAccount[] }) {
  const router = useRouter();
  const [method, setMethod] = useState<"mpesa" | "bank">("mpesa");
  const [form, setForm] = useState({ msisdn: "", bankName: "", accountName: "", accountNumber: "", bankCode: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const res = await addPayoutAccount({ method, ...form });
    setBusy(false);
    if (res.ok) {
      setForm({ msisdn: "", bankName: "", accountName: "", accountNumber: "", bankCode: "" });
      router.refresh();
    } else {
      setError(res.error);
    }
  }

  async function makeDefault(id: string) {
    await setDefaultPayoutAccount(id);
    router.refresh();
  }
  async function remove(id: string) {
    await disablePayoutAccount(id);
    router.refresh();
  }

  const inputCls =
    "w-full rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="space-y-6">
      {accounts.length > 0 && (
        <ul className="divide-y divide-line rounded-2xl border border-line bg-surface-raised">
          {accounts.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium text-primary">{a.display_label}</p>
                {a.is_default && <span className="text-xs font-medium text-verified">Default</span>}
              </div>
              <div className="flex items-center gap-2 text-sm">
                {!a.is_default && (
                  <button onClick={() => makeDefault(a.id)} className="rounded-full border border-line-strong px-3 py-1 text-primary hover:border-accent hover:text-accent">
                    Make default
                  </button>
                )}
                <button onClick={() => remove(a.id)} className="rounded-full border border-line-strong px-3 py-1 text-ink-soft hover:border-danger hover:text-danger">
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={add} className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
        <h2 className="font-serif text-lg text-primary">Add a payout method</h2>
        <div className="mt-3 inline-flex rounded-full border border-line-strong p-0.5 text-sm">
          {(["mpesa", "bank"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMethod(m)}
              className={`rounded-full px-4 py-1.5 font-medium ${method === m ? "bg-ink-black text-white" : "text-ink-soft"}`}
            >
              {m === "mpesa" ? "M-Pesa" : "Bank"}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {method === "mpesa" ? (
            <input
              inputMode="numeric"
              placeholder="M-Pesa number, e.g. 07XX XXX XXX"
              value={form.msisdn}
              onChange={(e) => set("msisdn", e.target.value)}
              className={inputCls}
            />
          ) : (
            <>
              <input placeholder="Bank name" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className={inputCls} />
              <input placeholder="Account name" value={form.accountName} onChange={(e) => set("accountName", e.target.value)} className={inputCls} />
              <input inputMode="numeric" placeholder="Account number" value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} className={inputCls} />
              <input placeholder="Bank / branch code (optional)" value={form.bankCode} onChange={(e) => set("bankCode", e.target.value)} className={inputCls} />
            </>
          )}
          <p className="text-xs text-ink-soft">
            Your details are encrypted and only used to pay you. We only ever display the last 4 digits.
          </p>
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save payout method"}
          </button>
        </div>
      </form>
    </div>
  );
}
