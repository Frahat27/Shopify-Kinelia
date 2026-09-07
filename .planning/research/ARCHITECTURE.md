# Architecture Research

**Domain:** Custom Shopify theme (Liquid) for a single-product, multi-avatar DTC brand — CVR-optimized, Argentina, hybrid checkout (native + MercadoPago + COD manual method)
**Researched:** 2026-09-07
**Confidence:** MEDIUM-HIGH (core theme architecture verified against shopify.dev; Horizon specifics and bundle/line-item edge cases from secondary sources — flagged inline)

---

## 0. Base-theme decision (resolve in Phase 1 — architecture below holds either way)

PROJECT.md leans "Dawn despojado + secciones custom" (still marked *Pending*). Research changes the picture:

| Option | Fit for this project | Risk |
|--------|---------------------|------|
| **Dawn (stripped) + opt-in theme blocks** | Battle-tested, maximum tutorial/MCP coverage, predictable, smallest surface to strip. Theme-block support exists but is shallow (≈2 nesting levels). | Multi-avatar component reuse is bolted on, not native. |
| **Horizon (stripped)** — *the default for stores created in 2026* | Built entirely on **theme blocks** (up to 8 nesting levels), **group blocks**, and native **"Get metaobject(s)" blocks**. This is *exactly* the multi-avatar + metaobject-driven-content model below. Best Core Web Vitals baseline. Forward-compatible with Shopify's roadmap. | Newer (May 2025), heavier editor model, fewer third-party tutorials, more moving parts to learn. Horizon capability claims here are MEDIUM confidence (secondary sources). |

**Lean: Horizon**, because the whole multi-avatar architecture in this document is a theme-block + metaobject pattern and Horizon makes it first-class. **Fallback: Dawn stripped**, if the team values minimal surface area and predictability over native fit. The rest of this document is written base-theme-agnostic — component boundaries, metaobject model, alternate-template mechanism, CSS strategy, and Etapa 2 seams are identical on both.

> Verify in Phase 1 with the Shopify MCP / shopify.dev: current Horizon theme-block nesting depth, whether `content_for` blocks and metaobject blocks are GA, and the state of `?view=` alternate templates on the chosen base.

---

## Standard Architecture

### System Overview (Etapa 1 scope)

```
┌───────────────────────────────────────────────────────────────────────┐
│  META AD  →  URL: /products/<hero>?view=avatar-<slug>&utm_*=...        │
└───────────────────────────┬───────────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    SHOPIFY STOREFRONT (Liquid render)                  │
│                                                                       │
│   layout/theme.liquid                                                  │
│     ├─ <head>: css-variables snippet  ·  analytics-hooks snippet (NOOP)│
│     ├─ section group: header (minimal)                                 │
│     ├─ TEMPLATE  product.avatar-<slug>.json   (chosen by ?view=)       │
│     │     ┌─────────────────────────────────────────────────────┐     │
│     │     │  VARIABLE STACK (per-avatar)                         │     │
│     │     │   avatar-hero · problem-agitation · mechanism(UMP→UMS)│     │
│     │     │   para-quien · testimonios                           │     │
│     │     │   → all read ONE `avatar` metaobject (template holds  │     │
│     │     │     only a pointer)                                   │     │
│     │     ├─────────────────────────────────────────────────────┤     │
│     │     │  FIXED STACK (shared, never forked)                  │     │
│     │     │   buy-box · oferta/badges · comparación-USP ·        │     │
│     │     │   garantía-90d · guía-uso-talles · FAQ · CTA-final ·  │     │
│     │     │   reviews (@app placeholder)                         │     │
│     │     │   → read product data + theme settings + `oferta`    │     │
│     │     │     metaobject (zero per-template copy)              │     │
│     │     └─────────────────────────────────────────────────────┘     │
│     └─ section group: footer (legal · WhatsApp · newsletter-disabled)  │
│                                                                       │
│   assets/: base.css + one component-*.css per section (section-scoped) │
│            small custom-element JS per interactive component           │
└───────────────────────────┬───────────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────────┐
│  BUY-BOX STATE (custom element)  selected variant (talle×color)        │
│                                  + pack quantity + availability        │
│         emits DOM events: variant:changed · cart:updated · product:added│
└───────────────────────────┬───────────────────────────────────────────┘
                            ▼  POST /cart/add.js  (1 line item, qty = pack size)
┌───────────────────────────────────────────────────────────────────────┐
│  CART (drawer)  →  "Finalizar compra"                                  │
└───────────────────────────┬───────────────────────────────────────────┘
                            ▼
┌───────────────────────────────────────────────────────────────────────┐
│  SHOPIFY NATIVE CHECKOUT                                               │
│   payment: MercadoPago (online gateway)  |  "Pago contra entrega"      │
│            (manual method, gated by shipping zone)                     │
└───────────────────────────┬───────────────────────────────────────────┘
                            ▼
                   Thank-you page
                            ┊  ← ETAPA 2 BOUNDARY (out of scope here)
                            ┊   orders/create webhook → Supabase raw → core.orden
                            ┊   (+ cart attributes: visitante_id, utm_*)
                            ┊   Custom Pixels (Meta/CAPI/GA4) subscribe to checkout events
```

### Component Responsibilities

