# Kinelia Storefront

Este repositorio es el tema custom de Shopify para **Kinelia**, la marca DTC que vende medias
de compresión en Argentina bajo el posicionamiento "piernas livianas". El tema está optimizado
por encima de todo para la **tasa de conversión de la página de producto** contra tráfico
mobile pago de Meta: cada decisión estructural se justifica contra ese número. Está construido
sobre la base **Skeleton** de Shopify (theme blocks, sin framework front-end, sin paso de
compilación); el razonamiento de esa elección y sus tradeoffs están en la tabla de Key
Decisions de `.planning/PROJECT.md`.

## Requisitos

- **Node.js 22.12 o superior** — requisito de la CLI de Shopify 4.
- **git 2.28 o superior** — requisito de la CLI de Shopify 4 y de la integración de GitHub.
- **Shopify CLI versión 4**, instalada globalmente desde npm:
  `npm install -g @shopify/cli@latest`.

El tema **no tiene paso de compilación y no se le puede agregar uno**. `package.json` existe
solo para dev-tooling (el harness de performance local); no hay bundler, no hay transpilación,
y el round-trip GitHub ↔ editor de Shopify depende de que siga siendo así.

## Puesta en marcha

Desde un clon fresco del repositorio hasta un preview local corriendo:

1. **Instalar la CLI de Shopify** (si no está): `npm install -g @shopify/cli@latest`.
2. **Instalar las dependencias de desarrollo**: `npm install`.
3. **Levantar el servidor de desarrollo** contra la dev store:

   ```bash
   shopify theme dev --store <tu-dev-store>.myshopify.com
   ```

   La **primera corrida abre el navegador para un login interactivo** (cuenta de Partner /
   tienda) que **no se puede scriptear**. Después de eso, el servidor hace hot-reload de CSS y
   de las ediciones de sección.

4. Cuando estés iterando sobre `templates/*.json`, agregá el flag **`--theme-editor-sync`**
   para mantener alineadas la copia local y el editor de temas. **Advertencia:** ese flag
   sincroniza en dos direcciones los `templates/*.json` y los `config/*.json`, así que **no lo
   dejes puesto mientras editás esos archivos localmente** — te va a pisar los cambios con lo
   que haya en el tema.

## Comandos

Scripts de `package.json`:

| Script | Qué hace | Cuándo correrlo |
|--------|----------|-----------------|
| `npm run lint` | Theme Check a `--fail-level error` **más** `scripts/check-allowlist.mjs` (el checker de la allowlist de render). | Antes de cada commit y antes de abrir una PR. Es el gate local. |
| `npm run lint:all` | Theme Check en todos los niveles de severidad (incluye `info`/`warning`), sin el checker de allowlist. | Cuando querés ver todo lo que Theme Check tiene para decir, no solo los errores. |
| `npm run lint:allowlist` | Solo `scripts/check-allowlist.mjs`. | Cuando tocaste `templates/*.json` o `sections/*` y querés chequear la allowlist sin correr Theme Check entero. |
| `npm run perf` | `lhci autorun` con `lighthouse/lighthouserc.json` (harness de Lighthouse local, preset mobile, asserts finos de LCP/CLS/peso-de-JS). | Antes de un release, o cuando agregaste peso a una página. Ver `docs/PERF-BUDGET.md`. |

Comandos crudos de la CLI de Shopify que vas a necesitar:

| Comando | Para qué |
|---------|----------|
| `shopify theme dev --store <store>.myshopify.com` | Preview local con hot-reload contra la dev store. |
| `shopify theme check` | Correr el linter de Liquid/JSON directo (misma máquina que usa `npm run lint:all`). |
| `shopify theme check --init` | Regenerar un `.theme-check.yml` de arranque si hace falta reconstruir la configuración del linter. |

## Temas y ramas

Una sola tienda Shopify, dos temas. `main` → tema `Kinelia — LIVE` (publicado, el que ve el
tráfico pago). `staging` → tema `Kinelia — STAGING` (no publicado, solo link de preview, es el
objetivo de QA). Localmente, `shopify theme dev` crea un tema de desarrollo efímero.

