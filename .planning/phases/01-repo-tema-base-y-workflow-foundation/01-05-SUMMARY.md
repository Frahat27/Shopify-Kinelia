---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 05
subsystem: infra
tags: [shopify, github-integration, release-runbook, readme, staging-live-topology, documentation]

requires:
  - phase: 01-03
    provides: "package.json scripts (lint/lint:all/lint:allowlist/perf); ci.yml job 'Theme Check'; lighthouse.yml job 'Lighthouse'; docs/PERF-BUDGET.md"
  - phase: 01-04
    provides: "ALLOWLIST.md + OVERRIDES.md surface/divergence contracts; pending README.md / docs/RELEASE.md rows handed to this plan"
provides:
  - "docs/RELEASE.md — STAGING/LIVE topology, irreversible branch↔theme connection, content-ownership rule, 7-step release checklist, rollback, standing prohibitions, SHOPIFY_CLI_THEME_TOKEN note"
  - "README.md — setup (clone → local preview), commands table, three-line topology summary, repository-contract index, structure tree with the theme-dirs-at-root constraint"
  - "OVERRIDES.md — README.md / docs/RELEASE.md rows filled in (no longer pending)"
  - "Exact theme names for plan 01-07 to create: `Kinelia — LIVE` (published, from main) and `Kinelia — STAGING` (unpublished, from staging)"
affects: [01-06, 01-07, phase-02, phase-03, phase-06, phase-11]

actuals:
  tokens: 3600
  tasks: 2
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Documentary contract now, live topology in plan 01-07 — this plan writes the runbook that 01-07 follows"
    - "Single source per fact: README routes every release question to docs/RELEASE.md instead of restating it (a second checklist copy goes stale)"
    - "Content ownership resolved, not described: the GitHub integration owns settings_data.json + template JSON; the rejected alternative is named with its reason"

key-files:
  created:
    - "docs/RELEASE.md — operational release contract (Spanish)"
    - "README.md — repo entry point for a fresh clone (Spanish)"
  modified:
    - "OVERRIDES.md — filled the pending README.md / docs/RELEASE.md rows in Archivos nuevos"

key-decisions:
  - "Content-ownership rule: the Shopify GitHub integration owns config/settings_data.json and templates/*.json; non-developers edit STAGING in the theme editor and the integration auto-commits to the staging branch; changes reach LIVE through the same PR path as code. Rejected alternative: git owns the JSON with periodic shopify theme pull — higher drift risk, no compensating benefit."
  - "Exact theme names the runbook uses (plan 01-07 must create these verbatim): `Kinelia — LIVE` and `Kinelia — STAGING`"
  - "Release checklist cites both CI jobs by their real display names: `Theme Check` (workflow CI) and `Lighthouse` (workflow Lighthouse)"
  - "Performance numbers are not restated in the runbook or the README — both point at docs/PERF-BUDGET.md as the single source"

patterns-established:
  - "README as index, not manual: every repo contract (ALLOWLIST.md, OVERRIDES.md, docs/RELEASE.md, docs/PERF-BUDGET.md, .planning/) is listed with the rule that binds it, so no contract is discoverable only by accident"
  - "Irreversible infra steps get a named runbook section, not a footnote (branch↔theme connection)"

requirements-completed: [FOUND-05]

