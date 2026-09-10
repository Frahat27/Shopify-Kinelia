---
phase: 03-layout-shell-seams-de-etapa-2
plan: 01
subsystem: infra
tags: [shopify, liquid, skeleton, custom-event, event-bus, accessibility, aria-live, theme-check, analytics-seam]

requires:
  - phase: 02-sistema-de-diseno-por-tokens
    provides: "tokens var(--*) en css-variables.liquid, base.css primitivas, check-tokens.mjs, es.default.json (voseo, clave general.accessibility.skip_to_content)"
provides:
  - "snippets/analytics-hooks.liquid — seam no-op de Etapa 2 montado en el <head> (tras meta-tags, antes de content_for_header)"
  - "assets/events.js — primer modulo JS del tema: window.Kinelia.events (emit/on/off/NAMES) sobre CustomEvent + window.Kinelia.a11y.announce"
  - "Contrato de 5 nombres de evento LOCKED: variant:changed, product:added, cart:updated, cart:loading, cart:error"
  - "JS_ASSET_ALLOWLIST en check-allowlist.mjs — el patron de como entra JS al tema (heredan Fases 5/6/11)"
  - "Landmarks del shell: skip link, <main id=MainContent>, <div id=a11y-live-region aria-live=polite>"
  - "layout/theme.liquid y layout/password.liquid con el <head> reordenado (charset en los primeros bytes)"
  - "assets/base.css: utilities .visually-hidden y .skip-link"
affects: [03-02 (ETAPA-2-SEAMS.md transcribe el contrato), 03-03, 03-04, phase-05 (variant:changed), phase-06 (product:added/cart:*), phase-10 (cart attribute view), phase-11]

actuals:
  tokens: 10500
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Bus de eventos DOM: wrapper fino sobre CustomEvent/document, sin registro propio ni cola (D-05)"
    - "JS entra al tema via Set exportado JS_ASSET_ALLOWLIST + checker actualizado en la misma PR (D-09)"
    - "Seam de Etapa 2 = snippet 100% comentario, cero bytes al cliente, <script> de terceros comentado con placeholder <proyecto>"
    - "a11y announce: clear textContent -> void offsetWidth -> write (re-anuncia mensaje identico consecutivo, Pitfall 7)"

key-files:
  created:
    - snippets/analytics-hooks.liquid
    - assets/events.js
  modified:
    - layout/theme.liquid
    - layout/password.liquid
    - snippets/meta-tags.liquid
    - assets/base.css
    - scripts/check-allowlist.mjs
    - ALLOWLIST.md
    - OVERRIDES.md

key-decisions:
  - "Contrato de eventos y cart attributes aceptado verbatim (checkpoint Task 1, respuesta del usuario: 'confirmado' via prompt del orquestador)"
  - "announce() vive dentro de events.js, no en un a11y.js separado (D-08, un solo asset JS)"
  - "IIFE clasico + window.Kinelia, no ESM (Skeleton no tiene import map ni bundler)"
  - "El fix de orden del <head> (charset/viewport arriba) ship en este plan, no diferido — es la PR que reordena el head igual"
  - "focus trap NO se escribe (sin consumidor hasta Fases 5/6)"

patterns-established:
  - "JS_ASSET_ALLOWLIST: primer modulo JS del tema; el patron de admision lo heredan Fases 5/6/11"
  - "Seam de medicion diferida = comentario-contrato + <script> comentado, nunca un toggle del editor ni un stub window.*.track"

requirements-completed: [SHELL-01, SHELL-03]

