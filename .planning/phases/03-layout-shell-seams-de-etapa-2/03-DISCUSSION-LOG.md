# Phase 3: Layout shell + seams de Etapa 2 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-09-09
**Phase:** 3-layout-shell-seams-de-etapa-2
**Areas discussed:** Seam de analytics + hook de atribución, Bus de eventos DOM, Header mínimo, Footer: legales / WhatsApp / newsletter

---

## Seam de analytics + hook de atribución

### Forma de `snippets/analytics-hooks.liquid`

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Snippet vacío + contrato en comentario | Renderiza nada, solo comentario Liquid con lo que Etapa 2 conecta | (recomendación de Claude tras "vos decidís") |
| Stub JS no-op (`window.kinelia.track`) | `<script>` inline con `kinelia.track(){}` + `dataLayer=[]` | |
| Las dos cosas | Stub + comentario-contrato | |

**User's choice:** "Que recomendás vos para cumplir con los objetivos de la tienda?" → Claude recomendó **snippet no-op con comentario-contrato + `<script>` de atribución comentado, sin stub `kinelia.track()`**. Confirmado: "Va tal cual".
**Notes:** Sin stub porque el bus de eventos DOM ya es la API estable interna; dos sistemas de eventos = deuda sobre un baseline casi-cero-JS.

### `<script src>` de `kinelia-atribucion.js` en el shell

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| No — solo documentado en `ETAPA-2-SEAMS.md` | Cero markup de atribución hasta Etapa 2 | |
| Sí — comentado/gated en `analytics-hooks.liquid` | El tag `<script>` va físicamente pero comentado o tras flag apagado | ✓ |

**User's choice:** "Sí — comentado/gated en analytics-hooks.liquid"
**Notes:** Claude ajustó a **comentado** (no setting-gated): un toggle del theme editor sin asset detrás es peor que un comentario, y el archivo vive en el repo hermano.

### Ubicación del render en `theme.liquid`

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| En `<head>`, tras meta-tags / antes de `content_for_header` | Donde Etapa 2 espera pixel + atribución first-touch | ✓ (recomendación de Claude) |
| Antes de `</body>` | Más seguro para LCP, pero tarde para captura de UTMs | |
| Un hook en cada lugar | `analytics-hooks-head` + `analytics-hooks-body` | |

**User's choice:** "Lo que recomiendes para maximizar los objetivos de la tienda" → `<head>` tras meta-tags, **un solo hook**.
**Notes:** Body-hook diferido a Etapa 2 si GA4 lo pide (YAGNI).

### `ETAPA-2-SEAMS.md` vs repo hermano

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Lo referencia como fuente de verdad (rutas explícitas) | Apunta a `../../Kinelia/web/...` como contrato canónico | |
| Copia el contrato inline, sin depender de rutas externas | Transcribe eventos + cart attributes como contrato propio | |
| **Híbrido** | Contrato inline + cita al repo hermano como origen | ✓ (recomendación de Claude) |

**User's choice:** "Lo que recomiendes" → híbrido.
**Notes:** El repo hermano puede moverse / hacerse privado; el tema necesita su contrato self-contained.

---

## Bus de eventos DOM

### Mecanismo

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| CustomEvent nativo sobre `document` | Cero abstracción, helper mínimo | |
| Mini pub/sub module (estilo Horizon `pubsub.js`) | subscribe/publish + registro de callbacks | |
| Los dos (CustomEvent + wrapper pub/sub) | El wrapper publica también como CustomEvent | ✓ |

**User's choice:** "Los dos (CustomEvent + wrapper pub/sub)"
**Notes:** Claude lo interpretó como **un solo módulo** `assets/events.js` con `Kinelia.events.emit/on/off` que **es** `CustomEvent` internamente — wrapper fino (nombres tipados, handles de desuscripción, debug), sin registro propio ni cola. Confirmado: "Va tal cual".

### Eventos que define Fase 3

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Solo los 3 del roadmap | `variant:changed`, `product:added`, `cart:updated` | |
| Los 3 + `cart:error` / `cart:loading` | Suma eventos de estado para Fase 6 | ✓ |
| Vos decidís el set mínimo | Claude fija el set en el plan | |

**User's choice:** "Los 3 + un cart:error / cart:loading para estados"
**Notes:** 5 eventos. Forma del `detail` se fija en el plan y se documenta en `ETAPA-2-SEAMS.md`.

### Quién emite en Fase 3

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Nadie — solo el módulo + contrato documentado | Emisores llegan con sus secciones (Fases 5-6) | ✓ |
| El header ya escucha `cart:updated` para el contador | Un consumidor real que prueba el bus end-to-end | |

**User's choice:** "Nadie — solo el módulo + el contrato documentado"
**Notes:** Se testea con `Kinelia.events.emit(...)` desde consola.

### Helpers de accesibilidad

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Sí, un set mínimo junto al bus | `announce` + focus-trap reutilizable | |
| No, solo el bus | a11y helpers cuando su consumidor exista | |
| Vos decidís | Claude decide en el plan | ✓ |

**User's choice:** "Vos decidís" → Claude: **solo `<div aria-live>` en el shell + `Kinelia.a11y.announce(msg)`**; focus-trap diferido a Fase 6/5. Confirmado: "Va tal cual".
**Notes:** El live-region es preocupación del shell; el focus-trap sin consumidor sería código huérfano.

---

## Header mínimo

