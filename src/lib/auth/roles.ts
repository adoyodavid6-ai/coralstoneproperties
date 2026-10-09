import "server-only";
import { redirect } from "next/navigation";
import { getCurrentUser, type CurrentUser } from "@/lib/auth/dal";

/**
 * Gate a host (owner) page. Redirects anonymous users to sign-in (with a
 * `next` back to where they were) and non-owners to their buyer account.
 * Admins pass through so support can inspect host views. Returns the user so
 * callers get a typed, guaranteed-owner `CurrentUser`.
 */
export async function requireOwner(nextPath: string): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/account/sign-in?next=${encodeURIComponent(nextPath)}`);
  if (user.role !== "owner" && user.role !== "admin") redirect("/account");
  return user;
}
