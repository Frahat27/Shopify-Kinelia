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
| `config/settings_schema.json` | 02-01, 02-02 | 02-01: grupo `t:general.colors` extendido con el header `t:settings.colors.brand` y `color_primary`. 02-02: se completó la superficie de marca — las diez familias de color (seis primarias + cuatro de apoyo) como settings `color` con el hex verbatim del Brand Book de default; se reemplazó `background_color` (`#FFFFFF`, viola D-03) y `foreground_color` por `color_bg` / `color_text`; el `font_picker` `type_primary_font` pasó a dos `select` (`font_heading` / `font_body`, D-18); `input_corner_radius` `max`/`default` bajados a 2 para que el editor no pueda romper el sistema plano (D-10). `theme_info` sigue siendo el elemento 0. |
| `snippets/css-variables.liquid` | 02-01, 02-02 | 02-01: emite `--color-primary` con fallback Liquid `| default:`. 02-02: emisor único de todo el vocabulario Kinelia — diez tokens de color + `--color-border` derivado, `--font-heading` / `--font-body` con stack de fallback de sistema + tres pesos, la escala `--space-1..8` (estática), `--radius` / `--radius-none`, `--icon-stroke-width`, y `--page-width` / `--page-margin` (ahora con guarda `| default:`). Se quitaron los cuatro `font_face` y las props family/style/weight que leían el `font_picker` ya eliminado. Reglas de marca D-01/D-03/D-04/D-11 como comentarios. Este snippet y `settings_schema.json` son los únicos dos lugares donde puede vivir un color literal (D-17), siempre como fallback. |
| `layout/theme.liquid` | 02-01, 02-02 | 02-01: carga `assets/base.css` vía `stylesheet_tag` después de `critical.css`, sin preload. 02-02: se eliminó el bloque de fuentes del head del starter (preconnect al CDN de fuentes + preload derivado del `font_picker`) — al desaparecer el setting del schema ese bloque emitía un preload vacío en cada página (Pitfall 1). Las caras self-hosted y sus preloads llegan en el plan 02-03; esta remoción es un pre-empt acotado del trabajo de shell de la Fase 3. |
| `locales/en.default.schema.json` | 02-01, 02-02 | 02-01: se quitó la coma colgante y se agregaron `settings.colors.brand` / `primary` / `primary_info`. 02-02: etiquetas de editor en español para cada clave `t:` nueva del schema — las diez familias de color, `settings.type.heading` / `body`, y los `info` de advertencia (uso restringido del terracota, nunca blanco puro). El plan 02-04 renombra este archivo a `es.default.schema.json`. |
| `assets/critical.css` | 02-02 | Rename de tokens del starter al esquema de marca: `--color-background` → `--color-bg`, `--color-foreground` → `--color-text`, `--font-primary--family` → `--font-body`, `--style-border-radius-inputs` → `--radius`, en las líneas 34/38/43/44/76/77/78. Las props de grilla de sección (`--content-width` / `--content-margin` / `--content-grid`) y de geometría de página NO se renombran. Comentario KINELIA registrando que la separación es por color y espacio, nunca por elevación (D-11). |
| `sections/header.liquid` | 02-02 | Rename en el bloque `{% stylesheet %}`: `var(--color-foreground)` → `var(--color-text)`. Marcador KINELIA. Sin cambio estructural. |
| `sections/footer.liquid` | 02-02 | Rename en el bloque `{% stylesheet %}`: `var(--color-foreground)` → `var(--color-text)`. Marcador KINELIA. Sin cambio estructural. |
| `package.json` | 02-01 | Cadena `lint` extendida con `&& node scripts/check-tokens.mjs`; nuevo script `lint:tokens`. Sin dependencias de runtime (Node stdlib). |
| `templates/index.json` | 01-04 | Se des-referencia la section demo `hello-world` y se compone la section allowlisted `custom-section` como shell de la home. `sections/hello-world.liquid` queda en el repo sin tocar. |

## Divergencias de la Fase 2 (plan 02-02)

Cuatro decisiones donde la Fase 2 se apartó del starter o de la letra del ROADMAP. Cada una con su razón.

1. **El rename de tokens, sin capa de alias.** El vocabulario `background` / `foreground` / `font-primary` / `input-radius` del starter se reemplazó por el esquema Kinelia (`--color-bg`, `--color-text`, `--font-body`, `--radius`) en **todos** los archivos que lo consumen — `assets/critical.css`, `sections/header.liquid` y `sections/footer.liquid` — en el mismo plan, no vía alias. Una capa de alias dejaría dos nombres vivos para un mismo concepto para siempre; la Fase 2 es la fase de tokens y el radio de impacto está enumerado (tres archivos consumidores). La regla 5 de `scripts/check-tokens.mjs` (custom property indefinido) hace imposible commitear un rename incompleto.

2. **Espaciado y radio como propiedades estáticas, no como settings del editor.** El ROADMAP Fase 2, Criterio de éxito 1 dice literalmente: *"Tokens de marca (color, tipografía, **espaciado**) en `settings_schema.json`, emitidos como custom properties CSS vía `css-variables.liquid`."* Decisión: solo color y tipografía son tuneables desde el editor; la escala `--space-1..8` se emite como ocho propiedades estáticas en `snippets/css-variables.liquid`. Razón: los merchants reajustan colores y fuentes de marca; ninguno reajusta una escala de espaciado, y ocho range inputs es mala UX de editor. DESIGN-02 ("un rebrand es un cambio de tokens, no de componentes") se cumple igual porque la escala vive en el mismo archivo único de tokens. El radio de esquina (`input_corner_radius`) sí sigue siendo un range input — el starter ya lo expone — pero su `max` y `default` bajaron a 2px, el techo de marca, para que el sistema plano no se pueda romper desde el editor (D-10, Pitfall 8).

3. **Familias tipográficas como `select` fijos, no como `font_picker`.** Como los archivos de fuente se self-hostean (plan 02-03), el objeto de Shopify Font Library y sus filtros (`font_face`, `font_url`, `font_modify`, `.system?`) no aplican. `type_primary_font` (`font_picker`) se reemplazó por dos `select` (`font_heading` / `font_body`) con una opción de familia de marca cada uno hoy, y lugar para más sin cambio de código (D-18).

4. **La edición del head de `layout/theme.liquid` como pre-empt acotado de la Fase 3.** Quitar el bloque de fuentes del starter en la Fase 2 no era opcional: dejarlo habría emitido un `<link rel="preload" href="">` vacío en cada página en el momento en que el setting del schema (`type_primary_font`) desapareció (Pitfall 1). El shell de header/footer de la Fase 3 no toca este bloque; por eso se registra acá como un pre-empt acotado y no como scope creep.

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
- Después del primer guardado en el editor de temas, los settings almacenados en `config/settings_data.json` ganan sobre cualquier cambio posterior a un `default` del schema (Pitfall 3). Por eso un cambio de token post-lanzamiento es **o** una edición hecha en el editor de temas — que la integración de GitHub commitea de vuelta — **o** una edición revisada de `settings_data.json` en una pull request. Nunca las dos a la vez. El `default` del schema y el fallback Liquid `| default:` se mantienen correctos igual, para que una instalación fresca del tema se vea bien.
