# Phase 2: Sistema de diseño por tokens - Pattern Map

**Mapped:** 2026-09-08
**Files analyzed:** 18 (7 create, 11 modify)
**Analogs found:** 16 / 18 (2 have no in-repo analog — the WOFF2 binaries and `.gitattributes` content)

All analog paths verified git-tracked in the theme submodule
`SHOPIFY KInelia/Shopify-Kinelia`. No mirror/gitignored paths emitted.

---

## File Classification

| File | New/Mod | Role | Data Flow | Closest Analog | Match |
|------|---------|------|-----------|----------------|-------|
| `scripts/check-tokens.mjs` | new | utility / checker | batch / transform (read-only scan) | `scripts/check-allowlist.mjs` | exact |
| `assets/base.css` | new | config / stylesheet primitive | transform (token → rendered CSS) | `assets/critical.css` | role-match (sibling layer) |
| `assets/{dm-sans,inter}-*.woff2` ×5 | new | asset (binary) | file-I/O (static served) | `assets/icon-cart.svg` (asset-row discipline only) | partial |
| `locales/es.default.json` | new (git mv) | config / i18n | request-response (storefront string lookup) | `locales/en.default.json` | exact |
| `locales/es.default.schema.json` | new (git mv) | config / i18n | request-response (editor UI labels) | `locales/en.default.schema.json` | exact |
| `.gitattributes` | mod | config | n/a | current `.gitattributes` (1 line) | role-match |
| `config/settings_schema.json` | mod | config | event-driven (editor writes settings_data) | its own `t:general.colors` / `t:general.typography` groups | exact (self) |
| `snippets/css-variables.liquid` | mod (rewrite) | config / token emitter | transform (settings → `:root` custom props) | current `snippets/css-variables.liquid` | exact (self) |
| `layout/theme.liquid` | mod | layout | request-response | current `<head>` font block (lines 7-18) | exact (self) |
| `assets/critical.css` | mod (token rename) | config / stylesheet | transform | current `critical.css` | exact (self) |
| `sections/header.liquid`, `sections/footer.liquid` | mod (only if rename adopted) | component | request-response | current `var(--color-foreground)` refs | exact (self) |
| `package.json` | mod | config | n/a | current `scripts.lint` chain | exact (self) |
| `.github/workflows/ci.yml` | mod | config / CI | event-driven | current `Theme Check (gate)` step | exact (self) |
| `ALLOWLIST.md` | mod | docs | n/a | `## Renderiza` table + `assets/critical.css` row | exact (self) |
| `OVERRIDES.md` | mod | docs | n/a | `## Archivos modificados` + `## Archivos nuevos` tables | exact (self) |
| `docs/PERF-BUDGET.md` | mod | docs | n/a | `## Resumen de asserts` table + `## Detalle por número` | exact (self) |

---

## Pattern Assignments

### `scripts/check-tokens.mjs` (utility/checker, batch scan)

**Analog:** `scripts/check-allowlist.mjs` (house style) + `scripts/check-secrets.mjs` (git + skip-binary patterns). RESEARCH §"Pattern 5" + §"check-tokens.mjs — skeleton" (02-RESEARCH.md lines 550-580) is the spec — mirror it.

**File-header comment block** — copy the shape from `check-allowlist.mjs:1-18`: dashed banner, one-line title `check-tokens.mjs — copia EJECUTABLE de DESIGN-02`, a "Falla (exit != 0) cuando:" bullet list in Spanish, then `Node standard library únicamente. Uso: node scripts/check-tokens.mjs`.

**Imports + ROOT resolution** (`check-allowlist.mjs:20-24`) — copy verbatim:
```js
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");
```

**Strict-JSON parse with BOM guard** — `check-allowlist.mjs:57-68` `parseThemeJson` strips `/* */` banners and trailing commas for *theme* JSON; for locale files check (5) needs the opposite — parse **strict** and fail on trailing comma / BOM. Reuse the try/catch + `throw new Error(\`no se pudo parsear ${label}: ...\`)` shape but drop the `.replace()` cleaning. Assert `raw.charCodeAt(0) !== 0xfeff`.

