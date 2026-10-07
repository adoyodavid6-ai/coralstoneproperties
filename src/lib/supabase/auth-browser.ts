"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the buyer account flow. Reads the public env vars
 * that are already exposed client-side. Returns `null` when unconfigured.
 *
 * Most auth happens through Server Actions; this is here for client components
 * that need the live session (e.g. reacting to sign-out without a reload).
 */
let cached: SupabaseClient | null = null;

export function createSupabaseBrowserClient(): SupabaseClient | null {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;
  cached = createBrowserClient(url, anon);
  return cached;
}
