# Requirements: Kinelia Storefront

**Defined:** 2026-09-07
**Core Value:** Maximizar el CVR de la página de producto (tráfico pago Meta → órdenes), sostenido por la regla CPA efectivo < margen.

## v1 Requirements

Etapa 1 — Tema de Shopify publicado y vendible. Cada requisito mapea a una fase del roadmap.

### Foundation (FOUND)

- [ ] **FOUND-01**: El tema vive en este repo git y se previsualiza localmente con `shopify theme dev` contra una dev store
- [ ] **FOUND-02**: La decisión de tema base (Skeleton / Horizon / Dawn) está tomada y registrada, con PROJECT.md actualizado
- [ ] **FOUND-03**: El tema base se reduce a lo esencial por "no renderizar" (allowlist), sin borrar módulos de carrito ni de accesibilidad
- [ ] **FOUND-04**: Existe un remote `upstream` al tema base y un `OVERRIDES.md` que documenta cada divergencia
- [ ] **FOUND-05**: Hay topología de temas STAGING (no publicado) vs LIVE, con checklist de release y git como fuente de verdad del código
- [x] **FOUND-06**: Theme Check corre localmente y en cada PR (`theme-check-action`)
- [x] **FOUND-07**: Existe un harness de presupuesto de performance para medir Lighthouse mobile sobre un template de avatar

### Design System (DESIGN)

- [ ] **DESIGN-01**: Los tokens de marca (color, tipografía, espaciado) de la guía de marca están en `settings_schema.json` y expuestos como custom properties CSS
- [ ] **DESIGN-02**: Un cambio de marca se hace en un solo lugar (tokens), sin tocar CSS de componentes
- [ ] **DESIGN-03**: Existe `base.css` con reset, escala tipográfica, colores, espaciado, botones y primitivas de formulario
- [ ] **DESIGN-04**: El locale es-AR (voseo) está scaffoldeado y todo el texto de UI sale de archivos de locale

### Layout Shell (SHELL)

- [ ] **SHELL-01**: `theme.liquid` incluye el shell del documento con `css-variables.liquid` (tokens) y `analytics-hooks.liquid` (no-op, seam de Etapa 2)
- [ ] **SHELL-02**: Header mínimo y footer con links legales AR, afordancia de WhatsApp y bloque de newsletter deshabilitado
- [ ] **SHELL-03**: Existe un bus de eventos DOM (`variant:changed`, `product:added`, `cart:updated`) que consumen el sticky ATC y, luego, Etapa 2
- [ ] **SHELL-04**: `ETAPA-2-SEAMS.md` documenta el contrato de cart attributes y eventos para el trabajo de medición diferido

### Data Model (DATA)

- [ ] **DATA-01**: Existe un único producto héroe con matriz de variantes talle × color
- [ ] **DATA-02**: Están definidos los metafields de producto necesarios (hechos del producto)
- [ ] **DATA-03**: Están definidos los metaobjects `avatar`, `oferta`, `testimonio`, `faq_item`, `size_chart_row`
- [ ] **DATA-04**: El contenido de un avatar completo + la entrada `oferta` están cargados como semilla
- [ ] **DATA-05**: Ninguna copy de marketing vive en archivos `.liquid`; toda es editable desde el editor de tema o metaobjects

### Buy Box (BUY)

- [ ] **BUY-01**: El comprador ve una galería de medios video-first donde la imagen póster es el elemento LCP y el video hace lazy-init
- [ ] **BUY-02**: El comprador selecciona talle y color; las combinaciones sin stock aparecen deshabilitadas
- [ ] **BUY-03**: El comprador abre una guía de talles en un drawer sin salir de la página
- [ ] **BUY-04**: El buy box muestra precio, precio ancla tachado y badge de ahorro según la oferta
- [ ] **BUY-05**: En mobile, una barra sticky de Add-to-Cart refleja la selección actual y permite agregar al carrito
- [ ] **BUY-06**: Al agregar al carrito se escriben `visitante_id` y parámetros UTM como cart attributes (read-modify-write, sin pisar attributes existentes)
- [ ] **BUY-07**: El buy box muestra una fila de confianza (garantía 90 días · envío · pagá al recibir) y reassurance de pago (marcas de MercadoPago + "también podés pagar al recibir")

### Bundle (BUNDLE)

