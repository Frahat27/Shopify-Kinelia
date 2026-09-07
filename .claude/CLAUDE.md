<!-- GSD:project-start source:PROJECT.md -->

## Project

**Kinelia Storefront**

El tema de Shopify para Kinelia, marca DTC que vende medias de compresión en Argentina bajo el posicionamiento "piernas livianas". Es un tema custom construido sobre la base Skeleton de Shopify, optimizado por encima de todo para la tasa de conversión (CVR), con un sistema de landing / página de producto multi-avatar que permite vender el mismo producto bajo muchos ángulos (várices, adultos mayores, embarazadas, deportistas, cansancio por estar de pie, etc.) sin rehacer la página.

El tráfico llega desde anuncios de Meta y compra por impulso: mobile-first, carga rápida y buy box sin fricción son la prioridad.

**Core Value:** Maximizar el CVR de la página de producto (sesiones de tráfico pago → órdenes). Cada decisión estructural del tema se justifica contra ese número.

### Constraints

- **Tech stack**: Shopify + Liquid + base Skeleton (theme blocks); HTML/CSS/JS nativo, sin frameworks frontend pesados — mantenibilidad a largo plazo y performance.
- **Performance**: LCP < 2,5 s en mobile y presupuesto de JS ajustado — el tráfico es mobile de impulso; cada 100 ms de latencia cuesta CVR.
- **Compatibility**: el tema debe escalar a 2-3 productos sin rehacerse — estructura multi-producto nativa desde el día 1.
- **Checkout**: un solo embudo (checkout nativo de Shopify) — no romper la medición de CPA efectivo con flujos paralelos.
- **Idioma**: español (AR) en todo el contenido de cara al usuario; código y comentarios en inglés salvo términos de dominio.
- **Dependencies**: cuenta Shopify, credenciales de MercadoPago en producción, datos de la razón social AR, DNS del dominio — provistos por el usuario en la fase de lanzamiento.

<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->

## Technology Stack

## TL;DR — Firm Recommendations

| Decision | Recommendation | Confidence |
|----------|----------------|------------|
| **Base theme** | **Skeleton theme + theme-blocks architecture**, borrowing web-component patterns from Horizon. Not Dawn (now legacy/maintenance), not a Horizon fork (too heavy to strip). | MEDIUM-HIGH |
| **Multi-avatar mechanism** | **JSON product templates per angle** + a shared **theme-block library** (swappable angle blocks) + **metaobjects** for reusable structured content (testimonials, FAQ, size guide). Route ad traffic with `?view={angle}`. | MEDIUM |
| **Bundle mechanics** | **Fixed per-pack pricing via distinct variants or "Pack" products** (no discount engine). Use the free first-party **Shopify Bundles app** for component inventory. Avoid Functions/Scripts tiered discounts. **Validate the per-pair size-selection question in planning.** | MEDIUM |
| **Local dev + deploy** | **Shopify CLI** (`theme dev/push/pull`) + **Theme Check** (bundled) + **Shopify GitHub integration** for the live/staging themes + **theme-check-action** on PRs. | HIGH |
| **JS approach** | Vanilla JS + native Web Components. No framework. Embla Carousel for the gallery; native `<dialog>` for the size guide; IntersectionObserver for sticky ATC. | HIGH |
| **CSS approach** | Plain CSS with custom properties (design tokens) + per-section/block scoped `{% stylesheet %}`. **No Tailwind.** | HIGH |
| **COD (Argentina)** | Native **manual payment method** ("Pago contra entrega"), available on every plan. Gate visibility with a **Functions-based payment-customization app** (HidePay/Payfy). Tag orders via **Shopify Flow**. | MEDIUM-HIGH |
| **MercadoPago** | Official **Mercado Pago** third-party gateway app (redirect/API) — the primary online gateway for AR since Shopify Payments is unavailable there. Confirm exact app + capabilities at launch. | MEDIUM |
| **Reviews (Etapa 2)** | **Judge.me** (free tier, photo/video, one-click import/export, no lock-in). Consider **Loox** only if UGC carousels prove a CVR lever. | HIGH |

