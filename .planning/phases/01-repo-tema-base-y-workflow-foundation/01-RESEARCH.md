# Phase 1: Repo, tema base y workflow foundation - Research

**Researched:** 2026-09-07
**Domain:** Shopify custom theme scaffolding + Git/CLI workflow + STAGING/LIVE topology + Theme Check CI + Lighthouse performance harness
**Confidence:** HIGH for toolchain and base-theme decision; MEDIUM for the exact shape of the "strip" deliverable (see §4) and Lighthouse-CI auth under the Jan-2026 custom-app change.

---

## Summary

Phase 1 has one irreversible decision (the base theme) and a set of well-documented plumbing tasks around it. The plumbing is low-risk: Shopify CLI 4.x, `shopify theme init` from the Skeleton starter, the Shopify GitHub integration for a STAGING (unpublished) + LIVE (published) theme pair, the `Shopify/theme-check-action@v2` that the Skeleton repo already ships, and the official `Shopify/lighthouse-ci-action` for the performance budget. None of that needs invention — it needs to be wired correctly and documented.

The base-theme decision has effectively resolved since the project-level research was written. Shopify's own "Create a theme" tutorial now names **the Skeleton theme (`Shopify/skeleton-theme`) as the starting point for custom theme development**, `shopify theme init` clones it by default, and **Horizon is the default theme for newly created stores** (replacing Dawn). Dawn is the legacy OS 2.0 reference (2-level block nesting). For a heavily-customized, CVR-first, multi-avatar theme where every pre-built Horizon preset section is ballast, **Skeleton is the firm recommendation**, with Horizon-stripped as the fallback for a team that wants a pre-built cart drawer / variant picker / predictive search on day one.

The one thing the planner must confront: **Skeleton ships ~15 Liquid files and zero JavaScript — no cart drawer, no predictive search, no `pubsub`/`a11y` modules.** Success Criterion 3 ("el cart drawer y predictive search funcionan") and requirement FOUND-03 ("sin borrar módulos de carrito ni de accesibilidad") were written against a Dawn/Horizon base where those modules exist to be preserved. On Skeleton there is nothing to strip and nothing to preserve — the risk inverts from *over-stripping* to *under-building*. §4 gives the planner two concrete ways to reconcile this.

**Primary recommendation:** Base = Skeleton theme, cloned to the repo root via `shopify theme init`. Wire GitHub integration (`main`→LIVE published, `staging`→STAGING unpublished), keep Skeleton's `.theme-check.yml` + `theme-check-action@v2`, add `Shopify/lighthouse-ci-action` asserting a mobile perf budget + `accessibility ≥ 0.95` against a reference **product** template. Reframe FOUND-03 as "keep Skeleton lean; cart drawer / predictive search / a11y are build items in later phases (ported from the open-source Horizon web components), not strip items."

---

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| FOUND-01 | El tema vive en este repo git y se previsualiza localmente con `shopify theme dev` contra una dev store | §2 (CLI 4.x, Node 22.12+, `shopify theme init`/`theme dev`, dev store from Partners). Local env has Node 24.14 + Git 2.53 — CLI is the only missing tool. |
| FOUND-02 | Decisión de tema base tomada y registrada, PROJECT.md actualizado | §1 + §3. Skeleton officially recommended; Horizon = new-store default; Dawn = legacy. Tradeoff table ready to paste into PROJECT.md Key Decisions. **Also update `.claude/CLAUDE.md`** (still says "construido sobre Dawn"). |
| FOUND-03 | Base reducida por "no renderizar" (allowlist), sin borrar módulos de carrito ni de accesibilidad | §4. On Skeleton there is nothing to strip. Reframe: keep lean, do not re-import Dawn/Horizon bloat; cart drawer + predictive search + a11y = later-phase build items. Alternative: pick Horizon and strip it literally as written. |
| FOUND-04 | Remote `upstream` al tema base + `OVERRIDES.md` por cada divergencia | §5. `upstream` = `github.com/Shopify/skeleton-theme`; Skeleton changes rarely so the merge treadmill is light; document divergences anyway for the "we own this fork" posture. |
| FOUND-05 | Topología STAGING (no publicado) vs LIVE, checklist de release, git como fuente de verdad | §3. GitHub integration: 1 branch ↔ 1 theme, connects to unpublished themes. `main`→LIVE, `staging`→STAGING. Editor writes `settings_data.json` + template JSON back to the branch — ownership rule required. |
| FOUND-06 | Theme Check local + en cada PR (`theme-check-action`) | §6. Skeleton already ships `.theme-check.yml` (`extends: theme-check:recommended`) and `.github/workflows/ci.yml` using `shopify/theme-check-action@v2`. `shopify theme check` locally. **Do not `npm install @shopify/theme-check` — that package does not exist.** |
| FOUND-07 | Harness de presupuesto de performance: Lighthouse mobile sobre un template de avatar | §7. `Shopify/lighthouse-ci-action` (official). Must pass a product handle + pull JSON templates so it measures a **product** page, not just home. Assert LCP + `min_score_accessibility: 0.95`. Local: `@lhci/cli autorun` or Chrome Lighthouse incognito, mobile throttle, 3-run median. |

---

## Project Constraints (from CLAUDE.md)

**From `Shopify-Kinelia/.claude/CLAUDE.md` (storefront project) and `Kinelia/.claude/CLAUDE.md` (parent, backend):**

- **GSD workflow enforcement** — the executor must work through GSD commands (`/gsd-execute-phase`, `/gsd-quick`), not make direct repo edits. Applies to this phase's scaffolding work.
- **Tech stack locked:** Shopify + Liquid; HTML/CSS/JS nativo, **sin frameworks frontend pesados**; no mandatory build step. `[VERIFIED: Shopify-Kinelia/.claude/CLAUDE.md:15]`
- **Performance is a hard constraint:** LCP < 2,5 s mobile, presupuesto de JS ajustado. Phase 1 must stand up the harness that measures this. `[VERIFIED: .claude/CLAUDE.md:16]`
- **Single funnel** (native Shopify checkout only) — not a Phase 1 concern but do not scaffold anything that forks it.
- **Idioma:** español (AR) user-facing; **código y comentarios en inglés salvo términos de dominio** (`avatar`, `oferta`, `creativo`, etc.). `[VERIFIED: .claude/CLAUDE.md:19]`
- **File naming (parent CLAUDE.md):** kebab-case lowercase for all files. 2-space indent, no tabs. Double quotes in JS/TS. These apply to any tooling config / scripts added this phase.
- **`.claude/CLAUDE.md` "## Project" still says "un tema custom construido sobre Dawn"** — this is stale and must be corrected in the same PR as the PROJECT.md Key Decisions update (FOUND-02). The GSD `<!-- GSD:project-start -->` / `<!-- GSD:stack-start -->` blocks are generated from PROJECT.md / research/STACK.md, so update the source docs and regenerate.
- **Sibling repo `Kinelia`** holds the Supabase backend + `web/kinelia-atribucion.js`. Phase 3 reserves the `analytics-hooks.liquid` seam; **Phase 1 touches none of it.**

Treat these with the same authority as locked decisions.

