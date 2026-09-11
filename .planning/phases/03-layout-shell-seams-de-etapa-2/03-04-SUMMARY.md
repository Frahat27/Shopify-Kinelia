---
phase: 03-layout-shell-seams-de-etapa-2
plan: 04
subsystem: theme-shell
tags: [shopify, liquid, footer, whatsapp, floating-button, newsletter, css-tokens, a11y, runbook]

requires:
  - phase: 03-layout-shell-seams-de-etapa-2
    provides: "snippets/css-variables.liquid stacking + spacing tokens (--z-fab, --space-*, --radius) from plan 03-03; docs/RELEASE.md content-ownership rule"
provides:
  - "sections/footer.liquid extended: legal link_list guarded by size (D-14), WhatsApp link + floating button reading the global whatsapp_number setting (D-15), newsletter block behind show_newsletter (default off, D-16), starter payment block kept verbatim (D-17)"
  - "config/settings_schema.json: new t:general.whatsapp group with the free-text whatsapp_number setting (no default, format note)"
  - "assets/icon-whatsapp.svg — stroked speech-bubble glyph following the starter icon conventions (viewBox 20×20, currentColor, --icon-stroke-width)"
  - "docs/RUNBOOK-STAGING.md — the five stub page slugs, the footer menu build, the WhatsApp number field, and the open Defensa del Consumidor decision"
  - "03-USER-SETUP.md — the same three admin steps as a checklist for the human executing the runbook"
affects: [phase-05 (guía de talles reads --z-overlay, same coexistence pattern as the FAB), phase-06 (sticky ATC only has to set body.has-sticky-atc — the hiding rule already exists), phase-11 (fills the five stub pages and decides the Defensa del Consumidor link), phase-12 (payment gateway configuration lifts the payment-icons collapse), phase-13 (CLS/LCP measurement includes the newsletter-off and payment-off baseline)]

actuals:
  tokens: 9850
  tasks: 3
  commits: 3

tech-stack:
  added: []
  patterns:
    - "Free-text merchant setting used ONLY as a link target, never interpolated into a style block (T-03-17) — same discipline as the announcement bar's url setting in 03-03"
    - "A theme-global setting group (config/settings_schema.json) for a value multiple sections/elements share (footer link + floating button), instead of duplicating a section setting"
    - "A floating element as a sibling of a section's root element, inside that section's own {% stylesheet %} scope, so a layout file never needs its own style block"
    - "Ship a CSS coexistence rule before its trigger exists (body.has-sticky-atc) — the next phase sets a class, never invents a second selector"
    - "Admin-only steps (pages, menus, setting values) written to a runbook in the same PR that creates the hook they fill, per docs/RELEASE.md content-ownership rule"

key-files:
  created:
    - assets/icon-whatsapp.svg
    - docs/RUNBOOK-STAGING.md
    - .planning/phases/03-layout-shell-seams-de-etapa-2/03-USER-SETUP.md
  modified:
    - sections/footer.liquid
    - config/settings_schema.json
    - locales/es.default.json
    - locales/es.default.schema.json
    - ALLOWLIST.md
    - OVERRIDES.md

key-decisions:
  - "Five stub pages, not four — the regret-button page (boton-de-arrepentimiento) is included because Phase 11's roadmap requires it reachable, and the footer link may as well point somewhere real now"
  - "Slugs fixed as terminos / privacidad / cambios-y-devoluciones / datos-de-la-empresa / boton-de-arrepentimiento — unaccented, hyphenated, lowercase, matching the repo's identifier convention"
  - "The external Defensa del Consumidor link is left as an explicit runbook decision item, not a code decision — research assumption A4 could not close the Argentine compliance list"
  - "The floating button lives inside sections/footer.liquid (as a sibling of <footer>), not in the layout, so its styles stay inside a section's scoped {% stylesheet %} under the token checker"
  - "The button is a rounded square at --space-7 (48px, a comfortable thumb target) with the --radius token (2px cap), never a circle — a circular badge with a shadow is the house style of the exact kind of advertisement this brand avoids"
  - "The has-sticky-atc coexistence rule ships now, unwired — zero JavaScript added in this phase; Phase 6 only needs to set the class"

