import Link from "next/link";
import { getAllBuyerDocuments, signedUrlFor, type BuyerDoc } from "@/lib/documents/service";
import { reviewBuyerDocument } from "@/lib/documents/actions";
import { Panel } from "@/components/admin/ui";
import { Download } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

// Live data from Supabase — always render per request.
export const dynamic = "force-dynamic";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const fmtSize = (b: number) =>
  b >= 1_000_000 ? `${(b / 1_000_000).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1000))} KB`;

const STATUS_TONE: Record<string, string> = {
  approved: "bg-verified-soft text-verified ring-verified/20",
  submitted: "bg-warning-soft text-warning ring-warning/20",
  rejected: "bg-danger-soft text-danger ring-danger/20",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-raised p-5 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-soft">{label}</p>
      <p className="figure mt-2 text-2xl font-semibold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
    </div>
  );
}

export default async function AdminDocuments() {
  const docs = await getAllBuyerDocuments();
  const urls = new Map<string, string | null>();
  await Promise.all(docs.map(async (d) => urls.set(d.id, await signedUrlFor(d.storagePath))));

  const submitted = docs.filter((d) => d.status === "submitted");
  const approved = docs.filter((d) => d.status === "approved");
  const rejected = docs.filter((d) => d.status === "rejected");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-semibold text-primary">Buyer documents</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Live from Supabase — purchase documents buyers uploaded against a property. Review each
          submission, then approve it or send it back with a note. Files open via short-lived signed
          links (private storage).
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total" value={String(docs.length)} sub="all submissions" />
        <StatCard label="In review" value={String(submitted.length)} sub="awaiting a decision" />
        <StatCard label="Approved" value={String(approved.length)} />
        <StatCard label="Needs changes" value={String(rejected.length)} />
      </div>

      <Panel title={`Submissions (${docs.length})`}>
        {docs.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink-soft">
            No documents uploaded yet. When a signed-in buyer uploads paperwork from a property&apos;s
            Documentation section, it appears here for review.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-3 py-3 font-medium">Property / buyer</th>
                  <th className="px-3 py-3 font-medium">Document</th>
                  <th className="px-3 py-3 font-medium">Uploaded</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {docs.map((d) => (
                  <DocRow key={d.id} d={d} url={urls.get(d.id) ?? null} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </div>
  );
}

function DocRow({ d, url }: { d: BuyerDoc; url: string | null }) {
  return (
    <tr className="align-top hover:bg-surface-muted/50">
      <td className="px-3 py-3">
        <span className="block max-w-56 truncate font-medium text-primary">
          {d.propertySlug ? (
            <Link href={`/property/${d.propertySlug}`} className="hover:text-accent">
              {d.propertyTitle || d.propertyId}
            </Link>
          ) : (
            d.propertyTitle || d.propertyId
          )}
        </span>
        <span className="text-xs text-ink-soft">{d.userEmail || d.userId}</span>
      </td>
      <td className="px-3 py-3">
        <span className="block font-medium text-primary">{d.docLabel || d.docKey}</span>
        <span className="flex items-center gap-2 text-xs text-ink-soft">
          <span className="max-w-40 truncate">{d.fileName}</span>· {fmtSize(d.sizeBytes)}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-accent hover:brightness-90"
            >
              <Download className="h-3.5 w-3.5" /> view
            </a>
          )}
        </span>
      </td>
      <td className="figure px-3 py-3 text-ink-soft">{fmtDate(d.createdAt)}</td>
      <td className="px-3 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ring-1",
            STATUS_TONE[d.status] ?? STATUS_TONE.submitted,
          )}
        >
          {d.status === "submitted" ? "In review" : d.status}
        </span>
        {d.reviewNote && <p className="mt-1 max-w-48 text-xs text-ink-soft">{d.reviewNote}</p>}
      </td>
      <td className="px-3 py-3">
        <form
          action={async (formData: FormData) => {
            "use server";
            await reviewBuyerDocument(undefined, formData);
          }}
          className="flex flex-col gap-2"
        >
          <input type="hidden" name="id" value={d.id} />
          <input
            type="text"
            name="note"
            defaultValue={d.reviewNote ?? ""}
            placeholder="Note (optional)"
            className="w-48 rounded-md border border-line-strong bg-surface px-2 py-1 text-xs text-primary outline-none focus:border-accent"
          />
          <div className="flex gap-1.5">
            <button
              type="submit"
              name="status"
              value="approved"
              className="rounded-md bg-verified-soft px-2.5 py-1 text-xs font-semibold text-verified ring-1 ring-verified/20 hover:brightness-95"
            >
              Approve
            </button>
            <button
              type="submit"
              name="status"
              value="rejected"
              className="rounded-md bg-danger-soft px-2.5 py-1 text-xs font-semibold text-danger ring-1 ring-danger/20 hover:brightness-95"
            >
              Reject
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}
