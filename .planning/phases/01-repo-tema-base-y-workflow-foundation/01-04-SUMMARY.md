---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 04
subsystem: infra
tags: [shopify, theme, allowlist, node-esm, overrides, skeleton]

requires:
  - phase: 01-01
    provides: "Skeleton theme scaffolded at repo root; base tag skeleton-base-a4f32d3"
  - phase: 01-02
    provides: "OVERRIDES.md seeded with pending placeholder rows"
  - phase: 01-03
    provides: "package.json with lint/lint:all/perf scripts; .theme-check.yml; .github/workflows/ci.yml; hardened .shopifyignore"
provides:
  - "ALLOWLIST.md — three-tier theme surface contract (Renderiza / Presente-no-renderiza / Nunca agregar) + Success Criterion 3 deviation with named owners"
  - "scripts/check-allowlist.mjs — machine enforcement: unlisted section types, JS in assets/, heavy-lib filenames, vacuous scan all fail"
  - "npm run lint now runs theme check AND the allowlist checker; npm run lint:allowlist runs the checker alone"
  - "templates/index.json home reduced by not referencing — hello-world demo swapped for the allowlisted custom-section shell"
  - "OVERRIDES.md reconciled against the real git diff with the base tag (CRLF noise excluded)"
affects: [01-05, 01-07, phase-03, phase-06, phase-07, phase-10, phase-11]

actuals:
  tokens: 7000
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Surface contract as prose (ALLOWLIST.md) + executable copy (scripts/check-allowlist.mjs); additions land in the same PR that adds the file"
    - "Reduce-by-not-referencing: no starter file deleted; unused templates/sections stay so routes always resolve"
    - "Theme template JSON parsed by stripping the Shopify /* */ banner and trailing commas before JSON.parse"

key-files:
  created:
    - "ALLOWLIST.md — theme surface contract + recorded Success Criterion 3 deviation"
    - "scripts/check-allowlist.mjs — Node-stdlib ESM allowlist + asset-prohibition checker"
  modified:
    - "templates/index.json — hello-world -> custom-section; rewritten as strict JSON"
    - "package.json — lint:allowlist script; lint chains theme check + allowlist checker"
    - ".shopifyignore — root-anchored /scripts/ so the checker is never pushed to a theme"
    - "OVERRIDES.md — reconciled Archivos modificados / eliminados / nuevos / Reglas"

key-decisions:
  - "Home shell is custom-section (the theme-block container), not a new placeholder section — it is the base of the multi-avatar system (Phases 7/10) and keeps the / route non-blank"
  - "RENDER_ALLOWLIST includes article/blog/collection/collections because their templates still resolve if navigated directly; only hello-world is rejected (re-referencing it, or any new unlisted section, fails the check)"
  - "OVERRIDES.md lists semantic divergences only — the plan-01-01 scaffold CRLF-normalized every theme file, which git diff shows as M; that noise is excluded and stated"
  - "The 4 upstream governance files the scaffold never vendored (cla.yml, CODE_OF_CONDUCT.md, CONTRIBUTING.md, starter README.md) are documented in OVERRIDES.md as not-vendored, not as theme-surface deletions"

patterns-established:
  - "Contract pair: every render change is recorded in ALLOWLIST.md; every starter-file change is recorded in OVERRIDES.md; both in the introducing PR"
  - "check-allowlist.mjs refuses to pass vacuously — zero templates found is a failure, not a success"

requirements-completed: [FOUND-03]

