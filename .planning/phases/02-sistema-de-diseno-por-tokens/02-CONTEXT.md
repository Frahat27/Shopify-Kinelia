# Phase 2: Sistema de diseño por tokens - Context

**Gathered:** 2026-09-08
**Status:** Ready for planning
**Source:** `Kinelia Brand Book.pdf` v1.0 (2026, Argentina) — provided by the developer, extracted verbatim below. The PDF is gitignored (heavy binary; the theme consumes the derived tokens, not the PDF).

<domain>
## Phase Boundary

Los tokens de la guía de marca (color, tipografía, espaciado) viven en un solo lugar y todo el CSS de componentes los consume; un rebrand es un cambio de tokens, no de componentes.

Scope (from ROADMAP Phase 2, Success Criteria):
1. Tokens de marca (color, tipografía, espaciado) en `settings_schema.json`, emitidos como custom properties CSS vía `css-variables.liquid`.
2. Cambiar un color o fuente de marca = solo tokens / theme settings, sin tocar CSS de componentes.
3. `base.css` con reset, escala tipográfica, colores, espaciado, botones y primitivas de formulario — todo derivado de tokens.
4. Locale `es-AR` (voseo) scaffoldeado; todo el texto de UI sale de archivos de locale.

Requirements: DESIGN-01, DESIGN-02, DESIGN-03, DESIGN-04.

**Not in this phase:** header/footer markup (Phase 3), buy box (Phase 5), the logo asset files (needed Phase 3), applying the identity to real sections (Phase 7+). This phase is the token *plumbing* + `base.css` primitives + locale scaffold only.

</domain>

<decisions>
## Implementation Decisions

### Color tokens (Brand Book p.6 "Color" — verbatim)

Primary palette:

| Token intent | Hex | Brand name | Role (from the manual) |
|---|---|---|---|
| `--color-primary` | `#0F6E56` | Verde azulado | Primario. Logo, titulares, bloques de cierre, **botones**. |
| `--color-primary-soft` | `#9FE1CB` | Verde suave | Fondos de bloque, badges, destacados. |
| `--color-accent` | `#D85A30` | Terracota | **Detalle. SOLO la bajada del logo y el precio.** Nunca fondos, botones, titulares, íconos ni líneas. |
| `--color-bg` | `#F1EFE8` | Crema | Fondo general. **Nunca blanco puro.** |
| `--color-text` | `#2C2C2A` | Casi negro | Texto principal. |
| `--color-text-muted` | `#5F5E5A` | Gris cálido | Texto secundario, epígrafes, notas. |

- **D-01 — La regla del terracota (LOCKED):** `--color-accent` es un token de uso restringido. `base.css` NO lo usa para botones, fondos, titulares, íconos ni bordes. Su único uso previsto en la tienda: el precio. Documentarlo como comentario en `css-variables.liquid` y en `base.css`.
- **D-02 — Contraste de texto (LOCKED):** cuerpo siempre `--color-text` o `--color-text-muted` sobre `--color-bg`. Prohibido en `base.css`: verde suave sobre crema como texto, gris sobre verde.
- **D-03 — Sin blanco puro:** no hay token `#FFFFFF`. Superficies elevadas (si hacen falta) = crema o un tinte muy leve; decidir el valor en el plan.

Support palette (Brand Book p.7 "Paleta de apoyo") — **solo contenido educativo** (guías, FAQ, comparativas, testimonios). Se incluyen como grupo secundario de tokens porque las Fases 7-8 los necesitan; `base.css` NO los usa por defecto.

| Token intent | Hex | Brand name | Role |
|---|---|---|---|
| `--color-edu` | `#24566E` | Azul profundo | Titulares/bloques de contenido educativo. |
| `--color-edu-soft` | `#CBDDE6` | Azul claro | Fondos de explicación, tablas, diagramas. |
| `--color-community` | `#54487A` | Violeta profundo | Testimonios y contenido de comunidad. |
| `--color-community-soft` | `#DDD7E8` | Violeta claro | Fondos de cita y bloques de reseña. |

- **D-04 (LOCKED):** un solo color de apoyo por pieza, nunca los dos juntos. Jerarquía: el apoyo entra después del verde y antes del terracota.

### Typography tokens (Brand Book p.8 "Tipografía" — verbatim)

- **D-05 — Familias (LOCKED):**
  - `--font-heading`: **DM Sans** — pesos 400 (Regular) y 500 (Medium). **Nunca Bold (700) en titulares largos.**
  - `--font-body`: **Inter** — pesos 400 (Regular), 500 (Medium), 600 (SemiBold, solo etiquetas y precios en contexto).
