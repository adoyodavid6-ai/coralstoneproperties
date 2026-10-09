"use client";

/**
 * Renders a message thread and a reply box. Shared by the buyer inbox
 * (`/account/messages/[id]`) and the host dashboard (`/host/messages/[id]`).
 * Reply posts through the `postMessage` server action, then refreshes the
 * server component so the new message (and read state) re-renders.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { postMessage, type MessageRow } from "@/lib/messaging/actions";

function labelFor(role: MessageRow["sender_role"], viewer: "buyer" | "owner"): string {
  if (role === viewer) return "You";
  if (role === "system" || role === "admin") return "CoralStones";
  return role === "owner" ? "Host" : "Guest";
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function ThreadView({
  threadId,
  messages,
  viewer,
}: {
  threadId: string;
  messages: MessageRow[];
  viewer: "buyer" | "owner";
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "sending" || !body.trim()) return;
    setStatus("sending");
    setError("");
    const nextPath = typeof window !== "undefined" ? window.location.pathname : "";
    const res = await postMessage({ threadId, body, nextPath });
    if (res.ok) {
      setBody("");
      setStatus("idle");
      router.refresh();
    } else if ("needsAuth" in res) {
      router.push(res.signInUrl);
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-3">
        {messages.map((m) => {
          const mine = m.sender_role === viewer;
          return (
            <div key={m.id} className={mine ? "flex justify-end" : "flex justify-start"}>
              <div className={mine ? "max-w-[85%]" : "max-w-[85%]"}>
                <p className={`mb-1 text-[11px] text-ink-soft ${mine ? "text-right" : ""}`}>
                  {labelFor(m.sender_role, viewer)} · {fmt(m.created_at)}
                </p>
                <div
                  className={
                    mine
                      ? "whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand px-3.5 py-2.5 text-sm text-white"
                      : "whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-surface-muted px-3.5 py-2.5 text-sm text-ink"
                  }
                >
                  {m.body}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={submit} className="border-t border-line pt-4">
        <textarea
          rows={3}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a reply… (phone numbers and emails are removed automatically)"
          className="w-full rounded-lg border border-line-strong bg-surface px-3.5 py-2.5 text-sm focus:border-accent focus:outline-none"
        />
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        <button
          type="submit"
          disabled={status === "sending" || !body.trim()}
          className="mt-2 rounded-full bg-ink-black px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
        >
          {status === "sending" ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