### Elementos del header

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Solo logo + carrito | Sin ícono de cuenta | |
| Logo + carrito + cuenta | Suma `<shopify-account>` condicional | ✓ |
| Logo centrado + carrito | Estética de landing | |

**User's choice:** "Logo + carrito + cuenta"

### Menú de navegación

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Sin menú | Un producto, una landing | |
| Menú mínimo editable (vacío por defecto) | Setting conservado, arranca vacío | ✓ (interpretación) |

**User's choice:** "Agregaría un menú o al menos lo dejaría preparado en el back, por si en algún momento sumamos uno o dos productos más al portfolio."
**Notes:** Se conserva el `link_list` del starter en el schema, vacío por defecto, markup que colapsa a nada.

### Sticky

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| No sticky | El header se va con el scroll | |
| Sticky solo en mobile | Header fijo arriba en mobile | ✓ |
| Vos decidís en el plan | Claude elige según CLS/JS | |

**User's choice:** "Sticky solo en mobile" — y luego, sobre la recomendación de que solo el header (no la barra de anuncio) fuera sticky: **"La barra de anuncio también sticky en mobile"**.
**Notes:** Header compacto + franja de anuncio quedan fijos arriba juntos en mobile. El plan cuida CLS + altura sobre el fold + convivencia con sticky ATC de Fase 6.

### Announcement bar

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| No en Fase 3 | Se agrega en Fase 9/11 como section | |
| Sí, barra estática desde locale | Franja editable con clave de locale | ✓ |

**User's choice:** "Sí, barra de anuncio estática desde locale"
**Notes:** `section` propia, no dismissible, 1 clave locale + link opcional, respeta D-16 (sin urgencia falsa).

---

## Footer: legales / WhatsApp / newsletter

### Links legales (páginas creadas en Fase 11)

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Menú de Shopify + páginas stub creadas ahora | Links resuelven desde día 1; Fase 11 llena contenido | ✓ |
| Linklist editable, vacío hasta Fase 11 | Footer sin links legales visibles al arranque | |
| Links hardcodeados a rutas finales (404 hasta Fase 11) | Rutas rotas visibles en STAGING | |

**User's choice:** "Menú de Shopify + páginas stub creadas ahora"
**Notes:** El contenido de páginas es propiedad del theme editor (`docs/RELEASE.md`) → crear stubs + linklist es paso de runbook/admin, no de código.

### WhatsApp

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Link en el footer solamente | `wa.me/<numero>` desde setting | |
| Footer + botón flotante global | FAB fijo abajo-derecha en todas las páginas | ✓ |
| Solo afordancia en footer, FAB diferido | Decisión del FAB en Fase 6/11 | |

**User's choice:** "Footer + botón flotante global"
**Notes:** Claude marcó: el FAB choca con la sticky ATC de Fase 6 en mobile → el plan resuelve reposición/ocultamiento; diseño plano (sin sombra D-11, sin pulso).

### Newsletter deshabilitado

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Markup presente, comentado / tras setting apagado | `{% if section.settings.show_newsletter %}` default false | ✓ |
| Visible pero inerte | Bloque "Suscribite" deshabilitado | |
| No incluirlo en Fase 3 | Se agrega entero en Etapa 2 | |

**User's choice:** "Markup presente, comentado / detrás de setting apagado"

### Iconos de medios de pago

| Opción | Descripción | Elegida |
|--------|-------------|---------|
| Mantener, condicional a que haya medios configurados | Bloque del starter con `show_payment_icons`, colapsa si vacío | ✓ |
| Quitar del footer | Reassurance de pago vive en el buy box | |
| Vos decidís | Claude decide en el plan | |

**User's choice:** "Mantener, condicional a que haya medios configurados"
**Notes:** MercadoPago se configura en Fase 12; hasta entonces `shop.enabled_payment_types` puede estar vacío y el bloque colapsa.

---

## Claude's Discretion

- Forma exacta del `detail` de cada uno de los 5 eventos DOM.
- Si `Kinelia.a11y.announce` vive en `events.js` o en `assets/a11y.js` separado.
- Estructura interna de `events.js` (IIFE vs módulo, namespace `Kinelia`).
- Slugs de las páginas legales stub y estructura del linklist del footer.
- Texto exacto de la barra de anuncio (respetando D-16).
- Markup/CSS de header / footer / FAB dentro del sistema de diseño plano.
- Si la lógica de convivencia FAB ↔ sticky ATC se implementa ahora (stub) o en Fase 6.
- Si se mantiene un `<link rel="icon">` PNG de fallback además del SVG.
- Cómo se testea el bus (dispatch manual documentado en plan / UAT).
- Forma de `analytics-hooks.liquid`, ubicación del render, tratamiento de `ETAPA-2-SEAMS.md`
  (el usuario delegó estas tres a la recomendación de Claude).

## Deferred Ideas

- focus-trap reutilizable → Fase 6 (cart drawer) / Fase 5 (guía de talles).
- analytics body-hook (GA4) → Etapa 2.
- Consumidores de `cart:loading` / `cart:error` → Fase 6.
- Recableado reactivo del contador de carrito del header → Fase 6.
- Contenido real de páginas legales AR + Botón de Arrepentimiento → Fase 11.
- Lógica completa FAB WhatsApp ↔ sticky ATC → Fase 6.
- Endurecer `check-tokens.mjs` (WR-01/WR-02) antes de usar CSS nesting.
- WR-04: subir `<meta charset>` / `viewport` arriba del `<head>` si Fase 3 toca su orden.