- [ ] **BUNDLE-01**: La mecánica del bundle está decidida por un spike (packs como variante vs Bundles nativo vs descuento automático) antes de construir la UI del selector
- [ ] **BUNDLE-02**: El selector de bundle es el control principal del buy box: 2/3/4 pares, tier del medio marcado como "más elegido", precio por par visible
- [ ] **BUNDLE-03**: Para cada tier, un test end-to-end verifica que el total en el checkout = el precio prometido en la landing
- [ ] **BUNDLE-04**: El carrito se abre como drawer y refleja el pack elegido con su propiedad de line item
- [ ] **BUNDLE-05**: Si hay umbral de envío gratis, el mensaje es honesto y consistente con la oferta
- [ ] **BUNDLE-06**: La forma de la orden (line items / propiedades) está documentada para el equipo de backend

### Persuasion — Variable Stack (PERS)

- [ ] **PERS-01**: Las secciones `avatar-hero`, `problem-agitation`, `mechanism` (diagrama estático UMP→UMS) y `para-quien` renderizan desde un único metaobject `avatar` y no contienen copy propia
- [ ] **PERS-02**: El headline, el hero y la primera línea de agitación de cada avatar mantienen continuidad con el creativo ganador (ad-scent)
- [ ] **PERS-03**: Existen theme blocks reutilizables (`headline`, `media-with-text`, `trust-row`) usados por varias secciones
- [ ] **PERS-04**: Solo se cargan los medios del avatar actual, no los de todos los avatares

### Social Proof + USP (PROOF)

- [ ] **PROOF-01**: La sección de testimonios muestra testimonios (con filtro por tag de avatar) desde metaobjects
- [ ] **PROOF-02**: Existe una sección de reviews con slot `@app` y un fallback estático, más un slot de rating en el buy box, como placeholders DOM estables para Etapa 2
- [ ] **PROOF-03**: Existe una sección de comparación vs. media genérica que comunica el USP

### Fixed Spine (FIXED)

- [ ] **FIXED-01**: Existe un bloque de garantía de 90 días con reversión de riesgo
- [ ] **FIXED-02**: Existe una sección de cómo usar + guía de talles
- [ ] **FIXED-03**: Existe una FAQ (COD, envíos, talles, devoluciones) que renderiza desde metaobjects
- [ ] **FIXED-04**: Existe un CTA final que devuelve al buy box
- [ ] **FIXED-05**: La composición del stack FIJO está bloqueada y verificada: ninguna sección fija lleva copy por template

### Multi-Avatar System (AVATAR)

- [ ] **AVATAR-01**: Existe un `product.json` canónico con avatar por defecto vía metafield
- [ ] **AVATAR-02**: Existe un template de avatar de referencia completo (`product.avatar-varices.json`) y un segundo template clon que demuestra el sistema
- [ ] **AVATAR-03**: El parámetro `?view={slug}` selecciona el template de avatar correcto sobre el tema base elegido, verificado con una URL de anuncio real de Meta
- [ ] **AVATAR-04**: Las páginas de avatar casi duplicadas tienen postura canónica/robots definida (recomendado `noindex,follow`, tráfico 100% pago)
- [ ] **AVATAR-05**: Un lint verifica que todo `product.avatar-*.json` incluye el espinazo de secciones fijas requerido
- [ ] **AVATAR-06**: Existe un runbook para que un operador no-dev clone un avatar (template + metaobject + URL) en 15–30 min
- [ ] **AVATAR-07**: Existe una allowlist/blocklist de frases que el operador de contenido usa por avatar para compliance de claims de salud de Meta

### Home + Legal Pages (PAGES)

- [ ] **PAGES-01**: La home está resuelta: landing del avatar destacado o redirect, con la decisión documentada
- [ ] **PAGES-02**: Existen las páginas legales AR: T&C, política de privacidad, cambios y devoluciones, datos de la empresa
- [ ] **PAGES-03**: Existe el Botón de Arrepentimiento accesible desde la home sin login, conforme a la normativa vigente
- [ ] **PAGES-04**: Existe una página de contacto con WhatsApp
- [ ] **PAGES-05**: Existen 404 y búsqueda mínimos funcionales

### Checkout Config (CHECKOUT)

- [ ] **CHECKOUT-01**: MercadoPago está configurado como gateway online (preferentemente transparente/on-site) en el checkout nativo
- [ ] **CHECKOUT-02**: "Pago contra entrega" existe como método de pago manual, gateado por zona de envío para no mostrarse en regiones no servidas
- [ ] **CHECKOUT-03**: Shopify Flow etiqueta cada orden como `cod` o `prepaid`
- [ ] **CHECKOUT-04**: Está documentada la cifra de margen incluyendo fee de terceros de Shopify + gateway + IVA, para la regla CPA efectivo < margen
- [ ] **CHECKOUT-05**: El checkout usa exclusivamente Checkout Extensibility (nada de `checkout.liquid` ni Additional Scripts)

