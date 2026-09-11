---
status: testing
phase: 03-layout-shell-seams-de-etapa-2
source: [03-VERIFICATION.md]
started: 2026-09-11T13:20:00Z
updated: 2026-09-11T13:20:00Z
---

## Current Test

number: 1
name: Charset order + seam invisibility (ver-fuente / DevTools)
expected: |
  El charset aparece antes de cualquier byte del bloque de tokens inline; el seam
  (`snippets/analytics-hooks.liquid`) es invisible en el DOM renderizado.
awaiting: user response

## Tests

### 1. Charset order + seam invisibility (ver-fuente / DevTools)
expected: El charset aparece antes de cualquier byte del bloque de tokens inline; el seam es invisible en el DOM renderizado.
result: [pending]

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

## Gaps