| Component | Responsibility (what it owns) | Implementation |
|-----------|------------------------------|----------------|
| `layout/theme.liquid` | Document shell, `<head>`, global includes, seam mount points | Stripped Dawn/Horizon layout |
| `snippets/css-variables.liquid` | Emit design tokens as CSS custom properties from theme settings | `<style>:root{...}` in `<head>` |
| `snippets/analytics-hooks.liquid` | **Seam.** No-op in Etapa 1. Etapa 2: visitante_id cookie + UTM capture + write cart attributes | Empty snippet + comment contract |
| `assets/events.js` | DOM custom-event bus utility (publish/subscribe helpers) | ~30 lines vanilla |
| Header / Footer section groups | Nav (minimal), legal links, WhatsApp, disabled newsletter block | Section groups in layout |
| **Variable-stack sections** (avatar-hero, problem-agitation, mechanism, para-quien, testimonios) | Render per-avatar persuasion content **from a single `avatar` metaobject reference** | Custom sections, theme blocks, `metaobject` setting type |
| **Fixed-stack sections** (buy-box, oferta, comparación-USP, garantía, guía-talles, faq, cta-final) | Shared conversion structure, identical on every avatar | Custom sections reading product + theme settings + `oferta` metaobject |
| `sections/buy-box.liquid` | Title, price, rating slot, bundle selector, variant matrix, ATC, trust row — orchestrates purchase | Custom section with reorderable `@theme` blocks |
| `snippets/sticky-atc.liquid` | Mobile fixed ATC bar mirroring buy-box state | Rendered by buy-box; shares custom-element state |
| `assets/buy-box.js` | Custom element: variant resolution, pack→qty, price update, availability, ATC submit | Vanilla custom element, no framework |
| `templates/product.avatar-*.json` | **Selector only** — which sections, what order, and the one metaobject pointer per avatar | JSON template (alternate) |
| Metaobjects (`avatar`, `oferta`, `testimonio`, `faq_item`, `size_chart_row`) | All operator-editable content + media | Shopify admin → Content → Metaobjects |
| Custom Pixels (Etapa 2) | Meta Pixel / CAPI / GA4 event forwarding | Shopify admin pixel manager (sandboxed) — **not theme code** |

---

## Recommended Project Structure

```
Shopify-Kinelia/                    # git repo, Shopify GitHub integration = source of record
├── assets/
│   ├── base.css                    # reset + tokens consumption + layout primitives + typography
│   ├── component-buy-box.css       # one CSS file per section, loaded only when section renders
│   ├── component-mechanism.css
│   ├── component-testimonios.css
│   ├── component-faq.css
│   ├── component-sticky-atc.css
│   ├── events.js                   # DOM custom-event bus (publish/subscribe)
│   ├── buy-box.js                  # custom element <kin-buy-box>
│   ├── variant-picker.js           # custom element <kin-variant-picker> (talle × color)
│   ├── bundle-selector.js          # custom element <kin-bundle-selector> (pack → quantity)
│   ├── size-guide.js               # modal
│   └── icons/                      # inline SVG sprite (trust icons, payment marks)
├── blocks/                         # THEME BLOCKS (reusable across sections) — Horizon-native
│   ├── headline.liquid
│   ├── rich-text.liquid
│   ├── media-with-text.liquid      # UMP / UMS panels
│   ├── testimonial-card.liquid
│   ├── faq-item.liquid
│   ├── badge-row.liquid
│   └── trust-row.liquid
├── config/
│   ├── settings_schema.json        # DESIGN TOKENS + global offer defaults + feature toggles
│   └── settings_data.json          # (generated)
├── layout/
│   └── theme.liquid                # shell + css-variables + analytics-hooks seam
├── locales/
│   ├── es.default.json             # es-AR user-facing strings
│   └── es.default.schema.json      # editor labels
├── sections/
│   ├── header.liquid               # minimal
│   ├── footer.liquid               # legal, WhatsApp, disabled newsletter block
│   ├── avatar-hero.liquid          # VARIABLE — reads `avatar` metaobject
│   ├── problem-agitation.liquid    # VARIABLE
│   ├── mechanism.liquid            # VARIABLE — UMP → UMS with visual
│   ├── para-quien.liquid           # VARIABLE
│   ├── testimonios.liquid          # VARIABLE (+ optional avatar-tagged filter)
│   ├── buy-box.liquid              # FIXED
│   ├── oferta-badges.liquid        # FIXED — reads `oferta` metaobject / theme settings
│   ├── comparacion-usp.liquid      # FIXED
│   ├── garantia.liquid             # FIXED — 90 días
│   ├── guia-uso-talles.liquid      # FIXED
│   ├── faq.liquid                  # FIXED — reads `faq_item` metaobjects
│   ├── cta-final.liquid            # FIXED
│   └── reviews.liquid              # FIXED — @app block placeholder + static fallback
├── snippets/
│   ├── css-variables.liquid
│   ├── analytics-hooks.liquid      # SEAM — no-op in Etapa 1
│   ├── sticky-atc.liquid
│   ├── price.liquid
│   ├── product-media-gallery.liquid # video-first
│   └── meta/                       # SEO/OG tags helper
├── templates/
│   ├── index.json                  # home = redirect OR hero avatar landing (Phase 11 decision)
│   ├── product.json                # canonical hero product template (default / no ?view=)
│   ├── product.avatar-varices.json # FULL reference avatar
│   ├── product.avatar-cansancio.json # the mandatory clone (proves the system)
│   ├── page.json
│   ├── page.legal.json             # T&C, privacidad, cambios/devoluciones, arrepentimiento
│   ├── page.contact.json
│   ├── cart.json
│   ├── 404.json
│   └── search.json                 # minimal
└── .github/workflows/              # optional: theme-check lint on PR
```

