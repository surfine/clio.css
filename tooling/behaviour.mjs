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
  ok(pause >= 150, `${era}: then waits before repeating (${pause} ms)`);
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
    const [nx, ny] = await center("#new"); await page.mouse.move(nx, ny, { steps: 3 }); await page.mouse.click(nx, ny);
    await page.waitForTimeout(450);
    ok(await page.evaluate(() => window.chose) === "new" && !(await shown("#m")), "platinum: a click on an item of an open menu chooses it");
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

ok(errors.length === 0, "no page errors: " + errors.join("; "));
await browser.close();
console.log(failed ? `FAIL ${failed} of ${passed + failed} behaviour checks (${ENGINE})` : `ok ${passed} behaviour checks (${ENGINE})`);
process.exit(failed ? 1 : 0);