- **D-06 — Escala tipográfica (digital, del manual):**
  - Titular (DM Sans Medium 500): **40px** / print ref 34pt
  - Subtítulo (DM Sans Regular 400): **26px** / print ref 22pt
  - Cuerpo (Inter Regular 400): **16px mínimo** / print ref 12pt
  - Caption y legales (Inter Regular 400): **13px mínimo** / print ref 9pt
  - (Subtítulos de video Inter SemiBold 40px — fuera de scope web, anotado.)
- **D-07 — Legibilidad (LOCKED):** interlineado **1.5 como piso** en todo el cuerpo. Público 45-65 años, lee en celular con brillo bajo. `base.css`: `line-height: 1.5` mínimo en body/párrafos; **nunca `text-align: justify`**; **nunca `text-transform: uppercase`** salvo en una utility de etiqueta corta.
- **D-08 — Font hosting (PLANNER DECISION, recomendación):** self-host DM Sans + Inter en `assets/` (woff2, subset latin + latin-ext para acentos y ñ) con `font-display: swap` y `<link rel=preload>` para el peso de titular. Evita el hop a `fonts.gstatic.com` (presupuesto LCP < 2,5s, `.theme-check.yml` `RemoteAsset` está en recommended). Alternativa: Google Fonts `<link>` — más simple, peor para el presupuesto. El plan elige y lo registra en OVERRIDES.md / PERF-BUDGET.md.

### Spacing / radius / elevation

- **D-09 — Escala de espaciado (PLANNER DECISION — el Brand Book NO define una):** proponer una escala base-4 emitida como tokens: `--space-1..8` = 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px. El manual solo da reglas relativas ("área de respeto = ½ altura del isotipo", "separación ícono↔texto = ½ altura del ícono") — no contradicen una escala base-4. Confirmar en revisión del plan.
- **D-10 — Border radius (LOCKED, Brand Book p.17):** el sistema es **plano**. Íconos y bloques: redondeo de **2px** en puntas y vértices, nunca ángulos vivos… pero **badges = rectángulos rectos, sin redondeo**. Token `--radius: 2px` para superficies que lo lleven; `--radius-none: 0` explícito para badges. **Sin `border-radius` grande en botones/cards.**
- **D-11 — Elevación (LOCKED, Brand Book p.17):** **sin sombras, sin degradados.** Bloques planos de color y filetes de 1px. NO hay token de `box-shadow`; si el reset trae alguno, se anula. Separación por color/espacio, no por sombra.

### Botones (base.css primitives — Brand Book p.6/p.11/p.16)

- **D-12 (LOCKED):** botón primario = fondo `--color-primary`, texto crema. Sobre un bloque verde, el botón va en crema con texto verde. **Nunca terracota en un botón.** Sin sombra, sin gradiente, radius 2px o 0 (decidir en plan, consistente con D-10). Etiqueta en DM Sans Medium o Inter Medium (decidir). CTAs textuales viven en locale (ver D-15).

### Form primitives (base.css — DESIGN-03)

- **D-13 (PLANNER DECISION):** inputs/selects/labels planos: borde 1px `--color-text-muted` (o un token de borde derivado), fondo crema, foco visible (outline sólido, no sombra — D-11), radius consistente con D-10, tamaño de texto ≥ 16px (evita el zoom de iOS y respeta D-06). Sin librería de formularios.

### Locale es-AR (Brand Book, transversal — DESIGN-04)

- **D-14 — `locales/es.json` es el default del theme** (no `en.default.json`). Voseo rioplatense en TODO el texto de UI. Scaffold: `locales/es.default.json` (storefront) + `locales/es.default.schema.json` (theme editor). El plan decide si además se deja un `en.json` mínimo o no (Skeleton trae `en.default.json`).
- **D-15 — CTAs y copy aprobado (del manual, van al locale):**
  - CTAs: `"Quiero las mías"`, `"Ver talles y precio"`, `"Elegir mi talle"`, `"Comprar"`, `"Comprar ahora"`, `"Pedir por WhatsApp"`.
  - Promesa / frase raíz: `"Llegá a la noche con las piernas descansadas."`
  - Precio de referencia (placeholder, no real): `$24.900` (un par), `$42.000` (pack x2).
  - **Leyenda legal obligatoria** (va en packaging, ficha de producto y todo anuncio pago — sembrar como string de locale reusable): `"Producto de uso cotidiano para el confort de las piernas. No reemplaza el tratamiento ni el diagnóstico médico. Ante várices, trombosis, diabetes o embarazo, consultá a tu médico antes de usarlo."`
  - Tono: "vos" nunca "usted"; frases cortas; sin inglés; sin tecnicismos; sin mayúsculas para enfatizar; sin signos de exclamación en cadena.
