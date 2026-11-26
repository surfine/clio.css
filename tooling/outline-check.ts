// The outline clio.js drags, against the pixels a real drag inverts: for each era, the
// pixels that differ between an emulator frame before the drag and one during it (less
// the pointer) must be exactly the pixels clio.js's outline inverts on a black page.
//   CLIO_ENGINE=chromium|webkit|firefox node tooling/outline-check.ts
// Frames (git-ignored, see tooling/emulator/measure-classic.sh): .fidelity/system6/window-drag*.png
// (System 6.0.8, Macintosh HD dragged by 80,113), .fidelity/system7/window-drag*.png (System
// 7.5.3, Infinite HD dragged by 80,116), .fidelity/platinum9/window-drag*.png (Mac OS 9.0, the same).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
import playwright from "playwright";
type Engine = "chromium" | "webkit" | "firefox";
type Box = { x: number; y: number };
const ENGINE = (process.env.CLIO_ENGINE || "chromium") as Engine;

// era, frames, the window's frame rect on the screen (left, top, width, pane height), the
// drag, and the pointer's boxes in the two frames (left out).
const PH_DB = +(process.env.PH_DB || 218);
interface Case { era: string; dir: string; win: number[]; d: number[]; pointer: number[][]; allow?: [number, number] }
const cases: Case[] = [
  { era: "system6", dir: "system6", win: [-1, 27, 240, 105], d: [80, 113], pointer: [[195, 33, 21, 28], [275, 146, 21, 25]] },
  { era: "system7", dir: "system7", win: [29, 55, 376, 218], d: [80, 116], pointer: [[295, 60, 21, 23], [375, 176, 21, 23]] },
  // Drawing Board: the frame (387x246) and its shadow, with the corner patches of tooling/db-outline.py.
  { era: "drawingboard", dir: "drawingboard", win: [23, 52, 387, PH_DB], d: [80, 116], pointer: [[295, 57, 21, 24], [375, 173, 21, 24]] },
  { era: "platinum", dir: "platinum9", win: [24, 52, 386, 219], d: [80, 116], pointer: [[295, 56, 21, 25], [375, 172, 21, 25]] },
];
const OFF = 100;   // the page offset of the screen: even, so every parity is kept
const browser = await playwright[ENGINE].launch();
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } });
let failed = 0;
for (const c of cases) {
  const before = join(root, ".fidelity", c.dir, "window-drag-before.png"), during = join(root, ".fidelity", c.dir, "window-drag.png");
  if (!existsSync(before) || !existsSync(during)) { console.log(`${c.era}: no frames (tooling/emulator/measure-classic.sh)`); continue; }
  const [l, t, w, ph] = c.win;
  const file = join(root, ".fidelity", `outline-${c.era}-${ENGINE}.html`);
  writeFileSync(file, `<!doctype html><html data-era="${c.era}"><head><meta charset="utf-8"><link rel="stylesheet" href="${pathToFileURL(join(root, "dist/clio.css")).href}"></head><body style="margin:0;background:#000;width:1000px;height:800px"><div class="window" id="w" style="position:absolute;left:${l + OFF}px;top:${t + OFF}px;width:${w}px;opacity:0"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">HD</h2><button class="resize" aria-label="Zoom"></button></div><div class="window-pane" style="height:${ph}px"></div></div><script src="${pathToFileURL(join(root, "dist/clio.js")).href}"></script></body></html>`);
  await page.goto(pathToFileURL(file).href);
  const r = await page.locator("#w").boundingBox();
  if (!r) throw new Error(`${c.era}: #w has no box`);
  await page.mouse.move(r.x + 150, r.y + 8); await page.mouse.down();
  await page.mouse.move(r.x + 150 + c.d[0], r.y + 8 + c.d[1], { steps: 5 });
  await page.waitForTimeout(300);   // the outline's mask pictures (Drawing Board) load
  const shot = (await page.screenshot()).toString("base64");
  await page.mouse.up();
  const res = await page.evaluate(async ([a, b, s, pointer, off]: [string, string, string, number[][], number]) => {
    const load = (b64: string) => new Promise<HTMLImageElement>((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = "data:image/png;base64," + b64; });
    const px = (img: HTMLImageElement): [Uint8ClampedArray, number, number] => { const k = document.createElement("canvas"); k.width = img.width; k.height = img.height; const g = k.getContext("2d")!; g.drawImage(img, 0, 0); return [g.getImageData(0, 0, img.width, img.height).data, img.width, img.height]; };
    const [A, W, H] = px(await load(a)), [B] = px(await load(b)), [S, SW] = px(await load(s));
    const skip = (x: number, y: number) => pointer.some(([px0, py0, pw, phh]) => x >= px0 && x < px0 + pw && y >= py0 && y < py0 + phh);
    let both = 0, onlyRef = 0, onlyClio = 0; const odd: string[] = [];
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      if (skip(x, y)) continue;
      const i = (y * W + x) * 4, ref = A[i] !== B[i] || A[i + 1] !== B[i + 1] || A[i + 2] !== B[i + 2];
      const j = ((y + off) * SW + x + off) * 4, clio = x + off >= 0 && S[j] > 128;
      if (ref && clio) both++; else if (ref || clio) { if (ref) onlyRef++; else onlyClio++; if (odd.length < 6) odd.push(`${ref ? "mac" : "clio"} ${x},${y}`); }
    }
    return { both, onlyRef, onlyClio, odd };
  }, [readFileSync(before).toString("base64"), readFileSync(during).toString("base64"), shot, c.pointer, OFF] as [string, string, string, number[][], number]);
  const [aRef, aClio] = c.allow ?? [0, 0];
  const ok = res.onlyRef <= aRef && res.onlyClio <= aClio && res.both > 0;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FAIL"} ${c.era}: ${res.both} pixels inverted by both, ${res.onlyRef} only on the Mac, ${res.onlyClio} only by clio.js (${ENGINE})${res.odd.length ? ": " + res.odd.join("; ") : ""}`);
}
await browser.close();
process.exit(failed ? 1 : 0);
