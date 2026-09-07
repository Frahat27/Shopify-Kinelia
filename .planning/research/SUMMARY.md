# Project Research Summary

**Project:** Kinelia Storefront
**Domain:** Conversion-optimized custom Shopify theme (Liquid) for a single-product (to 2-3 product) DTC brand - compression socks, Argentina, paid Meta impulse traffic, hybrid checkout (native + MercadoPago + cash-on-delivery), multi-avatar landing system
**Researched:** 2026-09-07
**Confidence:** MEDIUM-HIGH

## Executive Summary

Kinelia's storefront is an advertorial-style product page built as a custom Shopify theme, sold as one SKU under 8-12 marketing "avatars" (varices, embarazadas, adultos mayores, deportistas, cansancio de estar de pie). Experts build this the way the business already intends: one hero product, native Shopify checkout (single funnel for clean CPA efectivo), a mandatory tiered bundle, and a per-angle landing system. The 2026-correct way to make that landing system maintainable is Shopify's theme-blocks architecture with metaobject-driven content - angle copy lives in `avatar` metaobjects, each angle template is a thin pointer, and the buy box / offer / guarantee / FAQ / footer are shared fixed sections. Vanilla JS + Web Components, plain CSS with design tokens, no framework, no page builder, no heavy apps.

The recommended approach: build up from a near-empty modern base rather than stripping a heavy theme, establish the design-token + override + theme-topology discipline in Phase 1, resolve two decisions early (base theme; bundle mechanic), then build the buy box, bundle, persuasion stack, multi-avatar wiring, legal pages, and a checkout+performance launch pass. Reserve - as ~1-line stubs - every Etapa 2 seam (attribution hook in `theme.liquid`, `visitante_id`/UTM cart attributes, COD/prepaid order tag, Web Pixels context event, reviews `@app` slots) so measurement bolts on later without a refactor.

Key risks: (1) the multi-avatar system degrades into copy-pasted per-angle sections with content trapped in code - the top rewrite risk; (2) the bundle "discount" is visual-only and checkout charges full price - the bundle is load-bearing for the whole business model; (3) Meta crawls the landing page for health-claim compliance and can restrict the ad account; (4) COD shows to non-serviceable provinces and is not tagged distinctly from prepaid, corrupting CPA efectivo; (5) hero video becomes the LCP element and blows the <2.5s mobile budget; (6) over-forking/over-stripping the base theme. Each maps to a concrete prevention in a specific phase below.

## Key Findings

### Recommended Stack

Native Shopify Online Store (Liquid) with the theme-blocks architecture (blocks defined once, reused across sections, nested) is the core - it is the exact primitive the multi-avatar system needs, and it is where Shopify's platform investment sits for 2026+. Content that repeats across angles (testimonials, FAQ, size guide, and the per-angle narrative itself) lives in metaobjects; per-product facts live in metafields; each angle is a JSON alternate template selected by `?view={angle}` on one hero product. Tooling is Shopify CLI (`theme dev/push/pull`) + bundled Theme Check + the Shopify GitHub integration + `theme-check-action` on PRs. Front end is vanilla JS + native Web Components (Embla Carousel ~5KB for galleries, native `<dialog>`, IntersectionObserver for sticky ATC); CSS is plain custom properties + scoped `{% stylesheet %}`, no Tailwind, no build step required.

**Core technologies:**
- **Shopify theme-blocks + JSON alternate templates + metaobjects/metafields** - the multi-avatar content model; native, no app, clone-an-angle without a rebuild
- **Shopify CLI + Theme Check + GitHub integration** - dev/deploy workflow with git as code source-of-truth and a STAGING theme
- **Vanilla JS + Web Components + Embla Carousel** - interactivity within a strict LCP/JS budget; no framework, no hydration cost
- **Plain CSS + design tokens (`css-variables` snippet) + scoped section styles** - one-file brand change, CWV-friendly, survives the GitHub/editor round-trip
- **Shopify Bundles (first-party, free) or native quantity-break Function** - pack inventory / tiered pricing with no discount noise in reporting
- **Native manual payment method ("Pago contra entrega") + official Mercado Pago gateway app** - hybrid checkout inside the one native funnel; COD gated by a Functions-based payment-customization app (HidePay/Payfy) and tagged via Shopify Flow

