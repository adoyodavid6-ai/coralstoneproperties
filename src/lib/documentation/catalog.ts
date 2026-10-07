// Required-documents catalog for a property purchase (Kenya).
// ---------------------------------------------------------------------------
// Powers the public "Documentation" section on every property page: the full
// checklist of paperwork needed to transact, who provides each item, and
// whether it is mandatory. The list adapts to the property's type, intent and
// title type so a bare plot of agricultural land and a sectional apartment show
// the right paperwork.
//
// NOTE: general guidance, not legal advice. The exact set varies by county,
// advocate and lender; CoralStones verifies the seller-side documents and the
// buyer supplies their KYC + funds paperwork through their account.

import type { Property, PropertyType, ListingIntent, TitleType } from "@/lib/types";

/** Who is responsible for producing a given document. */
export type DocProvider = "buyer" | "seller" | "coralstones";

export interface RequiredDoc {
  /** Stable key — also used as the upload slot id for buyer-provided docs. */
  key: string;
  label: string;
  /** One-line plain-English explanation of what it is / why it's needed. */
  description: string;
  provider: DocProvider;
  /** Mandatory for completion vs. situational/recommended. */
  mandatory: boolean;
}

/** A document the buyer uploads through their account. */
export interface UploadableDoc extends RequiredDoc {
  provider: "buyer";
}

// ---------------------------------------------------------------------------
// Buyer-provided documents (KYC + funds). The buyer uploads these in their
// account against a specific property. `conditional` entries only appear for
// the relevant buyer (married / company) but are always uploadable.
// ---------------------------------------------------------------------------
const BUYER_CORE: RequiredDoc[] = [
  {
    key: "buyer_id",
    label: "National ID or passport",
    description: "A clear copy of your Kenyan National ID (both sides) or passport bio-data page.",
    provider: "buyer",
    mandatory: true,
  },
  {
    key: "buyer_kra_pin",
    label: "KRA PIN certificate",
    description: "Your Kenya Revenue Authority PIN certificate — required to register the transfer and assess stamp duty.",
    provider: "buyer",
    mandatory: true,
  },
  {
    key: "buyer_passport_photos",
    label: "Passport photos",
    description: "Two recent coloured passport-size photographs for the transfer forms.",
    provider: "buyer",
    mandatory: true,
  },
  {
    key: "buyer_proof_of_funds",
    label: "Proof of funds / financing",
    description: "A recent bank statement, mortgage offer letter, or SACCO approval showing you can fund the purchase.",
    provider: "buyer",
    mandatory: false,
  },
];

const BUYER_MARRIED: RequiredDoc = {
  key: "spousal_consent",
  label: "Spousal consent (if married)",
  description: "Written spousal consent and marriage certificate — required under the Matrimonial Property Act when buying as a married person.",
  provider: "buyer",
  mandatory: false,
};

const BUYER_COMPANY: RequiredDoc[] = [
  {
    key: "company_incorporation",
    label: "Certificate of incorporation (if buying via a company)",
    description: "Company registration certificate, CR12, company KRA PIN and a board resolution authorising the purchase.",
    provider: "buyer",
    mandatory: false,
  },
];

const BUYER_STAMP_DUTY: RequiredDoc = {
  key: "stamp_duty",
  label: "Stamp duty payment",
  description: "Stamp duty (4% urban / 2% rural of value) is paid by the buyer via iTax/Ardhisasa before registration — upload the payment receipt.",
  provider: "buyer",
  mandatory: true,
};

// ---------------------------------------------------------------------------
// Seller / CoralStones-verified property documents. CoralStones confirms these
// as part of listing verification; the buyer's advocate re-checks them.
// ---------------------------------------------------------------------------
const TITLE_DEED: RequiredDoc = {
  key: "title_deed",
  label: "Title deed",
  description: "The registered title (freehold) or certificate of lease (leasehold) in the seller's name.",
  provider: "seller",
  mandatory: true,
};

const LAND_SEARCH: RequiredDoc = {
  key: "land_search",
  label: "Official land search",
  description: "An official search from the Ministry of Lands / Ardhisasa confirming ownership and that the title is free of caveats or charges.",
  provider: "coralstones",
  mandatory: true,
};

