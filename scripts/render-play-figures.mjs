#!/usr/bin/env node
/**
 * Renders the classroom quiz figures.
 *
 *   node scripts/render-play-figures.mjs
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
import { readdirSync, writeFileSync, mkdirSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

const root = resolve(import.meta.dirname, "..");
const sourceDir = join(root, "scripts", "play-figures");
const sizes = {};

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {},
);
const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1000, height: 800 } });

for (const file of readdirSync(sourceDir).filter((name) => name.endsWith(".html")).sort()) {
  const set = basename(file, ".html");
  const outDir = join(root, "public", "play", set);
  mkdirSync(outDir, { recursive: true });
  await page.goto(pathToFileURL(join(sourceDir, file)).href);
  await page.evaluate(() => document.fonts.ready);

  for (const figure of await page.locator("figure[data-name]").all()) {
    const name = await figure.getAttribute("data-name");
    const box = await figure.boundingBox();
    await figure.screenshot({ path: join(outDir, `${name}.png`) });
    sizes[`${set}/${name}`] = [Math.round(box.width), Math.round(box.height)];
    console.log(`${set}/${name}.png ${Math.round(box.width)}×${Math.round(box.height)}`);
  }
}

await browser.close();
writeFileSync(
  join(root, "src", "features", "play", "sets", "figure-sizes.json"),
  `${JSON.stringify(sizes, null, 2)}\n`,
);
