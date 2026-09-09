# OVERRIDES.md — Registro de divergencias respecto al starter

Este documento es el libro mayor de propiedad del fork: qué cambiamos respecto a la base y por qué. Permite responder "¿qué tocamos y para qué?" sin arqueología de diffs. Se actualiza en la misma pull request que introduce cada divergencia.

## Base

- **Repositorio upstream:** https://github.com/Shopify/skeleton-theme.git
- **Commit fijado:** `a4f32d393b9eadf6c4403318ca39116832e5d1df`
- **Tag:** `skeleton-base-a4f32d3`
- **Fecha:** 2026-09-07 (Fase 1, plan 01-01)

**Postura:** el starter Skeleton es un scaffold que **poseemos**, no un tema que trackeamos de forma continua. El remote `upstream` existe para (a) diffear contra un punto de referencia fijo y (b) cherry-pickear una mejora estructural genuinamente útil. No hay un merge periódico del upstream.

## Archivos modificados

Archivos del starter editados in place. Cada fila es una divergencia real respecto al tag
`skeleton-base-a4f32d3` (verificado con `git diff --ignore-all-space` contra ese tag — el
scaffold del plan 01-01 normalizó los finales de línea a CRLF, ruido que no se lista acá).
Las ediciones a archivos Liquid llevan un comentario `{% comment %} KINELIA: ... {% endcomment %}`;
las ediciones a config/YAML/JSON llevan un comentario `# KINELIA:` o quedan registradas acá.

| Ruta | Plan | Por qué |
|------|------|---------|
| `.theme-check.yml` | 01-03 | Header de justificación KINELIA; `extends: theme-check:recommended` sin desactivar ninguna regla — las reglas de performance nunca se debilitan. |
| `.github/workflows/ci.yml` | 01-03, 02-01 | 01-03: retargeteado a `on: pull_request` + `push` a `main`/`staging`; el job `theme-check` (display name "Theme Check") pasa a ser required status check en el plan 01-07. 02-01: el step `Theme Check (gate)` corre además los tres checkers Node (`check-tokens`, `check-allowlist`, `check-secrets`) después del linter — cierra el residual T-01-12 (los dos checkers de la Fase 1 eran laptop-only). Nombre del job y display name congelados. |
| `.gitignore` | 01-03 | Ignora `.env` / `.env.*` (antes de que exista credencial alguna), `*.local` y `.lighthouseci/`. |
| `.gitattributes` | 02-01 | `locales/*.json` y `config/*.json` pineados a `text eol=lf` (sin CRLF ni BOM: el parseo JSON estricto de `check-tokens.mjs` y el parser de schema de Shopify lo requieren); `assets/*.woff2` marcado `binary`. El scaffold 01-01 había normalizado todo a CRLF. |
| `.shopifyignore` | 01-03, 01-04 | 01-03: exclusiones root-anchored de planning/instrucciones/docs/dev-tooling del push por CLI. 01-04: agrega `/scripts/` para que el checker de allowlist nunca se suba a un tema. |
| `config/settings_schema.json` | 02-01 | Grupo `t:general.colors` extendido con un header `t:settings.colors.brand` y el setting `color` `color_primary` (default `#0F6E56`). `theme_info` sigue siendo el elemento 0. El resto del grupo lo rehace el plan 02-02. |
| `snippets/css-variables.liquid` | 02-01 | Emisor de tokens extendido: emite `--color-primary` desde `settings.color_primary` con fallback Liquid `| default:`; se agregaron guardas `| default:` a `--color-background` / `--color-foreground` (Pitfall 4). Marcador KINELIA. Este snippet y `settings_schema.json` son los únicos dos lugares donde puede vivir un color literal (D-17). Las otras nueve familias las suma 02-02. |
| `layout/theme.liquid` | 02-01 | Carga `assets/base.css` vía `stylesheet_tag` justo después de `critical.css`, sin preload (el preload es para `critical.css`; un segundo competiría con la imagen del hero). El bloque de fuentes del head (líneas 7-18) lo reescribe el plan 02-02. |
| `locales/en.default.schema.json` | 02-01 | Se quitó la coma colgante antes de la llave de cierre (Shopify la tolera; `JSON.parse` estricto no) y se agregaron las claves `settings.colors.brand` / `primary` / `primary_info` en español. El plan 02-04 renombra este archivo a `es.default.schema.json`. |
| `package.json` | 02-01 | Cadena `lint` extendida con `&& node scripts/check-tokens.mjs`; nuevo script `lint:tokens`. Sin dependencias de runtime (Node stdlib). |
| `templates/index.json` | 01-04 | Se des-referencia la section demo `hello-world` y se compone la section allowlisted `custom-section` como shell de la home. `sections/hello-world.liquid` queda en el repo sin tocar. |

## Archivos eliminados

**Ningún archivo de tema del starter se borró en la Fase 1.** La reducción se hace por NO
REFERENCIAR (ver `ALLOWLIST.md`): las superficies de carrito, búsqueda y accesibilidad, y
las sections demo, quedan en el repositorio. Borrar un módulo del que otro archivo depende
es exactamente el modo de falla que este proyecto evita.

Para lo que está presente pero no renderiza, ver `ALLOWLIST.md` §"Presente, no renderiza".

Nota de exactitud: el scaffold del plan 01-01 **no vendorizó** cuatro archivos de gobernanza
del proyecto open-source Skeleton — `.github/workflows/cla.yml`, `CODE_OF_CONDUCT.md`,
`CONTRIBUTING.md` y el `README.md` del starter. No son código de tema: rigen el proceso de
contribución del repo de Shopify, no el de un fork downstream. Solo se conservó `LICENSE.md`
(MIT) para la atribución. Frente al diff con el tag base aparecen como `D`; no son
eliminaciones de superficie de tema.

