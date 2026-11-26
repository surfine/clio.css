// Re-takes the System 6.0.8 reference frames that clio.css's System 6 values
// were measured from. It boots System 6.0.8 in Infinite Mac
// (https://infinitemac.org), drives the Finder with the mouse and keyboard, and
// reads the emulator's 512x342 canvas pixel for pixel (no screenshot scaling).
//
//   npm run capture:system6        -> .fidelity/system6/*.png (git-ignored)
//
// The frames are Apple's screen pixels: they are evidence for measurement and
// the pixel check, and are never committed or published. Infinite Mac draws
// 1-bit black and white as #222222 and #eeeeee; the pixel check thresholds both
// sides to pure black and white before comparing.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".fidelity/system6");
mkdirSync(out, { recursive: true });
import playwright from "playwright";

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto("https://infinitemac.org/1991/System%206.0.8", { waitUntil: "domcontentloaded" });

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
  if (Date.now() - t0 > 180000) { console.error("System 6 did not boot in 3 minutes."); process.exit(1); }
}
await page.waitForTimeout(20000); // let the extra disks mount and the desktop settle
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

// Ink share in a canvas rectangle (Infinite Mac draws black as #222).
const ink = (x, y, w, h) => page.evaluate(([x, y, w, h]) => {
  const d = document.querySelector("canvas").getContext("2d").getImageData(x, y, w, h).data;
  let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 128) k++; return k / (d.length / 4);
}, [x, y, w, h]);
// Select the desktop document "Welcome!" and confirm its name tag inverted.
const selectWelcome = async () => {
  for (let i = 0; i < 5; i++) { await click(472, 104); await wait(800); if (await ink(455, 126, 35, 6) > 0.6) return; }
  throw new Error("could not select Welcome! on the desktop");
};
const away = async () => { await move(300, 330); await wait(300); };

// Desktop icon positions are those of Infinite Mac's System 6.0.8 image.
await click(472, 50); await cmd("o"); await dump("hd-window");             // Macintosh HD, active
await move(53, 9); await page.mouse.down(); await wait(1200);
await move(70, 120); await move(70, 187); await wait(900); await dump("file-menu"); // File menu, Page Setup highlighted
await page.mouse.up(); await wait(5000); await dump("alert");              // no printer: stop alert, default OK
await page.keyboard.press("Enter"); await wait(2000);

// Finder copy progress: duplicate System Folder; keep the first frame with the bar.
await click(67, 95); await page.keyboard.down("Meta"); await page.keyboard.press("d"); await page.keyboard.up("Meta");
for (let i = 0; i < 30; i++) {
  await wait(200);
  if (await ink(109, 93, 228, 1) > 0.95 && await ink(110, 95, 20, 8) > 0.5) { await dump("copy-progress"); break; }
}
await wait(12000);

await click(67, 95); await cmd("o"); await dump("system-folder");         // active scroll bar and grow box
await selectWelcome(); await cmd("i"); await dump("get-info");             // Locked check box
await click(229, 57); await away(); await wait(600); await dump("get-info-checked");
await cmd("w", 1500);
await move(11, 9); await page.mouse.down(); await wait(1200);
await move(40, 100); await move(40, 140); await wait(800);
await page.mouse.up(); await wait(6000); await dump("control-panel");      // radio buttons, edit text

// TeachText: the locked document raises an alert with OK and Cancel.
await selectWelcome(); await cmd("o", 6000); await dump("locked-alert");
await move(193, 167); await wait(800); await dump("button-hover");
await page.mouse.down(); await wait(900); await dump("button-pressed");
await away(); await page.mouse.up(); await wait(600);
await page.keyboard.press("Enter"); await wait(5000);
await page.keyboard.press("Enter"); await wait(3000);                      // TeachText's own lock notice
// Save As: Standard File with a list box, a pop-up and edit text.
await move(53, 9); await page.mouse.down(); await wait(1200);
await move(60, 60); await move(60, 107); await wait(800);
await page.mouse.up(); await wait(4000); await dump("save-dialog");
await click(160, 137); await wait(1200); await away(); await dump("list-selected");
await move(195, 116); await page.mouse.down(); await wait(1200); await dump("popup-held");
await away(); await page.mouse.up(); await wait(800);
await click(343, 266); await wait(1500); await cmd("q", 4000);             // Cancel, quit TeachText

await browser.close();
