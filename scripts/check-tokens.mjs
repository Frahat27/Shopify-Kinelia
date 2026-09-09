/*
 * ----------------------------------------------------------------
 * check-tokens.mjs — copia EJECUTABLE de DESIGN-02
 * ----------------------------------------------------------------
 *
 * Un rebrand de Kinelia es un cambio de tokens, no de componentes (DESIGN-02).
 * Esa promesa solo vale si algo falla fuerte la primera vez que un valor de
 * color literal entra al CSS de un componente. Este script es esa copia
 * ejecutable; `OVERRIDES.md` y `ALLOWLIST.md` son su explicacion humana.
 *
 * Falla (exit != 0) cuando:
 *   - aparece un color literal (#rgb / #rrggbb / #rrggbbaa) o un nombre de
 *     familia de marca ("DM Sans" / "Inter") en CSS de componente, fuera de
 *     snippets/css-variables.liquid / config/settings_schema.json /
 *     config/settings_data.json,
 *   - css-variables.liquid referencia un settings.<id> que no existe en el
 *     schema, o uno cuyo tipo de input no es un picker de valor acotado
 *     (un setting de texto libre interpolado en <style> permite inyeccion),
 *   - un token --color-* en css-variables.liquid interpola un setting sin
 *     pasar por un filtro Liquid `| default:`,
 *   - un CSS de componente usa var(--x) de un custom property que nada define
 *     (asi un rename de token no despoja a un componente de su color en silencio),
 *   - un CSS de componente usa sombra, rampa de color / degradado, texto
 *     justificado, o mayusculas fuera de la unica utility de etiqueta corta
 *     (D-07, D-11 — el sistema Kinelia es plano y se lee en celular a contraluz),
 *   - aparece un host de fuentes de terceros (Google Fonts / Typekit) en
 *     layout/, snippets/ o assets/,
 *   - locales/ no tiene exactamente un *.default.json, ese archivo o su
 *     hermano .default.schema.json no parsean como JSON estricto, o empiezan
 *     con un byte-order mark,
 *   - el scan de CSS de assets/ viene vacio (un scan vacio no puede reportar exito).
 *
 * Nota: los literales de espaciado (`1rem`, `gap: 16px`) NO se chequean —
 * sections/header.liquid ya los lleva y una escala de espaciado machine-enforced
 * seria puro ruido. Es una preocupacion de code review.
 *
 * El plan 02-04 extendio el check de locale (regla 8):
 *   - el unico *.default.json debe ser el espanol (es.default.json) — asi un
 *     segundo archivo default o un cambio de idioma rompe el build, no cambia
 *     la tienda en silencio (D-14),
 *   - las ocho claves de copy aprobado (leyenda legal + seis CTAs + promesa
 *     raiz, en REQUIRED_STOREFRONT_KEYS) deben resolver a un string no vacio
 *     dentro de es.default.json — un objeto intermedio faltante es tan falla
 *     como una hoja faltante (D-15),
 *   - la clave de la leyenda legal NO puede llevar el sufijo _html: una clave
 *     con ese sufijo se renderiza sin escapar, y la leyenda es prosa que una
 *     fase posterior nunca debe poder convertir en un punto de inyeccion
 *     renombrando la clave (T-02-16).
 *
 * Node standard library únicamente. Uso: node scripts/check-tokens.mjs
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, relative as relativePath } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

// ---------------------------------------------------------------- contrato

// Los unicos archivos donde un valor de color literal o un nombre de familia de
// marca es legitimo (D-17): el emisor de tokens y el schema. settings_data.json
// lo escribe la integracion de GitHub desde el editor de temas.
export const ALLOWED_FILES = new Set([
  "snippets/css-variables.liquid",
  "config/settings_schema.json",
  "config/settings_data.json",
]);

// sections/hello-world.liquid es la section demo del starter. El plan 01-04 la
// des-referencio de templates/index.json; `ALLOWLIST.md` la archiva bajo
// "Presente, no renderiza". Se conserva porque este repo reduce por NO
// REFERENCIAR, nunca borrando, y nada del embudo de Kinelia la enlaza. Lleva dos
// colores literales y una sombra: exenta por ruta exacta, no se limpia.
export const EXEMPT_FILES = new Set(["sections/hello-world.liquid"]);

// La copy de marca aprobada (D-15), en forma de ruta con puntos dentro de
// locales/es.default.json. Cada fase posterior la referencia por clave en vez de
// reescribirla; su explicacion humana esta en docs/BRAND-COPY.md. Si una de
// estas ocho rutas no resuelve a un string no vacio, el build falla.
export const REQUIRED_STOREFRONT_KEYS = [
  "kinelia.cta.quiero_las_mias",
  "kinelia.cta.ver_talles_precio",
  "kinelia.cta.elegir_talle",
  "kinelia.cta.comprar",
  "kinelia.cta.comprar_ahora",
  "kinelia.cta.pedir_whatsapp",
  "kinelia.promesa_raiz",
  "kinelia.legal_disclaimer",
];

// La clave de la leyenda legal, y su variante prohibida con sufijo de markup.
export const LEGAL_LEGEND_KEY = "kinelia.legal_disclaimer";
export const LEGAL_LEGEND_HTML_KEY = "kinelia.legal_disclaimer_html";

// Prefijo de idioma que debe llevar el unico locale default del storefront (D-14).
const DEFAULT_LOCALE_LANG = "es";

const EMITTER = "snippets/css-variables.liquid";
const SCHEMA = "config/settings_schema.json";

// Directorios que pueden contener bloques de estilo Liquid.
const LIQUID_DIRS = ["sections", "blocks", "snippets", "layout", "templates"];

// Regexes de deriva — verbatim de 02-RESEARCH.md lineas 571-572.
const HEX = /#(?:[0-9a-fA-F]{2}){3,4}\b|#[0-9a-fA-F]{3}\b/;
const FONT_NAME = /"?DM Sans"?|(?<![A-Za-z-])"?Inter"?(?![A-Za-z-])/i;

// Tipos de setting con VALOR ACOTADO: seguros de interpolar dentro de {% style %}.
// El plan pide "color, select o range"; se suman los otros pickers acotados y
// font_picker — devuelve un objeto de fuente de Shopify, nunca texto libre, y no
// puede cerrar el elemento <style>. type_primary_font lo usa hasta el plan 02-02,
// que lo reemplaza por un select. Un `text` / `textarea` / `richtext` / `html` /
// `url` interpolado aca si permite cerrar <style> e inyectar markup: se rechaza.
const CONSTRAINED_TYPES = new Set([
  "color",
  "color_background",
  "select",
  "radio",
  "range",
  "checkbox",
  "font_picker",
]);

const THIRD_PARTY_FONT_HOST =
  /fonts\.googleapis\.com|fonts\.gstatic\.com|use\.typekit\.|typekit\.net/i;

// ---------------------------------------------------------------- helpers

function rel(abs) {
  return relativePath(ROOT, abs).replace(/\\/g, "/");
}

function read(relPath) {
  return readFileSync(join(ROOT, relPath), "utf8");
}

// Camina una ruta con puntos ("a.b.c") por un objeto. Un objeto intermedio
// faltante devuelve undefined, igual que una hoja faltante.
function getPath(obj, dotted) {
  return dotted.split(".").reduce((acc, key) => {
    return acc != null && typeof acc === "object" ? acc[key] : undefined;
  }, obj);
}

// Quita comentarios Liquid ({% comment %}, {% # %}) y CSS (/* */) antes de
// aplicar cualquier patron — un comentario de justificacion nunca debe poder
// hacer fallar el archivo que justifica.
function stripComments(text) {
  return text
    .replace(/\{%-?\s*comment\s*-?%\}[\s\S]*?\{%-?\s*endcomment\s*-?%\}/g, "")
    .replace(/\{%-?\s*#[\s\S]*?%\}/g, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");
}

function walk(dir, test, acc = []) {
  if (!existsSync(dir)) return acc;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const abs = join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, test, acc);
    else if (test(entry.name)) acc.push(abs);
  }
  return acc;
}

