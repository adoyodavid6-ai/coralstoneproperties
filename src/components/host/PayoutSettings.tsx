"use client";

/**
 * Host payment-method manager. These are the details GUESTS use to pay the host
 * directly (CoralStones never collects). The host enters an M-Pesa destination
 * (send-money / Till / Paybill) or a bank account; we show the ready-to-share
 * instruction. All mutations go through the payoutAccounts server actions.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  addPayoutAccount,
  setDefaultPayoutAccount,
  disablePayoutAccount,
  type PaymentMethod,
  type AddPaymentInput,
} from "@/lib/host/payoutAccounts";

export function PayoutSettings({ accounts }: { accounts: PaymentMethod[] }) {
  const router = useRouter();
  const [method, setMethod] = useState<"mpesa" | "bank">("mpesa");
  const [mpesaChannel, setMpesaChannel] = useState<"phone" | "till" | "paybill">("phone");
  const [form, setForm] = useState({
    phone: "",
    till: "",
    paybill: "",
    account: "",
    bankName: "",
    accountName: "",
    accountNumber: "",
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const input: AddPaymentInput = { method, mpesaChannel, ...form };
    const res = await addPayoutAccount(input);
    setBusy(false);
    if (res.ok) {
      setForm({ phone: "", till: "", paybill: "", account: "", bankName: "", accountName: "", accountNumber: "" });
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
              <div className="min-w-0">
                <p className="font-medium text-primary">{a.display_label}</p>
                <p className="truncate text-xs text-ink-soft">{a.instructions}</p>
                {a.is_default && <span className="text-xs font-medium text-verified">Default — shown to guests</span>}
              </div>
              <div className="flex shrink-0 items-center gap-2 text-sm">
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
        <h2 className="font-serif text-lg text-primary">Add a payment method</h2>
        <p className="mt-1 text-xs text-ink-soft">Guests pay you directly using this — it&apos;s shown to them when they book.</p>

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
            <>
              <div className="inline-flex flex-wrap gap-1.5 text-xs">
                {(["phone", "till", "paybill"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setMpesaChannel(c)}
                    className={`rounded-full px-3 py-1 font-medium ${mpesaChannel === c ? "bg-accent-soft text-accent" : "border border-line-strong text-ink-soft"}`}
                  >
                    {c === "phone" ? "Send Money" : c === "till" ? "Till (Buy Goods)" : "Paybill"}
                  </button>
                ))}
              </div>
              {mpesaChannel === "phone" && (
                <input placeholder="M-Pesa number, e.g. 07XX XXX XXX" value={form.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} inputMode="numeric" />
              )}
              {mpesaChannel === "till" && (
                <input placeholder="Till number" value={form.till} onChange={(e) => set("till", e.target.value)} className={inputCls} inputMode="numeric" />
              )}
              {mpesaChannel === "paybill" && (
                <>
                  <input placeholder="Paybill / business number" value={form.paybill} onChange={(e) => set("paybill", e.target.value)} className={inputCls} inputMode="numeric" />
                  <input placeholder="Account reference" value={form.account} onChange={(e) => set("account", e.target.value)} className={inputCls} />
                </>
              )}
            </>
          ) : (
            <>
              <input placeholder="Bank name" value={form.bankName} onChange={(e) => set("bankName", e.target.value)} className={inputCls} />
              <input placeholder="Account name" value={form.accountName} onChange={(e) => set("accountName", e.target.value)} className={inputCls} />
              <input placeholder="Account number" value={form.accountNumber} onChange={(e) => set("accountNumber", e.target.value)} className={inputCls} inputMode="numeric" />
            </>
          )}
          {error && <p className="text-xs text-danger">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save payment method"}
          </button>
        </div>
      </form>
    </div>
  );
}