**Open decision (Phase 1) - base theme.** The three research files diverge and must be reconciled as ONE call with tradeoffs, not three recommendations:
- **PROJECT.md** currently commits to **"Dawn despojado"** - maximum documentation/MCP coverage, lowest architectural risk, but section-blocks cannot be shared across sections (multi-avatar becomes duplicated sections) and Dawn is now the legacy reference.
- **STACK.md** recommends **Skeleton theme + theme-blocks** - Shopify's official starting point for custom themes; near-empty so nothing to strip and easiest LCP budget; but no pre-built buy box / cart drawer / variant picker (port structure from Horizon).
- **ARCHITECTURE.md** recommends **Horizon (stripped)** - the 2026 default, theme-blocks + group blocks + native "Get metaobject(s)" blocks first-class; but ships 10 heavyweight variants to strip and carries update churn you will not pull.
- **Consensus:** the winning architecture is theme-blocks + metaobject-driven content regardless of base; Skeleton and Horizon both support it first-class, Dawn does not. Recommendation to the roadmapper: adopt a theme-blocks base (Skeleton preferred: build up rather than strip down; Horizon as the "want pre-built components" alternative), with Dawn as the explicit lower-risk fallback. Make this an explicit Phase-1 decision and update PROJECT.md's Key Decisions entry. The rest of the architecture (metaobject model, `?view=` templates, CSS strategy, Etapa 2 seams) is identical on any base.

See `STACK.md` for full rationale, version compatibility, and the "what NOT to use" list.

### Expected Features

Advertorial single-product page: a video-first buy box above the fold, then a persuasion body that continues the ad's Avatar to UMP to UMS to USP narrative, then risk-reversal and a final CTA. Everything is mobile-first impulse-optimized. See `FEATURES.md`.

**Must have (table stakes):**
- Video-first media gallery (poster image is the LCP element, video lazy-init) - the ad was a video
- Bundle selector as the primary control (2/3/4 pares, "MAS ELEGIDO" on the middle tier, precio-por-par shown) - the bundle is the offer, not an AOV nicety
- Talle x color variant picker (unavailable combos disabled) + inline size-guide drawer
- Sticky mobile Add-to-Cart bar reflecting current selection; trust row (garantia 90 dias / envio / paga al recibir)
- Payment reassurance (MercadoPago + rapipago/pago facil marks + "tambien podes pagar al recibir"; no Shop Pay - unavailable in AR)
- Problem-agitation to UMP-UMS mechanism (static labelled diagram) to before/after (feel-framed) to testimonials/UGC to "para quien es" self-select grid to comparison vs media generica to FAQ to 90-day guarantee to risk reversal to final CTA
- Cart drawer, announcement bar, honest free-shipping threshold, WhatsApp affordance
- Meta-compliant copy (third-person, no medical claims, disclaimer)
- AR legal: Boton de Arrepentimiento, Defensa del Consumidor, cambios y devoluciones, datos de empresa, T&C, privacidad, ARS pricing
- Fast mobile load: LCP < 2.5s, JS deferred, native lazy-load

**Should have (competitive / the moat):**
- Multi-avatar template system (JSON templates + metaobjects; ~5-8 swappable blocks, everything else locked) proven with 1 full avatar + 1 clone
- Ad-scent continuity per avatar (headline/hero/first agitation line match the winning creative)
- Live "precio por par" math in the selector; COD trust-building block (WhatsApp confirmation explained, "revisas el paquete antes de pagar")
- Localized voseo microcopy throughout; performance as a felt feature
- Review-wall + buy-box rating slot pre-built as stable DOM placeholders for Etapa 2