coverage:
  - id: D1
    description: "ALLOWLIST.md exists at repo root with Renderiza / Presente-no-renderiza / Nunca agregar / Regla de adición sections; every Renderiza row maps to a file present in the repo; cart and search surfaces listed"
    requirement: FOUND-03
    verification:
      - kind: automated
        ref: "test -f ALLOWLIST.md && grep -q '^## Renderiza' && grep '^## Presente, no renderiza' && grep '^## Nunca agregar' && grep '^## Regla de adición' && grep 'Desviación registrada' && grep 'Fase 6' && grep 'Fase 11' && grep 'Fase 3'"
        status: pass
    human_judgment: false
  - id: D2
    description: "scripts/check-allowlist.mjs enforces the render allowlist and asset prohibitions — exits 0 on the clean tree with a non-zero template count, exits non-zero on an unlisted section reference, JS in assets/, a heavy-lib filename, or a zero-template scan"
    requirement: FOUND-03
    verification:
      - kind: automated
        ref: "node scripts/check-allowlist.mjs (exit 0, '11 templates'); negative: injected hello-world ref -> exit 1; assets/jquery.min.js -> exit 1"
        status: pass
    human_judgment: false
  - id: D3
    description: "Home template reduced by not referencing — templates/index.json no longer references the hello-world demo section, references the allowlisted custom-section, parses as JSON, and its sections object is non-empty; sections/hello-world.liquid still present"
    requirement: FOUND-03
    verification:
      - kind: automated
        ref: "node -e require('./templates/index.json') sections non-empty; git diff --name-status base -- sections templates shows no D; test -f sections/hello-world.liquid"
        status: pass
    human_judgment: false
  - id: D4
    description: "No starter file deleted; cart and search section files present; git working tree free of deletions"
    requirement: FOUND-03
    verification:
      - kind: automated
        ref: "git status --porcelain | grep -c '^ D' == 0; git diff --name-status skeleton-base-a4f32d3 -- sections templates | grep '^D' -> none; test -f sections/cart.liquid && test -f sections/search.liquid"
        status: pass
    human_judgment: false
  - id: D5
    description: "OVERRIDES.md reconciled to the true state: real rows for every modified starter file naming the owning plan, explicit no-deletion statement, Archivos nuevos listing what exists now, Reglas binding the two contracts"
    requirement: FOUND-03
    verification:
      - kind: automated
        ref: "grep '^## Archivos modificados' && '^## Archivos eliminados' && 'ALLOWLIST.md' && 'theme-check' && 'lighthouse'; no pending placeholder for an existing file"
        status: pass
    human_judgment: false
  - id: D6
    description: "npm run lint exits 0 (theme check + allowlist checker) after all changes"
    requirement: FOUND-06
    verification:
      - kind: automated
        ref: "npm run lint -> '41 files inspected with no offenses found' + 'check-allowlist: OK', exit 0"
        status: pass
    human_judgment: false
  - id: D7
    description: "Once plan 01-07 has shopify theme dev running: /, /cart and /search each render a page (not blank/error) with no red console errors"
    requirement: FOUND-03
    verification: []
    human_judgment: true
    rationale: "Requires a live development store + shopify theme dev, provisioned in plans 01-06/01-07 — cannot be verified in this plan"

duration: 5min
completed: 2026-09-08
status: complete
---

# Phase 01 Plan 04: Render allowlist + OVERRIDES reconciliation Summary

**ALLOWLIST.md as the theme's three-tier surface contract, enforced by `scripts/check-allowlist.mjs` (fails on unlisted sections, JS in `assets/`, heavy-lib filenames, or a vacuous scan), the `hello-world` demo unreferenced from the home template without deleting it, and OVERRIDES.md reconciled against the real diff with the base tag.**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-09-08T12:33:04Z
- **Completed:** 2026-09-08T12:38:19Z
- **Tasks:** 3
- **Files modified:** 6 (2 created, 4 modified)

## Accomplishments

- `ALLOWLIST.md` written in Spanish: the reduce-by-not-referencing rule; `## Renderiza` (27 rows — layout, header/footer + groups, home/product/cart/search/page/404/password/gift_card, snippets, blocks, assets); `## Presente, no renderiza` (blog/article/collection/list-collections + `hello-world` + `shoppy-x-ray.svg`); `## Nunca agregar` (page-builders, frameworks, jQuery, heavy carousels, compile-step deps, unjustified `assets/` files, JS in Phase 1); `## Regla de adición`; and `## Desviación registrada — Criterio de éxito 3` quoting the ROADMAP criterion verbatim.
- `scripts/check-allowlist.mjs` — ES module, Node stdlib only, 2-space indent, double quotes, English comments / Spanish domain terms. Reads every `templates/*.json` and `sections/*-group.json`, strips the Shopify `/* */` banner + trailing commas, collects referenced section `type`s, and fails on: any type outside `RENDER_ALLOWLIST`, any `.js`/`.mjs` directly in `assets/`, any `assets/` filename containing jquery/swiper/react/vue/alpine, or zero templates found. `process.exitCode`, never `process.exit()`.
- `templates/index.json` reduced by not referencing: `hello-world` -> `custom-section` (allowlisted theme-block shell). Rewritten as strict JSON so `require()` in the plan verify resolves. `sections/hello-world.liquid` untouched in the repo.
- `package.json`: added `lint:allowlist`; `lint` now runs `shopify theme check --fail-level error && node scripts/check-allowlist.mjs`.
- `.shopifyignore`: root-anchored `/scripts/` entry.
- `OVERRIDES.md` reconciled — see Deviations for the accuracy note on the base-tag diff.