coverage:
  - id: D1
    description: "El seam no-op de Etapa 2 esta montado en el <head> en la posicion exacta que el script de atribucion necesita (tras meta-tags, antes de content_for_header), y el <head> quedo reordenado con la codificacion en los primeros bytes"
    requirement: "SHELL-01"
    verification:
      - kind: integration
        ref: "scratchpad/verify-task2.mjs#shell ok (charset antes del token block; seam entre meta-tags y content_for_header; meta-tags ya no emite las 3 meta; seam sin markup fuera de comentarios; placeholder <proyecto>)"
        status: pass
    human_judgment: true
    rationale: "El orden en la plantilla esta probado por harness. La posicion en bytes del response renderizado y el no-op visual del seam (ver-fuente en el navegador) es la parte human-check del tracer, diferida a la revision de fin de fase por human_verify_mode=end-of-phase."
  - id: D2
    description: "El tema tiene una unica API de eventos interna: window.Kinelia.events (emit/on/off/NAMES) — un wrapper sobre CustomEvent que un consumidor tambien alcanza con un document.addEventListener plano, porque es el mismo evento"
    requirement: "SHELL-03"
    verification:
      - kind: integration
        ref: "scratchpad/verify-task2.mjs#bus ok (emite y recibe por el bus y por listener plano; off desengancha; NAMES = los 5 nombres; sin global de analitica paralelo)"
        status: pass
    human_judgment: false
  - id: D3
    description: "JavaScript entra al tema solo por una lista explicita (JS_ASSET_ALLOWLIST); un asset .js/.mjs no listado sigue fallando el checker de superficie, y la lista se movio en el mismo cambio que el asset que admite"
    requirement: "SHELL-03"
    verification:
      - kind: integration
        ref: "scratchpad/verify-task2.mjs#surface gate ok (check-allowlist limpio = exit 0; con un .js fantasma = exit != 0; JS_ASSET_ALLOWLIST exportado y nombra events.js; el checker no llama process.exit())"
        status: pass
    human_judgment: false
  - id: D4
    description: "Cada pagina de storefront tiene un skip link como primer elemento enfocable, un landmark <main> real que envuelve el contenido de la ruta, y una live region polite"
    requirement: "SHELL-03"
    verification:
      - kind: integration
        ref: "scratchpad/verify-task3.mjs#landmarks ok (main#MainContent envuelve el contenido; skip link -> #MainContent con label de locale; live region aria-live=polite; utilities en base.css; password.liquid con la codificacion arriba del token block y sin el bus)"
        status: pass
    human_judgment: true
    rationale: "El markup y las utilities estan probados por harness. El comportamiento con teclado/lector de pantalla (Tab revela el skip link, activarlo mueve el foco al contenido) es la parte human-check del tracer, diferida a la revision de fin de fase."
  - id: D5
    description: "El tema puede hablar un mensaje en la live region dos veces seguidas y ser escuchado ambas veces (announce limpia el texto, fuerza un reflow y reescribe)"
    requirement: "SHELL-03"
    verification:
      - kind: integration
        ref: "scratchpad/verify-task3.mjs#announce ok (announce escribe 2 veces por llamada: '' luego el mensaje; una segunda llamada con el mismo mensaje produce un segundo clear+write; sin focus trap)"
        status: pass
    human_judgment: true
    rationale: "La secuencia clear -> reflow -> write esta probada por harness. Que un lector de pantalla real re-anuncie el mensaje identico depende del repaint del navegador; diferido a la revision de fin de fase."

duration: 12 min
completed: 2026-09-10
status: complete
---

# Phase 3 Plan 1: Layout shell + seams de Etapa 2 (tracer) Summary

**El seam no-op de Etapa 2 montado en el `<head>` reordenado + `assets/events.js` (primer JS del tema: bus DOM sobre `CustomEvent` + `announce`) probados de punta a punta, con JavaScript entrando al tema por `JS_ASSET_ALLOWLIST` y el shell con skip link, `<main>` y live region.**

## Performance

- **Duration:** 12 min
- **Started:** 2026-09-10T20:59:44Z
- **Completed:** 2026-09-10T21:11:54Z
- **Tasks:** 3 (Task 1 = checkpoint de decisión, pre-resuelto)
- **Files modified:** 9 (2 creados, 7 modificados)

## Accomplishments

