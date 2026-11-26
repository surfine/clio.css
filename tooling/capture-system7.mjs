// Re-takes the System 7.5.3 reference frames for clio.css's System 7 values.
// It boots System 7.5.3 in Infinite Mac (https://infinitemac.org), drives the
// Finder, and reads the emulator's 800x600 colour canvas pixel for pixel.
//
//   npm run capture:system7        -> .fidelity/system7/*.png (git-ignored)
//
// The frames are Apple's screen pixels: they are evidence for measurement and
// the pixel check, and are never committed or published. Infinite Mac draws
// System 6's 1-bit black and white as #222222 and #eeeeee; the pixel check thresholds both
// sides to pure black and white before comparing (System 6 only; System 7 is
// compared in colour).
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".fidelity/system7");
mkdirSync(out, { recursive: true });
import playwright from "playwright";

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto("https://infinitemac.org/1996/System%207.5.3", { waitUntil: "domcontentloaded" });

// Booted when the menu bar is drawn: row 5 mostly white, row 19 a black rule.
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
  if (Date.now() - t0 > 180000) { console.error("System 7 did not boot in 3 minutes."); process.exit(1); }
}
await page.waitForTimeout(25000); // let the extra disks mount and the desktop settle
const box = await page.locator("canvas").boundingBox();
const at = (x, y) => [box.x + x + 0.5, box.y + y + 0.5];
const wait = (ms) => page.waitForTimeout(ms);
const move = async (x, y) => { await page.mouse.move(...at(x, y), { steps: 4 }); await wait(150); };
const click = async (x, y) => { await move(x, y); await page.mouse.down(); await wait(120); await page.mouse.up(); await wait(400); };
const cmd = async (k) => { await page.keyboard.down("Meta"); await wait(150); await page.keyboard.press(k); await wait(150); await page.keyboard.up("Meta"); await wait(3000); };
const dump = async (name) => {
  const b64 = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png").split(",")[1]);
  writeFileSync(join(out, `${name}.png`), Buffer.from(b64, "base64"));
  console.log("captured", name);
};

const away = async () => { await move(600, 560); await wait(300); };
const hold = async (x, y, name) => { await move(x, y); await page.mouse.down(); await wait(1000); await dump(name); await away(); await page.mouse.up(); await wait(600); };

// The Infinite HD window opens at x29-405, y55-293; click its title to bring the Finder forward.
await click(250, 64); await wait(1500); await dump("hd-window");
await hold(39, 64, "held-close");
await hold(390, 64, "held-zoom");
await move(53, 9); await page.mouse.down(); await wait(1200);
await move(70, 150); await move(70, 251); await wait(800); await dump("file-menu");     // Page Setup highlighted
await page.mouse.up(); await wait(6000); await dump("page-setup");
await page.keyboard.press("Enter"); await wait(2500);
// Control panels from the Apple menu's Control Panels submenu (rows of 16px from y=27).
const controlPanel = async (y, name) => {
  await move(18, 9); await page.mouse.down(); await wait(1200); await move(60, 100); await move(60, 150); await wait(1200);
  await move(150, 150); await move(230, 151); await wait(400); await move(230, y); await wait(700);
  await page.mouse.up(); await wait(20000); await dump(name);
  await cmd("w", 2000);
};
await controlPanel(243, "general-controls");    // check boxes, radio buttons, group boxes
await controlPanel(387, "numbers");             // pop-up menu, edit text, group boxes
await click(250, 64); await wait(1000);
// Control Panels & Extensions: active scroll bars over the inactive Infinite HD window.
await click(100, 125); await wait(600); await cmd("o", 4000); await dump("folder-window");
await cmd("w", 2000);
// Finder copy progress: duplicate Graphics; keep the first frame with a filled bar.
await click(100, 185); await page.keyboard.down("Meta"); await page.keyboard.press("d"); await page.keyboard.up("Meta");
for (let i = 0; i < 80; i++) {
  await wait(300);
  const filled = await page.evaluate(() => { const d = document.querySelector("canvas").getContext("2d").getImageData(272, 186, 6, 4).data; return d[0] === 0x44 && d[1] === 0x44; });
  if (filled) { await dump("copy-progress"); break; }
}
await browser.close();