requirements-completed: [SHELL-02]

coverage:
  - id: D1
    description: "Every legal link in the footer resolves to a real page from day one — the link_list is guarded on size so an unconfigured menu renders nothing instead of a broken link, and no page target is ever written into the template"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 1 assert): no href=\"#...\" fragment, no href=\"/pages/...\" written into the template, menu container guarded by section.settings.menu.links.size > 0 — pass"
        status: pass
    human_judgment: true
    rationale: "The guard and the absence of a hardcoded target are proven by harness. Whether every link actually opens a real page (not a 404) depends on the runbook being executed in STAGING — deferred to the end-of-phase human check and to 03-USER-SETUP.md."
  - id: D2
    description: "A shopper can reach a person via WhatsApp from the footer and from a floating button present on every storefront page, both reading the same theme setting"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 1+2 assert): 2 occurrences of wa.me, 2 of kinelia.cta.pedir_whatsapp, 2 of rel=\"...noopener...\" in the footer markup — pass"
        status: pass
    human_judgment: true
    rationale: "The two-affordance structure and its safety attributes are proven by harness. Whether the link actually opens a real WhatsApp conversation depends on a real number being entered in STAGING — deferred to the end-of-phase human check."
  - id: D3
    description: "The WhatsApp number is a theme setting (config/settings_schema.json), free text, no invented default, with format guidance — never compiled into the template"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 1 assert): settings_schema.json has a whatsapp_number setting, type text, no default, with an info key; not interpolated inside the {% stylesheet %} block — pass"
        status: pass
    human_judgment: false
  - id: D4
    description: "The newsletter block exists in the template behind a switch that ships off (show_newsletter, default false) — today it renders nothing at all"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 1 assert): footer schema has show_newsletter, type checkbox, default === false — pass"
        status: pass
    human_judgment: false
  - id: D5
    description: "The payment icons row is kept and stays collapsed until Phase 12 configures a real gateway — the starter block and its checkbox are unchanged"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 1 assert): markup still contains shop.enabled_payment_types and show_payment_icons — pass"
        status: pass
    human_judgment: false
  - id: D6
    description: "The floating button obeys the flat visual system — Kinelia's brand colour, no shadow, no pulse, never the messaging app's own brand colour"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 2 assert): style uses var(--color-primary), no box-shadow/animation/@keyframes, no literal hex in assets/icon-whatsapp.svg — pass"
        status: pass
    human_judgment: true
    rationale: "The absence of the forbidden CSS patterns and of a literal colour is proven by harness. Whether the button visually reads as Kinelia's green rather than an advertisement is a design judgment deferred to the end-of-phase human check."
  - id: D7
    description: "The floating button already knows how to yield to the Phase 6 sticky add-to-cart bar — the hiding rule exists now, unwired; Phase 6 only sets the body class"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 2 assert): style contains body.has-sticky-atc .wa-fab { display: none } inside a max-width media query; no <script> added to the section — pass"
        status: pass
    human_judgment: false
  - id: D8
    description: "The admin steps this phase cannot perform in code — the five stub pages, the footer menu, and the WhatsApp number — are written down as a runbook with exact slugs"
    requirement: "SHELL-02"
    verification:
      - kind: other
        ref: "node -e (Task 3 assert): docs/RUNBOOK-STAGING.md names all five slugs, the whatsapp_number setting, the STAGING theme, Phase 11 ownership of content, the open Defensa del Consumidor decision, and the rebase/write-back warning — pass"
        status: pass
    human_judgment: false
  - id: D9
    description: "The starter's payment-icon block and copyright line were kept rather than rewritten"
    verification:
      - kind: other
        ref: "diff review: footer__copyright block and the payment_type_svg_tag loop are byte-identical to the pre-plan file — pass"
        status: pass
    human_judgment: false

duration: 14 min
completed: 2026-09-11
status: complete
---

# Phase 3 Plan 4: Footer (legal links, WhatsApp, newsletter) + FAB Summary

