import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/dal";

/**
 * Admin-only owner (host) management. Promoting a user to 'owner' and linking a
 * property to its owner are deliberately service-role operations behind the
 * HTTP-Basic-gated /admin — role is never self-service (mirrors how 'agent' and
 * property status are admin-only). All functions no-op/err gracefully when
 * Supabase isn't configured.
 */

export type OwnerProfile = { id: string; fullName: string | null; phone: string | null; email: string };
export type MediatedProperty = {
  id: string;
  slug: string;
  title: string;
  intent: string;
  type: string;
  ownerId: string | null;
};

/** Find an auth user by email (scans paginated listUsers — fine at launch scale). */
export async function findUserByEmail(email: string): Promise<{ id: string; email: string } | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const target = email.trim().toLowerCase();
  if (!target) return null;
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data) return null;
    const hit = data.users.find((u) => (u.email ?? "").toLowerCase() === target);
    if (hit) return { id: hit.id, email: hit.email ?? "" };
    if (data.users.length < 200) break;
  }
  return null;
}

export async function setUserRole(userId: string, role: UserRole): Promise<boolean> {
  const sb = getSupabaseAdmin();
  if (!sb) return false;
  const { error } = await sb.from("profiles").update({ role }).eq("id", userId);
  return !error;
}

/** Promote an existing account to 'owner' by email. They must have signed up first. */
export async function promoteToOwnerByEmail(
  email: string,
): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Supabase isn't configured." };
  const user = await findUserByEmail(email);
  if (!user) return { ok: false, error: "No account with that email — ask them to sign up first." };
  const ok = await setUserRole(user.id, "owner");
  return ok ? { ok: true, userId: user.id } : { ok: false, error: "Could not update the role." };
}

/** Link a property to an owner, and backfill any existing message threads. */
export async function assignPropertyOwner(
  propertyId: string,
  ownerId: string,
): Promise<{ ok: boolean; error?: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Supabase isn't configured." };
  const { error } = await sb.from("properties").update({ owner_id: ownerId }).eq("id", propertyId);
  if (error) return { ok: false, error: error.message };
  await sb
    .from("message_threads")
    .update({ owner_id: ownerId })
    .eq("property_id", propertyId)
    .is("owner_id", null);
  return { ok: true };
}

export async function listOwners(): Promise<OwnerProfile[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb.from("profiles").select("id, full_name, phone").eq("role", "owner");
  const rows = (data ?? []) as { id: string; full_name: string | null; phone: string | null }[];
  const out: OwnerProfile[] = [];
  for (const r of rows) {
    const { data: u } = await sb.auth.admin.getUserById(r.id);
    out.push({ id: r.id, fullName: r.full_name, phone: r.phone, email: u.user?.email ?? "" });
  }
  return out;
}

/** Short-let / venue listings (the mediated set) with their owner-link status. */
export async function listMediatedProperties(): Promise<MediatedProperty[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from("properties")
    .select("id, slug, title, intent, type, owner_id")
    .or("intent.eq.short_let,type.eq.venue")
    .order("created_at", { ascending: false });
  const rows = (data ?? []) as {
    id: string;
    slug: string;
    title: string;
    intent: string;
    type: string;
    owner_id: string | null;
  }[];
  return rows.map((r) => ({
    id: r.id,
    slug: r.slug,
    title: r.title,
    intent: r.intent,
    type: r.type,
    ownerId: r.owner_id,
  }));
}