---

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|--------------|----------------|-----------|
| Theme source of truth | Git repo (this repo) | Shopify theme store copy | Code lives in git; Shopify holds a synced copy per the GitHub integration. Editor content (`settings_data.json`, template JSON) is the contested boundary — §3. |
| Local preview | Developer machine (`shopify theme dev`) | Shopify dev store | CLI proxies a local render against a hidden development theme on a dev store. |
| STAGING deploy | Shopify unpublished theme ← `staging` branch | GitHub integration | Unpublished theme, preview-link only, never indexed. |
| LIVE deploy | Shopify published theme ← `main` branch | GitHub integration + release checklist | Only a reviewed, deliberate merge to `main` reaches paid traffic. |
| Lint gate | `Shopify/theme-check-action` (CI) | `shopify theme check` (local / pre-commit) | Same engine (bundled in CLI), two entry points. |
| Performance gate | `Shopify/lighthouse-ci-action` (CI, PR comment) | `@lhci/cli` / Chrome Lighthouse (local) | Runs Lighthouse against a preview theme on each PR; asserts score/metric budgets. |
| Cart drawer / predictive search / a11y | **Later phases** (theme code, ported from Horizon web components) | — | Not present in Skeleton. Phase 6 = cart drawer; Phase 11 = minimal search. Not a Phase 1 deliverable if base = Skeleton. |

---

## 1. Base Theme Decision — Skeleton vs Horizon vs Dawn (2026)

### Verified 2026 landscape

| Fact | Evidence | Confidence |
|------|----------|------------|
| Shopify's "Create a theme" tutorial uses **the Skeleton theme** as the starting point for custom theme development; `shopify theme init` clones `github.com/shopify/skeleton-theme` | `[CITED: shopify.dev/docs/storefronts/themes/getting-started/create]` (fetched this session) | HIGH |
| Skeleton is "a minimal, carefully structured Shopify theme… modularity, maintainability, and Shopify's best practices"; the repo README asks contributors to keep it "as lean, lightweight, and fundamental as possible" | `[VERIFIED: github.com/Shopify/skeleton-theme/README.md]` (fetched this session) | HIGH |
| **Horizon** (Summer 2025 editions) is now **the default theme for newly created Shopify stores**, replacing Dawn; ships 9 free sibling presets on one "Horizon Base" engine; theme blocks nested up to 8 levels; adds group blocks + Shopify Magic block generation | `[CITED: changelog.shopify.com/posts/horizon-10-new-free-themes-by-shopify]` + multiple 2026 practitioner sources (craftshift, pagefly, gempages) | MEDIUM-HIGH |
| **Dawn** uses section-blocks capped at ~2 nesting levels; blocks are not shareable across section types; it is the legacy OS 2.0 reference | project research/STACK.md + practitioner sources | MEDIUM-HIGH |
| Theme block nesting depth: **8 levels excluding the section level**; 25 sections / JSON template; 50 blocks / section; 1,000 JSON templates / theme; 300 theme-block files / theme; statically-rendered `{% content_for %}` blocks do **not** count toward per-section/template limits | `[VERIFIED: shopify.dev/docs/storefronts/themes/architecture/limits]` (fetched this session) | HIGH |
| `content_for` / theme blocks / cross-section reuse — treated as standard (no beta disclaimer) in current docs | `[CITED: shopify.dev/docs/storefronts/themes/architecture/blocks/theme-blocks]` | MEDIUM-HIGH |
| Metaobject-in-theme-block-settings and native "Get metaobject(s)" blocks — **not re-verified this session**; Horizon-specific claims are practitioner-sourced. This is a **Phase 4 / Phase 7** concern, not Phase 1. | — | LOW — flag for later |

### What Skeleton actually contains (verified this session)

`[VERIFIED: github.com/Shopify/skeleton-theme git tree, main]`

```
assets/          critical.css, icon-account.svg, icon-cart.svg, shoppy-x-ray.svg   ← ZERO .js files
blocks/          group.liquid, text.liquid                                          ← 2 primitives only
config/          settings_data.json, settings_schema.json
layout/          theme.liquid, password.liquid
locales/         en.default.json, en.default.schema.json
sections/        404, article, blog, cart, collection, collections, custom-section,
                 footer(+footer-group.json), header(+header-group.json), hello-world,
                 page, password, product, search
snippets/        css-variables.liquid, image.liquid, meta-tags.liquid
templates/       404, article, blog, cart, collection, gift_card.liquid, index,
                 list-collections, page, password, product, search   (all .json except gift_card)
.theme-check.yml           extends: theme-check:recommended
.github/workflows/ci.yml   shopify/theme-check-action@v2, on: [push]
.github/workflows/cla.yml
.gitignore                 ignores .shopify/, node_modules/, release, *.zip, OS files
.shopifyignore             present, empty (examples only)
.gitattributes
(no package.json)
```

- `sections/cart.liquid` is a **cart *page*** section. There is **no cart *drawer***, no `cart-drawer.js`, no `cart-notification`.
- `sections/search.liquid` is a basic search results page. There is **no predictive search** component.
- There is **no `pubsub.js`, no `global.js`, no `a11y.js`, no variant picker, no `product-form` custom element.**
- `blocks/` has only `group` and `text` — the "angle block library" for the multi-avatar system (Phase 7) is built from scratch on this base.

### Recommendation: **Skeleton theme** (build up), Horizon-stripped as fallback

**Why Skeleton:**
1. **It is now literally Shopify's documented answer to "I want to build a custom theme."** Starting a 2026 custom build on Dawn means starting on the wound-down architecture.
2. **The multi-avatar system is a theme-blocks + metaobject pattern.** Skeleton is built on the same modern block architecture as Horizon (8-level nesting, `content_for`), with none of Horizon's 9 preset sections to disable.
3. **Performance budget (FOUND-07, PERF-01).** Skeleton starts at ~zero JS and one `critical.css`. Hitting LCP < 2.5 s is a matter of what you *add*, not what you failed to remove. Stripping Horizon means auditing and disabling a large surface and still carrying its web-component runtime.
4. **You own the fork cleanly.** Skeleton is a starter, not a theme you track upstream — its churn is minimal, so FOUND-04's `upstream`/merge discipline is lightweight insurance, not a maintenance tax (contrast: a Dawn fork accumulates hundreds of merge conflicts over 6–12 months — project research/PITFALLS.md Pitfall 2).

**Cost / risk of Skeleton (be honest — the planner must plan for this):**
- **No pre-built buy box, cart drawer, variant picker, predictive search, quantity/section-rerender plumbing, or `pubsub`/`a11y` utilities.** These become explicit build tasks in Phases 3, 5, 6, 11. Mitigation: port structure (not a fork) from the open-source **Horizon** repo (`github.com/Shopify/horizon`) and Dawn's `cart-drawer` as references.
- **FOUND-03 / Success Criterion 3 cannot be met verbatim on Skeleton** ("cart drawer y predictive search funcionan"). See §4 for the two reconciliation options.
- Theme-blocks third-party `@app` block ecosystem is younger than Dawn's — irrelevant for Etapa 1 (no apps in the theme), reserve `@app` slots for Etapa 2.

**Fallback: Horizon, stripped.** Choose this only if the team wants a working cart drawer + variant picker + predictive search + a11y modules on day one and accepts (a) auditing/disabling ~9 preset sections and unused blocks by not-rendering, (b) carrying the Horizon web-component runtime weight, (c) a heavier theme-editor model. If Horizon is chosen, FOUND-03 becomes literally executable as written (strip by not-rendering, keep the cart/a11y modules). **Do not** choose a Dawn fork as the fallback — 2-level blocks make the multi-avatar block library copy-paste duplication (PITFALLS.md Pitfall 5), and Dawn is legacy.

**Tradeoff table to paste into PROJECT.md Key Decisions (replacing "Dawn despojado + secciones custom"):**

