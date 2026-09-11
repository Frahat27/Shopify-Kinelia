---
phase: 03-layout-shell-seams-de-etapa-2
verified: 2026-09-11T00:00:00Z
status: human_needed
score: 27/27 must-have truths verified (code-level)
behavior_unverified: 0
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Ver-fuente / DevTools en `shopify theme dev`: confirmar que la declaración de charset está en el primer bloque del `<head>` y que `snippets/analytics-hooks.liquid` no contribuye ningún markup visible."
    expected: "El charset aparece antes de cualquier byte del bloque de tokens inline; el seam es invisible en el DOM renderizado."
    why_human: "Requiere un servidor de tema corriendo y ver-fuente en el navegador; no reproducible desde grep estático (aunque la posición en la plantilla ya está probada por harness)."
  - test: "Consola del navegador: leer `Kinelia.events.NAMES`, suscribirse con `Kinelia.events.on` y con `document.addEventListener` al mismo nombre, emitir, confirmar que ambos disparan, desuscribir con `off` y volver a emitir."
    expected: "Ambos handlers reciben el mismo payload; tras `off` el primero deja de recibir."
    why_human: "Deferred to end-of-phase per `human_verify_mode: end-of-phase`; el equivalente Node/vm ya corrió en esta verificación con resultado verde (ver Behavioral Spot-Checks), pero el plan pide también la confirmación en un navegador real."
  - test: "Con teclado: Tab desde una carga en frío y confirmar que el skip link es la primera parada visible; activarlo mueve el foco a `#MainContent`. Con un lector de pantalla activo, ejecutar `Kinelia.a11y.announce(...)` dos veces con el mismo mensaje desde la consola y confirmar que se escucha ambas veces."
    expected: "El skip link es focoable y funcional; el mensaje repetido se anuncia dos veces."
    why_human: "El comportamiento de un lector de pantalla real y el repintado del navegador no son observables por harness; la secuencia clear→reflow→write ya se probó con un harness Node (verde) en esta verificación."
  - test: "Abrir `ETAPA-2-SEAMS.md` junto a `../../Kinelia/web/kinelia-atribucion.js` y confirmar que alguien sin acceso al repo hermano podría implementar la escritura del cart attribute y el POST de eventos correctamente, incluyendo first-touch y vida de la cookie."
    expected: "El documento es autosuficiente como especificación de implementación."
    why_human: "Juicio de completitud editorial de un documento de contrato, no verificable por grep."
  - test: "En una pull request real, confirmar que el check 'Theme Check' corre en el runner de CI, que `check-seams.mjs` aparece en su log, y que 'Theme Check' sigue siendo el required status check en las ramas protegidas."
    expected: "El job requerido corre los cuatro checkers Node y sigue gateando `main`/`staging`."
    why_human: "Requiere un PR real contra GitHub Actions; no reproducible en este sandbox sin red hacia `raw.githubusercontent.com` (gap de entorno ya documentado)."
  - test: "En el tema en ejecución, confirmar que la pestaña del navegador muestra la marca Kinelia (no un globo genérico) y abrir ambos SVG vendorizados para confirmar que el optimizador manual no deformó el arte."
    expected: "El favicon muestra el isotipo; ambos logos se ven correctos."
    why_human: "Verificación visual del render del navegador y del arte vectorial; el harness solo confirma bytes/estructura (viewBox, sin fill duplicado, más chico que la fuente)."
  - test: "En el editor de temas, confirmar que la franja de anuncio se puede agregar/reordenar/quitar, que el campo de override vacío muestra el default en español, y que configurar el link vuelve el mensaje clickeable. En viewport de teléfono, confirmar que la franja y el header quedan pinned como un solo bloque sin salto ni superposición, y medir CLS en el panel de performance."
    expected: "La sección es editable como cualquier otra; el bloque pinned no genera layout shift medible por encima del presupuesto."
    why_human: "Comportamiento del editor de temas y medición de Cumulative Layout Shift real; corresponde también a la Fase 13 para el número final."
  - test: "En viewport de teléfono, confirmar que con el menú vacío el header muestra solo la marca, la cuenta y el carrito (sin hueco visible), y que el resultado visual no compite con el buy box."
    expected: "Header minimalista sin huecos ni afordancias extra."
    why_human: "Juicio visual/UX; el harness solo prueba la guarda `menu.links.size > 0` y la ausencia de afordancias en el markup."
  - test: "En el editor de temas STAGING, confirmar que el grupo de WhatsApp aparece con el campo de número y su nota de formato en español, que el switch de newsletter está presente y apagado, que con el número vacío no se muestra ningún link de WhatsApp, y que al completarlo el link abre la conversación correcta."
    expected: "El comportamiento del editor coincide con lo documentado en el runbook."
    why_human: "Requiere el editor de temas real; el harness ya prueba la guarda de blank, el tipo de setting y la ausencia de default."
  - test: "En viewport de teléfono, confirmar que el botón flotante de WhatsApp se ve en la esquina sin sombra ni animación, que su color lee como el verde de Kinelia (no el de WhatsApp), y que agregar la clase `has-sticky-atc` al body en el inspector lo oculta."
    expected: "El FAB respeta el sistema visual plano y cede correctamente cuando se simula la clase de la Fase 6."
    why_human: "Juicio visual de color/marca; el harness ya prueba la ausencia de `box-shadow`/`animation`/color literal y la presencia de la regla `has-sticky-atc`."
  - test: "Ejecutar `docs/RUNBOOK-STAGING.md` contra el tema `Kinelia — STAGING`: crear las cinco páginas stub, construir el menú del footer, cargar el número de WhatsApp. Luego cargar el preview de staging y hacer click en cada link del footer (ninguno debe dar 404), confirmar que el link de WhatsApp y el botón flotante abren una conversación con el número correcto, y que no se ve ni el bloque de newsletter ni la fila de íconos de pago."
    expected: "Cada link legal resuelve a una página real; ambas afordancias de WhatsApp funcionan; newsletter y pagos permanecen colapsados."
    why_human: "Este es el gate de fase explícito para SHELL-02 (`03-04-PLAN.md` Task 3): requiere ejecutar pasos de administración en Shopify (crear páginas, armar un menú, cargar un valor de setting) que el código no puede realizar por sí mismo. `docs/RUNBOOK-STAGING.md` existe con los cinco slugs exactos y todavía registra la decisión de Defensa del Consumidor como `_(pendiente)_` — no hay evidencia en el repo de que el runbook ya se haya ejecutado en STAGING."