coverage:
  - id: D1
    description: "docs/RELEASE.md documents the STAGING/LIVE topology — one store, two themes — in a table with Rama / Tema / ¿Publicado? / Quién lo actualiza, three rows, exactly one theme marked published"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -qE '^## Topología' docs/RELEASE.md; table has main→Kinelia — LIVE (Sí) + staging→Kinelia — STAGING (No) + local dev theme (No)"
        status: pass
    human_judgment: false
  - id: D2
    description: "The runbook states the branch↔theme connection is irreversible (cannot be re-established once disconnected; recovery means a new theme) in its own named section, and forbids disconnecting to 'clean up'"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -q 'irreversible' docs/RELEASE.md; '## Conexión rama ↔ tema (paso irreversible)' section present with the no-reconnect constraint"
        status: pass
    human_judgment: false
  - id: D3
    description: "Content-ownership section names exactly one owner (the GitHub integration) for settings_data.json + template JSON, and names the rejected git-owns-JSON alternative with its reason"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -qE '^## Propiedad del contenido' docs/RELEASE.md; single owner stated; 'Alternativa rechazada' paragraph present"
        status: pass
    human_judgment: false
  - id: D4
    description: "Numbered release checklist with 7 steps, each phrased as a check with a pass condition; cites the Theme Check and Lighthouse jobs; routes performance numbers to docs/PERF-BUDGET.md; forbids publishing LIVE from a laptop and names the merge path as the only route"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -qE '^## Checklist de release' docs/RELEASE.md; 7 numbered items; 'Theme Check' + 'Lighthouse' + 'docs/PERF-BUDGET.md' all present; '## Rollback' + '## Prohibiciones' present"
        status: pass
    human_judgment: false
  - id: D5
    description: "The runbook states the CI theme-token env var is SHOPIFY_CLI_THEME_TOKEN, flags it as irregular, and warns the wrong name hangs on an interactive login instead of failing loudly"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -q 'SHOPIFY_CLI_THEME_TOKEN' docs/RELEASE.md; '## Autenticación en CI' section explains the irregular name + the hang failure mode"
        status: pass
    human_judgment: false
  - id: D6
    description: "README.md takes a fresh clone from install → running local preview using only its own text: Requisitos (Node 22.12+, git 2.28+, Shopify CLI v4, no compile step), Puesta en marcha (shopify theme dev with store placeholder + interactive-login warning + --theme-editor-sync caveat), Comandos table"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -qE '^## Requisitos|^## Puesta en marcha|^## Comandos' README.md; 'shopify theme dev' + '22.12' + '2.28' present"
        status: pass
    human_judgment: true
    rationale: "Whether a newcomer can actually reach a running preview from the readme alone is a human walkthrough — deferred to plan 01-07 once a dev store exists (plan human-check)"
  - id: D7
    description: "README.md indexes every repository contract document (ALLOWLIST.md, OVERRIDES.md, docs/RELEASE.md, docs/PERF-BUDGET.md, .planning/) with the rule that binds each, restates no release checklist step, and its Comandos table matches package.json exactly"
    requirement: FOUND-05
    verification:
      - kind: automated
        ref: "node -e over package.json scripts vs README (all of lint/lint:all/lint:allowlist/perf present); grep for ALLOWLIST.md + OVERRIDES.md + docs/RELEASE.md + docs/PERF-BUDGET.md"
        status: pass
    human_judgment: false
  - id: D8
    description: "README.md ## Estructura shows the repo tree and states the theme directories must stay at the repository root because the GitHub integration only connects branches shaped that way"
    requirement: FOUND-05
    verification:
      - kind: other
        ref: "grep -qE '^## Estructura' README.md; 'raíz del repositorio' constraint + 'Nunca anidar' present"
        status: pass
    human_judgment: false
  - id: D9
    description: "Neither docs/RELEASE.md nor README.md contains a value matching a Shopify token prefix (shpat_ / shpca_ / shppa_)"
    requirement: FOUND-05
    verification:
      - kind: automated
        ref: "grep -Ec 'shpat_|shpca_|shppa_' docs/RELEASE.md README.md → 0 in both"
        status: pass
    human_judgment: false

duration: 12min
completed: 2026-09-08
status: complete
---

# Phase 01 Plan 05: Release runbook + readme Summary

**`docs/RELEASE.md` makes a release a deliberate, repeatable act — STAGING/LIVE topology, an irreversible branch↔theme connection, a resolved content-ownership rule (the GitHub integration owns the JSON), a 7-step gated checklist, rollback by merge-revert, and standing prohibitions — and `README.md` takes a fresh clone from toolchain install to a running local preview while indexing every repository contract.**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-09-08T13:05:00Z
- **Completed:** 2026-09-08T13:17:00Z
- **Tasks:** 2
- **Files modified:** 3 (2 created, 1 modified)

## Accomplishments

- `docs/RELEASE.md` written in Spanish with all seven required sections: `## Topología` (one store / two themes, three-row table, exactly one published), `## Conexión rama ↔ tema (paso irreversible)`, `## Propiedad del contenido` (single owner + named rejected alternative), `## Checklist de release` (7 numbered gated steps), `## Rollback` (merge revert, never a laptop push), `## Prohibiciones` (5 rules with reasons), `## Autenticación en CI` (`SHOPIFY_CLI_THEME_TOKEN`, irregular, hangs on wrong name).
- Release checklist cites both CI jobs by their real display names — `Theme Check` and `Lighthouse` — and routes all performance numbers to `docs/PERF-BUDGET.md` instead of restating them.
- `README.md` written in Spanish for a fresh clone: opening paragraph (what/why/Skeleton base + pointer to PROJECT.md Key Decisions), `## Requisitos` (Node 22.12+, git 2.28+, Shopify CLI v4, no compile step and none may be added), `## Puesta en marcha` (clone → `npm install` → `shopify theme dev --store <placeholder>`, interactive first-login warning, `--theme-editor-sync` two-way-sync caveat), `## Comandos` (the four `package.json` scripts + raw CLI), `## Temas y ramas` (three lines, routes to RELEASE.md), `## Documentos del repositorio` (ALLOWLIST.md / OVERRIDES.md / docs/RELEASE.md / docs/PERF-BUDGET.md / .planning/ each with its binding rule), `## Estructura` (tree + theme-dirs-at-root hard constraint).
- `OVERRIDES.md` `## Archivos nuevos` rows for `README.md` and `docs/RELEASE.md` filled in — no longer marked `_Pendiente_` (handed over by the 01-04 summary).
- `npm run lint` still exits 0 (41 files, 0 offenses; allowlist checker OK).

