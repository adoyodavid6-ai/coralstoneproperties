// Core domain types (Masterplan §6) — frontend slice.
// These mirror the future Supabase schema so the data layer can swap in later.

/** East African trading currencies, plus USD/GBP for the diaspora. */
export type Currency = "KES" | "UGX" | "TZS" | "RWF" | "USD" | "GBP";

/** East African markets the portal covers. */
export type Country = "Kenya" | "Uganda" | "Tanzania" | "Rwanda";

/** Display mode for the price toggle: each listing in its own currency, or converted for the diaspora. */
export type DisplayCurrency = "local" | "USD" | "GBP";

export type ListingIntent = "sale" | "rent" | "short_let";

export type PropertyType =
  | "apartment"
  | "house"
  | "townhouse"
  | "land"
  | "commercial"
  | "off_plan"
  | "venue"; // short-term event/party spaces (weddings, graduations, hangouts…)

export type PropertyStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "under_offer"
  | "reserved"
  | "sold"
  | "let"
  | "withdrawn";

export type PricePeriod = "total" | "month" | "night" | "day";

/** The verification badge system (§4). Each badge states exactly what it guarantees. */
export type VerificationKind =
  | "listing"
  | "agent"
  | "agency"
  | "title"
  | "developer";

export interface VerifiedBadgeInfo {
  kind: VerificationKind;
  /** ISO date the check was completed. */
  verifiedOn: string;
}

export type TitleType = "freehold" | "leasehold" | "sectional" | "controlled";

export interface Agent {
  id: string;
  name: string;
  agency: string;
  avatarUrl: string;
  verified: VerificationKind[];
  /** Median first-response time in minutes — an earned stat. */
  responseMins: number;
  completedDeals: number;
  phone: string;
  whatsapp: string;
}

export interface AreaGuide {
  country: Country;
  county: string; // city / region within the country
  area: string;
  estate?: string;
  /** 0–100 resident-scored signals (Masterplan §8 neighbourhood intelligence). */
  security: number;
  waterReliability: number;
  powerReliability: number;
  roadAccess: number;
}

export interface Property {
  id: string;
  slug: string;
  title: string;
  type: PropertyType;
  intent: ListingIntent;
  status: PropertyStatus;

  price: number;
  currency: Currency;
  pricePeriod: PricePeriod;
  /** Optional previous price to show a reduction. */
  previousPrice?: number;

  beds?: number;
  baths?: number;
  /** Venue only: maximum guest capacity for events. */
  capacity?: number;
  /** Internal floor area. */
  size?: number;
  sizeUnit?: "sqm" | "sqft" | "acres";
  plotSize?: number;
  plotSizeUnit?: "acres" | "sqm";
  furnishing?: "furnished" | "semi_furnished" | "unfurnished";
  yearBuilt?: number;

  country: Country;
  county: string; // city / region within the country
  area: string;
  estate?: string;
  /** Approx coordinates — exact address is hidden until enquiry (PII minimisation). */
  lat: number;
  lng: number;

  serviceCharge?: number; // monthly, in same currency
  titleType?: TitleType;

  amenities: string[];
  lifestyle: string[]; // accessibility / lifestyle filters
  images: string[];
  hasVideo?: boolean;
  has3dTour?: boolean;
  hasDrone?: boolean;

  verified: VerifiedBadgeInfo[];
  boostTier?: "featured" | "spotlight";

  description: string;
  /** Was the description AI-drafted then human-approved? (labelled on the PDP.) */
  aiAssistedDescription?: boolean;

  agent: Agent;
  area_guide: AreaGuide;

  listedOn: string; // ISO date
  viewCount: number;
  saveCount: number;

  /** Off-plan only. */
  completionPercent?: number;
  handoverDate?: string;
}