### Performance (PERF)

- [ ] **PERF-01**: Un template de avatar cargado en mobile con throttling tiene LCP < 2,5 s
- [ ] **PERF-02**: El JS no bloquea el render; se respeta un presupuesto de JS definido
- [ ] **PERF-03**: La imagen del hero se precarga con `fetchpriority=high` y dimensiones explícitas; el video usa `preload="none"` y lazy-init
- [ ] **PERF-04**: Todas las imágenes usan parámetros del CDN de Shopify e `imágenes responsive` con lazy-load nativo
- [ ] **PERF-05**: QA cross-device completado (iOS Safari, Android Chrome, desktop)

### Launch / Handoff (LAUNCH)

- [ ] **LAUNCH-01**: El tema está publicado en el dominio con contenido real (copy y fotos finales)
- [ ] **LAUNCH-02**: Handoff completado: credenciales de MercadoPago producción, datos de razón social AR, DNS del dominio
- [ ] **LAUNCH-03**: Se recorrió la checklist "parece terminado pero no lo está" antes de publicar
- [ ] **LAUNCH-04**: Una compra real de prueba (COD y prepago) se completa de punta a punta

## v2 Requirements

Etapa 2 — Instrumentación. Rastreada, fuera del roadmap actual.

### Tracking (TRACK)

- **TRACK-01**: Meta Pixel + Conversions API vía Custom Pixels (Web Pixels API), no código de tema
- **TRACK-02**: GA4 vía Custom Pixels
- **TRACK-03**: Eventos de conversión (ViewContent, AddToCart, InitiateCheckout, Purchase) con parámetros de valor y contenido

### Attribution (ATTR)

- **ATTR-01**: Integración del script `kinelia-atribucion.js` en `theme.liquid` (hook ya reservado en Etapa 1)
- **ATTR-02**: Sincronización de carrito y `visitante_id` con el backend Supabase
- **ATTR-03**: Definición del evento "cobrado" para COD (rendición de courier) y su tag en la orden

### Reviews (REV)

- **REV-01**: App de reseñas (Judge.me) instalada y poblada con reviews reales
- **REV-02**: Importación/exportación de reviews sin lock-in
- **REV-03**: Los slots `@app` de Etapa 1 se llenan sin cirugía de templates

### Email (EMAIL)

- **EMAIL-01**: Flujo de bienvenida
- **EMAIL-02**: Flujo de carrito abandonado consciente de COD
- **EMAIL-03**: Flujo post-compra

## v3 Requirements

Etapa 3 — Experimentos de CVR y captación de datos. Rastreada, fuera del roadmap actual.

### Experiments (EXP)

- **EXP-01**: Framework de A/B testing
- **EXP-02**: Señales de escasez / prueba social respaldadas por datos reales (stock real, ventas recientes)
- **EXP-03**: Widget buscador de talle / size-finder
- **EXP-04**: Selección de talle por par dentro del pack
- **EXP-05**: Estructura para productos 2 y 3

## Out of Scope

Exclusiones explícitas para prevenir scope creep.

| Feature | Reason |
|---------|--------|
| Headless / Hydrogen / React | Dawn/theme-blocks + secciones es más mantenible para monoproducto → 2-3 productos y rinde mejor en Core Web Vitals sin esfuerzo |
| Formulario COD propio fuera del checkout de Shopify | Duplica el embudo, duplica eventos y ensucia la medición de CPA efectivo |
| Countdown / escasez falsa | Backfire documentado: destruye la confianza del segmento COD escéptico |
| Botones dinámicos "Buy it Now" / Shop Pay | Fork del embudo; Shop Pay no disponible en AR |
| Reviews sembradas / falsas al lanzamiento | Riesgo legal y de confianza; los slots quedan como placeholder hasta tener reviews reales |
| Pop-ups de descuento por exit-intent | Patrón oscuro que erosiona confianza |
| Quiz funnel pre-PDP | Agrega fricción antes del buy box |
| Prompts de creación de cuenta | Fricción en compra por impulso |
| Widget de live-chat | Fuera de alcance; WhatsApp cubre el contacto |
| Carrusel de hero auto-rotante | Perjudica LCP y comprensión |
| App pesada de bundles con reescritura de carrito | Riesgo de performance y de romper el checkout |
| Backend de datos Supabase | Vive en el repo `Kinelia` principal, fuera de este repo |

