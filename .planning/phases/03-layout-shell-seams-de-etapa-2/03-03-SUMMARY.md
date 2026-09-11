---
phase: 03-layout-shell-seams-de-etapa-2
plan: 03
subsystem: theme-shell
tags: [shopify, liquid, header, announcement-bar, brand-assets, css-tokens, sticky, a11y]

requires:
  - phase: 03-layout-shell-seams-de-etapa-2
    provides: "assets/events.js + window.Kinelia bus (03-01), ETAPA-2-SEAMS.md + check-seams.mjs (03-02), snippets/css-variables.liquid token emitter (02-02)"
provides:
  - "assets/kinelia_horizontal.svg + assets/kinelia_isotipo.svg — las dos marcas vendorizadas y optimizadas a mano"
  - "layout/theme.liquid con <link rel=icon> apuntando al isotipo via asset_url"
  - "sections/announcement-bar.liquid — franja estatica, no dismissible, mensaje y link opcionales desde el locale"
  - "sections/header-group.json monta announcement-bar primero, arriba de header"
  - "sections/header.liquid reconstruido: logo inlineado, cuenta y carrito del starter conservados, menu guardado por tamano, pinned en telefono junto con la franja"
  - "Seis tokens estaticos del shell en snippets/css-variables.liquid: --announcement-bar-height, --header-height, --header-height-desktop, --z-sticky-header, --z-fab, --z-overlay"
  - "scripts/check-allowlist.mjs con announcement-bar en RENDER_ALLOWLIST"
affects: [03-04, phase-05 (guia de talles y cart drawer heredan --z-overlay), phase-06 (cart drawer y ATC sticky pesan contra el presupuesto pinned de telefono), phase-11 (predictive search / home), phase-13 (medicion de CLS del bloque pinned)]

actuals:
  tokens: 11700
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Optimizacion manual de SVG cuando la herramienta del research (svgo via npx) no esta disponible sin red: Node stdlib, un unico script one-off, sin dependencia nueva (Regla 3, tooling bloqueado)"
    - "Presupuesto vertical + orden de apilamiento del shell como tokens estaticos nombrados, no settings del editor — mismo patron que la escala de espaciado (D-09)"
    - "Seccion propia + guardia por tamano de link_list para que un menu vacio no ocupe espacio (Pitfall 9)"
    - "position: sticky (nunca fixed) offset por un token de altura hermano, para que dos secciones independientes lean como un solo bloque pinned sin acoplarse en markup"

key-files:
  created:
    - assets/kinelia_horizontal.svg
    - assets/kinelia_isotipo.svg
    - sections/announcement-bar.liquid
  modified:
    - layout/theme.liquid
    - snippets/css-variables.liquid
    - sections/header.liquid
    - sections/header-group.json
    - scripts/check-allowlist.mjs
    - locales/es.default.json
    - locales/es.default.schema.json
    - ALLOWLIST.md
    - OVERRIDES.md

key-decisions:
  - "svgo sustituido por un script Node de una sola corrida (sin dependencia nueva) porque el entorno de ejecucion no tiene svgo instalado ni red hacia el registro de npm — Regla 3 (bloqueo de tooling), no una sustitucion de herramienta por otra"
  - "Sin icono raster de respaldo para el favicon — el vector cubre a este publico y un segundo asset es peso que el embudo paga sin necesitarlo"
  - "Orden de apilamiento invertido respecto al research: header sticky < boton flotante < overlay (no boton flotante > drawer) — un drawer que el boton de chat perfora se ve roto, asi que el overlay cubre a ambos"
  - "El mensaje de la franja resuelve al override del editor cuando tiene valor, si no al default del locale; el link es un setting url (nunca texto libre) y su nombre accesible sale del locale"
  - "El header conserva el componente de cuenta y el contador de carrito del starter verbatim; nadie recablea el contador a cart:updated en esta fase (D-07)"

requirements-completed: [SHELL-02]

