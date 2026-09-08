---
phase: "01"
slug: "repo-tema-base-y-workflow-foundation"
# threats_open = count of OPEN threats at or above workflow.security_block_on (high)
threats_open: 0
asvs_level: 1
created: "2026-09-08"
updated: "2026-09-08"
---

# Phase 01 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.
> Register authored at plan time across `01-01`…`01-07-PLAN.md`. Verified 2026-09-08
> by `gsd-security-auditor` (State B — first SECURITY.md for the phase). ASVS L1,
> `block_on: high`.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| npm registry → dev machine | A globally-installed CLI runs with the developer's privileges | Executable code |
| github.com/Shopify/skeleton-theme → this repo | Third-party source becomes the base of every later file | Source code |
| repo root → Shopify GitHub integration | Theme paths sync to a Shopify store | Theme code / config |
| `staging` branch → published live theme | The merge is the only path code reaches paid traffic | Theme code |
| pull request → protected branch (rulesets) | Branch protection is all that stands between a red check and a merge | Merge authority |
| GitHub Actions job → Dev Dashboard credentials | The Lighthouse job holds store credentials at run time | `SHOP_*` secrets |
| human ↔ agent conversation | Credentials pasted in chat must reach a secret store and nowhere else | `SHOP_CLIENT_SECRET` |
| GitHub repo → public internet | The repo is PUBLIC (ratified) — `.planning/` and config are world-readable | Business plan, config |

---

## Threat Register

