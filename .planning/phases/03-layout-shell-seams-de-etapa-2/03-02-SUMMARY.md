---
phase: 03-layout-shell-seams-de-etapa-2
plan: 02
subsystem: infra
tags: [shopify, contract-doc, etapa-2-seams, checker, lint-chain, ci-gate, api-coverage, attribution]

requires:
  - phase: 03-layout-shell-seams-de-etapa-2
    provides: "assets/events.js con el array NAMES (5 nombres del bus DOM), el contrato de eventos/cart-attributes LOCKED (03-01), snippets/analytics-hooks.liquid (seam no-op)"
provides:
  - "ETAPA-2-SEAMS.md — especificación propia del tema del contrato de medición diferida: 7 cart attributes, 8 tipos de evento de /collect, 5 eventos del bus DOM con la forma de su detail, el hook data-kinelia=oferta, dónde va el script de atribución y las reglas de seguridad de payload"
  - "scripts/check-seams.mjs — copia ejecutable de SHELL-04: lee el array NAMES de assets/events.js y falla si el documento y el código se desincronizan"
  - "check-seams en la cadena npm run lint (tras check-tokens) y en el step 'Theme Check (gate)' del job requerido"
  - "package.json script lint:seams"
  - "COVERAGE.md — declaración razonada de que la Fase 3 no integra ninguna API externa"
  - "Decisión del séptimo cart attribute (view): dueño = script de atribución hermano en Fase 10; elección de implementación abierta hasta Fase 10"
affects: [03-03, 03-04, phase-05 (data-kinelia=oferta en el buy box, cart attributes con read-modify-write), phase-06 (emisores de cart:*), phase-10 (cart attribute view), etapa-2 (mapa bus→/collect en analytics-hooks.liquid)]

actuals:
  tokens: 6200
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "Checker ejecutable = copia de un contrato: check-seams.mjs se suma a check-allowlist.mjs y check-tokens.mjs — Node stdlib, violations[], process.exitCode sin process.exit(), backstop de scan vacío, exports de contrato para testeo"
    - "El checker LEE la fuente en vez de copiarla: check-seams parsea el array NAMES de assets/events.js en runtime; un rename ahí no puede pasar inadvertido acá"
    - "Contrato híbrido (D-04): transcripción inline + cita del origen con fecha de lectura — sobrevive a que el repo hermano se mueva o se haga privado"
    - "Token del contrato en formato de código exactamente una vez en el doc — hace el checker determinista y permite el test de 'bustear' cada rama"
    - "api_coverage_gate satisfecho por declaración razonada con evidencia comprobable cuando la fase no integra ninguna API"

key-files:
  created:
    - ETAPA-2-SEAMS.md
    - scripts/check-seams.mjs
    - .planning/phases/03-layout-shell-seams-de-etapa-2/COVERAGE.md
  modified:
    - package.json
    - .github/workflows/ci.yml
    - ALLOWLIST.md
    - OVERRIDES.md

key-decisions:
  - "El documento es híbrido (D-04): el contrato inline como spec propia del tema + cita de los dos archivos hermanos como origen, con fecha de lectura (2026-09-10)"
  - "El séptimo cart attribute (view): dueño asignado = script de atribución hermano en la Fase 10 (contrato LOCKED 03-01); la elección de implementación (snippet del tema que lee ?view= vs script hermano actualizado) queda abierta y la cierra la Fase 10"
  - "check-seams NO exporta una copia de los nombres del bus — los lee del array NAMES de assets/events.js, así el módulo sigue siendo la única fuente"
  - "Formato de código = token envuelto en el delimitador inline de markdown; cada token del contrato aparece así exactamente una vez en ETAPA-2-SEAMS.md"
  - "check-seams entra en la cadena lint después de check-tokens, y en el gate CI en el mismo lugar — un check laptop-only eventualmente deja de correr"

requirements-completed: [SHELL-03, SHELL-04]