coverage:
  - id: D1
    description: "Un shopper que llega de un anuncio ve la marca propia de Kinelia en el header en vez del nombre de la tienda como texto, y la pestana del navegador lleva el icono de marca (D-10, D-18)"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 1): ambos vectores existen, tienen viewBox, ningun elemento repite fill, cada uno es mas chico que su fuente; layout/theme.liquid declara <link rel=icon> con kinelia_isotipo.svg via asset_url — pass"
      - kind: command
        ref: "node -e (assert Task 3): sections/header.liquid inlinea kinelia_horizontal.svg via inline_asset_content dentro de un link a routes.root_url — pass"
        status: pass
    human_judgment: true
    rationale: "El markup y los bytes estan probados por harness. Que la pestana del navegador muestre la marca en vez de un globo generico, y que el optimizador manual no haya deformado el arte, son el human-check del plan, diferidos a la revision de fin de fase (human_verify_mode=end-of-phase)."
  - id: D2
    description: "El header hace exactamente tres cosas — identificar la marca, llegar al carrito con su contador, llegar a la cuenta cuando esta habilitada — y nada mas compite por atencion con el buy box"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 3): sin type=search ni predictive, sin addEventListener/Kinelia.events.on/<script en el markup, sin icono adicional mas alla de cuenta y carrito — pass"
        status: pass
    human_judgment: true
    rationale: "La ausencia de afordancias extra esta probada por harness. Que el resultado visual efectivamente no compita con el buy box es un juicio de diseno que el revisor confirma contra el tema corriendo, diferido a la revision de fin de fase."
  - id: D3
    description: "El menu de navegacion esta presente en el schema y vacio por defecto, y cuando esta vacio no ocupa espacio en vez de dejar un hueco visible (D-11, Pitfall 9)"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 3): el setting menu existe en el schema sin default; el contenedor del menu esta detras de {% if section.settings.menu.links.size > 0 %} — pass"
        status: pass
    human_judgment: true
    rationale: "La guarda esta probada por harness sobre el markup. Que un menu vacio efectivamente no deje un hueco visible en el header renderizado es el human-check del plan, diferido a la revision de fin de fase."
  - id: D4
    description: "En telefono, la franja de anuncio y el header compacto quedan pinned juntos como un solo bloque, con su espacio reservado antes de renderizar, sin que nada salte debajo (D-12)"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 2 + Task 3): announcement-bar reserva --announcement-bar-height y usa position: sticky dentro de @media (max-width) al nivel --z-sticky-header; header reserva --header-height/--header-height-desktop y usa position: sticky (nunca fixed) offset por --announcement-bar-height al mismo nivel — pass"
        status: pass
    human_judgment: true
    rationale: "Los min-height, el position: sticky (no fixed) y el offset compartido estan probados por harness estatico. Que el bloque efectivamente no genere layout shift en un dispositivo real es una medicion de Cumulative Layout Shift que corresponde a la Fase 13 y al human-check de fin de fase."
  - id: D5
    description: "La franja de anuncio es una section propia que un merchant puede agregar, reordenar o quitar desde el editor de temas; es estatica, no dismissible, y su texto sale del locale, no de la plantilla"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 2): sections/announcement-bar.liquid tiene schema propio, esta montada en header-group.json (primera en el orden), sin script ni memoria por visitante; el mensaje literal del locale no aparece tipeado en el cuerpo del template — pass"
        status: pass
    human_judgment: true
    rationale: "La estructura de section independiente y la ausencia de logica de dismiss estan probadas por harness. Que un merchant pueda efectivamente agregarla/reordenarla/quitarla desde el editor de temas real es el human-check del plan, diferido a la revision de fin de fase."
  - id: D6
    description: "La copy de la franja declara hechos que la tienda puede sostener — envio a todo el pais, garantia de 90 dias — sin inventar urgencia, contador, stock ni descuento que no exista (D-16 del contrato de marca)"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "locales/es.default.json sections.announcement_bar.message = 'Envío a todo el país. Garantía de 90 días.' — dos hechos declarados en el roadmap del negocio, sin contador ni stock ni descuento; check-tokens.mjs no reporta ninguna violacion sobre el archivo"
        status: pass
    human_judgment: true
    rationale: "Que un string no contenga los patrones prohibidos es verificable, pero el juicio de que la copy respeta el contrato de marca (docs/BRAND-COPY.md) es una revision de contenido, diferida al revisor humano de fin de fase."
  - id: D7
    description: "El orden de apilamiento del shell esta escrito como tokens nombrados en vez de numeros sueltos en varios archivos, para que el cart drawer de la Fase 6 sepa que tiene que cubrir sin releer tres hojas de estilo"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 2): snippets/css-variables.liquid define --z-sticky-header, --z-fab y --z-overlay (10 < 20 < 30) con el orden y la razon en un comentario — pass"
        status: pass
    human_judgment: false
  - id: D8
    description: "El contador de carrito sigue siendo lo que la pagina renderizo, no algo que JavaScript recalcula — el recableado reactivo pertenece al cart drawer de la Fase 6 (D-07)"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 3): sections/header.liquid conserva cart.item_count y routes.cart_url; sin addEventListener ni Kinelia.events.on en el markup — pass"
        status: pass
    human_judgment: false
  - id: D9
    description: "Ambas marcas de marca fueron optimizadas antes de vendorizarse, asi el tema no envia los atributos duplicados que dejo la herramienta de tracing"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 1): ningun elemento de ninguno de los dos SVG repite el atributo fill; ambos archivos son mas chicos que su fuente (7587 B < 7617 B; 3085 B < 3419 B) — pass"
        status: pass
    human_judgment: false
  - id: D10
    description: "El componente de cuenta y el contador de carrito del starter se mantuvieron en vez de reimplementarse"
    requirement: "SHELL-02"
    verification:
      - kind: command
        ref: "node -e (assert Task 3): shop.customer_accounts_enabled + shopify-account + icon-account.svg intactos; cart.item_count + routes.cart_url + icon-cart.svg intactos — pass"
        status: pass
    human_judgment: false