**Defer (Etapa 2+):**
- Meta Pixel + CAPI, GA4 - Etapa 2
- First-party attribution script (`kinelia-atribucion.js`) + cart sync to Supabase - Etapa 2 (leave the trivial `theme.liquid` hook + cart attributes now)
- Reviews app (Judge.me / Loox) + import - Etapa 2
- Email flows (welcome, COD-aware abandoned cart, post-purchase) - Etapa 2
- Compression size-finder widget, real low-stock/recent-sales signals - Etapa 2 (data-backed only)
- A/B testing framework, per-pair size selection, products 2-3 - Etapa 3+

**Anti-features (do NOT build):** fake countdown/scarcity, custom COD form outside checkout, dynamic "Buy it Now" buttons, heavy third-party bundle app with a cart rewrite, seeded/fake reviews at launch, exit-intent discount popups, pre-PDP quiz funnel, account-creation prompts, live-chat widget, auto-rotating hero carousel, clinical/first-person health copy.

### Architecture Approach

One hero Shopify product; the avatar landing IS an alternate product template selected by the officially-documented `?view={slug}` param (never a `/pages/` template, never a product-per-avatar - both fragment inventory/reviews/analytics). Sections split into a VARIABLE stack (avatar-hero, problem-agitation, mechanism, para-quien, testimonios - each renders from a single `avatar` metaobject reference, carries no copy of its own) and a FIXED stack (buy-box, oferta, comparacion-USP, garantia, guia-talles, FAQ, cta-final, reviews@app-placeholder - identical on every avatar, carries no per-template copy). Cloning an avatar = duplicate one JSON template + create one metaobject entry + point an ad set at the URL; ~15-30 min, no developer. Design is structurally un-forkable: avatars supply content only, never colors/fonts/spacing (those come from theme-settings to `css-variables` tokens). Internal integration is a DOM custom-event bus (`variant:changed`, `product:added`, `cart:updated`) so Etapa 2 consumers subscribe without touching cart JS. See `ARCHITECTURE.md` for the component table, project structure, and the 12-phase dependency graph.

**Major components:**
1. **`layout/theme.liquid` + seam snippets** - document shell; `css-variables.liquid` (tokens), `analytics-hooks.liquid` (no-op Etapa 1 seam), `events.js` bus
2. **`<kin-buy-box>` custom element + FIXED sections** - variant resolution, pack-to-quantity, price, availability, ATC submit; sticky ATC mirrors its state; reads product data + `oferta` metaobject
3. **VARIABLE sections + `avatar` metaobject + `product.avatar-*.json` templates** - per-angle persuasion content; template is a pointer only
4. **Theme blocks library (`/blocks`)** - headline, media-with-text (UMP/UMS), testimonial-card, faq-item, trust-row - reused across sections
5. **Checkout config (admin, not theme)** - Mercado Pago gateway + "Pago contra entrega" manual method gated by shipping zone; Flow tags COD vs prepaid
6. **Etapa 2 seams** - Web Pixels (Custom Pixels, not theme code), `@app` reviews slots, disabled newsletter block, documented cart-attribute contract

### Critical Pitfalls