**Directory walk** — `check-allowlist.mjs:70-76` `jsonFilesIn(dir)` (existsSync guard → readdirSync → filter → sort → map join). Generalise to a recursive `.css` / `.liquid` walker for `assets/`, `sections/`, `blocks/`, `snippets/`.

**Comment-stripping before regex match** — RESEARCH check 1: strip `/* */`, `{% comment %}…{% endcomment %}`, `{% # … %}` before testing `HEX` / `FONT_NAME`. Regexes are given verbatim in 02-RESEARCH.md:571-572.

**Allowed-file Set** (mirror `RENDER_ALLOWLIST` as an exported const):
```js
const ALLOWED = new Set(["snippets/css-variables.liquid", "config/settings_schema.json", "config/settings_data.json"]);
```

**Violation accumulation + exit** — copy `check-allowlist.mjs:92-171` exactly: `const violations = []`, push strings, at end `if (violations.length > 0) { for (const line of violations) console.error(\`x ${line}\`); console.error(\`check-tokens: ${violations.length} violacion(es).\`); process.exitCode = 1; return; }` then a single `console.log("check-tokens: OK — …")` summary line with counts. Bottom of file: bare `main();`.

**Empty-scan-fails guard** — `check-allowlist.mjs:101-108`: if zero CSS files found → `console.error` + `process.exitCode = 1; return;`. Same philosophy in `check-secrets.mjs:105-109`.

**`process.exitCode` not `process.exit()`** — both analogs use `process.exitCode = 1; return;`. CLAUDE.md (Kinelia root) mandates this for Windows event-loop drain.

**git usage (only if check needs tracked-file list)** — `check-secrets.mjs:33,57-59`: `execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64*1024*1024 })`. `check-secrets.mjs:53` `SKIP_RE` already covers `woff2` — reuse that regex if scanning tracked files.

---

### `assets/base.css` (stylesheet primitive, token-consuming)

**Analog:** `assets/critical.css` — the sibling layer. `base.css` layers on top and must NOT re-declare the reset.

**Do NOT duplicate** `critical.css:3-28` (`* { box-sizing; margin: 0 }`, `body { display:flex; flex-direction:column }`, `img,picture,video,canvas,svg { display:block }`). RESEARCH Anti-Patterns + "Don't Hand-Roll": the Josh-Comeau reset is already loaded first.

**File-header comment** — copy `critical.css:1` style: `/* assets/base.css — design primitives, all token-derived. No literal hex, no font-family name. */`

**`var(--*)`-only rule** — `critical.css` already references `var(--color-background)`, `var(--font-primary--family)`, `var(--style-border-radius-inputs)`, `var(--page-width)` and never a literal. `base.css` continues this; `check-tokens.mjs` scans `assets/**/*.css` so a literal hex here fails the build.

**Full primitive skeleton** is given verbatim in 02-RESEARCH.md §"Pattern 4" (lines 327-365): `body`, `h1/h2/h3`, `p`, `small/.caption`, `a`, `.button` + `.button--on-primary`, `input/select/textarea` + `:focus-visible`, `.label-eyebrow` (only allowed `text-transform: uppercase` — D-07), `.price` (only allowed `--color-accent` use — D-01). No `box-shadow` / `linear-gradient` / `text-align: justify` anywhere (D-11, D-07).

**Token rename touch-point:** if the `--color-foreground`→`--color-text` rename is adopted (RESEARCH Open Q 5), `critical.css:34,38-39,44-45,77-78` (`--color-background`, `--color-foreground`, `--style-border-radius-inputs`) get renamed in the same PR.

---

### `assets/{dm-sans-400,dm-sans-500,inter-400,inter-500,inter-600}.woff2` (binary assets)

**No code analog.** Provenance/discipline analog: every asset needs a `## Renderiza` row in `ALLOWLIST.md` (see `assets/critical.css` / `assets/icon-cart.svg` rows). `check-allowlist.mjs:138-153` scans `assets/` for forbidden `.js`/`.mjs` and heavy-lib name substrings — WOFF2 passes untouched. `check-secrets.mjs:53` `SKIP_RE` skips `woff2?` — committing fonts won't trip the secret scanner (02-RESEARCH.md:148).

