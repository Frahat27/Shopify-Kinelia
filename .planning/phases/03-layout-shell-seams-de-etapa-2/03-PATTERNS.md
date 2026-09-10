# Phase 3: Layout shell + seams de Etapa 2 - Pattern Map

**Mapped:** 2026-09-09
**Files analyzed:** 22 (create + modify + runbook)
**Analogs found:** 19 / 22 (3 have no in-repo analog — first JS module)

/ Este repo tiene un solo idioma, sin build step, sin framework. El patrón dominante
es "checker ejecutable = copia de un contrato" y "se extiende el archivo del starter,
no se reescribe". Todo CSS nuevo vive en `{% stylesheet %}` scoped y consume solo
`var(--*)`. Cada archivo nuevo → fila en `ALLOWLIST.md` + `OVERRIDES.md` en la misma PR. /

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `snippets/analytics-hooks.liquid` (NEW) | snippet / seam | render (no-op) | `snippets/meta-tags.liquid` + `snippets/css-variables.liquid` (comment header) | role-match |
| `assets/events.js` (NEW) | JS module (event bus + a11y) | event-driven (pub/sub) | — (ver "No Analog") ; contrato: `scripts/check-tokens.mjs` header + 03-RESEARCH Pattern 2 skeleton | no analog |
| `assets/a11y.js` (NEW, opcional) | JS module | request-response | idem `events.js` | no analog |
| `sections/announcement-bar.liquid` (NEW) | section | render | `sections/footer.liquid` / `sections/header.liquid` | exact |
| `sections/header.liquid` (MODIFY) | section | render | itself (verbatim abajo) | exact |
| `sections/footer.liquid` (MODIFY) | section | render | itself (verbatim abajo) | exact |
| `sections/header-group.json` (MODIFY) | section group config | config | `sections/footer-group.json` + itself | exact |
| `layout/theme.liquid` (MODIFY) | layout / shell | render | itself + `layout/password.liquid` | exact |
| `layout/password.liquid` (MODIFY) | layout / shell | render | `layout/theme.liquid` | role-match |
| `snippets/meta-tags.liquid` (MODIFY) | snippet | render | itself (remove charset trio, lines 1-3) | exact |
| `assets/kinelia_horizontal.svg` (NEW) | static asset | file-I/O | `assets/icon-cart.svg` / `assets/icon-account.svg` | exact |
| `assets/kinelia_isotipo.svg` (NEW) | static asset | file-I/O | `assets/icon-cart.svg` | exact |
| `assets/icon-whatsapp.svg` (NEW) | static asset | file-I/O | `assets/icon-cart.svg` | exact |
| `scripts/check-allowlist.mjs` (MODIFY) | checker | batch / transform | itself (lines 133-154, the anti-JS rule) | exact |
| `scripts/check-seams.mjs` (NEW, recomendado) | checker | batch / transform | `scripts/check-tokens.mjs` + `scripts/check-allowlist.mjs` | exact |
| `config/settings_schema.json` (MODIFY) | config | config | itself (typography `select` block) | exact |
| `locales/es.default.json` (MODIFY) | locale data | config | itself (`kinelia`, `accessibility`, `newsletter` namespaces) | exact |
| `locales/es.default.schema.json` (MODIFY) | locale editor labels | config | itself | exact |
| `ETAPA-2-SEAMS.md` (NEW, root) | contract doc | doc | `ALLOWLIST.md` / `OVERRIDES.md` (prose contract) + sibling repo files | role-match |
| `ALLOWLIST.md` (MODIFY) | contract doc | doc | itself (`## Renderiza` table + `## Desviación registrada`) | exact |
| `OVERRIDES.md` (MODIFY) | contract doc | doc | itself (`## Archivos modificados` / `## Archivos nuevos` / `## Componentes portados`) | exact |
| `package.json` + `.github/workflows/ci.yml` (MODIFY) | tooling config | config | itself (`lint` chain / CI "Theme Check (gate)" step) | exact |
| stub pages `/pages/*` + footer linklist (RUNBOOK) | admin step | — | `docs/RELEASE.md` §"Propiedad del contenido" | n/a — not code |

## Pattern Assignments

### `snippets/analytics-hooks.liquid` (snippet / seam, no-op)

**Analog:** `snippets/meta-tags.liquid` (rendered from `theme.liquid` line 41), `snippets/css-variables.liquid` (comment-doc style).

