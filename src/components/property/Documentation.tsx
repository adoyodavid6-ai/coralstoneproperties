import Link from "next/link";
import type { Property } from "@/lib/types";
import {
  requiredDocumentsFor,
  PROVIDER_LABEL,
  type RequiredDoc,
} from "@/lib/documentation/catalog";
import { getCurrentUser } from "@/lib/auth/dal";
import {
  getBuyerDocumentsForProperty,
  signedUrlFor,
  type BuyerDoc,
} from "@/lib/documents/service";
import { DocSlot, type SlotFile } from "@/components/property/DocumentUploader";
import { FileText, Check, Upload, User } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

const PROVIDER_TONE: Record<string, string> = {
  coralstones: "bg-verified-soft text-verified",
  seller: "bg-accent-soft text-accent",
  buyer: "bg-warning-soft text-warning",
};

async function toSlotFiles(docs: BuyerDoc[]): Promise<SlotFile[]> {
  return Promise.all(
    docs.map(async (d) => ({
      id: d.id,
      fileName: d.fileName,
      status: d.status,
      reviewNote: d.reviewNote,
      viewUrl: await signedUrlFor(d.storagePath),
    })),
  );
}

export async function Documentation({ property }: { property: Property }) {
  const docs = requiredDocumentsFor(property);
  const verifiedDocs = docs.filter((d) => d.provider !== "buyer");
  const buyerDocs = docs.filter((d) => d.provider === "buyer");

  const user = await getCurrentUser();
  const mine = user
    ? await getBuyerDocumentsForProperty(user.id, property.id)
    : [];

  // Group this buyer's uploads by document key for the matching slots.
  const byKey = new Map<string, BuyerDoc[]>();
  for (const d of mine) {
    const arr = byKey.get(d.docKey) ?? [];
    arr.push(d);
    byKey.set(d.docKey, arr);
  }
  const otherUploads = mine.filter(
    (d) => !buyerDocs.some((b) => b.key === d.docKey),
  );

  // Pre-resolve signed URLs so the JSX below stays synchronous (React can't
  // render an array of promises from `.map(async …)`).
  const buyerSlots = user
    ? await Promise.all(
        buyerDocs.map(async (doc) => ({
          doc,
          files: await toSlotFiles(byKey.get(doc.key) ?? []),
        })),
      )
    : [];
  const otherFiles = user ? await toSlotFiles(otherUploads) : [];

  const nextParam = `?next=${encodeURIComponent(`/property/${property.slug}`)}`;

  return (
    <section
      id="documentation"
      className="scroll-mt-24 rounded-2xl border border-line bg-surface-raised p-6 shadow-card"
      data-animate
    >
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
          <FileText className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-serif text-xl text-primary">Documentation</h2>
          <p className="mt-1 text-sm text-ink-soft">
            Everything needed to buy this {property.type === "land" ? "plot" : "property"} with
            confidence. CoralStones verifies the ownership documents; you securely upload your own
            paperwork and track its progress.
          </p>
        </div>
      </div>

      {/* Verified / seller-side property documents — read-only checklist */}
      <div className="mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
          Property &amp; ownership documents
        </h3>
        <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
          {verifiedDocs.map((doc) => (
            <DocRow key={doc.key} doc={doc} />
          ))}
        </ul>
      </div>

      {/* Buyer-provided documents */}
      <div className="mt-7 border-t border-line pt-6">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-accent" />
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
            Documents you provide
          </h3>
        </div>

        {!user ? (
          <div className="mt-3 flex flex-col items-start gap-3 rounded-xl border border-dashed border-line-strong bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Upload className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
              <p className="text-sm text-ink-soft">
                Create a free account to securely upload and track your purchase documents —
                they&apos;re private to you and the CoralStones verification team.
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Link
                href={`/account/sign-in${nextParam}`}
                className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent"
              >
                Sign in
              </Link>
              <Link
                href={`/account/sign-up${nextParam}`}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Create account
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-5">
            {buyerSlots.map(({ doc, files }) => (
              <div key={doc.key} className="rounded-xl border border-line bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-primary">
                    {doc.label}
                    {doc.mandatory && <span className="ml-1 text-danger">*</span>}
                  </p>
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-medium", PROVIDER_TONE.buyer)}>
                    {PROVIDER_LABEL.buyer}
                  </span>
                </div>
                <p className="mt-1 mb-3 text-xs text-ink-soft">{doc.description}</p>
                <DocSlot
                  propertyId={property.id}
                  propertySlug={property.slug}
                  propertyTitle={property.title}
                  docKey={doc.key}
                  docLabel={doc.label}
                  files={files}
                />
              </div>
            ))}

            {/* Catch-all slot for anything else the advocate asks for */}
            <div className="rounded-xl border border-line bg-surface p-4">
              <p className="text-sm font-semibold text-primary">Other supporting documents</p>
              <p className="mt-1 mb-3 text-xs text-ink-soft">
                Anything else your advocate or lender requests during the transaction.
              </p>
              <DocSlot
                propertyId={property.id}
                propertySlug={property.slug}
                propertyTitle={property.title}
                docKey="other"
                docLabel="Other supporting documents"
                files={otherFiles}
              />
            </div>

            <p className="text-xs text-ink-soft">
              <span className="text-danger">*</span> Required for completion. Manage everything from your{" "}
              <Link href="/account" className="font-medium text-accent hover:brightness-90">
                account
              </Link>
              .
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 border-t border-line pt-4 text-xs text-ink-soft">
        This checklist is general guidance for {property.country}, not legal advice. Your advocate
        confirms the exact requirements for your transaction.
      </p>
    </section>
  );
}

function DocRow({ doc }: { doc: RequiredDoc }) {
  return (
    <li className="flex items-start gap-3 rounded-xl border border-line bg-surface p-3.5">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-verified-soft text-verified">
        <Check className="h-3 w-3" />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="text-sm font-medium text-primary">
            {doc.label}
            {doc.mandatory && <span className="ml-1 text-danger">*</span>}
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-medium",
              PROVIDER_TONE[doc.provider],
            )}
          >
            {PROVIDER_LABEL[doc.provider]}
          </span>
        </div>
        <p className="mt-1 text-xs text-ink-soft">{doc.description}</p>
      </div>
    </li>
  );
}
