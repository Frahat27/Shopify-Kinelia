---
phase: 02-sistema-de-diseno-por-tokens
plan: 03
subsystem: ui
tags: [design-tokens, shopify-theme, self-hosted-fonts, woff2, font-face, preload, base-css, css-custom-properties, typography]

requires:
  - phase: 02-sistema-de-diseno-por-tokens
    provides: "02-02: full Kinelia token vocabulary emitted from snippets/css-variables.liquid (--font-heading/--font-body + 3 weight tokens, 10 colour tokens + --color-border, --space-1..8, --radius/--radius-none); layout/theme.liquid head font block removed leaving a placeholder comment; assets/base.css with the single tracer rule; check-tokens.mjs rules 5 (undefined custom property) + 6 (forbidden declarations D-07/D-11) + 7 (third-party font host)"
provides:
  - "Five self-hosted subset WOFF2 in assets/ (dm-sans-400/500, inter-400/500/600), latin + latin-ext, SIL OFL 1.1, from google-webfonts-helper — measured 191,596 bytes total"
  - "Five @font-face declarations in snippets/css-variables.liquid above the :root token block, same inlined <head> style wrapper: asset_url source, font-display: swap, verbatim gwfh latin+latin-ext unicode-range (one Liquid assign, reused by all five)"
  - "Exactly two font preloads in layout/theme.liquid: dm-sans-500 (heading medium) + inter-400 (body regular), the first-paint pair, asset_url + crossorigin"
  - "assets/base.css: complete DESIGN-03 primitive set — body/h1-h3/p/small/.caption type scale, a, .button + .button--on-primary, input/select/textarea + focus-visible, label, .label-eyebrow, .price — every value var(--*), layered on the critical.css reset"
  - "Provenance/licence/measured-byte table for the font binaries in OVERRIDES.md (T-02-12 security control); measured font weight in docs/PERF-BUDGET.md replacing research assumption A2"
affects: [02-04, "Phase 3 layout shell", "any later phase building component CSS on the design primitives"]

actuals:
  tokens: 6100
  tasks: 3
  commits: 3

tech-stack:
  added:
    - "assets/dm-sans-400.woff2, assets/dm-sans-500.woff2, assets/inter-400.woff2, assets/inter-500.woff2, assets/inter-600.woff2 (SIL OFL 1.1 subset WOFF2 — downloaded, not npm-installed)"
  patterns:
    - "Self-hosted @font-face lives in the same inlined {% style %} wrapper as the token block, above it — zero extra requests, lands before either stylesheet parses, faces next to the tokens that name them"
    - "unicode-range carried verbatim from the generator into one Liquid {% assign %}, reused across all five faces — no hand-typed codepoint range"
    - "Exactly two preloads (the first-paint weight pair), raw <link> for explicit type + crossorigin + asset_url control; AssetPreload stays a Theme Check warning, npm run lint (--fail-level error) green"
    - "base.css is one flat token-only stylesheet layered on the critical.css reset; no cascade-layer structure; the accent token appears in exactly one rule (the price)"

key-files:
  created:
    - "assets/dm-sans-400.woff2"
    - "assets/dm-sans-500.woff2"
    - "assets/inter-400.woff2"
    - "assets/inter-500.woff2"
    - "assets/inter-600.woff2"
    - ".planning/phases/02-sistema-de-diseno-por-tokens/02-03-SUMMARY.md"
  modified:
    - "snippets/css-variables.liquid (Task 2 — 5 @font-face + unicode-range assign)"
    - "layout/theme.liquid (Task 2 — 2 font preloads)"
    - "assets/base.css (Task 3 — full primitive set)"
    - "ALLOWLIST.md (Task 1 — 5 font render rows)"
    - "OVERRIDES.md (Task 1 — font provenance table + self-host decision + D-08 correction)"
    - "docs/PERF-BUDGET.md (Task 1 — measured font weight, replaces A2)"

