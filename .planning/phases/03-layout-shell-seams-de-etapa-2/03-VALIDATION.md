---
phase: "3"
slug: "layout-shell-seams-de-etapa-2"
# status lifecycle: draft (seeded by plan-phase) → validated (set by validate-phase §6)
# audit-milestone §5.5 distinguishes NOT-VALIDATED (draft) from PARTIAL (validated + nyquist_compliant: false) (#2117)
status: draft
nyquist_compliant: true
wave_0_complete: true
created: "2026-09-09"
updated: "2026-09-10"
---

# Phase 3 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | None, deliberately. The theme has no unit-test framework and `ALLOWLIST.md` forbids adding a toolchain with a build step. Validation is four layers: (1) `shopify theme check --fail-level error`, (2) four Node standard-library checkers that are executable copies of written contracts, (3) inline `node -e` assertions in each task's verify, run against the source and — for the event bus — against the module loaded in a virtual-machine context with a minimal document stub, (4) a staging walkthrough at the phase gate. |
| **Config file** | `.theme-check.yml` (`extends: theme-check:recommended`, nothing disabled) · `package.json` scripts `lint` / `lint:all` / `lint:allowlist` / `lint:secrets` / `lint:tokens` / `lint:seams` (the last added by plan 03-02) |
| **Quick run command** | `npm run lint` |
| **Full suite command** | `npm run lint:all` + `npm run perf` (Lighthouse local; needs `shopify theme dev` in a second shell) |
| **Estimated runtime** | `npm run lint` ~15 s · the per-task `node -e` assertions < 2 s each · `npm run perf` ~90 s |

---

## Sampling Rate

- **After every task commit:** `npm run lint` plus that task's own `node -e` assertions — under 20 seconds
- **After every plan wave:** `npm run lint:all` plus a staging preview walkthrough of what the wave added
- **Before `/gsd-verify-work`:** `npm run lint:all` green, `npm run perf` (or a manual layout-shift and accessibility read if Windows blocks the harness — see `.planning/WINDOWS.md`), the browser-console bus script executed, and the `docs/RUNBOOK-STAGING.md` steps executed against the staging theme
- **Max feedback latency:** 20 seconds per task, 2 minutes per wave

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 3-01-01 | 01 | 1 | SHELL-03 | — | N/A — decision checkpoint, no code | checkpoint | *(none — `checkpoint:decision`, exempt)* | n/a | ⬜ pending |
| 3-01-02 | 01 | 1 | SHELL-01, SHELL-03 | T-03-01 / T-03-02 / T-03-03 | The seam renders nothing outside comments and opens no connection; the endpoint stays a placeholder; an unlisted script asset still fails the surface gate | integration (source order + module loaded in a VM context) | `shopify theme check --fail-level error && node scripts/check-tokens.mjs && node scripts/check-allowlist.mjs && node -e "<head order + no-op seam>" && node -e "<bus delivered end to end>" && node -e "<surface gate both directions>"` | ✅ | ⬜ pending |
| 3-01-03 | 01 | 1 | SHELL-01 | T-03-05 | Skip link and live region take plain auto-escaped locale text; no user input reaches them | integration (source + VM context) | `shopify theme check --fail-level error && node scripts/check-tokens.mjs && node -e "<landmarks + password head>" && node -e "<announce clears then writes>" && npm run lint` | ✅ | ⬜ pending |
| 3-02-01 | 02 | 2 | SHELL-04 | T-03-06 / T-03-07 / T-03-08 / T-03-09 / T-03-10 | The contract states the no-identifying-details payload rule, the read-modify-write rule and the error-message rule; the endpoint stays a placeholder | contract assertion | `node -e "<all 21 contract tokens present in code formatting + placeholder + citations>" && npm run lint` | ✅ | ⬜ pending |
| 3-02-02 | 02 | 2 | SHELL-04, SHELL-03 | T-03-09 | Contract drift between the module's published names and the document fails the build | checker + four seeded negatives | `node scripts/check-seams.mjs && node -e "<four seeded drift cases each exit non-zero>" && npm run lint` | ✅ | ⬜ pending |
| 3-02-03 | 02 | 2 | SHELL-04 | T-03-09 | The contract check runs in the required CI gate, not only on a laptop | wiring assertion | `npm run lint && node -e "<lint chain + gate step + coverage declaration + ledger>" && node -e "<checker standalone>"` | ✅ | ⬜ pending |
| 3-03-01 | 03 | 3 | SHELL-02 | T-03-13 | Vendored vector marks carry no script and no external reference | source assertion | `node -e "<view box, no duplicated fill, smaller than source, icon link>" && npm run lint` | ✅ | ⬜ pending |
| 3-03-02 | 03 | 3 | SHELL-02 | T-03-11 / T-03-12 / T-03-14 / T-03-15 | The strip's link is a constrained url type; its copy is locale-sourced and claim-safe; its height is reserved before paint | integration (schema parse + style + group + locale) | `shopify theme check --fail-level error && node scripts/check-tokens.mjs && node scripts/check-allowlist.mjs && node -e "<tokens, schema types, locale sourcing, pinning, group order, allowlist, editor labels>" && npm run lint` | ✅ | ⬜ pending |
| 3-03-03 | 03 | 3 | SHELL-02 | T-03-14 | The pinned block reserves its height and stays in the flow, so it cannot shift or cover the buy box unpredictably | integration (markup + style + schema) | `shopify theme check --fail-level error && node scripts/check-tokens.mjs && node -e "<mark, cart, account, menu guard, no listener, pinned not fixed, offsets, stacking level>" && npm run lint` | ✅ | ⬜ pending |
| 3-04-01 | 04 | 4 | SHELL-02 | T-03-16 / T-03-17 / T-03-19 | The number setting never reaches a style block; the WhatsApp link carries the no-opener relationship; no link points at a bare fragment | integration (markup + both schemas + locale) | `shopify theme check --fail-level error && node scripts/check-tokens.mjs && node -e "<whatsapp target, noopener, no fragment, no hard-coded page target, newsletter off, payment kept, setting shape, editor labels>" && npm run lint` | ✅ | ⬜ pending |
| 3-04-02 | 04 | 4 | SHELL-02 | T-03-16 / T-03-18 | The glyph carries no script and no external reference; the floating link carries the no-opener relationship | integration (asset + markup + style) | `shopify theme check --fail-level error && node scripts/check-tokens.mjs && node -e "<glyph conventions, second target, accessible name, fixed, stacking level, brand colour, no elevation or motion, yield rule>" && npm run lint` | ✅ | ⬜ pending |
| 3-04-03 | 04 | 4 | SHELL-02 | T-03-19 / T-03-20 | Every legal link resolves to a real page before the menu points at it | doc assertion + git state | `npm run lint && node -e "<five slugs, setting id, staging theme, phase 11, open compliance item, write-back warning, ledger>" && node -e "<no deleted files>"` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

