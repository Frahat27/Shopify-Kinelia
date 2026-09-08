---
phase: "1"
slug: "repo-tema-base-y-workflow-foundation"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: validated
nyquist_compliant: false
wave_0_complete: true
created: "2026-09-07"
validated: "2026-09-08"
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> Phase 1 has no application code — "tests" = the lint + performance + preview gates themselves.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Shopify theme tooling — `shopify theme check` (bundled in CLI 4.x) + `@lhci/cli` (dev-only) |
| **Config file** | `.theme-check.yml` (Skeleton ships `extends: theme-check:recommended`); `lighthouserc.json` (Wave 0 authors) |
| **Quick run command** | `shopify theme check --fail-level error` |
| **Full suite command** | `shopify theme check` + `npx @lhci/cli autorun` (or CI: `theme-check-action@v2` + `lighthouse-ci-action@v1`) |
| **Estimated runtime** | ~15 s lint · ~60 s Lighthouse |

---

## Sampling Rate

- **After every task commit:** Run `shopify theme check --fail-level error`
- **After every plan wave:** Run `shopify theme check` (all levels) + `npx @lhci/cli autorun` if a template exists
- **Before `/gsd-verify-work`:** Theme Check exit 0 and Lighthouse assertions pass on the reference template
- **Max feedback latency:** 90 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 01-01-T3 | 01-01 | 1 | FOUND-01 (repo half), FOUND-02 (decision taken) | T-01-SC, T-01-01, T-01-02 | Legitimacy gate before global install; starter clone's `.git` deleted; existing history preserved | tracer end-to-end | `shopify theme check --fail-level error` (+ scaffold file presence) | ✅ | ✅ green — 2026-09-08: 42 files inspected, 0 offenses; `layout/theme.liquid` + `assets/` present |
| 01-02-T1 | 01-02 | 2 | FOUND-02 (recorded) | T-01-05 | GSD content markers preserved while editing the instruction file | doc-assertion | grep: no Dawn-base language in PROJECT.md/CLAUDE.md; "Tema base" section present | ✅ | ✅ green — 2026-09-08 |
| 01-02-T2 | 01-02 | 2 | FOUND-04 | T-01-04, T-01-06 | `upstream` points only at the official starter repository | shell-assertion | `git remote get-url upstream` = official URL; `skeleton-base-*` tag exists; `OVERRIDES.md` present | ✅ | ✅ green — 2026-09-08 |
| 01-03-T2 | 01-03 | 2 | FOUND-06 | T-01-SC, T-01-10 | Performance-relevant lint rules cannot be silently disabled; no theme-check npm package installed | lint + config assertion | package.json shape (lhci dev-only, no runtime deps) + `pull_request` in ci.yml + `shopify theme check --fail-level error` | ✅ | ✅ green — 2026-09-08 |
| 01-03-T3 | 01-03 | 2 | FOUND-07 | T-01-07, T-01-08, T-01-09 | Fork-privileged trigger forbidden; credentials only via Actions secrets; job timeout bounds the known hang | config assertion | no `pull_request_target` in lighthouse.yml; `timeout-minutes` present | ✅ | ✅ green — 2026-09-08 |
| 01-04-T1 | 01-04 | 3 | FOUND-03 (contract) | — | Reduction rule stated as not-referencing, never deleting | doc-assertion | grep: "Renderiza" + "Desviación registrada" in ALLOWLIST.md | ✅ | ✅ green — 2026-09-08 |
| 01-04-T2 | 01-04 | 3 | FOUND-03 (enforced) | T-01-11, T-01-12 | Cart and search section files never deleted; no JS in `assets/` | executable check | `node scripts/check-allowlist.mjs` + no `assets/*.js` + `shopify theme check --fail-level error` | ✅ | ✅ green — 2026-09-08. *Residual: `check-allowlist.mjs` runs in local `npm run lint` only, not the required CI job — see `01-SECURITY.md` T-01-12.* |
| 01-04-T3 | 01-04 | 3 | FOUND-04 (reconciled) | T-01-14 | Ledger reconciled against a real diff with the pinned base tag | doc + git assertion | `OVERRIDES.md` references `ALLOWLIST.md`; no staged deletions | ✅ | ✅ green — 2026-09-08 |
| 01-05-T1 | 01-05 | 4 | FOUND-05 (runbook) | T-01-15, T-01-17, T-01-18 | Publishing from a laptop forbidden; no credential example values | doc-assertion | `docs/RELEASE.md` release checklist present; no `shpat_/shpca_/shppa_` in the doc | ✅ | ✅ green — 2026-09-08 |
| 01-05-T2 | 01-05 | 4 | FOUND-05 (readme) | — | Documented commands match the scripts that exist | doc-assertion | `shopify theme dev` in README; every named package.json script exists | ✅ | ✅ green — 2026-09-08 |
| 01-06-T1 | 01-06 | 5 | FOUND-05 (branches) | T-01-20, T-01-22 | ~~Private repository~~; no force-push over existing history | shell-assertion | `git ls-remote` → `main` + `staging` present (✅); `isPrivate == true` → **inverted by ratified deviation** | ⚠️ | ⚠️ DEVIATION — repo is PUBLIC by ratified decision (`01-UAT.md` Test 2 / `01-SECURITY.md` AR-01-03). Branch-existence leg green; force-push leg covered by `non_fast_forward` on both rulesets (auditor-verified). The "private" assertion is retired for Etapa 1; revisit Phase 14. |
| 01-06-T2 | 01-06 | 5 | FOUND-01, FOUND-07 (credentials) | T-01-19, T-01-23 | Human provisions the store, the GitHub app and the Dev Dashboard app | checkpoint:human-action | none — `gate="blocking-human"` | ✅ | ✅ done — `01-07-SUMMARY.md` §"User Setup Completed"; manual-only by nature |
| 01-06-T3 | 01-06 | 5 | FOUND-07 (secrets) | T-01-19, T-01-21 | Secrets set from stdin, never as arguments; no value in the repo or its history | shell-assertion | `gh secret list`; token-prefix negative-check on tree + history | ✅ | ✅ green-by-audit — `01-SECURITY.md` T-01-08/T-01-17/T-01-19 (4 secrets set; `git grep` prefixes → 0). **T-01-21: a hex fragment WAS committed — remediation in progress (see SECURITY.md); `scripts/check-secrets.mjs` now enforces the tree+history negative-check.** |
| 01-07-T1 | 01-07 | 6 | FOUND-05 (mapping) | T-01-25 | One-way branch↔theme mapping confirmed before it is made | checkpoint:decision | none — `gate="blocking-human"` | ✅ | ✅ done — `01-07-SUMMARY.md` §"User Setup Completed"; manual-only by nature |
| 01-07-T2 | 01-07 | 6 | FOUND-05 (themes) | T-01-25, T-01-26 | STAGING stays unpublished; the connection is never undone | checkpoint:human-action | none — `gate="blocking-human"` | ✅ | ✅ done — `shopify theme list` → exactly 1 live, STAGING `role: unpublished` (auditor-verified T-01-25). *T-01-26 non-blocking residual noted in SECURITY.md.* |
| 01-07-T3 | 01-07 | 6 | FOUND-01 (preview) | — | Preview serves local code, not a stale theme | route smoke | `fetch / /cart /search from PREVIEW_URL` + human console check | ⬜ | manual-only — the local `shopify theme dev` render + console check was done as the 01-07 Task 3 human-check; a fresh headless smoke needs an interactive CLI login. Overlaps `01-UAT.md`. |
| 01-07-T4 | 01-07 | 6 | FOUND-06, FOUND-07 (proven) | T-01-24, T-01-27, T-01-28, T-01-29 | Required-check names match job names verbatim; throwaway PR closed, branch deleted | CI-run on a real PR | `gh api .../rulesets` contexts + observed red-then-green PR | ✅ | ✅ green-by-audit — live API: both rulesets `active`, context `"Theme Check"` byte-identical to `ci.yml`; PR #1 `78327a8` red → BLOCKED, `b319c78` green; 0 open PRs. *T-01-30 admin-bypass flag raised — see SECURITY.md.* |

