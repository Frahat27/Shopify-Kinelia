---
phase: 02-sistema-de-diseno-por-tokens
plan: 01
subsystem: ui
tags: [design-tokens, shopify-theme, settings-schema, css-custom-properties, liquid, node-checker, ci-gate, locale]

requires:
  - phase: 01-repo-tema-base-y-workflow-foundation
    provides: "Skeleton theme scaffold, css-variables.liquid token emitter, critical.css reset, check-allowlist.mjs / check-secrets.mjs house style, CI Theme Check (gate) required status check, ALLOWLIST.md / OVERRIDES.md ledgers"
provides:
  - "End-to-end token path proven on one real brand colour: settings_schema.json default -> css-variables.liquid custom property (with Liquid default: guard) -> assets/base.css rule -> loaded by layout/theme.liquid after critical.css"
  - "scripts/check-tokens.mjs — executable DESIGN-02: 9 rules, exports ALLOWED_FILES + EXEMPT_FILES"
  - "assets/base.css — token-consuming design stylesheet (tracer rule only; filled out in 02-03)"
  - "config/settings_schema.json color_primary setting (#0F6E56) in the t:general.colors group"
  - "npm run lint chain + required CI Theme Check (gate) step now run all three Node checkers (tokens, allowlist, secrets) — closes Phase-1 residual T-01-12"
  - ".gitattributes: locales/*.json + config/*.json pinned to eol=lf; assets/*.woff2 binary"
  - "lint:tokens npm script"
affects: [02-02, 02-03, 02-04, "any later phase adding component CSS or theme settings"]

actuals:
  tokens: 12000
  tasks: 3
  commits: 3

tech-stack:
  added:
    - "scripts/check-tokens.mjs (Node stdlib checker, no deps)"
  patterns:
    - "Token path: schema default -> Liquid custom property with `| default:` fallback -> var(--*) consumer -> layout load order"
    - "Node-stdlib checker house style (dashed Spanish banner, violations[] accumulator, process.exitCode not process.exit, bare main(), empty-scan backstop) — third instance after check-allowlist.mjs / check-secrets.mjs"
    - "New gate goes into the run: block of the existing required Theme Check (gate) CI step, never a new job (branch protection keys off the frozen job name)"

key-files:
  created:
    - "scripts/check-tokens.mjs"
    - "assets/base.css (Task 1, commit e69ba86)"
  modified:
    - "config/settings_schema.json (Task 1)"
    - "snippets/css-variables.liquid (Task 1)"
    - "layout/theme.liquid (Task 1)"
    - "locales/en.default.schema.json (Task 1)"
    - "ALLOWLIST.md (Task 1)"
    - "package.json (Task 3)"
    - ".github/workflows/ci.yml (Task 3)"
    - ".gitattributes (Task 3)"
    - "OVERRIDES.md (Task 3)"

key-decisions:
  - "check-tokens.mjs CONSTRAINED_TYPES admits color, color_background, select, radio, range, checkbox, font_picker — broader than the plan's literal 'colour picker, select or range' but faithful to the must_haves intent (constrained picker vs free text). font_picker MUST be admitted or the checker fails today: css-variables.liquid still references settings.type_primary_font (font_picker) until plan 02-02 removes it."
  - "The four existing CRLF JSON files (locales/en.default.*, config/settings_*.json) are NOT renormalised to LF in this plan — the new .gitattributes eol=lf attribute takes effect on next write. Plan 02-04 rewrites the locale files; check-tokens.mjs strict JSON.parse is CRLF-agnostic (only BOM matters)."
  - "Task/commit boundaries followed the PLAN (Task 2 = check-tokens.mjs only; Task 3 = package.json + ci.yml + .gitattributes + OVERRIDES.md), not the resume prompt's looser 'rest of Task 2' phrasing. Both readings finish the plan identically."

patterns-established:
  - "Every settings.<id> a component or emitter interpolates into a {% style %} block must resolve to a value-constrained schema type — check-tokens.mjs rule 3 is the injection guard"
  - "Every --color-* custom property that interpolates a setting pipes a Liquid `| default:` fallback — check-tokens.mjs rule 4"
  - "A var(--x) whose name is defined nowhere (emitter root block or same-file local) fails the build — check-tokens.mjs rule 5 makes token renames safe"

requirements-completed: [DESIGN-01, DESIGN-02, DESIGN-03]

