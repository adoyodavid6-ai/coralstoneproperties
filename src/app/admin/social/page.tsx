import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { Panel, inputClass } from "@/components/admin/ui";
import { SOCIAL_PLATFORMS, validateSocialUrl, type SocialLinks } from "@/lib/social";
import {
  SITE_SETTINGS_TAG,
  getSocialLinksFresh,
  isSettingsStoreConfigured,
  saveSocialLinks,
} from "@/lib/siteSettings";

// Reads the live settings row — always render per request.
export const dynamic = "force-dynamic";

async function saveAction(formData: FormData) {
  "use server";
  const links = {} as SocialLinks;
  const errors: string[] = [];
  for (const p of SOCIAL_PLATFORMS) {
    const result = validateSocialUrl(p.id, String(formData.get(p.id) ?? ""));
    if ("error" in result) errors.push(result.error);
    else links[p.id] = result.url;
  }
  if (errors.length) redirect(`/admin/social?error=${encodeURIComponent(errors.join(" · "))}`);

  const saved = await saveSocialLinks(links);
  if (!saved.ok) redirect(`/admin/social?error=${encodeURIComponent(saved.error)}`);

  // Footer reads a cached copy on every page — refresh it everywhere.
  updateTag(SITE_SETTINGS_TAG);
  revalidatePath("/", "layout");
  redirect("/admin/social?saved=1");
}

export default async function AdminSocial({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const error = typeof sp.error === "string" ? sp.error : null;
  const saved = sp.saved === "1";
  const configured = isSettingsStoreConfigured();
  const links = await getSocialLinksFresh();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Social links</h1>
        <p className="mt-1 text-sm text-ink-soft">
          The TikTok, YouTube, Instagram and LinkedIn icons in the site footer open these links. Leave
          one blank to show its icon greyed out as &ldquo;coming soon&rdquo;.
        </p>
      </div>

      {!configured && (
        <p className="rounded-xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm text-warning">
          Supabase isn&apos;t configured on this deployment, so links can&apos;t be saved here.
        </p>
      )}
      {saved && (
        <p className="rounded-xl border border-verified/30 bg-verified-soft px-4 py-3 text-sm text-verified">
          Saved — the footer now uses these links.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <Panel title="Footer social profiles">
        <form action={saveAction} className="space-y-4">
          {SOCIAL_PLATFORMS.map((p) => (
            <label key={p.id} className="block">
              <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-soft">{p.label}</span>
              <input
                name={p.id}
                type="url"
                inputMode="url"
                defaultValue={links[p.id]}
                placeholder={p.example}
                className={inputClass}
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={!configured}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save links
          </button>
        </form>
      </Panel>
    </div>
  );
}
