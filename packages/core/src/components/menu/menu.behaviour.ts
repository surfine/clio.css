import { play } from "../../runtime/sounds.ts";
import { OFF, TICK, optedOut, reduced, type Pt } from "../../runtime/shared.ts";

interface Track {
  bar: HTMLElement; li: HTMLElement; mode: "press" | "sticky" | "blink" | "preview";
  hot: HTMLElement | null; fresh?: boolean; last: Pt; timer?: number; hold?: number; left?: number | null; anchor?: Pt;
}

/* ---- Menus -------------------------------------------------------------- */
// Press a title and drag: the menu follows the pointer and the item under it
// is chosen when the button comes up, blinking first. Mac OS 8 and 9 also
// keep a clicked menu open (--clio-menu-sticky: 1). Measured in Mac OS 9.0:
// 3 blinks of 3 ticks off and 3 on; a submenu opens 9 ticks after its item
// lights. Leaving the item towards the submenu keeps it as the Menu Manager
// did (System 6, 7 and Mac OS 9 ROMs: MenuDelay 8 ticks, MenuDrag 60 ticks).
const BAR = ".menu-bar, [role=menubar], [role=menu-bar]";
const MENU = ".menu, [role=menu]";
const TITLE = ":scope > li > :is(button, a, span)";
export const BLINK = "data-clio-blink";
const SUBMENU_DELAY = 9 * TICK;
const DRAG_HOLD = 60 * TICK;   // MenuDrag: counted from leaving the item, never extended
export const sticky = (el: Element) => getComputedStyle(el).getPropertyValue("--clio-menu-sticky").trim() === "1";
const usable = (li: Element | null) => li && li.matches(`:is(${MENU}) > li`) && !li.matches(".disabled, [aria-disabled=true], .separator, [role=separator], .scroll-up, .scroll-down") && !li.querySelector(":scope > :is(a, button):is(:disabled, [aria-disabled=true])");
const submenuOf = (li: Element | null) => li && li.querySelector(`:scope > :is(${MENU})`);
const control = (li: HTMLElement) => li.querySelector<HTMLElement>(":scope > :is(a, button)") || li;

let track: Track | null = null;   // { bar, title, li, mode: "press" | "sticky", hot, timer, hold }

function titleOf(li: Element) { return li.querySelector<HTMLElement>(":scope > :is(button, a, span)"); }
function openTitle(bar: Element, li: Element) {
  for (const other of bar.querySelectorAll(":scope > li.open")) if (other !== li) closeTitle(other);
  if (!li.classList.contains("open") && menuOf(li)) play("mnuo", li);
  li.classList.add("open");
  const t = titleOf(li); if (t && t.hasAttribute("aria-expanded")) t.setAttribute("aria-expanded", "true");
  t?.removeAttribute(OFF);
}
function closeTitle(li: Element) {
  if (li.classList.contains("open") && menuOf(li) && !(track && track.mode === "blink")) play("mnuc", li);
  li.classList.remove("open");
  const t = titleOf(li); if (t && t.hasAttribute("aria-expanded")) t.setAttribute("aria-expanded", "false");
  // The title a drag started on stays :active until release; data-clio-off keeps clio.css's
  // pressed look (the no-script fallback) off it while another title is open.
  t?.setAttribute(OFF, "");
  for (const x of li.querySelectorAll("li.open, li.active")) x.classList.remove("open", "active");
}
function closeAll() {
  if (!track) return;
  clearTimeout(track.timer); clearTimeout(track.hold);
  for (const li of track.bar.querySelectorAll(":scope > li.open")) closeTitle(li);
  for (const li of track.bar.querySelectorAll(":scope > li")) titleOf(li)?.removeAttribute(OFF);
  if (document.activeElement && track.bar.contains(document.activeElement)) (document.activeElement as HTMLElement).blur();
  track = null;
}
// Light an item; open its submenu after the delay, close siblings' submenus.
function light(li: HTMLElement | null) {
  if (!track || track.hot === li) return;
  const menu = li ? li.parentElement : null;
  if (menu) for (const sib of menu.children) if (sib !== li) { sib.classList.remove("active"); if (sib.classList.contains("open")) closeSub(sib); }
  if (track.hot && track.hot !== li && (!li || !track.hot.contains(li))) track.hot.classList.remove("active");
  track.hot = li;
  clearTimeout(track.timer);
  if (!li || !usable(li)) return;
  li.classList.add("active");
  play("mnui", li);
  if (submenuOf(li)) track.timer = setTimeout(() => { li.classList.add("open"); }, SUBMENU_DELAY);
}
function closeSub(li: Element) { li.classList.remove("open", "active"); for (const x of li.querySelectorAll("li.open, li.active")) x.classList.remove("open", "active"); }
// Leaving an open parent item keeps its submenu while the pointer stays inside
// the wedge from the last point in the item (the anchor) to the submenu's two
// near corners, angles compared in whole degrees as AngleFromSlope gave them,
// and never moves back away from the submenu.
const degrees = (dx: number, dy: number) => Math.round(Math.atan2(Math.abs(dx), -dy) * 180 / Math.PI);
function inWedge(parent: Element, anchor: Pt, to: Pt) {
  const sub = submenuOf(parent); if (!sub || !parent.classList.contains("open")) return false;
  const r = sub.getBoundingClientRect();
  const right = r.left >= anchor.x, edge = right ? r.left : r.right;
  if (right ? to.x < anchor.x : to.x > anchor.x) return false;
  const a = degrees(to.x - anchor.x, to.y - anchor.y);
  return a >= degrees(edge - anchor.x, r.top - anchor.y) && a <= degrees(edge - anchor.x, r.bottom - anchor.y);
}
function itemAt(x: number, y: number) {
  const el = document.elementFromPoint(x, y);
  return el ? el.closest<HTMLElement>(`:is(${MENU}) > li`) : null;
}
function choose(li: HTMLElement, after?: () => void) {
  const done = () => {
    li.removeAttribute(BLINK); const c = control(li); c.removeAttribute(BLINK);
    closeAll();
    if (after) after();
    play("menu");      // the 0.11 name
    c.click();
  };
  track!.mode = "blink";
  play("mnus", li);   // as the item is chosen, before it blinks
  const c = control(li);
  if (reduced()) return done();
  let n = 0;
  const step = () => {   // off, on, off, on, off, on: 3 ticks each
    const off = n % 2 === 0;
    li.toggleAttribute(BLINK, off); c.toggleAttribute(BLINK, off);
    if (++n === 7) return done();
    setTimeout(step, 3 * TICK);
  };
  step();
}

