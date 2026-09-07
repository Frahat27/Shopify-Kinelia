# Pitfalls Research

**Domain:** Custom CVR-optimized Shopify theme (Dawn-based) for single-product DTC compression socks in Argentina — multi-avatar landing system, hybrid checkout (Shopify native + MercadoPago + cash-on-delivery), paid Meta impulse traffic
**Researched:** 2026-09-07
**Confidence:** MEDIUM-HIGH (Shopify platform facts verified against shopify.dev and Shopify Help Center; Meta policy and AR legal verified against primary/authoritative secondary sources; some plan/availability details flagged for confirmation at launch)

> Scope note: the roadmap does not exist yet. Pitfalls are mapped to **topic-named phases** (Theme Foundation, Product Page / Buy Box, Multi-Avatar System, Bundle Mechanics, Checkout & COD, Legal Pages AR, Performance Budget, Launch/Handoff) plus the deferred **Etapa 2 (Measurement)**. The roadmap author should map these to real phase numbers.

---

## Critical Pitfalls

### Pitfall 1: Over-stripping Dawn and losing built-in cart / predictive-search / a11y behavior

**What goes wrong:**
"Despojar Dawn a lo esencial" is interpreted as deleting sections, snippets, and JS modules wholesale. The team removes `cart-drawer`, `predictive-search`, `cart-notification`, `facets`, `quick-add`, or the `global.js` / `cart.js` custom elements, then rebuilds a thinner cart by hand. The hand-rolled cart loses: focus trapping and `aria-live` announcements, the line-item quantity debounce, cart-note and cart-attribute plumbing, section-rendering re-render of cart contents, and the "sold out / max quantity" states. CVR drops because the cart feels broken on mobile, and accessibility regressions appear (keyboard users, screen readers).

**Why it happens:**
Dawn's behavior is spread across many small files with implicit coupling (custom elements registered in `global.js`, `pubsub.js` events like `cart-update`, the `cart-items` component, `section-id` data attributes). Deleting one file silently breaks another. Developers underestimate how much "free" behavior Dawn ships.

**How to avoid:**
- Strip by **hiding/not-rendering**, not deleting: remove sections from JSON templates and remove nav links, but keep the section/snippet files and JS modules in the repo until proven unused.
- Keep the cart drawer (`cart-drawer.liquid` + `cart-drawer.js`) — it is the single highest-leverage CVR component Dawn gives you for free. Do not rebuild it.
- Before deleting any JS file, grep the theme for `customElements.define`, `document.querySelector` selectors it owns, and `PUB_SUB_EVENTS` subscribers.
- Run Shopify's Theme Check (`shopify theme check`) and Lighthouse a11y after each removal.
- Keep `a11y.js`, `pubsub.js`, `global.js`, `constants.js` untouched.

**Warning signs:**
- Adding to cart no longer opens the drawer / updates the count bubble.
- Console errors: `Uncaught ReferenceError: ... is not defined`, `subscribe is not a function`.
- Lighthouse a11y score drops below ~95; missing `aria-live` region for cart.
- Quantity `+/-` buttons post a full page reload instead of an AJAX section re-render.

**Phase to address:** Theme Foundation (define what "stripped" means as an allowlist, not a delete list)

---

### Pitfall 2: Forking Dawn so hard that upstream updates can never be merged

**What goes wrong:**
The team edits Dawn's core files in place — `sections/main-product.liquid`, `assets/base.css`, `assets/global.js`, `snippets/card-product.liquid`, `layout/theme.liquid` — with hundreds of scattered diffs. Shopify ships Dawn 16/17/18 with checkout, bundle, new pixel, and Web Vitals improvements, but a `git merge upstream/main` produces 200 conflicts across files the team rewrote. The theme is frozen on an old Dawn forever; security/perf/feature updates never land. (Shopify does **not** auto-update a theme once its code has been edited — confirmed by Shopify Help Center. Auto-update only applies to unmodified themes installed from the Theme Store.)

**Why it happens:**
It is faster in the moment to edit `base.css` directly than to architect an override layer. The cost is invisible until the first upstream merge attempt, ~6-12 months later.

**How to avoid:**
- Add Dawn as a git remote (`git remote add upstream https://github.com/Shopify/dawn`) from day 1 and tag the exact base commit.
- **Additive override architecture:**
  - New CSS in `assets/kinelia.css` (or component-scoped `assets/section-*.css`), loaded after `base.css`. Never edit `base.css`.
  - New behavior in new JS modules loaded with `defer`; do not edit `global.js`.
  - Prefer **new** sections (`sections/kinelia-*.liquid`) over editing `main-product.liquid`. If `main-product.liquid` must change, keep edits minimal and well-commented with `{% comment %} KINELIA: ... {% endcomment %}` markers.
  - Custom Liquid lives in new snippets, included from a small number of injection points.
- Keep a `DAWN-OVERRIDES.md` listing every core file touched and why.
- Decide explicitly: "we will pull Dawn updates" vs "we fork and own it." Both are valid; drifting into the second by accident is not.

**Warning signs:**
- `git diff upstream/main -- sections/main-product.liquid` is longer than the original file.
- More than ~6 core Dawn files have non-trivial edits.
- No `upstream` remote configured.
- CSS changes made by adding `!important` to override `base.css` specificity.

**Phase to address:** Theme Foundation (set the override architecture + `upstream` remote before any feature work)

---

### Pitfall 3: Fighting Dawn's CSS instead of working with its custom properties

**What goes wrong:**
Team writes large custom stylesheets that fight Dawn's cascade, layering `!important` and high-specificity selectors to beat `base.css`. Result: brittle CSS, layout shift, inconsistent spacing scale, broken responsive behavior, and CLS regressions that hurt LCP/CVR. Later edits break unrelated pages.

**Why it happens:**
Dawn's CSS is a large single `base.css` with a design-token layer (CSS custom properties set from `settings_data.json` in `theme.liquid`'s `<style>` block). Developers don't realize the settings-driven variables exist and just override raw values.

**How to avoid:**
- Drive global look via **theme settings** (colors, typography, spacing, button radius) so Dawn generates the CSS variables — then your custom sections consume `var(--color-foreground)`, `var(--page-width)`, etc.
- Scope custom CSS to custom sections via section-specific stylesheets (`{{ 'section-kinelia-hero.css' | asset_url | stylesheet_tag }}` inside the section).
- Use Dawn's existing utility classes and layout primitives (`page-width`, `grid`, `.button`) before inventing new ones.
- Reserve `!important` for genuine third-party-script overrides only.

**Warning signs:**
- `grep -c '!important' assets/*.css` climbing past ~20.
- Cumulative Layout Shift > 0.1 in Lighthouse mobile.
- Buttons/inputs styled inconsistently between custom sections and Dawn's cart.

**Phase to address:** Theme Foundation + Product Page / Buy Box

---

### Pitfall 4: Breaking the cart AJAX API (line items, attributes, sections param)

**What goes wrong:**
Custom buy box / bundle / sticky-ATC code calls `/cart/add.js`, `/cart/change.js`, `/cart/update.js` incorrectly: posts `id` as product id instead of variant id, omits the `sections:` parameter so the drawer doesn't re-render, races multiple concurrent `change.js` calls corrupting cart state, or overwrites `attributes` / `note` on every call (wiping the `visitante_id` cart attribute that Etapa 2 will need). Cart shows wrong quantities, drawer goes stale, attribution seam is destroyed.

**Why it happens:**
The Ajax Cart API is lightly documented and stateful; `line` vs `id` vs `key` addressing is easy to confuse; `update.js` **replaces** the attributes object while `change.js` with a partial body does not. Dawn's own `cart.js` already handles debouncing and section re-rendering — bespoke code reinvents it badly.

**How to avoid:**
- Reuse Dawn's `cart-items` / `product-form` components and their `sections` re-render pattern rather than hand-writing fetch calls.
- Always send variant `id` (numeric) to `/cart/add.js`; address existing lines by `line` (1-based index) or `key`.
- For cart attributes, **read-modify-write**: `GET /cart.js`, merge, then `POST /cart/update.js` with the full merged `attributes` object. Never blind-write.
- Serialize cart mutations (queue), never fire parallel `change.js`.
- Add a test: add bundle → open drawer → refresh page → quantities and attributes persist.

**Warning signs:**
- Drawer count and drawer contents disagree after a fast double-tap on ATC.
- `cart.attributes` is empty after adding an item via custom code.
- 422 responses from `/cart/add.js` ("The variant you selected is not available").

**Phase to address:** Product Page / Buy Box (buy box + sticky ATC); re-verified in Bundle Mechanics and reserved for Etapa 2 (Measurement)

---

### Pitfall 5: Multi-avatar system duplicates shared sections — every fix is N fixes