| Threat ID | Category | Component | Severity | Disposition | Mitigation | Status |
|-----------|----------|-----------|----------|-------------|------------|--------|
| T-01-SC | Tampering | `@shopify/cli` + `@lhci/cli` install | high | mitigate | Blocking-human legitimacy gate before install; `postinstall` null; public npm registry only; `package-lock.json` = 331/331 resolved from `registry.npmjs.org` | closed |
| T-01-01 | Tampering | Skeleton starter clone | medium | mitigate | Clone from official URL only; clone `.git/` deleted (0 nested `.git`); Theme Check clean before commit `56cd221` | closed |
| T-01-02 | Elevation of privilege | pre-existing `.git/` | medium | mitigate | No `git init` / remote removal; 47 commits, first commit `b8a6777` intact, reflog unbroken | closed |
| T-01-03 | Information disclosure | scaffold commit | low | accept | Starter ships no secrets; `.gitignore:16-20` covers `.env` / `.env.*` before any credential existed | closed (accepted) |
| T-01-04 | Spoofing | `upstream` git remote | medium | mitigate | `git remote -v` → exactly one `upstream` pair at the official `skeleton-theme.git` URL | closed |
| T-01-05 | Tampering | `.claude/CLAUDE.md` | medium | mitigate | Only `GSD:project-start` block edited; all 7 marker pairs intact | closed |
| T-01-06 | Repudiation | undocumented divergence from starter | medium | mitigate | `OVERRIDES.md` ledger; pinned base tag `skeleton-base-a4f32d3`; same-PR rule | closed |
| T-01-07 | Elevation of privilege | `lighthouse.yml` PR job | high | mitigate | `on: pull_request` (no `pull_request_target` anywhere in `.github/`); first-time-contributor approval in `docs/RELEASE.md`. *Residual: register text cites "private repo" — that leg voided by T-01-20; the `pull_request`-not-`pull_request_target` control still holds.* | closed |
| T-01-08 | Information disclosure | Dev Dashboard credentials in CI | high | mitigate | All four values `${{ secrets.* }}`; workflow has no `run:` step → no echo path; `.gitignore` covers env files | closed |
| T-01-09 | Denial of service | Lighthouse job hang | low | mitigate | `timeout-minutes: 25` on the job | closed |
| T-01-10 | Tampering | weakened lint config | medium | mitigate | `.theme-check.yml` extends `theme-check:recommended`, zero rules disabled; perf-relevant rules held at recommended | closed |
| T-01-11 | Denial of service | deleted starter module still subscribed elsewhere | medium | mitigate | No deletions in Phase 1; `git diff skeleton-base..HEAD` → 0 theme-surface deletions; `cart.liquid` + `search.liquid` present | closed |
| T-01-12 | Tampering | unreviewed additions to `assets/` | medium | mitigate | `scripts/check-allowlist.mjs` fails on JS in `assets/` + heavy-library filenames; allowlist row required in same PR. *Residual: only local `npm run lint` runs it — the required CI `Theme Check` job does not (L2 enforcement-boundary gap).* | closed |
| T-01-13 | Information disclosure | demo/unused starter routes reachable | low | accept | Starter demo surfaces carry no data; unreferenced; dev store password-protected until Phase 14 | closed (accepted) |
| T-01-14 | Repudiation | base divergence drifting undocumented | medium | mitigate | Ledger independently reconciled against the real `git diff` vs the pinned base tag — `M` / `D` sets match `OVERRIDES.md` exactly | closed |
| T-01-15 | Tampering | direct push to published theme from a laptop | high | mitigate | Two prohibitions with reasons in `docs/RELEASE.md:117-128`; rollback path + release checklist documented; `README.md:79`. *Residual: README topology summary points at the runbook rather than restating the prohibition.* | closed |
| T-01-16 | Repudiation | automatic theme-editor commits on `staging` | medium | mitigate | Single named owner for settings/template JSON; runbook says review those diffs, do not accept reflexively | closed |
| T-01-17 | Information disclosure | credential pasted into a runbook as example | high | mitigate | Explicit prohibition covering example values; `git grep` for Shopify token prefixes → 0 hits tree-wide | closed |
| T-01-18 | Denial of service | branch disconnected from its theme, unrecoverable | high | mitigate | Irreversibility is a named section of `docs/RELEASE.md`; connection step gated at 01-07 Task 2 | closed |
| T-01-19 | Information disclosure | client secret in transit through the agent | high | mitigate | Secret read from stdin into `gh secret set`, never as an arg / echoed / written to a file; `secrets-set-manually` bypass offered. *See T-01-21 — the secret still transited a chat and a fragment was later committed.* | closed |
| T-01-21 | Information disclosure | credential fragment committed to a public repo | high | mitigate + accept | `.gitignore` covers env files (✅). A raw hex fragment (`4cbe71cfd82`, 11 chars) of `SHOP_CLIENT_SECRET`, used as a `git log` grep needle, was committed at `c4e4f06` (`01-07-SUMMARY.md:224`), world-readable. **Remediated 2026-09-08:** fragment scrubbed from the working tree; `scripts/check-secrets.mjs` added (env-sourced needle, working-tree + `git log -p --all` scan) and wired into `npm run lint`; **`SHOP_CLIENT_SECRET` rotated by the developer** → the historical fragment now protects nothing. Residual (the fragment stays in the immutable public git history, and the rotated value transited a chat) → **accepted risk AR-01-05**: mandatory final rotation at Phase 14 before the store goes public / takes traffic. | closed (mitigated + accepted) |
| T-01-20 | Information disclosure | public repository | high | accept | Planned mitigation ("repo created private") deliberately NOT applied. Ratified: `01-UAT.md` Test 2 "Aceptar público hasta el lanzamiento"; `WINDOWS.md` entry 6 (full disclosure, secret values verified absent from history); `docs/SHOPIFY-SETUP.md` Phase-14 revisit | closed (accepted) |
| T-01-22 | Tampering | force-push destroying pre-Phase-1 history | medium | mitigate | Explicit prohibition; commit-count + reflog assertions; both rulesets carry `non_fast_forward`. *Residual: prohibition lives only in `01-06-PLAN.md`, no repo-facing doc.* | closed |
| T-01-23 | Elevation of privilege | Shopify GitHub app broader scope than needed | low | accept | Integration requires repo write to commit editor changes back; no narrower scope exists; launch review recorded | closed (accepted) |
| T-01-24 | Elevation of privilege | branch protection with a mistyped check name | high | mitigate | Live API verified: both rulesets `enforcement: active`, `required_status_checks` context = `"Theme Check"`, byte-identical to `ci.yml:28`. Blocking proven: PR #1 `78327a8` red → BLOCKED, `b319c78` green. *See T-01-30 — admin bypass on the same rulesets.* | closed |
| T-01-25 | Tampering | staging branch connected to the published theme | high | mitigate | Mapping table in `docs/RELEASE.md` + `SHOPIFY-SETUP.md`; `shopify theme list` → exactly 1 live theme | closed |
| T-01-26 | Information disclosure | unlisted staging preview link with test prices | medium | mitigate | Theme stays `role: unpublished` (✅). Clickable `?preview_theme_id=…` link + theme IDs removed from `docs/SHOPIFY-SETUP.md` (2026-09-08); a note tells readers to get IDs from `shopify theme list`. Residual: theme IDs remain in `.planning/**` git history (low sensitivity — not a secret, enumerable from the store domain); the storefront is password-protected so no preview yields content pre-launch. **Follow-up: delete the stale `Development` theme from the store (or let it auto-expire ~7 days).** | closed (mitigated; residual accepted) |
| T-01-27 | Information disclosure | credentials exposed in a workflow run log | high | mitigate | Perf workflow reads credentials as secrets only, no `run:` / echo step; verification PR #1 originated from an in-repo branch, never a fork. *Residual: register text cites "private repo" — leg voided by T-01-20; GitHub still withholds secrets + downgrades `GITHUB_TOKEN` for fork `pull_request` runs.* | closed |
| T-01-28 | Repudiation | a gate recorded as satisfied without evidence | medium | mitigate | Acceptance criteria required run URLs + an observed blocked merge; the Lighthouse-CI finding was recorded as an open finding (Phase 13), not passed over | closed |
| T-01-29 | Denial of service | throwaway verification PR left open | low | mitigate | `gh pr list --state open` → 0; remote heads = only `main` + `staging`; throwaway branch deleted | closed |
| T-01-30 | Elevation of privilege | ruleset admin bypass on both protected branches | medium | accept (pending developer sign-off) | NEW — surfaced by the auditor, not in the plan-time register. Live API: `bypass_actors: [RepositoryRole admin, bypass_mode: always]` + `required_approving_review_count: 0` on `protect-main` and `protect-staging`. A repo admin can merge with `Theme Check` red, self-merge unreviewed, and override `non_fast_forward` silently. Solo-developer repo pre-launch → low practical exposure. **Action: developer decides accept (document in `SHOPIFY-SETUP.md:34`, revisit at Phase 14 when the team grows) or tighten (drop the admin bypass, require 1 review).** | open — below high threshold (non-blocking) |

