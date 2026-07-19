# AnchorStone Property Listings — Logo & Colour System Prompt

> **For the Claude Code agent.** Scope-locked. Build only what's below, in order, and **pause at each `⏸ PREVIEW PAUSE`** for my approval. UK spelling. No new dependencies — use the existing Tailwind theme + inline SVG. This prompt refreshes the brand's visual layer (logo + colour) and wires it through the site; it does **not** change any feature logic. Companion to `Property_Portal_Masterplan_v2.md` — the tokens here must match that document exactly.

---

## 0. Objective

The site currently leans on a single deep-plum register. Add **warmth and appeal** using a locked four-step plum→rose→blush ramp, and ship a distinctive two-tone **AnchorStone** logo. The result should feel premium, editorial, and *warm* — never corporate, never flat — while keeping the trust signals crisp and legible.

---

## 1. Locked colour ramp (expose as Tailwind theme tokens — no ad-hoc hex anywhere)

| Token | Hex | Role |
|---|---|---|
| `--plum` (primary / ink) | `#5B263C` | Headings, body text, primary buttons, dark surfaces (header/footer), logo "Anchor". |
| `--mauve` (accent) | `#8E3F60` | Links, secondary actions, hovers, active states, large display text. |
| `--rose` (appeal) | `#E9B8C9` | Decorative fills, tints, gradient mid-stop, category washes, badges, illustration accents, **light text on plum** (logo "Stone Property Listings"). |
| `--blush` (surface) | `#F8EBEF` | Page background across the whole site. |
| `--paper` | `#FFFFFF` | Cards/panels that lift off the blush. |

**Semantic (unchanged, muted, status-only):** `--verified/success` = harmonised deep green · `--warning` = muted amber · `--danger` = muted brick red. These are the only non-brand hues, and only for meaning — never decoration.

**Contrast law (enforce at build):**
- Small / body text → **`#5B263C` on `#F8EBEF` or `#FFFFFF`** only.
- `#8E3F60` → large text, links, UI accents only (not small body copy).
- `#E9B8C9` → surfaces, tints, and **light text on `#5B263C`** only. **Never** rose text on blush/white.
- Every foreground/background pairing must be checked; large blush-on-plum and rose-on-plum are the intended "reverse" combos for dark sections.

---

## 2. The AnchorStone logo (build as inline, responsive SVG components)

**Composition:** an anchor emblem in a rounded-square badge, followed by the two-tone wordmark, with a spaced sub-label.

- **Emblem:** a clean anchor glyph, `--rose` or `--paper` stroke, inside a rounded-square (`rounded-2xl`) badge filled `--plum`. Optical centring; consistent stroke weight; no drop shadows.
- **Wordmark:** `AnchorStone` set in the heading serif (Lora register), tight tracking, weight ~600.
  - **"Anchor"** → `--plum` on light backgrounds / `--paper` on dark backgrounds (bold register).
  - **"Stone"** → **`#E9B8C9`** (rose), same size, lighter weight (~400–500) so it reads as a warm second half, not a separate word block.
- **Sub-label:** `PROPERTY LISTINGS` in the sans (Poppins register), all caps, letter-spaced (~0.18em), small, in `--mauve` on light / `--rose` at ~80% on dark.

**Deliver these variants (one component, prop-driven):**
1. `full-light` — badge + wordmark + sub-label, for blush/white backgrounds.
2. `full-dark` — same, for `--plum` header/footer (Anchor in paper, Stone in rose — matches the uploaded reference).
3. `stacked` — emblem above centred wordmark, for narrow/mobile and social avatars.
4. `emblem` — badge only (favicon, app icon, compact header on scroll).
5. `mono` — single-colour fallback (all `--plum`, or all `--paper`) for edge cases and print.

**Rules:** define a clear-space equal to the badge's corner radius on all sides; set a minimum legible width; the two-tone split is fixed (never recolour "Anchor" rose or "Stone" plum); ship a proper `favicon`/`apple-touch-icon` from the `emblem` variant. Provide a `<Logo variant="…" />` component plus a downloadable `/brand` page rendering every variant on light and dark for sign-off.

⏸ **PREVIEW PAUSE 1** — show all five logo variants on light and dark before touching the rest of the site.

---

## 3. Add colour & appeal across the site (using the ramp, within the contrast law)

Apply warmth deliberately — rhythm and accents, not a wash of pink everywhere.

- **Header:** on-scroll condense to `emblem` + wordmark; light header on blush with `--plum` nav, `--mauve` hover underlines. Optional dark (`--plum`) header variant with the `full-dark` logo and rose accents.
- **Hero:** a soft **`--plum → --mauve → --rose`** diagonal or arc gradient behind the search bar, fading into `--blush` at the page edge; headline in `--plum`, one rose highlight word. Keep the search field on `--paper` for clarity.
- **Section rhythm:** alternate backgrounds down the page — `--blush` → `--paper` → a **very light rose tint** (`#E9B8C9` at ~12–18% over white) → back — so the page breathes and feels designed, not monotone.
- **Category / browse grid:** each card gets a distinct tint from the ramp (blush, rose-tint, mauve-tint, plum for one "featured" card with reverse text). Rose hover glow; `--plum` labels.
- **Verified & premium markers:** keep the **verified tick green** (trust must stay unambiguous), but frame premium/featured/boosted with **rose pills and mauve borders** so promotion reads as warm, not alarming.
- **Buttons:** primary = `--plum` (paper text); secondary = `--mauve` outline; tertiary/ghost = rose-tinted hover. Consistent focus ring in `--mauve`.
- **Motifs & illustration:** a gentle **rose wave/arc** footer motif and spot illustrations in the plum→rose family; anchor emblem echoed subtly as a section divider or empty-state mark.
- **Footer:** deep `--plum` block with `full-dark` logo, rose sub-headings, blush body text, mauve links — bookends the warm palette.
- **Data & figures:** keep prices/yields/sizes in monospace `--plum`; never tint figures rose (legibility first).

⏸ **PREVIEW PAUSE 2** — show the refreshed home page (header, hero, section rhythm, category grid, footer) on mobile and desktop.

---

## 4. Do / don't

**Do:** use rose as tint, surface, gradient stop, and light-on-plum text; keep body copy `--plum` on light; keep the verified tick green; derive hovers/borders as tints of the two darker brand colours.

**Don't:** put rose or mauve small text on blush/white; recolour the logo split; tint the verified/warning/danger states into the brand family; introduce any hue outside the ramp + three semantics; over-saturate — appeal comes from rhythm and accent, not flooding pink.

---

## 5. Acceptance criteria

1. All five logo variants render crisply on light and dark, with favicon/app-icon from the emblem, on a `/brand` sign-off page.
2. Tokens match `Property_Portal_Masterplan_v2.md` exactly; zero ad-hoc hex in components.
3. Every foreground/background pairing passes the contrast law (WCAG 2.2 AA); automated check run on new pages.
4. Home page shows clear colour rhythm and warmth on mobile + desktop; verified tick remains green and legible.
5. No feature logic changed; no new dependencies added.

⏸ **PREVIEW PAUSE 3** — final review across the key public pages (home, search results, PDP header/rail) before merge.