**What goes wrong:**
Each avatar page (várices, embarazadas, deportistas, adultos mayores, de-pie, dormir...) is built by **copying** section files: `hero-varices.liquid`, `hero-embarazo.liquid`, `faq-varices.liquid`, etc. A change to the buy box, the guarantee row, or the FAQ layout must now be made in 6-12 files. Bugs get fixed in some copies and not others. The operator can't add avatar #9 without a developer. This is the single most likely thing to force a partial rewrite of this project.

**Why it happens:**
Copying a working section is the path of least resistance. The multi-avatar requirement (from `Mecanismo_y_Palancas_Facu.md` Palanca 2 — "multiplicar avatares") is understood as "more pages" rather than "same components, swappable content."

**How to avoid:**
- **One set of section files.** Differences between avatars are expressed as **section settings / blocks**, not new files.
- Content-carrying sections (`kinelia-hero`, `kinelia-problem-agitation`, `kinelia-mechanism`, `kinelia-testimonials`, `kinelia-for-whom`) expose all avatar-specific copy, images, and video as `settings` and repeatable `blocks` in their `{% schema %}`.
- Fixed sections (buy box, offer/savings, 90-day guarantee, FAQ, trust row, footer) are **the same section** on every avatar template, ideally with content pulled from a single source (metafields or a snippet) so it's edited once.
- A new avatar = **one new JSON template** (`templates/product.varices.json`) that references the same sections with different setting values. Zero new Liquid.
- Prove it with the required "1 avatar + 1 clone" deliverable *before* building avatar #3 — if cloning requires touching Liquid, the architecture is wrong.

**Warning signs:**
- Section filenames contain avatar names.
- `sections/` count grows every time an avatar is added.
- A styling fix PR touches more than one hero/FAQ/testimonial file.
- Operator asks a developer to "make a new landing."

**Phase to address:** Multi-Avatar System (this is the phase's entire reason to exist — make the anti-duplication rule an explicit success criterion)

---

### Pitfall 6: Avatar content trapped in code — operator can't spin up a new avatar

**What goes wrong:**
Avatar headlines, problem-agitation copy, mechanism explanation, testimonial quotes, and "para quién es" bullets are hard-coded as Liquid strings or baked into locale files only a developer edits. Adding an avatar or A/B-testing a headline becomes a code deploy. The content machine (which is the actual moat per the strategy docs) is bottlenecked on engineering.

**Why it happens:**
Putting text directly in the `.liquid` is faster than wiring up schema settings or metafields. The team optimizes for shipping the first avatar, not for the 10th.

**How to avoid:**
- All avatar-variable content is editable in the **theme editor** (section/block settings) or via **product metafields** with a defined metafield set (e.g. `custom.avatar_headline`, `custom.problem_agitation`, `custom.mechanism_steps`).
- If using one product with many templates: template-level section settings hold the copy (each JSON template stores its own setting values).
- If avatars map to metaobjects: define an `avatar` metaobject with typed fields and render sections from it.
- Write a one-page runbook: "How to launch a new avatar" — should be theme-editor-only steps.
- Keep `rich_text` settings for anything the operator formats.

**Warning signs:**
- Spanish marketing copy appears in `.liquid` files or `locales/es.json` beyond true UI strings.
- "Change the headline" is a git commit.
- No product metafield definitions exist.

**Phase to address:** Multi-Avatar System (content model decision: section settings vs metafields vs metaobjects — pick one, document it)

---

### Pitfall 7: SEO duplicate-content and canonical mistakes across near-identical avatar pages

**What goes wrong:**
6-12 avatar pages sell the same product with ~70% shared body content (buy box, guarantee, FAQ, offer). Google sees near-duplicates, indexes the "wrong" one, splits ranking signals, or applies soft penalties. Worse: the team sets `<link rel="canonical">` on every avatar page pointing to the main product URL — which tells Google to drop all avatar pages from the index, killing any organic long-tail ("medias de compresión várices"). Or the reverse: no canonical strategy at all, and `?variant=` / template-suffix URLs create infinite duplicate crawl paths.

**Why it happens:**
Canonical tags are counterintuitive; Dawn's default `main-product` outputs a self-referencing canonical, and template-suffix product URLs (`/products/x?...`) plus alternate landing routes multiply. Teams copy canonical advice for "duplicate variant URLs" and misapply it to intentionally-distinct landing pages.

**How to avoid:**
- Decide the SEO posture explicitly. This is **paid-impulse traffic first** — organic is a bonus. Two valid strategies:
  1. **Avatar pages are ad landing pages, not SEO pages:** keep them out of the sitemap, add `<meta name="robots" content="noindex,follow">` on avatar templates, let the canonical main product page be the only indexed one. Clean, zero duplicate-content risk.
  2. **Avatar pages are also SEO assets:** give each a genuinely differentiated `<title>`, meta description, H1, intro copy (≥40% unique text), self-referencing canonical, and include in sitemap. More work, more upside.
- Never point an avatar canonical at a different page unless you truly want it de-indexed.
- Ensure only one URL per avatar (avoid it being reachable as both `/pages/varices` and `/products/medias?view=varices`).
- Add `hreflang` only if you later add other markets; for AR-only, skip.

**Warning signs:**
- Google Search Console "Duplicate, Google chose different canonical" or "Alternate page with proper canonical tag" spiking.
- Avatar pages reachable at multiple URLs.
- Every avatar page's canonical = the main product URL (they'll all drop from the index).
- Indexed page count far higher than intended.

**Phase to address:** Multi-Avatar System (canonical + robots + sitemap decision baked into the template architecture); re-check at Launch/Handoff

---

### Pitfall 8: Bundle that only "looks" discounted — full price charged at checkout

**What goes wrong:**
The buy box shows "3 pares — 40% OFF — $X" with a slashed compare-at price, but the actual line items added to cart total the full undiscounted amount, or the discount only applies if a code is typed, or the "savings" is pure visual theater with no cart-level price reduction. Customer reaches Shopify checkout, sees a higher number than the landing promised, and abandons — or worse, completes and charges back / demands refund. Bundle is the load-bearing mechanic of the whole business model (`Mecanismo` Palanca 1) so this is severe.

**Why it happens:**
Shopify's checkout price is authoritative and **cannot be overridden from the theme**. Liquid can render any price you want on the PDP; only one of these actually changes what's charged:
- **Automatic discount** (Admin → Discounts, "quantity"/"buy X get Y" automatic) — applies at checkout with no code.
- **Discount code** — requires the code to be applied (theme can auto-apply via `/discount/CODE` link or `cart.discount` param, fragile).
- **Shopify Functions — Product Discount / Order Discount function** (via a custom app or a bundle app that wraps it) — programmatic, reliable, Plus not required for install-via-app.
- **Cart Transform (Shopify Functions)** — merges components into a bundle parent and sets a fixed bundle price; changes both cart display and checkout.
- **A "bundle product"** — a single product/variant priced at the bundle price (e.g. variant "Pack x3" = $X), no discount object at all. Simplest and most robust for a monoproduct.

Teams build the visual tier selector first and wire pricing "later," then discover the theme can't do it.

**How to avoid:**
- **Choose the bundle mechanic in the Bundle Mechanics research/phase before building the selector UI.** For single-product compression socks the strongest options are:
  - **Multipack variants** (`Pack x1 / x2 / x3` as variants of one product, each with its own price) — checkout-safe by construction, simplest attribution, no app, no Functions. Downside: inventory is per-variant not per-pair (mitigable), and talle × color × pack multiplies the variant matrix (watch the 100-variant / 3-option limit — see Pitfall 9).
  - **Native Shopify Bundles app** (free, uses Cart Transform under the hood) — real component inventory, groups at checkout. Downside: cannot set per-component prices; bundle must be its own product.
  - **Automatic quantity discount** on a single "pair" product — buy 3 pay for ~2. Checkout-safe, simplest inventory, but the discount shows as a line on checkout rather than an integrated price, and stacks awkwardly with any future promo.
- Whatever the choice: **write an end-to-end test that goes landing → cart → Shopify checkout → verify the total equals the promised price**, on every bundle tier, before the phase is "done."
- If using a discount code auto-apply: test that it survives cart edits, incognito, and MercadoPago redirect.

**Warning signs:**
- The PDP price is computed in Liquid/JS but no Discount object or bundle variant exists.
- Checkout total ≠ landing "total" for any tier.
- "Savings" number is hard-coded, not derived from `compare_at_price`.
- QA only tested "add to cart," never clicked through to checkout.

**Phase to address:** Bundle Mechanics (decide mechanic + build); verification at Checkout & COD

---

### Pitfall 9: Bundle-as-multiple-line-items breaks AOV, attribution, and the variant matrix