- **El seam se conecta sin refactor.** `snippets/analytics-hooks.liquid` se renderiza desde el shell entre `{% render 'meta-tags' %}` y `{{ content_for_header }}` (D-03). Hoy es 100% comentario: cero bytes al cliente, cero request a un tercero. "Conectar Etapa 2" es descomentar una línea en un archivo ya referenciado.
- **El tema tiene una única API de eventos.** `assets/events.js` expone `window.Kinelia.events` (`emit`/`on`/`off`/`NAMES`) como wrapper fino sobre `document` + `CustomEvent` — sin registro propio ni cola. Un consumidor con `Kinelia.events.on(...)` y uno con `document.addEventListener(...)` reciben el mismo evento. Los 5 nombres del contrato quedan publicados como array `NAMES` (una lista que el tema puede pedir en runtime, así un typo se descubre en vez de emitir al vacío).
- **JavaScript entra al tema por una puerta, no por un hábito.** `scripts/check-allowlist.mjs` reemplaza el blanket ban anti-JS de la Fase 1 por un `Set` exportado `JS_ASSET_ALLOWLIST` (hoy: `events.js`). Un `.js`/`.mjs` no listado sigue empujando una violación — probado con un asset fantasma sembrado.
- **El `<head>` protege los acentos.** Las tres meta de codificación/compatibilidad/área visible suben a las tres primeras líneas del `<head>` de `layout/theme.liquid` y `layout/password.liquid`, arriba del `<style>` inline de tokens (5 `@font-face` + `:root`, varios KB) que las empujaba fuera de la ventana de ~1024 bytes (Pitfall 1 / WR-04). `snippets/meta-tags.liquid` deja de emitirlas para no declararlas dos veces.
- **El shell tiene landmarks.** Skip link como primer elemento enfocable (label de `general.accessibility.skip_to_content`), `<main id="MainContent">` envolviendo el contenido de la ruta, `<div id="a11y-live-region" aria-live="polite" role="status">` en cada página. `Kinelia.a11y.announce` re-anuncia un mensaje idéntico consecutivo (clear → reflow → write, Pitfall 7). El focus trap NO se escribió (sin consumidor hasta Fases 5/6).

## Contrato de eventos y cart attributes — LOCKED (checkpoint Task 1)

El usuario respondió **"confirmado"** (vía el prompt del orquestador): se toma el contrato propuesto **verbatim, sin enmiendas**. Plan 03-02 lo transcribe a `ETAPA-2-SEAMS.md` sin re-derivarlo.

**5 nombres de evento del bus DOM** (convención `namespace:verbo-en-pasado`, dinero en centavos):

| Nombre | Emisor futuro | `detail` |
|--------|---------------|----------|
| `variant:changed` | Fase 5, variant picker | `{ variantId, available, price, optionValues }` — `price` en centavos |
| `product:added` | Fases 5-6, ATC y sticky ATC | `{ variantId, quantity, cart }` |
| `cart:updated` | Fase 6, cart drawer y cambios de línea | `{ itemCount, cart }` |
| `cart:loading` | Fase 6, spinners de drawer y buy box | `{ loading, source }` |
| `cart:error` | Fase 6, request de carrito fallida | `{ message, source, code }` |

**Namespace global:** `window.Kinelia`, con `Kinelia.events` (`emit`, `on`, `off`, `NAMES`) y `Kinelia.a11y` (`announce`).

