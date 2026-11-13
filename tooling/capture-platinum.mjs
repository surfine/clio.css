// Captures Mac OS 9.0 (Platinum) from Infinite Mac: Finder windows and menus,
// the Control Strip in all its states, and the Appearance, Date & Time,
// General Controls and Energy Saver control panels. The 800x600 canvas is read
// pixel for pixel.
//
//   npm run capture:platinum   -> .fidelity/platinum9/*.png (git-ignored)
//
// The frames are Apple's screen pixels: they are evidence for measurement and
// the pixel check, and are never committed or published.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".fidelity/platinum9");
mkdirSync(out, { recursive: true });
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) { try { playwright = createRequire(base)("playwright"); break; } catch {} }
if (!playwright) { console.error("Playwright not found."); process.exit(2); }

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto("https://infinitemac.org/1999/Mac%20OS%209.0", { waitUntil: "domcontentloaded" });
const t0 = Date.now();
for (;;) {
  await page.waitForTimeout(3000);
  const ok = await page.evaluate(() => {
    const c = document.querySelector("canvas"); if (!c) return false;
    const d = c.getContext("2d").getImageData(0, 0, c.width, 22).data;
    let w = 0, b = 0;
    for (let x = 0; x < c.width; x++) { if (d[(5 * c.width + x) * 4] > 200) w++; if (d[(19 * c.width + x) * 4] < 50) b++; }
    return w > c.width * 0.6 && b > c.width * 0.9;
  });
  if (ok) break;
  if (Date.now() - t0 > 180000) { console.error("Mac OS 9 did not boot in 3 minutes."); process.exit(1); }
}
// The menu bar is drawn long before the Finder has opened its windows and the Control Strip.
await page.waitForTimeout(120000);
const box = await page.locator("canvas").boundingBox();
const at = (x, y) => [box.x + x + 0.5, box.y + y + 0.5];
const wait = (ms) => page.waitForTimeout(ms);
const move = async (x, y) => { await page.mouse.move(...at(x, y), { steps: 4 }); await wait(150); };
const click = async (x, y) => { await move(x, y); await page.mouse.down(); await wait(120); await page.mouse.up(); await wait(400); };
const away = () => move(600, 590);
const dump = async (name) => {
  const b64 = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png").split(",")[1]);
  writeFileSync(join(out, `${name}.png`), Buffer.from(b64, "base64"));
  console.log("captured", name);
};
const hold = async (x, y, name) => { await move(x, y); await page.mouse.down(); await wait(1000); await dump(name); await away(); await page.mouse.up(); await wait(800); };
const cmd = async (k) => { await page.keyboard.down("Meta"); await wait(150); await page.keyboard.press(k); await wait(150); await page.keyboard.up("Meta"); await wait(3000); };
// Apple menu > Control Panels (row y=104) > the item at y (16px rows from Appearance at y=83).
const panel = async (y, peek) => {
  await move(18, 9); await page.mouse.down(); await wait(800); await move(60, 60); await move(60, 104); await wait(1200);
  await move(220, 104); await wait(600); await move(240, y); await wait(800);
  if (peek) await dump(peek);
  await page.mouse.up(); await wait(12000);
};

// 1. Finder: window, menus, the Control Strip.
await away(); await dump("finder");
await hold(52, 9, "file-menu");
await hold(130, 586, "strip-slider");      // Sound volume module
await hold(30, 586, "strip-menu");         // Keychain module
await click(176, 586); await wait(1500); await away(); await dump("strip-collapsed");
await click(10, 586); await wait(1500); await away(); await dump("strip-expanded");
// 2. Control panels.
await panel(83, "cp-menu");                // Appearance
await away(); await dump("appearance");
await cmd("w");
await panel(179); await away(); await dump("date-time"); await cmd("w");
await panel(275); await away(); await dump("general-controls"); await cmd("w");
await panel(211); await away(); await dump("energy-saver");
await browser.close();
