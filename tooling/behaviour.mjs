// Behaviour checks for clio.js in a real browser (Chromium through Playwright):
// held controls, default and cancel keys, and the scroll bars it draws.
//   npm run behaviour      (needs Playwright, here or in AIS6_DIR)
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) {
  try { playwright = createRequire(base)("playwright"); break; } catch {}
}
if (!playwright) { console.error("Playwright not found (npm i -D playwright, or set AIS6_DIR)."); process.exit(2); }

const css = pathToFileURL(join(root, "dist/clio.css")).href;
const js = pathToFileURL(join(root, "dist/clio.js")).href;
const dir = join(root, ".fidelity/behaviour");
mkdirSync(dir, { recursive: true });
const browser = await playwright.chromium.launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let failed = 0, passed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.log("FAIL " + msg); } };

async function load(era, body) {
  const file = join(dir, `${era}.html`);
  writeFileSync(file, `<!doctype html><html data-era="${era}"><head><link rel="stylesheet" href="${css}"></head><body style="margin:20px">${body}<script src="${js}"></script></body></html>`);
  await page.goto(pathToFileURL(file).href);
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}
const center = async (sel) => { const b = await page.locator(sel).boundingBox(); return [b.x + b.width / 2, b.y + b.height / 2, b]; };

// 1. A held button lets go while the pointer is off it.
for (const era of ["system6", "system7", "platinum", "drawingboard"]) {
  await load(era, `<div class="clio" style="padding:20px;background:#ddd"><button id="b" onclick="window.clicks=(window.clicks||0)+1">OK</button></div>`);
  const look = () => page.evaluate(() => { const c = getComputedStyle(document.querySelector("#b")); return [c.backgroundColor, c.backgroundImage, c.borderImageSource, c.boxShadow, c.color].join("|"); });
  const idle = await look();
  const [x, y, b] = await center("#b");
  await page.mouse.move(x, y); await page.mouse.down();
  const held = await look();
  ok(held !== idle, `${era}: the button looks pressed while held`);
  await page.mouse.move(x, b.y + b.height + 30);
  ok(await page.evaluate(() => document.querySelector("#b").hasAttribute("data-clio-off")), `${era}: off the button, data-clio-off is set`);
  ok(await look() === idle, `${era}: off the button it looks released`);
  await page.mouse.move(x, y);
  ok(await look() === held, `${era}: back on the button it looks pressed again`);
  await page.mouse.move(x, b.y + b.height + 30); await page.mouse.up();
  ok(!(await page.evaluate(() => window.clicks)), `${era}: released off the button, no click`);
  ok(!(await page.evaluate(() => document.querySelector("#b").hasAttribute("data-clio-off"))), `${era}: data-clio-off cleared on release`);
}

// 2. Return clicks the default button after a flash; Esc clicks Cancel.
await load("platinum", `<div class="modal-dialog" role="dialog" style="padding:16px"><input id="f" value="x"><button id="c" data-clio-cancel onclick="window.got='cancel'">Cancel</button><button id="d" class="default" onclick="window.got='ok'">OK</button></div>`);
await page.focus("#f");
await page.keyboard.press("Enter");
ok(await page.evaluate(() => document.querySelector("#d").classList.contains("active")), "Return: the default button flashes pressed");
await page.waitForTimeout(200);
ok(await page.evaluate(() => window.got) === "ok" && !(await page.evaluate(() => document.querySelector("#d").classList.contains("active"))), "Return: then it is clicked and released");
await page.focus("#f");
await page.keyboard.press("Escape"); await page.waitForTimeout(200);
ok(await page.evaluate(() => window.got) === "cancel", "Esc clicks the cancel button");
await page.focus("#f");
await page.keyboard.press("Meta+Period"); await page.waitForTimeout(200);
ok(await page.evaluate(() => window.got) === "cancel", "Cmd-. clicks the cancel button");

