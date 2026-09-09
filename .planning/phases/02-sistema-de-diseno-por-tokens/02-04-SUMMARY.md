---
phase: 02-sistema-de-diseno-por-tokens
plan: 04
subsystem: content
tags: [locales, i18n, es-AR, voseo, shopify-theme, brand-copy, governance, check-tokens, legal-legend, prohibited-claims]

requires:
  - phase: 02-sistema-de-diseno-por-tokens
    provides: "02-01: scripts/check-tokens.mjs with the structural locale check (exactly one *.default.json, strict-parse + no-BOM on both Spanish files), exported ALLOWED_FILES / EXEMPT_FILES sets, process.exitCode convention, wired into npm run lint + the required CI gate; .gitattributes pins locales/*.json to LF"
  - phase: 02-sistema-de-diseno-por-tokens
    provides: "02-02: locales/en.default.schema.json carries Spanish editor labels for the ten colour families + settings.type.heading/body + the restricted-use info strings; config/settings_schema.json is the authoritative t: key list"
provides:
  - "locales/es.default.json — the Argentine Spanish storefront string set (git mv from en.default.json, history preserved), voseo throughout, every English namespace kept (404, blog, cart, customers, collections, gift_card, password, search) plus general / products / sections / templates / newsletter; _html suffix only on keys that already carried it"
  - "locales/es.default.schema.json — the Spanish theme-editor label set (git mv from en.default.schema.json), every t: key config/settings_schema.json references resolves"
  - "kinelia locale namespace — six approved CTAs (kinelia.cta.*), kinelia.promesa_raiz, kinelia.legal_disclaimer — each verbatim from the Brand Book (D-15), referenced by key by every later copy phase"
  - "scripts/check-tokens.mjs rule 8 extended — sole *.default.json must be es.default.json (D-14); the eight REQUIRED_STOREFRONT_KEYS must resolve to non-empty strings (D-15); kinelia.legal_disclaimer must not carry the _html suffix (T-02-16); new exported constants REQUIRED_STOREFRONT_KEYS / LEGAL_LEGEND_KEY / LEGAL_LEGEND_HTML_KEY"
  - "docs/BRAND-COPY.md — the inherited copy contract: voseo voice + rationale, the six CTAs cited next to their keys, the root promise, the legal legend (where mandatory, why a plain escaped key), the four LOCKED prohibited claims (D-16), the D-02 colour/typography pairings that are copy decisions, the no-strings-in-Liquid rule"
  - "OVERRIDES.md ## Locales note + ledger rows for 02-04; ALLOWLIST.md ## Idioma del tema note (added in 02-04 Task 1, committed in b0dd6ca)"
  - "Verified answer to research assumption A5: shopify theme check --fail-level error exits 0 with Spanish as the sole default and NO English file present — the single-locale Spanish theme is confirmed, no en.json stub was added"
affects: ["Phase 3 layout shell (references kinelia.* CTA keys)", "Phase 4 offer metaobject (owns prices — deliberately absent from the locale)", "Phase 7 landing copy", "Phase 10 avatar angles", "Phase 11 home + legal pages", "any later phase that writes a user-facing string"]

actuals:
  tokens: 5200
  tasks: 3
  commits: 4

tech-stack:
  added: []
  patterns:
    - "Theme default language changed by git mv + translate-in-place, never by delete-and-recreate — git log --follow shows continuity (Pitfall 9); the repo rule that surface reduces by not-referencing and never by deletion holds for locales too"
    - "Spanish is the sole default locale — a second (English) locale file would trigger Theme Check's MatchingTranslations rule, imposing permanent key-sync tax for a single-market store; verified acceptable by running the linter, not assumed"
    - "Brand copy lives once as named locale keys under the kinelia namespace; docs/BRAND-COPY.md is the human contract, scripts/check-tokens.mjs is the enforced copy — the same two-witness pattern as OVERRIDES.md / check-tokens for tokens"
    - "The legal legend is a plain (auto-escaped) key on purpose; the _html suffix is a security boundary, not a formatting choice — the checker fails if the legend is renamed to carry it"

key-files:
  created:
    - "docs/BRAND-COPY.md"
    - ".planning/phases/02-sistema-de-diseno-por-tokens/02-04-SUMMARY.md"
  renamed:
    - "locales/en.default.json -> locales/es.default.json (git mv, then translated in place)"
    - "locales/en.default.schema.json -> locales/es.default.schema.json (git mv, then translated in place)"
  modified:
    - "locales/es.default.json (Task 1 — voseo translation + kinelia namespace)"
    - "locales/es.default.schema.json (Task 1 — Spanish editor labels)"
    - "ALLOWLIST.md (Task 1 — ## Idioma del tema note)"
    - "scripts/check-tokens.mjs (Task 2 — rule 8 locale extension + 3 exported constants)"
    - "OVERRIDES.md (Task 3 — ## Locales note + 02-04 ledger rows + no-strings-in-templates rule)"

