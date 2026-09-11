---
phase: 03-layout-shell-seams-de-etapa-2
reviewed: 2026-09-11T00:00:00Z
depth: standard
files_reviewed: 24
files_reviewed_list:
  - .github/workflows/ci.yml
  - ALLOWLIST.md
  - ETAPA-2-SEAMS.md
  - OVERRIDES.md
  - assets/base.css
  - assets/events.js
  - assets/icon-whatsapp.svg
  - assets/kinelia_horizontal.svg
  - assets/kinelia_isotipo.svg
  - config/settings_schema.json
  - docs/RUNBOOK-STAGING.md
  - layout/password.liquid
  - layout/theme.liquid
  - locales/es.default.json
  - locales/es.default.schema.json
  - package.json
  - scripts/check-allowlist.mjs
  - scripts/check-seams.mjs
  - sections/announcement-bar.liquid
  - sections/footer.liquid
  - sections/header-group.json
  - sections/header.liquid
  - snippets/analytics-hooks.liquid
  - snippets/css-variables.liquid
  - snippets/meta-tags.liquid
findings:
  critical: 1
  warning: 2
  info: 6
  total: 9
status: issues_found
---

# Phase 3: Code Review Report

**Reviewed:** 2026-09-11
**Depth:** standard
**Files Reviewed:** 24
**Status:** issues_found

## Summary

Reviewed the Phase 3 layout-shell + Etapa-2-seams deliverable: the reordered `<head>`,
the events bus (`assets/events.js`), the seams contract (`ETAPA-2-SEAMS.md` +
`scripts/check-seams.mjs`), the allowlist checker, the header/announcement-bar/footer
sections, the two vendorized brand SVGs, and the CI gate. The Liquid, the two Node
checkers, and the locale files are internally consistent — every `t:`/`{{ '...' | t }}`
key referenced by a schema or template resolves to a real key in
`locales/es.default.schema.json` / `locales/es.default.json`, and `scripts/check-seams.mjs`
correctly reads its vocabulary from `assets/events.js` rather than hand-copying it.

The one finding that rises to blocking severity is in an artifact this phase newly
vendorized, not in Liquid logic: the two brand SVGs hardcode literal color hex values,
and `kinelia_horizontal.svg` specifically hardcodes the **restricted accent color**
(`#D85A30`) — the same value gated to `.price` everywhere else in the theme by an
explicit, repeatedly-documented project rule (D-01, D-02/D-17). Nothing in the CI gate
catches this because the token checker's file coverage is Liquid/CSS, not `assets/*.svg`.

Everything else found is a robustness or consistency gap (unescaped/unvalidated
merchant-supplied WhatsApp number reused in two `href`s, an `engines` constraint the CI
workflow never actually enforces, some minor style/DRY nits) — none of it blocks a
merge, but the WhatsApp-number gap in particular is worth a quick follow-up given the
Etapa-2 seams doc explicitly documents an "input format contract" (digits-only, no `+`)
that nothing in code enforces.

## Critical Issues

### CR-01: Brand SVGs hardcode literal colors — `kinelia_horizontal.svg` hardcodes the restricted accent color

**File:** `assets/kinelia_horizontal.svg:1` (`fill="#0F6E56"`) and `assets/kinelia_horizontal.svg:56` (`fill="#D85A30"`); also `assets/kinelia_isotipo.svg:2` (`fill="#0F6E56"`)

