---
phase: 01-repo-tema-base-y-workflow-foundation
verified: 2026-09-08T00:00:00Z
status: passed
status_history:
  - status: human_needed
    at: 2026-09-08T00:00:00Z
  - status: passed
    at: 2026-09-08T22:40:00Z
    by: "/gsd-verify-work 01 (human verification resolved; see human_verification_resolved)"
score: 7/7 must-have truths verified
behavior_unverified: 0
overrides_applied: 1
re_verification: false
overrides:
  - backstop: "T-01-20 / must_haves: 'repository is created private'"
    decision: "ACCEPT public through Etapa 1 launch"
    rationale: "GitHub rulesets are free on public repos; developer declined GitHub Pro and declined stripping .planning/. `.planning/` (CPA model, roadmap, research) is world-readable; secret VALUES verified absent from git history. Revisit Phase 14 (private + Pro, or accept permanently)."
    ratified_by: "developer — 01-UAT.md Test 2, 2026-09-08"
    recorded_in: ["01-UAT.md Test 2", "01-SECURITY.md AR-01-03", "WINDOWS.md entry 6", "docs/SHOPIFY-SETUP.md"]
human_verification_resolved:
  - test: "Confirm the LOCAL Lighthouse harness completes a real measurement (not just config-parses)."
    resolution: "RECLASSIFIED. The Phase-1 deliverable for FOUND-07 is the harness itself — Lighthouse config with hard asserts + PR workflow + provisioned secrets + written budget (docs/PERF-BUDGET.md) — all verified wired. A completed local measurement was attempted (`npm install` + `shopify theme dev` + `npm run perf`) but does not finish on Windows for two environment reasons (theme-dev proxy holds a hot-reload connection so Lighthouse network-idle never fires; chrome-launcher EPERM on Windows) — neither a theme defect. The correct end-to-end measurement points at a deployed STAGING preview URL and is explicitly Phase 13 ('Pasada de performance'). Developer ratified 2026-09-08 (01-UAT.md Test 1 → pass; also see deferred[]). "
    resolved_by: "developer — /gsd-verify-work 01, 2026-09-08"
  - test: "Ratify the repository-visibility decision + add a formal override entry."
    resolution: "RESOLVED. Developer ratified 'accept public through launch' (01-UAT.md Test 2). Formal override recorded above (overrides[]); accepted-risk recorded in 01-SECURITY.md AR-01-03; WINDOWS.md entry 6."
    resolved_by: "developer — 01-UAT.md Test 2, 2026-09-08"
security_note: "01-SECURITY.md audit (2026-09-08): 27/29 threats closed. T-01-21 (a hex fragment of SHOP_CLIENT_SECRET committed to the public repo at c4e4f06) is OPEN pending SHOP_CLIENT_SECRET rotation by the developer — tracked in SECURITY.md, blocks phase TRANSITION (not these requirement truths). Fragment scrubbed from the working tree; scripts/check-secrets.mjs added + wired to npm run lint."
deferred:
  - truth: "Lighthouse CI produces a completed performance measurement on every PR"
    addressed_in: "Phase 13"
    evidence: "ROADMAP Phase 13 'Pasada de performance'; 01-07-SUMMARY decision + docs/SHOPIFY-SETUP.md §FOUND-07 + WINDOWS.md entry 4: shopify/lighthouse-ci-action calls themeCreate which a self-serve Dev Dashboard app cannot (ACCESS_DENIED, needs a Shopify exemption). Lighthouse is intentionally NOT a required check so it cannot brick PRs. Local harness + wiring delivered in Phase 1."
  - truth: "CI enforces the hard LCP / CLS / JS-weight thresholds (not only the two Lighthouse category scores)"
    addressed_in: "Phase 13"
    evidence: "docs/PERF-BUDGET.md §'Dos harness, no uno' + WINDOWS.md entry 5: shopify/lighthouse-ci-action ignores custom lighthouserc assertions; the hard metric asserts run in the local harness only until Phase 13 decides whether a custom CI workflow is worth building."
  - truth: "Cart drawer, predictive search, DOM event bus and a11y helpers function"
    addressed_in: "Phases 3, 6, 11"
    evidence: "ROADMAP Phase 1 'Nota de desviacion' + ALLOWLIST.md §'Desviacion registrada — Criterio de exito 3' + PROJECT.md Key Decisions: Skeleton ships zero JS, so Success Criterion 3's literal wording is reframed. Cart drawer -> Phase 6, predictive search -> Phase 11, event bus + a11y helpers -> Phase 3. Ratified at the 01-01 decision checkpoint."
  - truth: "Repository visibility restored to private"
    addressed_in: "Phase 14"
    evidence: "01-07-SUMMARY 'Next Phase Readiness' + docs/SHOPIFY-SETUP.md + overrides[] above: accepted public for Etapa 1, revisit at the Phase 14 launch/handoff pass."
  - truth: "SHOP_CLIENT_SECRET rotated"
    addressed_in: "Phase 1 (pulled forward from Phase 14)"
    evidence: "01-SECURITY.md T-01-21: a secret fragment was committed to the public repo, so rotation moved from post-launch to now. OUTSTANDING developer action — rotate in the Dev Dashboard + `gh secret set`, then re-run /gsd-secure-phase 01. Blocks phase transition until done."
