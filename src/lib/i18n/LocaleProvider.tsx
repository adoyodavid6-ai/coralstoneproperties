"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { DisplayCurrency } from "@/lib/types";
import { translate, type Locale } from "./dictionaries";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  currency: DisplayCurrency;
  setCurrency: (c: DisplayCurrency) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [currency, setCurrencyState] = useState<DisplayCurrency>("local");

  // Restore preferences (client-only; server renders EN / local prices for stable SSR).
  useEffect(() => {
    const l = window.localStorage.getItem("vpl.locale") as Locale | null;
    const c = window.localStorage.getItem("vpl.currency") as DisplayCurrency | null;
    if (l === "en" || l === "sw") setLocaleState(l);
    if (c === "local" || c === "USD" || c === "GBP") setCurrencyState(c);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    window.localStorage.setItem("vpl.locale", l);
    document.documentElement.lang = l;
  };

  const setCurrency = (c: DisplayCurrency) => {
    setCurrencyState(c);
    window.localStorage.setItem("vpl.currency", c);
  };

  const t = (key: string) => translate(locale, key);

  return (
    <LocaleContext.Provider
      value={{ locale, setLocale, currency, setCurrency, t }}
    >
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}
