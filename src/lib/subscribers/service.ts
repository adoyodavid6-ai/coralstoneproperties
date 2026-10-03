/**
 * Server-side data access for the subscriber funnel. Plain async functions
 * (not server actions) used by the confirm/unsubscribe route pages and the
 * admin console. All go through the service-role client, since both the
 * `subscribers` and `campaigns` tables are fully RLS-locked.
 */
import { headers } from "next/headers";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export type SubscriberStatus = "pending" | "confirmed" | "unsubscribed";

export type Subscriber = {
  id: string;
  email: string;
  name: string | null;
  status: SubscriberStatus;
  source: string | null;
  createdAt: string;
  confirmedAt: string | null;
};

export type Campaign = {
  id: string;
  subject: string;
  status: string;
  sentAt: string | null;
  createdAt: string;
  recipientCount: number;
};

export type SubscriberStats = {
  total: number;
  confirmed: number;
  pending: number;
  unsubscribed: number;
};

/**
 * Re-check admin auth inside server actions / mutations. Defence in depth on
 * top of the Basic-Auth proxy (src/proxy.ts) — the browser replays the Basic
 * credentials on every same-origin request, including server-action POSTs.
 * Throws when the caller isn't authenticated.
 */
export async function assertAdmin(): Promise<void> {
  const expectedPass = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USER || "admin";

  // Mirror proxy.ts: no password set → open in dev, denied in production.
  if (!expectedPass) {
    if (process.env.NODE_ENV === "production") throw new Error("Unauthorized");
    return;
  }

  const header = (await headers()).get("authorization");
  if (header?.startsWith("Basic ")) {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const sep = decoded.indexOf(":");
    if (decoded.slice(0, sep) === expectedUser && decoded.slice(sep + 1) === expectedPass) return;
  }
  throw new Error("Unauthorized");
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("subscribers")
    .select("id,email,name,status,source,created_at,confirmed_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[subscribers] list failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    email: r.email,
    name: r.name,
    status: r.status,
    source: r.source,
    createdAt: r.created_at,
    confirmedAt: r.confirmed_at,
  }));
}

export async function getSubscriberStats(): Promise<SubscriberStats> {
  const all = await getSubscribers();
  return {
    total: all.length,
    confirmed: all.filter((s) => s.status === "confirmed").length,
    pending: all.filter((s) => s.status === "pending").length,
    unsubscribed: all.filter((s) => s.status === "unsubscribed").length,
  };
}

export async function getCampaigns(): Promise<Campaign[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("campaigns")
    .select("id,subject,status,sent_at,created_at,recipient_count")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[campaigns] list failed:", error.message);
    return [];
  }
  return (data ?? []).map((r) => ({
    id: r.id,
    subject: r.subject,
    status: r.status,
    sentAt: r.sent_at,
    createdAt: r.created_at,
    recipientCount: r.recipient_count,
  }));
}

/** Confirm a pending subscriber via their token. Idempotent. */
export async function confirmByToken(token: string): Promise<{ ok: boolean; email?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb || !token) return { ok: false };

  const { data, error } = await sb
    .from("subscribers")
    .select("id,email,status")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return { ok: false };

  if (data.status === "confirmed") return { ok: true, email: data.email };

  const { error: upErr } = await sb
    .from("subscribers")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString(), unsubscribed_at: null })
    .eq("id", data.id);
  if (upErr) {
    console.error("[subscribers] confirm failed:", upErr.message);
    return { ok: false };
  }
  return { ok: true, email: data.email };
}

/** Unsubscribe a subscriber via their token. Idempotent. */
export async function unsubscribeByToken(token: string): Promise<{ ok: boolean; email?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb || !token) return { ok: false };

  const { data, error } = await sb
    .from("subscribers")
    .select("id,email,status")
    .eq("token", token)
    .maybeSingle();
  if (error || !data) return { ok: false };

  if (data.status === "unsubscribed") return { ok: true, email: data.email };

  const { error: upErr } = await sb
    .from("subscribers")
    .update({ status: "unsubscribed", unsubscribed_at: new Date().toISOString() })
    .eq("id", data.id);
  if (upErr) {
    console.error("[subscribers] unsubscribe failed:", upErr.message);
    return { ok: false };
  }
  return { ok: true, email: data.email };
}
