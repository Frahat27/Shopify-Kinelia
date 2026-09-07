# Roadmap: Kinelia Storefront

## Overview

Kinelia Storefront se construye de abajo hacia arriba. Primero la base del tema (decision de tema base, workflow git + Shopify CLI, topologia STAGING/LIVE, linting, harness de performance), despues el sistema de diseno por tokens y el shell del documento con los seams no-op de Etapa 2, y recien entonces el modelo de datos (producto heroe + metafields + metaobjects de contenido). Sobre esa base se levanta el buy box video-first, y el bundle -- con su spike de mecanica gateado ANTES de la UI del selector. En paralelo corren el stack de persuasion variable (metaobject-driven) y la prueba social. El espinazo de secciones fijas se ensambla y se bloquea antes de cablear el sistema multi-avatar (1 template de referencia + 1 clon, seleccionados por `?view=`). Home y paginas legales AR corren en paralelo con el trabajo de secciones. El cierre son tres pasadas transversales: configuracion de checkout hibrido (MercadoPago + COD manual gateado por zona + tag cod/prepaid), presupuesto de performance sobre templates de avatar reales, y lanzamiento con handoff de credenciales y compra de prueba real.

Milestone: Etapa 1 -- Tema de Shopify publicado y vendible. Etapa 2 (instrumentacion) y Etapa 3 (experimentos CVR) estan rastreadas en REQUIREMENTS.md, fuera de este roadmap.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

- [ ] **Phase 1: Repo, tema base y workflow foundation** - Base del tema decidida y registrada, git + Shopify CLI, topologia STAGING/LIVE, Theme Check y harness de performance
- [ ] **Phase 2: Sistema de diseno por tokens** - Tokens de marca en un solo lugar, base.css derivado de tokens, locale es-AR scaffoldeado
- [ ] **Phase 3: Layout shell + seams de Etapa 2** - theme.liquid, header/footer minimos, bus de eventos DOM y hooks no-op de medicion diferida
- [ ] **Phase 4: Modelo de datos de producto y contenido** - Producto heroe talle x color, metafields, metaobjects y un avatar completo sembrado
- [ ] **Phase 5: Buy box core** - Galeria video-first, selector talle x color con guia de talles, precio + oferta, cart attributes de atribucion
- [ ] **Phase 6: Bundle spike + selector + carrito + sticky ATC** - Mecanica del bundle resuelta por spike y verificada en checkout, selector de packs, carrito drawer, sticky ATC
- [ ] **Phase 7: Stack de persuasion variable** - Secciones avatar-hero / agitacion / mecanismo / para-quien renderizando desde un metaobject avatar
- [ ] **Phase 8: Prueba social + USP** - Testimonios filtrables por avatar, placeholders DOM de reviews para Etapa 2, comparacion vs media generica
- [ ] **Phase 9: Espinazo fijo -- garantia + guia + FAQ + CTA** - Stack FIJO ensamblado y bloqueado, verificado sin copy por template
- [ ] **Phase 10: Wiring multi-avatar** - product.json canonico + template de referencia + clon, seleccion por ?view=, lint del espinazo, runbook de operador, allowlist de claims
- [ ] **Phase 11: Home + paginas legales AR** - Home resuelta, T&C / privacidad / cambios y devoluciones / datos de empresa, Boton de Arrepentimiento, contacto WhatsApp, 404 + busqueda
- [ ] **Phase 12: Configuracion de checkout hibrido** - MercadoPago online + COD manual gateado por zona, tag cod/prepaid via Flow, cifra de margen documentada
- [ ] **Phase 13: Pasada de performance** - LCP < 2,5 s mobile en un template de avatar real, presupuesto de JS, imagenes responsive, QA cross-device
- [ ] **Phase 14: Lanzamiento / handoff** - Tema publicado en el dominio con contenido real y compra de prueba COD + prepago de punta a punta

## Phase Details