**What goes wrong:**
The bundle adds 3 separate line items (3× "1 par"). Consequences:
- Order shows 3 line items; naive reporting counts it as 3 orders' worth of units but AOV math and "órdenes" counts get muddled downstream.
- The backend (`core.orden_item`) ingests 3 rows; the "~2,7 pares por orden" metric and per-order CPA denominator need the *order* count, not the line-item count — if any downstream logic counts line items as conversions, CPA efectivo is wrong.
- Talle × color × pack-size as three product options exceeds Shopify's **3-option / 100-variant limit** (raised to 2,000 variants / 3 options only on higher plans / with the new variants API, still capped) — the build hits a hard wall.
- Meta Pixel / CAPI `Purchase` events (Etapa 2) may fire per line item or with wrong `value` / `contents`.

**Why it happens:**
Multi-line-item bundles are the default output of many bundle apps and of the "just add N times" approach. The variant explosion isn't noticed until color #4 is added.

**How to avoid:**
- Prefer a bundle representation that is **one line item**: a multipack variant, or Cart Transform that collapses components into a single parent line for display.
- Keep pack-size **out** of the variant options if possible — model it as separate products ("Pack x2", "Pack x3") or via the bundle app, so the PDP variant matrix stays talle × color (≤ ~ under 100).
- Document for the backend team (Etapa 2 handoff): what one order looks like in the Shopify `orders` payload for each bundle mechanic, so `core.procesar_shopify()` and the CPA denominator count **orders**, not items or units.
- Confirm the Meta Purchase event (Etapa 2) sends order-level `value` once per checkout.

**Warning signs:**
- Cart/checkout shows 2-3 identical lines for one bundle.
- Adding a fourth color throws "You've reached the variant limit."
- Backend `orden_item` count per order is inconsistent for the same product.

**Phase to address:** Bundle Mechanics (representation choice) + Product Page / Buy Box (variant option modeling); documented for Etapa 2

---

### Pitfall 10: Bundle / upsell / COD apps inject scripts that tank LCP or break checkout

**What goes wrong:**
A bundle app, quantity-break app, or COD-form app installs a `<script src>` in `theme.liquid` (or via ScriptTag / app embed) that: adds 100-400ms to LCP on mobile, blocks render, layout-shifts the buy box, or — if it touches checkout via a checkout UI extension or legacy script — breaks the payment step. The whole project's stated constraint is LCP < 2.5s mobile and "cada 100 ms cuesta CVR."

**Why it happens:**
App marketplaces sell "one-click bundles." The script cost is invisible until a Lighthouse run. Legacy checkout scripts silently stop working after the Checkout Extensibility cutoff (see Pitfall 12).

**How to avoid:**
- Bias toward **no app**: multipack variants or a native automatic discount need zero third-party JS.
- If an app is required, evaluate it against a budget: measure Lighthouse mobile before/after install; reject anything adding > ~50ms TBT or any CLS.
- Only install apps that use **app embed blocks** (toggleable, `defer`) or Shopify Functions (run server-side, zero client JS) — avoid apps that use ScriptTag injection.
- Never install an app that injects into checkout unless it's an official Checkout UI Extension and you've tested a full purchase.
- Keep an `APPS.md` inventory: each app, what it injects, its perf cost, why it's justified.

**Warning signs:**
- Lighthouse mobile "Reduce unused JavaScript" / "third-party code" flags an app domain.
- LCP element (hero) is delayed by a script fetch.
- New `<script>` tags in `theme.liquid` you didn't add.
- Checkout throws a JS error or a step won't advance after an app install.

**Phase to address:** Bundle Mechanics + Performance Budget (perf gate on every app install)

---

### Pitfall 11: Building the theme assuming `checkout.liquid` / Additional Scripts still exist

**What goes wrong:**
Team plans to customize the checkout, thank-you, or order-status page by editing `checkout.liquid` or pasting into Settings → Checkout → Additional Scripts (for a COD notice, a pixel, an upsell, order tracking). On non-Plus plans `checkout.liquid` for the Information/Shipping/Payment steps was **never** available, and the **Thank-You and Order-Status Additional Scripts are being removed for non-Plus stores on 2026-08-26** (verified: Shopify Help Center + multiple 2025-2026 migration guides). After that date Shopify auto-upgrades and strips those customizations, irreversibly. Any plan that depends on them is dead on arrival or breaks mid-flight.

**Why it happens:**
Years of Shopify tutorials reference `checkout.liquid` and Additional Scripts. The deprecation timeline is staggered and easy to misread (the 2024-08-13 date was for Plus checkout steps; the 2026-08-26 date is the non-Plus thank-you/order-status wave).

**How to avoid:**
- Assume **Checkout Extensibility only**: checkout UI extensions, Shopify Functions, Shopify (Web/Customer) Pixels, and the branding API. No Liquid in checkout.
- Any pixel/analytics for the thank-you page (Etapa 2) goes through the **Customer Events / Web Pixels** API or a Custom Pixel — never Additional Scripts.
- Post-purchase upsell (if ever) = post-purchase checkout extension.
- COD messaging on checkout = checkout UI extension or the payment method's own description, not injected script.
- Note in Launch/Handoff: confirm the store is already on Checkout Extensibility (new stores are by default).

**Warning signs:**
- Roadmap or plan mentions "edit checkout.liquid" or "add to Additional Scripts."
- A dependency on rendering Liquid objects between "Add payment" and "Thank you."
- Etapa 2 pixel plan references `{{ order }}` in Additional Scripts.

**Phase to address:** Checkout & COD (design around Extensibility from the start); Etapa 2 (Measurement) for the pixel

---

### Pitfall 12: COD manual payment method shows to the wrong regions / no order tagging to separate COD from prepaid

**What goes wrong:**
Two failures, both hitting CPA efectivo:
1. **COD offered where it can't be fulfilled.** Shopify's manual payment methods have **no built-in geo/zone conditions**. If "Pago contra entrega" is enabled, it shows to every customer at checkout regardless of address. Orders come in from provinces the courier won't COD, creating cancellations and unrecoverable outbound-shipping loss — exactly the 29%-of-GMV leak the strategy docs warn about.
2. **No way to tell COD orders from prepaid ones.** If COD and MercadoPago orders aren't tagged/distinguishable at ingestion, the CPA-efectivo calc (spend ÷ *collected* orders) can't apply the right collection rate. COD "confirmed" ≠ collected; prepaid ≈ collected. Mixing them silently inflates the denominator and makes CPA look better than it is.

**Why it happens:**
Shopify's native COD setup is a checkbox with no conditions. Gating by shipping profile/zone is a non-obvious workaround. And the order-source distinction (`gateway` / `payment_gateway_names` = "Cash on Delivery (COD)" vs "mercadopago") isn't surfaced unless you deliberately map it.

**How to avoid:**
- **Geo-gate COD** via shipping profiles: create a shipping profile whose zones are only the COD-eligible regions; the manual COD payment method appears only when the address is in a zone served by a profile that offers it. (Native-only approach; verified via Shopify community guidance. For finer rules a "hide payment method" app exists but adds checkout dependency — avoid if possible.)
- **Tag every order by payment type at ingestion.** Options, best first:
  - Use Shopify Flow (or the webhook processor in the sister repo) to add an `cod` / `prepaid` tag based on `payment_gateway_names` / transaction gateway.
  - The backend `core.procesar_shopify()` already sees the raw payload — ensure it derives and stores `es_contra_entrega` from `gateway` so `mart` views can split collection rate.
- Define the COD "collected" event precisely now (courier remittance / `raw.courier_rendicion`, per the Meta paso-a-paso doc) so Etapa 2 isn't retrofitting it.
- Set a COD minimum/maximum and require phone number (checkout setting) to enable WhatsApp confirmation (Palanca 4).

**Warning signs:**
- COD selectable for an address in a province you don't COD to.
- Orders in the admin where you can't tell at a glance if money was collected.
- Backend has no `gateway` / payment-method column on `core.orden`.
- CPA efectivo computed over all orders regardless of payment type.

**Phase to address:** Checkout & COD (geo-gating + tagging); denominator definition reserved for Etapa 2 (Measurement) but the **tag must be emitted in Etapa 1**

---

### Pitfall 13: MercadoPago gateway quirks — redirect, currency, installments, order-status lag

**What goes wrong:**
- The MercadoPago app that redirects to an external page (Checkout Pro-style) adds a funnel step and abandonment; the "Tarjetas / Checkout API" transparent app keeps it on-site. Picking the wrong one silently costs CVR.
- After MercadoPago redirect, the customer's cart / applied discount / cart attributes (`visitante_id` for Etapa 2) can be lost on return.
- Orders sit in `pending` / `authorized` and only settle later via webhook; if "collected" is read from Shopify order creation instead of payment capture, prepaid CPA is also wrong.
- On non-Plus plans without Shopify Payments (not available in Argentina — flag to confirm at launch), Shopify adds a **third-party transaction fee (2.0% Basic / 1.0% Shopify / 0.5% Advanced)** *on top of* MercadoPago's ~5-6% + IVA. That's 6-8% of GMV in payment cost — material to the margin side of "CPA efectivo < margen."
- MercadoPago "cuotas" (installments) messaging expected by AR buyers; absence hurts CVR.

