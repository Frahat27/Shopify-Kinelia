# Phase 2: Sistema de diseño por tokens - Research

**Researched:** 2026-09-08
**Domain:** Shopify theme design tokens — `settings_schema.json` + `css-variables.liquid` custom properties, self-hosted WOFF2, `base.css` primitives, es-AR locale scaffold, executable token-drift checker
**Confidence:** HIGH for Skeleton mechanics and repo state (files read this session); HIGH for locale default rules and self-hosted-font mechanics (shopify.dev, verified); MEDIUM for WOFF2 byte sizes and Shopify-Font-Library coverage of DM Sans/Inter (assumed).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Color tokens (Brand Book p.6, verbatim):**

| Token intent | Hex | Brand name | Role |
|---|---|---|---|
| `--color-primary` | `#0F6E56` | Verde azulado | Primario. Logo, titulares, bloques de cierre, **botones**. |
| `--color-primary-soft` | `#9FE1CB` | Verde suave | Fondos de bloque, badges, destacados. |
| `--color-accent` | `#D85A30` | Terracota | **Detalle. SOLO la bajada del logo y el precio.** Nunca fondos, botones, titulares, íconos ni líneas. |
| `--color-bg` | `#F1EFE8` | Crema | Fondo general. **Nunca blanco puro.** |
| `--color-text` | `#2C2C2A` | Casi negro | Texto principal. |
| `--color-text-muted` | `#5F5E5A` | Gris cálido | Texto secundario, epígrafes, notas. |

Support palette (educational content only — `base.css` must NOT use by default):

| Token intent | Hex | Brand name |
|---|---|---|
| `--color-edu` | `#24566E` | Azul profundo |
| `--color-edu-soft` | `#CBDDE6` | Azul claro |
| `--color-community` | `#54487A` | Violeta profundo |
| `--color-community-soft` | `#DDD7E8` | Violeta claro |

- **D-01 (LOCKED)** — Terracota rule: `--color-accent` is restricted-use. `base.css` NEVER uses it for buttons, backgrounds, headings, icons or borders. Only intended store use: the price. Document as a comment in `css-variables.liquid` and `base.css`.
- **D-02 (LOCKED)** — Text contrast: body is always `--color-text` or `--color-text-muted` on `--color-bg`. Forbidden in `base.css`: verde suave as text on crema, gris on verde.
- **D-03 (LOCKED)** — No pure white. No `#FFFFFF` token. Elevated surfaces (if needed) = crema or a very slight tint; value decided in the plan.
- **D-04 (LOCKED)** — One support color per piece, never both. Hierarchy: support enters after green and before terracota.
- **D-05 (LOCKED)** — Families: `--font-heading` = **DM Sans**, weights 400 and 500 (never Bold 700 in long headings). `--font-body` = **Inter**, weights 400, 500, 600 (600 only for labels and prices in context).
- **D-06** — Type scale (digital): Titular DM Sans Medium 500 **40px**; Subtítulo DM Sans Regular 400 **26px**; Cuerpo Inter Regular 400 **16px minimum**; Caption/legales Inter Regular 400 **13px minimum**.
- **D-07 (LOCKED)** — Legibility: line-height **1.5 floor** on all body/paragraph text. Never `text-align: justify`; never `text-transform: uppercase` except in a short-label utility.
- **D-10 (LOCKED, Brand Book p.17)** — Flat system. Icons and blocks: **2px** rounding on tips/corners; **badges = straight rectangles, no rounding**. Token `--radius: 2px`; `--radius-none: 0` explicit for badges. No large `border-radius` on buttons/cards.
- **D-11 (LOCKED, Brand Book p.17)** — Elevation: **no shadows, no gradients**. No `box-shadow` token; if the reset introduces one, null it. Separation by color/space, not shadow.
- **D-12 (LOCKED)** — Primary button = `--color-primary` bg, crema text. On a green block, button is crema with green text. **Never terracota on a button.** No shadow, no gradient. Label DM Sans Medium or Inter Medium (decide in plan). CTA text lives in locale.
- **D-14** — `locales/es.default.json` is the theme default (not `en.default.json`). Rioplatense voseo in ALL UI text. Scaffold `locales/es.default.json` + `locales/es.default.schema.json`.
- **D-15** — Approved copy → locale. CTAs: `"Quiero las mías"`, `"Ver talles y precio"`, `"Elegir mi talle"`, `"Comprar"`, `"Comprar ahora"`, `"Pedir por WhatsApp"`. Root promise: `"Llegá a la noche con las piernas descansadas."` Placeholder prices: `$24.900`, `$42.000`. Mandatory legal legend (reusable locale string): `"Producto de uso cotidiano para el confort de las piernas. No reemplaza el tratamiento ni el diagnóstico médico. Ante várices, trombosis, diabetes o embarazo, consultá a tu médico antes de usarlo."`
- **D-16 (LOCKED for all future copy)** — Prohibited claims: never "cura / trata / previene / elimina" pathologies; never "recomendado por médicos" without backing; never "resultados garantizados"; never false urgency. Record in a repo brand doc so copy phases inherit it.
- **D-17 (LOCKED shape)** — `config/settings_schema.json` gains a `Colores` group and a `Tipografía` group of theme-editor-tunable settings. `snippets/css-variables.liquid` reads them and emits `:root { --color-*: {{ settings.x }}; ... }`. `base.css` and all component CSS reference `var(--*)` only, never a literal hex. A checker fails if a 3/6-digit hex appears outside `css-variables.liquid` / `settings_schema.json`.

### Claude's Discretion