- **Render-from-theme pattern:** montado exactamente como los otros snippets del `<head>` en `layout/theme.liquid`:
  ```liquid
  {% render 'meta-tags' %}       {%- comment -%} theme.liquid:41 {%- endcomment -%}
  {% render 'analytics-hooks' %} {%- comment -%} NUEVO — tras meta-tags, antes de content_for_header (D-03) {%- endcomment -%}
  {{ content_for_header }}
  ```
- **Comment-contract style:** copiar el formato de cabecera de `check-tokens.mjs` lines 1-51 y de los `{% comment %} KINELIA (plan NN-NN): ... {% endcomment %}` de `theme.liquid` lines 7-25. El snippet es 100% `{%- comment -%}` + un `<script src>` comentado. Cero markup renderizado.
- **Anti-pattern (03-RESEARCH Anti-Patterns):** el `<script src>` NUNCA sin comentar (dispara `RemoteAsset`); NO emitir `window.kinelia.track()` ni `window.dataLayer` (D-02); un solo hook en `<head>`, no un body-hook.
- **Contenido verbatim recomendado:** 03-RESEARCH.md lines 555-586 (bloque `snippets/analytics-hooks.liquid`).
- **Endpoint placeholder:** `https://<proyecto>.supabase.co/functions/v1/collect` — igual que el sibling `web/kinelia-atribucion.js:28` (`var ENDPOINT = "https://<proyecto>.supabase.co/functions/v1/collect"`). `check-secrets.mjs` + code review verifican que no se hardcodee una URL real.

---

### `assets/events.js` (JS module — event bus + a11y)

**Analog:** ninguno en el repo (primer `.js`). Contrato de estilo: `scripts/check-tokens.mjs` lines 1-51 (cabecera de archivo que explica propósito + reglas). Esqueleto de referencia: 03-RESEARCH.md lines 310-351.

- **IIFE clásico, no ESM** (Skeleton no tiene import map / bundler — 03-RESEARCH Alternatives). Namespace `window.Kinelia = window.Kinelia || {}`.
- **Es un wrapper fino sobre `CustomEvent`/`document`** — no mantiene registro propio ni cola (D-05). `emit(name, detail)` → `document.dispatchEvent(new CustomEvent(name, { detail, bubbles: true }))`; `on(name, cb) → handle`; `off(handle)`.
- **5 nombres tipados** (D-06), convención `namespace:verbo-en-pasado` (patrón Horizon): `variant:changed`, `product:added`, `cart:updated`, `cart:loading`, `cart:error`. Array `NAMES` exportado en `window.Kinelia.events.NAMES`; `emit` con nombre desconocido → `console.warn`.
- **`Kinelia.a11y.announce(msg)`** — lee `#a11y-live-region`, limpia `textContent`, fuerza reflow (`void live.offsetWidth`), re-setea (Pitfall 7). Vive en este mismo archivo (Open Question 4 recomienda no separar `a11y.js`).
- **Carga:** `<script src="{{ 'events.js' | asset_url }}" defer></script>` — `defer` explícito, NO `{{ ... | script_tag }}` solo (Pitfall 2 — `script_tag` no agrega `defer` → `ParserBlockingScript` es error).
- **`detail` shape (LOCKED por el plan, documentado en ETAPA-2-SEAMS.md):** ver 03-RESEARCH.md lines 300-306 (tabla de eventos). Regla de seguridad: el `detail` no lleva PII, solo IDs y montos en centavos (Security Domain V5).
- **Comportamiento en Fase 3:** nadie emite (D-07). Se prueba desde consola — guion en 03-RESEARCH.md lines 615-626, va al PLAN.md y al UAT.
- **Licencia:** NO portar `pubsub.js` de Dawn ni `events.js` de Horizon (no son MIT — Pitfall 6). Se escribe desde cero. `OVERRIDES.md` §"Componentes portados" registra "inspiración de patrón, sin copia de código".

---

### `sections/announcement-bar.liquid` (section, render)

**Analog:** `sections/footer.liquid` (leído verbatim abajo) — misma estructura markup + `{% comment %} KINELIA {% endcomment %}` + `{% stylesheet %}` scoped + `{% schema %}`.

