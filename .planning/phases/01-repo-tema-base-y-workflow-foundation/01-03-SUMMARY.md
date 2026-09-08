---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 03
subsystem: infra
tags: [shopify, theme-check, lighthouse-ci, github-actions, ci, performance-budget]

requires:
  - phase: 01-01
    provides: "Skeleton theme scaffolded at repo root; `shopify theme check` green baseline"
provides:
  - "Lint gate: dev-only package.json (`lint`/`lint:all`), tuned .theme-check.yml, PR-triggered ci.yml (job name 'Theme Check')"
  - "Performance gate: lighthouserc.json hard metric assertions, pull_request-triggered lighthouse.yml with secret-held Dev Dashboard credentials"
  - "docs/PERF-BUDGET.md — budget numbers, provenance, and the ratchet plan through Phase 13"
  - "Hardened .gitignore (env files, .lighthouseci/) and .shopifyignore (planning/instruction/docs/dev-tooling excluded from CLI push)"
affects: [01-04, 01-06, 01-07, phase-13]

actuals:
  tokens: 6000
  tasks: 3
  commits: 2

tech-stack:
  added: ["@lhci/cli@^0.15.1 (devDependency, local perf harness only)", "shopify/theme-check-action@v2", "shopify/lighthouse-ci-action@v1"]
  patterns:
    - "Quality gates authored as config now, proven live in plan 01-07 once store + remote exist"
    - "CI workflows trigger on pull_request (never pull_request_target); credentials only via secrets.*"
    - "Assumed budget numbers flagged in-doc as SUPUESTO/ASSUMPTION with a named hardening phase"

key-files:
  created:
    - "package.json — dev-tooling manifest, no dependencies block, no build script"
    - "lighthouserc.json — Lighthouse CI assertions (LCP/CLS/a11y errors, script-weight/TBT warnings)"
    - ".github/workflows/lighthouse.yml — performance gate on every PR"
    - "docs/PERF-BUDGET.md — written budget (Spanish)"
  modified:
    - ".theme-check.yml — KINELIA header justification; extends theme-check:recommended, no rule disabled"
    - ".github/workflows/ci.yml — retargeted to pull_request + push(main,staging)"
    - ".gitignore — env files, *.local, .lighthouseci/"
    - ".shopifyignore — root-anchored planning/instruction/docs/dev-tooling exclusions"

key-decisions:
  - "@lhci/cli pinned at ^0.15.1 (legitimacy checkpoint answered `approved` at Task 1)"
  - "No Theme Check rule disabled — linter ran clean at all levels on 41 files, so .theme-check.yml only extends the recommended set"
  - "ci.yml job name is 'Theme Check' verbatim — plan 01-07 wires it as a required status check"
  - "Script-weight budget (150000 bytes) kept as a `warn` assumption, not an `error` — Shopify publishes no JS-weight target; hardens to a real number at Phase 13"

patterns-established:
  - "Config-first gates: both quality gates land without a store or remote; plan 01-07 only proves them"
  - "Secret hygiene: no credential literal in any workflow; .gitignore covers .env/.env.* before any credential exists"

requirements-completed: [FOUND-06, FOUND-07]