duration: 55 min
completed: 2026-09-11
status: complete
---

# Phase 3 Plan 3: Header + announcement bar (SHELL-02 header half) Summary

**El header ahora dice "esto es Kinelia" y se aparta: la marca vendorizada e inlineada reemplaza al nombre de la tienda como texto, el favicon lleva el isotipo, la franja de anuncio es su propia sección editable con copy que declara solo hechos, y en teléfono la franja y el header compacto quedan pinned como un solo bloque cuya altura y orden de apilamiento están escritos una sola vez como tokens que las Fases 5, 6 y 13 heredan.**

## Performance

- **Duration:** 55 min
- **Started:** 2026-09-11 ~11:27 UTC
- **Completed:** 2026-09-11 ~12:22 UTC
- **Tasks:** 3
- **Files:** 12 (3 creados, 9 modificados)

## Accomplishments

- **La marca de Kinelia reemplaza al nombre de la tienda.** `assets/kinelia_horizontal.svg` (logo del header) y `assets/kinelia_isotipo.svg` (favicon) se copiaron desde la carpeta de marca gitignoreada y se optimizaron a mano — sin `svgo` disponible ni red en el sandbox, un script Node de una sola corrida quitó los atributos `fill` duplicados que dejó la herramienta de tracing, y en el isotipo además la declaración XML, el `DOCTYPE` y el comentario de atribución a potrace. Ambos quedaron medibles más chicos que su fuente (7.587 B < 7.617 B; 3.085 B < 3.419 B), sin ningún elemento con `fill` repetido y con `viewBox` intacto. `layout/theme.liquid` declara `<link rel="icon">` apuntando al isotipo vía `asset_url`, sin raster de respaldo.
- **La franja de anuncio es una sección propia, no un div suelto en el header.** `sections/announcement-bar.liquid` sigue la forma de `footer.liquid` (markup, marcador de plan, `{% stylesheet %}` scoped, `{% schema %}`): el mensaje resuelve al override del editor cuando tiene valor, si no al default del locale (`sections.announcement_bar.message`, "Envío a todo el país. Garantía de 90 días." — dos hechos, sin urgencia fabricada, respetando D-16 del contrato de marca); el link es un setting `url` (nunca texto libre) con su nombre accesible también desde el locale. Sin script, sin memoria por visitante — estática y no dismissible por decisión (D-13). Montada primera en `sections/header-group.json`, arriba del header, y sumada a `RENDER_ALLOWLIST` en `scripts/check-allowlist.mjs` en el mismo cambio.
- **El presupuesto vertical y el orden de apilamiento del shell están escritos una sola vez.** Seis tokens estáticos nuevos en `snippets/css-variables.liquid`: `--announcement-bar-height`, `--header-height`, `--header-height-desktop` y los tres niveles nombrados `--z-sticky-header` < `--z-fab` < `--z-overlay`. El orden invierte a propósito la recomendación del research (botón flotante por encima del cart drawer): un drawer que el botón de chat perfora se ve roto, así que el nivel de overlay cubre tanto al header como al botón — desviación registrada en `OVERRIDES.md`.
- **El header reconstruido hace tres cosas y nada más.** El titular con el nombre de la tienda se reemplazó por la marca inlineada (link a `routes.root_url`, nombre accesible desde `shop.name`, altura constreñida contra `--header-height` para no empujar el header más alto que el espacio reservado). El componente `<shopify-account>` y el contador de carrito del starter se conservan verbatim — nadie recablea el contador a `cart:updated` en esta fase (D-07). El menú queda detrás de `menu.links.size > 0`, así que vacío no deja un hueco visible (Pitfall 9). Solo en teléfono el header pasa a `position: sticky` (nunca `fixed`) offset por `--announcement-bar-height`, al mismo nivel `--z-sticky-header` que usa la franja — los dos leen como un bloque único. El comentario del archivo registra el costo total pinned en teléfono (2,25rem + 3,75rem = 6rem) para que las Fases 6 y 13 lo pesen contra un número.