coverage:
  - id: D1
    description: "One real brand colour (#0F6E56) travels the whole token path end to end and the theme linter accepts the result"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "shopify theme check --fail-level error"
        status: pass
      - kind: integration
        ref: "node -e (tracer assertion: theme_info element 0, color_primary present, --color-primary emitted with default guard, base.css consumes var(--color-primary) with no literal hex, layout loads base.css after css-variables, en.default.schema.json strict-parses)"
        status: pass
    human_judgment: false
  - id: D2
    description: "scripts/check-tokens.mjs — executable DESIGN-02: 9 rules, passes clean on the current tree, fails each seeded negative case"
    requirement: DESIGN-02
    verification:
      - kind: integration
        ref: "node scripts/check-tokens.mjs (exit 0, 14 style chunks / 17 custom props / 7 schema ids)"
        status: pass
      - kind: integration
        ref: "negative: literal colour appended to assets/base.css -> exit != 0"
        status: pass
      - kind: integration
        ref: "negative: var(--color-nope) appended to assets/base.css -> exit != 0"
        status: pass
      - kind: integration
        ref: "negative: `| default:` stripped from --color-primary in css-variables.liquid -> exit != 0"
        status: pass
      - kind: integration
        ref: "negative: css-variables.liquid points at settings.color_bogus_xyz -> exit != 0"
        status: pass
      - kind: integration
        ref: "negative: assets/*.css hidden so scan finds nothing -> exit != 0"
        status: pass
    human_judgment: false
  - id: D3
    description: "assets/base.css exists, references var(--*) only, no literal hex / font-family name / reset re-declaration"
    requirement: DESIGN-03
    verification:
      - kind: integration
        ref: "node scripts/check-tokens.mjs (scans assets/**/*.css) + shopify theme check"
        status: pass
    human_judgment: false
  - id: D4
    description: "npm run lint and the required CI Theme Check (gate) step both run all three Node checkers (tokens, allowlist, secrets) — closes T-01-12"
    requirement: DESIGN-02
    verification:
      - kind: integration
        ref: "npm run lint (exit 0, all four checks reported)"
        status: pass
      - kind: unit
        ref: "node -e (ci.yml contains all three check-*.mjs + `shopify theme check --fail-level error`; job key `theme-check` and name `Theme Check` unchanged)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Rendered <head> visually shows --color-primary: #0F6E56 in an inline style block and link text renders green"
    verification: []
    human_judgment: true
    rationale: "Deferred to end-of-phase review per workflow.human_verify_mode=end-of-phase. Requires shopify theme dev + browser inspection; the tracer's automated <verify> asserts the code path but not the rendered pixel."

duration: ~50min
completed: 2026-09-09
status: complete
---

# Phase 2 Plan 1: Sistema de diseño por tokens — proven token path + executable DESIGN-02 Summary

