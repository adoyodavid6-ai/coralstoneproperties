import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getThread } from "@/lib/messaging/actions";
import { ThreadView } from "@/components/messaging/ThreadView";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Conversation" };

export default async function BuyerThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const { threadId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/account/sign-in?next=/account/messages/${threadId}`);

  const data = await getThread(threadId);
  if (!data || data.role !== "buyer") notFound();

  return (
    <div className="container-page py-10">
      <Link href="/account/messages" className="text-sm font-medium text-accent hover:brightness-90">
        ← All messages
      </Link>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <h1 className="font-serif text-xl font-semibold text-primary">{data.thread.property_title || "Conversation"}</h1>
        {data.thread.property_slug && (
          <Link href={`/property/${data.thread.property_slug}`} className="text-sm font-medium text-accent hover:brightness-90">
            View property →
          </Link>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
        <ThreadView threadId={data.thread.id} messages={data.messages} viewer="buyer" />
      </div>
    </div>
  );
}
