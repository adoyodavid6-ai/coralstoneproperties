"use client";

/**
 * CoralStones AI concierge — a floating chat widget mounted site-wide.
 *
 * Talks to /api/chat (streamText + Claude with listing-search tools). Renders
 * assistant text plus property cards emitted by the `searchListings` tool, so a
 * budget/area question comes back as tappable listings, not just prose.
 */
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type ListingSummary = {
  slug: string;
  title: string;
  price: string;
  location: string;
  beds?: number;
  baths?: number;
  url: string;
};

const SUGGESTIONS = [
  "3-bedroom houses to buy in Nairobi",
  "Apartments to rent under KSh 80,000",
  "How does CoralStones verify listings?",
];

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, status]);

  const busy = status === "submitted" || status === "streaming";

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    sendMessage({ text: trimmed });
    setInput("");
  }

  return (
    <>
      {/* Launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
      >
        {open ? <CloseIcon /> : <ChatIcon />}
      </button>

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-label="CoralStones assistant"
          className="fixed bottom-24 right-5 z-50 flex h-[32rem] max-h-[calc(100vh-7rem)] w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-line bg-surface-raised shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-surface-dark px-4 py-3 text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15">
              <ChatIcon className="h-4 w-4" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">CoralStones concierge</p>
              <p className="text-xs text-white/70">Find homes &amp; get answers</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <p className="text-sm text-ink-soft">
                  Hi! I can help you find verified properties or explain how CoralStones works. Try:
                </p>
                <div className="flex flex-col gap-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => submit(s)}
                      className="rounded-lg border border-line px-3 py-2 text-left text-sm text-ink transition hover:border-accent hover:bg-accent-soft"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.parts.map((part, i) => {
                  if (part.type === "text") {
                    return <Bubble key={i} role={message.role} text={part.text} />;
                  }
                  if (part.type === "tool-searchListings" && part.state === "output-available") {
                    const output = part.output as { results?: ListingSummary[] };
                    return <ListingCards key={i} results={output.results ?? []} />;
                  }
                  return null;
                })}
              </div>
            ))}

            {status === "submitted" && (
              <Bubble role="assistant" text="…" />
            )}
            {error && (
              <p className="text-sm text-danger">
                Something went wrong. Please try again.
              </p>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(input);
            }}
            className="flex items-center gap-2 border-t border-line p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about properties…"
              className="min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-soft focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <SendIcon />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

function Bubble({ role, text }: { role: string; text: string }) {
  const isUser = role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm bg-brand px-3 py-2 text-sm text-white"
            : "max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-surface-muted px-3 py-2 text-sm text-ink"
        }
      >
        {text}
      </div>
    </div>
  );
}

function ListingCards({ results }: { results: ListingSummary[] }) {
  if (results.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      {results.map((r) => (
        <Link
          key={r.slug}
          href={r.url}
          className="block rounded-lg border border-line bg-surface p-3 transition hover:border-accent hover:bg-accent-soft"
        >
          <p className="text-sm font-semibold text-ink">{r.title}</p>
          <p className="text-xs text-ink-soft">{r.location}</p>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-sm font-semibold text-accent">{r.price}</span>
            {(r.beds != null || r.baths != null) && (
              <span className="text-xs text-ink-soft">
                {[r.beds != null && `${r.beds} bd`, r.baths != null && `${r.baths} ba`]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

function ChatIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}
