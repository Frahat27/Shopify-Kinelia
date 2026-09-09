---
phase: 02-sistema-de-diseno-por-tokens
reviewed: 2026-09-09T00:00:00Z
depth: standard
files_reviewed: 14
files_reviewed_list:
  - assets/base.css
  - assets/critical.css
  - config/settings_schema.json
  - layout/theme.liquid
  - locales/es.default.json
  - locales/es.default.schema.json
  - scripts/check-tokens.mjs
  - snippets/css-variables.liquid
  - sections/header.liquid
  - sections/footer.liquid
  - .github/workflows/ci.yml
  - package.json
  - .gitattributes
  - .gitignore
findings:
  critical: 0
  warning: 6
  info: 10
  total: 16
status: issues_found
---

# Phase 02: Code Review Report

**Reviewed:** 2026-09-09
**Depth:** standard
**Files Reviewed:** 14
**Status:** issues_found

## Summary

The phase builds a token design system: `snippets/css-variables.liquid` + `config/settings_schema.json`
emit the whole brand vocabulary once, `assets/base.css` consumes only `var(--*)`,
`scripts/check-tokens.mjs` enforces the token/locale contract in CI, and the sole default locale
was renamed `en` -> `es` (voseo) with a `kinelia.*` copy namespace.

The work is careful and well-documented. All three Node checkers pass (`check-tokens`, `check-allowlist`,
`check-secrets` — verified by running them), `settings_data.json` is empty so no stale settings,
the font preload URLs match their `@font-face` `src` (no double fetch), and the `es` locale resolves
every `t:` key referenced by the in-scope schema/sections plus the 8 required storefront keys.

**No BLOCKER issues.** The findings are enforcement holes in the safeguard script, a `<head>`
ordering regression, a typographic gap the token rule cannot see (`h4`-`h6` faux-bold), an
unpinned CI toolchain, and a residual `<style>`-injection surface via `select` settings.

## Narrative Findings (AI reviewer)

### Warnings

#### WR-01: check-tokens misses most literal-color forms

**File:** `scripts/check-tokens.mjs:106`
**Issue:** `HEX = /#(?:[0-9a-fA-F]{2}){3,4}\b|#[0-9a-fA-F]{3}\b/` only catches `#rgb`, `#rrggbb`,
`#rrggbbaa`. A component stylesheet can still ship `color: teal`, `background: rebeccapurple`,
`background: rgb(15 110 86)`, `color: hsl(...)`, `color: oklch(...)`, or the 4-digit `#0f6e` shorthand
and the "executable copy of DESIGN-02" stays green — defeating the phase's core thesis ("un rebrand
es un cambio de tokens, no de componentes"). Confirmed: `#abcd` is not matched (first branch needs
>=6 digits, second branch fails the `\b` after 3).
**Fix:** Extend the literal-color scan to functional notation and the CSS named-color set, e.g. add
`/\b(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i`, `/#[0-9a-fA-F]{4}\b/`, and a
named-color word list (`red|blue|green|teal|navy|...|rebeccapurple|transparent` is acceptable — even
a partial list closes the common cases). Keep the `var(--*)` allowance.

#### WR-02: rule-6 (shadow / gradient / uppercase) parser is single-level and format-narrow

**File:** `scripts/check-tokens.mjs:201,288-301`
**Issue:** `ruleBlocks` uses `/([^{}]+)\{([^{}]*)\}/g`, which cannot see inside CSS nesting beyond one
level — and `CLAUDE.md` explicitly plans to use nesting / `:has()` / container queries. A nested
`box-shadow`, `linear-gradient`, or `text-transform: uppercase` two levels deep evades detection
(D-11 / D-07). Additional gaps: the box-shadow regex `/(^|[\s;])box-shadow\s*:/` misses
`-webkit-box-shadow` (preceded by `-`), nothing catches `filter: drop-shadow(...)`, and
`/text-transform\s*:\s*uppercase/` has no `/i` flag so `UPPERCASE` slips by. Conversely, with nesting
a rule like `.label-eyebrow { & span { text-transform: uppercase } }` would be flagged under selector
`& span` even though it is legitimately under the eyebrow utility.
**Fix:** Either strip `@media`/`@supports` and flatten nesting before `ruleBlocks`, or run the
shadow/gradient/justify/uppercase regexes against the whole comment-stripped chunk (not per-rule) and
special-case the eyebrow allowance by checking the surrounding declaration block text. Add `-webkit-`,
`drop-shadow(`, and the `/i` flag.

