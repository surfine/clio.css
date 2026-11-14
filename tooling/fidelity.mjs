// Pixel check: render clio.css Platinum specimens at 1x and compare them with
// the Mac OS 9.0 reference crops (GUIdebook captures) that AI System 6 keeps as
// evidence. The references are Apple screenshots, so they are read from a
// local AI System 6 checkout and never copied into this repository.
//
//   AIS6_DIR=/path/to/AI\ System\ 6 npm run fidelity
//
// Needs Playwright with Chromium: installed here, or found in AIS6_DIR.
// Writes side-by-side images to .fidelity/ (git-ignored).
import { createRequire } from "node:module";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const ais6 = process.env.AIS6_DIR || "/Users/aaron/AI System 6";
const tiles = join(ais6, "internal/evidence/drafts/theme-lab-fidelity/platinum/tiles");
if (!existsSync(tiles)) {
  console.error(`No reference tiles at ${tiles}. Set AIS6_DIR to an AI System 6 checkout.`);
  process.exit(2);
}
let playwright;
for (const base of [join(root, "package.json"), join(ais6, "package.json")]) {
  try { playwright = createRequire(base)("playwright"); break; } catch {}
}
if (!playwright) { console.error("Playwright not found (npm i -D playwright, or point AIS6_DIR at a checkout that has it)."); process.exit(2); }

// Each specimen: markup, the element to crop, the crop box, and the reference tile.
// The Appearance control panel has no zoom box: close and WindowShade only.
const W = (width, title, extra = "", cls = "window", zoom = false) => `<div class="${cls}" id="s" style="width:${width}px">
  <div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">${title}</h2>${zoom ? '<button class="resize" aria-label="Zoom"></button>' : ""}<button class="shade" aria-label="Collapse"></button></div>
  <div class="window-pane" style="height:40px">${extra}</div></div>`;
const specimens = [
  // GUIdebook's Mac took these with font smoothing on, so its titles are antialiased:
  // the title text is masked here and checked against Infinite Mac (p9-titlebar-*, 100%).
  { id: "active-titlebar", html: W(476, "Appearance"), crop: [0, 0, 477, 22], mask: [[193, 3, 89, 14], [476, 0, 1, 2]] },   // and GUIdebook's white page beside the shadow
  { id: "inactive-titlebar", html: W(423, "Web Sharing", "", "window inactive", true), crop: [0, 0, 424, 22], mask: [[169, 3, 83, 15], [423, 0, 1, 2]] },
  { id: "default-ok", html: `<div style="padding:12px;background:#ddd"><button class="default" id="s" style="width:65px">OK</button></div>`, crop: [-4, -7, 73, 32], mask: [[27, 10, 20, 13]] },   // the label: GUIdebook's is antialiased
  { id: "button-disabled", html: `<div style="padding:12px;background:#ddd"><button id="s" disabled style="width:80px">Eject</button></div>`, crop: [0, 0, 80, 20], mask: [[29, 4, 27, 12]] },
  { id: "checkbox-checked", html: `<div style="padding:12px;background:#ddd"><input type="checkbox" id="s" checked></div>`, crop: [0, 0, 12, 12] },
  { id: "checkbox-unchecked", html: `<div style="padding:12px;background:#ddd"><input type="checkbox" id="s"></div>`, crop: [0, 0, 12, 12] },
  { id: "selected-tab", html: `<div style="padding:12px;background:#ddd"><div role="tablist"><button role="tab" aria-selected="true" id="s" style="width:103px">Appearance</button></div></div>`, crop: [0, 0, 103, 24], mask: [[12, 5, 80, 13]] },   // the label: GUIdebook's is antialiased differently
];

// System 6: crops of the System 6.0.8 frames from `npm run capture:system6`
// (.fidelity/system6), compared after thresholding to 1-bit. `ref` is the crop
// in the 512x342 frame; `crop` the same box around the clio.css element.
const s6dir = join(root, ".fidelity/system6");
const S6 = (id, html, crop, file, ref) => ({ id, era: "system6", html, crop, mono: true, refFile: join(s6dir, file + ".png"), refCrop: ref });
const s6Window = `<div class="window" id="s" style="width:240px;position:relative"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Macintosh HD</h2><button class="resize" aria-label="Zoom"></button></div><div class="details-bar"><span>2 items</span></div><div class="window-pane" style="height:80px"></div></div>`;
const s6Scroll = `<div class="clio-scroll" id="s" style="width:120px;height:120px;overflow:scroll;background:#fff"><div style="width:400px;height:400px"></div></div>`;
specimens.push(
  S6("s6-titlebar", s6Window, [1, 0, 240, 19], "hd-window", [0, 27, 240, 19]),
  S6("s6-default-ok", `<div class="clio" style="padding:12px;background:#fff"><button class="default" id="s" style="width:60px">OK</button></div>`, [-4, -4, 68, 28], "alert", [80, 154, 68, 28]),
  S6("s6-checkbox", `<div style="padding:12px;background:#fff"><input type="checkbox" id="s"></div>`, [0, 0, 12, 12], "get-info", [224, 52, 12, 12]),
  S6("s6-radio-on", `<div style="padding:12px;background:#fff"><input type="radio" id="s" checked></div>`, [0, 0, 12, 12], "control-panel", [359, 109, 12, 12]),
  S6("s6-radio-off", `<div style="padding:12px;background:#fff"><input type="radio" id="s"></div>`, [0, 0, 12, 12], "control-panel", [335, 109, 12, 12]),
  S6("s6-scroll-up", s6Scroll, [106, 0, 14, 14], "system-folder", [414, 102, 14, 14]),
  // clio.js: the scroll box dragged 56px down (frame scroll-box-drag: System Folder's list, the box
  // pressed at 124 and held at 180; the pointer is masked). Its frame XORed with dkGray stays behind.
  { ...S6("s6-js-scroll-drag", `<div class="clio-scroll" id="s" style="width:120px;height:160px;overflow-y:scroll;overflow-x:hidden;background:#fff"><div style="height:2000px"></div></div>`, [105, 15, 15, 90], "scroll-box-drag", [413, 117, 15, 90]), js: true, mask: [[5, 62, 10, 16]],
    act: async (page, b) => { await page.mouse.move(b.x + 113, b.y + 22); await page.mouse.down(); await page.mouse.move(b.x + 113, b.y + 78, { steps: 4 }); } },
  S6("s6-grow-box", s6Scroll, [106, 106, 14, 14], "system-folder", [414, 256, 14, 14]),
  S6("s6-scroll-left", s6Scroll, [0, 106, 14, 14], "hd-window", [0, 137, 14, 14]),
  S6("s6-scroll-right", s6Scroll, [91, 106, 14, 14], "hd-window", [209, 137, 14, 14]),
  S6("s6-checkbox-checked", `<div style="padding:12px;background:#fff"><input type="checkbox" id="s" checked></div>`, [0, 0, 12, 12], "get-info-checked", [224, 52, 12, 12]),
  { ...S6("s6-button-pressed", `<div class="clio" style="padding:12px;background:#fff"><button class="active" id="s" style="width:60px">Cancel</button></div>`, [0, 0, 60, 20], "button-pressed", [164, 158, 60, 20]), mask: [[28, 8, 11, 12]] },
  { ...S6("s6-button-hover", `<div class="clio" style="padding:12px;background:#fff"><button id="s" style="width:60px">Cancel</button></div>`, [0, 0, 60, 20], "button-hover", [164, 158, 60, 20]), mask: [[28, 8, 10, 12]] },
  S6("s6-popup-end", `<div class="clio" style="padding:12px;background:#fff"><select id="s" style="width:116px"><option>Macintosh HD</option></select></div>`, [111, 0, 6, 19], "save-dialog", [248, 107, 6, 19]),   // the frame's end and shadow: the reference is Standard File's disk box (icon + name), so labels differ
  S6("s6-progress-fill", `<div style="padding:12px;background:#fff"><progress id="s" max="100" value="60" style="width:228px"></progress></div>`, [0, 0, 12, 12], "copy-progress", [109, 93, 12, 12]),
  S6("s6-info-line", `<div class="window" id="s" style="width:240px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Macintosh HD</h2><button class="resize" aria-label="Zoom"></button></div><div class="details-bar"><span>2 items</span></div><div class="window-pane" style="height:40px"></div></div>`, [1, 19, 60, 17], "hd-window", [0, 46, 60, 17]),
  S6("s6-geneva-12", `<div style="padding:12px;background:#fff"><div class="text" id="s" style="font-size:12px;line-height:16px;white-space:nowrap">Welcome to Infinite Macintosh!</div></div>`, [0, 0, 160, 16], "teachtext", [9, 42, 160, 16]),
  // "Print", disabled: the label through the 50% pattern. QuickDraw aligns the pattern to the
  // screen; the specimen sits where x + y has the capture's parity (li at 37,38 vs 35,52; the menu has no top line).
  S6("s6-menu-disabled", `<div style="padding:14px 12px 12px;background:#fff"><ul class="menu" role="menu" style="width:146px"><li class="disabled" id="s"><span>Print</span></li></ul></div>`, [0, 0, 60, 16], "file-menu", [35, 52, 60, 16]),
  S6("s6-menu-separator", `<div style="padding:12px;background:#fff"><ul class="menu" role="menu" style="width:146px"><li role="separator" id="s"></li></ul></div>`, [0, 0, 136, 16], "file-menu", [34, 164, 136, 16]),
);