## Recommended Stack

### Core Technologies

| Technology | Version / Status (2026) | Purpose | Why Recommended |
|------------|------------------------|---------|-----------------|
| **Shopify Online Store** (Liquid) | Current | Storefront platform + native checkout | Non-negotiable constraint. Native checkout = single funnel = clean CPA efectivo. |
| **Skeleton theme** (`Shopify/skeleton-theme`) | Current — Shopify's official starting point for custom themes | Base theme to fork | Shopify's explicitly recommended base for building a custom theme in 2026. Minimal boilerplate, ships with the modern **theme-blocks** architecture and no legacy weight to strip. Eligible for any use (Dawn/Horizon carry Theme-Store redistribution caveats; irrelevant here but Skeleton is the clean path). |
| **Theme blocks** (`/blocks` directory, `@theme`/`@app`) | GA, the 2026-forward architecture | Reusable page primitives; nest up to 8 levels | A theme block is defined once at theme level and **reused across any section** — unlike Dawn's section-blocks which are locked to the section that declares them. This is exactly the primitive the multi-avatar system needs (a library of angle blocks composed differently per template). |
| **JSON templates** (`/templates/*.json`) | GA (OS 2.0) | Per-angle page composition | Each avatar/angle = one JSON template that composes shared + swapped sections/blocks. Native, no app. |
| **Metaobjects** | GA | Reusable structured content (testimonials, FAQ items, size guide, optionally "sales angle" copy) | Survives theme iteration better than section-only content; shared across every angle template and across future products. |
| **Metafields** | GA | Per-resource product data (compression mmHg, fabric, care) + references to metaobject entries | The "glue" on the product; metaobjects hold the shared content it points to. |
| **Shopify CLI** | 3.x (Node 20+ / 22 LTS) | Local dev server, hot reload, push/pull, Theme Check | Standard toolchain; `shopify theme dev` gives hot reload for CSS + sections. |
| **Shopify GitHub integration** | Current | Two-way sync between a Git branch and a Shopify theme | Version control for the live + staging themes; editor changes commit back to Git. |
| **Shopify Bundles app** (first-party) | Current, free, all plans | Component-inventory for multipacks / fixed packs | Free, native inventory decrement (a "3 pares" sale removes 3 units of stock), no third-party dependency. Does **not** auto-discount — you set pack price directly, which is what we want (transparent fixed pricing, no discount codes muddying attribution). |
| **Shopify Flow** | Current, free (all plans as of the 2024+ rollout) | Auto-tag COD orders, ops automations | Tag `payment_gateway == manual` orders as `COD` for the confirmation/second-attempt workflow described in the business model. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **Embla Carousel** | ~8.x (`embla-carousel` UMD, ~5 KB gzip, zero deps) | Product gallery / UGC carousel | Buy-box gallery and testimonial rows. Lightweight, touch-first, accessible. Load as a single asset file, init from a web component. |
| Native `<dialog>` element | Browser baseline 2026 | Size guide modal, "cómo se usa" modal | No JS library needed; `showModal()` + backdrop. |
| `IntersectionObserver` (native) | Browser baseline | Sticky mobile Add-to-Cart reveal, lazy sections | Show sticky ATC once the main buy button scrolls out of view. |
| **Horizon web components** (patterns, not a dependency) | Reference `Shopify/horizon` source | Variant picker, cart drawer, predictive search patterns | Copy/adapt the component structure rather than reinventing; do not fork the whole theme. |
| `@shopify/theme-check` | Bundled in CLI | Liquid/JSON linting | CI + pre-commit. |
| **esbuild** (optional) | ~0.24+ | TS → single JS asset, if the team wants TypeScript | Only if TS is desired. Output flat files to `/assets`; keep the no-build path viable. Not required. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Shopify CLI `shopify theme dev` | Local preview against a dev theme, hot reload | Use `--theme-editor-sync` when iterating on JSON templates so editor + local stay aligned. |
| Shopify CLI `theme push --unpublished` / `theme pull` | Deploy to staging/dev theme; pull editor changes | Never `push` straight to the live theme from a laptop; go through the GitHub-connected theme. |
| `shopify theme check` | Lint Liquid/JSON, catch deprecated filters, perf smells, missing translations | Run pre-commit and in CI. |
| **Shopify GitHub integration** | `main` branch ↔ production theme; other branches ↔ dev themes | Editor/code-editor changes on the connected theme commit back to the branch — expect `settings_data.json` / template JSON write-backs; rebase often. |
| `Shopify/theme-check-action` | GitHub Action: run Theme Check on PRs | Add as a required check. |
| Shopify **Web Performance** dashboard + Lighthouse (mobile, throttled) | Track LCP < 2.5 s budget | Test on a real mid-range Android profile, not desktop. |
| Shopify **Flow** | Order tagging, COD ops triggers | Free; no code. |