## Task Commits

1. **Task 1: Author ALLOWLIST.md — surface contract + recorded deviation** — `1cfe296` (docs)
2. **Task 2: Enforce the allowlist — unreference the demo section + add the checker** — `681fd1b` (feat)
3. **Task 3: Reconcile OVERRIDES.md against the true Phase 1 divergences** — `dd56e82` (docs)

**Plan metadata:** final `docs(01-04)` commit.

## Files Created/Modified

- `ALLOWLIST.md` (created) — theme surface contract + Success Criterion 3 deviation
- `scripts/check-allowlist.mjs` (created) — allowlist + asset-prohibition checker
- `templates/index.json` (modified) — hello-world -> custom-section, strict JSON
- `package.json` (modified) — `lint:allowlist` script; `lint` chains both gates
- `.shopifyignore` (modified) — root-anchored `/scripts/`
- `OVERRIDES.md` (modified) — reconciled all four sections + Reglas

## Final render allowlist (flat list)

`RENDER_ALLOWLIST` in `scripts/check-allowlist.mjs`:

```
custom-section, product, cart, search, page, 404, password, header, footer,
article, blog, collection, collections
```

`hello-world` is deliberately absent — re-referencing it (or any new unlisted section) fails the checker.

## Template references removed

- `templates/index.json`: `sections.main.type` changed from `hello-world` to `custom-section`; `order` unchanged (`["main"]`). No `order` entry needed removal because the single section was replaced, not deleted (an empty home route is a worse outcome — plan rule honored).
- No other template referenced a `## Presente, no renderiza` demo section. `blog.json` / `article.json` / `collection.json` / `list-collections.json` keep their real section references (their routes still resolve; nothing in Kinelia's funnel links to them).

## Recorded deviation text (verbatim, for phase verification)

> **Criterio de éxito 3 del ROADMAP, textual:**
> "El tema base quedó reducido por allowlist de 'no renderizar' (sin borrar modulos de carrito ni de accesibilidad): el cart drawer y predictive search funcionan, Theme Check corre limpio y Lighthouse a11y >= 95"
>
> **El hecho.** La base elegida y ratificada en el checkpoint de decisión del plan 01-01 es el **Skeleton theme** de Shopify. Skeleton **no trae cart drawer, no trae predictive search, y no trae utilidades de accesibilidad ni un bus de eventos DOM** (envía cero JavaScript). El criterio 3 fue escrito contra una base Dawn/Horizon donde esos módulos existen para ser preservados. Sobre Skeleton **no hay nada que despojar y nada que preservar**: el riesgo se invierte de "despojar de más" a "construir de menos y luego re-importar peso".
>
> **La reformulación.** En este proyecto, FOUND-03 significa: *"la base se mantiene mínima y un allowlist gobierna qué renderiza"*. La reducción se hace por no referenciar, se hace cumplir con `scripts/check-allowlist.mjs`, y ningún archivo del starter se borra.
>
> **Los dueños de los componentes diferidos.** Cada uno se porta **en estructura** desde los componentes open-source de Horizon (`github.com/Shopify/horizon`), cuya licencia se verifica en el momento del porting y se registra en `OVERRIDES.md`:
> - **Cart drawer -> Fase 6** (Bundle spike + selector + carrito + sticky ATC).
> - **Predictive search / búsqueda mínima -> Fase 11** (Home + páginas legales AR + 404 + búsqueda).
> - **Bus de eventos DOM + helpers de accesibilidad -> Fase 3** (Layout shell + seams de Etapa 2).
>
> **Qué verifica la Fase 1 en lugar del criterio como está escrito:** `/cart` resuelve a `sections/cart.liquid`; `/search` resuelve a `sections/search.liquid`; `shopify theme check --fail-level error` corre limpio; Lighthouse accessibility >= 0,95 sobre el template de referencia; `scripts/check-allowlist.mjs` sale con estado 0 y conteo de templates distinto de cero.
>
> **Naturaleza.** La verificación de la fase debe leer esto como una **decisión registrada, con dueños nombrados**, no como un incumplimiento.

## Decisions Made

- Home shell = `custom-section` (theme-block container), not a bespoke placeholder — it is the multi-avatar base and keeps `/` non-blank.
- `RENDER_ALLOWLIST` keeps `article/blog/collection/collections` (their templates resolve if navigated); only `hello-world` is rejected.
- OVERRIDES.md records semantic divergences only; the scaffold's CRLF normalization of every theme file (shows as `M` vs base) is excluded and stated.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Accuracy] OVERRIDES.md "Archivos eliminados" — the base-tag diff shows 4 deletions**
- **Found during:** Task 3 (reconciling against `git diff skeleton-base-a4f32d3`)
- **Issue:** The plan instructs `## Archivos eliminados` to state "Phase 1 deleted no starter file (none)". The real diff against the pinned base tag shows `D` for `.github/workflows/cla.yml`, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` and the starter's own `README.md`. Git history shows these were never committed to this repo — the plan-01-01 scaffold selectively vendored the theme and left the upstream open-source project-governance files behind (only `LICENSE.md` was kept for attribution).
- **Fix:** `## Archivos eliminados` now states plainly that **no theme-surface starter file was deleted** (the reduction is by not referencing) AND adds an accuracy note naming the 4 non-theme governance files the scaffold never vendored and why they show as `D`. This keeps the ledger true to `git` rather than to the plan's assumption.
- **Files modified:** `OVERRIDES.md`
- **Verification:** `git status --porcelain | grep -c '^ D'` = 0 (working tree clean of deletions); `git diff --name-status skeleton-base-a4f32d3 -- sections templates` shows modifications only.
- **Committed in:** `dd56e82` (Task 3 commit)

**2. [Rule 3 - Blocking] templates/index.json rewritten as strict JSON (comment banner dropped)**
- **Found during:** Task 2 (the plan's Task 2 `<verify>` runs `node -e "require('./templates/index.json')"`)
- **Issue:** The starter's `index.json` carries the Shopify `/* ... */` auto-generated banner. `require()` of a `.json` file with a leading block comment throws `Unexpected token '/'`, so the plan's own verify command would fail.
- **Fix:** Rewrote `index.json` as strict JSON (no banner, no trailing comma). Strict JSON is a valid Shopify template input; the theme editor re-adds its banner on edit if it ever touches the file.
- **Files modified:** `templates/index.json`
- **Verification:** `node -e "const t=require('./templates/index.json'); ..."` resolves; `shopify theme check` clean; `check-allowlist.mjs` OK.
- **Committed in:** `681fd1b` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 accuracy/Rule 1, 1 blocking/Rule 3)
**Impact on plan:** Both keep the deliverables true to reality (git state, working verify commands). No scope change — the allowlist, checker and reconciled ledger are exactly what the plan specified.

## Issues Encountered

- `git diff` against the base tag reports nearly every theme file as modified; `--ignore-all-space` confirmed this is CRLF normalization from the plan-01-01 scaffold, not semantic change. Resolved by scoping OVERRIDES.md to semantic divergences and documenting the CRLF noise explicitly.

## User Setup Required

None — no external service configuration in this plan.

## Next Phase Readiness

- FOUND-03 satisfied in the form the Skeleton base allows: reduced by allowlist + not referencing, enforced by a script, no cart/search/a11y surface deleted, Success Criterion 3 reframe on the record with named owners (Phases 3, 6, 11).
- `npm run lint` is now the single local gate for both Theme Check and the allowlist.
- Deferred to plan 01-07: load `/`, `/cart`, `/search` in `shopify theme dev` and confirm each renders without console errors (needs a live dev store).
- Plan 01-05 appends its `README.md` and `docs/RELEASE.md` rows to `OVERRIDES.md` (currently marked pending).

## Self-Check: PASSED

- Files verified present: `ALLOWLIST.md`, `scripts/check-allowlist.mjs`, `01-04-SUMMARY.md`
- `templates/index.json`, `package.json`, `.shopifyignore`, `OVERRIDES.md` modifications verified in `dd56e82` / `681fd1b`
- Commits verified in history: `1cfe296`, `681fd1b`, `dd56e82`
- `node scripts/check-allowlist.mjs` exit 0; `npm run lint` exit 0; `git status --porcelain` free of `^ D`

---
*Phase: 01-repo-tema-base-y-workflow-foundation*
*Completed: 2026-09-08*