| Option | Multi-avatar fit | Perf baseline | Build effort | Maintenance | Verdict |
|--------|------------------|---------------|--------------|-------------|---------|
| **Skeleton (build up)** | Native (8-level theme blocks, `content_for`) | Best (≈0 JS to start) | Highest (build cart drawer, variant picker, search, a11y) | Own the fork, minimal upstream churn | **Chosen** |
| Horizon (strip down) | Native (same block engine) | Medium (strip 9 presets, carry WC runtime) | Medium (disable, don't build) | Upstream churn you won't pull | Fallback if pre-built components wanted now |
| Dawn (strip down) | Poor (2-level section-blocks, no cross-section reuse) | Medium | Medium | Legacy base, frozen | Rejected — legacy + multi-avatar becomes duplication |

---

## 2. `shopify theme dev` + dev store (FOUND-01)

### Toolchain versions (verified this session)

| Tool | Required | Local machine | Action |
|------|----------|---------------|--------|
| Shopify CLI | **4.x** (`shopify version` → `4.0.0` in current docs) | **not installed** | `npm install -g @shopify/cli@latest` `[CITED: shopify.dev/docs/api/shopify-cli]` |
| Node.js | **22.12 or higher** `[CITED: shopify.dev/docs/api/shopify-cli]` | **v24.14.0** ✓ | none |
| Git | **2.28+** (CLI 4.0 requirement) `[CITED: kaspianfuad.com/blog/shopify-cli-cheat-sheet — secondary]` | **2.53.0** ✓ | none |
| Ruby | **not required** — the standalone Ruby `theme-check` gem is legacy; Theme Check is bundled in the CLI (Node) `[CITED: shopify.dev/docs/storefronts/themes/tools/theme-check]` | — | none |

> CLI 4.0 (released ~May 2026) self-upgrades via the package manager by default and **skips self-upgrade inside CI** `[CITED: kaspianfuad.com — secondary, MEDIUM]`. Pin the CLI version in CI (`@shopify/cli@4`) for reproducibility.

### Flow

1. **`shopify theme init kinelia-theme`** clones Skeleton → or `git clone` Skeleton and re-init git. `[VERIFIED: skeleton README]`
   - Theme files must end up at the **repo root** (not a subdir) for the GitHub integration — see §3, §7.
2. **`shopify theme dev --store kinelia-dev.myshopify.com`** starts a local preview server against a hidden development theme. First run opens a browser for **interactive Partner/store login** — this cannot be scaffolded headlessly.
3. **Dev store**: created from a **Shopify Partners** account (Partners dashboard → Stores → Add store → Development store). User-provided; the executor cannot create it.
4. `shopify theme dev` hot-reloads CSS + section edits. Use `--theme-editor-sync` only when iterating on JSON templates so the local copy and the editor stay aligned (it two-way syncs `templates/*.json` + `config/*.json`).

### What can proceed without a store vs. what needs the user

| Can scaffold now (no store) | Needs user / interactive |
|-----------------------------|--------------------------|
| Clone Skeleton to repo root; commit | `shopify theme dev` first login (Partner account) |
| Write `.theme-check.yml` tweaks, CI workflows, `lighthouserc`, README release checklist, `OVERRIDES.md` | Creating the Partner **development store** |
| Add `upstream` remote, tag base commit | Creating STAGING + LIVE themes in the store |
| `.gitignore` / `.shopifyignore` additions (`.env`, `.planning/` is fine to keep — the GitHub integration only reads known theme dirs) | Connecting branches via the Shopify GitHub app |
| `package.json` for dev-only tooling (lhci) | Dev Dashboard app credentials for Lighthouse-CI + Theme Access token for any CLI-based CI |
| Local `shopify theme check` (works offline) | GitHub **remote** for this repo (currently local-only — `git remote` is empty) |

---

## 3. Git ⇄ Shopify topology (FOUND-05)

### Shopify GitHub integration — verified behavior

`[CITED: shopify.dev/docs/storefronts/themes/tools/github]` + `[CITED: community.shopify.dev / shopify.dev version-control]` (fetched this session)

- **One branch ↔ one theme, permanently.** "You can't reconnect a branch to a theme after it has been disconnected." Separate themes for dev/staging/live = separate branches.
- **Works with unpublished themes** — connect a branch to an unpublished theme for STAGING.
- **Two-way sync:** push to the branch → Shopify theme updates; edits in the Shopify admin (theme editor, code editor, theme apps) → auto-committed back to the branch (commit names the shop + last editor). Expect `config/settings_data.json` and `templates/*.json` write-backs.
- **Repo layout requirement:** theme dirs (`assets/ blocks/ config/ layout/ locales/ sections/ snippets/ templates/`) must be at the **repository root**, not nested. A branch with a build step must contain the compiled theme.
- **Access:** requires the Shopify GitHub app installed + write access to the repo. GitHub *outside collaborators* cannot connect branches.

### Recommended topology

| Branch | Theme | Published? | Updated by |
|--------|-------|-----------|------------|
| `main` | **Kinelia — LIVE** | Yes | Reviewed merge to `main` only, in a maintenance window, via the release checklist |
| `staging` | **Kinelia — STAGING** | No (preview link only) | Every merged PR; QA target |
| _(local, ephemeral)_ | **Development** theme (auto-created by `shopify theme dev`) | No | `shopify theme dev` on the dev store |

- **Git is the source of truth for code** (`.liquid`, `.css`, `.js`, schema JSON).
- **Content-ownership rule (decide + document this phase):** the theme editor writes `settings_data.json` + `templates/*.json` back to the connected branch. Pick one:
  - **(a) GitHub integration owns it** — operator edits STAGING in the theme editor → auto-commits to `staging` → PR to `main`. Cleanest; requires the branching discipline above. **Recommended.**
  - **(b) Git owns it, editor is read-through** — operator edits are periodically `shopify theme pull`-ed back into git on a documented cadence. Higher drift risk.
- **Never `shopify theme push` to LIVE from a laptop.** Releases go through the branch merge.
- The `.shopifyignore` file only affects **CLI** operations (`push`/`pull`/`dev`), **not** the GitHub integration.

### Release checklist (starter — put in `README.md` or `docs/RELEASE.md`)

1. PR green: `theme-check-action` ✓, `lighthouse-ci-action` ✓ (no perf/a11y regression).
2. STAGING preview-link QA: cart page, checkout reachable, `?view=` alternate templates render, no console errors, Theme Check clean.
3. Lighthouse mobile (throttled) on the reference **product** template: LCP < 2.5 s, CLS < 0.1, a11y ≥ 95.
4. Confirm no half-built section is referenced by a LIVE template.
5. Merge `staging` → `main` in a low-traffic window. Watch the Shopify GitHub-integration commit land + theme update.
6. Smoke the published storefront. Tag the release (`git tag`).

---

## 4. "Strip by not rendering" (FOUND-03) — the reconciliation

**The problem:** FOUND-03 and Success Criterion 3 say the base is "reduced by an allowlist of not-rendering, **without deleting cart or accessibility modules**; the cart drawer and predictive search work." That sentence assumes a Dawn/Horizon base where `cart-drawer.js`, `predictive-search.js`, `pubsub.js`, `a11y.js` exist. **Skeleton has none of them** (§1, verified). On Skeleton there is nothing to strip and nothing to accidentally delete.

**Option A (recommended — base = Skeleton): reframe the deliverable.**
- FOUND-03 becomes: *"The theme is and stays minimal. No Dawn/Horizon preset sections, unused blocks, demo content, or heavy JS are imported. The section/template set is limited to an allowlist of what Kinelia needs. Cart drawer, predictive search, and a11y/pubsub utilities are recognized as **build items owned by later phases** (Phase 6 cart drawer, Phase 11 minimal search, Phase 3 event bus + a11y helpers), to be ported in structure from the open-source Horizon components — not stripped."*
- Phase 1 verification for FOUND-03:
  - `sections/` and `templates/` contain only allowlisted files (delete or gitignore Skeleton's `hello-world.liquid`, `custom-section.liquid`, `article`/`blog`/`collection(s)`/`list-collections` if the roadmap has no blog/collection surface — **keep** `cart`, `product`, `page`, `search`, `404`, `header`, `footer`, `password`).
  - `assets/` has no JS beyond what Phase 1 adds (none) — no framework, no jQuery.
  - `shopify theme check` clean (§6).
  - Lighthouse **accessibility ≥ 95** on the reference template (Skeleton's near-empty pages score high by default; this guards against regressions as sections are added). `[CITED: Shopify/lighthouse-ci-action default min_score_accessibility 0.9 — raise to 0.95]`
  - Cart **page** (`/cart`) and search **page** (`/search`) render without error. (Drawer + predictive = later.)
- Write an **`ALLOWLIST.md`** (or a section in `OVERRIDES.md`): which Skeleton files were kept, which removed, and the rule "additions must be justified against the CVR/perf budget."

**Option B: base = Horizon, strip literally.**
- Keep Horizon's `cart-drawer`, `predictive-search`, `pubsub`/`a11y` web components untouched.
- Strip by **not-rendering**: remove preset sections from JSON templates, remove nav links, but keep the section/snippet/JS files in the repo until proven unused. Never edit Horizon's core CSS/JS in place (PITFALLS.md Pitfall 2, 3).
- Before removing any JS file: grep for `customElements.define`, the selectors it owns, and its `pubsub` subscribers (PITFALLS.md Pitfall 1).
- FOUND-03 verification is then exactly as written: cart drawer opens on add-to-cart, count bubble updates, quantity `+/-` does an AJAX section re-render, `aria-live` announces cart changes, keyboard focus trapped in the drawer; predictive search returns results; Theme Check clean; Lighthouse a11y ≥ 95.

**Recommendation:** Option A. The multi-avatar + perf arguments for Skeleton outweigh the convenience of inheriting Horizon's components, and porting ~2 web components (cart drawer, predictive search) across Phases 6/11 is a bounded, well-referenced task. **Flag this to the user in discuss-phase** — it changes what "Phase 1 done" means and should be an explicit, recorded choice.

---

## 5. `upstream` remote + `OVERRIDES.md` (FOUND-04)

```bash
git remote add upstream https://github.com/Shopify/skeleton-theme.git
git fetch upstream
git tag skeleton-base-$(git rev-parse --short upstream/main)   # pin the exact base commit
```

- Skeleton is a **starter**, not a theme you continuously track. Its commit history is slow and mostly docs/structure. The `upstream` remote is: (1) a reference to diff against, (2) a way to cherry-pick a genuinely useful structural improvement, (3) the FOUND-04 deliverable. It is **not** a merge treadmill (contrast a Dawn fork).
- **`OVERRIDES.md`** should capture, from day one:
  - The base: repo, pinned commit/tag, date.
  - Every Skeleton file **modified** (path + one-line why).
  - Every Skeleton file **removed** (path + why) — the allowlist decision from §4.
  - Every **new** file category Kinelia adds that Skeleton doesn't have (e.g. `assets/*.js` custom elements, `blocks/angle-*.liquid`, `snippets/analytics-hooks.liquid`).
  - Any component **ported from Horizon/Dawn** (source repo + file + commit) so its provenance and license (MIT) is tracked.
  - The rule: additions justified against the CVR/perf budget; core edits marked with `{% comment %} KINELIA: ... {% endcomment %}`.
- Keep it updated in the same PR as any divergence — a lint idea for later phases: fail CI if `OVERRIDES.md` mtime is older than a touched core file.

---

## 6. Theme Check + CI (FOUND-06)

### What Skeleton already ships (verified this session)

- **`.theme-check.yml`**: `extends: theme-check:recommended` `[VERIFIED: raw .theme-check.yml]`
- **`.github/workflows/ci.yml`**: `[VERIFIED: raw ci.yml]`
  ```yaml
  name: CI
  on: [push]
  jobs:
    theme-check:
      name: Theme Check
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - name: Theme Check
          uses: shopify/theme-check-action@v2
          with:
            token: ${{ github.token }}
  ```

### Actions for Phase 1

- **Keep `theme-check-action@v2`.** Change trigger from `on: [push]` to `on: [pull_request]` (or both) so it gates PRs per FOUND-06 wording ("en cada PR"). Make it a **required status check** on `main` and `staging` in GitHub branch protection.
- **Local:** `shopify theme check` (bundled in CLI 4.x — no separate install). Add `shopify theme check --fail-level error` as a pre-commit hook or a `package.json` script. `[CITED: shopify.dev/docs/storefronts/themes/tools/cli/ci-cd]`
- **`.theme-check.yml` tuning for a *custom* (non–Theme-Store) theme:** `theme-check:recommended` is the right base. Disable Theme-Store-submission-only checks that add noise, e.g.:
  ```yaml
  extends: theme-check:recommended
  # ignore:
  #   - templates/*.json          # if editor owns template JSON (see §3)
  # MissingTemplate:
  #   enabled: false              # Skeleton intentionally omits some template types
  # RemoteAsset / ParserBlockingScript / AssetSizeJavaScript: keep ENABLED — perf-relevant
  ```
  Regenerate a starter config anytime with `shopify theme check --init`. Keep `Liquid`/`JSON` syntax + performance checks (`ParserBlockingScript`, `AssetSizeJavaScript`, `RemoteAsset`, `ImgWidthAndHeight`) enabled — they enforce the perf budget.
- **DO NOT** add `@shopify/theme-check` to `package.json` — **that npm package does not exist** `[VERIFIED: gsd query package-legitimacy check --ecosystem npm @shopify/theme-check → verdict SLOP, "does-not-exist"]`. The linter is the bundled `shopify theme check` + the `shopify/theme-check-action` GitHub Action. (The internal packages `@shopify/theme-check-common` / `-node` exist but are not installed directly.)

---

## 7. Performance budget harness (FOUND-07)

### Recommended: `Shopify/lighthouse-ci-action` (official)

`[CITED: github.com/Shopify/lighthouse-ci-action README + shopify.dev/docs/storefronts/themes/tools/lighthouse-ci]` (fetched this session)

- Shopify-specific wrapper over Google Lighthouse CI. Runs Lighthouse against a **preview of the theme on each PR** and comments score deltas on the PR.
- **By default it tests home + product + collection pages.** For Kinelia the reference must be a **product** page (the avatar template lives on the hero product) — pass `lhci_product_handle` (once the hero product exists — Phase 4) and use the input to **pull theme settings + JSON templates from an existing theme** so the audited page reflects real content, not an empty product.
- **Budgets:** `lhci_min_score_performance` (default `0.6`) and `lhci_min_score_accessibility` (default `0.9`). Phase 1: set `accessibility: 0.95` (FOUND-03), `performance: 0.6` initially and **ratchet up** as phases land (target ≥ 0.9 mobile by Phase 13). Add a Lighthouse **assertions** config (`lighthouserc.json`) for hard metric budgets:
  ```jsonc
  // lighthouserc.json (asserted by lhci; mobile preset)
  {
    "ci": {
      "assert": {
        "assertions": {
          "categories:accessibility": ["error", { "minScore": 0.95 }],
          "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
          "cumulative-layout-shift":  ["error", { "maxNumericValue": 0.1 }],
          "total-blocking-time":      ["warn",  { "maxNumericValue": 200 }],
          "resource-summary:script:size": ["warn", { "maxNumericValue": 150000 }]
        }
      }
    }
  }
  ```
  (150 KB script budget is a **starting proposal** `[ASSUMED]` — Shopify docs do not publish a JS-weight number `[CITED: shopify.dev/.../testing-for-performance]`; the project constraint is "presupuesto de JS ajustado". Confirm the number with the user in discuss-phase.)
- **Auth (2026 gotcha):** the action authenticates with a **Dev Dashboard app** (`client_id` + `client_secret` + `store`), because **"as of January 1, 2026 Shopify no longer allows creating new custom apps"** `[CITED: lighthouse-ci-action README]`. The legacy `access_token` path still works for pre-existing custom apps. Store `SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET` as GitHub Actions secrets. Example:
  ```yaml
  # .github/workflows/lighthouse.yml
  name: Lighthouse
  on: pull_request
  jobs:
    lighthouse:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: shopify/lighthouse-ci-action@v1
          with:
            store: ${{ secrets.SHOP_STORE }}
            client_id: ${{ secrets.SHOP_CLIENT_ID }}
            client_secret: ${{ secrets.SHOP_CLIENT_SECRET }}
            lhci_min_score_performance: 0.6
            lhci_min_score_accessibility: 0.95
            # product_handle: medias-de-compresion   # add once the hero product exists (Phase 4)
  ```
  Version pinning: docs show `@v1` for `lighthouse-ci-action` (vs `@v2` for `theme-check-action`) — verify the latest tag when wiring.

### Local harness (no store credentials)

- `npx @lhci/cli autorun` against `shopify theme dev`'s local URL, or Chrome DevTools → Lighthouse in **Incognito**, **mobile** preset, **3 runs, median** `[CITED: shopify.dev/.../testing-for-performance]`.
- Add an npm script: `"perf": "lhci autorun --config=lighthouserc.json"`.
- Field data later: Shopify **Web Performance dashboard** (admin) for real-user CWV — not a CI gate, a launch/Phase-13 verification.

### Reference template for the harness

Until Phase 4 creates the hero product, the harness can target Skeleton's default `product` template on a seeded demo product, or the `index` page. **Phase 1 delivers the harness wired and green; the "avatar template" target is swapped in at Phase 10/13.** State this explicitly so the phase isn't blocked on data that belongs to Phase 4.

---

## Recommended Repo Structure (FOUND, all)

```
Shopify-Kinelia/                     # git repo — Shopify GitHub integration connects branches here
├── assets/                          # Skeleton: critical.css + icons. Kinelia adds base.css (Phase 2), *.js custom elements (Phase 3+)
├── blocks/                          # Skeleton: group, text. Kinelia adds angle-* / trust-row / faq-item (Phase 7+)
├── config/                          # settings_schema.json (tokens — Phase 2), settings_data.json (editor-owned — see §3)
├── layout/                          # theme.liquid (shell + seams — Phase 3), password.liquid
├── locales/                         # en.default → add es.default (es-AR voseo) in Phase 2
├── sections/                        # ALLOWLIST (§4): keep cart, product, header, footer, page, search, 404, password
├── snippets/                        # css-variables, image, meta-tags (Skeleton) + analytics-hooks (Phase 3 seam)
├── templates/                       # *.json — keep product, cart, page, search, 404, index, password; product.avatar-*.json in Phase 10
├── .github/workflows/
│   ├── ci.yml                       # theme-check-action@v2 (Skeleton ships this — retarget to pull_request)
│   └── lighthouse.yml               # lighthouse-ci-action@v1 (Phase 1 adds)
├── .theme-check.yml                 # extends: theme-check:recommended (Skeleton ships; tune for custom theme)
├── .shopifyignore                   # CLI-only ignore (not GitHub integration)
├── .gitignore                       # Skeleton's + add: .env, *.local
├── lighthouserc.json                # Lighthouse assertions / budgets (Phase 1 adds)
├── package.json                     # DEV-ONLY tooling: @lhci/cli, optionally prettier + @shopify/prettier-plugin-liquid. NO theme build step.
├── OVERRIDES.md                     # base commit + every divergence from Skeleton (FOUND-04, §5)
├── ALLOWLIST.md  (or a section in OVERRIDES.md)   # kept/removed Skeleton files + the "justify additions" rule (§4)
├── README.md                        # setup + the release checklist (§3)
├── .planning/                       # GSD docs — ignored by the GitHub integration (only reads known theme dirs); fine to keep in-repo
└── .claude/                         # project instructions — same, ignored by the integration
```

- **Theme files at the repo root** — mandatory for the GitHub integration (§3). Do **not** nest the theme in `theme/` or `src/`.
- **No build step.** `package.json` is dev-tooling only (perf harness, optional formatter). Keeps the GitHub/editor round-trip intact (CLAUDE.md constraint).
- `.planning/` and `.claude/` at root are harmless — the Shopify GitHub integration only syncs `assets blocks config layout locales sections snippets templates` + a few root files; unknown dirs are ignored. (They *would* be pushed by a naive `shopify theme push` — but releases go through the integration, and `.shopifyignore` can list them for CLI safety.)

---

## Don't Hand-Roll

| Problem | Don't build | Use instead | Why |
|---------|-------------|-------------|-----|
| Theme scaffold | A hand-authored directory tree | `shopify theme init` (Skeleton) | Ships `.theme-check.yml`, CI workflow, `.gitignore`, `.shopifyignore`, correct structure |
| Liquid/JSON linting | Custom scripts / regex | `shopify theme check` + `shopify/theme-check-action@v2` | Bundled, maintained, perf-aware checks |
| Performance CI | A bespoke Puppeteer + Lighthouse script | `Shopify/lighthouse-ci-action` | Handles preview-theme auth, PR comments, score deltas, Shopify page selection |
| Git ⇄ Shopify sync | `shopify theme push` in a cron / manual deploys | Shopify GitHub integration (branch ↔ theme) | Two-way, handles editor write-backs, no credential juggling for deploys |
| Cart drawer / predictive search (later phases) | From absolute scratch | Port structure from `github.com/Shopify/horizon` web components (MIT) | Focus-trap, `aria-live`, section re-render, debounce are easy to get wrong (PITFALLS.md Pitfall 1, 4) |
| CI auth for CLI theme ops | Username/password, personal tokens | **Theme Access app** password → `SHOPIFY_CLI_THEME_TOKEN` env var | The `--password` flag's env var is the one irregular exception (`SHOPIFY_CLI_THEME_TOKEN`, not `SHOPIFY_FLAG_PASSWORD`); wrong name silently hangs on interactive login `[CITED: shopify.dev CI/CD docs + secondary]` |

**Key insight:** Phase 1 is almost entirely wiring first-party Shopify tooling together correctly. The only "code" is config files and docs. Every custom solution here is a maintenance liability that Shopify already solved.

---

## Common Pitfalls

### Pitfall 1: Treating FOUND-03 as "strip Dawn" when the base is Skeleton
**What goes wrong:** The planner writes tasks to "remove cart-drawer carefully, keep pubsub" — files that don't exist in Skeleton — and/or the executor *imports* Dawn/Horizon bloat to have something to strip.
**Avoid:** §4 Option A. Reframe FOUND-03 as "stay minimal + allowlist"; cart drawer/search/a11y are later-phase builds. Get the user to ratify this in discuss-phase.
**Warning sign:** A Phase 1 task list mentions `global.js`, `pubsub.js`, `cart-drawer.js`, or `predictive-search.js`.

### Pitfall 2: Wrong repo layout for the GitHub integration
**What goes wrong:** Theme cloned into `kinelia-theme/` subdir; the GitHub integration refuses the branch ("must match the default Shopify theme folder structure").
**Avoid:** Theme dirs at repo root. If `shopify theme init kinelia-theme` created a subdir, move contents up and re-init git, or clone directly into `.`.
**Warning sign:** `assets/` `sections/` etc. are not siblings of `.git/`.

### Pitfall 3: One published theme, edited live
**What goes wrong:** Only the LIVE theme exists; half-built sections show to paid traffic; editor content and git drift (PITFALLS.md Pitfall 20).
**Avoid:** Create STAGING (unpublished) *and* the branch topology in Phase 1, before any feature phase. Document the content-ownership rule (§3).
**Warning sign:** `git status` shows large unexplained `settings_data.json` diffs after every pull; `shopify theme push` history targets the published theme.

### Pitfall 4: `theme-check-action` on `push` only, not a required PR check
**What goes wrong:** Skeleton's shipped workflow is `on: [push]` — it runs but doesn't *block* a merge.
**Avoid:** Add `pull_request` trigger + GitHub branch protection making "Theme Check" a required status check on `main`/`staging`.

### Pitfall 5: Lighthouse-CI measuring the wrong page / failing on auth
**What goes wrong:** The action audits the home page (Skeleton's near-empty `index`) and reports a meaningless 99; or it hangs because it's configured with a legacy `access_token` that can't be created after Jan 2026.
**Avoid:** Use the Dev Dashboard app (`client_id`/`client_secret`). Target a product handle once Phase 4 exists; until then, explicitly scope the Phase 1 harness to "wired + green on a demo product/index" and swap the avatar template in at Phase 10/13.
**Warning sign:** The Lighthouse job runs > 20 min with no result (known issue #67 on the action repo).

### Pitfall 6: Adding `@shopify/theme-check` (or a guessed package) to `package.json`
**What goes wrong:** `npm install @shopify/theme-check` — the package does not exist (verified SLOP this session). A typo-squat could resolve to something malicious.
**Avoid:** The linter is `shopify theme check` (bundled) + the GitHub Action. `package.json` gets only `@lhci/cli` and optionally `prettier` + `@shopify/prettier-plugin-liquid`.

### Pitfall 7: Stale "sobre Dawn" references after FOUND-02
**What goes wrong:** PROJECT.md Key Decisions is updated but `.claude/CLAUDE.md` ("un tema custom construido sobre Dawn"), `research/STACK.md`, and the ROADMAP overview still say Dawn.
**Avoid:** FOUND-02 task updates PROJECT.md *and* `research/STACK.md` source, then regenerates the CLAUDE.md GSD blocks. Grep the repo for `Dawn` before closing the phase.

---

## Code Examples / Snippets

### `shopify theme init` + repo-root layout
```bash
# from an empty repo root (this repo)
npm install -g @shopify/cli@latest
shopify theme init . --clone-url https://github.com/Shopify/skeleton-theme   # into current dir
# or: shopify theme init kinelia && mv kinelia/* kinelia/.* . && rmdir kinelia
git add -A && git commit -m "chore: scaffold theme from Shopify Skeleton"
git remote add upstream https://github.com/Shopify/skeleton-theme.git
git fetch upstream && git tag "skeleton-base-$(git rev-parse --short upstream/main)"
```
`[CITED: shopify.dev/docs/storefronts/themes/getting-started/create]` — exact `theme init` flags to confirm against installed CLI 4.x help.

### CI theme-check on PRs (retargeted from Skeleton's default)
```yaml
# .github/workflows/ci.yml
name: CI
on: { pull_request: {}, push: { branches: [main, staging] } }
jobs:
  theme-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: shopify/theme-check-action@v2
        with: { token: "${{ github.token }}" }
```

### CI/CD deploy pattern (if not using the GitHub integration for STAGING)
```bash
shopify theme check --fail-level error
shopify theme push --json --theme staging --store "$SHOPIFY_FLAG_STORE" --password "$SHOPIFY_CLI_THEME_TOKEN"
```
`[CITED: shopify.dev/docs/storefronts/themes/tools/cli/ci-cd]` — note the `SHOPIFY_CLI_THEME_TOKEN` env var name (irregular).

---

## State of the Art

| Old (project research, 2026-09) | Current (verified this session) | Impact |
|--------------------------------|-------------------------------|--------|
| "Shopify CLI 3.x, Node 20+/22 LTS" | **CLI 4.x**, **Node 22.12+**, Git 2.28+ | Local Node 24.14 is fine; install CLI fresh. Pin `@shopify/cli@4` in CI. |
| "Skeleton is *a* recommended base" | Skeleton is **the** documented starting point; `shopify theme init` clones it | Decision de-risked. |
| "Horizon is *becoming* the default" | Horizon **is** the new-store default (Dawn replaced) | Dawn is unambiguously legacy for greenfield. |
| Lighthouse-CI auth via custom app `access_token` | **No new custom apps after 2026-01-01** → Dev Dashboard app `client_id`/`client_secret` | CI perf-harness setup needs Dev Dashboard credentials from the user. |
| `@shopify/theme-check` (implied installable) | Package **does not exist** on npm; linter is bundled in CLI | Don't add it to `package.json`. |

**Deprecated / don't use:** standalone Ruby `theme-check` gem; `checkout.liquid` / Additional Scripts (not this phase); Dawn as a 2026 greenfield base; any `npm` "theme build" step for this theme.

---

## Runtime State Inventory

Not applicable — greenfield phase, empty repo (only `.git/`, `.claude/`, `.planning/`). No stored data, live-service config, OS-registered state, secrets, or build artifacts exist yet. The one "state" concern is documentation drift (Pitfall 7): PROJECT.md / STACK.md / CLAUDE.md / ROADMAP all currently say "Dawn" and must be updated together in FOUND-02.

---

## Environment Availability

| Dependency | Required by | Available | Version | Fallback / Action |
|------------|-------------|-----------|---------|-------------------|
| Node.js | Shopify CLI 4.x | ✓ | v24.14.0 (need ≥ 22.12) | — |
| Git | CLI 4.x, GitHub integration | ✓ | 2.53.0 (need ≥ 2.28) | — |
| Shopify CLI | FOUND-01, theme check, dev preview | ✗ | — | `npm install -g @shopify/cli@latest` (dev machine). No fallback — blocks local preview. |
| Shopify Partners account + **development store** | FOUND-01 Success Criterion 1 (`shopify theme dev` against a dev store) | ✗ (user-provided) | — | **BLOCKING for SC-1.** User creates it in Partners dashboard; executor cannot. Scaffolding proceeds without it. |
| GitHub **remote** for this repo | FOUND-05, FOUND-06 (Actions), FOUND-07 (Actions) | ✗ (repo is local-only, `git remote` empty) | — | **BLOCKING for CI deliverables.** User/planner creates the GitHub repo + pushes. |
| Shopify **store** (dev or prod) with GitHub app installed | FOUND-05 (branch↔theme), FOUND-07 (Lighthouse preview auth) | ✗ (user-provided) | — | Same dev store can serve. Needs the Shopify GitHub app + Dev Dashboard app credentials. |
| Dev Dashboard app `client_id`/`client_secret` | FOUND-07 Lighthouse-CI auth | ✗ (user-provided) | — | Legacy custom-app token only if one pre-exists. Store as GH Actions secrets. |
| Theme Access app password | Optional CLI-based CI deploys (if not using GitHub integration for STAGING) | ✗ | — | Only needed for Option (b) topology. |
| Chrome / Chromium | Local Lighthouse runs | not verified | — | Assume present on dev machine; `@lhci/cli` can download Chromium. |

**Blocking with no fallback:** Shopify CLI install (trivial), Partner dev store (user), GitHub remote (user), Shopify store credentials for CI (user). **All scaffolding/config/doc work can proceed in parallel and land before the user provides these.** The planner should split Phase 1 into "scaffold + docs + config" (no external deps) and "connect + verify" (needs the store + remote).

---

## Package Legitimacy Audit

Phase 1 installs a global CLI and (optionally) a small dev-tooling `package.json`.

| Package | Registry | Age / cadence | Downloads | Source repo | Verdict | Disposition |
|---------|----------|---------------|-----------|-------------|---------|-------------|
| `@shopify/cli` | npm | Publishes ~weekly (last 2026-09-02) | ~491,848 / wk | github.com/Shopify/cli | **SUS** (`too-new` heuristic only — misfires on a high-frequency first-party publisher) | **Approved.** Official Shopify CLI; documented at `shopify.dev/docs/api/shopify-cli` as `npm install -g @shopify/cli@latest`. Pin `@shopify/cli@4` in CI. Planner may add a `checkpoint:human-verify` before the global install if desired, but risk is negligible. |
| `@shopify/theme-check` | npm | — | — | — | **SLOP** (`does-not-exist`) | **REMOVED.** Do not install. Linter is `shopify theme check` (bundled) + `shopify/theme-check-action@v2`. |
| `@lhci/cli` | npm | — | not checked this session | github.com/GoogleChrome/lighthouse-ci | `[ASSUMED]` legitimate (Google Chrome org) | Planner: verify with `npm view @lhci/cli` + `gsd query package-legitimacy check` before adding; gate behind `checkpoint:human-verify`. Only needed for the *local* harness — the CI harness uses the GitHub Action, no npm install. |
| `prettier`, `@shopify/prettier-plugin-liquid` | npm | — | not checked | prettier / Shopify | `[ASSUMED]` — optional formatter only | Verify before adding; optional, not required for any FOUND requirement. |

GitHub Actions (not npm): `shopify/theme-check-action@v2`, `shopify/lighthouse-ci-action@v1`, `actions/checkout@v4` — all first-party (Shopify / GitHub). Pin to the major tag; verify latest tag when wiring.

**Packages removed due to SLOP:** `@shopify/theme-check`.
**Packages flagged SUS:** `@shopify/cli` (false-positive `too-new`; approved with note).

---

## Validation Architecture

`workflow.nyquist_validation` is enabled. Phase 1 has no application code, so "tests" = the lint + performance + preview gates themselves. The planner should turn these into `must_haves`.

### Test/Verification Framework

| Property | Value |
|----------|-------|
| Lint | `shopify theme check` (bundled in CLI 4.x) — config `.theme-check.yml` (Skeleton ships `extends: theme-check:recommended`) |
| Lint CI | `shopify/theme-check-action@v2` — Skeleton ships `.github/workflows/ci.yml` |
| Performance/a11y | `shopify/lighthouse-ci-action@v1` (CI) + `@lhci/cli autorun` with `lighthouserc.json` assertions (local) |
| Preview smoke | `shopify theme dev --store <dev-store>` renders without console errors |
| Quick run (per commit) | `shopify theme check --fail-level error` |
| Full run (per PR) | `theme-check-action` + `lighthouse-ci-action` both green |
| Phase gate | STAGING theme deployed + release checklist walked + Lighthouse mobile on reference template: LCP < 2.5 s, CLS < 0.1, a11y ≥ 95 |

### Phase Requirements → Verification Map

| Req | Testable signal | Verification command / check | Exists? |
|-----|-----------------|------------------------------|---------|
| FOUND-01 | `shopify theme dev` serves the theme from this repo against a dev store; storefront renders | Manual: run `shopify theme dev --store <s>`, open localhost, load `/`, `/products/<demo>`, `/cart` — no console errors | ❌ Wave 0 (needs CLI + dev store) |
| FOUND-02 | PROJECT.md Key Decisions no longer says "Dawn despojado"; base decision + tradeoffs recorded; `.claude/CLAUDE.md` + `research/STACK.md` updated | `grep -ri "dawn" .planning .claude` returns only historical/rejected-context mentions; PROJECT.md has the new row | ❌ Wave 0 |
| FOUND-03 | Section/template set matches `ALLOWLIST.md`; no JS framework in `assets/`; Theme Check clean; Lighthouse a11y ≥ 95 on reference template; `/cart` + `/search` pages render | `shopify theme check` exit 0; `lighthouse-ci-action` a11y ≥ 0.95; file-tree diff vs allowlist | ❌ Wave 0 |
| FOUND-04 | `git remote -v` shows `upstream` → skeleton-theme; base commit tagged; `OVERRIDES.md` exists and lists every divergence | `git remote get-url upstream`; `git tag \| grep skeleton-base`; `test -f OVERRIDES.md` | ❌ Wave 0 |
| FOUND-05 | Two themes in the store (STAGING unpublished, LIVE published); `main`→LIVE, `staging`→STAGING branches connected; `README`/`docs/RELEASE.md` has the checklist; content-ownership rule documented | Shopify admin → Themes shows both + GitHub badges; `test -f docs/RELEASE.md`; branch protection on `main` | ❌ Wave 0 (needs store + remote) |
| FOUND-06 | `theme-check-action` runs on every PR and is a required status check; local `shopify theme check` documented in README/package.json | CI run on a throwaway PR shows the check; GitHub branch-protection settings | ❌ Wave 0 |
| FOUND-07 | `lighthouse.yml` workflow runs on PRs, comments scores, fails below budget; `lighthouserc.json` asserts LCP ≤ 2500 ms + a11y ≥ 0.95; local `npm run perf` works | Throwaway PR shows the Lighthouse comment + pass/fail; `lhci autorun` locally | ❌ Wave 0 |

### Wave 0 Gaps (build before/within Phase 1)

- [ ] Install Shopify CLI 4.x on the dev machine
- [ ] User: create Partner development store; provide store URL
- [ ] User: create GitHub repo + add as `origin`; push
- [ ] User: install Shopify GitHub app on the repo; create Dev Dashboard app; provide `client_id`/`client_secret`
- [ ] `shopify theme init` scaffold committed at repo root
- [ ] `ALLOWLIST.md` + `OVERRIDES.md` authored
- [ ] `.github/workflows/ci.yml` retargeted to `pull_request`; branch protection set
- [ ] `.github/workflows/lighthouse.yml` + `lighthouserc.json` authored
- [ ] `package.json` (dev-only: `@lhci/cli`) + `"perf"` / `"lint"` scripts
- [ ] `docs/RELEASE.md` release checklist
- [ ] STAGING + LIVE themes created and branch-connected
- [ ] Confirm a reference template + demo product for the harness (or explicitly defer the avatar target to Phase 10/13)

---

## Security Domain

`security_enforcement: true`, ASVS L1. Phase 1's attack surface is CI credentials + repo hygiene, not application code.

### Applicable ASVS categories

| Category | Applies | Control |
|----------|---------|---------|
| V1 Architecture / SDLC | yes | Branch protection on `main`/`staging`; required status checks (Theme Check, Lighthouse); PR review before LIVE |
| V14 Configuration | yes | Secrets (`SHOP_CLIENT_SECRET`, Theme Access token, Dev Dashboard `client_secret`) only in **GitHub Actions secrets**, never committed. `.gitignore` covers `.env`, `.shopify/`. `.shopifyignore` keeps `.planning/`, `.claude/` out of CLI pushes. |
| V5 Input validation | n/a this phase | — |
| V6 Cryptography | n/a | No secrets handled in theme code |

### Threat patterns for this phase

| Pattern | STRIDE | Mitigation |
|---------|--------|------------|
| Secret leak via committed `.env` / workflow echo | Information disclosure | GH Actions secrets; `.gitignore` `.env`; never `echo` a token; `SHOPIFY_CLI_THEME_TOKEN` masked |
| Supply-chain: typo-squatted lint/build package | Tampering | Legitimacy audit above; `@shopify/theme-check` is SLOP — do not install; pin Action tags |
| Publicly guessable unpublished STAGING theme with test prices | Information disclosure | Unpublished theme + share preview links only; `robots`/noindex posture for STAGING; remove stale dev themes |
| Malicious PR triggers CI with secrets (pwn-request) | Elevation of privilege | `pull_request` (not `pull_request_target`) for the Lighthouse job; require approval to run workflows for first-time contributors; this is a private repo — low risk |
| Compromised global `@shopify/cli` install | Tampering | Install from npm registry, pin major; `@shopify/cli` postinstall is `null` (verified) |

---

## Assumptions Log

| # | Claim | Section | Risk if wrong |
|---|-------|---------|---------------|
| A1 | 150 KB compressed JS budget for the Lighthouse assertion | §7 | Too tight → CI blocks legitimately; too loose → perf regressions slip. **Confirm the number with the user in discuss-phase.** Shopify publishes no official JS-weight target. |
| A2 | `shopify/lighthouse-ci-action` is at `@v1` and `theme-check-action` at `@v2` | §6, §7 | Wrong tag → workflow fails on first run; fixable in minutes. Verify latest tags when wiring. |
| A3 | Git 2.28+ requirement for CLI 4.0 (from a secondary blog) | §2 | Local Git is 2.53 so moot here; only matters for other contributors' machines. |
| A4 | The Shopify GitHub integration ignores unknown root dirs (`.planning/`, `.claude/`) | §7, structure | If it complains, move GSD docs to a branch not connected to Shopify, or a sibling repo. Low likelihood (integration only reads known theme dirs). |
| A5 | `@lhci/cli`, `prettier`, `@shopify/prettier-plugin-liquid` are legitimate | Package audit | Not verified this session — planner must run `npm view` + legitimacy check and gate behind `checkpoint:human-verify`. |
| A6 | Skeleton's `theme init` can target the current directory (`.`) cleanly | §2 code example | If not, scaffold to a subdir and move files up — trivial. Confirm against installed CLI help. |
| A7 | "Get metaobject(s)" blocks / metaobject-typed block settings GA status | §1 | **Deferred to Phase 4/7** — not a Phase 1 blocker. Do not let the planner assume it here. |
| A8 | Horizon web components are MIT-licensed and safe to port structurally | §4, Don't-Hand-Roll | Verify `github.com/Shopify/horizon` LICENSE before porting (project research says MIT). Relevant to Phases 6/11, not 1. |

**All `[ASSUMED]` items need user confirmation or a verification task before becoming locked decisions.**

---

## Open Questions

1. **Base theme: does the user accept Skeleton (and the §4 reframe of FOUND-03)?**
   - Known: Skeleton is officially recommended; multi-avatar + perf favor it; it ships no cart drawer / predictive search / a11y modules.
   - Unclear: whether the user prefers Horizon-stripped to keep FOUND-03 literally executable and get pre-built components now.
   - Recommendation: take this to `/gsd-discuss-phase` as the first question. Default to Skeleton + Option A.

2. **What is the JS-weight budget number?** (A1) — needs a user answer for the Lighthouse assertion.

3. **Does STAGING live on the same dev store as LIVE, or a separate store?**
   - Same store (two themes) is simplest and standard. Separate stores add isolation but double the setup. Recommendation: same store, STAGING unpublished.

4. **Content ownership (§3): GitHub-integration-owns-JSON (Option a) or git-owns-with-pull-back (Option b)?**
   - Recommendation: (a). Decide and document in Phase 1.

5. **Reference template for the Phase 1 harness** — demo product now, or block the harness "green" criterion until Phase 4's hero product exists?
   - Recommendation: wire + green on a seeded demo product / `index`; swap the avatar template in at Phase 10/13. State this in the plan so Phase 1 isn't falsely blocked.

6. **Does the Kinelia Shopify store already exist (the "tienda previa" that was decided *not* to carry forward)?** If a store exists, is Phase 1's dev store a fresh Partner dev store or a sandbox on that account? Affects who provisions what.

---

## Sources

### Primary (HIGH confidence — fetched/verified this session)
- shopify.dev/docs/storefronts/themes/getting-started/create — Skeleton is the documented custom-theme starting point; `shopify theme init`
- github.com/Shopify/skeleton-theme (git tree + raw `README.md`, `.theme-check.yml`, `.github/workflows/ci.yml`, `.gitignore`, `.shopifyignore`) — exact contents, no JS, no cart drawer
- shopify.dev/docs/storefronts/themes/architecture/limits — nesting depth 8, sections/blocks/template limits
- shopify.dev/docs/api/shopify-cli — CLI 4.0, Node 22.12+
- shopify.dev/docs/storefronts/themes/tools/github — 1 branch ↔ 1 theme, unpublished support, root layout, editor write-back
- shopify.dev/docs/storefronts/themes/architecture/templates/alternate-templates — `?view=<suffix>`, `product.<suffix>.json`, standard feature
- shopify.dev/docs/storefronts/themes/best-practices/performance/testing-for-performance — Lighthouse incognito/mobile/3-run-median; no published JS budget
- github.com/Shopify/lighthouse-ci-action (README) — Dev Dashboard app auth, `lhci_min_score_*` defaults, Jan-2026 custom-app change
- shopify.dev/docs/storefronts/themes/tools/lighthouse-ci — tests home/product/collection; PR comments
- `gsd query package-legitimacy check` — `@shopify/theme-check` = SLOP (does-not-exist); `@shopify/cli` = SUS (too-new only), 491k wk downloads, official repo, postinstall null
- Local environment probe — Node v24.14.0, Git 2.53.0, no Shopify CLI, no global npm packages

### Secondary (MEDIUM confidence — practitioner sources, cross-checked)
- changelog.shopify.com/posts/horizon-10-new-free-themes-by-shopify + craftshift.com, pagefly.io, gempages.net, omnithemes.com — Horizon is the new-store default; 9 sibling presets; 8-level blocks vs Dawn's 2
- community.shopify.dev/t/nested-blocks-depth-limit + capaxe.com, moxiesozo.com — theme-block nesting, `content_for` not counting toward limits
- shopify.dev/docs/storefronts/themes/tools/cli/ci-cd + kaspianfuad.com/blog/shopify-cli-cheat-sheet — `SHOPIFY_CLI_THEME_TOKEN` gotcha, CLI 4.0 self-upgrade skips CI, Git 2.28+
- shopify.dev/docs/storefronts/themes/tools/theme-check/configuration — `.theme-check.yml`, `shopify theme check --init`, disabling checks
- community.shopify.dev / shopify.dev version-control — GitHub integration root-folder requirement

### Project internal
- `.planning/research/{STACK,ARCHITECTURE,PITFALLS,SUMMARY}.md`, `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, `STATE.md`, `.planning/config.json`
- `Shopify-Kinelia/.claude/CLAUDE.md` (storefront), `Kinelia/.claude/CLAUDE.md` (parent/backend)

---

## Metadata

**Confidence breakdown:**
- Base-theme decision: **HIGH** — Skeleton officially recommended (shopify.dev, fetched); Horizon-as-default corroborated across 4+ sources; Skeleton contents verified from the repo directly.
- Toolchain (CLI/Node/Git versions, GitHub integration, Theme Check, Lighthouse CI): **HIGH** for behavior, **MEDIUM** for exact Action tag versions (A2) and the Git 2.28 minimum (A3, secondary).
- FOUND-03 "strip" deliverable: **MEDIUM** — the *facts* (Skeleton has no cart drawer) are HIGH; the *right way to reconcile the requirement* is a judgment call needing user ratification (Open Q1).
- Lighthouse-CI auth under the Jan-2026 no-new-custom-apps rule: **MEDIUM** — README states Dev Dashboard app is the path; not tested end-to-end this session.

**Research date:** 2026-09-07
**Valid until:** ~2026-10-07 for the toolchain (Shopify ships fast — re-verify CLI major + Action tags at plan time); base-theme decision is stable for the milestone.
