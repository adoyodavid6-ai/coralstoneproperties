import type {
  ListingIntent,
  PropertyType,
  TitleType,
  VerificationKind,
} from "./types";

export const TYPE_LABEL: Record<PropertyType, string> = {
  apartment: "Apartment",
  house: "House",
  townhouse: "Townhouse",
  land: "Land / Plot",
  commercial: "Commercial",
  off_plan: "Off-plan",
  venue: "Event venue",
};

export const INTENT_LABEL: Record<ListingIntent, string> = {
  sale: "For sale",
  rent: "To rent",
  short_let: "Short-let",
};

export const TITLE_LABEL: Record<TitleType, string> = {
  freehold: "Freehold",
  leasehold: "Leasehold",
  sectional: "Sectional title",
  controlled: "Controlled land",
};

/** Each badge states *exactly* what it guarantees (§4). */
export const VERIFICATION_META: Record<
  VerificationKind,
  { label: string; guarantee: string }
> = {
  listing: {
    label: "Listing verified",
    guarantee:
      "Our team confirmed this specific property exists, the media is genuine and current, and the price is real — not a bait listing.",
  },
  agent: {
    label: "Agent verified",
    guarantee:
      "The individual agent's national ID and practising credentials were checked against our records.",
  },
  agency: {
    label: "Agency verified",
    guarantee:
      "The agency is a registered business with a verified office and at least one vetted agent.",
  },
  title: {
    label: "Title verified",
    guarantee:
      "A title search was run and the seller's ownership and title particulars were confirmed at the point of listing.",
  },
  developer: {
    label: "Developer verified",
    guarantee:
      "The developer is a registered entity with a track record on the platform and confirmed rights to the scheme.",
  },
};