- Exact token names (the CONTEXT names are intent, not contract).
- Elevated-surface value (D-03), exact spacing scale (D-09), button radius 2px vs 0 (D-12), form-primitive shape (D-13), `base.css` internal structure (one file vs `@layer`), hex-checker mechanism (D-17).
- Whether a minimal `en.json` is kept (D-14).
- **D-08 (PLANNER DECISION, recommended)** — self-host DM Sans + Inter in `assets/` (WOFF2, subset latin + latin-ext), `font-display: swap`, `<link rel=preload>` for the heading weight. Alternative: Google Fonts `<link>`. Plan chooses and records in OVERRIDES.md / PERF-BUDGET.md.
- **D-09 (PLANNER DECISION)** — base-4 spacing scale proposed: `--space-1..8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px. Confirm in plan review.
- **D-13 (PLANNER DECISION)** — flat inputs/selects/labels: 1px border `--color-text-muted` (or derived border token), crema bg, visible focus (solid outline, not shadow), radius per D-10, text size ≥ 16px. No form library.
- **D-18** — `font_picker` vs fixed self-hosted families: if self-hosting (D-08), font settings are a `select` of the 2 brand families, not `font_picker`. Decide in plan.

### Deferred Ideas (OUT OF SCOPE)

- header/footer markup → Phase 3
- buy box → Phase 5
- logo asset files → Phase 3
- applying the identity to real sections → Phase 7+
- This phase is token *plumbing* + `base.css` primitives + locale scaffold **only**.
- (D-09 optional evolution note, D-18 alternatives — noted, not built.)
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DESIGN-01 | Brand tokens (color, typography, spacing) in `settings_schema.json`, exposed as CSS custom properties | §"Skeleton token mechanism" + §"settings_schema.json control types" + §"Code Examples". Colors + typography as theme settings; spacing/radius as static custom properties in `css-variables.liquid` (single file = single source; see Open Question 6 for the ROADMAP wording nuance). |
| DESIGN-02 | A rebrand is one change (tokens), no component-CSS edits | §"DESIGN-02 enforcement" — `scripts/check-tokens.mjs` fails on any hex or brand font-family name in `.css` / section `{% stylesheet %}` outside the two allowed files. Wired into `npm run lint` like the Phase-1 checkers. |
| DESIGN-03 | `base.css` with reset, type scale, colors, spacing, buttons, form primitives, all token-derived | §"base.css structure & critical.css relationship" + §"Code Examples". Static `assets/base.css`, `stylesheet_tag`, Liquid-free, `var(--*)` only. Layers on top of the existing `critical.css` reset — does not duplicate it. |
| DESIGN-04 | es-AR (voseo) locale scaffolded; all UI text from locale files | §"es-AR locale scaffolding" — `git mv` `en.default.*` → `es.default.*` + translate; strict JSON, no BOM; minimal namespace set + brand CTAs + legal legend. Recommend es-only (drop `en`) to avoid the `MatchingTranslations` sync tax. |
</phase_requirements>

## Summary

Phase 2 is small in surface area (roughly six files) but high in downstream leverage: every later phase's component CSS and every string of UI copy depends on the token plumbing and locale scaffold landing correctly here. The good news is that Skeleton already ships the exact mechanism the phase needs — `snippets/css-variables.liquid` renders a `{% style %}` block with a `:root { --custom-property: {{ settings.x }} }` shape in the `<head>` (via `layout/theme.liquid`, which renders it *first*, before `critical.css`). The work is to **extend** that snippet and `config/settings_schema.json` with the Kinelia color and typography groups, add a token-derived `assets/base.css`, swap Skeleton's `font_picker` for self-hosted WOFF2, and rename the English locale to a Spanish default.

Three things bite if not planned for. **(1) The font swap has blast radius.** `css-variables.liquid` (lines 3–6, 9–11) and `layout/theme.liquid` (lines 13–18) both call `settings.type_primary_font` filters (`font_face`, `font_url`, `.system?`) that only work with a Shopify-Font-Library `font_picker` object. Moving to a `select` + self-hosted `@font-face` breaks both call sites; Phase 2 must fix `theme.liquid`'s head font block in the same PR (a documented pre-empt of Phase 3's shell work) or ship a broken `font_url | preload_tag` on every page. **(2) The theme editor vs. code round-trip.** Schema `default:` values apply silently until a merchant clicks Save in the editor; after that the GitHub integration writes the full settings into `config/settings_data.json` on the connected branch and *those* win over future schema-default changes. The mitigation is to keep authoritative token values as schema `default:` **and** as Liquid `| default:` fallbacks in the snippet, and to document that a token change is an editor action (which commits back) or a `settings_data.json` edit. **(3) `RemoteAsset` is a *warning*, not an error** (verified on shopify.dev) — `shopify theme check --fail-level error` (what `npm run lint` runs) would not fail on a Google Fonts `<link>`. Self-hosting is still the right call for LCP and privacy, but the "keeps `RemoteAsset` green" framing in D-08 needs this correction: the Shopify Font Library path is *also* green; the real argument is the removed third-party RTT and subsetting control.

**Primary recommendation:** Extend (don't rewrite) `css-variables.liquid` + `settings_schema.json` with a `Colores` group (6 primary + 4 support `color` settings) and a `Tipografía` group (2 single-option `select`s). Self-host DM Sans 400/500 + Inter 400/500/600 as subset WOFF2 in `assets/`, `@font-face` inline in `css-variables.liquid`, preload the heading weight in `theme.liquid`. Emit `--space-1..8`, `--radius`, `--radius-none` as static custom properties in the same snippet. Add `assets/base.css` (static, `var(--*)` only). Add `scripts/check-tokens.mjs` (hex + font-name drift + schema-reference integrity) to `npm run lint`. `git mv` the English locale to `es.default.json` / `es.default.schema.json`, translate, scaffold the namespace set + brand CTAs + legal legend. Record every divergence in `OVERRIDES.md` in the same PR.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Brand token *values* | `config/settings_schema.json` (`default:`) | Theme editor → `config/settings_data.json` (per-store, via GitHub sync) | Schema is the code-side source of truth; the editor is the merchant-side override that commits back. |
| Token → CSS custom property emission | `snippets/css-variables.liquid` (`{% style %}` inline in `<head>`) | — | Single Liquid file that reads settings and emits `:root`. Renders before `critical.css` and `base.css`. |
| Font delivery | `assets/*.woff2` + `@font-face` in `css-variables.liquid` + `<link rel=preload>` in `layout/theme.liquid` | Shopify CDN (`asset_url` → `cdn.shopify.com`) | Self-hosted, same-origin CDN, no third-party font host. |
| Design primitives (reset+, type scale, buttons, forms) | `assets/base.css` (static, token-consuming) | `assets/critical.css` (above-the-fold reset + body + section grid) | `critical.css` stays minimal and preloaded; `base.css` layers the full system on top without re-declaring the reset. |
| Rebrand-safety enforcement | `scripts/check-tokens.mjs` (Node stdlib, in `npm run lint`) | `shopify theme check` (Liquid/JSON validity) + Code review | Executable copy of DESIGN-02, mirroring the Phase-1 `check-allowlist.mjs` / `check-secrets.mjs` pattern. |
| UI copy | `locales/es.default.json` (storefront) + `locales/es.default.schema.json` (editor labels) | Shopify Language Editor (merchant-side storefront translation) | Theme default locale = es-AR; schema locale drives the editor UI. |

## Standard Stack

This phase installs **no npm packages** (the theme has no build step — `package.json` is dev-tooling-only, `engines.node >=22.12`). The "stack" is Shopify theme primitives + font files + a Node-stdlib script.

### Core

| Thing | Version / form | Purpose | Why standard |
|-------|----------------|---------|--------------|
| `color` setting type | Shopify OS 2.0 | 10 brand color tokens in `settings_schema.json` | Value-constrained to a color — safe to emit into `{% style %}`; native color picker in editor. `[CITED: shopify.dev/docs/storefronts/themes/architecture/settings/input-settings]` |
| `select` setting type | Shopify OS 2.0 | `font_heading` / `font_body` family selection (fixed options) | D-18: self-hosting rules out `font_picker` (which requires a Shopify Font Library object). `select` options are fixed → safe in `{% style %}`. `[ASSUMED]` for the D-18 reasoning; `select` behavior `[CITED: shopify.dev input-settings]` |
| `{% style %}` tag | Liquid | Inline `<head>` block for `:root` tokens + `@font-face` | Already how Skeleton's `css-variables.liquid` works (line 1). Inlined, no extra request; Liquid `asset_url` is processed inside it. `[VERIFIED: snippets/css-variables.liquid:1-18 read this session]` |
| CSS custom properties | CSS baseline | The token layer itself | Skeleton already emits `--font-primary--family`, `--page-width`, `--color-background`, etc. `[VERIFIED: snippets/css-variables.liquid:8-17]` |
| `asset_url` filter | Liquid | `@font-face src` + `preload` href for self-hosted WOFF2 | Shopify's documented method for theme-hosted fonts: "Use the `asset_url` filter to output the URL for the font file" within a `@font-face` rule. `[CITED: shopify.dev/docs/storefronts/themes/architecture/settings/fonts]` |
| `stylesheet_tag` filter | Liquid | Load `assets/base.css` | Exactly how `critical.css` is loaded today (`layout/theme.liquid:21`). `[VERIFIED: layout/theme.liquid:21]` |
| Self-hosted static WOFF2 | DM Sans 400, 500 · Inter 400, 500, 600 (D-05) | 5 font files in `assets/` | latin + latin-ext subset (ñ, á, é, í, ó, ú, ü). Static instances (not variable) — smaller total for 2–3 weights. |
| `scripts/check-tokens.mjs` | Node ≥22.12 stdlib, no deps | DESIGN-02 executable enforcement | Mirrors `scripts/check-allowlist.mjs` (`node:fs`, `node:path` only, empty-scan-fails guard). `[VERIFIED: scripts/check-allowlist.mjs read this session]` |

### Supporting

| Thing | Form | Purpose | When to use |
|-------|------|---------|-------------|
| `google-webfonts-helper` (gwfh.mranftl.com) | Web tool, no install | Generate subset WOFF2 + `@font-face` snippet + `unicode-range` for DM Sans / Inter | During Wave 0 to produce the 5 files. Alternative to Fontsource. |
| Fontsource (`fontsource.org` / GitHub `fontsource/font-files`) | Pre-subset WOFF2 files, OFL | Alternative source of the same 5 files with per-subset `unicode-range` | If gwfh is unavailable; download files directly, do **not** `npm i`. |
| `.gitattributes` entry | Repo config | Force `locales/*.json text eol=lf` (no BOM) and `assets/*.woff2 binary` | Wave 0 — prevents Windows BOM / CRLF corruption of locale JSON. Current `.gitattributes` only has `*.json linguist-language=jsonc`. `[VERIFIED: .gitattributes read this session]` |

### Alternatives Considered

| Instead of | Could use | Tradeoff |
|------------|-----------|----------|
| Self-hosted WOFF2 + `select` (D-08/D-18) | `font_picker` + DM Sans/Inter from Shopify Font Library | Simpler (auto `font_face`, no repo weight, `font.shopifycdn.com` is *not* a `RemoteAsset` third party). But: extra connection to `fonts.shopifycdn.com`, no subsetting control, and requires that both families are actually in the library (A1, unverified). Also keeps Skeleton's existing call sites working. **Legit lower-effort fallback.** |
| Google Fonts `<link>` to `fonts.googleapis.com` / `fonts.gstatic.com` | — | Third-party domain → `RemoteAsset` **warning** (not error) + privacy/GDPR concern + 2 extra connections on the critical path. Worst for LCP. Avoid. |
| Rename Skeleton token names (`--color-background`→`--color-bg`, `--color-foreground`→`--color-text`) | Keep Skeleton names, add brand aliases (`--color-bg: var(--color-background)`) | Rename touches ~4 files (`css-variables.liquid`, `critical.css`, `sections/header.liquid`, `sections/footer.liquid`) but yields one name per concept. Aliasing avoids the churn but leaves two names for "background". Recommend the rename — Phase 2 is the token phase and the blast radius is inside it. (Open Question.) |
| Spacing as theme settings | Spacing/radius as static custom properties in `css-variables.liquid` | ROADMAP SC #1 literally says "espaciado … en `settings_schema.json`". 8 range inputs is poor editor UX and merchants never retune a spacing scale. Static props in the one token file still satisfy DESIGN-02 ("one place"). Flag for discuss (Open Question 6). |
| Static WOFF2 instances | Variable font (one `.woff2` per family) | Variable file is larger; for only 2–3 static weights per family, static instances are smaller total and simpler. Use static. |
| Keep a minimal `en.json` | es-only (delete `en` locales) | Keeping `en` triggers Theme Check `MatchingTranslations` — every key must stay in sync across both files forever. Single AR market → es-only is less maintenance. Missing keys fall back to the `.default` file, which is es. Recommend es-only. (Open Question 3.) |

**Installation:** none. Font files are downloaded (not installed) during Wave 0 and committed to `assets/`.

**Version verification:** N/A — no packages. Font families and weights are fixed by D-05. WOFF2 file provenance: Google Fonts upstream (DM Sans — SIL OFL 1.1; Inter by rsms — SIL OFL 1.1). Both fonts are OFL-licensed and may be self-hosted and committed. `[ASSUMED]` — confirm the OFL license text ships alongside the files in `assets/` or is referenced in `OVERRIDES.md`.

## Package Legitimacy Audit

**Not applicable — this phase installs no external packages.** The theme has no build step and `package.json` carries only `@lhci/cli` (dev-only, from Phase 1). Font files are downloaded from Google Fonts upstream / Fontsource file mirrors and committed directly to `assets/` as binary WOFF2; they are not npm dependencies and execute no code.

Provenance to record in `OVERRIDES.md` (`## Archivos nuevos`) and `ALLOWLIST.md`:

| Asset | Upstream | License | Notes |
|-------|----------|---------|-------|
| `assets/dm-sans-*.woff2` (400, 500) | github.com/googlefonts/dm-fonts (or Fontsource) | SIL OFL 1.1 | latin + latin-ext subset |
| `assets/inter-*.woff2` (400, 500, 600) | github.com/rsms/inter (or Fontsource) | SIL OFL 1.1 | latin + latin-ext subset |

`check-secrets.mjs` already skips `.woff2?` files (`SKIP_RE`, line 53) so committing fonts will not trip the secret scanner. `[VERIFIED: scripts/check-secrets.mjs:53]`

## Architecture Patterns

### System Architecture Diagram (token render path)

```
config/settings_schema.json                     locales/es.default.schema.json
  ├─ theme_info (element 0, unchanged)             └─ t: keys for every new setting label/info
  ├─ group "Tipografía": select font_heading, font_body
  └─ group "Colores": color color_primary … color_community_soft
        │  (merchant edits in Theme editor → writes config/settings_data.json
        │   on the connected branch via GitHub integration)
        ▼
layout/theme.liquid  <head>
  1. {% render 'css-variables' %}  ──────────────►  snippets/css-variables.liquid
        │                                             {% style %}
        │                                               @font-face  DM Sans 400/500, Inter 400/500/600
        │                                                 src: url({{ '…woff2' | asset_url }})
        │                                               :root {
        │                                                 --font-heading / --font-body   (from settings.font_*)
        │                                                 --color-primary … --color-community-soft
        │                                                     {{ settings.color_x | default: '#…' }}
        │                                                 --space-1..8, --radius, --radius-none   (static)
        │                                               }
        │                                             {% endstyle %}   → inline <style> in <head>
        │
  2. <link rel=preload as=font …dm-sans-500.woff2 crossorigin>   (KINELIA: replaces Skeleton font_url block)
  3. {{ 'critical.css' | asset_url | stylesheet_tag: preload: true }}   reset + body + .shopify-section grid
  4. {{ 'base.css'     | asset_url | stylesheet_tag }}   type scale · links · buttons · form primitives · label utility
        │                                             (var(--*) only — no literal hex, no font-family name)
        ▼
  Rendered page: cascade order guarantees tokens exist before critical.css and base.css consume them.

Enforcement (npm run lint, every commit):
  shopify theme check --fail-level error   → Liquid/JSON/schema validity
  node scripts/check-allowlist.mjs         → base.css + 5 woff2 each have an ALLOWLIST.md row; no .js in assets/
  node scripts/check-tokens.mjs            → (a) no hex / brand font-name outside css-variables.liquid + settings_schema.json
                                             (b) every settings.x in css-variables.liquid has an id in settings_schema.json
                                             (c) every --color-* token has a Liquid | default: fallback
  node scripts/check-secrets.mjs           → unchanged
```

### Recommended file changes (structure)

```
config/
  settings_schema.json     EXTEND  → +Colores group, +Tipografía group; theme_info stays element 0
  settings_data.json       LEAVE   → stays {"current":{}} until first editor Save (do not hand-populate)
snippets/
  css-variables.liquid     REWRITE → @font-face ×5 + brand :root tokens + static spacing/radius; drop settings.type_primary_font
layout/
  theme.liquid             EDIT    → replace lines 13-18 (Skeleton font_url block) with self-hosted preload links
assets/
  base.css                 NEW     → DESIGN-03 primitives, static, var(--*) only
  critical.css             EDIT    → rename --color-background/--color-foreground refs if token rename adopted; null any reset shadow (D-11)
  dm-sans-400.woff2        NEW
  dm-sans-500.woff2        NEW
  inter-400.woff2          NEW
  inter-500.woff2          NEW
  inter-600.woff2          NEW
locales/
  en.default.json          git mv  → es.default.json      (+ translate to voseo)
  en.default.schema.json   git mv  → es.default.schema.json (+ translate; rewrite STRICT JSON — see Pitfall 6)
scripts/
  check-tokens.mjs         NEW     → DESIGN-02 + schema-reference integrity + locale key presence
sections/
  header.liquid footer.liquid  EDIT (only if token rename adopted) → var(--color-foreground) → var(--color-text)
ALLOWLIST.md               EDIT    → rows for base.css + 5 woff2, with CVR/perf justification
OVERRIDES.md               EDIT    → font self-host, locale default swap, token rename, settings_schema groups, theme.liquid edit
docs/PERF-BUDGET.md        EDIT    → font byte budget line; D-08 decision recorded
package.json               EDIT    → lint chain += "&& node scripts/check-tokens.mjs"; + "lint:tokens" script
.gitattributes             EDIT    → locales/*.json text eol=lf ; assets/*.woff2 binary
```

### Pattern 1: Extend, don't rewrite, `settings_schema.json`

**What:** Append/extend groups in the JSON array; never move `theme_info` (must be element 0).
**When to use:** Always for this file.
**Example:**
```jsonc
// config/settings_schema.json — element 0 unchanged, then extend the existing "t:general.colors" group
{
  "name": "t:general.colors",
  "settings": [
    { "type": "header", "content": "t:settings.colors.brand" },
    { "type": "color", "id": "color_primary",      "default": "#0F6E56", "label": "t:settings.colors.primary",     "info": "t:settings.colors.primary_info" },
    { "type": "color", "id": "color_primary_soft", "default": "#9FE1CB", "label": "t:settings.colors.primary_soft" },
    { "type": "color", "id": "color_accent",       "default": "#D85A30", "label": "t:settings.colors.accent",      "info": "t:settings.colors.accent_info" },
    { "type": "color", "id": "color_bg",           "default": "#F1EFE8", "label": "t:settings.colors.bg",          "info": "t:settings.colors.bg_info" },
    { "type": "color", "id": "color_text",         "default": "#2C2C2A", "label": "t:settings.colors.text" },
    { "type": "color", "id": "color_text_muted",   "default": "#5F5E5A", "label": "t:settings.colors.text_muted" },
    { "type": "header", "content": "t:settings.colors.support" },
    { "type": "color", "id": "color_edu",            "default": "#24566E", "label": "t:settings.colors.edu" },
    { "type": "color", "id": "color_edu_soft",       "default": "#CBDDE6", "label": "t:settings.colors.edu_soft" },
    { "type": "color", "id": "color_community",      "default": "#54487A", "label": "t:settings.colors.community" },
    { "type": "color", "id": "color_community_soft", "default": "#DDD7E8", "label": "t:settings.colors.community_soft" },
    { "type": "range", "id": "input_corner_radius", "min": 0, "max": 4, "step": 1, "unit": "px", "label": "t:labels.input_corner_radius", "default": 2 }
  ]
}
```
Notes: the existing `background_color` (`#FFFFFF`) and `foreground_color` (`#333333`) settings are either renamed to `color_bg` / `color_text` (recommended) or kept with new defaults + brand aliases. Every `t:settings.colors.*` key must be added to `es.default.schema.json` or the editor shows the raw key (Theme Check flags missing schema translation keys). `input_corner_radius` max lowered 10→2 to make D-10 un-violatable from the editor.

### Pattern 2: `@font-face` + tokens inline in `css-variables.liquid`

**What:** Self-hosted `@font-face` (Liquid `asset_url`) and `:root` tokens in one inlined `{% style %}` in `<head>`.
**When to use:** This phase. Keeps the font declarations and the tokens that reference them together, inline (no extra request), rendered before any consumer.
**Example:**
```liquid
{% # snippets/css-variables.liquid — KINELIA rewrite (D-05, D-08, D-17) %}
{% style %}
  {% # DM Sans — headings only, weights 400/500 (never 700 in long headings — D-05) %}
  @font-face {
    font-family: "DM Sans";
    font-style: normal; font-weight: 400; font-display: swap;
    src: url({{ 'dm-sans-400.woff2' | asset_url }}) format("woff2");
    unicode-range: U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF;
  }
  @font-face { font-family:"DM Sans"; font-style:normal; font-weight:500; font-display:swap;
    src: url({{ 'dm-sans-500.woff2' | asset_url }}) format("woff2"); unicode-range: /* same */; }
  {% # Inter — body, weights 400/500/600 (600 only labels/prices — D-05) %}
  @font-face { font-family:"Inter"; font-weight:400; font-display:swap; src:url({{ 'inter-400.woff2' | asset_url }}) format("woff2"); unicode-range: /* … */; }
  @font-face { font-family:"Inter"; font-weight:500; font-display:swap; src:url({{ 'inter-500.woff2' | asset_url }}) format("woff2"); unicode-range: /* … */; }
  @font-face { font-family:"Inter"; font-weight:600; font-display:swap; src:url({{ 'inter-600.woff2' | asset_url }}) format("woff2"); unicode-range: /* … */; }

  :root {
    {% # Typography (D-05, D-06). settings.font_* is a select; one option today, room for more. %}
    --font-heading: "DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-body: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    --font-weight-regular: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;

    {% # Color tokens — theme-editor tunable (D-17). Liquid default guards an emptied color picker (Pitfall 4). %}
    --color-primary: {{ settings.color_primary | default: '#0F6E56' }};
    --color-primary-soft: {{ settings.color_primary_soft | default: '#9FE1CB' }};
    {% # D-01: --color-accent is RESTRICTED. base.css and component CSS must use it ONLY for the price. %}
    --color-accent: {{ settings.color_accent | default: '#D85A30' }};
    --color-bg: {{ settings.color_bg | default: '#F1EFE8' }};   {% # D-03: never #FFFFFF %}
    --color-text: {{ settings.color_text | default: '#2C2C2A' }};
    --color-text-muted: {{ settings.color_text_muted | default: '#5F5E5A' }};
    --color-border: {{ settings.color_text_muted | default: '#5F5E5A' }};   {% # D-13 form borders %}
    {% # Support palette — present for Phases 7-8; base.css must NOT use (D-04) %}
    --color-edu: {{ settings.color_edu | default: '#24566E' }};
    --color-edu-soft: {{ settings.color_edu_soft | default: '#CBDDE6' }};
    --color-community: {{ settings.color_community | default: '#54487A' }};
    --color-community-soft: {{ settings.color_community_soft | default: '#DDD7E8' }};

    {% # Spacing — base-4 scale (D-09). Static: not a merchant concern. Single file = DESIGN-02 satisfied. %}
    --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
    --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px;

    {% # Radius / elevation (D-10, D-11). No shadow token exists — by design. %}
    --radius: {{ settings.input_corner_radius | default: 2 }}px;
    --radius-none: 0;

    {% # Skeleton names kept for its own sections until Phase 3 (or rename — see Open Question 5) %}
    --page-width: {{ settings.max_page_width | default: '90rem' }};
    --page-margin: {{ settings.min_page_margin | default: 20 }}px;
    --icon-stroke-width: 1.5px;   {% # referenced by icon-cart.svg, never defined by Skeleton %}
  }
{% endstyle %}
```

### Pattern 3: `theme.liquid` head — replace the Skeleton font block

**What:** Skeleton's `layout/theme.liquid:13-18` preconnects to `fonts.shopifycdn.com` and preloads `settings.type_primary_font | font_url`. Both depend on a `font_picker` object that no longer exists after D-18.
**Example:**
```liquid
{% # layout/theme.liquid — KINELIA: self-hosted fonts (D-08). Replaces Skeleton preconnect + font_url block. %}
<link rel="preload" as="font" type="font/woff2" href="{{ 'dm-sans-500.woff2' | asset_url }}" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="{{ 'inter-400.woff2' | asset_url }}" crossorigin>
```
Preload only the two weights on the first-paint path (heading 500, body 400). Each preload competes with the LCP hero image for bandwidth (PERF-BUDGET: the LCP element is the poster image, not text) — do **not** preload all five.

### Pattern 4: `base.css` — static, token-only, layered on the existing reset

**What:** `assets/base.css` holds DESIGN-03's six parts. It does **not** re-declare `* { box-sizing }` / `body` / `img,video {display:block}` — `critical.css` owns those (lines 4–49). `base.css` adds: type scale + heading/paragraph rules (D-06/D-07), link styling, the button primitive (D-12), form primitives (D-13), and one short-label uppercase utility (the only place `text-transform` is allowed — D-07).
**Example:**
```css
/* assets/base.css — design primitives, all token-derived. No literal hex, no font-family name. */
body { font-family: var(--font-body); font-weight: var(--font-weight-regular);
       font-size: 1rem; line-height: 1.5;                 /* D-07 floor */
       background-color: var(--color-bg); color: var(--color-text); }
h1, h2, h3 { font-family: var(--font-heading); font-weight: var(--font-weight-medium);
             line-height: 1.2; text-wrap: balance; }
h1 { font-size: 2.5rem; }        /* 40px — D-06 titular */
h2 { font-size: 1.625rem; }      /* 26px — D-06 subtítulo */
p  { line-height: 1.5; max-width: 68ch; }                 /* never justify — D-07 */
small, .caption { font-size: 0.8125rem; color: var(--color-text-muted); }  /* 13px — D-06 */

a { color: var(--color-primary); text-underline-offset: 0.15em; }

.button {                                                 /* D-12 */
  display: inline-flex; align-items: center; justify-content: center;
  padding: var(--space-3) var(--space-5);
  font-family: var(--font-body); font-weight: var(--font-weight-medium);
  background-color: var(--color-primary); color: var(--color-bg);
  border: 0; border-radius: var(--radius);
  /* no box-shadow, no gradient — D-11. Never --color-accent — D-01. */
}
.button--on-primary { background-color: var(--color-bg); color: var(--color-primary); }

input, select, textarea {                                 /* D-13 */
  font-size: 1rem;                                        /* ≥16px — no iOS zoom */
  padding: var(--space-2) var(--space-3);
  background-color: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}
:where(input, select, textarea):focus-visible {
  outline: 2px solid var(--color-primary); outline-offset: 1px;   /* solid, not shadow — D-11 */
}

.label-eyebrow { text-transform: uppercase; letter-spacing: 0.06em; font-size: 0.8125rem; }  /* ONLY allowed uppercase — D-07 */

.price { color: var(--color-accent); }   /* the one sanctioned use of terracota — D-01 */
```
Wire it in `theme.liquid` right after `critical.css`:
```liquid
{{ 'base.css' | asset_url | stylesheet_tag }}
```

### Pattern 5: `check-tokens.mjs` — executable DESIGN-02

**What:** Node-stdlib script, same shape as `check-allowlist.mjs` (empty-scan-fails, `process.exitCode`, Spanish messages, `# KINELIA` justification comments elsewhere).
**Checks:**
1. **Hex drift** — scan `assets/**/*.css` and `{% stylesheet %}` / `{% style %}` blocks in `sections/`, `blocks/`, `snippets/`. Fail on `/#(?:[0-9a-fA-F]{2}){3,4}\b|#[0-9a-fA-F]{3}\b/` after stripping `/* */`, `{% comment %}`, `{% # %}`. **Allowed files:** `snippets/css-variables.liquid`, `config/settings_schema.json`, `config/settings_data.json`.
2. **Font-name drift** — fail on `/"?DM Sans"?|"?Inter"?/i` in the same scan set outside the allowed files.
3. **Schema-reference integrity** — every `settings.<id>` referenced in `css-variables.liquid` has a matching `"id": "<id>"` in `settings_schema.json`.
4. **Empty-token guard** — every `--color-*:` line in `css-variables.liquid` that interpolates a setting also pipes `| default:`.
5. **Locale presence** — `locales/es.default.json` + `locales/es.default.schema.json` exist, parse as strict JSON, do not begin with a `U+FEFF` BOM, and no `*.default.json` other than `es.*` exists. Required storefront keys present (namespace list below) including the D-15 legal legend and the six brand CTAs.
6. Empty scan (no CSS found) → exit 1.

**Do NOT check spacing literals** (`1rem`, `gap: 16px`) — `sections/header.liquid` already has `height: 5rem; gap: 1rem` and enforcing a spacing scale machine-wide would be pure noise. Spacing-token discipline is a code-review concern, not a checker one.

### Anti-Patterns to Avoid

- **Literal hex in a section `{% stylesheet %}`** — the whole point of DESIGN-02. `sections/header.liquid` / `footer.liquid` are already clean (`var(--color-foreground)` only) — keep it that way.
- **Free-text (`type: "text"`) setting emitted into `{% style %}`** — CSS-context injection (`</style>…`). Use `color` / `select` only for anything that lands in the token block.
- **HTML in a non-`_html` locale key** — `{{ 'x' | t }}` auto-escapes; only `*_html`-suffixed keys render markup. The legal legend is plain text → plain key.
- **Re-declaring the reset in `base.css`** — `critical.css` owns `* { box-sizing }`, `body`, `img,video {display:block}`. Duplicating invites drift.
- **Preloading all five WOFF2** — starves the LCP image. Preload ≤2.
- **Hand-populating `config/settings_data.json`** — leave it `{"current":{}}`; schema `default:` covers first render, the editor owns it after first Save.
- **`text-transform: uppercase` outside `.label-eyebrow`** and **`text-align: justify` anywhere** — D-07.
- **`box-shadow` / `linear-gradient` anywhere in `base.css`** — D-11. If the reset or a UA style brings one, null it explicitly.

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| `@font-face` `unicode-range` for latin/latin-ext subsets | Hand-typed codepoint ranges | `google-webfonts-helper` or Fontsource output (copy their `unicode-range`) | Google's own subsetting ranges are battle-tested; a hand-typed range drops a glyph and the "ñ" renders in the fallback font. |
| Font subsetting | `pyftsubset` scripting from scratch | Pre-subset files from gwfh / Fontsource | No build step in this repo (CLAUDE.md). Downloading a ready file keeps the buildless constraint. |
| Reset / normalize | A new reset in `base.css` | The Josh-Comeau-derived reset already in `critical.css` (lines 3–49) | It's there, it's loaded first, it's good. Layer on it. |
| CSS custom-property fallback for unset settings | A JS shim | Liquid `{{ settings.x | default: '…' }}` | Native, zero runtime. |
| Type scale / spacing math | A Sass `@function` or clamp() generator | 8 fixed px values (D-09) + fixed rem sizes (D-06) | The brand book gives exact px. No fluid scale asked for. Buildless = no Sass anyway. |
| Locale key sync across languages | Manual diffing | Go es-only; if `en` is kept, Theme Check `MatchingTranslations` does the diffing | Don't do by hand what the linter does. |
| Theme-editor color validation | Regex-validating hex in the checker's "allowed" files | Shopify's `color` setting type | It's already value-constrained; the picker can't emit `</style>`. |

**Key insight:** almost everything this phase needs already exists in Skeleton or in Google's font tooling. The failure mode is *rewriting* `css-variables.liquid` from scratch (losing the `{% style %}` inline-in-head placement and the Liquid-default guard) rather than extending it, and *re-typing* subsetting ranges rather than copying them.

## Common Pitfalls

### Pitfall 1: The font swap silently breaks `theme.liquid` and `css-variables.liquid`
**What goes wrong:** After removing the `type_primary_font` `font_picker` setting, `settings.type_primary_font` is `nil`. `layout/theme.liquid:13` `{% unless settings.type_primary_font.system? %}` → `unless nil` → **true** → renders a `<link rel=preconnect>` to `fonts.shopifycdn.com` and `{{ nil | font_url | preload_tag }}` → an empty/broken `<link rel=preload>` on **every page**. `css-variables.liquid:3-6` `{{ nil | font_face }}` → nothing or a Liquid error.
**Why it happens:** the `font_picker` object powers `font_face` / `font_url` / `font_modify` / `.system?`; a `select` returns a plain string.
**How to avoid:** rewrite `css-variables.liquid` fully (Pattern 2) and edit `theme.liquid:13-18` (Pattern 3) in the same PR. Record the `theme.liquid` edit in `OVERRIDES.md` as a deliberate pre-empt of Phase 3's shell work.
**Warning signs:** `shopify theme check` Liquid warnings on `css-variables.liquid`; view-source shows `<link rel="preload" href="" as="font">`.

### Pitfall 2: `RemoteAsset` is a warning, not an error
**What goes wrong:** the plan assumes `shopify theme check --fail-level error` (what `npm run lint` runs) will fail if someone adds a Google Fonts `<link>`. It won't — `RemoteAsset` is **Warning** severity (verified on shopify.dev checks doc). Only `npm run lint:all` (`shopify theme check`, all levels) surfaces it.
**Why it happens:** D-08 / CONTEXT frames self-hosting as "keeps `RemoteAsset` green"; the real driver is LCP + privacy. The Shopify Font Library path is *also* green (its CDN is first-party to Shopify).
**How to avoid:** if third-party font hosting must be blocked as a hard gate, `check-tokens.mjs` should also fail on `fonts.googleapis.com` / `fonts.gstatic.com` / `use.typekit` strings in `layout/` and `snippets/`. Otherwise accept it's a warning and rely on code review.
**Warning signs:** CI green but `lint:all` shows `RemoteAsset`.

### Pitfall 3: The theme editor overwrites your token defaults
**What goes wrong:** you change `color_primary` default in `settings_schema.json` months later; the live store still shows the old green because `config/settings_data.json` (written by the editor / GitHub sync after the first Save) has the old value and it wins.
**Why it happens:** schema `default:` only applies when a setting has no stored value. First editor Save stores *all* current values.
**How to avoid:** treat a post-launch token change as (a) an edit in the theme editor (commits back via GitHub integration), or (b) a direct `settings_data.json` edit in a PR. Document this in `OVERRIDES.md` / `docs/RELEASE.md`. Keep schema `default:` and Liquid `| default:` both correct so a *fresh* theme install still looks right.
**Warning signs:** `git diff` shows `settings_data.json` changing from `{"current":{}}` to a populated object after someone opens the editor.

### Pitfall 4: `color` setting emits an empty string when cleared
**What goes wrong:** a merchant clears a color picker → `{{ settings.color_x }}` → `""` → `--color-x: ;` → invalid declaration dropped → that token resolves to `inherit`/`initial` and the UI loses its color.
**How to avoid:** every interpolated color in `css-variables.liquid` pipes `| default: '#…'` (Pattern 2). `check-tokens.mjs` check (c) enforces this. The hex in the `default:` filter is fine — `css-variables.liquid` is an allowed file.
**Warning signs:** computed styles show `--color-x` unset; visual regression after an editor session.

### Pitfall 5: FOUC / FOUT with `font-display: swap`
**What goes wrong:** first paint shows the fallback font, then reflows to DM Sans/Inter — a visible jump, and a CLS hit if metrics differ. Audience is 45–65, low screen brightness (D-07) — a jump is worse than usual.
**How to avoid:** (1) preload the two first-paint weights (Pattern 3); (2) pick a fallback whose metrics are close (`-apple-system` / Segoe UI / Roboto are reasonable for both); (3) optionally add `size-adjust` / `ascent-override` on a `@font-face` fallback face to pin metrics and kill the reflow. `swap` (not `optional`) is correct here — legibility on first load matters more than a perfectly stable metric, and preload shrinks the swap window to near zero.
**Warning signs:** Lighthouse "Avoid layout shifts" flags text; CLS creeps toward 0.1 in `npm run perf`.

### Pitfall 6: Windows BOM / CRLF corrupts locale JSON
**What goes wrong:** editing `es.default.json` with a Windows tool that writes a UTF-8 BOM (`U+FEFF`, the byte sequence `EF BB BF`) — Notepad, PowerShell 5's `Set-Content -Encoding utf8`, `>` redirection. `JSON.parse` throws on the BOM; `check-allowlist.mjs`'s `parseThemeJson` doesn't strip it; Shopify's schema parser may reject it. The repo scaffold already normalized line endings to CRLF (`OVERRIDES.md`), and `.gitattributes` currently only sets `linguist-language=jsonc`.
**How to avoid:** (1) add `.gitattributes`: `locales/*.json text eol=lf` and `config/*.json text eol=lf`; (2) write locale files with the `Write` tool / an editor that does UTF-8 **no BOM** (PS7 `utf8NoBOM`); (3) `check-tokens.mjs` check (5) asserts the first byte is not `U+FEFF`; (4) rewrite `es.default.schema.json` as **strict** JSON — the current `en.default.schema.json:76` has a trailing comma before the closing brace (Shopify tolerates it, strict `JSON.parse` does not); a new checker parsing it strict would fail. Add a `.planning/WINDOWS.md` ledger entry if BOM bites during execution.
**Warning signs:** `node -e "JSON.parse(require('fs').readFileSync('locales/es.default.json','utf8'))"` throws `Unexpected token`; theme editor shows raw `t:` keys.

### Pitfall 7: Missing schema translation keys show raw `t:` strings
**What goes wrong:** adding `"label": "t:settings.colors.primary"` to `settings_schema.json` without adding that key to `es.default.schema.json` → the theme editor shows the literal string `t:settings.colors.primary`.
**How to avoid:** every new `t:` key in `settings_schema.json` gets a value in `es.default.schema.json` (and `en.schema.json` if kept). `shopify theme check` flags missing schema keys; `check-tokens.mjs` can cross-check.

### Pitfall 8: `input_corner_radius` still allows up to 10px from the editor
**What goes wrong:** Skeleton's `settings_schema.json:72-80` defines `input_corner_radius` `min 0 max 10 default 4`. A merchant slides it to 10 → D-10 (flat, ≤2px) violated from the editor, invisibly to the checker.
**How to avoid:** lower `max` to `2` and `default` to `2` (Pattern 1). Same principle: constrain the editor so the brand system can't be broken through it.

### Pitfall 9: `git mv` history vs. Shopify's "one `.default`" rule
**What goes wrong:** two `*.default.json` files (leftover `en.default.json` + new `es.default.json`) → Shopify behavior is undefined / picks one; or deleting `en.default.json` outright reads as violating Phase 1's "never delete" rule.
**How to avoid:** frame it as a **rename + translate**, not a deletion: `git mv locales/en.default.json locales/es.default.json` then translate in place; same for `.schema.json`. Phase 1's no-delete rule is about *theme render surface* (sections/templates), not locales — a locale rename is a legitimate override. Record in `OVERRIDES.md` `## Archivos modificados` (or a new `## Locales` note). `check-tokens.mjs` check (5) asserts exactly one `*.default.json`.

## Code Examples

### es.default.json — minimal namespace scaffold (voseo)
```jsonc
// locales/es.default.json — storefront strings. STRICT JSON, UTF-8 no BOM.
// Voseo: imperatives "elegí / mirá / sumá / comprá / pedí"; "vos" never "usted"; "podés/tenés/querés".
{
  "general": {
    "accessibility": {
      "skip_to_content": "Saltar al contenido",
      "close": "Cerrar",
      "previous": "Anterior",
      "next": "Siguiente",
      "loading": "Cargando"
    },
    "social": { "share": "Compartir" }
  },
  "products": {
    "product": {
      "add_to_cart": "Sumar al carrito",
      "sold_out": "Sin stock",
      "unavailable": "No disponible",
      "quantity": "Cantidad",
      "size": "Talle",
      "color": "Color",
      "price": "Precio",
      "on_sale": "Oferta",
      "from_price_html": "Desde {{ price }}"
    }
  },
  "cart": {
    "title": "Carrito",
    "empty": "Tu carrito está vacío",
    "checkout": "Finalizar compra",
    "subtotal": "Subtotal",
    "remove": "Quitar",
    "update": "Actualizar",
    "continue_shopping": "Seguí comprando",
    "note": "Dejá una aclaración para tu pedido"
  },
  "sections": {
    "header": { "cart": "Carrito", "menu": "Menú", "search": "Buscar" },
    "footer": { "payment_methods": "Formas de pago" }
  },
  "templates": {
    "404": { "title": "No encontramos esta página", "back": "Volver al inicio" },
    "contact": { "form": { "name": "Nombre", "email": "Email", "phone": "Teléfono", "message": "Mensaje", "send": "Enviar" } },
    "search": { "title": "Buscar", "placeholder": "Buscá productos o páginas", "submit": "Buscar", "no_results": "No hay resultados para \"{{ terms }}\"" }
  },
  "newsletter": { "label": "Email", "submit": "Suscribirme", "success": "Listo, ya estás suscripta" },
  "kinelia": {
    "cta": {
      "quiero_las_mias": "Quiero las mías",
      "ver_talles_precio": "Ver talles y precio",
      "elegir_talle": "Elegir mi talle",
      "comprar": "Comprar",
      "comprar_ahora": "Comprar ahora",
      "pedir_whatsapp": "Pedir por WhatsApp"
    },
    "promesa_raiz": "Llegá a la noche con las piernas descansadas.",
    "legal_disclaimer": "Producto de uso cotidiano para el confort de las piernas. No reemplaza el tratamiento ni el diagnóstico médico. Ante várices, trombosis, diabetes o embarazo, consultá a tu médico antes de usarlo."
  }
}
```
Notes: `_html` suffix only where interpolation needs unescaped markup (`from_price_html`). The `kinelia.*` namespace keeps brand copy isolated from Shopify's conventional namespaces so later phases and the Language Editor find it predictably. Placeholder prices ($24.900 / $42.000) belong in a metaobject `oferta` (Phase 4), not the locale — do **not** hard-code them here.

### es.default.schema.json — editor labels for the new settings
```jsonc
// locales/es.default.schema.json — theme-editor UI. STRICT JSON, no trailing comma, no BOM.
{
  "general": { "colors": "Colores", "typography": "Tipografía", "fonts": "Fuentes", "layout": "Diseño", "header": "Encabezado", "footer": "Pie", "primary": "Principal" },
  "labels": { "background": "Fondo", "foreground": "Texto", "input_corner_radius": "Redondeo de campos", "page_width": "Ancho de página", "page_margin": "Margen de página", "menu": "Menú", "customer_account_menu": "Menú de cuenta" },
  "settings": {
    "colors": {
      "brand": "Colores de marca",
      "primary": "Verde primario",
      "primary_info": "Logo, titulares, bloques de cierre y botones.",
      "primary_soft": "Verde suave",
      "accent": "Terracota",
      "accent_info": "Uso restringido: solo el precio. Nunca fondos, botones ni titulares.",
      "bg": "Crema (fondo)",
      "bg_info": "Fondo general. Nunca blanco puro.",
      "text": "Texto principal",
      "text_muted": "Texto secundario",
      "support": "Paleta de apoyo (contenido educativo)",
      "edu": "Azul profundo", "edu_soft": "Azul claro",
      "community": "Violeta profundo", "community_soft": "Violeta claro"
    },
    "type": { "heading": "Fuente de titulares", "body": "Fuente de cuerpo" }
  },
  "options": { "page_width": { "narrow": "Angosto", "wide": "Ancho" } }
}
```

### check-tokens.mjs — skeleton (mirrors check-allowlist.mjs)
```js
/*
 * check-tokens.mjs — copia EJECUTABLE de DESIGN-02.
 * Falla (exit != 0) cuando:
 *   - aparece un hex (#rgb / #rrggbb / #rrggbbaa) o un nombre de familia de marca
 *     ("DM Sans" / "Inter") en CSS de componente, fuera de css-variables.liquid /
 *     settings_schema.json / settings_data.json,
 *   - css-variables.liquid referencia un settings.<id> sin id en settings_schema.json,
 *   - un token --color-* en css-variables.liquid interpola un setting sin `| default:`,
 *   - falta locales/es.default.json | es.default.schema.json, no parsean estrictos,
 *     tienen BOM, o existe otro *.default.json,
 *   - el scan de CSS viene vacío.
 * Node standard library únicamente. Uso: node scripts/check-tokens.mjs
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
const ALLOWED = new Set(["snippets/css-variables.liquid", "config/settings_schema.json", "config/settings_data.json"]);
const HEX = /#(?:[0-9a-fA-F]{2}){3,4}\b|#[0-9a-fA-F]{3}\b/;
const FONT_NAME = /"?DM Sans"?|(?<![A-Za-z-])"?Inter"?(?![A-Za-z-])/i;
const REQUIRED_STOREFRONT_KEYS = [
  "kinelia.legal_disclaimer", "kinelia.promesa_raiz",
  "kinelia.cta.quiero_las_mias", "kinelia.cta.ver_talles_precio", "kinelia.cta.elegir_talle",
  "kinelia.cta.comprar", "kinelia.cta.comprar_ahora", "kinelia.cta.pedir_whatsapp",
];
// … strip /* */, {% comment %}, {% # %} before matching; walk assets/**/*.css and
//    {% style/stylesheet %} blocks in sections|blocks|snippets; empty-scan → exit 1.
```

## State of the Art

| Old approach | Current approach | When changed | Impact |
|--------------|------------------|--------------|--------|
| `checkout.liquid` / Additional Scripts for any styling | Checkout Extensibility only | 2024–2025 | Out of scope here, but: no token work reaches checkout; that's `CHECKOUT-*` (Phase 12). |
| Dawn section-blocks (2-level, section-scoped) | Skeleton/Horizon theme blocks (`@theme`, nested) | 2025 | Not this phase, but the token layer must be theme-block-agnostic — `var(--*)` works everywhere. |
| `@import` Google Fonts CSS / `<link>` to googleapis | Self-hosted subset WOFF2 + `preload` | ~2022 onward | This phase's D-08 decision. WOFF2 + `font-display: swap` + preload is the 2026 baseline. |
| Variable fonts for everything | Static instances when ≤3 weights per family | ongoing | DM Sans/Inter: 2–3 weights → static WOFF2 is smaller total. |
| Sass token pipelines | Native CSS custom properties + `{% style %}` Liquid | OS 2.0 era | Matches the buildless constraint (CLAUDE.md). No preprocessor. |
| `font_picker` assumed for all themes | `font_picker` only for Shopify Font Library; `select` + `asset_url` for self-host | always, clearer now | D-18. `font_face`/`font_url`/`font_modify` are Font-Library-only filters. `[CITED: shopify.dev .../settings/fonts]` |

**Deprecated / outdated for this phase:**
- `settings.type_primary_font | font_face` (Skeleton's current `css-variables.liquid:3-6`) — replaced by hand-written `@font-face` (self-host).
- Skeleton `background_color` default `#FFFFFF` — violates D-03; must become crema.

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | DM Sans and Inter are both in the Shopify Font Library (only matters for the `font_picker` fallback path) | Standard Stack / Alternatives | If self-host is chosen (recommended) this is moot. If the fallback is needed and a family is absent, that path collapses. Verify in the theme editor font picker. |
| A2 | Subset (latin + latin-ext) static WOFF2 ≈ 18–35 KB per weight; ≈ 120–175 KB for all 5 | Standard Stack, Pitfall 5, PERF-BUDGET note | If larger, the font budget eats into the LCP image budget; may need to drop Inter 500 or 600 from the first-paint set or accept FOUT on secondary weights. Measure the actual files in Wave 0. |
| A3 | base-4 spacing scale `4/8/12/16/24/32/48/64` (D-09) is adequate for the whole theme | Pattern 2, Open Questions | A missing step (e.g. 20px, 40px) forces off-scale one-offs later. Cheap to add a step; confirm in plan review. |
| A4 | The theme editor does not write `settings_data.json` until the first explicit Save; schema `default:` covers all rendering until then | Pitfall 3, Arch map | If the GitHub integration writes defaults eagerly on connect, token changes via schema stop working sooner than expected. Low impact — mitigation (edit via editor or `settings_data.json`) is the same. |
| A5 | Shopify tolerates a single-locale theme (es-only, no `en`) with `es.default.json` as the sole default | Alternatives, Pitfall 9 | If Shopify requires an English fallback for admin/Flow strings, some system-generated text could appear untranslated. Mitigation: keep a thin `en.json` (non-default). Verified: "Only one default file is permitted" `[CITED: shopify.dev/docs/storefronts/themes/architecture/locales]` — silent on whether `en` must exist. |
| A6 | `{% style %}` inside a snippet processes `asset_url` for `@font-face src` | Pattern 2 | Standard Liquid behavior; if wrong, move `@font-face` to a `*.liquid` asset or `critical.css` won't help (it's static). Very low risk. |
| A7 | `check-secrets.mjs` `SKIP_RE` covers `.woff2` so committed fonts don't trip it | Package Legitimacy Audit | `[VERIFIED: scripts/check-secrets.mjs:53]` — not actually an assumption. |

## Open Questions

1. **base-4 spacing scale exact steps (D-09)** — `4/8/12/16/24/32/48/64` OK, or add `20`/`40`? *Recommendation:* ship as listed; add steps later if a real need appears.
2. **Font hosting (D-08)** — self-host WOFF2 (recommended, this research assumes it) vs Google Fonts `<link>`. *Recommendation:* self-host. Record in `OVERRIDES.md` + `PERF-BUDGET.md`.
3. **Keep a minimal `en.json` (D-14)?** *Recommendation:* es-only (rename, don't keep). Avoids `MatchingTranslations` sync tax. Revisit if untranslated system strings appear.
4. **Button radius: 2px (icon-consistent) vs 0 (badge-consistent) — D-12.** *Recommendation:* `--radius: 2px` on the button (`.button { border-radius: var(--radius) }`), `--radius-none: 0` reserved for badges. One knob, brand-flat either way.
5. **Adopt brand token names (rename `--color-background`→`--color-bg`, `--color-foreground`→`--color-text`) or alias?** Rename touches `critical.css`, `sections/header.liquid`, `sections/footer.liquid` (all `var(--color-foreground)`). *Recommendation:* rename — Phase 2 is the token phase; do it once, cleanly; record in `OVERRIDES.md`.
6. **Spacing/radius as `settings_schema.json` settings or static custom properties?** ROADMAP SC #1 says "espaciado … en `settings_schema.json`". *Recommendation:* static properties in `css-variables.liquid` (one file = one source = DESIGN-02 satisfied); colors + typography as settings. **Flag to `/gsd-discuss-phase` — this is a literal-wording deviation.**
7. **Does Phase 2 edit `layout/theme.liquid` (font preload block) or defer to Phase 3?** *Recommendation:* Phase 2 edits it — deferring ships a broken `font_url` preload. Record as a scoped pre-empt in `OVERRIDES.md`.
8. **Does `check-tokens.mjs` run in CI, or only local `npm run lint`?** Phase-1 precedent: `check-allowlist.mjs` runs local-only, noted as a residual in `01-SECURITY.md`. *Recommendation:* add it to the CI `lint` job in the same PR (cheap, and DESIGN-02 is a core contract).

## Environment Availability

| Dependency | Required by | Available | Version | Fallback |
|------------|-------------|-----------|---------|----------|
| Node.js | `check-tokens.mjs`, existing checkers | ✓ (Phase 1) | ≥ 22.12 (`package.json` engines) | — |
| Shopify CLI | `shopify theme check`, `shopify theme dev` render smoke | ✓ (Phase 1, CLI 4.x) | 4.x | — |
| git | `git mv` locale rename | ✓ | — | — |
| Font subsetting tool | Producing the 5 WOFF2 files | ✗ (not needed installed) | — | `google-webfonts-helper` (web) or Fontsource pre-subset files — no install |
| `shopify theme dev` clean Lighthouse run | Font-budget measurement in `npm run perf` | ⚠ | — | Known broken on Windows (WINDOWS.md #7 — proxy holds connection, chrome-launcher EPERM). Measure WOFF2 sizes with `ls -l` / `Get-Item`; defer full Lighthouse to Phase 13. |

**Missing dependencies with no fallback:** none.
**Missing with fallback:** font subsetting (use a web tool or pre-subset downloads).

## Validation Architecture

> `workflow.nyquist_validation` is `true` (`.planning/config.json`). This section seeds `02-VALIDATION.md`.

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Shopify theme tooling — `shopify theme check` (bundled, CLI 4.x) + Node-stdlib checkers. No unit-test framework (consistent with Phase 1 — "tests = the lint/preview gates"). |
| Config file | `.theme-check.yml` (`extends: theme-check:recommended`, no rules disabled); `package.json` `lint` chain |
| Quick run command | `shopify theme check --fail-level error && node scripts/check-tokens.mjs` |
| Full suite command | `npm run lint` (theme check + check-allowlist + check-tokens + check-secrets) then `npm run lint:all` for warnings (`RemoteAsset`) |

### Phase Requirements → Test Map
| Req ID | Behavior | Test type | Automated command | File exists? |
|--------|----------|-----------|-------------------|-------------|
| DESIGN-01 | Color + typography tokens defined in `settings_schema.json`; `css-variables.liquid` emits them as `--custom-properties` | schema+liquid validity | `shopify theme check --fail-level error` | ✅ theme check |
| DESIGN-01 | Every `settings.<id>` in `css-variables.liquid` resolves to a schema `id` | static integrity | `node scripts/check-tokens.mjs` (check 3) | ❌ Wave 0 — `scripts/check-tokens.mjs` |
| DESIGN-01 | Rendered `<head>` inline `<style>` contains `--color-primary` and `--font-heading` and an `@font-face` for "DM Sans" | render assertion | `shopify theme dev` + curl `/` + grep (manual-only if headless login unavailable — Phase 1 precedent for 01-07-T3) | ❌ Wave 0 — smoke script or documented manual step |
| DESIGN-02 | No literal hex / brand font-name in component CSS outside the 2 allowed files | executable drift check | `node scripts/check-tokens.mjs` (checks 1–2) | ❌ Wave 0 |
| DESIGN-02 | Every `--color-*` token has a Liquid `| default:` guard | static check | `node scripts/check-tokens.mjs` (check 4) | ❌ Wave 0 |
| DESIGN-03 | `assets/base.css` exists, references `var(--*)` only, no `@font-face`/hex/font-name, no `box-shadow`/`gradient`/`justify`/stray `uppercase` | static assertion | `node scripts/check-tokens.mjs` (scans `assets/**/*.css`) + `shopify theme check` `AssetSizeCSS` | ❌ Wave 0 |
| DESIGN-03 | `base.css` in `ALLOWLIST.md` `## Renderiza` + referenced by `theme.liquid` | allowlist check | `node scripts/check-allowlist.mjs` (add asset rows) | ✅ extend existing |
| DESIGN-04 | `locales/es.default.json` + `es.default.schema.json` exist, strict JSON, no BOM, sole `*.default.json` | locale presence | `node scripts/check-tokens.mjs` (check 5) | ❌ Wave 0 |
| DESIGN-04 | Required storefront keys present (legal legend, 6 CTAs, cart/product/header namespaces) | key-presence assertion | `node scripts/check-tokens.mjs` (check 5, `REQUIRED_STOREFRONT_KEYS`) | ❌ Wave 0 |
| DESIGN-04 | No missing `t:` schema keys referenced by `settings_schema.json` | theme check | `shopify theme check --fail-level error` | ✅ theme check |

### Sampling Rate
- **Per task commit:** `shopify theme check --fail-level error && node scripts/check-tokens.mjs` (< 20 s)
- **Per wave merge:** `npm run lint` (all checkers) + `npm run lint:all` (surface `RemoteAsset` warnings)
- **Phase gate:** full `npm run lint` green + `shopify theme dev` render smoke confirms tokens + `@font-face` in `<head>` + WOFF2 sizes recorded in `docs/PERF-BUDGET.md`, before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `scripts/check-tokens.mjs` — DESIGN-02 + schema-integrity + locale-presence (covers DESIGN-01/02/03/04)
- [ ] `package.json` — `lint` chain `+= "&& node scripts/check-tokens.mjs"`; add `"lint:tokens"` script; mirror into CI `lint` job
- [ ] 5 subset WOFF2 files in `assets/` (DM Sans 400/500, Inter 400/500/600) + OFL license reference
- [ ] `.gitattributes` — `locales/*.json text eol=lf`, `config/*.json text eol=lf`, `assets/*.woff2 binary`
- [ ] `ALLOWLIST.md` rows for `base.css` + 5 WOFF2
- [ ] (optional) render-smoke script: `shopify theme dev` + fetch `/` + assert token + `@font-face` presence — or a documented manual step in `02-VALIDATION.md` Manual-Only

## Security Domain

> `security_enforcement: true`, `security_asvs_level: 1` (`.planning/config.json`).

### Applicable ASVS Categories

| ASVS Category | Applies | Standard control |
|---------------|---------|-----------------|
| V1 Architecture | minor | Token values in schema `default:` + Liquid `default:`; document editor-vs-code ownership (Pitfall 3). |
| V5 Validation / Sanitization / Encoding | **yes** | Only `color` / `select` setting types feed `{% style %}` — never `text`/`textarea` (CSS-context injection). Locale strings render via `{{ … | t }}` (auto-escaped); HTML only in `*_html` keys, and only vetted markup. |
| V6 Cryptography | no | No secrets, keys, or crypto in this phase. |
| V12 Files / Resources | minor | WOFF2 committed from OFL upstream; `asset_url` serves same-origin from Shopify CDN. No remote asset fetch. |
| V14 Configuration | **yes** | Self-host removes the third-party `fonts.gstatic.com` / `fonts.googleapis.com` calls (supply-chain + privacy). `.theme-check.yml` keeps all `theme-check:recommended` rules at recommended severity (Phase 1 rule — never weaken). |
| V2/V3/V4/V7/V8/V9/V13 | no | No auth, sessions, access control, logging, data protection, comms, or API surface in a token/CSS/locale phase. |

### Known Threat Patterns for a Shopify token/locale phase

| Pattern | STRIDE | Standard mitigation |
| CSS-context injection via a free-text theme setting emitted into `{% style %}` (`value = "red} body{display:none} /*"` or `</style><script>`) | Tampering / XSS | Restrict token settings to `color` and fixed-option `select`; `check-tokens.mjs` allowed-file list is small and audited. |
| Untrusted HTML in a storefront locale value rendered unescaped | XSS (Tampering) | Plain `t:` keys auto-escape; `*_html` suffix reserved for reviewed markup only; legal legend is a plain key. |
| Third-party font CDN — user-IP leak to Google + external dependency on the critical path | Information Disclosure | Self-host subset WOFF2 in `assets/` (D-08). |
| Malicious/typo font file committed to `assets/` | Tampering | Download from Google Fonts / Fontsource upstream only; record provenance + OFL in `OVERRIDES.md`; WOFF2 executes no code; `check-secrets.mjs` scans (skips binaries by design). |
| Editor/merchant sets a token that breaks brand rules (radius 10, pure white, terracota everywhere) | Tampering (self-inflicted) | Constrain editor ranges (`input_corner_radius` max 2); `check-tokens.mjs` guards the *code* side; brand rules D-01/D-02/D-10/D-11 documented as comments in `css-variables.liquid` + `base.css`. |
| `theme-check:recommended` rule silently disabled to pass a font/asset check | Tampering | `.theme-check.yml` header forbids it; `OVERRIDES.md` `## Archivos modificados` would record any `.theme-check.yml` change; code review. |

## Sources

### Primary (HIGH confidence)
- **Repo files read this session** — `snippets/css-variables.liquid`, `config/settings_schema.json`, `config/settings_data.json`, `assets/critical.css`, `layout/theme.liquid`, `locales/en.default.json`, `locales/en.default.schema.json`, `scripts/check-allowlist.mjs`, `scripts/check-secrets.mjs`, `ALLOWLIST.md`, `OVERRIDES.md`, `docs/PERF-BUDGET.md`, `.theme-check.yml`, `package.json`, `.gitattributes`, `sections/header.liquid`, `assets/icon-cart.svg`, `snippets/meta-tags.liquid`, `.planning/WINDOWS.md`, `.planning/config.json`, `.planning/phases/01-.../01-VALIDATION.md`, `.planning/phases/02-.../02-CONTEXT.md`.
- shopify.dev — **Fonts** (`/docs/storefronts/themes/architecture/settings/fonts`): `font_face` / `font_url` / `font_modify` are Shopify-Font-Library filters; self-hosted fonts use `asset_url` in a hand-written `@font-face`. `[CITED]`
- shopify.dev — **Locales** (`/docs/storefronts/themes/architecture/locales`): "Only one default file is permitted"; `.default.json` (storefront) and `.default.schema.json` (schema); schema controls editor UI. `[CITED]`
- shopify.dev — **Theme Check checks**: `RemoteAsset` = Warning; `AssetSizeJavaScript` / `AssetSizeCSS` / `ImgWidthAndHeight` / `ParserBlockingScript` = Error. `[CITED]`

### Secondary (MEDIUM confidence)
- Shopify Help Center — Translating themes (default-locale rename procedure). Cross-checked with the shopify.dev locales doc.
- Practitioner guides (blackbeltcommerce, ecomm.design, sections.design) — self-hosted font `@font-face` + `asset_url` + preload pattern; consistent across sources and with shopify.dev.
- github.com/Shopify/skeleton-theme (pinned `skeleton-base-a4f32d3` per `OVERRIDES.md`) — the base being extended.

### Tertiary (LOW confidence)
- WOFF2 byte-size estimates (A2) — not measured; measure in Wave 0.
- Shopify Font Library coverage of DM Sans / Inter (A1) — not verified; only relevant to the rejected fallback path.

## Metadata

**Confidence breakdown:**
- Skeleton token mechanism + repo state: HIGH — files read directly this session.
- Self-hosted font mechanics + locale default rules: HIGH — shopify.dev, verified.
- `RemoteAsset` severity nuance: HIGH — shopify.dev checks doc.
- Font byte budget / preload tuning: MEDIUM — depends on unmeasured file sizes (A2).
- Theme-editor `settings_data.json` write timing: MEDIUM — behavioral assumption (A4), low blast radius.
- es-only single-locale viability: MEDIUM — doc silent on English-fallback requirement (A5).

**Research date:** 2026-09-08
**Valid until:** ~2026-12-08 (Shopify theme architecture is stable; re-check the fonts + locales docs if Shopify ships a Horizon-era settings change).