## Task Commits

1. **Task 1: Write docs/RELEASE.md — topology, ownership rule, checklist, rollback** — `0f8dac3` (docs)
2. **Task 2: Write README.md — setup, commands, topology summary, contract index** (incl. OVERRIDES.md row fill) — `851d181` (docs)

**Plan metadata:** final `docs(01-05)` commit.

## Files Created/Modified

- `docs/RELEASE.md` (created) — operational release contract: topology, irreversible connection, content ownership, checklist, rollback, prohibitions, CI auth note
- `README.md` (created) — repo entry point: requisitos, puesta en marcha, comandos, temas y ramas, documentos del repositorio, estructura
- `OVERRIDES.md` (modified) — `README.md` / `docs/RELEASE.md` rows in `## Archivos nuevos` filled in

## Decisions Made

- **Content-ownership rule:** the Shopify GitHub integration owns `config/settings_data.json` and `templates/*.json`. Non-developers edit STAGING in the theme editor; the integration auto-commits to `staging`; changes reach LIVE via the same PR path as code. Rejected alternative (named in the runbook): git owns the JSON with periodic `shopify theme pull` — higher drift risk, no compensating benefit. This follows research §3 option (a).
- **Exact theme names:** `Kinelia — LIVE` (published, connected to `main`) and `Kinelia — STAGING` (unpublished, connected to `staging`). Plan 01-07 must create the themes with these exact names.
- **Job names cited in the checklist:** `Theme Check` (from `.github/workflows/ci.yml`) and `Lighthouse` (from `.github/workflows/lighthouse.yml`) — verified against the workflow files on disk, not just the 01-03 summary.
- **No performance numbers restated** anywhere in RELEASE.md or README — both defer to `docs/PERF-BUDGET.md` so a second copy cannot go stale.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Filled the pending OVERRIDES.md rows for README.md / docs/RELEASE.md**
- **Found during:** Task 2 (README.md creation)
- **Issue:** `OVERRIDES.md` `## Archivos nuevos` carried `README.md` and `docs/RELEASE.md` as `_Pendiente_` rows. The 01-04 summary explicitly handed the fill-in to plan 01-05 ("Plan 01-05 appends its README.md and docs/RELEASE.md rows to OVERRIDES.md"). Leaving them pending after both files exist would make the divergence ledger inaccurate and violate the OVERRIDES.md rule that every new file is recorded in the same PR that introduces it.
- **Fix:** Replaced both `_Pendiente_` rows with concrete one-line descriptions of what each document provides, keeping the `01-05` plan attribution.
- **Files modified:** `OVERRIDES.md`
- **Verification:** `grep _Pendiente_ OVERRIDES.md` now returns only the `docs/SHOPIFY-SETUP.md` row (owned by plan 01-06); `npm run lint` exit 0.
- **Committed in:** `851d181` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** The OVERRIDES.md touch keeps the divergence ledger true to the repository state and was explicitly delegated to this plan by the 01-04 handoff. No scope change — the two documents are exactly what the plan specified.

## Issues Encountered

None. Both documents are pure documentation; `npm run lint` (Theme Check + allowlist checker) is unaffected and stays green.

## User Setup Required

None - no external service configuration in this plan. The topology this runbook describes is created against the real store in plan 01-07; the Shopify Partner account, GitHub remote and Dev Dashboard credentials are provisioned in plan 01-06.

## Next Phase Readiness

- FOUND-05's documentary half is complete: topology, ownership rule, release checklist, rollback path and prohibitions all exist in one place (`docs/RELEASE.md`), and a newcomer path from clone to local preview exists (`README.md`).
- **Plan 01-07 must create the themes with the exact names `Kinelia — LIVE` and `Kinelia — STAGING`**, connect `staging` first (irreversible step), then `main`, and walk the `docs/RELEASE.md` checklist once end-to-end against the real STAGING preview link (plan human-check, deferred here).
- Plan 01-06 owns `docs/SHOPIFY-SETUP.md` (still `_Pendiente_` in OVERRIDES.md) and provisions the GitHub remote + `SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET` secrets.

## Self-Check: PASSED

- Files verified present: `docs/RELEASE.md`, `README.md`, `01-05-SUMMARY.md`
- `OVERRIDES.md` modification verified in `851d181`
- Commits verified in history: `0f8dac3` (Task 1), `851d181` (Task 2)
- Task 1 `<verify>` automated block: PASS
- Task 2 `<verify>` automated block: PASS (all four `package.json` scripts present in README; all contract docs linked; `22.12` + `2.28` present)
- Plan `<verification>`: `test -f docs/RELEASE.md && test -f README.md` PASS; `grep -Ec 'shpat_|shpca_|shppa_'` = 0 in both; every `package.json` script name in README
- `npm run lint` exit 0

---
*Phase: 01-repo-tema-base-y-workflow-foundation*
*Completed: 2026-09-08*