### Phase 1: Repo, tema base y workflow foundation
**Goal**: El tema tiene una base elegida y registrada, vive en git con preview local, y estan la topologia STAGING/LIVE, el linting y el harness de performance para trabajar sin exponer un funnel roto a trafico pago.
**Depends on**: Nothing (first phase)
**Requirements**: FOUND-01, FOUND-02, FOUND-03, FOUND-04, FOUND-05, FOUND-06, FOUND-07
**Success Criteria** (what must be TRUE):
  1. `shopify theme dev` levanta el tema localmente contra una dev store desde este repo git
  2. La decision de tema base (Skeleton vs Horizon vs Dawn) esta tomada con tradeoffs escritos y PROJECT.md Key Decisions actualizado, reemplazando la entrada "Dawn despojado"
  3. El tema base quedo reducido por allowlist de "no renderizar" (sin borrar modulos de carrito ni de accesibilidad): el cart drawer y predictive search funcionan, Theme Check corre limpio y Lighthouse a11y >= 95
  4. Existe remote `upstream` al tema base y `OVERRIDES.md` documenta cada divergencia; hay temas STAGING (no publicado) vs LIVE con checklist de release y git como fuente de verdad del codigo
  5. Theme Check corre localmente y en cada PR (`theme-check-action`); el harness de presupuesto de performance mide Lighthouse mobile sobre un template de referencia
**Plans**: TBD
**Research hint**: yes -- la decision de tema base necesita verificacion en vivo contra el MCP de Shopify / shopify.dev: profundidad de nesting de theme-blocks en Skeleton/Horizon, si `content_for` blocks y bloques "Get metaobject(s)" son GA, comportamiento de `?view=` sobre la base elegida, cap de variantes en el plan tier.

### Phase 2: Sistema de diseno por tokens
**Goal**: Los tokens de la guia de marca viven en un solo lugar y todo el CSS de componentes los consume; un rebrand es un cambio de tokens, no de componentes.
**Depends on**: Phase 1
**Requirements**: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04
**Success Criteria** (what must be TRUE):
  1. Los tokens de marca (color, tipografia, espaciado) estan en `settings_schema.json` y se emiten como custom properties CSS via `css-variables.liquid`
  2. Cambiar un color o una fuente de marca se hace solo en tokens / theme settings, sin tocar CSS de componentes
  3. Existe `base.css` con reset, escala tipografica, colores, espaciado, botones y primitivas de formulario, todo derivado de tokens
  4. El locale es-AR (voseo) esta scaffoldeado y todo el texto de UI sale de archivos de locale
**Plans**: TBD
**UI hint**: yes

### Phase 3: Layout shell + seams de Etapa 2
**Goal**: El shell del documento, el header/footer minimos y todos los hooks no-op de Etapa 2 existen como ~1 linea cada uno, para que la medicion diferida se conecte sin refactor.
**Depends on**: Phase 2
**Requirements**: SHELL-01, SHELL-02, SHELL-03, SHELL-04
**Success Criteria** (what must be TRUE):
  1. `theme.liquid` renderiza el shell con `css-variables.liquid` (tokens) y `analytics-hooks.liquid` (no-op, seam de Etapa 2)
  2. El header es minimo y el footer tiene links legales AR, afordancia de WhatsApp y bloque de newsletter deshabilitado
  3. Existe un bus de eventos DOM (`variant:changed`, `product:added`, `cart:updated`) listo para el sticky ATC y para consumidores de Etapa 2
  4. `ETAPA-2-SEAMS.md` documenta el contrato de cart attributes (`visitante_id`, `utm_*`, `view`) y de eventos para el trabajo de medicion diferido
**Plans**: TBD
**UI hint**: yes

### Phase 4: Modelo de datos de producto y contenido
**Goal**: El producto heroe, sus metafields y los metaobjects de contenido existen con un avatar completo sembrado; ninguna copy de marketing vive en codigo.
**Depends on**: Phase 3
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, DATA-05
**Success Criteria** (what must be TRUE):
  1. Existe un unico producto heroe con matriz de variantes talle x color, bajo el cap de variantes del plan
  2. Estan definidos los metafields de producto necesarios (hechos del producto, puntero de avatar por defecto)
  3. Estan definidos los metaobjects `avatar`, `oferta`, `testimonio`, `faq_item`, `size_chart_row` con campos tipados
  4. El contenido de un avatar completo + la entrada `oferta` estan cargados como semilla
  5. Un chequeo confirma que ninguna copy de marketing vive en archivos `.liquid`: toda es editable desde el editor de tema o metaobjects

