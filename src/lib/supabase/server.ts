import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client, authenticated with the service-role key.
 *
 * The service-role key bypasses Row Level Security, so it MUST never reach the
 * browser. Two things guarantee that: the key env var has no `NEXT_PUBLIC_`
 * prefix (so Next never inlines it client-side), and this module is imported
 * only from the `"use server"` lead actions. Do not import it into a Client
 * Component.
 *
 * Configure in Vercel → Settings → Environment Variables:
 *   NEXT_PUBLIC_SUPABASE_URL      — your project URL (Settings → API)
 *   SUPABASE_SERVICE_ROLE_KEY     — the service_role secret (Settings → API)
 *
 * Returns `null` when the env vars are absent (e.g. before setup) so callers
 * can degrade gracefully instead of throwing.
 */
let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