Cualquier cosa más allá de esas tres líneas — cómo se conecta una rama a un tema, quién es
dueño del JSON de contenido, el checklist de release, el rollback — está en **`docs/RELEASE.md`**.
No se repite acá: una segunda copia de un checklist es una copia que se desactualiza.

## Documentos del repositorio

| Documento | Qué gobierna | Cuándo leerlo / la regla que lo ata |
|-----------|--------------|-------------------------------------|
| `ALLOWLIST.md` | El contrato de superficie del tema: qué renderiza, qué queda presente sin renderizar, qué no se agrega nunca. | Antes de agregar una sección, block, snippet o asset. **Regla: agregar una superficie renderizada actualiza `ALLOWLIST.md` en la misma PR** (lo hace cumplir `scripts/check-allowlist.mjs` dentro de `npm run lint`). |
| `OVERRIDES.md` | El libro mayor de divergencias respecto al starter Skeleton: base fijada, archivos modificados / nuevos / eliminados, componentes portados. | Antes de editar un archivo del starter. **Regla: cambiar un archivo del starter actualiza `OVERRIDES.md` en la misma PR.** |
| `docs/RELEASE.md` | La topología STAGING/LIVE, la regla de propiedad del contenido, el checklist de release, el rollback y las prohibiciones permanentes. | Antes de cualquier release o cambio de topología. **Regla: liberar sigue el runbook — sin atajos.** |
| `docs/PERF-BUDGET.md` | Los números del presupuesto de performance que Lighthouse CI comprueba en cada PR, de dónde sale cada uno y cuándo cambian. | Al agregar peso a una página o al mover un umbral de performance. **Regla: cada fase que agrega peso revisa el piso de performance hacia arriba.** |
| `.planning/` | Los artefactos de planificación de GSD: `PROJECT.md`, `ROADMAP.md`, `REQUIREMENTS.md`, research y los planes/resúmenes por fase. La integración de GitHub de Shopify lo ignora (solo lee las carpetas de tema conocidas). | Para el contexto de por qué el tema está construido como está — arrancá por `.planning/PROJECT.md`. |

## Estructura

```text
Shopify-Kinelia/                  raíz del repo — la integración de GitHub de Shopify conecta ramas acá
├── assets/                       CSS crítico + íconos. Sin JavaScript en la Fase 1.
├── blocks/                       primitivas de theme-block (group, text); la librería multi-avatar se construye acá
├── config/                       settings_schema.json (tokens) + settings_data.json (dueño: editor, ver docs/RELEASE.md)
├── layout/                       theme.liquid (shell HTML) + password.liquid
├── locales/                      archivos de traducción (es-AR se agrega en la Fase 2)
├── sections/                     secciones del tema + los *-group.json del header y el footer
├── snippets/                     helpers de Liquid (css-variables, image, meta-tags)
├── templates/                    *.json por ruta — home, producto, carrito, búsqueda, página, 404, password
├── .github/workflows/            ci.yml (job "Theme Check") + lighthouse.yml (job "Lighthouse")
├── scripts/                      check-allowlist.mjs — copia ejecutable de la allowlist de render
├── ALLOWLIST.md  OVERRIDES.md    contratos de superficie y de divergencia (ver arriba)
├── docs/                         RELEASE.md, PERF-BUDGET.md
├── .theme-check.yml  package.json      configuración de los gates y del dev-tooling
├── lighthouse/                        lighthouserc.json — asserts del harness de Lighthouse local
└── .planning/  .claude/          artefactos de GSD e instrucciones — ignorados por la integración de GitHub
```

**Constraint duro: las carpetas de tema (`assets/ blocks/ config/ layout/ locales/ sections/
snippets/ templates/`) viven en la raíz del repositorio.** La integración de GitHub de Shopify
solo conecta ramas con esa forma; si el tema estuviera anidado en `theme/` o `src/`, la rama
sería rechazada. **Nunca anidar las carpetas de tema.**
