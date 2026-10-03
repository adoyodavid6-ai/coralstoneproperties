# CoralStones Properties Listings

> Kenya's **trust-first** property portal. Verification is the name and the moat —
> every agent, agency, listing and (for land) title is checked before it reaches a buyer.

This repository is the **V1 frontend slice** built against the
[Property Portal Masterplan v2](./Property_Portal_Masterplan_v2.md): the
buyer-facing **Home → Search → Property Detail** experience, running entirely on
realistic in-memory mock data so it can be previewed with zero backend setup.

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

Production build / serve:

```bash
npm run build
npm run start
```

No environment variables are required for this slice — see `.env.example` for the
full stack the later stages will use.

## What's built (this slice)

| Area | Delivered |
|---|---|
| **Design system** | Locked plum-and-blush palette as Tailwind v4 theme tokens (no ad-hoc hex), editorial serif / geometric sans / monospace-for-figures type, restrained motion, WCAG-AA focus rings & skip link. |
| **Home** | Hero + unified search, three-pillar story, verified/featured listings, the six-check verification explainer with live badge tooltips, decision-intelligence tools, CTA. |
| **Search** | One engine for Buy/Rent/Land/Commercial/Off-plan/Short-let. Filters (intent, type, county→area cascade, price, beds, verified-only, price-reduced, has-media, lifestyle/accessibility), sort, shareable URL state, SSR results, mobile filter drawer, empty/loading states. |
| **Property detail** | Media-first gallery with lightbox, verified strip with explainers, facts, AI-assisted (human-approved) description, **True Monthly Cost** + interactive mortgage snapshot, amenities, location intelligence, off-plan construction tracker, land-buyer toolkit, sticky conversion rail (Enquire · WhatsApp · Masked call · Book · Reserve · Offer), agent card with earned response-time stat, similar homes. |
| **i18n** | English + Swahili dictionaries with a live language toggle. |
| **Diaspora** | KES / USD / GBP currency toggle applied across all figures. |

## Tech stack

- **Next.js 16** (App Router, RSC-first) + **TypeScript**
- **Tailwind CSS v4** with a tokenised theme (`src/app/globals.css`)
- Fonts (Lora / Poppins / JetBrains Mono) loaded via `<link>` with graceful fallbacks

Matches the approved stack in Masterplan §3. Supabase (Postgres + PostGIS, RLS-first),
M-Pesa/Pesapal payments, Africa's Talking OTP/USSD, Resend and the Anthropic AI layer
are **later stages** and intentionally not wired up here.

## Project structure

```
src/
  app/
    layout.tsx              # shell: fonts, providers, header/footer, skip link
    page.tsx                # home
    search/page.tsx         # unified search (server) + loading skeleton
    property/[slug]/page.tsx# PDP (SSG per listing)
    not-found.tsx
  components/
    layout/                 # Header (lang + currency toggles), Footer
    home/                   # Hero
    search/                 # SearchBar, FilterPanel, SortSelect, MobileFilters
    property/               # Gallery, ConversionRail, CostIntelligence, PropertySignals
    ui/                     # Button, PropertyCard, VerifiedBadge, SmartImage, icons…
  lib/
    types.ts                # domain types (mirror the future Supabase schema)
    data/                   # mock properties + agents (stand-in query layer)
    search.ts               # filter/sort logic
    format.ts               # currency-aware, monospace figure formatting
    labels.ts               # type / intent / verification metadata
    i18n/                   # EN+SW dictionaries + LocaleProvider (locale & currency)
```

## Design & accessibility notes

- Small / long-form text is always plum `#5B263C` on blush `#F8EBEF`; mauve `#8E3F60`
  is reserved for links, large display and UI accents — enforced via tokens.
- The verified green stays visually distinct from brand plum and is used **only** for
  status meaning, never decoration.
- Server render is English/KES for stable hydration; the language and currency toggles
  apply on the client.
- Every AI/verification touchpoint is labelled ("AI-assisted, human-approved";
  "IPN-authoritative") per the masterplan's *AI proposes, humans dispose* principle.

## Next stages (from the masterplan)

Preview Pause A (Supabase migrations + RLS + seed) → auth (email + phone OTP) →
payments/reservations/escrow → offers & e-agreements → the AI intelligence layer.
See [`Property_Portal_Masterplan_v2.md`](./Property_Portal_Masterplan_v2.md).
