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

Task IDs below are the real plan/task addresses from the 2026-09-08 plan set (4 plans, 4 waves).
Rows are the requirement→check contract from 02-RESEARCH.md.

| Req | Task | Behavior | Test Type | Automated Command | File Exists | Status |
|-----|------|----------|-----------|-------------------|-------------|--------|
| DESIGN-01 | 02-01 T1, 02-02 T1 | Color + typography tokens in `settings_schema.json`; `css-variables.liquid` emits `--custom-properties`; `theme_info` stays element 0 | schema+liquid validity | `shopify theme check --fail-level error` | ✅ theme check | ⬜ pending |
| DESIGN-01 | 02-01 T2 (rule 3) | Every `settings.<id>` in `css-variables.liquid` resolves to a schema `id` **and** that id's input type is color/select/range (injection guard) | static integrity | `node scripts/check-tokens.mjs` | ❌ W0 (`check-tokens.mjs`) | ⬜ pending |
| DESIGN-01 | 02-01 T1, 02-03 T2 | Rendered `<head>` inline `<style>` contains `--color-primary`, `--font-heading` and an `@font-face` for the heading family | render assertion | Manual-Only (see table below) — `shopify theme dev` + fetch `/` + grep; headless CLI login unproven on this machine (Phase 1 01-07-T3 precedent) | ⚠️ manual step, documented | ⬜ pending |
| DESIGN-02 | 02-01 T2 (rules 1-2) | No literal hex (`#rgb`/`#rrggbb`) or brand font-name in component CSS outside `css-variables.liquid` + `settings_schema.json`; `sections/hello-world.liquid` exempt by exact path | executable drift check | `node scripts/check-tokens.mjs` | ❌ W0 | ⬜ pending |
| DESIGN-02 | 02-01 T2 (rule 4) | Every `--color-*` token has a Liquid `\| default:` guard (empty-setting protection) | static check | `node scripts/check-tokens.mjs` | ❌ W0 | ⬜ pending |
| DESIGN-02 | 02-01 T2 (rule 5), 02-02 T3 | No `var(--x)` references a custom property nothing defines — the gate that makes the Skeleton→Kinelia token rename safe | static check | `node scripts/check-tokens.mjs` | ❌ W0 | ⬜ pending |
| DESIGN-02 | 02-01 T3 | The token checker, the allowlist checker and the secrets checker all run in the required `Theme Check` CI job, not only locally (closes Phase-1 residual T-01-12) | CI gate | `npm run lint` locally; the gate step in `.github/workflows/ci.yml` on every PR | ❌ W0 | ⬜ pending |
| DESIGN-03 | 02-01 T2 (rule 6), 02-03 T3 | `assets/base.css` exists, `var(--*)` only, no `@font-face`/hex/font-name, no shadow/ramp/justify/stray uppercase; accent token in exactly one rule (the price) | static assertion | `node scripts/check-tokens.mjs` + `shopify theme check` `AssetSizeCSS` | ❌ W0 | ⬜ pending |
| DESIGN-03 | 02-01 T1, 02-03 T1 | `base.css` and all five WOFF2 listed in `ALLOWLIST.md` `## Renderiza`; `base.css` referenced by `layout/theme.liquid` | allowlist check | `node scripts/check-allowlist.mjs` | ✅ extend existing | ⬜ pending |
| DESIGN-03 | 02-03 T1 | Five WOFF2 files present, each with a valid signature and a measured byte size recorded in `docs/PERF-BUDGET.md` (replaces research assumption A2) | binary + budget assertion | `node -e` signature/size check in 02-03 T1 verify block | ❌ W0 | ⬜ pending |
| DESIGN-03 | 02-01 T2 (rule 7), 02-03 T2 | No third-party font host anywhere in `layout/`, `snippets/`, `assets/`; exactly two font preloads | static + count assertion | `node scripts/check-tokens.mjs` + `shopify theme check` (all levels, `RemoteAsset`) | ❌ W0 | ⬜ pending |
| DESIGN-04 | 02-01 T2 (rule 8), 02-04 T2 | `locales/es.default.json` + `es.default.schema.json` exist, strict JSON, no BOM, no CR, sole `*.default.json`, and that sole default is Spanish | locale presence | `node scripts/check-tokens.mjs` | ❌ W0 | ⬜ pending |
| DESIGN-04 | 02-04 T2 | Required storefront keys present (legal legend + 6 approved CTAs + root promise); legend key carries no `_html` suffix | key-presence assertion | `node scripts/check-tokens.mjs` (`REQUIRED_STOREFRONT_KEYS`) | ❌ W0 | ⬜ pending |
| DESIGN-04 | 02-04 T1 | No missing `t:` schema keys referenced by `settings_schema.json`; theme linter green with Spanish as sole default (answers research assumption A5) | theme check | `shopify theme check --fail-level error` | ✅ theme check | ⬜ pending |
| DESIGN-04 | 02-04 T1 | The locale change is a git rename, not a delete-and-recreate | history assertion | `git log --follow -- locales/es.default.json` returns &gt;1 commit | ✅ git | ⬜ pending |
| DESIGN-04 | 02-04 T3 | Prohibited-claims contract exists in `docs/BRAND-COPY.md` with all four categories and cites each approved-copy locale key | document assertion | `node -e` content check in 02-04 T3 verify block | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. `W0` = needs its Wave 0 artifact first.*

