import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Server-side gate for the admin console.
 *
 * `/admin/*` is protected with HTTP Basic Auth so the pages — and the data they
 * bundle — are never served to the public. This replaces the old client-only
 * passphrase (`AdminGate`), which shipped the secret to the browser and was
 * trivially bypassable.
 *
 * Config (e.g. Vercel → Settings → Environment Variables):
 *   ADMIN_USER      optional, defaults to "admin"
 *   ADMIN_PASSWORD  required in production to open /admin
 *
 * Fail-closed: if ADMIN_PASSWORD is unset, access is allowed in local
 * development (so you can work without a password) but BLOCKED in production,
 * so a forgotten env var can never expose the console.
 *
 * NOTE: this version of Next renames `middleware` → `proxy`
 * (node_modules/next/dist/docs/.../proxy.md). Proxy runs on the Node.js runtime.
 */
const REALM = 'Basic realm="CoralStones admin", charset="UTF-8"';

export function proxy(request: NextRequest) {
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
  matcher: ["/admin", "/admin/:path*"],
};