**Estructura del starter a replicar** (`sections/footer.liquid` completo):
```liquid
<footer>
  <div class="footer__copyright"> ... </div>
  <div class="footer__links">
    {% for link in section.settings.menu.links %}{{ link.title | link_to: link.url }}{% endfor %}
  </div>
</footer>
{% comment %} KINELIA (plan 02-02): el bloque de estilos consume el token de marca --color-text. {% endcomment %}
{% stylesheet %}
  footer { display: flex; justify-content: space-between; margin-top: 2rem; }
  footer a { text-decoration: none; color: var(--color-text); }
{% endstylesheet %}
{% schema %}
{ "name": "t:general.footer", "settings": [ ... ] }
{% endschema %}
```

- **Section propia**, montada antes de `header` en `header-group.json` `"order": ["announcement-bar", "header"]`.
- **Estática, no dismissible** (D-13). Texto = 1 clave de locale (`t:` en schema, `{{ '...' | t }}` en markup — NUNCA string en el `.liquid`, regla `ALLOWLIST.md` §"Idioma del tema"). Link opcional = setting `type: "url"` (no `text` — Security V5).
- **CSS:** solo `var(--*)`. Sin `box-shadow`, `linear-gradient`, `text-transform: uppercase` (fuera de `.label-eyebrow`), `text-align: justify` — `check-tokens.mjs` lines 288-301 los rechaza. `var(--x)` de un token inexistente → `check-tokens.mjs` line 270 falla (agregar el token a `css-variables.liquid` si hace falta un z-index nombrado).
- **Copy:** respeta D-16 del Brand Book (`docs/BRAND-COPY.md`) — sin urgencia falsa, contadores, stock inventado, descuentos que no existen. Tipo "Envío a todo el país" / "Garantía de 90 días".

---

### `sections/header.liquid` (MODIFY — extender, no reescribir)

**Analog:** el archivo actual (verbatim):
```liquid
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
{% stylesheet %} header { height: 5rem; display: flex; align-items: center; justify-content: space-between; } ... {% endstylesheet %}
{% schema %}
{ "name": "t:general.header", "settings": [
  { "type": "link_list", "id": "menu", "label": "t:labels.menu" },
  { "type": "link_list", "id": "customer_account_menu", "label": "t:labels.customer_account_menu", "default": "customer-account-main-menu" } ]}
{% endschema %}
```

**Cambios (D-10/D-11/D-12):**
- Logo SVG en vez de `{{ shop.name | link_to }}` — `{{ 'kinelia_horizontal.svg' | inline_asset_content }}` dentro de `<a href="{{ routes.root_url }}">` (mismo patrón `inline_asset_content` que `icon-cart.svg` línea 24).
- `<shopify-account>` condicional a `shop.customer_accounts_enabled` — se **conserva** tal cual (líneas 13-17).
- Contador de carrito — se **conserva** `{% if cart.item_count > 0 %}<sup>` (línea 20-22); NO se recablea a `cart:updated` en Fase 3 (D-07).
- Menú: `{% if section.settings.menu.links.size > 0 %}` alrededor del contenedor entero, o `.header__menu:empty { display: none }` (Pitfall 9 — un flex vacío con `gap: 1rem` deja un hueco).
- Sticky mobile: `@media (max-width: ...) { position: sticky; top: ... }` en el wrapper `.shopify-section`, apilado con announcement-bar (03-RESEARCH Pattern 6). Reservar altura (CLS). z-index documentado: header < cart drawer (Fase 6) < FAB.
- Marca la edición con `{% comment %} KINELIA (plan 03-NN): ... {% endcomment %}` (regla `OVERRIDES.md`) y fila en `OVERRIDES.md` §"Archivos modificados".

---

### `sections/footer.liquid` (MODIFY — extender)

**Analog:** el archivo actual (verbatim arriba, en announcement-bar).

**Cambios (D-14/D-15/D-16/D-17):**
- Link WhatsApp: `<a href="https://wa.me/{{ section.settings.whatsapp_number | default: '' }}" ... rel="noopener" target="_blank">{{ 'kinelia.cta.pedir_whatsapp' | t }}</a>` — clave ya existe (`es.default.json` línea 130: `"pedir_whatsapp": "Pedir por WhatsApp"`).
- Newsletter: bloque envuelto en `{% if section.settings.show_newsletter %}` con `"default": false` en el schema (D-16) — cero markup hoy. Claves `newsletter.*` ya existen (línea 118).
- Iconos de pago: se **conserva** el bloque del starter (líneas 14-20) — `{% if section.settings.show_payment_icons %}{% for type in shop.enabled_payment_types %}` — colapsa a nada hasta Fase 12.
- Linklist legal: usa el `link_list` `menu` existente (schema líneas 42-49); el contenido del linklist + las páginas stub son **runbook en STAGING** (D-14, `docs/RELEASE.md`), no código.
- Mismo `{% stylesheet %}` scoped, solo `var(--*)`, marcador `KINELIA` + fila en `OVERRIDES.md`.