### Structure Rationale

- **`blocks/` (theme blocks):** the multi-avatar system needs the *same component* (a testimonial card, a mechanism panel, a headline) usable inside several different sections and reorderable per avatar. Section-local blocks can't cross sections; theme blocks can. This directory is the reuse primitive.
- **`sections/` split into VARIABLE vs FIXED:** the single most important structural decision. VARIABLE sections carry *no copy of their own* — they render from a metaobject reference. FIXED sections carry *no per-template copy* — they render from product data + theme settings. Result: cloning an avatar template never forks content or design.
- **One `component-*.css` per section (Dawn/Horizon pattern):** CSS loads only when its section is on the page → protects LCP/JS budget. No monolith stylesheet.
- **Custom elements, one JS file per interactive component:** no framework, no hydration cost, each `<kin-*>` element is independently testable and lazy-loadable. Matches the "HTML/CSS/JS nativo" constraint.
- **`config/settings_schema.json` = design tokens + global offer:** the only place a non-dev changes brand colors, radius, offer numbers, WhatsApp number. Everything visual derives from here.
- **`templates/*.json` are thin:** a template is a *selector* (sections + order + one pointer), never a content store.

---

## Architectural Patterns

### Pattern 1: Metaobject-driven avatar, template-as-pointer

**What:** Each sales angle ("várices", "cansancio de estar de pie", "embarazo", "adultos mayores", "deportistas") is one **`avatar` metaobject entry**. The VARIABLE sections in every avatar template take a single `metaobject` setting: *which avatar entry to render*. The alternate template `product.avatar-<slug>.json` differs from its siblings **only** in that one pointer value (and optionally section order).

**`avatar` metaobject fields:**

| Field | Type | Feeds |
|-------|------|-------|
| `nombre_interno` | single line | operator reference |
| `slug` | single line | must match template suffix |
| `headline` | single line | avatar-hero |
| `subheadline` | multi line | avatar-hero |
| `hero_media` | file (video/image) | avatar-hero (video-first) |
| `problema_agitacion` | rich text | problem-agitation |
| `ump_titulo` / `ump_texto` / `ump_media` | text / rich text / file | mechanism (UMP) |
| `ums_titulo` / `ums_texto` / `ums_media` | text / rich text / file | mechanism (UMS) |
| `para_quien` | rich text / list | para-quien |
| `testimonios` | list of `testimonio` refs | testimonios (curated per avatar) |
| `faq_extra` | list of `faq_item` refs | faq (appended to shared FAQ) |

**When to use:** whenever the same product is sold under many angles and copy — not layout — is what changes. This is the project's core requirement.

**Trade-offs:**
- ✅ DRY: fix a shared FAQ once, all avatars update. Design cannot drift between avatars.
- ✅ Operator adds an avatar without a developer (see workflow below).
- ✅ Per-avatar CVR still measurable (landing-page-path report includes `?view=`; Supabase gets it via `view`/`utm_content` in Etapa 2).
- ⚠️ A brand-new *type* of persuasion module still needs a developer (new section).
- ⚠️ Metaobject rich-text editing is less friendly than the theme editor's inline text — mitigate with clear field descriptions and an example entry.

**Operator workflow — clone a new avatar (no developer):**

