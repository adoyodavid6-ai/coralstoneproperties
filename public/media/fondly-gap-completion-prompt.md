# FONDLY CRM (formerly Zoesha): Gap Audit and Completion Prompt

## 0. Your role

You are the lead engineer completing Fondly, a multi-tenant Customer Relationship Intelligence platform ("The CRM that remembers what matters"). The product was previously named Zoesha. A substantial build already exists in this repository. Your job is to find what is missing or half-built against a complete CRM capability set, then build it to production standard.

You are not starting over. You are finishing.

## 1. Ground rules

1. **Ruling document.** The Fondly masterplan v4.2 in this repo is the source of truth for product decisions. If this prompt and the masterplan disagree, the masterplan wins and you flag the conflict in your report.
2. **Scope lock.** Do not refactor, restyle, or rewrite anything that already works. Touch working code only when a gap fix requires it, and say so.
3. **Evidence over assumption.** Never mark a capability as present because a file name suggests it. Confirm with a route, a table, a working UI path, and a passing test.
4. **Stack.** Next.js, Supabase (Postgres with RLS), background worker. No new frameworks or services without asking.
5. **Multi-tenancy.** Every new table carries `tenant_id` with RLS policies and a cross-tenant isolation test. No exceptions.
6. **Language.** UK English in all UI copy, comments, and docs. App UI is English only; the marketing site is multilingual.
7. **Placeholders.** Any unconfirmed value (API keys, provider names, fees not listed here, legal text) goes in as a clearly named token such as `{{AIRTIME_PROVIDER}}`, listed in `PLACEHOLDERS.md`. Never invent a value.
8. **Proof one before rollout.** For any pattern repeated across modules or industry packs, build one, show it, then replicate.
9. **Pause points.** Stop and wait for approval at each point marked PAUSE.

## 2. Locked product decisions (do not reopen)

- Name: Fondly. Domain: getfondly.com.
- Market: Kenya first, global-ready schema (multi-currency, multi-timezone, locale-aware phone and address formats).
- Pricing: volume-based by customer count, with cheap light seats. Not per-seat.
- Free tier: permanent, 500 customers, 2 users.
- Payments: processor cost passed through at cost plus approximately 1% Fondly margin.
- Gift fulfilment: orchestration through curated partners. Fondly holds no stock.
- Airtime gifting: build against `{{AIRTIME_PROVIDER}}`.
- Warmth autonomy: levels up to 4 (full autonomy), opt-in only, off by default.
- Handwritten notes: prompts for staff to write themselves. No print-and-post.
- White label: basic from Business tier, full at Enterprise.
- Partner and agency channel: launch priority.
- Proving vertical: Hospitality, built deep first. Other industry packs follow the proven pattern.
- Product stack: LedgerLock (transactions) feeds LassElan (conversations) feeds Fondly (relationship intelligence).

## 3. Phase A: Rebrand sweep

Search the whole repository for `Zoesha`, `zoesha`, `ZOESHA`, and any old domain, logo, or email address.

- Replace in UI copy, metadata, emails, templates, SEO tags, manifest, legal pages, seed data, and docs.
- For database names, env variable names, package names, and storage buckets: list them, propose a safe migration, and do not rename until approved.
- Output: `REBRAND_REPORT.md` with every occurrence, what was changed, and what awaits approval.

## 4. Phase B: Capability audit

Walk the checklist in Section 5. For each item record:

| Field | Content |
|---|---|
| Status | Complete, Partial, Stub, or Missing |
| Evidence | Route, table, component, and test that prove it |
| Gap | Exactly what is absent or broken |
| Effort | S, M, or L |
| Depends on | Other items that must exist first |

Also record: failing tests, dead routes, UI with no backend, backend with no UI, tables without RLS, and TODO or mock data left in production paths.

Output: `GAP_REPORT.md`, ordered by dependency then by customer impact, with a proposed build sequence.

**PAUSE. Present the gap report and wait for approval before building.**

## 5. Complete capability checklist

### 5.1 Platform foundation
- Tenant provisioning, onboarding wizard, sample data
- Auth: email, social, SSO, MFA, session management
- Roles and permissions: custom roles, field-level and record-level access, teams
- Audit log of every read-sensitive and write action
- Billing: volume-tier metering by customer count, light seats, upgrade and downgrade, invoices, dunning, free-tier limits enforced
- Usage limits and fair-use guards per tier
- Global search across all records
- Notifications: in-app, email, push, digest settings
- Import and export: CSV, Excel, vCard, with mapping, de-duplication, and rollback
- Data model extensibility: custom fields, custom objects, custom pipelines
- Mobile-responsive app and installable PWA with offline capture

### 5.2 Customer record
- Contacts, companies, households, and relationships between people
- Unified timeline: messages, calls, visits, purchases, notes, files
- Relationship memory: family, preferences, important dates, milestones, dislikes
- Duplicate detection and merge
- Segments: static lists and dynamic filters
- Tags, lifecycle stage, customer value and health scores
- Consent and communication preferences per channel

