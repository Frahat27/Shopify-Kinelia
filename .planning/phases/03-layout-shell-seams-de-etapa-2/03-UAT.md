---
status: partial
phase: 03-layout-shell-seams-de-etapa-2
source: [03-VERIFICATION.md]
started: 2026-09-11T13:20:00Z
updated: 2026-09-11T15:10:00Z
---

## Current Test
<!-- SESSION BLOCKED — see note below. Not "awaiting user response": no live UAT can proceed
     until the deploy-sync blocker is resolved (local main is 68 commits ahead of origin/main;
     neither Kinelia — STAGING nor Kinelia — LIVE has any Phase 2/3 code). -->

number: 1
name: Charset order + seam invisibility (ver-fuente / DevTools)
expected: |
  El charset aparece antes de cualquier byte del bloque de tokens inline; el seam
  (`snippets/analytics-hooks.liquid`) es invisible en el DOM renderizado.
awaiting: deploy-sync blocker resolved (see Gaps)

## Tests

### 1. Charset order + seam invisibility (ver-fuente / DevTools)
expected: El charset aparece antes de cualquier byte del bloque de tokens inline; el seam es invisible en el DOM renderizado.
result: [pending]
note: >
  Primer intento (2026-09-11T14:35Z) inspeccionó kinelia.myshopify.com (tema STAGING,
  150931144910) y registró un "issue" de orden de charset. Se retractó: se confirmó que
  ni STAGING ni LIVE (150931210446) tienen código de Fase 2/3 desplegado — ver gap
  G-03-DEPLOY-SYNC. El hallazgo de orden de charset era sobre el theme.liquid de Fase 1,
  no sobre el código actual. Test vuelve a pending hasta reintentar contra el tema real.

### 2. Bus de eventos en consola del navegador
expected: `Kinelia.events.on` y `document.addEventListener` reciben el mismo payload al emitir; tras `off` el primero deja de recibir.
result: [pending]

### 3. Skip link + anuncio repetido con lector de pantalla
expected: El skip link es focoable con Tab desde carga en frío y mueve el foco a `#MainContent`; `Kinelia.a11y.announce(...)` ejecutado dos veces con el mismo mensaje se escucha ambas veces.
result: [pending]

### 4. Completitud editorial de ETAPA-2-SEAMS.md
expected: Alguien sin acceso al repo hermano (`kinelia-atribucion.js`) podría implementar el cart attribute y el POST de eventos correctamente (incluyendo first-touch y vida de cookie) solo con este documento.
result: [pending]

### 5. Gate de CI en un PR real
expected: El check "Theme Check" corre en el runner, `check-seams.mjs` aparece en su log, y sigue siendo required status check en `main`/`staging`.
result: [pending]

### 6. Favicon + arte vectorial de las marcas
expected: La pestaña del navegador muestra el isotipo Kinelia (no un globo genérico); ambos SVG vendorizados se ven correctos, sin deformación por la optimización manual.
result: [pending]

### 7. Announcement strip editable + CLS en mobile
expected: La sección es editable (agregar/reordenar/quitar) en el editor de temas; override vacío muestra el default en español; configurar el link la vuelve clickeable. En viewport de teléfono, strip + header quedan pinned como un solo bloque sin salto ni superposición; CLS dentro de presupuesto.
result: [pending]

### 8. Header minimalista en mobile con menú vacío
expected: Con el menú vacío, el header en mobile muestra solo marca, cuenta y carrito, sin hueco visible ni afordancias extra que compitan con el buy box.
result: [pending]

### 9. Grupo WhatsApp + newsletter en editor STAGING
expected: El editor de temas STAGING muestra el campo de número de WhatsApp con su nota en español y el switch de newsletter presente y apagado; con el número vacío no aparece ningún link de WhatsApp; al completarlo, el link abre la conversación correcta.
result: [pending]

### 10. Botón flotante de WhatsApp — visual + coexistencia con Fase 6
expected: En mobile, el FAB se ve sin sombra ni animación, en verde Kinelia (no el verde de WhatsApp); agregar `has-sticky-atc` al `<body>` en el inspector lo oculta.
result: [pending]

### 11. Ejecutar docs/RUNBOOK-STAGING.md contra Kinelia — STAGING (gate de fase para SHELL-02)
expected: Las 5 páginas stub existen con los slugs exactos; el menú del footer las enlaza; el número de WhatsApp está cargado. En el preview de STAGING, cada link legal del footer resuelve (sin 404), el link de WhatsApp y el FAB abren conversación con el número correcto, y no se ven ni el bloque de newsletter ni la fila de íconos de pago. Nota: la decisión sobre el link externo a Defensa del Consumidor sigue `_(pendiente)_` en el runbook — resolver antes o durante esta corrida.
result: [pending]

## Summary

total: 11
passed: 0
issues: 0
pending: 11
skipped: 0
blocked: 0

## Session Blocker (not a code gap — environment/process)

**G-03-DEPLOY-SYNC — Neither Shopify theme reflects Phase 2/3 code; UAT cannot proceed live.**

Root cause confirmed via git: local `main` is **68 commits ahead of `origin/main`**
(`c70fafa` on 2026-09-08, Phase 1 close, is still the tip of both `origin/main` and
`origin/staging`). Nothing from Phase 2 or Phase 3 has ever been pushed to GitHub, so
the Shopify GitHub integration has deployed nothing new to either theme:

- `Kinelia — STAGING` (150931144910, tracks `staging`) — confirmed via raw fetch of the
  live preview: no `events.js` script tag, no `analytics-hooks` render call, no
  `kinelia_isotipo` favicon, no `announcement-bar` section, no WhatsApp FAB. Frozen at
  Phase 1.
- `Kinelia — LIVE` (150931210446, tracks `main`) — same raw-fetch check, same result.
  Also frozen at Phase 1, because `origin/main` never advanced either.

Additionally, this deviates from `docs/RELEASE.md`'s documented flow (PR into `staging`
first for QA, then PR `staging` → `main` for release): all Phase 1-close-to-now work
landed directly on local `main`, bypassing `staging` entirely, and was never pushed.
`staging` is a clean ancestor of `main` (no divergent staging-only commits), so a
fast-forward-style reconciliation is possible without conflicts — but pushing 68 commits
to a shared remote and triggering a live-theme deploy is an irreversible, outward-facing
action this session will not take without explicit direction.

**Blocks:** every remaining test in this UAT (2, 3, 6, 7, 8, 9, 10, 11 all require
inspecting the live rendered theme). Tests 4, 5 may be answerable without a live theme
(document review / CI log review) — resumable now if you want partial progress while
the deploy question is resolved.

## Gaps
