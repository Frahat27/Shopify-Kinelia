# Phase 3: Layout shell + seams de Etapa 2 - Context

**Gathered:** 2026-09-09
**Status:** Ready for planning

<domain>
## Phase Boundary

El shell del documento, el header/footer mínimos y todos los hooks no-op de Etapa 2 existen
como ~1 línea cada uno, para que la medición diferida (pixel de Meta, CAPI, GA4, script de
atribución) se conecte en Etapa 2 sin refactor.

Scope (de ROADMAP Phase 3, Success Criteria):
1. `theme.liquid` renderiza el shell con `css-variables.liquid` (tokens, ya existe) y
   `analytics-hooks.liquid` (no-op, seam de Etapa 2 — se crea en esta fase).
2. Header mínimo + footer con links legales AR, afordancia de WhatsApp y bloque de
   newsletter deshabilitado.
3. Bus de eventos DOM (`variant:changed`, `product:added`, `cart:updated`) listo para el
   sticky ATC (Fase 6) y para consumidores de Etapa 2.
4. `ETAPA-2-SEAMS.md` documenta el contrato de cart attributes (`visitante_id`, `utm_*`,
   `view`) y de eventos para el trabajo de medición diferido.

Requirements: SHELL-01, SHELL-02, SHELL-03, SHELL-04.

**Not in this phase:**
- Contenido real de las páginas legales AR + Botón de Arrepentimiento (Fase 11) — acá solo
  se crean páginas stub y el linklist del footer.
- Cart drawer (Fase 6), predictive search (Fase 11), buy box y guía de talles (Fase 5).
- Emisores reales de los eventos DOM: `variant:changed` (Fase 5), `product:added` /
  `cart:updated` (Fases 5-6). Fase 3 entrega el bus + el contrato, nadie emite todavía.
- focus-trap reutilizable (Fase 6 cart drawer / Fase 5 guía de talles).
- Cualquier código de atribución / pixel / GA4 activo — Etapa 2. El seam solo deja el
  espacio documentado.
- Home real (Fase 11), modelo de datos de producto (Fase 4).

</domain>

<decisions>
## Implementation Decisions

### Seam de analytics (`snippets/analytics-hooks.liquid`) — SHELL-01

- **D-01:** `analytics-hooks.liquid` es un snippet **no-op**: no renderiza nada visible ni
  ejecutable en Etapa 1. Contiene (a) un comentario-contrato Liquid que lista los
  consumidores de Etapa 2 (pixel de Meta, CAPI, GA4, script de atribución `kinelia-atribucion.js`),
  y (b) la línea `<script src>` de `kinelia-atribucion.js` **comentada** (comentario HTML/Liquid,
  no un setting-gated toggle — un toggle del theme editor sin asset detrás es peor que un
  comentario explícito, y el archivo vive en el repo hermano, no en este repo). Cero bytes
  al cliente en Etapa 1.
- **D-02:** **No** se emite un stub `window.kinelia.track()` ni `window.dataLayer = []`. El
  bus de eventos DOM (D-05) es la única API estable interna del tema. En Etapa 2,
  `analytics-hooks.liquid` se suscribe al bus DOM y reenvía a los endpoints. Dos sistemas de
  eventos paralelos = deuda innecesaria sobre un baseline "casi cero JS".
- **D-03:** El `{% render 'analytics-hooks' %}` se monta en `theme.liquid` dentro del
  `<head>`, **después de `{% render 'meta-tags' %}` y antes de `{{ content_for_header }}`**.
  Es donde `kinelia-atribucion.js` necesita correr (captura first-touch de UTMs y set de
  cookie de primera parte antes de cualquier navegación). **Un solo hook** — no un
  `analytics-hooks-head` + `analytics-hooks-body`. Etapa 2 agrega un body-hook si GA4
  concretamente lo pide (diferido, ver Deferred Ideas).
  — **Reversibility:** reversible — mover un `{% render %}` una línea es local.

### `ETAPA-2-SEAMS.md` — contrato de medición diferida (SHELL-04)