## Installation

# Prereqs: Node 20+ (22 LTS recommended), Git

# Scaffold from Skeleton (clone the official starter into this repo)

# Local dev

# Lint

# Deploy a staging/dev theme

# Supporting asset (vendored, not npm-installed into the theme)

#   download embla-carousel UMD build -> assets/embla-carousel.min.js

# Optional TS pipeline

- **Shopify Bundles** (first-party, free) — pack inventory
- **Mercado Pago** gateway app (see MercadoPago section — confirm exact listing at launch)
- **HidePay** or **Payfy: Hide Payment Rules** (Functions-based) — gate COD by shipping destination / cart rules
- **Judge.me** — Etapa 2 (reviews section is a placeholder in Etapa 1)

## Base Theme: Skeleton vs Dawn vs Horizon — the decision

### The 2026 landscape

- **Dawn** — Shopify's OS 2.0 reference theme. Mature, maximum documentation, best-understood by tooling and the Shopify MCP. **But:** Shopify's platform investment has moved to the Horizon framework. Dawn uses **section-blocks capped at 2 levels of nesting**, and its blocks cannot be shared across section types. It is now effectively the "legacy reference."
- **Horizon** (launched May 2025, Summer Editions) — Shopify's new flagship framework: storefront **Web Components**, **theme blocks** nested up to 8 levels, every primitive (variant picker, gallery, cart drawer, predictive search) is a self-contained component. It is becoming the default theme for new stores. **But** it ships as 10 heavyweight style variants with lots of built-in sections/markup you would strip for a lean single-product CVR landing, and forking it means inheriting churn you will not pull updates for.
- **Skeleton theme** — Shopify's **officially recommended starting point for custom theme development**. Minimal boilerplate, built on the same modern theme-blocks architecture as Horizon, nothing to strip.

### Recommendation: **Skeleton theme + theme blocks**, adopting Horizon's component patterns by reference.

- More upfront build than forking Dawn — Skeleton gives you *no* pre-built buy box, cart drawer, or variant picker. Mitigation: port these from the open-source Horizon repo (structure, not a fork).
- The theme-blocks ecosystem and third-party app-block support is younger than Dawn's. For Etapa 1 (no apps in the theme yet) this is low-risk; reserve `@app` slots for Etapa 2.
- **RESOLVED in Phase 1 (2026-09-07):** the base theme is **Skeleton**, ratified at the plan 01-01 decision checkpoint. PROJECT.md Key Decisions updated with the tradeoff table; FOUND-03 reframed (Skeleton ships no cart drawer / predictive search — those move to Phases 6 and 11). The earlier draft entry favoring a reduced Dawn base predated weighing the multi-avatar requirement against theme blocks.

