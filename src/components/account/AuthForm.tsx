"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/lib/auth/actions";
import { inputClass } from "@/components/admin/ui";

export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next: string }) {
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);

  const isSignUp = mode === "sign-up";

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />

      {state?.error && (
        <p className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">{state.error}</p>
      )}
      {state?.message && (
        <p className="rounded-lg bg-verified-soft px-3 py-2 text-sm text-verified">{state.message}</p>
      )}

      {isSignUp && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-primary">Full name</span>
          <input name="name" type="text" required autoComplete="name" className={inputClass} placeholder="Jane Wanjiku" />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-primary">Email</span>
        <input name="email" type="email" required autoComplete="email" className={inputClass} placeholder="you@example.com" />
      </label>

      {isSignUp && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-primary">Phone (optional)</span>
          <input name="phone" type="tel" autoComplete="tel" className={inputClass} placeholder="+254 7XX XXX XXX" />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-primary">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={isSignUp ? 8 : undefined}
          autoComplete={isSignUp ? "new-password" : "current-password"}
          className={inputClass}
          placeholder={isSignUp ? "At least 8 characters" : "Your password"}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
      </button>

      <p className="text-center text-sm text-ink-soft">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href={`/account/sign-in?next=${encodeURIComponent(next)}`} className="font-medium text-accent hover:brightness-90">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to CoralStones?{" "}
            <Link href={`/account/sign-up?next=${encodeURIComponent(next)}`} className="font-medium text-accent hover:brightness-90">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