coverage:
  - id: D1
    description: "El contrato de medición diferida existe como especificación propia del tema (ETAPA-2-SEAMS.md): 7 cart attributes con quién los escribe, 8 tipos de evento de /collect con qué significan, 5 eventos del bus DOM con la forma de su detail, la regla read-modify-write, el hook de la oferta, dónde va el script, el placeholder del endpoint y las reglas de seguridad de payload; cita los dos archivos hermanos como origen"
    requirement: "SHELL-04"
    verification:
      - kind: command
        ref: "node -e (asserts Task 1): los 7 cart attributes + 8 tipos de /collect + los 5 nombres parseados de assets/events.js aparecen en formato de código; data-kinelia; read-modify-write; PII; &lt;proyecto&gt; sin host real; cita de los siblings; Fase 10 para el 7º; doc >= 3000 chars (10506)"
        status: pass
    human_judgment: true
    rationale: "El contenido y la forma están probados por harness. El human-check del plan —que un lector con solo este documento pueda implementar la escritura del cart attribute y el POST de eventos correctamente, incluyendo el first-touch y la vida de la cookie, sin abrir el archivo hermano— queda para la revisión de fin de fase (human_verify_mode=end-of-phase)."
  - id: D2
    description: "El contrato es ejecutable: scripts/check-seams.mjs falla cuando el documento y los nombres publicados del bus (assets/events.js) se desincronizan — nombre del bus, tipo de evento del embudo o cart attribute ausente del doc en formato de código; array NAMES no parseable o vacío; documento ausente o implausiblemente corto"
    requirement: "SHELL-04"
    verification:
      - kind: command
        ref: "node scripts/check-seams.mjs exit 0 limpio; luego 4 estados rotos, restaurando el árbol tras cada uno — nombre del bus removido del doc, tipo de /collect removido, cart attribute removido, sexto nombre agregado al array NAMES del módulo — cada uno exit != 0; asserts de estilo (sin process.exit(), solo node: imports, export const, lee events.js) con comentarios stripeados"
        status: pass
    human_judgment: false
  - id: D3
    description: "check-seams corre donde corren los otros tres checkers: en la cadena npm run lint (tras check-tokens) y en el step 'Theme Check (gate)' del job requerido, sin renombrar el job (branch protection sigue gateado) y sin agregar dependencia de runtime"
    requirement: "SHELL-04"
    verification:
      - kind: command
        ref: "node -e (asserts Task 3): p.scripts.lint incluye check-seams.mjs; existe script individual (lint:seams); sin p.dependencies; ci.yml corre 'node scripts/check-seams.mjs' y los otros tres; job name 'Theme Check' intacto; COVERAGE.md con la declaración y los tres nombres; OVERRIDES.md con 03-02/check-seams.mjs/ETAPA-2-SEAMS.md/ci.yml; ALLOWLIST.md apunta al contrato; check-seams standalone exit 0 con línea de éxito"
        status: pass
    human_judgment: true
    rationale: "El wiring está probado por harness sobre los archivos. Que el step corra realmente en el runner de CI y muestre check-seams en el log, y que 'Theme Check' siga siendo el required check en las ramas protegidas, es el human-check del plan diferido a la revisión de fin de fase (necesita una pull request real; ver también el gap de entorno de Theme Check)."
  - id: D4
    description: "La Fase 3 declara con evidencia que no integra ninguna API externa (COVERAGE.md): el seam solo renderiza comentarios y la línea del script de atribución está comentada, el bus despacha CustomEvents del DOM y no abre ninguna conexión, el documento de contrato es una especificación"
    requirement: "SHELL-04"
    verification:
      - kind: command
        ref: "COVERAGE.md contiene la declaración verbatim 'No external API integration: ...' y nombra analytics-hooks.liquid, ETAPA-2-SEAMS.md y /collect; lista evidencia con los comandos que la prueban (grep del seam / de events.js, check-seams, check-secrets)"
        status: pass
    human_judgment: true
    rationale: "La declaración verbatim y los nombres están asertados por harness. Que la evidencia de respaldo se sostenga —el seam efectivamente no emite nada, el bus no hace red— es un juicio que el revisor confirma contra el seam y el módulo en la revisión de fin de fase."

duration: 15 min
completed: 2026-09-10
status: complete
---

# Phase 3 Plan 2: ETAPA-2-SEAMS.md + check-seams.mjs Summary