### Fallback: **Dawn**, if the team wants lowest-risk / maximum documentation.

## Multi-Avatar Template System — architecture

### Primary recommendation

| Primitive | Use for | How |
|-----------|---------|-----|
| **JSON product templates** (`templates/product.varices.json`, `product.embarazo.json`, …) | One template per angle | Each composes the same fixed sections + a different arrangement/content of angle blocks. |
| **Ad traffic routing** | Sending a Meta campaign to its angle | `kinelia.com/products/medias-de-compresion?view=varices` renders `product.varices.json`. One product, one inventory, one review pool, one checkout — attribution stays clean. |
| **Theme-block library** (`/blocks`) | The swappable content units | `blocks/angle-headline.liquid`, `blocks/problem-agitation.liquid`, `blocks/mechanism.liquid` (UMP→UMS with visual), `blocks/testimonial-set.liquid`, `blocks/who-its-for.liquid`. Each exposes schema settings for copy + media. Reused across every angle template and future products. |
| **Fixed sections** | Buy box, offer bar, 90-day guarantee, FAQ, footer, trust row | Same section references in every JSON template. Edit once, applies everywhere structurally (content via metaobjects/metafields). |
| **Metaobjects** | Reusable structured content shared across all angles | Define `testimonial`, `faq_item`, `size_guide` metaobject types. Blocks render lists of them. FAQ and size guide are identical across angles → define once. |
| **Metafields** | Shared product facts | `compression_mmhg`, `fabric`, `care`, plus list-reference metafields linking the product to its testimonial/FAQ metaobject entries. |
| **`@app` block slots** | Etapa 2 hooks | Reserve empty `@app` slots in the buy box and after the content sections for the reviews widget and any upsell, so Etapa 2 needs no template surgery. |

### Optional evolution (note, don't build in Etapa 1)

### Fallback

## Bundle Mechanics — options and recommendation

| Option | CVR | Checkout cleanliness | Inventory | Attribution | Verdict |
|--------|-----|----------------------|-----------|-------------|---------|
| **A. Distinct variants as packs** (option 3 = "Pares": 1 / 3 / 5), each variant priced directly at the tiered price | Good — pack selector in buy box, transparent "precio por par" math, no code discount needed | Excellent — one line item ("Medias de compresión — 3 pares"), no discount codes | Needs Shopify Bundles app to decrement stock correctly (1 sale of "3 pares" = −3 units) | **Cleanest** — fixed price, no automatic discount in reports | **Primary** |
| **B. Separate "Pack x2 / x3" products** | Good, but buy-box pack switch = JS swapping product context; fragments reviews across products | Excellent — one clean line item | Shopify Bundles app maps each pack product → component units | Clean | Viable; worse for reviews/catalog as products grow |
| **C. Single variant + quantity breaks via discount app** (Shopify Functions) | Good — on-page "comprá 3, ahorrá X%" table | Cart shows qty 3 of one variant + an automatic discount line | Native (qty-based) | **Worse** — automatic discounts appear in reporting; 25-automatic-discount cap; app dependency | Avoid for this business |
| **D. Third-party bundle / BYOB app** (Fast Bundle, Simple Bundles, etc.) | Best if customer must pick size **per pair** | Depends on app; can add line-item clutter | App-managed | App-dependent; some add cart attributes that complicate attribution | Fallback only if per-pair sizing is required |
| **E. Shopify Scripts** | — | — | — | — | **Dead** — Scripts EOL June 30 2026. Do not build on it. |

### Recommendation (to validate in planning)

- One selection for the pack (most likely — same person, same feet): Option A works as-is.
- Per-pair selection: Option A can't express it → fall back to **Option D** (a mix-and-match bundle app), accepting some attribution and checkout-cleanliness cost.

## COD in Argentina (Pago contra entrega)