const RATES_CLEARANCE: RequiredDoc = {
  key: "rates_clearance",
  label: "Land rates clearance certificate",
  description: "County certificate confirming land rates are paid up to date.",
  provider: "seller",
  mandatory: true,
};

const RENT_CLEARANCE: RequiredDoc = {
  key: "rent_clearance",
  label: "Land rent clearance certificate",
  description: "For leasehold titles — confirms annual land rent to the national government is cleared.",
  provider: "seller",
  mandatory: true,
};

const SALE_AGREEMENT: RequiredDoc = {
  key: "sale_agreement",
  label: "Sale agreement",
  description: "The contract of sale drawn and witnessed by advocates, setting price, deposit and completion terms.",
  provider: "coralstones",
  mandatory: true,
};

const VALUATION: RequiredDoc = {
  key: "valuation_report",
  label: "Valuation report",
  description: "An independent valuer's report — usually required by the lender and for stamp-duty assessment.",
  provider: "coralstones",
  mandatory: false,
};

const TRANSFER_FORMS: RequiredDoc = {
  key: "transfer_forms",
  label: "Transfer instrument (LRA / RL1)",
  description: "The land registry transfer form executed by both parties and lodged for registration.",
  provider: "coralstones",
  mandatory: true,
};

// Land-specific extras
const LAND_CONTROL_CONSENT: RequiredDoc = {
  key: "land_control_board_consent",
  label: "Land Control Board consent",
  description: "Required to transfer agricultural land — consent granted by the area Land Control Board.",
  provider: "seller",
  mandatory: true,
};

const SURVEY_DEED_PLAN: RequiredDoc = {
  key: "survey_deed_plan",
  label: "Survey plan / deed plan / mutation",
  description: "The registered survey showing the parcel's exact boundaries and acreage; mutation forms for subdivisions.",
  provider: "seller",
  mandatory: true,
};

const BENEFICIARY_MAP: RequiredDoc = {
  key: "beacon_certificate",
  label: "Beacon certificate / site visit",
  description: "A surveyor's confirmation of boundary beacons on the ground — strongly recommended before paying for land.",
  provider: "coralstones",
  mandatory: false,
};

// Sectional / apartment extras
const SECTIONAL_PLAN: RequiredDoc = {
  key: "sectional_plan",
  label: "Sectional plan / title",
  description: "The registered sectional plan and unit title under the Sectional Properties Act.",
  provider: "seller",
  mandatory: true,
};

const SERVICE_CHARGE_CLEARANCE: RequiredDoc = {
  key: "service_charge_clearance",
  label: "Service-charge clearance",
  description: "Statement from the management company confirming service charge is paid up to date.",
  provider: "seller",
  mandatory: true,
};

const MANAGEMENT_RULES: RequiredDoc = {
  key: "management_rules",
  label: "Management company rules & accounts",
  description: "By-laws and recent accounts of the owners' management company, so you know the reserves and rules.",
  provider: "seller",
  mandatory: false,
};

// Off-plan extras
const OFFPLAN_RESERVATION: RequiredDoc = {
  key: "reservation_form",
  label: "Reservation / booking form",
  description: "The signed booking form and receipt for the reservation deposit.",
  provider: "coralstones",
  mandatory: true,
};

const OFFPLAN_PAYMENT_SCHEDULE: RequiredDoc = {
  key: "payment_schedule",
  label: "Payment schedule & sale agreement",
  description: "Off-plan sale agreement with the construction-linked payment milestones.",
  provider: "coralstones",
  mandatory: true,
};

const OFFPLAN_APPROVALS: RequiredDoc = {
  key: "project_approvals",
  label: "Project approvals (NCA / NEMA / county)",
  description: "Approved architectural plans and regulatory approvals confirming the development is sanctioned.",
  provider: "seller",
  mandatory: true,
};

const OFFPLAN_DEVELOPER_TITLE: RequiredDoc = {
  key: "developer_title",
  label: "Developer's mother title",
  description: "The developer's title for the land and, where offered, a bank/insurance completion guarantee.",
  provider: "seller",
  mandatory: true,
};