---

# Phase 1: Repo, tema base y workflow foundation — Verification Report

**Phase Goal:** El tema tiene una base elegida y registrada, vive en git con preview local, y estan la topologia STAGING/LIVE, el linting y el harness de performance para trabajar sin exponer un funnel roto a trafico pago.
**Verified:** 2026-09-08
**Status:** passed (was `human_needed` — both human-verification items resolved 2026-09-08; see frontmatter `human_verification_resolved`)
**Re-verification:** No — initial verification
**Transition note:** phase advancement remains blocked by `01-SECURITY.md` T-01-21 (pending `SHOP_CLIENT_SECRET` rotation), independent of these requirement truths.

## Goal Achievement

The phase goal is substantively achieved. The theme is scaffolded from the **Skeleton** base at
the repo root, the base-theme decision is recorded with a written tradeoff table, the repo lives
on GitHub with `main` + `staging` branches connected to a published `Kinelia — LIVE` theme and an
unpublished `Kinelia — STAGING` theme on `kinelia.myshopify.com`, `shopify theme dev` was proven
to serve all four allowlisted routes, the **Theme Check** lint gate is a real required status check
that was observed flipping a live merge from BLOCKED to mergeable, and the performance-budget
harness is fully wired (Lighthouse config with hard assertions + a PR workflow + provisioned
secrets + a written provenance-tagged budget document).

Two items need a human: (1) confirm the *local* Lighthouse harness actually completes a
measurement — no phase artifact evidences a completed run, only that the config parses; (2) ratify
the repository-visibility deviation (repo is PUBLIC, a documented but not-yet-formalized override
of the "create the repository private" backstop / threat T-01-20).

Three areas are legitimately deferred to later phases already named in the ROADMAP: end-to-end
Lighthouse CI execution and hard-metric CI enforcement (Phase 13), the JS cart-drawer / predictive
search / event-bus / a11y helpers (Phases 3/6/11), and repo-visibility + secret rotation (Phase 14).

### Observable Truths

