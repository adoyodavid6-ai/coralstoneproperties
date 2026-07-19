"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  Agent,
  Property,
  PropertyStatus,
  VerificationKind,
} from "@/lib/types";
import { PROPERTIES } from "@/lib/data/properties";
import { AGENTS } from "@/lib/data/agents";
import type { AdminState, AuditEntry, BoostTier, SubscriptionPlan } from "./types";
import { SEED_BOOST_TIERS, SEED_FLAGS, SEED_PLANS, SEED_REPORTS } from "./seed";

const STORAGE_KEY = "anchorstone_admin_v1";
const ACTOR = "admin";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function seedState(): AdminState {
  return {
    properties: clone(PROPERTIES),
    agents: clone(Object.values(AGENTS)),
    pricing: { boostTiers: clone(SEED_BOOST_TIERS), plans: clone(SEED_PLANS) },
    flags: clone(SEED_FLAGS),
    reports: clone(SEED_REPORTS),
    audit: [],
  };
}

let auditSeq = 0;
function entry(action: string, target: string, detail: string): AuditEntry {
  auditSeq += 1;
  return {
    id: `au_${Date.now().toString(36)}_${auditSeq}`,
    ts: Date.now(),
    actor: ACTOR,
    action,
    target,
    detail,
  };
}

const today = () => new Date().toISOString().slice(0, 10);

export interface AdminApi extends AdminState {
  ready: boolean;
  // listings
  updateListing: (id: string, patch: Partial<Property>, detail?: string) => void;
  setStatus: (id: string, status: PropertyStatus) => void;
  setBoost: (id: string, tier: "featured" | "spotlight" | null) => void;
  toggleVerification: (id: string, kind: VerificationKind) => void;
  addListing: (input: NewListingInput) => string;
  deleteListing: (id: string) => void;
  // reports / moderation
  resolveReport: (id: string, action: "dismiss" | "takedown") => void;
  // agents
  updateAgent: (id: string, patch: Partial<Agent>) => void;
  toggleAgentVerification: (id: string, kind: VerificationKind) => void;
  // pricing
  updateBoostTier: (id: string, patch: Partial<BoostTier>) => void;
  updatePlan: (id: string, patch: Partial<SubscriptionPlan>) => void;
  addPlan: () => string;
  deletePlan: (id: string) => void;
  // flags + meta
  toggleFlag: (id: string) => void;
  resetAll: () => void;
}

export interface NewListingInput {
  title: string;
  type: Property["type"];
  intent: Property["intent"];
  price: number;
  currency: Property["currency"];
  pricePeriod: Property["pricePeriod"];
  country: Property["country"];
  county: string;
  area: string;
  beds?: number;
  baths?: number;
  size?: number;
  agentId: string;
}

const AdminContext = createContext<AdminApi | null>(null);

export function useAdmin(): AdminApi {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within <AdminProvider>");
  return ctx;
}

