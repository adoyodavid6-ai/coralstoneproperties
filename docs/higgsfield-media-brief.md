# CoralStones × Higgsfield — Marketing Media Production Brief

Everything you need to generate the site's marketing images + video in Higgsfield,
with exact sizes, filenames, and copy-paste prompts. Generate → hand the files back →
I wire them in (nothing is wired until real assets exist).

---

## 0. Workflow + guardrails (read first)

**Best Higgsfield workflow for us:**
1. Generate the **still** first in the image model (Soul) and lock the look.
2. For video, use **image-to-video**: feed the approved still + pick a **camera-motion
   preset** (dolly / drone / crane / orbit). This gives clean, controllable motion instead
   of a chaotic text-to-video roll.
3. Keep hero/background motion **slow and loopable** (8–12s). Fast motion can't loop.
4. **Never bake text or logos into AI images** — AI garbles letterforms. All headlines,
   the wordmark, and end-cards get added in code or a video editor (crisp + editable).

**Guardrails (protects the "verified" trust USP):**
- ✅ Generate generic-but-authentic Kenyan cityscapes, landscapes, neighbourhood mood,
  abstract architecture, lifestyle.
- ❌ Do **not** generate photos of *specific properties* and present them as real, verified
  listings. That's the one thing that breaks the whole trust proposition.
- ❌ No fake title deeds / legal documents with readable text.
- ❌ No AI-generated faces presented as "our real agents" or testimonials.

**One nuance for wiring:** the hero, backdrops, OG card and area images are **separate**
from the listing-photo pipeline. Adding them does **not** require flipping
`SHOW_REAL_MEDIA` in `src/lib/media.ts` (that flag governs *listing/agent* photos, which
stay off until you have real inventory).

---

## 1. Brand foundation

| Token | Hex | Use |
|---|---|---|
| Navy-teal (brand/primary/dark bands) | `#16425b` | dominant, trustworthy base |
| Navy-teal dark | `#0f2f43` | shadows, gradients |
| Coral (accent) | `#ff8559` | energy, highlights, CTA |
| Coral on dark | `#ffaa88` | warm accents over navy |
| Light sage (page bg) | `#f3f4f2` | airy, clean |
| Sage grey (lines) | `#d9dcd6` | soft neutral |

**Mood:** trust-first, calm, premium **but grounded** (credible, not flashy-luxury).
Kenyan real estate. Warm golden-hour light. Clean, confident, spacious.

**Reusable STYLE BLOCK** — append to every *image* prompt:
> Photorealistic editorial real-estate photography, warm golden-hour light, calm premium
> and trustworthy mood (grounded, not flashy), natural color grade with deep navy-teal
> shadows and soft warm coral highlights, clean balanced composition, crisp architectural
> detail, shot on full-frame 35mm, cinematic depth.

**Reusable AVOID / negative prompt:**
> text, letters, watermarks, logos, signage, distorted or melting architecture, extra or
> warped windows and floors, bad perspective, oversaturation, HDR halos, heavy lens flare,
> fisheye, close-up faces (keep any people small and anonymous).

---

## 2. Home hero — video + poster (highest impact)

Replaces the current CSS-gradient hero. Full-bleed background behind centered white text,
so **keep the center + lower third open and slightly darker** (dark scrims sit on top).

| Asset | Ratio | Master size | Format | Duration | Filename |
|---|---|---|---|---|---|
| Hero video | 16:9 | 1920×1080 | MP4 (H.264) **+** WebM | 8–12s seamless loop, muted | `public/videos/hero.mp4` (+ `hero.webm`) |
| Hero poster | 16:9 | 1920×1080 | JPG/WebP | still | `public/images/hero-poster.jpg` |

> Poster = the fallback frame shown before the video loads and for reduced-motion users.
> Easiest: export a clean frame from the same generation.