**El contrato de la medición diferida (7 cart attributes, 8 tipos de evento de `/collect`, 5 eventos del bus DOM con sus payloads, el hook de la oferta, el placement del script y las reglas de seguridad de payload) quedó escrito como especificación propia del tema en `ETAPA-2-SEAMS.md`, citando el repo hermano como origen, y guardado por `scripts/check-seams.mjs` — que lee el array `NAMES` de `assets/events.js` y falla si el documento y el código se desincronizan — corriendo en `npm run lint` y en el gate CI requerido. La Fase 3 declara con evidencia que no integra ninguna API externa.**

## Performance

- **Duration:** 15 min
- **Started:** 2026-09-10 ~18:18 -03
- **Completed:** 2026-09-10 18:32 -03
- **Tasks:** 3
- **Files:** 7 (3 creados, 4 modificados)

## Accomplishments

- **El contrato vive en el tema, no como un puntero a otro repo.** `ETAPA-2-SEAMS.md` transcribe inline los tres vocabularios (atributos de carrito, eventos de `/collect`, bus DOM del tema) y cita `../../Kinelia/web/kinelia-atribucion.js` y `../../Kinelia/supabase/functions/collect/index.ts` como origen, con la fecha en que se leyeron. Si el repo hermano se mueve o se hace privado, el tema sigue sabiendo qué tiene que satisfacer. Regla escrita: si los dos difieren, este documento es contra lo que se construyó el tema y la diferencia es un bug a cerrar deliberadamente.
- **El séptimo atributo de carrito es un seam reconocido, no un blanco.** El documento lista los 7 (`visitante_id` + 5 `utm_*` + `view`), dice que el script hermano escribe los primeros 6 hoy con first-touch, y asigna `view` (el slug de `?view=`) al script de atribución hermano en la Fase 10, dejando la elección de implementación —snippet del tema que lee el parámetro vs script hermano actualizado— explícitamente abierta y a cargo de la Fase 10 (research Pitfall 5).
- **El contrato es una orden que falla, no un documento que alguien tiene que recordar releer.** `scripts/check-seams.mjs` parsea el array `NAMES` de `assets/events.js` (nunca guarda su propia copia) y falla si un nombre del bus, uno de los 8 tipos de evento del embudo o uno de los 7 atributos de carrito no aparece en `ETAPA-2-SEAMS.md` en formato de código; también falla ante un `NAMES` no parseable o vacío (backstop de scan vacío) y ante un documento ausente o de menos de 3000 caracteres. Se probó limpio y contra 4 estados de deriva sembrados.
- **El check corre donde corren los otros tres.** Se sumó a la cadena `lint` de `package.json` (tras `check-tokens`), con su script individual `lint:seams`, y al step `Theme Check (gate)` del job `Theme Check` — el required status check de `main`/`staging` — sin renombrar el job y sin agregar dependencia de runtime.
- **La fase declara su cobertura de API con evidencia.** `COVERAGE.md` carga la declaración razonada de que la Fase 3 no hace ningún request a `/collect` ni a ningún endpoint hasta la Etapa 2, con evidencia comprobable: el seam solo renderiza comentarios, el bus despacha `CustomEvent`s y no hace red, el documento de contrato es una especificación.

## Tabla final de tokens del contrato en `ETAPA-2-SEAMS.md`

Cada uno aparece en formato de código (delimitador inline de markdown) exactamente una vez.

