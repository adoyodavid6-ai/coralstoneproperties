/**
 * Legal identity for CoralStones Properties — one source of truth, surfaced in
 * the footer, Terms of Service and Data Protection page.
 *
 * ⚠️ PLACEHOLDERS: every value wrapped in square brackets below is a stand-in
 * that renders VISIBLY on the live site. Replace each one with the real,
 * registered detail BEFORE public launch — these disclosures are legally
 * required in Kenya (Companies Act 2015, Data Protection Act 2019, Consumer
 * Protection Act 2019, E-Commerce/KICA). Leaving a "[…]" value live is a
 * compliance gap, not just a cosmetic one.
 */

export const LEGAL = {
  /** Registered legal entity name. Confirm this matches your certificate of incorporation. */
  entity: "CoralStones Properties Listings Limited",
  /** Registrar of Companies (BRS) company number. */
  registrationNumber: "[COMPANY REGISTRATION NO.]",
  /** Kenya Revenue Authority PIN. */
  kraPin: "[KRA PIN]",
  /** Office of the Data Protection Commissioner — data controller registration number. */
  odpcRegistrationNumber: "[ODPC REGISTRATION NO.]",
  /** Registered physical/postal address. */
  address: {
    line1: "[Building / street]",
    area: "[Area / estate]",
    city: "Nairobi",
    postalCode: "[P.O. Box 00000-00100]",
    country: "Kenya",
  },
  /** Public contact phone (with country code). */
  phone: "[+254 7XX XXX XXX]",
} as const;

/** Compact, comma-joined address for tight spaces (e.g. the footer). */
export const LEGAL_ADDRESS_ONELINE = [
  LEGAL.address.line1,
  LEGAL.address.area,
  LEGAL.address.postalCode,
  `${LEGAL.address.city}, ${LEGAL.address.country}`,
].join(", ");
