import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/auth-server";

// Email-confirmation / magic-link landing. Supabase sends the user here with a
// `?code=` (PKCE) which we exchange for a real session cookie, then forward to
// the account. Without this exchange the link does nothing — the code is never
// turned into a session.
export const dynamic = "force-dynamic";

function safePath(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safePath(searchParams.get("next"));

  // Build the destination against the public-facing host (not the internal
  // Vercel origin) so the redirect lands on the real domain.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = isLocal || !forwardedHost ? origin : `https://${forwardedHost}`;

  if (code) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${base}${next}`);
      }
    }
  }

  // No code, Supabase unconfigured, or exchange failed (expired/used link).
  return NextResponse.redirect(
    `${base}/account/sign-in?next=${encodeURIComponent(next)}&error=confirm`,
  );
}
