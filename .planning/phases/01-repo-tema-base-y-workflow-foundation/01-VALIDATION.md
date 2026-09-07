---
phase: "1"
slug: "repo-tema-base-y-workflow-foundation"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: false
wave_0_complete: false
created: "2026-09-07"
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
| 01-01-T3 | 01-01 | 1 | FOUND-01 (repo half), FOUND-02 (decision taken) | T-01-SC, T-01-01, T-01-02 | Legitimacy gate before global install; starter clone's `.git` deleted; existing history preserved | tracer end-to-end | `shopify version && test -f layout/theme.liquid && test -d assets && … && shopify theme check --fail-level error` | ❌ W0 (CLI install) | ⬜ pending |
| 01-02-T1 | 01-02 | 2 | FOUND-02 (recorded) | T-01-05 | GSD content markers preserved while editing the instruction file | doc-assertion | `! grep -Eqi 'sobre Dawn\|Dawn como base\|Dawn despojado' .planning/PROJECT.md .claude/CLAUDE.md && grep -q 'Tema base — tradeoffs evaluados' .planning/PROJECT.md` | ✅ | ⬜ pending |
| 01-02-T2 | 01-02 | 2 | FOUND-04 | T-01-04, T-01-06 | `upstream` points only at the official starter repository | shell-assertion | `git remote get-url upstream && git tag --list 'skeleton-base-*' \| grep -q . && test -f OVERRIDES.md` | ✅ | ⬜ pending |
| 01-03-T2 | 01-03 | 2 | FOUND-06 | T-01-SC, T-01-10 | Performance-relevant lint rules cannot be silently disabled; no theme-check npm package installed | lint + config assertion | `node -e "…package.json shape…" && grep -q 'pull_request' .github/workflows/ci.yml && shopify theme check --fail-level error` | ❌ W0 (CLI) | ⬜ pending |
| 01-03-T3 | 01-03 | 2 | FOUND-07 | T-01-07, T-01-08, T-01-09 | Fork-privileged trigger forbidden; credentials only via Actions secrets; job timeout bounds the known hang | config assertion | `node -e "…lighthouserc.json assertions…" && ! grep -q 'pull_request_target' .github/workflows/lighthouse.yml && grep -q 'timeout-minutes' .github/workflows/lighthouse.yml` | ✅ | ⬜ pending |
| 01-04-T1 | 01-04 | 3 | FOUND-03 (contract) | — | Reduction rule stated as not-referencing, never deleting | doc-assertion | `grep -q '^## Renderiza' ALLOWLIST.md && grep -q 'Desviación registrada' ALLOWLIST.md` | ✅ | ⬜ pending |
| 01-04-T2 | 01-04 | 3 | FOUND-03 (enforced) | T-01-11, T-01-12 | Cart and search section files never deleted; no JS in `assets/` | executable check | `node scripts/check-allowlist.mjs && test -z "$(ls assets/*.js assets/*.mjs 2>/dev/null)" && shopify theme check --fail-level error` | ❌ W0 (CLI) | ⬜ pending |
| 01-04-T3 | 01-04 | 3 | FOUND-04 (reconciled) | T-01-14 | Ledger reconciled against a real diff with the pinned base tag | doc + git assertion | `grep -q 'ALLOWLIST.md' OVERRIDES.md && test "$(git status --porcelain \| grep -c '^ D')" -eq 0` | ✅ | ⬜ pending |
| 01-05-T1 | 01-05 | 4 | FOUND-05 (runbook) | T-01-15, T-01-17, T-01-18 | Publishing from a laptop forbidden; no credential example values | doc-assertion | `grep -q '^## Checklist de release' docs/RELEASE.md && grep -q 'SHOPIFY_CLI_THEME_TOKEN' docs/RELEASE.md && ! grep -Eq 'shpat_\|shpca_\|shppa_' docs/RELEASE.md` | ✅ | ⬜ pending |
| 01-05-T2 | 01-05 | 4 | FOUND-05 (readme) | — | Documented commands match the scripts that exist | doc-assertion | `grep -q 'shopify theme dev' README.md && node -e "…every package.json script named in README…"` | ✅ | ⬜ pending |
| 01-06-T1 | 01-06 | 5 | FOUND-05 (branches) | T-01-20, T-01-22 | Private repository; no force-push over existing history | shell-assertion | `git ls-remote --heads origin main && git ls-remote --heads origin staging && test "$(gh repo view --json isPrivate --jq .isPrivate)" = "true"` | ❌ W0 (remote) | ⬜ pending |
| 01-06-T2 | 01-06 | 5 | FOUND-01, FOUND-07 (credentials) | T-01-19, T-01-23 | Human provisions the store, the GitHub app and the Dev Dashboard app | checkpoint:human-action | none — `gate="blocking-human"` | ❌ W0 (user) | ⬜ pending |
| 01-06-T3 | 01-06 | 5 | FOUND-07 (secrets) | T-01-19, T-01-21 | Secrets set from stdin, never as arguments; no value in the repo or its history | shell-assertion | `gh secret list --json name --jq '.[].name' \| … && ! git log -p -- docs/SHOPIFY-SETUP.md \| grep -Eq 'shpat_\|shpca_\|shppa_'` | ❌ W0 (remote) | ⬜ pending |
| 01-07-T1 | 01-07 | 6 | FOUND-05 (mapping) | T-01-25 | One-way branch↔theme mapping confirmed before it is made | checkpoint:decision | none — `gate="blocking-human"` | ❌ W0 (user) | ⬜ pending |
| 01-07-T2 | 01-07 | 6 | FOUND-05 (themes) | T-01-25, T-01-26 | STAGING stays unpublished; the connection is never undone | checkpoint:human-action | none — `gate="blocking-human"` | ❌ W0 (store) | ⬜ pending |
| 01-07-T3 | 01-07 | 6 | FOUND-01 (preview) | — | Preview serves local code, not a stale theme | route smoke | `node -e "…fetch / /cart /search from PREVIEW_URL…"` + human console check | ❌ W0 (CLI + store) | ⬜ pending |
| 01-07-T4 | 01-07 | 6 | FOUND-06, FOUND-07 (proven) | T-01-24, T-01-27, T-01-28, T-01-29 | Required-check names match job names verbatim; throwaway PR closed, branch deleted | CI-run on a real PR | `gh api repos/:owner/:repo/branches/main/protection --jq '.required_status_checks.contexts \| length'` + observed red-then-green PR | ❌ W0 (remote) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. `W0` marks a check that cannot run until its Wave 0 dependency exists (CLI install, GitHub remote, dev store, or credentials).*

