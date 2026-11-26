// Renders assets/social-preview.png (1280x640), the image for GitHub's Settings >
// Social preview: one window drawn by dist/clio.css in each of the four eras, on that
// era's own desktop. One labelled column per era. Laid out at 640x320 and captured at 2x, where clio.css magnifies
// its art by nearest neighbour, so every Mac pixel is a 2x2 block. Nothing is drawn by
// hand. Run `npm run build` first. Needs Playwright (here or in AIS6_DIR).
import { createRequire } from "node:module";
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) { try { playwright = createRequire(base)("playwright"); break; } catch {} }
if (!playwright) { console.error("Playwright not found."); process.exit(2); }

const css = pathToFileURL(join(root, "dist/clio.css")).href;
const js = pathToFileURL(join(root, "dist/clio.js")).href;
const eras = [["system6", "System 6"], ["system7", "System 7"], ["drawingboard", "Drawing Board"], ["platinum", "Platinum"]];

const strip = ([era, name]) => `<section data-era="${era}">
  <div class="window" style="width: 144px">
    <div class="title-bar">
      <button class="close" aria-label="Close"></button>
      <h2 class="title">Untitled</h2>
      <button class="resize" aria-label="Zoom"></button>
      <button class="shade" aria-label="Collapse"></button>
    </div>
    <div class="window-pane">
      <label><input type="checkbox" checked> Measured</label>
      <label><input type="radio" name="r-${era}" checked> Traced</label>
      <progress max="10" value="7"></progress>
      <div class="buttons"><button class="default">OK</button></div>
    </div>
  </div>
  <p class="label">${name}</p>
</section>`;

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="${css}"><script src="${js}" defer></script>
<style>
  html, body { margin: 0; }
  #card { width: 640px; height: 320px; display: grid; grid-template-rows: 84px 1fr; background: #fff; overflow: hidden; }
  header { padding: 18px 24px 0; border-bottom: 1px solid #000; }
  header h1 { margin: 0; font: 36px/1 "ChicagoFLF", sans-serif; letter-spacing: 0; }
  header p { margin: 8px 0 0; font: 12px/16px var(--clio-font-chrome); }
  main { display: grid; min-height: 0; grid-template-columns: repeat(4, 1fr); }
  section { background: var(--clio-desktop); display: grid; grid-template-rows: 1fr auto; justify-items: center; align-items: center; }
  section + section { border-left: 1px solid #000; }
  .label { margin: 0; justify-self: stretch; text-align: center; padding: 4px 0; background: #fff; color: #000;
           border-top: 1px solid #000; font: 12px/16px var(--clio-font-chrome); }
  .window-pane { display: flex; flex-direction: column; gap: 8px; padding: 10px; }
  .window-pane progress { width: 100%; }
  .buttons { display: flex; justify-content: flex-end; }
</style></head>
<body><div id="card">
  <header data-era="system6"><h1>clio.css</h1>
    <p>Classic Mac OS in CSS: four eras, every value traced to measured pixels</p></header>
  <main>${eras.map(strip).join("\n")}</main>
</div></body></html>`;

mkdirSync(join(root, ".fidelity"), { recursive: true });
const file = join(root, ".fidelity/social-preview.html");
writeFileSync(file, html);
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 320 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(file).href);
await page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
const out = join(root, "assets/social-preview.png");
await page.locator("#card").screenshot({ path: out, animations: "disabled", caret: "hide" });
await browser.close();
console.log(`wrote assets/social-preview.png (${statSync(out).size} bytes)`);
