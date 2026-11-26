// Renders assets/social-preview.png (1280x640), the image for GitHub's Settings >
// Social preview: one window drawn by dist/clio.css in each of the four Classic eras and by
// dist/clio.nextstep.css in NeXTSTEP, on that
// era's own desktop. One labelled column per era. Laid out at 640x320 and captured at 2x, where clio.css magnifies
// its art by nearest neighbour, so every Mac pixel is a 2x2 block. Nothing is drawn by
// hand. Run `npm run build` first. Needs Playwright (installed here).
import { mkdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
import playwright from "playwright";

const css = pathToFileURL(join(root, "dist/clio.css")).href;
const js = pathToFileURL(join(root, "dist/clio.js")).href;
const nxcss = pathToFileURL(join(root, "dist/clio.nextstep.css")).href;
const eras: [string, string][] = [["system6", "System 6"], ["system7", "System 7"], ["drawingboard", "Drawing Board"], ["platinum", "Platinum"], ["nextstep", "NeXTSTEP"]];
const attr = (t: string): string => t.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

const strip = ([era, name]: [string, string]): string => `<section data-era="${era}">
  <div class="window" style="width: 112px">
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

// NeXTSTEP's column: the same markup in a frame that loads clio.nextstep.css (a page's whole stylesheet).
const STYLE = `section { background: var(--clio-desktop); display: grid; grid-template-rows: 1fr auto; justify-items: center; align-items: center; height: 100%; }
  .label { margin: 0; justify-self: stretch; text-align: center; padding: 4px 0; background: #fff; color: #000;
           border-top: 1px solid #000; font: 12px/16px var(--clio-font-chrome); }
  .window-pane { display: flex; flex-direction: column; gap: 8px; padding: 10px; }
  .window-pane progress { width: 100%; }
  .buttons { display: flex; justify-content: flex-end; }`;
const column = (e: [string, string]): string => e[0] !== "nextstep" ? strip(e) : `<iframe title="${e[1]}" srcdoc="${attr(`<!doctype html><html lang="en"><head><meta charset="utf-8"><link rel="stylesheet" href="${nxcss}"><style>html, body { margin: 0; height: 100%; } ${STYLE}</style></head><body>${strip(e)}</body></html>`)}"></iframe>`;
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="${css}"><script src="${js}" defer></script>
<style>
  html, body { margin: 0; }
  #card { width: 640px; height: 320px; display: grid; grid-template-rows: 84px 1fr; background: #fff; overflow: hidden; }
  header { padding: 18px 24px 0; border-bottom: 1px solid #000; }
  header h1 { margin: 0; font: 36px/1 "ChicagoFLF", sans-serif; letter-spacing: 0; }
  header p { margin: 8px 0 0; font: 12px/16px var(--clio-font-chrome); }
  main { display: grid; min-height: 0; grid-template-columns: repeat(5, 1fr); }
  main > * + * { border-left: 1px solid #000; }
  iframe { display: block; width: 100%; height: 100%; border: 0; border-left: 1px solid #000; box-sizing: border-box; }
  ${STYLE}
</style></head>
<body><div id="card">
  <header data-era="system6"><h1>clio.css</h1>
    <p>Classic Mac OS and NeXTSTEP in CSS: five eras, every value traced to measured pixels</p></header>
  <main>${eras.map(column).join("\n")}</main>
</div></body></html>`;

mkdirSync(join(root, ".fidelity"), { recursive: true });
const file = join(root, ".fidelity/social-preview.html");
writeFileSync(file, html);
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 640, height: 320 }, deviceScaleFactor: 2 });
await page.goto(pathToFileURL(file).href);
await page.evaluate(async () => { await document.fonts.ready; for (const f of document.querySelectorAll("iframe")) await f.contentDocument!.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
const out = join(root, "assets/social-preview.png");
await page.locator("#card").screenshot({ path: out, animations: "disabled", caret: "hide" });
await browser.close();
console.log(`wrote assets/social-preview.png (${statSync(out).size} bytes)`);
