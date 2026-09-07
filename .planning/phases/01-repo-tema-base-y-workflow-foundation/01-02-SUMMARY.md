---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 02
status: complete
completed: 2026-09-07
requirements: [FOUND-02, FOUND-04]
commits:
  - 5ce5998 docs(01): record Skeleton base-theme decision (FOUND-02)
  - 6a13e14 chore(01): establish fork ownership — upstream remote, base tag, OVERRIDES.md (FOUND-04)
---

# Plan 01-02 Summary — Record the decision + fork ownership

## Task 1 — base-theme decision recorded (FOUND-02)

- `.planning/PROJECT.md`: "What This Is", first Active requirement, Headless out-of-scope rationale, Tech-stack constraint, and Key Decisions row 1 all updated from "Dawn" to "Skeleton". New `### Tema base — tradeoffs evaluados` subsection with the 3-option table (Skeleton chosen / Horizon fallback / Dawn rejected) and the accepted-cost closing line naming Phases 3, 6, 11 as owners of the deferred JS features. Key Decisions Outcome cell: `✓ Tomada en Phase 1 (2026-09-07) · one-way`.
- `.claude/CLAUDE.md`: GSD:project-start block synced (2 lines); the stale "revisit in the first phase" flag in the appended tech-stack research section marked RESOLVED (it also tripped the verify grep).
- `.planning/research/STACK.md`: open-question #3 (base-theme contradiction) struck through and marked RESOLVED with date.
- Verify: `grep -Eci 'sobre Dawn|Dawn como base|Dawn despojado'` → 0 in both PROJECT.md and CLAUDE.md. PASS.

## Task 2 — fork ownership (FOUND-04)

- `git remote add upstream https://github.com/Shopify/skeleton-theme.git` + `git fetch upstream`.
- Tag **`skeleton-base-a4f32d3`** → `upstream/main` (full SHA `a4f32d393b9eadf6c4403318ca39116832e5d1df`). Matches the SHA recorded in 01-01-SUMMARY.
- `OVERRIDES.md` authored at repo root with all 6 sections: `## Base`, `## Archivos modificados`, `## Archivos eliminados`, `## Archivos nuevos`, `## Componentes portados`, `## Reglas`. Spanish. Names the pinned tag.
- Verify command: PASS.

## Deviation from plan

Plan said to seed `## Archivos modificados` with `.github/workflows/ci.yml` as pending. Per 01-01-SUMMARY deviation 1, that file **does not exist in current Skeleton** — so it was placed under `## Archivos nuevos` (to be CREATED by plan 01-03), not `## Archivos modificados`. `.theme-check.yml` remains the sole pending row under `## Archivos modificados`.

## State

- Theme Check still green (39 files, 0 offenses).
- `LICENSE.md` (MIT, from Skeleton) committed for fork attribution.

## Next

Wave 2 continues with plan 01-03 (lint gate + perf harness). **Plan 01-03 must CREATE `.github/workflows/ci.yml`, not retarget it** (deviation carried from 01-01). Then Wave 3 (01-04 ALLOWLIST.md), Wave 4 (01-05 docs), Wave 5-6 (01-06/01-07 — need the user's Shopify Partner account + GitHub repo).
