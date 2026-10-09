"use server";

/**
 * On-platform messaging server actions.
 *
 * All reads/writes use the service-role client ({@link getSupabaseAdmin}) with
 * an explicit auth check first ({@link getCurrentUser}) and an explicit
 * participant filter — never trusting client-supplied ids. Message bodies are
 * PII-scrubbed before insert so the thread can't become an off-platform
 * back-channel. Degrades gracefully (returns an error, never throws) when
 * Supabase isn't configured.
 */

import { getCurrentUser } from "@/lib/auth/dal";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { scrubPII } from "./scrub";
import { sendNewMessageEmail } from "./email";

export type ThreadRow = {
  id: string;
  property_id: string;
  property_slug: string | null;
  property_title: string | null;
  buyer_id: string;
  owner_id: string | null;
  last_message_at: string;
  buyer_unread: number;
  owner_unread: number;
  status: string;
};

export type MessageRow = {
  id: string;
  created_at: string;
  thread_id: string;
  sender_role: "buyer" | "owner" | "system" | "admin";
  body: string;
  read_at: string | null;
};

type StartResult =
  | { ok: true; threadId: string }
  | { ok: false; needsAuth: true; signInUrl: string }
  | { ok: false; error: string };

type PostResult =
  | { ok: true }
  | { ok: false; needsAuth: true; signInUrl: string }
  | { ok: false; error: string };

const UNAVAILABLE = "Messaging isn't available right now. Please try again later.";

async function userEmail(adminUserId: string): Promise<string> {
  const admin = getSupabaseAdmin();
  if (!admin) return "";
  const { data } = await admin.auth.admin.getUserById(adminUserId);
  return data.user?.email ?? "";
}

/** Email the OTHER participant (owner if present, else the CoralStones team). */
async function notifyCounterpart(thread: ThreadRow, senderRole: "buyer" | "owner"): Promise<void> {
  const title = thread.property_title ?? "a property";
  if (senderRole === "buyer") {
    if (thread.owner_id) {
      const to = await userEmail(thread.owner_id);
      await sendNewMessageEmail({ to, propertyTitle: title, threadPath: `/host/messages/${thread.id}` });
    } else {
      // No owner linked yet — relay to the CoralStones team inbox.
      await sendNewMessageEmail({
        to: process.env.LEADS_EMAIL ?? "",
        propertyTitle: title,
        threadPath: `/property/${thread.property_slug ?? ""}`,
      });
    }
  } else {
    const to = await userEmail(thread.buyer_id);
    await sendNewMessageEmail({ to, propertyTitle: title, threadPath: `/account/messages/${thread.id}` });
  }
}

/**
 * Start (or reuse) a buyer↔owner thread for a property and post the first
 * message. Called from the "Message host" modal on the property page.
 */
export async function messageHost(input: {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  body: string;
  nextPath: string;
}): Promise<StartResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, needsAuth: true, signInUrl: `/account/sign-in?next=${encodeURIComponent(input.nextPath)}` };
  }

  const { clean } = scrubPII(input.body ?? "");
  if (!clean) return { ok: false, error: "Please enter a message." };

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: UNAVAILABLE };

  // Upsert the thread on (property_id, buyer_id).
  const { data: existing } = await admin
    .from("message_threads")
    .select("*")
    .eq("property_id", input.propertyId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  let thread = existing as ThreadRow | null;
  if (!thread) {
    const { data: created, error } = await admin
      .from("message_threads")
      .insert({
        property_id: input.propertyId,
        property_slug: input.propertySlug,
        property_title: input.propertyTitle,
        buyer_id: user.id,
        subject: input.propertyTitle,
      })
      .select("*")
      .single();
    if (error || !created) return { ok: false, error: UNAVAILABLE };
    thread = created as ThreadRow;
  }

  const { error: msgErr } = await admin.from("messages").insert({
    thread_id: thread.id,
    sender_id: user.id,
    sender_role: "buyer",
    body: clean,
  });
  if (msgErr) return { ok: false, error: UNAVAILABLE };

  await admin
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString(), owner_unread: thread.owner_unread + 1 })
    .eq("id", thread.id);

  await notifyCounterpart(thread, "buyer");
  return { ok: true, threadId: thread.id };
}