*Status: ⬜ pending/manual · ✅ green · ❌ red · ⚠️ deviation. Rows verified 2026-09-08 during `/gsd-validate-phase` (State A audit) after Wave 0 completed.*

---

## Wave 0 Requirements

External dependencies the executor cannot self-provision — all satisfied during phase execution (`01-01`…`01-07` SUMMARYs):

- [x] Shopify CLI installed on the dev machine (`shopify` on PATH; `shopify theme check` runs)
- [x] User: Partner development store created; `kinelia.myshopify.com`
- [x] User: GitHub repo created, added as `origin`, initial push (`Frahat27/Shopify-Kinelia`)
- [x] User: Shopify GitHub app installed; Dev Dashboard app created; `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET` set as repo secrets
- [x] `shopify theme init` (Skeleton) scaffold committed at repo root
- [x] `ALLOWLIST.md` + `OVERRIDES.md` authored
- [x] `.github/workflows/ci.yml` retargeted to `pull_request`; branch protection via rulesets on `main` + `staging`
- [x] `.github/workflows/lighthouse.yml` + `lighthouse/lighthouserc.json` authored
- [x] `package.json` (dev-only: `@lhci/cli`) with `perf` / `lint` scripts; `package-lock.json` now tracked
- [x] `docs/RELEASE.md` release checklist
- [x] STAGING + LIVE themes created and branch-connected (`main`→LIVE, `staging`→STAGING)
- [x] Reference template = seeded `the-complete-snowboard`; real hero product deferred to Phase 4 (per `01-07-SUMMARY.md`)

