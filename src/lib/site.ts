/**
 * Canonical site origin — used for metadata, sitemap, robots and JSON-LD.
 *
 * Resolution order:
 *   1. NEXT_PUBLIC_SITE_URL      — set this in Vercel once you have a custom domain.
 *   2. VERCEL_PROJECT_PRODUCTION_URL — Vercel sets this automatically to the
 *      production deployment URL (e.g. your-project.vercel.app), so the site
 *      has correct absolute URLs out of the box with zero config.
 *   3. localhost                 — local development fallback.
 */
function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