## Traceability

Mapeado en ROADMAP.md el 2026-09-07. Cada requisito v1 mapea a exactamente una fase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUND-01 | Phase 1 | Pending |
| FOUND-02 | Phase 1 | Pending |
| FOUND-03 | Phase 1 | Pending |
| FOUND-04 | Phase 1 | Pending |
| FOUND-05 | Phase 1 | Pending |
| FOUND-06 | Phase 1 | Complete |
| FOUND-07 | Phase 1 | Complete |
| DESIGN-01 | Phase 2 | Pending |
| DESIGN-02 | Phase 2 | Pending |
| DESIGN-03 | Phase 2 | Pending |
| DESIGN-04 | Phase 2 | Pending |
| SHELL-01 | Phase 3 | Pending |
| SHELL-02 | Phase 3 | Pending |
| SHELL-03 | Phase 3 | Pending |
| SHELL-04 | Phase 3 | Pending |
| DATA-01 | Phase 4 | Pending |
| DATA-02 | Phase 4 | Pending |
| DATA-03 | Phase 4 | Pending |
| DATA-04 | Phase 4 | Pending |
| DATA-05 | Phase 4 | Pending |
| BUY-01 | Phase 5 | Pending |
| BUY-02 | Phase 5 | Pending |
| BUY-03 | Phase 5 | Pending |
| BUY-04 | Phase 5 | Pending |
| BUY-06 | Phase 5 | Pending |
| BUY-07 | Phase 5 | Pending |
| BUY-05 | Phase 6 | Pending |
| BUNDLE-01 | Phase 6 | Pending |
| BUNDLE-02 | Phase 6 | Pending |
| BUNDLE-03 | Phase 6 | Pending |
| BUNDLE-04 | Phase 6 | Pending |
| BUNDLE-05 | Phase 6 | Pending |
| BUNDLE-06 | Phase 6 | Pending |
| PERS-01 | Phase 7 | Pending |
| PERS-02 | Phase 7 | Pending |
| PERS-03 | Phase 7 | Pending |
| PERS-04 | Phase 7 | Pending |
| PROOF-01 | Phase 8 | Pending |
| PROOF-02 | Phase 8 | Pending |
| PROOF-03 | Phase 8 | Pending |
| FIXED-01 | Phase 9 | Pending |
| FIXED-02 | Phase 9 | Pending |
| FIXED-03 | Phase 9 | Pending |
| FIXED-04 | Phase 9 | Pending |
| FIXED-05 | Phase 9 | Pending |
| AVATAR-01 | Phase 10 | Pending |
| AVATAR-02 | Phase 10 | Pending |
| AVATAR-03 | Phase 10 | Pending |
| AVATAR-04 | Phase 10 | Pending |
| AVATAR-05 | Phase 10 | Pending |
| AVATAR-06 | Phase 10 | Pending |
| AVATAR-07 | Phase 10 | Pending |
| PAGES-01 | Phase 11 | Pending |
| PAGES-02 | Phase 11 | Pending |
| PAGES-03 | Phase 11 | Pending |
| PAGES-04 | Phase 11 | Pending |
| PAGES-05 | Phase 11 | Pending |
| CHECKOUT-01 | Phase 12 | Pending |
| CHECKOUT-02 | Phase 12 | Pending |
| CHECKOUT-03 | Phase 12 | Pending |
| CHECKOUT-04 | Phase 12 | Pending |
| CHECKOUT-05 | Phase 12 | Pending |
| PERF-01 | Phase 13 | Pending |
| PERF-02 | Phase 13 | Pending |
| PERF-03 | Phase 13 | Pending |
| PERF-04 | Phase 13 | Pending |
| PERF-05 | Phase 13 | Pending |
| LAUNCH-01 | Phase 14 | Pending |
| LAUNCH-02 | Phase 14 | Pending |
| LAUNCH-03 | Phase 14 | Pending |
| LAUNCH-04 | Phase 14 | Pending |

**Coverage:**

- v1 requirements: 71 total (14 categorías; el conteo previo de "58" en este doc era stale)
- Mapped to phases: 71 ✓
- Unmapped: 0 ✓

---
*Requirements defined: 2026-09-07*
*Last updated: 2026-09-07 after roadmap traceability mapping (71 v1 requirements across 14 phases)*
