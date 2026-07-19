"use client";

import { createContext, useContext, useEffect, useState } from "react";

const KEY = "vpl.compare";
const MAX = 4;

interface CompareCtx {
  ids: string[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  max: number;
}

const Ctx = createContext<CompareCtx | null>(null);

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) setIds(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  const persist = (next: string[]) => {
    setIds(next);
    window.localStorage.setItem(KEY, JSON.stringify(next));
  };

  const has = (id: string) => ids.includes(id);
  const toggle = (id: string) => {
    if (ids.includes(id)) persist(ids.filter((x) => x !== id));
    else if (ids.length < MAX) persist([...ids, id]);
  };
  const remove = (id: string) => persist(ids.filter((x) => x !== id));
  const clear = () => persist([]);

  return (
    <Ctx.Provider value={{ ids, has, toggle, remove, clear, max: MAX }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCompare(): CompareCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCompare must be used within CompareProvider");
  return c;
}
