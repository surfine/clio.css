// Pixel check: render clio.css Platinum specimens at 1x and compare them with
// the Mac OS 9.0 reference crops (GUIdebook captures) that AI System 6 keeps as
// evidence. The references are Apple screenshots, so they are read from a
// local AI System 6 checkout and never copied into this repository.
//
//   AIS6_DIR=/path/to/AI\ System\ 6 npm run fidelity
//
// Needs Playwright with Chromium: installed here, or found in AIS6_DIR.
// Writes side-by-side images to .fidelity/ (git-ignored).
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
const tiles = join(ais6, "internal/evidence/drafts/theme-lab-fidelity/platinum/tiles");
if (!existsSync(tiles)) {
  console.error(`No reference tiles at ${tiles}. Set AIS6_DIR to an AI System 6 checkout.`);
  process.exit(2);
}
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) {
  try { playwright = createRequire(base)("playwright"); break; } catch {}
}
if (!playwright) { console.error("Playwright not found (npm i -D playwright, or point AIS6_DIR at a checkout that has it)."); process.exit(2); }

// Each specimen: markup, the element to crop, the crop box, and the reference tile.
// The Appearance control panel has no zoom box: close and WindowShade only.
const W = (width, title, extra = "", cls = "window", zoom = false) => `<div class="${cls}" id="s" style="width:${width}px">
  <div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">${title}</h2>${zoom ? '<button class="resize" aria-label="Zoom"></button>' : ""}<button class="shade" aria-label="Collapse"></button></div>
  <div class="window-pane" style="height:40px">${extra}</div></div>`;
const specimens = [
  { id: "active-titlebar", html: W(476, "Appearance"), crop: [0, 0, 477, 22] },
  { id: "inactive-titlebar", html: W(424, "Web Sharing", "", "window inactive", true), crop: [0, 0, 424, 22] },
  { id: "default-ok", html: `<div style="padding:12px;background:#ddd"><button class="default" id="s" style="width:65px">OK</button></div>`, crop: [-4, -7, 73, 32] },
  { id: "button-disabled", html: `<div style="padding:12px;background:#ddd"><button id="s" disabled style="width:80px">Eject</button></div>`, crop: [0, 0, 80, 20] },
  { id: "checkbox-checked", html: `<div style="padding:12px;background:#ddd"><input type="checkbox" id="s" checked></div>`, crop: [0, 0, 12, 12] },
  { id: "checkbox-unchecked", html: `<div style="padding:12px;background:#ddd"><input type="checkbox" id="s"></div>`, crop: [0, 0, 12, 12] },
  { id: "selected-tab", html: `<div style="padding:12px;background:#ddd"><div role="tablist"><button role="tab" aria-selected="true" id="s" style="width:103px">Appearance</button></div></div>`, crop: [0, 0, 103, 24] },
];

const css = pathToFileURL(join(root, "dist/clio.css")).href;
const out = join(root, ".fidelity");
mkdirSync(out, { recursive: true });
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 400 }, deviceScaleFactor: 1 });
const results = [];
for (const s of specimens) {
  const html = `<!doctype html><html data-era="platinum"><head><link rel="stylesheet" href="${css}"><style>body{margin:0;padding:24px;background:#4a71ab}</style></head><body>${s.html}</body></html>`;
  const file = join(out, `${s.id}.html`);
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const box = await page.locator("#s").boundingBox();
  const [x, y, w, h] = s.crop;
  const shot = await page.screenshot({ clip: { x: box.x + x, y: box.y + y, width: w, height: h } });
  const ref = readFileSync(join(tiles, `${s.id}-reference.png`));
  const metrics = await page.evaluate(async ([a, b, name]) => {
    const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + b64; });
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const px = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const A = px(ia), B = px(ib);
    let exact = 0, off = 0, sum = 0;
    const diff = document.createElement("canvas"); diff.width = w * 3; diff.height = h; const g = diff.getContext("2d");
    g.drawImage(ib, 0, 0); g.drawImage(ia, w, 0);
    const d = g.createImageData(w, h);
    for (let i = 0; i < A.length; i += 4) {
      const m = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      sum += (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) / 3;
      if (m <= 8) exact++;
      if (m > 48) off++;
      d.data[i] = m > 48 ? 255 : m > 8 ? 255 : 255; d.data[i + 1] = m > 48 ? 0 : m > 8 ? 200 : 255; d.data[i + 2] = m > 48 ? 0 : m > 8 ? 0 : 255; d.data[i + 3] = 255;
    }
    g.putImageData(d, w * 2, 0);
    const n = A.length / 4;
    return { name, size: [w, h], exact: +(exact / n).toFixed(4), structural: +(off / n).toFixed(4), meanAbs: +(sum / n).toFixed(2), image: diff.toDataURL("image/png").split(",")[1] };
  }, [shot.toString("base64"), ref.toString("base64"), s.id]);
  writeFileSync(join(out, `${s.id}-compare.png`), Buffer.from(metrics.image, "base64"));
  delete metrics.image;
  results.push(metrics);
}
await browser.close();
console.log("specimen              size      exact   off>48  meanAbs   (reference | clio.css | diff in .fidelity/)");
for (const r of results) console.log(`${r.name.padEnd(21)} ${r.size.join("x").padEnd(9)} ${String(r.exact).padEnd(7)} ${String(r.structural).padEnd(7)} ${r.meanAbs}`);
writeFileSync(join(out, "results.json"), JSON.stringify(results, null, 2));
const date = new Date().toISOString().slice(0, 10);
writeFileSync(join(root, "FIDELITY.md"), `# Pixel check

Generated by \`npm run fidelity\` on ${date}: clio.css Platinum specimens rendered at 1x in Chromium,
compared with the Mac OS 9.0 reference crops (GUIdebook captures) kept as evidence in AI System 6.
The captures are Apple screenshots and are not part of this repository.

- **exact**: share of pixels within 8/255 of the reference on every channel.
- **off**: share of pixels more than 48/255 away (a different shape, not a shade).
- **mean**: mean absolute difference per channel, 0–255.

| Specimen | Size | exact | off | mean |
| --- | --- | ---: | ---: | ---: |
${results.map((r) => "| " + r.name + " | " + r.size.join("×") + " | " + (r.exact * 100).toFixed(1) + "% | " + (r.structural * 100).toFixed(1) + "% | " + r.meanAbs + " |").join("\n")}

What the remaining difference is, specimen by specimen:

- Title bars, buttons and the tab: almost every off pixel is in the label; the rest are a few corner
  pixels of the default ring and the right edge of the inactive frame, and the ragged end of the ridges. Charcoal is Apple's and is not shipped; the stand-in is Asap (OFL).
  On a Mac with Charcoal installed the label uses Charcoal.
- Check box, checked: the check mark is classic-stylesheets' drawing (MIT), not Apple's glyph.
- Box art inside the close and WindowShade boxes is a smooth gradient; the original steps in 2px bands.

System 6 has no comparable check yet: AI System 6's System 6 board compares against its own frozen
output, except the title bar, which was measured in an emulator at 2x.
`);
