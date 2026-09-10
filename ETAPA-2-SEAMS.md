# ETAPA-2-SEAMS.md — Contrato de la medición diferida

Este documento es la **especificación propia del tema** para todo lo que un equipo de
medición necesita para conectar la Etapa 2 a este storefront **sin reestructurarlo**. Está
transcrito del repositorio hermano (`../../Kinelia/`) y lo cita como origen, pero no depende
de él: si el repositorio hermano se mueve, se renombra o se hace privado, el tema sigue
sabiendo exactamente qué atributos de carrito y qué eventos de embudo tiene que satisfacer.

Requisito que cierra: **SHELL-04** (y, junto con `assets/events.js` del plan 03-01,
**SHELL-03**). Decisión de origen: **D-04** (documento híbrido — el contrato inline, los
archivos hermanos citados como su origen).

## Qué es este documento y qué autoridad tiene

- Es la copia que **posee el tema**. El tema fue construido contra lo que dice acá.
- Los archivos hermanos citados al final son el **origen** de la transcripción, no la
  autoridad en runtime.
- **Si este documento y el repositorio hermano alguna vez difieren**, la diferencia es un
  bug que alguien tiene que cerrar deliberadamente — nunca un "ya se va a arreglar solo".
  El plan que cambie el contrato actualiza este archivo y `scripts/check-seams.mjs` en la
  misma pull request.
- La Fase 3 **no abre ninguna conexión** a ningún endpoint. Este documento es una
  especificación y el seam (`snippets/analytics-hooks.liquid`) es un comentario.

## Atributos del carrito

El carrito de una orden tiene que llegar al webhook con **siete** atributos. Seis los
escribe hoy el script de atribución hermano desde una cookie de primera parte con regla
**first-touch** (el primer anuncio que trajo a la persona se queda con el crédito); el
séptimo lo agrega el contrato de este tema.

| Atributo | De dónde sale el valor | Quién lo escribe |
|----------|------------------------|------------------|
| `visitante_id` | UUID de primera parte generado con `crypto.randomUUID()`, guardado en la cookie `kinelia_attr` (30 días, `SameSite=Lax; Secure`), estable entre visitas. Es la clave de join sesión ↔ orden. | Script de atribución hermano (`kinelia-atribucion.js`) |
| `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content` | Leídos de los parámetros de la URL en el **primer arribo** y congelados en la cookie (first-touch). En arribos posteriores sin UTMs se releen de la cookie. | Script de atribución hermano |
| `view` | Slug del avatar tomado del parámetro `?view=` de la URL. Sirve para atribución multi-avatar. **No lo escribe el script hermano hoy.** | **Etapa 2 / Fase 10.** El contrato LOCKED del plan 03-01 asigna la escritura al script de atribución hermano en la Fase 10. La elección de implementación sigue abierta entre dos opciones y la cierra la Fase 10: (a) un snippet del tema que lee `?view=` y lo mergea al carrito, o (b) una versión actualizada del script de atribución hermano. Ninguna de las dos existe en la Fase 3. |

### Regla de escritura: read-modify-write

Los atributos se escriben con `POST /cart/update.js` con cuerpo `{ attributes: { ... } }`.
La escritura **debe ser read-modify-write**: leer el carrito primero (`GET /cart.js`),
mergear los atributos de atribución, y recién entonces escribir de vuelta — para que la
atribución **nunca destruya** un atributo que otra funcionalidad haya seteado. Es el mismo
requisito que carga el buy box en la Fase 5 (BUY-06), y es la diferencia entre una
atribución que **agrega** información y una que **borra** información en silencio. Shopify
puede recrear el carrito después de un add-to-cart, así que la reescritura se repite después
de cada agregado.

## Eventos del embudo (endpoint `/collect`)

El endpoint `/collect` del repositorio hermano acepta **exactamente ocho** tipos de evento.
Cualquier otro tipo se **descarta en silencio**: no produce error ni dato. La Etapa 2 no
debe inventar un noveno tipo y después preguntarse dónde quedó.

| Tipo | Qué significa en este embudo |
|------|-----------------------------|
| `view_lp` | Vista de la landing / página de producto. Se emite una vez al cargar. |
| `scroll_50` | La persona llegó al 50 % del alto scrolleable. Una sola vez por sesión. |
| `scroll_75` | La persona llegó al 75 % del alto scrolleable. Una sola vez por sesión. |
| `ver_oferta` | El bloque de precio/oferta entró al viewport (ver "El hook de la oferta"). |
| `add_to_cart` | Se llamó a `/cart/add` de Shopify. |
| `inicio_checkout` | Click en un control de checkout (`[name="checkout"]` o un link a `/checkout`). |
| `paso_checkout` | Avance de paso dentro del checkout. Lo emitirá la instrumentación de checkout de la Etapa 2. |
| `compra` | Compra confirmada. Lo emitirá la página de agradecimiento / order-status de la Etapa 2. |

**Forma del cuerpo del request:**

```
{
  "visitante_id": String  // ≤ 64 chars
  "eventos": [             // ≤ 50 por request
    { "tipo": String, "payload": Object, "sesion_ext"?: String /* ≤ 64 */ }
  ]
}
```

- **El servidor pone la hora de ocurrencia** (`ocurrido_en`). No se confía en el reloj del
  cliente: ensuciar el grano diario es la única decisión irreversible del modelo de datos.
- El endpoint valida el `Origin` del request contra una allowlist (`COLLECT_ORIGENES`). Los
  orígenes permitidos se configuran **en el repositorio hermano**, no acá.