**Why it happens:**
Multiple MercadoPago apps exist with different UX. The transaction-fee stacking isn't obvious until the first Shopify invoice. Payment state vs order state is a classic conflation.

**How to avoid:**
- Choose the **transparent / on-site** MercadoPago integration (Checkout API app) over redirect where available; test the full flow on mobile.
- Factor **Shopify third-party fee + MercadoPago fee + IVA** into the margin figure used for the CPA-efectivo threshold. Consider whether the Shopify plan tier ($79 Shopify vs $39 Basic) pays for itself via the lower transaction fee at expected volume.
- Confirm at Launch: is Shopify Payments available for AR entities? (Currently believed **no** — plan for the third-party fee.)
- Etapa 2: "collected" for prepaid = payment `paid`/`captured` (from the MercadoPago webhook in the sister repo), not Shopify order-created.
- Verify cart attributes / discounts survive the MercadoPago round trip.
- Enable and surface installments in the buy box copy if the account supports it.

**Warning signs:**
- Checkout leaves `kinelia.com` for `mercadopago.com.ar` and comes back to a broken/empty cart.
- First Shopify invoice shows a "transaction fees" line you didn't expect.
- Prepaid orders counted as collected at creation time.
- Margin used for CPA threshold ignores payment processing cost.

**Phase to address:** Checkout & COD (integration choice + fee modeling); Etapa 2 (Measurement) for collected-event definition

---

### Pitfall 14: Hero video kills LCP on mobile

**What goes wrong:**
The buy box is "galería video-first." An autoplaying `<video>` (or worse, an embedded YouTube/Vimeo iframe, or a bundle/reviews app carousel) is the LCP element or competes with it. Mobile LCP blows past 2.5s; the impulse buyer on 4G bounces before the page paints. Directly violates the stated performance budget and Core Value.

**Why it happens:**
Video-first is a CVR tactic, but naive implementation (large MP4, no poster, `preload="auto"`, iframe embed, above-the-fold) is an LCP disaster. Dawn's own video handling is decent but custom galleries often bypass it.

**How to avoid:**
- LCP element should be a **static, optimized poster image** (the first video frame), served via Shopify CDN with responsive `srcset` and explicit `width`/`height`, `fetchpriority="high"`, and preloaded in `<head>`.
- Video: self-hosted MP4/WebM via Shopify's `video` object or CDN, `preload="none"` or `metadata`, `playsinline muted`, lazy-initialized (play on interaction or after LCP / IntersectionObserver). No third-party video iframes above the fold.
- Keep the poster and first gallery image identical so there's no swap/CLS.
- Test on throttled "Slow 4G" + mid-tier mobile CPU in Lighthouse, not desktop.

**Warning signs:**
- Lighthouse "Largest Contentful Paint element" is a `<video>` or iframe.
- LCP > 2.5s on mobile throttled.
- `preload="auto"` on any above-the-fold video; a `youtube.com/embed` or `player.vimeo.com` iframe on the PDP.
- Network waterfall shows a multi-MB video downloading before first paint.

**Phase to address:** Product Page / Buy Box (gallery implementation) + Performance Budget (LCP gate)

---

### Pitfall 15: Loading every avatar's assets on every page + render-blocking JS + Liquid loops

**What goes wrong:**
- All avatar images/videos/CSS are referenced globally (e.g. in `theme.liquid` or a shared snippet) so a buyer on the "várices" page downloads the "embarazadas" hero video too. Bandwidth and LCP wasted N-fold.
- Custom JS added with plain `<script>` (no `defer`/`async`) in `<head>` blocks rendering.
- Section templates loop over a large collection (`for product in collections.all`) or over all variants/metafields to build a size guide or "related avatars" list, adding server render time (TTFB) that compounds with every avatar.
- Images referenced without Shopify CDN transform params (`?width=`), shipping 2000px originals to 375px screens.

**Why it happens:**
Global includes are convenient. `defer` is forgotten. Liquid loops are cheap to write and their cost is server-side/invisible in dev.

**How to avoid:**
- Avatar assets load **only** from the section that uses them; the section is only on that avatar's template. Use `loading="lazy"` for everything below the fold, `loading="eager"` + preload only for the LCP image.
- All custom JS: `defer`, loaded at end of body or via section-scoped `<script>`; no jQuery, no framework (per constraints).
- Use `{{ image | image_url: width: 800 }}` + `image_tag` with `srcset` / `sizes` everywhere. Never output a raw `.src` without width.
- No unbounded Liquid loops in sections. `limit:` every `for`. Precompute "related avatars" as a small linklist or metafield, not a collection scan.
- Inline critical CSS for the buy box; defer the rest.

**Warning signs:**
- Network tab shows image/video requests for avatars other than the current page.
- Lighthouse: "Eliminate render-blocking resources," "Properly size images," "Defer offscreen images."
- TTFB creeping up as avatars are added.
- `<script>` without `defer`/`async` in `theme.liquid` `<head>`.

**Phase to address:** Multi-Avatar System (asset scoping) + Performance Budget

---

### Pitfall 16: Etapa 1 built in a way that makes Etapa 2 attribution hard to bolt on

**What goes wrong:**
Etapa 2 (Meta Pixel, CAPI, GA4, the `kinelia-atribucion.js` first-party `visitante_id` cookie, cart-attribute sync to `core`) is deferred — but Etapa 1 decisions foreclose it:
- No stable injection point reserved in `theme.liquid` for the attribution script / pixel loader.
- The buy box / cart code doesn't write a `visitante_id` (or `utm_content` / `ad_id`) **cart attribute**, so when the Shopify order webhook lands in the sister repo there's nothing to join the session to the order (`core.orden` ↔ `core.sesion` join key is missing). Backend `CLAUDE.md` explicitly calls out "Attribution missing creativo_id" as an anti-pattern and "If visitante_id is missing, session is orphaned and order cannot be attributed."
- Bundle mechanic emits orders whose shape makes "one order = one conversion" ambiguous (see Pitfall 9).
- An app is allowed to own the pixel / checkout events, so events are duplicated or not sendable server-side (CAPI), and dedup keys (`event_id`) aren't controllable.
- Confirmed vs collected: Etapa 1 dashboards or the operator start reading Shopify's "orders" as the CPA denominator, a habit that's hard to break, and COD isn't separated (Pitfall 12).

**Why it happens:**
"Defer tracking" is read as "ignore tracking." The cheap seams that make Etapa 2 a config job instead of a refactor cost almost nothing to leave in Etapa 1 — but only if done now.

