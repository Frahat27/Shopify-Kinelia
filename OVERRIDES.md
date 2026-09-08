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
| `.github/workflows/ci.yml` | 01-03 | Retargeteado a `on: pull_request` + `push` a `main`/`staging`; el job `theme-check` (display name "Theme Check") pasa a ser required status check en el plan 01-07. |
| `.gitignore` | 01-03 | Ignora `.env` / `.env.*` (antes de que exista credencial alguna), `*.local` y `.lighthouseci/`. |
| `.shopifyignore` | 01-03, 01-04 | 01-03: exclusiones root-anchored de planning/instrucciones/docs/dev-tooling del push por CLI. 01-04: agrega `/scripts/` para que el checker de allowlist nunca se suba a un tema. |
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
| `lighthouserc.json` | 01-03 | Aserciones de Lighthouse CI: LCP ≤ 2500 ms, CLS ≤ 0,1, a11y ≥ 0,95 como error; peso de script (supuesto) y TBT como warning. |
| `.github/workflows/lighthouse.yml` | 01-03 | Presupuesto de performance en cada pull request (`shopify/lighthouse-ci-action@v1`, credenciales solo vía `secrets.*`). |
| `docs/PERF-BUDGET.md` | 01-03 | El presupuesto de performance escrito, con el número de peso de JS marcado como SUPUESTO y su fase de endurecimiento. |
| `README.md` | 01-05 | _Pendiente_ — puesta en marcha, comandos, índice de contratos. |
| `docs/RELEASE.md` | 01-05 | _Pendiente_ — topología STAGING/LIVE, regla de propiedad del contenido, checklist de release, rollback. |
| `docs/SHOPIFY-SETUP.md` | 01-06 | _Pendiente_ — registro del setup externo (tienda, GitHub app, Dev Dashboard app, secrets). |

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
- Las ediciones a archivos Liquid del starter se marcan en la fuente con un comentario `KINELIA:`; las de config/YAML/JSON, con `# KINELIA:` o con una fila en `## Archivos modificados`.
- El comportamiento nuevo va en archivos nuevos, no dentro de archivos del starter, siempre que sea posible.
- Todo cambio en lo que el tema **renderiza** se registra en `ALLOWLIST.md`, y todo cambio en un archivo del **starter** se registra acá — ambos en la misma pull request que lo introduce.
- El starter no se borra: la reducción es por no referenciar (ver `ALLOWLIST.md`).