- Endpoint: `https://&lt;proyecto&gt;.supabase.co/functions/v1/collect`. El host es un
  **placeholder**, nunca una referencia real de proyecto — este repositorio es público en
  la Etapa 1.

## El bus interno del tema

`assets/events.js` (plan 03-01) expone `window.Kinelia.events` — un wrapper fino sobre
`document` + `CustomEvent`. Publica **cinco** nombres, convención `namespace:verbo-en-pasado`,
dinero siempre en centavos. **Nadie emite ninguno en la Fase 3**: el módulo y el contrato se
entregan; los emisores llegan en las Fases 5 y 6.

| Nombre | Emisor futuro | Forma del `detail` |
|--------|---------------|--------------------|
| `variant:changed` | Fase 5 — variant picker del buy box | `{ variantId, available, price, optionValues }` — `price` en centavos |
| `product:added` | Fases 5-6 — ATC y sticky ATC | `{ variantId, quantity, cart }` |
| `cart:updated` | Fase 6 — cart drawer y cambios de línea | `{ itemCount, cart }` |
| `cart:loading` | Fase 6 — spinners del drawer y del buy box | `{ loading, source }` |
| `cart:error` | Fase 6 — request de carrito fallida | `{ message, source, code }` |

Un consumidor puede suscribirse **o** con `Kinelia.events.on(name, cb)` **o** con
`document.addEventListener(name, cb)` — es el mismo evento, porque `emit` es
`document.dispatchEvent(new CustomEvent(...))` y nada más.

## El mapa entre los dos vocabularios

Los dos vocabularios — el bus interno del tema y los tipos de evento de `/collect` — son
**deliberadamente separados**. El mapa de "evento del bus → tipo de evento de `/collect`" es
trabajo de la Etapa 2, cableado **dentro del seam** `snippets/analytics-hooks.liquid`, que
se suscribe al bus y reenvía.

- El único mapeo ya obvio es el par de agregado al carrito: el evento del bus de producto
  agregado se reenvía como el tipo "add to cart" de `/collect`.
- El resto de los tipos de `/collect` (la vista de landing, los de scroll, el de ver la
  oferta, los de checkout, el de compra confirmada) los emite **directamente** el script de
  atribución hermano, sin pasar por el bus.

## El hook de la oferta

El script de atribución hace `document.querySelector('[data-kinelia="oferta"]')` y observa
ese elemento con un `IntersectionObserver` (threshold 0.5) para emitir el evento de ver la
oferta. El
atributo `data-kinelia="oferta"` lo **coloca la Fase 5** sobre el bloque de precio del buy
box. Este documento solo registra que ese hook **tiene que existir**, para que la Fase 5 no
tenga que redescubrirlo.

## Dónde va el script de atribución

En el `<head>`, en **todas** las páginas, renderizado desde `snippets/analytics-hooks.liquid`
— por eso el seam está donde está. La línea `<script src>` vive hoy **comentada** dentro de
ese snippet, con el host en placeholder (`https://&lt;proyecto&gt;.supabase.co/...`). Una
referencia real de proyecto **nunca** debe commitearse mientras este repositorio sea público.

## Seguridad del payload

1. **Un `detail` del bus lleva identificadores y montos en centavos — nunca datos que
   identifican a una persona** (email, nombre completo, dirección postal, teléfono). Un
   payload de `CustomEvent` es legible por cualquier script que corra en la página,
   incluido un pixel de terceros futuro. Las cinco formas de `detail` de arriba no llevan
   ningún campo de PII; la Fase 6 hereda esta regla por escrito.
2. **El `message` del evento de error de carrito no relaya texto crudo de error de la
   plataforma al DOM.** Filtra internos sin beneficio para el usuario. La Fase 6 es dueña de
   honrar esta regla cuando implemente el consumidor de ese evento.

## Qué necesitará alcanzar la Etapa 2

Cuando la Etapa 2 encienda la atribución y el pixel, una política de conexión tendría que
permitir estos hosts. Un tema de Shopify **no fija su propia** `content-security-policy`
(la maneja Shopify); esto se registra acá para que la Etapa 2 lo tenga en un solo lugar:

- El host del proyecto hermano (`*.supabase.co`) — para el POST a `/collect` y para servir
  el propio `kinelia-atribucion.js`.
- Los hosts de publicidad y analítica de Meta y de Google — para el pixel de Meta / CAPI y
  para cualquier analítica web que la Etapa 2 sume.

## Puntos abiertos

| Punto | Quién lo cierra |
|-------|-----------------|
| El dueño de implementación del séptimo atributo del carrito (snippet del tema vs. script hermano actualizado) | Etapa 2 / **Fase 10** |
| El mapa completo de "evento del bus → tipo de `/collect`" | Etapa 2 (dentro de `snippets/analytics-hooks.liquid`) |
| La colocación del hook `data-kinelia="oferta"` en el bloque de precio | **Fase 5** |

## Origen de la transcripción

Transcrito verbatim el **2026-09-10** de dos archivos del repositorio hermano, ambos
git-tracked:

- `../../Kinelia/web/kinelia-atribucion.js` — cookie de primera parte, el identificador de
  visitante, first-touch de los cinco UTMs, sync de atributos de carrito vía
  `/cart/update.js`, cola de
  eventos a `/collect`, hook `data-kinelia="oferta"`, endpoint con placeholder.
- `../../Kinelia/supabase/functions/collect/index.ts` — el set de ocho tipos de evento
  aceptados, la forma del cuerpo y sus topes de longitud, la allowlist de orígenes, y el
  hecho de que el servidor estampa la hora de ocurrencia.