---

# Phase 3: Layout shell + seams de Etapa 2 — Verification Report

**Phase Goal:** El shell del documento, el header/footer minimos y todos los hooks no-op de Etapa 2 existen como ~1 linea cada uno, para que la medicion diferida se conecte sin refactor.
**Verified:** 2026-09-11
**Status:** human_needed
**Re-verification:** No — initial verification.

## Goal Achievement

All four roadmap Success Criteria for Phase 3 map 1:1 to SHELL-01..04, and all four are
implemented, wired, and passing automated verification at the code level. What remains
open is exclusively the class of check the phase's own plans deliberately deferred to a
human — visual rendering, browser/editor behavior, and the STAGING runbook execution —
per `human_verify_mode: end-of-phase` in `.planning/config.json`. No code-level gap was
found.

### Observable Truths (roadmap Success Criteria)

| # | Truth (ROADMAP SC) | Status | Evidence |
|---|---|---|---|
| 1 | `theme.liquid` renders the shell with `css-variables.liquid` and `analytics-hooks.liquid` (no-op Etapa-2 seam) | ✓ VERIFIED | `layout/theme.liquid` renders `{% render 'css-variables' %}` then, later in `<head>`, `{% render 'analytics-hooks' %}` between `meta-tags` and `content_for_header`. `snippets/analytics-hooks.liquid` read in full: 100% Liquid comment, zero markup outside comments, attribution `<script>` line itself commented with `<proyecto>` placeholder. |
| 2 | Header is minimal, footer has AR legal links, WhatsApp affordance and a disabled newsletter block | ✓ VERIFIED (code) / see human items | `sections/header.liquid` — brand mark, cart, conditional account, menu guarded by `links.size`, no search/extra icons. `sections/footer.liquid` — legal `link_list` guarded by size (no hardcoded target), WhatsApp link + floating button reading `settings.whatsapp_number` (normalized+escaped), `show_newsletter` checkbox defaults `false`, starter payment block untouched. Actual population of the legal menu and WhatsApp number is an admin/STAGING step documented in `docs/RUNBOOK-STAGING.md` — not yet evidenced as executed (see human_verification). |
| 3 | A DOM event bus exists (`variant:changed`, `product:added`, `cart:updated`) ready for the sticky ATC and Etapa 2 | ✓ VERIFIED | `assets/events.js` exposes `window.Kinelia.events` (`emit`/`on`/`off`/`NAMES`) over `CustomEvent`+`document`. Re-ran the bus harness live in this verification (Node `vm`): a consumer via `Kinelia.events.on` and one via `document.addEventListener` both received the same emitted payload; `off` correctly detached. `NAMES` holds exactly the 5 confirmed names. Nobody emits in this phase (`grep` for `emit(` outside the function definition and a doc comment returns nothing). |
| 4 | `ETAPA-2-SEAMS.md` documents the cart-attribute contract (`visitante_id`, `utm_*`, `view`) and the event contract | ✓ VERIFIED | `ETAPA-2-SEAMS.md` (10,506 chars) transcribes all 7 cart attributes, 8 `/collect` event types, 5 bus events with payload shapes, read-modify-write rule, offer hook, payload-safety (PII) rule, and cites both sibling files with a read date. `scripts/check-seams.mjs` is its executable copy: reads `NAMES` out of `assets/events.js` (never a hand copy) and fails on any drift. Ran live: `node scripts/check-seams.mjs` → exit 0. |

