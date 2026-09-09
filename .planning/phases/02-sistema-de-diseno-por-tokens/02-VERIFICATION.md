---
phase: 02-sistema-de-diseno-por-tokens
verified: 2026-09-09T00:00:00Z
status: passed
score: 4/4 must-haves verified
behavior_unverified: 0
overrides_applied: 1
overrides:
  - must_have: "Los tokens de marca (color, tipografia, espaciado) estan en settings_schema.json y se emiten como custom properties CSS via css-variables.liquid"
    reason: "Spacing scale (--space-1..8) and corner-radius emitted as static custom properties in snippets/css-variables.liquid, not as theme-editor settings. Only colour and typography are merchant-tunable. Deliberate deviation from the literal wording of ROADMAP SC1 — recorded in OVERRIDES.md (plan 02-02, Divergencia 2) and the ROADMAP deviation note. The token file remains the single source of truth so DESIGN-02 holds for spacing exactly as for colour."
    accepted_by: "fhatzerian (OVERRIDES.md + ROADMAP.md)"
    accepted_at: "2026-09-08"
re_verification:
  previous_status: none
  note: "Initial verification. Human UAT (02-UAT.md) already ran: 19/19 pass, gap G-02-1 resolved as environment-only."
---

# Phase 2: Sistema de diseno por tokens — Verification Report

**Phase Goal:** Los tokens de la guia de marca viven en un solo lugar y todo el CSS de componentes los consume; un rebrand es un cambio de tokens, no de componentes.
**Verified:** 2026-09-09
**Status:** passed
**Re-verification:** No — initial verification (UAT already complete)

## Goal Achievement

### Observable Truths (ROADMAP Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Los tokens de marca (color, tipografia, espaciado) estan en `settings_schema.json` y se emiten como custom properties CSS via `css-variables.liquid` | ✓ PASSED (override) | `config/settings_schema.json` defines 10 `color` settings (color_primary #0F6E56 … color_community_soft #DDD7E8) + 2 `select` type families + `input_corner_radius` range (min 0 / max 2 / step 1). `snippets/css-variables.liquid` `:root` interpolates every `settings.color_*` / `settings.font_*` with a `\| default:` Liquid fallback and emits `--color-*`, `--font-*`, `--space-1..8`, `--radius`. Spacing/radii are static custom properties (accepted deviation — see overrides). |
| 2 | Cambiar un color o una fuente de marca se hace solo en tokens / theme settings, sin tocar CSS de componentes | ✓ VERIFIED | `scripts/check-tokens.mjs` (9 rules) runs green. Rule 5 (undefined-property) proves every `var(--*)` in `assets/base.css` / `assets/critical.css` / `sections/header.liquid` / `sections/footer.liquid` resolves to a token the emitter defines — a token rename cannot silently strip a component. Negative probe: an `assets/__probe.css` with `#abcdef` + `box-shadow` was rejected (exit 1) then clean again after removal. Rename `--color-foreground → --color-text` etc. applied in all 4 consumers (OVERRIDES.md rows 36-38). |
| 3 | Existe `base.css` con reset, escala tipografica, colores, espaciado, botones y primitivas de formulario, todo derivado de tokens | ✓ VERIFIED | `assets/base.css` (4.9 KB): body 1rem/1.5 from `--font-body`/`--color-bg`/`--color-text`; h1 2.5rem / h2 1.625rem / h3 1.25rem / caption .8125rem from `--font-heading`; `a` from `--color-primary`; `.button` = `--color-primary` bg + `--color-bg` text + `--radius`, `.button--on-primary` inverts; `input/select/textarea` + `:focus-visible` outline from `--color-border`/`--color-primary`; `.label-eyebrow` (sole uppercase); `.price` = `--color-accent` (sole accent use). Reset stays in `critical.css`, not re-declared. No hex, no font-name literal, no shadow/gradient (checker rules 1/2/6 green). |
| 4 | El locale es-AR (voseo) esta scaffoldeado y todo el texto de UI sale de archivos de locale | ✓ VERIFIED | `locales/` holds exactly `es.default.json` + `es.default.schema.json` (git R100 rename from `en.*`, commit 7f894f9 — history preserved). Voseo throughout ("Llegá", "consultá", "Sumá al carrito", "Seguí comprando", "Dejá una aclaración"). `kinelia` namespace: 6 CTAs + `promesa_raiz` + `legal_disclaimer` (checker rule 8c asserts all 8 resolve to non-empty strings; `_html` suffix on the legend forbidden). Schema locale fully translated to Spanish. `docs/BRAND-COPY.md` carries voice + 6 CTAs + prohibited claims (D-16 LOCKED). All rendered `sections/*.liquid` use `\| t` filters — only hardcoded strings are in the exempt, de-referenced `sections/hello-world.liquid`. |

