---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 07
subsystem: infra
tags: [shopify, github, branch-protection, rulesets, theme-check, lighthouse-ci, topology, staging-live, foundation]

requires:
  - phase: 01-06
    provides: "private (now public) repo origin with main + staging; dev store kinelia.myshopify.com; SHOP_* Actions secrets; Dev Dashboard app"
  - phase: 01-05
    provides: "docs/RELEASE.md — the documented main->LIVE / staging->STAGING mapping and exact theme names"
  - phase: 01-03
    provides: ".github/workflows/{ci,lighthouse}.yml + lighthouserc.json — the harness this plan proves (and had to fix)"
provides:
  - "Two GitHub-connected themes on kinelia.myshopify.com: Kinelia — LIVE (150931210446, main, published) and Kinelia — STAGING (150931144910, staging, unpublished)"
  - "GitHub rulesets protect-main + protect-staging (active): PR required + required status check 'Theme Check' + non-fast-forward"
  - "FOUND-01 demonstrated: shopify theme dev serves this repo against the dev store; /, /products/*, /cart, /search all render"
  - "FOUND-06 demonstrated: the Theme Check gate turned a real merge from BLOCKED to mergeable across a two-commit throwaway PR (#1, closed, branch deleted)"
  - "ci.yml two-step Theme Check job — the action for annotations + an explicit shopify theme check --fail-level error that actually fails the job"
  - "lighthouse/lighthouserc.json (moved from repo root) — local perf harness config; docs/PERF-BUDGET.md rewritten to reflect CI-vs-local split"
  - "docs/SHOPIFY-SETUP.md — ## Temas and ## Verificación de gates sections with run URLs"
affects: [phase-02, phase-04, phase-13, phase-14]

actuals:
  tokens: 9000
  tasks: 4
  commits: 5

tech-stack:
  added: []
  patterns:
    - "GitHub rulesets (not classic branch protection) for required status checks — the only free option once the repo is public"
    - "A gate is proven by a real red run blocking a real merge, then a green run releasing it — never by the workflow file existing"
    - "Two-step lint job: third-party action (continue-on-error) for PR annotations + an explicit CLI invocation whose exit code is the gate"

key-files:
  created:
    - ".planning/phases/01-repo-tema-base-y-workflow-foundation/01-07-SUMMARY.md"
  modified:
    - ".github/workflows/ci.yml — two-step Theme Check job (action for annotations + explicit `shopify theme check --fail-level error` as the gate)"
    - ".github/workflows/lighthouse.yml — pass `password` + `product_handle` to the action"
    - "lighthouserc.json -> lighthouse/lighthouserc.json (moved out of the lhci autorun path so it no longer shadows the action's own config)"
    - "package.json — perf script -> lighthouse/lighthouserc.json"
    - ".shopifyignore — /lighthouse/ replaces /lighthouserc.json"
    - "docs/PERF-BUDGET.md — rewritten: CI enforces only the two category scores; the hard LCP/CLS/JS-weight asserts are local-only until Phase 13"
    - "docs/SHOPIFY-SETUP.md — ## Temas + ## Verificación de gates; visibility -> Público; GitHub app -> installed; Pendiente reduced"
    - "README.md, OVERRIDES.md — lighthouserc.json path + CI/local split"

key-decisions:
  - "Branch mapping confirmed as documented (checkpoint:decision): main -> published Kinelia — LIVE, staging -> unpublished Kinelia — STAGING, one store two themes"
  - "Repository made PUBLIC (developer override, confirmed twice with full disclosure) — GitHub branch protection / rulesets require a paid plan on private repos; developer declined GitHub Pro and declined removing .planning/ first. Contradicts plan must_haves backstop + threat T-01-20. Logged in WINDOWS.md; revisit at Phase 14."
  - "Lighthouse is NOT a required status check — shopify/lighthouse-ci-action cannot run themeCreate with a Dev Dashboard app (needs a Shopify exemption), so it can never pass today; making it required would permanently block every PR. Deferred to Phase 13."
  - "lighthouserc.json moved to lighthouse/ — the Shopify Lighthouse action writes its own lighthouserc.yml and `lhci autorun` picks .json before .yml, so a root lighthouserc.json broke the CI harness entirely."
  - "Theme Check job made authoritative via an explicit CLI step — shopify/theme-check-action does not fail its own step on offences, only its separate 'Theme Check Report' check."
  - "Dev theme 150931472590 (left by shopify theme dev) not deleted — the store-delete was blocked by the session's auto-mode classifier; it auto-expires in ~7 days. Minor cleanup noted for the user."

patterns-established:
  - "Gate proof = throwaway branch off staging with one deliberate error-level offence -> PR -> observe BLOCKED -> second commit removes it -> observe mergeable -> close without merge, delete branch"
  - "When a third-party action's own step never fails, wrap the real check in an explicit CLI step and keep the action as continue-on-error for its annotations"