const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1400&q=70";

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AdminState>(seedState);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  // Hydrate from localStorage once, after mount (keeps SSR/first render on seed).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AdminState;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed?.properties) setState(parsed);
      }
    } catch {
      /* corrupt storage → fall back to seed */
    }
    loaded.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);
  }, []);

  // Persist on every change (but not before the initial load has run).
  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota / private mode — ignore */
    }
  }, [state]);

  const mapProp = (
    s: AdminState,
    id: string,
    fn: (p: Property) => Property,
  ): AdminState => ({
    ...s,
    properties: s.properties.map((p) => (p.id === id ? fn(p) : p)),
  });

  const nameOf = (s: AdminState, id: string) =>
    s.properties.find((p) => p.id === id)?.title ?? id;

  const updateListing = useCallback<AdminApi["updateListing"]>(
    (id, patch, detail) => {
      setState((prev) => {
        const title = nameOf(prev, id);
        const keys = Object.keys(patch).join(", ");
        const next = mapProp(prev, id, (p) => ({ ...p, ...patch }));
        return {
          ...next,
          audit: [entry("listing.update", title, detail ?? `Edited ${keys}`), ...next.audit],
        };
      });
    },
    [],
  );

  const setStatus = useCallback<AdminApi["setStatus"]>((id, status) => {
    setState((prev) => {
      const title = nameOf(prev, id);
      const next = mapProp(prev, id, (p) => ({ ...p, status }));
      return { ...next, audit: [entry("listing.status", title, `Status → ${status}`), ...next.audit] };
    });
  }, []);

  const setBoost = useCallback<AdminApi["setBoost"]>((id, tier) => {
    setState((prev) => {
      const title = nameOf(prev, id);
      const next = mapProp(prev, id, (p) => ({ ...p, boostTier: tier ?? undefined }));
      return {
        ...next,
        audit: [entry("listing.boost", title, tier ? `Boost → ${tier}` : "Boost removed"), ...next.audit],
      };
    });
  }, []);

  const toggleVerification = useCallback<AdminApi["toggleVerification"]>((id, kind) => {
    setState((prev) => {
      const title = nameOf(prev, id);
      let added = false;
      const next = mapProp(prev, id, (p) => {
        const has = p.verified.some((v) => v.kind === kind);
        added = !has;
        return {
          ...p,
          verified: has
            ? p.verified.filter((v) => v.kind !== kind)
            : [...p.verified, { kind, verifiedOn: today() }],
        };
      });
      return {
        ...next,
        audit: [entry("listing.verify", title, `${added ? "Granted" : "Revoked"} ${kind} badge`), ...next.audit],
      };
    });
  }, []);

  const addListing = useCallback<AdminApi["addListing"]>((input) => {
    const id = `p_${Date.now().toString(36)}`;
    setState((prev) => {
      const agent = prev.agents.find((a) => a.id === input.agentId) ?? prev.agents[0];
      const slug = `${input.title}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
        .slice(0, 60) || id;
      const p: Property = {
        id,
        slug: `${slug}-${id}`,
        title: input.title,
        type: input.type,
        intent: input.intent,
        status: "pending_review",
        price: input.price,
        currency: input.currency,
        pricePeriod: input.pricePeriod,
        beds: input.beds,
        baths: input.baths,
        size: input.size,
        sizeUnit: input.size != null ? "sqm" : undefined,
        country: input.country,
        county: input.county,
        area: input.area,
        lat: 0,
        lng: 0,
        amenities: [],
        lifestyle: [],
        images: [DEFAULT_IMG],
        verified: [],
        description: "",
        agent,
        area_guide: {
          country: input.country,
          county: input.county,
          area: input.area,
          security: 70,
          waterReliability: 70,
          powerReliability: 70,
          roadAccess: 70,
        },
        listedOn: today(),
        viewCount: 0,
        saveCount: 0,
      };
      return {
        ...prev,
        properties: [p, ...prev.properties],
        audit: [entry("listing.create", input.title, "New listing → pending review"), ...prev.audit],
      };
    });
    return id;
  }, []);

  const deleteListing = useCallback<AdminApi["deleteListing"]>((id) => {
    setState((prev) => {
      const title = nameOf(prev, id);
      return {
        ...prev,
        properties: prev.properties.filter((p) => p.id !== id),
        audit: [entry("listing.delete", title, "Listing removed"), ...prev.audit],
      };
    });
  }, []);

  const resolveReport = useCallback<AdminApi["resolveReport"]>((id, action) => {
    setState((prev) => {
      const rep = prev.reports.find((r) => r.id === id);
      const title = rep ? nameOf(prev, rep.propertyId) : id;
      let properties = prev.properties;
      if (action === "takedown" && rep) {
        properties = properties.map((p) =>
          p.id === rep.propertyId ? { ...p, status: "withdrawn" as PropertyStatus } : p,
        );
      }
      return {
        ...prev,
        properties,
        reports: prev.reports.map((r) =>
          r.id === id ? { ...r, status: action === "takedown" ? "actioned" : "dismissed" } : r,
        ),
        audit: [
          entry(
            action === "takedown" ? "report.takedown" : "report.dismiss",
            title,
            action === "takedown" ? "Report upheld — listing withdrawn" : "Report dismissed",
          ),
          ...prev.audit,
        ],
      };
    });
  }, []);

  const updateAgent = useCallback<AdminApi["updateAgent"]>((id, patch) => {
    setState((prev) => {
      const agent = prev.agents.find((a) => a.id === id);
      return {
        ...prev,
        agents: prev.agents.map((a) => (a.id === id ? { ...a, ...patch } : a)),
        audit: [entry("agent.update", agent?.name ?? id, `Edited ${Object.keys(patch).join(", ")}`), ...prev.audit],
      };
    });
  }, []);

  const toggleAgentVerification = useCallback<AdminApi["toggleAgentVerification"]>((id, kind) => {
    setState((prev) => {
      const agent = prev.agents.find((a) => a.id === id);
      let added = false;
      const agents = prev.agents.map((a) => {
        if (a.id !== id) return a;
        const has = a.verified.includes(kind);
        added = !has;
        return {
          ...a,
          verified: has ? a.verified.filter((k) => k !== kind) : [...a.verified, kind],
        };
      });
      return {
        ...prev,
        agents,
        audit: [entry("agent.verify", agent?.name ?? id, `${added ? "Granted" : "Revoked"} ${kind}`), ...prev.audit],
      };
    });
  }, []);

  const updateBoostTier = useCallback<AdminApi["updateBoostTier"]>((id, patch) => {
    setState((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        boostTiers: prev.pricing.boostTiers.map((b) => (b.id === id ? { ...b, ...patch } : b)),
      },
      audit: [entry("pricing.boost", id, `Updated ${Object.keys(patch).join(", ")}`), ...prev.audit],
    }));
  }, []);

  const updatePlan = useCallback<AdminApi["updatePlan"]>((id, patch) => {
    setState((prev) => {
      const plan = prev.pricing.plans.find((p) => p.id === id);
      return {
        ...prev,
        pricing: {
          ...prev.pricing,
          plans: prev.pricing.plans.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        },
        audit: [entry("pricing.plan", plan?.name ?? id, `Updated ${Object.keys(patch).join(", ")}`), ...prev.audit],
      };
    });
  }, []);

  const addPlan = useCallback<AdminApi["addPlan"]>(() => {
    const id = `plan_${Date.now().toString(36)}`;
    setState((prev) => ({
      ...prev,
      pricing: {
        ...prev.pricing,
        plans: [
          ...prev.pricing.plans,
          { id, name: "New plan", pricePerMonth: 0, currency: "KES", listingCap: 5, features: [], active: false },
        ],
      },
      audit: [entry("pricing.plan.create", "New plan", "Draft plan added"), ...prev.audit],
    }));
    return id;
  }, []);

  const deletePlan = useCallback<AdminApi["deletePlan"]>((id) => {
    setState((prev) => {
      const plan = prev.pricing.plans.find((p) => p.id === id);
      return {
        ...prev,
        pricing: { ...prev.pricing, plans: prev.pricing.plans.filter((p) => p.id !== id) },
        audit: [entry("pricing.plan.delete", plan?.name ?? id, "Plan removed"), ...prev.audit],
      };
    });
  }, []);

  const toggleFlag = useCallback<AdminApi["toggleFlag"]>((id) => {
    setState((prev) => {
      const flag = prev.flags.find((f) => f.id === id);
      const now = !flag?.enabled;
      return {
        ...prev,
        flags: prev.flags.map((f) => (f.id === id ? { ...f, enabled: now } : f)),
        audit: [entry("flag.toggle", flag?.label ?? id, now ? "Enabled" : "Disabled"), ...prev.audit],
      };
    });
  }, []);

  const resetAll = useCallback<AdminApi["resetAll"]>(() => {
    const fresh = seedState();
    setState({ ...fresh, audit: [entry("system.reset", "Console", "Reset to seed data")] });
  }, []);

  const api: AdminApi = {
    ...state,
    ready,
    updateListing,
    setStatus,
    setBoost,
    toggleVerification,
    addListing,
    deleteListing,
    resolveReport,
    updateAgent,
    toggleAgentVerification,
    updateBoostTier,
    updatePlan,
    addPlan,
    deletePlan,
    toggleFlag,
    resetAll,
  };

  return <AdminContext.Provider value={api}>{children}</AdminContext.Provider>;
}
