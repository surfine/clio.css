// Behaviour checks for clio.js in a real browser (Chromium through Playwright):
// held controls, default and cancel keys, and the scroll bars it draws.
//   npm run behaviour      (needs Playwright, here or in AIS6_DIR)
//   CLIO_ENGINE=webkit|firefox npm run behaviour   (default chromium)
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
const js = pathToFileURL(join(root, process.env.CLIO_JS === "min" ? "dist/clio.min.js" : "dist/clio.js")).href;   // CLIO_JS=min checks the minified build
const dir = join(root, ".fidelity/behaviour");
mkdirSync(dir, { recursive: true });
const ENGINE = process.env.CLIO_ENGINE || "chromium";
if (!["chromium", "webkit", "firefox"].includes(ENGINE)) { console.error(`CLIO_ENGINE must be chromium, webkit or firefox, not ${ENGINE}`); process.exit(2); }
console.log(`engine: ${ENGINE}`);
const browser = await playwright[ENGINE].launch();
const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
let failed = 0, passed = 0;
const ok = (cond, msg) => { if (cond) passed++; else { failed++; console.log("FAIL " + msg); } };

async function load(era, body) {
  const file = join(dir, `${era}-${ENGINE}.html`);
  writeFileSync(file, `<!doctype html><html data-era="${era}"><head><meta charset="utf-8"><link rel="stylesheet" href="${css}"></head><body style="margin:20px">${body}<script src="${js}"></script></body></html>`);
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
  // the steps' times, taken in the page (a slow engine round trip must not decide the pause)
  await page.evaluate(() => { const s = document.querySelector("#s"); window.steps = []; s.addEventListener("scroll", () => window.steps.push([performance.now(), s.scrollTop])); s.addEventListener("pointerdown", () => { window.pressed = performance.now(); }, true); });
  await page.mouse.move(ax, ay); await page.mouse.down();
  const first = await page.evaluate(() => document.querySelector("#s").scrollTop);
  ok(first === 16, `${era}: pressing the down arrow scrolls one step at once (${first})`);
  await page.waitForTimeout(120);
  const pause = await page.evaluate(() => { const s = window.steps.find(([, top]) => top > 16); return s ? Math.round(s[0] - window.pressed) : Infinity; });
  const waits = era === "platinum" || era === "drawingboard";   // Mac OS 9's Finder paused; System 6 and 7's TrackControl did not
  ok(waits ? pause >= 150 : pause < 120, `${era}: then ${waits ? "waits before repeating" : "repeats without a pause"} (${pause} ms)`);
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

// 4b. Heading for a submenu (the Menu Manager's MenuDrag rule): inside the wedge from the
// last point in the item to the submenu's near corners the submenu stays for 60 ticks from
// leaving the item, not extended by further moves; a move back away switches at once.
const wedgeBar = `<ul class="menu-bar" role="menubar" style="width:400px"><li role="none"><button role="menuitem" id="wt" aria-haspopup="true" aria-expanded="false">File</button>
  <ul class="menu" role="menu" id="wm">
    <li role="none" id="wp"><button role="menuitem" aria-haspopup="true">Recent</button>
      <ul class="menu" role="menu" id="ws">${[1, 2, 3, 4, 5, 6].map((i) => `<li role="none"><button role="menuitem">Item ${i}</button></li>`).join("")}</ul></li>
    <li role="none" id="wb"><button role="menuitem">Below</button></li>
    <li role="none"><button role="menuitem">Last</button></li>
  </ul></li></ul>`;
const vis = (sel) => page.evaluate((q) => { const e = document.querySelector(q); return !!e && getComputedStyle(e).display !== "none"; }, sel);
for (const era of ["system7", "platinum"]) {
  await load(era, wedgeBar);
  const [tx, ty] = await center("#wt");
  const open = async () => {
    await page.mouse.move(tx, ty); await page.mouse.down();
    const p = await page.locator("#wp").boundingBox();
    await page.mouse.move(p.x + p.width - 10, p.y + p.height / 2, { steps: 3 });
    await page.waitForTimeout(250);
    return p;
  };
  const lit = () => page.evaluate(() => document.querySelector("#wb").classList.contains("active"));
  let p = await open();
  ok(await vis("#ws"), `${era}: the submenu is open before the move`);
  const b = await page.locator("#wb").boundingBox();
  await page.mouse.move(p.x + p.width - 6, b.y + b.height / 2);   // down and right, inside the wedge
  const left = Date.now();
  await page.waitForTimeout(150);
  ok(await vis("#ws") && !(await lit()), `${era}: moving into the wedge keeps the submenu`);
  await page.waitForTimeout(450);
  await page.mouse.move(p.x + p.width - 5, b.y + b.height / 2);   // still inside: does not extend the 60 ticks
  await page.waitForTimeout(Math.max(0, 1150 - (Date.now() - left)));
  ok(!(await vis("#ws")) && await lit(), `${era}: after 60 ticks from leaving the item the item under the pointer lights`);
  await page.mouse.move(600, 500); await page.mouse.up(); await page.waitForTimeout(100);
  p = await open();
  await page.mouse.move(p.x + 20, b.y + b.height / 2);   // down and to the left: away from the submenu
  await page.waitForTimeout(60);
  ok(!(await vis("#ws")) && await lit(), `${era}: moving away from the submenu switches at once`);
  await page.mouse.move(600, 500); await page.mouse.up(); await page.waitForTimeout(100);
}

// 4. Menus.
const bar = (extra = "") => `<ul class="menu-bar" role="menubar" ${extra} style="width:400px">
  <li role="none"><button role="menuitem" id="t" aria-haspopup="true" aria-expanded="false">File</button>
    <ul class="menu" role="menu" id="m">
      <li role="none"><button role="menuitem" id="new" onclick="window.chose='new'">New <kbd>⌘N</kbd></button></li>
      <li role="none"><button role="menuitem" id="open" onclick="window.chose='open'">Open…</button></li>
      <li role="separator" class="separator"></li>
      <li role="none" class="disabled"><button role="menuitem" aria-disabled="true" onclick="window.chose='dim'">Print</button></li>
      <li role="none" id="parent"><button role="menuitem" aria-haspopup="true">Recent</button>
        <ul class="menu" role="menu"><li role="none"><button role="menuitem" id="one" onclick="window.chose='one'">One</button></li></ul></li>
    </ul></li>
  <li role="none"><button role="menuitem" id="t2" aria-haspopup="true" aria-expanded="false">Edit</button>
    <ul class="menu" role="menu"><li role="none"><button role="menuitem" id="undo" onclick="window.chose='undo'">Undo</button></li></ul></li>
</ul><p id="away" style="margin-top:200px">away</p>`;
const shown = (sel) => page.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== "none"; }, sel);
for (const era of ["system7", "platinum"]) {
  await load(era, bar());
  const [tx, ty] = await center("#t");
  // press, drag to an item, release: it blinks, then runs, and the menu closes
  await page.mouse.move(tx, ty); await page.mouse.down();
  ok(await shown("#m"), `${era}: pressing a title opens its menu`);
  const [ox, oy] = await center("#open");
  await page.mouse.move(ox, oy, { steps: 4 });
  ok(await page.evaluate(() => document.querySelector("#open").parentElement.classList.contains("active")), `${era}: the item under the pointer lights`);
  // count the blinks as they happen (sampling frames afterwards misses them on a busy machine)
  await page.evaluate(() => { const li = document.querySelector("#open").parentElement; window.blinkLog = []; new MutationObserver(() => window.blinkLog.push(li.hasAttribute("data-clio-blink") ? 0 : 1)).observe(li, { attributes: true, attributeFilter: ["data-clio-blink"] }); });
  await page.mouse.up();
  await page.waitForTimeout(500);
  const blinks = await page.evaluate(() => window.blinkLog.join(""));
  const offs = (blinks.match(/0+/g) || []).length;
  ok(offs === 3, `${era}: the chosen item blinks three times (${blinks})`);
  ok(await page.evaluate(() => window.chose) === "open", `${era}: then it runs`);
  ok(!(await shown("#m")), `${era}: and the menu closes`);
  // released away from any item: nothing runs
  await page.evaluate(() => { window.chose = null; });
  await page.mouse.move(tx, ty); await page.mouse.down(); await page.mouse.move(tx + 300, ty + 300, { steps: 3 }); await page.mouse.up();
  ok(!(await shown("#m")) && !(await page.evaluate(() => window.chose)), `${era}: released elsewhere, the menu closes and nothing runs`);
  // a disabled item does not run
  await page.mouse.move(tx, ty); await page.mouse.down();
  const [dx, dy] = await center("li.disabled button"); await page.mouse.move(dx, dy, { steps: 3 }); await page.mouse.up();
  await page.waitForTimeout(400);
  ok(!(await page.evaluate(() => window.chose)), `${era}: a dimmed item does not run`);
  // dragging across titles switches menus
  await page.mouse.move(tx, ty); await page.mouse.down();
  const [ex, ey] = await center("#t2"); await page.mouse.move(ex, ey, { steps: 3 });
  ok(!(await shown("#m")) && await page.evaluate(() => document.querySelector("#t2").getAttribute("aria-expanded")) === "true", `${era}: dragging to another title switches menus`);
  await page.mouse.move(tx + 300, ty + 300); await page.mouse.up();
  // a submenu opens about 9 ticks after its item lights
  await page.mouse.move(tx, ty); await page.mouse.down();
  const [px2, py2] = await center("#parent > button"); await page.mouse.move(px2, py2, { steps: 3 });
  ok(!(await shown("#parent > .menu")), `${era}: a submenu waits before opening`);
  await page.waitForTimeout(250);
  ok(await shown("#parent > .menu"), `${era}: then opens`);
  const [sx, sy] = await center("#one"); await page.mouse.move(sx, sy, { steps: 6 }); await page.mouse.up();
  await page.waitForTimeout(450);
  ok(await page.evaluate(() => window.chose) === "one", `${era}: an item in a submenu can be chosen`);
  // a click (press and release on the title)
  await page.evaluate(() => { window.chose = null; });
  await page.mouse.click(tx, ty);
  const stays = await shown("#m");
  if (era === "platinum") {
    ok(stays, "platinum: a clicked menu stays open (Mac OS 8)");
    await page.evaluate(() => { window.runs = 0; document.querySelector("#new").addEventListener("click", () => window.runs++); });
    const [nx, ny] = await center("#new"); await page.mouse.move(nx, ny, { steps: 3 }); await page.mouse.click(nx, ny);
    await page.waitForTimeout(450);
    ok(await page.evaluate(() => window.chose) === "new" && !(await shown("#m")), "platinum: a click on an item of an open menu chooses it");
    ok(await page.evaluate(() => window.runs) === 1, `platinum: and runs it once (${await page.evaluate(() => window.runs)})`);
    await page.mouse.click(tx, ty); await page.mouse.click(400, 500);
    ok(!(await shown("#m")), "platinum: a click elsewhere closes it");
  } else ok(!stays, "system7: a clicked menu closes again (the button must be held)");
}
// keyboard and Command keys
await load("platinum", bar("data-clio-shortcuts"));
await page.focus("#t");
await page.keyboard.press("ArrowDown");
ok(await shown("#m") && await page.evaluate(() => document.activeElement.id) === "new", "keyboard: Down opens the menu on its first item");
await page.keyboard.press("ArrowDown");
ok(await page.evaluate(() => document.activeElement.id) === "open", "keyboard: Down moves to the next item, skipping nothing usable");
await page.keyboard.press("ArrowDown");
ok(await page.evaluate(() => document.activeElement.textContent.trim()) === "Recent", "keyboard: separators and dimmed items are skipped");
await page.keyboard.press("Escape");
ok(!(await shown("#m")) && await page.evaluate(() => document.activeElement.id) === "t", "keyboard: Esc closes and returns to the title");
await page.keyboard.press("Enter"); await page.keyboard.press("Enter"); await page.waitForTimeout(450);
ok(await page.evaluate(() => window.chose) === "new", "keyboard: Return chooses");
ok(await page.evaluate(() => document.activeElement.id) === "t" && !(await shown("#m")), "keyboard: after choosing, focus is back on the title and the menu stays closed");
// app-menu bar model: one Tab stop, preview on focus, Left/Right between menus, Tab leaves
// (a text field after the bar: Safari's Tab skips buttons that have no tabindex)
await load("platinum", '<button id="before">before</button>' + bar() + '<input id="after" aria-label="after">');
await page.focus("#before"); await page.keyboard.press("Tab");
ok(await page.evaluate(() => document.activeElement.id) === "t" && await shown("#m") && !(await page.evaluate(() => document.activeElement.closest(".menu"))), "menu bar: Tab lands on the first title and previews its menu, no item focused");
await page.keyboard.press("Tab");
ok(await page.evaluate(() => document.activeElement.id) === "after" && !(await shown("#m")), "menu bar: one Tab stop; Tab leaves and closes the preview");
await page.keyboard.press("Shift+Tab");
await page.keyboard.press("ArrowRight");
ok(await page.evaluate(() => document.activeElement.id) === "t2" && await page.evaluate(() => document.querySelector("#t2").getAttribute("aria-expanded")) === "true" && !(await shown("#m")), "menu bar: Right moves to the next title and previews it");
await page.keyboard.press("ArrowLeft"); await page.keyboard.press("End");
ok(await page.evaluate(() => document.activeElement.textContent.trim()) === "Recent", "menu bar: End enters a menu on its last item");
await page.keyboard.press("ArrowRight");
ok(await page.evaluate(() => document.activeElement.id) === "one", "menu bar: Right on a submenu item opens it and enters");
await page.keyboard.press("Escape");
ok(await page.evaluate(() => document.activeElement.textContent.trim()) === "Recent" && !(await shown("#parent > .menu")) && await shown("#m"), "menu bar: Esc in a submenu closes only it");
await page.keyboard.press("Home"); await page.keyboard.press("ArrowRight");
ok(await page.evaluate(() => document.activeElement.id) === "t2" && !(await shown("#m")), "menu bar: Right on a plain item moves to the next menu as a preview");
await page.keyboard.press("Tab");
ok(!(await page.evaluate(() => document.querySelector("#t").closest("li").classList.contains("open") || document.querySelector("#t2").closest("li").classList.contains("open"))), "menu bar: Tab out closes every menu");
await load("platinum", bar("data-clio-shortcuts"));
// The title is lit for 8 ticks: watch for it rather than read it after the key (WebKit's
// key press takes longer than that).
await page.evaluate(() => { const t = document.querySelector("#t"); new MutationObserver(() => { if (t.classList.contains("active")) window.lit = true; }).observe(t, { attributes: true }); });
await page.keyboard.press("Meta+n");
ok(await page.evaluate(() => window.chose) === "new" && await page.evaluate(() => window.lit === true), "Command-N runs the item and lights its title");
await load("platinum", bar());
await page.keyboard.press("Meta+n");
ok(!(await page.evaluate(() => window.chose)), "without data-clio-shortcuts, Command keys stay the browser's");