1. **Multi-avatar duplication + content trapped in code** (the top rewrite risk) - one set of section files; per-avatar difference is metaobject/section-setting values, never new `.liquid`; all marketing copy editable in the theme editor or metaobjects; prove with "1 avatar + 1 clone" that a non-dev can clone from a runbook before building avatar #3.
2. **Bundle that only looks discounted - full price at checkout** - Shopify checkout price is server-authoritative and cannot be set from the theme. Decide the mechanic (multipack variants / native Bundles / automatic Function discount) in a spike BEFORE the buy-box UI; ship an end-to-end test (landing to cart to checkout total = promised price) for every tier.
3. **On-page medical claims to Meta ad-account restriction** - Meta crawls the destination URL. Third-person framing only, no cure/treatment/disease language, no before/after leg imagery, "no sustituye consejo medico" line, a claims allowlist/blocklist the content operator uses per avatar, compliance review before first spend.
4. **COD shows to non-serviceable regions / not tagged vs prepaid** - geo-gate COD via shipping-profile zones (or a Functions payment-customization app); emit a `cod`/`prepaid` order tag in Etapa 1 (via Flow) even though the CPA denominator is defined in Etapa 2 - without the tag, CPA efectivo is uncomputable.
5. **Hero video kills mobile LCP** - the LCP element must be a static optimized poster image (`fetchpriority=high`, preloaded, explicit dimensions); video `preload="none"`, `playsinline muted`, lazy-init; no YouTube/Vimeo iframe above the fold; test throttled mobile on an avatar template.
6. **Over-stripping / over-forking the base theme** - strip by not-rendering, not deleting; keep the cart drawer and a11y/pubsub modules; additive override layer (`kinelia.css`, new sections, never edit core CSS/JS); `upstream` remote + `OVERRIDES.md` from day 1; STAGING (unpublished) theme + git as code source-of-truth + release checklist.

Also significant: breaking the Ajax Cart API (blind-writing `attributes` wipes the `visitante_id` seam - use read-modify-write, serialize mutations, send numeric variant id); `checkout.liquid` / Additional Scripts are dead for non-Plus on 2026-08-26 - design around Checkout Extensibility only; JSON template sprawl (lint that every `product.*.json` has the required fixed spine); SEO canonical/robots posture for near-duplicate avatar pages (recommend noindex,follow - traffic is 100% paid); inventory desync with multipack variants; MercadoPago redirect losing cart/attributes + stacked third-party transaction fees eroding the CPA margin ceiling. Full detail + a pitfall-to-phase table in `PITFALLS.md`.

## Implications for Roadmap

Roadmap granularity is fine (8-12 phases). ARCHITECTURE.md's 12-phase structure with its dependency graph is carried forward below.

### Phase 1: Repo + base theme + workflow foundation
**Rationale:** Every later decision depends on the base theme and the git/editor topology; getting the override architecture wrong is a HIGH-cost recovery.
**Delivers:** Git repo + Shopify GitHub integration; `shopify theme dev` against a dev store; base-theme decision made and PROJECT.md updated (theme-blocks base recommended, Dawn fallback); base stripped by not-rendering with an allowlist; `upstream` remote + `OVERRIDES.md`; STAGING vs LIVE theme topology + release checklist; Theme Check + `theme-check-action`; performance-budget harness.
**Addresses:** development workflow requirement.
**Avoids:** Pitfalls 1, 2, 3, 20 (over-strip, over-fork, CSS fighting, live-theme work).

### Phase 2: Design system foundation
**Rationale:** Tokens must exist before any section is styled or design will drift and CLS regressions appear.
**Delivers:** `settings_schema.json` tokens from the brand guide; `css-variables.liquid`; `base.css` (reset, type scale, color, spacing, buttons, form primitives); es-AR locale scaffold.
**Uses:** plain CSS + custom properties + scoped section styles (STACK.md).
**Avoids:** Pitfall 3.

### Phase 3: Layout shell + Etapa 2 seams
**Rationale:** The seams cost ~1 line each now and are a HIGH-cost retrofit later; the event bus is needed by the sticky ATC anyway.
**Delivers:** `theme.liquid`; minimal header; footer (legal links, WhatsApp, disabled newsletter block); empty `analytics-hooks.liquid` with a documented cart-attribute/event contract; `events.js` bus; `ETAPA-2-SEAMS.md`.
**Implements:** the "clean seams" architecture component.
**Avoids:** Pitfall 16 (attribution seam missing).

