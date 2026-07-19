# Verified Property Listings — Property Portal Masterplan **v2** (Agent Build Brief)

> **Brand locked:** `{{SITE_NAME}}` = **Verified Property Listings**. Verification is both the name and the moat — the whole product must live up to it.

> **Purpose.** Scope-locked master prompt to hand directly to a Claude Code agent in VS Code. Build in the numbered stages. **Pause at every `⏸ PREVIEW PAUSE` for my approval.** Do not skip ahead, do not invent scope, do not build a later-phase module early. UK spelling throughout. No new dependencies beyond the approved stack without asking first.
>
> **What changed from v1.** This version folds in the full trust/land-fraud, transaction-lifecycle, reach, revenue, and buyer-experience upgrades, and phases every feature explicitly into **[V1]**, **[V1.5]**, or **[LATER]**. The three pillars are unchanged: **Trust & Verification · Decision Intelligence · Conversion & Lifecycle.**

---

## 0. Placeholder tokens (fill before/at build time)

Replace these; never hard-code finals until I confirm. **Every credential lives in env — never committed, never client-exposed.**

| Token | Meaning |
|---|---|
| `{{SITE_NAME}}` = **Verified Property Listings** · `{{LEGAL_ENTITY}}` · `{{DOMAIN}}` | Brand / entity / domain |
| `{{SUPPORT_EMAIL}}` `{{WHATSAPP_NUMBER}}` | Contact channels |
| **Brand palette (locked):** `{{BRAND_PRIMARY}}` = `#5B263C` · `{{BRAND_ACCENT}}` = `#8E3F60` · `{{BRAND_SURFACE}}` (page background) = `#F8EBEF` · `{{BRAND_INK}}` = `#5B263C` | Design tokens (see §4) |
| `{{MPESA_SHORTCODE}}` `{{MPESA_PASSKEY}}` | Daraja (STK Push) |
| `{{PESAPAL_CONSUMER_KEY}}` `{{PESAPAL_CONSUMER_SECRET}}` | Pesapal 3.0 |
| `{{AT_API_KEY}}` `{{AT_USERNAME}}` | Africa's Talking (SMS / USSD) |
| `{{ANTHROPIC_API_KEY}}` `{{RESEND_API_KEY}}` `{{MAPS_KEY}}` | AI / email / maps |
| `{{ARDHISASA_*}}` | Land-registry / title-search integration (adapter-gated) |
| `{{ESIGN_*}}` | E-signature provider (adapter-gated) |

---

## 1. Mission & positioning

An all-round property portal for Kenya (with diaspora + pan-African ambitions) covering **residential sales, rentals, land/plots, commercial, off-plan developments, and short-lets**. It must match everything ordinary listing sites do — and decisively out-class them on **trust, intelligence, and post-enquiry conversion**.

**Three pillars — every decision serves one of these:**
1. **Trust & verification** — the market suffers fake listings, double-selling, ghost agents, and stalled off-plan. Verification is the moat, not a footnote.
2. **Decision intelligence** — people want to know if it's a *good* decision: true cost, yield, neighbourhood truth, honest AI guidance.
3. **Conversion & lifecycle** — capture lead → book viewing → take reservation → offer → agreement → completion → manage. Ordinary sites stop at "send enquiry." We own the whole chain.

---

## 2. Scope lock & guardrails

- Build strictly in stage order; never build a later-phase module early.
- No auth providers, payment providers, ORMs, UI kits, or state libraries beyond the approved stack.
- Style only via the tokenised design system (§4) — no ad-hoc hex.
- **No table ships without an RLS policy in the same migration.**
- All interiors currency-aware and locale-aware (English **and** Swahili) from day one.
- Stop at each preview pause and show the running result.
- **Ask first** before adding: a background-job runner, a dedicated search service, a media CDN, an e-signature provider, or any land-registry integration.
- Every AI and money/publishing/verification action is **labelled and human-gated** — AI proposes, humans dispose.

---

## 3. Tech stack (approved — do not deviate)

