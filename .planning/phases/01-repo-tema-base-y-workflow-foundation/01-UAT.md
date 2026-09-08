---
status: testing
phase: 01-repo-tema-base-y-workflow-foundation
source: [01-VERIFICATION.md]
started: 2026-09-08T20:10:00Z
updated: 2026-09-08T20:10:00Z
---

## Current Test

number: 1
name: Local Lighthouse harness completes a real measurement
expected: |
  With `shopify theme dev` running, `npm run perf` runs 3 mobile Lighthouse
  passes against the home + a product route and prints category/metric scores.
  Confirms the LOCAL half of FOUND-07 actually measures (not just parses).
awaiting: user response

## Tests

### 1. Local Lighthouse harness completes a real measurement
expected: |
  1. `npm install` (first time — installs `@lhci/cli`).
  2. Shell A: `shopify theme dev --store kinelia.myshopify.com`
     (store password: it will prompt or read SHOPIFY_FLAG_STORE_PASSWORD).
  3. Shell B: `npm run perf`
  The run should collect 3 mobile passes against `http://127.0.0.1:9292/` and
  `/products/the-complete-snowboard`, then print scores and evaluate the
  `lighthouse/lighthouserc.json` assertions (LCP ≤ 2500, CLS ≤ 0.1,
  accessibility ≥ 0.95 as errors; TBT and script-weight as warnings). It is
  fine for an assertion to *fail* on the near-empty Skeleton theme — what is
  being verified is that the harness runs and produces numbers, not that the
  numbers are good. Report the performance + accessibility scores you see.
result: [pending]

### 2. Ratify the public-repo decision
expected: |
  The repo `github.com/Frahat27/Shopify-Kinelia` is currently PUBLIC. This was
  your call during plan 01-07 (branch protection / rulesets need a paid plan on
  private repos; you declined GitHub Pro and declined stripping `.planning/`).
  It exposes `.planning/` — the full business plan (CPA model, 14-phase roadmap,
  market research) — plus `docs/*`. Secret *values* stay encrypted (verified
  not in git history).

  Choose one and say which:
  - (a) Accept public through launch — revisit at Phase 14.
  - (b) Go private + GitHub Pro (US$4/mo) — I'll recreate the rulesets.
  - (c) Strip `.planning/` from the repo (history rewrite) and go private.

  Recorded in `.planning/WINDOWS.md` (entry 6) and `docs/SHOPIFY-SETUP.md`.
result: [pending]

## Summary

total: 2
passed: 0
issues: 0
pending: 2
skipped: 0
blocked: 0

## Gaps
