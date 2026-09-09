# Contrato de copy — Kinelia Storefront

Este documento gobierna **todo string de cara al usuario** que este tema va a mostrar
alguna vez. Existe porque las fases de copy —el contenido de la landing en la Fase 7, los
ángulos de avatar en la Fase 10, las páginas legales y de home en la Fase 11— las va a
escribir alguien que no leyó el Brand Book. Las reglas de acá son heredadas: se cumplen sin
volver a discutirlas.

La copy aprobada vive como claves de locale bajo el namespace `kinelia` en
`locales/es.default.json`. `scripts/check-tokens.mjs` es la copia ejecutada de este
contrato (falla si el idioma default deja de ser español o si una clave de copy aprobada
desaparece); este documento es su explicación humana.

Qué fase cambia qué:

| Regla / valor | Quién lo puede cambiar |
|---------------|-----------------------|
| Voz y tono | Nadie sin pasar por el Brand Book (D-15) |
| CTAs aprobados | Se agrega uno nuevo al locale **y** a este documento en la misma pull request |
| Promesa raíz | Fijada por el Brand Book (D-15) |
| Leyenda legal | Fijada por el Brand Book (D-15); obligatoria en packaging, ficha de producto y todo anuncio pago |
| Claims prohibidos | LOCKED (D-16) — no se relajan |

---

## Voz

**Español rioplatense, voseo.** La segunda persona es **vos**, nunca "usted". Los
imperativos van en forma voseo con el acento en la última sílaba: *elegí, mirá, sumá,
seguí, consultá, pedí*.

- Frases cortas.
- Sin palabras en inglés.
- Sin tecnicismos ni jerga médica.
- Sin mayúsculas para enfatizar.
- Sin signos de exclamación en cadena.

**Por qué.** La persona que lee tiene entre 45 y 65 años, está en el celular, muchas veces
cansada y a contraluz. Una tienda que suena a publicidad de farmacia —mayúsculas,
promesas, urgencia— la pierde. La confianza la construye el tono sobrio, no el volumen.

---

## Calls to action aprobados

Los seis, verbatim del Brand Book (D-15). Cada uno vive en una clave de locale y **se
referencia por clave, nunca se reescribe dentro de un template**. Un CTA nuevo se agrega a
`locales/es.default.json` y a esta tabla en la misma pull request.

| Texto (verbatim) | Clave de locale |
|------------------|-----------------|
| Quiero las mías | `kinelia.cta.quiero_las_mias` |
| Ver talles y precio | `kinelia.cta.ver_talles_precio` |
| Elegir mi talle | `kinelia.cta.elegir_talle` |
| Comprar | `kinelia.cta.comprar` |
| Comprar ahora | `kinelia.cta.comprar_ahora` |
| Pedir por WhatsApp | `kinelia.cta.pedir_whatsapp` |

---

## Promesa raíz

Verbatim, en una sola clave:

> Llegá a la noche con las piernas descansadas.

Clave: `kinelia.promesa_raiz`.

---

## Leyenda legal obligatoria

Verbatim, en una sola clave plana:

> Producto de uso cotidiano para el confort de las piernas. No reemplaza el tratamiento ni el diagnóstico médico. Ante várices, trombosis, diabetes o embarazo, consultá a tu médico antes de usarlo.

Clave: `kinelia.legal_disclaimer`.

**Dónde es obligatoria:** en el packaging, en la ficha de producto y en **todo anuncio
pago**.

**Por qué existe una sola vez como clave de locale:** para que no pueda divergir entre
superficies. Todo lo que la necesita la referencia por clave.

**Por qué es una clave plana y no una clave `_html`:** las claves de locale sin sufijo se
auto-escapan al renderizar; solo las claves con sufijo `_html` renderizan markup. La
leyenda es prosa plana, así que su clave es plana y el escape queda puesto. Renombrar la
clave a `kinelia.legal_disclaimer_html` haría fallar `scripts/check-tokens.mjs`.

---

## Claims prohibidos (D-16, LOCKED)

Kinelia vende un producto **adyacente a la salud en Argentina**. Lo de abajo no son
preferencias de estilo: son límites que ninguna copy futura puede cruzar.

| Prohibición | Razón |
|-------------|-------|
| Nunca afirmar que el producto **cura, trata, previene o elimina** várices, trombosis ni ninguna patología | Es un producto de confort, no un tratamiento. Un claim terapéutico sin respaldo es publicidad engañosa de un producto sanitario. |
| Nunca decir que está **"recomendado por médicos"** (ni equivalentes) sin respaldo documentado | Una recomendación profesional afirmada y no documentada es un claim falso. |
| Nunca prometer **resultados garantizados** ni un plazo ("en X días", "resultados asegurados") | El efecto es subjetivo y variable; garantizarlo es engañoso. |
| Nunca fabricar **urgencia falsa**: stock inventado, contadores de tiempo, descuentos que no existen | Manipula la decisión de compra y ensucia la medición del CPA efectivo con presión artificial. |

---

## Pares de color y tipografía que son decisiones de copy (D-02)

Cuando una fase de copy decide **dónde** va un titular o un texto, está tomando una
decisión de contraste. Referencia el archivo de tokens (`snippets/css-variables.liquid`) y
respetá estas prohibiciones:

- Nunca texto claro sobre una foto.
- Nunca el verde suave (`--color-primary-soft`) como texto de cuerpo sobre el fondo crema
  (`--color-bg`).
- Nunca gris (`--color-text-muted`) sobre verde.

El cuerpo siempre es `--color-text` o `--color-text-muted` sobre `--color-bg`.

---

## Cómo se agrega copy

1. Agregá el string a `locales/es.default.json`.
2. Referencialo por clave desde el template: `{{ 'mi.clave' | t }}`.
3. Si es copy de marca (un CTA, una promesa, una leyenda), agregalo también a este
   documento en la misma pull request.

**Nunca escribas un string de cara al usuario dentro de un template Liquid.** Vive en el
locale y se referencia por clave.
