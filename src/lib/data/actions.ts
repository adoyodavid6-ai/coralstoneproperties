"use server";

/**
 * Server actions for hydrating listings from the client. The saved and compare
 * pages hold only a list of ids in localStorage; they call this to fetch the
 * full, current listing objects (from the DB when configured, else the demo
 * seed) without importing the server-only data layer into client bundles.
 */
import type { Property } from "@/lib/types";
import { getListingsByIds } from "./listings";

export async function fetchListingsByIds(ids: string[]): Promise<Property[]> {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  return getListingsByIds(ids);
}