| Vocabulario | Tokens |
|-------------|--------|
| Atributos de carrito (7) | `visitante_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `view` |
| Tipos de evento de `/collect` (8) | `view_lp`, `scroll_50`, `scroll_75`, `ver_oferta`, `add_to_cart`, `inicio_checkout`, `paso_checkout`, `compra` |
| Eventos del bus DOM (5, leídos de `assets/events.js`) | `variant:changed`, `product:added`, `cart:updated`, `cart:loading`, `cart:error` |
| Hook de la oferta | `data-kinelia="oferta"` (presencia simple, no en formato de código obligatorio) |

**Formas del `detail` del bus transcritas** (dinero en centavos, sin PII): `variant:changed` → `{ variantId, available, price, optionValues }`; `product:added` → `{ variantId, quantity, cart }`; `cart:updated` → `{ itemCount, cart }`; `cart:loading` → `{ loading, source }`; `cart:error` → `{ message, source, code }`.

## Lista completa de condiciones de falla de `scripts/check-seams.mjs`

`exit != 0` cuando:

1. `assets/events.js` no existe, o su array `NAMES` no se puede parsear, o viene vacío (backstop de scan vacío).
2. `ETAPA-2-SEAMS.md` no existe.
3. `ETAPA-2-SEAMS.md` mide menos de 3000 caracteres.
4. Un nombre publicado del bus (parseado de `NAMES`) no aparece en el documento en formato de código.
5. Uno de los 8 tipos de evento del embudo (`FUNNEL_EVENT_TYPES`) no aparece en el documento en formato de código.
6. Uno de los 7 atributos de carrito (`CART_ATTRIBUTES`) no aparece en el documento en formato de código.
7. El documento no contiene `data-kinelia` (el hook de la oferta).

Exports: `FUNNEL_EVENT_TYPES` (8), `CART_ATTRIBUTES` (7), `OFFER_HOOK_ATTR` (`data-kinelia="oferta"`). Node stdlib, `process.exitCode` sin `process.exit()`, `import ... from "node:*"` únicamente.

## Contenido final del gate

**Cadena `lint` de `package.json`:**

```
shopify theme check --fail-level error
  && node scripts/check-allowlist.mjs
  && node scripts/check-secrets.mjs
  && node scripts/check-tokens.mjs
  && node scripts/check-seams.mjs
```

Script individual nuevo: `"lint:seams": "node scripts/check-seams.mjs"`.

**Step `Theme Check (gate)` del job `Theme Check` en `.github/workflows/ci.yml`:**

```
npm install -g @shopify/cli
shopify theme check --fail-level error
node scripts/check-tokens.mjs
node scripts/check-seams.mjs
node scripts/check-allowlist.mjs
node scripts/check-secrets.mjs
```

Display name del job (`Theme Check`) sin cambios — branch protection sigue gateado.

## Decisión registrada: el dueño del séptimo cart attribute (`view`)

- **Dueño:** el script de atribución de primera parte del repo hermano, según la Fase 10 (contrato LOCKED del plan 03-01).
- **Abierto hasta la Fase 10:** la elección de implementación entre (a) un snippet del tema que lee `?view=` y lo mergea al carrito con read-modify-write, o (b) una versión actualizada del script de atribución hermano. Ninguna de las dos existe en la Fase 3.
- El documento lo dice out loud en la tabla de atributos de carrito y en la sección "Puntos abiertos".

## Deviations from Plan

None - plan executed exactly as written.

Nota menor de redacción (no funcional): en `ETAPA-2-SEAMS.md` cada token del contrato se envuelve en formato de código **exactamente una vez**; las menciones repetidas en prosa (p. ej. en la sección del mapeo bus→`/collect`) se redactaron sin backticks. Esto es lo que hace que el test de `check-seams` que "bustea" cada rama (remover una única ocurrencia del token en formato de código) sea determinista. El significado se preserva.

## Issues Encountered

**`shopify theme check` / `npm run lint` completo no corre en este entorno (gap de entorno, no de código — ya registrado en STATE.md para la Fase 3).** El `shopify` CLI no está instalado localmente y no hay red al sandbox para `npm install -g @shopify/cli` ni para descargar los schemas de Theme Check (`raw.githubusercontent.com`). Es el mismo gap que enfrentó el plan 03-01 (allá con un CLI parcialmente instalado que reportaba 16 `ValidSchema` errors de baseline). Este plan **no toca ningún archivo Liquid ni de tema** — solo `package.json`, `ci.yml`, dos docs de contrato y un checker Node — así que no puede introducir una offense de Theme Check. Verificación sustituta ejecutada y verde:

- `node scripts/check-tokens.mjs` → exit 0
- `node scripts/check-seams.mjs` → exit 0 limpio; exit != 0 en cada uno de los 4 estados de deriva sembrados (nombre del bus removido, tipo de `/collect` removido, cart attribute removido, sexto nombre en `NAMES`)
- `node scripts/check-allowlist.mjs` → exit 0
- `node scripts/check-secrets.mjs` → exit 0 (127 archivos trackeados, sin host real de Supabase committeado)
- Asserts de contenido de Task 1 (doc) y de Task 3 (gates + ledger + COVERAGE) → todos verdes
- `git status --porcelain` → sin archivos borrados

**`npm run lint` completo con Theme Check debe correrse en CI / entorno con red antes del merge de la Fase 3** — el step del gate CI lo corre allá, donde `ValidSchema` resuelve.

## Broken-windows ledger

Sin stubs, sin tests salteados. El único `<verify>` no corrido de punta a punta es el prefijo `shopify theme check` de `npm run lint` (gap de entorno documentado arriba y ya en STATE.md como blocker de la Fase 3 — el gate CI lo corre). Las cuatro condiciones del checker Node de este plan corren verdes. No se registra entrada nueva de `stub` / `skipped-test`; el `unrun-verify` de Theme Check ya está rastreado a nivel fase.

## Threat surface scan

Sin superficie de seguridad nueva fuera del `<threat_model>` del plan.

- **T-03-06 (PII en un payload del bus):** el documento tiene la regla de payload como sección nombrada ("identificadores y montos en centavos, nunca email/nombre/dirección/teléfono"); las 5 formas de `detail` transcritas no llevan campo de PII. `PII` aparece literal en el doc.
- **T-03-07 (host real committeado):** el endpoint lleva el placeholder `&lt;proyecto&gt;`; el assert de Task 1 falla ante un host que matchee `https://[a-z0-9]{12,}\.supabase\.co`; `check-secrets.mjs` verde.
- **T-03-08 (clobbering de cart attributes):** la regla read-modify-write es una sección nombrada del doc con su razón, la misma que carga el buy box en la Fase 5 (BUY-06).
- **T-03-09 (deriva doc ↔ repo hermano):** documento híbrido (transcrito + citando los dos archivos con fecha); el gap del 7º atributo registrado con dueño; `check-seams.mjs` falla si los nombres publicados del tema y el doc difieren.
- **T-03-10 (error text al DOM):** la regla del `message` de `cart:error` está en el doc; Fase 6 la honra.
- **T-03-SC (supply chain):** este plan no instala ningún paquete; `check-seams.mjs` es Node stdlib. `package.json` sin `dependencies`.

