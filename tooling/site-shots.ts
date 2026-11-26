// Full-page screenshots of the docs site (docs/index.html) in every era and engine, to prove
// a change to how the site is made leaves what it shows alone (P6).
//
//   node tooling/site-shots.ts capture <dir>      docs/index.html?era=<era> in Chromium, WebKit, Firefox
//   node tooling/site-shots.ts compare <a> <b>    the same shots, pixel by pixel
import { mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { chromium, firefox, webkit } from "playwright";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ERAS = ["system6", "system7", "drawingboard", "platinum", "nextstep"];
const ENGINES = { chromium, webkit, firefox };
const [mode, a, b] = process.argv.slice(2);

if (mode === "capture" && a) {
  mkdirSync(a, { recursive: true });
  for (const [name, engine] of Object.entries(ENGINES)) {
    const browser = await engine.launch();
    for (const era of ERAS) {
      // a fresh context: the page keeps the chosen era in localStorage
      const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
      await page.goto(`${pathToFileURL(join(root, "docs/index.html")).href}?era=${era}`);
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(400);   // clio.js lays out scroll bars and centred labels on the next frames
      await page.screenshot({ path: join(a, `${name}-${era}.png`), fullPage: true, animations: "disabled", caret: "hide" });
      await page.close();
    }
    await browser.close();
    console.log(`${name}: ${ERAS.length} shots`);
  }
} else if (mode === "compare" && a && b) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  let bad = 0;
  for (const f of readdirSync(a).filter((f) => f.endsWith(".png")).sort()) {
    const pa = readFileSync(join(a, f)), pb = readFileSync(join(b, f));
    if (pa.equals(pb)) { console.log(`same  ${f}`); continue; }
    const r = await page.evaluate(async ([x, y]) => {
      const load = async (s: string) => { const i = new Image(); i.src = "data:image/png;base64," + s; await i.decode(); return i; };
      const [ia, ib] = [await load(x), await load(y)];
      if (ia.width !== ib.width || ia.height !== ib.height) return `size ${ia.width}x${ia.height} vs ${ib.width}x${ib.height}`;
      const px = (i: HTMLImageElement) => { const c = new OffscreenCanvas(i.width, i.height); const g = c.getContext("2d")!; g.drawImage(i, 0, 0); return g.getImageData(0, 0, i.width, i.height).data; };
      const [da, db] = [px(ia), px(ib)];
      let n = 0, top = -1;
      for (let k = 0; k < da.length; k += 4) if (da[k] !== db[k] || da[k + 1] !== db[k + 1] || da[k + 2] !== db[k + 2]) { n++; if (top < 0) top = Math.floor(k / 4 / ia.width); }
      return n ? `${n} pixels differ, first at y=${top}` : null;
    }, [pa.toString("base64"), pb.toString("base64")] as const);
    if (r) { bad++; console.log(`DIFF  ${f}: ${r}`); } else console.log(`same  ${f} (pixels; encoding differs)`);
  }
  await browser.close();
  console.log(bad ? `${bad} shots differ` : "all shots identical");
  process.exit(bad ? 1 : 0);
} else {
  console.error("usage: site-shots.ts capture <dir> | compare <a> <b>");
  process.exit(2);
}