**Score:** 4/4 truths verified (1 via accepted override)

### Plan-Level Must-Haves (spot-verified)

| Must-have | Status | Evidence |
|-----------|--------|----------|
| One brand colour travels the full token path + linter accepts | ✓ VERIFIED | `#0F6E56` : schema default → `settings.color_primary \| default: '#0F6E56'` → `--color-primary` → `a { color: var(--color-primary) }` in base.css, which `theme.liquid` loads via `stylesheet_tag` after `critical.css`. UAT Test 1 confirmed live render (`--color-primary` resolves to #0F6E56 in `<head>`, 11 `--color-*` properties). |
| Repeatable command fails on literal colour / brand font-family outside the 2 allowed files | ✓ VERIFIED | check-tokens rules 1-2; negative probe rejected as expected. |
| Command fails on schema-reference drift / free-text setting interpolation | ✓ VERIFIED | check-tokens rule 3 (`CONSTRAINED_TYPES` gate); 15 schema ids resolved. |
| Command fails on colour token without `\| default:` fallback | ✓ VERIFIED | check-tokens rule 4; every `--color-*` decl in emitter carries `\| default:`. |
| Command fails on `var(--x)` with no definition | ✓ VERIFIED | check-tokens rule 5; 37 custom properties defined, 0 undefined uses. |
| Command fails on shadow / gradient / justified / stray uppercase | ✓ VERIFIED | check-tokens rule 6; probe `box-shadow` rejected. |
| Command fails on third-party font host in layout/snippets/assets | ✓ VERIFIED | check-tokens rule 7 (`THIRD_PARTY_FONT_HOST` regex); 0 matches for googleapis/gstatic/typekit in code. |
| Same commands run in the PR gate, not only locally | ✓ VERIFIED | `.github/workflows/ci.yml` `Theme Check (gate)` step runs `check-tokens` + `check-allowlist` + `check-secrets` after `shopify theme check` (closes T-01-12). `package.json` `lint` chain includes all three. |
| Checker refuses to pass vacuously (empty-scan backstop) | ✓ VERIFIED | check-tokens rule 9: `cssFiles.length === 0` → violation. |
| hello-world.liquid exempted by name, pointing at ALLOWLIST | ✓ VERIFIED | `EXEMPT_FILES = Set(["sections/hello-world.liquid"])`; not referenced by any template; filed in ALLOWLIST.md "Presente, no renderiza". |
| 10 brand colours as editor settings with Brand Book hex | ✓ VERIFIED | settings_schema.json — verbatim defoaults #0F6E56 / #9FE1CB / #D85A30 / #F1EFE8 / #2C2C2A / #5F5E5A / #24566E / #CBDDE6 / #54487A / #DDD7E8. |
| 2 type families via constrained `select`, no font library | ✓ VERIFIED | `font_heading` / `font_body` `select`, one option each; starter `font_picker` `type_primary_font` removed; layout head font block removed (OVERRIDES row 31). |
| Merchant cannot break flat system — radius clamp | ✓ VERIFIED | `input_corner_radius` range min 0 / max 2 / step 1 / default 2. |
| Restricted-use rules written into the token file | ✓ VERIFIED | css-variables.liquid comment block: D-01 accent = price only, D-03 no pure white, D-04 one support colour per piece, D-11 no elevation. |
| 5 subset WOFF2 committed as binary, signature + size | ✓ VERIFIED | `assets/dm-sans-{400,500}.woff2` (17.9K/18.2K), `inter-{400,500,600}.woff2` (50.7K/52.3K/52.5K), git-tracked; provenance table in ALLOWLIST.md; UAT Test 14 confirmed wOF2 signature. |
| 5 @font-face + exactly 2 preloads, no external host | ✓ VERIFIED | 5 `@font-face` in css-variables.liquid (asset_url, font-display: swap, verbatim unicode-range); 2 `<link rel=preload as=font crossorigin>` in theme.liquid (dm-sans-500, inter-400). |
| Support palette has tokens but no consumer in base.css | ✓ VERIFIED | `--color-edu*` / `--color-community*` defined in emitter; `base.css` references neither. |
| Single default locale = Spanish; rename not deletion | ✓ VERIFIED | check-tokens rule 8b; git R100 rename (7f894f9); OVERRIDES row 33. |
| Prohibited-claims contract in a repo document | ✓ VERIFIED | `docs/BRAND-COPY.md` § "Claims prohibidos (D-16, LOCKED)". |
| Post-launch token-change ownership documented | ✓ VERIFIED | `docs/RELEASE.md` + OVERRIDES.md — editor save vs settings_data.json PR; SC1 spacing deviation recorded. |
| settings_data.json not hand-populated | ✓ VERIFIED | `config/settings_data.json` = `{ "current": {} }` with auto-generated header. |

### Key Link Verification

| From | To | Via | Status |
|------|-----|-----|--------|
| config/settings_schema.json | snippets/css-variables.liquid | `settings.color_primary` interpolated into `--color-primary` | ✓ WIRED |
| snippets/css-variables.liquid | assets/base.css | `var(--color-primary)` consumed by name | ✓ WIRED |
| layout/theme.liquid | assets/base.css | `{{ 'base.css' \| asset_url \| stylesheet_tag }}` after critical.css | ✓ WIRED |
| snippets/css-variables.liquid | assets/dm-sans-500.woff2 | `@font-face src: url(... \| asset_url)` | ✓ WIRED |
| layout/theme.liquid | assets/inter-400.woff2 | `<link rel=preload as=font>` first-paint weight | ✓ WIRED |
| package.json | scripts/check-tokens.mjs | `lint` chain `&& node scripts/check-tokens.mjs` | ✓ WIRED |
| .github/workflows/ci.yml | scripts/check-tokens.mjs | `Theme Check (gate)` step runs it in the required job | ✓ WIRED |
| config/settings_schema.json | locales/es.default.schema.json | every `t:` key resolves to a Spanish label | ✓ WIRED |
| scripts/check-tokens.mjs | locales/es.default.json | `REQUIRED_STOREFRONT_KEYS` presence + strict parse | ✓ WIRED |

### Data-Flow Trace (Level 4)

| Rendered value | Source | Flows | Status |
|----------------|--------|-------|--------|
| `--color-*` custom properties | `settings.color_*` schema defaults → theme editor `settings_data.json` after first save | Yes — Liquid interpolation with `\| default:` fallback | ✓ FLOWING |
| `--font-heading` / `--font-body` | `settings.font_*` select → self-hosted `@font-face` in same snippet | Yes | ✓ FLOWING |
| `--space-*` / `--radius-none` | static literals in the single token file (accepted deviation) | N/A (static by design) | ✓ FLOWING (static, single-source) |
| `.price` colour, `.button` colours | `var(--color-accent)` / `var(--color-primary)` / `var(--color-bg)` | Yes | ✓ FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| Token contract holds on current tree | `node scripts/check-tokens.mjs` | `OK — 14 chunks, 37 custom properties, 15 schema ids` (exit 0) | ✓ PASS |
| Allowlist checker | `node scripts/check-allowlist.mjs` | OK (exit 0) | ✓ PASS |
| Secrets checker | `node scripts/check-secrets.mjs` | OK (exit 0) | ✓ PASS |
| Checker fails on seeded literal colour + shadow | temp `assets/__probe.css` with `#abcdef` + `box-shadow` | 2 violations, exit 1; clean again after removal | ✓ PASS |
| Live storefront render (`shopify theme dev`) | browser MCP (UAT Test 1) | `--color-primary` #0F6E56 in head, 11 `--color-*`, 5 @font-face, 2 font preloads, 0 external hosts | ✓ PASS (UAT) |

### Probe Execution

No `scripts/*/tests/probe-*.sh` in this repo; the three Node checkers are the executable contract and were run above.

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| DESIGN-01 | 02-01, 02-02, 02-03 | Brand tokens in settings_schema.json, exposed as CSS custom properties | ✓ SATISFIED | 10 colour + 2 font settings; emitter `:root` block; spacing/radii static in same file (accepted deviation) |
| DESIGN-02 | 02-01, 02-02 | Rebrand = token change, no component CSS edit | ✓ SATISFIED | `check-tokens.mjs` green + fails on every seeded negative; rule 5 guards renames; in `npm run lint` + CI gate |
| DESIGN-03 | 02-01, 02-03 | `base.css` with reset, type scale, colours, spacing, buttons, form primitives | ✓ SATISFIED | `assets/base.css` full primitive set, 100% token-derived, flat |
| DESIGN-04 | 02-04 | es-AR voseo locale scaffolded, all UI text from locale files | ✓ SATISFIED | single `es.default.*`, voseo, git rename, `BRAND-COPY.md`, checker rule 8; rendered sections all use `\| t` |

No orphaned requirements — all 4 phase requirement IDs appear in plan frontmatter and are mapped to Phase 2 in REQUIREMENTS.md.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| sections/hello-world.liquid | 28/37/46 | Hardcoded English strings ("Key Concepts", "Liquid", "Best Practices") + 2 literal colours + box-shadow | ℹ️ Info | Exempt by exact path in `check-tokens.mjs`; de-referenced from every template (01-04); filed in ALLOWLIST.md "Presente, no renderiza". Not on any Kinelia render path. |

### Human Verification Required

None outstanding. Human UAT (02-UAT.md) is complete: 19/19 pass, 0 issues. Gap G-02-1 (dev-theme double-default-locale collision) was resolved and confirmed environment-only — the repo files were always correct (`git ls-files locales/` = only `es.default.*`).

One **deferred ops follow-up** already logged in 02-UAT.md (not a phase-goal blocker): confirm the LIVE (#150931210446) and STAGING (#150931144910) themes do not carry an orphaned `en.default.*` from the GitHub integration's incremental sync of commit 7f894f9. Check before the next release via `shopify theme pull --live --only locales`.

### Warnings / Observations

1. **`shopify theme check` cannot run clean locally on this Windows machine** — today's run reports 16 `ValidSchema` errors, all from a single remote-fetch parse failure (`Unable to parse content from https://raw.githubusercontent.com/.../default_setting_values.json`). This is the documented `.planning/WINDOWS.md` #9 flakiness, not a code defect: the errors are identical and network-sourced, the CI gate runs on `ubuntu-latest` where it does not occur, and plan 02-04 recorded a clean `--fail-level error` run (only the 2 accepted `AssetPreload` warnings). The truth "the theme linter accepts the result" is verified on that basis, not on a local run.
2. **Documentation lag (bookkeeping, not a gap):** `REQUIREMENTS.md` still shows `DESIGN-04` as `[ ]` and the traceability table marks Phase 2 / DESIGN-04 "Pending"; `ROADMAP.md` shows `02-04-PLAN.md` unchecked and "3/4 plans executed". The 02-04 work is committed (b0dd6ca, 655b8f7, 7f894f9, 7fc723f) and UAT-passed. Recommend syncing these markers to "Complete / 4/4" during ship.

### Gaps Summary

No gaps. All four ROADMAP success criteria are observably true in the codebase. The single deviation (spacing/radii as static properties rather than editor settings) is a recorded, accepted decision that preserves the phase goal — the brand-token file remains the one place a rebrand happens, and `check-tokens.mjs` machine-enforces that component CSS never holds a literal value. The token path is proven end to end (schema default → Liquid custom property → consuming CSS rule → layout), self-hosted fonts load with exactly two preloads and no third-party host, `base.css` is a complete flat token-derived primitive set, and the theme's sole default locale is Argentine voseo Spanish with the approved-copy contract both machine-checked and documented.

---

_Verified: 2026-09-09_
_Verifier: Claude (gsd-verifier)_
