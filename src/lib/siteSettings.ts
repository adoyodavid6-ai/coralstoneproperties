import "server-only";
import { unstable_cache } from "next/cache";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { EMPTY_SOCIAL_LINKS, SOCIAL_PLATFORMS, type SocialLinks } from "@/lib/social";

/**
 * Admin-editable site settings, stored as key → jsonb rows in `public.site_settings`
 * (service-role only; see supabase/schema.sql). Reads are cached under one tag so
 * every page can show them without a DB hit per request; saving clears the tag.
 */
export const SITE_SETTINGS_TAG = "site-settings";
const SOCIAL_KEY = "social_links";

function normalise(value: unknown): SocialLinks {
  const v = (value ?? {}) as Record<string, unknown>;
  const out = { ...EMPTY_SOCIAL_LINKS };
  for (const p of SOCIAL_PLATFORMS) if (typeof v[p.id] === "string") out[p.id] = v[p.id] as string;
  return out;
}

async function readSocialLinks(): Promise<SocialLinks> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ...EMPTY_SOCIAL_LINKS };
  const { data, error } = await sb.from("site_settings").select("value").eq("key", SOCIAL_KEY).maybeSingle();
  if (error) {
    console.error("[site-settings] social links read failed:", error.message);
    return { ...EMPTY_SOCIAL_LINKS };
  }
  return normalise(data?.value);
}

export const getSocialLinks = unstable_cache(readSocialLinks, ["social-links"], { tags: [SITE_SETTINGS_TAG] });

/** Uncached read for the admin editor, so it always shows what's in the DB. */
export const getSocialLinksFresh = readSocialLinks;

export async function saveSocialLinks(links: SocialLinks): Promise<{ ok: true } | { ok: false; error: string }> {
  const sb = getSupabaseAdmin();
  if (!sb) return { ok: false, error: "Supabase isn't configured on this deployment." };
  const { error } = await sb
    .from("site_settings")
    .upsert({ key: SOCIAL_KEY, value: links, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export function isSettingsStoreConfigured(): boolean {
  return getSupabaseAdmin() !== null;
}
