---
schema_version: 1
open_count: 2
waived_count: 0
fixed_count: 0
total_count: 2
last_updated: 2026-09-08T12:40:49.516Z
---

# Broken Windows Ledger

> Cross-phase defect register. With `workflow.windows_enforce` enabled, `/gsd-ship` blocks while `open_count > 0`.
> Waive with `gsd-tools windows waive <id> "<reason>"` (reason required).
> Mark fixed with `gsd-tools windows fixed <id>`.

| id | phase | kind | file | line | description | status | reason | recorded_at | resolved_at |
|----|-------|------|------|------|-------------|--------|--------|-------------|-------------|
| 1 | 01 | deviation | OVERRIDES.md |  | Archivos eliminados: el diff con el base tag muestra 4 archivos de gobernanza upstream nunca vendorizados por el scaffold; ninguna superficie de tema fue borrada | open |  | 2026-09-08T12:40:48.442Z |  |
| 2 | 01 | deviation | templates/index.json |  | index.json reescrito como JSON estricto (sin banner /* */) para que el verify del plan con require() resuelva | open |  | 2026-09-08T12:40:49.516Z |  |

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
  }
]
````
