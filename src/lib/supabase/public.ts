import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Public, anon-key Supabase client for READ access to publicly-visible data
 * (active listings, their agents). The anon key is safe in any environment and
 * is already exposed to the browser; Row Level Security limits it to rows the
 * public is allowed to see (properties with status = 'active').
 *
 * Returns `null` when the env vars are absent (e.g. local dev without keys) so
 * the data layer can fall back to the bundled demo seed instead of throwing.
 */
let cached: SupabaseClient | null = null;

export function getSupabasePublic(): SupabaseClient | null {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  cached = createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/** Is a Supabase project wired up at all? Used to decide DB vs. demo fallback. */
export function isSupabaseConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