// Rent / short-let path
const TENANCY_AGREEMENT: RequiredDoc = {
  key: "tenancy_agreement",
  label: "Tenancy / lease agreement",
  description: "The signed tenancy agreement setting rent, deposit, term and house rules.",
  provider: "coralstones",
  mandatory: true,
};

const RENT_DEPOSIT: RequiredDoc = {
  key: "rent_deposit_proof",
  label: "Deposit & first rent",
  description: "Proof of the rent deposit and first month's rent payment.",
  provider: "buyer",
  mandatory: true,
};

const TENANT_REFERENCES: RequiredDoc = {
  key: "tenant_references",
  label: "Employment / income proof & references",
  description: "A letter from your employer or bank statements, plus a previous-landlord reference where available.",
  provider: "buyer",
  mandatory: false,
};

/**
 * The full ordered checklist for a given property. De-duplicated by key, with
 * seller/CoralStones-verified items first and buyer items last.
 */
export function requiredDocumentsFor(property: {
  type: PropertyType;
  intent: ListingIntent;
  titleType?: TitleType;
}): RequiredDoc[] {
  const { type, intent, titleType } = property;

  // Rent / short-let have a lighter, tenancy-focused path.
  if (intent === "rent" || intent === "short_let") {
    return dedupe([
      TENANCY_AGREEMENT,
      RATES_CLEARANCE,
      ...(type === "apartment" || type === "townhouse" ? [SERVICE_CHARGE_CLEARANCE] : []),
      { ...BUYER_CORE[0] },
      { ...BUYER_CORE[1] },
      RENT_DEPOSIT,
      TENANT_REFERENCES,
    ]);
  }

  // Purchase (sale) path — build from the common core outward.
  const docs: RequiredDoc[] = [];

  if (type === "off_plan") {
    docs.push(
      OFFPLAN_DEVELOPER_TITLE,
      OFFPLAN_APPROVALS,
      OFFPLAN_RESERVATION,
      OFFPLAN_PAYMENT_SCHEDULE,
      LAND_SEARCH,
      VALUATION,
      TRANSFER_FORMS,
    );
  } else {
    docs.push(TITLE_DEED, LAND_SEARCH);

    if (type === "land") {
      docs.push(SURVEY_DEED_PLAN, BENEFICIARY_MAP, LAND_CONTROL_CONSENT);
    }
    if (type === "apartment" || type === "townhouse" || titleType === "sectional") {
      docs.push(SECTIONAL_PLAN, SERVICE_CHARGE_CLEARANCE, MANAGEMENT_RULES);
    }

    docs.push(RATES_CLEARANCE);
    if (titleType === "leasehold") docs.push(RENT_CLEARANCE);

    docs.push(VALUATION, SALE_AGREEMENT, TRANSFER_FORMS);
  }

  // Buyer-side KYC + funds (always).
  docs.push(...BUYER_CORE, BUYER_MARRIED, ...BUYER_COMPANY, BUYER_STAMP_DUTY);

  return dedupe(docs);
}

/** The subset the buyer is expected to upload themselves. */
export function uploadableDocumentsFor(property: {
  type: PropertyType;
  intent: ListingIntent;
  titleType?: TitleType;
}): UploadableDoc[] {
  return requiredDocumentsFor(property).filter(
    (d): d is UploadableDoc => d.provider === "buyer",
  );
}

/** Convenience overload taking a full Property. */
export function docsForProperty(property: Property): RequiredDoc[] {
  return requiredDocumentsFor(property);
}

export const PROVIDER_LABEL: Record<DocProvider, string> = {
  buyer: "You provide",
  seller: "Seller provides",
  coralstones: "CoralStones verifies",
};

function dedupe(docs: RequiredDoc[]): RequiredDoc[] {
  const seen = new Set<string>();
  const out: RequiredDoc[] = [];
  for (const d of docs) {
    if (seen.has(d.key)) continue;
    seen.add(d.key);
    out.push(d);
  }
  // Stable grouping: verified property docs first, buyer docs last.
  const rank: Record<DocProvider, number> = { coralstones: 0, seller: 1, buyer: 2 };
  return out.sort((a, b) => rank[a.provider] - rank[b.provider]);
}
