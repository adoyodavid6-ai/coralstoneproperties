import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Refreshes the buyer's Supabase Auth session cookie on each request.
 *
 * Server Components can't write cookies, so expiring access tokens must be
 * refreshed in the proxy (middleware). This mirrors the official @supabase/ssr
 * pattern: read cookies off the request, let Supabase rotate them, and copy the
 * rotated cookies onto the response.
 *
 * No-ops (returns a plain pass-through response) when Supabase isn't configured.
 */
export async function updateSupabaseSession(request: NextRequest): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return response;

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: this call refreshes the token and triggers setAll above.
  // Do not run any logic between creating the client and this call.
  try {
    await supabase.auth.getUser();
  } catch {
    // Network / config hiccup — fall through with the un-refreshed response.
  }

  return response;
}