| # | Truth (mapped requirement) | Status | Evidence |
| --- | --- | --- | --- |
| 1 | `shopify theme dev` serves this git repo locally against the dev store; `/`, `/products/*`, `/cart`, `/search` render (FOUND-01) | ✓ VERIFIED | 01-07-SUMMARY E2: automated `fetch` smoke — `/` 200 serving local `custom-section` (not stale "Generated test data"), `/products/the-complete-snowboard` 200, `/cart` 200, `/search` 200, all bodies >500 bytes — plus developer browser confirmation (no console errors). Dev store `kinelia.myshopify.com` independently confirmed reachable now via `shopify theme list`. Theme dirs are siblings of `.git/` at repo root. |
| 2 | Base-theme decision made with written tradeoffs; PROJECT.md Key Decisions updated, "Dawn despojado" entry replaced; PROJECT.md and CLAUDE.md consistent (FOUND-02) | ✓ VERIFIED | `.planning/PROJECT.md` Key Decisions row "Tema base: **Skeleton** … ✓ Tomada en Phase 1 (2026-09-07) · one-way" + 3-option tradeoff table (Skeleton chosen / Horizon fallback / Dawn rejected) + "Costo aceptado" naming Phases 3/5/6/11. `.claude/CLAUDE.md` (root + inner) state "construido sobre la base Skeleton"; Dawn appears only in historical/comparison context. `.planning/research/STACK.md` open-question struck through. |
| 3 | Base theme reduced by "no renderizar" allowlist (reframed SC3), no cart/a11y/search files deleted, enforced by an executable checker, `/cart` + `/search` resolve, Theme Check clean (FOUND-03) | ✓ VERIFIED | `ALLOWLIST.md` (3 tiers + §"Desviacion registrada — Criterio de exito 3", verbatim ROADMAP quote + named owners). `node scripts/check-allowlist.mjs` → exit 0 ("11 templates + 2 section-groups, 13 section types, 4 assets"); negatives re-run by verifier: unlisted section ref → exit 1, `.js` in `assets/` → exit 1. `git diff --diff-filter=D skeleton-base-a4f32d3 HEAD` over `sections/templates/snippets/assets/layout/locales/config/blocks` → empty (no theme-surface deletion). `sections/cart.liquid`, `sections/search.liquid`, `templates/cart.json`, `templates/search.json` present. `shopify theme check --fail-level error` → 41 files, 0 offenses, exit 0. `templates/index.json` references allowlisted `custom-section`. **Reframe (cart drawer→P6, predictive search→P11, event bus/a11y→P3) is a ratified documented deviation, not a miss.** |
| 4 | `upstream` remote to the base theme + a git tag pinning the exact upstream commit + `OVERRIDES.md` documenting every divergence (FOUND-04) | ✓ VERIFIED (minor doc nit) | `git remote get-url upstream` → `https://github.com/Shopify/skeleton-theme.git`. Tag `skeleton-base-a4f32d3` → `a4f32d393b9eadf6c4403318ca39116832e5d1df`. `OVERRIDES.md` at root: `## Base` (repo + pinned commit + tag + date), `## Archivos modificados` (5 rows, each with owning plan), `## Archivos eliminados` (no theme-surface deletion + governance-file note), `## Archivos nuevos`, `## Componentes portados` (empty, Phase 1), `## Reglas`. Reconciled against the real `git diff` in 01-04. **Nit:** `README.md` is listed under `## Archivos nuevos` but the base tag ships a `README.md`, so `git diff` shows it as `M` (modified), and the eliminados note calls it a non-vendored file shown as `D` — actually `M`. Cosmetic, non-blocking. |
| 5 | STAGING (unpublished) vs LIVE topology, release checklist, git as source of truth, content-ownership resolved (FOUND-05) | ✓ VERIFIED | `shopify theme list --json` → `Kinelia — LIVE` (150931210446) role `live`, `Kinelia — STAGING` (150931144910) role `unpublished`, **exactly 1 live** (IDs match). `docs/RELEASE.md`: `## Topologia`, `## Conexion rama ↔ tema (paso irreversible)`, `## Propiedad del contenido` (single owner = GitHub integration + named rejected alternative), `## Checklist de release` (7 gated steps citing `Theme Check` + `Lighthouse` + `docs/PERF-BUDGET.md`), `## Rollback`, `## Prohibiciones`, `## Autenticacion en CI` (`SHOPIFY_CLI_THEME_TOKEN`). `docs/SHOPIFY-SETUP.md` `## Temas` maps `main`→LIVE, `staging`→STAGING. Branch↔theme binding is developer-attested (01-07 E1, human_judgment) — themes + roles independently confirmed live by the verifier. |
| 6 | Theme Check runs locally AND on every PR as a required check that blocks a merge on a real offence (FOUND-06) | ✓ VERIFIED | Local: `npm run lint` = `shopify theme check --fail-level error && node scripts/check-allowlist.mjs` → exit 0 (re-run by verifier). CI: `.github/workflows/ci.yml` `on: pull_request` + push(main,staging), job name `Theme Check`, two-step (annotations action `continue-on-error` + explicit CLI gate). Rulesets `protect-main` (22575790) + `protect-staging` (22575793) both `active`, `required_status_checks` context `Theme Check`, `pull_request` required, `non_fast_forward`. **PR #1** (CLOSED, unmerged, branch `gate-proof-throwaway` deleted, 0 open PRs): commit `78327a8` → `Theme Check` check-run **failure**; commit `b319c78` → **success** (verified via `gh api …/check-runs`). Latest `main` CI runs green. |
| 7 | A performance-budget harness exists to measure Lighthouse mobile over a reference template (FOUND-07) | ✓ VERIFIED (existence + wiring; CI execution deferred to P13) | `lighthouse/lighthouserc.json` — LCP≤2500 (error), CLS≤0.1 (error), `categories:accessibility`≥0.95 (error), TBT≤200 (warn), `resource-summary:script:size`≤150000 (warn), mobile preset, 3 runs. `.github/workflows/lighthouse.yml` — `on: pull_request` (NOT `pull_request_target`), 25-min timeout, pinned `shopify/lighthouse-ci-action@v1` + `actions/checkout@v4`, creds only via `secrets.SHOP_STORE/CLIENT_ID/CLIENT_SECRET/PASSWORD`, `product_handle: the-complete-snowboard` (reference product). `gh secret list` → all four secrets exist. `docs/PERF-BUDGET.md` — every number + provenance, `resource-summary:script:size` flagged `SUPUESTO/ASSUMPTION`, ratchet to ≥0.9 mobile by Phase 13, CI-vs-local split, reference-target caveat. **See Human Verification #1** — the local harness has never been shown to complete a measurement. **CI execution blocked by a Shopify platform limitation → deferred to Phase 13 (documented).** |