---

### `sections/header-group.json` (MODIFY)

**Analog:** el archivo actual + `sections/footer-group.json`. Estructura (con banner auto-generated, líneas 1-9):
```json
{
  "type": "header",
  "name": "t:general.header",
  "sections": { "header": { "type": "header", "settings": {} } },
  "order": [ "header" ]
}
```
**Cambio:** agregar `"announcement-bar": { "type": "announcement-bar", "settings": {} }` a `sections` y `"announcement-bar"` primero en `order`.
- **Pitfall 3:** el theme editor co-posee este archivo (banner "may be updated by the Shopify admin theme editor"). Tratar como `templates/*.json`: `git pull --rebase` antes de push, revisar el diff JSON en la PR. `check-allowlist.mjs` lines 96-99 ya escanea los `*-group.json` — `announcement-bar` debe entrar en `RENDER_ALLOWLIST` (line 29-46) en la misma PR o el checker falla.

---

### `layout/theme.liquid` (MODIFY — orden del `<head>`)

**Analog:** el archivo actual (líneas 1-53) + `layout/password.liquid`.

**Orden actual del `<head>`:** `css-variables` (l.5) → 2 preloads de fuente (l.26-27) → `critical.css` (l.30) → `base.css` (l.38) → `meta-tags` (l.41) → `content_for_header` (l.43).

**Cambios (D-03 + Pitfall 1 / WR-04):**
- Mover `<meta charset="utf-8">` + `viewport` + `X-UA-Compatible` a las 3 primeras líneas del `<head>`, ANTES de `{% render 'css-variables' %}` (el `<style>` inline de tokens + 5 `@font-face` empuja el charset fuera de los primeros ~1024 B). Quitarlos de `meta-tags.liquid` líneas 1-3 para no duplicar.
- Insertar `{% render 'analytics-hooks' %}` entre `{% render 'meta-tags' %}` y `{{ content_for_header }}`.
- `<link rel="icon" type="image/svg+xml" href="{{ 'kinelia_isotipo.svg' | asset_url }}">`.
- `<body>`: `<a class="skip-link" href="#MainContent">{{ 'general.accessibility.skip_to_content' | t }}</a>` (clave existe, `es.default.json` línea 4) + `<div id="a11y-live-region" aria-live="polite" role="status" class="visually-hidden"></div>` + `<main id="MainContent">{{ content_for_layout }}</main>` (hoy `content_for_layout` está suelto, línea 49) + FAB WhatsApp + `<script src="{{ 'events.js' | asset_url }}" defer></script>`.
- `.visually-hidden` y `.skip-link` NO existen — agregarlas a `assets/base.css` consumiendo tokens (Wave 0 gap).
- Fragmentos verbatim: 03-RESEARCH.md lines 261-288 (head) y 596-611 (body).
- Marcador `{% comment %} KINELIA (plan 03-NN) {% endcomment %}` (el archivo ya tiene el patrón, líneas 7-25) + fila `OVERRIDES.md`.

---

### `layout/password.liquid` (MODIFY)

**Analog:** `layout/theme.liquid` (mismo patrón de `<head>`, versión pre-Fase-2, 19 líneas). Sin header/footer/bus.
- **Mínimo (Pitfall 8):** charset/viewport arriba de todo + `<link rel="icon">`. NO agregar header/footer, bus de eventos ni `analytics-hooks` (no hay funnel en la pantalla de contraseña).

---

### `assets/kinelia_horizontal.svg` / `kinelia_isotipo.svg` / `icon-whatsapp.svg` (NEW)