// 3. Scroll bars.
const box = (extra = "", w = 200, h = 150, ch = 2000) => `<div class="clio-scroll" id="s" ${extra} style="width:${w}px;height:${h}px;overflow:scroll;background:#fff"><div style="width:800px;height:${ch}px"></div></div>`;
const lengths = { system6: 16, system7: 16, platinum: 17, drawingboard: 15 };
for (const era of Object.keys(lengths)) {
  await load(era, box());
  const info = await page.evaluate(() => { const s = document.querySelector("#s"); const t = s.querySelector(".clio-sb-v > .clio-sb-thumb"); return { w: s.offsetWidth, h: s.offsetHeight, len: t.offsetHeight, cls: s.className }; });
  ok(info.w === 200 && info.h === 150, `${era}: the scroller keeps its size (${info.w}x${info.h})`);
  ok(info.len === lengths[era], `${era}: the scroll box is ${lengths[era]}px whatever the content (${info.len})`);
  const [ax, ay] = await center("#s .clio-sb-v > .clio-sb-inc");
  await page.mouse.move(ax, ay); await page.mouse.down();
  const first = await page.evaluate(() => document.querySelector("#s").scrollTop);
  ok(first === 16, `${era}: pressing the down arrow scrolls one step at once (${first})`);
  await page.waitForTimeout(120);
  ok(await page.evaluate(() => document.querySelector("#s").scrollTop) === 16, `${era}: then waits before repeating`);
  await page.waitForTimeout(400);
  const later = await page.evaluate(() => document.querySelector("#s").scrollTop);
  ok(later > 48, `${era}: and repeats while held (${later})`);
  await page.mouse.move(ax - 60, ay); const off = await page.evaluate(() => document.querySelector("#s").scrollTop);
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => document.querySelector("#s").scrollTop) === off, `${era}: stops while the pointer is off the arrow`);
  await page.mouse.up();
  // the lane pages towards the pointer
  await page.evaluate(() => { document.querySelector("#s").scrollTop = 0; });
  await page.waitForTimeout(50);
  const [tx, , tb] = await center("#s .clio-sb-v > .clio-sb-track");
  await page.mouse.click(tx, tb.y + tb.height - 10);
  const paged = await page.evaluate(() => document.querySelector("#s").scrollTop);
  ok(paged > 100, `${era}: a click in the lane pages (${paged})`);
  // dragging the box
  await page.evaluate(() => { document.querySelector("#s").scrollTop = 0; });
  await page.waitForTimeout(50);
  const [hx, hy] = await center("#s .clio-sb-v > .clio-sb-thumb");
  await page.mouse.move(hx, hy); await page.mouse.down(); await page.mouse.move(hx, hy + 40, { steps: 4 });
  const mid = await page.evaluate(() => ({ top: document.querySelector("#s").scrollTop, ghost: !!document.querySelector("#s .clio-sb-ghost") }));
  const live = era === "platinum" || era === "drawingboard";
  if (live) ok(mid.top > 0 && !mid.ghost, `${era}: the box drags live (${mid.top})`);
  else ok(mid.top === 0 && mid.ghost, `${era}: the box drags an outline and the content waits`);
  if (!live) await page.locator("#s").screenshot({ path: join(dir, `${era}-thumb-drag.png`) });
  await page.mouse.up();
  const after = await page.evaluate(() => ({ top: document.querySelector("#s").scrollTop, ghost: !!document.querySelector("#s .clio-sb-ghost") }));
  ok(after.top > 0 && !after.ghost, `${era}: on release the content is where the box went (${after.top})`);
}

// Smart Scrolling: Mac OS 8/9 only; the box grows with the visible share.
await load("platinum", box('data-clio-scrolling="smart"', 200, 150, 300));
const smart = await page.evaluate(() => { const v = document.querySelector("#s .clio-sb-v"); return { smart: v.classList.contains("clio-sb-smart"), len: v.querySelector(".clio-sb-thumb").offsetHeight, dec: v.querySelector(".clio-sb-dec").offsetTop }; });
ok(smart.smart && smart.len > 17 && smart.dec > 50, `platinum: Smart Scrolling puts both arrows at the end and sizes the box (${smart.len}px)`);
await load("system7", box('data-clio-scrolling="smart"', 200, 150, 300));
ok(!(await page.evaluate(() => document.querySelector("#s .clio-sb-v").classList.contains("clio-sb-smart"))), "system7: Smart Scrolling does not apply before Mac OS 8");

// Nothing to scroll: the box goes, the lane stays.
await load("platinum", box("", 200, 150, 50).replace("width:800px", "width:50px"));
ok(await page.evaluate(() => getComputedStyle(document.querySelector("#s .clio-sb-v > .clio-sb-thumb")).display) === "none", "platinum: no scroll box when nothing scrolls");

ok(errors.length === 0, "no page errors: " + errors.join("; "));
await browser.close();
console.log(failed ? `FAIL ${failed} of ${passed + failed} behaviour checks` : `ok ${passed} behaviour checks`);
process.exit(failed ? 1 : 0);
