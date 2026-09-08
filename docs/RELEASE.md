# Runbook de release — Kinelia Storefront

Este documento es el contrato operativo de cómo el código llega a la tienda. Define qué
tema es cuál, quién es dueño del JSON que escribe el editor de temas, qué tiene que ser
verdad antes de un merge, cómo se hace rollback, y qué nadie puede hacer nunca.

La topología descrita acá se **crea contra la tienda real en el plan 01-07**. Este documento
es el contrato que ese plan sigue; los nombres de tema de la tabla de topología son los
nombres exactos que el plan 01-07 debe usar al crear los temas.

## Topología

Una sola tienda Shopify, **dos temas** (no dos tiendas). Cada rama se conecta a un tema por
la integración de GitHub de Shopify.

| Rama | Tema | ¿Publicado? | Quién lo actualiza |
|------|------|-------------|--------------------|
| `main` | `Kinelia — LIVE` | **Sí** (único tema publicado, el que ve el tráfico pago) | Solo un merge revisado de `staging` → `main`, en una ventana de bajo tráfico, siguiendo el checklist de abajo. |
| `staging` | `Kinelia — STAGING` | No (solo link de preview, nunca indexado) | Cada pull request mergeada. Es el objetivo de QA. |
| _(local, efímero)_ | Tema de desarrollo que crea `shopify theme dev` | No | Quien esté desarrollando, en su máquina, contra la dev store. |

Git es la fuente de verdad del código (`.liquid`, `.css`, `.js`, y el JSON de esquema de las
secciones). El JSON de contenido tiene un dueño distinto — ver `## Propiedad del contenido`.

## Conexión rama ↔ tema (paso irreversible)

La integración de GitHub de Shopify ata **una rama a un tema, de forma permanente**. Una vez
que una rama se desconecta de un tema, **la conexión no se puede volver a establecer**:
recuperar significa crear un tema nuevo y volver a conectarlo desde cero, perdiendo el
historial de deploy de ese tema.

Consecuencias operativas:

- **Conectar de forma deliberada, no exploratoria.** Conectar es un paso del plan 01-07, no
  algo que se prueba y se deshace.
- **Conectar `staging` primero.** Se valida el flujo completo en STAGING antes de tocar `main`.
- **Nunca desconectar una rama de un tema "para limpiar".** No hay deshacer.
- La integración **solo conecta ramas cuyas carpetas de tema están en la raíz del
  repositorio** (`assets/ blocks/ config/ layout/ locales/ sections/ snippets/ templates/`).
  Si el tema estuviera anidado en un subdirectorio, la rama es rechazada.

## Propiedad del contenido

**Regla de este proyecto: la integración de GitHub es dueña de `config/settings_data.json` y
de los `templates/*.json`.** No git a mano, no un `shopify theme pull` periódico.

Cómo funciona:

1. Una persona no-desarrolladora edita **STAGING** en el editor de temas de Shopify.
2. La integración commitea esas ediciones de vuelta a la rama `staging` automáticamente.
3. Esos cambios llegan al tema LIVE por el **mismo camino de pull request que el código**.

Qué esperar y qué hacer:

- Aparecerán **commits automáticos en `staging`** cuyo autor nombra la tienda y la última
  persona que editó. Es lo normal.
- **Hacer `git pull --rebase` antes de pushear** a `staging`: el editor puede haber
  commiteado mientras trabajabas local.
- **Revisar esos diffs de JSON en la pull request**, no aceptarlos por reflejo. Un cambio de
  `settings_data.json` que nadie explica es una señal, no ruido.
- **Nunca hacer `shopify theme pull` sobre trabajo local** como forma de "sincronizar": eso
  pisa el código local con lo que haya en el tema.

Alternativa rechazada: **git dueño del JSON, con `shopify theme pull` periódico desde el
editor.** Se descartó porque tiene mayor riesgo de drift (dos caminos de escritura que se
pisan) sin ningún beneficio que lo compense.

## Checklist de release

Cada ítem es un chequeo con una condición de aprobación, no una sugerencia. No se mergea a
`main` hasta que todos pasan.

1. **Los dos checks de la pull request en verde.** El job **`Theme Check`** (workflow `CI`,
   `.github/workflows/ci.yml`) y el job **`Lighthouse`** (workflow `Lighthouse`,
   `.github/workflows/lighthouse.yml`) terminan en verde en la PR de `staging` → `main`.
   Condición: ambos jobs con estado success; ningún check requerido pendiente o fallado.