**Analog:** `assets/icon-cart.svg`, `assets/icon-account.svg` — SVG consumidos vía `{{ '...' | inline_asset_content }}` desde `sections/header.liquid` (líneas 15, 24). Filas en `ALLOWLIST.md` §"Renderiza" (líneas 62-63):
```
| `assets/icon-cart.svg` | `inline_asset_content` desde `sections/header.liquid` | Ícono de carrito del header. |
```
- Copiar de `A- Logo/A.2 Logo/kinelia_horizontal.svg` y `A.1 Isotipo/kinelia_isotipo.svg` (gitignoreados, en disco — STATE.md "Assets recibidos"). Pasada `npx svgo` one-off (`kinelia_horizontal.svg` tiene `fill` duplicados de potrace) — NO agregar `svgo` a `package.json` (D-18, igual que el subsetting de fuentes de Fase 2).
- Cada SVG → fila en `ALLOWLIST.md` §"Renderiza" + `OVERRIDES.md` §"Archivos nuevos" (tabla líneas 162+, con bytes medidos como la tabla de fuentes).
- FAB: color `var(--color-primary)`, NUNCA `#25D366` (Pitfall 4 — `check-tokens.mjs` HEX regex line 106 lo rechaza y rompe el sistema visual). Sin sombra, sin pulso (D-15 + D-11).

---

### `scripts/check-allowlist.mjs` (MODIFY — aflojar la regla anti-JS)

**Analog:** el propio archivo, lines 133-154:
```js
// assets/ — la Fase 1 no agrega JavaScript. Las fases posteriores actualizan
// esta regla junto con RENDER_ALLOWLIST cuando suman un módulo legítimo.
for (const name of assetNames) {
  const ext = extname(name).toLowerCase();
  if (ext === ".js" || ext === ".mjs") {
    violations.push(`assets/${name}: JavaScript en assets/ no está permitido en esta fase`);
  }
  ...
}
```
**Cambio (D-09):** introducir un `JS_ASSET_ALLOWLIST = new Set(["events.js", "a11y.js"])` (export, junto a `RENDER_ALLOWLIST` line 29 y `FORBIDDEN_ASSET_SUBSTRINGS` line 49). La regla sigue empujando una violación para cualquier `.js`/`.mjs` NO listado; deja pasar los listados. Actualizar el comentario de contexto (lines 133-134) y la cabecera del archivo (lines 9-16). `FORBIDDEN_ASSET_SUBSTRINGS` (jquery/swiper/react/vue/alpine) se mantiene y aún aplica a los allowlisteados.
- Mismo estilo: Node stdlib, `process.exitCode` sin `process.exit()`, `export`s para testeo.
- Test del checker (Wave 0): `events.js` presente → exit 0; un `.js` fantasma → exit 1.

---

### `scripts/check-seams.mjs` (NEW, recomendado)

**Analog:** `scripts/check-tokens.mjs` (patrón "checker = copia ejecutable de un contrato", cabecera lines 1-51, `walk()` lines 156-164, `stripComments()` lines 149-154, salida `process.exitCode` lines 436-450) y `scripts/check-allowlist.mjs` (estructura `main()` + `violations[]`).

**Contrato a hacer ejecutable (SHELL-04):** falla si —
- un nombre del array `NAMES` de `assets/events.js` no aparece en `ETAPA-2-SEAMS.md`;
- un tipo de evento de `/collect` (los 8: `view_lp`, `scroll_50`, `scroll_75`, `ver_oferta`, `add_to_cart`, `inicio_checkout`, `paso_checkout`, `compra` — sibling `collect/index.ts:24-33`) falta en el doc;
- un cart attribute del contrato (`visitante_id`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `view`) falta en el doc;
- backstop de scan vacío (igual que `check-tokens.mjs` line 248).
- Agregar a la cadena `lint` de `package.json` (line 11) y al step "Theme Check (gate)" de `.github/workflows/ci.yml` (lines 55-60, tras `check-tokens.mjs`).

---

### `config/settings_schema.json` (MODIFY)

**Analog:** el propio archivo — bloque `select` de tipografía (líneas 11-30) y las notas de `OVERRIDES.md` líneas 29 (grupos de color).
- Agregar setting `whatsapp_number` — `type: "text"`, `id: "whatsapp_number"`, `label: "t:settings.whatsapp.number"`, `info` con formato (`54911...`, sin `+` ni espacios), sin `default` o con placeholder. Va en un grupo apropiado (nuevo header o el general).
- **Seguridad (V5):** el número solo se interpola en el `href` (`wa.me/{{ ... }}` — Liquid auto-escapa), NUNCA en `{% style %}` (`check-tokens.mjs` CONSTRAINED_TYPES line 115-123 rechazaría un `text` en `<style>`).
- `theme_info` sigue siendo el elemento 0 (nota `OVERRIDES.md` línea 29).

---

### `locales/es.default.json` + `es.default.schema.json` (MODIFY)

