"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  uploadBuyerDocument,
  deleteBuyerDocument,
  type UploadState,
} from "@/lib/documents/actions";
import { Upload, Download, Trash, Check, Clock, Close } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

export interface SlotFile {
  id: string;
  fileName: string;
  status: "submitted" | "approved" | "rejected";
  viewUrl: string | null;
  reviewNote: string | null;
}

interface DocSlotProps {
  propertyId: string;
  propertySlug: string;
  propertyTitle: string;
  docKey: string;
  docLabel: string;
  files: SlotFile[];
}

const STATUS_META: Record<
  SlotFile["status"],
  { label: string; cls: string; Icon: typeof Check }
> = {
  submitted: { label: "In review", cls: "bg-warning-soft text-warning", Icon: Clock },
  approved: { label: "Approved", cls: "bg-verified-soft text-verified", Icon: Check },
  rejected: { label: "Needs changes", cls: "bg-danger-soft text-danger", Icon: Close },
};

export function DocSlot({
  propertyId,
  propertySlug,
  propertyTitle,
  docKey,
  docLabel,
  files,
}: DocSlotProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState<UploadState, FormData>(
    uploadBuyerDocument,
    undefined,
  );

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [state, router]);

  return (
    <div className="space-y-2.5">
      {/* Uploaded files for this slot */}
      {files.length > 0 && (
        <ul className="space-y-1.5">
          {files.map((f) => {
            const meta = STATUS_META[f.status];
            const Icon = meta.Icon;
            return (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-sm"
              >
                <span className="min-w-0 flex-1 truncate text-primary" title={f.fileName}>
                  {f.fileName}
                </span>
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                    meta.cls,
                  )}
                >
                  <Icon className="h-3 w-3" />
                  {meta.label}
                </span>
                {f.viewUrl && (
                  <a
                    href={f.viewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 rounded-md p-1 text-ink-soft hover:bg-surface-muted hover:text-accent"
                    aria-label={`View ${f.fileName}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                <DeleteButton id={f.id} propertySlug={propertySlug} onDone={() => router.refresh()} />
              </li>
            );
          })}
        </ul>
      )}

      {/* Upload control */}
      <form ref={formRef} action={action} className="flex flex-wrap items-center gap-2">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="propertySlug" value={propertySlug} />
        <input type="hidden" name="propertyTitle" value={propertyTitle} />
        <input type="hidden" name="docKey" value={docKey} />
        <input type="hidden" name="docLabel" value={docLabel} />
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent">
          <Upload className="h-4 w-4" />
          <span>{files.length > 0 ? "Add another" : "Upload"}</span>
          <input
            type="file"
            name="file"
            required
            accept=".pdf,image/*"
            className="sr-only"
            onChange={(e) => {
              if (e.currentTarget.files?.length) formRef.current?.requestSubmit();
            }}
          />
        </label>
        {pending && <span className="text-xs text-ink-soft">Uploading…</span>}
        {state?.error && <span className="text-xs text-danger">{state.error}</span>}
      </form>
      <p className="text-[11px] text-ink-soft">PDF or image · up to 10 MB · private to you &amp; CoralStones</p>
    </div>
  );
}

function DeleteButton({
  id,
  propertySlug,
  onDone,
}: {
  id: string;
  propertySlug: string;
  onDone: () => void;
}) {
  const [state, action, pending] = useActionState<UploadState, FormData>(
    deleteBuyerDocument,
    undefined,
  );
  useEffect(() => {
    if (state?.ok) onDone();
  }, [state, onDone]);

  return (
    <form action={action} className="shrink-0">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="propertySlug" value={propertySlug} />
      <button
        type="submit"
        disabled={pending}
        aria-label="Remove document"
        className="rounded-md p-1 text-ink-soft hover:bg-danger-soft hover:text-danger disabled:opacity-50"
      >
        <Trash className="h-4 w-4" />
      </button>
    </form>
  );
}
