/*
 * ----------------------------------------------------------------
 * check-allowlist.mjs — machine enforcement of the render allowlist
 * ----------------------------------------------------------------
 *
 * El tema se reduce "por no referenciar", nunca borrando. Este script es la copia
 * EJECUTABLE del contrato; `ALLOWLIST.md` es su explicación humana.
 *
 * Falla (exit != 0) cuando:
 *   - un template JSON o un section-group referencia un `type` de section que no
 *     está en RENDER_ALLOWLIST,
 *   - aparece un archivo `.js` o `.mjs` en `assets/` que no está en
 *     JS_ASSET_ALLOWLIST (la Fase 1 no agregó JS; la Fase 3 abre la superficie
 *     con una lista explícita, no la elimina),
 *   - un archivo de `assets/` lleva en el nombre una librería front-end pesada,
 *   - no encuentra ningún template JSON que inspeccionar (un scan vacío no puede
 *     reportar éxito).
 *
 * Node standard library únicamente. Uso: `node scripts/check-allowlist.mjs`
 */

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

// ---------------------------------------------------------------- render allowlist
// Esta es la copia obligatoria de la lista. `ALLOWLIST.md` la explica fila por fila.
// Sumar una section nueva acá va en la misma pull request que la introduce.
export const RENDER_ALLOWLIST = [
  // Superficies del embudo que Kinelia sirve activamente
  "custom-section",
  "product",
  "cart",
  "search",
  "page",
  "404",
  "password",
  "header",
  "footer",
  // Presentes fuera del embudo: el template resuelve si se navega directo, pero
  // nada dentro del embudo de Kinelia las enlaza (ver ALLOWLIST.md).
  "article",
  "blog",
  "collection",
  "collections",
];

// Librerías front-end pesadas que nunca se vendorizan en `assets/`.
const FORBIDDEN_ASSET_SUBSTRINGS = ["jquery", "swiper", "react", "vue", "alpine"];

// Módulos JavaScript de primera parte admitidos en `assets/`. La Fase 1 no
// agregó JS; la Fase 3 (plan 03-01) abre la superficie con esta lista explícita
// — el primer módulo del tema es el bus de eventos DOM. Cualquier `.js`/`.mjs`
// que NO esté acá sigue empujando una violación, y FORBIDDEN_ASSET_SUBSTRINGS
// también aplica a los listados. `ALLOWLIST.md` §"Renderiza" lo explica fila por
// fila; sumar un módulo acá va en la misma pull request que lo introduce.
export const JS_ASSET_ALLOWLIST = new Set(["events.js"]);

// ---------------------------------------------------------------- helpers

/*
 * Shopify escribe un banner `/* *\/` y, a veces, comas colgantes en los JSON de
 * templates y section-groups. Se limpian para que `JSON.parse` pueda leerlos.
 */
function parseThemeJson(raw, label) {
  const cleaned = raw
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/,(\s*[}\]])/g, "$1")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    throw new Error(`no se pudo parsear ${label}: ${error.message}`);
  }
}

function jsonFilesIn(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => name.endsWith(".json"))
    .sort()
    .map((name) => join(dir, name));
}

function sectionTypesFrom(doc) {
  const sections = doc && doc.sections;
  if (!sections || typeof sections !== "object") return [];
  return Object.values(sections)
    .map((entry) => entry && entry.type)
    .filter((type) => typeof type === "string");
}

function relative(file) {
  return file.slice(ROOT.length + 1).replace(/\\/g, "/");
}

// ---------------------------------------------------------------- main

function main() {
  const violations = [];
  const allowed = new Set(RENDER_ALLOWLIST);

  const templateFiles = jsonFilesIn(join(ROOT, "templates"));
  const groupFiles = jsonFilesIn(join(ROOT, "sections")).filter((file) =>
    basename(file).endsWith("-group.json")
  );

  if (templateFiles.length === 0) {
    console.error(
      "check-allowlist: no se encontró ningún template JSON en templates/ — " +
        "un scan vacío no puede reportar éxito."
    );
    process.exitCode = 1;
    return;
  }

  const referencedTypes = new Set();

  for (const file of [...templateFiles, ...groupFiles]) {
    const label = relative(file);
    let doc;

    try {
      doc = parseThemeJson(readFileSync(file, "utf8"), label);
    } catch (error) {
      violations.push(error.message);
      continue;
    }

    for (const type of sectionTypesFrom(doc)) {
      referencedTypes.add(type);
      if (!allowed.has(type)) {
        violations.push(
          `${label}: referencia la section "${type}", fuera del render allowlist`
        );
      }
    }
  }

  // assets/ — la Fase 1 no agregó JavaScript. Desde la Fase 3 (plan 03-01) un
  // módulo de primera parte entra solo si está en JS_ASSET_ALLOWLIST; cualquier
  // otro `.js`/`.mjs` sigue siendo una violación. La regla se aflojó con una
  // lista, no se eliminó.
  const assetsDir = join(ROOT, "assets");
  const assetNames = existsSync(assetsDir) ? readdirSync(assetsDir).sort() : [];

  for (const name of assetNames) {
    const ext = extname(name).toLowerCase();
    if ((ext === ".js" || ext === ".mjs") && !JS_ASSET_ALLOWLIST.has(name)) {
      violations.push(
        `assets/${name}: JavaScript en assets/ solo se admite vía JS_ASSET_ALLOWLIST (ver ALLOWLIST.md §"Renderiza")`
      );
    }

    const lower = name.toLowerCase();
    for (const needle of FORBIDDEN_ASSET_SUBSTRINGS) {
      if (lower.includes(needle)) {
        violations.push(
          `assets/${name}: nombre de librería front-end pesada prohibida ("${needle}")`
        );
      }
    }
  }

  if (violations.length > 0) {
    for (const line of violations) {
      console.error(`x ${line}`);
    }
    console.error(`check-allowlist: ${violations.length} violacion(es).`);
    process.exitCode = 1;
    return;
  }

  const jsAssets = assetNames.filter((name) => {
    const ext = extname(name).toLowerCase();
    return ext === ".js" || ext === ".mjs";
  });

  console.log(
    `check-allowlist: OK — ${templateFiles.length} templates + ` +
      `${groupFiles.length} section-groups inspeccionados, ` +
      `${referencedTypes.size} tipos de section referenciados, ` +
      `${assetNames.length} archivos en assets/ ` +
      `(${jsAssets.length} JS, todos en JS_ASSET_ALLOWLIST).`
  );
}

main();
