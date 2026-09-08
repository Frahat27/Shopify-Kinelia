/*
 * scripts/perf.mjs — local Lighthouse performance harness.
 *
 * Usage:
 *   1. In one shell:  shopify theme dev --store kinelia.myshopify.com
 *      (first run opens a browser for an interactive login — see README.md).
 *   2. In another:     npm run perf
 *
 * Override the target and the product path with env vars:
 *   PREVIEW_URL=http://127.0.0.1:9292  PERF_PRODUCT_HANDLE=the-complete-snowboard  npm run perf
 *
 * Why a wrapper: `lhci autorun` needs a URL (or a static build dir) to collect.
 * `shopify theme dev` is what serves the theme, so the URL only exists at run
 * time — it cannot live in lighthouse/lighthouserc.json. This script injects it
 * as --collect.url and hands the rest (3 mobile runs, the LCP / CLS / a11y /
 * script-weight assertions) to that config.
 *
 * The CI half of the budget runs separately via .github/workflows/lighthouse.yml
 * and only enforces the two Lighthouse category scores — see docs/PERF-BUDGET.md.
 */

import { spawnSync } from "node:child_process";

const PREVIEW_URL = (process.env.PREVIEW_URL || "http://127.0.0.1:9292").replace(/\/$/, "");
const PRODUCT_HANDLE = process.env.PERF_PRODUCT_HANDLE || "the-complete-snowboard";
const CONFIG = "lighthouse/lighthouserc.json";

async function assertServerUp() {
  try {
    const res = await fetch(PREVIEW_URL + "/", { signal: AbortSignal.timeout(4000) });
    if (!res.ok) throw new Error("status " + res.status);
  } catch (err) {
    console.error(
      `\nNo dev server answering at ${PREVIEW_URL} (${err.message}).\n\n` +
        `Start it first, in a separate shell:\n` +
        `  shopify theme dev --store <tu-dev-store>.myshopify.com\n\n` +
        `Then re-run: npm run perf\n`
    );
    process.exitCode = 1;
    return false;
  }
  return true;
}

async function main() {
  if (!(await assertServerUp())) return;

  const urls = [
    `${PREVIEW_URL}/`,
    `${PREVIEW_URL}/products/${PRODUCT_HANDLE}`,
  ];

  const args = [
    "lhci",
    "autorun",
    `--config=${CONFIG}`,
    ...urls.map((u) => `--collect.url=${u}`),
    "--collect.numberOfRuns=3",
    "--upload.target=temporary-public-storage",
  ];

  console.log(`Running Lighthouse against:\n${urls.map((u) => "  " + u).join("\n")}\n`);

  const run = spawnSync("npx", args, { stdio: "inherit", shell: process.platform === "win32" });
  process.exitCode = run.status ?? 1;
}

await main();