## Archivos nuevos

Archivos que agregamos sobre el starter, en la raíz del repo salvo indicación.

| Ruta | Plan | Qué aporta |
|------|------|------------|
| `LICENSE.md` | 01-01 | MIT del starter Skeleton, conservada para atribución del fork. |
| `OVERRIDES.md` | 01-02 | Este registro de divergencias. |
| `ALLOWLIST.md` | 01-04 | Contrato de superficie: qué renderiza el tema, qué queda presente sin renderizar, qué no se agrega nunca. |
| `scripts/check-allowlist.mjs` | 01-04 | Copia ejecutable del render allowlist y de las prohibiciones de `assets/`. |
| `package.json` | 01-03 | Manifiesto de dev-tooling: solo `devDependencies` (`@lhci/cli`), scripts `lint` / `lint:all` / `lint:allowlist` / `perf`. Sin `dependencies` de runtime, sin build step. |
| `lighthouse/lighthouserc.json` | 01-03, movido en 01-07 | Aserciones del harness de Lighthouse **local** (`npm run perf`): LCP ≤ 2500 ms, CLS ≤ 0,1, a11y ≥ 0,95 como error; peso de script (supuesto) y TBT como warning. Fuera de la raíz porque `shopify/lighthouse-ci-action` escribe su propio `lighthouserc.yml` y `lhci autorun` tomaría este primero, rompiendo el harness de CI. |
| `.github/workflows/lighthouse.yml` | 01-03 | Presupuesto de performance en cada pull request (`shopify/lighthouse-ci-action@v1`, credenciales solo vía `secrets.*`). |
| `docs/PERF-BUDGET.md` | 01-03 | El presupuesto de performance escrito, con el número de peso de JS marcado como SUPUESTO y su fase de endurecimiento. |
| `README.md` | 01-05 | Puesta en marcha (clon → preview local), tabla de comandos (`lint` / `lint:all` / `lint:allowlist` / `perf` + CLI cruda), resumen de topología con puntero a `docs/RELEASE.md`, índice de contratos del repo y árbol de estructura con el constraint de carpetas de tema en la raíz. |
| `docs/RELEASE.md` | 01-05 | Topología STAGING/LIVE (`main` → `Kinelia — LIVE` publicado, `staging` → `Kinelia — STAGING`), conexión rama ↔ tema como paso irreversible, regla de propiedad del contenido (dueña: la integración de GitHub), checklist de release de 7 pasos, rollback por revert del merge, prohibiciones permanentes y la nota de `SHOPIFY_CLI_THEME_TOKEN`. |
| `docs/SHOPIFY-SETUP.md` | 01-06 | Registro del setup externo: dominio de la dev store (`kinelia.myshopify.com`), URL del repo privado y sus ramas de topología, tabla de aplicaciones (Shopify GitHub app — pendiente 01-07; app de Dev Dashboard "Kinelia Lighthouse CI"), tabla de nombres de secrets de Actions (`SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET` / `SHOP_PASSWORD`) y la lista de pendientes de 01-07. Solo nombres y ubicaciones, ningún valor. |
| `assets/base.css` | 02-01 | Hoja de primitivas de diseño derivadas de tokens. Se crea acá con la regla tracer (`a { color: var(--color-primary) }`) y la completa el plan 02-03. Solo `var(--*)`: sin hex ni nombres de familia tipográfica; no re-declara el reset que posee `critical.css`. Fila en `ALLOWLIST.md`. |
| `scripts/check-tokens.mjs` | 02-01 | Copia ejecutable de DESIGN-02: 9 reglas (deriva de color literal / de familia de marca, integridad de referencia al schema + guarda de inyección, guarda de fallback `| default:`, custom property indefinido, declaraciones prohibidas D-07/D-11, host de fuentes de terceros, sanidad estructural del locale, backstop de scan vacío). Node stdlib, mismo estilo que `check-allowlist.mjs`. Exporta `ALLOWED_FILES` y `EXEMPT_FILES`. En `npm run lint` y en el job CI requerido. |

## Componentes portados

Estructura portada desde componentes open-source (Horizon u otros). **Vacía en la Fase 1**;
las Fases 3, 6 y 11 portan estructura de los componentes de Horizon (cart drawer, predictive
search, bus de eventos + helpers de accesibilidad) y deben registrar acá procedencia,
commit y licencia verificada en el momento del porting.

| Componente | Repo origen | Archivo origen | Commit | Licencia |
|------------|-------------|----------------|--------|----------|
| _(ninguno en Fase 1)_ | — | — | — | — |

## Reglas

- Cada archivo nuevo se justifica contra el CVR y el presupuesto de performance.
- Un valor de color literal solo puede vivir en `config/settings_schema.json` y en `snippets/css-variables.liquid` (D-02, D-17). `scripts/check-tokens.mjs` es la copia ejecutada de esa regla; `OVERRIDES.md` y `ALLOWLIST.md` son su explicación humana.
- Las ediciones a archivos Liquid del starter se marcan en la fuente con un comentario `KINELIA:`; las de config/YAML/JSON, con `# KINELIA:` o con una fila en `## Archivos modificados`.
- El comportamiento nuevo va en archivos nuevos, no dentro de archivos del starter, siempre que sea posible.
- Todo cambio en lo que el tema **renderiza** se registra en `ALLOWLIST.md`, y todo cambio en un archivo del **starter** se registra acá — ambos en la misma pull request que lo introduce.
- El starter no se borra: la reducción es por no referenciar (ver `ALLOWLIST.md`).