### Phase 5: Buy box core
**Goal**: El comprador ve la galeria video-first y puede elegir talle/color con precio y oferta visibles, sobre la superficie de mayor palanca de CVR -- sin bundle todavia.
**Depends on**: Phase 4
**Requirements**: BUY-01, BUY-02, BUY-03, BUY-04, BUY-06, BUY-07
**Success Criteria** (what must be TRUE):
  1. El comprador ve una galeria de medios video-first donde la imagen poster es el elemento LCP y el video hace lazy-init
  2. El comprador selecciona talle y color; las combinaciones sin stock aparecen deshabilitadas y hay una guia de talles en drawer sin salir de la pagina
  3. El buy box muestra precio, precio ancla tachado y badge de ahorro segun la `oferta`
  4. El buy box muestra la fila de confianza (garantia 90 dias / envio / paga al recibir) y la reassurance de pago (marcas de MercadoPago + "tambien podes pagar al recibir")
  5. Al agregar al carrito se escriben `visitante_id` y parametros UTM como cart attributes con read-modify-write, sin pisar attributes existentes
**Plans**: TBD
**UI hint**: yes
**Parallel with**: Phases 7-8 (dependen solo de 2 y 4)

### Phase 6: Bundle spike + selector + carrito + sticky ATC
**Goal**: La mecanica del bundle esta resuelta por un spike y verificada en el checkout, y el selector de packs es el control principal del buy box, con carrito drawer y barra sticky de Add-to-Cart.
**Depends on**: Phase 5
**Requirements**: BUNDLE-01, BUNDLE-02, BUNDLE-03, BUNDLE-04, BUNDLE-05, BUNDLE-06, BUY-05
**Success Criteria** (what must be TRUE):
  1. Un spike resolvio la mecanica del bundle (packs como variante vs Bundles nativo vs descuento automatico) y la pregunta "un talle/color por pack vs por par" con el usuario, ANTES de construir la UI del selector
  2. El selector de bundle es el control principal del buy box: 2/3/4 pares, tier del medio marcado como "mas elegido", precio por par visible
  3. Para cada tier, un test end-to-end verifica que el total en el checkout = el precio prometido en la landing
  4. El carrito abre como drawer y refleja el pack elegido con su propiedad de line item; si hay umbral de envio gratis el mensaje es honesto y consistente con la oferta
  5. En mobile, la barra sticky de Add-to-Cart refleja la seleccion actual y agrega al carrito; la forma de la orden (line items / propiedades) esta documentada para el equipo de backend
**Plans**: TBD
**Research hint**: yes -- mecanica de precio checkout-safe (descuento automatico vs Shopify Function vs variante multipack) necesita verificacion; la pregunta abierta "un talle/color por pack vs por par" decide variant-packs vs app mix-and-match y debe resolverse con el usuario antes de la UI.
**UI hint**: yes
**Parallel with**: Phases 7-8

### Phase 7: Stack de persuasion variable
**Goal**: Las secciones de persuasion por avatar renderizan desde un unico metaobject `avatar` sin copy propia, y solo cargan los medios del avatar actual.
**Depends on**: Phase 4 (y Phase 2)
**Requirements**: PERS-01, PERS-02, PERS-03, PERS-04
**Success Criteria** (what must be TRUE):
  1. Las secciones `avatar-hero`, `problem-agitation`, `mechanism` (diagrama estatico UMP->UMS) y `para-quien` renderizan desde un unico metaobject `avatar` y no contienen copy propia
  2. El headline, el hero y la primera linea de agitacion de cada avatar mantienen continuidad con el creativo ganador (ad-scent)
  3. Existen theme blocks reutilizables (`headline`, `media-with-text`, `trust-row`) usados por varias secciones
  4. Solo se cargan los medios del avatar actual, no los de todos los avatares
**Plans**: TBD
**UI hint**: yes
**Parallel with**: Phases 5-6

