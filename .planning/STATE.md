---
gsd_state_version: 1.0
current_phase: 3
current_phase_name: Layout shell + seams de Etapa 2
status: planning
stopped_at: Phase 3 context gathered
last_updated: "2026-09-09T17:52:20.629Z"
last_activity: 2026-09-09
last_activity_desc: Phase 02 complete, transitioned to Phase 3
state_head: 8c8f307bd0b7b7b61dbee60ff0a9f4adc561c09e
progress:
  total_phases: 14
  completed_phases: 2
  total_plans: 11
  completed_plans: 11
  percent: 14
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-09-09)

**Core value:** Maximizar el CVR de la pagina de producto (trafico pago Meta -> ordenes), sostenido por la regla CPA efectivo < margen.
**Current focus:** Phase 3 — Layout shell + seams de Etapa 2

## Current Position

Phase: 3 — Layout shell + seams de Etapa 2
Plan: Not started
Status: Ready to plan
Last activity: 2026-09-09 — Phase 02 complete, transitioned to Phase 3

Progress: [██░░░░░░░░░░░░] 2/14 phases ([█░░░░░░░░░] 14%)

## Performance Metrics

**Velocity:**

- Total plans completed: 11 (Phase 01: 7, Phase 02: 4)
- Average duration: n/a
- Total execution time: ~5 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01 | 7 | - | - |
| 02 | 4 | - | - |

**Recent Trend:**

- Last 5 plans: n/a
- Trend: n/a

*Updated after each plan completion*
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 01 P03 | 15min | 3 tasks | 8 files |
| Phase 01 P04 | 5min | 3 tasks | 6 files |
| Phase 01 P05 | 12min | 2 tasks | 3 files |
| Phase 01 P06 | 3h | 3 tasks | 4 files |
| Phase 02 P01 | ~50min | 3 tasks | 11 files |
| Phase 02 P02 | 6min | 3 tasks | 9 files |
| Phase 02 P03 | 25min | 3 tasks | 12 files |
| Phase 02 P04 | 20min | 3 tasks | 8 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Relevant open decisions for current work:

