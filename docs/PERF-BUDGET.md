# Presupuesto de performance — Kinelia Storefront

Este documento fija los números que el harness de Lighthouse CI comprueba en cada
pull request (`lighthouserc.json` + `.github/workflows/lighthouse.yml`), de dónde
sale cada número y cuándo cambia. La regla del proyecto es una sola: cada decisión
estructural del tema se justifica contra el CVR de la página de producto, y el CVR
en tráfico de impulso mobile depende de que la página cargue rápido y no salte.

## Resumen de asserts

| Métrica (audit key)              | Umbral            | Severidad | Origen                                    | ¿Se mueve?                              |
|----------------------------------|-------------------|-----------|-------------------------------------------|-----------------------------------------|
| `largest-contentful-paint`       | ≤ 2500 ms         | error     | Constraint de `CLAUDE.md` + Core Web Vitals | No. Número fijo.                        |
| `cumulative-layout-shift`        | ≤ 0.1             | error     | Constraint de `CLAUDE.md` + Core Web Vitals | No. Número fijo.                        |
| `categories:accessibility`       | ≥ 0.95            | error     | Guardarraíl de regresión de FOUND-03      | No baja. Puede subir.                   |
| `categories:performance`         | ≥ 0.6 (arranque)  | gate del action (`lhci_min_score_performance`) | Piso inicial realista para Skeleton casi vacío | Sí — sube por fase, objetivo ≥ 0.9 mobile en Fase 13. |
| `total-blocking-time`            | ≤ 200 ms          | warn      | Proxy de "presupuesto de JS ajustado"     | Se endurece junto con el peso de script en Fase 13. |
| `resource-summary:script:size`   | ≤ 150000 bytes    | warn      | **SUPUESTO / ASSUMPTION** (ver abajo)     | Se confirma con el desarrollador; pasa a número duro en Fase 13. |

## Detalle por número

### LCP ≤ 2500 ms y CLS ≤ 0.1 — no se mueven

Son constraints del proyecto declarados en `.claude/CLAUDE.md` ("LCP < 2,5 s en
mobile", "buy box sin fricción") y coinciden con los umbrales "good" de Core Web
Vitals de Google. El tráfico es mobile de impulso desde anuncios de Meta; cada
100 ms de latencia y cada salto de layout cuestan conversión. Se asertan como
`error`: una regresión que cruce cualquiera de estos dos umbrales debe romper el
build en la métrica exacta que regresionó, no diluida dentro de un score
compuesto.

### Accessibility ≥ 0.95 — guardarraíl de regresión

El default del `shopify/lighthouse-ci-action` es 0.9. Lo subimos a 0.95 porque el
entregable reformulado de FOUND-03 usa el score de accesibilidad como guardarraíl
de regresión a medida que se agregan secciones y bloques al tema en fases
posteriores. Se asienta como `error` y solo puede subir, nunca bajar.

### Performance score 0.6 — piso con ratchet

Arranca en 0.6 porque en Fase 1 el tema es Skeleton casi vacío corriendo contra
un producto demo: un score alto acá no probaría nada y un umbral alto bloquearía
por ruido. El plan es subirlo (ratchet) a medida que las fases aterrizan
contenido real, apuntando a **≥ 0.9 en mobile para la Fase 13**. Cada fase que
agregue peso a la página debe revisar este piso hacia arriba, no dejarlo quieto.

### Script weight 150000 bytes — ESTO ES UN SUPUESTO (ASSUMPTION)

**Shopify no publica ningún target oficial de peso de JavaScript.** El número
150000 bytes (≈150 KB) es una propuesta de arranque derivada del constraint del
proyecto "presupuesto de JS ajustado" en `.claude/CLAUDE.md`, no una cifra
publicada por Shopify ni por Google. Registrado en el Assumptions Log de
`01-RESEARCH.md` como A1.

Por eso:

- Se asienta como **`warn`, no `error`** — no queremos bloquear merges sobre un
  número que todavía no está validado.
- **Debe confirmarse con el desarrollador** antes de endurecerlo. Si en la
  práctica el tema real necesita más, se sube con justificación; si se puede
  vivir con menos, se baja.
- **Fase 13 es el punto donde este número pasa a ser una cifra dura** (`error`),
  ya con el template de avatar real y su JS medido.

`total-blocking-time` (≤ 200 ms, `warn`) acompaña a este número como segunda
señal de que el presupuesto de JS se está desbordando; se endurece junto con él
en Fase 13.

## Objetivo de referencia del harness — leer antes de confiar en un check verde

Hasta que la Fase 4 cree el producto héroe, el harness de Lighthouse **NO corre
contra la home** (la página casi vacía de Skeleton reporta un score sin sentido).
Corre contra una **página de producto demo sembrada** (el template `product` por
defecto sobre un producto de prueba).

El **template multi-avatar real se conecta recién en la Fase 10/13**, cuando
existe. En Fase 1 el harness se entrega *cableado y en verde sobre un producto
demo* — nada más.

Consecuencia práctica: **un harness verde en Fase 1 no es prueba de que una
página real sea rápida.** Es prueba de que el gate está bien cableado. La
medición sobre contenido real empieza cuando el producto héroe (Fase 4) y el
template de avatar (Fase 10/13) están en su lugar.

## Credenciales

El workflow se autentica con una app de Dev Dashboard (`store` + `client_id` +
`client_secret`) porque Shopify dejó de permitir crear nuevas custom apps el
2026-01-01. Los tres valores viven como GitHub Actions secrets
(`SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET`) y se aprovisionan en el
plan 01-06. Nunca se escribe un literal de credencial en un archivo del repo ni
se imprime un secreto al log de Actions.