### Phase 4: Product + content data model
**Rationale:** Buy box and VARIABLE sections both read this; it gates phases 5 and 7.
**Delivers:** hero product with talle x color matrix; metafield definitions; metaobject definitions (`avatar`, `oferta`, `testimonio`, `faq_item`, `size_chart_row`); seed one full avatar's content + the `oferta` entry.
**Addresses:** multi-avatar content-model requirement.
**Avoids:** Pitfall 6 (content trapped in code).

### Phase 5: Buy box core
**Rationale:** The single highest-CVR-leverage surface; blocks bundle and multi-avatar wiring.
**Delivers:** `buy-box.liquid` + `<kin-buy-box>` + `<kin-variant-picker>` (talle x color, availability, size-guide modal); `price.liquid`; video-first media gallery (poster = LCP). No bundle yet. Writes `visitante_id` + UTM cart attributes now (read-modify-write).
**Addresses:** buy-box table-stakes features.
**Avoids:** Pitfalls 4, 14, 16.

### Phase 6: Bundle spike + bundle + cart + sticky ATC
**Rationale:** The bundle mechanic must be decided by spike BEFORE the selector UI - the pitfall research is emphatic. The bundle is load-bearing for the business model.
**Delivers:** bundle-mechanic spike resolving the open question (one talle/color per pack vs per-pair -> variant packs vs mix-and-match app) and checkout-safe pricing; `<kin-bundle-selector>`; `_pack` line-item property; cart drawer wiring; `sticky-atc.liquid` sharing buy-box state; end-to-end checkout-total test per tier; documented order shape for the backend team.
**Addresses:** bundle selector, free-shipping threshold, quick add.
**Avoids:** Pitfalls 8, 9, 10, 22.

### Phase 7: Variable persuasion stack
**Rationale:** Metaobject-driven; depends only on phases 2 and 4, so runs parallel to 5-6.
**Delivers:** `avatar-hero`, `problem-agitation`, `mechanism` (UMP-UMS static diagram), `para-quien` - all metaobject-driven; theme blocks (`headline`, `media-with-text`). Asset scoping so only the current avatar's media loads.
**Addresses:** ad-scent continuity, mechanism explainer.
**Avoids:** Pitfall 15.

### Phase 8: Social proof + USP
**Rationale:** Depends on phase 7's block library; parallel to 6.
**Delivers:** `testimonios` (+ avatar-tag filter); `reviews.liquid` with `@app` placeholder + static fallback; `comparacion-usp` vs media generica; `trust-row` block.
**Addresses:** testimonials/UGC, review-wall placeholder, comparison block.

### Phase 9: Guarantee + guide + FAQ + CTA - assemble FIXED stack
**Rationale:** Locks the shared spine before multi-avatar cloning so no avatar forks it.
**Delivers:** `garantia` (90 dias), `guia-uso-talles`, `faq` (metaobject-driven), `cta-final`; lock FIXED-stack composition; verify no FIXED section carries per-template copy.
**Addresses:** guarantee, how-to-use, FAQ, risk reversal, final CTA.
**Avoids:** Pitfall 21 (template sprawl).

### Phase 10: Multi-avatar wiring
**Rationale:** The moat and a PROJECT.md requirement; needs the full section set to exist.
**Delivers:** `product.json` canonical (default avatar via metafield); `product.avatar-varices.json` (full reference) + `product.avatar-<clone>.json` (mandatory clone); `?view=` verified on the chosen base; canonical/robots/sitemap posture (recommend noindex,follow); lint asserting the fixed spine; operator "clone-an-avatar" runbook; permanent-URL discipline; claims allowlist/blocklist.
**Addresses:** multi-avatar system + 1 avatar + 1 clone.
**Avoids:** Pitfalls 5, 6, 7, 17, 18, 21.

