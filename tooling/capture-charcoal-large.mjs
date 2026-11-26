// Types every character of Charcoal at 72 points (the largest size Stickies offers) into a Stickies note in
// Mac OS 9.0 (Infinite Mac), each between two "|" bars, and saves the frames
// tooling/trace-outline.py traces into Clio Sans '97 Display, the scalable
// companion of the 12px bitmap rebuild.
//
//   npm run capture:charcoal-large   -> .fidelity/platinum9/cl-*.png (git-ignored)
//
// The frames are Apple's screen pixels: evidence for measurement and tracing,
// never committed or published.
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
const move = async (x, y) => { await page.mouse.move(...at(x, y), { steps: 6 }); await wait(150); };
const click = async (x, y) => { await move(x, y); await page.mouse.down(); await wait(120); await page.mouse.up(); await wait(400); };
const cmd = async (k) => { await page.keyboard.down("Meta"); await wait(150); await page.keyboard.press(k); await wait(150); await page.keyboard.up("Meta"); await wait(2500); };
const dump = async (name) => {
  const b64 = await page.evaluate(() => document.querySelector("canvas").toDataURL("image/png").split(",")[1]);
  writeFileSync(join(out, `${name}.png`), Buffer.from(b64, "base64"));
  console.log("captured", name);
};
const drag = async (x0, y0, x1, y1) => { await move(x0, y0); await page.mouse.down(); await wait(400); for (let i = 1; i <= 20; i++) await move(x0 + (x1 - x0) * i / 20, y0 + (y1 - y0) * i / 20); await wait(500); await page.mouse.up(); await wait(1500); };

// Apple menu > Stickies (row y=230); a new note; drag its grow box out to fill the screen.
await move(18, 9); await page.mouse.down(); await wait(900); await move(60, 120); await move(60, 230); await wait(600); await page.mouse.up(); await wait(8000);
await cmd("n"); await move(600, 590); await dump("cl-note");
// The new note opens at 99..200 x 89..150, frontmost; its grow box is the lower-right corner.
await drag(197, 148, 780, 520); await move(600, 590); await dump("cl-note-big");
// Text Style: Charcoal from the font pop-up (found by its rows: Apple Chancery,
// Capitals, Charcoal under the menu's top edge), Plain, the size typed in.
// Text Style applies to the selection, so give it some: one character, selected.
await page.keyboard.press("KeyX"); await wait(300);
await cmd("a"); await cmd("t"); await wait(1500);
await move(425, 143); await page.mouse.down(); await wait(900); await dump("cl-font-popup");
// The pop-up opens with the current font (Geneva) under the pointer at y=145;
// its rows are 13.5px, so Charcoal, four rows up, is at y=91.
await move(425, 91); await wait(500); await page.mouse.up(); await wait(1000);
await click(351, 191);                                  // Plain
// The size: typing into the box does not take, so use its pop-up (the arrows
// at its right end) and choose the last, largest size it lists.
await move(397, 168); await page.mouse.down(); await wait(900); await dump("cl-size-popup");
const last = await page.evaluate(() => {
  const c = document.querySelector("canvas"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  const at = (x, y) => { const i = (y * c.width + x) * 4; return [d[i], d[i + 1], d[i + 2]]; };
  // Walk down the pop-up's column until its black bottom edge.
  for (let y = 180; y < c.height - 1; y++) { const p = at(380, y), q = at(380, y + 1); if (p[0] < 40 && p[1] < 40 && q[0] > 100) return y; }
  return null;
});
console.log("size menu bottom", last);
await move(380, last - 8); await wait(500); await page.mouse.up(); await wait(800);
await move(600, 590); await dump("cl-textstyle"); await click(459, 265); await wait(1500);   // OK
await move(600, 590); await dump("cl-styled");
// Edit > Use As Default (row y=141) makes Charcoal at this size the style of new
// notes; a new note then types in it. Resize that note the same way.
await move(90, 9); await page.mouse.down(); await wait(900); await move(110, 60); await move(110, 141); await wait(500); await page.mouse.up(); await wait(1500);
await page.keyboard.press("Enter"); await wait(1500);     // confirm: size, position, colour and style
await cmd("n"); await move(600, 590); await dump("cl-note2");

const base = {};
"abcdefghijklmnopqrstuvwxyz".split("").forEach((c) => (base[c] = ["Key" + c.toUpperCase(), false]));
"0123456789".split("").forEach((c) => (base[c] = ["Digit" + c, false]));
Object.assign(base, { "`": ["Backquote", false], "-": ["Minus", false], "=": ["Equal", false], "[": ["BracketLeft", false], "]": ["BracketRight", false], "\\": ["Backslash", false], ";": ["Semicolon", false], "'": ["Quote", false], ",": ["Comma", false], ".": ["Period", false], "/": ["Slash", false] });
"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").forEach((c) => (base[c] = ["Key" + c, true]));
const shifted = { "~": "Backquote", "!": "Digit1", "@": "Digit2", "#": "Digit3", "$": "Digit4", "%": "Digit5", "^": "Digit6", "&": "Digit7", "*": "Digit8", "(": "Digit9", ")": "Digit0", "_": "Minus", "+": "Equal", "{": "BracketLeft", "}": "BracketRight", "|": "Backslash", ":": "Semicolon", "\"": "Quote", "<": "Comma", ">": "Period", "?": "Slash" };
for (const [c, k] of Object.entries(shifted)) base[c] = [k, true];
const opt = { "“": ["BracketLeft", false], "”": ["BracketLeft", true], "‘": ["BracketRight", false], "’": ["BracketRight", true], "…": ["Semicolon", false], "•": ["Digit8", false], "©": ["KeyG", false], "®": ["KeyR", false], "™": ["Digit2", false], "–": ["Minus", false], "—": ["Minus", true] };
const press = async (c) => {
  if (opt[c]) { const [k, sh] = opt[c]; await page.keyboard.down("Alt"); if (sh) await page.keyboard.down("Shift"); await page.keyboard.press(k); if (sh) await page.keyboard.up("Shift"); await page.keyboard.up("Alt"); }
  else { const [k, sh] = base[c]; if (sh) await page.keyboard.down("Shift"); await page.keyboard.press(k); if (sh) await page.keyboard.up("Shift"); }
  await wait(90);
};
const all = Object.keys(base).filter((c) => c !== "|").concat(Object.keys(opt));
const per = Number(process.env.CLIO_CL_PER || 6);
const batches = [["|", "|", "|"]];
for (let i = 0; i < all.length; i += per) batches.push(all.slice(i, i + per));
const meta = [];
for (const [n, b] of batches.entries()) {
  await press("|"); for (const c of b) { await press(c); await press("|"); }
  await wait(700); await move(600, 590); await dump(`cl-${String(n).padStart(2, "0")}`); meta.push(b);
  await cmd("a"); await page.keyboard.press("Backspace"); await wait(600);
}
// 72 points: the last, largest size in the pop-up.
writeFileSync(join(out, "cl-batches.json"), JSON.stringify({ size: 72, batches: meta }));
await browser.close();
