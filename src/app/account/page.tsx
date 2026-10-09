import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/dal";
import { getBuyerDocuments, signedUrlFor, type BuyerDoc } from "@/lib/documents/service";
import { signOutAction } from "@/lib/auth/actions";
import { FileText, Download, LogOut, User, Check, Clock, Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account" };

const STATUS_META: Record<
  BuyerDoc["status"],
  { label: string; cls: string; Icon: typeof Check }
> = {
  submitted: { label: "In review", cls: "bg-warning-soft text-warning", Icon: Clock },
  approved: { label: "Approved", cls: "bg-verified-soft text-verified", Icon: Check },
  rejected: { label: "Needs changes", cls: "bg-danger-soft text-danger", Icon: Close },
};

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/account/sign-in?next=/account");

  const docs = await getBuyerDocuments(user.id);

  // Group documents by property for a readable dashboard.
  const groups = new Map<string, { title: string; slug: string | null; items: BuyerDoc[] }>();
  for (const d of docs) {
    const g = groups.get(d.propertyId) ?? {
      title: d.propertyTitle || "Property",
      slug: d.propertySlug,
      items: [],
    };
    g.items.push(d);
    groups.set(d.propertyId, g);
  }

  // Signed view URLs (short-lived) for each document.
  const urls = new Map<string, string | null>();
  await Promise.all(docs.map(async (d) => urls.set(d.id, await signedUrlFor(d.storagePath))));

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <User className="h-5 w-5" />
          </span>
          <div>
            <h1 className="font-serif text-2xl font-semibold text-primary">
              {user.name || "My account"}
            </h1>
            <p className="text-sm text-ink-soft">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/account/messages"
            className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
          >
            Messages
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-danger hover:text-danger"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </form>
        </div>
      </div>

      {/* Documents */}
      <section className="mt-10">
        <h2 className="font-serif text-xl text-primary">Your purchase documents</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Upload documents from any property page. Everything you submit is private to you and the
          CoralStones verification team.
        </p>

        {groups.size === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface-raised p-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-ink-soft" />
            <p className="mt-3 text-sm text-ink-soft">
              You haven&apos;t uploaded any documents yet. Open a property and use its{" "}
              <span className="font-medium text-primary">Documentation</span> section to get started.
            </p>
            <Link
              href="/search"
              className="mt-4 inline-flex rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-hover"
            >
              Browse properties
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-6">
            {[...groups.entries()].map(([propertyId, g]) => (
              <div key={propertyId} className="rounded-2xl border border-line bg-surface-raised shadow-card">
                <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                  <h3 className="font-medium text-primary">{g.title}</h3>
                  {g.slug && (
                    <Link href={`/property/${g.slug}#documentation`} className="text-sm font-medium text-accent hover:brightness-90">
                      Open property →
                    </Link>
                  )}
                </header>
                <ul className="divide-y divide-line">
                  {g.items.map((d) => {
                    const meta = STATUS_META[d.status];
                    const Icon = meta.Icon;
                    const url = urls.get(d.id);
                    return (
                      <li key={d.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                        <FileText className="h-4 w-4 shrink-0 text-accent" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-primary">
                            {d.docLabel || d.fileName}
                          </p>
                          <p className="truncate text-xs text-ink-soft">
                            {d.fileName} · {fmtDate(d.createdAt)}
                          </p>
                          {d.status === "rejected" && d.reviewNote && (
                            <p className="mt-1 text-xs text-danger">{d.reviewNote}</p>
                          )}
                        </div>
                        <span className={cn("inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium", meta.cls)}>
                          <Icon className="h-3 w-3" />
                          {meta.label}
                        </span>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 rounded-md p-1.5 text-ink-soft hover:bg-surface-muted hover:text-accent"
                            aria-label={`View ${d.fileName}`}
                          >
                            <Download className="h-4 w-4" />
                          </a>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
