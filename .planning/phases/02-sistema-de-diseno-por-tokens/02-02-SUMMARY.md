---
phase: 02-sistema-de-diseno-por-tokens
plan: 02
subsystem: ui
tags: [design-tokens, shopify-theme, settings-schema, css-custom-properties, liquid, typography, token-rename]

requires:
  - phase: 02-sistema-de-diseno-por-tokens
    provides: "02-01: proven token path (schema default -> css-variables.liquid custom property with | default: guard -> var(--*) consumer -> layout load order); scripts/check-tokens.mjs (9 rules, rule 5 = undefined-property gate for renames)"
provides:
  - "Complete Kinelia brand settings surface in config/settings_schema.json: 10 colour settings (6 primary + 4 support) + 2 type-family selects (font_heading / font_body) + clamped input_corner_radius (max/default 2)"
  - "snippets/css-variables.liquid emits the whole token vocabulary from one file: 10 colour tokens + --color-border, --font-heading/--font-body + 3 weight tokens, static --space-1..8 base-4 scale, --radius/--radius-none, --icon-stroke-width, --page-width/--page-margin (all guarded)"
  - "Skeleton -> Kinelia token rename complete: --color-background -> --color-bg, --color-foreground -> --color-text, --font-primary--family -> --font-body, --style-border-radius-inputs -> --radius, across critical.css + header.liquid + footer.liquid"
  - "Starter font-library plumbing removed: font_picker type_primary_font gone from schema, font_face/font_url calls gone from emitter, head font block gone from layout/theme.liquid (no more empty preload risk)"
  - "Four Phase-2 deviations recorded in OVERRIDES.md; post-launch token-ownership rule in OVERRIDES.md + docs/RELEASE.md"
affects: [02-03, 02-04, "any later phase adding component CSS or consuming brand tokens"]

actuals:
  tokens: 8200
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Whole token vocabulary (editor-tunable colour/type + static spacing/radius) emitted from one file — DESIGN-02 holds for spacing exactly as for colour"
    - "Constrained editor controls: input_corner_radius max clamped to the brand ceiling so the flat system cannot be broken from the theme editor (D-10)"
    - "Token rename guarded by check-tokens.mjs rule 5 (undefined custom property) — an incomplete rename cannot be committed"

key-files:
  created:
    - ".planning/phases/02-sistema-de-diseno-por-tokens/02-02-SUMMARY.md"
  modified:
    - "config/settings_schema.json (Task 1)"
    - "locales/en.default.schema.json (Task 1)"
    - "snippets/css-variables.liquid (Task 2)"
    - "layout/theme.liquid (Task 2)"
    - "assets/critical.css (Task 3)"
    - "sections/header.liquid (Task 3)"
    - "sections/footer.liquid (Task 3)"
    - "OVERRIDES.md (Task 3)"
    - "docs/RELEASE.md (Task 3)"

key-decisions:
  - "Spacing scale + radius emitted as static custom properties in css-variables.liquid, NOT settings_schema.json settings — deliberate deviation from ROADMAP Phase 2 SC#1 literal wording; only colour + typography are editor-tunable (RQ-1, recorded in OVERRIDES.md)"
  - "Token rename with no alias layer — one concept, one name, every consumer updated in the same plan (RQ-2)"
  - "Two type families are select settings with one brand option each, not font_picker — self-hosting (02-03) rules out the Shopify Font Library object (D-18)"
  - "Starter head font block removed in Phase 2, not deferred to 02-03 — leaving it would ship an empty <link rel=preload href=''> on every page once the schema setting went away (Pitfall 1)"
  - "check-tokens.mjs NOT modified — CONSTRAINED_TYPES still admits font_picker; harmless now that no setting uses it, and the file is out of this plan's scope"

patterns-established:
  - "One file answers 'where does the Kinelia brand live': colour + type as editor settings, spacing + radius as static props, all in snippets/css-variables.liquid"
  - "Every brand colour token interpolates its setting through a Liquid | default: '#hex' fallback (Pitfall 4) — no colour literal outside a fallback filter"
  - "Editor range controls are clamped to brand ceilings so a merchant cannot express a brand-rule violation (input_corner_radius max 2 — D-10)"

