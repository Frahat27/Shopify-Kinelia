# Feature Research

**Domain:** Conversion-optimized Shopify product/landing page for a single-product DTC brand (Kinelia — compression socks, Argentina), advertorial-style, paid Meta traffic, COD-heavy, multi-avatar angle system
**Researched:** 2026-09-07
**Confidence:** MEDIUM-HIGH (business docs are HIGH confidence on offer/creative structure; web sources MEDIUM on CVR tactics; Meta health-ad and AR-legal specifics MEDIUM-HIGH)

> Complexity scale: **S** = theme setting or a small static section; **M** = custom section with schema + conditional logic / variant wiring; **L** = multi-component system or third-party app + data integration. (Maps to template LOW/MEDIUM/HIGH.)

---

## Context that drives every decision

From the business docs (`Mecanismo_y_Palancas_Facu.md`, `SereniVida_Playbook_Marketing.md`, `Estudio_Mercado_Dolor_LatAm.md`, `PROJECT.md`):

- **Buyer:** Argentine, 45–65, "trabajador/a de pie" or "mamá/abuela", chronic leg heaviness/swelling/varices. Impulse purchase right after a Meta video. Mobile. Low/mid socioeconomic — distrusts paying online, hence COD.
- **Offer is standardized, NOT experimental:** tiered bundle (2/3/4 pares) + 90-day guarantee + pago contra entrega. Average order ≈ 2.7 pairs. The bundle is the *condition that makes paid traffic viable*, not an AOV nicety — the page must make the multi-pair pack the default choice.
- **Creative → page continuity:** the ad follows Avatar → UMP (unique mechanism of the problem) → UMS (unique mechanism of the solution) → USP. The landing must continue that exact narrative or the click is wasted (ad-scent).
- **Multi-avatar:** one SKU sold as 8–12 businesses (várices, adultos mayores, embarazadas, deportistas, cansancio de estar de pie, regalo a mamá…). Creative fatigue is solved by swapping avatar, so the page must be clonable per angle without a rebuild.
- **Measurement discipline:** single native Shopify funnel. Anything that forks the funnel (custom COD form, parallel checkout) is banned because it breaks CPA-efectivo measurement.
- **Health-adjacent claims:** third-person framing, no medical claims — Meta crawls the destination URL during ad review, so on-page copy compliance = ad approval.

---

## Feature Landscape

### Table Stakes (missing these = CVR suffers / users bounce)

#### Buy box / above-the-fold