| Aspect | Reality (2026) | Action |
|--------|----------------|--------|
| Mechanism | Native **manual payment method**. Order created as **payment pending**, marked paid manually after collection. | Settings → Payments → Manual payment methods → "Cash on Delivery (COD)" / custom "Pago contra entrega". |
| Plan level | Available on **every Shopify plan**. No transaction fee on manual payments. | None. |
| `checkout.liquid` | Fully deprecated (info/shipping/payment pages Aug 2024; thank-you/order-status Aug 28 2025; auto-upgrades since Jan 2025). A new store is on **Checkout Extensibility** by default. | Do nothing. Never buy a `checkout.liquid` customization. Later thank-you/order-status tweaks = Checkout UI extensions. |
| Gating COD by shipping zone | **Not natively conditional.** Shipping zones are static (country/region, not city/ZIP) and don't natively hide payment methods. The shipping-profile trick is fragile. | Use a **Functions-based payment-customization app** (HidePay, Payfy). Non-Plus stores *can* run these for **non-card** methods (COD qualifies) — rules by destination country/province, cart value, PO box, etc. |
| 2026 deadline | Non-Plus stores must migrate off legacy checkout scripts / additional scripts by **Aug 26 2026**. | Start on Functions-based apps from day one; never touch legacy Scripts. |
| Order tagging | Needed for the confirmation / second-delivery-attempt workflow. | **Shopify Flow**: trigger on order created, condition `payment gateway name` contains `manual` (or `Pago contra entrega`) → add tag `COD`. Free. |
| Multi-currency | Manual methods support multi-currency presentment since July 2025 (only relevant if Shopify Markets is enabled). | N/A for AR-only. |

## MercadoPago on Shopify Argentina

| Aspect | Reality (2026) | Notes |
|--------|----------------|-------|
| Shopify Payments in AR | **Not available.** | MercadoPago (or dLocal, Modo, etc.) is the primary online gateway. |
| Official integration | Mercado Pago publishes official apps on the Shopify App Store (partner: `mercadopago-latam`) and maintains a **"Shopify" section in its developer docs** (`mercadopago.com.ar/developers/en/docs/shopify/...`) — so it is officially supported. | Two relevant products historically: a redirect/API **"Mercado Pago"** gateway (Checkout Pro style) and **"Mercado Pago Tarjetas"** (Checkout API / transparent on-site card fields). **Confirm the exact current listing, name, and on-site vs redirect behavior when credentials are provisioned at launch.** |
| Payment methods covered | ARS; credit/debit cards; **cuotas** (installments); Mercado Pago wallet/account money; cash tickets (Rapipago / Pago Fácil) depending on the app/config. | Installments are a meaningful CVR lever in AR — verify they surface in checkout. |
| Fees | MercadoPago's own processing fee **plus Shopify's third-party transaction fee** (≈0.5–2% by plan) since it is not Shopify Payments. | Factor into contribution margin / CPA efectivo ceiling. |
| Checkout impact | Runs inside the native Checkout Extensibility checkout as an external gateway. Redirect-style gateways add a hop (minor CVR cost); transparent/Tarjetas keeps the customer on-site. | Prefer the transparent option if both are available and stable. |

## Reviews App (Etapa 2 — note only)

## CSS Approach