key-decisions:
  - "RQ-3 resolved as planned: Spanish only, English dropped by rename not kept. Verified against the linter — shopify theme check --fail-level error exits 0 with es.default.* as the sole locale and no en.json. The only two warnings are the pre-existing AssetPreload warnings from plan 02-03. Research assumption A5 is closed: no English fallback is required."
  - "Prices kept out of the locale — the manual's reference prices are placeholders that belong to the Phase 4 offer metaobject; a price in a translation file is a price nobody can change without a code deploy. The checker's verify asserts no 24.900 / 42.000 string appears."
  - "The legal legend is kinelia.legal_disclaimer (plain key), not kinelia.legal_disclaimer_html. check-tokens.mjs rule 8 fails if it is moved to the _html key (T-02-16 mitigation)."
  - "check-tokens.mjs extended, not restructured — same violations-array accumulation, same Spanish 'x '-prefixed failure style, same process.exitCode-and-return convention, Node stdlib only, no package.json dependency added."

patterns-established:
  - "User-facing string discipline: it lives in locales/es.default.json and is referenced by key ({{ 'clave' | t }}); it never lives in a Liquid template. Brand copy additionally appears in docs/BRAND-COPY.md in the same PR. Enforced by check-tokens.mjs, documented in OVERRIDES.md ## Reglas + ALLOWLIST.md."
  - "Governance-as-code: an inherited contract document (docs/BRAND-COPY.md) paired with an executable checker (check-tokens.mjs) so a later phase trips a failing build rather than a forgotten convention."

requirements-completed: [DESIGN-04]

coverage:
  - id: D1
    description: "The theme's sole default language is Argentine Spanish in rioplatense voseo — both locale files renamed by git (history preserved), translated in place, strict JSON, no BOM, no CR; every English namespace kept plus the research scaffold's additions"
    requirement: DESIGN-04
    verification:
      - kind: integration
        ref: "shopify theme check --fail-level error — exits 0 (2 pre-existing AssetPreload warnings only)"
        status: pass
      - kind: integration
        ref: "Task 1 node assertion: exactly one *.default.json and it is es.default.json; both Spanish files parse strict, no BOM, no CR; no lost namespace (404/cart/search/password/gift_card/customers); every schema t: key resolves; no placeholder price"
        status: pass
      - kind: integration
        ref: "git log --follow --oneline -- locales/es.default.json — more than one commit, proving a rename not a recreation (Pitfall 9)"
        status: pass
    human_judgment: true
    rationale: "Task 1 <human-check> deferred to end-of-phase review: with shopify theme dev running, load /, /cart, /search and a bad URL — confirm every visible string is Spanish, no raw translation key appears, and the voice reads as rioplatense voseo not neutral Spanish; then open the theme editor and confirm the Colores / Tipografía groups show Spanish labels."
  - id: D2
    description: "The six approved CTAs, the root promise and the mandatory legal legend exist once as named kinelia.* locale keys, each verbatim from the Brand Book (D-15); the legend is a plain auto-escaped key"
    requirement: DESIGN-04
    verification:
      - kind: integration
        ref: "Task 1 node assertion: all eight kinelia.* paths resolve to non-empty strings; the legend contains 'No reemplaza el tratamiento' and 'consultá a tu médico'; the promise equals 'Llegá a la noche con las piernas descansadas.' verbatim"
        status: pass
      - kind: integration
        ref: "node scripts/check-tokens.mjs — exits 0 clean; exits non-zero for each seeded negative case (brand key removed / legend moved to _html key / second default locale file present)"
        status: pass
    human_judgment: false
  - id: D3
    description: "The prohibited-claims contract and the copy governance rules are written into docs/BRAND-COPY.md where the copy phases will find them; check-tokens.mjs is the enforced copy of the language + brand-key rule"
    requirement: DESIGN-04
    verification:
      - kind: integration
        ref: "Task 3 node assertion: BRAND-COPY.md carries all eight approved strings each cited next to its key, all four prohibited-claim categories (cura / recomendado por médicos / garantizados / urgencia), the voseo voice rule; OVERRIDES.md has a ## Locales note recording 02-04, BRAND-COPY.md, check-tokens.mjs and the A5 finding"
        status: pass
      - kind: integration
        ref: "npm run lint — exit 0 (theme check + check-allowlist + check-secrets + check-tokens)"
        status: pass
    human_judgment: true
    rationale: "Whether the voseo translation reads naturally to an Argentine ear, and whether the prohibited-claims wording is legally sufficient for a health-adjacent product in Argentina, is human judgment — deferred to end-of-phase review and revisited by each copy phase."