// Contenido de cada bloque {% style %} / {% stylesheet %} de un liquid.
function styleBlocks(liquid) {
  const blocks = [];
  const re = /\{%-?\s*(style|stylesheet)\s*-?%\}([\s\S]*?)\{%-?\s*end\1\s*-?%\}/g;
  let m;
  while ((m = re.exec(liquid)) !== null) blocks.push(m[2]);
  return blocks;
}

// Valor de cada atributo style="..." de un liquid (define custom properties).
function inlineStyles(liquid) {
  const out = [];
  const re = /style\s*=\s*"([^"]*)"/g;
  let m;
  while ((m = re.exec(liquid)) !== null) out.push(m[1]);
  return out;
}

function definedProps(css) {
  const out = new Set();
  const re = /(--[A-Za-z0-9_-]+)\s*:/g;
  let m;
  while ((m = re.exec(css)) !== null) out.add(m[1]);
  return out;
}

function usedProps(css) {
  const out = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)/g;
  let m;
  while ((m = re.exec(css)) !== null) out.push(m[1]);
  return out;
}

// Divide un chunk de CSS en reglas planas selector { cuerpo }.
function ruleBlocks(css) {
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(css)) !== null) rules.push({ selector: m[1].trim(), body: m[2] });
  return rules;
}

