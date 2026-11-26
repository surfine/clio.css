// Renders assets/og.png (1200x630) with clio.css itself. Needs Playwright
// (installed here).
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
const root = join(dirname(fileURLToPath(import.meta.url)), "..");
import playwright from "playwright";
const css = pathToFileURL(join(root, "dist/clio.css")).href;
const win = (title, body) => `<div class="window" style="width:360px">
  <div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">${title}</h2><button class="resize" aria-label="Zoom"></button><button class="shade" aria-label="Collapse"></button></div>
  <div class="details-bar"><span>3 items</span><span>clio.css</span></div>
  <div class="window-pane" style="height:250px;font-size:12px">${body}</div></div>`;
const body = `<p style="font-family:var(--clio-font-chrome);font-size:12px;margin:0 0 12px">Classic Mac OS interfaces in CSS.</p>
  <div class="field-row" style="margin-bottom:12px"><label><input type="checkbox" checked> Measured</label><label><input type="radio" checked name="r"> Traced</label></div>
  <div class="field-row" style="margin-bottom:12px"><label>Era:</label><select><option>System 6</option></select></div>
  <progress max="10" value="7" style="margin-bottom:16px"></progress>
  <div class="field-row" style="justify-content:flex-end;gap:16px"><button>Cancel</button><button class="default">OK</button></div>`;
const html = `<!doctype html><html data-era="system6"><head><link rel="stylesheet" href="${css}">
<style>body{margin:0;width:1200px;height:630px;display:flex;flex-direction:column;background:#fff;font-family:-apple-system,Helvetica,Arial,sans-serif}
.row{flex:1;display:flex;align-items:center;justify-content:center}
.s6{background:var(--clio-desktop)}.half{flex:1;height:100%;display:flex;align-items:center;justify-content:center}
h1{margin:0;padding:22px 40px 18px;font:400 44px/1 "ChicagoFLF";border-bottom:1px solid #000}h1 span{font:20px -apple-system,Helvetica,sans-serif;color:#444;margin-left:20px}</style></head>
<body><h1>clio.css<span>System 6, System 7 and Mac OS 9 Platinum, measured</span></h1><div class="row">
<div class="half s6">${win("System 6", body.replace('name="r"', 'name="r6"'))}</div>
<div class="half" data-era="system7" style="background:var(--clio-desktop)">${win("System 7", body.replace('name="r"', 'name="r7"'))}</div>
<div class="half" data-era="platinum" style="background:var(--clio-desktop)">${win("Platinum", body.replace('name="r"', 'name="r9"'))}</div></div></body></html>`;
const file = join(root, ".fidelity/og.html");
writeFileSync(file, html);
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(file).href);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: join(root, "assets/og.png") });
await browser.close();
console.log("wrote assets/og.png");