---

## Wave 0 Requirements

External dependencies the executor cannot self-provision — planner splits Phase 1 into "scaffold + docs + config" (no deps) and "connect + verify" (needs the items below):

- [ ] Shopify CLI 4.x installed on the dev machine (`shopify version`)
- [ ] User: Partner development store created; store URL provided
- [ ] User: GitHub repo created, added as `origin`, initial push
- [ ] User: Shopify GitHub app installed on the repo; Dev Dashboard app created; `client_id` / `client_secret` provided for Lighthouse CI
- [ ] `shopify theme init` (Skeleton) scaffold committed at repo root
- [ ] `ALLOWLIST.md` + `OVERRIDES.md` authored
- [ ] `.github/workflows/ci.yml` retargeted to `pull_request`; branch protection on `main`
- [ ] `.github/workflows/lighthouse.yml` + `lighthouserc.json` authored
- [ ] `package.json` (dev-only: `@lhci/cli`) with `perf` / `lint` scripts
- [ ] `docs/RELEASE.md` release checklist
- [ ] STAGING + LIVE themes created and branch-connected (`main`→LIVE, `staging`→STAGING)
- [ ] Reference template + demo product for the harness confirmed, or avatar target explicitly deferred to Phase 10/13

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
- [ ] `nyquist_compliant: true` — set by `/gsd-validate-phase` after the Wave 0 items exist and the ❌ rows turn green

**Approval:** planned 2026-09-07 by `/gsd-plan-phase`; verification pending execution.