function collectSchemaIds() {
  const raw = read(SCHEMA);
  const doc = JSON.parse(raw);
  const ids = new Map();
  for (const group of Array.isArray(doc) ? doc : []) {
    for (const setting of (group && group.settings) || []) {
      if (setting && typeof setting.id === "string") {
        ids.set(setting.id, setting.type);
      }
    }
  }
  return ids;
}

// ---------------------------------------------------------------- main

function main() {
  const violations = [];

  // Reunir el scan set: cada .css de assets/ + cada bloque de estilo y atributo
  // style="" de los liquid. Clave = ruta relativa; valor = CSS concatenado.
  const cssFiles = walk(join(ROOT, "assets"), (n) => n.endsWith(".css"));
  const units = new Map();

  for (const abs of cssFiles) {
    units.set(rel(abs), readFileSync(abs, "utf8"));
  }

  for (const dir of LIQUID_DIRS) {
    for (const abs of walk(join(ROOT, dir), (n) => n.endsWith(".liquid"))) {
      const liquid = readFileSync(abs, "utf8");
      const chunks = [...styleBlocks(liquid), ...inlineStyles(liquid)];
      if (chunks.length > 0) units.set(rel(abs), chunks.join("\n"));
    }
  }

  let chunkCount = units.size;

  // (9) Scan vacio de CSS de assets/.
  if (cssFiles.length === 0) {
    violations.push(
      "assets/: no se encontro ningun archivo .css — un scan vacio no puede reportar exito"
    );
  }

  // Universo de custom properties definidos en cualquier chunk escaneado.
  const globalDefs = new Set();
  for (const css of units.values()) {
    for (const name of definedProps(css)) globalDefs.add(name);
  }

  // (1) y (2) Deriva de color literal y de nombre de familia de marca.
  // (6) Declaraciones prohibidas.
  for (const [file, css] of units) {
    const clean = stripComments(css);

    if (!EXEMPT_FILES.has(file)) {
      // (5) Custom property indefinido — se corre incluso en archivos allowed
      // salvo el exento (protege el rename de tokens Skeleton -> Kinelia).
      for (const name of usedProps(clean)) {
        if (!globalDefs.has(name)) {
          violations.push(`${file}: usa var(${name}) pero ningun archivo define ${name}`);
        }
      }
    }

    if (ALLOWED_FILES.has(file) || EXEMPT_FILES.has(file)) continue;

    if (HEX.test(clean)) {
      violations.push(
        `${file}: contiene un valor de color literal — solo ${EMITTER} y ${SCHEMA} pueden (D-02, D-17)`
      );
    }
    if (FONT_NAME.test(clean)) {
      violations.push(
        `${file}: contiene un nombre de familia de marca literal — usa var(--font-*) (D-02, D-05)`
      );
    }

    for (const { selector, body } of ruleBlocks(clean)) {
      if (/(^|[\s;])box-shadow\s*:/.test(body)) {
        violations.push(`${file}: "${selector}" usa box-shadow — el sistema Kinelia no tiene elevacion por sombra (D-11)`);
      }
      if (/(linear|radial|conic)-gradient\s*\(/.test(body)) {
        violations.push(`${file}: "${selector}" usa un degradado / rampa de color — separacion por color y espacio, no por rampa (D-11)`);
      }
      if (/text-align\s*:\s*justify/.test(body)) {
        violations.push(`${file}: "${selector}" usa text-align: justify — prohibido, el publico lee en celular a contraluz (D-07)`);
      }
      if (/text-transform\s*:\s*uppercase/.test(body) && !/label-eyebrow/.test(selector)) {
        violations.push(`${file}: "${selector}" usa text-transform: uppercase fuera de la utility de etiqueta corta (D-07)`);
      }
    }
  }

  // (3) Integridad de referencia al schema + guarda de inyeccion.
  // (4) Guarda de fallback en cada token de color.
  let schemaIds = new Map();
  try {
    schemaIds = collectSchemaIds();
  } catch (error) {
    violations.push(`${SCHEMA}: no se pudo parsear como JSON estricto (${error.message})`);
  }

  const emitterClean = stripComments(read(EMITTER));

  const refRe = /\bsettings\.([A-Za-z0-9_]+)/g;
  const seenRefs = new Set();
  let refMatch;
  while ((refMatch = refRe.exec(emitterClean)) !== null) {
    const id = refMatch[1];
    if (seenRefs.has(id)) continue;
    seenRefs.add(id);
    if (schemaIds.size === 0) continue;
    if (!schemaIds.has(id)) {
      violations.push(`${EMITTER}: referencia settings.${id}, que no existe en ${SCHEMA}`);
    } else if (!CONSTRAINED_TYPES.has(schemaIds.get(id))) {
      violations.push(
        `${EMITTER}: settings.${id} es de tipo "${schemaIds.get(id)}" — solo un picker de valor acotado puede interpolarse en el bloque de tokens (inyeccion)`
      );
    }
  }

  const colorDeclRe = /(--color-[A-Za-z0-9_-]*)\s*:\s*([^;]*);/g;
  let colorMatch;
  while ((colorMatch = colorDeclRe.exec(emitterClean)) !== null) {
    const [, name, value] = colorMatch;
    if (/\{\{[^}]*settings\./.test(value) && !/\|\s*default\s*:/.test(value)) {
      violations.push(
        `${EMITTER}: ${name} interpola un setting sin filtro Liquid "| default:" — un color picker vaciado tiraria el token (Pitfall 4)`
      );
    }
  }

  // (7) Host de fuentes de terceros.
  for (const dir of ["layout", "snippets", "assets"]) {
    for (const abs of walk(join(ROOT, dir), () => true)) {
      let text;
      try {
        text = readFileSync(abs, "utf8");
      } catch {
        continue; // binario u otro problema de lectura
      }
      if (THIRD_PARTY_FONT_HOST.test(text)) {
        violations.push(
          `${rel(abs)}: referencia un host de fuentes de terceros (Google Fonts / Typekit) — las fuentes se self-hostean (D-08)`
        );
      }
    }
  }

  // (8) Sanidad estructural del locale.
  const localesDir = join(ROOT, "locales");
  const defaults = existsSync(localesDir)
    ? readdirSync(localesDir).filter((n) => n.endsWith(".default.json")).sort()
    : [];

  if (defaults.length !== 1) {
    violations.push(
      `locales/: se esperaba exactamente un *.default.json, hay ${defaults.length}`
    );
  }

  for (const name of defaults) {
    const sibling = name.replace(/\.default\.json$/, ".default.schema.json");
    for (const target of [name, sibling]) {
      const abs = join(localesDir, target);
      if (!existsSync(abs)) {
        violations.push(`locales/${target}: no existe`);
        continue;
      }
      const raw = readFileSync(abs, "utf8");
      if (raw.charCodeAt(0) === 0xfeff) {
        violations.push(`locales/${target}: empieza con un byte-order mark (U+FEFF)`);
      }
      try {
        JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
      } catch (error) {
        violations.push(`locales/${target}: no parsea como JSON estricto (${error.message})`);
      }
    }
  }

  // (8b) El unico locale default del storefront debe ser el espanol (D-14). Un
  // segundo archivo default o un cambio de idioma rompe el build en vez de
  // cambiar la tienda en silencio.
  if (defaults.length === 1) {
    const only = defaults[0];
    const lang = only.replace(/\.default\.json$/, "");
    if (lang !== DEFAULT_LOCALE_LANG) {
      violations.push(
        `locales/${only}: el unico locale default del storefront debe ser "${DEFAULT_LOCALE_LANG}.default.json" (espanol), no "${lang}" (D-14)`
      );
    }
  }

  // (8c) La copy de marca aprobada debe resolver a strings no vacios dentro de
  // es.default.json, y la leyenda legal no puede llevar el sufijo _html (D-15,
  // T-02-16). Un objeto intermedio faltante es tan falla como una hoja faltante.
  const esStorefront = join(localesDir, `${DEFAULT_LOCALE_LANG}.default.json`);
  if (existsSync(esStorefront)) {
    let esDoc = null;
    try {
      const raw = readFileSync(esStorefront, "utf8");
      esDoc = JSON.parse(raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw);
    } catch {
      // el error de parseo estricto ya se reporto en el bucle de arriba
    }
    if (esDoc) {
      for (const keyPath of REQUIRED_STOREFRONT_KEYS) {
        const value = getPath(esDoc, keyPath);
        if (typeof value !== "string" || value.trim() === "") {
          violations.push(
            `locales/${DEFAULT_LOCALE_LANG}.default.json: la clave de copy aprobada "${keyPath}" no resuelve a un string no vacio (D-15)`
          );
        }
      }
      if (getPath(esDoc, LEGAL_LEGEND_HTML_KEY) !== undefined) {
        violations.push(
          `locales/${DEFAULT_LOCALE_LANG}.default.json: "${LEGAL_LEGEND_HTML_KEY}" lleva el sufijo _html — la leyenda legal es prosa plana y se auto-escapa; usa "${LEGAL_LEGEND_KEY}" (T-02-16)`
        );
      }
    }
  }

  // ---------------------------------------------------------------- salida

  if (violations.length > 0) {
    for (const line of violations) {
      console.error(`x ${line}`);
    }
    console.error(`check-tokens: ${violations.length} violacion(es).`);
    process.exitCode = 1;
    return;
  }

  console.log(
    `check-tokens: OK — ${chunkCount} chunk(s) de estilo inspeccionados, ` +
      `${globalDefs.size} custom properties definidos, ` +
      `${schemaIds.size} settings ids en el schema.`
  );
}

main();