// 5. Pop-up menus.
const popupHtml = `<div class="clio" style="padding:40px"><select id="p" style="width:140px" onchange="window.changed=this.value"><option>Chicago</option><option>Geneva</option><option selected>Monaco</option><option disabled>Symbol</option><option>Times</option></select></div>`;
// where the browser draws the menu (base-select), clio.js lines the current item up
await load("platinum", popupHtml);
if (await page.evaluate(() => CSS.supports("appearance", "base-select"))) {
  const [sx, sy] = await center("#p");
  await page.mouse.move(sx, sy); await page.mouse.down(); await page.mouse.up();
  const shift = await page.evaluate(() => document.querySelector("#p").style.getPropertyValue("--clio-picker-shift"));
  ok(shift === "-32px", `base-select: the picker moves up two rows to put Monaco on the button, the menu's top on the button's as in Mac OS 9 (${shift})`);
  const placed = await page.evaluate(() => { const o = document.querySelectorAll("#p option")[2].getBoundingClientRect(), r = document.querySelector("#p").getBoundingClientRect(); return [Math.round(o.top + o.height / 2), Math.round(r.top + r.height / 2), Math.round(o.left - r.left)]; });
  ok(Math.abs(placed[0] - placed[1]) <= 1 && Math.abs(placed[2]) <= 1, `base-select: the open picker lies over the button, Monaco on its row (${placed})`);
  await page.keyboard.press("Escape");
} else console.log(`skip 2 base-select checks (${ENGINE} has no appearance: base-select)`);
// elsewhere clio.js draws the menu (forced here by hiding base-select from it)
const noBase = `<script>{ const f = CSS.supports.bind(CSS); CSS.supports = (a, b) => (a === "appearance" && b === "base-select") ? false : f(a, b); }</script>`;
for (const era of ["system7", "platinum"]) {
  await load(era, noBase + popupHtml);
  const [sx, sy, sb] = await center("#p");
  await page.mouse.move(sx, sy); await page.mouse.down();
  const m = await page.evaluate(() => { const c = document.querySelector(".clio-popup-menu li.checked"); const r = c.getBoundingClientRect(); return { y: r.top + r.height / 2, n: document.querySelectorAll(".clio-popup-menu li").length }; });
  ok(m.n === 5 && Math.abs(m.y - (sb.y + sb.height / 2)) <= 1, `${era}: the drawn menu lies over the button, Monaco on its row (${m.y} vs ${sb.y + sb.height / 2})`);
  const [gx, gy] = await center(".clio-popup-menu li:nth-child(2)");
  await page.mouse.move(gx, gy, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(450);
  ok(await page.evaluate(() => document.querySelector("#p").value) === "Geneva" && await page.evaluate(() => window.changed) === "Geneva" && !(await page.$(".clio-popup-menu")), `${era}: drag and release chooses, fires change and closes`);
  // a dimmed option cannot be chosen
  await page.mouse.move(sx, sy); await page.mouse.down();
  const [dx, dy] = await center(".clio-popup-menu li.disabled"); await page.mouse.move(dx, dy, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(450);
  ok(await page.evaluate(() => document.querySelector("#p").value) === "Geneva" && !(await page.$(".clio-popup-menu")), `${era}: a dimmed option does nothing`);
  await page.mouse.click(sx, sy);
  const open = !!(await page.$(".clio-popup-menu"));
  if (era === "platinum") {
    ok(open, "platinum: a clicked pop-up stays open");
    const [tx2, ty2] = await center(".clio-popup-menu li:nth-child(5)"); await page.mouse.move(tx2, ty2, { steps: 3 }); await page.mouse.click(tx2, ty2);
    await page.waitForTimeout(450);
    ok(await page.evaluate(() => document.querySelector("#p").value) === "Times", "platinum: then a click chooses");
  } else ok(!open, "system7: a clicked pop-up closes (the button must be held)");
}

// 6. Windows: dragged outline, collapse, zoom rects; cursors; sounds.
const win = (pos = "absolute", extra = "") => `<div class="window" id="w" ${extra} style="position:${pos};left:100px;top:100px;width:240px;height:160px;background:#fff"><div class="title-bar"><button class="close" aria-label="Close"></button><h1 class="title" id="title">Untitled</h1><button class="shade" aria-label="Collapse"></button></div><div class="window-pane" id="pane">Text</div></div>`;
for (const [era, width] of [["system7", 1], ["platinum", 2]]) {
  await load(era, `<div style="background:#fff;width:800px;height:500px"></div>` + win());
  const [x, y] = await center("#title");
  await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 60, y + 40, { steps: 4 });
  const mid = await page.evaluate(() => { const o = document.querySelector(".clio-outline"); const w = document.querySelector("#w").getBoundingClientRect(); return o && { pad: o.style.padding, at: o.getBoundingClientRect().left, left: w.left }; });
  ok(mid && mid.pad === `${width}px` && mid.left === 100 && mid.at === 160, `${era}: dragging a title bar moves a ${width}px grey outline; the window waits (${JSON.stringify(mid)})`);
  const line = await page.screenshot({ clip: { x: 170, y: 140, width: 40, height: 1 } });
  const dark = await page.evaluate(async (b64) => { const i = new Image(); i.src = "data:image/png;base64," + b64; await i.decode(); const c = document.createElement("canvas"); c.width = i.width; c.height = 1; const g = c.getContext("2d"); g.drawImage(i, 0, 0); const d = g.getImageData(0, 0, c.width, 1).data; let n = 0; for (let k = 0; k < d.length; k += 4) if (d[k] < 128) n++; return n / c.width; }, line.toString("base64"));
  ok(dark > 0.4 && dark < 0.6, `${era}: the outline is QuickDraw's grey, every other pixel inverted (${dark})`);
  await page.mouse.up();
  const after = await page.evaluate(() => { const r = document.querySelector("#w").getBoundingClientRect(); return [r.left, r.top, !!document.querySelector(".clio-outline")]; });
  ok(after[0] === 160 && after[1] === 140 && !after[2], `${era}: on release the window moves there (${after})`);
  if (era !== "platinum") continue;   // the collapse box is Mac OS 8's
  // collapse box
  await page.click("#w .shade");
  ok(await page.evaluate(() => document.querySelector("#w").classList.contains("collapsed") && getComputedStyle(document.querySelector("#pane")).display === "none"), `${era}: the collapse box folds the window to its title bar`);
  await page.click("#w .shade");
  ok(await page.evaluate(() => !document.querySelector("#w").classList.contains("collapsed")), `${era}: and unfolds it`);
  await page.dblclick("#title");
  ok(await page.evaluate(() => !document.querySelector("#w").classList.contains("collapsed")), `${era}: a double click on the title bar does nothing by default`);
}
await load("platinum", win("absolute", 'data-clio-shade="dblclick"'));
await page.dblclick("#title");
ok(await page.evaluate(() => document.querySelector("#w").classList.contains("collapsed")), 'data-clio-shade="dblclick": a double click collapses');
await load("platinum", win("static"));
{ const [x, y] = await center("#title"); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 40, y + 40, { steps: 3 });
  ok(!(await page.$(".clio-outline")), "a window in the page's flow is not dragged"); await page.mouse.up(); }