## Deviations from Plan

**1. [Rule 3 - Blocking tooling] `svgo` sustituido por un script Node de una sola corrida**
- **Found during:** Task 1
- **Issue:** El plan (y el research) preveían correr `npx svgo` one-off sobre `kinelia_horizontal.svg`. El entorno de ejecución no tiene `svgo` instalado ni red hacia el registro de npm — `npx svgo` habría fallado.
- **Fix:** Se escribió un script Node de una sola corrida (stdlib únicamente, sin `require`/`import` de terceros) que remueve los atributos `fill` duplicados que dejó potrace en ambos SVG, y en el isotipo además la declaración XML, el `DOCTYPE` y el comentario `<metadata>`. No se agregó ninguna dependencia a `package.json`.
- **Files modified:** `assets/kinelia_horizontal.svg`, `assets/kinelia_isotipo.svg`
- **Verification:** ambos archivos son vectores válidos con `viewBox`, ningún elemento repite `fill`, y ambos son medibles más chicos que su fuente (7.587 B < 7.617 B; 3.085 B < 3.419 B) — assert de Task 1, verde.
- **Commit:** `54d9288`

**2. [Decisión del plan, no del research] Orden de apilamiento invertido**
- **Found during:** Task 2
- **Issue:** `03-RESEARCH.md` sugería el botón flotante de WhatsApp por encima del cart drawer en el orden de apilamiento.
- **Fix:** El plan lo invierte a propósito: header sticky < botón flotante < overlay. Un cart drawer (Fase 6) o una guía de talles (Fase 5) que el botón de chat perfora visualmente se ve roto, así que el nivel de overlay cubre tanto al header como al botón flotante.
- **Files modified:** `snippets/css-variables.liquid` (comentario del bloque de tokens), `OVERRIDES.md` (divergencia registrada)
- **Verification:** los tres tokens `--z-sticky-header` (10) < `--z-fab` (20) < `--z-overlay` (30) existen con el orden documentado — assert de Task 2, verde.
- **Commit:** `1be7f47`

**Total deviations:** 2 (1 Rule 3 - tooling bloqueado; 1 decisión de diseño explícita del plan sobre la recomendación del research). **Impact:** ninguna afecta el alcance ni el contrato de SHELL-02; ambas quedan registradas en `OVERRIDES.md` para que las fases siguientes (5, 6, 13) las hereden sin sorpresas.

## Authentication Gates

Ninguno — esta fase no toca ninguna integración externa.

## Issues Encountered

