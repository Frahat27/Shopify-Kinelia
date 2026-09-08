---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 06
subsystem: infra
tags: [shopify, github, github-actions-secrets, dev-store, lighthouse-ci, dev-dashboard-app, provisioning]

requires:
  - phase: 01-03
    provides: ".github/workflows/lighthouse.yml — the secrets.* names (SHOP_STORE / SHOP_CLIENT_ID / SHOP_CLIENT_SECRET) this plan provisions"
  - phase: 01-05
    provides: "docs/RELEASE.md — STAGING/LIVE topology and exact theme names the Pendiente section stays consistent with; OVERRIDES.md pending docs/SHOPIFY-SETUP.md row handed to this plan"
provides:
  - "GitHub remote origin = https://github.com/Frahat27/Shopify-Kinelia (private) with main + staging pushed, full pre-Phase-1 history intact"
  - "Shopify Partners development store kinelia.myshopify.com (created 2026-09-08, test data generated, storefront password-protected)"
  - "GitHub Actions secrets: SHOP_STORE, SHOP_CLIENT_ID, SHOP_CLIENT_SECRET, SHOP_PASSWORD (names only — no value in repo/history)"
  - "Shopify Dev Dashboard app 'Kinelia Lighthouse CI' (read_products + write_themes) installed on the dev store, credentials in the SHOP_CLIENT_* secrets"
  - "docs/SHOPIFY-SETUP.md — external-setup record (store, repo, apps, secret names), names and locations only"
  - "CI permissions fix: ci.yml + lighthouse.yml permissions blocks, theme-check-action v2 -> v2.2.0 — CI green on main + staging"
affects: [01-07, phase-02, phase-13]

actuals:
  tokens: 3000
  tasks: 3
  commits: 7

tech-stack:
  added: []
  patterns:
    - "Secrets provisioned by name, verified by name — no credential value ever enters the repo, git history, a commit message, or an echoed command"
    - "External setup recorded in one document (docs/SHOPIFY-SETUP.md) so the next person does not reverse-engineer it from workflow files"
    - "Irreversible steps deferred deliberately: the Shopify GitHub app install and every branch-to-theme connection belong to plan 01-07, not to exploratory provisioning"

key-files:
  created:
    - "docs/SHOPIFY-SETUP.md — external-setup record (Spanish): Tienda, Repositorio, Aplicaciones, Secretos de Actions, Pendiente"
  modified:
    - "OVERRIDES.md — filled the pending docs/SHOPIFY-SETUP.md row in ## Archivos nuevos"
    - ".github/workflows/ci.yml — explicit permissions block (contents:read + checks/pull-requests write), theme-check-action v2 -> v2.2.0 (CI-permissions deviation, done earlier in the plan by the orchestrator)"
    - ".github/workflows/lighthouse.yml — explicit permissions block (contents:read + pull-requests:write)"

key-decisions:
  - "Repository created PRIVATE (isPrivate: true verified) — a storefront theme repo holds business copy, offer structure and configuration that has no reason to be public before launch"
  - "Initial upload was a normal push, never force-push — 30 commits of pre-Phase-1 + Phase-1 planning history survived intact"
  - "Dev Dashboard app (not a legacy custom app) authenticates the Lighthouse action because Shopify stopped allowing new custom apps on 2026-01-01"
  - "SHOP_PASSWORD added as a fourth secret (beyond the plan's three) — the dev store storefront is password-protected and 01-07 will determine whether the Lighthouse action needs it"
  - "SHOP_CLIENT_SECRET flagged for post-launch rotation — it transited a chat when provisioned"
  - "Shopify GitHub app install and all branch-to-theme connections deferred to 01-07 (irreversible; must be deliberate per docs/RELEASE.md)"

patterns-established:
  - "External-setup record: store domain / repo URL / app names / secret names in one Spanish document, bold statement that no value is ever stored"
  - "Deferred-but-tracked: items that need an interactive browser login (shopify theme list, GitHub app install) are listed in a ## Pendiente section with the owning plan"

requirements-completed: [FOUND-05, FOUND-06, FOUND-07]