// Keyboard, as an application menu bar (WAI-ARIA APG): the bar is one Tab
// stop (roving tabindex), focusing a title previews its menu, Left and Right
// move between titles, Down/Return/Space/Home/End enter a menu, Up/Down/
// Home/End move inside it, Right and Left open and close submenus or move
// to the next title, Esc closes one level, Tab leaves and closes all. (Mac OS
// 8 and 9 had no keyboard menus; this is the web's.) Command-key
// equivalents (<kbd>⌘N</kbd>) work on menu bars marked data-clio-shortcuts.
const items = (menu: Element) => [...menu.children].filter(usable) as HTMLElement[];
const focusItem = (li: HTMLElement) => { const c = control(li); if (c === li && !li.hasAttribute("tabindex")) li.tabIndex = -1; c.focus(); if (track) light(li); };
const titlesOf = (bar: Element) => [...bar.children].filter((li) => titleOf(li)) as HTMLElement[];
// NeXTSTEP draws the menu bar as a column (--clio-menubar-orientation: vertical): its titles
// go up and down, a submenu opens to the right. The bar says so to assistive technology.
const vertical = (bar: Element) => {
  const v = getComputedStyle(bar).getPropertyValue("--clio-menubar-orientation").trim() === "vertical";
  if (v ? bar.getAttribute("aria-orientation") !== "vertical" : bar.getAttribute("aria-orientation") === "vertical" && bar.hasAttribute("data-clio-orientation")) {
    if (v) { bar.setAttribute("aria-orientation", "vertical"); bar.setAttribute("data-clio-orientation", ""); } else { bar.removeAttribute("aria-orientation"); bar.removeAttribute("data-clio-orientation"); }
  }
  return v;
};
const menuOf = (tli: Element) => tli.querySelector(`:scope > :is(${MENU})`);
let quiet = false;   // focus coming back to a title from its own menu: no preview
function rove(bar: Element, tli: Element) { for (const li of titlesOf(bar)) { const t = titleOf(li)!; t.tabIndex = li === tli ? 0 : -1; } }
function toTitle(bar: Element, tli: Element, opts: { quiet?: boolean } = {}) {
  if (track) closeAll();
  rove(bar, tli);
  quiet = !!opts.quiet;
  const t = titleOf(tli); if (t) t.focus({ preventScroll: true });
  quiet = false;
}
function enter(bar: HTMLElement, tli: HTMLElement, last: boolean) {
  if (!track || track.li !== tli) { closeAll(); track = { bar, li: tli, mode: "sticky", hot: null, last: { x: 0, y: 0 } }; }
  openTitle(bar, tli);
  const m = menuOf(tli), list = m ? items(m) : [];
  if (list.length) focusItem(list[last ? list.length - 1 : 0]!);
}