1. **Content → Metaobjects → "Avatar" → Add entry.** Fill `slug` (e.g. `neuropatia`), headline, agitación, UMP/UMS texts + media, "para quién es", pick testimonios, optional FAQ extras. Save.
2. **Online Store → Themes → ⋯ → Edit templates** (or theme editor "Create template"): **duplicate** `product.avatar-varices` → name it `avatar-neuropatia`.
3. In the theme editor for that template, open each VARIABLE section and set its **"Avatar" reference** to the new entry. (If sections share a parent group block, it's one change.) Reorder sections if this angle needs it. Save.
4. **QA:** open `https://<store>/products/<hero>?view=avatar-neuropatia` on a phone. Check buy box, media, copy, checkout.
5. Hand marketing the URL pattern: `/products/<hero>?view=avatar-neuropatia&utm_source=meta&utm_medium=paid&utm_campaign={{campaign.id}}&utm_term={{adset.id}}&utm_content={{ad.id}}`.

Time: ~15–30 min, entirely in the Shopify admin.

### Pattern 2: Alternate product templates selected by `?view=` on one hero product

**What:** The avatar landing **is the product template** (not a `/pages/` template, not the homepage). One hero product; many alternate templates (`product.avatar-*.json`); the ad URL selects one with the officially-documented `?view=<suffix>` parameter. Default `/products/<hero>` (no param) renders `product.json` — a sensible generic avatar or the best performer.

**Why product template, not page or home:**

| Concern | Product template + `?view=` | `/pages/` + embedded product section | Homepage |
|---------|----------------------------|--------------------------------------|----------|
| `/products/handle` URL for Meta links + params | ✅ native | ❌ `/pages/...` | ❌ `/` |
| Canonical / SEO | ✅ all `?view=` variants canonicalize to the clean product URL automatically — no duplicate-content risk, paid variants consolidate equity | ⚠️ separate page URLs, manual canonical discipline | ⚠️ |
| Shopify product analytics (sessions→conversion by product, "online store conversion over time") | ✅ all avatars roll up to one product = clean product CVR | ❌ product analytics weak/absent for page URLs | ❌ |
| Per-avatar CVR | ✅ "Sessions by landing page" report keys on full URL incl. `?view=`; Supabase gets `view`/`utm_content` | ✅ (per page) | ❌ |
| Add-to-cart plumbing | ✅ product template has product context natively | ⚠️ section must be pinned to a product; some theme JS assumes product templates | ⚠️ |
| Inventory / reviews / metafields | ✅ one pool, one aggregate, one set | — | — |
| One-time SEO landing pages | ❌ `?view=` variants are not separately indexed | ✅ | — |

**When to use:** paid-traffic impulse funnel where every avatar sells the *same* product at the *same* offer. That is exactly this project.

**Graduation path (escape hatch):** when a specific avatar earns its own organic SEO page, its own price, or its own review corpus, promote it to a **dedicated product** with its own `product.<name>.json` + its own `?view=` family. The theme needs no changes — same sections, same metaobjects. Do this per-avatar, only when the data justifies it, and never on day 1 (day-1 per-avatar products fragment inventory/reviews/analytics for no benefit).

**Trade-offs:**
- ✅ Clean canonical, clean product analytics, one inventory pool, trivial to add avatars.
- ✅ Scales to the 2–3 product milestone: `product.<prod2>-avatar-<x>.json`.
- ⚠️ `?view=` is sometimes described as a "testing" feature; it is officially documented but confirm behavior on the chosen base theme in Phase 1 (some link tools strip query params; Meta may append its own — test the real ad URL).
- ⚠️ Avatar landings get no organic SEO (acceptable: traffic is 100% paid impulse).

### Pattern 3: Buy box as a section of reorderable blocks with a shared state element

**What:** `sections/buy-box.liquid` is a container; its parts are `@theme` blocks so the operator can reorder/toggle without code: `title`, `rating-summary` (@app placeholder), `price`, `bundle-selector`, `variant-picker`, `size-guide-link`, `add-to-cart`, `payment-icons`, `trust-row`, `shipping-estimate`, `guarantee-line`. A single custom element `<kin-buy-box>` wraps them and holds state.

**State model (one source of truth):**

```
<kin-buy-box>
  state = { variantId, packQty, available, priceCents, comparePriceCents }
  ├─ <kin-variant-picker>   talle × color  → sets variantId, available
  ├─ <kin-bundle-selector>  1 / 2 / 3 pares → sets packQty
  ├─ price snippet          re-renders from priceCents × packQty (+ tier discount preview)
  ├─ <button data-atc>      main ATC
  └─ emits: variant:changed, product:added
snippets/sticky-atc.liquid  → subscribes to the same element; mirrors label + price + disabled state
```

**Bundle → cart mapping — recommended: pack selector drives `quantity` of one talle×color variant.**

| Approach | Cart result | Inventory | Attribution impact | Verdict |
|----------|-------------|-----------|--------------------|---------|
| **Pack = quantity of one variant** (recommended) | 1 line item, `quantity` = pack size, cosmetic `_pack: "3 pares"` line-item property | ✅ 100% correct natively (decrements by pack size) | ✅ none — attribution rides on **cart-level** attributes, not line items | **Use this.** Simplest, no app, exact. |
| "Pack" as a 3rd product option (talle × color × pack) | 1 line item, qty 1 | ❌ decrements by 1, not pack size — oversells | ✅ none | Avoid unless a stock-adjust routine is built. |
| Native Shopify Bundles (Functions/app) | expands to N component line items at checkout | ✅ correct | ⚠️ **line-item properties are dropped when the bundle splits at checkout** (community-reported, 2025) — but cart-level `note_attributes` survive, so attribution is safe; still more moving parts | Defer. Migrate here only if **mixed sizes per pack** proves a CVR win. |

Tiered pricing ("2 pares -30%, 3 pares -45%") via a **native Shopify Functions automatic discount** (no paid app) keyed on quantity, or by setting the variant price to the per-unit bundle price and showing `compare_at_price` savings. Since **bundle is mandatory** (single units are not a wanted sale — Palanca 1), pricing the product at bundle economics is acceptable.

**Line-item properties:** use only for human-readable fulfillment hints (`_pack`, `_talle_label`). Never the source of truth for pack size — quantity is. Prefix with `_` to hide from checkout UI.

**Sticky ATC:** `IntersectionObserver` on the main ATC button; when it leaves the viewport on mobile, reveal the fixed bar. Bar reads state from `<kin-buy-box>` — no duplicate logic.

**Trade-offs:** ✅ exact inventory, no app dependency, one funnel, attribution-safe. ⚠️ can't mix talle/color within one pack (migrate to native Bundles later if needed).

### Pattern 4: DOM custom events as the internal integration bus

**What:** Every purchase interaction publishes a namespaced DOM event on `document`: `variant:changed`, `product:added`, `cart:updated`. Etapa 1 consumers: sticky ATC, cart drawer count. Etapa 2 consumers (attribution script, Custom Pixel bridge) subscribe to the **same** events. The publisher never imports or references a subscriber.

**When to use:** any theme that will later gain analytics/attribution without wanting to rewrite cart JS.

**Trade-offs:** ✅ zero coupling, ✅ testable, ✅ Etapa 2 is additive. ⚠️ event names are a contract — document them in `analytics-hooks.liquid` and don't rename.

### Pattern 5: Section-scoped CSS + token layer for a DRY design system

**What:** `snippets/css-variables.liquid` prints `:root { --kin-color-brand: {{ settings.color_brand }}; --kin-space-4: 1rem; --kin-radius: {{ settings.radius }}px; ... }` in `<head>`. Every component CSS file consumes only tokens, never literals. Component CSS loads per-section via `{{ 'component-x.css' | asset_url | stylesheet_tag }}`.

**Consistency across avatars:** avatars supply *content only* to shared FIXED sections and *content only* (via metaobject) to VARIABLE sections. No avatar can set a color, font, or spacing. Design is structurally impossible to fork.

**Trade-offs:** ✅ one-file brand change, ✅ CWV-friendly loading. ⚠️ requires discipline: no hardcoded hex/px in component CSS (enforce with a lint rule or review).

---

## Settings Architecture

| Layer | Owns | Editable by non-dev operator? | Examples |
|-------|------|-------------------------------|----------|
| **Theme settings** (`settings_schema.json`) | Design tokens; global offer defaults; feature toggles | ✅ yes (guided) | brand colors, font choice, radius, `guarantee_days=90`, free-shipping threshold copy, WhatsApp number, COD messaging, `show_reviews`, `show_sticky_atc` |
| **Section settings** | Layout / display choices per placement | ✅ yes | image position, background, block order, "show/hide" a module, media aspect ratio |
| **Theme blocks settings** | Small content atoms when placed | ✅ yes | a one-off headline, an extra trust badge |
| **Metaobjects** | All structured, reusable content + media | ✅ yes (primary content surface) | `avatar` entries, `oferta` (pack tiers, prices, badge/savings text), `testimonio`, `faq_item`, `size_chart_row` |
| **Product metafields** | Product-specific facts | ✅ yes (admin) | material/composición, size-guide reference, care instructions, default avatar pointer for `/products/<hero>` with no param |
| **Locales** (`locales/es.default.json`) | UI microcopy (buttons, labels, errors) | ⚠️ dev-assisted | "Agregar al carrito", "Elegí tu talle", validation strings |
| **Locked in code** | Markup, CSS, JS behavior, schema definitions, the FIXED-stack composition, performance budget, checkout/payment config | ❌ no | component structure, event contract, `<kin-*>` elements |

**Rule of thumb:** *copy, images, numbers, and "which modules show in what order" → operator. Structure, behavior, and design tokens' definition → code.* The operator can build an entire new avatar without touching a `.liquid` file.

---

## Clean Seams for Etapa 2 (no coupling in Etapa 1)

| Etapa 2 need | Seam in Etapa 1 | Etapa 1 cost | How Etapa 2 plugs in |
|--------------|-----------------|--------------|----------------------|
| First-party attribution script (`kinelia-atribucion.js`) + cart sync | `{% render 'analytics-hooks' %}` in `theme.liquid` (one line). Snippet is empty + a comment documenting the event contract and expected cart-attribute keys (`visitante_id`, `utm_source/medium/campaign/term/content`, `view`). | ~0 (one include + a NOOP file). PROJECT.md permits setting the `visitante_id` first-party cookie now if trivial — safe to include. | Replace snippet body: read UTMs + `?view=`, set `visitante_id` cookie, `POST /cart/update.js` with `attributes` so keys land in the `orders/create` webhook → Supabase `core.orden` (the attribution chain in `Kinelia_Arquitectura_de_Datos.md` §3 depends on this exact write). |
| Cart / purchase events for attribution + pixels | `assets/events.js` bus; theme already emits `variant:changed`, `product:added`, `cart:updated`. | ~0 (built for the sticky ATC anyway). | Attribution + pixel bridge `addEventListener` on the same events. Publisher unchanged. |
| Meta Pixel / CAPI / GA4 | **Not theme code.** Use **Shopify Custom Pixels** (Web Pixels API, sandboxed, admin-managed). Theme only publishes a custom `page_context` event (avatar slug, `view`, product id) that a pixel can read; document the payload shape. | ~0 (a few `data-` attributes + one custom-event dispatch). | Create custom pixels in admin subscribed to `product_viewed`, `checkout_completed`, etc. CAPI via Meta's Shopify sales channel or a CAPI app. No theme redeploy, consent-mode friendly. |
| Reviews app (Judge.me / Loox) | `reviews.liquid` section + `rating-summary` block in buy-box are **`@app` block slots** (`{% content_for 'block', type: '@app' %}`) plus an Etapa 1 static fallback ("★★★★★ 4.8 · basado en reseñas reales" placeholder or "próximamente"). | Low (one section + one block region + fallback markup). | Operator installs the app and drags its block into the reserved slot. No theme change. |
| Email (welcome / abandoned cart / post-purchase) | Footer `newsletter` block present but disabled via theme setting. | ~0. | Enable block; connect the email app. |

**Anti-coupling guarantees:** Etapa 1 code never references a pixel, an attribution variable, or a reviews app. Every seam is either an empty include, a documented DOM event, an `@app` slot, or a disabled block. Removing Etapa 2 later would leave Etapa 1 fully functional.

---

## Data Flow

### Etapa 1 request flow (detailed)

```
Meta ad click
  URL /products/<hero>?view=avatar-varices&utm_source=meta&utm_medium=paid
      &utm_campaign=...&utm_term=...&utm_content=<ad.id>
    ↓
Shopify router: product = <hero>, alternate template suffix = "avatar-varices"
    ↓
layout/theme.liquid
    ├─ snippets/css-variables.liquid   → :root tokens from theme settings
    ├─ snippets/analytics-hooks.liquid → NOOP (Etapa 1)   [seam]
    ├─ header section group
    ├─ templates/product.avatar-varices.json  →  sections in `order`:
    │     VARIABLE (read `avatar` metaobject "varices"):
    │        avatar-hero → problem-agitation → mechanism(UMP→UMS) → para-quien → testimonios
    │     FIXED (read product + theme settings + `oferta` metaobject):
    │        buy-box → oferta-badges → comparacion-usp → garantia → guia-uso-talles
    │        → reviews(@app placeholder) → faq → cta-final
    └─ footer section group
    ↓
Client hydration: <kin-buy-box> mounts, reads product variant JSON (talle × color),
                  events.js bus ready, IntersectionObserver on main ATC
    ↓
User selects talle=M, color=negro → variant:changed → price + availability update
User selects pack=3 pares       → price recalculates (tier discount preview)
User taps ATC (or sticky ATC)
    ↓
POST /cart/add.js  { id: <variantId M/negro>, quantity: 3,
                     properties: { _pack: "3 pares" } }
    ↓  product:added → cart:updated  (bus)
Cart drawer opens, count + subtotal update
    ↓
"Finalizar compra" → /checkout
    ↓
Shopify native checkout
    ├─ shipping address → shipping zone resolved
    ├─ payment options: MercadoPago (online)  |  "Pago contra entrega"
    │      (manual method; shown only if zone allows COD)
    └─ order placed
    ↓
Thank-you page
════════════════ ETAPA 2 BOUNDARY (not built here) ════════════════
    ⇢ orders/create webhook → Supabase raw.tienda_orden_evento
         → core.orden / orden_item / orden_evento
         cart attributes (visitante_id, utm_*, view) → core.orden.creativo_id, utm_*
    ⇢ Custom Pixel: checkout_completed → Meta Pixel + CAPI + GA4
```

### State management

```
theme settings ──(render time, one-way)──▶ css-variables snippet ──▶ CSS custom properties
metaobjects ────(render time, read-only ref)──▶ VARIABLE + FIXED sections
product JSON ───(client)──▶ <kin-buy-box> state { variantId, packQty, available, price }
                                   │  emits DOM events
                                   ▼
              sticky-atc  ·  cart-drawer-count  ·  (Etapa 2: attribution, pixels)
```

### Key data flows

1. **Content flow:** operator edits metaobject / theme setting → next render picks it up. No build step, no deploy.
2. **Avatar selection flow:** ad URL `?view=` → alternate template → template's metaobject pointer → VARIABLE sections render that avatar.
3. **Purchase flow:** buy-box element state → `/cart/add.js` (1 line item, qty = pack) → native checkout → order.
4. **Attribution flow (Etapa 2):** URL params → `analytics-hooks` → cart attributes → order webhook → Supabase. Etapa 1 leaves the pipe empty but connected.

---

## Suggested Build Order (fine-grained — supports 8–12 phases)

Dependencies in parentheses. `→` = hard dependency; `∥` = parallelizable.

| # | Phase | Delivers | Depends on |
|---|-------|----------|------------|
| 1 | **Repo + base theme + strip** | Git repo + Shopify GitHub integration; `shopify theme dev` preview against a dev store; base theme (Horizon or Dawn per Phase-1 decision) stripped to essentials; `theme-check` lint; performance-budget harness (Lighthouse CI or manual checklist). | — |
| 2 | **Design system foundation** | `settings_schema.json` token definitions from the brand guide; `css-variables.liquid`; `base.css` (reset, typography, color, spacing scale, buttons, form primitives); es-AR locale scaffold. | 1 |
| 3 | **Layout shell + seams** | `theme.liquid`; minimal header; footer (legal links, WhatsApp, disabled newsletter block); empty `analytics-hooks.liquid` with documented contract; `events.js` bus. | 2 |
| 4 | **Product + content data model** | Hero product with talle × color variant matrix; metafield definitions; metaobject definitions (`avatar`, `oferta`, `testimonio`, `faq_item`, `size_chart_row`); seed one full avatar's content + the `oferta` entry. | 3 |
| 5 | **Buy box core** | `buy-box.liquid` + `<kin-buy-box>` + `<kin-variant-picker>` (talle × color, availability, guía de talles modal); `price.liquid`; media gallery (video-first). No bundle yet. | 4 |
| 6 | **Bundle + cart + sticky ATC** | `<kin-bundle-selector>` (pack → quantity); native Functions tiered discount; `_pack` line-item property; cart drawer; `sticky-atc.liquid` + IntersectionObserver sharing buy-box state. | 5 |
| 7 | **Variable persuasion stack** | `avatar-hero`, `problem-agitation`, `mechanism` (UMP→UMS with visual), `para-quien` — all metaobject-driven; theme blocks (`headline`, `media-with-text`). | 4, 2 (∥ with 5–6) |
| 8 | **Social proof + USP** | `testimonios` section (+ avatar-tag filter); `reviews.liquid` with `@app` placeholder + static fallback; `comparacion-usp` (vs media genérica); `trust-row` block. | 7 (∥ with 6) |
| 9 | **Guarantee + guide + FAQ + CTA — assemble FIXED stack** | `garantia` (90 días), `guia-uso-talles`, `faq` (metaobject-driven), `cta-final`; lock the FIXED-stack composition; verify no FIXED section carries per-template copy. | 5, 6, 8 |
| 10 | **Multi-avatar wiring** | `product.json` canonical (default avatar via metafield); `product.avatar-varices.json` (full reference) + `product.avatar-<clone>.json` (the mandatory clone); `?view=` verified; canonical + product-analytics rollup verified; write the operator clone-an-avatar runbook. | 7, 8, 9 |
| 11 | **Home + legal/essential pages** | `index.json` decision (hero avatar landing or redirect); `page.legal.json` (T&C, privacidad, cambios/devoluciones, botón de arrepentimiento, datos de la empresa), `page.contact.json` (WhatsApp); minimal `404`/`search`. | 3 (∥ with 7–10) |
| 12 | **Checkout config + performance pass + launch** | MercadoPago online gateway; "Pago contra entrega" manual payment method with shipping-zone rules; LCP < 2.5s mobile, JS budget, hero preload, native lazy-load audit; cross-device QA; credential + domain + real-content handoff. | all |

**Critical path:** 1 → 2 → 3 → 4 → 5 → 6 → 9 → 10 → 12. Phases 7–8 and 11 run alongside 5–6. Phase 12's checkout config (admin-only) can start any time after a dev store exists; its performance pass must be last.

**Component dependency graph:**

```
1 base ─▶ 2 tokens ─▶ 3 shell+seams ─▶ 4 data model ─┬─▶ 5 buy-box ─▶ 6 bundle+cart+sticky ─┐
                                                     │                                      ├─▶ 9 FIXED stack ─▶ 10 multi-avatar ─▶ 12 checkout+perf+launch
                                                     └─▶ 7 variable stack ─▶ 8 social/USP ───┘
3 shell ─▶ 11 home + legal pages ───────────────────────────────────────────────────────────▶ 12
```

---

## Scaling Considerations

Scale here is **number of avatars** and **number of products**, not user volume (Shopify handles traffic).

| Scale | Architecture adjustments |
|-------|--------------------------|
| 1 product, 1–3 avatars | Template clones by hand. Nothing special. (Etapa 1 target.) |
| 1 product, 10–30 avatars | Metaobject-driven model already handles it. Enforce `slug` naming discipline; build an internal "avatar index" page for the operator. Well under the 1,000-JSON-template limit and the 25-section / 50-block per-template limits. |
| 2–3 products, many avatars each | Per-product template namespace: `product.<prod>-avatar-<slug>.json`. Shared sections and metaobject types unchanged. Consider a `producto` field on the `avatar` metaobject so testimonios/FAQ can be product-scoped. |
| An avatar outgrows `?view=` (needs own SEO page / own price / own reviews) | Promote that avatar to a **dedicated product** with its own `product.<name>.json`. Per-avatar, data-driven, never pre-emptive. |

### Scaling priorities (what strains first)

1. **Content-editing ergonomics** — metaobject rich-text editing gets tedious past ~10 avatars. Fix: tight field descriptions, a golden example entry, and (if it hurts) a lightweight internal admin later. Not a code problem.
2. **Per-template section drift** — an operator edits a FIXED section inside one avatar template. Fix: keep FIXED-section schemas nearly setting-less, document "never edit these per-template", and periodically diff templates.
3. **JS budget creep** — each new interactive module adds a custom element. Fix: keep elements small and lazy-load below-the-fold ones; the per-section CSS/JS pattern already bounds this.

---

## Anti-Patterns

### Anti-Pattern 1: Avatar copy stored in each template's section settings

**What people do:** duplicate the template and retype the headline / agitation / mechanism into that template's section settings.
**Why it's wrong:** N copies of shared content; a shared-FAQ tweak becomes N edits; design and structure drift silently between avatars; no single source of truth for "what does the várices angle say".
**Do this instead:** one `avatar` metaobject per angle; the template holds only a pointer. Fix once, propagates everywhere.

### Anti-Pattern 2: Landing as a `/pages/` template with an embedded product section

**What people do:** build `page.avatar-varices.json` with a "featured product" section for the buy box.
**Why it's wrong:** URL is `/pages/...` not `/products/...`; Shopify product analytics (conversion by product) is weak or absent; canonical/duplicate-content must be managed by hand; some theme ATC plumbing assumes product context.
**Do this instead:** the avatar landing **is** an alternate product template selected by `?view=`. Clean canonical, native product analytics, one inventory pool.

### Anti-Pattern 3: One Shopify product per avatar from day 1

**What people do:** duplicate the product for every angle so each gets a clean `/products/medias-varices` URL.
**Why it's wrong:** fragments inventory (same SKU across products), splits the review corpus, splits product analytics, and multiplies the talle × color variant matrix to maintain.
**Do this instead:** one hero product + `?view=` avatars. Promote an individual avatar to its own product only when its data earns a dedicated SEO page or price.

### Anti-Pattern 4: Meta Pixel / GA4 hardcoded in `theme.liquid`

**What people do:** paste the pixel snippets into the theme `<head>`.
**Why it's wrong:** blocks render, fights consent mode, duplicates checkout events (checkout is a separate surface), and every change is a theme deploy.
**Do this instead:** **Shopify Custom Pixels** (Web Pixels API, sandboxed, admin-managed) subscribed to standard events. Theme only publishes a documented context event.

### Anti-Pattern 5: Coupling cart/sticky-ATC JS to attribution logic

**What people do:** the ATC handler directly calls `pushToDataLayer()` / writes the `visitante_id`.
**Why it's wrong:** Etapa 1 code now depends on Etapa 2 concepts; you can't ship or test the theme without the tracking stack.
**Do this instead:** ATC handler emits `product:added` on the bus; subscribers (built in Etapa 2) are invisible to it.

### Anti-Pattern 6: "3-pack" as a standalone product/variant without inventory components

**What people do:** create a "Pack x3" variant or product priced for three, sold as quantity 1.
**Why it's wrong:** inventory decrements by 1, not 3 → oversell on a 1,000-unit first batch.
**Do this instead:** pack selector sets `quantity` of the chosen talle × color variant (1 line item, qty = pack size). Inventory is exact with zero app. Migrate to native Bundles only if mixed sizes per pack becomes a proven CVR win.

### Anti-Pattern 7: Monolithic framework/app-style front end

**What people do:** pull in a JS framework and a global bundle "to make the buy box reactive".
**Why it's wrong:** hydration cost blows the LCP < 2.5s budget on mobile impulse traffic; every 100ms costs CVR (PROJECT constraint).
**Do this instead:** small vanilla custom elements, one CSS + one JS file per section, loaded only when the section renders.

---

## Integration Points

### External Services

| Service | Integration pattern | Notes / gotchas |
|---------|--------------------|-----------------|
| **MercadoPago** | Third-party payment provider in Shopify checkout settings (admin, not theme). Redirect/hosted flow. | AR-specific. Test the interaction with the COD manual method being present simultaneously. Theme surfaces MP only via payment-icon assets. |
| **COD ("Pago contra entrega")** | **Manual payment method** in admin, named in es-AR, restricted by shipping zone / market. | Single funnel — no custom COD form (PROJECT: a parallel form duplicates the funnel and pollutes CPA). Theme shows COD availability copy from `oferta` metaobject / theme settings. |
| **Shopify CLI + GitHub integration** | `shopify theme dev` for local preview; **Shopify's GitHub theme integration** for the repo-of-record; `shopify theme push --unpublished` for staged previews. | Decide in Phase 1: GitHub-connected theme (auto-syncs commits) vs CLI-push only. Recommend GitHub-connected for the published theme + a separate dev theme for `theme dev`. |
| **Supabase (Etapa 2)** | `orders/create` webhook + `/collect` endpoint (both in the sibling `Kinelia` repo). | Theme's obligations: write cart attributes (`visitante_id`, `utm_*`, `view`), keep the DOM event contract stable, keep `analytics-hooks` as the single injection point. |
| **Reviews app — Judge.me / Loox (Etapa 2)** | Theme app extension → `@app` blocks dropped into reserved slots. | Etapa 1 ships static fallback markup in the same slots. |
| **Custom Pixels (Etapa 2)** | Web Pixels API, configured in admin pixel manager. | Sandboxed; cannot read arbitrary DOM — theme must expose context via a published custom event or `window.Shopify.analytics` fields. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| theme settings ↔ CSS | `css-variables.liquid` at render, one-way | No component CSS may use literal colors/spacing — tokens only. |
| metaobjects ↔ sections | read-only reference resolved at render | Sections never write. Operator edits in admin. |
| template (`?view=`) ↔ VARIABLE sections | one `metaobject` setting (the avatar pointer) | The only thing that differs between avatar templates. |
| `<kin-buy-box>` ↔ sticky ATC / cart count | shared element state + DOM events | Sticky ATC has no independent variant logic. |
| cart / purchase JS ↔ everything else (incl. Etapa 2) | DOM custom events on `document` (`variant:changed`, `product:added`, `cart:updated`) only | Publisher never references a subscriber. This is the Etapa 2 firewall. |
| theme ↔ checkout | native `/cart/add.js` → `/checkout` | No theme code runs in checkout; checkout is configured in admin. |

---

## Sources

- Shopify theme architecture — directory structure, JSON templates, section groups, blocks: https://shopify.dev/docs/storefronts/themes/architecture (HIGH)
- Shopify theme blocks (`blocks/` directory, `@theme`/`@app`, nesting, `content_for`): https://shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks (HIGH)
- JSON templates (naming, limits: 1,000 templates / 25 sections / 50 blocks, structure): https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates (HIGH)
- Alternate templates + `?view=` parameter (official): https://shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates (HIGH)
- Web Pixels API / Custom Pixels (sandboxed admin pixels vs theme code, standard + checkout events): https://shopify.dev/docs/api/web-pixels-api (HIGH)
- Horizon theme (May 2025, 2026 default; theme blocks up to 8 nesting levels, group blocks, "Get metaobject(s)" block) — secondary sources, MEDIUM: posstack.com/blog/shopify-horizon-theme, johnny-taft.medium.com/a-developers-technical-breakdown-of-shopify-s-horizon-theme, datasolution.fr/en/shopify-summer-2025-edition-horizons
- Shopify Bundles line-item-properties lost on checkout split (community, 2025) — MEDIUM: https://community.shopify.dev/t/line-item-properties-lost-after-bundle-split-in-checkout-shopify-bundles-app/14723
- Project inputs: `.planning/PROJECT.md`, `Kinelia_Arquitectura_de_Datos.md` (§3 attribution chain, §7 build order), `Mecanismo_y_Palancas_Facu.md` (Palanca 1 bundle-mandatory, Palanca 2 multi-avatar)

---
*Architecture research for: custom multi-avatar Shopify theme (Dawn/Horizon base), CVR-optimized DTC, Argentina*
*Researched: 2026-09-07*
