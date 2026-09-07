# Kinelia Storefront

## What This Is

El tema de Shopify para Kinelia, marca DTC que vende medias de compresión en Argentina bajo el posicionamiento "piernas livianas". Es un tema custom construido sobre Dawn, optimizado por encima de todo para la tasa de conversión (CVR), con un sistema de landing / página de producto multi-avatar que permite vender el mismo producto bajo muchos ángulos (várices, adultos mayores, embarazadas, deportistas, cansancio por estar de pie, etc.) sin rehacer la página.

El tráfico llega desde anuncios de Meta y compra por impulso: mobile-first, carga rápida y buy box sin fricción son la prioridad.

## Core Value

Maximizar el CVR de la página de producto (sesiones de tráfico pago → órdenes). Cada decisión estructural del tema se justifica contra ese número.

## Business Context

- **Customer**: consumidor final argentino con pesadez / hinchazón / molestias en las piernas, comprando por impulso tras ver un anuncio en Meta.
- **Revenue model**: venta directa DTC de bundles de medias de compresión (~2,7 pares por orden), con pago online (MercadoPago) o contra entrega (COD).
- **Success metric**: CVR de la página de producto, sostenido por la regla CPA efectivo < margen (spend ÷ órdenes cobradas, nunca nominal).
- **Strategy notes**: `../../Mecanismo_y_Palancas_Facu.md`, `../../SereniVida_Playbook_Marketing.md`, `../../Estudio_Mercado_Dolor_LatAm.md`, y el `CLAUDE.md` del proyecto Kinelia (backend de datos).

## Requirements

### Validated

(None yet — ship to validate)

### Active

Etapa 1 — Tema de Shopify (milestone v1):

- [ ] Tema Shopify custom sobre Dawn, mobile-first, despojado a lo esencial
- [ ] Página de producto / landing optimizada para CVR: buy box con galería video-first, selector de bundle, selector de variantes talle × color con guía de talles, sticky Add-to-Cart en mobile, prueba social (rating + reviews), badges de oferta y ahorro, fila de confianza (garantía 90 días · envío · contra entrega)
- [ ] Sistema multi-avatar: templates JSON por ángulo con bloques intercambiables (headline, agitación del problema, mecanismo, testimonios, "para quién es") y bloques fijos (buy box, oferta, garantía, FAQ, footer)
- [ ] Al menos 1 template de avatar completo + 1 clon que demuestra que el sistema multi-avatar funciona
- [ ] Secciones de persuasión: agitación del problema, mecanismo UMP→UMS con apoyo visual, testimonios / UGC, comparación vs. media genérica (USP), guía de uso y talles, FAQ, bloque de garantía 90 días, CTA final
- [ ] Configuración de checkout híbrido: checkout nativo de Shopify + MercadoPago como gateway online + "pago contra entrega" como método de pago manual, con reglas por zona de envío
- [ ] Home resuelta: landing del producto/avatar destacado o redirect definido
- [ ] Páginas esenciales y legales AR: términos y condiciones, política de privacidad, cambios y devoluciones, botón de arrepentimiento, datos de la empresa, contacto / WhatsApp
- [ ] Presupuesto de performance: LCP < 2,5 s en mobile, JS mínimo sin bloquear render, lazy-load nativo, hero precargado
- [ ] Identidad visual aplicada según la guía de marca
- [ ] Workflow de desarrollo: Shopify CLI + este repo Git vinculado, preview local con `shopify theme dev`
- [ ] Lanzamiento: tema publicado en el dominio con contenido real y compra funcional (fase de handoff de credenciales y datos con el usuario)

### Out of Scope

Etapa 1 (diferido a etapas posteriores, registrado para no re-agregarlo):

- Pixel de Meta, CAPI, GA4 y eventos de conversión — Etapa 2
- Integración del script de atribución de Kinelia (`kinelia-atribucion.js`) + sincronización de carrito — Etapa 2 (se evalúa solo dejar el hook en `theme.liquid` si es trivial)
- App de reseñas (Judge.me / Loox) e importación de reviews — Etapa 2; la sección de reviews se maqueta con placeholder en Etapa 1
- Flujos de email (bienvenida, carrito abandonado, post-compra) — Etapa 2
- Experimentos de CVR, A/B testing y captación avanzada de datos — Etapa 3
- Headless / Hydrogen / React — descartado: Dawn + secciones es más mantenible para monoproducto → 2-3 productos y rinde mejor en Core Web Vitals sin esfuerzo
- Formulario COD propio fuera del checkout de Shopify — descartado: duplica el embudo, duplica eventos y ensucia la medición de CPA efectivo
- Backend de datos Supabase — vive en el repo `Kinelia` principal, fuera de este repo

## Context

- El repo `Shopify-Kinelia` está vacío: arranque limpio. Existe una tienda Shopify previa que se decidió **no arrastrar** ("sin vicios ni problemas heredados").
- Proyecto hermano: repo `Kinelia` con backend Supabase (esquemas raw/core/mart), Edge Functions (`shopify-webhook`, `mercadopago-webhook`, ingesta de Meta, `collect`, FX) y `web/kinelia-atribucion.js`. La Etapa 2 conecta el tema con ese sistema.
- Docs de negocio en `../../*.md` (proyecto Kinelia) — fuente de verdad del modelo operativo. Claves: bundle obligatorio, oferta estándar (descuento + garantía 90 días + contra entrega), tráfico Meta de impulso, disciplina de CPA efectivo, estructura de creativo Avatar → UMP → UMS → USP.
- Assets disponibles: logo e identidad, guía de marca, fotos de producto, fotos y video lifestyle. Faltan por proveer: los links de sitios de referencia y el archivo de la guía de marca.
- Variantes del producto: matriz talle × color.

## Constraints

- **Tech stack**: Shopify + Liquid + Dawn como base; HTML/CSS/JS nativo, sin frameworks frontend pesados — mantenibilidad a largo plazo y performance.
- **Performance**: LCP < 2,5 s en mobile y presupuesto de JS ajustado — el tráfico es mobile de impulso; cada 100 ms de latencia cuesta CVR.
- **Compatibility**: el tema debe escalar a 2-3 productos sin rehacerse — estructura multi-producto nativa desde el día 1.
- **Checkout**: un solo embudo (checkout nativo de Shopify) — no romper la medición de CPA efectivo con flujos paralelos.
- **Idioma**: español (AR) en todo el contenido de cara al usuario; código y comentarios en inglés salvo términos de dominio.
- **Dependencies**: cuenta Shopify, credenciales de MercadoPago en producción, datos de la razón social AR, DNS del dominio — provistos por el usuario en la fase de lanzamiento.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Tema base: Dawn despojado + secciones custom | Máxima documentación, el MCP de Shopify lo conoce a fondo, estable, mantenible para monoproducto → multiproducto | — Pending |
| Checkout único nativo de Shopify con COD como método de pago manual | Evita duplicar el embudo y ensuciar el CPA efectivo; menos superficie de desarrollo | — Pending |
| Sistema multi-avatar vía templates JSON + bloques de sección | Permite clonar la landing por ángulo sin rehacerla; nativo de Shopify | — Pending |
| Mecánica del bundle a decidir en research | Impacta CVR y la arquitectura de producto / atribución (producto único con quantity breaks vs. packs separados vs. app) | — Pending |
| Trabajo dividido en 3 etapas: tema → tracking/reviews/email → experimentos CVR | El usuario prioriza tener la base publicada y vendible antes de instrumentar | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-09-07 after initialization*