function shortcut(e: KeyboardEvent) {
  if (e.altKey || e.key.length !== 1) return;
  const key = e.key.toLowerCase();
  for (const bar of document.querySelectorAll(`:is(${BAR})[data-clio-shortcuts]`)) {
    for (const kbd of bar.querySelectorAll(`:is(${MENU}) > li kbd`)) {
      const m = kbd.textContent!.trim().match(/^(⇧?)\s*⌘\s*(.)$/u);   // "⌘N", "⇧⌘S"
      const li = kbd.closest<HTMLElement>(`:is(${MENU}) > li`)!;
      if (!m || m[2]!.toLowerCase() !== key || !!m[1] !== e.shiftKey || !usable(li)) continue;
      e.preventDefault();
      const tli = li.closest(`:is(${BAR}) > li`)!, t = titleOf(tli);
      if (t) t.classList.add("active");
      setTimeout(() => { if (t) t.classList.remove("active"); }, 8 * TICK);
      control(li).click();
      return;
    }
  }
}

const claimBar = (b: Element) => {
  if (optedOut(b) || b.hasAttribute("data-clio-menus")) return;
  b.setAttribute("data-clio-menus", "");
  vertical(b);
  const ts = titlesOf(b), cur = ts.find((li) => titleOf(li)!.tabIndex === 0 && titleOf(li)!.hasAttribute("tabindex")) || ts[0];
  if (cur) rove(b, cur);   // one Tab stop for the whole bar
  for (const c of b.querySelectorAll<HTMLElement>(`:is(${MENU}) > li > :is(a, button)`)) if (!c.hasAttribute("tabindex")) c.tabIndex = -1;   // items are reached with the arrows
};
export const claimBars = (root: Document | Element) => { for (const b of (root.querySelectorAll ? root.querySelectorAll(BAR) : [])) claimBar(b); if (root instanceof Element && root.matches(BAR)) claimBar(root); };