// System 7: crops of the System 7.5.3 frames from `npm run capture:system7`, in colour.
const s7dir = join(root, ".fidelity/system7");
const S7 = (id, html, crop, file, ref) => ({ id, era: "system7", html, crop, refFile: join(s7dir, file + ".png"), refCrop: ref });
const s7Window = (cls, title) => `<div class="${cls}" id="s" style="width:376px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">${title}</h2><button class="resize" aria-label="Zoom"></button></div><div class="window-pane" style="height:40px"></div></div>`;
specimens.push(
  { ...S7("s7-titlebar", s7Window("window", "Infinite HD"), [0, 0, 377, 19], "hd-window", [29, 55, 377, 19]), mask: [[218, 7, 14, 13], [376, 0, 1, 1]] },   // the pointer, and desktop beside the shadow
  { ...S7("s7-titlebar-inactive", s7Window("window inactive", "Infinite HD"), [0, 0, 377, 16], "folder-window", [29, 55, 377, 16]), mask: [[376, 0, 1, 1]] },   // desktop beside the shadow
  // WindowShade (clicks set to 2, the Infinite HD window double-clicked): the title bar alone, closed by the frame.
  { ...S7("s7-collapsed", `<div class="window collapsed" id="s" style="width:228px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Infinite HD</h2><button class="resize" aria-label="Zoom"></button></div><div class="window-pane" style="height:40px"></div></div>`, [0, 0, 229, 20], "shaded", [109, 171, 229, 20]), mask: [[228, 0, 1, 1], [0, 19, 1, 1]] },
  S7("s7-scroll-up", s6Scroll, [106, 0, 14, 14], "folder-window", [406, 110, 14, 14]),
  // Content long enough that the scroll box is System 7's 16 rows.
  S7("s7-scroll-thumb", `<div class="clio-scroll" id="s" style="width:120px;height:120px;overflow:scroll;background:#fff"><div style="width:400px;height:562px"></div></div>`, [106, 15, 14, 15], "folder-window", [406, 125, 14, 15]),   // the box's drawing; its length is Chromium's (26px at least, see EVIDENCE: scroll box)
  S7("s7-grow-box", s6Scroll, [106, 106, 14, 14], "folder-window", [406, 234, 14, 14]),
  // The horizontal bar (frame hbar: the Infinite HD window narrowed until it scrolls sideways).
  S7("s7-scroll-left", s6Scroll, [0, 106, 14, 14], "hbar", [110, 394, 14, 14]),
  S7("s7-scroll-right", s6Scroll, [91, 106, 14, 14], "hbar", [307, 394, 14, 14]),
  S7("s7-hscroll-thumb", `<div class="clio-scroll" id="s" style="width:120px;height:120px;overflow:scroll;background:#fff"><div style="width:562px;height:400px"></div></div>`, [15, 106, 15, 14], "hbar", [125, 394, 15, 14]),
  // The lane's pattern keeps to the screen, which only clio.js can follow (it keeps it to the page):
  // the scroller sits where its page position has the frame's screen position's phase (mod 8).
  { ...S7("s7-js-hscroll-lane", `<div style="padding-left:6px"><div class="clio-scroll" id="s" style="width:120px;height:120px;overflow-x:scroll;overflow-y:hidden;background:#fff"><div style="width:4000px;height:20px"></div></div></div>`, [50, 106, 40, 14], "hbar", [160, 394, 40, 14]), js: true },
  S7("s7-alert-frame", `<div class="alert-box" id="s" style="width:200px;height:80px"></div>`, [0, 0, 18, 18], "page-setup", [208, 110, 18, 18]),
  S7("s7-checkbox-on", `<div style="padding:12px;background:#fff"><input type="checkbox" id="s" checked></div>`, [0, 0, 12, 12], "general-controls", [33, 81, 12, 12]),
  S7("s7-checkbox-off", `<div style="padding:12px;background:#fff"><input type="checkbox" id="s"></div>`, [0, 0, 12, 12], "general-controls", [33, 129, 12, 12]),
  S7("s7-radio-on", `<div style="padding:12px;background:#fff"><input type="radio" id="s" checked></div>`, [0, 0, 12, 12], "general-controls", [429, 85, 12, 12]),
  S7("s7-radio-off", `<div style="padding:12px;background:#fff"><input type="radio" id="s"></div>`, [0, 0, 12, 12], "general-controls", [395, 85, 12, 12]),
  S7("s7-popup-end", `<div class="clio" style="padding:12px;background:#fff"><select id="s" style="width:138px"><option>U.S.</option></select></div>`, [114, 0, 26, 20], "numbers", [365, 71, 26, 20]),
  // The capture holds a bar 2px into the copy: compare its filled start and an unfilled run.
  S7("s7-progress-fill", `<div style="padding:12px;background:#fff"><progress id="s" max="100" value="60" style="width:200px"></progress></div>`, [0, 0, 3, 11], "copy-progress", [270, 181, 3, 11]),
  S7("s7-progress-track", `<div style="padding:12px;background:#fff"><progress id="s" max="100" value="60" style="width:200px"></progress></div>`, [150, 0, 8, 11], "copy-progress", [273, 181, 8, 11]),
  S7("s7-menu-separator", `<div style="padding:12px;background:#fff"><ul class="menu" role="menu" style="width:146px"><li role="separator" id="s"></li></ul></div>`, [0, 0, 100, 16], "file-menu", [34, 84, 100, 16]),
  S7("s7-default-ok", `<div class="clio" style="padding:12px;background:#fff"><button class="default" id="s" style="width:59px">OK</button></div>`, [-4, -4, 67, 28], "page-setup", [511, 198, 67, 28]),
);

