# Setup externo — Kinelia Storefront

Este documento es el registro del mundo externo del que depende la Fase 1: la tienda de
desarrollo, el repositorio de GitHub, las aplicaciones instaladas y los nombres de los
secrets de GitHub Actions. Sirve para que la próxima persona no tenga que reconstruir el
setup leyendo los archivos de workflow.

**Este documento registra únicamente nombres y ubicaciones. Un valor de credencial nunca
debe escribirse acá ni en ningún otro archivo del repositorio, ni en un mensaje de commit,
ni en un comando que quede en un log.**

## Tienda

| Dato | Valor |
|------|-------|
| Dominio | `kinelia.myshopify.com` |
| Tipo | Development store de Shopify Partners |
| Creada | 2026-09-08 |
| Datos de prueba | "Generar datos de prueba" activado — la tienda arranca con productos de muestra precargados |
| Storefront | Protegido por contraseña (Online Store → Preferences → Password protection). La contraseña vive en el secret de Actions `SHOP_PASSWORD`, nunca acá. |

El conteo de temas con el que arrancó la tienda: **3** — `test-data` (publicado, el default de
la tienda de datos de prueba), más `Horizon` y `debut-vintage-theme` como borradores. Los temas
`Kinelia — LIVE` y `Kinelia — STAGING` (plan 01-07) se suman encima de esos tres.

## Repositorio

| Dato | Valor |
|------|-------|
| URL | https://github.com/Frahat27/Shopify-Kinelia |
| Visibilidad | **Público** — ver la nota de abajo |
| Rama `main` | Fuente del tema **LIVE** (`Kinelia — LIVE`, publicado) |
| Rama `staging` | Fuente del tema **STAGING** (`Kinelia — STAGING`, no publicado) |
| Protección de ramas | Ruleset `protect-main` y `protect-staging` (activos): pull request obligatoria + check requerido `Theme Check` + sin fast-forward |

**El repositorio se hizo público en el plan 01-07 (decisión del desarrollador, confirmada dos
veces con la exposición completa a la vista).** Contradice la prohibición del plan (`must_haves`
backstop "el repositorio se crea privado", amenaza T-01-20). Motivo: branch protection y rulesets
de GitHub requieren un plan pago en repos privados; el desarrollador declinó GitHub Pro (US$4/mes)
y declinó sacar `.planning/` del repo primero. Quedan visibles `.planning/` (el plan de negocio
completo), `docs/*`, `OVERRIDES.md`, `ALLOWLIST.md`. Los **valores** de los secrets siguen
cifrados (verificado: no están en el historial de git). Se revisa en el lanzamiento (Fase 14):
volver a privado + Pro, o aceptar público. Registrado en `.planning/WINDOWS.md`.

## Aplicaciones

| Aplicación | Para qué | Dónde se administra |
|------------|----------|---------------------|
| Shopify GitHub app | Sincronización rama ↔ tema: commitea las ediciones del editor de temas de vuelta a la rama conectada. **Instalada** (se autorizó al conectar el primer tema desde GitHub en 01-07). | Admin de la tienda (Online Store → Themes) y GitHub → Settings → GitHub Apps. |
| "Kinelia Lighthouse CI" (app de Dev Dashboard) | Autenticación de la acción de Lighthouse (`shopify/lighthouse-ci-action`). Scopes: `read_products` + `write_themes`. Instalada en `kinelia.myshopify.com`. **Nota: la acción de Lighthouse no puede crear el tema de desarrollo que necesita con esta app — ver § Verificación de gates.** | Shopify Dev Dashboard (dev.shopify.com) → la app. |

La app de Dev Dashboard existe (en lugar de una custom app tradicional) porque Shopify dejó
de permitir la creación de nuevas custom apps el 2026-01-01, así que la ruta del
access-token heredado no está disponible para una tienda nueva.

## Secretos de Actions

**Este documento registra nombres y ubicaciones únicamente. Un valor nunca debe escribirse
acá ni en ningún lugar del repositorio.** Verificación por nombre:
`gh secret list --repo Frahat27/Shopify-Kinelia`.

| Nombre | Qué contiene | De dónde sale |
|--------|--------------|---------------|
| `SHOP_STORE` | El dominio `.myshopify.com` de la tienda de desarrollo | Partners dashboard → la tienda → su dominio `myshopify.com` |
| `SHOP_CLIENT_ID` | Client ID de la app de Dev Dashboard "Kinelia Lighthouse CI" | Shopify Dev Dashboard → la app → credenciales de cliente |
| `SHOP_CLIENT_SECRET` | Client secret de la app de Dev Dashboard "Kinelia Lighthouse CI" | Shopify Dev Dashboard → la app → credenciales de cliente |
| `SHOP_PASSWORD` | La contraseña de protección del storefront de la tienda | Admin de la tienda → Online Store → Preferences → Password protection |

Cada nombre coincide carácter por carácter con una referencia `secrets.*` en
`.github/workflows/lighthouse.yml` (`SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET` /
`SHOP_PASSWORD`).

**`SHOP_CLIENT_SECRET` debe rotarse después del lanzamiento** — transitó por un chat al
momento de provisionarlo.

## Temas

Una sola tienda (`kinelia.myshopify.com`), dos temas conectados por la integración de GitHub.
Cada conexión rama ↔ tema es **permanente**: no se puede reconectar una rama después de
desconectarla.

