// Types every character of Chicago 12 into System 6.0.8's Key Caps, each
// between two "|" bars, and saves the frames tooling/extract-glyphs.py reads to
// rebuild Clio Sans '84. Shares the boot and capture code of capture-system6.mjs. It boots System 6.0.8 in Infinite Mac
// (https://infinitemac.org), drives the Finder with the mouse and keyboard, and
// reads the emulator's 512x342 canvas pixel for pixel (no screenshot scaling).
//
//   npm run capture:keycaps [-- chicago|geneva|geneva9|charcoal]   -> .fidelity/system6/kc-<font>-*.png
// geneva9 types into the Get Info comments box instead, which is set in Geneva 9.
// charcoal boots Mac OS 9.0 instead, whose Key Caps opens in Charcoal 12
//   -> .fidelity/platinum9/kc-charcoal-*.png
//
// The frames are Apple's screen pixels: they are evidence for measurement and
// the pixel check, and are never committed or published. Infinite Mac draws
// 1-bit black and white as #222222 and #eeeeee; the pixel check thresholds both
// sides to pure black and white before comparing.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const FONT = process.argv[2] || "chicago";
const OS9 = FONT === "charcoal";
const out = join(root, OS9 ? ".fidelity/platinum9" : ".fidelity/system6");
mkdirSync(out, { recursive: true });
import playwright from "playwright";

const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 900 } });
await page.goto(OS9 ? "https://infinitemac.org/1999/Mac%20OS%209.0" : "https://infinitemac.org/1991/System%206.0.8", { waitUntil: "domcontentloaded" });

// Booted when the menu bar is drawn: row 5 mostly white, row 19 a black rule.
const t0 = Date.now();
for (;;) {
  await page.waitForTimeout(3000);
  const ok = await page.evaluate(() => {
    const c = document.querySelector("canvas")!; if (!c) return false;
    const d = c.getContext("2d")!.getImageData(0, 0, c.width, 22).data;
    let w = 0, b = 0;
    for (let x = 0; x < c.width; x++) { if (d[(5 * c.width + x) * 4] > 200) w++; if (d[(19 * c.width + x) * 4] < 50) b++; }
    return w > c.width * 0.6 && b > c.width * 0.9;
  });
  if (ok) break;
  if (Date.now() - t0 > 180000) { console.error("System 6 did not boot in 3 minutes."); process.exit(1); }
}
await page.waitForTimeout(OS9 ? 120000 : 20000); // let the extra disks mount and the desktop settle
const box = await page.locator("canvas").boundingBox();
if (!box) throw new Error("the emulator canvas has no box");
const at = (x: number, y: number): [number, number] => [box.x + x + 0.5, box.y + y + 0.5];
const wait = (ms: number) => page.waitForTimeout(ms);
const move = async (x: number, y: number) => { await page.mouse.move(...at(x, y), { steps: 4 }); await wait(150); };
const click = async (x: number, y: number) => { await move(x, y); await page.mouse.down(); await wait(120); await page.mouse.up(); await wait(400); };
const cmd = async (k: string, ms = 3000) => { await page.keyboard.down("Meta"); await wait(150); await page.keyboard.press(k); await wait(150); await page.keyboard.up("Meta"); await wait(ms); };
const dump = async (name: string) => {
  const b64 = await page.evaluate(() => document.querySelector("canvas")!.toDataURL("image/png").split(",")[1]);
  writeFileSync(join(out, `${name}.png`), Buffer.from(b64, "base64"));
  console.log("captured", name);
};

