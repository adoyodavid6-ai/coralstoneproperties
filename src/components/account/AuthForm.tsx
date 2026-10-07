"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/lib/auth/actions";
import { inputClass } from "@/components/admin/ui";
import { Eye, EyeOff } from "@/components/ui/icons";
import { cn } from "@/lib/cn";

/** Password input with a show/hide eye toggle. Optionally controlled. */
function PasswordField({
  label,
  name,
  autoComplete,
  placeholder,
  minLength,
  value,
  onChange,
}: {
  label: string;
  name: string;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
  value?: string;
  onChange?: (v: string) => void;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-primary">{label}</span>
      <div className="relative">
        <input
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          autoComplete={autoComplete}
          className={cn(inputClass, "pr-11")}
          placeholder={placeholder}
          value={value}
          onChange={onChange ? (e) => onChange(e.currentTarget.value) : undefined}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          aria-pressed={show}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-ink-soft transition-colors hover:text-accent"
        >
          {show ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
        </button>
      </div>
    </label>
  );
}

export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next: string }) {
  const action = mode === "sign-in" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(action, undefined);

  const isSignUp = mode === "sign-up";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const mismatch = isSignUp && confirm.length > 0 && password !== confirm;

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

      <PasswordField
        label="Password"
        name="password"
        autoComplete={isSignUp ? "new-password" : "current-password"}
        placeholder={isSignUp ? "At least 8 characters" : "Your password"}
        minLength={isSignUp ? 8 : undefined}
        value={isSignUp ? password : undefined}
        onChange={isSignUp ? setPassword : undefined}
      />

      {isSignUp && (
        <div>
          <PasswordField
            label="Confirm password"
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            minLength={8}
            value={confirm}
            onChange={setConfirm}
          />
          {mismatch && (
            <p className="mt-1 text-xs text-danger">Passwords don&apos;t match.</p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={pending || mismatch}
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
