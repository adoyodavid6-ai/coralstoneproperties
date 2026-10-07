import "server-only";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for the **buyer account** auth flow (Supabase Auth), bound to
 * the Next.js request cookies so the session persists across requests.
 *
 * Unlike {@link getSupabaseAdmin} (service role, bypasses RLS), this client acts
 * AS the signed-in user — RLS applies. Use it in Server Components, Server
 * Actions and Route Handlers for sign-in/up/out and reading the current user.
 *
 * Returns `null` when Supabase isn't configured so callers degrade gracefully.
 */
export async function createSupabaseServerClient(): Promise<SupabaseClient | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return null;

  const cookieStore = await cookies();

  return createServerClient(url, anon, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // `set` throws when called from a Server Component render (read-only
          // cookies). That's fine — the proxy refreshes the session cookie on
          // the next request, so we can safely ignore it here.
        }
      },
    },
  });
}
