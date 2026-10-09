import type { BoostTier, FeatureFlag, Report, SubscriptionPlan } from "./types";

/** Placement fees (KES base) — mirror the boost tiers on listings. */
export const SEED_BOOST_TIERS: BoostTier[] = [
  {
    id: "featured",
    label: "Featured",
    feePerWeek: 750,
    currency: "KES",
    blurb: "Priority in search results and the homepage featured rail.",
    active: true,
  },
  {
    id: "spotlight",
    label: "Spotlight",
    feePerWeek: 2250,
    currency: "KES",
    blurb: "Top billing everywhere plus the immersive 3D showcase stage.",
    active: true,
  },
];

/** Agent/agency subscription plans — the recurring-revenue ladder. */
export const SEED_PLANS: SubscriptionPlan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    pricePerMonth: 167,
    currency: "KES",
    listingCap: 10,
    features: [
      "Up to 10 active listings",
      "Standard verification",
      "Enquiry inbox",
      "Basic analytics dashboard",
    ],
    active: true,
  },
  {
    id: "plan_professional",
    name: "Professional",
    pricePerMonth: 5000,
    currency: "KES",
    listingCap: 50,
    features: [
      "Up to 50 active listings",
      "Featured placement included",
      "Lead management CRM",
      "Advanced analytics & reports",
      "WhatsApp enquiry integration",
      "Priority agent verification badge",
      "1 free Featured boost / month",
    ],
    active: true,
  },
  {
    id: "plan_corporate",
    name: "Corporate",
    pricePerMonth: 15000,
    currency: "KES",
    listingCap: null,
    features: [
      "Unlimited listings",
      "Multiple agent seats",
      "Full analytics suite",
      "Dedicated project page",
      "3 free Spotlight boosts / month",
      "Branded agency profile",
      "Priority onboarding & support",
    ],
    active: true,
  },
];

export const SEED_FLAGS: FeatureFlag[] = [
  { id: "immersive_3d", label: "Immersive 3D showcase", description: "The draggable 3D property carousel across the site.", enabled: true },
  { id: "diaspora_currency", label: "Diaspora currency toggle", description: "Local / USD / GBP price switching in the header.", enabled: true },
  { id: "ai_concierge", label: "AI concierge chat", description: "Gemini-grounded assistant on listings. Human-gated.", enabled: false },
  { id: "title_search", label: "Title-search (Ardhisasa)", description: "Buyer-initiated title verification on land PDPs.", enabled: false },
  { id: "mpesa_payments", label: "M-Pesa reservations", description: "STK Push reservation deposits and boost purchases.", enabled: false },
  { id: "masked_calling", label: "Masked in-app calling", description: "Proxy-number calls logged to the agent CRM.", enabled: false },
];

/** A couple of open reports so the moderation queue is populated on first run. */
export const SEED_REPORTS: Report[] = [
  {
    id: "rep_001",
    propertyId: "p_009",
    reason: "Suspected duplicate",
    detail: "Same photos appear on another portal under a different agent.",
    reportedOn: "2026-07-07",
    status: "open",
  },
  {
    id: "rep_002",
    propertyId: "p_011",
    reason: "Price looks wrong",
    detail: "Monthly rent seems far below the area median — possible bait listing.",
    reportedOn: "2026-07-08",
    status: "open",
  },
];