// Drawing Board: crops of Mac OS 8.5 with the 8.5b6 theme from `npm run capture:drawingboard`.
// The window is the Appearance control panel (outline at 161,68, 476px wide).
const dbdir = join(root, ".fidelity/drawingboard");
const ART = pathToFileURL(join(root, "dist/art/drawingboard")).href;
const DB = (id, html, crop, file, ref) => ({ id, era: "drawingboard", html, crop, refFile: join(dbdir, file + ".png"), refCrop: ref });
const dbPlain = `<div class="window" id="s" style="width:376px;height:369px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Date &amp; Time</h2><button class="collapse" aria-label="Collapse"></button></div><div class="window-pane" style="flex:1"></div></div>`;
const dbWindow = `<div class="window" id="s" style="width:476px;height:120px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Appearance</h2><button class="collapse" aria-label="Collapse"></button></div><div class="window-pane" style="height:60px"></div></div>`;
specimens.push(
  DB("db-close-box", dbWindow, [5, 5, 11, 11], "appearance", [166, 73, 11, 11]),
  DB("db-collapse-box", dbWindow, [460, 5, 11, 11], "appearance", [621, 73, 11, 11]),
  // Frame corners on a plain window (Date & Time, 376x369): the Appearance
  // window's body under its title is the tab control's, not the window paper.
  DB("db-titlebar-left", dbPlain, [0, 0, 40, 26], "date-time", [210, 68, 40, 26]),
  DB("db-titlebar-right", dbPlain, [336, 0, 40, 26], "date-time", [546, 68, 40, 26]),
  { ...DB("db-window-bottom-left", dbPlain, [0, 329, 40, 40], "date-time", [210, 397, 40, 40]), mask: [[16, 4, 22, 21]] },   // the panel's help button
  { ...DB("db-window-bottom-right", dbPlain, [336, 329, 40, 40], "date-time", [546, 397, 40, 40]), mask: [[0, 0, 15, 14]] },   // the panel's own size box
  DB("db-popup-end", `<div style="padding:12px;background:#e7ded6"><select id="s" style="width:180px"><option>Drawing Board</option></select></div>`, [140, 0, 40, 20], "appearance", [428, 143, 40, 20]),
  DB("db-menubar", `<ul class="menu-bar" role="menubar" id="s" style="width:600px"><li role="none"><button role="menuitem">File</button></li></ul>`, [300, 0, 200, 22], "file-menu", [300, 0, 200, 22]),
  // Themes tab: the "Save Theme…" button (518..619 x 370..389) and the theme list's scroll bar (192..585 x 297..312).
  DB("db-button-whole", `<div style="padding:12px;background:#e7ded6"><button id="s" style="width:103px">Save Theme…</button></div>`, [0, 0, 103, 21], "themes-tab", [518, 370, 103, 21]),
  DB("db-button-end", `<div style="padding:12px;background:#e7ded6"><button id="s" style="width:103px">Save Theme…</button></div>`, [88, 0, 16, 21], "themes-tab", [606, 370, 16, 21]),
  // The Themes tab's list scroll bar (Mac OS drew its track half a tile along). Chromium will not draw
  // a scroll box shorter than 26px (the theme's is 15 here; WebKit and Firefox with clio.js draw 15), so the
  // box's ends and grip are compared apart, without the track lines above and below them, which differ along
  // the track. The content is 5486px wide so the box is 26px long by proportion in every engine.
  DB("db-scroll-arrow", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:5486px;height:20px"></div></div>`, [0, 44, 16, 16], "themes-tab", [192, 297, 16, 16]),
  DB("db-scroll-thumb-start", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:5486px;height:20px"></div></div>`, [16, 44, 6, 16], "themes-tab", [208, 297, 6, 16]),
  DB("db-scroll-thumb-grip", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:5486px;height:20px"></div></div>`, [28, 45, 2, 14], "themes-tab", [214, 298, 2, 14]),
  DB("db-scroll-thumb-end", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:5486px;height:20px"></div></div>`, [35, 45, 7, 14], "themes-tab", [216, 298, 7, 14]),
  DB("db-scroll-track", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:5486px;height:20px"></div></div>`, [100, 44, 100, 16], "themes-tab", [292, 297, 100, 16]),
  // The same bar drawn by clio.js, which keeps the theme's 15px box: compared whole.
  { ...DB("db-js-scroll-arrow", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:40000px;height:20px"></div></div>`, [0, 44, 16, 16], "themes-tab", [192, 297, 16, 16]), js: true },
  { ...DB("db-js-scroll-thumb", `<div class="clio-scroll" id="s" style="width:394px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff;--clio-db-phase:64px"><div style="width:40000px;height:20px"></div></div>`, [16, 45, 15, 14], "themes-tab", [208, 298, 15, 14]), js: true },
  // Energy Saver's start-up notice: an alert framed 164..632 x 201..412, "Close Message" the default button (441..579 x 375..394).
  { ...DB("db-default-button", `<div style="padding:12px;background:#e7ded6"><button class="default" id="s" style="width:140px">Close Message</button></div>`, [-3, -3, 16, 24], "energy-saver-alert", [438, 372, 16, 24]), mask: [[0, 0, 16, 1], [0, 0, 1, 24]] },   // masked: the alert's paper beyond the band
  // Alert at Energy Saver's notice place on screen: Mac OS draws its paper half a tile along (--clio-db-phase).
  { ...DB("db-alert-corner", `<div style="padding:12px;background:#ffffff"><div class="alert-box" id="s" style="width:469px;height:212px;--clio-db-phase:64px"></div></div>`, [-1, 0, 20, 12], "energy-saver-alert", [163, 201, 20, 12]), mask: [[9, 9, 11, 3]] },   // masked: the message's first line
  DB("db-alert-shadow", `<div style="padding:12px;background:#ffffff"><div class="alert-box" id="s" style="width:469px;height:212px;--clio-db-phase:64px"></div></div>`, [455, 200, 14, 12], "energy-saver-alert", [619, 401, 14, 12]),
  DB("db-popup-disabled", `<div style="padding:12px;background:#e7ded6"><select id="s" style="width:180px" disabled><option>Variation</option></select></div>`, [140, 0, 40, 20], "appearance", [428, 225, 40, 20]),
  DB("db-button-held", `<div style="padding:12px;background:#e7ded6"><button class="active" id="s" style="width:103px">Save Theme…</button></div>`, [88, 0, 16, 21], "button-held", [606, 370, 16, 21]),
  DB("db-listbox-corner", `<div style="padding:12px;display:flex;align-items:flex-start;background:url(${ART}/tab-paper.png) -226px 12px"><div class="listbox" role="listbox" id="s" style="width:198px;height:134px"></div></div>`, [0, 126, 8, 8], "desktop-tab", [405, 280, 8, 8]),   // lower-left: the top row is the chosen one
  // General Controls and Date & Time.
  DB("db-checkbox-on", `<div style="padding:12px;background:#eeeeee"><input type="checkbox" id="s" checked></div>`, [0, 0, 14, 11], "general-controls", [33, 83, 14, 11]),
  DB("db-checkbox-off", `<div style="padding:12px;background:#eeeeee"><input type="checkbox" id="s"></div>`, [0, 0, 14, 11], "general-controls", [33, 131, 14, 11]),
  DB("db-checkbox-disabled", `<div style="padding:12px;display:flex;align-items:flex-start;background:url(${ART}/paper.png) -12px 0"><input type="checkbox" id="s" style="margin:0" disabled></div>`, [0, 0, 14, 11], "date-time", [240, 230, 14, 11]),   // on the window paper as Date & Time has it there
  DB("db-field-end", `<div style="padding:12px;background:url(${ART}/paper.png) -23px -19px"><input type="text" id="s" style="width:106px;height:25px;--clio-db-phase:64px" value=""></div>`, [94, 0, 12, 25], "date-time", [345, 121, 12, 25]),
  DB("db-radio-on", `<div style="padding:12px;background:#eeeeee"><input type="radio" id="s" checked></div>`, [0, 0, 16, 12], "general-controls", [266, 267, 16, 12]),
  DB("db-radio-off", `<div style="padding:12px;background:#eeeeee"><input type="radio" id="s"></div>`, [0, 0, 16, 12], "general-controls", [266, 250, 16, 12]),
  // On the window paper as Date & Time has it there; Mac OS draws this field's rows half a tile along.
  { ...DB("db-field-corner", `<div style="padding:12px;background:url(${ART}/paper.png) -23px -19px"><input type="text" id="s" style="width:106px;height:25px;--clio-db-phase:64px" value=""></div>`, [0, 0, 12, 25], "date-time", [251, 121, 12, 25]), mask: [[5, 6, 7, 13]] },   // masked: the date's "11"
  // Control Panels submenu (194..350), Energy Saver chosen: row 175..192, underline 210..333 x 189..191.
  // Menus at the item's place in the real menu: the paper and pens run from the menu's corner.
  { ...DB("db-menu-underline", `<div style="padding:12px;background:#fff"><ul class="menu" role="menu" style="width:157px"><li role="none" style="height:145px;min-height:0;padding:0"></li><li role="none" class="active" id="s"><span role="menuitem">Energy Saver</span></li></ul></div>`, [15, 14, 124, 3], "control-panels-menu", [209, 189, 124, 3]), mask: [[30, 0, 17, 3]] },   // masked: the pointer, and the icon's place (clio's item has no icon)
  DB("db-menu-separator", `<div style="padding:12px;background:#fff"><ul class="menu" role="menu" style="width:150px;--clio-menu-border-top-width:0px;--clio-db-phase:64px"><li role="none" style="height:89px;min-height:0;padding:0"></li><li role="separator" id="s"></li></ul></div>`, [-1, 0, 100, 9], "file-menu", [35, 111, 100, 9]),
  { ...DB("db-menu-corner", `<div style="padding:12px;background:#ccccff"><ul class="menu" role="menu" id="s" style="width:150px;height:289px;--clio-menu-border-top-width:0px;--clio-db-phase:64px"></ul></div>`, [130, 270, 24, 23], "file-menu", [165, 292, 24, 23]), mask: [[22, 0, 2, 14]] },   // the File menu's lower right, shade included; masked: the Finder window behind
  { ...DB("db-menu-corner-left", `<div style="padding:12px;background:#ccccff"><ul class="menu" role="menu" id="s" style="width:150px;height:289px;--clio-menu-border-top-width:0px;--clio-db-phase:64px"></ul></div>`, [-2, 270, 24, 23], "file-menu", [33, 292, 24, 23]), mask: [[0, 0, 2, 14], [22, 3, 2, 9]] },   // masked: the window behind, "Print Desktop…"
  { ...DB("db-menu-corner-top", `<div style="padding:12px;background:#9999cc"><ul class="menu" role="menu" id="s" style="width:150px;height:289px;--clio-menu-border-top-width:0px;--clio-db-phase:64px"></ul></div>`, [130, 0, 24, 12], "file-menu", [165, 22, 24, 12]), mask: [[0, 3, 6, 9], [22, 3, 2, 9]] },   // masked: the ⌘N shortcut, the window behind
);

// System 7.5.3's Control Strip (same frame as the scroll bar specimens).
specimens.push(
  S7("s7-strip-start", `<div class="control-strip" id="s"><button class="control-strip-scroll control-strip-scroll-back" disabled aria-label="Scroll back"></button><div class="control-strip-modules" role="toolbar" aria-label="Control Strip"><div class="control-strip-module-track"><button class="control-strip-module" aria-haspopup="menu" aria-label="Module"></button></div></div><button class="control-strip-scroll control-strip-scroll-forward" disabled aria-label="Scroll forward"></button><button class="control-strip-handle" aria-label="Collapse"></button></div>`, [0, 0, 29, 24], "folder-window", [0, 576, 29, 24]),
);

// Platinum, re-measured: crops of Mac OS 9.0 from `npm run capture:platinum`.
const p9dir = join(root, ".fidelity/platinum9");
const P9 = (id, html, crop, file, ref) => ({ id, era: "platinum", group: "platinum9", html, crop, refFile: join(p9dir, file + ".png"), refCrop: ref });
const strip = (cls = "", id = "") => `<div class="control-strip${cls}" ${id === "strip" ? 'id="s"' : ""}><button class="control-strip-scroll control-strip-scroll-back" disabled aria-label="Scroll back"></button><div class="control-strip-modules" role="toolbar" aria-label="Control Strip"><div class="control-strip-module-track">${'<button class="control-strip-module" aria-haspopup="menu" aria-label="Module"></button>'.repeat(4)}</div></div><button class="control-strip-scroll control-strip-scroll-forward" disabled aria-label="Scroll forward"></button><button class="control-strip-handle" ${id === "handle" ? 'id="s"' : ""} aria-label="Collapse"></button></div>`;
specimens.push(
  P9("p9-checkbox-on", `<div style="padding:12px;background:#eeeeee"><input type="checkbox" id="s" checked></div>`, [0, 0, 14, 12], "general-controls", [33, 81, 14, 12]),
  P9("p9-checkbox-off", `<div style="padding:12px;background:#eeeeee"><input type="checkbox" id="s"></div>`, [0, 0, 12, 12], "general-controls", [33, 129, 12, 12]),
  P9("p9-radio-on", `<div style="padding:12px;background:#eeeeee"><input type="radio" id="s" checked></div>`, [0, 0, 12, 12], "general-controls", [268, 265, 12, 12]),
  P9("p9-radio-off", `<div style="padding:12px;background:#eeeeee"><input type="radio" id="s"></div>`, [0, 0, 12, 12], "general-controls", [268, 282, 12, 12]),
  // Appearance control panel (window outline 161..636 x 68..): title bar ends, "Set Desktop", the disabled pop-up.
  // The whole bar with its title: Charcoal's antialiasing comes from window titles (capture:charcoal-ui).
  { ...P9("p9-titlebar", `<div class="window" id="s" style="width:476px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Appearance</h2><button class="shade" aria-label="Collapse"></button></div><div class="window-pane" style="height:40px"></div></div>`, [0, 0, 477, 22], "appearance", [161, 68, 477, 22]), mask: [[476, 0, 1, 2]] },   // desktop beside the shadow
  P9("p9-titlebar-left", `<div class="window" id="s" style="width:476px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Appearance</h2><button class="shade" aria-label="Collapse"></button></div><div class="window-pane" style="height:40px"></div></div>`, [0, 0, 30, 22], "appearance", [161, 68, 30, 22]),
  // The collapse box clicked (Games, Mac OS 9.0; frame collapsed): the title bar alone, closed by the
  // frame. The title (a folder icon and "Games") and the desktop by the shadow's notches are masked.
  { ...P9("p9-collapsed", `<div class="window collapsed" id="s" style="width:386px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Games</h2><button class="resize" aria-label="Zoom"></button><button class="shade" aria-label="Collapse"></button></div><div class="window-pane" style="height:40px"></div></div>`, [0, 0, 387, 23], "collapsed", [40, 68, 387, 23]), mask: [[150, 2, 90, 18], [386, 0, 1, 2], [0, 22, 2, 1]] },
  P9("p9-titlebar-right", `<div class="window" id="s" style="width:476px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title">Appearance</h2><button class="shade" aria-label="Collapse"></button></div><div class="window-pane" style="height:40px"></div></div>`, [438, 0, 36, 22], "appearance", [599, 68, 36, 22]),
  P9("p9-button-end", `<div style="padding:12px;background:#eeeeee"><button id="s" style="width:86px">Set Desktop</button></div>`, [0, 0, 86, 20], "appearance", [534, 369, 86, 20]),
  P9("p9-popup-disabled", `<div style="padding:12px;background:#eeeeee"><select id="s" style="width:194px" disabled><option>Position Automatically</option></select></div>`, [160, 0, 34, 20], "appearance", [567, 337, 34, 20]),
  P9("p9-group-corner", `<div style="padding:12px;background:#eeeeee;--clio-pane-bg:#eeeeee"><fieldset id="s" style="width:200px;height:60px"><legend>Desktop</legend></fieldset></div>`, [0, 0, 12, 30], "general-controls", [18, 51, 12, 30]),
  P9("p9-menu-separator", `<div style="padding:12px;background:#fff"><ul class="menu" role="menu" style="width:176px"><li><span>Close Window</span></li><li role="separator" id="s"></li><li><span>Get Info</span></li></ul></div>`, [0, 0, 100, 6], "file-menu", [38, 100, 100, 6]),
  P9("p9-popup-end", `<div style="padding:12px;background:#eeeeee"><select id="s" style="width:180px"><option>Apple platinum</option></select></div>`, [156, 0, 24, 20], "appearance-tab", [444, 143, 24, 20]),
  { ...P9("p9-button-held", `<div style="padding:12px;background:#eeeeee"><button class="active" id="s" style="width:86px">Set Desktop</button></div>`, [0, 0, 86, 20], "button-held", [534, 369, 86, 20]), mask: [[25, 1, 13, 19]] },   // the pointer, held on the label
  // Finder list view (Mac OS 9.0, frames hig/platinum9/list, list-open): headers, a disclosure triangle.
  { ...P9("p9-list-header", `<table class="list-view" id="s" style="width:374px;table-layout:fixed"><colgroup><col style="width:214px"><col style="width:145px"><col style="width:15px"></colgroup><thead><tr><th aria-sort="ascending"></th><th></th><th class="sort-direction"></th></tr></thead></table>`, [0, 0, 374, 21], "../hig/platinum9/list", [30, 95, 374, 21]), mask: [[40, 3, 40, 13], [216, 3, 90, 13]] },   // the header labels left out: the Finder's Geneva 10 is not among clio.css's fonts
  // Mouse control panel, "Mouse Tracking" slider (frame hig/platinum9/mouse).
  P9("p9-slider", `<div style="padding:12px;background:#dddddd;display:flex"><input type="range" id="s" min="0" max="141" value="78" style="width:156px"></div>`, [0, 0, 156, 16], "../hig/platinum9/mouse", [53, 127, 156, 16]),
  // The same slider dragged to each end (frames slider-min, slider-max): the thumb stops 3px inside the track.
  P9("p9-slider-min", `<div style="padding:12px;background:#dddddd;display:flex"><input type="range" id="s" min="0" max="141" value="0" style="width:156px"></div>`, [0, 0, 156, 16], "slider-min", [53, 127, 156, 16]),
  P9("p9-slider-max", `<div style="padding:12px;background:#dddddd;display:flex"><input type="range" id="s" min="0" max="141" value="141" style="width:156px"></div>`, [0, 0, 156, 16], "slider-max", [53, 127, 156, 16]),
  // Navigation Services, the Shortcuts bevel button (frame hig/platinum9/nav); its icon masked.
  { ...P9("p9-bevel-menu", `<div style="padding:12px;background:#dddddd"><button class="bevel menu" id="s" style="width:36px;height:27px" aria-label="Shortcuts"></button></div>`, [0, 0, 36, 27], "../hig/platinum9/nav", [490, 198, 36, 27]), mask: [[9, 5, 23, 16]] },   // the icon
  // Date & Time while its date is edited (frame hig/platinum9/date-time-edit): the focus ring, the little arrows.
  { ...P9("p9-focus-field", `<div style="padding:12px;background:#dddddd"><input type="text" id="s" style="width:104px;height:23px" value=""></div><script>document.getElementById("s").focus()</script>`, [-2, -2, 40, 27], "../hig/platinum9/date-time-edit", [251, 114, 40, 27]), mask: [[5, 4, 35, 19]] },   // the date's digits
  { ...P9("p9-little-arrows", `<div style="padding:12px;background:#dddddd"><span class="little-arrows" id="s" role="group" aria-label="Date"><button class="up" aria-label="Later"></button><button class="down" aria-label="Earlier"></button></span></div>`, [0, 0, 13, 23], "../hig/platinum9/date-time-edit", [359, 116, 13, 23]), mask: [[0, 0, 13, 1], [0, 0, 1, 23], [12, 0, 1, 23], [0, 22, 13, 1]] },   // the focus ring round the pair (drawn by its field)
  P9("p9-little-arrows-dimmed", `<div style="padding:12px;background:#dddddd"><span class="little-arrows" id="s" role="group" aria-label="Date" aria-disabled="true"><button class="up" aria-label="Later"></button><button class="down" aria-label="Earlier"></button></span></div>`, [0, 0, 13, 23], "date-time", [359, 116, 13, 23]),
  // Network Browser looking for servers (frame hig/platinum9/netb-0): the first frame, stopped.
  P9("p9-chasing-arrows", `<div style="padding:12px;background:#dddddd"><span class="chasing-arrows" id="s" role="status" aria-label="Looking" style="--clio-chasing-arrows-frames:3"></span><style>.chasing-arrows::before{animation:none!important}</style></div>`, [0, 0, 16, 16], "../hig/platinum9/netb-0", [20, 56, 16, 16]),
  P9("p9-separator", `<div style="padding:12px;background:#dddddd"><hr class="separator" id="s" style="width:185px;margin:0"></div>`, [0, 0, 185, 2], "../hig/platinum9/mouse", [36, 172, 185, 2]),
  P9("p9-help-button", `<div style="padding:12px;background:#dddddd"><button class="help-button" id="s" aria-label="Help"></button></div>`, [0, 0, 21, 20], "../hig/platinum9/keyboard", [110, 331, 21, 20]),
  // Application Switcher (frame hig/platinum9/switcher): a utility window's title bar ends.
  P9("p9-utility-left", `<div style="padding:12px;background:#eeeeee"><div class="window utility" id="s" style="width:158px;height:110px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title"></h2><button class="zoom" aria-label="Zoom"></button><button class="collapse" aria-label="Collapse"></button></div><div class="window-pane" style="flex:1;background:#888"></div></div></div>`, [0, 0, 40, 15], "../hig/platinum9/switcher", [612, 240, 40, 15]),
  P9("p9-utility-right", `<div style="padding:12px;background:#9999cc"><div class="window utility" id="s" style="width:158px;height:110px"><div class="title-bar"><button class="close" aria-label="Close"></button><h2 class="title"></h2><button class="zoom" aria-label="Zoom"></button><button class="collapse" aria-label="Collapse"></button></div><div class="window-pane" style="flex:1;background:#888"></div></div></div>`, [124, 0, 35, 15], "../hig/platinum9/switcher", [736, 240, 35, 15]),
  // Navigation Services "Open" (frame hig/platinum9/nav): a movable modal window is a window with no close box.
  P9("p9-movable-modal-left", `<div style="padding:12px;background:#eeeeee"><div class="window movable-modal" id="s" style="width:429px;height:285px"><div class="title-bar"><h2 class="title"></h2></div><div class="window-pane" style="flex:1"></div></div></div>`, [0, 0, 40, 22], "../hig/platinum9/nav", [185, 166, 40, 22]),
  // Balloon Help over Infinite HD (frame hig/platinum9/balloon): the balloon's top and bottom corners.
  { ...P9("p9-balloon-top", `<div style="padding:30px 12px 12px;background:#eeeeee"><div class="balloon" id="s" style="width:160px;height:121px"></div></div>`, [0, 0, 140, 12], "../hig/platinum9/balloon", [594, 149, 140, 12]), mask: [[0, 0, 5, 5]] },   // the window behind, touching the corner
  { ...P9("p9-balloon-bottom", `<div style="padding:30px 12px 12px;background:#eeeeee"><div class="balloon" id="s" style="width:160px;height:121px"></div></div>`, [0, 109, 160, 12], "../hig/platinum9/balloon", [594, 258, 160, 12]), mask: [[0, 8, 5, 4], [0, 0, 160, 3], [155, 7, 5, 5]] },   // what lies behind the corners
  P9("p9-disclosure", `<div style="padding:12px;background:#dddddd"><button class="disclosure" id="s" aria-label="Show"></button></div>`, [0, 0, 13, 13], "../hig/platinum9/list", [34, 120, 13, 13]),
  P9("p9-disclosure-open", `<div style="padding:12px;background:#dddddd"><button class="disclosure" id="s" aria-expanded="true" aria-label="Hide"></button></div>`, [0, 0, 13, 13], "../hig/platinum9/list-open", [34, 120, 13, 13]),
  // Control Strip, Finder desktop: end cap and the idle back-scroll cell (0..28), a module's frame, the tab.
  P9("p9-strip-start", strip("", "strip"), [0, 0, 29, 24], "strip-expanded", [0, 576, 29, 24]),
  P9("p9-strip-handle", `<div style="padding:12px;background:#9999cc">${strip("", "handle")}</div>`, [0, 0, 18, 24], "strip-expanded", [164, 576, 18, 24]),
  P9("p9-strip-collapsed", `<div style="padding:12px;background:#9999cc">${strip(" is-collapsed", "strip")}</div>`, [0, 0, 18, 24], "strip-collapsed", [0, 576, 18, 24]),
);

// clio.js scroll bars (fixed-size scroll box, Smart Scrolling): Finder windows in
// System 7.5.3 and Mac OS 9.0, frames hig/*/finder-scroll*.
const jsScroll = (h, extra = "") => `<div class="clio-scroll" id="s" ${extra} style="width:200px;height:${h}px;overflow-x:hidden;overflow-y:scroll;background:#fff"><div style="height:4000px"></div></div>`;
specimens.push(
  { ...S7("s7-js-scroll-top", jsScroll(124), [185, 0, 15, 41], "../hig/system7/finder-scroll", [405, 110, 15, 41]), js: true },
  { ...P9("p9-js-scroll-fixed", jsScroll(122), [185, 0, 15, 122], "../hig/platinum9/finder-scroll-fixed", [405, 111, 15, 122]), js: true },
  { ...P9("p9-js-scroll-off-h", `<div class="clio-scroll" id="s" style="width:359px;height:60px;overflow-x:scroll;overflow-y:hidden;background:#fff"><div style="height:20px"></div></div>`, [0, 45, 359, 15], "../hig/platinum9/finder-scroll-fixed", [46, 233, 359, 15]), js: true },
  { ...P9("p9-js-scroll-smart", jsScroll(122, 'data-clio-scrolling="smart"'), [185, 0, 15, 122], "../hig/platinum9/finder-scroll-smart", [405, 111, 15, 122]), js: true },
  // An open pop-up menu (Appearance > Fonts, Large System Font held, the pointer moved off the menu; frame
  // popup-open): clio.js draws it (base-select hidden from it), and where the browser draws it, base-select.
  { ...P9("p9-js-popup-open", `<script>{ const f = CSS.supports.bind(CSS); CSS.supports = (a, b) => (a === "appearance" && b === "base-select") ? false : f(a, b); }</script><div class="clio" style="padding:12px 0 140px 12px;background:#dddddd;width:400px"><select id="s" style="width:163px"><option selected>Charcoal</option><option>Chicago</option><option>Capitals</option><option>Gadget</option><option>Sand</option><option>Techno</option><option>Textile</option></select></div>`, [0, 0, 142, 115], "fonts-popup-open", [333, 143, 142, 115]), js: true, mask: [[141, 0, 1, 2], [0, 114, 2, 1]],
    act: async (page, b) => { await page.mouse.move(b.x + 80, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + 380, b.y + 10, { steps: 3 }); } },
  { ...P9("p9-popup-open", `<div class="clio" style="padding:12px 0 140px 12px;background:#dddddd;width:400px"><select id="s" style="width:163px"><option selected>Charcoal</option><option>Chicago</option><option>Capitals</option><option>Gadget</option><option>Sand</option><option>Techno</option><option>Textile</option></select></div>`, [0, 0, 142, 115], "fonts-popup-open", [333, 143, 142, 115]), js: true, baseSelect: true, mask: [[141, 0, 1, 2], [0, 114, 2, 1]],
    act: async (page, b) => { await page.mouse.move(b.x + 80, b.y + 10); await page.mouse.down(); await page.mouse.move(b.x + 380, b.y + 10, { steps: 3 }); } },
  // The down arrow held (Mac OS 9.0 Finder, Smart Scrolling as Infinite Mac sets it; frame arrow-held,
  // the pointer in its corner masked).
  { ...P9("p9-js-scroll-arrow-held", jsScroll(122, 'data-clio-scrolling="smart"'), [186, 108, 14, 14], "arrow-held", [390, 305, 14, 14]), js: true, mask: [[10, 11, 4, 3]],
    act: async (page, b) => { await page.mouse.move(b.x + 190, b.y + 112); await page.mouse.down(); } },
);

const css = pathToFileURL(join(root, "dist/clio.css")).href;
const js = pathToFileURL(join(root, "dist/clio.js")).href;
const out = join(root, ".fidelity"), out0 = out;
mkdirSync(out, { recursive: true });
// CLIO_ENGINE=webkit|firefox renders in that engine (default chromium). Other engines
// write results-<engine>[-<n>x].json and leave FIDELITY.md, which is the Chromium table.
const ENGINE = process.env.CLIO_ENGINE || "chromium";
if (!["chromium", "webkit", "firefox"].includes(ENGINE)) { console.error(`CLIO_ENGINE must be chromium, webkit or firefox, not ${ENGINE}`); process.exit(2); }
const browser = await playwright[ENGINE].launch(ENGINE === "chromium" ? { ignoreDefaultArgs: ["--hide-scrollbars"] } : {});
const tag = (ENGINE === "chromium" ? "" : "-" + ENGINE);
// FIDELITY_DPR=2 (or 3) renders at that device pixel ratio and compares against the
// reference scaled up by nearest neighbour: every Mac pixel must become a solid 2x2
// (3x3) block. Results go to results-<n>x.json; FIDELITY.md stays the 1x table.
const DPR = Number(process.env.FIDELITY_DPR || 1);
const page = await browser.newPage({ viewport: { width: 800, height: 400 }, deviceScaleFactor: DPR });
const results = [];
const ONLY = process.env.FIDELITY_ONLY ? new RegExp(process.env.FIDELITY_ONLY) : null;   // a quick look; writes no report
for (const s of specimens) {
  if (ONLY && !ONLY.test(s.id)) continue;
  await page.mouse.up().catch(() => {});
  if (s.refFile && !existsSync(s.refFile)) { console.log(`${s.id}: no reference (run npm run capture:system6)`); continue; }
  // Firefox has no ::-webkit-scrollbar: there the era's scroll bars are the ones clio.js
  // draws, so scroll-bar specimens load it (and say so in the table).
  // clio.js keeps the theme's 15px Drawing Board box, so the crops set for the browser's
  // 26px box do not apply; db-js-scroll-thumb compares that 15px box whole.
  if (ENGINE === "firefox" && /^db-scroll-thumb-(grip|end)$/.test(s.id)) { console.log(`${s.id}: n/a in firefox (see db-js-scroll-thumb)`); continue; }
  if (ENGINE === "firefox" && !s.js && /scroll|grow-box/.test(s.id)) s.js = s.viaJs = true;
  if (s.baseSelect && !(await page.evaluate(() => CSS.supports("appearance", "base-select")))) { console.log(`${s.id}: n/a in ${ENGINE} (no base-select)`); continue; }
  const html = `<!doctype html><html data-era="${s.era || "platinum"}"><head><meta charset="utf-8"><link rel="stylesheet" href="${css}"><style>body{margin:0;padding:24px;background:#4a71ab}${process.env.FIDELITY_CSS || ""}</style></head><body>${s.html}${s.js ? `<script src="${js}"></script>` : ""}</body></html>`;
  const file = join(out, `${s.id}${tag}.html`);
  writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href);
  // Lay out first so the faces the specimen uses start loading, then wait for them and
  // for two frames: fonts.ready alone could resolve before the first face was asked for.
  await page.evaluate(async () => { void document.body.offsetHeight; await document.fonts.ready; await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); });
  if (s.js) await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
  const box = await page.locator("#s").boundingBox();
  // act(page, box): a held state the frame shows (the button stays down for the shot).
  if (s.act) { await s.act(page, box); await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); }
  const [x, y, w, h] = s.crop;
  // Engines snap a box at a fractional position to the pixel grid in their own way, and
  // a fractional clip is rounded differently again: crop at the pixel the box snapped to.
  const shot = await page.screenshot({ clip: { x: Math.round(box.x) + x, y: Math.round(box.y) + y, width: w, height: h } });
  const ref = readFileSync(s.refFile || join(tiles, `${s.id}-reference.png`));
  const metrics = await page.evaluate(async ([a, b, name, refCrop, mono, mask, dpr]) => {
    const load = (b64) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = "data:image/png;base64," + b64; });
    let [ia, ib] = await Promise.all([load(a), load(b)]);
    if (refCrop) {
      const c = document.createElement("canvas"); c.width = refCrop[2]; c.height = refCrop[3];
      c.getContext("2d").drawImage(ib, refCrop[0], refCrop[1], refCrop[2], refCrop[3], 0, 0, refCrop[2], refCrop[3]);
      ib = await load(c.toDataURL("image/png").split(",")[1]);
    }
    if (dpr !== 1) {
      const c = document.createElement("canvas"); c.width = ib.width * dpr; c.height = ib.height * dpr;
      const g = c.getContext("2d"); g.imageSmoothingEnabled = false; g.drawImage(ib, 0, 0, c.width, c.height);
      ib = await load(c.toDataURL("image/png").split(",")[1]);
    }
    const w = Math.min(ia.width, ib.width), h = Math.min(ia.height, ib.height);
    const px = (img) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.drawImage(img, 0, 0); return g.getImageData(0, 0, w, h).data; };
    const A = px(ia), B = px(ib);
    if (mono) for (const P of [A, B]) for (let i = 0; i < P.length; i += 4) { const v = (P[i] + P[i + 1] + P[i + 2]) / 3 < 128 ? 0 : 255; P[i] = P[i + 1] = P[i + 2] = v; }
    // Masked pixels (the mouse pointer in a held-state frame, say) are not part of the
    // interface: they are left out of every count.
    const masked = (i) => { const p = i / 4, x = p % w, y = Math.floor(p / w); return mask.some(([mx, my, mw, mh]) => x >= mx && x < mx + mw && y >= my && y < my + mh); };
    let exact = 0, same = 0, off = 0, sum = 0, n = 0;
    const misses = [];
    const diff = document.createElement("canvas"); diff.width = w * 3; diff.height = h; const g = diff.getContext("2d");
    const put = (P, x) => { const d = g.createImageData(w, h); d.data.set(P); g.putImageData(d, x, 0); };
    put(B, 0); put(A, w);
    const d = g.createImageData(w, h);
    for (let i = 0; i < A.length; i += 4) {
      if (masked(i)) { d.data[i] = 128; d.data[i + 1] = 128; d.data[i + 2] = 255; d.data[i + 3] = 255; continue; }
      n++;
      const m = Math.max(Math.abs(A[i] - B[i]), Math.abs(A[i + 1] - B[i + 1]), Math.abs(A[i + 2] - B[i + 2]));
      if (m > 8 && misses.length < 400) misses.push([(i / 4) % w, Math.floor(i / 4 / w), B[i], B[i + 1], B[i + 2], A[i], A[i + 1], A[i + 2]]);
      sum += (Math.abs(A[i] - B[i]) + Math.abs(A[i + 1] - B[i + 1]) + Math.abs(A[i + 2] - B[i + 2])) / 3;
      if (m <= 8) exact++;
      if (m === 0) same++;
      if (m > 48) off++;
      d.data[i] = m > 48 ? 255 : m > 8 ? 255 : 255; d.data[i + 1] = m > 48 ? 0 : m > 8 ? 200 : 255; d.data[i + 2] = m > 48 ? 0 : m > 8 ? 0 : 255; d.data[i + 3] = 255;
    }
    g.putImageData(d, w * 2, 0);
    return { name, size: [w, h], same: +(same / n).toFixed(4), exact: +(exact / n).toFixed(4), structural: +(off / n).toFixed(4), meanAbs: +(sum / n).toFixed(2), misses, image: diff.toDataURL("image/png").split(",")[1] };
  }, [shot.toString("base64"), ref.toString("base64"), s.id, s.refCrop || null, !!s.mono, (s.mask || []).map((m) => m.map((v) => v * DPR)), DPR]);
  writeFileSync(join(out, `${s.id}${tag}${DPR === 1 ? "" : "@" + DPR + "x"}-compare.png`), Buffer.from(metrics.image, "base64"));
  delete metrics.image;
  writeFileSync(join(out, `${s.id}${tag}${DPR === 1 ? "" : "@" + DPR + "x"}-misses.json`), JSON.stringify(metrics.misses));   // [x, y, ref rgb, clio rgb]
  delete metrics.misses;
  results.push({ ...metrics, era: s.group || s.era || "platinum", ...(s.viaJs ? { viaJs: true } : {}) });
}
await browser.close();
console.log("specimen              size      same    exact   off>48  meanAbs   (reference | clio.css | diff in .fidelity/)");
for (const r of results) console.log(`${r.name.padEnd(21)} ${r.size.join("x").padEnd(9)} ${String(r.same).padEnd(7)} ${String(r.exact).padEnd(7)} ${String(r.structural).padEnd(7)} ${r.meanAbs}${r.viaJs ? "  (clio.js bars)" : ""}`);
if (ONLY) process.exit(0);
writeFileSync(join(out, DPR === 1 ? `results${tag}.json` : `results${tag}-${DPR}x.json`), JSON.stringify(results, null, 2));
if (DPR !== 1 || ENGINE !== "chromium") { console.log(`${results.filter((r) => r.same === 1).length} of ${results.length} identical at ${DPR}x in ${ENGINE}`); process.exit(0); }
const date = new Date().toISOString().slice(0, 10);
// The other engines' last runs, if any, summarised for FIDELITY.md.
function others() {
  const out = [];
  for (const e of ["webkit", "firefox"]) {
    const f = join(out0, `results-${e}.json`);
    if (!existsSync(f)) { out.push(`- ${e}: not run`); continue; }
    const r = JSON.parse(readFileSync(f, "utf8"));
    const off = r.filter((x) => x.same !== 1);
    out.push(`- ${e === "webkit" ? "WebKit" : "Firefox"}: ${r.length - off.length} of ${r.length} identical` + (off.length ? `; not identical: ${off.map((x) => `${x.name} (${(x.same * 100).toFixed(1)}%)`).join(", ")}` : ""));
  }
  return out.join("\n") + `

Every pixel that differs in those specimens is in a centred label or title whose spare width is odd,
so its text starts on a half pixel. The Mac rounds that down; Chromium snaps the same way, WebKit
draws the text on the half pixel (blended) and Firefox rounds it up. CSS cannot read a text's width
to round it, so this stays an engine difference.`;
}
const row = (r) => "| " + r.name + " | " + r.size.join("×") + " | " + (r.same * 100).toFixed(1) + "% | " + (r.exact * 100).toFixed(1) + "% | " + (r.structural * 100).toFixed(1) + "% | " + r.meanAbs + " |";
const table = (era) => "| Specimen | Size | same | exact | off | mean |\n| --- | --- | ---: | ---: | ---: | ---: |\n" + results.filter((r) => r.era === era).map(row).join("\n");
writeFileSync(join(root, "FIDELITY.md"), `# Pixel check

Generated by \`npm run fidelity\` on ${date}. clio.css specimens are rendered at 1x in Chromium
and compared pixel by pixel with real screens of each era. The real screens are Apple's pixels:
they are evidence only and are not part of this repository.

- **same**: share of pixels identical to the reference.
- **exact**: share of pixels within 8/255 of the reference on every channel.
- **off**: share of pixels more than 48/255 away (a different shape, not a shade).
- **mean**: mean absolute difference per channel, 0–255.

## System 6

Reference: System 6.0.8 running in Infinite Mac, the emulator's 512×342 canvas read 1:1
(\`npm run capture:system6\`). Both sides are thresholded to 1-bit before comparing, because
Infinite Mac tints black and white as #222222 and #eeeeee.

${table("system6")}

## System 7

Reference: System 7.5.3 running in Infinite Mac, the 800×600 colour canvas read 1:1
(\`npm run capture:system7\`), compared in colour.

${table("system7")}

## Mac OS 8.5 Drawing Board

Reference: Mac OS 8.5 with the 8.5b6 Drawing Board theme installed, running in Infinite Mac,
the 800×600 colour canvas read 1:1 (\`npm run capture:drawingboard\`), compared in colour.

${table("drawingboard")}

## Mac OS 9 Platinum, re-measured

Reference: Mac OS 9.0 running in Infinite Mac, the 800×600 colour canvas read 1:1
(\`npm run capture:platinum\`): General Controls and the Control Strip.

${table("platinum9")}

## Mac OS 9 Platinum

Reference: GUIdebook Mac OS 9.0 captures, cropped by AI System 6 (\`AIS6_DIR\`).

${table("platinum")}

## WebKit and Firefox

\`CLIO_ENGINE=webkit|firefox npm run fidelity\` renders the same specimens in Playwright's WebKit
and Firefox (results in \`.fidelity/results-<engine>.json\`). Firefox has no \`::-webkit-scrollbar\`:
its scroll-bar specimens load clio.js, whose element bars take the same rules.

${others()}

## What the remaining difference is

- System 6: text is drawn in Clio Sans '84, Chicago 12 rebuilt from the emulator, so labels
  match too. The pressed and hovered button frames still contain the mouse pointer.
- Drawing Board: control parts are the theme's own pixmaps and match exactly; frames,
  bars and fields are flat colours where the theme draws paper grain, sketch lines and a
  pencil line whose shade drifts, so those specimens sit at 60–90%. The scroll-start and
  menu-underline references also contain the mouse pointer.
- Platinum labels and titles: almost every off pixel is text. Charcoal is Apple's and is
  not shipped; clio.css draws Asap (OFL). On a Mac that has Charcoal, the stack uses it.
- Platinum: a few corner pixels of the default ring, the right edge of the inactive frame and
  the ragged end of the ridges; the check mark is classic-stylesheets' drawing (MIT); the box
  art is a smooth gradient where the original steps in 2px bands.
`);