// moving a window without dragging: the move button, its keys and its menu
await load("platinum", win() + win("static").replace('id="w"', 'id="w2"').replace('id="title"', 'id="title2"').replace('id="pane"', 'id="pane2"'));
const mv = await page.evaluate(() => { const h = document.querySelector("#w .clio-move"); return { has: !!h, name: h && h.getAttribute("aria-label"), role: h && h.tagName, staticHas: !!document.querySelector("#w2 .clio-move"), live: document.querySelector(".clio-live")?.getAttribute("aria-live") }; });
ok(mv.has && mv.role === "BUTTON" && /Untitled/.test(mv.name) && /Arrow keys/.test(mv.name) && !mv.staticHas && mv.live === "polite", `move button: a named button on movable windows only, and a polite live region from the start (${JSON.stringify(mv)})`);
await page.focus("#w .clio-move");
ok(await page.evaluate(() => getComputedStyle(document.querySelector("#w .title-bar")).outlineStyle) !== "none", "move button: with keyboard focus the title bar shows the ring");
const pos = () => page.evaluate(() => { const r = document.querySelector("#w").getBoundingClientRect(); return [r.left, r.top]; });
await page.keyboard.press("ArrowRight");
ok((await pos())[0] === 116 && await page.evaluate(() => document.querySelector(".clio-live").textContent) === "Untitled moved right", "move button: Right moves the window 16px and says so");
await page.keyboard.press("Shift+ArrowDown");
ok((await pos())[1] === 101, "move button: Shift moves 1px");
for (let i = 0; i < 20; i++) await page.keyboard.press("ArrowLeft");
ok((await pos())[0] === 0, "moves stay inside the page");
// the last move's announcement clears a second after it (the key presses may arrive late)
const cleared = await page.waitForFunction(() => document.querySelector(".clio-live").textContent === "", null, { timeout: 2500 }).then(() => true, () => false);
ok(cleared, "the announcement clears after a second");
await page.keyboard.press("Enter");
ok(await page.evaluate(() => document.querySelectorAll(".clio-move-menu [role=menuitem]").length) === 4 && await page.evaluate(() => document.activeElement.textContent) === "Move left", "move button: Return opens a menu of moves on its first item");
await page.keyboard.press("ArrowDown"); await page.keyboard.press("Enter");
ok((await pos())[0] === 16 && !(await page.$(".clio-move-menu")) && await page.evaluate(() => document.activeElement.classList.contains("clio-move")), "move menu: Move right moves 16px, closes and returns focus to the button");
const [mx, my] = await center("#title");
await page.mouse.click(mx, my, { button: "right" });
ok(!!(await page.$(".clio-move-menu")), "a right click on the title bar opens the move menu (no dragging needed)");
await page.keyboard.press("Escape");
ok(!(await page.$(".clio-move-menu")), "Esc closes the move menu");