**The primary brand green (#0F6E56) now flows schema-default -> Liquid custom property (with `| default:` guard) -> `assets/base.css` rule -> layout load, and `scripts/check-tokens.mjs` (9 rules) enforces the rebrand-is-a-token-change contract on a laptop and in the required CI gate.**

## Performance

- **Duration:** ~50 min across 2 sessions (Task 1 in a prior session that hit a rate limit mid-Task-2; Tasks 2-3 + close-out in this resume, ~15 min)
- **Started:** 2026-09-08 (Task 1) / resumed 2026-09-09T12:20Z
- **Completed:** 2026-09-09T12:38Z
- **Tasks:** 3
- **Files modified:** 11 (2 created, 9 modified)

## Accomplishments

- **Token path proven end to end** on one real colour (Task 1, already committed `e69ba86`): `config/settings_schema.json` `color_primary` `#0F6E56` -> `snippets/css-variables.liquid` `--color-primary: {{ settings.color_primary | default: '#0F6E56' }}` -> `assets/base.css` `a { color: var(--color-primary) }` -> loaded by `layout/theme.liquid` after `critical.css`. `theme_info` stays element 0; `locales/en.default.schema.json` trailing comma fixed for strict `JSON.parse`.
- **`scripts/check-tokens.mjs` written and validated** — the executable copy of DESIGN-02, 9 rules, Node stdlib only, mirroring `check-allowlist.mjs` house style. Passes clean on the current tree; fails every seeded negative case.
- **Enforcement everywhere the Phase-1 checkers run** — `npm run lint` chain and the required CI `Theme Check (gate)` step now run all three Node checkers (`check-tokens`, `check-allowlist`, `check-secrets`) right after the theme linter. This closes the Phase-1 residual **T-01-12** (the two Node checkers were laptop-only).
- **`.gitattributes`** pins `locales/*.json` and `config/*.json` to `eol=lf` and marks `assets/*.woff2 binary` — Windows BOM/CRLF hazard mitigation for plan 02-04's locale work.
- **Ledgers updated** — `OVERRIDES.md` has a `## Archivos modificados` row for each of the 7 files this plan edited plus `## Archivos nuevos` rows for `assets/base.css` and `scripts/check-tokens.mjs`, and a new `## Reglas` line (a literal colour value may live only in the schema and the token emitter — D-02, D-17).

## Task Commits

1. **Task 1: End-to-end tracer — one token only** — `e69ba86` (feat) — *committed in the prior session, re-verified green here, not re-executed*
2. **Task 2: Write check-tokens.mjs** — `2c9a0a3` (feat)
3. **Task 3: Wire the checker into the lint chain and the required CI gate** — `5173eaa` (chore)

**Plan metadata:** _(this SUMMARY commit)_

## Files Created/Modified

- `scripts/check-tokens.mjs` — **created** (Task 2). 371 lines, ~13.9 KB. Node stdlib (`node:fs`, `node:path`, `node:url`) only.
- `assets/base.css` — created (Task 1). Header comment + one tracer rule.
- `config/settings_schema.json` — `t:general.colors` gains a `t:settings.colors.brand` header + `color_primary` `#0F6E56` (Task 1).
- `snippets/css-variables.liquid` — emits `--color-primary` with `| default:`; `| default:` guards added to `--color-background` / `--color-foreground` (Task 1).
- `layout/theme.liquid` — loads `base.css` via `stylesheet_tag` after `critical.css`, no preload (Task 1).
- `locales/en.default.schema.json` — trailing comma removed; 3 `settings.colors.*` keys in Spanish (Task 1).
- `ALLOWLIST.md` — `## Renderiza` row for `assets/base.css` (Task 1).
- `package.json` — `lint` chain `+= && node scripts/check-tokens.mjs`; new `lint:tokens` script (Task 3).
- `.github/workflows/ci.yml` — `Theme Check (gate)` `run:` block runs the 3 Node checkers after `shopify theme check`; KINELIA comment records T-01-12 closure; job key/name frozen (Task 3).
- `.gitattributes` — `locales/*.json` + `config/*.json` `text eol=lf`; `assets/*.woff2 binary` (Task 3).
- `OVERRIDES.md` — modificados/nuevos rows + Reglas line (Task 3).

## check-tokens.mjs — reference for plans 02-02 .. 02-04

**Exported constants (verbatim):**

```js
export const ALLOWED_FILES = new Set([
  "snippets/css-variables.liquid",
  "config/settings_schema.json",
  "config/settings_data.json",
]);

export const EXEMPT_FILES = new Set(["sections/hello-world.liquid"]);
```

- **ALLOWED_FILES** — the only files where a literal colour value or a brand font-family name is legitimate (D-17). Colour-literal, font-name, forbidden-declaration checks skip these.
- **EXEMPT_FILES** — `sections/hello-world.liquid` only: the de-referenced starter demo section filed under "Presente, no renderiza" in `ALLOWLIST.md`. All per-chunk checks (including undefined-property) skip it.

**Scan set:** every `.css` under `assets/`, plus every `{% style %}` / `{% stylesheet %}` block and every `style="..."` attribute value in `sections/`, `blocks/`, `snippets/`, `layout/`, `templates/`. CSS block comments and both Liquid comment forms (`{% comment %}`, `{% # %}`) are stripped from every chunk before any pattern is applied.

**The 9 checks and their failure messages (Spanish, `x `-prefixed):**

| # | Check | Fails when | Message shape |
|---|-------|-----------|---------------|
| 1 | Colour-literal drift | `#rgb` / `#rrggbb` / `#rrggbbaa` in a scanned chunk not in ALLOWED/EXEMPT. Regex `HEX = /#(?:[0-9a-fA-F]{2}){3,4}\b|#[0-9a-fA-F]{3}\b/` | `<file>: contiene un valor de color literal — solo <emitter> y <schema> pueden (D-02, D-17)` |
| 2 | Brand font-family drift | `"DM Sans"` or `Inter` (lookaround-guarded) in a scanned chunk not in ALLOWED/EXEMPT. Regex `FONT_NAME = /"?DM Sans"?|(?<![A-Za-z-])"?Inter"?(?![A-Za-z-])/i` | `<file>: contiene un nombre de familia de marca literal — usa var(--font-*) (D-02, D-05)` |
| 3 | Schema-reference integrity + injection guard | a `settings.<id>` in `css-variables.liquid` has no id in `settings_schema.json`, OR its type is not value-constrained (`CONSTRAINED_TYPES = color, color_background, select, radio, range, checkbox, font_picker`) | `<emitter>: referencia settings.<id>, que no existe en <schema>` / `<emitter>: settings.<id> es de tipo "<type>" — solo un picker de valor acotado puede interpolarse ... (inyeccion)` |
| 4 | Fallback guard | a `--color-*` decl in `css-variables.liquid` interpolates `{{ ... settings. ... }}` without `\| default:` | `<emitter>: <name> interpola un setting sin filtro Liquid "\| default:" ... (Pitfall 4)` |
| 5 | Undefined custom property | a `var(--x)` (any scanned file except EXEMPT) whose name is defined in no scanned chunk (emitter root block or same-file local, incl. inline `style=`) | `<file>: usa var(--x) pero ningun archivo define --x` |
| 6 | Forbidden declarations | in a scanned rule outside EXEMPT: `box-shadow:` (D-11), `linear/radial/conic-gradient(` (D-11), `text-align: justify` (D-07), `text-transform: uppercase` outside a selector matching `label-eyebrow` (D-07) | `<file>: "<selector>" usa box-shadow ...` etc. |
| 7 | Third-party font host | `fonts.googleapis.com` / `fonts.gstatic.com` / `use.typekit.` / `typekit.net` anywhere under `layout/`, `snippets/`, `assets/`. Shopify's own `fonts.shopifycdn.com` is NOT flagged. | `<file>: referencia un host de fuentes de terceros (Google Fonts / Typekit) ... (D-08)` |
| 8 | Locale structural sanity | `locales/` has != 1 `*.default.json`; that file or its `.default.schema.json` sibling missing; either fails strict `JSON.parse`; either starts with U+FEFF BOM. (No language/key assertions — deferred to 02-04.) | `locales/: se esperaba exactamente un *.default.json, hay N` / `locales/<f>: no parsea como JSON estricto (...)` / `locales/<f>: empieza con un byte-order mark (U+FEFF)` |
| 9 | Empty scan (backstop) | zero `.css` files found under `assets/` | `assets/: no se encontro ningun archivo .css — un scan vacio no puede reportar exito` |

On failure: one `x <line>` per violation, then `check-tokens: N violacion(es).`, then `process.exitCode = 1; return;` (never `process.exit()` — Windows event-loop drain). On success: `check-tokens: OK — <N> chunk(s) de estilo inspeccionados, <M> custom properties definidos, <K> settings ids en el schema.`

**Negative cases proven (all made the checker exit != 0):**
1. literal colour `#ABCDEF` appended to `assets/base.css` (rule 1)
2. `var(--color-nope)` appended to `assets/base.css` (rule 5)
3. `| default:` stripped from `--color-primary` in `css-variables.liquid` (rule 4)
4. `css-variables.liquid` pointed at `settings.color_bogus_xyz` (rule 3)
5. `assets/*.css` hidden so the scan finds nothing (rule 9)

**Clean-tree baseline:** 14 style chunks, 17 custom properties defined, 7 schema ids.

**Final lint chain string (`package.json` `scripts.lint`):**

```
shopify theme check --fail-level error && node scripts/check-allowlist.mjs && node scripts/check-secrets.mjs && node scripts/check-tokens.mjs
```

**CI `Theme Check (gate)` step `run:` order:** `npm install -g @shopify/cli` -> `shopify theme check --fail-level error` -> `node scripts/check-tokens.mjs` -> `node scripts/check-allowlist.mjs` -> `node scripts/check-secrets.mjs`.

## Decisions Made

- **`CONSTRAINED_TYPES` is broader than the plan's literal "colour picker, select or range".** It also admits `color_background`, `radio`, `checkbox` and `font_picker` — all value-constrained input types that cannot close a `<style>` element. `font_picker` MUST be admitted: `css-variables.liquid` still references `settings.type_primary_font` (a `font_picker`) until plan 02-02 removes it, so a stricter set would fail the checker on today's tree. The file carries an inline comment explaining this and naming 02-02 as the removal point. The must_haves truth ("fails when ... input type is free text rather than a constrained picker") is satisfied — `text` / `textarea` / `richtext` / `html` / `url` are all rejected.
- **Existing CRLF JSON files are not renormalised.** `git ls-files --eol` now reports `attr/text eol=lf` for `locales/en.default.*` and `config/settings_*.json`, but the index and working tree stay CRLF until the files are next written. `check-tokens.mjs`'s strict parse is CRLF-agnostic; only a BOM fails it. Plan 02-04 rewrites the locale files LF/no-BOM.
- **Plan task boundaries were followed over the resume prompt's phrasing.** The resume prompt described `package.json` / `ci.yml` / `.gitattributes` as "the rest of Task 2"; the PLAN puts them in Task 3 (with `OVERRIDES.md`). Task 3's `<verify>` and `<action>` are self-consistent for that grouping, so Task 2 committed `check-tokens.mjs` alone and Task 3 committed the four wiring/ledger files. End state is identical.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed a literal U+FEFF byte-order-mark character from `scripts/check-tokens.mjs`**
- **Found during:** Task 2 (validating the uncommitted WIP against the spec)
- **Issue:** Line 346 contained a raw U+FEFF character embedded in the BOM-strip regex `raw.replace(/^<BOM>/, "")`. An injection/anomaly scan flagged it as invisible-unicode, and it violates the Kinelia convention of strict UTF-8 no-BOM source. The regex was also a no-op after the char (it still stripped nothing useful in the common path).
- **Fix:** Replaced the whole expression with `JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw)` — explicit, BOM-aware, no invisible characters. The separate `charCodeAt(0) === 0xfeff` violation-push above it is unchanged, so a BOM'd locale file still fails the check AND is reported.
- **Files modified:** `scripts/check-tokens.mjs`
- **Verification:** full non-ASCII/invisible-char scan of the file returns zero hits; `node scripts/check-tokens.mjs` exits 0; locale strict-parse still works.
- **Committed in:** `2c9a0a3` (Task 2 commit)

**2. [Rule 3 - Blocking] Task 1's `OVERRIDES.md` note was never written — folded into Task 3**
- **Found during:** Task 3 (reading `OVERRIDES.md` for the modificados/nuevos rows)
- **Issue:** Task 1's `<action>` said to add a `# KINELIA:` note to `OVERRIDES.md` for `config/settings_schema.json`, but commit `e69ba86` did not touch `OVERRIDES.md` (6 files, none of them the ledger). Task 1 is committed and must not be re-executed.
- **Fix:** Task 3 already owns `OVERRIDES.md` and its action lists rows for `config/settings_schema.json`, `snippets/css-variables.liquid`, `layout/theme.liquid` and `locales/en.default.schema.json` — the Task-1 files. All of them plus the Task-3 files are now recorded in one place, in Task 3's commit. Net ledger state is complete and correct.
- **Files modified:** `OVERRIDES.md`
- **Verification:** `grep -q 'check-tokens' OVERRIDES.md && grep -q 'base.css' OVERRIDES.md` pass; every file this plan touched has a row.
- **Committed in:** `5173eaa` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking). **Impact:** Both were necessary for correctness/hygiene. No scope creep — no new tokens, no typography, no fonts, no locale rename; the narrow tracer scope held.