const FONT_ROW = ({ chicago: 27, courier: 43, geneva: 59, monaco: 91 } as Record<string, number>)[FONT]!; // Key Caps menu rows
const ink = (x: number, y: number, w: number, h: number) => page.evaluate(([x, y, w, h]) => {
  const d = document.querySelector("canvas")!.getContext("2d")!.getImageData(x, y, w, h).data;
  let k = 0; for (let i = 0; i < d.length; i += 4) if (d[i] < 128) k++; return k / (d.length / 4);
}, [x, y, w, h]);
if (OS9) {
  // Apple menu > Key Caps (row y=140); it opens in Charcoal.
  await move(18, 9); await page.mouse.down(); await wait(900);
  await move(60, 80); await move(60, 140); await wait(600);
  await page.mouse.up(); await wait(8000);
} else if (FONT === "geneva9") {
  // Select Welcome! on the desktop, Get Info, click into the comments box.
  for (let i = 0; i < 5 && !(await ink(455, 126, 35, 6) > 0.6); i++) { await click(472, 104); await wait(800); }
  await cmd("i"); await click(120, 250); await wait(600);
} else {
// Open Key Caps from the Apple menu.
await move(11, 9); await page.mouse.down(); await wait(1200);
await move(40, 120); await move(40, 171); await wait(800);
await page.mouse.up(); await wait(4000);
}
if (!OS9 && FONT !== "chicago" && FONT !== "geneva9") {   // choose the font in the Key Caps menu
  await move(116, 9); await page.mouse.down(); await wait(1200);
  await move(130, 40); await move(130, FONT_ROW); await wait(700); await page.mouse.up(); await wait(1500);
}
const base: Record<string, [string, boolean]> = {};
"abcdefghijklmnopqrstuvwxyz".split("").forEach((c) => (base[c] = ["Key" + c.toUpperCase(), false]));
"0123456789".split("").forEach((c) => (base[c] = ["Digit" + c, false]));
Object.assign(base, { "`": ["Backquote", false], "-": ["Minus", false], "=": ["Equal", false], "[": ["BracketLeft", false], "]": ["BracketRight", false], "\\": ["Backslash", false], ";": ["Semicolon", false], "'": ["Quote", false], ",": ["Comma", false], ".": ["Period", false], "/": ["Slash", false] });
"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c) => (base[c] = ["Key" + c, true]));
const shifted: Record<string, string> = { "~": "Backquote", "!": "Digit1", "@": "Digit2", "#": "Digit3", "$": "Digit4", "%": "Digit5", "^": "Digit6", "&": "Digit7", "*": "Digit8", "(": "Digit9", ")": "Digit0", "_": "Minus", "+": "Equal", "{": "BracketLeft", "}": "BracketRight", "|": "Backslash", ":": "Semicolon", "\"": "Quote", "<": "Comma", ">": "Period", "?": "Slash" };
for (const [c, k] of Object.entries(shifted)) base[c] = [k, true];
// Option characters (Mac Roman), typed with Alt as Option.
const opt: Record<string, [string, boolean]> = { "“": ["BracketLeft", false], "”": ["BracketLeft", true], "‘": ["BracketRight", false], "’": ["BracketRight", true], "…": ["Semicolon", false], "•": ["Digit8", false], "©": ["KeyG", false], "®": ["KeyR", false], "™": ["Digit2", false], "–": ["Minus", false], "—": ["Minus", true] };
const press = async (c: string) => {
  if (opt[c]) { const [k, sh] = opt[c]; await page.keyboard.down("Alt"); if (sh) await page.keyboard.down("Shift"); await page.keyboard.press(k); if (sh) await page.keyboard.up("Shift"); await page.keyboard.up("Alt"); }
  else { const [k, sh] = base[c]; if (sh) await page.keyboard.down("Shift"); await page.keyboard.press(k); if (sh) await page.keyboard.up("Shift"); }
  await wait(90);
};
const all = Object.keys(base).filter((c) => c !== "|").concat(Object.keys(opt));
const batches = []; const per = FONT === "geneva9" ? 12 : 18;
for (let i = 0; i < all.length; i += per) batches.push(all.slice(i, i + per));
batches.unshift(["|", "|", "|", "|"]); // bar spacing
const meta: string[][] = [];
for (const [n, b] of batches.entries()) {
  await press("|"); for (const c of b) { await press(c); await press("|"); }
  await wait(700); await dump(`kc-${FONT}-${String(n).padStart(2, "0")}`); meta.push(b);
  for (let i = 0; i < 2 * b.length + 3; i++) { await page.keyboard.press("Backspace"); await wait(40); }
  await wait(500);
}
writeFileSync(join(out, `kc-${FONT}-batches.json`), JSON.stringify(meta));
await browser.close();