| | Plain CSS + custom properties | Tailwind in a Shopify theme |
|---|---|---|
| Build step | None — edit and ship; works with GitHub editor round-trip | Requires a Node build (PostCSS/CLI) that must run before every deploy; breaks the "edit in Shopify code editor / GitHub" loop |
| Theme editor | Section settings map cleanly to CSS custom properties (merchant-tunable colors/spacing) | Utility classes aren't editor-tunable; you rebuild config into components anyway |
| Payload | Scoped `{% stylesheet %}` per section/block, Shopify concatenates & minifies, only-what's-used | Risk of large utility CSS or aggressive purge config to maintain; class-heavy Liquid markup |
| CDN | Shopify serves/optimizes theme CSS assets natively | Shopify CDN does not process Tailwind; you ship the compiled file |
| Modern features | CSS nesting + `:has()` + container queries are browser-baseline in 2026 — most of Tailwind's DX advantage is gone | — |
| Maintainability for this team | Small surface, long-lived, matches Shopify docs & MCP knowledge | Adds a toolchain to maintain for marginal benefit |

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Skeleton + theme blocks | Dawn | Team wants max documentation / MCP coverage and lowest architectural risk; accepts legacy base + duplicated multi-avatar sections |
| Skeleton (build up) | Fork Horizon (strip down) | You want a pre-built buy box / cart drawer / variant picker immediately and are willing to carry unused markup and skip upstream updates |
| JSON templates + `?view=` routing | Separate product per angle | Never for a single SKU — fragments inventory, reviews, and attribution. Only if angles become genuinely different products |
| Vanilla JS + Web Components | Alpine.js | Only if the team strongly prefers declarative sprinkles; still avoid a full framework |
| Embla Carousel | Swiper | Never here — Swiper is significantly heavier; Embla covers gallery + UGC needs |
| Fixed per-pack pricing (Option A) | Quantity-break discount app (Option C) | Only if an on-page "% ahorro" table measurably beats fixed pack pricing in a test — accept discount noise in reporting |
| Shopify Bundles (first-party) | Simple Bundles / Fast Bundle | Only if customers must choose talle/color **per pair** in a pack |
| Judge.me | Loox | Visual UGC collection proven as a CVR driver |
| Plain CSS + custom properties | Tailwind + build | Team has a strong existing Tailwind workflow and accepts a mandatory build step before every deploy |
| MercadoPago official app | dLocal / Modo / other AR gateway | MercadoPago coverage or fees prove inadequate; or as a secondary method |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Shopify Scripts / Checkout.liquid** | Deprecated; Scripts EOL June 30 2026; checkout.liquid already auto-upgraded | Checkout Extensibility, Functions, Bundles app |
| **Legacy payment-customization / additional scripts** (non-Plus) | Deprecated Aug 26 2026 | Functions-based payment-customization app from day one |
| **Headless / Hydrogen / React storefront** | Already ruled out in PROJECT.md; worse Core Web Vitals for the effort, more maintenance, overkill for 1-3 products | Liquid theme on Skeleton |
| **Page builder apps** (PageFly, GemPages, Shogun, Shogun) | DOM/JS bloat kills the LCP < 2.5 s budget; lock-in; fights the multi-avatar block model | Native sections + theme blocks |
| **Tailwind with a mandatory build** | Breaks GitHub/editor round-trip; toolchain to maintain; 2026 CSS covers the gap | Plain CSS + custom properties + scoped `{% stylesheet %}` |
| **jQuery / Swiper / large JS libs** | Blocks render, wastes JS budget on impulse mobile traffic | Vanilla JS, Web Components, Embla |
| **Separate off-Shopify COD form** | Already ruled out — duplicates the funnel, doubles events, corrupts CPA efectivo | Native manual payment method in the one checkout |
| **Quantity-break discount engine for the core bundle** | Automatic-discount objects pollute CPA efectivo reporting; 25-discount cap | Fixed per-pack pricing on variants |
| **Dawn as a 2026 greenfield base** (soft avoid) | Shopify investment moved to Horizon/theme-blocks; section-blocks can't be shared → multi-avatar becomes copy-paste | Skeleton + theme blocks (Dawn only as explicit fallback) |
| **One product template with multiple angles behind cookies/JS** | SEO/caching issues, fragile, hard to QA | One JSON template per angle + `?view=` |

## Stack Patterns by Variant

