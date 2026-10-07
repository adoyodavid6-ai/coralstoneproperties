"use client";

import { useActionState } from "react";
import { resendConfirmationAction, type AuthState } from "@/lib/auth/actions";
import { inputClass } from "@/components/admin/ui";

export function ResendConfirmation({ next }: { next: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    resendConfirmationAction,
    undefined,
  );

  return (
    <details className="mt-6 rounded-xl border border-line bg-surface-raised p-4">
      <summary className="cursor-pointer text-sm font-medium text-primary">
        Didn&apos;t get the confirmation email?
      </summary>
      <form action={action} className="mt-3 space-y-2.5">
        <input type="hidden" name="next" value={next} />
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={inputClass}
        />
        {state?.error && <p className="text-xs text-danger">{state.error}</p>}
        {state?.message && <p className="text-xs text-verified">{state.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-primary transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {pending ? "Sending…" : "Resend confirmation email"}
        </button>
      </form>
    </details>
  );
}