*Status: open · closed · open — below high threshold (non-blocking)*
*Severity: critical > high > medium > low — only open threats at or above `high` count toward `threats_open`*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| AR-01-01 | T-01-03 | Skeleton starter ships no secrets; `.gitignore` hardening landed in 01-03 before any credential existed | developer (plan disposition) | 2026-09-07 |
| AR-01-02 | T-01-13 | Unreferenced starter demo routes carry no data; store is a password-protected dev store until Phase 14 | developer (plan disposition) | 2026-09-07 |
| AR-01-03 | T-01-20 | Repo stays PUBLIC through launch — GitHub rulesets are free on public repos; developer declined GitHub Pro and declined stripping `.planning/`. `.planning/` (CPA model, roadmap, research) is world-readable; secret *values* verified absent from git history. Revisit at Phase 14 (back to private + Pro, or accept permanently). | developer — `01-UAT.md` Test 2, 2026-09-08 | 2026-09-08 |
| AR-01-04 | T-01-23 | Shopify GitHub app needs repo write to commit editor changes back; no narrower scope exists. Reviewed again at launch. | developer (plan disposition) | 2026-09-07 |
| AR-01-05 | T-01-21 | `SHOP_CLIENT_SECRET` is the Dev Dashboard "Kinelia Lighthouse CI" app secret — it powers only the Lighthouse CI GitHub Action, not the storefront, checkout, MercadoPago, or customer data. The 11-char fragment in git history (`c4e4f06`) is dead after rotation (~44 bits, non-exploitable even when live). The rotated value transited a chat turn once and stays in that transcript. Blast radius today: a defacement path into a password-protected, pre-launch dev store with no real data. **Conditions of acceptance: (1) `SHOP_CLIENT_SECRET` MUST be rotated a final time at Phase 14 and set via `gh secret set` stdin — never chat; (2) the store must not be un-password-protected / take real traffic before that Phase-14 rotation; (3) `scripts/check-secrets.mjs` stays in `npm run lint`.** | developer — 2026-09-08 (explicit, this session) | 2026-09-08 |

**Phase 14 launch gate (carried from AR-01-05):** final `SHOP_CLIENT_SECRET` rotation + `SHOP_CLIENT_ID`/`SHOP_PASSWORD` review, and repo-visibility decision (AR-01-03), before the store leaves password protection.

*T-01-30 (ruleset admin bypass) still needs an explicit accept/tighten decision — non-blocking, carried to Phase 2 or the Phase 14 gate.*

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-09-08 | 30 | 27 | 3 (1 blocking: T-01-21 · 2 non-blocking: T-01-26, T-01-30) | `gsd-security-auditor` (opus) + orchestrator |
| 2026-09-08 (update) | 30 | 28 | 2 non-blocking (T-01-26, T-01-30) | orchestrator — T-01-21 resolved: secret rotated + `check-secrets.mjs` + AR-01-05; `threats_open: 0` |

### Notes carried forward

- **`## Threat Flags`**: no summary in `01-01`…`01-07` produced a Threat Flags section — the executor-side flag channel contributed zero coverage this phase. Every finding came from direct implementation inspection.
- **`package-lock.json` untracked** (`git status` → `?? package-lock.json`): the audited dependency tree is not pinned in the repo. Track it, or accept per-machine re-resolution of `@lhci/cli: ^0.15.1`.
- **CI global install unpinned**: `.github/workflows/ci.yml:51` runs `npm install -g @shopify/cli` with no version and no lockfile on every PR — T-01-SC's human legitimacy gate covered only the dev-machine install.
- **T-01-12 enforcement boundary**: `check-allowlist.mjs` runs only in local `npm run lint`, not in the required CI `Theme Check` job. Move it into CI to close the L2 gap.

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log (T-01-30 explicitly carried as a non-blocking follow-up)
- [x] `threats_open: 0` confirmed — T-01-21 closed (mitigated: secret rotated + `check-secrets.mjs`; residual accepted as AR-01-05)
- [x] Phase 14 launch gate recorded (AR-01-05: final secret rotation + repo-visibility before the store takes traffic)

**Approval:** verified 2026-09-08 — `threats_open: 0`. Non-blocking follow-ups (T-01-26, T-01-30, T-01-12 CI boundary, lockfile note) carried forward.