coverage:
  - id: D1
    description: "Local lint gate: `npm run lint` runs the bundled Theme Check at error fail-level and exits non-zero on an error-level offence"
    requirement: FOUND-06
    verification:
      - kind: manual_procedural
        ref: "npm run lint → '41 files inspected with no offenses found', exit 0"
        status: pass
    human_judgment: false
  - id: D2
    description: "PR-triggered Theme Check workflow (ci.yml) gates merges once branch protection is set"
    requirement: FOUND-06
    verification:
      - kind: other
        ref: "grep pull_request .github/workflows/ci.yml; job name 'Theme Check'"
        status: pass
    human_judgment: true
    rationale: "Workflow only executes on a real GitHub remote with a PR; live proof deferred to plan 01-07"
  - id: D3
    description: "Lighthouse CI assertions enforce hard metric budgets (LCP<=2500, CLS<=0.1, a11y>=0.95) plus script-weight/TBT warnings"
    requirement: FOUND-07
    verification:
      - kind: automated
        ref: "node -e assertion check on lighthouserc.json.ci.assert.assertions"
        status: pass
    human_judgment: false
  - id: D4
    description: "pull_request-triggered lighthouse.yml with 25-min timeout, pinned actions, secret-held Dev Dashboard credentials, no pull_request_target"
    requirement: FOUND-07
    verification:
      - kind: other
        ref: "grep checks: shopify/lighthouse-ci-action@v1, timeout-minutes, secrets.SHOP_*, pull_request_target count=0"
        status: pass
    human_judgment: true
    rationale: "Score comment + audited-URL check require a live PR with provisioned secrets — deferred to plans 01-06/01-07"
  - id: D5
    description: "docs/PERF-BUDGET.md records every budget number, its provenance, the ratchet to >=0.9 mobile by Phase 13, and flags the 150000-byte script weight as an assumption; states the Phase 1 harness targets a seeded demo product page with the avatar template swapped in at Phase 10/13"
    requirement: FOUND-07
    verification:
      - kind: manual_procedural
        ref: "docs/PERF-BUDGET.md review against Task 3 acceptance criteria"
        status: pass
    human_judgment: false

duration: 15min
completed: 2026-09-08
status: complete
---

# Phase 01 Plan 03: Quality Gates (lint + performance budget) Summary

**Both Phase 1 quality gates stood up as config — bundled Theme Check with a PR-gating `ci.yml`, and a Lighthouse CI performance harness with hard LCP/CLS/accessibility assertions plus a written, provenance-tagged budget document.**

## Performance

- **Duration:** ~15 min (continuation/recovery session; Task 3 finish + summary)
- **Started:** 2026-09-08T12:10:00Z
- **Completed:** 2026-09-08T12:26:00Z
- **Tasks:** 3 (Task 1 checkpoint approved, Task 2 committed prior, Task 3 finished this session)
- **Files modified:** 8 (4 created, 4 modified across the plan)

## Accomplishments

- Performance harness completed: `lighthouserc.json` asserts LCP <= 2500 ms, CLS <= 0.1 and accessibility >= 0.95 as errors, with `resource-summary:script:size` (150000 bytes) and `total-blocking-time` (200 ms) as warnings; mobile preset, 3 runs.
- `.github/workflows/lighthouse.yml` created: triggers on `pull_request` only, 25-minute job timeout, pinned `shopify/lighthouse-ci-action@v1` + `actions/checkout@v4`, credentials read exclusively from `secrets.SHOP_STORE` / `secrets.SHOP_CLIENT_ID` / `secrets.SHOP_CLIENT_SECRET`, commented-out `product_handle` noting Phase 4.
- `package.json` gained the `perf` script (`lhci autorun --config=lighthouserc.json`) and `@lhci/cli@^0.15.1` as its only devDependency — still no `dependencies` key, no `build` script.
- `docs/PERF-BUDGET.md` written in Spanish: each budget number, its origin, the ratchet plan to >= 0.9 mobile by Phase 13, the script-weight figure explicitly labelled SUPUESTO/ASSUMPTION, and the reference-target caveat (seeded demo product page now, avatar template at Phase 10/13).
- Lint gate (Task 2, committed prior): dev-only `package.json`, `.theme-check.yml` extending `theme-check:recommended` with zero rules disabled, `ci.yml` retargeted to `pull_request` + `push`(main,staging), hardened `.gitignore` / `.shopifyignore`.

## Task Commits

1. **Task 1: Confirm `@lhci/cli` package legitimacy** — checkpoint (`blocking-human`), answered `approved`; no commit
2. **Task 2: Lint gate — dev-only package.json, tuned .theme-check.yml, PR ci.yml, hardened ignores** — `ae00391` (chore)
3. **Task 3: Performance harness — Lighthouse assertions, PR workflow, written budget** — `a3b2c1b` (feat)

**Plan metadata:** see final `docs(01-03)` commit.

## Files Created/Modified

