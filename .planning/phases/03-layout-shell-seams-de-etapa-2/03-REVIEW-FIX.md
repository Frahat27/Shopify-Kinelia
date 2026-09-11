---
phase: 03-layout-shell-seams-de-etapa-2
fixed_at: 2026-09-11T13:05:00Z
review_path: .planning/phases/03-layout-shell-seams-de-etapa-2/03-REVIEW.md
iteration: 1
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 3: Code Review Fix Report

**Fixed at:** 2026-09-11
**Source review:** .planning/phases/03-layout-shell-seams-de-etapa-2/03-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 3 (CR-01, WR-01, WR-02 — the 6 Info findings were out of scope for this fix pass by design)
- Fixed: 3
- Skipped: 0

**Isolation:** `workflow.use_worktrees` is `false` in `.planning/config.json`, so per the
documented opt-out (#2825) all edits and commits below were made directly in the main
checkout on `main` — no worktree, no temp branch, no recovery sentinel, no cleanup tail.

## Fixed Issues

### CR-01: Brand SVGs hardcode literal colors — `kinelia_horizontal.svg` hardcodes the restricted accent color

**Files modified:** `assets/kinelia_horizontal.svg`, `sections/header.liquid`
**Commit:** `3699cc4`
**Applied fix:** Both `<g>` fills in `assets/kinelia_horizontal.svg` (previously literal
`#0F6E56` and `#D85A30` — the latter the exact hex of the restricted `--color-accent`
token, D-01) now use `fill="currentColor"`. `sections/header.liquid`'s `{% stylesheet %}`
gained `.header__logo-link { color: var(--color-primary); }`, so the header logo
(rendered on every page via `inline_asset_content`) resolves its color from the primary
brand token — never the restricted accent — meaning a future rebrand stays a token
change (DESIGN-02), not a component edit.

**Adaptation from the review's literal suggestion — `kinelia_isotipo.svg` intentionally
left untouched:** The Fix section proposed converting both SVGs to `currentColor` and
wrapping the "inlined markup" in a color-bearing element. `kinelia_isotipo.svg` is not
inlined, however — it is referenced via `asset_url` inside a standalone
`<link rel="icon">` in `layout/theme.liquid`. A `<link>`-loaded SVG document has no page
CSS context to inherit `color` from; converting its fill to `currentColor` would resolve
against the SVG/CSS initial value (black) and silently turn the favicon black in every
browser tab instead of brand teal — a visual regression none of the available
verification tiers (syntax/structure checks) would catch. Additionally, `kinelia_isotipo.svg`'s
literal fill is `#0F6E56` (`--color-primary`'s default), not the restricted accent
`#D85A30` — it does not trigger the D-01 rule that makes this finding blocking. It
remains a milder literal-color duplicate, already tracked as a follow-up under IN-01
(extend `scripts/check-tokens.mjs` coverage to `assets/*.svg`), which was correctly kept
out of this fix pass's scope (Info-tier).

**Verification:** `node scripts/check-tokens.mjs` exit 0 after the fix (token checker
does not scan `.svg` files directly, but the new `var(--color-primary)` reference in
`sections/header.liquid`'s stylesheet block is checked and resolves against a defined
custom property). Re-read of both modified files confirmed no literal hex fills remain
in `kinelia_horizontal.svg` (0 matches for `fill="#`, 2 matches for
`fill="currentColor"`) and the SVG's outer `<svg>...</svg>` structure is intact.

### WR-01: `whatsapp_number` is used unescaped and unvalidated in two `href`s

**Files modified:** `sections/footer.liquid`
**Commit:** `a8c8491`
**Applied fix:** Introduced `{%- assign wa_number = settings.whatsapp_number | remove: ' ' | remove: '+' | remove: '-' | escape -%}`
near the top of the file, exactly as suggested in REVIEW.md, and replaced both raw
`settings.whatsapp_number` interpolations (the footer link `href` and the floating
`.wa-fab` `href`) — plus both blank guards — with the normalized, escaped `wa_number`.
This closes both problems the finding raised: a staging operator pasting the number with
`+`/spaces/dashes (per `docs/RUNBOOK-STAGING.md`'s documented format) no longer produces
a silently broken `wa.me` link, and the value is now escaped before landing in an `href`
attribute, matching the theme's security posture elsewhere (e.g.
`snippets/meta-tags.liquid`).

**Verification:** All four Node checkers (`check-tokens`, `check-allowlist`,
`check-secrets`, `check-seams`) exit 0 after the fix. Re-read of `sections/footer.liquid`
confirmed both `href`s and both `{%- if wa_number != blank -%}` guards consistently use
the new variable, and the surrounding markup (icon, aria-label, newsletter form, payment
icons block) is unchanged.

### WR-02: `package.json`'s `engines.node` constraint is not enforced anywhere it matters

**Files modified:** `.github/workflows/ci.yml`
**Commit:** `7572e4f`
**Applied fix:** Added an `actions/setup-node@v4` step with
`node-version-file: package.json` immediately after `actions/checkout@v4` and before the
Theme Check / checker steps in the `theme-check` job, exactly as suggested in REVIEW.md.
This reads the pinned Node version directly from `package.json`'s `engines.node` field,
so the CI runner's Node version and the `engines` constraint can no longer drift apart
silently.

**Verification:** YAML parsed successfully via `js-yaml` (`yaml.load()`) after the edit —
no syntax errors introduced. Re-read of the full file confirmed the new step is correctly
indented as a sibling of `actions/checkout@v4` and precedes both Theme Check steps, and
no other step in the job was altered.

## Skipped Issues

None — all three in-scope findings (CR-01, WR-01, WR-02) were fixed. The 6 Info findings
(IN-01 through IN-06) were out of scope for this fix pass per `fix_scope: critical_warning`
and were left untouched, as instructed.

## Verify-Gate Results (post-fix, run in the main checkout)

All commands below were run in the main working tree (no isolated worktree was created,
per `workflow.use_worktrees: false`), so these results are reproducible directly from the
tree at commit `7572e4f`.

| Command | Result |
|---|---|
| `node scripts/check-tokens.mjs` | exit 0 — OK |
| `node scripts/check-allowlist.mjs` | exit 0 — OK |
| `node scripts/check-secrets.mjs` | exit 0 — OK |
| `node scripts/check-seams.mjs` | exit 0 — OK |
| `shopify theme check` | Unavailable — sandbox has no network access to fetch the Shopify CLI package (`npx shopify` fails to install `shopify@4.8.0`). Same known gap tracked in `.planning/STATE.md`; not re-attempted beyond confirming the CLI cannot be fetched here. |
| `npm test` / `npm run build` | Do not exist for this project (theme has no build step; `package.json` only defines `lint`/`lint:*`/`perf` scripts). |

---

_Fixed: 2026-09-11_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
