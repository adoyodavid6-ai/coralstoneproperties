"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/dal";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { BUYER_DOCS_BUCKET, type BuyerDocStatus } from "@/lib/documents/service";

export type UploadState =
  | { ok?: boolean; error?: string; message?: string }
  | undefined;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

function str(v: FormDataEntryValue | null, max = 300): string {
  return String(v ?? "").trim().slice(0, max);
}

/** Lazily ensure the private bucket exists (idempotent). */
async function ensureBucket(
  sb: ReturnType<typeof getSupabaseAdmin>,
): Promise<void> {
  if (!sb) return;
  try {
    await sb.storage.createBucket(BUYER_DOCS_BUCKET, {
      public: false,
      fileSizeLimit: MAX_BYTES,
    });
  } catch {
    // Already exists (or insufficient perms) — ignore; upload will surface any
    // real problem.
  }
}

/**
 * Upload one buyer document against a property. Auth-enforced: only a signed-in
 * buyer can upload, and files land in a private bucket keyed by their user id.
 */
export async function uploadBuyerDocument(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in to upload your documents." };

  const propertyId = str(formData.get("propertyId"), 120);
  const propertySlug = str(formData.get("propertySlug"), 200);
  const propertyTitle = str(formData.get("propertyTitle"), 300);
  const docKey = str(formData.get("docKey"), 80) || "other";
  const docLabel = str(formData.get("docLabel"), 200);
  const file = formData.get("file");

  if (!propertyId) return { error: "Missing property reference." };
  if (!(file instanceof File) || file.size === 0)
    return { error: "Choose a file to upload." };
  if (file.size > MAX_BYTES)
    return { error: "File must be 10 MB or smaller." };
  if (file.type && !ALLOWED_MIME.has(file.type))
    return { error: "Use a PDF or an image (JPG, PNG, WEBP)." };

  const sb = getSupabaseAdmin();
  if (!sb) return { error: "Uploads aren't available yet." };

  await ensureBucket(sb);

  const safeName = (file.name || "document")
    .replace(/[^\w.\-]+/g, "_")
    .slice(0, 120);
  const stamp = Date.now().toString(36);
  const path = `${user.id}/${propertyId}/${docKey}/${stamp}-${safeName}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await sb.storage
    .from(BUYER_DOCS_BUCKET)
    .upload(path, bytes, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (upErr) {
    console.error("[documents] storage upload failed:", upErr.message);
    return { error: "Upload failed. Please try again." };
  }

  const { error: dbErr } = await sb.from("buyer_documents").insert({
    user_id: user.id,
    user_email: user.email,
    property_id: propertyId,
    property_slug: propertySlug || null,
    property_title: propertyTitle || null,
    doc_key: docKey,
    doc_label: docLabel || null,
    file_name: (file.name || safeName).slice(0, 200),
    storage_path: path,
    size_bytes: file.size,
    mime: file.type || null,
    status: "submitted" as BuyerDocStatus,
  });
  if (dbErr) {
    console.error("[documents] db insert failed:", dbErr.message);
    // Best-effort cleanup so we don't orphan the stored file.
    await sb.storage.from(BUYER_DOCS_BUCKET).remove([path]);
    return { error: "Could not save your upload. Please try again." };
  }

  if (propertySlug) revalidatePath(`/property/${propertySlug}`);
  revalidatePath("/account");
  return { ok: true, message: "Uploaded." };
}

/** Delete one of the current buyer's own documents. */
export async function deleteBuyerDocument(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Please sign in." };

  const id = str(formData.get("id"), 80);
  const propertySlug = str(formData.get("propertySlug"), 200);
  if (!id) return { error: "Missing document reference." };

  const sb = getSupabaseAdmin();
  if (!sb) return { error: "Unavailable." };

  // Fetch first so we can (a) verify ownership and (b) remove the stored file.
  const { data: row } = await sb
    .from("buyer_documents")
    .select("id,user_id,storage_path")
    .eq("id", id)
    .maybeSingle();

  if (!row || row.user_id !== user.id)
    return { error: "Document not found." };

  await sb.storage.from(BUYER_DOCS_BUCKET).remove([row.storage_path]);
  const { error } = await sb.from("buyer_documents").delete().eq("id", id);
  if (error) return { error: "Could not remove the document." };

  if (propertySlug) revalidatePath(`/property/${propertySlug}`);
  revalidatePath("/account");
  return { ok: true, message: "Removed." };
}

/**
 * Admin review: approve/reject a submission with an optional note. Invoked only
 * from the Basic-Auth-gated /admin/documents page (see src/proxy.ts).
 */
export async function reviewBuyerDocument(
  _prev: UploadState,
  formData: FormData,
): Promise<UploadState> {
  const id = str(formData.get("id"), 80);
  const status = str(formData.get("status"), 20) as BuyerDocStatus;
  const note = str(formData.get("note"), 500);
  if (!id) return { error: "Missing document reference." };
  if (!["submitted", "approved", "rejected"].includes(status))
    return { error: "Invalid status." };

  const sb = getSupabaseAdmin();
  if (!sb) return { error: "Unavailable." };

  const { error } = await sb
    .from("buyer_documents")
    .update({
      status,
      review_note: note || null,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return { error: "Could not update the document." };

  revalidatePath("/admin/documents");
  return { ok: true };
}