**PRIMARY prompt (Nairobi skyline — strongest "Kenya property" signal):**
> Aerial golden-hour view drifting slowly over the Nairobi skyline, modern glass towers and
> green tree-lined avenues, distant Ngong Hills on the horizon, low warm sun casting long
> soft shadows, some high-rises catching amber light, deep teal-blue sky gradient, calm and
> aspirational, cinematic and expansive. Keep the center and lower third open and slightly
> darker so white headline text stays legible. [STYLE BLOCK]

**Camera preset:** slow forward aerial drift / gentle dolly-in — lowest speed, loopable.

**Alternate A (coastal Mombasa):**
> Slow aerial over the Kenyan Indian Ocean coast at golden hour, turquoise water meeting
> white sand, palm-lined shore, a traditional dhow sailing, low-rise coastal architecture,
> warm tropical light, serene. [STYLE BLOCK]

**Alternate B (residential twilight):**
> Slow cinematic push toward a modern Kenyan home at dusk, warm interior lights glowing,
> landscaped garden, acacia trees silhouetted against a teal twilight sky, calm upscale
> suburban mood (Karen/Runda). [STYLE BLOCK]

---

## 3. Brand backdrops + OG social card

| Asset | Ratio | Master size | Format | Filename |
|---|---|---|---|---|
| CTA band backdrop | 2:1 | 2400×1200 | JPG/WebP | `public/images/cta-backdrop.jpg` |
| OG / social share bg | 1.91:1 | 1200×630 | JPG/PNG | `public/images/og-home.jpg` |

**CTA backdrop** (sits behind white text on the dark `#16425b` bands — must stay low-contrast):
> Abstract modern architectural background, softly out-of-focus glass-and-concrete façade in
> deep navy-teal, subtle diagonal light, minimal and calm, lots of negative space, low
> contrast, dark editorial mood, no bright highlights in the center. [STYLE BLOCK without
> "golden-hour"]

**OG background** (headline "Find. Verify. Own." + wordmark stay code-rendered on top —
leave that space clean):
> Nairobi skyline at blue-golden hour graded toward deep navy-teal, cinematic and premium,
> subtle warm coral light glinting in a few windows, composition with clean open space on
> the left and along the bottom for a wordmark and headline, no text. Wide 1.91:1 framing.
> [STYLE BLOCK]

---

## 4. Area-guide city imagery (Kenya — live areas)

