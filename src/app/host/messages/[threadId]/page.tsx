import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth/roles";
import { getThread } from "@/lib/messaging/actions";
import { ThreadView } from "@/components/messaging/ThreadView";

export const dynamic = "force-dynamic";

export default async function HostThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  await requireOwner(`/host/messages/${threadId}`);

  const data = await getThread(threadId);
  if (!data || data.role !== "owner") notFound();

  return (
    <div>
      <Link href="/host/messages" className="text-sm font-medium text-accent hover:brightness-90">
        ← All messages
      </Link>
      <h1 className="mt-4 font-serif text-xl font-semibold text-primary">{data.thread.property_title || "Conversation"}</h1>
      <div className="mt-6 rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
        <ThreadView threadId={data.thread.id} messages={data.messages} viewer="owner" />
      </div>
    </div>
  );
}