// zoom rects
await load("system7", `<div id="a" style="position:absolute;left:600px;top:60px;width:32px;height:32px"></div><div id="b" style="position:absolute;left:80px;top:80px;width:300px;height:200px"></div>`);
const zr = await page.evaluate(async () => {
  const seen = []; let done = false;
  const p = clio.zoomRects(document.querySelector("#a"), document.querySelector("#b")).then(() => { done = true; });
  const total = document.querySelectorAll(".clio-outline").length;
  await new Promise((r) => { const t0 = performance.now(); const s = () => { seen.push([...document.querySelectorAll(".clio-outline")].filter((o) => o.style.opacity === "1").length); if (!done && performance.now() - t0 < 1000) requestAnimationFrame(s); else r(); }; s(); });
  await p; return { total, most: Math.max(...seen), left: document.querySelectorAll(".clio-outline").length };
});
ok(zr.total === 8 && zr.most <= 4 && zr.most >= 3 && zr.left === 0, `zoom rects: 8 outlines, at most 4 at once, gone after (${JSON.stringify(zr)})`);
// cursors
await load("platinum", `<div class="window"><div class="window-pane"><button id="cb">OK</button><textarea id="ct"></textarea></div></div>`);
const cur = await page.evaluate(() => [getComputedStyle(document.documentElement).cursor, getComputedStyle(document.querySelector("#cb")).cursor, getComputedStyle(document.querySelector("#ct")).cursor]);
ok(cur[0].includes("arrow.png") && cur[1].includes("arrow.png") && cur[2].includes("ibeam.png"), "cursors: the Mac's arrow on the page and buttons, its I-beam in text");
await load("drawingboard", `<div class="window"><div class="window-pane"><button id="cb">OK</button><textarea id="ct"></textarea></div></div>`);
const curdb = await page.evaluate(() => [getComputedStyle(document.documentElement).cursor, getComputedStyle(document.querySelector("#cb")).cursor, getComputedStyle(document.querySelector("#ct")).cursor]);
ok(curdb[0].includes("db-arrow.png") && curdb[0].includes("0 0") && curdb[1].includes("db-arrow.png") && curdb[2].includes("ibeam.png"), `cursors: Drawing Board's own arrow (crsr 128, hot spot 0,0) on the page and buttons, its I-beam in text (${curdb.join(" | ")})`);
// The watch: the 'acur' resource's seven frames (CURS -6078..-6072), four ticks each.
await load("platinum", `<div id="busy" aria-busy="true" style="width:40px;height:40px"></div>`);
const watch = await page.evaluate(async () => {
  const el = document.querySelector("#busy"), seen = new Set(), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 8; i++) { seen.add(el.style.getPropertyValue("--clio-cursor-wait")); await sleep(70); }
  el.setAttribute("aria-busy", "false"); await sleep(120);
  return { frames: [...seen].filter(Boolean).length, cleared: el.style.getPropertyValue("--clio-cursor-wait") === "" };
});
ok(watch.frames >= 3 && watch.cleared, `cursors: the watch spins (7 frames, 4 ticks each) while aria-busy and stops after (${JSON.stringify(watch)})`);
// System 6.0.8's watch: the System file's six 'CURS' 258-263, not the round watch.
await load("system6", `<div id="busy6" aria-busy="true" style="width:40px;height:40px"></div>`);
const watch6 = await page.evaluate(async () => {
  const el = document.querySelector("#busy6"), seen = new Set(), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let i = 0; i < 9; i++) { seen.add(el.style.getPropertyValue("--clio-cursor-wait")); await sleep(70); }
  const urls = [...seen].map((v) => (v.match(/watch6-\d\.png/) || [""])[0]).filter(Boolean);
  el.setAttribute("aria-busy", "false"); await sleep(120);
  return { frames: new Set(urls).size, cleared: el.style.getPropertyValue("--clio-cursor-wait") === "", any: urls[0] || "" };
});
ok(watch6.frames >= 3 && watch6.cleared && watch6.any.includes("watch6-"), `cursors: System 6's watch spins its six frames from the System file (${JSON.stringify(watch6)})`);
// sounds
await load("platinum", `<div id="host"></div>`);
const played = await page.evaluate(async () => {
  const log = []; window.Audio = class { constructor(u) { this.u = u; } play() { log.push(this.u); return Promise.resolve(); } };
  clio.sounds.alert = "beep.wav";
  document.querySelector("#host").innerHTML = '<div class="alert-box">Hi</div>';
  await new Promise((r) => setTimeout(r, 50));
  const off = log.length;
  document.documentElement.setAttribute("data-clio-sounds", "");
  document.querySelector("#host").innerHTML = '<div class="alert-box">Again</div>';
  await new Promise((r) => setTimeout(r, 50));
  return [off, log.length];
});
ok(played[0] === 0 && played[1] === 1, `sounds: silent by default, an alert plays "alert" with data-clio-sounds (${played})`);

