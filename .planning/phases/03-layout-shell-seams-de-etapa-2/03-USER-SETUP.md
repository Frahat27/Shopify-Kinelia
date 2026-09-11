# Phase 03: User Setup Required

**Generated:** 2026-09-11
**Phase:** 03-layout-shell-seams-de-etapa-2
**Status:** Incomplete

Completá estos ítems para que SHELL-02 quede realmente terminado en STAGING. El código de
esta fase (planes 03-01 a 03-04) ya automatizó todo lo que se puede automatizar; lo que
queda acá son pasos que solo una persona con acceso al admin de Shopify puede ejecutar
(`docs/RELEASE.md` §"Propiedad del contenido": la integración de GitHub es dueña del JSON
de contenido, no de las páginas, los menús ni los valores de setting). El paso a paso
completo, con los slugs exactos y las razones, vive en
`docs/RUNBOOK-STAGING.md` — este archivo es el checklist rápido que apunta ahí.

## Account Setup

No aplica — esta fase no crea ninguna cuenta ni credencial nueva.

## Dashboard Configuration

- [ ] **Crear las 5 páginas stub con los slugs exactos**
  - Location: Shopify admin → Contenido → Páginas, sobre la tienda de desarrollo
  - Set to: `terminos`, `privacidad`, `cambios-y-devoluciones`, `datos-de-la-empresa`,
    `boton-de-arrepentimiento` — cada una con una línea de texto de marcador de posición
  - Notes: ver `docs/RUNBOOK-STAGING.md` §"Paso 1" para la tabla completa. El contenido real
    de cada página es responsabilidad de la Fase 11; estas páginas existen ahora solo para
    que ningún link legal resuelva a un 404 (D-14).

- [ ] **Crear el menú del footer y enlazar las 5 páginas**
  - Location: Shopify admin → Contenido → Menús
  - Set to: un menú (ej. "Footer — Legal") con las cinco páginas de arriba, en el orden del
    runbook, asignado luego al setting `menu` de la sección "Pie de página" en el editor de
    temas de `Kinelia — STAGING`
  - Notes: confirmar con el desarrollador si el link externo a Defensa del Consumidor
    (Ventanilla Única Federal) también va en este menú ahora — es una decisión abierta
    (research assumption A4), no algo que el código haya decidido en silencio. Ver
    `docs/RUNBOOK-STAGING.md` §"Paso 2".

- [ ] **Cargar el número de WhatsApp en el setting del tema**
  - Location: Editor de temas de `Kinelia — STAGING` → Configuración → WhatsApp
  - Set to: el número del comercio en formato internacional, solo dígitos, sin `+`, sin
    espacios ni guiones (ej.: `5491122334455`)
  - Notes: hasta que este campo tenga un valor, el link de WhatsApp del footer y el botón
    flotante correctamente no se muestran — es el comportamiento esperado, no un bug
    (D-15). Ver `docs/RUNBOOK-STAGING.md` §"Paso 3".

## Verification

Después de completar los tres ítems, verificar en el preview de `Kinelia — STAGING`:

```bash
# No hay comando de terminal para esto — es una revisión visual en el navegador.
# Abrir el link de preview de Kinelia — STAGING y:
#   1. Hacer click en cada link del footer: ninguno debe dar 404.
#   2. Hacer click en el link "Pedir por WhatsApp" del footer y en el botón flotante:
#      ambos deben abrir una conversación con el número cargado.
#   3. Confirmar que no se ve ningún bloque de newsletter ni fila de íconos de pago
#      (siguen apagados hasta Etapa 2 / Fase 12).
```

Expected results:
- Los cinco links del menú legal abren sus páginas stub (con el texto de marcador de
  posición), ninguno da error.
- El link de WhatsApp del footer y el botón flotante abren `wa.me/<número cargado>`.
- La franja de anuncio ya se ve con su mensaje por defecto sin ningún paso adicional.

---

**Once all items complete:** Mark status as "Complete" at top of file, y anotar en
`docs/RUNBOOK-STAGING.md` §"Paso 2" la respuesta sobre el link de Defensa del Consumidor.