**`shopify theme check` no está disponible en esta máquina de ejecución (gap de entorno ya registrado en STATE.md y en `.planning/WINDOWS.md` #9 para la Fase 2, misma clase de problema).** El binario `shopify` no está instalado y no hay red hacia el registro de npm para instalarlo ni hacia `raw.githubusercontent.com` para que Theme Check resuelva sus schemas remotos. Igual que en 03-01 y 03-02, se corrió la verificación sustituta completa:

- `node scripts/check-allowlist.mjs` → exit 0 (11 templates + 2 section-groups, 14 tipos de section referenciados, 13 archivos en `assets/`)
- `node scripts/check-secrets.mjs` → exit 0 (132 archivos trackeados)
- `node scripts/check-tokens.mjs` → exit 0 (15 chunks de estilo, 43 custom properties, 15 settings ids)
- `node scripts/check-seams.mjs` → exit 0 (contrato intacto: 5 nombres del bus, 8 tipos de `/collect`, 7 atributos de carrito)
- Cada assert de `<verify>` de las tres tasks, ejecutado línea por línea desde este agente — todos verdes
- `git status --porcelain` → sin archivos borrados en ningún punto del plan

**`npm run lint` completo con Theme Check debe correrse en CI / entorno con red antes del merge de la Fase 3** — seguimiento ya anotado en STATE.md desde 03-01/03-02, no es nuevo de este plan.

## Broken-windows ledger

Sin stubs, sin tests salteados, sin nueva entrada de `unrun-verify`: el único `<verify>` que no corrió de punta a punta es el prefijo `shopify theme check` de `npm run lint`, ya rastreado a nivel de proyecto en `.planning/WINDOWS.md` (#9, phase 02, `flaky-tool`) y en STATE.md como blocker de la Fase 3 — no se abre una entrada nueva para la misma causa raíz.

## Threat surface scan

Sin superficie de seguridad nueva fuera del `<threat_model>` del plan.

- **T-03-11 (link de la franja tomado de un valor de merchant):** el setting `link` es de tipo `url` (constreñido por la plataforma), nunca texto libre — assert de Task 2 verde.
- **T-03-12 (override del mensaje interpolado en la página):** se renderiza con un output plano (`{{ announcement_message }}`), que Liquid auto-escapa; nunca se interpola en un `{% style %}` o `{% script %}` — `check-tokens.mjs` no reporta violación.
- **T-03-13 (marca vendorizada con script o referencia externa):** ambos SVG se leyeron antes de commitear; son documentos vectoriales planos, sin `<script>` ni referencia remota — assert de Task 1 verde.
- **T-03-14 (bloque pinned obstruyendo el buy box o generando layout shift):** ambas alturas se reservan con tokens antes de pintar; header y franja usan `position: sticky` (nunca `fixed`), quedando en el flujo del documento; el costo total (6rem) queda anotado en el comentario del header para la Fase 6 y se mide en la Fase 13.
- **T-03-15 (copy que la tienda no puede sostener):** el mensaje vive en el locale bajo el contrato de marca, que bloquea las categorías de claim prohibido; declara envío nacional y la garantía de 90 días, ambos hechos que el roadmap del negocio ya compromete.
- **T-03-SC (supply chain vía instalación de paquete):** ningún paquete se instaló; el optimizador de vectores es una invocación de desarrollo de una sola corrida con Node stdlib.

Sin flags nuevos.

## Next Phase Readiness

- **SHELL-02 (mitad del header) queda satisfecha por este plan.** La mitad del footer (links legales, WhatsApp, newsletter tras flag, íconos de pago) es responsabilidad de **03-04**, que cierra SHELL-02 por completo.
- Los seis tokens del shell (`--announcement-bar-height`, `--header-height`, `--header-height-desktop`, `--z-sticky-header`, `--z-fab`, `--z-overlay`) quedan disponibles para que 03-04 posicione el botón flotante de WhatsApp contra `--z-fab` sin inventar un nuevo nivel.
- **Seguimiento (no bloqueante, ya en STATE.md/WINDOWS.md):** correr `npm run lint` completo con Theme Check en CI / entorno con red antes del merge de la Fase 3.

## Self-Check: PASSED

- `assets/kinelia_horizontal.svg` — FOUND
- `assets/kinelia_isotipo.svg` — FOUND
- `sections/announcement-bar.liquid` — FOUND
- `sections/header.liquid` — FOUND (modified, verified against Task 3 assertions)
- `snippets/css-variables.liquid` — FOUND (six new tokens confirmed present)
- `.planning/phases/03-layout-shell-seams-de-etapa-2/03-03-SUMMARY.md` — FOUND
- Commit `54d9288` (Task 1) — FOUND (`git log --oneline --all | grep 54d9288`)
- Commit `1be7f47` (Task 2) — FOUND
- Commit `b8d4b13` (Task 3) — FOUND
- `git status --porcelain` (diff-filter=D check across all three commits) — sin archivos borrados
- Los cuatro checkers Node (`check-allowlist`, `check-secrets`, `check-tokens`, `check-seams`) — los cuatro exit 0 en el estado final del árbol

---
*Phase: 03-layout-shell-seams-de-etapa-2*
*Completed: 2026-09-11*