- Phase 1: Tema base (Skeleton vs Horizon vs Dawn) -- research lean es theme-blocks base (Skeleton preferido, Horizon alternativa, Dawn fallback de menor riesgo). Decision explicita + PROJECT.md update es criterio de exito de Phase 1; reemplaza la entrada "Dawn despojado".
- Phase 6: Mecanica del bundle + "un talle/color por pack vs por par" -- se decide por spike con el usuario ANTES de la UI del selector.
- Phase 12: App de MercadoPago AR 2026, disponibilidad de Shopify Payments AR, app de geo-gating de COD -- se resuelve con credenciales de produccion.
- [Phase 01]: FOUND-03 reframed: base Skeleton no trae cart drawer / predictive search / a11y — se cumple por allowlist (ALLOWLIST.md + scripts/check-allowlist.mjs, en npm run lint); componentes diferidos: cart drawer Fase 6, predictive search Fase 11, bus de eventos + a11y Fase 3
- [Phase 01]: Home shell = sections/custom-section.liquid (contenedor de theme-blocks, base del multi-avatar); hello-world des-referenciado sin borrar
- [Phase 01]: [Phase 01] Regla de propiedad del contenido (docs/RELEASE.md): la integración de GitHub de Shopify es dueña de config/settings_data.json y templates/*.json; se edita STAGING en el editor de temas y la integración commitea a la rama staging. Alternativa rechazada: git dueño del JSON con shopify theme pull periódico.
- [Phase 01]: [Phase 01] Nombres exactos de tema para el plan 01-07: 'Kinelia — LIVE' (publicado, rama main) y 'Kinelia — STAGING' (no publicado, rama staging).
- [Phase 01]: Repo público durante Etapa 1 (ratificado, revisar Phase 14). `SHOP_CLIENT_SECRET` rotado en Phase 1 tras filtrarse un fragmento a la historia pública; rotación final = gate de lanzamiento Phase 14 (`01-SECURITY.md` AR-01-03 / AR-01-05).
- [Phase 02]: check-tokens.mjs CONSTRAINED_TYPES admits font_picker (plus color_background/radio/checkbox) beyond the plan's literal color/select/range — css-variables.liquid still references settings.type_primary_font (font_picker) until 02-02 removes it; all admitted types are value-constrained so cannot close a <style> element
- [Phase 02]: 02-02: espaciado y radio se emiten como custom properties estáticas en css-variables.liquid, no como settings del editor (desviación registrada de ROADMAP SC#1); rename Skeleton->Kinelia sin alias, guardado por check-tokens rule 5
- [Phase 02]: 02-04: theme default language = Argentine Spanish (voseo), sole locale — `en.default.*` renamed to `es.default.*` by git mv (history preserved), no English fallback (verified: `shopify theme check --fail-level error` exits 0 Spanish-only — closes research A5). Brand copy (6 CTAs + root promise + legal legend) lives once under the `kinelia` locale namespace; `docs/BRAND-COPY.md` is the inherited contract (voseo voice + D-16 LOCKED prohibited claims); `check-tokens.mjs` rule 8 fails if the language drifts, a brand key disappears, or the legend gains an `_html` suffix. No user-facing string ever lives in a Liquid template.
- [Phase 02]: 02-03: self-hosted DM Sans 400/500 + Inter 400/500/600 subset WOFF2 (191,596 B, latin+latin-ext, OFL 1.1); @font-face in css-variables.liquid with verbatim gwfh unicode-range; exactly 2 preloads (dm-sans-500 + inter-400); base.css full primitive set, var(--*) only, accent token in exactly one rule (.price) — DESIGN-03 + DESIGN-01 typography side; D-05/D-06/D-07/D-08/D-11/D-12/D-13 implemented

### Pending Todos

None yet.

### Blockers/Concerns

- Phase 12 / Phase 14 dependen de datos provistos por el usuario: credenciales de MercadoPago produccion, razon social AR, DNS del dominio.
- REQUIREMENTS.md tenia un conteo stale de "58" requisitos v1; el conteo real es 71 (14 categorias). Traceability y Coverage actualizados a 71.
- ⚠️ [Phase 14 gate] `SHOP_CLIENT_SECRET` rotación final + `gh secret set` por stdin + revisión de visibilidad del repo ANTES de sacar la tienda de password-protection (`01-SECURITY.md` AR-01-05).
- ⚠️ [Phase 01 → follow-up no bloqueante] Decidir T-01-30 (admin bypass en los rulesets: `bypass_actors: [admin, always]` + `required_approving_review_count: 0`) — aceptar o endurecer. Mover `scripts/check-allowlist.mjs` + `check-secrets.mjs` al job CI requerido (T-01-12).
- Lighthouse: medición end-to-end de performance (harness local + CI) = Phase 13. El harness está cableado; la medición no corre limpio en Windows contra el proxy de `theme dev`.
- ⚠️ [Phase 02 UAT → follow-up ops] Antes del próximo release, verificar que `Kinelia — LIVE` (#150931210446) y `Kinelia — STAGING` no cargan un `locales/en.default.*` huérfano del rename `en→es`. El dev theme efímero sí lo tenía (borrado, `theme dev` recreó uno limpio #150941597902). Chequeo: `shopify theme pull --live --only locales` o editor de código. Detalle en `02-UAT.md` Deferred Follow-Ups.
- [Phase 02 code review — advisory, `02-REVIEW.md`] 6 warnings, ninguno bloqueante. Los relevantes: WR-05 `h4`–`h6` sin primitivas → faux-bold (viola D-05, invisible a `check-tokens`); WR-01/02 huecos en `check-tokens.mjs` (regex de color solo `#hex`, parser de la regla 6 de un solo nivel — endurecer antes de usar CSS nesting); WR-04 `<meta charset>`/`viewport` empujados KB adentro del `<head>` por el bloque de tokens + 5 `@font-face`; WR-06 CI hace `npm i -g @shopify/cli` sin pin y sin `setup-node`. Abordar en Fase 3 o una pasada de hardening.

### Assets recibidos

- **Guía de marca:** `Kinelia Brand Book.pdf` (gitignoreado). Tokens extraídos a `.planning/phases/02-.../02-CONTEXT.md`.
- **Logos:** carpeta `A- Logo/` (gitignoreada). Listos para el theme: `A- Logo/A.2 Logo/kinelia_horizontal.svg` (7,6 KB, vector potrace limpio, verde `#0F6E56`) → logo de header/footer (Phase 3); `A- Logo/A.1 Isotipo/kinelia_isotipo.svg` (3,4 KB) → favicon / avatar / contextos compactos. Variantes monocromo blanco y negro presentes (brand book: 4 versiones aprobadas). Phase 3 copia los archivos puntuales a `assets/` + pasada de SVGO (`kinelia_horizontal.svg` tiene atributos `fill` duplicados de potrace). Falta aún: fotos de producto reales (Phase 4-5).

## Deferred Items

Items acknowledged and deferred at milestone close, most recent first:

| Category | Item | Status | Deferred At | Milestone |
|----------|------|--------|-------------|-----------|
| *(none)* | | | | |

## Session Continuity

Last session: 2026-09-09T17:52:19.952Z
Stopped at: Phase 3 context gathered
Resume file: .planning/phases/03-layout-shell-seams-de-etapa-2/03-CONTEXT.md
Next step: /gsd-discuss-phase 3 (Layout shell + seams de Etapa 2) — no tiene CONTEXT.md todavía