**Analog:** los propios archivos. Namespaces existentes relevantes: `accessibility` (l.3, `skip_to_content`), `general.social.whatsapp` (l.14), `newsletter` (l.118), `kinelia.cta.pedir_whatsapp` (l.130).
- Claves nuevas: mensaje + link de announcement-bar, labels de aria-live/announce si faltan, label del FAB. Todas bajo un namespace coherente; la copy de UI SIEMPRE en locale, nunca en el `.liquid` (`ALLOWLIST.md` §"Idioma del tema").
- `check-tokens.mjs` regla 8 (lines 360-432): exactamente un `*.default.json` = `es.default.json`; strict JSON; sin BOM; LF (`.gitattributes`). Claves nuevas de copy NO llevan sufijo `_html` (line 426).
- Toda clave `t:` nueva del schema → su label de editor en `es.default.schema.json` en la misma PR (patrón `OVERRIDES.md` línea 32).

---

### `ETAPA-2-SEAMS.md` (NEW, root)

**Analog:** `ALLOWLIST.md` / `OVERRIDES.md` (contrato en prosa, tablas markdown, "explicación humana de un checker"). Fuentes que transcribe **verbatim** (D-04, híbrido: spec propia + cita al origen):

- **`../../Kinelia/web/kinelia-atribucion.js`** (TRACKED — `git ls-files` confirma):
  - cookie `kinelia_attr`, 30 días, `SameSite=Lax; Secure` (líneas 29, 50-55).
  - `visitante_id` = `crypto.randomUUID()` estable (líneas 57-60, 66).
  - first-touch de 5 UTMs: `["utm_source","utm_medium","utm_campaign","utm_term","utm_content"]` (línea 31, lógica líneas 70-76).
  - cart attributes escritos vía `POST /cart/update.js` body `{ attributes: {...} }` (líneas 88-107) — **6 claves hoy** (`visitante_id` + 5 `utm_*`, líneas 88-95).
  - **El contrato del tema agrega `view`** (7º, slug de `?view=`, Fase 10) — Pitfall 5: el doc marca `view` como "a resolver en Etapa 2 / Fase 10" y dice explícitamente si lo escribe un snippet del tema o una versión actualizada del script hermano; read-modify-write que no pisa los otros 6 (BUY-06).
  - eventos emitidos directo por el script (no por el bus): `view_lp` (l.149), `scroll_50`/`scroll_75` (l.152-167), `ver_oferta` vía IntersectionObserver threshold 0.5 sobre `[data-kinelia="oferta"]` (l.170-181), `add_to_cart` interceptando `/cart/add` (l.187), `inicio_checkout` (l.195-198).
  - hook `data-kinelia="oferta"` — lo pone la Fase 5 en el bloque de precio del buy box; el doc solo documenta que debe existir.
  - dónde va el `<script>`: `<head>`, todas las páginas (comentario líneas 15, y `analytics-hooks.liquid`).
- **`../../Kinelia/supabase/functions/collect/index.ts`** (TRACKED):
  - `TIPOS` Set — **8 eventos exactos** (líneas 24-33); cualquier otro `tipo` se descarta en silencio (línea 79).
  - body: `{ visitante_id: String (≤64), eventos: [{ tipo, payload, sesion_ext? }] (≤50) }` (líneas 59, 66-67).
  - el servidor pone `ocurrido_en` — no confiar en el reloj del cliente (líneas 82-83).
  - validación de origen contra `COLLECT_ORIGENES` (líneas 19-22, 55-57).
  - endpoint: `https://<proyecto>.supabase.co/functions/v1/collect` — **placeholder `<proyecto>`**, nunca la URL real (Security V9, `check-secrets.mjs`).
- **5 eventos del bus DOM del tema** + su `detail` shape (03-RESEARCH lines 300-306) + el mapa "evento DOM interno → evento `/collect`" (tentativo: `product:added` → `add_to_cart`; el resto lo emite `kinelia-atribucion.js` directo). El mapeo real lo cablea Etapa 2 en `analytics-hooks.liquid`.
- **`detail` sin PII** (Security V5); `cart:error.message` sin filtrar internos de la API de Shopify (V7); lista de `connect-src` para cuando Etapa 2 active el CSP implícito (V14).

---

### `ALLOWLIST.md` (MODIFY)

