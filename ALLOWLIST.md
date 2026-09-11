# ALLOWLIST.md — Contrato de superficie del tema

Este documento declara **qué renderiza** el tema Kinelia, **qué queda presente pero sin
renderizar**, y **qué no se agrega nunca**. Es la explicación humana de
`scripts/check-allowlist.mjs`, que es la copia ejecutable y obligatoria de la lista.

## Regla de operación: se reduce por NO REFERENCIAR, nunca por borrar

El tema se mantiene mínimo **quitando referencias**, no eliminando archivos. Cualquier
archivo del starter que no se necesita **se conserva en el repositorio, sin referenciar**,
por dos razones:

1. Una ruta nunca debe resolver a la nada. Si un template se vacía o se borra, la ruta
   correspondiente devuelve una página en blanco o un error — peor que un placeholder.
2. Los módulos del starter tienen acoplamiento implícito (un `snippet` que otro `render`
   incluye, un asset que una `section` usa). Borrar uno rompe otro en silencio.

En la Fase 1 **no se borró ningún archivo del starter**. Ver `OVERRIDES.md` §"Archivos
eliminados".

## Renderiza

Superficies que Kinelia sirve. Una fila por archivo. Esta es la lista contra la que
`scripts/check-allowlist.mjs` compara cada `type` de section referenciado por un template
o un section-group.