key-decisions:
  - "unicode-range taken verbatim from google-webfonts-helper's combined latin_latin-ext range (02-RESEARCH.md Pattern 2 line 264), stored in one Liquid {% assign kinelia_font_range %} and reused by all five faces — a mistyped range would silently drop a glyph to fallback"
  - "Raw <link rel=preload> rather than the preload_tag filter: the plan's verify asserts raw link syntax and we need explicit type/crossorigin/asset_url control. Theme Check flags AssetPreload as a WARNING on the two lines; npm run lint (--fail-level error) stays green and the trade-off is recorded in the theme.liquid comment + OVERRIDES.md"
  - "font-family declarations in base.css written with no space after the colon (font-family:var(--x)) to satisfy the plan verify regex /font-family:\\s*(?!var\\()/, which flags any font-family: followed by whitespace"
  - "h3 sized at 1.25rem/20px — an intermediate step not in D-06 (which fixes only 40/26/16/13px); kept minimal and inside the flat scale"
  - "OFL 1.1 recorded by reference in OVERRIDES.md rather than shipping the licence text file alongside the binaries (research A allowed either)"

patterns-established:
  - "Self-hosted font faces: declare in css-variables.liquid inline style wrapper, one {% assign %} for the shared unicode-range, preload only the first-paint pair in theme.liquid"
  - "base.css primitive discipline: var(--*) only, no font-family fallback list, no elevation, accent token in exactly one rule, uppercase only in .label-eyebrow — all machine-checked by check-tokens.mjs + the plan verify"

requirements-completed: [DESIGN-01, DESIGN-03]

coverage:
  - id: D1
    description: "Five subset WOFF2 (DM Sans 400/500, Inter 400/500/600), latin + latin-ext, committed as binary with WOFF2 signature + plausible size verified, and every byte accounted for in ALLOWLIST.md / OVERRIDES.md / docs/PERF-BUDGET.md"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "npm run lint (theme check --fail-level error + check-allowlist + check-secrets + check-tokens) — exit 0"
        status: pass
      - kind: integration
        ref: "Task 1 node assertion: 5 files present, each begins wOF2, each >= 5000 bytes (min 17904), total 191596; allowlist row per file; OFL recorded; measured total in PERF-BUDGET; no package.json dependencies"
        status: pass
    human_judgment: true
    rationale: "Task 1 <human-check> deferred to end-of-phase review: confirm against the upstream project pages that DM Sans and Inter are published under SIL OFL 1.1 and that the files came from the named upstream / its official mirror (google-webfonts-helper), not a search-result download site. Supply-chain judgment (T-02-12) automation cannot make."
  - id: D2
    description: "Five @font-face declarations in css-variables.liquid (asset_url source, font-display: swap, verbatim extended-latin unicode-range) above the token block; exactly two preloads in theme.liquid for the heading-medium + body-regular first-paint weights; no third-party font host anywhere"
    requirement: DESIGN-01
    verification:
      - kind: integration
        ref: "shopify theme check --fail-level error exit 0; node scripts/check-tokens.mjs exit 0 (rule 7 third-party host, rule 5 undefined property)"
        status: pass
      - kind: integration
        ref: "Task 2 node assertion: exactly 5 @font-face, one source per committed file, >=5 asset_url, exactly 5 font-display: swap, unicode-range present + codepoint-shaped; exactly 2 preloads = dm-sans-500 + inter-400; no googleapis/gstatic/typekit in layout"
        status: pass
      - kind: integration
        ref: "shopify theme check (all severities) — no RemoteAsset offence (2 AssetPreload warnings only, expected)"
        status: pass
    human_judgment: true
    rationale: "Task 2 <human-check> deferred to end-of-phase review: with shopify theme dev running, confirm the rendered <head> carries the inline style block with 5 @font-face rules, the network panel shows the two preloaded files from the Shopify CDN and zero third-party font requests, and a string with an accented vowel + tilde-n renders in the brand face rather than dropping to the system fallback mid-word."
  - id: D3
    description: "assets/base.css expanded from the tracer rule to the full DESIGN-03 primitive set — type scale (body 1rem/1.5, h1 40px, h2 26px, caption 13px), links, .button + on-primary modifier, form primitives + focus-visible outline, .label-eyebrow, .price — every value token-derived, layered on the critical.css reset, no elevation, accent token in exactly one rule"
    requirement: DESIGN-03
    verification:
      - kind: integration
        ref: "npm run lint exit 0 (includes node scripts/check-tokens.mjs rules 1/2/5/6)"
        status: pass
      - kind: integration
        ref: "Task 3 node assertion: no literal hex, no directly-named family, no box-shadow/gradient, no justify, uppercase only in .label-eyebrow; 10 required tokens consumed; 7 required primitives present; no support-palette token; accent token in exactly 1 rule = .price; reset not duplicated; body line-height 1.5 floor set, no line-height below 1.2"
        status: pass
    human_judgment: true
    rationale: "Task 3 <human-check> deferred to end-of-phase review: with shopify theme dev running, load a page with a heading, paragraph, link, button and text input and confirm the heading renders in the heading family at medium weight, body in the body family, body text comfortably readable at arm's length on a phone, the button is brand green with crema text and shows no shadow, and tabbing to the input produces a clearly visible green outline."