### Phase 11: Home + legal / essential pages
**Rationale:** Independent of the buy-box chain; runs parallel to 7-10; blocked only on client razon-social data at launch.
**Delivers:** `index.json` decision (hero avatar landing or redirect); `page.legal.json` (T&C, privacidad, cambios/devoluciones, Boton de Arrepentimiento, datos de la empresa); `page.contact.json` (WhatsApp); minimal 404/search.
**Addresses:** AR legal pages, home resolution.
**Avoids:** Pitfall 19.

### Phase 12: Checkout config + performance pass + launch
**Rationale:** Checkout config (admin) can start once a dev store exists; the performance pass must be last so it measures the finished pages.
**Delivers:** Mercado Pago gateway (prefer transparent/on-site); "Pago contra entrega" manual method + shipping-zone gating + Flow `cod`/`prepaid` tag; margin figure including Shopify third-party fee + gateway + IVA; LCP < 2.5s mobile + JS budget + hero preload + lazy-load audit on an avatar template; cross-device QA; the "looks done but isn't" checklist; credential + domain + real-content handoff.
**Addresses:** hybrid checkout config, performance budget, launch.
**Avoids:** Pitfalls 11, 12, 13, 14.

### Phase Ordering Rationale

- Critical path: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 9 -> 10 -> 12. Phases 7-8 run alongside 5-6 (they depend only on 2 and 4); phase 11 runs alongside 7-10 (depends only on 3).
- Foundation (base theme, tokens, seams, data model) is front-loaded because those decisions are the expensive-to-reverse ones and everything else depends on them.
- The bundle spike is bound into phase 6 and gated before the selector UI because "visual-only discount" is a MEDIUM-to-HIGH recovery cost and the bundle is the business model's load-bearing mechanic.
- The FIXED stack is fully assembled and locked (phase 9) before multi-avatar cloning (phase 10) so cloning cannot fork shared content or design.
- The performance pass is deliberately last - it must audit real finished avatar templates, not a scaffold.
- Etapa 2 seams are threaded through phases 3, 5, 6 as ~1-line stubs, never as features.

### Research Flags

Phases likely needing `/gsd-plan-phase --research-phase` during planning:
- **Phase 1:** the base-theme decision needs live verification against the Shopify MCP / shopify.dev - current theme-blocks nesting depth on Skeleton/Horizon, whether `content_for` blocks and "Get metaobject(s)" blocks are GA, `?view=` behavior on the chosen base, current variant cap on the plan tier.
- **Phase 6:** bundle mechanic - a spike is already built into the phase; the open "one size per pack vs per-pair" question drives variant-packs vs mix-and-match app and must be answered with the user before UI. Checkout-price mechanics (automatic discount vs Function vs multipack variant) need verification.
- **Phase 12:** exact 2026 Mercado Pago app listing + capabilities in AR (transparent vs redirect, cuotas display, cash-ticket support), Shopify Payments availability for AR entities, and the Functions-based payment-customization app choice for COD geo-gating - resolve at launch with production credentials.

