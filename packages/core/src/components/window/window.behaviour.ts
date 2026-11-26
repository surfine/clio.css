import { beginDrag, dragMove, endDrag, play } from "../../runtime/sounds.ts";
import { live } from "../scrollbar/scrollbar.behaviour.ts";
import { ALERT, TICK, isUtility, optedOut, px, reduced } from "../../runtime/shared.ts";

type Timed = typeof announce & { t?: number };   // announce keeps its timer on itself

/* ---- Windows: dragged outline, zoom rects, collapse -------------------- */
// Dragging a title bar moves a grey outline (QuickDraw's DragGrayRgn: 1px in
// System 7.5.3, a 2px band in Mac OS 9.0, both measured) and the window
// follows when the button comes up. Only windows positioned absolute or
// fixed, or marked data-clio-drag, move.
const outlineBox = (r: ClioRect, width: number, margin = 0) => {
  const d = document.createElement("div");
  d.className = "clio-outline";
  d.setAttribute("aria-hidden", "true");
  Object.assign(d.style, { left: `${Math.round(r.left)}px`, top: `${Math.round(r.top)}px`, width: `${Math.round(r.width)}px`, height: `${Math.round(r.height)}px`, padding: `${width + margin}px` });
  grayPhase(d, Math.round(r.left), Math.round(r.top));
  return d;
};
// QuickDraw's gray kept to the screen as the outline moved: keep it to the page (a fixed
// background would not survive the transform that moves the outline).
const grayPhase = (d: HTMLElement, x: number, y: number) => { d.style.backgroundPosition = `${Math.round(x + y + scrollX + scrollY) & 1}px 0`; };
const outlineWidth = (el: Element) => px(getComputedStyle(el).getPropertyValue("--clio-drag-outline-width")) || 1;

// One way to move, for the pointer, the keyboard and the move menu: kept
// inside the viewport (fixed) or the window's container (absolute).
function moveBy(win: HTMLElement, dx: number, dy: number, say?: string) {
  const cs = getComputedStyle(win);
  let left = px(cs.left) + dx, top = px(cs.top) + dy;
  const op = win.offsetParent;
  const box = cs.position === "fixed" || !op || op === document.body || op === document.documentElement ? { w: document.documentElement.clientWidth, h: innerHeight } : { w: op.clientWidth, h: op.clientHeight };
  left = Math.max(0, Math.min(left, box.w - win.offsetWidth));
  top = Math.max(0, Math.min(top, box.h - win.offsetHeight));
  win.style.left = `${Math.round(left)}px`; win.style.top = `${Math.round(top)}px`;
  for (const b of live) if (win.contains(b.host)) b.schedule();   // the lanes' patterns keep to the page
  if (say) announce(`${windowName(win)} ${say}`);
  win.dispatchEvent(new CustomEvent("clio:move", { bubbles: true, detail: { dx, dy } }));
}
const windowName = (win: Element) => { const t = win.querySelector(":scope > .title-bar :is(.title, h1, h2, h3)"); return (t && t.textContent!.trim()) || "Window"; };
// A polite live region, there from the start so screen readers register it.
let liveRegion: HTMLElement | null = null;
function announce(text: string) {
  if (!liveRegion) return;
  liveRegion.textContent = text;
  clearTimeout((announce as Timed).t); (announce as Timed).t = setTimeout(() => { liveRegion!.textContent = ""; }, 1000);
}
// The keyboard and single-pointer way: a move button at the start of each
// movable window's title bar, out of sight until it has keyboard focus.
// Arrow keys move the window 16px (Shift: 1px); Return, Space, a click or a
// right click on the title bar open a menu of moves.
const STEP = 16;
const MOVES: [string, number, number, string][] = [["Move left", -1, 0, "moved left"], ["Move right", 1, 0, "moved right"], ["Move up", 0, -1, "moved up"], ["Move down", 0, 1, "moved down"]];
function handleFor(win: Element) {
  const bar = win.querySelector(":scope > .title-bar");
  if (!bar || bar.querySelector(":scope > .clio-move")) return;
  bar.classList.add("clio-drag-bar");   // a finger on it drags the window, not the page
  const b = document.createElement("button");
  b.type = "button"; b.className = "clio-move";
  b.setAttribute("aria-haspopup", "menu"); b.setAttribute("aria-expanded", "false");
  b.setAttribute("aria-label", `Move ${windowName(win)}. Arrow keys move it.`);
  bar.prepend(b);
}
const movable = (win: Element) => { const p = getComputedStyle(win).position; return p === "absolute" || p === "fixed" || win.hasAttribute("data-clio-drag"); };
export function claimWindows(root: Document | Element) {
  const list: Element[] = root instanceof Element && root.matches(".window") ? [root] : [];
  if (root.querySelectorAll) list.push(...root.querySelectorAll(".window"));
  for (const w of list) if (!optedOut(w) && movable(w)) handleFor(w);
}
let moveMenu: { menu: HTMLElement; handle: HTMLElement; win: Element } | null = null;
function closeMoveMenu(refocus: boolean) {
  if (!moveMenu) return;
  const { menu, handle } = moveMenu; moveMenu = null;
  menu.remove(); handle.setAttribute("aria-expanded", "false");
  if (refocus) handle.focus({ preventScroll: true });
}
function openMoveMenu(win: HTMLElement, at?: { left: number; top: number; height: number }) {
  closeMoveMenu(false);
  const handle = win.querySelector<HTMLElement>(":scope > .title-bar > .clio-move")!;
  const menu = document.createElement("ul");
  menu.className = "menu clio-move-menu"; menu.setAttribute("role", "menu");
  menu.setAttribute("aria-label", `Move ${windowName(win)}`);
  for (const [label, x, y, say] of MOVES) {
    const li = document.createElement("li"); li.setAttribute("role", "none");
    const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "menuitem"); b.tabIndex = -1; b.textContent = label;
    b.addEventListener("click", () => { closeMoveMenu(true); moveBy(win, x * STEP, y * STEP, say); });
    li.appendChild(b); menu.appendChild(li);
  }
  const r = at || handle.getBoundingClientRect();
  Object.assign(menu.style, { position: "fixed", left: `${Math.round(r.left)}px`, top: `${Math.round(r.top + (r.height || 0))}px`, zIndex: "2147483000" });
  (win.closest("[data-era]") || document.body).appendChild(menu);
  handle.setAttribute("aria-expanded", "true");
  moveMenu = { menu, handle, win };
  menu.querySelector("button")!.focus({ preventScroll: true });
  menu.addEventListener("keydown", (e) => {
    const bs = [...menu.querySelectorAll("button")], i = bs.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); bs[(i + (e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length]!.focus(); }
    else if (e.key === "Home" || e.key === "End") { e.preventDefault(); bs[e.key === "Home" ? 0 : bs.length - 1]!.focus(); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeMoveMenu(true); }
    else if (e.key === "Tab") closeMoveMenu(false);
  });
  menu.addEventListener("focusout", (e) => { if (!(e.relatedTarget instanceof Node && menu.contains(e.relatedTarget))) setTimeout(() => { if (moveMenu && !moveMenu.menu.contains(document.activeElement)) closeMoveMenu(false); }); });
}