duration: 20min
completed: 2026-09-09
status: complete
---

# Phase 2 Plan 4: es-AR voseo locale + the inherited copy contract Summary

**The theme's sole default language is now Argentine Spanish in rioplatense voseo — both locale files renamed by git and translated in place, the six approved calls to action plus the root promise and the mandatory legal legend live once as `kinelia.*` keys, `check-tokens.mjs` fails if the language drifts or a brand key disappears, and `docs/BRAND-COPY.md` carries the voice rules and the four LOCKED prohibited claims for every later copy phase.**

## Performance

- **Duration:** ~20 min
- **Tasks:** 3
- **Commits:** 4 (2 for Task 1 — the pure rename, then the translation — plus 1 each for Tasks 2 and 3)
- **Files:** 2 renamed + 4 modified + `docs/BRAND-COPY.md` + this SUMMARY

## The single-locale question — answered, not assumed

Research assumption A5 flagged that Shopify's docs say only that *exactly one* `*.default` file is permitted and are silent on whether an English file must exist at all.

**Verified outcome:** `shopify theme check --fail-level error` run with `locales/es.default.json` + `locales/es.default.schema.json` as the sole locale and **no English file present** exits **0**. The only two offences reported at any severity are the pre-existing `AssetPreload` warnings from plan 02-03. **The Spanish-only theme is confirmed; no `en.json` stub was added.** Recorded in `OVERRIDES.md` ## Locales.

## The `kinelia` namespace (verbatim)

```json
"kinelia": {
  "cta": {
    "quiero_las_mias": "Quiero las mías",
    "ver_talles_precio": "Ver talles y precio",
    "elegir_talle": "Elegir mi talle",
    "comprar": "Comprar",
    "comprar_ahora": "Comprar ahora",
    "pedir_whatsapp": "Pedir por WhatsApp"
  },
  "promesa_raiz": "Llegá a la noche con las piernas descansadas.",
  "legal_disclaimer": "Producto de uso cotidiano para el confort de las piernas. No reemplaza el tratamiento ni el diagnóstico médico. Ante várices, trombosis, diabetes o embarazo, consultá a tu médico antes de usarlo."
}
```

`kinelia.legal_disclaimer` is a **plain key** — auto-escaped on render. Renaming it to `kinelia.legal_disclaimer_html` fails the checker (T-02-16).

## `scripts/check-tokens.mjs` — full check list across plans 02-01 and 02-04

| # | Rule | Added | Fails when |
|---|------|-------|------------|
| 1 | Literal colour in component CSS | 02-01 | `#rgb` / `#rrggbb` / `#rrggbbaa` outside `css-variables.liquid` / `settings_schema.json` / `settings_data.json` |
| 2 | Brand font-family name in component CSS | 02-01 | `"DM Sans"` / `"Inter"` outside the allowed files |
| 3 | `settings.<id>` referenced by the emitter but absent from the schema, or of an unbounded input type | 02-01 | a free-text setting interpolated into `{% style %}` (injection surface) |
| 4 | `--color-*` token interpolates a setting without a Liquid `\| default:` filter | 02-01 | missing fallback on a colour token |
| 5 | Component CSS uses `var(--x)` for a custom property nothing defines | 02-01 | a token rename silently strips a component of its colour |
| 6 | Component CSS uses shadow / colour-ramp / gradient / justified text / uppercase outside the one eyebrow utility | 02-01 | D-07 / D-11 — the flat-on-a-phone-in-glare system |
| 7 | Third-party font host (Google Fonts / Typekit) in `layout/` `snippets/` `assets/` | 02-01 (02-03 hardened) | a remote font URL appears |
| 8a | `locales/` has other than exactly one `*.default.json` | 02-01 (structural) | a second default file appears |
| 8b | That file, or its `.default.schema.json` sibling, fails strict parse or begins with a BOM | 02-01 (structural) | a Windows editor writes a BOM / trailing comma |
| 8c | The sole `*.default.json` is not `es.default.json` | **02-04** | the store's language drifts (D-14) |
| 8d | Any of the eight `REQUIRED_STOREFRONT_KEYS` fails to resolve to a non-empty string in `es.default.json` | **02-04** | a brand CTA / promise / legend disappears (D-15); a missing intermediate object counts |
| 8e | `kinelia.legal_disclaimer` carries the `_html` suffix | **02-04** | the legend is moved to an unescaped key (T-02-16) |
| 9 | The `assets/` CSS scan comes back empty | 02-01 | an empty scan cannot report success |