### 5.3 Zero-effort capture
- LedgerLock ingestion: transactions create and update customer records
- LassElan ingestion: conversations extract facts into relationship memory
- Email and calendar sync
- WhatsApp, SMS, and call logging
- Web forms, QR capture, booking and POS hooks
- AI extraction of facts from free text with human confirmation queue

### 5.4 Sales
- Leads: capture, scoring, assignment rules, routing
- Deals and multiple pipelines, stages, probabilities
- Tasks, reminders, sequences, meeting scheduling
- Products, price books, quotes, invoices, e-signature hook
- Forecasting and targets

### 5.5 Marketing
- Campaigns across email, SMS, WhatsApp
- Template builder with tenant branding
- Journey automation with triggers, delays, branches
- Landing pages and forms
- Attribution from touch to payment
- Deliverability: domain authentication, unsubscribe, suppression lists

### 5.6 Service
- Shared inbox across channels
- Tickets, SLAs, escalation, macros
- Knowledge base and customer portal
- Feedback: CSAT, NPS, review requests
- Chat widget and bot hand-off to LassElan

### 5.7 Warmth Engine (headline feature)
- Occasion detection: birthdays, anniversaries, milestones, lapsed visits
- Timing logic that favours the right moment over volume
- Owner-voice calibration so messages sound like the business owner
- Suggested actions: message, gift, airtime, call prompt, handwritten-note prompt
- Autonomy levels 0 to 4 with per-tenant and per-action opt-in, approval queue, spend caps, and kill switch
- Gift orchestration with partner catalogue, order status, and failure handling
- Warmth attribution: action, return visit, confirmed payment through LedgerLock
- Returning-customer story generator for anecdote-style proof

### 5.8 Intelligence and reporting
- Dashboards: repeat-purchase rate, revenue attributed to Warmth, retention, pipeline, activity
- Custom report builder, scheduled reports, exports
- Churn risk and next-best-action
- AI assistant: summarise a customer, draft a reply, answer questions on tenant data with permission checks

### 5.9 Brand Adoption and white label
- Tenant theming: colours, logo, typography, email and document templates
- Basic white label at Business tier
- Full white label at Enterprise: custom domain, sender domain, removal of Fondly marks
- Theme preview and accessibility contrast checks

### 5.10 Partner and agency channel
- Partner accounts managing multiple tenants
- Client provisioning, switching, and consolidated billing
- Commission tracking and partner dashboard
- Partner directory and onboarding materials

### 5.11 Industry packs
- Hospitality pack built deep: guest preferences, stay and visit history, occasion handling, pre-arrival and post-stay journeys
- Pack framework: fields, pipelines, templates, journeys, and reports as installable configuration
- Remaining packs generated from the proven hospitality pattern

### 5.12 Payments and Kenya readiness
- M-Pesa, card, and bank payment flows with fee pass-through plus margin shown transparently
- KES default with multi-currency support
- Receipts and reconciliation against LedgerLock
- Kenya Data Protection Act 2019 and GDPR: consent records, data subject requests, retention rules, export and erase

### 5.13 Integrations and developer surface
- Public REST API with keys, scopes, rate limits
- Webhooks with retries and signing
- Connectors: accounting, e-commerce, calendar, telephony, automation platforms
- API documentation

### 5.14 Quality and operations
- Unit, integration, and end-to-end tests on critical paths
- RLS isolation test suite
- Error monitoring, structured logs, uptime checks
- Backups and restore drill
- Performance budgets and accessibility to WCAG 2.2 AA
- Seed and demo tenant

### 5.15 Marketing site
- Home, product, Warmth, pricing, industries, partners, stories, docs, legal
- Pricing calculator by customer count
- Multilingual routing, SEO, analytics, sign-up flow into onboarding

## 6. Phase C: Build the gaps

After approval, build in this order unless the approved gap report says otherwise:

1. **Foundation gaps** (5.1, 5.14 isolation tests). Nothing else is safe without these.
2. **Customer record and capture** (5.2, 5.3).
3. **Warmth Engine** (5.7) with attribution.
4. **Hospitality pack** (5.11) as the proof. **PAUSE for review.**
5. **Sales, marketing, service** (5.4 to 5.6).
6. **Reporting and AI** (5.8).
7. **Brand Adoption, white label, partner channel** (5.9, 5.10).
8. **Payments, compliance, integrations** (5.12, 5.13).
9. **Remaining industry packs** from the approved pattern.
10. **Marketing site gaps** (5.15).

**PAUSE after each numbered wave** with a short summary and a preview link.

## 7. Definition of done, per capability

- Works end to end in the UI with real data, no mocks
- RLS policies written and isolation test passing
- Permission checks enforced server-side
- Empty, loading, and error states designed
- Tier limits respected
- Tests added and passing
- Tenant branding applied
- Documented in `CHANGELOG.md` and the gap report updated to Complete

## 8. Final deliverables

- `REBRAND_REPORT.md`
- `GAP_REPORT.md`, fully closed out
- `PLACEHOLDERS.md` listing every token awaiting a real value
- `OPEN_QUESTIONS.md` for any decision you could not make
- A demo tenant in the Hospitality vertical showing one full Warmth loop: fact captured, occasion detected, action sent, customer returns, payment attributed

Begin with Phase A.
