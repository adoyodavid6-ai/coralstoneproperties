import "server-only";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase/auth-server";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  phone: string;
}

/**
 * The signed-in buyer, or `null`. Memoised per render pass so repeated calls in
 * a page + its sections hit Supabase once.
 *
 * Uses `auth.getUser()` (not `getSession()`) so the token is validated against
 * Supabase on every check — the secure way to gate data, per the Next.js auth
 * guide's Data Access Layer pattern.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  return {
    id: user.id,
    email: user.email ?? "",
    name: typeof meta.full_name === "string" ? meta.full_name : "",
    phone: typeof meta.phone === "string" ? meta.phone : "",
  };
});
