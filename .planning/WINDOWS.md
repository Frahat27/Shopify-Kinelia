---
schema_version: 1
open_count: 8
waived_count: 0
fixed_count: 1
total_count: 9
last_updated: 2026-09-09T00:00:00.000Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | OVERRIDES.md |  | Archivos eliminados: el diff con el base tag muestra 4 archivos de gobernanza upstream nunca vendorizados por el scaffold; ninguna superficie de tema fue borrada | open |  | 2026-09-08T12:40:48.442Z |  |
| 2 | 01 | deviation | templates/index.json |  | index.json reescrito como JSON estricto (sin banner /* */) para que el verify del plan con require() resuelva | open |  | 2026-09-08T12:40:49.516Z |  |
| 3 | 01 | deviation | .github/workflows/ci.yml |  | ci.yml/lighthouse.yml needed explicit permissions blocks (contents:read + checks/pull-requests:write) and theme-check-action bumped v2->v2.2.0. First push turned CI red (Resource not accessible by integration, then Repository not found). RESOLVED at commit 1bb87cc — CI green on main+staging. 01-07 re-verifies on a PR. | fixed |  | 2026-09-08T17:52:56.568Z | 2026-09-08T17:53:32.109Z |
| 4 | 01 | unrun-verify | .github/workflows/lighthouse.yml |  | OPEN: Lighthouse CI gate cannot run — shopify/lighthouse-ci-action does themeCreate which a Dev Dashboard app cannot call (ACCESS_DENIED: needs a Shopify exemption). Lighthouse is NOT a required check. Local npm run perf works. Resolve in Phase 13. | open |  | 2026-09-08T19:54:36.316Z |  |
| 5 | 01 | deviation | docs/PERF-BUDGET.md |  | OPEN: CI enforces only categories:performance>=0.6 and categories:accessibility>=0.95 (the Lighthouse action ignores custom assertions). Hard LCP/CLS/JS-weight thresholds run in local npm run perf only. Phase 13 decides whether a custom CI workflow is worth building. | open |  | 2026-09-08T19:54:37.579Z |  |
| 6 | 01 | deviation | docs/SHOPIFY-SETUP.md |  | OVERRIDE (developer-confirmed twice, full disclosure): repo Frahat27/Shopify-Kinelia made PUBLIC in 01-07. Contradicts 01-07 must_haves backstop 'repository is created private' + threat T-01-20. Reason: GitHub branch protection/rulesets require a paid plan on private repos; developer declined GitHub Pro and declined stripping .planning/ first. Exposes .planning/ (full business plan), docs/*. Secret VALUES stay encrypted (verified not in git history). OWNER RATIFICATION + Phase 14 revisit (private+Pro, or accept public) — tracked in 01-UAT.md. | open |  | 2026-09-08T20:07:06.886Z |  |
| 7 | 01 | unrun-verify | scripts/perf.mjs |  | OPEN: local npm run perf does not complete a clean Lighthouse measurement against shopify theme dev — the theme dev proxy holds a connection open (network never idle, 45s page-load timeout) and chrome-launcher throws EPERM on Windows temp cleanup. Harness executes and collects artifacts. Fix in Phase 13 by targeting a deployed preview URL. | open |  | 2026-09-08T20:51:49.193Z |  |
| 8 | 02 | lint-warning | layout/theme.liquid |  | 2 Theme Check AssetPreload warnings on the raw <link rel=preload> font tags — raw links chosen for explicit type/crossorigin/asset_url control and to satisfy the plan verify; npm run lint (--fail-level error) green, npm run lint:all shows the 2 warnings | open |  | 2026-09-09T13:21:02.288Z |  |
| 9 | 02 | flaky-tool | package.json |  | OPEN (environmental, not a code defect): `shopify theme check` intermittently reports ~16 `[error]: ValidSchema` offences — all "Unable to parse content from https://raw.githubusercontent.com/Shopify/theme-liquid-docs/.../theme_block.json | default_setting_values.json". This is Theme Check failing to fetch/parse Shopify's REMOTE JSON schemas (GitHub raw rate-limit / transient); it hits starter section files the 02-04 locale work never touched. Exit code flips between 0 (bundled-schema fallback, `npm run lint` green) and 1 on retry with no source change. The 3 deterministic Node checkers (check-allowlist / check-secrets / check-tokens) pass every run. CI uses `theme-check-action` on GitHub runners with clean githubusercontent access — unaffected. Revisit in Phase 13 if it blocks local work; consider pinning schemas offline. | open |  | 2026-09-09T00:00:00.000Z |  |

````json
[
  {
    "id": 1,
    "kind": "deviation",
    "phase": "01",
    "file": "OVERRIDES.md",
    "line": null,
    "description": "Archivos eliminados: el diff con el base tag muestra 4 archivos de gobernanza upstream nunca vendorizados por el scaffold; ninguna superficie de tema fue borrada",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T12:40:48.442Z",
    "resolved_at": null
  },
  {
    "id": 2,
    "kind": "deviation",
    "phase": "01",
    "file": "templates/index.json",
    "line": null,
    "description": "index.json reescrito como JSON estricto (sin banner /* */) para que el verify del plan con require() resuelva",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T12:40:49.516Z",
    "resolved_at": null
  },
  {
    "id": 3,
    "kind": "deviation",
    "phase": "01",
    "file": ".github/workflows/ci.yml",
    "line": null,
    "description": "ci.yml/lighthouse.yml needed explicit permissions blocks (contents:read + checks/pull-requests:write) and theme-check-action bumped v2->v2.2.0. First push turned CI red (Resource not accessible by integration, then Repository not found). RESOLVED at commit 1bb87cc — CI green on main+staging. 01-07 re-verifies on a PR.",
    "status": "fixed",
    "reason": "",
    "recorded_at": "2026-09-08T17:52:56.568Z",
    "resolved_at": "2026-09-08T17:53:32.109Z"
  },
  {
    "id": 4,
    "kind": "unrun-verify",
    "phase": "01",
    "file": ".github/workflows/lighthouse.yml",
    "line": null,
    "description": "OPEN: Lighthouse CI gate cannot run — shopify/lighthouse-ci-action does themeCreate which a Dev Dashboard app cannot call (ACCESS_DENIED: needs a Shopify exemption). Lighthouse is NOT a required check. Local npm run perf works. Resolve in Phase 13.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T19:54:36.316Z",
    "resolved_at": null
  },
  {
    "id": 5,
    "kind": "deviation",
    "phase": "01",
    "file": "docs/PERF-BUDGET.md",
    "line": null,
    "description": "OPEN: CI enforces only categories:performance>=0.6 and categories:accessibility>=0.95 (the Lighthouse action ignores custom assertions). Hard LCP/CLS/JS-weight thresholds run in local npm run perf only. Phase 13 decides whether a custom CI workflow is worth building.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T19:54:37.579Z",
    "resolved_at": null
  },
  {
    "id": 6,
    "kind": "deviation",
    "phase": "01",
    "file": "docs/SHOPIFY-SETUP.md",
    "line": null,
    "description": "OVERRIDE (developer-confirmed twice, full disclosure): repo Frahat27/Shopify-Kinelia made PUBLIC in 01-07. Contradicts 01-07 must_haves backstop 'repository is created private' + threat T-01-20. Reason: GitHub branch protection/rulesets require a paid plan on private repos; developer declined GitHub Pro and declined stripping .planning/ first. Exposes .planning/ (full business plan), docs/*. Secret VALUES stay encrypted (verified not in git history). OWNER RATIFICATION + Phase 14 revisit (private+Pro, or accept public) — tracked in 01-UAT.md.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T20:07:06.886Z",
    "resolved_at": null
  },
  {
    "id": 7,
    "kind": "unrun-verify",
    "phase": "01",
    "file": "scripts/perf.mjs",
    "line": null,
    "description": "OPEN: local npm run perf does not complete a clean Lighthouse measurement against shopify theme dev — the theme dev proxy holds a connection open (network never idle, 45s page-load timeout) and chrome-launcher throws EPERM on Windows temp cleanup. Harness executes and collects artifacts. Fix in Phase 13 by targeting a deployed preview URL.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-08T20:51:49.193Z",
    "resolved_at": null
  },
  {
    "id": 8,
    "kind": "lint-warning",
    "phase": "02",
    "file": "layout/theme.liquid",
    "line": null,
    "description": "2 Theme Check AssetPreload warnings on the raw <link rel=preload> font tags — raw links chosen for explicit type/crossorigin/asset_url control and to satisfy the plan verify; npm run lint (--fail-level error) green, npm run lint:all shows the 2 warnings",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-09T13:21:02.288Z",
    "resolved_at": null
  },
  {
    "id": 9,
    "kind": "flaky-tool",
    "phase": "02",
    "file": "package.json",
    "line": null,
    "description": "OPEN (environmental, not a code defect): `shopify theme check` intermittently reports ~16 [error]: ValidSchema offences — all 'Unable to parse content from https://raw.githubusercontent.com/Shopify/theme-liquid-docs/.../theme_block.json | default_setting_values.json'. Theme Check failing to fetch/parse Shopify's REMOTE JSON schemas (GitHub raw rate-limit / transient); hits starter section files the 02-04 locale work never touched. Exit code flips between 0 (bundled-schema fallback, npm run lint green) and 1 on retry with no source change. The 3 deterministic Node checkers pass every run. CI uses theme-check-action on GitHub runners with clean githubusercontent access — unaffected. Revisit Phase 13 if it blocks local work; consider pinning schemas offline.",
    "status": "open",
    "reason": "",
    "recorded_at": "2026-09-09T00:00:00.000Z",
    "resolved_at": null
  }
]
````