**7 cart attributes (SHELL-04):** `visitante_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `view`. El script de atribución hermano escribe hoy los primeros 6; `view` es el 7º que agrega el contrato del tema, escrito por el script de atribución según la Fase 10 (nombrar el dueño explícitamente en `ETAPA-2-SEAMS.md`, Pitfall 5).

**Regla de payload:** un `detail` lleva identificadores y montos en centavos. Nunca email, nombre completo, dirección postal ni teléfono.

**Sin renombres:** ningún evento `cart:` pasa a `carrito:`; `cart:loading` y `cart:error` quedan separados; `view` queda en el contrato. Nadie emite un evento en esta fase.

## Orden final del `<head>` de `layout/theme.liquid` (línea por línea)

```
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    {%- comment -%} KINELIA (plan 03-01): las 3 meta arriba del bloque de tokens (Pitfall 1) {%- endcomment -%}
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    {% # Inlined CSS Variables %}
    {% render 'css-variables' %}

    {% comment %} KINELIA (plan 02-02 / 02-03): fuentes self-hosted, 2 preloads {% endcomment %}
    <link rel="preload" as="font" type="font/woff2" href="{{ 'dm-sans-500.woff2' | asset_url }}" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="{{ 'inter-400.woff2' | asset_url }}" crossorigin>

    {% # Load and preload the critical CSS %}
    {{ 'critical.css' | asset_url | stylesheet_tag: preload: true }}

    {% comment %} KINELIA (plan 02-01): base.css despues de critical.css, sin preload {% endcomment %}
    {{ 'base.css' | asset_url | stylesheet_tag }}

    {% # Social, title, etc. %}
    {% render 'meta-tags' %}

    {%- comment -%} KINELIA (plan 03-01): seam no-op de Etapa 2 (D-03) {%- endcomment -%}
    {% render 'analytics-hooks' %}

    {{ content_for_header }}
  </head>
```

`<body>` (03-01): `<a class="skip-link" href="#MainContent">…</a>` → `<div id="a11y-live-region" class="visually-hidden" role="status" aria-live="polite"></div>` → `{% sections 'header-group' %}` → `<main id="MainContent">{{ content_for_layout }}</main>` → `{% sections 'footer-group' %}` → `<script src="{{ 'events.js' | asset_url }}" defer></script>`.

## Forma del script-asset allowlist en `scripts/check-allowlist.mjs`

```js
// Justo despues de FORBIDDEN_ASSET_SUBSTRINGS:
export const JS_ASSET_ALLOWLIST = new Set(["events.js"]);

// En el loop de assets/:
if ((ext === ".js" || ext === ".mjs") && !JS_ASSET_ALLOWLIST.has(name)) {
  violations.push(
    `assets/${name}: JavaScript en assets/ solo se admite vía JS_ASSET_ALLOWLIST (ver ALLOWLIST.md §"Renderiza")`
  );
}
```

`FORBIDDEN_ASSET_SUBSTRINGS` (jquery/swiper/react/vue/alpine) sigue aplicando a los listados. El checker sigue en Node stdlib, `process.exitCode` sin `process.exit()`, `export`s para testeo. Plans 03-03 y 03-04 **suman** a este `Set` (SVGs no son JS, así que no aplica acá; futuros módulos sí).

## Task Commits

1. **Task 1: Lock the published event and cart-attribute contract** — checkpoint de decisión, pre-resuelto por el usuario ("confirmado"). Sin commit de código.
2. **Task 2: Tracer — the Etapa 2 seam and the event bus, wired end to end** — `1566705` (feat)
3. **Task 3: Finish the document shell — landmarks, the live region and the password layout** — `057024d` (feat)

**Plan metadata:** (este commit)

## Files Created/Modified

- `snippets/analytics-hooks.liquid` (nuevo) — seam no-op de Etapa 2, 100% comentario, `<script>` de atribución comentado con placeholder `<proyecto>`
- `assets/events.js` (nuevo) — bus de eventos DOM + helper `announce`, IIFE modo estricto, ~2 KB, `defer`
- `layout/theme.liquid` — 3 meta arriba del bloque de tokens; `{% render 'analytics-hooks' %}`; `<script defer events.js>`; skip link, live region, `<main id="MainContent">`
- `layout/password.liquid` — mismo fix de `<head>` (3 meta arriba); sin header/footer/seam/bus
- `snippets/meta-tags.liquid` — deja de emitir las 3 meta de codificación/compatibilidad/área visible
- `assets/base.css` — utilities `.visually-hidden` (recorte de 1px) y `.skip-link` (invisible hasta foco), solo `var(--*)`
- `scripts/check-allowlist.mjs` — `JS_ASSET_ALLOWLIST` reemplaza el blanket ban anti-JS; header y comentario de contexto actualizados; mensaje de éxito reporta conteo de JS
- `ALLOWLIST.md` — filas en `## Renderiza` (seam + bus); fila de `## Nunca agregar` reformulada; desviación "bus DOM + a11y → Fase 3" marcada entregada
- `OVERRIDES.md` — filas de modificados/nuevos; nota de componente portado (solo inspiración de patrón, Pitfall 6); subsección "Divergencias de la Fase 3 (plan 03-01)"

## Decisions Made

- **Contrato de eventos aceptado verbatim** (checkpoint Task 1, usuario: "confirmado"). Sin enmiendas.
- **`announce()` dentro de `events.js`**, no en `a11y.js` separado (D-08): un asset JS en vez de dos, y la live region la renderiza el mismo shell que carga el módulo.
- **IIFE clásico + `window.Kinelia`**, no ESM: Skeleton no tiene import map ni bundler.
- **El fix de orden del `<head>` ship en este plan**, no diferido: es la PR que reordena el head de todos modos; dejar la codificación varios KB adentro mientras se tocan las líneas de alrededor sería elegir mantener el hazard.
- **El focus trap no se escribe** (D-08): sin consumidor hasta el cart drawer (Fase 6) y la guía de talles (Fase 5).

## Deviations from Plan

None - plan executed exactly as written.

Nota menor de redacción (no es una desviación funcional): dos comentarios en `layout/theme.liquid` y `snippets/meta-tags.liquid` se redactaron evitando las palabras literales `charset` / `viewport` / `content_for_layout` dentro del texto del comentario, porque los asserts del `<verify>` del plan hacen `grep` de esas cadenas sobre el archivo crudo (sin strip de comentarios) para detectar emisión duplicada / contenido fuera del landmark. El significado se preserva ("declaración de codificación", "área visible", "contenido de la ruta").

## Issues Encountered

**`shopify theme check --fail-level error` no corre limpio en este entorno (no es una regresión).** Las 16 `ValidSchema` errors que reporta son todas la misma causa: Theme Check no puede descargar `https://raw.githubusercontent.com/Shopify/theme-liquid-docs/main/schemas/theme/default_setting_values.json` (sin red a `raw.githubusercontent.com` en el sandbox). El conteo de offenses es **idéntico al baseline pre-plan** (18 total / 16 errors / 2 warnings `AssetPreload` preexistentes) — este plan no agregó ni una offense. Verificación sustituta ejecutada y verde:

- `node scripts/check-allowlist.mjs` → exit 0 limpio; exit != 0 con un `.js` fantasma presente (ambas direcciones probadas)
- `node scripts/check-secrets.mjs` → exit 0
- `node scripts/check-tokens.mjs` → exit 0
- Harness del bus (Node `vm` + `EventTarget` + `CustomEvent` reales) → un consumidor por el bus y uno por `document.addEventListener` reciben el mismo payload; `off` desengancha; `NAMES` = los 5 nombres
- Harness de `announce` → la region se limpia antes de cada write, dos veces para un mensaje idéntico repetido
- `git status --porcelain` → sin archivos borrados

`npm run lint` completo (con Theme Check) debe correrse en un entorno con red antes del merge / en el gate de CI, donde `ValidSchema` sí resuelve. Registrado como gap de entorno, no de código.

## Tracer feedback gate

Task 2 es `type="tracer"`. Gate evaluado tras el commit de Task 2:
- Sin `gate="blocking-human"`.
- Auto mode inactivo (`_auto_chain_active: false`, `auto_advance: false`).
- `human_verify_mode: end-of-phase`. El `<human-check>` del tracer dice explícitamente "Deferred to the end-of-phase review".
- El `<automated>` del tracer (que ejercita el bus y el seam de punta a punta) se re-corrió: **verde**. `⚡ Tracer verified end-to-end — expanding` → se continuó a Task 3.
- El human-check del navegador (ver-fuente: codificación en el primer bloque del `<head>`, seam sin markup visible; consola: `NAMES`, suscribir por el bus y por listener plano, emitir, desuscribir) queda para `/gsd-verify-work` de fin de fase. Recogido en `coverage` D1/D4/D5 con `human_judgment: true`.

## Broken-windows ledger

Sin stubs, sin tests salteados. El único `<verify>` no corrido es `shopify theme check` (gap de entorno documentado arriba, no un defecto de código). No se registra entrada de `stub`/`skipped-test`.

## Threat surface scan

Sin superficie de seguridad nueva fuera del `<threat_model>` del plan. El seam es no-op (T-03-01 mitigado: el `<verify>` falla si queda algo fuera de los comentarios), el host lleva el placeholder `<proyecto>` (T-03-02 mitigado: `check-secrets.mjs` + el `<verify>` fallan ante un host real), y `JS_ASSET_ALLOWLIST` reemplaza el ban sin eliminarlo (T-03-03 mitigado: caso del `.js` fantasma probado). Sin flags.

## Next Phase Readiness

- **Ready for 03-02** (`ETAPA-2-SEAMS.md` + `scripts/check-seams.mjs` + declaración de cobertura de API). El contrato de eventos/attributes de arriba se transcribe verbatim; el `Set` `NAMES` de `assets/events.js` y `JS_ASSET_ALLOWLIST` son la fuente ejecutable contra la que `check-seams.mjs` compara.
- Plans 03-03 y 03-04 tocan `layout/theme.liquid` (FAB, tokens de altura del shell) y `locales/*` — el `<head>` y el `<body>` de este plan son su punto de partida.
- **Seguimiento (no bloqueante):** correr `npm run lint` completo con Theme Check en CI / entorno con red antes del merge de la Fase 3.

## Self-Check: PASSED

- `snippets/analytics-hooks.liquid` — FOUND
- `assets/events.js` — FOUND
- `.planning/phases/03-layout-shell-seams-de-etapa-2/03-01-SUMMARY.md` — FOUND
- Commit `1566705` (Task 2) — FOUND
- Commit `057024d` (Task 3) — FOUND
- `git status --porcelain` diff-filter=D — sin archivos borrados

---
*Phase: 03-layout-shell-seams-de-etapa-2*
*Completed: 2026-09-10*