| Archivo | Ruta o uso | Por qué |
|---------|------------|---------|
| `layout/theme.liquid` | Layout de todas las rutas de storefront | Documento HTML base: `<head>`, CSS crítico, `header-group`, `footer-group`, `content_for_layout`. |
| `layout/password.liquid` | Layout de la tienda con contraseña | La tienda vive con contraseña hasta la Fase 14; esta es la envoltura de esa pantalla. |
| `sections/header.liquid` | Header global (vía `sections/header-group.json`) | Marca, cuenta y carrito en cada página (D-10, D-18). Inlinea `assets/kinelia_horizontal.svg` como logo (link a `routes.root_url`, nombre accesible desde `shop.name`), además de `icon-account.svg` e `icon-cart.svg`. El menú (`link_list` vacío por defecto) no ocupa espacio mientras esté vacío (D-11). En teléfono queda pinned junto con `announcement-bar` como un solo bloque (D-12). |
| `sections/header-group.json` | Grupo de secciones del header, montado por `layout/theme.liquid` | Punto de montaje editable del header. Desde la Fase 3 (plan 03-03) monta también `announcement-bar`, primera en el orden. |
| `sections/footer.liquid` | Footer global (vía `sections/footer-group.json`) | Menú legal (guardado por tamaño, sin target de página tipeado en el template — D-14), afordancia de WhatsApp (link + botón flotante, leen el setting global `whatsapp_number`, D-15), bloque de newsletter tras el checkbox `show_newsletter` (default apagado, D-16) y el bloque de íconos de pago del starter sin cambios (D-17). Renderiza el botón flotante como hermano de `<footer>` — footer-group.json se monta en toda ruta de storefront, así que el botón es global sin vivir en el layout. El menú del editor y el número de WhatsApp los completa una persona siguiendo `docs/RUNBOOK-STAGING.md` — sin ese paso, el menú y las dos afordancias renderizan vacío por diseño. |
| `sections/footer-group.json` | Grupo de secciones del footer, montado por `layout/theme.liquid` | Punto de montaje editable del footer. |
| `templates/index.json` | Home `/` | Compone `sections/custom-section.liquid` como shell de contenido. La landing real se resuelve en la Fase 11. |
| `sections/custom-section.liquid` | Contenedor de theme-blocks para la home y, más adelante, para las plantillas de avatar | Section genérica basada en bloques `@theme`; es la base del sistema multi-avatar (Fases 7 y 10). Reemplaza a `hello-world` en la home. |
| `templates/product.json` | Producto `/products/*` | Ruta central del embudo: media, precio, formulario de compra. La buy box se construye en la Fase 5. |
| `sections/product.liquid` | Section detrás de `templates/product.json` | Render del producto. |
| `templates/cart.json` | Carrito `/cart` | La página de carrito nativa. El cart drawer es Fase 6 (ver desviación abajo). |
| `sections/cart.liquid` | Section detrás de `templates/cart.json` | Render de la página de carrito. **No se borra bajo ninguna circunstancia.** |
| `templates/search.json` | Búsqueda `/search` | Página de resultados de búsqueda nativa. Predictive search es Fase 11 (ver desviación abajo). |
| `sections/search.liquid` | Section detrás de `templates/search.json` | Render de la página de búsqueda. **No se borra bajo ninguna circunstancia.** |
| `templates/page.json` | Páginas `/pages/*` | Contenedor de las páginas legales AR (T&C, privacidad, cambios y devoluciones, datos de empresa) que crea la Fase 11. |
| `sections/page.liquid` | Section detrás de `templates/page.json` | Render de página estática. |
| `templates/404.json` | Ruta 404 | Toda tienda necesita un 404 que renderice. |
| `sections/404.liquid` | Section detrás de `templates/404.json` | Render del 404. |
| `templates/password.json` | Ruta de contraseña | Pantalla de acceso mientras la tienda está cerrada. |
| `sections/password.liquid` | Section detrás de `templates/password.json` | Render de la pantalla de contraseña. |
| `templates/gift_card.liquid` | Ruta de gift card | Template Liquid (no JSON) que Shopify sirve para gift cards emitidas. |
| `snippets/css-variables.liquid` | `render` desde `layout/theme.liquid` | Emite los custom properties CSS de los tokens de marca (Fase 2). |
| `snippets/image.liquid` | `render` desde varias sections | Helper de `<img>` responsive con `width`/`height`. |
| `snippets/meta-tags.liquid` | `render` desde `layout/theme.liquid` | Open Graph, Twitter card y `<title>`. Las tres meta de codificación/compatibilidad/área visible se movieron al `<head>` de `layout/theme.liquid` (plan 03-01, Pitfall 1). |
| `snippets/analytics-hooks.liquid` | `render` desde `layout/theme.liquid` (`<head>`, tras `meta-tags`, antes de `content_for_header`) | Seam no-op de Etapa 2 (SHELL-01, D-01/D-03). Hoy es 100% comentario: cero bytes al cliente, cero request a terceros. En Etapa 2 se enchufa acá la medición diferida (pixel de Meta, analítica web, script de atribución de primera parte) sin refactor del `<head>` — por eso vale contra el CVR: "conectar la medición" es editar un archivo ya referenciado. |
| `blocks/group.liquid` | Primitiva de theme-block | Contenedor de layout para componer bloques anidados. |
| `blocks/text.liquid` | Primitiva de theme-block | Bloque de texto editable. |
| `assets/critical.css` | `stylesheet_tag` desde `layout/theme.liquid`, `layout/password.liquid`, `templates/gift_card.liquid` | CSS crítico inline-precargado. Único asset CSS de la Fase 1. |
| `assets/base.css` | `stylesheet_tag` desde `layout/theme.liquid`, cargado después de `critical.css` | Primitivas de diseño derivadas de tokens (reset tipográfico, enlaces, botón y formularios) — Fase 2. Solo `var(--*)`: sin hex ni nombres de fuente literales; `scripts/check-tokens.mjs` lo hace cumplir. Sin preload para no competir con la imagen del hero (presupuesto LCP < 2,5 s). |
| `assets/dm-sans-400.woff2` | `@font-face` en `snippets/css-variables.liquid` (`asset_url`) | DM Sans Regular, subset latin + latin-ext (acentos y ñ), SIL OFL 1.1. Familia de titulares (D-05). Self-hosted en vez del CDN de fuentes: quita el RTT a un tercero en el critical path y no filtra la IP del visitante (D-08). Peso: ver `docs/PERF-BUDGET.md`. |
| `assets/dm-sans-500.woff2` | `@font-face` en `snippets/css-variables.liquid` (`asset_url`) + `<link rel=preload>` en `layout/theme.liquid` | DM Sans Medium, subset latin + latin-ext, SIL OFL 1.1. Peso de titular en el first paint — se precarga (uno de solo dos preloads; cada preload compite con la imagen del hero, el elemento LCP). D-05, D-08. |
| `assets/inter-400.woff2` | `@font-face` en `snippets/css-variables.liquid` (`asset_url`) + `<link rel=preload>` en `layout/theme.liquid` | Inter Regular, subset latin + latin-ext, SIL OFL 1.1. Cuerpo de texto — peso del first paint, se precarga (el segundo de dos preloads). D-05, D-08. |
| `assets/inter-500.woff2` | `@font-face` en `snippets/css-variables.liquid` (`asset_url`) | Inter Medium, subset latin + latin-ext, SIL OFL 1.1. Etiquetas y botón (D-05). No se precarga: aparece bajo el fold. D-08. |
| `assets/inter-600.woff2` | `@font-face` en `snippets/css-variables.liquid` (`asset_url`) | Inter SemiBold, subset latin + latin-ext, SIL OFL 1.1. Solo etiquetas y precio en contexto (D-05). No se precarga. D-08. |
| `assets/icon-account.svg` | `inline_asset_content` desde `sections/header.liquid` | Ícono de cuenta del header. |
| `assets/icon-cart.svg` | `inline_asset_content` desde `sections/header.liquid` | Ícono de carrito del header. |
| `assets/icon-whatsapp.svg` | `inline_asset_content` desde `sections/footer.liquid` (link del footer y botón flotante) | Glyph de contacto — trazo, sin relleno, mismas convenciones que `icon-cart.svg`/`icon-account.svg` (viewBox 20×20, `currentColor`, `--icon-stroke-width`). Contra el CVR: es la única vía directa a una persona para un comprador escéptico; cero peso extra de red porque se inlinea, cero script (D-15). |
| `sections/footer.liquid` (botón flotante `.wa-fab`) | Hermano de `<footer>`, visible en toda ruta de storefront | Segunda afordancia de WhatsApp — pinned al nivel de apilamiento `--z-fab` (plan 03-03), color de marca (nunca el verde de WhatsApp, Pitfall 4), sin sombra ni animación (D-11). Ya trae la regla `body.has-sticky-atc .wa-fab { display: none }` para que la Fase 6 solo tenga que poner la clase; esta fase no agrega ningún script. |
| `assets/events.js` | `<script src … defer>` desde `layout/theme.liquid` (antes de `</body>`) | Primer módulo JS del tema (SHELL-03, D-05). Bus de eventos DOM (`window.Kinelia.events` — wrapper fino sobre `CustomEvent`) + helper de accesibilidad (`window.Kinelia.a11y.announce`, plan 03-01 Task 3). Es la **única** API de eventos interna: el sticky ATC (Fase 6) y los consumidores de Etapa 2 se cuelgan de acá en vez de recablear el `<head>`. Presupuesto: ~2 KB, `defer`, nadie emite en Fase 3 (D-07) — el primer consumo real de `resource-summary:script:size`. |
| `assets/kinelia_horizontal.svg` | `inline_asset_content` desde `sections/header.liquid` (logo, link a `routes.root_url`) | La marca de Kinelia en el header (D-10, D-18) en vez de pedirle prestado el nombre de la tienda como texto — es lo primero que un shopper que llega de un anuncio de Meta necesita reconocer. Vectorial, escala sin peso extra por breakpoint. Vendorizado desde la carpeta de marca gitignoreada y optimizado en la Fase 3 (7.587 B, menor al original de 7.617 B; ver `OVERRIDES.md`). |
| `assets/kinelia_isotipo.svg` | `<link rel="icon">` en `layout/theme.liquid` | El icono compacto de marca como favicon (D-18) — la pestaña del navegador es reconocible en un teléfono con muchas pestañas abiertas. Un solo formato vectorial; sin raster de respaldo, cada asset extra es peso que el embudo paga sin necesitarlo. Vendorizado y optimizado en la Fase 3 (3.085 B, menor al original de 3.419 B; ver `OVERRIDES.md`). |
| `sections/announcement-bar.liquid` | `sections/header-group.json`, primera en el orden de montaje (arriba del header) | Franja de anuncio estática y editable desde el theme editor (D-12, D-13, SHELL-02). Mensaje y link opcionales desde el locale — nunca texto en el template. En mobile queda pinned junto con el header como un solo bloque, con su altura reservada por el token `--announcement-bar-height` (sin layout shift). Comunica envío nacional y garantía de 90 días sin fabricar urgencia (brand contract D-16) y sin robarle atención al buy box. |