**Score:** 7/7 must-have truths verified.

### Deferred Items

| # | Item | Addressed In | Evidence |
|---|------|-------------|----------|
| 1 | Lighthouse CI produces a completed measurement on every PR | Phase 13 | ROADMAP Phase 13; 01-07-SUMMARY decision; `themeCreate` `ACCESS_DENIED` (Dev Dashboard app lacks the Shopify exemption); Lighthouse intentionally not a required check |
| 2 | CI enforces hard LCP/CLS/JS-weight thresholds (not only category scores) | Phase 13 | `docs/PERF-BUDGET.md` §"Dos harness"; WINDOWS.md entry 5 — the action ignores custom lighthouserc assertions |
| 3 | Cart drawer / predictive search / DOM event bus / a11y helpers function | Phases 3, 6, 11 | ROADMAP Phase 1 "Nota de desviacion"; `ALLOWLIST.md` §"Desviacion registrada"; ratified at 01-01 checkpoint |
| 4 | Repo visibility back to private; `SHOP_CLIENT_SECRET` rotation | Phase 14 | 01-07-SUMMARY "Next Phase Readiness"; `docs/SHOPIFY-SETUP.md` |

### Required Artifacts

| Artifact | Expected | Status | Details |
| --- | --- | --- | --- |
| Theme dirs at repo root | Skeleton scaffold, siblings of `.git/` | ✓ VERIFIED | `assets blocks config layout locales sections snippets templates` all at root; no nested `.git` |
| `layout/theme.liquid`, `templates/product.json` | Skeleton shell + reference template | ✓ VERIFIED | Present; `templates/product.json` is the Lighthouse `product_handle` target's template |
| `.theme-check.yml` | `extends: theme-check:recommended`, no rule disabled | ✓ VERIFIED | Only `extends:` + KINELIA justification header; zero rules disabled |
| `.github/workflows/ci.yml` | Theme Check gate on `pull_request`, job name `Theme Check` | ✓ VERIFIED | Two-step job; job name verbatim; matched as required check by both rulesets |
| `.github/workflows/lighthouse.yml` | Perf gate on `pull_request`, secrets only | ✓ VERIFIED | `shopify/lighthouse-ci-action@v1`, `secrets.*` only, no `pull_request_target` |
| `lighthouse/lighthouserc.json` | LCP/CLS/a11y hard assertions | ✓ VERIFIED | Present; moved out of repo root in 01-07 so `lhci autorun` stops shadowing the action config |
| `package.json` | Dev-only tooling, no build step, `lint`/`perf` scripts | ✓ VERIFIED | Only `devDependencies: @lhci/cli`; no `dependencies`, no `build` script; `engines.node >=22.12` |
| `ALLOWLIST.md` | 3-tier surface contract + SC3 deviation | ✓ VERIFIED | `## Renderiza` / `## Presente, no renderiza` / `## Nunca agregar` / `## Regla de adicion` / `## Desviacion registrada` |
| `scripts/check-allowlist.mjs` | Executable enforcement, fails on unlisted section / JS in assets / heavy lib / vacuous scan | ✓ VERIFIED | Re-run by verifier: clean exit 0; unlisted-section and `.js`-in-assets negatives both exit 1 |
| `OVERRIDES.md` | Fork ledger: base + pinned commit + divergences | ✓ VERIFIED | All 6 sections present; minor README classification nit (see Truth 4) |
| `docs/RELEASE.md` | Topology, ownership, checklist, rollback, prohibitions | ✓ VERIFIED | All 8 sections present |
| `docs/PERF-BUDGET.md` | Budget numbers, provenance, ratchet, assumption flag | ✓ VERIFIED | CI-vs-local split, `SUPUESTO` flag, Phase 13 ratchet, reference-target caveat |
| `docs/SHOPIFY-SETUP.md` | External-setup record, names only | ✓ VERIFIED | `## Tienda / Repositorio / Aplicaciones / Secretos de Actions / Temas / Verificacion de gates / Pendiente`; no credential values |
| `README.md` | Clone → local preview + contract index | ✓ VERIFIED | `## Requisitos / Puesta en marcha / Comandos / Temas y ramas / Documentos del repositorio / Estructura`; Comandos table matches `package.json` scripts |