Source: `google-webfonts-helper` or Fontsource pre-subset (latin + latin-ext), SIL OFL 1.1. Record provenance table in `OVERRIDES.md` `## Archivos nuevos` (02-RESEARCH.md:141-146).

---

### `locales/es.default.json` (i18n storefront strings)

**Analog:** `locales/en.default.json` — `git mv` then translate in place (Pitfall 9: frame as rename + translate, never delete).

**Structure to mirror:** flat top-level namespaces (`404`, `cart`, `search`, `password`, `gift_card`…), 2-level nesting, `_html` suffix ONLY on keys needing unescaped interpolation (`en.default.json:13,49,50` — `article_metadata_html`, `no_results_html`, `results_for_html`). Preserve the `gift_card` and `password` namespaces (routes are in the allowlist).

**Full voseo scaffold** is given verbatim in 02-RESEARCH.md §"Code Examples" (lines 459-519) — including the `kinelia.*` namespace with the 6 CTAs and `legal_disclaimer` (plain key, not `_html` — auto-escaped). Do NOT hard-code placeholder prices (they go to a Phase 4 metaobject).

**STRICT JSON, UTF-8 no BOM** — write with the `Write` tool (never PowerShell `Set-Content`). `.gitattributes` `locales/*.json text eol=lf` enforces LF (Pitfall 6).

---

### `locales/es.default.schema.json` (i18n editor labels)

**Analog:** `locales/en.default.schema.json` — `git mv` + translate.

**CRITICAL FIX:** `en.default.schema.json:76` has a **trailing comma** before the closing brace (`"normal": "Normal text"` block → `},` then `}`). Shopify tolerates it; strict `JSON.parse` in `check-tokens.mjs` check (5) does not. Rewrite as strict JSON — no trailing comma (Pitfall 6, 02-RESEARCH.md:441).

**Structure:** `general` / `labels` / `options` namespaces (`en.default.schema.json:2-77`). Every new `t:` key added to `settings_schema.json` MUST get a value here or the editor shows the raw key (Pitfall 7). Full new-key set given verbatim in 02-RESEARCH.md lines 524-547 (`settings.colors.brand`, `settings.colors.primary`, `…primary_info`, `…accent_info`, `settings.type.heading/body`, etc.).

---

### `.gitattributes` (config)

**Analog:** current file is a single line `*.json linguist-language=jsonc`. Append (do not replace):
```
locales/*.json text eol=lf
config/*.json  text eol=lf
assets/*.woff2 binary
```
Rationale: Pitfall 6 + 02-RESEARCH.md:668. The repo scaffold normalized line endings to CRLF (`OVERRIDES.md:18`) — these lines carve out the JSON that must stay LF/no-BOM.

---

### `config/settings_schema.json` (config, editor-driven)

**Analog:** its own existing structure — `theme_info` is element 0 (lines 2-9) and MUST NOT move (`check-allowlist`-style implicit contract; Shopify requirement).

**Pattern: extend, don't rewrite.** Existing groups: `t:general.typography` (lines 10-24, has the `font_picker` `type_primary_font` to REPLACE with a `select` per D-18), `t:general.layout` (25-55), `t:general.colors` (56-82, has `background_color` `#FFFFFF` + `foreground_color` `#333333` + `input_corner_radius` min0/max10/default4).

**Changes:**
- `t:general.colors` group: rename `background_color`→`color_bg` (default `#F1EFE8`), `foreground_color`→`color_text` (default `#2C2C2A`); add the other 8 `color` settings (6 primary + 4 support minus the 2 renamed). Full JSON given verbatim in 02-RESEARCH.md §"Pattern 1" (lines 228-248).
- `input_corner_radius`: lower `max` 10→2, `default` 4→2 (Pitfall 8).
- `t:general.typography`: replace `font_picker` with two `select` settings (`font_heading`, `font_body`), each with fixed brand-family options — mirror the existing `max_page_width` `select` shape (`settings_schema.json:29-43`: `type`/`id`/`label`/`options[{value,label}]`/`default`).