| Tema | Rama conectada | Estado | Preview |
|------|----------------|--------|---------|
| `Kinelia — LIVE` | `main` | **Publicado** (`role: live`) — el único tema publicado | dominio de la tienda |
| `Kinelia — STAGING` | `staging` | No publicado (`role: unpublished`) | `?preview_theme_id=<STAGING id>` sobre el dominio de la tienda |

> Los IDs de tema y el link de preview con `preview_theme_id` NO se listan acá — este
> repo es público (T-01-20 / T-01-26). Sacá los IDs con
> `shopify theme list --store kinelia.myshopify.com`; el link de preview lo da la
> integración de GitHub o el admin de la tienda. (T-01-26)

`test-data`, `Horizon` y `debut-vintage-theme` quedaron como borradores sin conectar.

## Verificación de gates

Evidencia de que los gates de calidad *gatean*, no solo existen como archivos (plan 01-07 Task 4).

### FOUND-01 — preview local

`shopify theme dev --store kinelia.myshopify.com` (el comando de `README.md`) arranca contra la
dev store y sirve el código de este repo. Rutas verificadas con `fetch` de Node contra
`http://127.0.0.1:9292`: `/` (200, sirve `custom-section` local, sin el hero del tema viejo),
`/products/the-complete-snowboard` (200), `/cart` (200), `/search` (200). Check visual del
desarrollador: las cuatro rutas renderizan contenido y la consola no muestra errores rojos. El
producto `the-complete-snowboard` es de los datos de prueba sembrados; la Fase 4 trae el producto
héroe real.

### FOUND-06 — gate de lint (`Theme Check`): DEMOSTRADO

Pull request descartable **#1** (`gate-proof-throwaway` → `staging`, cerrada sin merge, rama
borrada):

| Commit | Contenido | `Theme Check` (job, check requerido) | `Theme Check Report` (anotaciones) | Estado del merge |
|--------|-----------|--------------------------------------|-----------------------------------|------------------|
| `78327a8` | 1 ofensa Liquid error-level deliberada | **failure** — https://github.com/Frahat27/Shopify-Kinelia/actions/runs/34270870728/job/102211833131 | failure — https://github.com/Frahat27/Shopify-Kinelia/runs/102211958811 | **BLOCKED** |
| `b319c78` | ofensa removida | **success** — https://github.com/Frahat27/Shopify-Kinelia/actions/runs/34271061568/job/102212469339 | success | UNSTABLE (solo `Lighthouse`, que no es requerido, en rojo) |

El job `Theme Check` corre en dos pasos: `shopify/theme-check-action@v2.2.0` (`continue-on-error`,
solo para anotar el diff) y después un `shopify theme check --fail-level error` explícito cuyo
exit code es el que falla el job. Esto se agregó en 01-07 porque el action **no** falla su propio
step por una ofensa — solo lo refleja en el check separado `Theme Check Report`.

### FOUND-07 — gate de performance (`Lighthouse`): CORRE, NO BLOQUEA — hallazgo abierto

En la PR #1, `Lighthouse` **falló** en ambos commits, por una razón ajena a la ofensa:
`https://github.com/Frahat27/Shopify-Kinelia/actions/runs/34270870826/job/102211833720`

```
Access denied for themeCreate field. Required access: the user needs write_themes
AND an exemption from Shopify.
```

`shopify/lighthouse-ci-action@v1` hace `shopify theme push --development`, que llama a la mutación
GraphQL `themeCreate`. Una app de Dev Dashboard self-serve tiene el scope `write_themes` pero
**no** la exención de Shopify que `themeCreate` exige. Las custom apps heredadas (pre-2026-01-01)
la tenían; Shopify dejó de crearlas. Autenticar sí funciona (la acción lista productos y
colecciones); lo que no puede es crear el tema de preview que necesita para auditar.

Consecuencia: **`Lighthouse` NO es un check requerido en los rulesets** — si lo fuera, toda PR
futura quedaría bloqueada para siempre por un check imposible de pasar hoy. El workflow queda en
el repo y corre en cada PR (en rojo) hasta que se resuelva. El harness **local** (`npm run perf`)
no está afectado: usa el OAuth interactivo del desarrollador.

Opciones para la Fase 13 (pasada de performance): pedir la exención de `themeCreate` para la app;
un runner self-hosted con sesión de `shopify login`; reemplazar la acción por un workflow que use
el preview URL de un tema ya conectado + `lhci autorun --config`; o medir con otra herramienta
(PageSpeed Insights API, WebPageTest, el dashboard de Web Performance de Shopify).

## Pendiente

- **Fase 13** — resolver el gate de Lighthouse en CI (ver arriba) y decidir si CI debe asentar
  los umbrales duros de LCP/CLS/peso-de-JS (hoy solo local — ver `docs/PERF-BUDGET.md`).
- **Fase 14 / lanzamiento** — rotar `SHOP_CLIENT_SECRET`; revisar la visibilidad del repo
  (privado + Pro, o aceptar público); recorrer la checklist de `docs/RELEASE.md` de punta a punta
  contra un cambio real.
- **Menor** — borrar el tema de desarrollo `Development (0f9eff-...)` que quedó de `shopify theme
  dev` (se expira solo en ~7 días).
