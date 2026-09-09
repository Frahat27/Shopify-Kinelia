---
status: complete
phase: 02-sistema-de-diseno-por-tokens
source: [02-01-SUMMARY.md, 02-02-SUMMARY.md, 02-03-SUMMARY.md, 02-04-SUMMARY.md]
started: 2026-09-09T14:19:32Z
updated: 2026-09-09T15:05:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. Render del <head> en un storefront vivo (token path + fuentes)
expected: |
  Con `shopify theme dev` corriendo, el <head> emite `--color-primary: #0F6E56`
  + las custom properties de marca, las 5 @font-face y los 2 preloads de
  fuente; primitivas de base.css derivadas de tokens.
result: pass
note: |
  Fallo inicial (blocker): el development theme efímero #150932127950 conservaba
  locales/en.default.* de la Fase 01 -> colisión de doble locale default ->
  "Failed to Upload Theme Files". Resuelto borrando ese dev theme
  (shopify theme delete --theme 150932127950 --force); `theme dev` recreó uno
  limpio (#150941597902) y subió sin error.
  Verificado en http://127.0.0.1:9292 (browser MCP, 2026-09-09):
  - --color-primary resuelve a #0F6E56 en el <style> inline del <head>
  - 11 custom properties --color-* emitidas
  - 5 @font-face (pesos 400/500 DM Sans, 400/500/600 Inter), 0 hosts de fuente externos
  - exactamente 2 <link rel=preload as=font>: dm-sans-500.woff2, inter-400.woff2
  - body font-family = Inter; body background = rgb(241,239,232) = #F1EFE8 (crema)
  - probe de primitivas base.css: a -> rgb(15,110,86) (#0F6E56); .button bg #0F6E56 /
    color #F1EFE8 / radius 2px; .price -> rgb(216,90,48) (#D85A30); input border
    #5F5E5A / radius 2px / font-size 16px. Todas token-derivadas.
  Nota: un link de nav del header resuelve a --color-text por un stylesheet scoped
  de sección del starter (esperado; el override a nivel sección es Fase 3+, no un
  defecto del sistema de tokens). La regla primitiva a{color:var(--color-primary)}
  de base.css aplica correctamente.

### 2. Un color de marca recorre todo el token path y el linter lo acepta
expected: #0F6E56 viaja settings_schema.json -> css-variables.liquid -> var(--color-primary) en base.css sin hex literal; theme check pasa.
result: pass
source: automated
coverage_id: 02-01-D1

### 3. check-tokens.mjs es el contrato ejecutado de DESIGN-02
expected: 9 reglas, verde en el árbol actual, falla en cada caso negativo sembrado.
result: pass
source: automated
coverage_id: 02-01-D2

### 4. base.css referencia solo var(--*)
expected: assets/base.css existe, sin hex literal / nombre de familia / re-declaración de reset.
result: pass
source: automated
coverage_id: 02-01-D3

### 5. npm run lint y el gate de CI corren los tres checkers Node
expected: tokens + allowlist + secrets corren en lint local y en el step gate de CI (cierra T-01-12).
result: pass
source: automated
coverage_id: 02-01-D4

### 6. Las 10 colores de marca son settings del theme editor con el hex del Brand Book
expected: color_primary…color_community_soft en config/settings_schema.json con default verbatim; cada uno llega como custom property.
result: pass
source: automated
coverage_id: 02-02-D1
note: verificado — 10 settings color_* con defaults #0F6E56 / #9FE1CB / #D85A30 / #F1EFE8 / #2C2C2A / #5F5E5A / #24566E / #CBDDE6 / #54487A / #DDD7E8.

### 7. Dos familias de marca vía select acotado, no font library
expected: font_heading / font_body como select de opciones fijas; sin plumbing de Shopify Font Library.
result: pass
source: automated
coverage_id: 02-02-D2

### 8. Escala de espaciado, radio y ausencia de token de elevación desde el mismo archivo
expected: --space-1…8, --radius, sin --shadow, emitidos desde css-variables.liquid.
result: pass
source: automated
coverage_id: 02-02-D3

### 9. El merchant no puede romper el sistema plano desde el theme editor
expected: control input_corner_radius clamp min 0 / max 2 / step 1 — no supera el máximo de marca.
result: pass
source: automated
coverage_id: 02-02-D4
note: verificado — range min:0 max:2 step:1 default:2 en settings_schema.json.

### 10. Reglas de uso restringido escritas en el token file
expected: terracota restringido, no-blanco-puro, un-color-de-apoyo-por-pieza como comentarios normativos en css-variables.liquid.
result: pass
source: automated
coverage_id: 02-02-D5

### 11. Todo consumidor de un token del starter ahora consume el nombre Kinelia
expected: nada referencia una custom property que ya no existe.
result: pass
source: automated
coverage_id: 02-02-D6

### 12. El layout no busca un objeto de fuente que el schema ya no define
expected: sin preload de fuente vacío en ninguna página.
result: pass
source: automated
coverage_id: 02-02-D7

### 13. Propiedad del cambio de token post-launch documentada
expected: editor save vs settings_data.json PR + la desviación SC#1 de espaciado escritas, no silenciadas.
result: pass
source: automated
coverage_id: 02-02-D8

### 14. Cinco WOFF2 subset commiteados como binario, firma + tamaño verificados
expected: DM Sans 400/500 + Inter 400/500/600, latin + latin-ext, firma wOF2, tamaño plausible, contabilizados en ALLOWLIST/OVERRIDES/PERF-BUDGET.
result: pass
source: automated
coverage_id: 02-03-D1
note: verificado — 5 archivos con firma wOF2 (17.9KB / 18.2KB / 50.7KB / 52.3KB / 52.5KB) trackeados en git.

### 15. Cinco @font-face + dos preloads, sin host de fuente de terceros
expected: 5 @font-face en css-variables.liquid (asset_url, font-display: swap, unicode-range verbatim) arriba del bloque de tokens; 2 preloads en theme.liquid; ningún host de fuente externo.
result: pass
source: automated
coverage_id: 02-03-D2
note: verificado — 5 @font-face con asset_url + swap + unicode-range; 2 <link rel=preload as=font crossorigin> (dm-sans-500, inter-400); sin preconnect/host externo.

### 16. base.css expandido al set completo de primitivas DESIGN-03
expected: escala de tipo (body 1rem/1.5, h1 40px, h2 26px, caption 13px), links, .button + --on-primary, primitivas de formulario + focus-visible, .label-eyebrow, .price; todo derivado de tokens, sin elevación, accent en una sola regla.
result: pass
source: automated
coverage_id: 02-03-D3
note: verificado — h1 2.5rem, h2 1.625rem, caption .8125rem; .button/.button--on-primary; input/select/textarea + :focus-visible outline; .label-eyebrow; .price (única aparición de var(--color-accent)).

### 17. El único idioma default es español rioplatense voseo
expected: locale files renombrados por git (historia preservada), traducidos in place, JSON estricto, sin BOM, sin CR; namespaces inglés preservados + scaffold de research.
result: pass
source: automated
coverage_id: 02-04-D1
note: verificado — solo locales/es.default.json (+ schema); rename R100 en git (7f894f9); JSON válido, sin BOM (7b 0a), sin CR; voseo ("Llegá", "consultá"); 14 top-level keys incluyendo namespaces EN preservados.

### 18. CTAs / promesa raíz / leyenda legal como claves kinelia.* verbatim
expected: 6 CTAs + promesa raíz + leyenda legal como claves kinelia.*, verbatim del Brand Book (D-15); leyenda como key auto-escapada plana.
result: pass
source: automated
coverage_id: 02-04-D2

### 19. Contrato de claims prohibidos + governance de copy en docs/BRAND-COPY.md
expected: contrato prohibited-claims y reglas de governance escritas donde las fases de copy las van a encontrar; check-tokens.mjs es la copia ejecutada de la regla idioma + brand-key.
result: pass
source: automated
coverage_id: 02-04-D3
note: verificado — docs/BRAND-COPY.md con tabla de ownership, voz voseo, 6 CTAs, claims LOCKED (D-16); check-tokens.mjs valida único default es.*, presencia de REQUIRED_COPY_KEYS, prohíbe sufijo _html en la leyenda.

## Summary

total: 19
passed: 19
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

- gap_id: G-02-1
  truth: "Un storefront vivo servido por `shopify theme dev` renderiza el tema con el token path y las fuentes en el <head>"
  status: resolved
  reason: "Fallo de entorno, no de código: el development theme efímero #150932127950 (server-side) conservaba locales/en.default.* de un `theme dev` de la Fase 01. `theme dev` hace sync incremental y no borra del remoto los archivos que el git rename 7f894f9 (en.* -> es.*) sacó del árbol local -> dos *.default (en + es) -> 'Failed to Upload Theme Files'."
  severity: blocker
  test: 1
  resolved_at: 2026-09-09
  resolution: "shopify theme delete --store kinelia.myshopify.com --theme 150932127950 --force; luego `shopify theme dev` recreó el dev theme (#150941597902) desde los archivos locales (solo es.default.*) y subió limpio. Render verificado por browser MCP (ver nota del Test 1). Los archivos del repo nunca tuvieron el problema — git ls-files locales/ = solo es.default.json + es.default.schema.json (convención Skeleton correcta)."
  artifacts: []
  missing: []

## Deferred Follow-Ups

- test: 1
  idea: "Confirmar que los temas Kinelia — LIVE (#150931210446) y Kinelia — STAGING (#150931144910) NO tienen la misma colisión de doble locale default. Fueron poblados por la GitHub integration cuando main/staging tenían en.default.*; la integration normalmente procesa el delete de un rename, pero el dev theme demostró que un sync incremental puede dejar huérfanos. Chequeo rápido: Admin -> Online Store -> Themes -> (tema) -> ... -> Edit code -> carpeta locales/, o `shopify theme pull --live --only locales`. Si aparece en.default.*, borrarlo por el editor de código o un theme push que lo limpie ANTES del próximo release."
  deferred_at: 2026-09-09