// insertion point: drawn by clio.js in a window's field, blinking at the measured rate
await load("system7", `<div class="window"><div class="window-pane"><input type="text" id="f1" value="Hello"><input type="text" id="f2" data-clio-caret="off" value="x"></div></div><input type="text" id="f3">`);
const caret = await page.evaluate(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const f1 = document.querySelector("#f1"), get = () => document.querySelector(".clio-caret");
  f1.focus(); f1.setSelectionRange(5, 5); await frame();
  const on = !!get() && !get().hidden && f1.classList.contains("clio-caret-field");
  const flips = []; const mo = new MutationObserver(() => flips.push(performance.now()));
  mo.observe(get(), { attributes: true, attributeFilter: ["class"] });
  await sleep(1300); mo.disconnect();
  const gap = flips.length >= 2 ? flips[1] - flips[0] : 0;
  f1.setSelectionRange(1, 3); document.dispatchEvent(new Event("selectionchange")); await frame();
  const selection = !get() && !f1.classList.contains("clio-caret-field");
  f1.setSelectionRange(2, 2); document.dispatchEvent(new Event("selectionchange")); await frame();
  f1.dispatchEvent(new CompositionEvent("compositionstart", { bubbles: true })); await frame();
  const ime = !get();
  f1.dispatchEvent(new CompositionEvent("compositionend", { bubbles: true })); await frame();
  const back = !!get();
  document.querySelector("#f2").focus(); await frame();
  const optOut = !get();
  document.querySelector("#f3").focus(); await frame();
  const outside = !get();
  return { on, flips: flips.length, gap: Math.round(gap), selection, ime, back, optOut, outside };
});
ok(caret.on && caret.flips >= 2 && caret.gap > 500 && caret.gap < 600, `insertion point: drawn in a window's field, blinking every 32 ticks (System 7) (${JSON.stringify(caret)})`);
ok(caret.selection && caret.ime && caret.back, "insertion point: the browser's caret while text is selected or an input method composes");
ok(caret.optOut && caret.outside, "insertion point: data-clio-caret=\"off\" and fields outside a window keep the browser's");
await page.emulateMedia({ reducedMotion: "reduce" });
const still = await page.evaluate(async () => {
  const f1 = document.querySelector("#f1"); f1.focus(); f1.setSelectionRange(1, 1);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  const c = document.querySelector(".clio-caret"); let n = 0;
  const mo = new MutationObserver(() => n++); mo.observe(c, { attributes: true, attributeFilter: ["class"] });
  await new Promise((r) => setTimeout(r, 800)); mo.disconnect();
  return n === 0 && !c.classList.contains("clio-caret-off");
});
await page.emulateMedia({ reducedMotion: "no-preference" });
ok(still, "insertion point: lit and still under reduced motion");

