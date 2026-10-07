"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/auth-server";
import { SITE_URL } from "@/lib/site";

export type AuthState =
  | { ok?: boolean; error?: string; message?: string }
  | undefined;

function clean(value: FormDataEntryValue | null, max = 300): string {
  return String(value ?? "").trim().slice(0, max);
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** A same-origin, non-protocol-relative path to redirect to after auth. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = clean(value, 512);
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

const UNAVAILABLE =
  "Accounts aren't available yet — the site owner needs to finish connecting the database.";

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = clean(formData.get("email"), 200).toLowerCase();
  const password = clean(formData.get("password"), 200);
  const next = safeNext(formData.get("next"));

  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (!password) return { error: "Please enter your password." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: UNAVAILABLE };

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return { error: "Those details don't match an account. Check and try again." };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const name = clean(formData.get("name"), 120);
  const email = clean(formData.get("email"), 200).toLowerCase();
  const phone = clean(formData.get("phone"), 40);
  const password = clean(formData.get("password"), 200);
  const confirmPassword = clean(formData.get("confirmPassword"), 200);
  const next = safeNext(formData.get("next"));

  if (name.length < 2) return { error: "Please enter your full name." };
  if (!isEmail(email)) return { error: "Please enter a valid email address." };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters." };
  if (password !== confirmPassword)
    return { error: "Passwords don't match." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: UNAVAILABLE };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: name, phone },
      // Land on the callback route, which exchanges the code for a session and
      // then forwards to the signed-in account page.
      emailRedirectTo: `${SITE_URL}/account/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message || "Could not create your account." };
  }

  // If the project requires email confirmation, no session is returned yet.
  if (!data.session) {
    return {
      ok: true,
      message:
        "Account created. Check your email for a confirmation link, then sign in.",
    };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
