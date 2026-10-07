import "server-only";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const BUYER_DOCS_BUCKET = "buyer-documents";

export type BuyerDocStatus = "submitted" | "approved" | "rejected";

export interface BuyerDoc {
  id: string;
  createdAt: string;
  userId: string;
  userEmail: string | null;
  propertyId: string;
  propertyTitle: string | null;
  propertySlug: string | null;
  docKey: string;
  docLabel: string | null;
  fileName: string;
  storagePath: string;
  sizeBytes: number;
  mime: string | null;
  status: BuyerDocStatus;
  reviewNote: string | null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(r: any): BuyerDoc {
  return {
    id: String(r.id),
    createdAt: r.created_at,
    userId: r.user_id,
    userEmail: r.user_email ?? null,
    propertyId: r.property_id,
    propertyTitle: r.property_title ?? null,
    propertySlug: r.property_slug ?? null,
    docKey: r.doc_key,
    docLabel: r.doc_label ?? null,
    fileName: r.file_name,
    storagePath: r.storage_path,
    sizeBytes: r.size_bytes ?? 0,
    mime: r.mime ?? null,
    status: (r.status as BuyerDocStatus) ?? "submitted",
    reviewNote: r.review_note ?? null,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/** A buyer's uploaded documents for one property. */
export async function getBuyerDocumentsForProperty(
  userId: string,
  propertyId: string,
): Promise<BuyerDoc[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("buyer_documents")
    .select("*")
    .eq("user_id", userId)
    .eq("property_id", propertyId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

/** Every document a buyer has uploaded, across all properties. */
export async function getBuyerDocuments(userId: string): Promise<BuyerDoc[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("buyer_documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

/** All submissions, newest first — admin review queue. */
export async function getAllBuyerDocuments(limit = 500): Promise<BuyerDoc[]> {
  const sb = getSupabaseAdmin();
  if (!sb) return [];
  const { data, error } = await sb
    .from("buyer_documents")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error || !data) return [];
  return data.map(mapRow);
}

/** A short-lived signed URL to view/download a stored document. */
export async function signedUrlFor(
  storagePath: string,
  expiresInSeconds = 60 * 10,
): Promise<string | null> {
  const sb = getSupabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.storage
    .from(BUYER_DOCS_BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error || !data) return null;
  return data.signedUrl;
}