// CJK (96-cjk.css): a page without CJK text loads none of the stand-ins; a Traditional Chinese
// option in a pop-up clio.js draws keeps its language, so its row gets the TC stand-in, and
// only that one is fetched.
{
  const faces = () => page.evaluate(async () => { await document.fonts.ready; await new Promise((r) => setTimeout(r, 300)); return [...document.fonts].filter((f) => /Clio Pixel/.test(f.family) && f.status !== "unloaded").map((f) => f.family.replace(/"/g, "")).sort().join(","); });
  await load("platinum", `<div class="clio" style="padding:20px;background:#ddd"><button>OK</button><p lang="en">Hello</p></div>`);
  ok(await faces() === "", "cjk: a page without CJK text loads no stand-in");
  await load("platinum", `${noBase}<div class="clio" style="padding:20px;background:#ddd"><select id="z" style="width:116px"><option selected>Roman</option><option lang="zh-Hant">繁體中文</option></select></div>`);
  const [zx, zy] = await center("#z");
  await page.mouse.move(zx, zy); await page.mouse.down();
  const row = await page.evaluate(() => { const li = document.querySelectorAll(".clio-popup-menu li")[1]; return li ? [li.lang, getComputedStyle(li).fontFamily].join("|") : ""; });
  ok(/^zh-Hant\|Taipei, "?Clio Pixel TC"?/.test(row), `cjk: the drawn pop-up's 繁體中文 row keeps zh-Hant and its stack (${row})`);
  ok(await faces() === "Clio Pixel TC", "cjk: the open menu fetches the TC stand-in and no other");
  await page.mouse.move(zx + 300, zy); await page.mouse.up();
}


// 7. Sound sets: a made-up set and alert list (tones, written here: no Apple sound is
// needed), served over HTTP. Every event clio.js tracks plays its sound once (clio:sound),
// each drag loop starts and stops, and only one runs at a time.
{
  const { createServer } = await import("node:http");
  const { readFileSync: rd, existsSync: ex } = await import("node:fs");
  const sdir = join(dir, "sounds"); mkdirSync(join(sdir, "set"), { recursive: true }); mkdirSync(join(sdir, "alerts"), { recursive: true });
  const wav = (n, rate = 22050) => { const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + n, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate, 28); h.writeUInt16LE(1, 32); h.writeUInt16LE(8, 34); h.write("data", 36); h.writeUInt32LE(n, 40); return Buffer.concat([h, Buffer.from(Array.from({ length: n }, (_, i) => 128 + Math.round(60 * Math.sin(i / 3))))]); };
  writeFileSync(join(sdir, "set", "1.wav"), wav(200, 11127)); writeFileSync(join(sdir, "alerts", "beep.wav"), wav(300));
  const EFFECTS = { 2: "mnuo mnuc mnui mnus", 1: "wclp wcle wclx wclr wzmp wzme wzmx wzmr wcop wcoe wcox wcor uclp ucle uclx uclr uzmp uzme uzmx uzmr ucop ucoe ucox ucor wopn wcls wzmi wzmo wcol wexp wact uopn ucls uzmi uzmo ucol uexp uact dopn dlgc aopn altc pwop pwcl blno blnc", 4: "btnp btne btnx btnr dbtp dbte dbtx dbtr cbtp cbte cbtx cbtr chkp chke chkx chkr radp rade radx radr sbap sbae sbax sbar sbte sbtp slte sltp bevp beve bevx bevr laup ladp lare larx laur ladr popp pope popx popr dscp dsce dscx dscr tabp tabe tabx tabr dtuh", 8: "dthi dtdr ftrs fsel fnew fdrp fcpd fral flap dski dske fdon fdof" };
  const LOOPS = { 1: "wmov wgro umov ugro dmov amov imov slgh drag", 4: "slth sbth sbgh sbai sbad" };
  const ref = { sound: 1, file: "1.wav", gain: 0.5, loop: null };
  const man = { name: "Test Tones", sounds: { 1: { file: "1.wav", rate: 11127.2727, loopStart: 0, loopEnd: 0 } }, events: {}, loops: {} };
  for (const [c, codes] of Object.entries(EFFECTS)) for (const k of codes.split(" ")) man.events[k] = { class: +c, play: ref };
  for (const [c, codes] of Object.entries(LOOPS)) for (const k of codes.split(" ")) man.loops[k] = { class: +c, roles: { attack: null, moving: ref, idle: ref, release: ref } };
  writeFileSync(join(sdir, "set", "manifest.json"), JSON.stringify(man));
  writeFileSync(join(sdir, "alerts", "manifest.json"), JSON.stringify({ kind: "alerts", eras: ["system7", "platinum"], list: ["Beep"], selected: "Beep", alerts: { Beep: { file: "beep.wav", rate: 22050 } } }));
  writeFileSync(join(sdir, "index.json"), JSON.stringify({ sets: [{ slug: "set", name: "Test Tones", manifest: "set/manifest.json" }], alerts: { platinum: { manifest: "alerts/manifest.json", eras: ["platinum"] } }, defaults: { platinum: "set" } }));
  const server = createServer((q, s) => {
    const f = join(root, decodeURIComponent(new URL(q.url, "http://x").pathname));
    if (!f.startsWith(root) || !ex(f)) { s.writeHead(404); return s.end(); }
    s.writeHead(200, { "content-type": f.endsWith(".json") ? "application/json" : f.endsWith(".wav") ? "audio/wav" : f.endsWith(".css") ? "text/css" : f.endsWith(".js") ? "text/javascript" : "text/html" });
    s.end(rd(f));
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  const http = `http://127.0.0.1:${server.address().port}`;
  const rel = (p) => p.slice(root.length).split("\\").join("/");
  async function hload(era, body) {
    const file = join(dir, `snd-${era}-${ENGINE}.html`);
    writeFileSync(file, `<!doctype html><html data-era="${era}"><head><meta charset="utf-8"><link rel="stylesheet" href="/dist/clio.css"></head><body style="margin:20px">${body}<script src="/${process.env.CLIO_JS === "min" ? "dist/clio.min.js" : "dist/clio.js"}"></script></body></html>`);
    await page.goto(http + rel(file));
    const r = await page.evaluate(async ([s, a]) => {
      window.heard = []; document.addEventListener("clio:sound", (e) => window.heard.push(e.detail.kind === "one-shot" || e.detail.kind === "alert" ? e.detail.code : `${e.detail.code}:${e.detail.kind}`));
      return [await clio.sounds.use(s), await clio.sounds.use(a)];
    }, [rel(join(sdir, "set", "manifest.json")), rel(join(sdir, "alerts", "manifest.json"))]);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    return r;
  }
  const heard = async () => { await page.waitForTimeout(60); return page.evaluate(() => window.heard.splice(0).join(" ")); };
  const press = async (sel, how = {}) => {
    const [x, y, b] = await center(sel);
    await page.mouse.move(x, y); await page.mouse.down();
    if (how.out) { await page.mouse.move(x, b.y + b.height + 40); await page.mouse.move(x, y); }
    if (how.hold) await page.waitForTimeout(how.hold);
    await page.mouse.up();
  };
  const loaded = await hload("platinum", `<div class="clio" style="padding:20px;background:#ddd">
    <button id="b1">Plain</button><button id="b2" class="default">OK</button><button id="b3" data-clio-cancel>Cancel</button>
    <input type="checkbox" id="c1"><input type="radio" id="r1"><button class="bevel" id="v1">B</button>
    <button class="disclosure" id="d1" aria-expanded="false" aria-label="Show"></button>
    <div role="tablist"><button role="tab" id="t1" aria-selected="true">A</button></div>
    <span class="little-arrows" role="group"><button class="up" id="lu" aria-label="Up"></button><button class="down" id="ld" aria-label="Down"></button></span>
    <input type="range" id="sl" min="0" max="10" value="5" style="width:120px">
  </div>`);
  ok(loaded[0] && loaded[0].sounds === 1 && loaded[1] && loaded[1].sounds === 1, `sounds: a set and an alert list load and decode (${JSON.stringify(loaded)})`);
  ok(await heard() === "", "sounds: loading plays nothing");
  await press("#b1"); ok(await heard() === "btnp btnr", "sounds: a push button plays press and release once each");
  await press("#b1", { out: true }); ok(await heard() === "btnp btnx btne btnr", "sounds: leaving and re-entering a held button plays exit and enter");
  await press("#b2"); ok(await heard() === "dbtp dbtr", "sounds: the default button has its own kind");
  await press("#b3"); ok(await heard() === "cbtp cbtr", "sounds: the cancel button has its own kind");
  await press("#c1"); await press("#r1"); await press("#v1"); await press("#d1"); await press("#t1");
  ok(await heard() === "chkp chkr radp radr bevp bevr dscp dscr tabp tabr", "sounds: check box, radio button, bevel button, disclosure triangle and tab");
  await press("#lu"); await press("#ld"); ok(await heard() === "laup laur ladp ladr", "sounds: little arrows, up and down apart");
  {
    const [x, y, b] = await center("#sl");
    await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 12; i++) await page.mouse.move(x + i * 8, y);
    await page.mouse.up();
    const h = await heard();
    ok(/^sltp slth:loop-start .*slth:loop-stop$/.test(h) && (h.match(/slte/g) || []).length === 1, `sounds: a slider plays its press, runs its thumb loop and the end of the track once (${h})`);
  }
  await page.evaluate(() => { clio.play("ftrs"); clio.play("dtdr"); });
  ok(await heard() === "ftrs dtdr", "sounds: clio.play for the Finder's and the Drag Manager's kinds");
  await page.evaluate(() => { clio.sounds.beginDrag("drag"); clio.sounds.beginDrag("wgro"); clio.sounds.endDrag(); });
  ok(await heard() === "drag:loop-start drag:loop-stop wgro:loop-start wgro:loop-stop", "sounds: one drag loop at a time; a second ends the first");
  // dialogs, alerts, windows, balloons
  await page.evaluate(() => {
    const h = document.body;
    h.insertAdjacentHTML("beforeend", '<div class="modal-dialog" id="dg">Dialog</div>');
  });
  ok(await heard() === "dopn", "sounds: a dialog appearing plays dopn");
  await page.evaluate(() => document.querySelector("#dg").remove());
  ok(await heard() === "dlgc", "sounds: and closing plays dlgc");
  await page.evaluate(() => document.body.insertAdjacentHTML("beforeend", '<div class="alert-box" id="al">Alert</div>'));
  { const h = await heard(); ok(h === "alert aopn", `sounds: an alert plays the era's alert sound and aopn (${h})`); }
  await page.evaluate(() => { document.querySelector("#al").hidden = true; });
  { const h = await heard(); ok(h === "altc", `sounds: hiding the alert plays altc (${h})`); }
  await page.evaluate(() => document.body.insertAdjacentHTML("beforeend", '<div class="balloon" id="bl">Help</div>'));
  await page.evaluate(() => document.querySelector("#bl").remove());
  ok(await heard() === "blno blnc", "sounds: a balloon shown and hidden");
  await page.evaluate(() => document.body.insertAdjacentHTML("beforeend", '<dialog id="dd">Native</dialog>'));
  await page.evaluate(() => document.querySelector("#dd").show()); await page.evaluate(() => document.querySelector("#dd").close());
  ok(await heard() === "dopn dlgc", "sounds: <dialog> open and close");
  // windows: open, activate, close box, collapse, drag, close
  await page.evaluate(() => document.body.insertAdjacentHTML("beforeend", `<div class="window inactive" id="w" style="position:absolute;left:300px;top:200px;width:220px"><div class="title-bar"><button class="close" aria-label="Close"></button><h1 class="title">Doc</h1><button class="shade" aria-label="Collapse"></button></div><div class="window-pane" style="height:60px"></div></div>`));
  ok(await heard() === "wopn", "sounds: a window appearing plays wopn");
  await page.evaluate(() => document.querySelector("#w").classList.remove("inactive"));
  ok(await heard() === "wact", "sounds: a window losing .inactive plays wact");
  await press("#w .close"); ok(await heard() === "wclp wclr", "sounds: the close box");
  await press("#w .shade"); ok(await heard() === "wcop wcor wcol", "sounds: the collapse box, then the window collapses");
  await press("#w .shade"); ok(await heard() === "wcop wcor wexp", "sounds: and expands");
  {
    const [x, y] = await center("#w .title");
    await page.mouse.move(x, y); await page.mouse.down();
    for (let i = 1; i <= 5; i++) await page.mouse.move(x + i * 10, y + i * 5);
    await page.mouse.up();
    ok(await heard() === "wmov:loop-start wmov:loop-stop", "sounds: dragging a window starts and stops its drag loop");
  }
  await page.evaluate(() => { document.querySelector("#w").classList.add("utility"); });
  { const [x, y] = await center("#w .title"); await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 20, y + 10); await page.mouse.up(); }
  ok(await heard() === "umov:loop-start umov:loop-stop", "sounds: a utility window has its own drag loop");
  await page.evaluate(() => document.querySelector("#w").remove());
  ok(await heard() === "ucls", "sounds: closing a utility window plays ucls");
  // menus and pop-ups
  await hload("platinum", `<ul class="menu-bar" role="menubar" style="position:relative"><li><button>File</button><ul class="menu" role="menu"><li id="m1"><button>New</button></li><li id="m2"><button>Open</button></li></ul></li></ul>
    <div style="height:120px"></div><select id="sel" style="width:120px"><option>One</option><option>Two</option></select>
    <div class="clio-scroll" id="sc" style="width:200px;height:150px;overflow:scroll;background:#fff"><div style="width:800px;height:2000px"></div></div>`);
  {
    const [x, y] = await center(".menu-bar > li > button");
    await page.mouse.move(x, y); await page.mouse.down();
    const [ix, iy] = await center("#m1"); await page.mouse.move(ix, iy);
    const [jx, jy] = await center("#m2"); await page.mouse.move(jx, jy);
    await page.mouse.up(); await page.waitForTimeout(250);
    { const h = await heard(); ok(h === "mnuo mnui mnui mnus", `sounds: a menu opens, each item lights and the chosen one sounds; no close sound after a choice (${h})`); }
    await page.waitForFunction(() => !document.querySelector(".menu-bar > li.open"));   // the chosen item's blink is over
    await page.evaluate(() => window.heard.splice(0));
    await page.mouse.move(x, y); await page.mouse.down(); await page.mouse.move(x + 300, y + 300); await page.mouse.up();
    { const h = await heard(); ok(h === "mnuo mnuc", `sounds: a menu let go of plays its close (${h})`); }
  }
  if (!(await page.evaluate(() => document.documentElement.hasAttribute("data-clio-popups") && getComputedStyle(document.querySelector("#sel")).appearance === "base-select"))) {
    const [x, y] = await center("#sel");
    await page.mouse.move(x, y); await page.mouse.down();
    const [px2, py2] = await center(".clio-popup-menu li:nth-child(2)");
    await page.mouse.move(px2, py2); await page.mouse.up(); await page.waitForTimeout(250);
    const h = await heard();
    ok(/^popp( mnui)+ mnus$/.test(h), `sounds: a pop-up presses, lights its items and chooses (${h})`);
  } else passed++;
  {
    const arrow = async (sel, hold) => { const [x, y] = await center(sel); await page.mouse.move(x, y); await page.mouse.down(); await page.waitForTimeout(hold); await page.mouse.up(); };
    await arrow("#sc .clio-sb-v .clio-sb-inc", 30);
    ok(await heard() === "sbap sbar", "sounds: a scroll arrow clicked");
    await arrow("#sc .clio-sb-v .clio-sb-inc", 400);
    ok(await heard() === "sbap sbai:loop-start sbai:loop-stop sbar", "sounds: a scroll arrow held runs its loop");
    const b = await page.locator("#sc .clio-sb-v").boundingBox();
    await page.mouse.move(b.x + b.width / 2, b.y + b.height - 30); await page.mouse.down(); await page.waitForTimeout(500); await page.mouse.up();
    const h = await heard();
    ok(/^sbtp( sbte)?$/.test(h), `sounds: the lane pages (${h})`);
    const [tx, ty] = await center("#sc .clio-sb-v .clio-sb-thumb");
    await page.mouse.move(tx, ty); await page.mouse.down(); await page.mouse.move(tx, ty + 20); await page.mouse.move(tx, ty + 30); await page.mouse.up();
    ok(await heard() === "sbth:loop-start sbth:loop-stop", "sounds: Platinum's live scroll box runs sbth");
  }
  // classes, mute, eras
  await page.evaluate(() => document.documentElement.setAttribute("data-clio-sounds", "menus"));
  await page.evaluate(() => { clio.play("btnp"); clio.play("mnuo"); });
  ok(await heard() === "mnuo", 'sounds: data-clio-sounds="menus" keeps only the menu class');
  await page.evaluate(() => { document.documentElement.setAttribute("data-clio-sounds", "none"); clio.play("mnuo"); document.documentElement.removeAttribute("data-clio-sounds"); clio.sounds.muted = true; clio.play("mnuo"); clio.sounds.muted = false; clio.play("mnuo"); });
  ok(await heard() === "mnuo", 'sounds: "none" and clio.sounds.muted silence the page');
  await hload("system7", `<div class="clio"><button id="b">OK</button></div>`);
  await press("#b");
  await page.evaluate(() => document.body.insertAdjacentHTML("beforeend", '<div class="alert-box">Alert</div>'));
  { const h = await heard(); ok(h === "alert", `sounds: System 7 has no interface sounds, only its alert sound (${h})`); }
  // The Appearance-style panel (js/clio-sounds-panel.js): off until chosen, remembered.
  {
    const file = join(dir, `panel-${ENGINE}.html`);
    writeFileSync(file, `<!doctype html><html data-era="platinum"><head><meta charset="utf-8"><link rel="stylesheet" href="/dist/clio.css"></head><body style="margin:20px"><div class="clio"><div id="panel"></div><button id="pb">OK</button></div><script src="/dist/clio.js"></script><script src="/dist/clio-sounds-panel.js"></script><script>window.panel = clioSoundsPanel(document.querySelector("#panel"), { base: "${rel(sdir)}/" }); window.heard = []; document.addEventListener("clio:sound", (e) => window.heard.push(e.detail.code));</script></body></html>`);
    const fetched = []; const onReq = (r) => { if (/manifest\.json|\.wav/.test(r.url())) fetched.push(r.url()); };
    await page.goto(http + rel(file));
    await page.evaluate(() => { try { localStorage.clear(); } catch {} });
    page.on("request", onReq);
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll("#panel select option").length >= 2);
    const first = await page.evaluate(() => ({ track: document.querySelector("#panel select").value, boxes: [...document.querySelectorAll("#panel input[type=checkbox]")].map((c) => c.checked) }));
    await press("#pb");
    ok(/none/i.test(first.track) && first.boxes.length === 4 && first.boxes.every(Boolean) && fetched.length === 0 && (await page.evaluate(() => window.heard.length)) === 0, `panel: starts on None with all four classes, loads nothing and plays nothing (${JSON.stringify(first)}, fetched ${fetched.length})`);
    await page.selectOption("#panel select", { label: "Test Tones" });
    await page.waitForFunction(() => clio.sounds.loaded.sets.length === 1 && clio.sounds.loaded.alerts.length === 1, null, { timeout: 5000 }).catch(() => {});
    await press("#pb");
    ok((await page.evaluate(() => window.heard.splice(0).join(" "))) === "btnp btnr", "panel: choosing a sound track loads it and the button sounds");
    for (const c of await page.$$("#panel input[type=checkbox]")) await c.click();
    ok(await page.evaluate(() => document.documentElement.getAttribute("data-clio-sounds")) === "none", 'panel: all four classes unchecked sets data-clio-sounds="none"');
    await page.reload();
    await page.waitForFunction(() => document.querySelectorAll("#panel select option").length >= 2);
    await page.waitForFunction(() => clio.sounds.loaded.sets.length === 1, null, { timeout: 5000 }).catch(() => {});
    const back = await page.evaluate(() => ({ track: document.querySelector("#panel select").value, attr: document.documentElement.getAttribute("data-clio-sounds"), sets: clio.sounds.loaded.sets.length }));
    ok(back.track === "set" && back.attr === "none" && back.sets === 1, `panel: the choice is remembered across a reload (${JSON.stringify(back)})`);
    await page.selectOption("#panel select", { index: 0 });
    await page.evaluate(() => { for (const c of document.querySelectorAll("#panel input[type=checkbox]")) c.click(); });
    await press("#pb");
    ok(await page.evaluate(() => clio.sounds.muted && window.heard.length === 0), "panel: None again mutes the page");
    await page.evaluate(() => window.panel.destroy());
    ok(await page.evaluate(() => !document.querySelector("#panel select")), "panel: destroy() removes it");
    page.off("request", onReq);
  }
  server.close();
}

ok(errors.length === 0, "no page errors: " + errors.join("; "));
await browser.close();
console.log(failed ? `FAIL ${failed} of ${passed + failed} behaviour checks (${ENGINE})` : `ok ${passed} behaviour checks (${ENGINE})`);
process.exit(failed ? 1 : 0);
