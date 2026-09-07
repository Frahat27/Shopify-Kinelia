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
| 1-01-xx | 01 | 1 | FOUND-02 | — | N/A | doc-assertion | `grep -Ri "dawn despojado" .planning/PROJECT.md` returns nothing; new Key Decision row present | ✅ | ⬜ pending |
| 1-01-xx | 01 | 1 | FOUND-03 | — | cart/search routes still render on base | lint + tree-diff | `shopify theme check` exit 0; `assets/` has no JS framework; file tree matches `ALLOWLIST.md` | ❌ W0 (CLI) | ⬜ pending |
| 1-01-xx | 01 | 1 | FOUND-04 | — | N/A | shell-assertion | `git remote get-url upstream`; `git tag` includes skeleton-base tag; `test -f OVERRIDES.md` | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 2 | FOUND-06 | — | CI blocks merge on lint error | CI-run | `theme-check-action@v2` on a PR shows a required check; README documents local `shopify theme check` | ❌ W0 (remote) | ⬜ pending |
| 1-02-xx | 02 | 2 | FOUND-07 | — | CI blocks merge below budget | CI-run | `lighthouse.yml` on a PR comments scores; `lighthouserc.json` asserts LCP ≤ 2500 ms + a11y ≥ 0.95 | ❌ W0 | ⬜ pending |
| 1-02-xx | 02 | 2 | FOUND-01 | — | storefront renders, no console errors | manual smoke | `shopify theme dev --store <dev-store>` → load `/`, `/products/<demo>`, `/cart` — no console errors | ❌ W0 (CLI + store) | ⬜ pending |
| 1-02-xx | 02 | 2 | FOUND-05 | — | STAGING never auto-publishes | manual + admin | Shopify admin Themes shows STAGING (unpublished) + LIVE with GitHub badges; `docs/RELEASE.md` checklist exists | ❌ W0 (store + remote) | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky. Task IDs are placeholders — the planner assigns real ones.*

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

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 90s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