#### WR-03: injection guard trusts `select` values that Shopify renders verbatim

**File:** `scripts/check-tokens.mjs:115-123`; `snippets/css-variables.liquid:86-87,93-107,127`
**Issue:** The guard whitelists `select` as a "valor acotado" safe to interpolate inside `{% style %}`.
But the interpolated value comes from `settings_data.json` (written by the theme editor and the GitHub
integration, and not linted by any of the three checkers), and Shopify renders `settings.font_heading`
as the stored string without re-validating it against the schema `options`. A `settings_data.json`
carrying `"font_heading": "x} </style><script>..."` would be emitted raw into the `<head>` `<style>`
block via `--font-heading: {{ settings.font_heading | default: 'DM Sans' }}`. Same surface for
`font_body` and `max_page_width` (the latter lands in a `calc()` the `.shopify-section` grid reads).
Exploitation needs write access to theme settings / the repo, so this is defense-in-depth, not an open
hole — but the phase reasoned about this exact vector and drew the safe/unsafe line one type too wide.
**Fix:** Sanitise the interpolation in the emitter (`| split: ';' | first | split: '}' | first | strip`),
or — since each select has exactly one real option today ("placeholder for more" per the comment) —
drop the `settings.font_*` interpolation and emit the family literally in the one file allowed to hold
literals. Optionally, have `check-tokens` also parse `settings_data.json` and assert stored `select`
values are among the schema options.

#### WR-04: `<meta charset>` / `<meta viewport>` emitted kilobytes deep in `<head>`

**File:** `layout/theme.liquid:3-43`
**Issue:** `<head>` now renders, in order: the `css-variables` `<style>` (tokens + 5x `@font-face`,
each with a ~400-char `unicode-range` — well over 2 KB), two `<link rel=preload>`, the `critical.css`
link, the `base.css` link, and only then `{% render 'meta-tags' %}` whose first lines are
`<meta charset="utf-8">` and `<meta name="viewport" ...>`. The charset declaration is far past the
HTML spec's 1024-byte window (functionally masked because Shopify sends `Content-Type: charset=utf-8`,
so this is a spec/cleanliness issue), but the **viewport** tag arriving several KB in risks a mobile
browser doing an initial desktop-width layout then reflowing — directly against the LCP < 2.5 s / CLS
mobile budget. This area was reshuffled by the phase (font block rewrite).
**Fix:** Move a bare `<meta charset="utf-8">` + `<meta name="viewport" content="width=device-width,initial-scale=1">`
to be the very first two lines inside `<head>`, before `{% render 'css-variables' %}` (render the rest
of `meta-tags` where it is, or move the whole snippet up).

#### WR-05: `h4`-`h6` fall through to UA faux-bold, violating D-05

**File:** `assets/base.css:30-49`
**Issue:** The typography primitives style only `h1, h2, h3`. `h4`-`h6` inherit the UA default
`font-weight: bold` (700) and the body family (Inter, via `critical.css`). No 700 face is self-hosted
(only 400/500/600), so any section using `<h4>`-`<h6>` renders synthetic faux-bold Inter — exactly the
"peso pesado en titulares" that D-05 forbids and the reason this phase exists. `check-tokens` cannot
catch this (it is a weight, not a color or family name).
**Fix:** Add `h4, h5, h6` to the heading rule (or a catch-all `h1,h2,h3,h4,h5,h6`) setting
`font-family: var(--font-heading); font-weight: var(--font-weight-medium);` and explicit sizes, or
document that `h4`-`h6` are out of the system and add a `check-tokens` rule forbidding bare `<h4>`-`<h6>`.

#### WR-06: CI "authoritative gate" runs on a floating toolchain

**File:** `.github/workflows/ci.yml:55-60`; `package.json:7-9`
**Issue:** The gate step does `npm install -g @shopify/cli` with no version pin, so Theme Check rule
sets can change under CI silently (the annotation step is pinned `@v2.2.0`; the gate — the step whose
exit code is the required status check — is not). There is also no `actions/setup-node`, so the three
`node scripts/*.mjs` checks run on whatever `node` the `ubuntu-latest` image ships, while
`package.json` declares `engines.node >= 22.12`. Local (Node 22) and CI can diverge, and `engines` is
never enforced (no `npm ci --engine-strict`).
**Fix:** Pin the CLI (`npm install -g @shopify/cli@<version>`), add `actions/setup-node@v4` with
`node-version` matching `engines` (e.g. `22.12`), and consider `check-latest: false` for reproducibility.

