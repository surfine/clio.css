// Captures Drawing Board, the appearance theme that shipped only in Mac OS 8.5
// betas (8.5b6) and was cut from the release. Infinite Mac has no
// beta build, so this boots Mac OS 8.5, installs the theme file and restarts:
//   1. Get Mac-OS-8-5b6-Beta-Themes.sit yourself (SHA-1 28a30da6f393aa020f3f37e4b0eb661844a0da26,
//      macintoshrepository.org, "Appearance Manager themes & add-ons").
//   2. CLIO_DB_SIT=/path/to/Mac-OS-8-5b6-Beta-Themes.sit npm run capture:drawingboard
// The script unpacks it with `unar`, re-zips the theme with its resource fork
// (`ditto`, macOS only), drops the zip into the emulator, routes the theme into
// the System Folder, restarts, selects it in Appearance and reads the 800x600
// canvas pixel for pixel. Neither the theme nor the frames are ever committed.
//
//   -> .fidelity/drawingboard/*.png (git-ignored)
//
// The frames are Apple's screen pixels: they are evidence for measurement and
// the pixel check, and are never committed or published.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync, readFileSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".fidelity/drawingboard");
const sit = process.env.CLIO_DB_SIT;
if (!sit || !existsSync(sit)) { console.error("Set CLIO_DB_SIT to Mac-OS-8-5b6-Beta-Themes.sit (see the header)."); process.exit(2); }
const work = join(root, ".fidelity/drawingboard-work");
rmSync(work, { recursive: true, force: true }); mkdirSync(join(work, "x"), { recursive: true }); mkdirSync(join(work, "pack/DB"), { recursive: true });
execFileSync("unar", ["-q", "-o", join(work, "x"), sit]);
execFileSync("cp", ["-p", join(work, "x/Mac OS 8.5b6 Beta Themes/Drawing Board/Drawing Board"), join(work, "pack/DB/")]);
execFileSync("ditto", ["-c", "-k", "--sequesterRsrc", "--keepParent", "DB", "../DrawingBoard.zip"], { cwd: join(work, "pack") });
const zip = readFileSync(join(work, "DrawingBoard.zip")).toString("base64");
mkdirSync(out, { recursive: true });
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) { try { playwright = createRequire(base)("playwright"); break; } catch {} }
if (!playwright) { console.error("Playwright not found."); process.exit(2); }

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto("https://infinitemac.org/1998/Mac%20OS%208.5", { waitUntil: "domcontentloaded" });

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
  if (Date.now() - t0 > 180000) { console.error("Mac OS 8.5 did not boot in 3 minutes."); process.exit(1); }
}
await page.waitForTimeout(30000); // let the extra disks mount and the desktop settle
const box = await page.locator("canvas").boundingBox();
const at = (x, y) => [box.x + x + 0.5, box.y + y + 0.5];
const wait = (ms) => page.waitForTimeout(ms);
const move = async (x, y) => { await page.mouse.move(...at(x, y), { steps: 4 }); await wait(150); };
const click = async (x, y) => { await move(x, y); await page.mouse.down(); await wait(120); await page.mouse.up(); await wait(400); };
const cmd = async (k, ms = 3000) => { await page.keyboard.down("Meta"); await wait(150); await page.keyboard.press(k); await wait(150); await page.keyboard.up("Meta"); await wait(ms); };
const dump = async (name) => {
  const b64 = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png").split(",")[1]);
  writeFileSync(join(out, `${name}.png`), Buffer.from(b64, "base64"));
  console.log("captured", name);
};

const drag = async (x0, y0, x1, y1) => { await move(x0, y0); await page.mouse.down(); await wait(400); for (let i = 1; i <= 20; i++) await move(x0 + (x1 - x0) * i / 20, y0 + (y1 - y0) * i / 20); await wait(600); await page.mouse.up(); await wait(2500); };
const away = async () => { await move(600, 590); await wait(300); };
const menuBarUp = () => page.evaluate(() => { const c = document.querySelector("canvas"); const d = c.getContext("2d").getImageData(0, 0, c.width, 22).data; let w = 0; for (let x = 0; x < c.width; x++) if (d[(6 * c.width + x) * 4] > 180) w++; return w > c.width * 0.5; });

