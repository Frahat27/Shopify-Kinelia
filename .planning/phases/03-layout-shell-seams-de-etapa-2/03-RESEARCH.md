# Phase 3: Layout shell + seams de Etapa 2 - Research

**Researched:** 2026-09-09
**Domain:** Shopify theme shell (Liquid) sobre base Skeleton — `layout/theme.liquid`, header/footer, bus de eventos DOM en vanilla JS, contrato de medición diferida (cart attributes + eventos)
**Confidence:** HIGH para el estado de la base y el contrato del repo hermano (leídos en esta sesión); MEDIUM para umbrales exactos de Theme Check y detalles de compliance AR (Fase 11)

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Seam de analytics (`snippets/analytics-hooks.liquid`) — SHELL-01**

- **D-01:** `analytics-hooks.liquid` es un snippet **no-op**: no renderiza nada visible ni ejecutable en Etapa 1. Contiene (a) un comentario-contrato Liquid que lista los consumidores de Etapa 2 (pixel de Meta, CAPI, GA4, script de atribución `kinelia-atribucion.js`), y (b) la línea `<script src>` de `kinelia-atribucion.js` **comentada** (comentario HTML/Liquid, no un setting-gated toggle — un toggle del theme editor sin asset detrás es peor que un comentario explícito, y el archivo vive en el repo hermano, no en este repo). Cero bytes al cliente en Etapa 1.
- **D-02:** **No** se emite un stub `window.kinelia.track()` ni `window.dataLayer = []`. El bus de eventos DOM (D-05) es la única API estable interna del tema. En Etapa 2, `analytics-hooks.liquid` se suscribe al bus DOM y reenvía a los endpoints. Dos sistemas de eventos paralelos = deuda innecesaria sobre un baseline "casi cero JS".
- **D-03:** El `{% render 'analytics-hooks' %}` se monta en `theme.liquid` dentro del `<head>`, **después de `{% render 'meta-tags' %}` y antes de `{{ content_for_header }}`**. Es donde `kinelia-atribucion.js` necesita correr (captura first-touch de UTMs y set de cookie de primera parte antes de cualquier navegación). **Un solo hook** — no un `analytics-hooks-head` + `analytics-hooks-body`. Etapa 2 agrega un body-hook si GA4 concretamente lo pide (diferido). Reversible.

**`ETAPA-2-SEAMS.md` — contrato de medición diferida (SHELL-04)**

- **D-04:** `ETAPA-2-SEAMS.md` es **híbrido**: transcribe el contrato **inline** como spec propia del tema (para que no se rompa si el repo hermano se mueve o se hace privado) y **cita** los archivos del repo hermano como origen. Contenido mínimo:
  - **Cart attributes** que Etapa 2 escribe vía `/cart/update.js` (read-modify-write, sin pisar existentes): `visitante_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, y `view` (el slug del avatar de `?view=`, para atribución multi-avatar — Fase 10).
  - **Eventos del funnel** que consume el endpoint `/collect` del repo hermano: `view_lp`, `scroll_50`, `scroll_75`, `ver_oferta`, `add_to_cart`, `inicio_checkout`, `paso_checkout`, `compra`.
  - **Eventos del bus DOM del tema** (D-05) y la forma de su `detail` — el mapa "evento DOM interno → evento `/collect`" lo cablea Etapa 2.
  - El hook `data-kinelia="oferta"` en el bloque de precio (lo consume el IntersectionObserver de `ver_oferta`; el atributo lo pone la Fase 5 en el buy box; acá solo se documenta que debe existir).
  - Dónde va el `<script>` de atribución (`<head>`, todas las páginas) y qué placeholder tiene el endpoint (`https://<proyecto>.supabase.co/functions/v1/collect`).
  Reversible — es un doc; ningún código de Fase 3 depende de él.

**Bus de eventos DOM (`assets/events.js`) — SHELL-03**

- **D-05:** **Un solo módulo** `assets/events.js` (~40-50 líneas, cargado con `defer`). Expone `Kinelia.events.emit(name, detail)` / `.on(name, cb) → handle` / `.off(handle)`. Internamente **es** `document.dispatchEvent(new CustomEvent(name, { detail }))` + `document.addEventListener`. El wrapper solo agrega: nombres tipados (evita typos), handles de desuscripción, y un punto único para debug. **No** hay registro propio de callbacks ni cola. Etapa 2 y las fases de sección pueden suscribirse con `Kinelia.events.on(...)` **o** con `document.addEventListener(...)` directo — es el mismo evento. Costly: una vez que Fases 5-6 y Etapa 2 se suscriben, renombrar un evento o cambiar el `detail` toca todos esos consumidores; los nombres y payloads se fijan en el plan y se documentan en `ETAPA-2-SEAMS.md` antes de que exista el primer emisor.
- **D-06:** **5 eventos**: `variant:changed`, `product:added`, `cart:updated`, `cart:loading`, `cart:error`. La forma exacta del `detail` la fija el plan y se documenta en `ETAPA-2-SEAMS.md` (ej. tentativo: `variant:changed` → `{ variantId, available, price }`; `cart:updated` → `{ itemCount, cart }`; `cart:error` → `{ message, source }`). `cart:loading` / `cart:error` los consume el cart drawer / buy box en Fase 6 — se definen ahora para no re-tocar el contrato después.
- **D-07:** **Nadie emite eventos en Fase 3.** La fase entrega el módulo + el contrato documentado. Se testea con `Kinelia.events.emit(...)` desde la consola. El header **no** se recablea para escuchar `cart:updated` (el contador sigue saliendo de `cart.item_count` en el render Liquid; el cableado reactivo llega con el cart drawer en Fase 6).
- **D-08:** a11y helpers — Fase 3 agrega **solo** el contenedor `<div aria-live="polite">` en `theme.liquid` + un helper `Kinelia.a11y.announce(msg)` (~10 líneas, puede vivir en `events.js` o `assets/a11y.js` — discreción del plan). El **focus-trap se difiere** a Fase 6 / Fase 5. El locale ya tiene las claves `accessibility.*`.
- **D-09:** El plan agrega `assets/events.js` (y `a11y.js` si se separa) a la tabla `## Renderiza` de `ALLOWLIST.md` **y** afloja la regla anti-JS de `scripts/check-allowlist.mjs` (hoy falla si aparece cualquier `.js`/`.mjs` en `assets/`) **en la misma PR**. Es el primer módulo JS del tema. Costly — es el precedente de cómo entra JS al tema; el patrón (asset allowlisteado + checker actualizado en la misma PR) lo heredan Fases 5, 6, 11.

**Header mínimo (`sections/header.liquid` + `announcement-bar.liquid`) — SHELL-02**

- **D-10:** El header lleva: **logo** (link a `routes.root_url`) + **carrito con contador** + **ícono de cuenta condicional** a `shop.customer_accounts_enabled` (se mantiene el `<shopify-account>` del starter). Sin otros íconos, sin buscador en el header.
- **D-11:** **Menú de navegación**: se conserva el `link_list` `menu` del starter en el schema del header, **vacío por defecto**, preparado para un futuro portfolio de 1-2 productos más. El markup del menú está presente pero colapsa a nada cuando el linklist está vacío.
- **D-12:** **Sticky solo en mobile**, e **incluye la barra de anuncio**: en mobile, el header compacto y la franja de anuncio quedan fijos arriba juntos. El plan debe: (a) cuidar CLS y la altura fija total sobre el fold, (b) coordinar con la sticky ATC de Fase 6 (va pegada al borde inferior — no se solapan espacialmente, pero compiten por viewport). Reversible — CSS `position: sticky` con media query.
- **D-13:** **Barra de anuncio**: `section` propia `sections/announcement-bar.liquid` montada en `sections/header-group.json`, editable desde el theme editor. **Estática, no dismissible.** Una clave de locale para el mensaje + un link opcional (también clave de locale). Contenido tipo "Envío a todo el país" / "Garantía de 90 días" — el texto exacto lo decide el plan/copy **respetando D-16 del Brand Book** (nada de urgencia falsa, contadores, stock inventado, descuentos que no existen).

**Footer (`sections/footer.liquid`) — SHELL-02**

- **D-14:** **Links legales**: menú de Shopify (`link_list` del footer, editable en el theme editor) + **páginas stub creadas ahora**. El *contenido* de las páginas es propiedad del merchant / editor de tema (regla `docs/RELEASE.md`), así que "crear las páginas stub + armar el linklist" es un **paso de runbook/admin**, no de código. Páginas stub con placeholder: `/pages/terminos`, `/pages/privacidad`, `/pages/cambios-y-devoluciones`, `/pages/datos-de-la-empresa` (los slugs exactos los fija el plan). Fase 11 llena el contenido y agrega el Botón de Arrepentimiento (su link del footer puede ya apuntar a su página stub). Nada de links a `#` ni rutas 404 visibles.
- **D-15:** **WhatsApp**: link "Pedir por WhatsApp" en el footer (clave `kinelia.cta.pedir_whatsapp`, ya en el locale) **+ botón flotante global** (FAB) fijo abajo-derecha en todas las páginas. El número es un **setting del theme** (schema) con placeholder. El plan debe resolver que el FAB **se reposiciona o se oculta cuando la sticky ATC está visible en mobile**. El FAB respeta el sistema plano: **sin sombra (D-11 del Brand Book), sin pulso/animación**, color de marca. Necesita un SVG de ícono en `assets/` (allowlist) + CSS; el mínimo JS necesario puede vivir en `events.js` o diferirse la lógica de convivencia a Fase 6. Reversible.
- **D-16:** **Newsletter deshabilitado**: el bloque existe en `footer.liquid` envuelto en `{% if section.settings.show_newsletter %}` con **default `false`**. Cero markup renderizado hoy. Etapa 2 lo prende con el flag.
- **D-17:** **Iconos de medios de pago**: se mantiene el bloque del starter con el checkbox `show_payment_icons`, condicional a `shop.enabled_payment_types`. Hoy puede estar vacío (MercadoPago se configura en Fase 12) — el bloque colapsa a nada hasta entonces. La reassurance de pago principal vive en el buy box (BUY-04); el footer es secundario.

**Favicon / logo en el shell**

- **D-18:** El plan copia `A- Logo/A.2 Logo/kinelia_horizontal.svg` (→ logo header/footer) y `A- Logo/A.1 Isotipo/kinelia_isotipo.svg` (→ favicon / contextos compactos) a `assets/`, con una pasada de SVGO (`kinelia_horizontal.svg` tiene atributos `fill` duplicados de potrace). Se agregan a la tabla `## Renderiza` de `ALLOWLIST.md`. `<link rel="icon">` en `theme.liquid`. Detalle en STATE.md "Assets recibidos".

### Claude's Discretion

- Forma exacta del `detail` de cada uno de los 5 eventos DOM (se fija en el plan, se documenta en `ETAPA-2-SEAMS.md`).
- Si `Kinelia.a11y.announce` vive en `events.js` o en un `assets/a11y.js` separado.
- Estructura interna de `events.js` (IIFE vs módulo, namespace exacto `Kinelia` vs otro).
- Slugs exactos de las páginas legales stub y estructura del linklist del footer.
- Texto exacto del mensaje de la barra de anuncio (respetando D-16 del Brand Book).
- Markup y CSS concretos del header / footer / FAB dentro de las restricciones del sistema de diseño (plano, sin sombras, tokens `var(--*)` únicamente).
- Si la lógica de convivencia FAB ↔ sticky ATC se implementa ahora (stub) o se completa en Fase 6.
- Si se mantiene un `<link rel="icon">` PNG de fallback además del SVG.
- Cómo se testea el bus (dispatch manual desde consola documentado en el plan / UAT).

