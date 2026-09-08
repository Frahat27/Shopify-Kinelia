---
phase: "2"
slug: "sistema-de-diseno-por-tokens"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-08"
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Seeded from `02-RESEARCH.md` §"Validation Architecture". No unit-test framework —
> consistent with Phase 1: "tests = the lint / preview gates themselves".

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Shopify theme tooling — `shopify theme check` (bundled, CLI 4.x) + Node-stdlib checkers (`check-allowlist.mjs`, new `check-tokens.mjs`, `check-secrets.mjs`) |
| **Config file** | `.theme-check.yml` (`extends: theme-check:recommended`, zero rules disabled); `package.json` `lint` chain |
| **Quick run command** | `shopify theme check --fail-level error && node scripts/check-tokens.mjs` |
| **Full suite command** | `npm run lint` (theme check + check-allowlist + check-tokens + check-secrets), then `npm run lint:all` to surface warnings (`RemoteAsset`) |
| **Estimated runtime** | ~15–20 s lint · render smoke ~30 s |

---

## Sampling Rate

- **After every task commit:** `shopify theme check --fail-level error && node scripts/check-tokens.mjs`
- **After every plan wave:** `npm run lint` (all checkers) + `npm run lint:all`
- **Before `/gsd-verify-work`:** full `npm run lint` green + `shopify theme dev` render smoke confirms `--color-primary` / `--font-heading` / `@font-face "DM Sans"` present in the `<head>` inline `<style>`, and WOFF2 byte sizes recorded in `docs/PERF-BUDGET.md`
- **Max feedback latency:** ~20 s

---

## Per-Task Verification Map

<!-- Task IDs are placeholders — the planner fills them against the real plan/wave breakdown.
     Rows are the requirement→check contract from 02-RESEARCH.md. -->

| Req | Behavior | Test Type | Automated Command | File Exists | Status |
|-----|----------|-----------|-------------------|-------------|--------|
| DESIGN-01 | Color + typography tokens in `settings_schema.json`; `css-variables.liquid` emits `--custom-properties`; `theme_info` stays element 0 | schema+liquid validity | `shopify theme check --fail-level error` | ✅ theme check | ⬜ pending |
| DESIGN-01 | Every `settings.<id>` in `css-variables.liquid` resolves to a schema `id` | static integrity | `node scripts/check-tokens.mjs` (schema-ref check) | ❌ W0 (`check-tokens.mjs`) | ⬜ pending |
| DESIGN-01 | Rendered `<head>` inline `<style>` contains `--color-primary`, `--font-heading` and an `@font-face` for "DM Sans" | render assertion | `shopify theme dev` + fetch `/` + grep (manual-only if headless CLI login unavailable — Phase 1 01-07-T3 precedent) | ❌ W0 (smoke script / manual step) | ⬜ pending |
| DESIGN-02 | No literal hex (`#rgb`/`#rrggbb`) or brand font-name in component CSS outside `css-variables.liquid` + `settings_schema.json` | executable drift check | `node scripts/check-tokens.mjs` (hex + font-name checks) | ❌ W0 | ⬜ pending |
| DESIGN-02 | Every `--color-*` token has a Liquid `\| default:` guard (empty-setting protection) | static check | `node scripts/check-tokens.mjs` (default-guard check) | ❌ W0 | ⬜ pending |
| DESIGN-03 | `assets/base.css` exists, `var(--*)` only, no `@font-face`/hex/font-name, no `box-shadow`/`gradient`/`justify`/stray `uppercase` | static assertion | `node scripts/check-tokens.mjs` (scans `assets/**/*.css`) + `shopify theme check` `AssetSizeCSS` | ❌ W0 | ⬜ pending |
| DESIGN-03 | `base.css` listed in `ALLOWLIST.md` `## Renderiza` + referenced by `layout/theme.liquid` | allowlist check | `node scripts/check-allowlist.mjs` (extend with asset rows) | ✅ extend existing | ⬜ pending |
| DESIGN-04 | `locales/es.default.json` + `es.default.schema.json` exist, strict JSON, no BOM, sole `*.default.json` | locale presence | `node scripts/check-tokens.mjs` (locale check) | ❌ W0 | ⬜ pending |
| DESIGN-04 | Required storefront keys present (legal legend, 6 approved CTAs, cart/product/header namespaces) | key-presence assertion | `node scripts/check-tokens.mjs` (`REQUIRED_STOREFRONT_KEYS`) | ❌ W0 | ⬜ pending |
| DESIGN-04 | No missing `t:` schema keys referenced by `settings_schema.json` | theme check | `shopify theme check --fail-level error` (`MissingTemplate`/`TranslationKeyExists`) | ✅ theme check | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. `W0` = needs its Wave 0 artifact first.*