- Base = Dawn; multi-avatar = duplicated sections per JSON template; everything else in this doc is unchanged.
- Because: maximum documentation and tooling familiarity, at the cost of a less elegant multi-avatar model and a maintenance-mode base.
- Bundle mechanics = third-party mix-and-match bundle app (Simple Bundles / Fast Bundle) instead of variant packs.
- Because: native variants and the first-party Bundles app can't express per-component option selection.
- Prioritize the MercadoPago app variant that surfaces cuotas prominently in checkout and consider a buy-box "3 cuotas sin interés de $X" messaging block.
- The `?view={angle}` + JSON-template pattern already supports splitting traffic at the URL level; add Shopify's native `Shopify.designMode`-safe experiment wiring or an app then.

## Version Compatibility

| Component | Requires | Notes |
|-----------|----------|-------|
| Shopify CLI 3.x | Node 20+ (22 LTS recommended) | Older Node fails silently on some `theme` subcommands |
| Theme Check | Bundled in CLI 3.x | The standalone Ruby `theme-check` gem is legacy; use the CLI / Language Server |
| Theme blocks (`@theme`, nested, `content_for 'blocks'`) | OS 2.0 theme, current Liquid | Fully supported on Skeleton and Horizon; partial/awkward on Dawn |
| Shopify GitHub integration | One branch ↔ one theme | Expect `settings_data.json` + template JSON write-backs from the editor; protect `main`, review those diffs |
| Shopify Bundles app | Any plan | 30 components / 3 options / 100 variants per bundle; no auto-discount; not compatible with Shopify Subscriptions |
| Payment customization apps (non-Plus) | Basic plan or higher | US/CA limited to non-card methods; COD (manual) is fine; other regions broader |
| Functions-based apps | Any plan for **public** App Store apps; **custom** Functions apps need Plus | Use public apps (HidePay/Payfy) unless on Plus |
| Checkout UI extensions | Checkout Extensibility (default for new stores) | Needed only for later thank-you / order-status customization |

## Open Questions to Validate in Planning

## Sources

- shopify.dev — Theme blocks architecture (`/docs/storefronts/themes/architecture/blocks/theme-blocks`) — `@theme`/`@app`, cross-section reuse, `content_for 'blocks'`, nesting. HIGH
- shopify.dev — Shopify CLI for themes (`/docs/storefronts/themes/tools/cli`), GitHub integration (`/tools/github`) — commands, two-way sync. HIGH
- github.com/Shopify/horizon (README, LICENSE) — Horizon framework, Web Components, theme blocks, "use Skeleton for custom builds" guidance. HIGH
- github.com/Shopify/theme-check-action, github.com/Shopify/theme-check — CI linting. HIGH
- help.shopify.com — Manual payment methods; Customizing payment methods and delivery options at checkout; Checkout Blocks payment-method customization. HIGH
- shopify.dev — Create the payments function; payment customization Functions. MEDIUM-HIGH
- mercadopago.com.ar/developers/en/docs/shopify/... — official Shopify integration docs (Checkout API / cards). MEDIUM (exact 2026 app listing not fully re-verified)
- apps.shopify.com/partners/mercadopago-latam; apps.shopify.com/shopify-bundles — app listings, capabilities. MEDIUM
- changelog.shopify.com — "Horizon: 10 new free themes"; "manual payment methods now support multi-currency presentment" (Jul 2025); "B2B features now available in Horizon". MEDIUM-HIGH
- Multiple 2026 practitioner analyses (craftshift.com, kaspianfuad.com, pagefly.io, blackbeltcommerce.com, fudge.ai, skailama.com, wiserreview.com) — Horizon vs Dawn migration cost, native Bundles limits, quantity-break app landscape, reviews-app comparison, checkout-extensibility non-Plus 2026 deadline. MEDIUM (cross-checked across several independent sources)
- braze.com/docs, digitalposition.com, 100xelevate.com — checkout.liquid deprecation timeline (Aug 13 2024 / Aug 28 2025 / auto-upgrade Jan 2025). HIGH (consistent across sources)

<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->

## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->

## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->

## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->

## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:

- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->

## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