2. **Walkthrough del link de preview de STAGING.** Con el preview link del tema
   `Kinelia — STAGING`, recorrer: la página de producto (`/products/*`), la página de
   carrito (`/cart`), la página de búsqueda (`/search`), y llegar hasta el checkout.
   Condición: cada página renderiza sin errores rojos en la consola del navegador, y
   `npm run lint` corre limpio (exit 0) sobre el commit que se va a mergear.
3. **Corrida de performance mobile con throttling sobre el template de referencia.**
   Ejecutar Lighthouse en preset mobile con throttling sobre el template de producto de
   referencia. Condición: cumple el presupuesto documentado en **`docs/PERF-BUDGET.md`** — no
   se repiten los números acá para que no se desincronicen; `docs/PERF-BUDGET.md` es la
   fuente. Una regresión sobre cualquier umbral `error` de ese documento bloquea el release.
4. **Ninguna sección a medio construir referenciada por un template que sirve LIVE.**
   Revisar que ningún `templates/*.json` que el tema LIVE sirve referencia una sección
   incompleta o detrás de una feature a medias. Condición: `node scripts/check-allowlist.mjs`
   sale con estado 0, y una revisión manual de los templates tocados en la PR no encuentra
   secciones a medio construir.
5. **El merge, en ventana de bajo tráfico.** Mergear `staging` → `main` en una ventana de
   bajo tráfico. Condición: el merge queda hecho y se observa el commit de la integración de
   GitHub aterrizar en `main` y el tema `Kinelia — LIVE` actualizarse en el admin de Shopify.
6. **Smoke test del storefront publicado.** Abrir la tienda publicada y recorrer home →
   producto → agregar al carrito → llegar al checkout. Condición: el flujo completo funciona
   en producción sin errores de consola.
7. **Tag del release.** Crear un tag de git en el commit de `main` que quedó publicado.
   Condición: `git tag` muestra el tag nuevo apuntando al commit mergeado.

## Rollback

Cuando el tema LIVE está mal después de un release:

1. **Revertir el commit de merge en `main`** (`git revert -m 1 <sha-del-merge>`) y dejar que
   la integración de GitHub redespliegue el tema `Kinelia — LIVE`. Es el camino normal.
2. **Si el storefront tiene que restaurarse más rápido que eso**, publicar la versión
   anterior del tema desde la biblioteca de temas de la tienda (admin de Shopify → Temas →
   historial de versiones de `Kinelia — LIVE`) mientras el revert se procesa.

Ningún camino de rollback implica pushear un tema desde una laptop.

## Prohibiciones

Reglas permanentes. Cada una con su razón.

- **Nunca publicar al tema LIVE desde una máquina de desarrollo.** El único camino a tráfico
  pago es un merge revisado a `main`; publicar a mano saltea la revisión y el checklist.
- **Nunca hacer `shopify theme push` al tema publicado desde una laptop.** Pisa lo que la
  integración desplegó y desincroniza git del tema; los releases van por el merge de rama.
- **Nunca desconectar una rama de su tema.** La conexión no se puede reestablecer; recuperar
  obliga a recrear el tema y perder su historial de deploy.
- **Nunca dejar que git y el editor de temas sean dueños del mismo JSON.** Dos caminos de
  escritura sobre `settings_data.json` / `templates/*.json` se pisan y se pierde trabajo; hay
  un solo dueño y está escrito arriba (la integración de GitHub).
- **Nunca poner una contraseña de tienda, un Theme Access token ni una credencial de
  dashboard en este repositorio** — tampoco como valor de ejemplo en este runbook. Un ejemplo
  de credencial en un runbook termina siendo una credencial real en una terminal.

## Autenticación en CI

Cualquier operación de tema por línea de comandos dentro de CI se autentica con una
**contraseña de aplicación Theme Access**, provista por la variable de entorno
`SHOPIFY_CLI_THEME_TOKEN`.

- Este nombre es **irregular**: no sigue la convención habitual de flag-a-variable de la CLI
  de Shopify (no es `SHOPIFY_FLAG_PASSWORD`).
- Usar el nombre equivocado **no falla de forma ruidosa**: la CLI se queda colgada esperando
  un login interactivo que en CI nunca llega, hasta que el job hace timeout.
- **Este proyecto no corre ningún deploy de tema por línea de comandos en CI hoy**, porque
  los releases van por la integración de GitHub. Esta nota existe para que un workflow futuro
  no redescubra esto a los golpes.
- Las corridas de workflow de contribuyentes que nunca contribuyeron antes **requieren
  aprobación manual**. Es el comportamiento buscado, no un error de configuración.