---

## Wave 0 Requirements

External/foundational artifacts the executor builds before the checks can run:

- [ ] `scripts/check-tokens.mjs` — Node stdlib, mirrors `scripts/check-allowlist.mjs`. Covers DESIGN-01 (schema-ref integrity), DESIGN-02 (hex + font-name drift, `| default:` guards), DESIGN-03 (base.css purity + forbidden props), DESIGN-04 (locale presence + required keys). Spacing literals deliberately NOT checked (too noisy).
- [ ] `package.json` — `lint` chain `+= "&& node scripts/check-tokens.mjs"`; add `"lint:tokens"`; mirror into the CI `Theme Check` job (also closes the Phase-1 T-01-12 residual for `check-allowlist.mjs`).
- [ ] 5 subset WOFF2 files in `assets/` — DM Sans 400/500, Inter 400/500/600 (latin + latin-ext) + OFL license note.
- [ ] `.gitattributes` — `locales/*.json text eol=lf`, `config/*.json text eol=lf`, `assets/*.woff2 binary` (Windows BOM/CRLF hazard — `.planning/WINDOWS.md`).
- [ ] `ALLOWLIST.md` rows for `base.css` + the 5 WOFF2.
- [ ] Render-smoke: a script (`shopify theme dev` + fetch `/` + assert token + `@font-face`) OR a documented Manual-Only step (Phase 1 precedent: interactive CLI login not always available on this Windows machine).

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `<head>` inline `<style>` actually renders the tokens + `@font-face` against a live store | DESIGN-01 | Needs interactive `shopify theme dev` login + dev store; no headless equivalent proven on this machine (Phase 1 01-07-T3) | `shopify theme dev --store kinelia.myshopify.com`, `curl -s localhost:9292/ \| grep -E -- '--color-primary\|@font-face'` |
| Theme editor shows the Colores / Tipografía groups and a color change re-renders without touching CSS | DESIGN-01 / DESIGN-02 | Shopify admin editor UI state; `settings_data.json` round-trip | In the theme editor, open Theme settings → Colores, change `--color-primary`, confirm the storefront updates and no component `.css` changed |
| No FOUC / layout shift from self-hosted fonts on a throttled mobile profile | DESIGN-03 / perf budget | Needs a real device / throttled Lighthouse (Phase 13 owns full perf) | Load `/` on a mid-range Android profile, confirm text paints with fallback then swaps without CLS spike |

---

## Validation Sign-Off

- [ ] `scripts/check-tokens.mjs` exists and is wired into `npm run lint` + CI
- [ ] All `❌ W0` rows turn green after Wave 0
- [ ] Feedback latency < 30 s
- [ ] No watch-mode flags
- [ ] `nyquist_compliant: true` — set by `/gsd-validate-phase` once the W0 artifacts exist and the checks pass; the 3 Manual-Only rows are expected to remain manual (infra-phase pattern, Phase 1 precedent)

**Approval:** seeded 2026-09-08 by `/gsd-plan-phase`; verification pending execution.