requirements-completed: [DESIGN-01, DESIGN-02]

coverage:
  - id: D1
    description: "All ten Kinelia brand colours are theme-editor settings with the verbatim Brand Book hex as default, and each reaches the page as a CSS custom property"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "shopify theme check --fail-level error"
        status: pass
      - kind: integration
        ref: "node -e (Task 1 assertion: 10 color settings present, type=color, default == verbatim hex; background_color/foreground_color/type_primary_font gone; no #FFFFFF in schema)"
        status: pass
      - kind: integration
        ref: "node -e (Task 2 assertion: all 29 named tokens emitted with ':' in css-variables.liquid)"
        status: pass
    human_judgment: false
  - id: D2
    description: "Two brand type families are chosen through a constrained select (fixed options), not a font library"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "node -e (Task 1 assertion: font_heading + font_body exist as type=select)"
        status: pass
      - kind: integration
        ref: "node -e (Task 2 assertion: --font-heading + --font-body emitted; emitter reads no type_primary_font)"
        status: pass
    human_judgment: false
  - id: D3
    description: "Spacing scale, corner radius and the absence of an elevation token are emitted from the same single file as the colours"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "node -e (Task 2 assertion: --space-1..8, --radius, --radius-none emitted; no box-shadow/linear-gradient/radial-gradient in emitter)"
        status: pass
    human_judgment: false
  - id: D4
    description: "A merchant cannot break the flat visual system from the theme editor — corner-radius control clamped to the brand maximum"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "node -e (Task 1 assertion: input_corner_radius max === 2 && default === 2)"
        status: pass
    human_judgment: false
  - id: D5
    description: "Restricted-use terracota rule, no-pure-white rule and one-support-colour-per-piece rule are written into the token file"
    requirement: DESIGN-02
    verification:
      - kind: manual_procedural
        ref: "snippets/css-variables.liquid header comment block (D-01, D-03, D-04, D-11) + inline D-01/D-03/D-13 notes"
        status: pass
    human_judgment: false
  - id: D6
    description: "Every file that consumed a starter token name now consumes the Kinelia name; nothing references a custom property that no longer exists"
    requirement: DESIGN-02
    verification:
      - kind: integration
        ref: "node scripts/check-tokens.mjs (rule 5 undefined custom property — exit 0)"
        status: pass
      - kind: integration
        ref: "node -e (Task 3 assertion: 6 retired token names absent from 6 candidate files with comments stripped; critical.css consumes var(--color-bg/--color-text/--font-body/--radius); grid props unchanged)"
        status: pass
    human_judgment: false
  - id: D7
    description: "The layout no longer reaches for a font object the schema no longer defines — no page ships a broken preload link"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "node -e (Task 2 assertion: layout/theme.liquid contains no type_primary_font / font_url / shopifycdn; still renders css-variables + loads critical.css + base.css)"
        status: pass
    human_judgment: false
  - id: D8
    description: "Post-launch token-change ownership (editor save vs settings_data.json PR) and the ROADMAP SC#1 spacing deviation are written down, not left silent"
    requirement: DESIGN-02
    verification:
      - kind: manual_procedural
        ref: "OVERRIDES.md 'Divergencias de la Fase 2' (4 deviations, SC#1 literal wording quoted) + Reglas line; docs/RELEASE.md 'Tokens de marca después del lanzamiento' cross-referencing OVERRIDES.md"
        status: pass
    human_judgment: false
  - id: D9
    description: "Rendered <head> inline <style> actually shows the ten brand colour custom properties and the theme renders in system-fallback fonts (intended intermediate state before 02-03)"
    verification: []
    human_judgment: true
    rationale: "Requires shopify theme dev + browser inspection; deferred to end-of-phase review per workflow.human_verify_mode=end-of-phase. The automated <verify> asserts the code path, not the rendered pixel."

