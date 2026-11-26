// Renders assets/eras.png (1x) and assets/eras@2x.png (2x) for the README: the same
// markup (the README's Quick start window and an alert) drawn by dist/clio.css and
// dist/clio.js in System 6, System 7, Drawing Board and Platinum. Nothing is drawn by
// hand: the image is a screenshot of the built library in Chromium. At 2x the library
// itself magnifies its art by nearest neighbour; the screenshot is saved as rendered,
// with no resampling. Run `npm run build` first. Needs Playwright (installed here or in
// AIS6_DIR, as for the pixel check and tooling/og.mjs).
//
//   node tooling/readme-eras.mjs            two columns, two rows (fits GitHub at 1:1)
//   node tooling/readme-eras.mjs --row      four columns in one row
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) { try { playwright = createRequire(base)("playwright"); break; } catch {} }
if (!playwright) { console.error("Playwright not found."); process.exit(2); }

const row = process.argv.includes("--row");
const css = pathToFileURL(join(root, "dist/clio.css")).href;
const js = pathToFileURL(join(root, "dist/clio.js")).href;
const eras = [
  ["system6", "System 6"],
  ["system7", "System 7"],
  ["drawingboard", "Drawing Board"],
  ["platinum", "Platinum"],
];

// The README's Quick start window, then the alert from components.json ("dialog").
const cell = (era, name) => `<section class="cell" data-era="${era}">
  <p class="label">${name}</p>
  <div class="window" style="width: 320px">
    <div class="title-bar">
      <button class="close" aria-label="Close"></button>
      <h1 class="title">Macintosh HD</h1>
      <button class="resize" aria-label="Zoom"></button>
      <button class="shade" aria-label="Collapse"></button>
    </div>
    <div class="details-bar"><span>12 items</span><span>167K available</span></div>
    <div class="window-pane">
      <label><input type="checkbox" checked> Show warnings</label>
      <button class="default">OK</button>
    </div>
  </div>
  <div class="alert-box" role="alertdialog" aria-labelledby="msg-${era}" style="width: 340px">
    <span class="alert-icon caution" aria-hidden="true"></span>
    <p id="msg-${era}">Save changes to the document “Untitled” before closing?</p>
    <div class="dialog-buttons">
      <button>Don’t Save</button>
      <button>Cancel</button>
      <button class="default">Save</button>
    </div>
  </div>
</section>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="${css}"><script src="${js}" defer></script>
<style>
  html, body { margin: 0; background: #fff; }
  #shot { display: inline-grid; grid-template-columns: repeat(${row ? 4 : 2}, 380px); }
  .cell { background: var(--clio-desktop); padding: 0 16px 20px; display: flex; flex-direction: column; gap: 16px; align-items: flex-start; }
  .label { margin: 0 -16px; align-self: stretch; padding: 4px 16px; background: #fff; color: #000;
           font: 12px var(--clio-font-chrome); border-bottom: 1px solid #000; }
  .window-pane { display: flex; justify-content: space-between; align-items: center; padding: 12px; }
  .alert-box { margin-left: 20px; }
</style></head>
<body><div id="shot">${eras.map(([id, name]) => cell(id, name)).join("\n")}</div></body></html>`;

mkdirSync(join(root, ".fidelity"), { recursive: true });
mkdirSync(join(root, "assets"), { recursive: true });
const file = join(root, ".fidelity/readme-eras.html");
writeFileSync(file, html);

const browser = await playwright.chromium.launch();
for (const [scale, out] of [[1, "assets/eras.png"], [2, "assets/eras@2x.png"]]) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: scale });
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  await page.locator("#shot").screenshot({ path: join(root, out), animations: "disabled", caret: "hide" });
  const size = await page.locator("#shot").boundingBox();
  console.log(`wrote ${out} (${Math.round(size.width) * scale}x${Math.round(size.height) * scale})`);
  await page.close();
}
await browser.close();