// 1. Drop the zipped theme; Infinite Mac expands it into The Outside World:Downloads.
await page.evaluate(async (b64) => {
  const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const dt = new DataTransfer(); dt.items.add(new File([bin], "DrawingBoard.zip", { type: "application/zip" }));
  const t = document.querySelector("canvas"); const r = t.getBoundingClientRect();
  for (const e of ["dragenter", "dragover", "drop"]) t.dispatchEvent(new DragEvent(e, { dataTransfer: dt, bubbles: true, cancelable: true, clientX: r.x + 200, clientY: r.y + 200 }));
}, zip);
await wait(15000);
// 2. The Outside World > Downloads > DrawingBoard > DB, move that window aside, open Macintosh HD.
await click(753, 228); await wait(800); await cmd("o", 4000);
for (let i = 0; i < 3; i++) { await click(45, 88); await wait(800); await cmd("o", 4000); }
await drag(200, 27, 560, 330);
await click(737, 55); await wait(800); await cmd("o", 4000);
// 3. Drag the theme onto System Folder; the Finder offers to put it in Theme Files.
await drag(407, 382, 193, 148); await wait(4000);
await page.keyboard.press("Enter"); await wait(8000);
// 4. Special > Restart, so Appearance Manager sees the new theme.
await click(737, 55); await wait(1200);
await move(178, 9); await page.mouse.down(); await wait(1300); await move(190, 60); await move(190, 103); await wait(600); await page.mouse.up();
await wait(20000);
for (let i = 0; i < 60 && !(await menuBarUp()); i++) await wait(3000);
await wait(25000);
// 5. Apple menu > Control Panels > Appearance; Appearance tab; choose Drawing Board.
// Apple menu > Control Panels > item at y. The Control Panels row is at y=176 in
// Platinum (16px rows) and y=194 in Drawing Board (20px rows for items with icons).
const appleSub = async (y, peek, cp = 176) => {
  await move(18, 9); await page.mouse.down(); await wait(1300);
  await move(60, 120); await move(60, cp); await wait(1300);
  await move(150, cp); await move(240, cp + 1); await wait(600); await move(240, 120); await move(240, y); await wait(1000);
  if (peek) await dump(peek);
  await page.mouse.up(); await wait(15000);
};
await appleSub(84);
await click(293, 110); await wait(4000);
await move(367, 152); await page.mouse.down(); await wait(1500); await move(367, 160); await move(367, 168); await wait(700); await page.mouse.up();
await wait(15000); await away(); await dump("appearance");
await move(367, 152); await page.mouse.down(); await wait(1500); await dump("popup-open"); await away(); await page.mouse.up(); await wait(1000);
await click(200, 110); await wait(4000); await away(); await dump("themes-tab");
await move(570, 380); await page.mouse.down(); await wait(1000); await dump("button-held"); await away(); await page.mouse.up(); await wait(1500);
await page.keyboard.press("Escape"); await wait(1500);        // dismiss Save Theme if it opened
await click(432, 110); await wait(4000); await away(); await dump("desktop-tab");   // pattern list box
await cmd("w", 3000);
// 6. Finder windows, menus and a control panel in Drawing Board.
await click(737, 55); await wait(1200); await dump("finder");
await move(52, 9); await page.mouse.down(); await wait(1300); await dump("file-menu"); await away(); await page.mouse.up(); await wait(800);
await move(90, 9); await page.mouse.down(); await wait(1300); await dump("edit-menu"); await away(); await page.mouse.up(); await wait(800);

// Control panels with check boxes, radio buttons, group boxes and push buttons.
// The submenu's text rows are 18px from Appearance at y=37. Energy Saver's
// start-up notice (a plain dialog with a default button) shows over the first.
await appleSub(181, "control-panels-menu", 194);                 // Energy Saver
await away(); await dump("energy-saver-alert"); await page.keyboard.press("Enter"); await wait(3000); await cmd("q", 3000);
await appleSub(145, null, 194);                                  // Date & Time
await away(); await dump("date-time"); await cmd("w", 3000);
await appleSub(271, null, 194);                                  // General Controls
await away(); await dump("general-controls");
// Last, because they change the Finder windows the frames above were measured in.
await page.keyboard.press("Enter"); await wait(1500);
await click(737, 55); await wait(1200);
// Edit > Preferences… (row y=167): a tabbed window with check boxes, radio buttons and a slider.
await move(90, 9); await page.mouse.down(); await wait(1300); await move(120, 60); await move(120, 167); await wait(600); await page.mouse.up(); await wait(4000);
await away(); await dump("finder-prefs"); await page.keyboard.press("Escape"); await wait(1500); await cmd("w", 2000);
// Duplicate the Games folder for the copy progress window, read every half second.
await click(356, 120); await wait(600); await cmd("d", 200);
for (let i = 0; i < 6; i++) { await wait(500); await dump(`copy-progress-${i}`); }
await wait(10000);
await browser.close();
rmSync(work, { recursive: true, force: true });
