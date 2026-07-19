import type { Agent, Currency, Property, PropertyStatus } from "@/lib/types";

/** A paid placement tier and the weekly fee the platform charges for it. */
export interface BoostTier {
  id: "featured" | "spotlight";
  label: string;
  feePerWeek: number; // priced in `currency`
  currency: Currency;
  blurb: string;
  active: boolean;
}

/** An agent/agency subscription plan — the platform's recurring revenue. */
export interface SubscriptionPlan {
  id: string;
  name: string;
  pricePerMonth: number;
  currency: Currency;
  /** Max concurrent active listings; null = unlimited. */
  listingCap: number | null;
  features: string[];
  active: boolean;
}

export interface PricingConfig {
  boostTiers: BoostTier[];
  plans: SubscriptionPlan[];
}

/** A platform capability an admin can switch on or off. */
export interface FeatureFlag {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

/** A visitor report against a listing — feeds the moderation queue. */
export interface Report {
  id: string;
  propertyId: string;
  reason: string;
  detail: string;
  reportedOn: string; // ISO date
  status: "open" | "dismissed" | "actioned";
}

/** Insert-only record of an admin action (§12 tamper-evident audit). */
export interface AuditEntry {
  id: string;
  ts: number; // epoch ms
  actor: string;
  action: string; // dotted verb, e.g. "listing.publish"
  target: string; // human-readable subject
  detail: string;
}

export interface AdminState {
  properties: Property[];
  agents: Agent[];
  pricing: PricingConfig;
  flags: FeatureFlag[];
  reports: Report[];
  audit: AuditEntry[];
}

/** Statuses an admin can move a listing between, with display metadata. */
export const STATUS_META: Record<
  PropertyStatus,
  { label: string; tone: "neutral" | "warn" | "good" | "muted" }
> = {
  draft: { label: "Draft", tone: "muted" },
  pending_review: { label: "Pending review", tone: "warn" },
  active: { label: "Active", tone: "good" },
  under_offer: { label: "Under offer", tone: "warn" },
  reserved: { label: "Reserved", tone: "warn" },
  sold: { label: "Sold", tone: "muted" },
  let: { label: "Let", tone: "muted" },
  withdrawn: { label: "Withdrawn", tone: "muted" },
};