**Issue:** Both logo assets vendorized in this phase (plan 03-03) bake brand colors in
as literal hex fills instead of `currentColor` driven by a CSS custom property, unlike
every other inlined icon in the theme (`icon-cart.svg`, `icon-account.svg`,
`icon-whatsapp.svg` — all `stroke="currentColor"`, styleable via `--icon-stroke-width`
and the surrounding element's `color`).

This isn't a style nit — it breaks two rules this project documents as absolute,
repeatedly, across three files:

1. **OVERRIDES.md §"Reglas":** *"Un valor de color literal solo puede vivir en
   `config/settings_schema.json` y en `snippets/css-variables.liquid` (D-02, D-17)."*
   Both SVGs are a third place a literal color now lives, unguarded by
   `scripts/check-tokens.mjs` (whose stated scope, per `OVERRIDES.md`, is Liquid/CSS —
   it does not scan `assets/*.svg`).
2. **`assets/base.css` (D-01), verbatim:** *"`--color-accent` es de USO RESTRINGIDO. Su
   único uso sancionado en toda la tienda es el precio. Nunca un fondo, un botón, un
   titular, un ícono ni un borde."* `#D85A30` in `kinelia_horizontal.svg:56` is the exact
   hex of `settings.color_accent`'s default (`config/settings_schema.json:97`). This is
   the header logo — rendered on **every page** via `sections/header.liquid:14`
   (`{{ 'kinelia_horizontal.svg' | inline_asset_content }}`) — using the one color the
   rest of the theme treats as forbidden outside `.price`.

Practical consequence beyond the contract violation: if a merchant ever changes
`color_primary` or the (currently unused) accent in the theme editor, the header logo
and favicon will silently stop matching the live brand palette, because the token
system's entire premise ("DESIGN-02: un rebrand es un cambio de tokens, no de
componentes") does not reach these two files.

**Fix:** Recolor both SVGs to use `fill="currentColor"` (dropping the explicit hex),
and wrap the inlined markup in an element whose `color` resolves from
`var(--color-primary)` (and, if the second glyph in the wordmark is deliberately a
second brand color, resolve it from a dedicated custom property emitted by
`snippets/css-variables.liquid` instead of a literal hex — but note this would still
need a documented exception to D-01 if that color is the accent). At minimum, replace
literal `#0F6E56` / `#D85A30` with `currentColor` and set
`.header__logo-link { color: var(--color-primary); }` in `sections/header.liquid`'s
`{% stylesheet %}` block.

## Warnings

### WR-01: `whatsapp_number` is used unescaped and unvalidated in two `href`s

**File:** `sections/footer.liquid:36` and `sections/footer.liquid:77`

**Issue:** `settings.whatsapp_number` is a free-text schema setting
(`config/settings_schema.json:164-168`, `type: "text"`, no format constraint) rendered
directly into `href="https://wa.me/{{ settings.whatsapp_number }}"` in two places (the
footer link and the floating `.wa-fab` button) with no `| escape` and no
sanitization/validation filter. Two separate problems stack here:

1. **Functional fragility.** `docs/RUNBOOK-STAGING.md:51-52` documents the required
   format ("formato internacional: solo dígitos, sin signo `+`, sin espacios ni
   guiones") but nothing in code enforces or normalizes it. A staging operator who
   pastes the number with a leading `+`, spaces, or dashes (an easy real-world mistake)
   produces a `wa.me` link that silently 404s or routes to the wrong contact — with no
   error, since this isn't validated anywhere and the RUNBOOK's own note says an absent
   value is handled gracefully (blank guard) but a malformed one is not.
2. **Unescaped attribute output.** The value is interpolated raw into an `href`
   attribute with no `| escape`. Low exploitability here (only staff with theme-editor
   access can set it), but it is inconsistent with the theme's own security posture
   elsewhere (e.g., `snippets/meta-tags.liquid` escapes every user-influenced string it
   emits) and is duplicated in two places, doubling the surface that would need fixing.

**Fix:** Normalize once, e.g. in a Liquid variable near the top of
`sections/footer.liquid`:
```liquid
{%- assign wa_number = settings.whatsapp_number | remove: ' ' | remove: '+' | remove: '-' | escape -%}
```
and reuse `wa_number` in both `href`s, instead of repeating
`settings.whatsapp_number` raw in two places.

### WR-02: `package.json`'s `engines.node` constraint is not enforced anywhere it matters

**File:** `package.json:7-9`, `.github/workflows/ci.yml` (no `actions/setup-node` step)

**Issue:** `package.json` declares `"engines": { "node": ">=22.12" }`, but
`.github/workflows/ci.yml`'s `theme-check` job never pins or installs a Node version —
it runs `node scripts/check-*.mjs` directly against whatever Node ships preinstalled on
`ubuntu-latest`, and no `npm ci`/`npm install --engine-strict` step exists that would
enforce (or even warn about) the `engines` field. If the GitHub-hosted runner's default
Node version ever drifts below 22.12 (or the checkers start relying on a Node
≥22-only stdlib feature), the CI gate will not catch the mismatch — the constraint is
documentation-only today.

**Fix:** Add an explicit `actions/setup-node@v4` step with `node-version: '22.12'` (or
read it from `package.json` via `node-version-file: package.json`) before the checker
steps in the `theme-check` job.

## Info

### IN-01: Two literal-color SVGs are also a minor scope gap in `scripts/check-tokens.mjs`'s coverage

**File:** `assets/kinelia_horizontal.svg`, `assets/kinelia_isotipo.svg` (see CR-01)

**Issue:** Beyond the CR-01 fix, consider whether the token checker's scope should
extend to `assets/*.svg` going forward, since this phase is precedent for future
vendorized icon/logo assets (Fases 5/6/11 will add more per `OVERRIDES.md`).
**Fix:** Track as a backlog item for `scripts/check-tokens.mjs`, not a blocker for this
phase.

### IN-02: `assets/base.css` — inconsistent spacing after `:` in two declarations

**File:** `assets/base.css:20`, `assets/base.css:33`

**Issue:** `font-family:var(--font-body);` and `font-family:var(--font-heading);` omit
the space after the colon that every other declaration in the file uses (e.g.
`font-weight: var(--font-weight-regular);` two lines below each).
**Fix:** `font-family: var(--font-body);` / `font-family: var(--font-heading);`.

### IN-03: `npm run lint` and the CI gate run the same four checkers in a different order

**File:** `package.json:11`, `.github/workflows/ci.yml:58-64`

**Issue:** `package.json`'s `lint` script runs
`check-allowlist → check-secrets → check-tokens → check-seams`; the CI gate step runs
`check-tokens → check-seams → check-allowlist → check-secrets`. Functionally harmless
(each checker is independent and the job fails on any non-zero exit either way), but it
means "first reported failure" differs between a local `npm run lint` run and CI,
which can cost a confused minute when two checkers are failing simultaneously.
**Fix:** Align the order in one of the two places (no correctness impact — pure
consistency).

### IN-04: Duplicated WhatsApp `href` construction in `sections/footer.liquid`

**File:** `sections/footer.liquid:36` and `sections/footer.liquid:77`

**Issue:** The footer link and the floating `.wa-fab` button both independently build
`href="https://wa.me/{{ settings.whatsapp_number }}"` and both independently guard on
`settings.whatsapp_number != blank`. Any future fix (e.g. WR-01's normalization) has to
be applied in two places.
**Fix:** Compute the guard and the normalized number once near the top of the file and
reuse both.

### IN-05: `ci.yml` grants `pull-requests: write`, broader than the job appears to need

**File:** `.github/workflows/ci.yml:23-26`

**Issue:** The `permissions:` block grants `contents: read`, `checks: write`, and
`pull-requests: write`. The job's own comments explain `checks: write` (required for
`shopify/theme-check-action`'s annotations) and `contents: read` (required because
declaring `permissions:` zeroes every unlisted scope, and `actions/checkout` needs it).
No comment explains `pull-requests: write`, and neither `actions/checkout@v4` nor
`shopify/theme-check-action@v2.2.0`'s documented annotation behavior requires it.
**Fix:** Verify whether `pull-requests: write` is actually exercised (e.g. by the
action posting PR comments beyond Check annotations); if not, drop it to keep the
grant minimal and self-documenting like the other two scopes.

### IN-06: Header cart link's accessible name doesn't include the item count

**File:** `sections/header.liquid:32-38`

**Issue:** The cart link's `aria-label` is a static `{{ 'sections.header.cart' | t }}`
("Carrito"); the visible `<sup>{{ cart.item_count }}</sup>` badge is not exposed to the
accessible name, so a screen-reader user hears "Carrito" with no indication of how many
items are in it. Pre-existing from the starter's structure (only the logo/icon swap
changed in this phase), noted here since Phase 1's deviation note ties this shell to a
Lighthouse a11y ≥ 0.95 budget.
**Fix:** Fold the count into the label when non-zero, e.g.
`aria-label="{{ 'sections.header.cart' | t }} ({{ cart.item_count }})"` guarded by
`{% if cart.item_count > 0 %}`.

---

_Reviewed: 2026-09-11_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
