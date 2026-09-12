---
task_id: 260911-tt4
type: quick
status: complete
one_liner: Converted two Liquid {% comment %} blocks inside {% stylesheet %} tags (announcement-bar.liquid, footer.liquid) to native CSS /* */ comments to clear the CI-required StaticStylesheetAndJavascriptTags Theme Check gate
key-files:
  modified:
    - sections/announcement-bar.liquid
    - sections/footer.liquid
commits:
  - hash: 03fea18
    message: "fix(260911-tt4): convert stylesheet-block Liquid comments to CSS comments"
metrics:
  duration: ~10min
  completed: 2026-09-11
---

# Quick Task 260911-tt4: Fix Theme Check StaticStylesheetAndJavascriptTags Summary

Converted the two Liquid `{% comment %}`/`{% endcomment %}` blocks that sat
directly inside `{% stylesheet %}...{% endstylesheet %}` tags into native CSS
`/* */` block comments, in `sections/announcement-bar.liquid` and
`sections/footer.liquid`. This was the exact offense GitHub Actions run
34661542595 (job "Theme Check (gate)") flagged as
`StaticStylesheetAndJavascriptTags` at two locations. `{% stylesheet %}`
content must be 100% static CSS; a Liquid tag inside it — even a comment tag —
trips the rule.

## What Changed

**`sections/announcement-bar.liquid`** (inside the stylesheet block, lines
~49–54): the `{% comment %}` / `{% endcomment %}` delimiters wrapping the
sticky-header positioning documentation (plan 03-03, D-12, `--z-sticky-header`
stacking note) were replaced with `/*` and `*/`. All four documentation lines
in between are unchanged verbatim.

**`sections/footer.liquid`** (inside the second stylesheet block, lines
~152–166): the `{% comment %}` / `{% endcomment %}` delimiters wrapping the
WhatsApp floating-button documentation (plan 03-04, SHELL-02/D-15, `--z-fab`
stacking order, `has-sticky-atc` coexistence rule for Phase 6) were replaced
with `/*` and `*/`. One forced, narrowly-scoped exception inside that same
block: the sentence "y una section puede llevar un `{% stylesheet %}` scoped
que un layout no puede" had its literal `{%`/`%}` decoration removed around
the word "stylesheet" (now reads "un stylesheet scoped"), because once the
`{% comment %}` wrapper is gone, that literal sits directly inside the outer,
tokenized `{% stylesheet %}` tag and would otherwise either break Liquid's
parse or reproduce the same offense inside the new CSS comment. Every other
word, space, and punctuation mark in that sentence is untouched.

The other two `{% comment %}` blocks in `footer.liquid` (file-header block,
lines 1–22, and the `--color-text`/breakpoint doc block, lines 96–104) sit
outside any `{% stylesheet %}` tag and were left completely untouched, as
required.

## Deviations from Plan

None — plan executed exactly as written.

## Verification

**Static grep verify (both tasks' authoritative automated check):** ran the
plan's `<verify>` command against both files — scans the interior of each
file's `{% stylesheet %}...{% endstylesheet %}` region (excluding the tag
lines themselves) for any Liquid tag-opening sequence (`{%`).

```
--- sections/announcement-bar.liquid ---
OK: no stray Liquid tags inside the stylesheet block
--- sections/footer.liquid ---
OK: no stray Liquid tags inside the stylesheet block
```

Both print `PASS`-equivalent (zero stray tags found) — zero
`StaticStylesheetAndJavascriptTags` offenses possible on these two files.

**`git diff` scope check:** confirmed the diff touches only the two delimiter
lines per file (`{% comment %}`→`/*`, `{% endcomment %}`→`*/`) plus the one
four-character removal in footer.liquid's documentation sentence — no other
line in either file was modified.

**Live CLI check (best-effort, per plan's phase-level `<verification>`):**
attempted `shopify theme check --fail-level error`. Confirmed the plan's
documented sandbox gap: `shopify` is not on `PATH` and `npx --no-install
shopify theme check` fails because `shopify@4.8.0` isn't cached locally and
the sandbox has no network access to fetch it (`npm error npx canceled due to
missing packages and no YES option`). This matches the pre-existing,
already-documented environment gap in `.planning/STATE.md` (Phase 3
Blockers/Concerns: `shopify theme check --fail-level error` does not run
clean in this execution environment due to lack of network access to
`raw.githubusercontent.com`; unrelated `ValidSchema` offenses were also noted
there, not this task's concern).

Given the CLI could not execute at all in this sandbox, the two static
per-file grep checks above are the authoritative pass/fail signal for this
task, as anticipated by the plan. **A full `npm run lint` run in CI or a
networked environment remains the final confirmation** — this is a standing
note already tracked in `.planning/STATE.md` for Phase 3, not a new gap
introduced by this task.

## Success Criteria

- [x] `sections/announcement-bar.liquid`: `/*`/`*/` replace
      `{% comment %}`/`{% endcomment %}`; four documentation lines unchanged verbatim.
- [x] `sections/footer.liquid`: `/*`/`*/` replace `{% comment %}`/`{% endcomment %}`;
      all content lines unchanged verbatim except the one documented four-character removal.
- [x] The other two `{% comment %}` blocks in `footer.liquid` (outside the stylesheet tag) untouched.
- [x] Both per-task automated static-grep verifies print PASS (no stray Liquid tags found).
- [x] Live `shopify theme check` attempted; documented inability to execute in this
      sandbox (pre-existing, matches `.planning/STATE.md`); zero
      `StaticStylesheetAndJavascriptTags` offenses possible given the static verify result.
- [x] No other lines in either file modified (confirmed via `git diff`).

## Known Stubs

None.

## Self-Check: PASSED

- FOUND: sections/announcement-bar.liquid (modified, verified via git diff)
- FOUND: sections/footer.liquid (modified, verified via git diff)
- FOUND: commit 03fea18 (`git log --oneline -1` shows it as HEAD)