**`color` / `select` only** into anything emitted to `{% style %}` — never `text`/`textarea` (CSS-context injection; Security Domain V5).

---

### `snippets/css-variables.liquid` (token emitter, transform)

**Analog:** its own current 19 lines — the `{% style %}` wrapper, the `:root { }` block, and the `{{ settings.x }}` interpolation pattern (lines 8-17) are the load-bearing shape to KEEP. What changes is the contents.

**Keep:** `{% style %}` … `{% endstyle %}` wrapper (inlined in `<head>` via `theme.liquid:5`, renders before `critical.css`). Keep `--page-width`, `--page-margin` lines (Skeleton sections still use them).

**Remove:** lines 3-6 (`settings.type_primary_font | font_face`) and lines 9-11 (`settings.type_primary_font.family/.style/.weight`) — the `font_picker` object is gone after D-18. Pitfall 1: `{{ nil | font_face }}` breaks.

**Add:** 5 hand-written `@font-face` rules using `{{ 'dm-sans-400.woff2' | asset_url }}` (RESEARCH confirms `asset_url` is processed inside `{% style %}` — A6); brand `:root` tokens with a Liquid `| default:` guard on EVERY interpolated color (Pitfall 4 — `--color-primary: {{ settings.color_primary | default: '#0F6E56' }};`); static `--space-1..8`, `--radius`, `--radius-none`. Full rewrite given verbatim in 02-RESEARCH.md §"Pattern 2" (lines 256-310).

**Brand-rule comments inline** — D-01 (terracota restricted), D-03 (never `#FFFFFF`), D-04 (support palette not used by base.css) documented as `{% # … %}` comments (CONTEXT D-01 requires it).

**KINELIA marker** — this is a starter-file rewrite: add `{% comment %} KINELIA: ... {% endcomment %}` per `OVERRIDES.md:19` rule, and a row in `OVERRIDES.md` `## Archivos modificados`.

---

### `layout/theme.liquid` (layout)

**Analog:** its own current `<head>` (lines 1-27). The font block at lines 7-18 (`{% unless settings.type_primary_font.system? %}` → preconnect `fonts.shopifycdn.com` + `{{ settings.type_primary_font | font_url | preload_tag }}`) MUST be replaced — Pitfall 1: `unless nil.system?` → true → broken empty `<link rel=preload href="">` on every page.

**Replace with** (02-RESEARCH.md §"Pattern 3", lines 316-320):
```liquid
{% # KINELIA: self-hosted fonts (D-08). Replaces Skeleton preconnect + font_url block. %}
<link rel="preload" as="font" type="font/woff2" href="{{ 'dm-sans-500.woff2' | asset_url }}" crossorigin>
<link rel="preload" as="font" type="font/woff2" href="{{ 'inter-400.woff2' | asset_url }}" crossorigin>
```
Preload EXACTLY 2 weights (heading 500 + body 400) — not all 5 (Anti-Pattern: starves the LCP image).

**Add after `critical.css:21`:** `{{ 'base.css' | asset_url | stylesheet_tag }}` — mirror the exact `critical.css` load pattern at line 21 (minus `preload: true`).

**KINELIA `{% comment %}` marker** + `OVERRIDES.md` row. RESEARCH Open Q 7: this edit belongs in Phase 2 (deferring ships a broken preload), recorded as a scoped pre-empt of Phase 3.

---

### `sections/header.liquid` / `sections/footer.liquid` (components — conditional)

**Only touched if the `--color-foreground`→`--color-text` rename is adopted** (RESEARCH Open Q 5). ALLOWLIST.md:31-33 + 02-RESEARCH.md:386 confirm these files are already clean (`var(--color-foreground)` only, no literal hex — keep it that way). Pure find/replace of the var name; no structural change. `check-tokens.mjs` check 1 must stay green on them.

---

### `package.json` (config)

