import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { listThreadsForBuyer } from "@/lib/messaging/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Messages" };

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default async function BuyerMessagesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in?next=/account/messages");

  const threads = await listThreadsForBuyer();

  return (
    <div className="container-page py-10">
      <h1 className="font-serif text-2xl font-semibold text-primary">Messages</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Your conversations with hosts stay on CoralStones — safe, private and traceable.
      </p>

      {threads.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface-raised p-10 text-center">
          <p className="text-sm text-ink-soft">
            No conversations yet. Open a property and use <span className="font-medium text-primary">Message host</span> to start one.
          </p>
          <Link href="/search" className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover">
            Browse properties
          </Link>
        </div>
      ) : (
        <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-surface-raised">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/account/messages/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-surface-muted">
                <div className="min-w-0">
                  <p className="truncate font-medium text-primary">{t.property_title || "Property"}</p>
                  <p className="text-xs text-ink-soft">Updated {fmt(t.last_message_at)}</p>
                </div>
                {t.buyer_unread > 0 && (
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                    {t.buyer_unread} new
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