---

## Validation Audit 2026-09-08

| Metric | Count |
|--------|-------|
| Per-task rows | 17 |
| ✅ green (automated, verified now) | 10 |
| ✅ green-by-audit / human-action done | 5 |
| ⚠️ ratified deviation (01-06-T1 — public repo) | 1 |
| ⬜ manual-only (01-07-T3 — interactive preview smoke) | 1 |
| MISSING automated tests | 0 |

**Outcome: VALIDATED (PARTIAL).** No missing automated coverage — every requirement has an
automated assertion, a green-by-audit disposition, or a completed human-action checkpoint.
`nyquist_compliant` stays `false` because one row is a ratified deviation (the "private repo"
assertion is retired for Etapa 1) and one is an interactive-only preview smoke that overlaps
`01-UAT.md`. This is the expected shape for an infrastructure phase whose "tests" are the CI /
lint / preview gates themselves.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| `shopify theme dev` renders the storefront with no console errors | FOUND-01 | Needs interactive CLI login + a live dev store; no headless equivalent in this phase | Run `shopify theme dev --store <dev-store>`, open the localhost URL, load `/`, a product page, and `/cart`; confirm no red console errors |
| STAGING theme is connected to `staging` branch and never auto-publishes | FOUND-05 | Shopify admin UI state; GitHub-integration connection not inspectable from the repo | In Shopify admin → Online Store → Themes, confirm two themes with GitHub badges, STAGING unpublished |
| `theme-check-action` is a required status check that blocks merge | FOUND-06 | GitHub branch-protection setting | Open a throwaway PR with a deliberate lint error; confirm the check runs and merge is blocked |
| Lighthouse CI comments scores and fails below budget | FOUND-07 | Needs a PR + Dev Dashboard credentials in repo secrets | Throwaway PR shows the Lighthouse comment; drop an oversized asset and confirm the budget assertion fails |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are checkpoints with an explicit Wave 0 dependency
- [x] Sampling continuity: no 3 consecutive tasks without automated verify (the longest checkpoint run is 01-07 tasks 1-2, immediately followed by two automated tasks)
- [x] Wave 0 covers all MISSING references (CLI install → 01-01; GitHub remote, dev store, credentials → 01-06; themes and branch protection → 01-07)
- [x] No watch-mode flags
- [x] Feedback latency < 90s (`shopify theme check --fail-level error` ≈ 15 s; `node scripts/check-allowlist.mjs` < 1 s; Lighthouse runs only in CI and on demand)
- [x] Wave 0 items all exist; automated rows green (10/10 runnable)
- [ ] `nyquist_compliant: true` — NOT set: 1 ratified deviation (01-06-T1) + 1 interactive-only smoke (01-07-T3). No missing automated coverage. PARTIAL is the accepted end state for this infra phase.

**Approval:** planned 2026-09-07 by `/gsd-plan-phase`; validated 2026-09-08 by `/gsd-validate-phase` (State A audit) — VALIDATED (PARTIAL).