Phases with standard patterns (skip research-phase):
- **Phases 2, 3, 9, 11:** well-documented Shopify theme conventions (tokens, layout, sections, pages) - established patterns, MCP-covered.
- **Phases 7, 8:** metaobject-driven sections and theme blocks follow the pattern established in phase 4; no new unknowns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Theme-blocks direction is clear and cross-checked (shopify.dev HIGH); base-theme choice is an open decision with three researched options; exact MercadoPago app and Horizon capability claims are MEDIUM (secondary sources / not re-verified for 2026). |
| Features | MEDIUM-HIGH | Business docs are HIGH on offer/creative structure; CVR tactics MEDIUM (multiple practitioner sources agree); Meta health-ad and AR-legal specifics MEDIUM-HIGH (primary sources reviewed). |
| Architecture | MEDIUM-HIGH | Core theme architecture verified against shopify.dev (HIGH); `?view=` alternate templates and canonical behavior officially documented; Horizon specifics and bundle line-item edge cases from secondary sources (flagged inline). |
| Pitfalls | MEDIUM-HIGH | Shopify platform facts verified against shopify.dev + Help Center; Meta policy and AR legal against primary/authoritative sources; some plan/availability details explicitly flagged for launch confirmation. |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Base theme (Skeleton vs Horizon vs Dawn):** decide explicitly in Phase 1 with the tradeoffs above; update PROJECT.md's Key Decisions entry. The rest of the architecture is base-agnostic.
- **Bundle: one talle/color per pack, or per pair?** Highest-leverage unknown - decide with the user in Phase 6 before the buy-box UI. Per-pack -> variant packs + first-party Bundles app; per-pair -> mix-and-match bundle app (accept some attribution/checkout-cleanliness cost). Design the buy box so the data model can swap behind the UI.
- **Exact MercadoPago app + capabilities in AR 2026** (transparent vs redirect, cuotas, cash tickets) and Shopify Payments availability for AR entities (believed unavailable -> third-party fee applies) - resolve in Phase 12 with production credentials.
- **`?view={angle}` URL ergonomics for Meta ads** - confirm query params survive Meta's link handling; decide whether cleaner paths / redirects are wanted.
- **Variant count** - confirm real talle x color (x pack) values stay well under the 100-variant cap on the chosen plan.
- **COD "collected" event definition** (courier remittance) - belongs to Etapa 2 but the `cod`/`prepaid` tag must be emitted in Etapa 1; define the shape now so Etapa 2 does not retrofit.
- **Latest Boton de Arrepentimiento obligations** (Disposicion 954/2025 and any 2026 updates) - client's lawyer/accountant to confirm at launch.

## Sources

### Primary (HIGH confidence)
- shopify.dev - theme architecture, theme-blocks (`@theme`/`@app`, nesting, `content_for`), JSON/alternate templates + `?view=`, Web Pixels API, CLI + GitHub integration
- help.shopify.com - manual payment methods, checkout customization, theme auto-update (only unmodified Theme Store themes), checkout.liquid deprecation
- github.com/Shopify/horizon, Shopify/skeleton-theme, Shopify/theme-check-action, Shopify/dawn Discussion #1863
- mercadopago.com.ar/developers - official Shopify integration / Checkout API cards
- Boletin Oficial + argentina.gob.ar - Resolucion 424/2020 (Boton de Arrepentimiento)
- Meta Business Help Center - Personal Health advertising policy
- Project internal: PROJECT.md, Mecanismo_y_Palancas_Facu.md, SereniVida_Playbook_Marketing.md, Estudio_Mercado_Dolor_LatAm.md, Kinelia_Arquitectura_de_Datos.md, Kinelia_Paso_a_Paso_Meta.md

### Secondary (MEDIUM confidence)
- 2026 practitioner analyses on Horizon vs Dawn migration cost, native Bundles limits, quantity-break app landscape, reviews-app comparison (craftshift, pagefly, blackbeltcommerce, fudge, posstack, johnny-taft)
- Checkout Extensibility non-Plus 2026-08-26 cutoff (Flatline Agency, Biscuits Bundles)
- COD zone-gating and Cart Transform behavior (Meetanshi, Releasit, Biscuits Bundles)
- Shopify third-party transaction fee stacking when Shopify Payments unavailable (Shopify Community, TrueProfit)
- Meta before/after + personal-attributes enforcement (Accelerated Digital Media, ZapPush, Stackmatix)
- Fake scarcity / countdown backfire research (GrowthSuite, CleanCommit, UX Psychology)

### Tertiary (LOW confidence - needs validation)
- Exact 2026 MercadoPago app listing/name and on-site vs redirect behavior in AR
- Maturity of third-party app-block support on theme-blocks
- Whether Shopify shipped further theme-blocks / checkout changes since the knowledge cutoff
- Current variant cap on the specific plan tier (100 vs 2,000 with new variant API)

---
*Research completed: 2026-09-07*
*Ready for roadmap: yes*