---

## Wave 0 Requirements

External/foundational artifacts the executor builds before the checks can run:

- [ ] **[02-01 T2]** `scripts/check-tokens.mjs` — Node stdlib, mirrors `scripts/check-allowlist.mjs`. Nine rules: (1) hex drift, (2) brand font-name drift, (3) schema-reference integrity + input-type injection guard, (4) `| default:` fallback guard, (5) undefined custom property, (6) forbidden declarations (shadow / ramp / justify / stray uppercase), (7) third-party font host, (8) locale structural sanity, (9) empty-scan-fails. Allowed files: `snippets/css-variables.liquid`, `config/settings_schema.json`, `config/settings_data.json`. Exempt: `sections/hello-world.liquid` (de-referenced starter demo, `ALLOWLIST.md` "Presente, no renderiza"). Spacing literals deliberately NOT checked (too noisy).
- [ ] **[02-04 T2]** `scripts/check-tokens.mjs` locale extension — sole default must be Spanish; the eight required brand keys must resolve to non-empty strings; the legal legend must not carry the `_html` suffix.
- [ ] **[02-01 T3]** `package.json` — `lint` chain `+= "&& node scripts/check-tokens.mjs"`; add `"lint:tokens"`; mirror all three Node checkers into the CI `Theme Check` gate step (also closes the Phase-1 T-01-12 residual for `check-allowlist.mjs` and `check-secrets.mjs`).
- [ ] **[02-03 T1]** 5 subset WOFF2 files in `assets/` — heading family 400/500, body family 400/500/600 (latin + latin-ext), with provenance, OFL 1.1 licence and measured byte size recorded in `OVERRIDES.md` and `docs/PERF-BUDGET.md`.
- [ ] **[02-01 T3]** `.gitattributes` — `locales/*.json text eol=lf`, `config/*.json text eol=lf`, `assets/*.woff2 binary` (Windows BOM/CRLF hazard — `.planning/WINDOWS.md`).
- [ ] **[02-01 T1 / 02-03 T1]** `ALLOWLIST.md` rows for `base.css` + the 5 WOFF2.
- [ ] **[02-03, end-of-phase review]** Render-smoke as a documented Manual-Only step rather than a script — Phase 1 precedent (01-07-T3): interactive CLI login is not reliably available on this Windows machine, and `workflow.human_verify_mode` is `end-of-phase`, so the three `<human-check>` blocks in plans 02-01, 02-03 and 02-04 are collected at the end-of-phase review.

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

**Approval:** seeded 2026-09-08 by `/gsd-plan-phase`; task addresses filled against the 4-plan /
4-wave breakdown on the same date; verification pending execution.