duration: 6min
completed: 2026-09-09
status: complete
---

# Phase 2 Plan 2: Sistema de diseño por tokens — full token surface + Skeleton→Kinelia rename Summary

**The whole Kinelia brand vocabulary now lives in one file: ten colour settings + two type-family selects as editor controls, a static base-4 spacing scale + clamped radius as custom properties, and the starter's `background`/`foreground`/`font-primary` token names are gone from every consumer — replaced by `bg`/`text`/`font-body`/`radius`, guarded by check-tokens rule 5.**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-09-09T12:54:21Z
- **Completed:** 2026-09-09T13:00:01Z
- **Tasks:** 3
- **Files modified:** 9 (0 created besides this SUMMARY)

## Accomplishments

- **Complete brand settings surface** (`config/settings_schema.json`): the `t:general.colors` group now carries all ten brand colours — `color_primary` `#0F6E56`, `color_primary_soft` `#9FE1CB`, `color_accent` `#D85A30`, `color_bg` `#F1EFE8`, `color_text` `#2C2C2A`, `color_text_muted` `#5F5E5A`, and the support quad `color_edu` `#24566E`, `color_edu_soft` `#CBDDE6`, `color_community` `#54487A`, `color_community_soft` `#DDD7E8` — each a `color` input with the verbatim Brand Book hex as its default. `background_color` (`#FFFFFF`, D-03 violation) and `foreground_color` removed. `type_primary_font` (`font_picker`) replaced by `font_heading` / `font_body` `select`s. `input_corner_radius` `max`/`default` clamped `10/4` → `2/2` (D-10, Pitfall 8). `theme_info` still element 0.
- **Spanish editor labels** for every new `t:` key in `locales/en.default.schema.json`, including the accent restricted-use warning ("solo el precio") and the never-pure-white warning.
- **Single token emitter** (`snippets/css-variables.liquid`): one `:root` block emits the whole vocabulary — 10 colour tokens + derived `--color-border`, `--font-heading`/`--font-body` (system fallback stack, brand faces arrive in 02-03) + `--font-weight-regular/medium/semibold`, static `--space-1..8` (4/8/12/16/24/32/48/64px), `--radius`/`--radius-none`, `--icon-stroke-width` `1.5px`, and `--page-width`/`--page-margin` (now with `| default:` guards). Every colour token pipes `| default: '#hex'`. Brand rules D-01/D-03/D-04/D-11 written in as comments. The four `font_face` filter calls and the family/style/weight props that read the deleted `font_picker` are gone.
- **Starter head font block removed** from `layout/theme.liquid` — the `{% unless settings.type_primary_font.system? %}` block (preconnect + `font_url`-derived preload) that would ship an empty `<link rel=preload href="">` on every page once the schema setting disappeared (Pitfall 1). Replaced by a KINELIA comment; self-hosted faces + preloads land in 02-03.
- **Token rename complete** across `assets/critical.css` (lines 34/38/43/44/76/77/78), `sections/header.liquid` and `sections/footer.liquid`: `--color-background` → `--color-bg`, `--color-foreground` → `--color-text`, `--font-primary--family` → `--font-body`, `--style-border-radius-inputs` → `--radius`. Section-scoped grid props (`--content-width` etc.) and page geometry untouched. `check-tokens.mjs` rule 5 green — no consumer points at a property nothing defines.
- **Deviations on the record** — `OVERRIDES.md` gains a "Divergencias de la Fase 2" subsection (the 4 named deviations with rationale, ROADMAP SC#1 literal wording quoted) and a `## Reglas` line on post-launch token ownership; `docs/RELEASE.md` gains a matching "Tokens de marca después del lanzamiento" paragraph cross-referencing the ledger.

## Task Commits

1. **Task 1: Complete the brand settings surface + editor labels** — `d4582e8` (feat)
2. **Task 2: Emit the full token vocabulary, cut the starter font plumbing** — `f2a2fe5` (feat)
3. **Task 3: Move every consumer onto Kinelia token names, record deviations** — `4ed4e36` (refactor)

**Plan metadata:** _(this SUMMARY commit)_

## Final token list as emitted (with fallback values)

| Token | Value / fallback | Source |
|-------|------------------|--------|
| `--font-heading` | `{{ settings.font_heading \| default: 'DM Sans' }}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | select `font_heading` |
| `--font-body` | `{{ settings.font_body \| default: 'Inter' }}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` | select `font_body` |
| `--font-weight-regular` | `400` | static |
| `--font-weight-medium` | `500` | static |
| `--font-weight-semibold` | `600` | static |
| `--color-primary` | `{{ settings.color_primary \| default: '#0F6E56' }}` | color `color_primary` |
| `--color-primary-soft` | `{{ settings.color_primary_soft \| default: '#9FE1CB' }}` | color `color_primary_soft` |
| `--color-accent` | `{{ settings.color_accent \| default: '#D85A30' }}` | color `color_accent` — RESTRICTED (D-01: price only) |
| `--color-bg` | `{{ settings.color_bg \| default: '#F1EFE8' }}` | color `color_bg` (D-03: never pure white) |
| `--color-text` | `{{ settings.color_text \| default: '#2C2C2A' }}` | color `color_text` |
| `--color-text-muted` | `{{ settings.color_text_muted \| default: '#5F5E5A' }}` | color `color_text_muted` |
| `--color-border` | `{{ settings.color_text_muted \| default: '#5F5E5A' }}` | derived from `color_text_muted` (D-13) |
| `--color-edu` | `{{ settings.color_edu \| default: '#24566E' }}` | color `color_edu` |
| `--color-edu-soft` | `{{ settings.color_edu_soft \| default: '#CBDDE6' }}` | color `color_edu_soft` |
| `--color-community` | `{{ settings.color_community \| default: '#54487A' }}` | color `color_community` |
| `--color-community-soft` | `{{ settings.color_community_soft \| default: '#DDD7E8' }}` | color `color_community_soft` |
| `--space-1` .. `--space-8` | `4px / 8px / 12px / 16px / 24px / 32px / 48px / 64px` | static (D-09) |
| `--radius` | `{{ settings.input_corner_radius \| default: 2 }}px` | range `input_corner_radius` (clamped max 2) |
| `--radius-none` | `0` | static (D-10 badges) |
| `--icon-stroke-width` | `1.5px` | static |
| `--page-width` | `{{ settings.max_page_width \| default: '90rem' }}` | select `max_page_width` |
| `--page-margin` | `{{ settings.min_page_margin \| default: 20 }}px` | range `min_page_margin` |

## Rename table (old → new)

| Retired starter token | Kinelia token | Consumers updated |
|-----------------------|---------------|-------------------|
| `--color-background` | `--color-bg` | `assets/critical.css` (38, 43, 77) |
| `--color-foreground` | `--color-text` | `assets/critical.css` (44, 78), `sections/header.liquid` (39), `sections/footer.liquid` (31) |
| `--font-primary--family` | `--font-body` | `assets/critical.css` (76) |
| `--font-primary--style` | _(removed, unconsumed)_ | — |
| `--font-primary--weight` | _(removed, unconsumed)_ | — |
| `--style-border-radius-inputs` | `--radius` | `assets/critical.css` (34) |

**Retired theme settings:** `background_color`, `foreground_color`, `type_primary_font`.
**New theme settings:** `color_primary_soft`, `color_accent`, `color_bg`, `color_text`, `color_text_muted`, `color_edu`, `color_edu_soft`, `color_community`, `color_community_soft`, `font_heading`, `font_body`.

## The four deviations recorded in OVERRIDES.md

1. **Token rename, no alias layer** — starter `background`/`foreground`/`font-primary`/`input-radius` vocabulary replaced across all three consuming files (`critical.css`, `header.liquid`, `footer.liquid`) in one plan. check-tokens rule 5 makes an incomplete rename un-committable.
2. **Spacing + radius as static properties, not editor settings** — deliberate deviation from ROADMAP Phase 2 SC#1 ("Tokens de marca (color, tipografía, **espaciado**) en `settings_schema.json`"). Colour + typography are merchant-tunable; a spacing scale is not, and eight range inputs is bad editor UX. DESIGN-02 holds because the scale lives in the same single token file. The corner radius stays a range input but is clamped to the brand ceiling (D-10).
3. **Fixed `select` type families instead of `font_picker`** — self-hosting (02-03) means the Shopify Font Library object and its filters do not apply (D-18).
4. **The layout head edit as a scoped pre-empt of Phase 3** — removing the starter font block in Phase 2 was not optional: leaving it ships an empty preload link on every page the moment the schema setting goes away (Pitfall 1).

## Decisions Made

- **`scripts/check-tokens.mjs` left untouched.** Its `CONSTRAINED_TYPES` still admits `font_picker`. It is out of this plan's `files_modified` scope, and admitting a type no setting uses is harmless (all admitted types are value-constrained). The upstream note allowed tightening "if the plan/research says so" — the plan does not instruct it.
- **Comment discipline:** multi-line brand-rule notes use `{% comment %}` blocks; single-line inline notes use `{% # %}`. Both are stripped by check-tokens and by every task's verify regex before assertions run.

## Deviations from Plan

None — plan executed exactly as written. The four items in "The four deviations recorded in OVERRIDES.md" above are the plan's own decided deviations from the *starter* and the *ROADMAP literal wording* (RQ-1, RQ-2, D-18, ordering note in `<decisions>`), implemented as specified — not deviations from this plan.

## Issues Encountered

None. All three task `<verify>` blocks passed on first run; `npm run lint` green after Task 3; no Windows tooling issues (Write/Edit only, no PowerShell). `config/settings_schema.json` and `locales/en.default.schema.json` were rewritten LF (git reported "CRLF will be replaced by LF" per the `.gitattributes` `config/*.json` / `locales/*.json` `eol=lf` pin from 02-01) — expected, inflates the two files' diff line counts.

## User Setup Required

None — no external service configuration. (The removed `type_primary_font` / `background_color` / `foreground_color` settings would linger as dead keys in `config/settings_data.json` only on a store that had already saved theme settings; Kinelia's `settings_data.json` is still `{}` and the store is password-protected until Phase 14, so the cost is zero.)

## Next Phase Readiness

- **Ready for plan 02-03** (self-hosted DM Sans + Inter WOFF2, `@font-face` in `css-variables.liquid`, preload in `theme.liquid`, and `base.css` design primitives). The token vocabulary 02-03 consumes is fully emitted and enumerated in the token table above — no value needs re-deriving. Between this plan and 02-03 the theme renders in the system fallback stack; that is the intended intermediate state.
- `--font-heading` / `--font-body` currently resolve to the system stack (the `'DM Sans'` / `'Inter'` fallback strings are emitted but no `@font-face` backs them yet). 02-03 adds the faces.
- `check-tokens.mjs` rule 6 (forbidden declarations) and rule 8 (locale) are the extension points for 02-03 `base.css` primitives and 02-04 locale work respectively.

## Self-Check: PASSED

- `.planning/phases/02-sistema-de-diseno-por-tokens/02-02-SUMMARY.md` — will exist on commit
- Commit `d4582e8` (Task 1) — FOUND in `git log`
- Commit `f2a2fe5` (Task 2) — FOUND in `git log`
- Commit `4ed4e36` (Task 3) — FOUND in `git log`
- `npm run lint` — exits 0 (theme check 42 files no offenses + check-allowlist + check-secrets + check-tokens: 14 chunks / 37 custom properties / 15 schema ids)
- `node scripts/check-tokens.mjs` — exits 0
- `git status --porcelain | grep '^ D'` — no output (no deleted files)

---
*Phase: 02-sistema-de-diseno-por-tokens*
*Completed: 2026-09-09*
