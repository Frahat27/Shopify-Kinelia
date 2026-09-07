---
phase: 01-repo-tema-base-y-workflow-foundation
plan: 01
status: complete
completed: 2026-09-07
requirements: [FOUND-01, FOUND-02]
commits:
  - 56cd221 feat(01): scaffold Skeleton theme at repo root
---

# Plan 01-01 Summary — Tracer: base theme + repo scaffold

## Outcome

The one irreversible Phase 1 decision is made and the Phase 1 spine is proven end-to-end on the thinnest path: toolchain → theme source at repo root → lint gate green → committed.

## Decisions (checkpoints resolved by the developer)

| Checkpoint | Resolution |
|-----------|------------|
| Task 1 — base theme (one-way door) | **Skeleton** (`Shopify/skeleton-theme`). FOUND-03 reframe **ratified**: Skeleton ships zero JS, so "cart drawer + predictive search funcionan" cannot be met verbatim — cart drawer → Phase 6, predictive search → Phase 11, event bus + a11y helpers → Phase 3. Recorded here and (per plan) in `ALLOWLIST.md` at 01-04. |
| Task 2 — `@shopify/cli` package legitimacy | **Approved.** Publisher Shopify, repo github.com/Shopify/cli, ~490k downloads/week, postinstall null, latest 4.x. The audit's "SUS / too-new" flag is a known false positive for a weekly first-party publisher. |

## What was done (Task 3 — tracer)

- Installed Shopify CLI globally: `npm install -g @shopify/cli@latest` → **`shopify version` = 4.7.1** (major 4 ✓). Node on machine: v24.14.0 (≥ 22.12 ✓).
- `shopify theme init .skeleton-tmp` (the `--latest` flag fails on current git — "can't clone the latest release with the 'shallow' property"; plain clone of the default branch works). Clones `https://github.com/Shopify/skeleton-theme.git`.
- Moved the theme tree (`assets blocks config layout locales sections snippets templates`), theme dotfiles (`.theme-check.yml .shopifyignore .gitattributes .gitignore`) and `LICENSE.md` up to the repo root; deleted `.skeleton-tmp` (the CLI already strips the clone's `.git`, so no stray `.git` — `find . -mindepth 2 -name .git` → 0).
- `shopify theme check --fail-level error` → **exit 0, 39 files, 0 offenses** (offline, no store).
- Committed as `56cd221`. Pre-existing planning commits preserved.

## Upstream provenance (plan 01-02 needs this)

- Base repo: `https://github.com/Shopify/skeleton-theme.git`
- Upstream HEAD SHA at scaffold time: **`a4f32d393b9eadf6c4403318ca39116832e5d1df`**
- Scaffold command: `shopify theme init .skeleton-tmp` (temp-subdir fallback WAS needed — repo root already has `.git/`, `.claude/`, `.planning/`)

## Deviations from plan

1. **No `.github/workflows/ci.yml` in current Skeleton.** Plan 01-01 `files_modified` and plan 01-03 both assume the starter ships a Theme Check workflow to *retarget* to `pull_request`. It does not. **Plan 01-03 must CREATE `.github/workflows/ci.yml` from scratch** (Shopify/theme-check-action@v2, `on: pull_request`). Also no `.github/` dir at all.
2. **No JS in `assets/`** — only `critical.css` + 3 SVGs. Confirms 01-RESEARCH.md §1. Reinforces the FOUND-03 reframe.
3. **Skeleton meta files not moved up:** `README.md` (plan 01-05 owns the project README), `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md` (Skeleton-repo governance, not applicable to this fork). `LICENSE.md` (MIT) WAS kept for fork attribution.
4. `.planning/config.json` / `.planning/state.json` churn from GSD tool runs was kept OUT of the scaffold commit.

## Skeleton inventory (for 01-04 ALLOWLIST.md)

- `sections/`: 404, article, blog, cart, collection, collections, custom-section, footer, footer-group.json, header, header-group.json, hello-world, page, password, product, search
- `blocks/`: group.liquid, text.liquid
- `snippets/`: css-variables.liquid, image.liquid, meta-tags.liquid
- `templates/`: 404, article, blog, cart, collection, gift_card.liquid, index, list-collections, page, password, product, search (+ .json)
- `layout/`: theme.liquid, password.liquid
- `assets/`: critical.css, icon-account.svg, icon-cart.svg, shoppy-x-ray.svg

## Verification

- `shopify version` → 4.7.1 ✓
- `shopify theme check --fail-level error` → exit 0 ✓
- `ls -d assets blocks config layout locales sections snippets templates .git` → all siblings ✓
- `find . -mindepth 2 -name .git -not -path './.git/*'` → 0 ✓
- `git log` retains all pre-existing planning commits ✓

## Next

Wave 2: plans 01-02 (record decision in PROJECT.md/CLAUDE.md, `upstream` remote + base tag `skeleton-base-a4f32d3`, OVERRIDES.md) and 01-03 (lint gate — must CREATE ci.yml per deviation 1 — + Lighthouse harness).
