# Phase 3 — Declaración de cobertura de API

`api_coverage_gate: true`. Esta fase no integra ninguna API externa, así que en lugar de
una matriz de capacidades declara — con evidencia comprobable — por qué no hay superficie
de integración que cubrir.

## Declaración

> No external API integration: Phase 3 only defines no-op Etapa 2 seams (analytics-hooks.liquid
> stub, DOM CustomEvent bus, ETAPA-2-SEAMS.md contract doc) — no request is made to /collect or
> any endpoint until Etapa 2.

## Evidencia de respaldo (un revisor puede verificarla)

- **El seam no renderiza nada fuera de sus comentarios y la línea del script de atribución
  está comentada.** `snippets/analytics-hooks.liquid` es 100 % `{%- comment -%}` con la línea
  `<script src>` de `kinelia-atribucion.js` comentada y el host en placeholder `<proyecto>`.
  Cero bytes al cliente, cero request a `/collect` ni a ningún host. Comprobación: abrir el
  snippet; `shopify theme check --fail-level error` no reporta `RemoteAsset`.
- **El bus despacha eventos del DOM y no abre ninguna conexión.** `assets/events.js` es un
  wrapper sobre `document.dispatchEvent(new CustomEvent(...))` + `document.addEventListener`.
  No hace `fetch`, `XMLHttpRequest`, `sendBeacon` ni `import()` de red. Nadie emite en la
  Fase 3. Comprobación: `grep -nE "fetch|XMLHttpRequest|sendBeacon|navigator\." assets/events.js`
  no devuelve ninguna llamada de red.
- **El documento de contrato es una especificación, no código.** `ETAPA-2-SEAMS.md` describe
  los atributos de carrito, los tipos de evento de `/collect`, el bus interno y las reglas de
  seguridad de payload que la Etapa 2 tendrá que satisfacer. `scripts/check-seams.mjs` lo
  compara contra los nombres publicados en `assets/events.js` y no realiza ninguna llamada.
  Comprobación: `node scripts/check-seams.mjs` (Node stdlib, sin red) y
  `node scripts/check-secrets.mjs` (ningún host real committeado).

## Cuándo cambia esto

La Etapa 2 enciende la instrumentación: descomenta la línea del script de atribución en el
seam, cablea el mapa "evento del bus → tipo de `/collect`" y activa el pixel. Ese trabajo sí
tiene superficie de integración y produce su propia declaración de cobertura.
