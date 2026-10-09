import Link from "next/link";
import { requireOwner } from "@/lib/auth/roles";
import { listThreadsForOwner } from "@/lib/messaging/actions";

export const dynamic = "force-dynamic";

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default async function HostMessages() {
  await requireOwner("/host/messages");
  const threads = await listThreadsForOwner();

  if (threads.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-line-strong bg-surface-raised p-10 text-center text-sm text-ink-soft">
        No guest messages yet. Enquiries about your listings land here — all on-platform.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-line rounded-2xl border border-line bg-surface-raised">
      {threads.map((t) => (
        <li key={t.id}>
          <Link href={`/host/messages/${t.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-surface-muted">
            <div className="min-w-0">
              <p className="truncate font-medium text-primary">{t.property_title || "Listing"}</p>
              <p className="text-xs text-ink-soft">Updated {fmt(t.last_message_at)}</p>
            </div>
            {t.owner_unread > 0 && (
              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-white">
                {t.owner_unread} new
              </span>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