**El footer ahora tiene un menú legal guardado por tamaño, una afordancia de WhatsApp en dos lugares (link + botón flotante) que lee un setting global del tema, un bloque de newsletter que existe pero no renderiza nada hasta que Etapa 2 lo prenda, y un runbook de STAGING con los cinco slugs exactos que cierra SHELL-02 para toda la Fase 3.**

## Performance

- **Duration:** 14 min
- **Started:** 2026-09-11 ~12:26 UTC
- **Completed:** 2026-09-11 ~12:40 UTC
- **Tasks:** 3
- **Files modified:** 8 (3 creados, 5 modificados; más `03-USER-SETUP.md`, generado fuera del diff de código)

## Accomplishments

- **El menú legal nunca resuelve a una página rota.** El `link_list` del starter se conservó como el menú legal — su contenido sigue siendo del theme editor (`docs/RELEASE.md`), así que el código solo aporta la guarda `menu.links.size > 0` y un encabezado desde el locale (`sections.footer.legal_links_heading`). Ningún target de página se tipeó en el template: el runbook del Task 3 es lo que hace el menú real.
- **WhatsApp llega en dos lugares, desde un solo setting.** `config/settings_schema.json` suma un grupo `t:general.whatsapp` con el setting de texto libre `whatsapp_number` — sin default (un número inventado que llega a un desconocido es peor que un botón vacío), con nota de formato en español. El link del footer y el botón flotante (`.wa-fab`) leen `settings.whatsapp_number`, abren en un contexto nuevo con `rel="noopener noreferrer"` (T-03-16), y no renderizan nada si el setting está vacío. El número nunca se interpola en un `{% stylesheet %}` (T-03-17) — `check-tokens.mjs` lo haría fallar si alguien lo intentara.
- **El botón flotante ya sabe ceder.** Vive como hermano de `<footer>` dentro de `sections/footer.liquid` — footer-group.json se monta en toda ruta, así que es global sin tocar el layout. Cuadrado redondeado (`--radius`, nunca un círculo), tamaño `--space-7` (48px, thumb target cómodo), color `var(--color-primary)` — nunca el verde de WhatsApp (Pitfall 4) —, sin sombra ni animación (D-11). Al nivel `--z-fab` que fijó el plan 03-03. La regla `body.has-sticky-atc .wa-fab { display: none }` ya existe en telefono; la Fase 6 solo tiene que poner la clase cuando exista su barra sticky — cero JavaScript se agregó en esta fase.
- **La newsletter existe y no hace nada, a propósito.** El bloque nuevo (formulario nativo `customer`, campos desde el locale) está detrás de `show_newsletter` (checkbox, default `false`). Con el switch apagado no renderiza nada — Etapa 2 prende el switch, no escribe markup.
- **El bloque de pagos del starter no se tocó.** Sigue condicionado a `shop.enabled_payment_types`, así que colapsa solo hasta que la Fase 12 configure una pasarela real — mostrar un ícono de pago que la tienda no puede aceptar es exactamente la clase de mentira chica que esta marca no se puede permitir.
- **El runbook cierra lo que el código no puede hacer.** `docs/RUNBOOK-STAGING.md` (nuevo) documenta, en español, contra el tema `Kinelia — STAGING` (nunca LIVE): la tabla de las cinco páginas stub con su slug exacto y quién completa el contenido (Fase 11); la construcción del menú del footer, con el link a Defensa del Consumidor marcado como decisión abierta a confirmar con el desarrollador (research assumption A4, sin cerrar); la carga del número de WhatsApp; y la nota de que la franja de anuncio no necesita ningún paso. Cierra con la advertencia de write-backs del editor (`git pull --rebase` antes de push, revisar el diff de JSON). `03-USER-SETUP.md` resume los mismos tres pasos como checklist para quien ejecute el runbook.

## Task Commits

Each task was committed atomically:

1. **Task 1: The footer — legal links, the WhatsApp affordance, the switched-off newsletter** - `a58d010` (feat)
2. **Task 2: The floating contact button, already knowing how to yield to the Phase 6 bar** - `f6837c0` (feat)
3. **Task 3: Write the staging runbook and close the phase ledger** - `86615b0` (docs)

