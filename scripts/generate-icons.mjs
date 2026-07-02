/**
 * Renders the Çini app icon (8-point star on warm bone) to the PNG sizes
 * iOS/PWA need. Rerun after changing public/icons/favicon.svg:
 *   node scripts/generate-icons.mjs
 */
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const svgPath = fileURLToPath(new URL("../public/icons/favicon.svg", import.meta.url));
const outDir = fileURLToPath(new URL("../public/icons/", import.meta.url));
const svg = await readFile(svgPath);

for (const size of [192, 512]) {
  await sharp(svg, { density: (72 * size) / 64 })
    .resize(size, size)
    .png()
    .toFile(`${outDir}icon-${size}.png`);
  console.log(`icon-${size}.png written`);
}
