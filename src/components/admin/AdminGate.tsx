"use client";

import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { CheckShield } from "@/components/ui/icons";
import { inputClass } from "./ui";

const SESSION_KEY = "anchorstone_admin_unlocked";
// Demo-only gate. NOT security — real auth (Supabase + role claim) is a later
// masterplan stage. Anyone with the passphrase below can open the console.
const DEMO_PASS = "anchorstone";

export function AdminGate({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUnlocked(sessionStorage.getItem(SESSION_KEY) === "1");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (unlocked) return <>{children}</>;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === DEMO_PASS) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-surface px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-line bg-surface-raised p-7 shadow-float"
      >
        <Logo variant="full-light" />
        <h1 className="mt-5 font-serif text-2xl text-primary">Admin console</h1>
        <p className="mt-1 text-sm text-ink-soft">
          Enter the passphrase to manage listings, verification and pricing.
        </p>

        <div className="mt-5">
          <input
            type="password"
            autoFocus
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setError(false);
            }}
            placeholder="Passphrase"
            className={inputClass}
            aria-invalid={error}
          />
          {error && <p className="mt-2 text-sm text-danger">Incorrect passphrase.</p>}
        </div>

        <Button type="submit" className="mt-4 w-full">
          Unlock console
        </Button>

        <p className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-warning-soft px-3 py-2 text-xs text-warning">
          <CheckShield className="h-3.5 w-3.5" />
          Demo gate — passphrase is <span className="figure font-semibold">{DEMO_PASS}</span>. Real
          role-based auth is a later stage.
        </p>
      </form>
    </div>
  );
}