### Key Link Verification

| From | To | Via | Status | Details |
| --- | --- | --- | --- | --- |
| theme dirs | Shopify GitHub integration | folders at repo root | ✓ WIRED | All 8 at root; two themes connected + one published (attested + `shopify theme list`) |
| `ci.yml` job `Theme Check` | GitHub rulesets | `required_status_checks.context` | ✓ WIRED | Exact context string `Theme Check` in both `protect-main` + `protect-staging` |
| `lighthouse.yml` | GitHub Actions secrets | `secrets.SHOP_*` | ✓ WIRED | Four secrets exist by exact name; no literal in file |
| `package.json` `lint` | `scripts/check-allowlist.mjs` | script chains theme check + node checker | ✓ WIRED | Verified by running `npm run lint` (exit 0) |
| `OVERRIDES.md` | tag `skeleton-base-a4f32d3` | ledger names the pinned commit | ✓ WIRED | Tag resolves to the SHA named in `## Base` |
| `.claude/CLAUDE.md` | `.planning/PROJECT.md` | both state the same base theme | ✓ WIRED | Both say Skeleton; no live Dawn claim |
| branch `main` / `staging` | LIVE / STAGING themes | Shopify GitHub integration | ✓ WIRED (attested) | `shopify theme list`: LIVE role=live, STAGING role=unpublished; connection is developer-attested (permanent step) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
| --- | --- | --- | --- |
| Local lint gate exits 0 on clean tree | `shopify theme check --fail-level error && node scripts/check-allowlist.mjs` | 41 files, 0 offenses; `check-allowlist: OK` | ✓ PASS |
| Allowlist checker rejects unlisted section | inject `templates/_t.json` referencing `hello-world` | exit 1, "fuera del render allowlist" | ✓ PASS |
| Allowlist checker rejects JS in assets | `assets/_tmp_test.js` | exit 1, "JavaScript en assets/ no esta permitido" | ✓ PASS |
| Theme Check gate flips a real PR | `gh api …/commits/{78327a8,b319c78}/check-runs` | `Theme Check`: failure → success | ✓ PASS |
| Exactly one live theme | `shopify theme list --json` | LIVE count = 1 | ✓ PASS |
| Local Lighthouse harness completes a measurement | (not runnable — no `node_modules`, no url in config) | — | ? SKIP → Human Verification #1 |