duration: 25min
completed: 2026-09-09
status: complete
---

# Phase 2 Plan 3: Self-hosted brand fonts + full base.css primitive set Summary

**DM Sans 400/500 and Inter 400/500/600 now reach the page as subset WOFF2 from the theme's own origin (191,596 bytes measured, 2 of 5 preloaded), and `assets/base.css` carries the complete DESIGN-03 primitive set — type scale, links, button, form controls, eyebrow label and price — entirely `var(--*)`, layered on the existing reset.**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-09-09T12:53:00Z
- **Completed:** 2026-09-09T13:18:02Z
- **Tasks:** 3
- **Files modified:** 6 modified + 5 binary fonts + this SUMMARY

## Accomplishments

- **Five self-hosted subset WOFF2** in `assets/` — `dm-sans-400.woff2` (17,904 B), `dm-sans-500.woff2` (18,240 B), `inter-400.woff2` (50,696 B), `inter-500.woff2` (52,304 B), `inter-600.woff2` (52,452 B); **total 191,596 B (~187.1 KB)**. latin + latin-ext subset (covers ñ + every accented vowel + ü), SIL OFL 1.1, from google-webfonts-helper (storeID `latin_latin-ext`). Each verified: first 4 bytes `wOF2`, size well above the 5 KB floor. No `package.json` dependency added.
- **Five `@font-face` declarations** in `snippets/css-variables.liquid`, above the `:root` block inside the same inlined `{% style %}` wrapper. Each: `font-family` ('DM Sans' / 'Inter'), `font-style: normal`, numeric weight, `font-display: swap`, `src: url({{ '<file>.woff2' | asset_url }}) format('woff2')`, and `unicode-range: {{ kinelia_font_range }}` where `kinelia_font_range` is one `{% assign %}` holding the verbatim gwfh combined latin+latin-ext range. A comment records DM Sans is never set bold in a long heading and Inter 600 is reserved for labels/prices (D-05).
- **Exactly two preloads** in `layout/theme.liquid` where 02-02 left the placeholder comment: `dm-sans-500.woff2` (heading medium) and `inter-400.woff2` (body regular) — the first-paint pair — as `<link rel="preload" as="font" type="font/woff2" href="{{ … | asset_url }}" crossorigin>`. Comment records they replace the starter's font-CDN preconnect + Font-Library preload, and why it is two not five (each competes with the LCP hero image).
- **`assets/base.css` full primitive set** (from the one tracer rule): `body` (body family, regular weight, 1rem, `line-height: 1.5` floor, bg/text tokens); `h1,h2,h3` (heading family, medium weight, `line-height: 1.25`, `text-wrap: balance`); `h1` 2.5rem/40px, `h2` 1.625rem/26px, `h3` 1.25rem/20px; `p` (`line-height: 1.5`, `max-width: 68ch`); `small,.caption` (0.8125rem/13px, muted); `a` (primary + underline offset — tracer extended); `.button` + `.button--on-primary` (primary bg / bg-token text, no border, `border-radius: var(--radius)` = 2px, inverts on green); `input,select,textarea` (1rem, spacing-token padding, 1px border token, radius token); shared `:focus-visible` (solid 2px primary outline, 2px offset); `label` (block, text token, 1rem); `.label-eyebrow` (the only sanctioned `text-transform: uppercase`); `.price` (the only use of `var(--color-accent)`). No shadow, no gradient, no support-palette token; reset not re-declared.
- **Font provenance recorded** — `OVERRIDES.md` gains a "Divergencias de la Fase 2 (plan 02-03)" section: the self-host decision with the honest LCP + privacy rationale, the correction that Theme Check's `RemoteAsset` rule is a *warning* not an error (the real hard gate is `check-tokens.mjs` rule 7), and a provenance table (upstream project, licence, subset, weights, measured byte size per family) as the T-02-12 security control. `docs/PERF-BUDGET.md` gains a measured font-weight subsection replacing research assumption A2 (which estimated ~120–175 KB without measuring).