**Analog:** el propio archivo:
- `## Renderiza` tabla (líneas 27-63) — filas nuevas: `snippets/analytics-hooks.liquid`, `assets/events.js`, `assets/a11y.js` (si se separa), `sections/announcement-bar.liquid`, `sections/announcement-bar` en `RENDER_ALLOWLIST`, los 3 SVG. Cada fila con su justificación contra CVR + presupuesto de performance (patrón de las filas existentes 57-61).
- `## Nunca agregar` (líneas 88-98) — la fila "JavaScript en `assets/` durante la Fase 1" (línea 98) se actualiza para reflejar el allowlist explícito de JS.
- `## Regla de adición` (líneas 100-110) — ya prevé exactamente esto ("Cuando una fase posterior suma un módulo JavaScript legítimo... actualiza la regla anti-JS... en esa misma PR").
- `## Desviación registrada` (líneas 129-171) — la línea 156-157 ya asigna "Bus de eventos DOM + helpers de accesibilidad → Fase 3"; se marca como cumplido.

---

### `OVERRIDES.md` (MODIFY)

**Analog:** el propio archivo:
- `## Archivos modificados` tabla (líneas 22-40) — filas: `layout/theme.liquid` (head reorder + seam + icon + a11y + FAB + events.js), `layout/password.liquid`, `snippets/meta-tags.liquid` (quita charset trio), `sections/header.liquid`, `sections/footer.liquid`, `sections/header-group.json`, `scripts/check-allowlist.mjs`, `config/settings_schema.json`, `locales/*`, `package.json`, `.github/workflows/ci.yml`, `ALLOWLIST.md`.
- `## Archivos nuevos` tabla (líneas 162-182) — `snippets/analytics-hooks.liquid`, `assets/events.js`, `assets/a11y.js`, `sections/announcement-bar.liquid`, `scripts/check-seams.mjs`, los 3 SVG (con bytes medidos, patrón de la tabla de fuentes líneas 99-102), `ETAPA-2-SEAMS.md`.
- `## Componentes portados` (líneas 184-193) — registrar el bus de eventos como "inspiración de patrón de Horizon `assets/events.js`, sin copia de código" + nota de licencia (Pitfall 6). Tabla hoy vacía.
- Nueva subsección "Divergencias de la Fase 3" (patrón de las de Fase 2, líneas 42-113) para el reorder del `<head>` y el primer JS.

---

## Shared Patterns

### Checker ejecutable = copia de un contrato
**Source:** `scripts/check-tokens.mjs` (cabecera lines 1-51, `main()` + `violations[]` lines 225-450), `scripts/check-allowlist.mjs` (lines 92-171).
**Apply to:** `check-allowlist.mjs` (modificación), `check-seams.mjs` (nuevo).
- Node stdlib only. `import { readFileSync, readdirSync, existsSync } from "node:fs"`.
- `process.exitCode = 1` + `return`, nunca `process.exit()` (CLAUDE.md Error Handling).
- Backstop de scan vacío: un scan sin archivos no puede reportar éxito (`check-tokens.mjs` line 248, `check-allowlist.mjs` line 101-108).
- `export` de las estructuras de contrato para testeo.
- `console.error(\`x ${line}\`)` por violación + `console.log(\`check-X: OK — ...\`)` en éxito.
- Se agrega a `package.json` `lint` chain (line 11) Y al step "Theme Check (gate)" de `.github/workflows/ci.yml` (lines 55-60) en la misma PR.

### CSS scoped, solo tokens
**Source:** `sections/header.liquid` lines 30-59, `sections/footer.liquid` lines 24-39.
**Apply to:** `announcement-bar.liquid`, `header.liquid`, `footer.liquid`, FAB en `theme.liquid`, utilities nuevas de `base.css`.
- Todo CSS en un bloque `{% stylesheet %}` scoped dentro de la section (o `assets/base.css` para utilities globales del shell).
- SOLO `var(--*)` — cero hex, cero nombres de fuente literales, cero `box-shadow` / `*-gradient` / `text-transform: uppercase` (salvo `.label-eyebrow`) / `text-align: justify`. `scripts/check-tokens.mjs` lines 106-107, 277-301 lo hace cumplir.
- `var(--x)` de un token que nada define → `check-tokens.mjs` line 268-272 falla: agregar el token a `snippets/css-variables.liquid` (único lugar, con D-17).