**How to avoid:**
- **Reserve the seam even though the feature is deferred** (PROJECT.md already hints at this: "se evalúa solo dejar el hook en `theme.liquid` si es trivial" — do it, it's trivial):
  - A single documented include point in `theme.liquid` (commented placeholder) for the future attribution/pixel script.
  - The buy box / cart writes a `visitante_id` cart attribute from a first-party cookie **now** (or at minimum, the code path is structured so adding it is a one-liner). Also persist `utm_source/medium/campaign/term/content` as cart attributes on first touch.
  - Cart-attribute read-modify-write discipline (Pitfall 4) so nothing wipes these.
- **Do not let any app own the pixel.** Plan for a first-party Custom Web Pixel + server-side CAPI with your own `event_id` dedup.
- Document the order shape per bundle mechanic for the backend team.
- In any Etapa 1 reporting, label the metric "órdenes creadas (no cobradas)" so nobody mistakes it for CPA efectivo.
- Write an `ETAPA-2-SEAMS.md` listing every hook left in place.

**Warning signs:**
- `theme.liquid` has no placeholder/comment for the attribution script.
- `/cart.js` `attributes` is empty after a real add-to-cart.
- The word "conversion" or "CPA" appears in an Etapa 1 dashboard fed only by Shopify order count.
- A reviews or bundle app is configured to send Purchase events.

**Phase to address:** Theme Foundation (reserve the `theme.liquid` hook) + Product Page / Buy Box (write cart attributes) + Bundle Mechanics (document order shape). Full implementation: Etapa 2 (Measurement).

---

### Pitfall 17: On-page medical claims / before-after imagery / first-person health claims → Meta ad account restriction

**What goes wrong:**
The landing page (or ad) makes claims that trip Meta's Health & Personal Attributes policies: "curá tus várices," "elimina la mala circulación," first-person / second-person health assertions ("tu hinchazón," "conquistá tu dolor de piernas"), before/after leg photos showing idealized swelling reduction, implied medical-device / treatment claims for a non-registered product, or testimonials making disease claims. Result: ads rejected, ad account flagged or disabled, or the domain blacklisted — which halts the entire acquisition engine. Meta also checks **landing-page parity**: the destination must substantiate every ad claim and add none.

**Why it happens:**
Compression socks sit right on the medical/wellness line. The persuasion sections (problem agitation, "mecanismo UMP→UMS," testimonials) naturally drift into disease/treatment language. The strategy doc itself notes the *ad* uses third-person hooks "por compliance de salud de Meta" — but the *landing page* is easy to forget.

**How to avoid:**
- Copy rules for all avatar templates:
  - **Third-person / general framing**, no "vos/tu" implying knowledge of the reader's condition. "Muchas personas con trabajos de pie sienten..." not "Tu trabajo te está arruinando las piernas."
  - No cure/treatment/disease claims. Talk about **comfort, sensation of lightness, support, everyday wellbeing** ("sensación de piernas livianas," "alivio de la pesadez") — the brand positioning already points here.
  - No before/after leg imagery implying a physiological transformation. Lifestyle and product imagery only.
  - Testimonials: subjective comfort experiences, not "me curó las várices." Add a disclaimer that it's not a medical device / consult a professional.
  - A visible "no sustituye consejo médico" line.
- **Landing ↔ creative parity checklist**: every claim on the page must also be defensible; the page must not exceed the ad's claims; the offer (bundle + 90-day guarantee + contra entrega) shown on the page must match the ad.
- Legal/compliance review of the finished avatar template copy before first ad spend.
- Keep a "claims allowlist / blocklist" doc the content operator uses for every new avatar (ties into Pitfall 6).

**Warning signs:**
- Draft copy contains: curar, tratar, eliminar [enfermedad], médico, terapéutico, "tus várices."
- Before/after image blocks in the design.
- Ad rejected for "Personal health" or "Unrealistic outcomes."
- Account Quality shows a policy strike.

**Phase to address:** Multi-Avatar System (copy framework + claims allowlist) + Launch/Handoff (compliance review before spend). Cross-referenced with the ad-side work in Etapa 2 / marketing.

---

### Pitfall 18: Landing doesn't match the ad creative (policy + CVR double hit)

**What goes wrong:**
The ad shows avatar "deportistas" with a specific hook and offer, but the link goes to the generic product page or the "várices" avatar. Meta may flag for misleading/low-quality destination; more immediately, the impulse buyer's expectation breaks and CVR craters. With N avatars and N ad sets, mismatches are near-certain without a system.

**Why it happens:**
Ad URLs are pasted by hand; avatar templates and ad sets are managed by different people/tools; a URL slug changes and ads aren't updated.

**How to avoid:**
- Stable, permanent URL per avatar (decided in Multi-Avatar System, Pitfall 7) — never change a slug that's live in ads; if you must, 301 it.
- A single source-of-truth table mapping avatar → landing URL → ad set (can live with the marketing/Meta setup, per the paso-a-paso doc's naming discipline).
- The landing's hero headline, imagery, and "para quién es" must visibly echo the ad's angle within the first viewport.
- `utm_content={{ad.id}}` already planned (Meta doc) — use it in Etapa 2 to *detect* mismatch (high bounce for a given ad → wrong landing).

**Warning signs:**
- Ads pointing to `/products/medias` instead of an avatar URL.
- High bounce / low scroll for specific ads in Etapa 2 data.
- Avatar slugs renamed after launch.

**Phase to address:** Multi-Avatar System (URL permanence) + Launch/Handoff (ad↔landing map)

---

### Pitfall 19: Missing or non-compliant Argentina legal requirements

**What goes wrong:**
Store launches without the legally required consumer-protection elements for AR e-commerce, exposing the company to Defensa del Consumidor complaints and fines, and (secondarily) hurting trust/CVR:
- **Botón de Arrepentimiento** (Resolución 424/2020, SCI): a link literally labeled "BOTÓN DE ARREPENTIMIENTO," of **easy and direct access from the homepage**, in a prominent visible place — explicitly must **not** be hidden with CSS. It lets the consumer revoke a purchase within 10 business days of receipt without cause; the provider must return an identification code within 24h. Disposición 954/2025 has since tightened obligations — check current text at launch.
- Missing **datos de la empresa** (razón social, CUIT, domicilio) visibly on the site.
- Missing / non-compliant **defensa al consumidor** info and link, **Términos y Condiciones**, **Política de Privacidad** (Ley 25.326 datos personales), and a **cambios y devoluciones** policy consistent with the arrepentimiento right and the 90-day guarantee promise.
- Return policy that contradicts the advertised "garantía 90 días" or the legal 10-day revocation.
- No clear pre-contractual info (total price, shipping cost, delivery time) before purchase.

**Why it happens:**
Teams treat legal pages as boilerplate to paste at the end. The Botón de Arrepentimiento is AR-specific and unknown to devs used to US/EU stores. Dawn ships no template for it.

**How to avoid:**
- Treat "Legal Pages AR" as a real phase with its own checklist, not a footer afterthought.
- Botón de Arrepentimiento: a dedicated page + a **homepage-level, visible link** (footer at minimum, ideally also header/account area). Wire it to a form or a clearly stated email/WhatsApp process that issues a code within 24h. Do not `display:none` it anywhere.
- Company data (razón social, CUIT, domicilio legal, contacto) in the footer on every page.
- Data protection / AFIP / "Data Fiscal" (AFIP form) badge if applicable to the registered entity.
- Pages: T&C, Privacidad, Cambios y Devoluciones, Botón de Arrepentimiento, Datos de la empresa, Contacto/WhatsApp — all reachable from the footer.
- Have the client's AR accountant/lawyer review before launch (needs real razón social data — a Launch/Handoff dependency already in PROJECT.md).
- Make the return/guarantee copy on the PDP consistent with the legal pages.

**Warning signs:**
- No page literally titled "Botón de Arrepentimiento."
- Footer has no company legal name / CUIT.
- Return policy text differs between PDP and the policy page.
- Legal pages are Lorem-ipsum / US-template placeholders at launch.

**Phase to address:** Legal Pages AR (dedicated phase) — blocked on client-provided razón social data in Launch/Handoff

---

### Pitfall 20: Working on the live/published theme instead of a dev/unpublished theme; losing changes between the admin editor and git

**What goes wrong:**
- Edits are made directly to the **published** theme (via `shopify theme push` to the live theme, or the admin code editor), so half-finished sections, broken Liquid, or a bad deploy are visible to paid traffic — burning ad spend on a broken funnel.
- The team edits theme settings / section content in the **Shopify admin Theme Editor** (which writes to `settings_data.json` / template JSON on Shopify's copy), while also editing code in git and running `shopify theme push`. A push **overwrites** the editor's JSON changes; a `pull` overwrites local code. Content and code drift; work is lost; "who has the source of truth" is unclear.
- No staging theme to QA a change before it goes live.

**Why it happens:**
`shopify theme push` without `--unpublished`/`--theme` defaults toward the selected theme; the CLI's dev vs push distinction is subtle. The Theme Editor is the natural place for the operator to edit content, but it's a separate write path from git.

**How to avoid:**
- **Theme topology, decided in Theme Foundation:**
  - `Kinelia — LIVE` (published) — only ever updated by a deliberate, reviewed release.
  - `Kinelia — STAGING` (unpublished) — deploy target for QA; share preview links.
  - Local `shopify theme dev` for development against a dev/preview theme.
- Git is the **source of truth for code** (`.liquid`, `.css`, `.js`, `.json` schema). Releases: `shopify theme push --theme "STAGING"` → QA → publish STAGING or push to LIVE in a maintenance window.
- **Content ownership rule:** decide whether `templates/*.json` and `settings_data.json` are owned by git or by the Theme Editor — you can't have both freely.
  - Pragmatic split: section **schema** and default template structure in git; the operator's per-avatar copy tweaks happen in the Theme Editor on LIVE/STAGING and are periodically `shopify theme pull`-ed back into git as the record. Document the cadence.
  - Or: use Shopify's GitHub integration so the Theme Editor commits back to a branch automatically (removes the drift, adds a branching workflow).
- Never run `shopify theme push` against LIVE from a dev machine casually. Add a `README` release checklist.
- `.shopifyignore` to avoid pushing/pulling files you don't want overwritten.

**Warning signs:**
- Only one theme exists in the store and it's published.
- `shopify theme push` history targets the live theme.
- Operator reports "my content changes disappeared" after a deploy.
- `git status` shows large unexplained `settings_data.json` / template JSON diffs after every pull.

**Phase to address:** Theme Foundation (theme topology + git/editor ownership + release checklist — before any feature work) ; enforced again at Launch/Handoff

---

### Pitfall 21: JSON template sprawl and settings drift across avatars

**What goes wrong:**
Avatars are implemented as JSON templates (the chosen approach). Over 10+ avatars: templates diverge in section **order** and **which** fixed sections they include; a new fixed section (e.g. a payment-methods trust badge) is added to 3 templates and forgotten in 7; section `settings` keys are renamed in the schema but old templates keep stale keys (silently ignored, so the section renders with defaults). The "system" becomes 12 hand-maintained JSON files with no guarantee of consistency.

**Why it happens:**
JSON templates are copy-paste artifacts. There's no inheritance in Shopify templates — every template is a full standalone document. Nothing enforces that all avatars share the same fixed-section spine.

**How to avoid:**
- Define a **canonical avatar template** and treat new avatars as "copy canonical, change only the content settings." Script or checklist the creation.
- Put the entire fixed spine (buy box, offer, guarantee, FAQ, trust row, footer content) into **section groups** or a single wrapper section where possible, so it's referenced once, not re-listed per template.
- When a schema `setting` id changes, do a find-replace across all `templates/product.*.json` in the same PR — never leave orphans.
- A lint/CI check (even a shell script) that asserts every `product.*.json` contains the required fixed sections in the required order.
- Keep the count of distinct **section types** flat as avatars grow (ties to Pitfall 5).

**Warning signs:**
- `templates/product.*.json` files differ in their non-content sections.
- A fixed section appears on some avatars and not others unintentionally.
- Schema has settings no template uses, or templates reference settings the schema dropped.
- Adding avatar #8 is a 30-minute copy-paste-and-pray.

**Phase to address:** Multi-Avatar System

---

### Pitfall 22: Inventory desync with bundles / multipacks

**What goes wrong:**
- Multipack variants ("Pack x3") have their **own** inventory number, tracked independently from the single-pair stock. You sell 10 "Pack x3" and the single-pair count doesn't move; you oversell, or you manually juggle two numbers per talle×color.
- A bundle app that uses component inventory (Cart Transform / native Bundles) is misconfigured so components aren't decremented, or the bundle parent is tracked *and* components are, double-counting.
- Talle×color×pack means dozens of SKUs to keep stocked; a stockout on one talle silently disables that avatar's best-selling option.

**Why it happens:**
Shopify tracks inventory per variant. "A pack of 3" as a variant is a different inventory pool than "1 pair." Only the native Bundles app / Cart Transform links parent sales to component stock — and only if set up right.

**How to avoid:**
- If bundles are the core mechanic (they are), prefer a representation with **component-level inventory**: native Shopify Bundles app or Cart Transform, so all sales draw down the same per-pair (talle×color) stock.
- If using multipack variants for simplicity, accept that inventory is managed at the pack level and set up low-stock alerts per variant; keep the variant count small.
- Test: sell a bundle → confirm the underlying per-pair stock decremented by the right quantity.
- Sync plan with the sister repo's `core` — `orden_item` cost/inventory snapshot expects per-unit rows.
- Out-of-stock UX: the buy box should gracefully fall back to the next available talle/pack, not show an un-buyable default.

**Warning signs:**
- Two inventory numbers to update when stock arrives for one talle×color.
- Bundle sales don't move component stock.
- Buy box default selection is out of stock and there's no fallback.
- Backend `orden_item` rows don't reconcile with pairs shipped.

**Phase to address:** Bundle Mechanics

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Edit Dawn core files (`base.css`, `global.js`, `main-product.liquid`) directly | Faster first build | Upstream merges impossible; frozen on old Dawn (Pitfall 2) | Only trivial, well-marked edits to `main-product.liquid`; never `base.css`/`global.js` |
| Copy a section per avatar | Ship avatar #1 fast | Every fix is N fixes; operator blocked (Pitfall 5) | Never for content sections; acceptable only for a genuinely one-off page |
| Hard-code avatar copy in Liquid/locales | No schema wiring | Content machine bottlenecked on devs (Pitfall 6) | Only true UI microcopy, never marketing copy |
| Visual-only "discount" on PDP, wire real pricing later | Demo looks done | Checkout charges full price; refunds/chargebacks (Pitfall 8) | Never — pricing mechanic must be decided before the selector UI |
| Multipack as a 3rd variant option (talle×color×pack) | One product, simple | 100-variant wall; multi-line-item orders (Pitfall 9) | Only if colors ≤ ~3 and talles ≤ ~5 and verified under the cap |
| Install a bundle/upsell/COD app | One-click feature | +100-400ms LCP, checkout fragility, script debt (Pitfall 10) | Only if it uses app-embed/Functions and passes a perf gate |
| Skip the `theme.liquid` attribution hook ("it's Etapa 2") | Less to do now | Etapa 2 becomes a refactor; orphaned sessions (Pitfall 16) | Never — the hook + cart attribute are ~1 line each |
| Legal pages as US-template placeholders | Launch faster | Defensa del Consumidor exposure; missing Botón de Arrepentimiento (Pitfall 19) | Never for AR |
| Work on the published theme | No theme management overhead | Broken funnel shown to paid traffic; lost work (Pitfall 20) | Never once ads are running |
| One JSON template copied per avatar with no consistency check | Native, simple | Template sprawl, settings drift (Pitfall 21) | Acceptable with a lint check + canonical template discipline |
| Autoplay hero video, `preload="auto"`, above the fold | Punchy first impression | LCP > 2.5s, impulse buyer bounces (Pitfall 14) | Never above the fold; poster image is the LCP element |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Shopify Ajax Cart API | Blind-write `attributes` on every call; send product id not variant id; parallel `change.js` | Read-modify-write attributes; send numeric variant `id`; serialize mutations; reuse Dawn's `cart-items` + `sections:` re-render (Pitfall 4) |
| Shopify Discounts | Assuming the theme can set the checkout price | Use automatic discount, multipack variant, or Shopify Functions (Product Discount / Cart Transform) — checkout price is server-authoritative (Pitfall 8) |
| Shopify Checkout | Planning `checkout.liquid` / Additional Scripts customization | Checkout Extensibility only: UI extensions, Functions, Web Pixels. Non-Plus thank-you/order-status scripts removed 2026-08-26 (Pitfall 11) |
| Shopify manual payment method (COD) | Enabled globally, shows to every region; orders not tagged | Gate via shipping-profile zones; tag `cod`/`prepaid` at ingestion via Flow or the webhook processor (Pitfall 12) |
| MercadoPago | Redirect app adds a funnel step; cart/discount/attributes lost on return; "order created" treated as "paid" | Use transparent Checkout API app; verify cart attributes survive round trip; "collected" = payment captured via webhook (Pitfall 13) |
| Shopify third-party payment fee (AR, no Shopify Payments) | Margin for CPA-efectivo threshold ignores the 0.5-2% Shopify fee stacked on MercadoPago's ~5-6% + IVA | Include full payment cost (Shopify fee + gateway + IVA) in the margin figure; weigh plan tier vs volume (Pitfall 13) |
| Meta Pixel / CAPI (Etapa 2) | Let a reviews/bundle/theme app own the pixel; events duplicated, no CAPI dedup | First-party Custom Web Pixel + server-side CAPI with your own `event_id`; reserve the seam in Etapa 1 (Pitfall 16) |
| Kinelia attribution (`visitante_id`, Etapa 2) | No cart attribute written → order webhook can't join to session; orphaned attribution | Write `visitante_id` + UTM as cart attributes in Etapa 1 buy box; protect them with read-modify-write (Pitfall 16) |
| Dawn upstream | No `upstream` remote; auto-update expectation on a customized theme | Add `upstream` remote day 1; additive override layer; `DAWN-OVERRIDES.md` (Pitfall 2) |
| Shopify Theme Editor vs git | Both edit `settings_data.json` / template JSON; pushes and pulls overwrite each other | Decide ownership; use GitHub integration or a documented pull-back cadence (Pitfall 20) |
| Shopify CDN images | Outputting raw image src without `width`/`srcset` | `image_url: width:` + `image_tag` with `srcset`/`sizes` everywhere (Pitfall 15) |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Hero video as LCP element | Lighthouse LCP element is `<video>`/iframe; LCP > 2.5s mobile | Static poster image is LCP; video `preload="none"`, lazy-init, self-hosted, `playsinline muted` | Immediately on mobile 4G / mid-tier CPU |
| All avatar assets loaded globally | Network tab shows other avatars' media; wasted bytes ×N | Assets load only from the section that uses them; that section only on that template | As soon as there are ≥2 avatars |
| App script bloat | "Reduce third-party code" flags; TBT climbs; CLS on buy box | No-app bundle mechanic; perf gate on every install; app-embed/Functions only | After 1-2 app installs |
| Render-blocking custom JS | "Eliminate render-blocking resources"; FCP delayed | `defer` all custom JS; no framework; section-scoped scripts | Immediately |
| Unbounded Liquid loops (`for product in collections.all`, all-variant/metafield scans) | TTFB creeps up as catalog/avatars grow | `limit:` every loop; precompute related-avatar lists as linklists/metafields | Grows with avatar/variant count; noticeable ~10+ avatars |
| Oversized images (no CDN params) | "Properly size images"; 2000px to 375px screens | `image_url: width:` + responsive `srcset`/`sizes`; `loading="lazy"` below fold | Immediately on mobile |
| Variant matrix explosion (talle×color×pack) | Editor sluggish; "variant limit reached"; slow PDP JS | Keep options to talle×color; pack via separate products / bundle app | At ~100 variants (hard cap without higher plan / new API) |
| Reviews/bundle carousels above the fold | CLS as widget hydrates; LCP competition | Placeholder-sized containers; lazy-load; keep below fold in Etapa 1 (reviews are placeholder anyway) | Immediately |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| App or theme code with write access to cart attributes overwrites `visitante_id` / UTM | Attribution data loss → CPA efectivo uncomputable (business-critical, not classic security but data-integrity) | Read-modify-write; single owner of cart attributes; test persistence through checkout |
| Trusting client-set cart attributes / line-item properties as truth for pricing or discounts | Customer edits `properties`/`attributes` via devtools to fake a discount | Never derive price from client data; discounts via server-side Functions/automatic discounts only |
| Exposing MercadoPago keys / webhook secrets in theme JS or Additional Scripts | Credential leak, fraudulent payment notifications | All payment secrets stay server-side (sister repo Edge Functions); theme never holds gateway secrets |
| Custom "COD form" or lead capture posting PII to a non-Shopify endpoint | Ley 25.326 (datos personales) exposure; also duplicates the funnel (explicitly out of scope) | Single native Shopify checkout; no parallel PII collection |
| Pixel / analytics loaded from an untrusted third-party script in `theme.liquid` | Supply-chain script can read cart, inject content, skim checkout referrals | First-party Custom Web Pixel in the sandboxed Customer Events environment; audit any external script |
| Publicly guessable staging/dev theme with real inventory and price tests | Competitors / customers see unreleased offers, broken prices | Use unpublished themes with preview-link sharing; don't index; remove old dev themes |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Bundle tier selector where the "savings" is theater and checkout price is higher | Trust broken at the worst moment; abandonment / chargeback | Checkout total must equal the promised tier price; test end-to-end (Pitfall 8) |
| COD offered then order cancelled because courier doesn't serve the zone | Customer waited, no delivery; brand damage; wasted freight | Geo-gate COD to serviceable zones (Pitfall 12) |
| MercadoPago redirect loses the cart / discount on return | Customer re-does the cart or leaves | Transparent on-site integration; verify round-trip (Pitfall 13) |
| Sticky ATC / buy box that covers content or fights the cart drawer on mobile | Mis-taps, can't read specs, rage | Reuse Dawn's drawer; test sticky bar z-index / safe-area on real devices |
| Size guide buried or missing; wrong talle ordered | Returns, arrepentimiento invocations, negative reviews | Prominent size guide in the buy box; talle selector with guidance inline |
| Avatar landing headline doesn't echo the ad | Impulse buyer feels bait-and-switched; bounces | Landing first viewport mirrors ad angle/imagery/offer (Pitfall 18) |
| Legal / Botón de Arrepentimiento link hidden or hard to find | Legal non-compliance; also signals untrustworthiness | Visible footer (and ideally header) links on every page (Pitfall 19) |
| Guarantee/return copy on PDP contradicts the policy page | Confusion, disputes, Defensa del Consumidor complaints | Single source of truth for guarantee/return terms; PDP references it |
| Reviews section is an empty placeholder at launch with paid traffic | Social proof absent exactly when it matters for CVR | Etapa 1: seed with real (compliant) testimonials as static content; wire the app in Etapa 2 |

## "Looks Done But Isn't" Checklist

- [ ] **Bundle pricing:** PDP shows a discount — verify the **Shopify checkout total** equals the promised price for *every* tier, in incognito, and after a cart edit, and after a MercadoPago round trip.
- [ ] **Stripped Dawn cart:** ATC still opens the drawer, count bubble updates, quantity +/- does an AJAX section re-render, `aria-live` announces changes, keyboard focus is trapped in the drawer.
- [ ] **Multi-avatar system:** adding a new avatar is **theme-editor / one-JSON-template only** — verify a non-developer can do it from the runbook; a styling fix to the FAQ touches exactly one file.
- [ ] **Canonical/SEO:** avatar pages have a deliberate robots/canonical/sitemap posture — verify in GSC that Google isn't dropping or duplicating them unintentionally.
- [ ] **COD:** select an address in a non-serviceable province — verify COD is **not** offered; place a COD order — verify it's **tagged** distinctly from a MercadoPago order.
- [ ] **Checkout:** confirm the store is on Checkout Extensibility; no plan/feature depends on `checkout.liquid` or Additional Scripts.
- [ ] **Attribution seam (Etapa 2):** after a real add-to-cart, `GET /cart.js` shows a `visitante_id` (or the documented placeholder) and UTM attributes; `theme.liquid` has the commented include point.
- [ ] **Performance:** Lighthouse **mobile, throttled** — LCP < 2.5s, CLS < 0.1, no render-blocking custom JS, LCP element is the hero **image** not a video; run on an actual avatar template, not the homepage.
- [ ] **Legal AR:** page literally titled "Botón de Arrepentimiento" linked from the homepage footer (not CSS-hidden); footer shows razón social + CUIT + domicilio; T&C / Privacidad / Cambios y Devoluciones present and consistent with the 90-day guarantee.
- [ ] **Theme workflow:** a STAGING (unpublished) theme exists; git is code source-of-truth; release checklist written; operator's editor content has a documented pull-back cadence.
- [ ] **Meta compliance:** finished avatar copy passes the claims blocklist (no curar/tratar/eliminar-enfermedad/second-person health); no before/after leg imagery; "no sustituye consejo médico" line present.
- [ ] **Inventory:** sell a bundle — verify the correct per-pair (talle×color) stock decremented; no double-counting; out-of-stock talle has a graceful buy-box fallback.
- [ ] **Dawn updatability:** `upstream` remote configured; `DAWN-OVERRIDES.md` lists every core file touched; a trial `git merge upstream/main` doesn't explode.

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Over-forked Dawn (Pitfall 2) | HIGH | Freeze; extract custom sections/CSS/JS into an additive layer on a fresh Dawn checkout; re-apply core edits minimally; adopt override architecture going forward. Often cheaper to re-scaffold than to keep merging. |
| Duplicated per-avatar sections (Pitfall 5) | MEDIUM-HIGH | Build the canonical parameterized section set; migrate each avatar to JSON templates referencing it; delete the copies. Do it before avatar count grows further. |
| Avatar content in code (Pitfall 6) | MEDIUM | Add schema settings / metafield definitions; move copy out template-by-template; write the operator runbook. |
| Visual-only discount shipped (Pitfall 8) | MEDIUM (HIGH if live) | Stop ads; implement real mechanic (multipack variant / automatic discount / Function); honor/refund any mispriced orders; re-QA end to end. |
| Multi-line-item bundle / variant explosion (Pitfall 9) | MEDIUM | Re-model pack as separate products or Cart Transform single-line; document new order shape for backend; migrate ads/links. |
| `checkout.liquid` dependency (Pitfall 11) | LOW-MEDIUM if caught early | Re-architect on UI extensions / Functions / Web Pixels before build; if already built, port each customization. |
| COD ungated / untagged (Pitfall 12) | LOW-MEDIUM | Add shipping-profile zone gating; backfill tags on existing orders via bulk edit / Flow; add derivation in `core.procesar_shopify()`. |
| Missing attribution seam (Pitfall 16) | LOW if theme still in dev; HIGH if retrofitting post-launch with live data gap | Add `theme.liquid` hook + cart-attribute write; accept a data gap for the untracked period. |
| Missing Botón de Arrepentimiento / legal (Pitfall 19) | LOW (content) but HIGH if a complaint already filed | Add the page + homepage link + company data immediately; respond to any Defensa del Consumidor notice; align return copy. |
| Worked on live theme / lost editor changes (Pitfall 20) | LOW-MEDIUM | Create STAGING; `shopify theme pull` current live state into git as baseline; reconstruct lost content from editor history if available; adopt release checklist. |
| Ad account restricted for claims (Pitfall 17) | HIGH | Scrub all avatar copy/imagery to compliant framing; file Meta review/appeal; may need a new page path / domain warm-up; worst case new ad account + Business Manager. |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| 1 Over-stripping Dawn | Theme Foundation | Cart drawer + predictive search work; Lighthouse a11y ≥ 95; Theme Check clean |
| 2 Over-forking Dawn | Theme Foundation | `upstream` remote exists; `DAWN-OVERRIDES.md`; trial merge is manageable |
| 3 Fighting Dawn CSS | Theme Foundation / Product Page | `!important` count low; CLS < 0.1; consistent design tokens |
| 4 Breaking cart AJAX API | Product Page / Buy Box | Fast double-tap ATC keeps cart consistent; attributes persist through refresh + checkout |
| 5 Duplicated avatar sections | Multi-Avatar System | Section-type count flat; FAQ fix touches 1 file; clone = 1 JSON template |
| 6 Avatar content in code | Multi-Avatar System | Operator adds an avatar from the runbook with no code |
| 7 SEO duplicate / canonical | Multi-Avatar System | GSC shows intended indexing; one URL per avatar; canonicals deliberate |
| 8 Fake discount at checkout | Bundle Mechanics | End-to-end test: checkout total = promised price, every tier |
| 9 Multi-line-item bundle / variant explosion | Bundle Mechanics + Product Page | One order = one conversion documented; variant count < 100; order shape doc'd for backend |
| 10 App script bloat / checkout break | Bundle Mechanics + Performance Budget | Lighthouse mobile unchanged post-install; full purchase works; `APPS.md` |
| 11 `checkout.liquid` assumption | Checkout & COD | No customization depends on Liquid in checkout; Extensibility confirmed |
| 12 COD geo / tagging | Checkout & COD (tag emitted in Etapa 1) | COD hidden for non-serviceable address; COD vs prepaid distinguishable at ingestion |
| 13 MercadoPago quirks / fees | Checkout & COD | On-site flow; cart survives round trip; margin figure includes all payment cost |
| 14 Hero video LCP | Product Page / Buy Box + Performance Budget | LCP element is the poster image; LCP < 2.5s mobile throttled |
| 15 Global assets / blocking JS / Liquid loops | Multi-Avatar System + Performance Budget | Network tab shows only current avatar's media; no render-blocking custom JS; loops bounded |
| 16 Etapa 2 attribution seam missing | Theme Foundation + Product Page + Bundle Mechanics | `theme.liquid` hook present; `visitante_id`/UTM cart attributes on real ATC; `ETAPA-2-SEAMS.md` |
| 17 Meta health-claim compliance | Multi-Avatar System + Launch/Handoff | Copy passes claims blocklist; no before/after imagery; compliance review before spend |
| 18 Landing ≠ ad creative | Multi-Avatar System + Launch/Handoff | Permanent avatar URLs; ad↔landing map exists; first viewport mirrors ad |
| 19 AR legal / Botón de Arrepentimiento | Legal Pages AR | Named page + visible homepage link (not CSS-hidden); company data in footer; policies consistent |
| 20 Live-theme work / editor-git drift | Theme Foundation + Launch/Handoff | STAGING theme exists; release checklist; content pull-back cadence documented |
| 21 JSON template sprawl | Multi-Avatar System | Lint asserts required fixed sections/order on every `product.*.json`; canonical template |
| 22 Inventory desync | Bundle Mechanics | Bundle sale decrements correct per-pair stock; no double count; OOS fallback in buy box |

## Sources

**Shopify platform (HIGH — official / authoritative):**
- Shopify Help Center — Updating themes (auto-update only for unmodified Theme Store themes): https://help.shopify.com/en/manual/online-store/themes/managing-themes/updating-themes
- shopify.dev — checkout.liquid layout (deprecation): https://shopify.dev/docs/storefronts/themes/architecture/layouts/checkout-liquid
- shopify.dev — About product bundles (Cart Transform / Functions, variant model): https://shopify.dev/docs/apps/build/product-merchandising/bundles
- Shopify/dawn GitHub Discussion #1863 — how to update Dawn (manual merge / upstream remote): https://github.com/Shopify/dawn/discussions/1863
- Shopify payment gateways — Argentina: https://www.shopify.com/payment-gateways/argentina

**Shopify migration / community (MEDIUM — corroborated secondary):**
- Flatline Agency — Checkout Extensibility for non-Plus stores before Aug 2026: https://www.flatlineagency.com/blog/shopify-checkout-extensibility-2026/
- Flatline Agency — Shopify checkout upgrade 2025 (Plus vs non-Plus thank-you/order-status): https://www.flatlineagency.com/blog/shopify-checkout-upgrade-2025/
- Biscuits Bundles — Checkout Extensibility for non-Plus, what breaks Aug 26 2026: https://biscuitsbundles.com/blogs/learn/shopify-checkout-extensibility-for-non-plus-stores-what-breaks-on-august-26-2026-and-how-to-migrate-in-time
- Biscuits Bundles — Cart Transform API / native bundles grouping at checkout: https://biscuitsbundles.com/blogs/learn/what-is-the-shopify-cart-transform-api-how-native-bundles-group-products-in-cart-and-checkout
- Fudge — Native Shopify bundles vs bundle apps (2026): https://www.fudge.ai/blog/shopify-bundles-vs-bundle-apps/
- Meetanshi — Limit COD to certain locations in Shopify (shipping-profile zone gating): https://meetanshi.com/blog/limit-cod-certain-locations-shopify/
- Releasit — Set conditions for Cash on Delivery on Shopify: https://www.releas.it/blogs/wiki/set-conditions-for-cash-on-delivery-on-shopify
- Shopify Community — third-party transaction fee when Shopify Payments unavailable: https://community.shopify.com/t/shopify-payment-not-available-will-i-still-be-charged-a-transaction-fee/76665
- TrueProfit — Shopify payment fees breakdown (2.0/1.0/0.5% third-party by plan): https://trueprofit.io/blog/shopify-payment-fees
- Out of the Sandbox — Update Dawn without losing code edits: https://outofthesandbox.com/blogs/shopify-theme-blog/update-your-shopify-dawn-theme-without-losing-code-edits

**MercadoPago (HIGH — official docs):**
- MercadoPago Developers — Shopify integration / Checkout API cards (on-site, no redirect): https://www.mercadopago.com.ar/developers/en/docs/shopify/integration-configuration/checkout-cards

**Meta advertising policy (MEDIUM-HIGH):**
- Meta Business Help Center — Personal Health advertising policy: https://www.facebook.com/business/help/2489235377779939
- Accelerated Digital Media — 2026 health advertising policies (Meta before/after, personal attributes): https://www.accelerateddigitalmedia.com/insights/guide-to-social-media-health-ad-restrictions-2026/
- ZapPush — Meta Personal Attributes policy for health/wellness ads: https://www.zappush.com/blog/meta-personal-attributes-policy-health-wellness-ads
- ZapPush — Why Meta doesn't allow before/after images in health ads: https://www.zappush.com/blog/why-meta-doesnt-allow-before-and-after-images-in-health-ads

**Argentina legal (HIGH — primary + authoritative secondary):**
- Boletín Oficial — Resolución 424/2020 (Botón de Arrepentimiento): https://www.boletinoficial.gob.ar/detalleAviso/primera/235729/20201005
- Argentina.gob.ar — Ley simple: Botón de arrepentimiento: https://www.argentina.gob.ar/justicia/derechofacil/leysimple/boton-arrepentimiento
- RCTZZ — Evolución normativa del Botón de Arrepentimiento y Disposición 954/2025: https://rctzz.com.ar/es/insights/%F0%9F%93%9C-evolucion-normativa-del-lboton-de-arrepentimientor-y-nuevas-obligaciones-para-proveedores.disposicion-954-2025
- Tiendanube — Botón de arrepentimiento: qué es y su ley: https://www.tiendanube.com/blog/boton-de-arrepentimiento/

**Project internal:**
- `.planning/PROJECT.md` — Kinelia Storefront scope, constraints, key decisions
- `Mecanismo_y_Palancas_Facu.md` — bundle obligatorio, CPA efectivo < margen, multiplicar avatares
- `Kinelia_Paso_a_Paso_Meta.md` — Meta ingestion, UTM params, collected-orders denominator, courier remittance

**Flagged for confirmation at Launch/Handoff:**
- Shopify Payments availability for Argentina-registered entities (believed unavailable → third-party transaction fee applies). Confirm on the actual store/plan.
- Exact non-Plus Checkout Extensibility enforcement date and whether it shifts again (currently 2026-08-26 for thank-you/order-status).
- Current variant cap on the chosen Shopify plan (100 vs 2,000 with new variant API).
- Latest text of Botón de Arrepentimiento obligations (Disposición 954/2025 and any 2026 updates) — client's lawyer/accountant to confirm.

---
*Pitfalls research for: Shopify custom Dawn theme + multi-avatar + hybrid COD checkout (Argentina) + Meta impulse traffic + CPA-efectivo measurement*
*Researched: 2026-09-07*