New exported constants (02-04): `REQUIRED_STOREFRONT_KEYS`, `LEGAL_LEGEND_KEY`, `LEGAL_LEGEND_HTML_KEY`.

## Task Commits

1. **Task 1a: rename `en` locale files to `es`** (pure `git mv`, history preserved) — `7f894f9` (refactor)
2. **Task 1b: translate the sole default locale to voseo + add the `kinelia` namespace** (+ `ALLOWLIST.md` ## Idioma del tema note) — `b0dd6ca` (feat)
3. **Task 2: close the locale half of the executable contract in `check-tokens.mjs`** — `655b8f7` (feat)
4. **Task 3: write the inherited copy contract + close the phase ledger** (`docs/BRAND-COPY.md` + `OVERRIDES.md`) — `7fc723f` (docs)

**Plan metadata:** _(this SUMMARY commit)_

## Decisions Made

- **English dropped, not kept — and verified.** Keeping an English locale would trigger Theme Check's `MatchingTranslations` rule, imposing a permanent key-sync obligation across both files for a single-market Argentine store. The linter accepts Spanish-only (exit 0), so no fallback was added. A5 closed.
- **Rename, not delete.** `git mv` both files, then translate in place. `git log --follow -- locales/es.default.json` returns more than one commit. The repo's standing rule — reduce by not referencing, never by deleting — holds for locales.
- **Prices excluded from the locale.** They are Phase 4 offer-metaobject content; a hard-coded price in a translation file is unmaintainable. The verify asserts no `24.900` / `42.000` appears.
- **`check-tokens.mjs` extended, not restructured.** Same accumulation, message style, exit convention; Node stdlib only; no dependency added.

## Deviations from Plan

None — plan executed as written. Task 1 was committed as two commits (the pure rename, then the translation) so `git` records the rename cleanly; the plan's `<artifacts_this_plan_produces>` anticipates this ("both by git rename, then translated in place").

## Issues Encountered

- **No Windows-specific issues.** `.gitattributes` pins `locales/*.json` to LF (plan 02-01); both files written with the Write tool, never PowerShell `Set-Content`. The BOM / CR assertions in `check-tokens.mjs` pass. No `.planning/WINDOWS.md` entry needed.

## User Setup Required

None — no external service configuration. After launch, merchant translations saved in Shopify's Language Editor would layer over these defaults; today the store is password-protected until Phase 14 and no translation has ever been saved.

## Next Phase Readiness

- **Phase 2 is code-complete — all four plans landed.** Ready for `/gsd-verify-work` / end-of-phase review. Deferred human-checks accumulated across 02-01…02-04: token-path render inspection, font provenance + rendered `<head>` / network panel, on-device primitive legibility + focus ring, and the four locale/editor language + voseo-voice checks from this plan.
- **Phase 3 (layout shell)** inherits: the theme speaks Argentine Spanish natively; the header/footer/nav copy is already translated; `kinelia.cta.*` keys are ready to reference from the buy box and sticky ATC (Phase 5/6) — never retype a CTA into a template.
- **Phase 4 (product / content data model)** owns prices — deliberately absent from the locale.
- **Phases 7 / 10 / 11 (copy phases)** inherit `docs/BRAND-COPY.md`: the voseo voice, the six CTAs, the root promise, the mandatory legal legend and its placement rules, and the four LOCKED prohibited claims (D-16). `check-tokens.mjs` fails the build if the language drifts or a brand key disappears.

## Self-Check: PASSED

- `locales/es.default.json`, `locales/es.default.schema.json` — present; `locales/en.default.*` — gone (by rename); `git status --porcelain | grep '^ D'` — no output
- `git log --follow --oneline -- locales/es.default.json` — more than one commit (rename proven)
- Commit `7f894f9` (Task 1a), `b0dd6ca` (Task 1b), `655b8f7` (Task 2), `7fc723f` (Task 3) — all FOUND in `git log`
- `npm run lint` — exits 0 (theme check 42 files / 0 error-level offences + check-allowlist + check-secrets + check-tokens all OK)
- `node scripts/check-tokens.mjs` — exits 0 clean; exits non-zero for all three seeded locale negative cases
- `docs/BRAND-COPY.md` — present, carries the eight approved strings + four prohibited-claim categories + the voseo rule
- `OVERRIDES.md` — `## Locales` note present, records 02-04 / `BRAND-COPY.md` / `check-tokens.mjs` / the A5 finding; `## Reglas` carries the no-strings-in-templates rule

---
*Phase: 02-sistema-de-diseno-por-tokens*
*Completed: 2026-09-09*