### Todo texto de UI sale del locale
**Source:** `ALLOWLIST.md` §"Idioma del tema" (líneas 112-127), `docs/BRAND-COPY.md`, `check-tokens.mjs` `REQUIRED_STOREFRONT_KEYS` lines 81-90.
**Apply to:** announcement-bar, footer (WhatsApp, newsletter), FAB, skip-link, aria-live.
- `{{ 'namespace.clave' | t }}` en el markup; string real solo en `locales/es.default.json`. Nunca un string español en un `.liquid`.
- Clave `t:` en el schema → label de editor en `es.default.schema.json`, misma PR.
- Voseo rioplatense. Claims prohibidos D-16 (sin `_html` en claves nuevas de prosa).

### Edición del starter: marcador + registro
**Source:** `OVERRIDES.md` §"Reglas" (líneas 195-205); comentarios `{% comment %} KINELIA (plan NN-NN): ... {% endcomment %}` en `theme.liquid` lines 7-25, `header.liquid` line 29, `footer.liquid` line 23.
**Apply to:** toda modificación de archivo del starter en esta fase.
- Liquid: comentario `KINELIA (plan 03-NN):` en la fuente. Config/JSON/YAML: `# KINELIA:` o fila en `OVERRIDES.md`.
- `ALLOWLIST.md` (qué renderiza) + `OVERRIDES.md` (qué se tocó del starter) en la MISMA PR.
- El comportamiento nuevo va en archivos nuevos siempre que se pueda (bus en `events.js`, no en `theme.liquid`).

### Section group co-poseído por el theme editor
**Source:** `sections/header-group.json` banner líneas 1-9, `sections/footer-group.json` (idéntico), `docs/RELEASE.md` §"Propiedad del contenido", Pitfall 3.
**Apply to:** `header-group.json`, y el runbook de páginas stub + linklist + valor de `whatsapp_number`.
- `git pull --rebase` antes de push; revisar el diff JSON en la PR (no aceptarlo por reflejo).
- Contenido de páginas y valores de settings = runbook en STAGING, no commit de código.

### `<script>` / asset remoto comentado, endpoint placeholder
**Source:** sibling `web/kinelia-atribucion.js:28` (`https://<proyecto>.supabase.co/...`), Security Domain V9/V14, `check-secrets.mjs` (`SHOPIFY_TOKEN_RE`, needles del env).
**Apply to:** `analytics-hooks.liquid`, `ETAPA-2-SEAMS.md`.
- El `<script src>` de atribución va COMENTADO (D-01) — cero request a terceros en Etapa 1 (evita `RemoteAsset` de Theme Check).
- Placeholder `<proyecto>` en el doc y en el comentario — nunca una URL real de Supabase ni un origen real. `check-secrets.mjs` + code review lo verifican.

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `assets/events.js` | JS module / event bus | event-driven | Primer `.js` del tema. Skeleton envía cero JS; no hay `pubsub.js` / `global.js`. El más cercano es el patrón de cabecera-contrato de `scripts/check-tokens.mjs` (estilo de doc) y el esqueleto de 03-RESEARCH.md lines 310-351. Dawn/Horizon NO son MIT — no se porta código (Pitfall 6). El planner usa el esqueleto de RESEARCH como referencia. |
| `assets/a11y.js` | JS module | request-response | Idem. Open Question 4 recomienda no crearlo (fusionar `announce()` en `events.js`). |
| `ETAPA-2-SEAMS.md` (parcial) | contract doc | doc | La *forma* (contrato en prosa + tablas) copia `ALLOWLIST.md` / `OVERRIDES.md`; el *contenido* se transcribe verbatim de dos archivos del repo hermano (`../../Kinelia/`), que son tracked pero fuera de este repo — no un analog de patrón sino una fuente de datos. |

## Metadata

**Analog search scope:** `layout/`, `sections/`, `snippets/`, `assets/`, `scripts/`, `config/`, `locales/`, `.github/workflows/`, raíz (`ALLOWLIST.md`, `OVERRIDES.md`, `package.json`); repo hermano `../../Kinelia/` (`web/`, `supabase/functions/collect/`).
**Files scanned:** ~20 en este repo + 2 en el hermano, todos leídos verbatim esta sesión.
**Tracked-source gate:** todos los analogs son git-tracked (`git ls-files` confirmado para los siblings `web/kinelia-atribucion.js` y `supabase/functions/collect/index.ts`, y para los archivos de este repo). Ningún mirror gitignoreado.
**Pattern extraction date:** 2026-09-09