- `package.json` (created, Task 2; modified, Task 3) — dev-tooling manifest; `lint`/`lint:all`/`perf` scripts; `@lhci/cli` devDependency
- `lighthouserc.json` (created) — Lighthouse CI assertions
- `.github/workflows/lighthouse.yml` (created) — performance gate on every PR
- `docs/PERF-BUDGET.md` (created) — written performance budget (Spanish)
- `.theme-check.yml` (modified) — KINELIA justification header; recommended set unchanged
- `.github/workflows/ci.yml` (modified) — `pull_request` + `push`(main,staging) triggers; job name "Theme Check"
- `.gitignore` (modified) — env files, `*.local`, `.lighthouseci/`
- `.shopifyignore` (modified) — root-anchored exclusions for `/.planning/`, `/.claude/`, `/.github/`, `/docs/`, `/*.md`, `/package.json`, `/package-lock.json`, `/lighthouserc.json`

## Output notes (required by plan `<output>`)

- **Theme Check rules disabled:** NONE. The linter was run at every severity level against the current tree before tuning; 41 files inspected with zero offences, so `.theme-check.yml` only carries `extends: theme-check:recommended` plus a `# KINELIA:` header explaining that the performance-relevant rules (`ParserBlockingScript`, `AssetSizeJavaScript`, `RemoteAsset`, `ImgWidthAndHeight`) stay at recommended severity and must never be weakened.
- **`@lhci/cli` version pinned:** `^0.15.1` (in `devDependencies`; local perf harness only — the CI harness installs nothing from npm).
- **Exact `ci.yml` job name (verbatim for plan 01-07 required status check):** `Theme Check`
  - job key: `theme-check`; `name:` value: `Theme Check`
- **`@lhci/cli` legitimacy checkpoint outcome:** `approved` (Task 1, `gate="blocking-human"`).

## Decisions Made

- Kept the script-weight assertion as `warn` not `error` — it is an unvalidated assumption (A1); hardens at Phase 13.
- Accessibility raised to 0.95 (above the action's 0.9 default) as the FOUND-03 regression guard.
- Performance score floor set at 0.6 with an explicit ratchet documented in `PERF-BUDGET.md`.

## Deviations from Plan

None - plan executed as written. The three on-disk Task 3 artifacts left by the prior (stalled) executor (`lighthouserc.json`, `.github/workflows/lighthouse.yml`, `package.json` edits) were reviewed against Task 3's acceptance criteria and conformed with no changes required; only `docs/PERF-BUDGET.md` remained to be written.

## Issues Encountered

- Prior executor stalled mid-Task 3 with artifacts written but uncommitted. Recovery: verified each artifact against acceptance criteria, wrote the missing budget doc, ran Task 3 `<verify>` (pass) and plan-level `<verification>` (`npm run lint` exit 0, `lighthouserc.json` parses, `pull_request_target` count 0), then committed atomically.

## User Setup Required

None in this plan. Repository secrets (`SHOP_STORE`, `SHOP_CLIENT_ID`, `SHOP_CLIENT_SECRET`) are provisioned in plan 01-06; live gate proof happens in plan 01-07.

## Next Phase Readiness

- Both gates are config-complete and locally provable. The first pull request of Phase 2 will run both workflows.
- Deferred to plan 01-07 (needs a GitHub remote + provisioned secrets): confirm both workflows appear on a PR and gate it; confirm the Lighthouse job audits a product page and posts a score comment.
- Plan 01-04 owns `OVERRIDES.md` reconciliation for `.theme-check.yml` and `.github/workflows/ci.yml`.

## Self-Check: PASSED

- Files verified present: `package.json`, `lighthouserc.json`, `.github/workflows/lighthouse.yml`, `docs/PERF-BUDGET.md`, `.github/workflows/ci.yml`, `.theme-check.yml`, `01-03-SUMMARY.md`
- Commits verified in history: `ae00391` (Task 2), `a3b2c1b` (Task 3)
- Task 3 `<verify>` automated block: PASS
- Plan `<verification>`: `npm run lint` exit 0; `lighthouserc.json` parses; `grep -c pull_request_target lighthouse.yml` = 0

---
*Phase: 01-repo-tema-base-y-workflow-foundation*
*Completed: 2026-09-08*
