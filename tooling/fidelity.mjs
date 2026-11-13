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

// System 6: crops of the System 6.0.8 frames from `npm run capture:system6`
// (.fidelity/system6), compared after thresholding to 1-bit. `ref` is the crop
// in the 512x342 frame; `crop` the same box around the clio.css element.
const s6dir = join(root, ".fidelity/system6");
const S6 = (id, html, crop, file, ref) => ({ id, era: "system6", html, crop, mono: true, refFile: join(s6dir, file + ".png"), refCrop: ref });
const s6Window = `<div class="window" id="s" style="width:240px;position:relative"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Macintosh HD</h2><button class="resize" aria-label="Zoom"></button></div><div class="details-bar"><span>2 items</span></div><div class="window-pane" style="height:80px"></div></div>`;
const s6Scroll = `<div class="clio-scroll" id="s" style="width:120px;height:120px;overflow:scroll;background:#fff"><div style="width:400px;height:400px"></div></div>`;
specimens.push(
  S6("s6-titlebar", s6Window, [1, 0, 240, 19], "hd-window", [0, 27, 240, 19]),
  S6("s6-default-ok", `<div class="clio" style="padding:12px;background:#fff"><button class="default" id="s" style="width:60px">OK</button></div>`, [-4, -4, 68, 28], "alert", [80, 154, 68, 28]),
  S6("s6-checkbox", `<div style="padding:12px;background:#fff"><input type="checkbox" id="s"></div>`, [0, 0, 12, 12], "get-info", [224, 52, 12, 12]),
  S6("s6-radio-on", `<div style="padding:12px;background:#fff"><input type="radio" id="s" checked></div>`, [0, 0, 12, 12], "control-panel", [359, 109, 12, 12]),
  S6("s6-radio-off", `<div style="padding:12px;background:#fff"><input type="radio" id="s"></div>`, [0, 0, 12, 12], "control-panel", [335, 109, 12, 12]),
  S6("s6-scroll-up", s6Scroll, [106, 0, 14, 14], "system-folder", [414, 102, 14, 14]),
  S6("s6-grow-box", s6Scroll, [106, 106, 14, 14], "system-folder", [414, 256, 14, 14]),
  S6("s6-scroll-left", s6Scroll, [0, 106, 14, 14], "hd-window", [0, 137, 14, 14]),
  S6("s6-scroll-right", s6Scroll, [91, 106, 14, 14], "hd-window", [209, 137, 14, 14]),
  S6("s6-checkbox-checked", `<div style="padding:12px;background:#fff"><input type="checkbox" id="s" checked></div>`, [0, 0, 12, 12], "get-info-checked", [224, 52, 12, 12]),
  S6("s6-button-pressed", `<div class="clio" style="padding:12px;background:#fff"><button class="active" id="s" style="width:60px">Cancel</button></div>`, [0, 0, 60, 20], "button-pressed", [164, 158, 60, 20]),
  S6("s6-button-hover", `<div class="clio" style="padding:12px;background:#fff"><button id="s" style="width:60px">Cancel</button></div>`, [0, 0, 60, 20], "button-hover", [164, 158, 60, 20]),
  S6("s6-popup-end", `<div class="clio" style="padding:12px;background:#fff"><select id="s" style="width:116px"><option>Macintosh HD</option></select></div>`, [105, 0, 12, 19], "save-dialog", [242, 107, 12, 19]),
  S6("s6-progress-fill", `<div style="padding:12px;background:#fff"><progress id="s" max="100" value="60" style="width:228px"></progress></div>`, [0, 0, 12, 12], "copy-progress", [109, 93, 12, 12]),
  S6("s6-menu-separator", `<div style="padding:12px;background:#fff"><ul class="menu" role="menu" style="width:146px"><li role="separator" id="s"></li></ul></div>`, [0, 0, 136, 16], "file-menu", [34, 164, 136, 16]),
);

