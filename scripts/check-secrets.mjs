/*
 * ----------------------------------------------------------------
 * check-secrets.mjs — enforcement del negative-check de credenciales
 * ----------------------------------------------------------------
 *
 * `.gitignore` mantiene `.env` fuera del repo; este script es la segunda
 * barrera: verifica que ningún VALOR de credencial (ni un fragmento) haya
 * entrado al working tree ni al historial de git. Es la copia EJECUTABLE de la
 * promesa de mitigación de la amenaza T-01-21; `docs/SHOPIFY-SETUP.md` la
 * explica en prosa.
 *
 * Falla (exit != 0) cuando:
 *   - un archivo trackeado contiene un token de Shopify con cuerpo real
 *     (prefijo `shpat_ / shpss_ / shpca_ / shppa_ / shpsa_` seguido de >=10
 *     chars) — fuera de `.env.example`,
 *   - `SHOP_CLIENT_SECRET` / `SHOP_CLIENT_ID` están en el environment y su valor
 *     completo, o su fragmento de 12 chars, aparece en un archivo trackeado o en
 *     `git log -p --all`,
 *   - `git ls-files` no devuelve nada (un scan vacío no puede reportar éxito).
 *
 * Los "needles" (valores de secreto) se leen SOLO del environment — nunca se
 * escriben en ningún archivo. Sin las env vars, el script igual corre el scan de
 * prefijos; con ellas, agrega el scan de valor/fragmento e historial.
 *
 * Node standard library únicamente. Uso:
 *   node scripts/check-secrets.mjs
 *   SHOP_CLIENT_SECRET=... SHOP_CLIENT_ID=... node scripts/check-secrets.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const ROOT = resolve(fileURLToPath(import.meta.url), "../..");

// ---------------------------------------------------------------- config

// Prefijos de credenciales de Shopify con un cuerpo real (>=10 chars). El
// prefijo solo, sin cuerpo, es vocabulario legítimo en la documentación.
const SHOPIFY_TOKEN_RE = /shp(?:at|ss|ca|pa|sa)_[A-Za-z0-9]{10,}/;

// Secretos que, si están en el environment, se buscan por valor y por fragmento.
const SECRET_ENV_VARS = ["SHOP_CLIENT_SECRET", "SHOP_CLIENT_ID"];

// Largos de fragmento que se consideran "material de secreto". Un prefijo de 10
// chars de un secreto de alta entropía no colisiona en la práctica con contenido
// no relacionado; usar varios largos evita depender del conteo exacto del needle
// histórico que disparó T-01-21.
const FRAGMENT_LENS = [10, 16, 24];

// Archivos trackeados que se saltean: binarios y el ejemplo de env.
const SKIP_RE = /(^|\/)(\.env\.example)$|\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|eot|pdf|mp4|webm|zip)$/i;

// ---------------------------------------------------------------- helpers

function git(args) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
}

function trackedFiles() {
  return git(["ls-files"])
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((f) => !SKIP_RE.test(f));
}

/* Fragmentos de secreto a buscar: el valor completo y su prefijo de 12 chars.
 * Se descartan valores demasiado cortos o no alfanuméricos para no generar
 * falsos positivos sobre placeholders. */
function needlesFromEnv() {
  const needles = [];
  const minLen = Math.max(...FRAGMENT_LENS) + 4;
  for (const name of SECRET_ENV_VARS) {
    const value = (process.env[name] || "").trim();
    if (value.length < minLen) continue;
    if (!/^[A-Za-z0-9._-]+$/.test(value)) continue;
    needles.push({ name, kind: "valor completo", text: value });
    for (const len of FRAGMENT_LENS) {
      needles.push({ name, kind: `fragmento (${len} chars)`, text: value.slice(0, len) });
    }
  }
  return needles;
}

// Cantidad de secretos distintos representados en `needles` (cada uno aporta
// 1 valor completo + FRAGMENT_LENS.length fragmentos).
const NEEDLES_PER_SECRET = 1 + FRAGMENT_LENS.length;

// ---------------------------------------------------------------- main

function main() {
  const violations = [];

  let files;
  try {
    files = trackedFiles();
  } catch (error) {
    console.error(`check-secrets: no se pudo listar archivos trackeados (${error.message}).`);
    process.exitCode = 1;
    return;
  }

  if (files.length === 0) {
    console.error("check-secrets: `git ls-files` no devolvió nada — un scan vacío no puede reportar éxito.");
    process.exitCode = 1;
    return;
  }

  const needles = needlesFromEnv();

  // (1) Scan del working tree: prefijos de token + valores/fragmentos de secreto.
  for (const rel of files) {
    const abs = join(ROOT, rel);
    if (!existsSync(abs)) continue;

    let text;
    try {
      text = readFileSync(abs, "utf8");
    } catch {
      continue; // binario u otro problema de lectura — no es prosa
    }

    if (SHOPIFY_TOKEN_RE.test(text)) {
      violations.push(`${rel}: contiene un token de Shopify con cuerpo real`);
    }

    for (const needle of needles) {
      if (text.includes(needle.text)) {
        violations.push(`${rel}: contiene el ${needle.kind} de ${needle.name}`);
      }
    }
  }

  // (2) Scan del historial completo — solo si hay needles del environment.
  if (needles.length > 0) {
    let history = "";
    try {
      history = git(["log", "-p", "--all", "--no-color"]);
    } catch (error) {
      violations.push(`historial: no se pudo escanear \`git log -p --all\` (${error.message})`);
    }

    for (const needle of needles) {
      if (history.includes(needle.text)) {
        violations.push(`git history: contiene el ${needle.kind} de ${needle.name}`);
      }
    }
  }

  if (violations.length > 0) {
    for (const line of violations) {
      console.error(`x ${line}`);
    }
    console.error(`check-secrets: ${violations.length} hallazgo(s) de credencial.`);
    process.exitCode = 1;
    return;
  }

  const historyNote = needles.length > 0
    ? `${needles.length / NEEDLES_PER_SECRET} secreto(s) del env verificados en working tree + historial`
    : "sin secretos en el env: solo scan de prefijos de token";
  console.log(`check-secrets: OK — ${files.length} archivos trackeados escaneados, ${historyNote}.`);
}

main();
