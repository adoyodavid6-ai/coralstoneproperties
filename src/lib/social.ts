/**
 * Social profiles shown in the footer. URLs are set by an admin at
 * /admin/social and stored in Supabase (`site_settings`, key "social_links").
 * This module is shared by the server (validation) and the client (rendering).
 */

export const SOCIAL_PLATFORMS = [
  { id: "tiktok", label: "TikTok", hosts: ["tiktok.com"], example: "https://www.tiktok.com/@yourhandle" },
  { id: "youtube", label: "YouTube", hosts: ["youtube.com", "youtu.be"], example: "https://www.youtube.com/@yourchannel" },
  { id: "instagram", label: "Instagram", hosts: ["instagram.com"], example: "https://www.instagram.com/yourhandle" },
  { id: "linkedin", label: "LinkedIn", hosts: ["linkedin.com"], example: "https://www.linkedin.com/company/yourcompany" },
] as const;

export type SocialPlatform = (typeof SOCIAL_PLATFORMS)[number]["id"];
export type SocialLinks = Record<SocialPlatform, string>;

export const EMPTY_SOCIAL_LINKS: SocialLinks = { tiktok: "", youtube: "", instagram: "", linkedin: "" };

/** "" is allowed (not set yet); otherwise an https URL on the platform's own domain. */
export function validateSocialUrl(platform: SocialPlatform, raw: string): { url: string } | { error: string } {
  const value = raw.trim();
  if (!value) return { url: "" };
  const def = SOCIAL_PLATFORMS.find((p) => p.id === platform)!;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return { error: `${def.label}: enter a full link, e.g. ${def.example}` };
  }
  const host = parsed.hostname.toLowerCase();
  const onPlatform = def.hosts.some((h) => host === h || host.endsWith(`.${h}`));
  if (parsed.protocol !== "https:" || !onPlatform) {
    return { error: `${def.label}: the link must start with https:// and be on ${def.hosts[0]}` };
  }
  return { url: parsed.toString() };
}