- **Framework:** Next.js (App Router) + TypeScript, RSC-first.
- **Styling:** Tailwind with tokenised theme.
- **DB & auth:** Supabase (Postgres + PostGIS). **RLS from first migration — non-negotiable.**
- **Storage:** Supabase Storage — buckets `listing-media`, `verification-docs` (private), `agreements` (private), `avatars`, `developments`, `progress-updates`.
- **Payments:** M-Pesa Daraja (STK Push) + Pesapal 3.0 (cards/bank/diaspora). Stripe optional later for USD.
- **SMS/OTP + USSD:** Africa's Talking. **Email:** Resend.
- **Maps/geocoding:** behind an adapter interface (swappable tiles).
- **AI:** Anthropic Claude API via server routes only.
- **i18n:** English + Swahili end-to-end (adapter-based dictionaries, locale in URL/profile).
- **Search:** Postgres full-text + `pg_trgm` + PostGIS radius/boundary. Graduate to a dedicated engine only with my approval (Stage 14).
- **Deploy:** Vercel; DNS per current setup.

---

## 4. Design system & brand

Editorial, premium-but-accessible — trustworthy over flashy. This is a high-value-transaction product; it must *feel* safe. The palette is a warm plum-and-blush scheme: refined, confident, distinctly non-corporate.