requirements-completed: [FOUND-01, FOUND-06]

coverage:
  - id: E1
    description: "Two themes exist: one published + connected to main, one unpublished + connected to staging; exactly one published"
    requirement: FOUND-05
    verification:
      - kind: automated
        ref: "shopify theme list --store kinelia.myshopify.com --json -> Kinelia — LIVE role=live (main), Kinelia — STAGING role=unpublished (staging); exactly 1 live"
        status: pass
    human_judgment: true
    rationale: "Theme IDs, connected branches and published state taken from the developer's Shopify admin screenshots + shopify theme list; a human should eyeball the Themes page shows two GitHub badges and one published"
  - id: E2
    description: "The local preview server serves this repository against the dev store and the four allowlisted routes render"
    requirement: FOUND-01
    verification:
      - kind: automated
        ref: "shopify theme dev --store kinelia.myshopify.com ready at http://127.0.0.1:9292; Node fetch: / 200 (contains 'custom-section', not 'Generated test data'), /products/the-complete-snowboard 200, /cart 200, /search 200, all bodies >500 bytes"
        status: pass
      - kind: manual
        ref: "developer opened the four routes in a browser: each renders content, no red console errors"
        status: pass
    human_judgment: true
    rationale: "The 'renders content, no console errors' half of FOUND-01 acceptance cannot be produced headlessly — the developer confirmed it"
  - id: E3
    description: "Both quality gates run on a pull request; the lint gate is a required status check that blocks a merge on a real offence"
    requirement: FOUND-06
    verification:
      - kind: automated
        ref: "throwaway PR #1: commit 78327a8 (deliberate offence) -> Theme Check job FAIL, mergeStateStatus BLOCKED; commit b319c78 (offence removed) -> Theme Check job SUCCESS, mergeStateStatus UNSTABLE (only non-required Lighthouse red). Rulesets protect-main/protect-staging require 'Theme Check'."
        status: pass
    human_judgment: true
    rationale: "The developer should open the closed PR #1 and confirm by eye: the Theme Check job red on commit 1, green on commit 2, and the merge button was blocked while red"
  - id: E4
    description: "The performance gate runs on a pull request and its result is visible (or its failure is recorded, never silently absent)"
    requirement: FOUND-07
    verification:
      - kind: automated
        ref: "Lighthouse ran on PR #1 both commits and FAILED with 'Access denied for themeCreate field. Required access: write_themes AND an exemption from Shopify' — run https://github.com/Frahat27/Shopify-Kinelia/actions/runs/34270870826/job/102211833720. Recorded as an open finding in docs/SHOPIFY-SETUP.md + WINDOWS.md, deferred to Phase 13."
        status: fail
    human_judgment: true
    rationale: "OPEN FINDING, not a Phase 1 failure: shopify/lighthouse-ci-action's Dev Dashboard auth path cannot create the preview theme it needs in the post-2026-01-01 custom-app world. The harness is wired, authenticates, and reports its failure loudly; the local `npm run perf` is unaffected. Resolution is Phase 13's job."
  - id: E5
    description: "The throwaway verification PR is closed and its branch deleted"
    requirement: FOUND-06
    verification:
      - kind: automated
        ref: "gh pr list --state open -> 0; git ls-remote --heads origin -> only main + staging (gate-proof-throwaway deleted)"
        status: pass
    human_judgment: false

duration: 4h
completed: 2026-09-08
status: complete
---

# Phase 01 Plan 07: Prove the topology Summary