- **D-04:** `ETAPA-2-SEAMS.md` es **híbrido**: transcribe el contrato **inline** como spec
  propia del tema (para que no se rompa si el repo hermano se mueve o se hace privado) y
  **cita** los archivos del repo hermano como origen. Contenido mínimo del doc:
  - **Cart attributes** que Etapa 2 escribe vía `/cart/update.js` (read-modify-write, sin
    pisar existentes): `visitante_id`, `utm_source`, `utm_medium`, `utm_campaign`,
    `utm_term`, `utm_content`, y `view` (el slug del avatar de `?view=`, para atribución
    multi-avatar — Fase 10).
  - **Eventos del funnel** que consume el endpoint `/collect` del repo hermano:
    `view_lp`, `scroll_50`, `scroll_75`, `ver_oferta`, `add_to_cart`, `inicio_checkout`,
    `paso_checkout`, `compra`.
  - **Eventos del bus DOM del tema** (D-05) y la forma de su `detail` — el mapa de "evento
    DOM interno → evento `/collect`" lo cablea Etapa 2.
  - El hook `data-kinelia="oferta"` en el bloque de precio (lo consume el
    IntersectionObserver de `ver_oferta` — el atributo lo pone la Fase 5 en el buy box; acá
    solo se documenta que debe existir).
  - Dónde va el `<script>` de atribución (`<head>`, todas las páginas) y qué placeholder
    tiene el endpoint (`https://<proyecto>.supabase.co/functions/v1/collect`).
  — **Reversibility:** reversible — es un doc; no hay código que dependa de él en Fase 3.

### Bus de eventos DOM (`assets/events.js`) — SHELL-03

- **D-05:** **Un solo módulo** `assets/events.js` (~40-50 líneas, cargado con `defer`).
  Expone `Kinelia.events.emit(name, detail)` / `.on(name, cb) → handle` / `.off(handle)`.
  Internamente **es** `document.dispatchEvent(new CustomEvent(name, { detail }))` +
  `document.addEventListener`. El wrapper solo agrega: nombres tipados (evita typos), handles
  de desuscripción, y un punto único para debug. **No** hay registro propio de callbacks ni
  cola. Etapa 2 y las fases de sección pueden suscribirse con `Kinelia.events.on(...)` **o**
  con `document.addEventListener(...)` directo — es el mismo evento.
  — **Reversibility:** costly — una vez que Fases 5-6 y Etapa 2 se suscriben, renombrar un
  evento o cambiar la forma del `detail` toca todos esos consumidores. Los nombres y payloads
  se fijan en el plan y se documentan en `ETAPA-2-SEAMS.md` antes de que exista el primer
  emisor.
- **D-06:** **5 eventos**: `variant:changed`, `product:added`, `cart:updated`,
  `cart:loading`, `cart:error`. La forma exacta del `detail` de cada uno la fija el plan y
  se documenta en `ETAPA-2-SEAMS.md` (ej. tentativo: `variant:changed` →
  `{ variantId, available, price }`; `cart:updated` → `{ itemCount, cart }`;
  `cart:error` → `{ message, source }`). `cart:loading` / `cart:error` los consume el cart
  drawer / buy box en Fase 6 — se definen ahora para no re-tocar el contrato después.
- **D-07:** **Nadie emite eventos en Fase 3.** La fase entrega el módulo + el contrato
  documentado. Se testea con `Kinelia.events.emit(...)` desde la consola del navegador. El
  header **no** se recablea para escuchar `cart:updated` (el contador sigue saliendo de
  `cart.item_count` en el render Liquid; el cableado reactivo llega con el cart drawer en
  Fase 6).
- **D-08:** a11y helpers — Fase 3 agrega **solo** el contenedor `<div aria-live="polite">`
  en `theme.liquid` (preocupación del shell) + un helper `Kinelia.a11y.announce(msg)` (~10
  líneas, puede vivir en `events.js` o `assets/a11y.js` — discreción del plan). El
  **focus-trap se difiere** a Fase 6 (cart drawer) / Fase 5 (guía de talles), sus
  consumidores reales. Esto honra el ALLOWLIST ("bus de eventos + helpers a11y → Fase 3")
  sin código huérfano pesado. El locale ya tiene las claves `accessibility.*`.