**Plan metadata:** pending (this plan's final `docs(03-04): complete...` commit lands after this SUMMARY)

## Files Created/Modified

- `sections/footer.liquid` - Legal menu guard, WhatsApp link + floating button, newsletter switch, payment block untouched
- `config/settings_schema.json` - New `t:general.whatsapp` group with `whatsapp_number` (free text, no default, format note)
- `assets/icon-whatsapp.svg` - Stroked speech-bubble glyph, starter icon conventions
- `locales/es.default.json` - `sections.footer.legal_links_heading`
- `locales/es.default.schema.json` - `general.whatsapp`, `settings.whatsapp.number` / `.number_info`, `labels.show_newsletter`
- `ALLOWLIST.md` - Footer row rewritten; new rows for the glyph and the floating button; pointer to the runbook
- `OVERRIDES.md` - Records this plan against footer/settings-schema/locales; closes the Phase 3 divergence subsection; new rule about admin steps landing in the runbook in the same PR
- `docs/RUNBOOK-STAGING.md` - New: the admin steps this phase leaves to a person
- `.planning/phases/03-layout-shell-seams-de-etapa-2/03-USER-SETUP.md` - New: checklist mirroring the plan's `user_setup` frontmatter

## Decisions Made

See `key-decisions` in the frontmatter. Summary: five stub pages (not four, the regret-button
page included), fixed unaccented-hyphenated-lowercase slugs, the Defensa del Consumidor link
left as an open runbook decision (not a code decision), the floating button placed inside the
footer section rather than the layout, a rounded square at `--space-7` rather than a circle, and
the coexistence rule shipped without its trigger (zero JavaScript in this phase).

## Deviations from Plan

None — plan executed exactly as written. No Rule 1/2/3/4 auto-fixes were needed; the starter's
payment block, copyright line, and existing locale keys were reused verbatim as the plan
directed.

## Issues Encountered

**`shopify` (Shopify CLI) is not installed in this execution environment and there is no network
to fetch Theme Check's remote schemas — the same environment gap already tracked for Phases 1-3
in `.planning/WINDOWS.md` (#9) and in `STATE.md`.** `npm run lint` therefore cannot run to
completion here because its first step (`shopify theme check --fail-level error`) fails before
the four Node checkers run. Substitute verification actually run, all green:

- `node scripts/check-tokens.mjs` → exit 0 (15 chunks de estilo, 43 custom properties, 16 settings ids)
- `node scripts/check-allowlist.mjs` → exit 0 (11 templates + 2 section-groups, 14 tipos de section, 14 archivos en `assets/`)
- `node scripts/check-secrets.mjs` → exit 0 (134 archivos trackeados)
- `node scripts/check-seams.mjs` → exit 0 (contrato intacto: 5 nombres del bus, 8 tipos de `/collect`, 7 atributos de carrito)
- Every `<verify>` automated assertion from all three tasks' PLAN.md, transcribed into standalone Node scripts and executed line by line — all green
- `git status --porcelain` (diff-filter=D across all three commits) → no deleted files at any point

**`shopify theme check` must still run in CI / a networked environment before this phase merges** — carried forward from 03-01/02/03, not new to this plan.

## User Setup Required

**Admin steps in Shopify STAGING require manual configuration.** See
[03-USER-SETUP.md](./03-USER-SETUP.md) for:
- Creating the five stub pages with their exact slugs
- Building the footer menu and linking those pages (plus the open Defensa del Consumidor decision)
- Loading the WhatsApp number into the theme setting

Full detail and rationale for each step lives in `docs/RUNBOOK-STAGING.md`.

## Broken-windows ledger

No new stub, skipped test, or unrun `<verify>` beyond the one already tracked at the project
level (`shopify theme check` itself — `.planning/WINDOWS.md` #9, `flaky-tool`, same root cause
as Phases 1-3, no new entry opened). The runbook's human-check steps (walking every footer link
in STAGING, confirming the WhatsApp conversation opens) are recorded as `human_judgment: true`
coverage entries above, deferred to the end-of-phase review per `human_verify_mode=end-of-phase`
— not an unrun verify, since no automated equivalent exists for "does this open a real WhatsApp
chat."

## Threat surface scan

No security-relevant surface outside the plan's `<threat_model>`.

- **T-03-16 (tab-nabbing via a new-context link):** both WhatsApp links carry
  `rel="noopener noreferrer"` — asserted twice in the Task 2 verify, green.
- **T-03-17 (free-text setting reaching a style block or script):** `whatsapp_number` is used
  only in a link target; the Task 1 verify fails on any occurrence of the setting id inside the
  stylesheet slice; `check-tokens.mjs` independently rejects unconstrained setting types there.
- **T-03-18 (vendored glyph carrying a script or external reference):** `assets/icon-whatsapp.svg`
  was authored from scratch in this repo, following the starter icon conventions — no `<script>`,
  no `onload`, no external `xlink:href`, no literal hex colour.
- **T-03-19 (a legal link resolving to a not-found page):** the menu container is guarded on
  size, no page target is written into the template, and the runbook's human check walks every
  link in STAGING before this is considered proven end to end.
- **T-03-20 (the merchant's WhatsApp number committed to a public repo):** the setting ships no
  default; its real value lives in `config/settings_data.json`, which the theme editor owns —
  never in this plan's diff.
- **T-03-SC (supply chain via package install):** no package was installed; every change is theme
  source, a hand-authored glyph, and documentation.

No new flags.

## Next Phase Readiness

- **SHELL-02 is fully satisfied.** Together with plan 03-03 (header + announcement bar) and this
  plan (footer + FAB), the shell requirement closes: minimal header, footer with the Argentine
  legal link list (once the runbook is executed), a WhatsApp affordance in two places, and a
  newsletter block present but off.
- **Phase 6 (sticky add-to-cart)** has exactly one line to write: set `body.has-sticky-atc` when
  its bar exists. The hiding rule for `.wa-fab` already exists at `sections/footer.liquid`.
- **Phase 11 (home + legal pages)** owns the real content for the five stub pages the runbook
  creates, and must resolve the Defensa del Consumidor link decision the runbook leaves open.
- **Phase 12 (payment gateway)** lifts the payment-icons collapse — no code change needed there,
  `shop.enabled_payment_types` already governs it.
- **Blocking action for the user before this phase is launch-ready:** execute
  `03-USER-SETUP.md` / `docs/RUNBOOK-STAGING.md` in `Kinelia — STAGING` (create the five pages,
  build the footer menu, load the WhatsApp number) — the footer and both WhatsApp affordances
  render nothing meaningful until that runs.
- **Carried-forward, non-blocking:** run the full `npm run lint` (with a real `shopify theme
  check`) in CI / a networked environment before Phase 3 merges — already in STATE.md/WINDOWS.md
  since 03-01/02/03.

## Self-Check: PASSED

- `assets/icon-whatsapp.svg` — FOUND
- `docs/RUNBOOK-STAGING.md` — FOUND
- `.planning/phases/03-layout-shell-seams-de-etapa-2/03-USER-SETUP.md` — FOUND
- `sections/footer.liquid` — FOUND (modified, verified against Task 1 + Task 2 assertions)
- `config/settings_schema.json` — FOUND (whatsapp_number setting confirmed present, theme_info still element 0)
- `ALLOWLIST.md` / `OVERRIDES.md` — FOUND (modified, verified against Task 3 assertions)
- Commit `a58d010` (Task 1) — FOUND (`git log --oneline --all | grep a58d010`)
- Commit `f6837c0` (Task 2) — FOUND
- Commit `86615b0` (Task 3) — FOUND
- `git status --porcelain` (diff-filter=D check across all three commits) — no deleted files
- The four Node checkers (`check-tokens`, `check-allowlist`, `check-secrets`, `check-seams`) — all four exit 0 on the final tree state

---
*Phase: 03-layout-shell-seams-de-etapa-2*
*Completed: 2026-09-11*
