---
schema_version: 1
open_count: 4
waived_count: 0
fixed_count: 1
total_count: 5
last_updated: 2026-09-08T19:54:37.579Z
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
  }
]
````