### Deferred Ideas (OUT OF SCOPE)

- **focus-trap reutilizable** → Fase 6 (cart drawer) / Fase 5 (guía de talles). Fase 3 solo entrega `announce()` + `<div aria-live>`.
- **analytics body-hook (`analytics-hooks-body.liquid`)** → Etapa 2, si GA4 concretamente necesita un hook antes de `</body>`.
- **Consumidores de `cart:loading` / `cart:error`** → Fase 6. Fase 3 define los eventos, nadie los consume.
- **Recableado reactivo del contador de carrito del header** (escuchar `cart:updated`) → Fase 6 con el cart drawer.
- **Contenido real de páginas legales AR + Botón de Arrepentimiento** → Fase 11. Fase 3 crea páginas stub.
- **Lógica completa de convivencia FAB WhatsApp ↔ sticky ATC en mobile** → puede completarse en Fase 6.
- **Endurecer `check-tokens.mjs`** (WR-01/WR-02 de `02-REVIEW.md`: regex de color solo `#hex`, parser de nesting de 1 nivel) — antes de que el CSS use nesting.
- **WR-04 de `02-REVIEW.md`**: `<meta charset>` / `viewport` empujados KB adentro del `<head>` por el bloque de tokens + 5 `@font-face`. Si Fase 3 toca el orden del `<head>`, considerar subir charset/viewport arriba de todo. **(Ver Common Pitfalls #1 — se recomienda resolverlo en esta fase.)**
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Descripción | Research Support |
|----|-------------|------------------|
| SHELL-01 | `theme.liquid` incluye el shell del documento con `css-variables.liquid` (tokens) y `analytics-hooks.liquid` (no-op, seam de Etapa 2) | `css-variables.liquid` ya está montado (línea 5 de `theme.liquid`). El shell ya existe. Este research documenta el orden del `<head>` (Architecture Pattern 1), dónde va `analytics-hooks` (D-03: tras `meta-tags`, antes de `content_for_header`), cómo se comenta el `<script src>` sin disparar `RemoteAsset` de Theme Check, y el fix de orden charset/viewport (Pitfall 1). |
| SHELL-02 | Header mínimo y footer con links legales AR, afordancia de WhatsApp y bloque de newsletter deshabilitado | Estado actual de `sections/header.liquid` / `footer.liquid` leído verbatim (ver Code Examples). Skeleton NO trae cart drawer / variant picker / predictive search — el header se construye, no se despoja (Architecture Pattern 4). Links legales AR obligatorios documentados (Pattern 5). FAB de WhatsApp: usar `var(--color-primary)`, nunca el verde de WhatsApp `#25D366` (Pitfall 4). Newsletter tras `{% if section.settings.show_newsletter %}` default `false`. |
| SHELL-03 | Bus de eventos DOM (`variant:changed`, `product:added`, `cart:updated`) listo para el sticky ATC y consumidores de Etapa 2 | Patrón de referencia: Horizon `assets/events.js` (clases `extends Event`, convención `namespace:verbo`) y Dawn `pubsub.js` (subscribe/publish). Kinelia usa un wrapper propio sobre `CustomEvent` (D-05). Naming, `detail` shape y el gotcha de la licencia Shopify (no MIT) en Architecture Pattern 2 + Don't Hand-Roll. |
| SHELL-04 | `ETAPA-2-SEAMS.md` documenta el contrato de cart attributes (`visitante_id`, `utm_*`, `view`) y de eventos para la medición diferida | Contrato del repo hermano leído verbatim: `web/kinelia-atribucion.js` (6 cart attributes + cookie `kinelia_attr` + first-touch) y `supabase/functions/collect/index.ts` (8 tipos de evento válidos, body `{ visitante_id, eventos: [...] }`, origin allowlist). El contrato del tema agrega `view` como 7º attribute. Ver Architecture Pattern 3. |
</phase_requirements>

## Summary

Fase 3 es **shell + seams, sin comportamiento activo**. El `layout/theme.liquid` de Kinelia ya está muy cerca del Skeleton de fábrica: la Fase 2 le sacó el bloque de fuentes del starter, le sumó dos preloads self-hosted y `base.css`. Lo que falta es (a) montar un snippet no-op `analytics-hooks.liquid` en el lugar exacto del `<head>` donde Etapa 2 va a enchufar la medición, (b) construir un header y un footer mínimos sobre una base que **no trae nada** (Skeleton envía cero JavaScript: sin cart drawer, sin variant picker, sin predictive search, sin `pubsub.js`), (c) escribir el primer módulo JS del tema — un wrapper fino de ~40-50 líneas sobre `CustomEvent` que será la única API de eventos interna — y (d) documentar el contrato de medición diferida en `ETAPA-2-SEAMS.md`, transcrito verbatim del repo hermano.

El repo hermano (`../../Kinelia/`) ya define el contrato completo y **no se toca**: `web/kinelia-atribucion.js` escribe 6 cart attributes (`visitante_id` + los 5 `utm_*`) vía `/cart/update.js` desde una cookie de primera parte `kinelia_attr` con lógica first-touch, y `supabase/functions/collect/index.ts` acepta exactamente 8 tipos de evento del funnel en un body `{ visitante_id, eventos: [...] }` con validación de origen. El tema agrega un 7º cart attribute, `view` (el slug de `?view=` para atribución multi-avatar). El mapa "evento DOM del bus → evento `/collect`" lo cablea Etapa 2, no esta fase.

Lo más caro de esta fase es el **contrato del bus de eventos** (D-05/D-06): los 5 nombres y la forma de sus `detail` se congelan ahora y los heredan Fases 5, 6 y toda Etapa 2. Lo más frágil es el **orden del `<head>`**: la Fase 2 dejó `<meta charset>` empujado ~4 KB adentro del `<head>` por el `<style>` inline de tokens + 5 `@font-face` (WR-04); Fase 3 toca el orden del head y es la ventana natural para arreglarlo.

**Primary recommendation:** Escribir `assets/events.js` como un IIFE clásico (no ESM — Skeleton no tiene import maps ni build) que expone `window.Kinelia.events` y `window.Kinelia.a11y`, cargado con `{{ 'events.js' | asset_url | script_tag: defer: true }}`. Montar `analytics-hooks.liquid` como snippet 100% comentario + un `<script src>` comentado. Construir header/footer extendiendo los archivos del starter (no reescribiendo), todo el CSS nuevo en bloques `{% stylesheet %}` scoped consumiendo solo `var(--*)`. Mover `<meta charset>` + `viewport` a la primera línea del `<head>` en `theme.liquid`, antes del `{% render 'css-variables' %}`.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Document shell (`<head>`, `<body>`, landmarks) | Frontend Server (Liquid render) | Browser | `theme.liquid` es el único wrapper de todas las rutas de storefront; el orden del `<head>` es una decisión de render server-side. |
| Analytics seam (`analytics-hooks.liquid`) | Frontend Server (Liquid, no-op) | — | En Etapa 1 es puro comentario; en Etapa 2 se convierte en el punto de inyección de scripts de terceros dentro del `<head>`. |
| Bus de eventos DOM (`events.js`) | Browser (vanilla JS) | — | `CustomEvent` sobre `document`; el tema no tiene servidor de aplicación. Es infraestructura client-side pura. |
| Header (logo, carrito, cuenta, menú) | Frontend Server (Liquid: `cart.item_count`, `link_list`, `shop.customer_accounts_enabled`) | Browser (sticky CSS, `<shopify-account>` web component de Shopify) | El contador de carrito sale del render Liquid (D-07); nada es reactivo en Fase 3. |
| Footer (legales, WhatsApp, pagos, newsletter) | Frontend Server (Liquid: `link_list`, `shop.enabled_payment_types`, settings) | Browser (FAB CSS + mínimo JS) | Links y visibilidad condicional son Liquid; el FAB es un componente CSS aislado. |
| Cart attributes de atribución | **Etapa 2** (`kinelia-atribucion.js` en el browser vía `/cart/update.js`) | Shopify (persiste en la orden → webhook → `raw.shopify_evento`) | Fase 3 solo **documenta** el contrato en `ETAPA-2-SEAMS.md`; nadie escribe attributes en esta fase. |
| Eventos del funnel (`view_lp`, `add_to_cart`, …) | **Etapa 2** (`kinelia-atribucion.js` → `POST /collect`) | Supabase Edge Function `collect` → `raw.evento_web` | Ídem: contrato documentado, sin emisores. |
| a11y live-region + `announce()` | Browser (`aria-live` div + JS helper) | — | Preocupación del shell; el focus-trap (que sí necesita un consumidor) se difiere. |

## Standard Stack

Esto es un tema Liquid sobre base Skeleton **sin build step y sin frameworks** (CLAUDE.md + `ALLOWLIST.md` §"Nunca agregar"). El "stack" son APIs nativas del navegador y primitivas de Shopify.

### Core

| Tecnología | Versión / estado (2026) | Propósito | Por qué es la estándar |
|------------|-------------------------|-----------|------------------------|
| Skeleton theme (`Shopify/skeleton-theme`) | base fijada en `OVERRIDES.md` (`skeleton-base-a4f32d3`, commit `a4f32d3`) | Base del tema | Ya elegida y ratificada en Fase 1. Envía cero JS; el shell se construye encima. `[VERIFIED: GitHub API contents de Shopify/skeleton-theme this session — assets/ solo tiene critical.css + 3 SVG, sin .js]` |
| `CustomEvent` + `document.dispatchEvent` / `addEventListener` | Baseline navegador (todos los navegadores modernos) | Bus de eventos DOM | Patrón nativo; es lo que Horizon y Dawn usan por debajo de sus wrappers. Cero dependencia. `[CITED: developer.mozilla.org/en-US/docs/Web/API/CustomEvent]` |
| Filtro Liquid `script_tag` con `defer: true` | Liquid actual | Cargar `events.js` sin bloquear el parser | `script_tag` **no agrega `defer` por sí solo** — hay que pasar `defer: true` explícito o escribir el `<script defer>` a mano. `[VERIFIED: shopify.dev/docs/api/liquid/filters/script_tag — "Boolean attributes such as defer and async are rendered when the value is true"]` |
| `<shopify-account>` (web component de Shopify) | GA | Ícono/menú de cuenta en el header | Ya lo trae el `header.liquid` del starter; se conserva bajo `{% if shop.customer_accounts_enabled %}`. `[VERIFIED: sections/header.liquid:13-17 this session]` |
| Cart AJAX API (`/cart/update.js`, `/cart.js`, `/cart/add.js`) | GA | Contrato de cart attributes (documentado, no usado en Fase 3) | La forma en que Etapa 2 pega `visitante_id`/`utm_*` al carrito. `[VERIFIED: ../../Kinelia/web/kinelia-atribucion.js:97-107 — POST /cart/update.js con body { attributes }]` |
| Supabase Edge Function `collect` | desplegada en el repo hermano | Endpoint de eventos del funnel (documentado, no llamado en Fase 3) | `[VERIFIED: ../../Kinelia/supabase/functions/collect/index.ts:24-33, 45-72 this session]` |

### Supporting

| Herramienta | Versión | Propósito | Cuándo usarla |
|-------------|---------|-----------|---------------|
| SVGO | one-off vía `npx svgo` (NO se agrega a `package.json` como dependencia de runtime) | Limpiar `kinelia_horizontal.svg` (atributos `fill` duplicados de potrace) antes de copiarlo a `assets/` | D-18. Es una transformación de asset en dev, igual que el subsetting de fuentes de la Fase 2 — no es un build step del deploy. |
| Theme Check (bundled en Shopify CLI) | la que trae la CLI | Lint de Liquid/JSON en `npm run lint` y CI (`--fail-level error`) | Siempre. Reglas relevantes en Common Pitfalls. |
| `scripts/check-allowlist.mjs` | en el repo | Enforcement de superficie; **se afloja la regla anti-JS en esta fase** (D-09) | En la misma PR que introduce `events.js`. |
| `scripts/check-tokens.mjs` | en el repo | Enforcement de tokens; escanea `{% stylesheet %}` de todo `sections/`, `snippets/`, `layout/` | Todo CSS nuevo del header/footer/FAB/announcement-bar pasa por acá. |

### Alternatives Considered

| En vez de | Se podría usar | Tradeoff |
|-----------|----------------|----------|
| Wrapper propio sobre `CustomEvent` (D-05) | Portar `pubsub.js` de Dawn o `events.js` de Horizon | **Rechazado.** (1) Dawn y Horizon están bajo la licencia "Shopify" restrictiva (NO MIT — ver Pitfall 6), habría que registrar el port en `OVERRIDES.md` §"Componentes portados" con esa licencia. (2) `pubsub.js` de Dawn mantiene un registro propio de subscribers (`let subscribers = {}`) y devuelve Promises — más superficie que la que Kinelia quiere. El wrapper propio **es** `CustomEvent` y no acumula estado. |
| IIFE clásico para `events.js` | Módulo ESM + import map | **Rechazado para Fase 3.** Skeleton no tiene import map ni bundler; Horizon sí, pero eso es infra que Kinelia decidió no adoptar. Un IIFE con `window.Kinelia` funciona con `script_tag: defer` sin nada más. |
| FAB de WhatsApp como componente propio | App de chat / widget de WhatsApp de terceros | **Rechazado** en `REQUIREMENTS.md` §Out of Scope ("Widget de live-chat"). El FAB es un `<a href="https://wa.me/...">` + CSS. |
| Barra de anuncio dismissible | Barra con botón de cierre + `localStorage` | **Rechazado (D-13).** Dismissible = JS + estado por visitante, no lo amerita. Estática. |
| Newsletter con markup comentado | Bloque siempre presente detrás de `{% if %}` con default `false` | Elegido (D-16): el `{% if section.settings.show_newsletter %}` con default `false` deja cero markup hoy y lo prende un flag en Etapa 2, sin descomentar nada. |

**Installation:** Ningún paquete de runtime. `assets/events.js` se escribe a mano. SVGO se corre one-off: `npx --yes svgo@latest assets/kinelia_horizontal.svg` (o equivalente). No se agrega a `package.json`.

## Package Legitimacy Audit

**Esta fase no instala ningún paquete externo de runtime.** No hay `npm install`, no hay dependencias nuevas en `package.json` (que hoy solo tiene `@lhci/cli` en `devDependencies`). SVGO se usa como binario one-off vía `npx` para una transformación de asset en dev; no entra al árbol de dependencias del proyecto. **Package Legitimacy Gate: N/A.**

Si el plan decidiera fijar SVGO como `devDependency` (para reproducibilidad), correr entonces `gsd-tools query package-legitimacy check --ecosystem npm svgo` — `svgo` es un paquete legítimo y maduro (>10 años, ~30M descargas/semana, `github.com/svg/svgo`), pero el gate debe correrse igual antes de agregarlo.

## Architecture Patterns

### System Architecture Diagram

```
                          ┌─────────────────────────────────────────────┐
   Anuncio de Meta ──────▶│  Storefront de Kinelia (tema Liquid)         │
   (?utm_*=… &?view=…)     │                                             │
                          │   layout/theme.liquid  (shell, TODA ruta)    │
                          │   ┌───────────────── <head> ──────────────┐  │
                          │   │ 1. <meta charset> + viewport  ◀── FIX  │  │
                          │   │ 2. {% render 'css-variables' %}        │  │
                          │   │ 3. 2× <link rel=preload as=font>       │  │
                          │   │ 4. critical.css (preload) + base.css   │  │
                          │   │ 5. {% render 'meta-tags' %}            │  │
                          │   │ 6. {% render 'analytics-hooks' %} ◀━━━ SEAM Etapa 2
                          │   │      · comentario-contrato Liquid      │  │
                          │   │      · <!-- <script kinelia-atrib> --> │  │
                          │   │ 7. {{ content_for_header }}            │  │
                          │   └───────────────────────────────────────┘  │
                          │   ┌───────────────── <body> ──────────────┐  │
                          │   │ skip-link + <div aria-live=polite>     │  │
                          │   │ {% sections 'header-group' %}          │  │
                          │   │   · announcement-bar  (sticky mobile)  │  │
                          │   │   · header (logo·carrito·cuenta·menú)  │  │
                          │   │ <main id=MainContent>                  │  │
                          │   │   {{ content_for_layout }}             │  │
                          │   │ {% sections 'footer-group' %}          │  │
                          │   │   · footer (legales·WhatsApp·pago·NL)  │  │
                          │   │ WhatsApp FAB (fijo, todas las páginas) │  │
                          │   │ <script defer src=events.js>          │  │
                          │   │   window.Kinelia.events {emit,on,off}  │  │
                          │   │   window.Kinelia.a11y   {announce}     │  │
                          │   └───────────────────────────────────────┘  │
                          └─────────────────────────────────────────────┘
                                   │                         ▲
   ══ FASE 3: entrega el bus + el  │  contrato               │  nadie emite / nadie
      contrato. Sin emisores ══════╪═════════════════════════╪══ escucha todavía
                                   ▼                         │
                          ┌────────────────────────┐         │
                          │  ETAPA-2-SEAMS.md       │  fija: nombres de evento,
                          │  (spec del tema)        │  detail shape, cart attrs,
                          └────────────────────────┘  mapa DOM→/collect
                                   ╎ transcribe verbatim + cita
                                   ▼
   ══ ETAPA 2 (fuera de este repo, no se toca) ═══════════════════════════
                          ┌────────────────────────────────────────────┐
    kinelia-atribucion.js │ cookie kinelia_attr (first-touch, 30d)     │
    (se descomenta en     │ → /cart/update.js  { attributes: {         │
     analytics-hooks)     │     visitante_id, utm_source..utm_content, │
                          │     view } }  (read-modify-write)          │
                          │ → POST https://<proj>.supabase.co/.../collect
                          │     { visitante_id, eventos: [{tipo,payload}] }
                          └───────────────┬────────────────────────────┘
                                          ▼
             Shopify order.attributes ──▶ shopify-webhook ──▶ raw.shopify_evento
                                          ▼                    core.procesar_shopify()
                          raw.evento_web ◀── collect Edge Fn    → core.orden
                                          ▼                       .creativo_publicacion_id
                          core.procesar_eventos_web() → core.sesion
                          (join sesión↔orden por visitante_id)
```

### Recommended Project Structure

```
layout/
  theme.liquid           # EDITAR: charset arriba, {% render 'analytics-hooks' %}, <main>, skip-link,
                          #         <div aria-live>, <link rel=icon>, <script defer events.js>, FAB
  password.liquid        # REVISAR: ¿aplica el mismo <head> fix? (charset). Sin header/footer.
snippets/
  analytics-hooks.liquid # NUEVO: no-op, comentario-contrato + <script> comentado (D-01)
sections/
  header.liquid          # EXTENDER: logo (SVG), contador de carrito, cuenta condicional, menú que colapsa
  footer.liquid          # EXTENDER: linklist legales, link WhatsApp, newsletter tras flag, iconos de pago
  announcement-bar.liquid# NUEVO: section estática, 1 clave locale + link opcional (D-13)
  header-group.json      # EDITAR: montar announcement-bar + header (order)
  footer-group.json      # sin cambio estructural (el FAB puede ir acá o en theme.liquid)
assets/
  events.js              # NUEVO: primer JS del tema. window.Kinelia.events + .a11y (D-05, D-08)
  a11y.js                # NUEVO (opcional, discreción): announce() si se separa de events.js
  kinelia_horizontal.svg # NUEVO: logo, SVGO-limpiado (D-18)
  kinelia_isotipo.svg    # NUEVO: favicon / compacto (D-18)
  icon-whatsapp.svg      # NUEVO: ícono del FAB + link del footer
  (header/footer CSS)    # en bloques {% stylesheet %} scoped dentro de cada section
locales/
  es.default.json        # AGREGAR claves: announcement bar, footer legales, aria-live announce, FAB
  es.default.schema.json # AGREGAR etiquetas de editor para cada setting/clave t: nueva
config/
  settings_schema.json   # AGREGAR: setting del número de WhatsApp (con placeholder)
scripts/
  check-allowlist.mjs    # EDITAR: aflojar regla anti-JS + listar assets JS nuevos (D-09)
ETAPA-2-SEAMS.md          # NUEVO (raíz): contrato de medición diferida (D-04, SHELL-04)
ALLOWLIST.md              # EDITAR: filas nuevas en ## Renderiza (events.js, a11y.js, SVGs, announcement-bar)
OVERRIDES.md              # EDITAR: divergencias de Fase 3 (primer JS, nueva section, edición del head)
```

### Pattern 1: Orden del `<head>` en `theme.liquid`

**Qué:** El `<head>` tiene un orden canónico que Etapa 2 asume. `analytics-hooks` va **después** de `meta-tags` y **antes** de `content_for_header` (D-03) — ahí es donde `kinelia-atribucion.js` corre lo bastante temprano para capturar UTMs first-touch y setear la cookie antes de cualquier navegación, pero después de que el `<title>`/OG estén resueltos.

**Cuándo usarlo:** Siempre. Es la estructura del shell.

**Orden recomendado (con el fix de WR-04):**

```liquid
<!doctype html>
<html lang="{{ request.locale.iso_code }}">
  <head>
    {%- comment -%} KINELIA (plan 03-xx): charset y viewport ANTES del <style> de tokens.
      El navegador exige el charset en los primeros ~1024 bytes; el bloque inline de
      css-variables (5 @font-face + :root) lo empujaba fuera de esa ventana (WR-04). {%- endcomment -%}
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    {% render 'css-variables' %}

    <link rel="preload" as="font" type="font/woff2" href="{{ 'dm-sans-500.woff2' | asset_url }}" crossorigin>
    <link rel="preload" as="font" type="font/woff2" href="{{ 'inter-400.woff2' | asset_url }}" crossorigin>

    {{ 'critical.css' | asset_url | stylesheet_tag: preload: true }}
    {{ 'base.css' | asset_url | stylesheet_tag }}

    <link rel="icon" type="image/svg+xml" href="{{ 'kinelia_isotipo.svg' | asset_url }}">

    {% render 'meta-tags' %}   {%- comment -%} meta-tags YA NO debe re-emitir charset/viewport (mover acá arriba) {%- endcomment -%}

    {% render 'analytics-hooks' %}   {%- comment -%} SEAM Etapa 2 (D-03) {%- endcomment -%}

    {{ content_for_header }}
  </head>
```

**Nota:** `snippets/meta-tags.liquid` hoy re-emite `<meta charset>` + `viewport` + `X-UA-Compatible` en sus 3 primeras líneas `[VERIFIED: snippets/meta-tags.liquid:1-3 this session]`. Si se mueven a `theme.liquid`, quitarlos de `meta-tags.liquid` para no duplicarlos (Theme Check no falla por duplicado pero es ruido y confunde). Registrar la edición de `meta-tags.liquid` en `OVERRIDES.md`.

### Pattern 2: Bus de eventos DOM (`assets/events.js`)

**Qué:** Un IIFE que expone `window.Kinelia.events` como wrapper fino sobre `CustomEvent`/`document`. Los 5 nombres siguen la convención `namespace:verbo-en-pasado` (igual que Horizon: `media:started-playing`, `slideshow:select` `[VERIFIED: Shopify/horizon assets/events.js this session]`).

**Cuándo usarlo:** Toda comunicación entre secciones del tema y entre el tema y Etapa 2.

**Contrato de nombres (D-06) — LOCKED tras el plan:**

| Evento | Emisor futuro | `detail` propuesto (el plan lo confirma) |
|--------|---------------|------------------------------------------|
| `variant:changed` | Fase 5 (variant picker del buy box) | `{ variantId: Number\|null, available: Boolean, price: Number /* centavos */, optionValues: String[] }` |
| `product:added` | Fase 5-6 (ATC / sticky ATC) | `{ variantId: Number, quantity: Number, cart: Object /* respuesta de /cart/add.js o /cart.js */ }` |
| `cart:updated` | Fase 6 (cart drawer, cambios de línea) | `{ itemCount: Number, cart: Object /* /cart.js completo */ }` |
| `cart:loading` | Fase 6 (spinners del drawer / buy box) | `{ loading: Boolean, source: String /* 'atc' \| 'drawer' \| 'line-item' */ }` |
| `cart:error` | Fase 6 (error de /cart/*.js) | `{ message: String, source: String, code: String\|null }` |

**Esqueleto (referencia — el plan fija la forma final):**

```js
/* assets/events.js — primer módulo JS del tema Kinelia.
   Bus de eventos DOM: wrapper fino sobre CustomEvent. NO mantiene registro propio
   ni cola — Kinelia.events.on(...) y document.addEventListener(...) son el mismo evento.
   Contrato de nombres y detail: ETAPA-2-SEAMS.md. Cargado con <script defer>.
   Nadie emite en Fase 3 (D-07): se prueba con Kinelia.events.emit(...) desde consola. */
(function () {
  "use strict";

  var NAMES = ["variant:changed", "product:added", "cart:updated", "cart:loading", "cart:error"];

  function emit(name, detail) {
    if (NAMES.indexOf(name) === -1) {
      console.warn("[Kinelia.events] nombre desconocido:", name);
    }
    document.dispatchEvent(new CustomEvent(name, { detail: detail || {}, bubbles: true }));
  }

  function on(name, callback) {
    document.addEventListener(name, callback);
    return { name: name, callback: callback };
  }

  function off(handle) {
    if (handle && handle.name) document.removeEventListener(handle.name, handle.callback);
  }

  var live;
  function announce(message) {
    if (!live) live = document.getElementById("a11y-live-region");
    if (!live) return;
    live.textContent = "";
    // reflow para forzar el re-anuncio de un mensaje idéntico consecutivo
    void live.offsetWidth;
    live.textContent = message;
  }

  window.Kinelia = window.Kinelia || {};
  window.Kinelia.events = { emit: emit, on: on, off: off, NAMES: NAMES };
  window.Kinelia.a11y = { announce: announce };
})();
```

### Pattern 3: Contrato de cart attributes + eventos (`ETAPA-2-SEAMS.md`)

**Qué:** El doc transcribe **verbatim** el contrato que ya vive en el repo hermano y lo cita como origen (D-04).

**Cart attributes** (el tema tiene 7; el script hermano hoy escribe 6 — ver Pitfall 5):

| Attribute | Origen | Nota |
|-----------|--------|------|
| `visitante_id` | cookie `kinelia_attr`, `crypto.randomUUID()` estable | Clave de join sesión↔orden. `[VERIFIED: ../../Kinelia/web/kinelia-atribucion.js:66, 88-95]` |
| `utm_source` `utm_medium` `utm_campaign` `utm_term` `utm_content` | URL en el primer arribo, first-touch (el primer anuncio se queda el crédito) | `[VERIFIED: kinelia-atribucion.js:31, 70-76]` |
| `view` | slug de `?view=` (avatar) — **agregado por el contrato del tema**, no está en el script hermano hoy | Atribución multi-avatar (Fase 10). El plan decide si lo escribe el tema o una versión actualizada del script hermano en Etapa 2. |

Se escriben con `POST /cart/update.js` body `{ attributes: {...} }`, **read-modify-write** (GET `/cart.js`, merge, no pisar claves ajenas — requisito de BUY-06). `[VERIFIED: kinelia-atribucion.js:97-107]`

**Eventos del funnel que acepta `/collect`** (8, exactos — cualquier otro `tipo` se descarta en silencio):
`view_lp`, `scroll_50`, `scroll_75`, `ver_oferta`, `add_to_cart`, `inicio_checkout`, `paso_checkout`, `compra`
`[VERIFIED: ../../Kinelia/supabase/functions/collect/index.ts:24-33 this session]`

Body: `{ visitante_id: String (≤64 chars), eventos: [{ tipo: String, payload: Object, sesion_ext?: String }] (≤50) }`. El servidor pone `ocurrido_en` (no confiar en el reloj del cliente). Validación de origen contra `COLLECT_ORIGENES`. Endpoint: `https://<proyecto>.supabase.co/functions/v1/collect`. `[VERIFIED: collect/index.ts:45-95]`

**Hook `data-kinelia="oferta"`:** `kinelia-atribucion.js` hace `document.querySelector('[data-kinelia="oferta"]')` y observa ese elemento con IntersectionObserver (threshold 0.5) para emitir `ver_oferta`. `[VERIFIED: kinelia-atribucion.js:169-181]` El atributo lo pone la Fase 5 en el bloque de precio del buy box; `ETAPA-2-SEAMS.md` solo documenta que debe existir.

**Mapa "evento DOM del bus → evento `/collect`":** lo cablea Etapa 2 en `analytics-hooks.liquid` (que se suscribe al bus y reenvía). `ETAPA-2-SEAMS.md` documenta ambos vocabularios y deja el mapeo como trabajo de Etapa 2. Mapeo tentativo para el doc: `product:added` → `add_to_cart`; el resto (`view_lp`, `scroll_*`, `ver_oferta`, `*checkout*`, `compra`) los emite directamente `kinelia-atribucion.js` sin pasar por el bus.

### Pattern 4: Construir sobre Skeleton (no despojar)

**Qué:** Skeleton envía **cero JavaScript**. `assets/` tiene solo `critical.css` + 3 SVG. No hay `pubsub.js`, `global.js`, `cart.js`, `cart-drawer`, `predictive-search`, `variant picker` — nada. `[VERIFIED: GitHub API Shopify/skeleton-theme/contents/{assets,sections,snippets} this session]`

**Consecuencia para "seam only, no refactor later":**
- El bus de eventos de Fase 3 **no compite** con ningún sistema de eventos preexistente (a diferencia de Dawn, que ya trae `pubsub.js`). El wrapper propio es la única API — limpio.
- El header del starter (`sections/header.liquid`) es 27 líneas de markup + un `{% stylesheet %}` mínimo `[VERIFIED: sections/header.liquid this session]`. El contador de carrito ya existe (`{% if cart.item_count > 0 %}<sup>…</sup>{% endif %}`). Fase 3 **extiende** ese archivo (logo SVG en vez de `{{ shop.name }}`, sticky CSS, layout), no lo reescribe.
- El footer del starter (`sections/footer.liquid`) ya tiene `link_list` `menu` + `show_payment_icons` condicional a `shop.enabled_payment_types` `[VERIFIED: sections/footer.liquid this session]`. Fase 3 agrega el link de WhatsApp, el bloque newsletter tras flag, y (runbook) el linklist legal.
- **Cart drawer (Fase 6) y predictive search (Fase 11) NO existen** y no son responsabilidad de Fase 3. El header de Fase 3 linkea a `/cart` (página nativa) como hoy. Cuando llegue el cart drawer, se suscribirá a `cart:updated` — por eso el evento se define ahora.

### Pattern 5: Footer legal para DTC en Argentina

**Qué:** Una tienda online argentina tiene obligaciones de compliance en el footer / home. Fase 3 **no escribe el contenido** (Fase 11) pero sí crea las páginas stub y arma el linklist para que ningún link resuelva a 404.

| Elemento | Obligación | Fase 3 | Fase 11 |
|----------|-----------|--------|---------|
| Términos y Condiciones | Estándar e-commerce | stub `/pages/terminos` | contenido |
| Política de Privacidad (Ley 25.326 / datos personales) | Obligatoria | stub `/pages/privacidad` | contenido |
| Cambios y Devoluciones | Estándar; se cruza con el derecho de revocación | stub `/pages/cambios-y-devoluciones` | contenido |
| Datos de la empresa / razón social AR | Obligatoria (identificación del proveedor) | stub `/pages/datos-de-la-empresa` | contenido + CUIT/domicilio |
| **Botón de Arrepentimiento** (Resolución 424/2020, Sec. de Comercio Interior) | Link **directo y prominente desde la home**, tamaño/visibilidad destacados; 10 días hábiles; costo de devolución a cargo del vendedor | el link del footer puede apuntar a su página stub | página + acceso desde la home sin login (PAGES-03) |
| Link a **Defensa del Consumidor / Ventanilla Única Federal** | Recomendado/exigido: link para iniciar reclamos, típicamente bajo el copyright | link externo en el linklist del footer | — |
| **Data Fiscal** (QR de AFIP/ARCA) | Obligatorio para responsables inscriptos | — (necesita el CUIT, dato del handoff Fase 14) | imagen/QR en footer |

`[CITED: tiendanube.com/blog/boton-de-arrepentimiento/ · argentina.gob.ar/normativa/nacional/resolución-424-2020-342869 · docs.tiendanube.com/help/defensa-al-consumidor]` — **confirmar con el usuario en discuss/plan** qué links exactos quiere en el footer de Fase 3; el research no puede fijar la lista de compliance como decisión.

**Ownership:** `docs/RELEASE.md` dice que la integración de GitHub es dueña de `templates/*.json` y `config/settings_data.json`, y que el contenido de páginas es del theme editor. Crear las páginas stub y el linklist del footer es un **paso de runbook en STAGING**, no un commit de código. El plan lo documenta como tal.

### Pattern 6: Sticky header + announcement bar en mobile

**Qué:** D-12/D-13: en mobile, `announcement-bar` + `header` quedan fijos arriba juntos. En desktop no.

**Cómo (recomendado):**
- `announcement-bar` es su propia section, montada **antes** de `header` en `sections/header-group.json` (`"order": ["announcement-bar", "header"]`).
- Cada section se renderiza envuelta en `<div class="shopify-section">`. Para pegarlas juntas: `@media (max-width: …) { .shopify-section:has(> .announcement-bar), .shopify-section:has(> .site-header) { position: sticky; ... } }` — o, más robusto, aplicar `position: sticky; top: 0; z-index: N` a los wrappers vía una clase agregada por el section settings, apilando `top` (announcement `top: 0`, header `top: var(--announcement-height)`). `:has()` es baseline 2026 (ya lo usa `critical.css`).
- **CLS:** reservar la altura combinada. `position: sticky` no saca el elemento del flujo (a diferencia de `fixed`), así que el CLS es menor, pero el plan debe medir. Altura total sobre el fold = altura de anuncio + altura de header compacto; mantenerla mínima (el público mira el buy box).
- **z-index:** definir una escala chica de z-index en tokens o en el CSS del shell para que header (sticky) < cart drawer (Fase 6) < FAB. Documentarla para que Fase 6 no colisione.

### Pattern 7: WhatsApp FAB

- `<a href="https://wa.me/{{ section.settings.whatsapp_number }}?text=..." class="wa-fab" aria-label="{{ 'kinelia.cta.pedir_whatsapp' | t }}">{% render 'icon-whatsapp' %}</a>` (o `inline_asset_content`).
- Número: setting del theme en `config/settings_schema.json` con placeholder (D-15). Formato `wa.me` = número internacional sin `+` ni espacios (ej. `54911...`).
- **Color: `var(--color-primary)`** (verde de marca Kinelia). **NUNCA** `#25D366` (verde de WhatsApp) — sería un hex literal y `check-tokens.mjs` lo rechaza, y además rompe el sistema visual (Pitfall 4).
- Sin sombra, sin animación de pulso (D-15 + D-11 del Brand Book). `position: fixed; inset-block-end: var(--space-4); inset-inline-end: var(--space-4);`.
- Convivencia con sticky ATC (Fase 6): el plan decide si Fase 3 deja solo el FAB estático o un stub de la lógica de ocultamiento. Recomendación: dejar el FAB + una clase CSS `body.has-sticky-atc .wa-fab { ... }` sin el JS que la togglea (Fase 6 lo agrega). Cero JS de FAB en Fase 3 si se puede.

### Anti-Patterns to Avoid

- **Emitir un stub `window.kinelia.track()` o `window.dataLayer`** — prohibido por D-02. El bus DOM es la única API.
- **Setting-gated toggle para el `<script>` de atribución** — prohibido por D-01. Comentario explícito, no un checkbox del editor sin asset detrás.
- **Escribir el `<script src>` de `kinelia-atribucion.js` sin comentar** — dispararía `RemoteAsset` de Theme Check (y cargaría un asset que no existe en este repo). Comentado (HTML `<!-- -->` o Liquid `{% comment %}`).
- **Un segundo hook `analytics-hooks-body`** — diferido a Etapa 2 (D-03). Un solo hook en `<head>`.
- **CSS del header/footer con hex, `box-shadow`, `linear-gradient`, `text-transform: uppercase` (fuera de `.label-eyebrow`), `text-align: justify`** — `check-tokens.mjs` lo rechaza (reglas 1, 6). Solo `var(--*)`.
- **`var(--x)` de un token que nada define** — `check-tokens.mjs` regla 5 falla. Si el FAB/header necesita un valor nuevo (ej. un z-index nombrado), agregarlo a `css-variables.liquid`.
- **Portar `pubsub.js`/`events.js` de Dawn/Horizon sin registrar la licencia** — no son MIT (Pitfall 6).
- **Meter JS del FAB o del sticky en `events.js`** cuando puede ser CSS puro — cada byte de JS es el primer consumo real del presupuesto (`docs/PERF-BUDGET.md`, `resource-summary:script:size ≤ 150000 B` SUPUESTO / warn).
- **`text` / `textarea` / `html` / `url` settings interpolados dentro de un `{% style %}`** — `check-tokens.mjs` regla 3 lo rechaza (inyección). El setting del número de WhatsApp NO se interpola en CSS, solo en el `href`.

## Don't Hand-Roll

| Problema | No construir | Usar en su lugar | Por qué |
|----------|--------------|------------------|---------|
| Pub/sub de eventos entre secciones | Un EventEmitter propio con registro de listeners, cola, prioridades | `CustomEvent` + `document.dispatchEvent`/`addEventListener`, envuelto en ~40 líneas (D-05) | El DOM ya es un bus de eventos. Un registro propio duplica lo que el navegador hace, y hay que mantener el teardown. Horizon y Dawn usan `CustomEvent` por debajo igual. |
| Ícono de cuenta / login del header | Un dropdown de cuenta propio | `<shopify-account>` (ya en el starter) | Web component nativo de Shopify, maneja el estado de sesión y el menú. `[VERIFIED: sections/header.liquid:14]` |
| Live region de accesibilidad | Una librería de anuncios ARIA | Un `<div aria-live="polite">` + `textContent = msg` con reflow para re-anunciar (D-08) | ~10 líneas. Una librería es peso injustificado. |
| Focus trap | Escribirlo ahora "por si acaso" | **Diferirlo** a Fase 6 (cart drawer) / Fase 5 (guía de talles) — sus consumidores reales (D-08) | Un focus-trap sin consumidor es código huérfano que hay que testear y mantener. |
| Cookie de atribución / first-touch de UTMs | Reimplementarla en el tema | `kinelia-atribucion.js` del repo hermano (se descomenta en Etapa 2) | Ya existe, ya está probada, ya tiene la lógica first-touch correcta. `[VERIFIED: ../../Kinelia/web/kinelia-atribucion.js this session]` |
| Endpoint de eventos web | Mandar eventos a GA4 y reconstruir | `POST /collect` del repo hermano → `raw.evento_web` | GA4 no permite el join sesión↔orden a nivel fila que necesita el CPA por creativo. `[VERIFIED: collect/index.ts:6-8 comentario]` |
| Barra de anuncio dismissible con memoria | JS + `localStorage` por visitante | Barra estática (D-13) | El estado por visitante no compra nada para este caso de uso. |
| Optimización de SVG | Editar los `fill` duplicados a mano | `npx svgo` one-off (D-18) | Determinista, reproducible, no es un build step. |

**Key insight:** En un tema Skeleton "casi cero JS", cada primitiva que se construye es peso permanente sobre el presupuesto que toda la tienda optimiza. La regla es: si el navegador o el starter ya lo resuelve, no se reimplementa; si no tiene un consumidor real en esta fase, se difiere.

## Runtime State Inventory

> Fase 3 toca `theme.liquid`, `header.liquid`, `footer.liquid`, section groups y agrega el primer JS. No es un rename, pero sí modifica superficies que el theme editor co-posee. Inventario relevante:

| Categoría | Ítems encontrados | Acción requerida |
|-----------|-------------------|------------------|
| Stored data (DB/datastore) | **Ninguno.** El tema no tiene datastore propio. `visitante_id` y cart attributes viven en la cookie del visitante y en el carrito de Shopify — y nadie los escribe en Fase 3. | Ninguna. |
| Live service config (UI/DB, no en git) | `config/settings_data.json` (propiedad de la integración de GitHub / theme editor — `docs/RELEASE.md`). Fase 3 agrega el setting `whatsapp_number` al **schema**; su **valor** lo pone alguien en el editor de STAGING. Section groups (`header-group.json`, `footer-group.json`) llevan el banner "auto-generated ... may be updated by the Shopify admin theme editor" `[VERIFIED: sections/header-group.json:1-9]` — montar `announcement-bar` es un cambio de código que el editor puede después reescribir. | El plan documenta: (a) el número de WhatsApp es un paso de runbook en STAGING; (b) las páginas legales stub + el linklist del footer son pasos de runbook en STAGING (D-14); (c) commitear el cambio de `header-group.json` y aceptar los write-backs del editor (`git pull --rebase` antes de push, revisar diffs de JSON en la PR). |
| OS-registered state | **Ninguno.** No hay tasks, cron, ni procesos. | Ninguna. |
| Secrets / env vars | **Ninguno nuevo.** El endpoint de `/collect` es una URL de función pública (no secreto), y va como **placeholder** `<proyecto>` en `ETAPA-2-SEAMS.md` y en el `<script>` comentado. `COLLECT_ORIGENES` es un secreto del repo hermano, no de este. | Ninguna. Verificar en code review que no se hardcodee una URL real de Supabase. |
| Build artifacts / paquetes instalados | **Ninguno.** Sin build step. `events.js` es fuente. Los SVG se copian y se limpian con SVGO one-off. `package.json` no gana dependencias de runtime. | Ninguna, salvo que el plan decida fijar `svgo` como devDependency (entonces: correr el package-legitimacy gate). |

**Verificado:** el repo hermano (`../../Kinelia/`) **no se modifica** en esta fase — `ETAPA-2-SEAMS.md` se alinea a su contrato existente, no al revés (`03-CONTEXT.md` §code_context).

## Common Pitfalls

### Pitfall 1: `<meta charset>` fuera de la ventana de 1024 bytes (WR-04)

**Qué sale mal:** El navegador ignora un `<meta charset>` que aparece después de los primeros ~1024 bytes del `<head>` y adivina la codificación — riesgo de mojibake en acentos y ñ (todo el copy es es-AR).
**Por qué pasa:** La Fase 2 puso `{% render 'css-variables' %}` como **primera** cosa del `<head>` (línea 5 de `theme.liquid`), y ese snippet emite un `<style>` inline con 5 bloques `@font-face` + el `:root` completo — varios KB — **antes** de que `meta-tags.liquid` emita el charset. `[VERIFIED: layout/theme.liquid:4-5 + snippets/css-variables.liquid:1-130 + snippets/meta-tags.liquid:1 this session]`
**Cómo evitarlo:** Fase 3 ya toca el orden del `<head>`. Mover `<meta charset>` + `viewport` + `X-UA-Compatible` a las primeras líneas de `theme.liquid`, antes de `{% render 'css-variables' %}`, y quitarlos de `meta-tags.liquid` (Pattern 1). Registrar en `OVERRIDES.md`.
**Señales tempranas:** `curl -s <url> | head -c 1024 | grep -c charset` → debe dar `1`. Acentos rotos en el preview de STAGING con caché frío.

### Pitfall 2: `script_tag` sin `defer` → `ParserBlockingScript`

**Qué sale mal:** `{{ 'events.js' | asset_url | script_tag }}` produce `<script src="..." type="text/javascript"></script>` **sin** `defer` — bloquea el parser y Theme Check `ParserBlockingScript` lo marca (y `npm run lint` corre `--fail-level error`... `ParserBlockingScript` es `error` en `theme-check:recommended`).
**Por qué pasa:** Suposición común (falsa) de que `script_tag` agrega `defer`. No lo hace. `[VERIFIED: shopify.dev/docs/api/liquid/filters/script_tag this session — el ejemplo de salida no tiene defer/async]`
**Cómo evitarlo:** `{{ 'events.js' | asset_url | script_tag: defer: true }}` o `<script src="{{ 'events.js' | asset_url }}" defer></script>`. Colocarlo antes de `</body>` (o en `<head>` con defer — da igual con defer, pero al final del body es lo convencional en Skeleton).

### Pitfall 3: Section group co-poseído por el theme editor

**Qué sale mal:** Se commitea `header-group.json` con `announcement-bar` montado, el editor de STAGING lo reescribe en el próximo guardado, y un `git push` sin rebase pierde el cambio o genera un conflicto de JSON.
**Por qué pasa:** `sections/*-group.json` lleva el banner "auto-generated / may be updated by the Shopify admin theme editor" y la integración de GitHub commitea los cambios del editor de vuelta a `staging` (`docs/RELEASE.md` §"Propiedad del contenido").
**Cómo evitarlo:** Tratar `header-group.json` como los `templates/*.json`: `git pull --rebase` antes de push, revisar el diff de JSON en la PR y no aceptarlo por reflejo. Documentar en el plan que montar `announcement-bar` es un cambio de código + un posible write-back del editor.
**Señales tempranas:** commits automáticos en `staging` cuyo autor nombra la tienda.

### Pitfall 4: Verde de WhatsApp (`#25D366`) en el FAB

**Qué sale mal:** El FAB se pinta con el verde de la marca WhatsApp; `check-tokens.mjs` regla 1 falla (hex literal fuera de `css-variables.liquid`/`settings_schema.json`), y aunque pasara, rompe el sistema visual austero (un segundo verde que compite con `--color-primary`).
**Por qué pasa:** Es el color "esperado" para un botón de WhatsApp; los tutoriales lo usan.
**Cómo evitarlo:** `background: var(--color-primary)`. D-15 dice explícitamente "color de marca" = Kinelia, no WhatsApp. El ícono lo identifica; el color no hace falta que sea el de WhatsApp.
**Señales tempranas:** `npm run lint:tokens` falla con "contiene un valor de color literal".

### Pitfall 5: El script hermano escribe 6 attributes, el contrato del tema tiene 7

**Qué sale mal:** `ETAPA-2-SEAMS.md` documenta `view` como cart attribute, pero `kinelia-atribucion.js` (tal como está hoy en el repo hermano) solo escribe `visitante_id` + 5 `utm_*` — no toca `view`. `[VERIFIED: ../../Kinelia/web/kinelia-atribucion.js:88-95 — objeto `atributosCarrito` con 6 claves]`
**Por qué pasa:** El script hermano precede la decisión del sistema multi-avatar `?view=` (Fase 10). El `03-CONTEXT.md` D-04 lo agrega al contrato del tema.
**Cómo evitarlo:** `ETAPA-2-SEAMS.md` debe (a) marcar `view` como "responsabilidad a resolver en Etapa 2 / Fase 10", y (b) decir explícitamente si lo escribe el tema (un snippet que lee `?view=` y hace su propio `/cart/update.js` read-modify-write) o una versión actualizada del script hermano. No dejarlo ambiguo — es exactamente el tipo de gap que "se conecta sin refactor" busca evitar.

### Pitfall 6: Dawn / Horizon NO son MIT

**Qué sale mal:** El plan porta `pubsub.js` de Dawn "que es MIT" y registra eso en `OVERRIDES.md`. No es MIT.
**Por qué pasa:** Dawn fue MIT hasta ~2024; se relicenció. La licencia actual de Dawn y de Horizon restringe el uso a "themes that integrate or interoperate with Shopify software ... and via the Shopify Theme Store. All other uses are strictly prohibited." `[VERIFIED: cdn.jsdelivr.net/gh/Shopify/dawn@main/LICENSE.md this session — "Copyright (c) 2021-present Shopify Inc." + cláusula de restricción]`
**Cómo evitarlo:** El bus de eventos de Kinelia se escribe desde cero (D-05 lo permite: "wrapper propio"). No hay nada que portar. `OVERRIDES.md` §"Componentes portados" queda vacío para Fase 3 (o registra "inspiración de patrón, sin copia de código" con la nota de licencia). Si algún día se copia código real de Horizon/Dawn, la licencia se registra correctamente (uso OK porque Kinelia ES un tema de Shopify, pero no es MIT y no se puede sublicenciar libremente).

### Pitfall 7: `announce()` no re-anuncia un mensaje idéntico consecutivo

**Qué sale mal:** `Kinelia.a11y.announce("Producto agregado")` dos veces seguidas — el lector de pantalla no lee la segunda porque el `textContent` no cambió.
**Por qué pasa:** `aria-live` solo dispara con un cambio de contenido.
**Cómo evitarlo:** Limpiar (`textContent = ""`), forzar un reflow (`void live.offsetWidth`) y luego setear el mensaje (ver esqueleto en Pattern 2). O togglear un sufijo invisible.

### Pitfall 8: `password.liquid` queda desincronizado del shell

**Qué sale mal:** Fase 3 mejora `theme.liquid` (charset arriba, `<link rel=icon>`, a11y) pero `layout/password.liquid` — el layout de la tienda con contraseña, activo hasta Fase 14 — queda con el `<head>` viejo. `[VERIFIED: layout/password.liquid this session — 19 líneas, mismo patrón de <head> que theme.liquid pre-Fase-2]`
**Por qué pasa:** Es un segundo layout que es fácil de olvidar; la tienda vive con contraseña **ahora**, así que es la página que el equipo ve.
**Cómo evitarlo:** El plan revisa `password.liquid` explícitamente. Como mínimo: charset arriba + `<link rel=icon>`. No lleva header/footer ni el bus de eventos (no hay funnel en la pantalla de contraseña). `03-CONTEXT.md` §canonical_refs ya lo marca.

### Pitfall 9: El menú del header no colapsa a nada cuando está vacío

**Qué sale mal:** `<div class="header__menu">` con `gap: 1rem` y padding se renderiza como un hueco visible aunque el `link_list` esté vacío (D-11: el menú arranca vacío).
**Por qué pasa:** Un contenedor flex vacío igual ocupa su padding/margin/gap.
**Cómo evitarlo:** `{% if section.settings.menu.links.size > 0 %}` alrededor del contenedor entero, o `.header__menu:empty { display: none }`.

## Code Examples

### Estado actual de `sections/header.liquid` (a extender, no reescribir)

```liquid
{%- comment -%} VERIFIED: sections/header.liquid this session — 78 líneas {%- endcomment -%}
<header>
  <h2 class="header__title">{{ shop.name | link_to: routes.root_url }}</h2>
  <div class="header__menu">
    {% for link in section.settings.menu.links %}{{ link.title | link_to: link.url }}{% endfor %}
  </div>
  <div class="header__icons">
    {% if shop.customer_accounts_enabled %}
      <shopify-account menu="{{ section.settings.customer_account_menu }}">
        {{ 'icon-account.svg' | inline_asset_content }}
      </shopify-account>
    {% endif %}
    <a href="{{ routes.cart_url }}">
      {% if cart.item_count > 0 %}<sup>{{ cart.item_count }}</sup>{% endif %}
      {{ 'icon-cart.svg' | inline_asset_content }}
    </a>
  </div>
</header>
{% stylesheet %} header { height: 5rem; display: flex; align-items: center; justify-content: space-between; } /* ... consume var(--color-text) */ {% endstylesheet %}
{% schema %}
{ "name": "t:general.header", "settings": [
  { "type": "link_list", "id": "menu", "label": "t:labels.menu" },
  { "type": "link_list", "id": "customer_account_menu", "label": "t:labels.customer_account_menu", "default": "customer-account-main-menu" }
]}
{% endschema %}
```

### `snippets/analytics-hooks.liquid` (no-op, D-01/D-02/D-03)

```liquid
{%- comment -%}
  ============================================================================
  KINELIA · analytics-hooks.liquid · SEAM DE ETAPA 2 (SHELL-01)
  ----------------------------------------------------------------------------
  NO-OP EN ETAPA 1. Este snippet no renderiza nada visible ni ejecutable hoy.
  Cero bytes al cliente. Se monta en layout/theme.liquid dentro del <head>,
  después de {% render 'meta-tags' %} y antes de {{ content_for_header }} (D-03).

  En ETAPA 2, acá se enchufa la medición diferida — sin refactor del <head>:
    · Pixel de Meta + Conversions API (vía Custom Pixels / Web Pixels API, TRACK-01)
    · GA4 (Custom Pixels, TRACK-02)
    · Script de atribución kinelia-atribucion.js (repo hermano ../../Kinelia/web/,
      ATTR-01) — cookie de primera parte kinelia_attr, first-touch de UTMs,
      sync de cart attributes vía /cart/update.js, cola de eventos a /collect.

  El contrato completo (cart attributes, eventos del funnel, forma del detail
  del bus DOM, hook data-kinelia="oferta") está en ETAPA-2-SEAMS.md (SHELL-04).

  El bus de eventos DOM (assets/events.js, window.Kinelia.events) es la ÚNICA
  API de eventos interna del tema (D-02). NO se emite un stub window.kinelia.track()
  ni window.dataLayer — en Etapa 2 este snippet se suscribe al bus y reenvía.

  Cuando se active la atribución, descomentar la línea de abajo y reemplazar
  <proyecto> por el ref real del proyecto Supabase:
{%- endcomment -%}
{%- comment -%}
  <script src="https://<proyecto>.supabase.co/storage/v1/.../kinelia-atribucion.js" defer></script>
{%- endcomment -%}
```

### `theme.liquid` — montaje del seam y del bus (fragmentos)

```liquid
{%- comment -%} <head>, tras meta-tags (D-03) {%- endcomment -%}
{% render 'meta-tags' %}
{% render 'analytics-hooks' %}
{{ content_for_header }}
```
```liquid
{%- comment -%} <body> {%- endcomment -%}
<a class="skip-link" href="#MainContent">{{ 'general.accessibility.skip_to_content' | t }}</a>
<div id="a11y-live-region" aria-live="polite" role="status" class="visually-hidden"></div>

{% sections 'header-group' %}
<main id="MainContent">{{ content_for_layout }}</main>
{% sections 'footer-group' %}

{%- comment -%} WhatsApp FAB — global, todas las páginas (D-15). Color var(--color-primary), sin sombra. {%- endcomment -%}
<a class="wa-fab" href="https://wa.me/{{ settings.whatsapp_number | default: '' }}" aria-label="{{ 'kinelia.cta.pedir_whatsapp' | t }}" target="_blank" rel="noopener">
  {{ 'icon-whatsapp.svg' | inline_asset_content }}
</a>

<script src="{{ 'events.js' | asset_url }}" defer></script>
```

> Nota: `.visually-hidden` y `.skip-link` **no existen** hoy en `base.css` ni en `critical.css` `[VERIFIED: assets/base.css + assets/critical.css this session]`. El plan agrega ambas utilities (a `base.css`, consumiendo tokens).

### Ejemplo de test manual del bus (para el plan / UAT)

```js
// En la consola del navegador sobre cualquier página del tema (D-07):
Kinelia.events.NAMES;                             // → los 5 nombres
const h = Kinelia.events.on('cart:updated', e => console.log('recibido', e.detail));
Kinelia.events.emit('cart:updated', { itemCount: 3, cart: {} });  // → "recibido { itemCount: 3, cart: {} }"
document.addEventListener('cart:updated', e => console.log('también por addEventListener', e.detail));
Kinelia.events.emit('cart:updated', { itemCount: 4, cart: {} });  // → ambos handlers
Kinelia.events.off(h);
Kinelia.a11y.announce('Producto agregado al carrito');            // → un lector de pantalla lo lee
```

## State of the Art

| Enfoque viejo | Enfoque actual | Cuándo cambió | Impacto para Kinelia |
|---------------|----------------|---------------|----------------------|
| `theme.liquid` con lógica y scripts globales | `theme.liquid` = shell; lógica en snippets, comportamiento en sections/blocks, JS on-demand | OS 2.0 + guía de performance de Shopify | Fase 3 mantiene `theme.liquid` mínimo: solo el seam, el bus, el shell y la a11y del documento. |
| `pubsub.js` como asset del tema (Dawn) | `CustomEvent` sobre `document` con wrapper fino (Horizon: clases `extends Event`, nombres `namespace:verbo`) | Horizon (2025) | El wrapper propio de Kinelia (D-05) sigue el patrón de Horizon sin la deuda de un registro propio. |
| Google Fonts `<link>` en el `<head>` | Fuentes self-hosted subset WOFF2 | Fase 2 (D-08) | Ya hecho. Fase 3 no toca las fuentes; sí el orden del `<head>` alrededor de ellas. |
| `checkout.liquid` / Additional Scripts para tracking | Web Pixels API / Custom Pixels para pixel + GA4 (TRACK-01/02) | Checkout Extensibility (obligatorio para tiendas nuevas) | El seam de Fase 3 es para el **script de atribución de primera parte** (que sí va en el tema) y para el pixel de storefront; el pixel de checkout es Custom Pixels, fuera del tema. `ETAPA-2-SEAMS.md` lo aclara. |
| Meta viewport / charset "en algún lugar del head" | charset en los primeros bytes, siempre | perenne, pero fácil de romper con `<style>` inline grande | Pitfall 1 / WR-04. |

**Deprecado / a evitar:**
- `checkout.liquid` y Additional Scripts (ya fuera de scope en `REQUIREMENTS.md` CHECKOUT-05).
- `document.write`, scripts sin `defer`/`async` en el `<head>`.
- jQuery / Swiper / frameworks (`ALLOWLIST.md` §"Nunca agregar").

## Assumptions Log

| # | Claim | Sección | Riesgo si está mal |
|---|-------|---------|--------------------|
| A1 | `ParserBlockingScript` es severidad `error` en `theme-check:recommended` (por eso `script_tag` sin defer rompe `npm run lint --fail-level error`) | Pitfall 2 | Si fuera solo `warn`, el lint no falla — pero el `defer` sigue siendo correcto igualmente. Bajo riesgo. Verificable: `shopify theme check --list` o correr el lint con un `<script>` sin defer. |
| A2 | `resource-summary:script:size ≤ 150000 B` sigue siendo `warn` y SUPUESTO (no se endureció desde Fase 1) | Standard Stack, Anti-Patterns | Ya documentado como SUPUESTO en `docs/PERF-BUDGET.md`. `events.js` (~2 KB) + FAB no lo acercan. Bajo riesgo. |
| A3 | Los slugs de páginas legales stub (`/pages/terminos`, `/pages/privacidad`, `/pages/cambios-y-devoluciones`, `/pages/datos-de-la-empresa`) son aceptables; el plan los fija | Pattern 5, User Constraints D-14 | Si el usuario prefiere otros slugs (ej. `/pages/terminos-y-condiciones`), es un cambio barato de runbook. Bajo riesgo — el plan/discuss lo confirma. |
| A4 | La lista de links legales AR obligatorios en el footer (Botón de Arrepentimiento, Defensa del Consumidor, Data Fiscal, T&C, Privacidad, Cambios/Devoluciones, Datos de empresa) es la correcta para una tienda DTC argentina en 2026 | Pattern 5 | **Riesgo medio.** El compliance AR puede tener requisitos adicionales o cambios normativos. Es contenido de Fase 11, pero el linklist de Fase 3 debería contemplarlos. **El discuss/plan DEBE confirmar la lista con el usuario** — no es una decisión que el research pueda cerrar (`<role>`: "compliance requirements ... need user confirmation"). |
| A5 | El endpoint `/collect` y el contrato de `kinelia-atribucion.js` del repo hermano son la versión vigente (leídos hoy de `../../Kinelia/`) | Pattern 3, SHELL-04 | Si el repo hermano cambió en una rama no mergeada, `ETAPA-2-SEAMS.md` podría transcribir una versión vieja. Mitigado por D-04 (el doc es la spec propia del tema, con cita al origen). Bajo riesgo. |
| A6 | Montar `announcement-bar` en `header-group.json` vía commit de código es viable (el editor de temas puede reescribirlo pero no lo rompe) | Pattern 6, Pitfall 3 | Si la integración de GitHub tiene un comportamiento inesperado con section groups nuevos, podría requerir montarlo desde el editor. Verificable en STAGING. Bajo riesgo. |
| A7 | `:has()` para pegar announcement-bar + header sticky funciona en los navegadores del público objetivo (mobile, Safari iOS / Chrome Android recientes) | Pattern 6 | `:has()` es baseline 2026 y `critical.css` ya lo usa. Bajo riesgo. Alternativa: clase en el wrapper vía section settings. |

## Open Questions

1. **¿Qué links legales exactos van en el footer de Fase 3?**
   - Lo que se sabe: se crean páginas stub y un linklist para que nada resuelva a 404 (D-14); el contenido es Fase 11.
   - Lo que no está claro: la lista precisa de compliance AR (¿incluye ya el link a Defensa del Consumidor / VUF? ¿el Botón de Arrepentimiento aparece en el footer además de la home?).
   - Recomendación: el discuss/plan lo confirma con el usuario. Default seguro: T&C + Privacidad + Cambios y Devoluciones + Datos de la empresa como stubs internos, + link a Botón de Arrepentimiento (stub) + link externo a Defensa del Consumidor.

2. **¿`view` como cart attribute lo escribe el tema o Etapa 2?**
   - Lo que se sabe: el contrato del tema tiene 7 attributes; `kinelia-atribucion.js` hoy escribe 6.
   - Lo que no está claro: si un snippet del tema debe leer `?view=` y hacer su propio `/cart/update.js`, o si es trabajo de una versión actualizada del script hermano.
   - Recomendación: `ETAPA-2-SEAMS.md` lo documenta como decisión pendiente asignada a Etapa 2 / Fase 10, con la nota de que el read-modify-write no debe pisar los otros 6.

3. **¿La lógica de convivencia FAB ↔ sticky ATC se hace ahora (stub) o en Fase 6?**
   - Lo que se sabe: la sticky ATC no existe hasta Fase 6; el FAB sí en Fase 3 (D-15, discreción de Claude).
   - Recomendación: Fase 3 deja el FAB + la clase CSS `body.has-sticky-atc .wa-fab` sin el JS que la togglea; Fase 6 agrega el toggle cuando exista el layout de la ATC. Cero JS de FAB en Fase 3.

4. **¿`Kinelia.a11y.announce` en `events.js` o en `assets/a11y.js` separado?**
   - Recomendación: en `events.js`. Es 1 archivo JS nuevo en vez de 2, ~10 líneas más, y el `<div aria-live>` ya lo pone el shell. Separarlo solo tiene sentido si Fase 5/6 lo cargan sin el bus (improbable).

5. **¿`<link rel="icon">` PNG de fallback además del SVG?**
   - Lo que se sabe: `kinelia_isotipo.svg` cubre navegadores modernos.
   - Recomendación: SVG solo es aceptable para 2026 (Safari lo soporta desde 2022). Un PNG de fallback es 1 asset más en el presupuesto. Omitir salvo que el usuario quiera soporte legacy explícito.

## Environment Availability

| Dependencia | Requerida por | Disponible | Versión | Fallback |
|-------------|---------------|------------|---------|----------|
| Shopify CLI (`shopify theme dev` / `theme check`) | Preview local + lint | ✓ (Fase 1 la usa) | 3.x / 4.x (Node 20+) | — |
| Node.js 20+ | CLI, checkers `.mjs` | ✓ | — | — |
| `npx svgo` | Limpiar `kinelia_horizontal.svg` (D-18) | ✓ (npx descarga on-demand) | latest | Editar los `fill` duplicados a mano (peor, no determinista) |
| Archivos de logo (`A- Logo/`) | Header/footer/favicon | ✓ (gitignoreado, en la máquina — STATE.md "Assets recibidos") | `kinelia_horizontal.svg` 7,6 KB · `kinelia_isotipo.svg` 3,4 KB | — |
| Repo hermano `../../Kinelia/` | Transcribir el contrato a `ETAPA-2-SEAMS.md` | ✓ (leído en esta sesión) | HEAD actual | D-04: el doc es la spec propia igualmente |
| Dev store + tema STAGING | Runbook de páginas stub + número de WhatsApp + verificación del sticky/FAB | ✓ (Fase 1, `Kinelia — STAGING`) | — | — |
| Harness de Lighthouse mobile | Verificar CLS del sticky header | ⚠️ parcial | — | No corre limpio en Windows contra el proxy de `theme dev` (`.planning/WINDOWS.md`); medición mobile throttled real = Fase 13. Verificación de Fase 3: DevTools "Performance / CLS" manual + inspección de altura sobre el fold. |

**Sin fallback y bloqueante:** ninguno.
**Con fallback:** medición de CLS (manual en vez de Lighthouse throttled — aceptable, la pasada dura es Fase 13).

## Validation Architecture

### Test Framework

| Propiedad | Valor |
|-----------|-------|
| Framework | **No hay framework de tests unitarios.** El tema se valida con: (1) `shopify theme check --fail-level error` (Theme Check), (2) los tres checkers Node stdlib (`check-tokens.mjs`, `check-allowlist.mjs`, `check-secrets.mjs`), (3) Lighthouse local (`npm run perf`), (4) walkthrough manual del preview de STAGING (`docs/RELEASE.md` checklist). |
| Config file | `.theme-check.yml` (`extends: theme-check:recommended`, sin reglas desactivadas) · `package.json` scripts `lint` / `lint:all` / `lint:allowlist` / `perf` |
| Quick run command | `npm run lint` (Theme Check + `check-tokens` + `check-allowlist` + `check-secrets`) |
| Full suite command | `npm run lint:all` + `npm run perf` (Lighthouse local, requiere `shopify theme dev` en otra shell) |

### Phase Requirements → Test Map

| Req ID | Comportamiento | Tipo de test | Comando / método automatizable | ¿Existe? |
|--------|----------------|--------------|--------------------------------|----------|
| SHELL-01 | `theme.liquid` monta `css-variables` + `analytics-hooks`; el snippet es no-op (cero bytes al cliente) | lint + assertion de contenido | `shopify theme check` verde; un check nuevo en `check-allowlist.mjs` o un test: `analytics-hooks.liquid` no contiene markup no comentado / no contiene `<script>` sin comentar | ❌ Wave 0 (regla de checker nueva, opcional) |
| SHELL-01 | charset en los primeros 1024 bytes (Pitfall 1) | assertion HTTP | `curl -s <staging-url> \| head -c 1024 \| grep -q 'charset'` — documentar en el plan/UAT | ❌ Wave 0 (comando en el plan) |
| SHELL-02 | Header renderiza logo + carrito + cuenta condicional; menú vacío colapsa | manual + lint | Walkthrough STAGING; `shopify theme check` verde; UAT visual | ✅ (Theme Check existe) / ❌ UAT script |
| SHELL-02 | Footer: linklist legal resuelve (sin 404), newsletter no renderiza con default `false`, iconos de pago colapsan si `shop.enabled_payment_types` vacío | manual + assertion | Walkthrough STAGING de cada link; ver que `show_newsletter=false` → cero markup | ❌ Wave 0 (UAT checklist) |
| SHELL-03 | `Kinelia.events.emit/on/off` funciona; `document.addEventListener` recibe el mismo evento; los 5 nombres existen | manual (consola) | El snippet de "test manual del bus" en Code Examples — documentado en el plan y ejecutado en UAT | ❌ Wave 0 (guion de consola en el plan) |
| SHELL-03 | `assets/events.js` cargado con `defer`, sin `ParserBlockingScript` | lint | `shopify theme check --fail-level error` verde | ✅ (Theme Check existe) |
| SHELL-03 | `check-allowlist.mjs` deja pasar `events.js` y sigue rechazando un `.js` no listado | test del checker | `node scripts/check-allowlist.mjs` exit 0 con `events.js` presente; agregar un `.js` fantasma → exit 1 | ❌ Wave 0 (ajuste del checker + su verificación) |
| SHELL-04 | `ETAPA-2-SEAMS.md` existe y lista los 7 cart attributes + 8 eventos de `/collect` + los 5 del bus + el hook `data-kinelia="oferta"` | assertion de contenido | Un check nuevo (recomendado, sigue el patrón "checker = copia de un contrato"): `check-seams.mjs` falla si un nombre del bus en `events.js` no está en `ETAPA-2-SEAMS.md`, o si falta un tipo de `/collect` | ❌ Wave 0 (checker nuevo — recomendado por `03-CONTEXT.md` §Established Patterns) |
| — | CSS nuevo del header/footer/FAB/announcement-bar solo usa `var(--*)`, sin hex/shadow/gradient/uppercase | lint | `node scripts/check-tokens.mjs` exit 0 | ✅ (existe) |
| — | Lighthouse a11y ≥ 0.95 se mantiene con el header/footer/skip-link/aria-live nuevos | perf harness | `npm run perf` (local) | ✅ cableado / ⚠️ Windows |

### Sampling Rate

- **Per task commit:** `npm run lint` (Theme Check + 3 checkers) — < 15 s.
- **Per wave merge:** `npm run lint:all` + walkthrough del preview de STAGING (header, footer, cada link legal, consola del bus).
- **Phase gate:** `npm run lint:all` verde + `npm run perf` (o medición manual de CLS/a11y si Windows bloquea) + checklist de `docs/RELEASE.md` + el guion de consola del bus ejecutado.

### Wave 0 Gaps

- [ ] `scripts/check-allowlist.mjs` — aflojar la regla anti-JS (aceptar `assets/events.js` y `assets/a11y.js` si se separa; seguir rechazando cualquier otro `.js`/`.mjs` no listado) — D-09, SHELL-03.
- [ ] `scripts/check-seams.mjs` (nuevo, **recomendado**) — copia ejecutable del contrato SHELL-04: falla si un nombre del bus en `events.js` no aparece en `ETAPA-2-SEAMS.md`, o si un tipo de evento de `/collect` o un cart attribute del contrato falta en el doc. Sigue el patrón "checker = copia de un contrato" (`check-tokens.mjs`, `check-allowlist.mjs`). Agregar a `npm run lint` y al job CI.
- [ ] Guion de consola para el test del bus — en el `PLAN.md` y en el `UAT`, no es un archivo de test.
- [ ] Comando `curl … | head -c 1024 | grep charset` — en el plan como verificación de SHELL-01 / Pitfall 1.
- [ ] `.visually-hidden` y `.skip-link` en `base.css` — utilities nuevas que el shell necesita (no existen hoy).
- [ ] Runbook en STAGING: crear 4 páginas stub + linklist del footer + valor del setting `whatsapp_number` (pasos de admin, no de código — documentar en el plan).

*(No hay framework de tests unitarios que instalar — el tema nunca tuvo uno y el ALLOWLIST prohíbe agregar toolchain con build. La validación es lint + checkers stdlib + Lighthouse + walkthrough, que ya existen.)*

## Security Domain

`security_enforcement: true`, `security_asvs_level: 1`, `security_block_on: high`.

### Applicable ASVS Categories

| ASVS Category | Aplica | Control estándar |
|---------------|--------|------------------|
| V1 Architecture | sí (leve) | El seam `analytics-hooks.liquid` es el punto donde entra código de terceros al `<head>` en Etapa 2. Documentar en `ETAPA-2-SEAMS.md` que todo lo que se enchufe ahí es third-party y debe revisarse. |
| V5 Input Validation / Output Encoding | **sí** | (1) El setting `whatsapp_number` se usa solo en un `href` (`https://wa.me/{{ ... }}`) — Liquid auto-escapa; **nunca** interpolarlo en un `{% style %}` o `<script>` (regla 3 de `check-tokens.mjs` lo bloquea para `<style>`). (2) La clave de locale de la barra de anuncio es prosa plana (sin sufijo `_html`) → auto-escapa. (3) El link opcional de la barra de anuncio: validar que sea `url` type en el schema, no `text`. |
| V5 — `detail` del bus de eventos | sí | El `detail` de los `CustomEvent` puede llevar datos del carrito/producto. En Fase 3 nadie emite; el contrato en `ETAPA-2-SEAMS.md` debe decir que el `detail` **no** debe llevar PII (email, dirección) — solo IDs y montos. |
| V7 Error Handling | sí (leve) | `cart:error` lleva `{ message, source, code }` — el `message` no debe filtrar detalles internos de la API de Shopify al DOM. Fase 6 lo respeta; el contrato lo anota. |
| V9 / V10 Comms & Malicious Code | sí | El `<script>` de atribución va **comentado** (D-01) — cero request a un tercero en Etapa 1. El endpoint `/collect` va como placeholder `<proyecto>`. Code review verifica que no se hardcodee una URL real de Supabase ni un origen real. `rel="noopener"` en el link del FAB y en cualquier `target="_blank"`. |
| V14 Configuration | sí | `content-security-policy` de un tema Shopify lo maneja Shopify (no se puede setear un CSP propio fácil). Cuando Etapa 2 active el `<script>` de atribución + el pixel, el `connect-src` a `*.supabase.co` y a Meta/Google es implícito — `ETAPA-2-SEAMS.md` lo lista para que Etapa 2 lo tenga presente. |
| V2/V3/V4/V6/V8 (Auth, Session, Access Control, Crypto, Data Protection) | no | Sin auth, sin sesión propia, sin crypto en el tema. `<shopify-account>` delega todo a Shopify. `visitante_id` es un UUID de primera parte sin PII, y no se escribe en Fase 3. |

### Known Threat Patterns for {tema Liquid Skeleton + seam de analytics}

| Patrón | STRIDE | Mitigación estándar |
|--------|--------|---------------------|
| XSS vía una clave de locale con `_html` o un setting `text`/`richtext` interpolado sin escapar | Tampering / Elevation | Claves de locale planas (auto-escape); `check-tokens.mjs` regla 3 rechaza settings no acotados en `{% style %}`; `check-tokens.mjs` regla 8 rechaza `kinelia.legal_disclaimer_html`. La barra de anuncio y el FAB no introducen claves `_html`. |
| Script de tercero malicioso enchufado en el seam | Tampering | En Etapa 1 el seam es 100% comentario. En Etapa 2, `ETAPA-2-SEAMS.md` exige revisión de todo lo que entre; el `<script>` de atribución apunta a un asset servido por el propio proyecto (Supabase storage del repo hermano), no a un CDN de terceros arbitrario. |
| Fuga prematura de la IP del visitante a un tercero | Information Disclosure | El `<script>` de atribución está **comentado** (D-01) — cero conexión a `*.supabase.co` hasta Etapa 2. Igual que las fuentes self-hosted de Fase 2 evitan el hop a `fonts.gstatic.com`. |
| Clobbering de cart attributes ajenos | Tampering | El contrato en `ETAPA-2-SEAMS.md` especifica **read-modify-write** (GET `/cart.js`, merge, no pisar) — requisito de BUY-06. |
| URL de Supabase / origen real hardcodeado en el repo público | Information Disclosure | Repo público en Etapa 1 (STATE.md). Placeholder `<proyecto>` en el doc y en el `<script>` comentado. `check-secrets.mjs` + code review. |
| `open redirect` / tabnabbing vía links del footer / FAB | Tampering | `rel="noopener"` en todo `target="_blank"`; los links legales resuelven a páginas internas o a dominios `.gob.ar` conocidos. |
| CLS del sticky header usado como cover para clickjacking del buy box | — (calidad/UX, no seguridad estricta) | Reservar altura; `position: sticky` (no `fixed`); z-index documentado por debajo de cualquier overlay. |

**Bloqueo `high`:** ninguna amenaza `high` identificada para el scope de Fase 3 (sin auth, sin datos sensibles, sin código activo de terceros). El seam es no-op.

## Sources

### Primary (HIGH confidence)

- **`../../Kinelia/web/kinelia-atribucion.js`** (repo hermano, leído verbatim esta sesión) — cookie `kinelia_attr`, 6 cart attributes, first-touch de UTMs, `/cart/update.js`, cola a `/collect`, hook `data-kinelia="oferta"`, `window.kinelia`.
- **`../../Kinelia/supabase/functions/collect/index.ts`** (leído verbatim esta sesión) — `TIPOS` Set de 8 eventos (líneas 24-33), body `{ visitante_id, eventos }`, validación de origen `COLLECT_ORIGENES`, servidor pone `ocurrido_en`.
- **`../../Kinelia/.claude/CLAUDE.md`** — contrato de idempotencia, "CPA siempre efectivo", por qué la atribución no se backfillea, `raw.evento_web` / `core.orden.creativo_publicacion_id`.
- **Repo Kinelia Storefront** (leídos esta sesión): `layout/theme.liquid`, `layout/password.liquid`, `sections/header.liquid`, `sections/footer.liquid`, `sections/header-group.json`, `sections/footer-group.json`, `snippets/meta-tags.liquid`, `snippets/css-variables.liquid`, `assets/base.css`, `assets/critical.css`, `config/settings_schema.json`, `locales/es.default.json`, `scripts/check-allowlist.mjs`, `scripts/check-tokens.mjs`, `ALLOWLIST.md`, `OVERRIDES.md`, `docs/PERF-BUDGET.md`, `docs/RELEASE.md`, `docs/BRAND-COPY.md`, `.theme-check.yml`.
- **`Shopify/skeleton-theme`** (GitHub API `contents/` de cada directorio, esta sesión) — confirma cero `.js` en `assets/`, no cart drawer, no predictive search, lista completa de sections/snippets/templates.
- **`Shopify/horizon` `assets/events.js`** (raw fetch, esta sesión) — patrón `class extends Event`, convención de nombres `namespace:verbo` (`media:started-playing`, `slideshow:select`).
- **`Shopify/dawn` `assets/constants.js` + `assets/pubsub.js`** (jsdelivr, esta sesión) — `PUB_SUB_EVENTS` (`cart-update`, `variant-change`, `cart-error`), `subscribe`/`publish` con registro propio.
- **`Shopify/dawn` `LICENSE.md`** (jsdelivr, esta sesión) — **NO es MIT**: "Copyright (c) 2021-present Shopify Inc." + restricción de uso a themes de Shopify.
- **shopify.dev/docs/api/liquid/filters/script_tag** (WebFetch, esta sesión) — `script_tag` no agrega `defer`/`async` por defecto.
- **shopify.dev/docs/storefronts/themes/best-practices/performance** (WebFetch, esta sesión) — `defer` para scripts no críticos, `import()` dinámico en event listeners, render en Liquid no en JS.

### Secondary (MEDIUM confidence)

- **tiendanube.com/blog/boton-de-arrepentimiento/**, **argentina.gob.ar/normativa/nacional/resolución-424-2020-342869**, **docs.tiendanube.com/help/defensa-al-consumidor** (WebSearch, esta sesión) — Botón de Arrepentimiento (Res. 424/2020), link a Defensa del Consumidor en el footer, Data Fiscal QR. **A confirmar con el usuario la lista exacta.**
- **blackbeltcommerce.com/create-shopify-theme-from-scratch/** — `theme.liquid` como shell-only, delegar a JSON templates/sections.

### Tertiary (LOW confidence)

- Severidad exacta de reglas Theme Check individuales (`ParserBlockingScript`, `AssetSizeJavaScript` threshold) — no verificada contra `shopify theme check --list` en esta sesión (A1).

## Metadata

**Confidence breakdown:**
- Estado de la base Skeleton + repo Kinelia: **HIGH** — archivos leídos verbatim esta sesión; Skeleton confirmado vía GitHub API.
- Contrato de Etapa 2 (cart attributes, eventos `/collect`): **HIGH** — leído verbatim del repo hermano (`kinelia-atribucion.js`, `collect/index.ts`).
- Patrón del bus de eventos: **HIGH** para el mecanismo (`CustomEvent` nativo); **MEDIUM** para la forma exacta del `detail` (D-06 la deja al plan).
- Orden del `<head>` / Pitfall charset: **HIGH** — el problema es verificable en los archivos actuales.
- Compliance legal AR del footer: **MEDIUM** — fuentes secundarias; requiere confirmación del usuario (A4).
- Severidades de Theme Check: **LOW** — no verificadas esta sesión (A1).

**Research date:** 2026-09-09
**Valid until:** 2026-10-09 para el contrato del repo hermano y la base Skeleton (estables); ~2026-09-23 para lo de compliance AR y detalles de Theme Check (revisar si cambian antes de Fase 11).
