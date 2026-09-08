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

El conteo de temas con el que arrancó la tienda: **por confirmar en 01-07** (`shopify theme list`
requiere un login interactivo de navegador que esta sesión no pudo completar).

## Repositorio

| Dato | Valor |
|------|-------|
| URL | https://github.com/Frahat27/Shopify-Kinelia |
| Visibilidad | Privado |
| Rama `main` | Fuente del tema **LIVE** (`Kinelia — LIVE`, publicado) |
| Rama `staging` | Fuente del tema **STAGING** (`Kinelia — STAGING`, no publicado) |

Las dos ramas ya existen en `origin`. Los temas y la conexión rama ↔ tema se crean en el
plan 01-07, siguiendo `docs/RELEASE.md`.

## Aplicaciones

| Aplicación | Para qué | Dónde se administra |
|------------|----------|---------------------|
| Shopify GitHub app | Sincronización rama ↔ tema: commitea las ediciones del editor de temas de vuelta a la rama conectada. **Estado: pendiente de instalar (01-07).** | Admin de la tienda (Online Store → Themes → Add theme → Connect from GitHub) y en las aplicaciones instaladas del repositorio (GitHub → Settings → GitHub Apps). |
| "Kinelia Lighthouse CI" (app de Dev Dashboard) | Autenticación de la acción de Lighthouse en cada pull request (`shopify/lighthouse-ci-action`). Scopes: `read_products` + `write_themes`. Instalada en `kinelia.myshopify.com`. | Shopify Dev Dashboard (dev.shopify.com) → la app. |

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
`.github/workflows/lighthouse.yml` (`SHOP_STORE` / `SHOP_CLIENT_ID` / `SHOP_CLIENT_SECRET`).

**`SHOP_CLIENT_SECRET` debe rotarse después del lanzamiento** — transitó por un chat al
momento de provisionarlo.

## Pendiente

Lo que el plan 01-07 todavía tiene que hacer:

- Instalar la Shopify GitHub app en el repositorio, con acceso de escritura.
- Crear los dos temas con los nombres exactos: `Kinelia — LIVE` (publicado, desde `main`) y
  `Kinelia — STAGING` (no publicado, desde `staging`).
- Conectar las ramas a los temas — `staging` primero (paso irreversible), después `main`.
- Configurar branch protection en `main` con el check requerido llamado `Theme Check`.
- Correr `shopify theme list` y registrar el conteo de temas con el que arrancó la tienda.
- Recorrer la checklist de `docs/RELEASE.md` de punta a punta una vez contra el preview link
  real de STAGING.
- Confirmar que Lighthouse postea un comentario con el score en una pull request, y si la
  acción de Lighthouse necesita (o no) `SHOP_PASSWORD` para una tienda protegida por
  contraseña.
