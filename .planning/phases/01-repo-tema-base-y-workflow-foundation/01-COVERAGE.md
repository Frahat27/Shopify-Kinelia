# API Coverage — Phase 01 (Repo, tema base y workflow foundation)

No external API integration: fase de fundaciones del theme (scaffold Skeleton, git, CI Theme Check, harness Lighthouse); no se consume ninguna API/SDK externa.

## Contexto

El gate `api-coverage.verify-pre` se disparó por dos coincidencias léxicas que no
son integraciones:

- `01-UAT.md` cita un mensaje de error de timeout de Lighthouse que contiene la
  URL `https://kinelia.myshopify.com/api/2026-01/graphql.json` (endpoint interno
  del proxy de `shopify theme dev`, no una integración construida en esta fase).
- `01-07-SUMMARY.md` referencia el comando de CLI `gh api repos/.../rulesets`
  usado para verificar branch protection.

La integración real con servicios externos (Supabase, Meta Marketing API,
Mercado Pago) vive en el repo hermano `Kinelia`, no en `Shopify-Kinelia`. Este
repo es únicamente el theme Liquid del storefront; el checkout y los pagos los
maneja Shopify nativamente. Cuando una fase futura integre Judge.me, una app de
reviews u otra superficie externa, esa fase producirá su propia matriz de
cobertura.