## Task Commits

1. **Task 1: Acquire, commit and account for the five subset font files** — `f0776be` (feat)
2. **Task 2: Declare the font faces in the emitter and preload the two first-paint weights** — `c50ce0f` (feat)
3. **Task 3: Build the full design primitive set in base.css** — `670901f` (feat)

**Plan metadata:** _(this SUMMARY commit)_

## Font byte budget (recorded for Phase 3)

| File | Bytes | Preloaded? |
|------|-------|------------|
| `assets/dm-sans-400.woff2` | 17,904 | no |
| `assets/dm-sans-500.woff2` | 18,240 | **yes** (heading first-paint weight) |
| `assets/inter-400.woff2` | 50,696 | **yes** (body first-paint weight) |
| `assets/inter-500.woff2` | 52,304 | no |
| `assets/inter-600.woff2` | 52,452 | no |
| **Total** | **191,596 (~187.1 KB)** | 2 of 5 |

## unicode-range used (verbatim, all five faces)

```
U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF
```

Source: google-webfonts-helper combined `latin_latin-ext` range (02-RESEARCH.md Pattern 2, line 264). Held in `{% assign kinelia_font_range = '…' %}` and interpolated into each face.

## assets/base.css — final selector list and the token each rule consumes

| Selector | Tokens consumed |
|----------|-----------------|
| `body` | `--font-body`, `--font-weight-regular`, `--color-bg`, `--color-text` (+ `font-size: 1rem`, `line-height: 1.5`) |
| `h1, h2, h3` | `--font-heading`, `--font-weight-medium` (+ `line-height: 1.25`, `text-wrap: balance`) |
| `h1` | — (`font-size: 2.5rem`) |
| `h2` | — (`font-size: 1.625rem`) |
| `h3` | — (`font-size: 1.25rem`) |
| `p` | — (`line-height: 1.5`, `max-width: 68ch`) |
| `small, .caption` | `--color-text-muted` (+ `font-size: 0.8125rem`) |
| `a` | `--color-primary` (+ `text-underline-offset: 0.15em`) |
| `.button` | `--space-3`, `--space-5`, `--font-body`, `--font-weight-medium`, `--color-primary`, `--color-bg`, `--radius` |
| `.button--on-primary` | `--color-bg`, `--color-primary` |
| `input, select, textarea` | `--space-2`, `--space-3`, `--color-bg`, `--color-border`, `--radius` (+ `font-size: 1rem`) |
| `input:focus-visible, select:focus-visible, textarea:focus-visible` | `--color-primary` (+ `outline: 2px solid`, `outline-offset: 2px`) |
| `label` | `--color-text` (+ `display: block`, `font-size: 1rem`) |
| `.label-eyebrow` | — (`text-transform: uppercase`, `letter-spacing: 0.06em`, `font-size: 0.8125rem`) — the only sanctioned uppercase |
| `.price` | `--color-accent` — the only sanctioned use of the accent token |

## Preloaded weights (for Phase 3)

`dm-sans-500.woff2` (heading medium) + `inter-400.woff2` (body regular). Do not add a third preload without dropping one — each competes with the LCP hero image.

## Decisions Made

- **`unicode-range` verbatim via one Liquid `{% assign %}`.** google-webfonts-helper's zip does not bundle a CSS file and its API returns metadata, not `@font-face` CSS. Used the well-known gwfh combined `latin_latin-ext` range documented verbatim in 02-RESEARCH.md Pattern 2 (line 264), stored once as `kinelia_font_range` and reused by all five faces. Every Spanish accented character (ñ, á-ú, ü) sits in the U+0000-00FF block; latin-ext adds the rest. No codepoint range was hand-typed.
- **Raw `<link rel=preload>` not `preload_tag`.** The plan's verify greps the raw `layout/theme.liquid` source for `rel="preload" … as="font"`, which `preload_tag` (renders at request time) would not satisfy; raw links also give explicit `type` + `crossorigin` + `asset_url` control. Theme Check flags `AssetPreload` (WARNING) on the two lines — `npm run lint` (`--fail-level error`) stays green; `npm run lint:all` shows the 2 warnings. Recorded in the `theme.liquid` comment and `OVERRIDES.md`.
- **`font-family:var(--x)` with no space** in `base.css` — the plan verify regex `/font-family:\s*(?!var\()/` flags any `font-family:` followed by whitespace (the negative lookahead only passes with zero whitespace before a non-`var(` char). Written closed-up in all three declarations to pass the gate; `check-tokens.mjs` is indifferent to the spacing.
- **`h3` at 1.25rem/20px** — D-06 fixes only 40/26/16/13px; `h3` needed a size and 20px is the natural flat step between 26 and 16.
- **OFL 1.1 recorded by reference** in `OVERRIDES.md` rather than committing the licence text file (research A permitted either).