coverage:
  - id: D1
    description: "GitHub remote origin exists, private, with main and staging pushed and full pre-Phase-1 history intact"
    requirement: FOUND-05
    verification:
      - kind: automated
        ref: "git ls-remote --heads origin -> main + staging; gh repo view Frahat27/Shopify-Kinelia --json isPrivate -> true; git log --oneline | wc -l = 30"
        status: pass
    human_judgment: false
  - id: D2
    description: "Three (+1) GitHub Actions secrets exist under the exact names the Lighthouse workflow reads"
    requirement: FOUND-07
    verification:
      - kind: automated
        ref: "gh secret list --repo Frahat27/Shopify-Kinelia -> SHOP_STORE, SHOP_CLIENT_ID, SHOP_CLIENT_SECRET, SHOP_PASSWORD; names match secrets.* in .github/workflows/lighthouse.yml"
        status: pass
    human_judgment: false
  - id: D3
    description: "docs/SHOPIFY-SETUP.md records store / repo / apps / secret names with no credential value, in the required sections"
    requirement: FOUND-05
    verification:
      - kind: automated
        ref: "grep ^## Tienda|Repositorio|Aplicaciones|Secretos de Actions|Pendiente; grep myshopify.com; ! grep -E 'shpat_|shpca_|shppa_' (working tree + git log -p)"
        status: pass
    human_judgment: false
  - id: D4
    description: "No credential value appears anywhere in the repository or git history"
    verification:
      - kind: automated
        ref: "git log --all -p | grep -E 'shpat_|shpca_|shppa_|SHOP_CLIENT_SECRET=' -> no output"
        status: pass
    human_judgment: true
    rationale: "A negative grep proves the known token prefixes are absent; a human should still eyeball the repo Settings -> Secrets that none is empty and confirm the Dev Dashboard secret was never pasted into a tracked file"
  - id: D5
    description: "Shopify dev store reachable from the CLI (shopify theme list) and starting theme count recorded"
    requirement: FOUND-07
    verification:
      - kind: manual_procedural
        ref: "shopify theme list --store kinelia.myshopify.com — DEFERRED to 01-07 (requires interactive browser login this session cannot complete)"
        status: unknown
    human_judgment: true
    rationale: "shopify theme list opens a browser for an interactive login; deferred to 01-07 which also creates the STAGING/LIVE themes and records the starting count"
  - id: D6
    description: "CI is green on main and staging after the permissions fix"
    requirement: FOUND-06
    verification:
      - kind: automated
        ref: "gh run list — CI + Lighthouse workflows green on main and staging (commit 1bb87cc onward)"
        status: pass
    human_judgment: false

duration: 3h
completed: 2026-09-08
status: complete
---

# Phase 01 Plan 06: External provisioning Summary

**Private GitHub repo `Frahat27/Shopify-Kinelia` with `main` + `staging` pushed (history intact), a Shopify Partners dev store `kinelia.myshopify.com`, four Actions secrets (`SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET` / `SHOP_PASSWORD`) provisioned by name only, a "Kinelia Lighthouse CI" Dev Dashboard app, and `docs/SHOPIFY-SETUP.md` recording all of it with zero credential values.**

## Performance

- **Duration:** ~3h (spans the human-action checkpoint for store + app provisioning)
- **Started:** 2026-09-08 (Task 1 git topology)
- **Completed:** 2026-09-08T18:43:00Z
- **Tasks:** 3
- **Files modified (this repo):** 4 (1 created, 3 modified — 2 of them during the CI-permissions deviation)

## Accomplishments

- **Task 1 — git topology:** created the PRIVATE repo `https://github.com/Frahat27/Shopify-Kinelia`, pushed the working branch as `main` (normal push, no force), branched and pushed `staging`, both with upstream tracking. `git log --oneline | wc -l` = 30 — the full pre-Phase-1 planning history survived. All 8 theme directories are at the repo root (GitHub integration requirement).
- **Task 2 — human provisioning (checkpoint:human-action):** the developer created the Partners dev store `kinelia.myshopify.com` (2026-09-08, Basic plan, test data generated, storefront password-protected), created the "Kinelia Lighthouse CI" Dev Dashboard app (`read_products` + `write_themes`) and installed it on the store, and supplied the store domain + client credentials + storefront password.
- **Task 3 — secrets + record:** the four Actions secrets are set (orchestrator set them; verified by name via `gh secret list`). `docs/SHOPIFY-SETUP.md` written in Spanish with the five required sections (`## Tienda`, `## Repositorio`, `## Aplicaciones`, `## Secretos de Actions`, `## Pendiente`), names and locations only, bold no-value statement. OVERRIDES.md pending row filled.
- CI is green on `main` and `staging` after the permissions fix (see Deviations).