export function install(): void {
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const target = e.target;
    if (track && track.mode === "sticky") {
      const li = target.closest(`:is(${MENU}) > li`);
      const tli = target.closest<HTMLElement>(`:is(${BAR}) > li`);
      if (li && track.bar.contains(li)) { track.mode = "press"; e.preventDefault(); return; }
      if (tli && tli.parentElement === track.bar && !li) { e.preventDefault(); if (tli.classList.contains("open")) { closeAll(); return; } openTitle(track.bar, tli); track.li = tli; track.mode = "press"; track.fresh = false; return; }
      closeAll(); e.preventDefault(); e.stopPropagation();
      document.addEventListener("click", (c) => { c.preventDefault(); c.stopPropagation(); }, { capture: true, once: true });
      return;
    }
    const tli = target.closest<HTMLElement>(`:is(${BAR}) > li`);
    if (!tli || optedOut(tli) || target.closest(MENU)) return;
    e.preventDefault();   // the title neither takes focus nor starts a selection
    const bar = tli.parentElement!;
    track = { bar, li: tli, mode: "press", hot: null, fresh: true, last: { x: e.clientX, y: e.clientY } };
    openTitle(bar, tli);
  }, true);

  document.addEventListener("pointermove", (e) => {
    if (!track || track.mode === "blink") return;
    const at = { x: e.clientX, y: e.clientY };
    const from = track.last; track.last = at;
    const el = document.elementFromPoint(at.x, at.y);
    if (!el) return;
    const tli = el.closest<HTMLElement>(`:is(${BAR}) > li`);
    if (tli && tli.parentElement === track.bar && !el.closest(MENU) && tli !== track.li && (track.mode === "press" || track.mode === "sticky")) {
      openTitle(track.bar, tli); track.li = tli; track.fresh = false; light(null); return;
    }
    const li = el.closest<HTMLElement>(`:is(${MENU}) > li`);
    if (li && !track.bar.contains(li)) return;
    // keep a parent's submenu while heading for it, for MenuDrag from leaving the item
    const parent = track.hot && submenuOf(track.hot) ? track.hot : null;
    if (parent && li !== parent && !(li && parent.contains(li)) && parent.classList.contains("open")) {
      const now = performance.now();
      if (track.left == null) {
        track.left = now;
        track.hold = setTimeout(() => { if (track) { track.left = null; light(itemAt(track.last.x, track.last.y)); } }, DRAG_HOLD);
      }
      if (now - track.left < DRAG_HOLD && inWedge(parent, track.anchor || from, at)) return;
    }
    clearTimeout(track.hold); track.left = null;
    if (li) track.anchor = at;   // the last point inside an item
    if (li) light(li);
    else if (track.hot && !submenuOf(track.hot)) light(null);
  }, true);

  document.addEventListener("pointerup", (e) => {
    if (!track || track.mode !== "press" || e.button !== 0) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el && el.closest<HTMLElement>(`:is(${MENU}) > li`);
    if (li && track.bar.contains(li) && usable(li) && !submenuOf(li)) {
      // the press and release were both on the item (a click-opened menu, or a tap): the
      // browser's own click follows and must not run the item a second time
      document.addEventListener("click", (c) => { if (c.isTrusted && c.target instanceof Node && li.contains(c.target)) { c.preventDefault(); c.stopPropagation(); } }, { capture: true, once: true });
      e.preventDefault(); choose(li); return;
    }
    const tli = el && el.closest(`:is(${BAR}) > li`);
    if (tli === track.li && track.fresh && !el!.closest(MENU) && sticky(track.bar)) { track.mode = "sticky"; return; }   // Mac OS 8: a click leaves the menu open
    closeAll();
  }, true);

  // A click that ends a menu gesture must not reach the page.
  document.addEventListener("click", (e) => {
    if (e.isTrusted && e.target instanceof Element && e.target.closest(`:is(${BAR}) > li > :is(button, a, span)`) && !optedOut(e.target)) e.preventDefault();
  }, true);

  document.addEventListener("focusin", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const tli = t && t.matches(`:is(${BAR}) > li > :is(button, a, span)`) ? t.parentElement : null;
    if (!tli || optedOut(tli) || quiet || (e.relatedTarget instanceof Node && tli.contains(e.relatedTarget))) return;
    if (track && track.mode !== "preview") return;   // a pointer gesture is under way
    const bar = tli.parentElement!;
    if (track) closeAll();
    rove(bar, tli);
    track = { bar, li: tli, mode: "preview", hot: null, last: { x: 0, y: 0 } };
    openTitle(bar, tli);
  });
  document.addEventListener("focusout", (e) => {
    if (!track || track.mode === "blink") return;
    const to = e.relatedTarget;
    if (to instanceof Node && track.bar.contains(to)) return;
    if (track.mode === "preview" || track.mode === "sticky") closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    const f = document.activeElement instanceof Element ? document.activeElement : null;
    if (e.metaKey || e.ctrlKey) return shortcut(e);
    if (!f) return;
    const tli = f.closest<HTMLElement>(`:is(${BAR}) > li`);
    if (!tli || optedOut(tli)) return;
    const bar = tli.parentElement!, titles = titlesOf(bar);
    const inMenu = f.closest<HTMLElement>(`:is(${MENU}) > li`);
    const go = (fn: () => void) => { e.preventDefault(); e.stopPropagation(); fn(); };
    const next = (d: number) => titles[(titles.indexOf(tli) + d + titles.length) % titles.length];
    const down = vertical(bar);
    if (!inMenu && down) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") return go(() => toTitle(bar, next(e.key === "ArrowDown" ? 1 : -1)!));
      if (e.key === "Home" || e.key === "End") return go(() => toTitle(bar, titles[e.key === "Home" ? 0 : titles.length - 1]!));
      if (["ArrowRight", "Enter", " "].includes(e.key) && menuOf(tli)) return go(() => enter(bar, tli, false));
      if (e.key === "Escape" && track) return go(() => toTitle(bar, tli, { quiet: true }));
      return;
    }
    if (!inMenu) {
      if (["ArrowDown", "Enter", " ", "Home"].includes(e.key)) return go(() => enter(bar, tli, false));
      if (e.key === "End" || e.key === "ArrowUp") return go(() => enter(bar, tli, true));
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") return go(() => toTitle(bar, next(e.key === "ArrowRight" ? 1 : -1)!));
      if (e.key === "Escape" && track) return go(() => toTitle(bar, tli, { quiet: true }));
      return;
    }
    if (!track) track = { bar, li: tli, mode: "sticky", hot: null, last: { x: 0, y: 0 } };
    track.mode = track.mode === "preview" ? "sticky" : track.mode;
    const menu = inMenu.parentElement!, list = items(menu), i = list.indexOf(inMenu);
    const parentItem = menu.parentElement!.closest<HTMLElement>(`:is(${MENU}) > li`);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") return go(() => focusItem(list[(i + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]!));
    if (e.key === "Home" || e.key === "End") return go(() => focusItem(list[e.key === "Home" ? 0 : list.length - 1]!));
    if (e.key === "ArrowRight" && submenuOf(inMenu)) return go(() => { inMenu.classList.add("open"); const s = items(submenuOf(inMenu)!); if (s[0]) focusItem(s[0]); });
    if (e.key === "ArrowRight") return down ? go(() => {}) : go(() => toTitle(bar, next(1)!));
    if ((e.key === "ArrowLeft" || e.key === "Escape") && parentItem) return go(() => { closeSub(parentItem); focusItem(parentItem); });
    if (e.key === "ArrowLeft") return go(() => toTitle(bar, down ? tli : next(-1)!, { quiet: down }));
    if (e.key === "Escape") return go(() => toTitle(bar, tli, { quiet: true }));
    if ((e.key === "Enter" || e.key === " ") && usable(inMenu) && !submenuOf(inMenu)) return go(() => choose(inMenu, () => toTitle(bar, tli, { quiet: true })));
  }, true);
}