### Probe Execution

No project probes declared for this phase (`scripts/*/tests/probe-*.sh` absent — the phase's runnable checks are `npm run lint` and the CI workflows, both exercised above).

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
| --- | --- | --- | --- | --- |
| FOUND-01 | 01-01, 01-06, 01-07 | Theme in git, previewed with `shopify theme dev` against a dev store | ✓ SATISFIED | Truth 1 |
| FOUND-02 | 01-01, 01-02 | Base-theme decision made + recorded, PROJECT.md updated | ✓ SATISFIED | Truth 2 |
| FOUND-03 | 01-04 | Base reduced by "no renderizar" allowlist, no cart/a11y deletion | ✓ SATISFIED | Truth 3 |
| FOUND-04 | 01-02 | `upstream` remote + `OVERRIDES.md` documenting each divergence | ✓ SATISFIED | Truth 4 |
| FOUND-05 | 01-05, 01-06, 01-07 | STAGING vs LIVE topology, release checklist, git as source of truth | ✓ SATISFIED | Truth 5 |
| FOUND-06 | 01-03, 01-06, 01-07 | Theme Check local + on every PR (`theme-check-action`) | ✓ SATISFIED | Truth 6 |
| FOUND-07 | 01-03, 01-06, 01-07 | Performance-budget harness for Lighthouse mobile over a reference template | ✓ SATISFIED (harness delivered; CI run deferred to P13) | Truth 7 |

All 7 requirement IDs from the ROADMAP phase contract and every plan's `requirements:` frontmatter are accounted for. Union of plan-declared IDs = FOUND-01..07 = ROADMAP phase requirements. **No orphaned requirements.**

### Prohibitions Check (negative must-haves)

| Prohibition | Verification tier | Result |
| --- | --- | --- |
| Never scaffold theme into a subdirectory | judgment | ✓ HELD — all 8 theme dirs are siblings of `.git/` |
| Never `git init` / remove `origin` / lose history | judgment | ✓ HELD — 39 commits, full pre-Phase-1 planning history intact |
| Never pick the base theme on executor judgement | judgment | ✓ HELD — developer resolved the 01-01 one-way-door checkpoint |
| Never install a SUS-flagged package before human confirmation | judgment | ✓ HELD — `@shopify/cli` and `@lhci/cli` both had legitimacy checkpoints answered `approved` |
| Never disable a performance-relevant Theme Check rule | judgment | ✓ HELD — `.theme-check.yml` disables zero rules |
| Never add a build step to `package.json` | judgment | ✓ HELD — no `build` script, no runtime `dependencies` |
| Never write a credential literal / echo a secret in a workflow | test-tier (no wired enforcement) | ✓ HELD by inspection — both workflows use `secrets.*` only; negative greps in 01-06/01-07 found no token prefixes in tree or history. Flagged: no automated secret-scan gate wired (acceptable for Phase 1). |
| Never use `pull_request_target` | judgment | ✓ HELD — both workflows use `pull_request` |
| Never delete a starter theme-surface file | judgment | ✓ HELD — `git diff --diff-filter=D` over theme dirs is empty (deleted files are all non-theme governance: `cla.yml`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`) |
| Never merge / leave open the throwaway PR | judgment | ✓ HELD — PR #1 CLOSED unmerged, branch deleted, 0 open PRs |
| Never publish the staging theme | judgment | ✓ HELD — `Kinelia — STAGING` role `unpublished` |
| **Never create the repository public** | judgment (backstop / threat T-01-20) | ⚠️ NOT HELD — repo is PUBLIC. Developer override with full disclosure during 01-07; recorded in `docs/SHOPIFY-SETUP.md` + `01-07-SUMMARY.md` and flagged for Phase 14. **NOT recorded as a dedicated `.planning/WINDOWS.md` ledger entry.** Routed to Human Verification #2 for formal ratification. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
| --- | --- | --- | --- | --- |
| (none) | — | No `TODO`/`FIXME`/`XXX`/`TBD`/`HACK`/`PLACEHOLDER` in any phase-modified file | ℹ️ Info | Clean |
| `OVERRIDES.md` | `## Archivos nuevos` / eliminados note | `README.md` classified as new; note says it shows as `D` — actually `M` vs base tag | ⚠️ Warning | Cosmetic ledger inaccuracy; divergence is still disclosed |
| store `kinelia.myshopify.com` | theme 150931472590 | leftover `Development (0f9eff-…)` theme from `shopify theme dev` | ℹ️ Info | Auto-expires ~7 days; noted in 01-07-SUMMARY for developer cleanup |
| `.planning/WINDOWS.md` | — | public-repo decision has no dedicated ledger row (entries 1–5 cover other items) | ⚠️ Warning | Traceability gap for the single most significant Phase 1 deviation; documented elsewhere |

### Human Verification Required

#### 1. Local Lighthouse harness actually measures

**Test:** `npm install`, then `shopify theme dev --store kinelia.myshopify.com` (password via `SHOPIFY_FLAG_STORE_PASSWORD`), then run the documented local perf procedure pointing lhci at `http://127.0.0.1:9292/products/the-complete-snowboard` with `--config=lighthouse/lighthouserc.json`.
**Expected:** Lighthouse completes 3 mobile runs and reports category + metric scores; the hard LCP/CLS/accessibility assertions are evaluated (pass or fail, but *evaluated*).
**Why human:** `node_modules` is not installed and `lighthouse/lighthouserc.json` declares no `url`/`staticDistDir`/`startServerCommand`, so `npm run perf` cannot run standalone. No phase artifact evidences a completed local Lighthouse run — only that the JSON parses. FOUND-07's CI half is a documented Phase 13 deferral; this confirms the *local* half is real.

#### 2. Ratify the public-repository deviation (T-01-20)

**Test:** Decide and record: accept the repo being PUBLIC through launch, or revert to private (+ GitHub Pro for rulesets, or strip `.planning/` first). Add a formal `overrides:` entry to this VERIFICATION.md and/or a dedicated `.planning/WINDOWS.md` row.
**Expected:** An explicit, recorded owner decision. Currently the decision lives only in `docs/SHOPIFY-SETUP.md` and `01-07-SUMMARY.md` narrative — not in the cross-phase defect ledger.
**Why human:** Business-plan exposure risk acceptance; only the repo owner can ratify. Already flagged for Phase 14 in the ROADMAP and summary.

### Gaps Summary

No blocking gaps. All 7 must-have truths are verified at the existence + wiring level, both quality
gates are proven live (Theme Check by a real failing→passing PR; the performance workflow runs,
authenticates, and reports its themeCreate limitation loudly rather than silently passing), the
STAGING/LIVE topology is real and correctly published, and the base-theme decision is recorded with
tradeoffs and kept in sync across PROJECT.md and CLAUDE.md.

The phase is not marked `passed` only because of two human-decision items: the local performance
harness has never been shown to complete a measurement (its CI counterpart is a legitimate,
documented Phase 13 deferral), and the repository-visibility deviation — the most consequential
divergence in the phase — needs formal owner ratification and is missing from the WINDOWS.md ledger.

Two cosmetic documentation inaccuracies in `OVERRIDES.md` (README.md new-vs-modified) are noted but
do not affect goal achievement.

---

_Verified: 2026-09-08_
_Verifier: Claude (gsd-verifier)_