/** Post a reply into an existing thread (buyer inbox or host dashboard). */
export async function postMessage(input: { threadId: string; body: string; nextPath: string }): Promise<PostResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, needsAuth: true, signInUrl: `/account/sign-in?next=${encodeURIComponent(input.nextPath)}` };
  }

  const { clean } = scrubPII(input.body ?? "");
  if (!clean) return { ok: false, error: "Please enter a message." };

  const admin = getSupabaseAdmin();
  if (!admin) return { ok: false, error: UNAVAILABLE };

  const { data: threadData } = await admin
    .from("message_threads")
    .select("*")
    .eq("id", input.threadId)
    .maybeSingle();
  const thread = threadData as ThreadRow | null;
  if (!thread) return { ok: false, error: UNAVAILABLE };

  const senderRole: "buyer" | "owner" =
    user.id === thread.buyer_id ? "buyer" : user.id === thread.owner_id ? "owner" : "buyer";
  if (user.id !== thread.buyer_id && user.id !== thread.owner_id) {
    return { ok: false, error: "You can't post to this conversation." };
  }

  const { error: msgErr } = await admin.from("messages").insert({
    thread_id: thread.id,
    sender_id: user.id,
    sender_role: senderRole,
    body: clean,
  });
  if (msgErr) return { ok: false, error: UNAVAILABLE };

  const bump =
    senderRole === "buyer"
      ? { owner_unread: thread.owner_unread + 1 }
      : { buyer_unread: thread.buyer_unread + 1 };
  await admin
    .from("message_threads")
    .update({ last_message_at: new Date().toISOString(), ...bump })
    .eq("id", thread.id);

  await notifyCounterpart(thread, senderRole);
  return { ok: true };
}

/** Threads where the current user is the buyer, newest first. */
export async function listThreadsForBuyer(): Promise<ThreadRow[]> {
  const user = await getCurrentUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return [];
  const { data } = await admin
    .from("message_threads")
    .select("*")
    .eq("buyer_id", user.id)
    .order("last_message_at", { ascending: false });
  return (data as ThreadRow[] | null) ?? [];
}

/** Threads where the current user is the owner (host dashboard), newest first. */
export async function listThreadsForOwner(): Promise<ThreadRow[]> {
  const user = await getCurrentUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return [];
  const { data } = await admin
    .from("message_threads")
    .select("*")
    .eq("owner_id", user.id)
    .order("last_message_at", { ascending: false });
  return (data as ThreadRow[] | null) ?? [];
}

/** One thread + its messages, scoped to a participant; marks it read for them. */
export async function getThread(
  threadId: string,
): Promise<{ thread: ThreadRow; messages: MessageRow[]; role: "buyer" | "owner" } | null> {
  const user = await getCurrentUser();
  const admin = getSupabaseAdmin();
  if (!user || !admin) return null;

  const { data: threadData } = await admin
    .from("message_threads")
    .select("*")
    .eq("id", threadId)
    .maybeSingle();
  const thread = threadData as ThreadRow | null;
  if (!thread) return null;

  const role: "buyer" | "owner" | null =
    user.id === thread.buyer_id ? "buyer" : user.id === thread.owner_id ? "owner" : null;
  if (!role) return null;

  const { data: msgs } = await admin
    .from("messages")
    .select("*")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  // Mark read for the viewer.
  await admin
    .from("message_threads")
    .update(role === "buyer" ? { buyer_unread: 0 } : { owner_unread: 0 })
    .eq("id", threadId);

  return { thread, messages: (msgs as MessageRow[] | null) ?? [], role };
}