### Phase 8: Prueba social + USP
**Goal**: Testimonios filtrables por avatar, placeholders DOM estables de reviews para Etapa 2, y la seccion de comparacion que comunica el USP.
**Depends on**: Phase 7
**Requirements**: PROOF-01, PROOF-02, PROOF-03
**Success Criteria** (what must be TRUE):
  1. La seccion de testimonios muestra testimonios con filtro por tag de avatar desde metaobjects
  2. Existe una seccion de reviews con slot `@app` + fallback estatico, y un slot de rating en el buy box, como placeholders DOM estables para Etapa 2
  3. Existe una seccion de comparacion vs. media generica que comunica el USP
**Plans**: TBD
**UI hint**: yes
**Parallel with**: Phase 6

### Phase 9: Espinazo fijo -- garantia + guia + FAQ + CTA
**Goal**: El espinazo de secciones fijas esta ensamblado y bloqueado, verificado sin copy por template, antes de que empiece el clonado de avatares.
**Depends on**: Phase 6, Phase 8
**Requirements**: FIXED-01, FIXED-02, FIXED-03, FIXED-04, FIXED-05
**Success Criteria** (what must be TRUE):
  1. Existe un bloque de garantia de 90 dias con reversion de riesgo
  2. Existe una seccion de como usar + guia de talles
  3. Existe una FAQ (COD, envios, talles, devoluciones) que renderiza desde metaobjects
  4. Existe un CTA final que devuelve al buy box
  5. La composicion del stack FIJO esta bloqueada y verificada: ninguna seccion fija lleva copy por template
**Plans**: TBD
**UI hint**: yes

### Phase 10: Wiring multi-avatar
**Goal**: El sistema multi-avatar funciona de punta a punta: un template de referencia completo + un clon, seleccionados por `?view=`, con lint del espinazo, runbook de operador y allowlist de claims de salud.
**Depends on**: Phase 7, Phase 8, Phase 9
**Requirements**: AVATAR-01, AVATAR-02, AVATAR-03, AVATAR-04, AVATAR-05, AVATAR-06, AVATAR-07
**Success Criteria** (what must be TRUE):
  1. Existe un `product.json` canonico con avatar por defecto via metafield, un `product.avatar-varices.json` completo y un segundo template clon que demuestra el sistema
  2. El parametro `?view={slug}` selecciona el template de avatar correcto sobre el tema base elegido, verificado con una URL de anuncio real de Meta
  3. Las paginas de avatar casi duplicadas tienen postura canonica/robots definida (recomendado `noindex,follow`, trafico 100% pago)
  4. Un lint verifica que todo `product.avatar-*.json` incluye el espinazo de secciones fijas requerido
  5. Existe un runbook para que un operador no-dev clone un avatar (template + metaobject + URL) en 15-30 min, y una allowlist/blocklist de frases para compliance de claims de salud de Meta
**Plans**: TBD
**UI hint**: yes

### Phase 11: Home + paginas legales AR
**Goal**: La home esta resuelta y todas las paginas legales/esenciales AR existen y son consistentes con la oferta.
**Depends on**: Phase 3
**Requirements**: PAGES-01, PAGES-02, PAGES-03, PAGES-04, PAGES-05
**Success Criteria** (what must be TRUE):
  1. La home esta resuelta (landing del avatar destacado o redirect) con la decision documentada
  2. Existen las paginas legales AR: T&C, politica de privacidad, cambios y devoluciones, datos de la empresa
  3. El Boton de Arrepentimiento es accesible desde la home sin login y no esta oculto por CSS, conforme a la normativa vigente
  4. Existe una pagina de contacto con WhatsApp
  5. Existen 404 y busqueda minimos funcionales
**Plans**: TBD
**UI hint**: yes
**Parallel with**: Phases 7-10

### Phase 12: Configuracion de checkout hibrido
**Goal**: MercadoPago online y COD manual gateado por zona funcionan en el checkout nativo, cada orden queda etiquetada cod/prepaid, y el margen real esta documentado para la regla CPA efectivo < margen.
**Depends on**: Phase 1
**Requirements**: CHECKOUT-01, CHECKOUT-02, CHECKOUT-03, CHECKOUT-04, CHECKOUT-05
**Success Criteria** (what must be TRUE):
  1. MercadoPago esta configurado como gateway online (preferentemente transparente/on-site) en el checkout nativo
  2. "Pago contra entrega" existe como metodo de pago manual, gateado por zona de envio para no mostrarse en regiones no servidas
  3. Shopify Flow etiqueta cada orden como `cod` o `prepaid`
  4. Esta documentada la cifra de margen incluyendo fee de terceros de Shopify + gateway + IVA, para la regla CPA efectivo < margen
  5. El checkout usa exclusivamente Checkout Extensibility (nada de `checkout.liquid` ni Additional Scripts)