const css = pathToFileURL(join(root, "dist/clio.css")).href;
const out = join(root, ".fidelity");
mkdirSync(out, { recursive: true });
const browser = await playwright.chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
const page = await browser.newPage({ viewport: { width: 800, height: 400 }, deviceScaleFactor: 1 });
const results = [];
for (const s of specimens) {
  if (s.refFile && !existsSync(s.refFile)) { console.log(`${s.id}: no reference (run npm run capture:system6)`); continue; }
  const html = `<!doctype html><html data-era="${s.era || "platinum"}"><head><link rel="stylesheet" href="${css}"><style>body{margin:0;padding:24px;background:#4a71ab}</style></head><body>${s.html}</body></html>`;
  const file = join(out, `${s.id}.html`);
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => document.fonts.ready);
  const box = await page.locator("#s").boundingBox();
  const [x, y, w, h] = s.crop;
  const shot = await page.screenshot({ clip: { x: box.x + x, y: box.y + y, width: w, height: h } });
  const ref = readFileSync(s.refFile || join(tiles, `${s.id}-reference.png`));
  const metrics = await page.evaluate(async ([a, b, name, refCrop, mono]) => {
    const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + b64; });
    let [ia, ib] = await Promise.all([load(a), load(b)]);
    if (refCrop) {
      const c = document.createElement("canvas"); c.width = refCrop[2]; c.height = refCrop[3];
      c.getContext("2d").drawImage(ib, refCrop[0], refCrop[1], refCrop[2], refCrop[3], 0, 0, refCrop[2], refCrop[3]);
      ib = await load(c.toDataURL("image/png").split(",")[1]);
    }
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const px = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const A = px(ia), B = px(ib);
    if (mono) for (const P of [A, B]) for (let i = 0; i < P.length; i += 4) { const v = (P[i] + P[i + 1] + P[i + 2]) / 3 < 128 ? 0 : 255; P[i] = P[i + 1] = P[i + 2] = v; }
    let exact = 0, off = 0, sum = 0;
    const diff = document.createElement("canvas"); diff.width = w * 3; diff.height = h; const g = diff.getContext("2d");
    const put = (P, x) => { const d = g.createImageData(w, h); d.data.set(P); g.putImageData(d, x, 0); };
    put(B, 0); put(A, w);
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
  }, [shot.toString("base64"), ref.toString("base64"), s.id, s.refCrop || null, !!s.mono]);
  writeFileSync(join(out, `${s.id}-compare.png`), Buffer.from(metrics.image, "base64"));
  delete metrics.image;
  results.push({ ...metrics, era: s.era || "platinum" });
}
await browser.close();
console.log("specimen              size      exact   off>48  meanAbs   (reference | clio.css | diff in .fidelity/)");
for (const r of results) console.log(`${r.name.padEnd(21)} ${r.size.join("x").padEnd(9)} ${String(r.exact).padEnd(7)} ${String(r.structural).padEnd(7)} ${r.meanAbs}`);
writeFileSync(join(out, "results.json"), JSON.stringify(results, null, 2));
const date = new Date().toISOString().slice(0, 10);
const row = (r) => "| " + r.name + " | " + r.size.join("×") + " | " + (r.exact * 100).toFixed(1) + "% | " + (r.structural * 100).toFixed(1) + "% | " + r.meanAbs + " |";
const table = (era) => "| Specimen | Size | exact | off | mean |\n| --- | --- | ---: | ---: | ---: |\n" + results.filter((r) => r.era === era).map(row).join("\n");
writeFileSync(join(root, "FIDELITY.md"), `# Pixel check

Generated by \`npm run fidelity\` on ${date}. clio.css specimens are rendered at 1x in Chromium
and compared pixel by pixel with real screens of each era. The real screens are Apple's pixels:
they are evidence only and are not part of this repository.

- **exact**: share of pixels within 8/255 of the reference on every channel.
- **off**: share of pixels more than 48/255 away (a different shape, not a shade).
- **mean**: mean absolute difference per channel, 0–255.

## System 6

Reference: System 6.0.8 running in Infinite Mac, the emulator's 512×342 canvas read 1:1
(\`npm run capture:system6\`). Both sides are thresholded to 1-bit before comparing, because
Infinite Mac tints black and white as #222222 and #eeeeee.

${table("system6")}

## Mac OS 9 Platinum

Reference: GUIdebook Mac OS 9.0 captures, cropped by AI System 6 (\`AIS6_DIR\`).

${table("platinum")}

## What the remaining difference is

- Labels and titles: almost every off pixel in the title bars, buttons and the tab is text.
  System 6's Chicago and Mac OS 9's Charcoal are Apple's bitmap and outline faces and are not
  shipped; clio.css draws ChicagoFLF (public domain) and Asap (OFL). On a Mac that has the
  original faces installed, the stacks use them.
- Platinum: a few corner pixels of the default ring, the right edge of the inactive frame and
  the ragged end of the ridges; the check mark is classic-stylesheets' drawing (MIT); the box
  art is a smooth gradient where the original steps in 2px bands.
`);