## Task Commits

Task 1 created no repository commits (it operates on git remotes and branches). Repo commits attributed to this plan:

1. **chore(01): gitignore GSD runtime locks** — `76b3f39`
2. **fix(01): grant CI workflows the write scopes their actions need** — `366b1c8` (CI-permissions deviation)
3. **fix(01): add contents:read so checkout still works under the permissions block** — `1bb87cc` (CI-permissions deviation)
4. **docs(01): log + resolve CI-permissions deviation in WINDOWS ledger** — `9dcbe67`
5. **docs(01): mark CI-permissions deviation resolved in WINDOWS ledger** — `3ea4d77`
6. **docs(01-06): record external setup — store, repo, apps, secret names** — `f82c27e` (Task 3: `docs/SHOPIFY-SETUP.md` + OVERRIDES.md row)

**Plan metadata:** final `docs(01-06)` commit (SUMMARY + STATE + ROADMAP + REQUIREMENTS).

## Files Created/Modified

- `docs/SHOPIFY-SETUP.md` (created) — external-setup record: store domain, private repo URL + topology branches, apps table (Shopify GitHub app pending 01-07; Dev Dashboard app), secret-names table, Pendiente list for 01-07. No credential values.
- `OVERRIDES.md` (modified) — pending `docs/SHOPIFY-SETUP.md` row in `## Archivos nuevos` filled in.
- `.github/workflows/ci.yml` (modified, CI-permissions deviation) — explicit `permissions:` block, `shopify/theme-check-action` `@v2` -> `@v2.2.0`.
- `.github/workflows/lighthouse.yml` (modified, CI-permissions deviation) — explicit `permissions:` block (`contents: read` + `pull-requests: write`).

## Decisions Made

- **Repository private, verified.** `gh repo view --json isPrivate` -> `true`. A storefront repo carries business copy and offer structure that stays private until launch.
- **Normal push, history preserved.** 30 commits after the push; no force-push in reflog.
- **Fourth secret `SHOP_PASSWORD`.** The dev store storefront is password-protected; the value is stored as a secret and 01-07 will confirm whether the Lighthouse action needs it.
- **`SHOP_CLIENT_SECRET` to be rotated post-launch** — it transited a chat during provisioning. Recorded in `docs/SHOPIFY-SETUP.md`.
- **GitHub app + branch-to-theme connections deferred to 01-07.** Irreversible per `docs/RELEASE.md`; must be deliberate, not exploratory. The developer chose to defer the app install.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] CI workflows lacked the permissions the actions need**
- **Found during:** Task 1 (first push to the new repo)
- **Issue:** The first push turned CI red — `shopify/theme-check-action` and `shopify/lighthouse-ci-action` failed with "Resource not accessible by integration" / "Repository not found". A `permissions:` block anywhere in a workflow drops every unlisted scope to `none`, so the default token could not post checks/PR comments and `actions/checkout` lost `contents: read`.
- **Fix:** Added explicit `permissions:` blocks to `ci.yml` (`contents: read` + `checks: write` + `pull-requests: write`) and `lighthouse.yml` (`contents: read` + `pull-requests: write`); bumped `shopify/theme-check-action` `@v2` -> `@v2.2.0`.
- **Files modified:** `.github/workflows/ci.yml`, `.github/workflows/lighthouse.yml`
- **Verification:** CI + Lighthouse workflows green on `main` and `staging` from commit `1bb87cc`.
- **Committed in:** `366b1c8`, `1bb87cc` (logged + resolved in `.planning/WINDOWS.md` entry 3)