## Presente, no renderiza

Archivos del starter que **se conservan en el repositorio** pero que **ninguna ruta del
embudo de Kinelia enlaza**. Se conservan porque borrarlos no compra nada y arriesga que una
ruta resuelva a la nada.

| Archivo | Por qué se conserva |
|---------|---------------------|
| `templates/blog.json` + `sections/blog.liquid` | Kinelia no tiene blog en la Etapa 1. Se conserva: borrarlo no compra nada y deja `/blogs/*` sin resolver. |
| `templates/article.json` + `sections/article.liquid` | Sin blog no hay artículos. Se conserva por la misma razón que `blog`. |
| `templates/collection.json` + `sections/collection.liquid` | Kinelia no tiene navegación de catálogo en la Etapa 1 (1 producto). Se conserva: borrarlo deja `/collections/*` sin resolver. |
| `templates/list-collections.json` + `sections/collections.liquid` | Sin navegación de catálogo no hay índice de colecciones. Se conserva por la misma razón que `collection`. |
| `sections/hello-world.liquid` | Section demo del starter. Se **des-referenció** de `templates/index.json` en el plan 01-04; el archivo queda en el repo sin tocar. Borrarlo no compra nada. |
| `assets/shoppy-x-ray.svg` | Ilustración usada solo por `sections/hello-world.liquid`. Se conserva junto con la section demo que la usa. |