- **Locked brand palette (do not deviate; expose as Tailwind theme tokens, no ad-hoc hex in components):**
  - `--surface` **`#F8EBEF`** (soft blush) — the **page background** across the whole site. Cards/panels sit on near-white (`#FFFFFF` or a 40–60% blend toward white) to lift off the blush.
  - `--primary` / `--ink` **`#5B263C`** (deep plum) — primary buttons, headings, **body text**, key UI, and the default text colour on the blush background. Highest-contrast pairing (AAA-level on `#F8EBEF`), so use it for anything small or long-form.
  - `--accent` **`#8E3F60`** (mauve) — links, secondary actions, highlights, hovers, active states, large display text. Passes AA on the blush for large/UI text; **do not** use `#8E3F60` for small body copy — drop to `#5B263C` there.
  - **Derived states (generate as tints/shades of the two brand colours, don't introduce new hues):** hover = plum/mauve darkened ~8%; disabled = mauve at reduced opacity; borders/dividers = plum at 12–16% on blush; focus ring = mauve.
- **Semantic tokens (functional necessity — kept muted so they harmonise, not clash):** `success/verified` = a deep harmonised green for the verified tick and confirmation states (green reads unambiguously as "safe/confirmed" and must stay visually distinct from brand plum); `warning` = muted amber; `danger` = muted brick red. These are the *only* non-brand hues allowed, and only for status meaning — never decoration.
- **Type:** editorial serif headings (Lora register) in plum, geometric sans UI/body (Poppins register), **monospace for all figures** — prices, yields, sizes, coordinates, instalments.
- **Verified visual language:** consistent badge system — *agent verified · agency verified · listing verified · title verified · developer verified · buyer verified* — each with a tooltip stating exactly what it guarantees. Present everywhere a property or person appears.
- **Motion:** restrained; skeletons and gentle fades only.
- **Accessibility:** WCAG 2.2 AA — keyboard-navigable search, focus rings, semantic landmarks, alt text, contrast-safe verified/warning states. Enforce the palette rule above: small text is always `#5B263C` on `#F8EBEF`; `#8E3F60` only for large text, links, and UI accents. Verify every foreground/background pairing at build time.
- **Mobile-first + low-bandwidth:** most traffic is mobile on variable networks. Every core flow flawless on a small screen and slow connection.

---

## 5. Information architecture / sitemap

**Public** — Home · Search (Buy / Rent / Land / Commercial / Off-plan / Short-let, all one engine) · Map search · PDP · Development/off-plan micro-sites · Agent & Agency profiles · **Estate/area guides with resident reviews** · Compare · Mortgage & affordability hub · **What's my property worth? (AVM)** · Sell/List with us · **Diaspora hub** · **Chama / group-buying hub** · Partner marketplace · Blog/insights · About · Contact · Legal (Terms, Privacy, Cookies, Anti-fraud, Data Protection).

**Buyer/Tenant** — Dashboard · Saved · Saved searches & alerts · **Collaborative shortlists** · Viewings · Enquiries/messages · **Offers** · Reservations & payments · **Transaction/chain tracker** · Documents & e-signatures · Profile/KYC (buyer verification).

**Agent/Agency** — Dashboard · Listings manager · Lead CRM · Enquiry inbox · Viewings calendar · **Offer management** · Reservations/payouts · **Off-plan progress publisher** · Verification centre · Team · Billing/subscription · Analytics.

**Landlord (management add-on)** — Portfolio · Tenancies · **Rent collection** · **Maintenance ticketing** · Statements.

**Admin** — Moderation queue · Verification approvals · **Title-search requests** · Fraud/duplicate triage · User management · Featured/boost · Content/CMS · Payments reconciliation · Partner directory · Feature flags · Insert-only audit.

---

## 6. Data model (core — RLS from first migration)

Snake_case, timestamps, soft-delete where noted. Ship policies with tables.

- `profiles` (role `buyer|agent|agency_admin|landlord|staff`, kyc_status, verified flags incl. **buyer_verified**, locale, preferred_currency, contact prefs).
- `agencies`, `agency_members`, `agent_verifications`.
- `properties` (type, listing_intent, price, currency, price_period, status `draft|pending_review|active|under_offer|reserved|sold|let|withdrawn`, beds, baths, size+unit, plot_size, furnishing, year_built, service_charge, county/area/estate, geo point, address_private, verification_status, boost_tier, view_count, save_count, slug).
- `land_parcels` (title_type `freehold|leasehold|sectional|controlled`, title_number, tenure_years, zoning, has_beacons, survey_status, ready_for_transfer).
- `title_searches` (parcel, requester, provider_ref, status, result_doc [private]) — **[V1.5] Ardhisasa adapter**.
- `developments`, `development_units`, `development_progress` (milestone, photos, %complete, date) — off-plan tracker.
- `property_media` (images, floor_plans, video, 3d_tour_url, drone), ordered + responsive variants.
- `amenities`, `property_amenities` (pool, borehole, backup_generator, DSQ, gated, CCTV, lift, parking, **ground_floor, pet_friendly, backup_water, backup_power, family_friendly**).
- `saved_properties`, `saved_searches` (alert_frequency + channel: email/SMS/WhatsApp/**USSD**), `shortlists`, `shortlist_members`, `shortlist_items` (with votes/notes) — **collaborative shortlists**.
- `enquiries`, `messages`, `masked_calls` (call log via proxy number), `viewings` (incl. virtual).
- `offers` (property, buyer, amount, terms, status `made|countered|accepted|declined|withdrawn`, thread) — **digital offer management**.
- `reservations`, `payments` (provider, provider_ref, status, **idempotency_key**), `payouts`, `escrow_holds`.
- `agreements` (type, parties, esign_status, signed_doc [private], audit) — **e-signed tenancy/sale**.
- `transactions` (chain stages offer→searches→legal→completion), `conveyancers` (verified lawyer directory).
- `tenancies`, `rent_invoices`, `rent_payments`, `maintenance_tickets` — **landlord add-on**.
- `chamas`, `chama_members`, `chama_contributions`, `chama_targets` — **group buying/land-banking**.
- `avm_estimates` (valuation model output + assumptions).
- `resident_reviews` (estate/area, verified-resident-gated), `agent_reviews` (verified-transaction-gated), `testimonials`.
- `neighbourhood_stats` (cached area intelligence).
- `partners`, `partner_leads` (mortgage/insurance/movers/cleaners).
- `fraud_reports`, `moderation_actions`, `audit_log` (**insert-only, tamper-evident**), `subscriptions`, `boosts`, `feature_flags`.

**RLS principles:** users see only their own saved/shortlist/enquiry/offer/reservation/tenancy rows; agents see only their agency's data; private address granularity, verification docs, agreements, and title-search results never exposed to public role; staff role via checked claim, not client-set; escrow/payment tables service-role-only.

⏸ **PREVIEW PAUSE A** — migrations + RLS + seed data before any UI.

---

## 7. Stage-by-stage build plan

### Stage 1 — Foundations **[V1]**
Repo, Tailwind tokens, layout shell, header/footer, **i18n scaffolding (EN + SW)**, auth (email + phone OTP via Africa's Talking), role-aware routing, Supabase client/server setup, env scaffolding, base component library, error/loading/empty states.
⏸ **PREVIEW PAUSE B**

### Stage 2 — Listings & search engine **[V1]**
Unified engine → Buy/Rent/Land/Commercial/Off-plan/Short-let views. Filters: location cascade (county→area→estate), price, intent, type, beds/baths, size, plot size, furnishing, amenities (incl. **accessibility/lifestyle filters**), keyword, **verified-only**, new-in-X-days, price-reduced, has-video/3D. Sort: relevance/price/newest/most-viewed. Results grid/list, verified badges, save + quick-compare, skeletons, shareable URL state, SSR for SEO. **Map search:** synced pins↔list, clustering, draw-boundary, radius, "search this area."
⏸ **PREVIEW PAUSE C**

### Stage 3 — Property detail page **[V1]**
Media-first gallery (photos, floor plans, video, 3D tour, drone; lightbox; lazy). Facts panel. **Verified strip** with explainers. Description (AI-assisted, human-approved). Amenities grid. **Location intelligence block** (§8). **True Monthly Cost** + mortgage snapshot (§8). Similar/nearby, price history, days-on-market. **Sticky conversion rail:** Enquire · WhatsApp · **Masked call** · Book viewing · Reserve · **Make offer**. Agent card with response-time stat. Report-listing + share.
⏸ **PREVIEW PAUSE D**

### Stage 4 — Accounts & saved experience **[V1]**
Buyer/tenant dashboard, favourites, saved searches with **alerts (email + SMS + WhatsApp)**, recently viewed, **compare tool with 5-year true-cost comparison + highlight-differences**, **collaborative shortlists (share, annotate, vote)**, profile + **buyer KYC/verification**.
⏸ **PREVIEW PAUSE E**

### Stage 5 — Enquiries, messaging, viewings & masked calling **[V1]**
Threaded buyer↔agent messaging, anti-spam enquiry forms, **masked in-app calling** (proxy numbers, logged to CRM), **viewing scheduler** (availability slots, booking, calendar invites, SMS/email reminders, reschedule/cancel, **virtual viewing** video link).
⏸ **PREVIEW PAUSE F**

### Stage 6 — Agent/Agency portal & CRM **[V1]**
Listings manager (multi-step create/edit, media uploader with drag-reorder + auto-optimise, status workflow draft→review→publish), **lead CRM** (pipeline, notes, assignment, follow-ups), enquiry inbox, viewings calendar, performance analytics (views, enquiries, conversion, response time), team management, verification centre (upload licence/ID/title → staff review). **Seller/landlord-facing analytics** ("your listing: X views, Y saves, priced Z% vs area median").
⏸ **PREVIEW PAUSE G**

### Stage 7 — Payments, reservations & escrow **[V1]**
M-Pesa STK Push (reservation/booking deposits, short-let) + Pesapal 3.0 (cards/bank/diaspora). Reservation flow → deposit → `reserved` → agent confirm → receipt (email+SMS). **Escrow-style holds** for diaspora/off-plan. **Idempotency + IPN-authoritative status** (never trust redirect params). Agent subscription billing + boost purchases. Refund/expiry handling. Full audit trail.
⏸ **PREVIEW PAUSE H**

### Stage 8 — Offers, agreements & transaction chain **[V1.5]**
**Digital offer management** (make/counter/accept/decline, audit trail). **E-signed agreements** (tenancy/sale via e-sign adapter, private storage, audit). **Transaction/chain tracker** (offer→searches→legal→completion) with **verified conveyancer directory**.
⏸ **PREVIEW PAUSE I**

### Stage 9 — Trust, verification & anti-fraud **[V1 core, V1.5 title-search]**
Multi-tier verification (agent/agency/listing/title/developer/**buyer**). **Duplicate/clone detection** (image + text similarity). Report-a-listing → triage → takedown + audit. Earned agent stats (response time, completed transactions). **[V1.5] Ardhisasa/title-search integration** — buyer-initiated title verification on land PDPs, results in private store.
⏸ **PREVIEW PAUSE J**

### Stage 10 — Reach: USSD, Swahili, chama **[V1.5]**
**USSD access** (Africa's Talking) — search + alerts on feature phones, no data. Swahili parity audit across all flows. **Chama / group-buying** hub — group creation, contribution tracking, targets, shared land-banking shortlists.
⏸ **PREVIEW PAUSE K**

### Stage 11 — Decision & investment intelligence **[V1 basics, V1.5 advanced]**
True Monthly Cost, mortgage & affordability suite, **AVM "what's my property worth?"** seller lead magnet, rental yield/ROI analytics, neighbourhood intelligence pages, commute/lifestyle scoring, land-buyer toolkit, **off-plan construction progress tracker** (milestone photos + instalment tracker). (§8)
⏸ **PREVIEW PAUSE L**

### Stage 12 — AI intelligence layer **[V1.5]** (§9)
### Stage 13 — Landlord management, partner marketplace, growth/SEO **[LATER]** (§10)
### Stage 14 — Performance, search graduation, hardening **[ongoing]** (§11–12)

---

## 8. Decision intelligence (depth that beats listing-only sites)

- **True Monthly Cost widget** — rentals: rent + service charge + est. utilities + amortised deposit. Buys: mortgage est. + rates/land rent + service charge + insurance. Itemised, currency-aware. **[V1]**
- **Mortgage & affordability suite** — repayment calc with real Kenyan bank rate presets, deposit/LTV, tenure, stamp duty + legal-cost estimator, reverse "what can I afford", and a **pre-qualification lead form** routing to partner lenders. **[V1]**
- **AVM — "What's my property worth?"** — instant estimate from comparables + area stats; a seller lead magnet feeding the CRM. **[V1.5]**
- **Rental yield & investment analytics** — gross/net yield, ROI, break-even, capital-appreciation projection, off-plan payment-plan modelling, buy-to-let score; assumptions shown. **[V1.5]**
- **Neighbourhood intelligence** (PDP block + area pages) — price/rent trends, typical yields, security, schools, hospitals, shopping, water reliability, power reliability, road access, commute times; cached and refreshed. **[V1 basic → V1.5 rich]**
- **Commute & lifestyle scoring** — "set your workplace" → per-PDP commute + proximity scores. **[V1.5]**
- **Land-buyer toolkit** — title-type explainer, leasehold tenure countdown, due-diligence checklist, beacons/survey status, linked from every land PDP. **[V1]**
- **Off-plan progress tracker** — milestone photos, %-complete, and instalment tracker so buyers see real construction status. **[V1.5]**
- **Diaspora hub** — currency toggle (KES/USD/GBP), **remote/virtual viewings**, verified-developer-only filter, **escrow reservation** via Pesapal, "buy from abroad" walkthrough, concierge route. **[V1.5]**

---

## 9. Trust, verification & AI

**Verification & anti-fraud (the moat)** — multi-tier badges (agent/agency/listing/title/developer/**buyer**); clone-listing detection (image+text similarity) to catch scraped scams; report→triage→takedown+audit; earned agent stats; review gating (only verified interactions can review agents); **verified-resident reviews of estates/apartments** (hard to fake, decisive for buyers); **masked in-app calling** (privacy + logged leads). **[V1; title-search V1.5]**

**AI intelligence layer (Anthropic Claude API, server-side only)** — **[V1.5]**
- **Natural-language search** → structured filters, graceful fallback.
- **AI concierge chat** grounded strictly in live listing + neighbourhood data (no invented properties); shortlists, answers yield/commute questions, hands off to a human agent.
- **AI-assisted listing descriptions** for agents — drafted from facts, **human-approved before publish**, house-style + honesty guard (no unverifiable claims).
- **Smart matching & weekly digests** with *why it matched* explained.
- **Fraud-signal assistant** for moderators — flags below-market prices, stock-photo hints, mismatched locations for human review.
- **Restraint principle:** AI proposes, humans dispose; every AI touchpoint labelled; no silent automated action on money, publishing, or verification.

---

## 10. Landlord management, marketplace & growth **[LATER]**

- **Landlord add-on** — portfolio, tenancies, **rent collection** (M-Pesa recurring invoices), **maintenance ticketing** (tenant→landlord→vendor), statements. Recurring-revenue engine.
- **Partner marketplace** — mortgages, insurance, movers, cleaners, conveyancers; lead routing + post-transaction revenue.
- **Programmatic SEO** for area + type pages with real data + internal linking; **Schema.org** (`RealEstateListing`/`Offer`/`Residence`, breadcrumbs, `AggregateRating`, `FAQPage`); dynamic sitemaps; OG/Twitter cards per PDP.
- Blog/insights CMS; newsletter + market-report lead magnet; referral hooks; shareable listing/compare/shortlist links.
- **WhatsApp-first engagement** (click-to-WhatsApp everywhere, opt-in alerts).
- Featured/spotlight/boost inventory — clearly labelled as promoted.

---

## 11. Performance, reliability & offline resilience **[ongoing]**

- Core Web Vitals budget: LCP < 2.5s on 3G-class; RSC-first, minimal client JS on public pages; responsive images + blur placeholders.
- **Low-bandwidth mode** + aggressive caching; **USSD path works with zero data**.
- Map/heavy widgets lazy-loaded; skeletons + optimistic UI on blocking calls.
- Rate limiting on enquiry/OTP/payment endpoints.
- Graceful degradation: search works even if AI or maps are down.

---

## 12. Security, privacy & compliance **[ongoing]**

- RLS on every table; service-role key server-only; signed URLs for private docs/agreements/title results.
- **Kenya Data Protection Act** alignment: marketing consent, data-subject access/deletion, purpose limitation, retention, cookie consent.
- PII minimisation: exact addresses hidden until enquiry/verification; verification docs, agreements, and title results in private buckets with staff-only access + audit.
- Payment security: idempotency keys, IPN-authoritative status, no card data touched (delegated to Pesapal), verified signed callbacks; escrow tables service-role-only.
- **Insert-only audit log** for verification, moderation, offers, payments, agreements, status changes — tamper-evident (hashed evidence where applicable).
- Abuse controls: OTP throttling, enquiry spam protection, honeypots, masked-call abuse limits, report/ban flows.
- Feature flags for safe rollout of AI, payments, title-search, and e-sign.

---

## 13. Acceptance criteria (per stage — I sign off before merge)

1. Runs; happy path works end-to-end on mobile viewport.
2. RLS proven with a negative test (a user cannot read/write another's rows).
3. Empty, loading, and error states exist.
4. UK spelling, EN+SW parity, design tokens only.
5. No secrets committed; env documented in `.env.example`.
6. Lighthouse (mobile) pass on new public pages.
7. AI/payment/verification/offer/agreement actions are labelled, human-gated, and audited.

---

## 14. Phasing summary

- **[V1]** Foundations · search engine · PDP · saved/shortlists/compare · messaging + masked calls + viewings · agent CRM · payments/reservations/escrow · verification core · True Monthly Cost + mortgage + land toolkit + seller analytics.
- **[V1.5]** Offers + e-agreements + chain tracker · title-search (Ardhisasa) · USSD + Swahili parity + chama · AVM + yield analytics + neighbourhood-rich + off-plan progress + diaspora hub · AI layer.
- **[LATER]** Landlord management (rent + maintenance) · partner marketplace · full programmatic SEO/growth · dedicated search engine · native/PWA · auctions/rent-to-own.

---

**Build discipline reminder:** stage order · preview pauses · scope lock · RLS-first · UK spelling · EN+SW · no unapproved dependencies · secrets in env · AI/money/verification human-gated and audited. Proceed to **Stage 1**, stop at **Preview Pause A** with schema + RLS before any UI.