| Feature | Why Expected | Complexity | Notes / Dependencies |
|---|---|---|---|
| Video-first media gallery (autoplay muted, looped, `playsinline`, poster frame preloaded) | Ad was a video; first viewport must continue motion. Static packshot alone loses the impulse. | M | Needs lightweight custom gallery (Dawn's is image-centric). Self-hosted MP4 or Shopify-hosted; lazy-load all but first. Depends on LCP budget — poster image is the LCP element, must be `fetchpriority=high`. |
| Price with anchor / strikethrough + savings shown in $ and % | Bundle economics only land if the "precio por par" drop is visible. AR buyers are price-anchored. | S–M | Compare-at price per variant/bundle. Must render in ARS, thousands separator, no decimals. |
| Bundle selector as the primary control (2 / 3 / 4 pares), "MÁS ELEGIDO" badge on the 3-pack, price-per-pair under each tier, "envío gratis" callout on qualifying tiers | Bundle is the offer. 2–4 options is the researched sweet spot; more = decision fatigue. Default-selecting the middle/target tier lifts AOV without hurting CVR. | M–L | **Blocked on the "bundle mechanic" decision** (single product + quantity breaks vs. separate pack SKUs vs. app). Recommendation below. Selector sits directly above Add-to-Cart. |
| Variant selector: talle × color, with unavailable combos disabled (not hidden) | Product is a talle × color matrix. Buyer must pick before ATC or checkout errors kill the sale. | M | Dawn variant picker adapted. For multi-pair bundles, decide: one talle/color for the whole pack (simplest, highest CVR) vs. per-pair pickers (friction). Recommend single selection for pack v1. |
| Size guide, accessible inline (drawer/modal, not a separate page) | Compression garments live or die on fit; wrong size = return + bad word-of-mouth. AR buyers don't know their compression size. | S–M | Drawer with a cm-based table (tobillo/pantorrilla) + "si estás entre dos, elegí el más grande". Static content, swappable per product later. |
| Sticky Add-to-Cart bar on mobile (appears after buy box scrolls out; shows price + selected bundle + CTA) | Advertorial page is long; the CTA must always be one tap away. Non-negotiable for mobile DTC. | M | Custom. Must not cover iOS home indicator; respect safe-area insets. Reflects current bundle/variant selection. |
| Trust row under ATC (garantía 90 días · envío a todo el país · pagá al recibir) | These three are the offer's risk-reversal triad; buyer scans for them before committing. | S | Icon + label row, fixed content across avatars. |
| Payment reassurance (MercadoPago logo + card/rapipago/pago fácil marks + "También podés pagar al recibir") | COD buyer needs to see they are *not* forced to pay online now. Reduces the #1 bounce reason. | S | Static image row. Shop Pay is **not** available in AR — do not show it. |
| Star rating + review count in the buy box, linking to the review wall | Social proof in the first viewport is a researched pattern. Absence reads as "new/untrustworthy". | S–M | Etapa 1: placeholder/manual rating block. Etapa 2: wired to reviews app (Judge.me/Loox). Keep the DOM slot stable so the swap is trivial. |
| One primary CTA, repeated down the page at section breaks | Long advertorial needs the CTA re-offered after each persuasion beat (mechanism, testimonials, guarantee). | S | Anchor-scrolls to buy box (or triggers cart). Same label everywhere ("QUIERO MIS KINELIA" / "AGREGAR AL CARRITO"). |
| Fast mobile load: LCP < 2.5s, hero poster preloaded, JS deferred, native lazy-load | Impulse traffic; every 100ms costs CVR. Also a PROJECT.md hard constraint. | M | Ongoing budget discipline, not a one-off. No heavy bundle/review apps that inject render-blocking JS. |

#### Persuasion sections below the fold (advertorial body)

| Feature | Why Expected | Complexity | Notes / Dependencies |
|---|---|---|---|
| Problem-agitation section (avatar's day, the recognizable scene: hinchazón al final del día, marca de la media, piernas cansadas) | Continues the ad hook; makes the buyer feel "esto me pasa a mí". | M | **Swappable per avatar.** Text + image/short clip. |
| Mechanism explainer UMP → UMS with a simple visual/diagram/animation (flujo venoso, la sangre que "se estanca", cómo la compresión graduada la empuja de vuelta) | The "Educativo de Mecanismo" structure is ~60% of winning creative spend. Buyers need the pseudo-medical "why" explained so a 5-year-old gets it. | M–L | Static labelled diagram (2–3 frames) beats a heavy animation for LCP/JS budget. **UMP swappable per avatar; UMS mostly fixed** (compression mechanism is the same). |
| Before / after (or "con Kinelia / sin Kinelia") visual | Category expectation for compression/health. Concrete, attributable relief. | S–M | Image pair or slider. Careful with claims — see Meta compliance below. Framed as "cómo se sienten las piernas", not a medical outcome. |
| Testimonial + UGC video carousel | "Testimonio/UGC" is a top-4 winning structure. AR buyer trusts a person like them over the brand. | M | Swipeable, lazy-loaded, muted autoplay off (tap to play) to protect performance. Etapa 1: seed with available lifestyle video + text testimonials; Etapa 2: import real reviews. |
| "¿Para quién es?" avatar grid (várices, de pie todo el día, embarazo, adultos mayores, viajes/vuelos largos, deportistas) | Lets the buyer self-select the use case — and this is exactly where Meta wants qualification to happen (on the LP, not the ad). | S–M | **Semi-fixed:** same grid across avatars, but the buyer's own avatar tile is highlighted/reordered first. |
| How-to-use / cuidado (cómo ponerlas, cuántas horas, lavado) | Reduces "¿lo estaré usando bien?" returns; sets expectations for graduated compression feel. | S | Mostly fixed content. Numbered steps + care icons. |
| Comparison vs. media común / genérica (compresión graduada real, puntera reforzada, tejido que no marca, durabilidad) = the USP block | "Demo Comparativo" has the best measured performance (4.55). Justifies price vs. a $2 sock at the pharmacy. | S–M | Table: Kinelia vs. "media de farmacia". Mostly fixed; USP line can be avatar-tuned. |
| Review wall (filterable by rating, with photos) | Category expectation; buyers scroll reviews before COD commitment. | M | Etapa 1: placeholder section with realistic layout + stable anchor. Etapa 2: Judge.me/Loox. Do NOT fake reviews in Etapa 1 production — use "próximamente" or seed only real ones. |
| FAQ accordion (contra entrega: cómo funciona / cuándo pago / a quién; envíos: plazo y costo por zona; talles: cómo elegir, cambios; devoluciones: 90 días, cómo; material y cuidado) | Every COD objection answered inline = fewer WhatsApp questions and fewer abandoned carts. | S–M | Mostly fixed. COD/envío/devolución copy is brand-level; talles copy can vary by product. |
| 90-day guarantee block (visual seal + plain-language promise + how to claim) | Half the offer's risk reversal. Must be its own confident section, not a footnote. | S | Fixed across all avatars. |
| Risk-reversal / "no arriesgás nada" summary right before the final CTA | Last push: restate COD + 90 días + envío. Mirrors the ad's closing offer. | S | Fixed. |
| Final CTA section (bundle recap + price + CTA + trust triad) | Bottom-of-page buyers who read everything need a full buy box, not just a link. | M | Re-renders the bundle selector or deep-links to the top one. |

#### Conversion mechanics

| Feature | Why Expected | Complexity | Notes / Dependencies |
|---|---|---|---|
| Announcement bar (envío gratis en packs / garantía 90 días — rotating, honest) | Standard; reinforces offer terms above everything. | S | Dawn has it. Keep to true statements. |
| Free-shipping progress / threshold messaging tied to bundle tiers ("con el pack de 3 tenés envío gratis") | Nudges to the target tier using a real, verifiable rule. | S–M | Must reflect actual shipping config. Not a fake bar. |
| Cart drawer (slide-out) instead of a cart page | Keeps the buyer on the LP; fewer steps to checkout. Standard for impulse DTC. | M | Dawn supports drawer. Keep it minimal — no cross-sell clutter that reintroduces choice. |
| Quick add from the bundle selector (select tier → ATC in place, no page reload) | Removes a navigation step on mobile. | S–M | Part of the buy-box JS. |
| Single, unmistakable checkout path: native Shopify checkout, MercadoPago as online gateway, "pago contra entrega" as a manual payment method | PROJECT.md hard constraint — one funnel for CPA-efectivo integrity. COD as manual payment method keeps it inside Shopify checkout. | M–L | Depends on MercadoPago production credentials + shipping-zone rules. This is checkout config, not theme code, but the theme must not add anything that competes with it. |
| WhatsApp contact affordance (floating button or clear footer link) | COD buyers expect a human to confirm; also an AR trust signal. | S | `wa.me` link with pre-filled message. Floating button must be lightweight and not overlap the sticky ATC. |
| Honest low-stock / "envíos esta semana" style messaging ONLY if backed by real data | Real scarcity outperforms none; fake scarcity underperforms none. | S | Prefer none in v1 over anything fabricated. |

### Differentiators (competitive edge)

| Feature | Value Proposition | Complexity | Notes / Dependencies |
|---|---|---|---|
| **Multi-avatar template system** (JSON templates per angle + section blocks with `enabled`/content settings; fixed blocks locked) | The moat. Launch a new angle (embarazadas, deportistas…) in minutes by cloning a template and swapping ~5 blocks. Directly solves creative fatigue → sustains paid scaling. | L | Shopify JSON templates + section schema + optionally metaobjects for avatar content. Requires 1 full avatar + 1 clone to prove it (PROJECT.md). See "Multi-avatar system" section. |
| **Ad-scent continuity per avatar** (headline, hero clip, first agitation line all match the winning creative for that angle) | Message-match is one of the biggest CVR levers for paid LPs; most competitors run one generic PDP for all ads. | M | Falls out of the template system if the content model is right. |
| **Mechanism visual built once, reused** (UMS diagram is avatar-agnostic; only the UMP intro changes) | Buyers get the pseudo-medical explanation the winning creatives rely on, without per-avatar art cost. | M | Design asset + a section that takes an avatar-specific intro paragraph. |
| **"Precio por par" math shown live in the selector** | Makes the 3/4-pack the rational choice on sight; competitors often only show pack totals. | S–M | Selector JS. |
| **COD trust-building block** (foto del repartidor / "un asesor te confirma por WhatsApp antes de enviar" / "revisás el paquete antes de pagar") | Turns COD from a scary unknown into a reassurance. Few AR stores explain the COD flow on the PDP. | S | Fixed content. High leverage for this buyer. |
| **Compression size finder** (2–3 questions → recommended talle) vs. a static table | Reduces wrong-size returns, which is the main margin leak in compression garments. | M | Small JS widget; can start as the static drawer and upgrade. |
| **Localized, plain-Spanish (AR) microcopy everywhere** ("pagá", "elegí tu talle", "te llega en 3–5 días hábiles") | Reads as a local brand, not a dropshipper. Trust signal for a skeptical COD segment. | S | Content discipline; voseo throughout. |
| **Performance as a felt feature** (instant load, no jank) | Sub-2.5s LCP on mid-range Android is itself a conversion + trust advantage over app-heavy competitors. | M | Architecture choice (Dawn, minimal JS) already made; must be defended per section. |
| **Reusable "review wall" slot ready for Etapa 2** | Design the DOM/anchor now so importing 500 reviews later is a config change, not a redesign. | S | Placeholder section with the real final layout. |

### Anti-Features (deliberately do NOT build)

| Feature | Why Requested | Why Problematic | Alternative |
|---|---|---|---|
| Fake countdown timer / evergreen "oferta termina en 10:00" that resets on refresh | "Urgency boosts conversions" | >60% of shoppers refresh-test timers; FTC-named dark pattern; detected fakes cause 20–40% drops in repeat purchase and Reddit call-outs. Kills COD trust with a skeptical segment. | Honest, dated promotions only; or a real "envíos de esta tanda salen el viernes" if operationally true. Usually: none. |
| Fake live "stock: quedan 3" / fake "12 personas viendo esto ahora" | "Scarcity + social proof" | Same trust backfire. This buyer already distrusts online sellers; being caught faking = lost sale + bad word-of-mouth. | Real inventory count only if genuinely low; real recent-sales count if you have the data (Etapa 2). |
| Custom COD form / landing outside Shopify checkout | "Fewer fields, higher COD conversion", "dropshipping apps do it" | PROJECT.md explicit out-of-scope: forks the funnel, duplicates events, destroys CPA-efectivo measurement — the company's core metric. | COD as a manual payment method inside native Shopify checkout. WhatsApp confirmation happens *after* the order, in ops. |
| Dynamic checkout / "Comprar ahora" (Buy it Now) buttons on the PDP | "Express checkout lifts CVR" | Skips the cart and can bypass bundle logic; Shop Pay unavailable in AR anyway; for a COD-first audience it pushes the scarier online-pay path and adds a second competing CTA. | One CTA → cart drawer → one checkout. Disable dynamic checkout buttons in theme settings. |
| Heavy third-party bundle app (Rebuy, Bold, etc.) with its own cart rewrite | "Best-in-class bundle UX" | Injects render-blocking JS, breaks the LCP budget, can conflict with COD manual payment and with attribution/cart-sync in Etapa 2. | Native quantity breaks (single product, `quantity` line-item + compare-at math) or a small custom section. Decide in the bundle-mechanic spike. |
| Reviews app installed + fake/seeded reviews at launch | "Need social proof for day 1" | AR consumer-protection + platform risk; detected fake reviews destroy the exact trust you need for COD. | Etapa 1: placeholder section, or only real testimonials from lifestyle shoots / early buyers. Real reviews app in Etapa 2. |
| Exit-intent popup with an extra discount | "Recover abandoning visitors" | On mobile exit-intent is unreliable (no mouse); trains buyers to abandon for a coupon, erodes margin on a thin-margin COD product; adds JS. | A well-placed sticky ATC + a strong guarantee section does the recovery work. Reconsider only in Etapa 3 experiments. |
| Multi-step "quiz funnel" before the PDP | "Personalization increases conversion" | Adds friction between the ad click and the buy box for an impulse purchase; another funnel fork to measure. | The avatar system already personalizes by landing URL. Keep the "para quién es" self-select on-page and non-blocking. |
| Account creation / login prompts | "Build a customer database" | Friction for a one-time impulse COD buyer; Shopify already captures the order. | Guest checkout only. Email capture happens at checkout and via Etapa 2 flows. |
| Live chat widget (Intercom/Tidio/etc.) | "Answer objections in real time" | Heavy JS, needs staffing, competes with WhatsApp. | Single `wa.me` link/button + a thorough FAQ. |
| Carousel/slider as the hero (auto-rotating) | "Show multiple benefits" | Hurts LCP, low engagement on rotating heroes, CLS risk. | Static hero: one clip/poster + one claim + CTA. |
| Per-pair talle/color pickers inside the bundle | "Customers want different sizes per pair" | Multiplies form friction at the exact moment of decision; more variant SKUs; more checkout errors. | One talle/color per pack in v1; add a "¿necesitás talles distintos? escribinos por WhatsApp" note. Revisit post-validation. |
| Long medical/scientific copy with clinical claims, cited studies, "trata la insuficiencia venosa" | "Authority sells health products" | Meta crawls the LP during ad review; first-person "vos tenés várices" + medical-treatment claims = ad rejection or account risk. | Third-person, benefit/feel framing ("ayuda a que las piernas se sientan más livianas"), disclaimer, no diagnosis language. See Meta compliance section. |

---

## Multi-avatar system: swappable vs. fixed

**Architecture:** one product; one base product template; per-avatar **JSON templates** (`product.varices.json`, `product.embarazo.json`, …) that reference the same section types with different `settings` and `blocks`. Avatar-specific long content is best held in **metaobjects** (one "Avatar" entry per angle) so copywriters edit content without touching templates, and so the same avatar can feed multiple surfaces later. Each Meta ad set's link points to the matching template URL (`/products/kinelia?view=varices` or a dedicated handle).

### Must be SWAPPABLE per avatar

| Block | Content model per avatar | Complexity |
|---|---|---|
| Hero headline + subhead | `headline` (string), `subhead` (string) — mirror the winning creative's hook | S |
| Hero media | `hero_video` (file), `hero_poster` (image) — the angle's scene | S |
| Problem-agitation section | `agitation_title`, `agitation_body` (rich text), `agitation_image`; the recognizable daily scene | M |
| UMP intro paragraph (mechanism of the *problem*) | `ump_intro` (rich text) — why *this* avatar's legs feel this way | M |
| "Para quién es" emphasis | `primary_persona` (enum) — which tile is highlighted/first | S |
| Testimonials selection | `testimonial_ids` (list) — surface testimonials matching the avatar | M |
| Optional: USP emphasis line | `usp_angle` (string) — e.g. "sin apretar la panza" for embarazo | S |
| Optional: FAQ extra Q&A | `extra_faqs` (list) — angle-specific question (e.g. "¿puedo usarlas embarazada?") | S |
| SEO/meta title + OG image | per-template | S |

### Must be FIXED (shared, locked — edit once, applies everywhere)

- Buy box: bundle selector, price/anchor logic, variant picker, size guide, sticky ATC
- The offer: tiers (2/3/4), 90-day guarantee block, COD explanation, free-shipping rule
- UMS section (mechanism of the *solution*) — graduated compression works the same for everyone; only the UMP intro changes
- Comparison vs. media genérica (the USP table)
- How-to-use / care
- Trust row, payment reassurance, announcement bar
- Review wall (same source, Etapa 2)
- Core FAQ (COD, envíos, devoluciones, material)
- Risk reversal + final CTA
- Footer, legal links, WhatsApp
- All performance-critical loading behavior

**Rule of thumb:** if changing it per avatar could change the *price, the offer terms, or the checkout*, it's fixed. If it's *narrative* (who, why it hurts, who says it worked), it's swappable. Target: ~5–8 swappable blocks, everything else locked. A new avatar = duplicate JSON template + create one metaobject entry + point an ad set at it. No developer needed after the system exists.

---

## Trust / credibility for health-adjacent claims (Meta compliance)

Meta reviews the **destination URL**, not just the ad. On-page copy must satisfy the same Personal Attributes + health rules as the creative, or ads get rejected / the ad account gets flagged.

| Requirement | On-page implementation | Complexity |
|---|---|---|
| No implied knowledge of the viewer's condition ("vos tenés várices", "sabemos que sufrís de…") | Third-person / collective framing: "Muchas personas que pasan el día de pie sienten…", "Kinelia ayuda a que las piernas se sientan más livianas". Let the buyer self-identify via the "para quién es" grid. | S (copy discipline) |
| No medical-treatment / cure claims ("cura", "trata", "elimina las várices", "previene trombosis") | Benefit/sensation language only: "sensación de piernas más livianas", "menos hinchazón al final del día", "compresión graduada que acompaña la circulación". | S |
| No before/after implying a medical outcome | Frame visuals as comfort/feel, add "resultados según cada persona" caption. | S |
| Disclaimer present | Footer + near mechanism section: "Kinelia no es un producto médico ni reemplaza una consulta con un profesional. Ante síntomas persistentes, consultá a tu médico." | S |
| Claims match between ad and LP | Keep a shared approved-phrases list; the avatar template `headline`/`ump_intro` fields must be reviewed against it. | S (process) |
| Testimonials avoid absolute health claims | Curate/edit UGC captions: "mis piernas terminan el día menos cansadas" ✅ vs. "se me fueron las várices" ❌. | M |
| Third-party seals honesty | Only show certifications/guarantees you can substantiate (90-day guarantee = real policy; don't invent "aprobado por dermatólogos"). | S |

Confidence: MEDIUM-HIGH — Meta's public policy is explicit that landing pages are crawled and that "you"-as-diagnosis is the top rejection cause; exact enforcement varies.

---

## Argentina essentials (legal + trust)

| Item | Requirement | Complexity | Notes |
|---|---|---|---|
| **Botón de arrepentimiento** | Res. 424/2020: easy, direct link on the **home page**, prominent size/visibility, **no login or prior registration** required to use it, revocation within 10 días corridos from delivery, provider returns a código de revocación within 24 h. | S–M | Dedicated page + a persistent header/footer link labeled exactly "Botón de arrepentimiento". Form must not require account. |
| **Defensa del Consumidor / Ley 24.240** | Link to consumer-rights info + the official complaint channel (Ventanilla Única Federal / "Iniciá tu reclamo"). Display "Defensa de las y los Consumidores" link. | S | Footer link. |
| **Cambios y devoluciones** | Clear policy page: 10-día legal right + the 90-day satisfaction guarantee, how to start, who pays return shipping. | S | Distinct from botón de arrepentimiento but cross-linked. |
| **Datos de la empresa** | Razón social, CUIT, domicilio, email, teléfono/WhatsApp visible. | S | Footer + Contacto page. Needs the razón social data (user provides at launch). |
| **Términos y condiciones + Política de privacidad** | Standard. Privacy must cover data use, and (Etapa 2) pixel/analytics. | S | Templates adapted for AR. |
| **Precios en pesos, con impuestos incluidos, "precio final"** | Consumer-protection expectation; show total clearly. | S | Currency formatting in theme. |
| **Shipping expectations copy** | "Envíos a todo el país en 3–7 días hábiles" (adjust to carrier), cost by zone, COD availability by zone. | S | Must match the shipping-zone config used for COD manual payment. |
| **WhatsApp contact** | `wa.me` link, business number, response-hours note. | S | Also a COD trust signal, not just support. |
| **Contacto page** | Form or direct channels; no obligation to buy to contact. | S | |

Confidence: HIGH on botón de arrepentimiento (official text reviewed); MEDIUM on the exact set of footer links competitors use.

---

## Etapa 2 preview (named only — out of scope for v1)

Design v1 so these slot in without a redesign:

- **Meta Pixel + Conversions API (CAPI)** — server-side events; needs `theme.liquid` hook + checkout/thank-you events. Leave a documented insertion point.
- **GA4** — page + ecommerce events.
- **First-party attribution script (`kinelia-atribucion.js`) + cart sync** — `visitante_id` first-party cookie, UTM capture, cart line-item sync to the Supabase backend. PROJECT.md says: consider leaving only the `theme.liquid` hook if trivial.
- **Reviews import** — Judge.me or Loox; the review wall + buy-box rating slot are already in the DOM as placeholders.
- **Email flows** — welcome, abandoned cart (COD-aware: "confirmá tu pedido"), post-purchase (care tips, review request, reorder). Needs email capture at checkout + ESP.
- **CVR experiments / A/B testing** — Etapa 3; keep sections modular and independently toggleable so variants are cheap.

Dependency note: attribution + pixel must be in place **before** heavy A/B testing (Etapa 3) or results aren't trustworthy — mirrors the business's "measure first" doctrine.

---

## Feature Dependencies

```
Dawn base theme + performance budget
    └──enables──> all custom sections (must each stay within JS/LCP budget)

Bundle mechanic decision (spike)
    └──blocks──> Bundle selector UX
    └──blocks──> Price/anchor + "precio por par" math
    └──blocks──> Free-shipping threshold messaging
    └──blocks──> Final CTA buy-box recap

Product variant structure (talle × color)
    └──blocks──> Variant selector
    └──requires decision──> one selection per pack vs. per-pair (recommend: per pack)

Multi-avatar content model (JSON templates + metaobjects)
    └──blocks──> Ad-scent continuity per avatar
    └──blocks──> Swappable agitation / UMP / testimonials / hero
    └──requires──> 1 full avatar template + 1 clone (proof)

Approved-phrases list (Meta compliance)
    └──gates──> avatar headline / UMP copy review
    └──gates──> testimonial curation

Review wall + buy-box rating (placeholder DOM)
    └──enables (Etapa 2)──> reviews app import with no redesign

theme.liquid tracking hook
    └──enables (Etapa 2)──> Pixel/CAPI + attribution script + cart sync

MercadoPago production credentials + shipping-zone rules
    └──blocks──> hybrid checkout (online + COD manual payment)

Fake urgency/scarcity ──conflicts with──> COD trust / repeat purchase
Dynamic checkout buttons ──conflicts with──> single-funnel CPA measurement + bundle logic
Heavy bundle/review apps ──conflicts with──> LCP budget + Etapa 2 cart sync
```

---

## MVP Definition

### Launch With (Etapa 1 / v1)

- [ ] Video-first buy box: gallery, price+anchor, bundle selector (2/3/4, "más elegido", precio por par), talle×color variant picker, size-guide drawer, sticky mobile ATC, trust row, payment reassurance — *core of the whole project*
- [ ] Bundle mechanic implemented (native quantity breaks or minimal custom section — decided in spike) — *the offer*
- [ ] Advertorial body: problem-agitation, UMP→UMS mechanism with static diagram, before/after, testimonials/UGC carousel (seeded real), "para quién es" grid, how-to-use, comparison-vs-genérica USP, review-wall placeholder, FAQ, 90-day guarantee, risk reversal, final CTA — *ad-scent + persuasion*
- [ ] Multi-avatar template system + 1 full avatar + 1 clone — *the moat, and a PROJECT.md requirement*
- [ ] Hybrid checkout: native Shopify + MercadoPago + COD as manual payment, shipping-zone rules — *funnel integrity*
- [ ] Cart drawer, announcement bar, honest free-shipping threshold, WhatsApp button
- [ ] Meta-compliant copy (third-person, no medical claims) + disclaimer
- [ ] AR legal: botón de arrepentimiento, defensa del consumidor, cambios y devoluciones, datos de empresa, T&C, privacidad, contacto/WhatsApp, ARS pricing
- [ ] Home resolved (redirect or featured-avatar landing)
- [ ] Performance budget met (LCP < 2.5s mobile), brand identity applied
- [ ] `theme.liquid` tracking hook left in place (empty, documented)

### Add After Validation (Etapa 2)

- [ ] Meta Pixel + CAPI, GA4 — *once a winning avatar exists and spend scales*
- [ ] First-party attribution script + cart sync — *when connecting to the Supabase backend*
- [ ] Reviews app (Judge.me/Loox) + import into the existing review-wall/rating slots
- [ ] Email flows: welcome, COD-aware abandoned cart, post-purchase
- [ ] Compression size-finder widget (upgrade from static drawer) — *if returns from wrong sizing show up*
- [ ] Real recent-sales / low-stock signals — *only when backed by real data*

### Future Consideration (Etapa 3+)

- [ ] A/B testing framework and structured CVR experiments — *after tracking + attribution are trustworthy*
- [ ] Per-pair talle/color selection — *only if WhatsApp requests prove demand*
- [ ] 2nd and 3rd product lines using the same theme structure — *multi-product is designed-in from day 1, activated later*
- [ ] Exit-intent / on-site retargeting — *only if experiments justify the JS cost*

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---|---|---|---|
| Video-first buy box + sticky mobile ATC | HIGH | MEDIUM | P1 |
| Bundle selector UX (tiers, "más elegido", precio por par) | HIGH | MEDIUM–HIGH | P1 |
| Bundle mechanic decision + implementation | HIGH | MEDIUM–HIGH | P1 |
| Talle×color variant picker + size guide | HIGH | MEDIUM | P1 |
| Payment reassurance + COD explanation | HIGH | LOW | P1 |
| UMP→UMS mechanism section (static visual) | HIGH | MEDIUM | P1 |
| Multi-avatar template system + 1 avatar + 1 clone | HIGH | HIGH | P1 |
| Hybrid checkout (MercadoPago + COD manual) | HIGH | MEDIUM–HIGH | P1 |
| Meta-compliant copy + disclaimer | HIGH (ad approval) | LOW | P1 |
| AR legal pages (botón de arrepentimiento etc.) | MEDIUM (legal req) | LOW–MEDIUM | P1 |
| Testimonials/UGC carousel | HIGH | MEDIUM | P1 |
| FAQ + 90-day guarantee + risk reversal | HIGH | LOW–MEDIUM | P1 |
| Comparison vs. genérica (USP) | MEDIUM–HIGH | LOW–MEDIUM | P1 |
| "Para quién es" self-select grid | MEDIUM (+compliance) | LOW–MEDIUM | P1 |
| Cart drawer + quick add | MEDIUM | MEDIUM | P1 |
| Honest free-shipping threshold bar | MEDIUM | LOW–MEDIUM | P2 |
| WhatsApp floating button | MEDIUM | LOW | P1 |
| Review-wall placeholder (Etapa 2-ready) | MEDIUM | LOW | P1 |
| Compression size-finder widget | MEDIUM | MEDIUM | P2 |
| Pixel/CAPI, GA4, attribution script | HIGH (for the business) | MEDIUM | P2 (Etapa 2) |
| Reviews app + import | MEDIUM–HIGH | MEDIUM | P2 (Etapa 2) |
| Email flows | MEDIUM–HIGH | MEDIUM | P2 (Etapa 2) |
| Fake urgency/scarcity | NEGATIVE | LOW | Never |
| Custom COD form outside checkout | NEGATIVE | MEDIUM | Never |
| Dynamic checkout / Buy-it-Now buttons | NEGATIVE (here) | LOW | Never (disable) |
| A/B testing framework | HIGH (later) | HIGH | P3 (Etapa 3) |

---

## Competitor Feature Analysis

Direct model: **SereniVida / EcommPath** (calcetines de compresión, same offer, CO/MX/AR). Category peers: LatAm compression-sock DTC stores and dropshipping COD stores; health/wellness advertorial DTC (US) for structure.

| Feature | SereniVida-style operators | Generic LatAm COD dropshippers | Kinelia approach |
|---|---|---|---|
| Landing format | Advertorial / VSL-style page per angle, message-matched to creative | One generic PDP for all ads; often a themed template | Advertorial PDP with per-avatar swappable narrative blocks |
| Bundle | 2+1 / 3+2 / 4+3, standardized, default = middle tier | Quantity breaks via app, often cluttered | Native quantity breaks, middle tier pre-selected, precio-por-par shown |
| Checkout | Native + COD; WhatsApp confirmation in ops | Custom COD form (name/phone/address) outside checkout | Native Shopify + COD manual payment — single funnel (deliberate divergence for CPA measurement) |
| Mechanism explainer | Pseudo-medical animation in the creative; echoed on page | Usually absent | Static labelled UMP→UMS diagram on page, reused across avatars |
| Social proof | Review app + UGC | Often fake counters/timers | Real testimonials v1; reviews app v2; no fake counters |
| Urgency | Mostly honest offer framing; some use timers | Heavy fake timers/stock counters | None fake; honest offer + guarantee do the work |
| Multi-angle scaling | Re-shoot creative per avatar; landing sometimes generic | One page | JSON template system → clone a landing per avatar in minutes |
| Compliance | Third-person, no medical claims (Meta health) | Frequently non-compliant, account bans | Approved-phrases list gating avatar copy |
| Performance | Variable; page builders can be heavy | Often slow, app-heavy | Dawn + minimal JS, LCP < 2.5s as a hard budget |

---

## Sources

- Business docs (HIGH): `Mecanismo_y_Palancas_Facu.md`, `SereniVida_Playbook_Marketing.md`, `Estudio_Mercado_Dolor_LatAm.md`, `.planning/PROJECT.md`
- Meta health-ad / personal-attributes / landing-page crawl:
  - https://www.accelerateddigitalmedia.com/insights/guide-to-social-media-health-ad-restrictions-2026/
  - https://transparency.meta.com/policies/ad-standards/objectionable-content/privacy-violations-personal-attributes/
  - https://www.stackmatix.com/blog/meta-ads-personal-attributes-policy
  - https://www.zappush.com/blog/meta-personal-attributes-policy-health-wellness-ads
- Argentina botón de arrepentimiento / Res. 424/2020:
  - https://www.argentina.gob.ar/normativa/nacional/resoluci%C3%B3n-424-2020-342869/texto
  - https://www.argentina.gob.ar/justicia/derechofacil/leysimple/boton-arrepentimiento
  - https://www.boletinoficial.gob.ar/detalleAviso/primera/235729/20201005
- Bundle selector / quantity-break CVR:
  - https://forgedigitalmarketing.com/the-anatomy-of-a-high-converting-product-page-for-health-and-wellness-dtc-brands/
  - https://www.contentgrip.com/product-bundling-strategies/
  - https://adoric.com/blog/how_to_design_bundle_offers_customers_actually_want/
- Advertorial LP structure:
  - https://yournextlandingpage.com/blog/product-landing-page-examples-dtc
  - https://splitbase.com/blog/landing-page-types
  - https://causeperclick.com/landing-page-best-practices-dtc-health-and-wellness-brands/
- Fake scarcity / countdown-timer backfire:
  - https://www.growthsuite.net/resources/shopify-discount/scarcity-marketing-time-limited-discounts
  - https://cleancommit.io/blog/do-countdown-timers-work/
  - https://uxpsychology.substack.com/p/the-use-of-scarcity-cues-in-e-commerce
- COD LatAm / WhatsApp confirmation:
  - https://ecomlucra.com/blog/que-es-pago-contra-entrega-cod
  - https://help.envia.com/en/confirmation-cod/
  - https://www.andreybusiness.com/mexico/blog/pago-contra-entrega-como-explicarlo-a-tus-clientes

---
*Feature research for: conversion-optimized advertorial Shopify PDP/landing — compression socks, Argentina, COD, multi-avatar*
*Researched: 2026-09-07*