Sin flags.

## Next Phase Readiness

- **Ready for 03-03** (marcas de la marca en `assets/` + favicon, `sections/announcement-bar.liquid`, tokens de altura del shell, header sticky en mobile). `03-03` y `03-04` **suman** a `ALLOWLIST.md` y `OVERRIDES.md` — los cambios de este plan a esos dos docs son aditivos y no colisionan.
- **SHELL-03 y SHELL-04** quedan satisfechos al cierre de este plan (SHELL-03 era ID compartida entre 03-01 y 03-02; ahora ambos planes tienen SUMMARY).
- **Seguimiento (no bloqueante, ya en STATE.md):** correr `npm run lint` completo con Theme Check en CI / entorno con red antes del merge de la Fase 3.
- Etapa 2: el mapa "evento del bus → tipo de `/collect`" se cablea dentro de `snippets/analytics-hooks.liquid`; `ETAPA-2-SEAMS.md` documenta ambos vocabularios y deja el mapeo como su trabajo.

## Self-Check: PASSED

- `ETAPA-2-SEAMS.md` — FOUND
- `scripts/check-seams.mjs` — FOUND
- `.planning/phases/03-layout-shell-seams-de-etapa-2/COVERAGE.md` — FOUND
- `.planning/phases/03-layout-shell-seams-de-etapa-2/03-02-SUMMARY.md` — FOUND
- Commit `0bd19b0` (Task 1) — FOUND
- Commit `e1c9453` (Task 2) — FOUND
- Commit `ef62947` (Task 3) — FOUND
- `git diff --diff-filter=D HEAD~3..HEAD` — sin archivos borrados
- `node scripts/check-seams.mjs` + `check-tokens` + `check-allowlist` + `check-secrets` — los cuatro exit 0
- `SHELL-03` y `SHELL-04` marcados Complete en `REQUIREMENTS.md` (checkbox + traceability)