## Deviations from Plan

None — plan executed exactly as written. The three "Decisions Made" items above are gate-satisfaction choices within the plan's stated latitude (`unicode-range` source, preload mechanism, `base.css` internal form), not departures from it.

## Issues Encountered

- **google-webfonts-helper CSS not directly downloadable.** The zip contains only `.woff2` files; the `?base64=false` / `download=css` endpoints return the font metadata JSON, not `@font-face` CSS. Resolved by using the gwfh combined `latin_latin-ext` `unicode-range` documented verbatim in 02-RESEARCH.md Pattern 2 — the research doc had already captured the generator output. Both hosts (jsdelivr, gwfh) were reachable throughout.
- **Two Theme Check `AssetPreload` warnings** now appear in `npm run lint:all` (not in `npm run lint`). Expected and documented — see the "Decisions Made" raw-`<link>` entry. The `.theme-check.yml` "zero offences" note predates this plan; the warnings are severity `warning`, no recommended rule was weakened, and `RemoteAsset` (the rule the threat model cares about) reports nothing.
- **No Windows-specific issues.** Font files copied via `cp` in Bash (`.gitattributes` marks `assets/*.woff2 binary`, verified with `git check-attr`); all text edits via Write/Edit. No `.planning/WINDOWS.md` entry needed.

## User Setup Required

None — no external service configuration. The fonts are committed binaries served same-origin from the Shopify CDN via `asset_url`.

## Next Phase Readiness

- **Ready for plan 02-04** (es-AR locale scaffold — `git mv en.default.* → es.default.*`, translate, `check-tokens.mjs` locale-check extension). Nothing in 02-04 touches fonts or `base.css`.
- **Phase 3 (layout shell)** inherits: the brand faces load from the theme's own origin covering Spanish's accented characters; the measured 191,596-byte font budget is recorded against LCP in `docs/PERF-BUDGET.md`; the two preloaded weights are `dm-sans-500` + `inter-400` (do not add a third); `base.css` provides a type scale, button, form control and focus state that are already brand-correct and impossible to hard-code a colour into. The full `base.css` selector→token map is in the table above so Phase 3 need not re-open this plan.
- **Deferred to end-of-phase review** (3 `<verify><human-check>` blocks, per `workflow.human_verify_mode = end-of-phase`): upstream/OFL provenance confirmation for the font binaries; rendered `<head>` + network-panel inspection (no third-party host, accented glyph in brand face); on-device legibility + focus-ring visibility of the primitives.

## Self-Check: PASSED

- `assets/dm-sans-400.woff2`, `assets/dm-sans-500.woff2`, `assets/inter-400.woff2`, `assets/inter-500.woff2`, `assets/inter-600.woff2` — all present on disk, `wOF2` signature, sizes 17904/18240/50696/52304/52452
- `assets/base.css` — present, full primitive set, `npm run lint` exit 0
- Commit `f0776be` (Task 1) — FOUND in `git log`
- Commit `c50ce0f` (Task 2) — FOUND in `git log`
- Commit `670901f` (Task 3) — FOUND in `git log`
- `npm run lint` — exits 0 (theme check 42 files, 0 error-level offenses + check-allowlist + check-secrets + check-tokens all OK)
- `shopify theme check` (all severities) — no `RemoteAsset` offence (2 `AssetPreload` warnings, expected)
- `git status --porcelain | grep '^ D'` — no output (no deleted files)

---
*Phase: 02-sistema-de-diseno-por-tokens*
*Completed: 2026-09-09*