- **D-09:** El plan agrega `assets/events.js` (y `a11y.js` si se separa) a la tabla
  `## Renderiza` de `ALLOWLIST.md` **y** afloja la regla anti-JS de
  `scripts/check-allowlist.mjs` (hoy falla si aparece cualquier `.js`/`.mjs` en `assets/`)
  **en la misma PR**. Es el primer módulo JS del tema — la regla de adición de ALLOWLIST y
  la nota de STATE.md ("Fase 1 no agrega JS; fases posteriores actualizan el checker junto
  con la tabla") lo previeron.
  — **Reversibility:** costly — es el precedente de cómo entra JS al tema; el patrón (asset
  allowlisteado + checker actualizado en la misma PR) lo heredan Fases 5, 6, 11.

### Header mínimo (`sections/header.liquid` + `announcement-bar.liquid`) — SHELL-02

- **D-10:** El header lleva: **logo** (link a `routes.root_url`) + **carrito con contador**
  + **ícono de cuenta condicional** a `shop.customer_accounts_enabled` (se mantiene el
  `<shopify-account>` del starter). Sin otros íconos, sin buscador en el header.
- **D-11:** **Menú de navegación**: se conserva el `link_list` `menu` del starter en el
  schema del header, **vacío por defecto**, preparado para un futuro portfolio de 1-2
  productos más. El markup del menú está presente pero colapsa a nada cuando el linklist
  está vacío.
- **D-12:** **Sticky solo en mobile**, e **incluye la barra de anuncio**: en mobile, el
  header compacto (logo + carrito + cuenta) **y** la franja de anuncio quedan fijos arriba
  juntos. (El usuario eligió esto sobre la recomendación de que solo el header fuera sticky.)
  El plan debe: (a) cuidar CLS y la altura fija total sobre el fold, (b) coordinar con la
  sticky ATC de Fase 6 — la ATC va pegada al **borde inferior**, así que no se solapan
  espacialmente, pero sí compiten por viewport en la zona más cara de la página.
  — **Reversibility:** reversible — es CSS `position: sticky` con media query.
- **D-13:** **Barra de anuncio**: `section` propia `sections/announcement-bar.liquid`
  montada en `sections/header-group.json`, editable desde el theme editor. **Estática, no
  dismissible** (dismissible = JS + `localStorage` por visitante, no lo amerita). Una clave
  de locale para el mensaje + un link opcional (también clave de locale). Contenido tipo
  "Envío a todo el país" / "Garantía de 90 días" — el texto exacto lo decide el plan/copy
  **respetando D-16 del Brand Book** (nada de urgencia falsa, contadores, stock inventado,
  descuentos que no existen).

### Footer (`sections/footer.liquid`) — SHELL-02

- **D-14:** **Links legales**: menú de Shopify (`link_list` del footer, editable en el theme
  editor) + **páginas stub creadas ahora**. El *contenido* de las páginas es propiedad del
  merchant / editor de tema (regla `docs/RELEASE.md`: la integración de GitHub es dueña de
  `templates/*.json`, no del contenido de páginas), así que "crear las páginas stub + armar
  el linklist" es un **paso de runbook/admin**, no de código. Páginas stub con placeholder:
  `/pages/terminos`, `/pages/privacidad`, `/pages/cambios-y-devoluciones`,
  `/pages/datos-de-la-empresa` (los slugs exactos los fija el plan). Fase 11 llena el
  contenido y agrega el Botón de Arrepentimiento (su link del footer puede ya apuntar a su
  página stub). Nada de links a `#` ni rutas 404 visibles.
- **D-15:** **WhatsApp**: link "Pedir por WhatsApp" en el footer (clave
  `kinelia.cta.pedir_whatsapp`, ya en el locale) **+ botón flotante global** (FAB) fijo
  abajo-derecha en todas las páginas. El número es un **setting del theme** (schema) con
  placeholder. El plan debe resolver que el FAB **se reposiciona o se oculta cuando la
  sticky ATC está visible en mobile** (la ATC gana esa zona — es la que convierte). El FAB
  respeta el sistema plano: **sin sombra (D-11 del Brand Book), sin pulso/animación** (evita
  el tono "farmacia"), color de marca. Necesita un SVG de ícono en `assets/` (allowlist) +
  CSS; el mínimo JS necesario (mostrar/ocultar según ATC) puede vivir en `events.js` o
  diferirse la lógica de convivencia a Fase 6.
  — **Reversibility:** reversible — el FAB es un componente aislado; el setting del número no
  crea contrato con nada externo.
- **D-16:** **Newsletter deshabilitado**: el bloque existe en `footer.liquid` envuelto en
  `{% if section.settings.show_newsletter %}` con **default `false`**. Cero markup
  renderizado hoy. Etapa 2 (flujos de email) lo prende con el flag.
- **D-17:** **Iconos de medios de pago**: se mantiene el bloque del starter con el checkbox
  `show_payment_icons`, condicional a `shop.enabled_payment_types`. Hoy puede estar vacío
  (MercadoPago se configura en Fase 12) — el bloque colapsa a nada hasta entonces y aparece
  solo cuando hay medios reales. La reassurance de pago principal vive en el buy box (BUY-04),
  el footer es secundario.

### Favicon / logo en el shell

- **D-18:** El plan copia `A- Logo/A.2 Logo/kinelia_horizontal.svg` (→ logo header/footer) y
  `A- Logo/A.1 Isotipo/kinelia_isotipo.svg` (→ favicon / contextos compactos) a `assets/`,
  con una pasada de SVGO (`kinelia_horizontal.svg` tiene atributos `fill` duplicados de
  potrace). Se agregan a la tabla `## Renderiza` de `ALLOWLIST.md`. `<link rel="icon">` en
  `theme.liquid`. Detalle en STATE.md "Assets recibidos".

### Claude's Discretion

- Forma exacta del `detail` de cada uno de los 5 eventos DOM (se fija en el plan, se
  documenta en `ETAPA-2-SEAMS.md`).
- Si `Kinelia.a11y.announce` vive en `events.js` o en un `assets/a11y.js` separado.
- Estructura interna de `events.js` (IIFE vs módulo, namespace exacto `Kinelia` vs otro).
- Slugs exactos de las páginas legales stub y estructura del linklist del footer.
- Texto exacto del mensaje de la barra de anuncio (respetando D-16 del Brand Book).
- Markup y CSS concretos del header / footer / FAB dentro de las restricciones del sistema
  de diseño (plano, sin sombras, tokens `var(--*)` únicamente).
- Si la lógica de convivencia FAB ↔ sticky ATC se implementa ahora (stub) o se completa en
  Fase 6.
- Si se mantiene un `<link rel="icon">` PNG de fallback además del SVG.
- Cómo se testea el bus (dispatch manual desde consola documentado en el plan / UAT).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Contrato de la fase
- `.planning/ROADMAP.md` §"Phase 3: Layout shell + seams de Etapa 2" — Goal + Success Criteria.
- `.planning/REQUIREMENTS.md` — SHELL-01, SHELL-02, SHELL-03, SHELL-04.

### Repo hermano (Kinelia / backend de datos) — origen del contrato de Etapa 2
- `../../Kinelia/web/kinelia-atribucion.js` — el script de atribución que Etapa 2 va a
  cargar: cookie de primera parte `kinelia_attr`, `visitante_id`, first-touch de UTMs, sync
  de cart attributes vía `/cart/update.js`, cola de eventos a `/collect`, hook
  `data-kinelia="oferta"`. **Este es el contrato que `ETAPA-2-SEAMS.md` transcribe.**
- `../../Kinelia/supabase/functions/collect/index.ts` — endpoint `/collect`: el `Set` de
  tipos de evento válidos (`view_lp`, `scroll_50`, `scroll_75`, `ver_oferta`, `add_to_cart`,
  `inicio_checkout`, `paso_checkout`, `compra`), la forma del body (`{ visitante_id, eventos: [...] }`),
  validación de origen (`COLLECT_ORIGENES`).
- `../../Kinelia/.claude/CLAUDE.md` — contrato de idempotencia y "CPA siempre efectivo";
  contexto de por qué la atribución no se puede backfillear.

### Sistema de diseño y contratos heredados (este repo)
- `.planning/phases/02-sistema-de-diseno-por-tokens/02-CONTEXT.md` — D-01..D-18 de tokens:
  regla del terracota, sin sombras/gradientes (D-11), radius 2px/0, tipografía, y **D-16
  claims prohibidos** (aplica a la barra de anuncio y a cualquier copy nueva).
- `docs/BRAND-COPY.md` — todo string de UI sale del locale bajo namespace `kinelia`; voseo;
  claims prohibidos; cómo se agrega un CTA (locale + este doc en la misma PR).
- `snippets/css-variables.liquid` — los tokens `var(--*)`; todo CSS nuevo los consume, cero
  hex/nombres de fuente literales (`scripts/check-tokens.mjs` lo hace cumplir).
- `assets/base.css` — primitivas de diseño ya derivadas de tokens (botón, formularios,
  tipografía) que el header/footer/FAB reutilizan.
- `layout/theme.liquid` — estado actual del shell: dónde entran `css-variables`, los 2
  preloads de fuente, `critical.css`, `base.css`, `meta-tags`, `content_for_header`.
- `layout/password.liquid` — el otro layout (tienda con contraseña hasta Fase 14); si el
  shell cambia algo estructural, revisar si aplica acá también.

### Reglas de superficie del tema
- `ALLOWLIST.md` + `scripts/check-allowlist.mjs` — "se reduce por NO REFERENCIAR"; la tabla
  `## Renderiza`; la **regla anti-JS que Fase 3 afloja** (§"Nunca agregar" + §"Regla de
  adición" + §"Desviación registrada" que ya asigna "bus de eventos DOM + helpers de
  accesibilidad → Fase 3").
- `OVERRIDES.md` — cualquier divergencia de Skeleton (nuevo asset JS, nuevas sections) se
  registra acá en la misma PR.
- `docs/PERF-BUDGET.md` — LCP < 2,5 s; `total-blocking-time` ≤ 200 ms y
  `resource-summary:script:size` ≤ 150 000 B (SUPUESTO, warn, solo local). El JS de Fase 3
  (`events.js` + FAB) es el primer consumo real de ese presupuesto.
- `docs/RELEASE.md` — regla de propiedad del contenido: la integración de GitHub de Shopify
  es dueña de `config/settings_data.json` y `templates/*.json`; las páginas stub y el
  linklist del footer se editan en STAGING (theme editor) y la integración commitea.
- `.theme-check.yml` — `theme-check:recommended` incluye `AssetSizeJavaScript`,
  `RemoteAsset`; el JS nuevo debe mantener el lint verde (`--fail-level error`).

### Base Skeleton — leer el estado actual antes de modificar
- `sections/header.liquid`, `sections/footer.liquid`, `sections/header-group.json`,
  `sections/footer-group.json` — markup + schema + `{% stylesheet %}` actuales (ya
  renombrados a tokens `var(--color-text)` en plan 02-02).
- `snippets/meta-tags.liquid`, `snippets/image.liquid` — helpers existentes del `<head>`.
- `locales/es.default.json` + `locales/es.default.schema.json` — claves existentes
  (`accessibility.*`, `general.social.whatsapp`, `kinelia.cta.pedir_whatsapp`, etc.); las
  claves nuevas van a los dos archivos.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `snippets/css-variables.liquid` + `assets/base.css`: todo el CSS del header/footer/barra
  de anuncio/FAB se construye sobre estas primitivas y tokens. Sin hex literales.
- `locales/es.default.json`: ya tiene `general.social.whatsapp`,
  `kinelia.cta.pedir_whatsapp`, `accessibility.skip_to_content` / `close` / `loading` — la
  barra de anuncio, el FAB y el `announce()` reutilizan / extienden estas claves.
- `sections/header.liquid` / `footer.liquid`: ya tienen bloque `{% stylesheet %}` scoped y
  schema con `link_list`; la Fase 3 extiende, no reescribe.
- Logos vectoriales limpios ya identificados (STATE.md "Assets recibidos"):
  `kinelia_horizontal.svg` (7,6 KB) y `kinelia_isotipo.svg` (3,4 KB).

### Established Patterns
- **Checker ejecutable como copia de un contrato**: `check-allowlist.mjs` (superficie),
  `check-tokens.mjs` (tokens + locale + copy de marca). Fase 3 sigue el patrón: si agrega
  una regla verificable (ej. "todo evento del bus está documentado en `ETAPA-2-SEAMS.md`"),
  la hace ejecutable.
- **Reducir por no referenciar, nunca borrar** (`ALLOWLIST.md`): ningún archivo del starter
  se elimina; lo que no se usa queda sin referenciar.
- **Asset nuevo → fila en `## Renderiza` + `OVERRIDES.md` en la misma PR.**
- **Contenido de páginas / `templates/*.json` = propiedad del theme editor** (`docs/RELEASE.md`),
  no de git — las páginas stub son un paso de admin/runbook.
- **`{% render %}` de snippets de seam en `theme.liquid`** — el patrón ya existe
  (`css-variables`, `meta-tags`); `analytics-hooks` se suma igual.

### Integration Points
- `layout/theme.liquid` `<head>`: se agrega `{% render 'analytics-hooks' %}` tras
  `meta-tags`, `{{ 'events.js' | asset_url | script_tag }}` (defer) y `<link rel="icon">`.
- `layout/theme.liquid` `<body>`: se agrega el `<div aria-live="polite">` del shell y,
  posiblemente, el FAB de WhatsApp (o el FAB vive en `footer-group`).
- `sections/header-group.json`: se monta `announcement-bar` además de `header`.
- `sections/header.liquid` / `footer.liquid`: markup + schema nuevos (logo, cuenta, menú;
  links legales, WhatsApp, newsletter tras flag, iconos de pago).
- `scripts/check-allowlist.mjs`: se afloja la regla anti-JS y se listan los assets nuevos.
- `locales/es.default.json` + `.schema.json`: claves nuevas.
- Repo hermano: no se modifica — `ETAPA-2-SEAMS.md` se alinea a su contrato existente.

</code_context>

<specifics>
## Specific Ideas

- El shell hereda la austeridad del sistema visual: plano, sin sombras, sin degradados,
  crema de fondo (nunca blanco), verde que estructura, terracota SOLO en el precio. El FAB
  de WhatsApp y la barra de anuncio no rompen esto — nada de pulsos, sombras ni urgencia.
- El tráfico entra de un anuncio de Meta directo a la PDP (compra por impulso, público
  45-65, mobile, a contraluz). El header no compite por la atención; su única función es
  "esto es Kinelia" + acceso al carrito. Todo lo que distrae del buy box es fuga de CVR.
- Etapa 2 se conecta a este shell sin refactor: ese es el criterio de éxito. Cada seam
  (`analytics-hooks.liquid`, el bus DOM, `ETAPA-2-SEAMS.md`, el `<script>` comentado de
  atribución) existe para que "conectar la medición" sea editar un archivo ya referenciado,
  no reestructurar el `<head>`.
- El FAB de WhatsApp + la barra de anuncio sticky son decisiones del usuario por encima de
  la recomendación de mantener el shell más liviano — el plan las implementa pero cuida el
  presupuesto de CLS / viewport / JS y la convivencia con la sticky ATC de Fase 6.

</specifics>

<deferred>
## Deferred Ideas

- **focus-trap reutilizable** → Fase 6 (cart drawer) / Fase 5 (guía de talles), sus
  consumidores reales. Fase 3 solo entrega `announce()` + `<div aria-live>`.
- **analytics body-hook (`analytics-hooks-body.liquid`)** → Etapa 2, si GA4 concretamente
  necesita un hook antes de `</body>`. Fase 3 entrega un solo hook en `<head>`.
- **Consumidores de `cart:loading` / `cart:error`** → Fase 6 (cart drawer / buy box
  muestran spinners y errores). Fase 3 define los eventos, nadie los consume.
- **Recableado reactivo del contador de carrito del header** (escuchar `cart:updated`) →
  Fase 6 con el cart drawer. Hoy sale de `cart.item_count` en el render Liquid.
- **Contenido real de páginas legales AR + Botón de Arrepentimiento** → Fase 11. Fase 3
  crea páginas stub.
- **Lógica completa de convivencia FAB WhatsApp ↔ sticky ATC en mobile** → puede
  completarse en Fase 6 cuando exista el layout de la ATC; Fase 3 deja el FAB y, como mucho,
  un stub de la lógica.
- **Endurecer `check-tokens.mjs`** (WR-01/WR-02 de `02-REVIEW.md`: regex de color solo
  `#hex`, parser de nesting de 1 nivel) — antes de que el CSS use nesting. El CSS del
  header/footer de Fase 3 podría forzar la mano; si no, queda para una pasada de hardening.
- **WR-04 de `02-REVIEW.md`**: `<meta charset>` / `viewport` empujados KB adentro del
  `<head>` por el bloque de tokens + 5 `@font-face`. Si Fase 3 toca el orden del `<head>`,
  considerar subir charset/viewport arriba de todo.

### Reviewed Todos (not folded)
None — no había todos pendientes que matchearan la fase.

</deferred>

---

*Phase: 3-layout-shell-seams-de-etapa-2*
*Context gathered: 2026-09-09*
