/*
 * ----------------------------------------------------------------
 * check-seams.mjs — copia EJECUTABLE del contrato SHELL-04
 * ----------------------------------------------------------------
 *
 * "La Etapa 2 se conecta sin refactor" solo vale si la forma de la conexion
 * esta escrita antes de que alguien construya contra ella. Esa forma vive en
 * ETAPA-2-SEAMS.md; este script es su copia ejecutable, del mismo modo que
 * check-allowlist.mjs es la copia de la superficie de render y check-tokens.mjs
 * la de DESIGN-02. ETAPA-2-SEAMS.md es su explicacion humana.
 *
 * El vocabulario del contrato son tres listas de tres duenos distintos:
 *   - los cinco nombres del bus DOM interno del tema, publicados en
 *     assets/events.js (array NAMES) — el modulo es la fuente, este checker los
 *     LEE de ahi, nunca guarda su propia copia;
 *   - los ocho tipos de evento que acepta el endpoint /collect del repo hermano;
 *   - los siete atributos de carrito que la orden tiene que llevar.
 *
 * Falla (exit != 0) cuando:
 *   - no se encuentra ni se parsea el array NAMES en el modulo de eventos, o
 *     viene vacio (backstop de scan vacio: un scan sin nada no reporta exito);
 *   - un nombre publicado del bus no aparece en ETAPA-2-SEAMS.md en formato de
 *     codigo (envuelto en el delimitador inline de markdown);
 *   - uno de los ocho tipos de evento del embudo no aparece en el documento en
 *     formato de codigo;
 *   - uno de los siete atributos de carrito no aparece en el documento en
 *     formato de codigo;
 *   - el atributo del hook de la oferta no aparece en el documento;
 *   - el documento no existe, o es mas corto que un piso que ninguna
 *     transcripcion real podria estar por debajo.
 *
 * El formato de codigo es deliberado: el slug de vista del avatar es una palabra
 * comun que aparece en prosa por todo un documento sobre vistas, y solo la
 * ocurrencia formateada como codigo es el contrato.
 *
 * Node standard library unicamente. Uso: node scripts/check-seams.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

// ---------------------------------------------------------------- contrato

// Rutas relativas a la raiz del repo.
const DOC = "ETAPA-2-SEAMS.md";
const MODULE = "assets/events.js";

// Piso de longitud del documento: por debajo de esto no es la transcripcion que
// SHELL-04 exige, es un placeholder.
const DOC_MIN_CHARS = 3000;

// Los ocho tipos de evento que acepta el endpoint /collect del repo hermano
// (../../Kinelia/supabase/functions/collect/index.ts). Cualquier otro tipo se
// descarta en silencio: la Etapa 2 no debe inventar un noveno.
export const FUNNEL_EVENT_TYPES = [
  "view_lp",
  "scroll_50",
  "scroll_75",
  "ver_oferta",
  "add_to_cart",
  "inicio_checkout",
  "paso_checkout",
  "compra",
];

// Los siete atributos de carrito del contrato. El script de atribucion hermano
// escribe los primeros seis hoy; el septimo (view) lo agrega el contrato del
// tema y su dueno lo cierra la Fase 10.
export const CART_ATTRIBUTES = [
  "visitante_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "view",
];

// El hook que el script de atribucion observa con un IntersectionObserver para
// emitir el evento de ver la oferta. La Fase 5 lo coloca sobre el bloque de
// precio del buy box; el documento solo registra que debe existir.
export const OFFER_HOOK_ATTR = 'data-kinelia="oferta"';

// ---------------------------------------------------------------- helpers

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

// Delimitador inline de markdown. Se arma por codigo para no meterlo literal en
// las cadenas de este archivo.
const TICK = String.fromCharCode(96);

function inCodeFormatting(doc, token) {
  return doc.indexOf(TICK + token + TICK) !== -1;
}

// Lee el array NAMES publicado en el modulo de eventos. Devuelve la lista de
// nombres, o null si no se puede parsear.
function publishedBusNames(moduleSource) {
  const match = moduleSource.match(/NAMES\s*=\s*\[([\s\S]*?)\]/);
  if (!match) return null;
  const names = (match[1].match(/["']([^"']+)["']/g) || []).map((quoted) =>
    quoted.replace(/["']/g, "").trim()
  );
  return names.filter(Boolean);
}

// ---------------------------------------------------------------- main

function main() {
  const violations = [];

  // (1) El documento tiene que existir y ser plausiblemente una transcripcion.
  let doc = null;
  if (!existsSync(join(ROOT, DOC))) {
    violations.push(`${DOC}: no existe — es la especificacion propia del tema (SHELL-04, D-04)`);
  } else {
    doc = read(DOC);
    if (doc.length < DOC_MIN_CHARS) {
      violations.push(
        `${DOC}: mide ${doc.length} caracteres, por debajo del piso de ${DOC_MIN_CHARS} — una transcripcion real no puede ser tan corta`
      );
    }
  }

  // (2) El array NAMES del modulo: se lee de ahi, nunca se guarda una copia.
  let busNames = null;
  if (!existsSync(join(ROOT, MODULE))) {
    violations.push(`${MODULE}: no existe — es la fuente de los nombres del bus (SHELL-03)`);
  } else {
    busNames = publishedBusNames(read(MODULE));
    if (busNames === null) {
      violations.push(
        `${MODULE}: no se pudo parsear el array NAMES — sin la lista publicada el contrato no tiene contra que compararse`
      );
    } else if (busNames.length === 0) {
      violations.push(
        `${MODULE}: el array NAMES vino vacio — un scan sin nombres no puede reportar exito (backstop de scan vacio)`
      );
    }
  }

  // (3) Cada nombre publicado del bus tiene que estar en el documento en codigo.
  if (doc && busNames && busNames.length > 0) {
    for (const name of busNames) {
      if (!inCodeFormatting(doc, name)) {
        violations.push(
          `${DOC}: falta el nombre del bus "${name}" en formato de codigo — esta publicado en ${MODULE} pero el documento no lo transcribe`
        );
      }
    }
  }

  // (4) Cada tipo de evento del embudo tiene que estar en el documento en codigo.
  if (doc) {
    for (const tipo of FUNNEL_EVENT_TYPES) {
      if (!inCodeFormatting(doc, tipo)) {
        violations.push(
          `${DOC}: falta el tipo de evento del embudo "${tipo}" en formato de codigo — lo acepta /collect y el documento tiene que nombrarlo`
        );
      }
    }
  }

  // (5) Cada atributo de carrito tiene que estar en el documento en codigo.
  if (doc) {
    for (const attr of CART_ATTRIBUTES) {
      if (!inCodeFormatting(doc, attr)) {
        violations.push(
          `${DOC}: falta el atributo de carrito "${attr}" en formato de codigo — la orden tiene que llevarlo y el documento tiene que nombrarlo`
        );
      }
    }
  }

  // (6) El hook de la oferta tiene que aparecer en el documento.
  if (doc && doc.indexOf("data-kinelia") === -1) {
    violations.push(
      `${DOC}: no registra el hook de la oferta (${OFFER_HOOK_ATTR}) — la Fase 5 lo necesita documentado`
    );
  }

  // ---------------------------------------------------------------- salida

  if (violations.length > 0) {
    for (const line of violations) {
      console.error(`x ${line}`);
    }
    console.error(`check-seams: ${violations.length} violacion(es).`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `check-seams: OK — ${DOC} (${doc.length} caracteres) transcribe ` +
      `${busNames.length} nombres del bus leidos de ${MODULE}, ` +
      `${FUNNEL_EVENT_TYPES.length} tipos de evento del embudo y ` +
      `${CART_ATTRIBUTES.length} atributos de carrito, con el hook de la oferta.`
  );
}

main();