**Score:** 4/4 roadmap Success Criteria verified at the code level (0 present-but-behavior-unverified in the Step-3 sense — the bus and announce behaviors were exercised, not just inspected).

### Plan-Level Must-Haves (`must_haves.truths`, merged across 03-01..03-04)

All 27 truths declared across the four plans' frontmatter were checked. All resolve to
✓ VERIFIED at the code/artifact level (several additionally carry `human_judgment: true`
in the plans' own coverage — those are listed under Human Verification below, per the
plans' explicit `human-check` blocks). None resolved to FAILED. Representative sample
(full detail lives in the four `03-0N-SUMMARY.md` `coverage:` blocks, cross-checked
against the live tree in this verification):

| # | Truth | Status | Evidence |
|---|---|---|---|
| 1 | Seam connects without a `<head>` refactor, mounted where the attribution script needs it | ✓ VERIFIED | `analytics-hooks` rendered between `meta-tags` and `content_for_header` in `layout/theme.liquid`. |
| 2 | Seam ships zero bytes today | ✓ VERIFIED | Snippet body is 100% Liquid comment; no markup, no request. |
| 3 | Single internal event API reachable via wrapper and plain `document` listener | ✓ VERIFIED (behavioral) | Re-ran the bus harness live — both paths received the identical payload. |
| 4 | Five published event names discoverable at runtime | ✓ VERIFIED | `Kinelia.events.NAMES` = exactly `variant:changed, product:added, cart:updated, cart:loading, cart:error`. |
| 5 | Nobody emits an event in this phase | ✓ VERIFIED | `grep "emit("` across `assets/`, `sections/`, `snippets/` finds only the function definition and a doc-comment reference. |
| 6 | Charset in the first bytes of the head, not after the inline token block | ✓ VERIFIED | `layout/theme.liquid` lines 13-18: three `<meta>` tags precede `{% render 'css-variables' %}`. `snippets/meta-tags.liquid` no longer emits charset/viewport (confirmed by grep). |
| 7 | JS enters only via an explicit named allowlist | ✓ VERIFIED | `scripts/check-allowlist.mjs` exports `JS_ASSET_ALLOWLIST = new Set(["events.js"])`; ran live, exit 0, reports "1 JS, todos en JS_ASSET_ALLOWLIST". |
| 8 | Skip link, real `<main>` landmark, polite live region on every page; re-announce identical message twice | ✓ VERIFIED (behavioral) | Markup present in `layout/theme.liquid`; re-ran the announce harness live — `textContent` writes were `['', msg, '', msg]`, confirming the clear→reflow→write sequence fires on a repeated identical message. |
| 9 | Password layout got the same charset fix | ✓ VERIFIED | `layout/password.liquid` lines 9-11: same three `<meta>` tags before the token render; no header/footer/seam/bus added. |
| 10 | No starter file deleted; every divergence recorded | ✓ VERIFIED | `git status --porcelain` clean; `OVERRIDES.md` carries the Phase 3 divergence subsections (head reorder, first JS asset, stacking-order deviation). |
| 11 | Contract exists as the theme's own spec, not a pointer | ✓ VERIFIED | `ETAPA-2-SEAMS.md` is a full transcription with sibling files cited only as origin. |
| 12 | Executable contract fails on drift | ✓ VERIFIED | `scripts/check-seams.mjs` reads `NAMES` from `assets/events.js`; ran clean (exit 0) against the current tree. |
| 13 | Contract check runs in local lint chain and required CI gate | ✓ VERIFIED | `package.json` `lint` script and `.github/workflows/ci.yml`'s "Theme Check (gate)" step both invoke `node scripts/check-seams.mjs`; job name `Theme Check` unchanged. |
| 14 | Brand mark in header instead of shop-name text; tab carries the brand icon | ✓ VERIFIED | `sections/header.liquid` inlines `kinelia_horizontal.svg` via `inline_asset_content`; `layout/theme.liquid` declares `<link rel="icon" ... kinelia_isotipo.svg ...>`. |
| 15 | Header does exactly three things (brand, cart, account) | ✓ VERIFIED | No search field, no extra icons, no listener/script in `sections/header.liquid` markup (confirmed by direct read). |
| 16 | Empty menu takes no space | ✓ VERIFIED | `{% if section.settings.menu.links.size > 0 %}` guards the menu container; `menu` setting ships no default. |
| 17 | Announcement strip + compact header pinned together on phones, height reserved before paint | ✓ VERIFIED | Both `sections/announcement-bar.liquid` and `sections/header.liquid` use `position: sticky` (never `fixed`) inside a `max-width` media query, offset/leveled by shared `--announcement-bar-height` / `--z-sticky-header` tokens in `snippets/css-variables.liquid`. |
| 18 | Announcement strip is its own editable, static, non-dismissible section | ✓ VERIFIED | `sections/announcement-bar.liquid` has its own `{% schema %}`, is mounted first in `sections/header-group.json`, ships no script/localStorage. |
| 19 | Announcement copy states only facts, no manufactured urgency | ✓ VERIFIED (content, judgment-adjacent) | `locales/es.default.json` message = "Envío a todo el país. Garantía de 90 días." — two verifiable facts, no counter/stock/discount language. |
| 20 | Shell stacking order written as named tokens | ✓ VERIFIED | `snippets/css-variables.liquid` defines `--z-sticky-header` (10) `< --z-fab` (20) `< --z-overlay` (30) with the reasoning in a comment. |
| 21 | Cart count stays server-rendered, no JS recalculation this phase | ✓ VERIFIED | `sections/header.liquid` uses `cart.item_count` directly; no `addEventListener`/`Kinelia.events.on` in the section. |
| 22 | Both brand marks optimized before vendoring (no duplicated attributes) | ✓ VERIFIED | `grep -o 'fill="[^"]*"'` on both SVGs shows no element with a duplicated `fill`; both measured smaller than their source per 03-03-SUMMARY. |
| 23 | Starter's account component and cart counter kept | ✓ VERIFIED | `shop.customer_accounts_enabled` guard + `<shopify-account>` + `icon-account.svg`, and `routes.cart_url` + `icon-cart.svg`, all present unchanged. |
| 24 | Every footer legal link resolves to a real page — no bare fragment, no hardcoded target | ✓ VERIFIED (code) / staging execution unconfirmed | No `href="#"` or `href="/pages/..."` literal in `sections/footer.liquid`; menu guarded by size. Actual page/menu creation is the STAGING runbook step — see human_verification. |
| 25 | WhatsApp reachable from footer and a floating button, both reading one theme setting | ✓ VERIFIED | Two occurrences of `wa.me/{{ wa_number }}`, two of `kinelia.cta.pedir_whatsapp`, two of `rel="noopener noreferrer"` in `sections/footer.liquid`. |
| 26 | WhatsApp number is a theme setting, never compiled into the template | ✓ VERIFIED | `config/settings_schema.json` — `whatsapp_number`, type `text`, no default, `info` key present; used only inside `href`s, never inside `{% stylesheet %}` (confirmed by direct read — matches the WR-01 fix). |
| 27 | Newsletter block exists behind a switch that ships off | ✓ VERIFIED | `sections/footer.liquid` schema `show_newsletter` checkbox `default: false`; block renders nothing when off. |

**Score:** 27/27 must-have truths verified at the code/artifact level.

### Required Artifacts

| Artifact | Expected | Status | Details |
|---|---|---|---|
| `snippets/analytics-hooks.liquid` | No-op Etapa-2 seam, contract comment | ✓ VERIFIED | Exists, 100% comment, names `ETAPA-2-SEAMS.md`, placeholder `<proyecto>` host. |
| `assets/events.js` | DOM event bus + a11y helper | ✓ VERIFIED | Exists; `window.Kinelia.events`/`window.Kinelia.a11y` confirmed live via harness. |
| `layout/theme.liquid` | Reordered head, seam mount, bus, landmarks | ✓ VERIFIED | Confirmed by direct read (charset order, seam position, script tag `defer`, skip link, main, live region). |
| `scripts/check-allowlist.mjs` | JS allowlist + render surface checker | ✓ VERIFIED | `JS_ASSET_ALLOWLIST` exported, includes `events.js` and later `announcement-bar` section type; ran exit 0. |
| `ETAPA-2-SEAMS.md` | Theme's own measurement contract | ✓ VERIFIED | 10,506 chars, all tokens in code-format present. |
| `scripts/check-seams.mjs` | Executable copy of the contract | ✓ VERIFIED | Ran exit 0; reads `NAMES` from `assets/events.js` (grep-confirmed, not a hand copy). |
| `package.json` / `.github/workflows/ci.yml` | Seams checker in lint chain and required CI gate | ✓ VERIFIED | Both confirmed by direct read; job name `Theme Check` unchanged. |
| `.planning/phases/03-layout-shell-seams-de-etapa-2/COVERAGE.md` | No-external-API declaration with evidence | ✓ VERIFIED | Present, verbatim declaration + checkable evidence bullets. |
| `assets/kinelia_horizontal.svg`, `assets/kinelia_isotipo.svg` | Vendored brand marks | ✓ VERIFIED | Both exist, valid SVG with `viewBox`; horizontal uses `currentColor` (post CR-01 fix); isotipo keeps literal `#0F6E56` (documented, non-restricted, IN-01 backlog). |
| `sections/announcement-bar.liquid`, `sections/header.liquid`, `sections/header-group.json` | Announcement strip + rebuilt header | ✓ VERIFIED | Confirmed by direct read; mounted in correct order. |
| `sections/footer.liquid`, `config/settings_schema.json`, `assets/icon-whatsapp.svg`, `docs/RUNBOOK-STAGING.md` | Footer + WhatsApp + runbook | ✓ VERIFIED | Confirmed by direct read; runbook names all 5 slugs, the setting, STAGING scope, Phase 11 ownership, open Defensa-del-Consumidor decision. |

### Key Link Verification

| From | To | Via | Status |
|---|---|---|---|
| `layout/theme.liquid` | `snippets/analytics-hooks.liquid` | `{% render 'analytics-hooks' %}` between meta-tags and `content_for_header` | ✓ WIRED |
| `layout/theme.liquid` | `assets/events.js` | `<script src="{{ 'events.js' | asset_url }}" defer>` | ✓ WIRED |
| `assets/events.js` | `layout/theme.liquid` | `announce()` looks up `#a11y-live-region`, which the shell renders | ✓ WIRED |
| `scripts/check-allowlist.mjs` | `assets/events.js` | `JS_ASSET_ALLOWLIST` names `events.js` | ✓ WIRED |
| `scripts/check-seams.mjs` | `assets/events.js` | Parses `NAMES` array at runtime, no hand copy | ✓ WIRED |
| `scripts/check-seams.mjs` | `ETAPA-2-SEAMS.md` | Every contract token asserted present in code-format | ✓ WIRED |
| `package.json` / `ci.yml` | `scripts/check-seams.mjs` | Both invoke it in the same place as the other three checkers | ✓ WIRED |
| `sections/header-group.json` | `sections/announcement-bar.liquid` | Mounted first in `order` | ✓ WIRED |
| `sections/header.liquid` | `assets/kinelia_horizontal.svg` | `inline_asset_content` | ✓ WIRED |
| `sections/header.liquid`/`announcement-bar.liquid` | `snippets/css-variables.liquid` | Shared `--z-sticky-header`/`--announcement-bar-height` tokens | ✓ WIRED |
| `sections/footer.liquid` | `config/settings_schema.json` | `settings.whatsapp_number` read in both `href`s | ✓ WIRED |
| `docs/RUNBOOK-STAGING.md` | `sections/footer.liquid` | Runbook's menu step is what populates the guarded link list | ✓ WIRED (documented; execution unconfirmed) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|---|---|---|---|
| All 4 Node checkers pass on the live tree | `node scripts/check-allowlist.mjs && node scripts/check-secrets.mjs && node scripts/check-tokens.mjs && node scripts/check-seams.mjs` | All 4 exit 0 | ✓ PASS |
| Event bus: wrapper and plain listener receive the same payload; `off` detaches | Node `vm` harness (re-run in this verification, not reused from SUMMARY) | `bus harness OK`, `NAMES` = 5 confirmed names | ✓ PASS |
| Announce helper re-announces an identical consecutive message | Node `vm` harness (re-run in this verification) | `writes = ['', msg, '', msg]` | ✓ PASS |
| `header-group.json` JSON validity | `node -e "JSON.parse(...)"` | Fails on raw `JSON.parse` (leading `/* */` comment + trailing comma) | ℹ️ INFO — not a regression; this is the pre-existing Shopify-generated format from Phase 1 (`git log` shows the comment/trailing-comma present since the file's creation at commit `56cd221`, Sep 7). Shopify's own section-group JSON tooling tolerates this; the project's own checkers (`check-allowlist.mjs`) strip comments/trailing commas before parsing. Not a Phase 3 defect. |
| Nobody emits a bus event yet | `grep -rn "emit(" assets/ sections/ snippets/` | Only the function definition and a doc-comment reference | ✓ PASS |

### Probe Execution

No `scripts/*/tests/probe-*.sh` convention exists in this project and no plan declares one. N/A — skipped.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|---|---|---|---|---|
| SHELL-01 | 03-01 | Shell renders `css-variables` + no-op `analytics-hooks` seam | ✓ SATISFIED | Verified above. |
| SHELL-02 | 03-01 (favicon), 03-03, 03-04 | Minimal header, footer with AR legal links / WhatsApp / disabled newsletter | ✓ SATISFIED (code) — content population is a human/STAGING step, see human_verification | All code-level artifacts and guards verified; `docs/RUNBOOK-STAGING.md` exists but its checklist item on the Defensa-del-Consumidor decision is still marked `_(pendiente)_`, and there is no repository evidence the runbook has been executed in STAGING. |
| SHELL-03 | 03-01, 03-02 | DOM event bus with 5 names, ready for the sticky ATC and Etapa 2 | ✓ SATISFIED | Verified above; bus behavior re-tested live. |
| SHELL-04 | 03-02 | `ETAPA-2-SEAMS.md` documents cart attributes + funnel events | ✓ SATISFIED | Verified above; executable check re-run live. |

All four requirement IDs the phase declares (SHELL-01..04) are accounted for in the plans'
frontmatter and in `.planning/REQUIREMENTS.md`'s traceability table (all four rows marked
"Complete"). No orphaned requirements found for Phase 3.

### Anti-Patterns Found

No `TBD`/`FIXME`/`XXX`/unresolved `TODO`/`HACK` markers found in any file this phase
touched (`grep` across `layout/`, `assets/events.js`, `snippets/analytics-hooks.liquid`,
`sections/header.liquid`, `sections/footer.liquid`, `sections/announcement-bar.liquid`,
`scripts/check-seams.mjs`, `scripts/check-allowlist.mjs`, `ETAPA-2-SEAMS.md` returned
nothing). The word "placeholder" appears three times in `ETAPA-2-SEAMS.md` and once as an
HTML `placeholder=` attribute in the newsletter form — all legitimate, documented uses
(the seam's angle-bracket project placeholder, an HTML input hint), not stub markers.

`03-REVIEW.md` found 1 critical (CR-01: two brand SVGs hardcoded literal colors,
including the restricted `--color-accent` hex) and 2 warnings (WR-01: unescaped/
unnormalized WhatsApp number in two `href`s; WR-02: `engines.node` unenforced in CI).
`03-REVIEW-FIX.md` and the live tree confirm all three are fixed: `kinelia_horizontal.svg`
now uses `fill="currentColor"` with `.header__logo-link { color: var(--color-primary) }`;
`sections/footer.liquid` normalizes+escapes `whatsapp_number` into `wa_number` before
both `href`s; `.github/workflows/ci.yml` now runs `actions/setup-node@v4` with
`node-version-file: package.json`. `kinelia_isotipo.svg` was deliberately left with a
literal `#0F6E56` fill (the favicon is loaded via `<link rel="icon">`, not inlined, so it
has no page CSS context for `currentColor` to resolve against) — this is `--color-primary`'s
default, not the restricted accent, and is correctly tracked as the lower-severity IN-01
backlog item rather than re-opened as a blocker. The 6 Info findings (IN-01..IN-06) were
explicitly out of the fix pass's scope and none of them contradicts a Phase 3 must-have:
IN-01 (SVG token-checker coverage) is a future-phase backlog note; IN-02 (CSS spacing nit)
is cosmetic; IN-03 (checker order local vs CI) is functionally harmless; IN-04 (duplicated
`href` construction) is a DRY nit on code already covered by WR-01's fix; IN-05
(`pull-requests: write` scope) and IN-06 (cart `aria-label` omits the item count) are both
pre-existing/out-of-phase-scope observations, not new Phase 3 defects.

No debt-marker gate violation. No blocker anti-pattern found.

### Environment Gap (carried forward, not re-flagged)

`shopify theme check` cannot run in this sandbox (no network to fetch Theme Check's remote
schema docs, no `shopify` CLI installed) — documented in `.planning/WINDOWS.md` #9 and
carried through all four plans' SUMMARYs and both review documents. The substitute
verification surface (the four Node checkers plus each task's inline `<verify>`
assertions, re-run live in this verification) is green. This is a pre-existing,
already-tracked environment limitation, not a Phase 3 code defect, and does not change
this report's status.

## Human Verification Required

See the `human_verification` list in the frontmatter (11 items). These fall into four
groups, all explicitly deferred by the phase's own plans per `human_verify_mode:
end-of-phase` (`.planning/config.json`):

1. **Browser/DevTools checks** on the running dev theme (charset position, seam
   invisibility, bus console test, skip-link/live-region behavior, favicon/logo
   rendering, phone-viewport pinning and CLS).
2. **Theme-editor checks** (announcement strip add/reorder/remove, WhatsApp settings
   group, newsletter switch, FAB color/animation, empty-menu layout).
3. **Document-completeness judgment** on `ETAPA-2-SEAMS.md` (can a measurement team
   implement against it without the sibling repo).
4. **The Phase 3 gate item** — executing `docs/RUNBOOK-STAGING.md` against
   `Kinelia — STAGING`: creating the five stub pages, building the footer menu, loading
   the WhatsApp number, then confirming every footer link resolves (no 404) and both
   WhatsApp affordances open a real conversation. This is the explicit phase gate for
   SHELL-02 named in `03-04-PLAN.md` Task 3, and there is no evidence in the repository
   that it has run yet (the runbook's own Defensa-del-Consumidor decision checkbox is
   still `_(pendiente)_`).

None of these are code gaps — every artifact, guard, and automated check backing them is
verified present, substantive, and wired. They are the designed human/ops boundary of a
Shopify theme: page content, menus, and setting values are the theme editor's or the
STAGING admin's property, not git's (per `docs/RELEASE.md` §"Propiedad del contenido"),
and this phase's own plans correctly refused to fake that boundary in code.

## Gaps Summary

No code-level gaps found. Status is `human_needed` solely because of the deferred
visual/editor/staging checks above (item 4, the runbook execution, is the one with the
most consequence — it is the actual proof that SHELL-02's "footer con links legales AR"
success criterion holds in a live environment). Once a human executes the runbook and
completes the browser/editor spot-checks, this phase should re-verify to `passed` without
any code change expected.

---

*Verified: 2026-09-11*
*Verifier: Claude (gsd-verifier)*
