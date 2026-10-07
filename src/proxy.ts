import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/proxy-session";

/**
 * Request gate. Does two unrelated jobs, split by path:
 *
 * 1. `/admin/*` — HTTP Basic Auth so the console (and the data it bundles) is
 *    never served to the public. Replaces the old client-only passphrase.
 * 2. Everything else — refreshes the buyer's Supabase Auth session cookie so
 *    customer accounts stay signed in (Server Components can't rotate cookies).
 *
 * Config (e.g. Vercel → Settings → Environment Variables):
 *   ADMIN_USER      optional, defaults to "admin"
 *   ADMIN_PASSWORD  required in production to open /admin
 *
 * Fail-closed on admin: if ADMIN_PASSWORD is unset, access is allowed in local
 * development but BLOCKED in production, so a forgotten env var can never expose
 * the console.
 *
 * NOTE: this version of Next renames `middleware` → `proxy`
 * (node_modules/next/dist/docs/.../proxy.md). Proxy runs on the Node.js runtime.
 */
const REALM = 'Basic realm="CoralStones admin", charset="UTF-8"';

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    return adminGate(request);
  }
  // Buyer account session refresh for all other matched routes.
  return updateSupabaseSession(request);
}

function adminGate(request: NextRequest) {
  const expectedPass = process.env.ADMIN_PASSWORD;
  const expectedUser = process.env.ADMIN_USER || "admin";

  if (!expectedPass) {
    // No password set → open in dev, hidden (404) in production.
    if (process.env.NODE_ENV === "production") {
      return new NextResponse("Not found.", { status: 404 });
    }
    return NextResponse.next();
  }

  const header = request.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const sep = decoded.indexOf(":");
      const user = decoded.slice(0, sep);
      const pass = decoded.slice(sep + 1);
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    } catch {
      // malformed header → fall through to the 401 challenge
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": REALM },
  });
}

export const config = {
  // Run on /admin (Basic Auth) and all app routes (session refresh), excluding
  // Next internals and static assets so the proxy stays cheap.
  matcher: [
    "/admin",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|mp4|webm|woff2?)$).*)",
  ],
};