- **D-16 — Claims prohibidos (Brand Book p.10, LOCKED para todo copy futuro):** nunca "cura / trata / previene / elimina" várices/trombosis/patologías; nunca "recomendado por médicos" sin respaldo; nunca "resultados garantizados" ni plazos; nunca urgencia falsa (stock inventado, contadores, descuentos que no existen). Anotar en un doc de marca del repo para que las fases de copy lo hereden.

### settings_schema.json ↔ css-variables.liquid architecture (DESIGN-01/02)

- **D-17 (LOCKED shape):** `config/settings_schema.json` gana un grupo `Colores` y un grupo `Tipografía` con settings tuneables desde el theme editor. `snippets/css-variables.liquid` lee esos settings y emite `:root { --color-*: {{ settings.x }}; ... }` en el `<head>` (vía `theme.liquid` en Phase 3 — en esta fase se crea el snippet y se prueba su render de forma aislada o con un include temporal). `base.css` y todo CSS de componente **solo** referencia `var(--*)`, nunca un hex literal. Un checker (extensión de `scripts/check-allowlist.mjs` o script nuevo) puede fallar si aparece un hex de 3/6 dígitos fuera de `css-variables.liquid` / `settings_schema.json`.
- **D-18:** `font_picker` de Shopify vs. familias fijas self-hosted — si se self-hostea (D-08), los settings de fuente son un `select` con las 2 familias de marca (no el `font_picker` que asume Shopify Font Library). Decidir en el plan.

### Claude's Discretion

- Nombres exactos de tokens (los de arriba son intención, no contrato).
- Valor de superficie elevada (D-03), escala de espaciado exacta (D-09), radius de botón 2px vs 0 (D-12), forma de los form primitives (D-13), estructura interna de `base.css` (un archivo vs. `@layer`), mecanismo del hex-checker (D-17).
- Si se conserva un `en.json` mínimo (D-14).

</decisions>

<specifics>
## Specific Ideas

- El sistema visual de Kinelia es deliberadamente **austero**: plano, sin sombras, sin degradados, radius mínimo (2px) o nulo, crema como fondo (nunca blanco), verde que estructura, terracota reservado al precio. "La confianza la construye el verde." Cualquier default del reset que agregue sombras/gradientes/esquinas redondeadas se anula.
- Público: 45-65 años, mobile, a menudo cansados y a contraluz → legibilidad es requisito, no preferencia (cuerpo ≥16px, interlineado ≥1.5, sin justificar, sin texto claro sobre foto).
- La paleta de apoyo (azul/violeta) es para "cuando enseñamos, no cuando vendemos" — tokens presentes pero `base.css` no los toca.

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

- `Kinelia Brand Book.pdf` (repo root, gitignored) — extracción verbatim de color/tipografía/reglas está EN ESTE ARCHIVO (`02-CONTEXT.md`), secciones Color tokens / Typography tokens / D-10 / D-11 / D-15 / D-16. No hace falta re-abrir el PDF salvo para las páginas de logo (04-05), aplicaciones (09) y packaging (20), que no tocan esta fase.
- `.planning/ROADMAP.md` §"Phase 2" — Success Criteria (contrato de la fase).
- `.planning/REQUIREMENTS.md` — DESIGN-01..04.
- `ALLOWLIST.md` + `scripts/check-allowlist.mjs` — el contrato de "reducir por no referenciar" y el patrón de checker ejecutable (Phase 1).
- `OVERRIDES.md` — cualquier divergencia de Skeleton (fuentes self-host, `es` como locale default, settings_schema) se registra acá en el mismo PR.
- `docs/PERF-BUDGET.md` — LCP < 2,5s; la decisión de font-hosting (D-08) se justifica contra esto.
- `.theme-check.yml` — `theme-check:recommended` incluye `RemoteAsset` y `AssetSizeJavaScript`; self-hosting de fuentes las mantiene verdes.
- Skeleton base: `config/settings_schema.json`, `snippets/css-variables.liquid` (si existe), `assets/base.css` / `assets/critical.css`, `locales/en.default.json` — leer el estado actual antes de modificar.

</canonical_refs>

<open_questions>
## Open Questions (flag in plan review if the planner's default is wrong)

1. Escala de espaciado base-4 exacta (D-09) — ¿ok `4/8/12/16/24/32/48/64`?
2. Self-host de fuentes (D-08) vs Google Fonts `<link>` — recomendado self-host por presupuesto; confirmar.
3. ¿Se conserva un `en.json` mínimo o el theme es es-AR únicamente (D-14)?
4. Radius de botón: 2px (consistente con íconos) vs 0 (consistente con badges) — D-12.
5. ¿El hex-checker (D-17) entra en esta fase o se difiere? (recomendado: entra, es barato y protege DESIGN-02.)

</open_questions>
