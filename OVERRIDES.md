# OVERRIDES.md — Registro de divergencias respecto al starter

Este documento es el libro mayor de propiedad del fork: qué cambiamos respecto a la base y por qué. Permite responder "¿qué tocamos y para qué?" sin arqueología de diffs. Se actualiza en la misma pull request que introduce cada divergencia.

## Base

- **Repositorio upstream:** https://github.com/Shopify/skeleton-theme.git
- **Commit fijado:** `a4f32d393b9eadf6c4403318ca39116832e5d1df`
- **Tag:** `skeleton-base-a4f32d3`
- **Fecha:** 2026-09-07 (Fase 1, plan 01-01)

**Postura:** el starter Skeleton es un scaffold que **poseemos**, no un tema que trackeamos de forma continua. El remote `upstream` existe para (a) diffear contra un punto de referencia fijo y (b) cherry-pickear una mejora estructural genuinamente útil. No hay un merge periódico del upstream.

## Archivos modificados

Archivos del starter editados in place. Cada edición lleva un comentario Liquid `KINELIA:` en la fuente.

| Ruta | Por qué |
|------|---------|
| `.theme-check.yml` | _Pendiente (plan 01-03)_ — ajustar reglas para un tema custom; nunca desactivar reglas de performance. |

## Archivos eliminados

Ningún archivo del starter se borra. La reducción es "por no referenciar" (ver `ALLOWLIST.md`). Esta tabla queda vacía por diseño en la Fase 1.

| Ruta | Por qué |
|------|---------|
| _(ninguno)_ | La reducción se hace sin borrar — plan 01-04. |

## Archivos nuevos

Archivos que agregamos sobre el starter.

| Ruta | Qué aporta |
|------|------------|
| `OVERRIDES.md` | Este registro. |
| `LICENSE.md` | MIT del starter Skeleton, conservada para atribución del fork. |
| `.github/workflows/ci.yml` | _Pendiente (plan 01-03)_ — Theme Check en cada pull request (`shopify/theme-check-action@v2`). El Skeleton actual NO trae este workflow, así que se crea desde cero. |
| `.github/workflows/lighthouse.yml` | _Pendiente (plan 01-03)_ — presupuesto de performance en cada PR (`shopify/lighthouse-ci-action@v1`). |
| `lighthouserc.json` | _Pendiente (plan 01-03)_ — aserciones: LCP ≤ 2500 ms, CLS ≤ 0,1, a11y ≥ 0,95, peso de script (supuesto). |
| `package.json` | _Pendiente (plan 01-03)_ — solo devDependencies (`@lhci/cli`) + scripts `lint` / `perf`. Sin dependencies de runtime. |
| `ALLOWLIST.md` | _Pendiente (plan 01-04)_ — contrato de superficie: qué renderiza el tema y qué queda presente sin renderizar. |
| `scripts/check-allowlist.mjs` | _Pendiente (plan 01-04)_ — chequeo ejecutable del contrato de allowlist. |
| `README.md` | _Pendiente (plan 01-05)_ — puesta en marcha, comandos, índice de contratos. |
| `docs/RELEASE.md` | _Pendiente (plan 01-05)_ — topología STAGING/LIVE, regla de propiedad del contenido, checklist de release, rollback. |
| `docs/PERF-BUDGET.md` | _Pendiente (plan 01-03)_ — el presupuesto de performance escrito, con el número de peso de JS marcado como supuesto. |
| `docs/SHOPIFY-SETUP.md` | _Pendiente (plan 01-06)_ — registro del setup externo (tienda, GitHub app, Dev Dashboard app, secrets). |

## Componentes portados

Estructura portada desde componentes open-source (Horizon u otros). Vacía en la Fase 1; las Fases 6 y 11 portan estructura de los componentes de Horizon y deben registrar acá procedencia y licencia.

| Componente | Repo origen | Archivo origen | Commit | Licencia |
|------------|-------------|----------------|--------|----------|
| _(ninguno en Fase 1)_ | — | — | — | — |

## Reglas

- Cada archivo nuevo se justifica contra el CVR y el presupuesto de performance.
- Las ediciones a archivos del starter se marcan en la fuente con un comentario Liquid `KINELIA:`.
- El comportamiento nuevo va en archivos nuevos, no dentro de archivos del starter, siempre que sea posible.
- Toda divergencia se registra en este documento en la misma pull request que la introduce.
- El starter no se borra: la reducción es por no referenciar (ver `ALLOWLIST.md`).