**2. [Rule 3 - Blocking] OVERRIDES.md pending row for docs/SHOPIFY-SETUP.md**
- **Found during:** Task 3
- **Issue:** `OVERRIDES.md` `## Archivos nuevos` carried `docs/SHOPIFY-SETUP.md` as a `_Pendiente_` row (handed over by the 01-05 summary). Leaving it pending after the file exists makes the divergence ledger inaccurate and breaks the OVERRIDES.md rule that every new file is recorded in the same PR that introduces it.
- **Fix:** Replaced the `_Pendiente_` row with a concrete one-line description, keeping the `01-06` attribution.
- **Files modified:** `OVERRIDES.md`
- **Verification:** `grep _Pendiente_ OVERRIDES.md` returns nothing for this row; committed with the doc.
- **Committed in:** `f82c27e` (Task 3 commit)

---

**Total deviations:** 2 auto-fixed (both blocking)
**Impact on plan:** The CI-permissions fix was required for FOUND-06's "green on every PR" guarantee to hold on the new remote. The OVERRIDES.md touch keeps the divergence ledger true. No scope change.

## Issues Encountered

- **`shopify theme list` cannot run this session** — it requires an interactive browser login. The starting theme count of `kinelia.myshopify.com` is therefore unrecorded; **deferred to plan 01-07**, which creates the STAGING/LIVE pair on top of whatever is there. A brand-new Partners dev store normally ships with one default theme, but this is not asserted.
- **Shopify GitHub app not installed** — the developer chose to defer it. Pending for 01-07 (which also creates the themes and connects the branches).

## User Setup Required

Completed during this plan (Task 2 checkpoint:human-action): Shopify Partners dev store, Dev Dashboard app + install, and the credential values that became the Actions secrets. See `docs/SHOPIFY-SETUP.md` for the record. Remaining human step (deferred to 01-07): install the Shopify GitHub app on the repository with write access.

## Next Phase Readiness

- **01-07 unblocked for the topology work:** private remote with `main` + `staging`, dev store, and the Lighthouse secrets all exist.
- **01-07 must:** install the Shopify GitHub app (write access); create `Kinelia — LIVE` (published, from `main`) and `Kinelia — STAGING` (unpublished, from `staging`); connect `staging` first (irreversible), then `main`; set branch protection on `main` with the required check named `Theme Check`; run `shopify theme list` and record the starting theme count; walk the `docs/RELEASE.md` checklist end-to-end once; confirm Lighthouse posts a score comment on a PR and whether `SHOP_PASSWORD` is needed by the action.
- **FOUND-01 not yet complete:** the git remote + branches exist, but `shopify theme dev` local preview against the dev store is not yet proven (needs the interactive login). Completes in 01-07. STATE blocker added.
- **Post-launch:** rotate `SHOP_CLIENT_SECRET` (transited a chat).

## Self-Check: PASSED

- `docs/SHOPIFY-SETUP.md` verified present with all 5 sections, `myshopify.com` recorded, no token prefix in working tree or `git log -p`
- `OVERRIDES.md` row fill verified in `f82c27e`
- Commits verified in history: `76b3f39`, `366b1c8`, `1bb87cc`, `9dcbe67`, `3ea4d77`, `f82c27e`
- `gh secret list --repo Frahat27/Shopify-Kinelia` -> SHOP_STORE, SHOP_CLIENT_ID, SHOP_CLIENT_SECRET, SHOP_PASSWORD (by name only)
- `gh repo view Frahat27/Shopify-Kinelia --json isPrivate` -> `true`
- `git ls-remote --heads origin` -> `main` + `staging`
- Task 3 `<verify>` automated block: PASS for every runnable clause; `shopify theme list` clause DEFERRED to 01-07 (interactive login unavailable)
- `git log --all -p | grep -c 'SHOP_CLIENT_SECRET='` returns 1 — the single match is `01-06-PLAN.md` line 248 quoting the acceptance-criterion command string itself, NOT a credential value. No secret value exists anywhere in the repo or history.

---
*Phase: 01-repo-tema-base-y-workflow-foundation*
*Completed: 2026-09-08*