### Info

#### IN-01: 2 of the 5 declared `@font-face` weights are unreachable

**File:** `snippets/css-variables.liquid:43-82,90`
**Issue:** No CSS rule references DM Sans 400 or Inter 600 (`--font-weight-semibold: 600` is also
defined but unused). Subsetting means unused faces do not download, so there is no perf cost, but the
"5 faces" surface does not match the ~3 the token system currently exposes. Fine if the extra weights
are a deliberate reserve for Phases 7-8; worth a one-line note if so.

#### IN-02: `body` base declarations duplicated across critical.css and base.css

**File:** `assets/critical.css:81-85`; `assets/base.css:19-26`
**Issue:** `font-family`, `background-color`, `color` on `body` are set to the same tokens in both
files. Harmless (base.css wins; the critical.css copy is a reasonable FOUC safety net) but the base.css
header comment claims it "NO re-declara nada" of critical.css — the claim is inaccurate for these three.

#### IN-03: theme identity still says "Skeleton" / "Shopify" / 0.1.0

**File:** `config/settings_schema.json:3-8`
**Issue:** `theme_name: "Skeleton"`, `theme_author: "Shopify"`, `theme_version: "0.1.0"` while
`package.json` is `kinelia-theme` `1.0.0`. Cosmetic, but shows up in the theme editor and admin.

#### IN-04: `input_corner_radius` is filed under the colors group

**File:** `config/settings_schema.json:148-157`
**Issue:** A shape token sits inside `t:general.colors`, so the theme editor shows "Redondeo de campos"
under "Colores de marca". Move it to the layout group.

#### IN-05: inherited `_html` locale keys interpolate user/author input; duplicated key trees

**File:** `locales/es.default.json:64-69,97-116`
**Issue:** `search.no_results_html`, `search.results_for_html`, `blog.article_metadata_html` render
unescaped and interpolate `{{ terms }}` / `{{ author }}`. The phase's `_html` guard in `check-tokens`
only covers `kinelia.legal_disclaimer`. Shopify does HTML-escape translation placeholders even in
`_html` keys, so this is likely safe — but confirm and prefer non-`_html` variants where no markup is
needed. Separately, `search.*` vs `templates.search.*` and `404.*` vs `templates.404.*` duplicate the
same strings and diverge ("Volver a la tienda" vs "Volver al inicio").

#### IN-06: no skip-to-content link despite a translated string for it

**File:** `layout/theme.liquid:46-52`
**Issue:** `<body>` renders header-group / content / footer-group with no skip link, while
`general.accessibility.skip_to_content` ("Saltar al contenido") is translated and unused. Relevant for
the stated 45-65 audience. Pre-existing from Skeleton, but `theme.liquid` is in scope.

#### IN-07: `font-display: swap` + metrically-distant fallback risks swap-in CLS

**File:** `snippets/css-variables.liquid:47-80`
**Issue:** The 3 non-preloaded faces load with `swap` against an `-apple-system` fallback with
different metrics, and headings use `text-wrap: balance` — a late face swap can reflow. Consider
`size-adjust` / `ascent-override` / `descent-override` on the `@font-face` rules to hold layout, given
the LCP/CLS budget.

#### IN-08: `.gitattributes` LF pin does not cover `templates/*.json` / `sections/*.json`

**File:** `.gitattributes:9-10`
**Issue:** Only `locales/*.json` and `config/*.json` are pinned to `eol=lf`. Shopify's editor also
rewrites `templates/*.json` and section-group JSON via the GitHub integration, so those carry the same
CRLF/BOM churn risk the phase set out to prevent.

#### IN-09: check-tokens rule 5 is not scope-aware

**File:** `scripts/check-tokens.mjs:254-273`
**Issue:** All `--x:` definitions (including every `style="..."` attribute anywhere) are pooled into
one global `globalDefs` set. A token rename that misses a consumer in an unrelated subtree can still
pass rule 5 if the old name happens to be inline-defined somewhere else. Low practical risk today (flat
token graph) but the guarantee is weaker than the comment implies.

#### IN-10: interaction-state primitives are asymmetric

**File:** `assets/base.css:77-94`
**Issue:** Form controls get a custom `:focus-visible` ring but `.button` and `a` get no `:hover` or
`:focus-visible` primitive. UA outlines still apply so nothing is broken, but the primary CTA has no
hover affordance and no branded focus ring in a set that otherwise defines one.

---

_Reviewed: 2026-09-09_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