Card-header images for the 4 live Kenyan areas. (Note: the area-guide cards are text-only
today — I'll add an image header slot when wiring.) These are **neighbourhood mood** shots,
not specific listed homes.

| Area | Ratio | Master size | Filename |
|---|---|---|---|
| Westlands, Nairobi | 3:2 | 1200×800 | `public/images/areas/westlands.jpg` |
| Karen, Nairobi | 3:2 | 1200×800 | `public/images/areas/karen.jpg` |
| Kilimani, Nairobi | 3:2 | 1200×800 | `public/images/areas/kilimani.jpg` |
| Mombasa Island | 3:2 | 1200×800 | `public/images/areas/mombasa-island.jpg` |

**Westlands** (business & nightlife hub):
> Modern commercial district of Westlands, Nairobi at early blue-hour — contemporary glass
> office towers and mixed-use high-rises, tree-lined avenue with warm street lights coming
> on, upscale urban energy. [STYLE BLOCK]

**Karen** (leafy suburban retreat):
> Upscale leafy suburb of Karen, Nairobi — a handsome modern villa behind a mature garden
> with tall indigenous trees, paved driveway, golden-hour warmth, spacious, private, calm
> and green. [STYLE BLOCK]

**Kilimani** (young professionals & families):
> Contemporary mid-rise apartment neighbourhood in Kilimani, Nairobi — clean modern
> residential blocks with balconies, jacaranda and palm trees, bright airy daytime light,
> young-professional urban vibe. [STYLE BLOCK]

**Mombasa Island** (coastal heritage — nice tie-in to the *CoralStones* name):
> Coastal heritage of Mombasa Old Town — Swahili architecture with carved wooden balconies
> and warm coral-stone walls, a narrow historic street opening to a view of the Indian Ocean
> and a dhow, warm tropical golden-hour light. [STYLE BLOCK]

---

## 5. Short promo video clips (social / ads)

Produce a master, then reframe. Generate scene **stills → image-to-video (camera preset) →
sequence + add text/logo/end-card in an editor** (CapCut/Premiere/DaVinci).

| Format | Ratio | Size | Where |
|---|---|---|---|
| Vertical | 9:16 | 1080×1920 | Reels / TikTok / Shorts |
| Square | 1:1 | 1080×1080 | IG/FB feed |
| Landscape | 16:9 | 1920×1080 | YouTube / site |

Filenames: `public/videos/promo-<concept>-<ratio>.mp4` (e.g. `promo-verified-9x16.mp4`).

### Concept A — "Verified." (flagship brand film, ~20s)
Overlay copy is added in the editor; prompts describe the visuals only.

1. **Aerial Nairobi, golden hour** (reuse hero look). *Overlay:* "Buying property in Kenya
   shouldn't feel like a gamble." — *Camera:* slow drone forward.
2. **Anonymous hands** reviewing a document + house keys on a warm wooden table, shallow
   focus (no readable text). *Overlay:* "Every agent. Every listing. Every title." —
   *Camera:* slow dolly + rack focus.
   > Close-up of anonymous hands holding house keys over a warm wooden table with a blurred
   > paper document, soft golden window light, shallow depth of field, no readable text.
   > [STYLE BLOCK]
3. **Modern verified home reveal** at dusk, warm lights on. *Overlay:* "Verified before it
   goes live." — *Camera:* smooth push-in.
   > Slow push toward a modern Kenyan home at dusk, warm interior glow, landscaped garden,
   > teal twilight sky. [STYLE BLOCK]
4. **Handover silhouette** — anonymous figures, keys passed, warm backlight. *Overlay:*
   "Find. Verify. Own." + **CoralStones end-card** (navy `#16425b`, coral logo mark).
   *Camera:* slow crane up.

### Concept B — "How it works" (~15s, 3 beats)
Search → Verified → Own. One clean visual per beat (a phone/laptop search UI mock you supply,
a coral verified-badge motif, a keys/home moment). Overlays: "1 Search" / "2 Verified" /
"3 Own." Keep motion minimal (push-ins).

### Concept C — "For agents" (~15s)
Aspirational agent-at-work + full inbox of enquiries motif. *Overlay:* "List where trust
already lives. Verified agents get more enquiries, faster." → CTA end-card "coralstone —
list your property."

---

## 6. Export & handoff checklist

When you've generated everything, hand back files named as above. Ideal specs:

- **Video:** H.264 MP4, 1080p, ~8–12 Mbps for hero loop; also export the hero as **WebM**
  (VP9) if Higgsfield/your editor allows (smaller, better web). Muted hero. I'll further
  compress for web on wiring.
- **Images:** highest-quality JPG or PNG at the master sizes above — I'll convert to
  WebP/AVIF and hook them into `next/image` for responsive delivery.
- **Drop location:** put them in the matching `public/videos/` and `public/images/...`
  paths (I'll create those folders), or just send them over and I'll place + optimize them.

**Then I wire:**
- Home hero → swap the CSS-gradient block in `src/app/page.tsx` for a `<video>` +
  poster (with reduced-motion fallback to the poster still).
- OG card → drop `og-home.jpg` under the existing text in `src/app/opengraph-image.tsx`.
- Area images → add an image header to the area-guide cards.
- CTA backdrop → layer behind the dark CTA bands.

---

## 7. Do NOT generate

- Photos of specific properties presented as real verified listings.
- Fake title deeds, ID docs, or any document meant to look official.
- AI faces presented as real named agents or real testimonials.
- Any baked-in text, wordmark, or logo (add in code/editor for crisp, editable results).