**Analog:** its own `scripts.lint` chain (line 11):
```
"lint": "shopify theme check --fail-level error && node scripts/check-allowlist.mjs && node scripts/check-secrets.mjs",
```
**Change:** append `&& node scripts/check-tokens.mjs` to `lint`; add `"lint:tokens": "node scripts/check-tokens.mjs"` mirroring the existing `lint:allowlist` / `lint:secrets` entries (lines 13-14). No new deps (Node stdlib only).

---

### `.github/workflows/ci.yml` (CI config)

**Analog:** the `Theme Check (gate)` step (lines 49-53) — the authoritative required-status-check step. Job name `Theme Check` / `theme-check` MUST stay stable (line 6 warning: renaming un-gates branch protection).

**Change:** extend the `run:` block of the gate step so the Node checkers run in the same required job:
```yaml
      - name: Theme Check (gate)
        run: |
          npm install -g @shopify/cli
          shopify theme check --fail-level error
          node scripts/check-tokens.mjs
          node scripts/check-allowlist.mjs
```
RESEARCH Open Q 8: add `check-tokens.mjs` (and backfill `check-allowlist.mjs`, which was local-only in Phase 1) to CI in this PR. Node is preinstalled on `ubuntu-latest`. Record in `OVERRIDES.md` `## Archivos modificados` (ci.yml already has a row — append the reason).

---

### `ALLOWLIST.md` (docs)

**Analog:** the `## Renderiza` table (lines 27-57) — one row per file. Add rows for `assets/base.css` (`stylesheet_tag` from `theme.liquid`, "primitivas de diseño derivadas de tokens — Fase 2") and each of the 5 `assets/*.woff2` (`preload` / `@font-face` via `css-variables.liquid`, subset latin+latin-ext, OFL 1.1). Follow the exact `| Archivo | Ruta o uso | Por qué |` column format. The `assets/critical.css` row (line 55) is the closest template.

---

### `OVERRIDES.md` (docs)

**Analog:** `## Archivos modificados` table (lines 22-28) and `## Archivos nuevos` table (lines 50-62), same `| Ruta | Plan | Por qué/Qué aporta |` format.

**`## Archivos modificados` — add rows:** `config/settings_schema.json` (brand color/typography groups, font_picker→select, radius max 2), `snippets/css-variables.liquid` (full rewrite — @font-face + brand tokens), `layout/theme.liquid` (self-host preload, pre-empt of Phase 3), `assets/critical.css` (token rename if adopted), `package.json`, `.github/workflows/ci.yml` (append reason), `.gitattributes`, `sections/header.liquid`+`footer.liquid` (if rename).

**`## Archivos nuevos` — add rows:** `assets/base.css`, `assets/*.woff2` ×5 (with the provenance/OFL table from 02-RESEARCH.md:141-146), `scripts/check-tokens.mjs`, `locales/es.default.json` + `es.default.schema.json` (note: `git mv` from `en.default.*` — rename + translate, not deletion; Pitfall 9).

**Consider a `## Locales` note** documenting the es-only default decision (RESEARCH rec: drop `en`, avoids `MatchingTranslations` sync tax).

---

### `docs/PERF-BUDGET.md` (docs)