No separate Wave 0 is needed. Every gap the research listed is closed inside a phase task rather
than by pre-work, and no task's `<automated>` carries a `MISSING` sentinel:

- [x] `scripts/check-allowlist.mjs` script-asset allowlist — **plan 03-01, task 2** (D-09)
- [x] `scripts/check-seams.mjs`, the executable copy of the SHELL-04 contract — **plan 03-02, task 2**
- [x] `.visually-hidden` and `.skip-link` in `assets/base.css` — **plan 03-01, task 3**
- [x] The browser-console bus script — **plan 03-01, task 2 human check**, sourced from `03-RESEARCH.md` lines 617-626
- [x] The character-set-position check — covered automatically by the source-order assertion in plan 03-01 task 2, and by eye in its human check (a rendered-byte-offset check needs a running server, which the harness cannot give on Windows)
- [x] The staging admin runbook — **plan 03-04, task 3**

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| The event bus works in a real browser, and a plain document listener receives the same event | SHELL-03 | The automated proof runs the module in a virtual-machine context with a stubbed document. That proves the wiring but not the browser. | On the dev theme, run the console script from `03-RESEARCH.md` lines 617-626: read the name list, subscribe through the bus and again with a plain listener, emit, confirm both fire, unsubscribe the first, emit again. |
| A screen reader speaks the same message twice in a row | SHELL-03 | Live-region announcement can only be observed with an assistive technology. | With a screen reader active, call the announce helper twice with an identical message and confirm both are spoken. |
| The pinned strip and header cost no layout shift and do not obstruct the buy box | SHELL-02 | The Lighthouse harness does not run cleanly on Windows against the dev-server proxy (`.planning/WINDOWS.md`); the hard measurement is Phase 13. | Cold-load a phone-width viewport, read cumulative layout shift in the browser performance panel, and confirm the pinned block leaves the fold usable. |
| Every legal link opens a real page | SHELL-02 | The pages and the menu live in the Shopify admin, outside version control. | Execute `docs/RUNBOOK-STAGING.md`, then click every footer link on the staging preview — none may produce a not-found page. |
| The theme editor shows the new sections and settings in Spanish | SHELL-02 | Editor rendering can only be seen in the editor. | Open the staging theme editor: confirm the announcement strip is an addable, reorderable section, that the WhatsApp group and the newsletter switch appear with Spanish labels, and that no raw translation key is visible. |
| The floating button yields to a sticky add-to-cart bar | SHELL-02 | The bar does not exist until Phase 6; only the style rule ships now. | Add the sticky-add-to-cart class to the body in the browser inspector and confirm the button disappears at phone widths. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or are exempt (`checkpoint:decision`)
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references — there are none; every gap is closed inside a phase task
- [x] No watch-mode flags
- [x] Feedback latency < 20s per task
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending — set to approved by `/gsd-validate-phase` or at the phase gate.