Nota: `sections/blog.liquid`, `sections/article.liquid`, `sections/collection.liquid` y
`sections/collections.liquid` siguen figurando en `scripts/check-allowlist.mjs` como tipos
permitidos porque **sus templates aún los referencian y la ruta resuelve si se navega
directo**. Lo que "no renderiza" es que nada dentro del embudo de Kinelia enlaza a esas
rutas. `hello-world` es el único tipo que el checker rechaza: volver a referenciarlo (o
referenciar cualquier section nueva sin sumarla a la tabla `## Renderiza`) hace fallar el
chequeo.

## Nunca agregar

| Prohibición | Razón |
|-------------|-------|
| Aplicaciones page-builder (PageFly, GemPages, Shogun, etc.) | Inyectan DOM y JS que revientan el presupuesto de LCP < 2,5 s; lock-in; pelean contra el modelo de theme-blocks del multi-avatar. |
| Frameworks front-end (React, Vue, Svelte, Alpine, etc.) | El stack está fijado a HTML/CSS/JS nativo. Un framework agrega runtime y peso de JS sobre tráfico mobile de impulso. |
| jQuery | Bloquea el render y gasta presupuesto de JS para nada que el JS nativo de 2026 no resuelva. |
| Librerías de carousel pesadas (Swiper y similares) | Para la galería se usa una librería liviana y touch-first (Embla, ~5 KB) cargada como asset único; nunca una librería pesada. |
| Cualquier dependencia que requiera un paso de compilación antes del deploy | Rompe el round-trip GitHub ↔ editor de Shopify; agrega un toolchain que mantener. El tema no tiene build step. |
| Cualquier archivo en `assets/` sin una fila en `## Renderiza` que lo justifique contra el CVR y el presupuesto de performance | Un asset no revisado es peso que el embudo paga en silencio. |
| JavaScript en `assets/` fuera de `JS_ASSET_ALLOWLIST` | La Fase 1 no agregó JS. Desde la Fase 3 (plan 03-01) un módulo de primera parte entra solo si está en el `Set` `JS_ASSET_ALLOWLIST` de `scripts/check-allowlist.mjs` (hoy: `events.js`), sumado **en la misma pull request** que la fila de `## Renderiza` que lo justifica. Cualquier otro `.js`/`.mjs` sigue siendo una violación, y la prohibición de librerías pesadas (`jquery`, `swiper`, `react`, `vue`, `alpine`) también aplica a los listados. |

## Regla de adición

Una section, block, snippet o asset nuevo se agrega a la tabla `## Renderiza` **en la misma
pull request que lo introduce**, con su justificación contra el CVR y el presupuesto de
performance. Si el `type` de una section referenciada por un template no está en la tabla —
y en el array `RENDER_ALLOWLIST` de `scripts/check-allowlist.mjs` — el checker falla y el
PR no mergea.

Cuando una fase posterior suma un módulo JavaScript legítimo a `assets/`, actualiza la
regla anti-JS de `scripts/check-allowlist.mjs` en esa misma PR, con la fila de allowlist
que lo justifica.

## Contrato de medición diferida

El contrato que la Etapa 2 usa para conectarse al tema sin refactor vive en
`ETAPA-2-SEAMS.md` (raíz del repo): los 7 atributos de carrito, los 8 tipos de evento del
endpoint `/collect`, los 5 eventos del bus DOM del tema con la forma de su `detail`, el hook
`data-kinelia="oferta"` y las reglas de seguridad de payload. `scripts/check-seams.mjs` es
su copia ejecutada — lee los nombres publicados de `assets/events.js` y falla si el
documento y el código se desincronizan. Un cambio en el bus de eventos o en los atributos de
carrito actualiza `ETAPA-2-SEAMS.md` en la misma pull request que lo introduce.