**Analog:** `## Resumen de asserts` table (lines 34-42) + `## Detalle por número` prose sections (lines 44-90). Add a font-byte-budget line/section: measured WOFF2 sizes (use `ls -l` / `Get-Item` — `shopify theme dev` Lighthouse is broken on Windows, WINDOWS.md #7), total for the 5 files, and the D-08 self-host decision recorded against the LCP ≤ 2500 ms constraint. Follow the existing "ESTO ES UN SUPUESTO" pattern (lines 70-90) if the total is estimated rather than measured at write time. A2 assumption: ≈120-175 KB for all 5.

---

## Shared Patterns

### Node-stdlib checker house style
**Source:** `scripts/check-allowlist.mjs` (primary), `scripts/check-secrets.mjs` (git + skip-binary)
**Apply to:** `scripts/check-tokens.mjs`
- Dashed-banner Spanish file header with "Falla (exit != 0) cuando:" bullet list + `Node standard library únicamente. Uso:` line
- `import … from "node:fs" / "node:path" / "node:url"` only; `const ROOT = resolve(fileURLToPath(import.meta.url), "../..")`
- `const violations = []` → push Spanish strings → end-of-run `console.error(\`x ${line}\`)` loop + count + `process.exitCode = 1; return`
- Single `console.log("<name>: OK — <counts>")` on success
- **Empty scan → exit 1** (`check-allowlist.mjs:101-108`, `check-secrets.mjs:105-109`)
- `process.exitCode = 1; return;` — never `process.exit()` (Kinelia CLAUDE.md, Windows)
- Bare `main();` at file end
- Wired into `npm run lint` chain AND its own `lint:<name>` script

### KINELIA divergence marker
**Source:** `OVERRIDES.md:19,76-81`
**Apply to:** every starter file edited — `css-variables.liquid`, `theme.liquid`, `critical.css`, `settings_schema.json`, `header/footer.liquid`, `package.json`, `ci.yml`, `.gitattributes`
- Liquid edits: `{% comment %} KINELIA: … {% endcomment %}` at the edit site
- config/JSON/YAML: `# KINELIA:` comment OR a row in `OVERRIDES.md ## Archivos modificados`
- Same PR that introduces the divergence updates `OVERRIDES.md` (starter files) and `ALLOWLIST.md` (render surface)

### Token custom-property emission
**Source:** `snippets/css-variables.liquid:8-17` + `assets/critical.css` (`var(--*)` consumption)
**Apply to:** `css-variables.liquid` (emit), `base.css` (consume), `header/footer.liquid` (consume)
- Values interpolated as `{{ settings.<id> | default: '<fallback>' }}` inside a single `{% style %}` `:root { }` block
- Consumers reference `var(--token)` ONLY — literal hex / font-family name fails `check-tokens.mjs`
- Allowed-hex files: `snippets/css-variables.liquid`, `config/settings_schema.json`, `config/settings_data.json`

### Strict-JSON / no-BOM / LF for locale + config JSON
**Source:** Pitfall 6, `.gitattributes`, `check-allowlist.mjs:57-68` (what NOT to do for locales)
**Apply to:** `locales/es.default.json`, `locales/es.default.schema.json`, `.gitattributes`
- Write with the `Write` tool (no PowerShell `Set-Content`)
- No trailing commas (unlike the tolerated `en.default.schema.json:76`)
- First byte ≠ `U+FEFF`
- `.gitattributes` `text eol=lf` for `locales/*.json` + `config/*.json`

### CI required-status-check stability
**Source:** `.github/workflows/ci.yml:1-6,49-53`
**Apply to:** `ci.yml` edit
- Job name `theme-check` / display `Theme Check` is frozen (branch protection keys off it)
- New gates go into the `run:` block of the existing `Theme Check (gate)` step, not a new job

---

## No Analog Found

| File | Role | Reason |
|------|------|--------|
| `assets/*.woff2` (5 files) | binary asset | No font files in the repo yet; downloaded from gwfh/Fontsource, not authored. Discipline analogs only (`ALLOWLIST.md` row, `check-secrets.mjs` skip). |
| `.gitattributes` new lines | config | Current file is one unrelated line; the `text eol=lf` / `binary` attributes have no in-repo precedent. Spec: 02-RESEARCH.md:668. |

---

## Metadata

**Analog search scope:** `scripts/`, `snippets/`, `config/`, `layout/`, `assets/`, `locales/`, `sections/`, `.github/workflows/`, repo-root docs (`ALLOWLIST.md`, `OVERRIDES.md`, `docs/PERF-BUDGET.md`), `package.json`, `.gitattributes` — all within the `SHOPIFY KInelia/Shopify-Kinelia` theme.
**Files scanned:** 16 read in full this session.
**Tracked-source gate:** all analog paths confirmed under the tracked theme tree; no `.gsd/capabilities/` or gitignored mirror paths emitted.
**Pattern extraction date:** 2026-09-08