// Zoom rects (the Finder opening a folder, measured frame by frame): one
// outline per tick. System 7.5.3: 8, each edge eased by 1.6^k, the last four on
// screen at once. Mac OS 9.0: 6 in a 2px band at 1.4^(k-7) of the way, all kept
// until the window draws. clio.zoomRects(from, to) with elements or rects;
// { closing: true } runs it backwards. Opacity only; none under reduced motion.
export function zoomRects(from: Element | ClioRect, to: Element | ClioRect, opts: { closing?: boolean } = {}) {
  const rect = (x: Element | ClioRect) => (x instanceof Element ? x.getBoundingClientRect() : x);
  const a = rect(from), b = rect(to);
  if (!a || !b || reduced()) return Promise.resolve();
  const host = (to instanceof Element && to.closest("[data-era]")) || (from instanceof Element && from.closest("[data-era]")) || document.body;
  // Per era (tokens): N outlines, the k-th at (r^k - c) / (r^M - c) of the way, `keep` on
  // screen at once (0: all, until the last is gone), drawn with the drag outline's width.
  const cs = getComputedStyle(host), num = (n: string, d: number) => { const v = parseFloat(cs.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
  const N = num("--clio-zoom-count", 8), M = num("--clio-zoom-steps", N), Q = num("--clio-zoom-ratio", 1.6), C = num("--clio-zoom-offset", 1), keep = num("--clio-zoom-keep", 4) || Infinity;
  const boxes: HTMLElement[] = [];
  for (let k = 1; k <= N; k++) {
    const p = (Q ** k - C) / (Q ** M - C), l = (u: number, v: number) => u + (v - u) * p;
    const o = outlineBox({ left: l(a.left, b.left), top: l(a.top, b.top), width: l(a.width, b.width), height: l(a.height, b.height) }, outlineWidth(host));
    o.style.setProperty("--clio-drag-outline-extra", "0px");   // a plain rectangle
    o.style.opacity = "0";
    host.appendChild(o); boxes.push(o);
  }
  if (opts.closing) boxes.reverse();
  return new Promise<void>((done) => {
    let t = 0;
    const step = () => {
      boxes.forEach((o, i) => { o.style.opacity = i <= t && i > t - keep ? "1" : "0"; });
      if (++t < N + (Number.isFinite(keep) ? keep - 1 : 0)) setTimeout(step, TICK); else { boxes.forEach((o) => o.remove()); done(); }
    };
    step();
  });
}

// The collapse box (WindowShade) folds a window to its title bar; with
// data-clio-shade="dblclick" on the window or an ancestor a double click on
// the title bar does too (Appearance > Options; off by default in Mac OS 9.0).
export function collapse(win: Element, on = !win.classList.contains("collapsed")) {
  win.classList.toggle("collapsed", on);
  const box = win.querySelector(":scope > .title-bar > :is(.shade, .shade-box, .collapse)");
  if (box) box.setAttribute("aria-expanded", String(!on));
  play(on ? "collapse" : "expand");   // the 0.11 names
  play(on ? (isUtility(win) ? "ucol" : "wcol") : (isUtility(win) ? "uexp" : "wexp"), win);
  win.dispatchEvent(new CustomEvent("clio:collapse", { bubbles: true, detail: { collapsed: on } }));
}

export function install(): void {
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const bar = e.target.closest(".window > .title-bar");
    if (!bar || e.target.closest("button, a, input, select, .close, .close-box, .resize, .resize-box, .zoom, .shade, .shade-box, .collapse") || optedOut(bar)) return;
    const win = bar.parentElement!, cs = getComputedStyle(win);
    if (!(cs.position === "absolute" || cs.position === "fixed" || win.hasAttribute("data-clio-drag"))) return;
    e.preventDefault();
    // The dragged region is the window's structure: its frame and its drop shadow.
    // (Drawing Board: a shadow 7px across and 8px down, and a margin for the corners' overrun.)
    const ws = getComputedStyle(win), grow = px(ws.getPropertyValue("--clio-drag-outline-extra")), m = px(ws.getPropertyValue("--clio-drag-outline-margin"));
    const growY = ws.getPropertyValue("--clio-drag-outline-extra-y").trim() ? px(ws.getPropertyValue("--clio-drag-outline-extra-y")) : grow;
    const b = win.getBoundingClientRect(), r = { left: b.left - m, top: b.top - m, width: b.width + grow + 2 * m, height: b.height + growY + 2 * m };
    const o = outlineBox(r, outlineWidth(win), m);
    (win.closest("[data-era]") || document.body).appendChild(o);
    const x0 = e.clientX, y0 = e.clientY; let dx = 0, dy = 0;
    beginDrag(win.matches(ALERT) || win.querySelector(ALERT) ? "amov" : win.matches(".modal-dialog, .movable-modal, .standard-dialog, .modeless-dialog") ? "dmov" : isUtility(win) ? "umov" : "wmov", win);
    const move = (ev: PointerEvent) => { if (ev.pointerId !== e.pointerId) return; dragMove(); dx = Math.round(ev.clientX - x0); dy = Math.round(ev.clientY - y0); /* a finger reports fractions */ o.style.transform = `translate(${dx}px, ${dy}px)`; grayPhase(o, Math.round(r.left) + dx, Math.round(r.top) + dy); };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      document.removeEventListener("pointermove", move, true); document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true);
      endDrag(ev.type === "pointercancel");
      o.remove();
      if (ev.type === "pointercancel" || (!dx && !dy)) return;
      moveBy(win, dx, dy);
    };
    document.addEventListener("pointermove", move, true); document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
  });

  document.addEventListener("keydown", (e) => {
    const h = e.target instanceof Element ? e.target.closest(".clio-move") : null;
    if (!h || e.defaultPrevented) return;
    const m = ({ ArrowLeft: [-1, 0, "moved left"], ArrowRight: [1, 0, "moved right"], ArrowUp: [0, -1, "moved up"], ArrowDown: [0, 1, "moved down"] } as Record<string, [number, number, string] | undefined>)[e.key];
    if (!m) return;
    e.preventDefault();
    const step = e.shiftKey ? 1 : STEP;
    moveBy(h.closest<HTMLElement>(".window")!, m[0] * step, m[1] * step, m[2]);
  });

  document.addEventListener("click", (e) => {
    const h = e.target instanceof Element ? e.target.closest(".clio-move") : null;
    if (h) { if (moveMenu && moveMenu.handle === h) closeMoveMenu(true); else openMoveMenu(h.closest<HTMLElement>(".window")!); }
  });

  document.addEventListener("contextmenu", (e) => {
    const bar = e.target instanceof Element ? e.target.closest(".window > .title-bar") : null;
    if (!bar || !bar.querySelector(":scope > .clio-move") || (e.target as Element).closest("button:not(.clio-move)")) return;
    e.preventDefault();
    openMoveMenu(bar.parentElement!, { left: e.clientX, top: e.clientY, height: 0 });
  });

  addEventListener("resize", () => requestAnimationFrame(() => { for (const h of document.querySelectorAll(".clio-move")) { const w = h.closest<HTMLElement>(".window"); if (w) moveBy(w, 0, 0); } }));

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const box = e.target.closest(".window > .title-bar > :is(.shade, .shade-box, .collapse)");
    if (box && !optedOut(box) && !e.defaultPrevented) collapse(box.closest(".window")!);
  });

  document.addEventListener("dblclick", (e) => {
    if (!(e.target instanceof Element)) return;
    const bar = e.target.closest(".window > .title-bar");
    if (!bar || e.target.closest("button") || optedOut(bar)) return;
    const opt = bar.closest("[data-clio-shade]");
    if (opt && /\bdblclick\b/.test(opt.getAttribute("data-clio-shade")!)) collapse(bar.parentElement!);
  });
}

export function createLiveRegion(): void {
  liveRegion = document.createElement("div");
  liveRegion.className = "clio-live"; liveRegion.setAttribute("aria-live", "polite");
  document.body.appendChild(liveRegion);
}
