#!/usr/bin/env node
/**
 * Renders the classroom quiz figures.
 *
 *   node scripts/render-play-figures.mjs            every course
 *   node scripts/render-play-figures.mjs l2-u9      only the courses named
 *
 * Each scripts/play-figures/<set>.html holds several <figure data-name="…">
 * elements. Every one is screenshotted at 2x into public/play/<set>/<name>.png,
 * and the CSS pixel size of each is written to
 * src/features/play/sets/figure-sizes.json so the pages can reserve space for
 * the image before it loads.
 *
 * Re-render after editing a source page, then look at the PNGs.
 * Set CHROMIUM_PATH to use a specific browser binary.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const sourceDir = join(root, "scripts", "play-figures");
const sizesFile = join(root, "src", "features", "play", "sets", "figure-sizes.json");
const only = process.argv.slice(2);
const files = readdirSync(sourceDir)
  .filter((name) => name.endsWith(".html"))
  .filter((name) => only.length === 0 || only.includes(basename(name, ".html")))
  .sort();
for (const name of only) {
  if (!files.includes(`${name}.html`)) throw new Error(`No figure source scripts/play-figures/${name}.html`);
}

// Sizes of the courses not being rendered this time are kept as they are.
const rendered = new Set(files.map((name) => basename(name, ".html")));
const previous = existsSync(sizesFile) ? JSON.parse(readFileSync(sizesFile, "utf8")) : {};
const sizes = Object.fromEntries(Object.entries(previous).filter(([key]) => !rendered.has(key.split("/")[0])));

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 800 } });

for (const file of files) {
  const set = basename(file, ".html");
  const outDir = join(root, "public", "play", set);
  mkdirSync(outDir, { recursive: true });
  await page.goto(pathToFileURL(join(sourceDir, file)).href);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every((image) => image.complete));

  for (const figure of await page.locator("figure[data-name]").all()) {
    const name = await figure.getAttribute("data-name");
    const box = await figure.boundingBox();
    await figure.screenshot({ path: join(outDir, `${name}.png`) });
    sizes[`${set}/${name}`] = [Math.round(box.width), Math.round(box.height)];
    console.log(`${set}/${name}.png ${Math.round(box.width)}×${Math.round(box.height)}`);
  }
}

await browser.close();
writeFileSync(sizesFile, `${JSON.stringify(sizes, null, 2)}\n`);
