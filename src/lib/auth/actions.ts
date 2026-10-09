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
    const msg = error.message || "";
    // Supabase couldn't hand the email to its mail provider (SMTP not configured
    // / misconfigured / rate-limited). Give a human message rather than the raw
    // "Error sending confirmation email".
    if (/sending.*email|smtp|rate ?limit/i.test(msg)) {
      console.error("[auth] confirmation email send failed:", msg);
      return {
        error:
          "We couldn't send the confirmation email right now. Please try again in a minute — if it keeps happening, contact support@coralstonesproperties.co.ke.",
      };
    }
    return { error: msg || "Could not create your account." };
  }

  // Supabase obfuscates "email already registered" (anti-enumeration) by
  // returning a user with an empty identities array and no error. Surface a
  // clear message instead of a misleading "check your email".
  const identities = data.user?.identities;
  if (data.user && Array.isArray(identities) && identities.length === 0) {
    return {
      ok: true,
      message:
        "This email is already registered. Check your inbox for the confirmation link, or sign in instead.",
    };
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

/** Re-send the sign-up confirmation email (for when the first didn't arrive). */
export async function resendConfirmationAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = clean(formData.get("email"), 200).toLowerCase();
  const next = safeNext(formData.get("next"));
  if (!isEmail(email)) return { error: "Please enter a valid email address." };

  const supabase = await createSupabaseServerClient();
  if (!supabase) return { error: UNAVAILABLE };

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${SITE_URL}/account/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) {
    return {
      error:
        "Couldn't resend just now — you may have hit the email rate limit. Wait a minute and try again.",
    };
  }
  return {
    ok: true,
    message: "If that account still needs confirming, a fresh link is on its way.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  if (supabase) await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
