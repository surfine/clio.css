// Charcoal as the interface draws it: Mac OS 9.0 antialiases window titles,
// buttons and menus a little differently from Key Caps' text box, so this
// names folders on the Saved HD with every character between "|" bars, opens
// each folder and saves the frame with its title, which
// tooling/extract-glyphs.py --font charcoal-ui reads for the coverage levels.
//
//   npm run capture:charcoal-ui   -> .fidelity/platinum9/ui-*.png (git-ignored)
//
// The frames are Apple's screen pixels: evidence only, never committed.
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, ".fidelity/platinum9");
mkdirSync(out, { recursive: true });
import playwright from "playwright";
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
await page.waitForTimeout(120000);
const box = await page.locator("canvas").boundingBox();
const at = (x, y) => [box.x + x + 0.5, box.y + y + 0.5];
const wait = (ms) => page.waitForTimeout(ms);
const move = async (x, y) => { await page.mouse.move(...at(x, y), { steps: 4 }); await wait(150); };
const dbl = async (x, y) => { await move(x, y); for (let i = 0; i < 2; i++) { await page.mouse.down(); await wait(60); await page.mouse.up(); await wait(90); } await wait(3000); };
const cmd = async (k, ms = 2500) => { await page.keyboard.down("Meta"); await wait(150); await page.keyboard.press(k); await wait(150); await page.keyboard.up("Meta"); await wait(ms); };
const dump = async (name) => {
  const b64 = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png").split(",")[1]);
  writeFileSync(join(out, `${name}.png`), Buffer.from(b64, "base64"));
  console.log("captured", name);
};

const base = {};
"abcdefghijklmnopqrstuvwxyz".split("").forEach((c) => (base[c] = ["Key" + c.toUpperCase(), false]));
"0123456789".split("").forEach((c) => (base[c] = ["Digit" + c, false]));
Object.assign(base, { "`": ["Backquote", false], "-": ["Minus", false], "=": ["Equal", false], "[": ["BracketLeft", false], "]": ["BracketRight", false], "\\": ["Backslash", false], ";": ["Semicolon", false], "'": ["Quote", false], ",": ["Comma", false], ".": ["Period", false], "/": ["Slash", false], " ": ["Space", false] });
"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c) => (base[c] = ["Key" + c, true]));
const shifted = { "~": "Backquote", "!": "Digit1", "@": "Digit2", "#": "Digit3", "$": "Digit4", "%": "Digit5", "^": "Digit6", "&": "Digit7", "*": "Digit8", "(": "Digit9", ")": "Digit0", "_": "Minus", "+": "Equal", "{": "BracketLeft", "}": "BracketRight", "|": "Backslash", "\"": "Quote", "<": "Comma", ">": "Period", "?": "Slash" };
for (const [c, k] of Object.entries(shifted)) base[c] = [k, true];
const opt = { "“": ["BracketLeft", false], "”": ["BracketLeft", true], "‘": ["BracketRight", false], "’": ["BracketRight", true], "…": ["Semicolon", false], "•": ["Digit8", false], "©": ["KeyG", false], "®": ["KeyR", false], "™": ["Digit2", false], "–": ["Minus", false], "—": ["Minus", true] };
const press = async (c) => {
  if (opt[c]) { const [k, sh] = opt[c]; await page.keyboard.down("Alt"); if (sh) await page.keyboard.down("Shift"); await page.keyboard.press(k); if (sh) await page.keyboard.up("Shift"); await page.keyboard.up("Alt"); }
  else { const [k, sh] = base[c]; if (sh) await page.keyboard.down("Shift"); await page.keyboard.press(k); if (sh) await page.keyboard.up("Shift"); }
  await wait(90);
};
// A file name holds 31 characters and no colon: 14 characters between 15 bars.
const all = Object.keys(base).filter((c) => c !== "|" && c !== " ").concat(Object.keys(opt));
const per = 14, batches = [["|", "|", "|"], [" ", " "]];
for (let i = 0; i < all.length; i += per) batches.push(all.slice(i, i + per));

// The Saved HD (desktop, y=180) is writable: open it and make the folders there.
await dbl(751, 180); await move(600, 590); await dump("ui-saved-hd");
const meta = [];
for (const [n, b] of batches.entries()) {
  await cmd("n", 2000);                                  // New Folder: its name is selected for typing
  await press("|"); for (const c of b) { await press(c); await press("|"); }
  await page.keyboard.press("Enter"); await wait(1500);
  await cmd("o", 3500);                                  // open it: the name is the window's title
  await move(600, 590); await dump(`ui-${String(n).padStart(2, "0")}`); meta.push(b);
  await cmd("w", 1500);
}
writeFileSync(join(out, "ui-batches.json"), JSON.stringify(meta));
await browser.close();
