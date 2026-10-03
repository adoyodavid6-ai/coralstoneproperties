/**
 * Public contact accounts for CoralStone Properties.
 *
 * One source of truth for the email addresses shown across the site
 * (Contact page, Footer, policy pages). All three live on the verified
 * company domain, coralstonesproperties.co.ke.
 */

export const CONTACT_EMAILS = [
  {
    address: "info@coralstonesproperties.co.ke",
    label: "General enquiries",
    description: "Questions about listings, verification, or anything else.",
  },
  {
    address: "support@coralstonesproperties.co.ke",
    label: "Support",
    description: "Help with bookings, payments, or your account.",
  },
  {
    address: "report@coralstonesproperties.co.ke",
    label: "Report a listing",
    description: "Suspected fraud or a problem with a listing.",
  },
] as const;