**STAGING/LIVE themes connected to `staging`/`main` on `kinelia.myshopify.com`, the local preview server proven to serve this repo across all four allowlisted routes, GitHub rulesets making `Theme Check` a required check on both branches, and a closed throwaway PR (#1) that showed the lint gate flip a real merge from BLOCKED to mergeable. Lighthouse CI runs but cannot create its preview theme with a Dev Dashboard app — recorded as an open Phase 13 finding.**

## Performance

- **Duration:** ~4h (spans two blocking-human checkpoints and a long harness-debugging tail)
- **Completed:** 2026-09-08
- **Tasks:** 4
- **Repo files modified:** 8

## Accomplishments

- **Task 1 — branch mapping (checkpoint:decision):** developer confirmed `documented-mapping` — `main` -> published `Kinelia — LIVE`, `staging` -> unpublished `Kinelia — STAGING`, one store, two themes. Matches `docs/RELEASE.md`.
- **Task 2 — themes created + connected (checkpoint:human-action):** developer installed the Shopify GitHub app, created `Kinelia — STAGING` (ID `150931144910`, connected to `staging`, left unpublished) and `Kinelia — LIVE` (ID `150931210446`, connected to `main`), and published only LIVE. `shopify theme list` confirms exactly one `role: live`. Store started with 3 themes (`test-data` published + `Horizon` + `debut-vintage-theme` drafts).
- **Task 3 — local preview (FOUND-01):** `shopify theme dev --store kinelia.myshopify.com` (the exact `README.md` command, with `--store-password` via env for the password-protected store) served the theme at `http://127.0.0.1:9292`. Node `fetch` smoke: `/` 200 (serves local `custom-section`, not the stale `Generated test data` hero), `/products/the-complete-snowboard` 200, `/cart` 200, `/search` 200 — all bodies > 500 bytes. Developer confirmed the four routes render with no console errors.
- **Task 4 — gates required + proven (FOUND-06 / FOUND-07):**
  - GitHub **rulesets** `protect-main` + `protect-staging` (classic branch protection is paywalled on private repos; rulesets were too until the repo went public): require a PR, require the `Theme Check` status check, forbid fast-forward.
  - Throwaway PR **#1** (`gate-proof-throwaway` -> `staging`): commit 1 added one deliberate error-level Liquid offence -> `Theme Check` job **FAIL**, merge **BLOCKED**. Commit 2 removed it -> `Theme Check` job **SUCCESS**, merge unblocked (only the non-required `Lighthouse` still red). PR closed without merge, branch deleted, zero open PRs.
  - `docs/SHOPIFY-SETUP.md` gained `## Temas` and `## Verificación de gates` with every run URL.

## Task Commits

Repo commits attributed to this plan (on `main`/`staging`, plus the throwaway branch's two commits which were never merged):

1. **fix(01-07): make both quality gates actually gate** — `af7cea1` (moved `lighthouserc.json` -> `lighthouse/`)
2. **fix(01-07): make both quality gates actually gate (config)** — `0deacc1` (ci.yml `--fail-level error`; lighthouse.yml `password` + `product_handle`; PERF-BUDGET/README/OVERRIDES/package.json/.shopifyignore)
3. **fix(01-07): make the Theme Check JOB the authoritative lint gate** — `3d58dfa` (two-step job)
4. **docs(01-07): record theme topology + gate verification evidence** — `60ece1e` (`docs/SHOPIFY-SETUP.md`)
5. Plan metadata commit (SUMMARY + STATE + ROADMAP + REQUIREMENTS) — via the phase-close PR

Throwaway (closed, unmerged): `78327a8` (offence), `b319c78` (offence removed).

## Created Outside the Repository

- Theme `Kinelia — LIVE` (`150931210446`) — published, connected to `main`
- Theme `Kinelia — STAGING` (`150931144910`) — unpublished, connected to `staging`, preview `https://kinelia.myshopify.com/?preview_theme_id=150931144910`
- GitHub rulesets `protect-main` (`22575790`), `protect-staging` (`22575793`) — active, required check `Theme Check`
- Repository visibility flipped **private -> public**

## Decisions Made

- **Repo made public — developer override of T-01-20**, confirmed twice with the full exposure listed (`.planning/` = the whole business plan). Reason: branch protection / rulesets are paywalled on private repos; the developer declined GitHub Pro (US$4/mo) and declined stripping `.planning/` first. Logged in `.planning/WINDOWS.md`; flagged for review at Phase 14 (back to private + Pro, or accept public).
- **`Lighthouse` is not a required check.** `shopify/lighthouse-ci-action` does `shopify theme push --development` -> `themeCreate`, which a self-serve Dev Dashboard app cannot call (`ACCESS_DENIED: write_themes AND an exemption from Shopify`). A required check that can never pass would brick every future PR. The workflow stays, runs red, and is Phase 13's problem.
- **`Theme Check` job made authoritative** with an explicit `shopify theme check --fail-level error` step; the action is kept as `continue-on-error` for its PR-diff annotations only.
- **`lighthouserc.json` moved to `lighthouse/`** so `lhci autorun` in CI stops shadowing the action's own generated config.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] `Theme Check` job stayed green on a real error-level offence**
- **Found during:** Task 4 (first gate-proof PR run)
- **Issue:** `shopify/theme-check-action@v2.2.0` posts a separate `Theme Check Report` check that reflects offences but never fails its own job step, even with `flags: --fail-level error`. Branch protection requires the *job* name, so the gate would have protected nothing.
- **Fix:** Split the `Theme Check` job into two steps — the action (`continue-on-error: true`) for annotations, then an explicit `npm install -g @shopify/cli && shopify theme check --fail-level error` whose exit code fails the job.
- **Files modified:** `.github/workflows/ci.yml`
- **Verification:** PR #1 commit 1 -> `Theme Check` job FAIL; commit 2 -> SUCCESS.
- **Committed in:** `3d58dfa`

**2. [Rule 3 - Blocking] Lighthouse CI could not run at all**
- **Found during:** Task 4
- **Issue:** `Failed to automatically determine staticDistDir` — the repo-root `lighthouserc.json` (with a `collect` block, no `url`) shadowed the `lighthouserc.yml` that `shopify/lighthouse-ci-action` writes for itself (`lhci autorun` resolves `.json` before `.yml`). Then, once that was fixed, the action failed at `themeCreate` (see decision above).
- **Fix (partial):** Moved `lighthouserc.json` -> `lighthouse/lighthouserc.json` (local `npm run perf` only, via `--config`); passed `password` + `product_handle` to the action. CI Lighthouse now gets past config and auth but still cannot create the preview theme.
- **Files modified:** `lighthouserc.json` (moved), `.github/workflows/lighthouse.yml`, `package.json`, `.shopifyignore`, `docs/PERF-BUDGET.md`, `README.md`, `OVERRIDES.md`
- **Verification:** local `npm run lint` still green; CI Lighthouse authenticates and fetches handles, then reports the `themeCreate` `ACCESS_DENIED` loudly (run URL recorded).
- **Committed in:** `af7cea1`, `0deacc1`

**3. [Rule 4-ish - Architectural, developer decision] Repo visibility private -> public**
- **Found during:** Task 4 (branch protection setup)
- **Issue:** rulesets/branch protection require a paid plan on private repos.
- **Action:** presented three safer options (GitHub Pro, defer to Phase 14, strip `.planning/` first); developer chose public. Recorded in `WINDOWS.md` and `docs/SHOPIFY-SETUP.md`.

---

**Total deviations:** 2 auto-fixed (both blocking harness defects in 01-03 artifacts, which is exactly what this plan exists to surface) + 1 developer-decided architectural change.

## Issues Encountered / Open Findings

- **OPEN — Lighthouse CI cannot create its preview theme.** `shopify/lighthouse-ci-action` + a Dev Dashboard app hits `themeCreate` `ACCESS_DENIED` (needs a Shopify exemption). Deferred to **Phase 13**. Options: request the exemption; self-hosted runner with a stored `shopify login` session; replace the action with a workflow that audits an already-connected theme's preview URL + `lhci autorun --config`; or a different perf tool (PSI API, WebPageTest, Shopify Web Performance dashboard). `.planning/WINDOWS.md`.
- **OPEN — CI enforces only the two Lighthouse category scores**, not the hard LCP/CLS/JS-weight thresholds (the action doesn't read custom assertions). Those run in the local `npm run perf` only. Phase 13 decides whether a custom CI workflow is worth building. `docs/PERF-BUDGET.md`.
- **Repo is public** — see decision. Business plan (`.planning/`) is exposed. Review at Phase 14.
- **Minor** — leftover dev theme `Development (0f9eff-...)` on the store (from `shopify theme dev`, session classifier blocked the delete); auto-expires ~7 days or the developer removes it in the admin.
- **`SHOP_CLIENT_SECRET`** — rotate post-launch (transited a chat during 01-06).

## User Setup Completed This Plan

- Confirmed the branch->theme mapping (Task 1 checkpoint).
- Installed the Shopify GitHub app; created + connected + published the two themes (Task 2 checkpoint).
- Ran the local preview visual check (Task 3 human-check).
- Confirmed making the repo public with full disclosure.

## Next Phase Readiness

- **Phase 1 goal met end to end (with the Lighthouse finding noted):** the theme lives in git, previews locally against the dev store, has a STAGING/LIVE topology following `docs/RELEASE.md`, and has a lint gate observed blocking and releasing a real merge.
- **Phase 2 (design tokens)** starts against a working `Theme Check` gate on every PR.
- **Phase 4** swaps the seeded `the-complete-snowboard` for the real hero product in `lighthouse.yml`.
- **Phase 13** owns the Lighthouse CI resolution and the CI-vs-local assertion decision.
- **Phase 14** reviews repo visibility and rotates `SHOP_CLIENT_SECRET`.

## Self-Check: PASSED

- `shopify theme list --store kinelia.myshopify.com` -> `Kinelia — LIVE` role=live, `Kinelia — STAGING` role=unpublished, exactly 1 live
- `gh api repos/Frahat27/Shopify-Kinelia/rulesets` -> `protect-main`, `protect-staging` both `active`, required check `Theme Check`
- `gh pr list --state open` -> 0 ; `git ls-remote --heads origin` -> only `main` + `staging`
- PR #1 check runs: `78327a8` Theme Check = failure, `b319c78` Theme Check = success (URLs in `docs/SHOPIFY-SETUP.md`)
- `npm run lint` green on `main`
- `main` / `staging` push CI green on `3d58dfa`
- `git log -p --all | grep -E 'shpss_|4cbe71cfd82'` -> no credential value in history

---
*Phase: 01-repo-tema-base-y-workflow-foundation*
*Completed: 2026-09-08*
