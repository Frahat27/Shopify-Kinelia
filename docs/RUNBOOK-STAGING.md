# Runbook de STAGING — pasos de admin que el código no puede ejecutar

`docs/RELEASE.md` §"Propiedad del contenido" fija la regla: la integración de GitHub es
dueña de `config/settings_data.json` y de los `templates/*.json`; el contenido de página,
los menús y los valores de setting los completa una persona en el editor de temas, no un
commit. Este documento existe porque un paso que nadie escribe es un paso que nadie hace.

**Estos pasos se ejecutan contra el tema `Kinelia — STAGING` (sin publicar, solo link de
preview) — nunca contra `Kinelia — LIVE`.** Ejecutar sobre LIVE saltea el checklist de
`docs/RELEASE.md` y publica contenido sin revisión.

## Paso 1 — Las cinco páginas stub

En **Shopify admin → Contenido → Páginas** de la tienda de desarrollo, crear estas cinco
páginas con el slug exacto (sin acentos, en minúscula, con guiones) que fija el plan
03-04. Cada una lleva una línea de cuerpo de marcador de posición; el contenido real es
responsabilidad de la **Fase 11**.

| Página | Slug exacto | Contenido en esta etapa |
|--------|-------------|--------------------------|
| Términos y condiciones | `terminos` | "Contenido pendiente — se completa en la Fase 11." |
| Política de privacidad | `privacidad` | "Contenido pendiente — se completa en la Fase 11." |
| Cambios y devoluciones | `cambios-y-devoluciones` | "Contenido pendiente — se completa en la Fase 11." |
| Datos de la empresa | `datos-de-la-empresa` | "Contenido pendiente — se completa en la Fase 11." |
| Botón de arrepentimiento | `boton-de-arrepentimiento` | "Contenido pendiente — se completa en la Fase 11." |

**Por qué ahora y no en la Fase 11:** un link legal que resuelve a una página 404 es peor
que no tener el link. Crear las cinco páginas stub antes de armar el menú del Paso 2 hace
que ningún link del footer resuelva a "no encontrado" (D-14) desde el día uno, aunque el
contenido real llegue después.

## Paso 2 — El menú del footer

1. En **Shopify admin → Contenido → Menús**, crear un menú (por ejemplo, "Footer — Legal")
   con las cinco páginas del Paso 1, en el orden de la tabla de arriba.
2. En el editor de temas de `Kinelia — STAGING`, abrir la sección "Pie de página" y asignar
   ese menú al setting `menu` del footer. Sin este paso, `sections/footer.liquid` no deja
   un hueco vacío — simplemente no renderiza el bloque de links legales (guarda por tamaño,
   D-14) — así que un menú vacío es silencioso, no roto, pero tampoco cumple SHELL-02.
3. **Decisión pendiente, no una instrucción:** confirmar con el desarrollador si el link
   externo a **Defensa del Consumidor** (Ventanilla Única Federal) también entra a este
   menú ahora. El research de la Fase 3 (`03-RESEARCH.md`, supuesto A4) no pudo cerrar la
   lista completa de compliance argentino y marcó este punto para confirmación del
   usuario — no es una decisión que el código deba tomar en silencio. Registrar la
   respuesta acá cuando se dé:
   - [ ] **Respuesta:** _(pendiente)_

## Paso 3 — El número de WhatsApp

En el editor de temas de `Kinelia — STAGING` → **Configuración → WhatsApp**, cargar el
número del comercio en el setting `whatsapp_number`, en formato internacional: solo
dígitos, sin signo `+`, sin espacios ni guiones (ejemplo: `5491122334455`).

**Hasta que este campo tenga un valor, el link de WhatsApp del footer y el botón flotante
no se muestran — es el comportamiento correcto**, no un bug: un número inventado que llega
a un desconocido es peor que un botón que todavía no hace nada (D-15).

## Paso 4 — La franja de anuncio

Ningún paso es necesario acá. `sections/announcement-bar.liquid` (plan 03-03) ya sale con
su mensaje por defecto en español desde `locales/es.default.json`
(`sections.announcement_bar.message`). El campo "Mensaje personalizado" del editor existe
para cambiar esa línea sin un deploy de código, si el negocio lo necesita más adelante.

## Nota de cierre — write-backs del editor de temas

Después de ejecutar estos pasos, la integración de GitHub va a commitear los cambios de
vuelta a la rama `staging`: verás commits automáticos cuyo autor nombra la tienda y la
última persona que editó — es lo esperado (`docs/RELEASE.md`). Antes de pushear cualquier
cambio propio a `staging`, correr `git pull --rebase` (el editor puede haber commiteado
mientras trabajabas local) y **revisar esos diffs de JSON en la pull request** en vez de
aceptarlos por reflejo — un cambio de `config/settings_data.json` o de
`sections/footer-group.json` que nadie explica es una señal, no ruido.

---

*Fase: 03-layout-shell-seams-de-etapa-2 · Plan: 03-04 · Creado: 2026-09-11*