**Plans**: TBD
**Research hint**: yes -- app exacta de MercadoPago en AR 2026 y sus capacidades (transparente vs redirect, display de cuotas, tickets de efectivo), disponibilidad de Shopify Payments para entidades AR (se cree que no -> aplica fee de terceros), y eleccion de app de payment-customization basada en Functions para el geo-gating de COD; resolver con credenciales de produccion.
**Parallel with**: Phases 5-11 (config solo de admin; puede empezar apenas exista una dev store y se finaliza con credenciales de produccion en el lanzamiento)

### Phase 13: Pasada de performance
**Goal**: Un template de avatar real cumple el presupuesto de performance en mobile con throttling y pasa QA cross-device.
**Depends on**: Phase 10, Phase 11
**Requirements**: PERF-01, PERF-02, PERF-03, PERF-04, PERF-05
**Success Criteria** (what must be TRUE):
  1. Un template de avatar cargado en mobile con throttling tiene LCP < 2,5 s y CLS < 0,1
  2. El JS no bloquea el render y se respeta el presupuesto de JS definido
  3. La imagen del hero se precarga con `fetchpriority=high` y dimensiones explicitas; el video usa `preload="none"` y lazy-init
  4. Todas las imagenes usan parametros del CDN de Shopify e imagenes responsive con lazy-load nativo
  5. QA cross-device completado (iOS Safari, Android Chrome, desktop)
**Plans**: TBD

### Phase 14: Lanzamiento / handoff
**Goal**: El tema esta publicado en el dominio con contenido real y una compra real de prueba (COD y prepago) se completa de punta a punta.
**Depends on**: Phase 12, Phase 13
**Requirements**: LAUNCH-01, LAUNCH-02, LAUNCH-03, LAUNCH-04
**Success Criteria** (what must be TRUE):
  1. El tema esta publicado en el dominio con copy y fotos finales
  2. Handoff completado: credenciales de MercadoPago produccion, datos de razon social AR, DNS del dominio
  3. Se recorrio la checklist "parece terminado pero no lo esta" antes de publicar
  4. Una compra real de prueba COD y una prepago se completan de punta a punta

## Progress

**Execution Order:**
Critical path: 1 -> 2 -> 3 -> 4 -> 5 -> 6 -> 9 -> 10 -> 13 -> 14.
- Phases 7-8 (persuasion + prueba social) corren en paralelo con 5-6 -- dependen solo de 2 y 4.
- Phase 11 (home + legales) corre en paralelo con 7-10 -- depende solo de 3.
- Phase 12 (checkout, solo admin) puede empezar apenas exista una dev store (post Phase 1) y se finaliza con credenciales de produccion en el lanzamiento.
- Phase 13 (performance) se corre despues de que existan los templates de avatar y las paginas reales (10, 11).

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Repo, tema base y workflow foundation | 0/TBD | Not started | - |
| 2. Sistema de diseno por tokens | 0/TBD | Not started | - |
| 3. Layout shell + seams de Etapa 2 | 0/TBD | Not started | - |
| 4. Modelo de datos de producto y contenido | 0/TBD | Not started | - |
| 5. Buy box core | 0/TBD | Not started | - |
| 6. Bundle spike + selector + carrito + sticky ATC | 0/TBD | Not started | - |
| 7. Stack de persuasion variable | 0/TBD | Not started | - |
| 8. Prueba social + USP | 0/TBD | Not started | - |
| 9. Espinazo fijo -- garantia + guia + FAQ + CTA | 0/TBD | Not started | - |
| 10. Wiring multi-avatar | 0/TBD | Not started | - |
| 11. Home + paginas legales AR | 0/TBD | Not started | - |
| 12. Configuracion de checkout hibrido | 0/TBD | Not started | - |
| 13. Pasada de performance | 0/TBD | Not started | - |
| 14. Lanzamiento / handoff | 0/TBD | Not started | - |