## Idioma del tema

El tema sirve **español rioplatense (voseo) como único idioma default** (D-14). El único
archivo de locale default es `locales/es.default.json` (storefront) con su hermano
`locales/es.default.schema.json` (etiquetas del editor de temas); no hay locale de
inglés. Shopify permite exactamente un archivo `*.default`, y para una tienda de un solo
mercado un segundo locale solo agregaría la obligación permanente de sincronizar cada
clave entre los dos archivos (regla `MatchingTranslations` de Theme Check).

**Todo texto de cara al usuario sale de un archivo de locale, nunca de una plantilla
Liquid.** Un cambio de copy es una edición de `locales/es.default.json` referenciada por
clave desde el template (`{{ 'clave' | t }}`). Nunca se escribe un string en español —ni
en inglés— directo en un `.liquid`. La copy de marca aprobada (CTAs, promesa raíz,
leyenda legal) vive bajo el namespace `kinelia` y está documentada en `docs/BRAND-COPY.md`.
`scripts/check-tokens.mjs` falla si el default deja de ser español o si una de las claves
de copy aprobada desaparece.

## Desviación registrada — Criterio de éxito 3 de la Fase 1

**Criterio de éxito 3 del ROADMAP, textual:**

> El tema base quedó reducido por allowlist de "no renderizar" (sin borrar modulos de
> carrito ni de accesibilidad): el cart drawer y predictive search funcionan, Theme Check
> corre limpio y Lighthouse a11y >= 95

**El hecho.** La base elegida y ratificada en el checkpoint de decisión del plan 01-01 es
el **Skeleton theme** de Shopify. Skeleton **no trae cart drawer, no trae predictive
search, y no trae utilidades de accesibilidad ni un bus de eventos DOM** (`a11y.js`,
`pubsub.js`, `global.js` no existen en esta base — envía cero JavaScript). El criterio 3
fue escrito contra una base Dawn/Horizon donde esos módulos existen para ser preservados.
Sobre Skeleton **no hay nada que despojar y nada que preservar**: el riesgo se invierte de
"despojar de más" a "construir de menos y luego re-importar peso".

**La reformulación.** En este proyecto, FOUND-03 significa: *"la base se mantiene mínima y
un allowlist gobierna qué renderiza"*. La reducción se hace por no referenciar, se hace
cumplir con `scripts/check-allowlist.mjs`, y ningún archivo del starter se borra.

**Los dueños de los componentes diferidos.** Cada uno se porta **en estructura** desde los
componentes open-source de Horizon (`github.com/Shopify/horizon`), cuya licencia se
verifica en el momento del porting y se registra en `OVERRIDES.md` §"Componentes portados":

- **Cart drawer → Fase 6** (Bundle spike + selector + carrito + sticky ATC).
- **Predictive search / búsqueda mínima → Fase 11** (Home + páginas legales AR + 404 +
  búsqueda).
- **Bus de eventos DOM + helpers de accesibilidad → Fase 3** (Layout shell + seams de
  Etapa 2). **Entregado (plan 03-01):** `assets/events.js` — `window.Kinelia.events`
  (`emit` / `on` / `off` / `NAMES`) sobre `CustomEvent`, y `window.Kinelia.a11y.announce`
  sobre un `<div aria-live="polite">` del shell. La regla anti-JS de
  `scripts/check-allowlist.mjs` se aflojó a `JS_ASSET_ALLOWLIST` en la misma PR.

**Qué verifica la Fase 1 en lugar del criterio como está escrito:**

- La ruta de la página de carrito (`/cart`) resuelve a `sections/cart.liquid`.
- La ruta de la página de búsqueda (`/search`) resuelve a `sections/search.liquid`.
- `shopify theme check --fail-level error` corre limpio.
- Lighthouse accessibility se mantiene en o por encima del presupuesto (>= 0,95) sobre el
  template de referencia.
- `scripts/check-allowlist.mjs` sale con estado 0 y con un conteo de templates distinto de
  cero.

**Naturaleza de esta desviación.** La verificación de la fase debe leer esto como una
**decisión registrada, con dueños nombrados**, no como un incumplimiento. La nota de
desviación equivalente ya está en `.planning/ROADMAP.md` bajo los detalles de la Fase 1.