## Issues Encountered

- The literal BOM in the WIP script could not be edited away with the `Edit` tool (the invisible char round-tripped identically in `old_string`/`new_string`). Resolved with a small Node rewrite via Bash, then a normal `Edit` for the final expression. Not a Windows-specific tooling failure — no `.planning/WINDOWS.md` entry warranted.

## User Setup Required

None — no external service configuration required. (CI changes take effect on the next push/PR; no secrets or dashboard config added.)

## Next Phase Readiness

- **Ready for plan 02-02** (typography + the other 9 colour families + spacing/radius + `font_picker` -> `select` swap + `theme.liquid` head font block). 02-02 must remove `settings.type_primary_font` from `css-variables.liquid` AND the head block in `layout/theme.liquid` in the same change (Pitfall 1), and can then tighten `CONSTRAINED_TYPES` to drop `font_picker` if desired.
- `check-tokens.mjs` is extension-ready: rules 6 (forbidden declarations) and 8 (locale) are where 02-02/02-04 will add assertions. `REQUIRED_STOREFRONT_KEYS` (legal legend + 6 CTAs + root promise) is deliberately absent — plan 02-04 adds it with the Spanish locale.
- T-01-12 is closed; `01-SECURITY.md` still lists it as a carried-forward follow-up — a doc-only status update for whoever runs the Phase-1 audit reconciliation.

## Self-Check: PASSED

- `scripts/check-tokens.mjs` exists on disk — FOUND
- `assets/base.css` exists on disk — FOUND
- Commit `e69ba86` (Task 1) — FOUND in `git log`
- Commit `2c9a0a3` (Task 2) — FOUND in `git log`
- Commit `5173eaa` (Task 3) — FOUND in `git log`
- `npm run lint` — exits 0, runs theme linter + check-allowlist + check-secrets + check-tokens
- `shopify theme check --fail-level error` — 42 files, no offenses
- `node scripts/check-tokens.mjs` — exits 0 (14 chunks / 17 props / 7 ids); 5 negative cases each exit != 0

---
*Phase: 02-sistema-de-diseno-por-tokens*
*Completed: 2026-09-09*
