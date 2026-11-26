import { beginDrag, dragMove, endDrag, play } from "../../runtime/sounds.ts";
import { make, optedOut, px } from "../../runtime/shared.ts";

interface Part {
  bar: HTMLDivElement; axis: string; track: HTMLDivElement; dec: HTMLDivElement; inc: HTMLDivElement; thumb: HTMLDivElement; ghost: HTMLDivElement | null;
  length: number; thumbLength: number; range: number; at: number; max: number; dragging?: boolean; onmove?: ((ev: PointerEvent) => void) | null;
}
interface Metrics { cw: number; ch: number; sw: number; sh: number; sl: number; st: number; size: number; len: number; live: boolean; delay: number; smart: boolean; left: boolean; together: boolean; arrow: number; gap: number; overlap: number; ox: number; oy: number }

/* ---- Scroll bars -------------------------------------------------------- */
const HOSTS = ".window-pane, div.listbox, div[role=listbox], ul[role=listbox], .clio-scroll";
const LINE = 16;            // one step of an arrow: one row of the Finder's list (System 6.0.8)
// A held arrow or lane steps at once, then after --clio-scrollbar-repeat-delay
// (0 in System 6 and 7, whose TrackControl had none; 0.2 s in Mac OS 9's Finder).
// The Mac then stepped as fast as the application could scroll: no fixed rate
// existed, so this one is chosen.
const REPEAT_EVERY = 50;

const hosts = new WeakMap<Element, Bars>();
export const live = new Set<Bars>();   // every Bars, to measure again when an era changes

class Bars {
  declare host: HTMLElement; declare pad: { t: number; l: number }; declare overflow: { x: string; y: string };
  declare anchor: HTMLDivElement; declare v: Part; declare h: Part; declare corner: HTMLDivElement;
  declare need: { x: boolean; y: boolean }; declare queued: boolean; declare update: () => void; declare schedule: () => void;
  declare ro: ResizeObserver; declare mo: MutationObserver; declare m: Metrics;
  constructor(host: HTMLElement) {
    this.host = host;
    const cs = getComputedStyle(host);
    for (const [v, side] of [["pt", "Top"], ["pr", "Right"], ["pb", "Bottom"], ["pl", "Left"]]) host.style.setProperty(`--clio-sb-${v}`, (cs as unknown as Record<string, string>)[`padding${side}`]!);
    this.pad = { t: px(cs.paddingTop), l: px(cs.paddingLeft) };
    this.overflow = { x: cs.overflowX, y: cs.overflowY };
    host.classList.add("clio-sb-host");
    const a = this.anchor = document.createElement("div");
    a.className = "clio-sb-anchor";
    a.setAttribute("aria-hidden", "true");
    this.v = this.bar("v");
    this.h = this.bar("h");
    this.corner = make("clio-sb-corner", a);
    host.prepend(a);
    this.need = { x: false, y: false };
    this.queued = false;
    this.update = () => { this.queued = false; this.layout(); };
    this.schedule = () => { if (!this.queued) { this.queued = true; requestAnimationFrame(this.update); } };
    host.addEventListener("scroll", this.schedule, { passive: true });
    this.ro = new ResizeObserver(this.schedule);
    this.ro.observe(host);
    this.mo = new MutationObserver(this.schedule);
    this.mo.observe(host, { childList: true, subtree: true, characterData: true });
    this.layout();
  }

  bar(axis: string) {
    const b = make(`clio-sb clio-sb-${axis}`, this.anchor);
    const parts = { bar: b, axis, track: make("clio-sb-track", b), dec: make("clio-sb-button clio-sb-dec", b), inc: make("clio-sb-button clio-sb-inc", b), thumb: make("clio-sb-thumb", b), ghost: null } as Part;
    b.addEventListener("pointerdown", (e) => this.press(parts, e));
    return parts;
  }

  read(): Metrics {
    const h = this.host, cs = getComputedStyle(h); let r: DOMRect;
    return {
      cw: h.clientWidth, ch: h.clientHeight, sw: h.scrollWidth, sh: h.scrollHeight, sl: h.scrollLeft, st: h.scrollTop,
      size: px(cs.getPropertyValue("--clio-scrollbar-size")) || 15,
      len: px(cs.getPropertyValue("--clio-scrollbar-thumb-length")) || 16,
      live: cs.getPropertyValue("--clio-scrollbar-thumb-tracking").trim() === "live",
      delay: parseFloat(cs.getPropertyValue("--clio-scrollbar-repeat-delay")) || 0,
      smart: !!h.closest('[data-clio-scrolling="smart"]'),
      // NeXTSTEP: the vertical bar on the left, both arrows together (at the bottom, and
      // at the left of a horizontal bar that runs under it); unset in the Classic eras
      left: cs.getPropertyValue("--clio-scrollbar-side").trim() === "left",
      together: cs.getPropertyValue("--clio-scrollbar-arrows").trim() === "together",
      // an arrow's cell along the bar when it is not the bar's width, and the lane left after
      // the last arrow (NeXTSTEP: 17 and 1); unset, the arrows are square
      arrow: px(cs.getPropertyValue("--clio-scrollbar-arrow-length")),
      gap: px(cs.getPropertyValue("--clio-scrollbar-arrow-gap")),
      overlap: px(cs.getPropertyValue("--clio-scrollbar-thumb-overlap")),
      // the padding box's place on the page: QuickDraw aligned a lane's pattern with the
      // screen, so the lanes are aligned with the page (System 6.0.8, System 7.5.3)
      ox: (r = h.getBoundingClientRect()).left + h.clientLeft + scrollX, oy: r.top + h.clientTop + scrollY,
    };
  }

  layout() {
    let m = this.read();
    const want = {
      y: this.overflow.y === "scroll" || (this.overflow.y === "auto" && m.sh > m.ch),
      x: this.overflow.x === "scroll" || (this.overflow.x === "auto" && m.sw > m.cw),
    };
    if (want.x !== this.need.x || want.y !== this.need.y) {
      this.need = want;
      this.host.classList.toggle("clio-sb-y", want.y);
      this.host.classList.toggle("clio-sb-x", want.x);
      m = this.read();   // the padding changed: measure again, once
    }
    this.m = m;
    const { cw, ch, size } = m, smart = m.smart && m.live;   // Smart Scrolling is Mac OS 8/9's
    if (m.left) {
      const l = this.pad.l + (this.need.y ? size : 0);   // the bar sits in the left padding, which grew by its width
      this.place(this.v, this.need.y, -l, -this.pad.t, ch - (this.need.x ? size : 0), m.st, m.sh - ch, ch / m.sh, smart || m.together);
      this.place(this.h, this.need.x, -l, ch - size - this.pad.t, cw, m.sl, m.sw - cw, cw / m.sw, smart, m.together);
    } else {
      this.place(this.v, this.need.y, cw - size - this.pad.l, -this.pad.t, ch - (this.need.x ? size : 0), m.st, m.sh - ch, ch / m.sh, smart || m.together);
      this.place(this.h, this.need.x, -this.pad.l, ch - size - this.pad.t, cw - (this.need.y ? size : 0), m.sl, m.sw - cw, cw / m.sw, smart, m.together);
    }
    const c = this.corner.style;
    c.display = this.need.x && this.need.y && !m.left ? "block" : "none";
    c.left = `${cw - size - this.pad.l}px`; c.top = `${ch - size - this.pad.t}px`; c.width = c.height = `${size}px`;
  }

  place(p: Part, on: boolean, x: number, y: number, length: number, pos: number, max: number, visible: number, smart: boolean, near = false) {
    const s = p.bar.style, { size } = this.m, vertical = p.axis === "v";
    s.display = on ? "block" : "none";
    if (!on) return;
    s.left = `${x}px`; s.top = `${y}px`;
    s.width = `${vertical ? size : length}px`; s.height = `${vertical ? length : size}px`;
    // The lane's origin on the page (its line is the track's first pixel), as a pattern offset.
    const mod = (v: number, n: number) => ((Math.round(-v) % n) + n) % n;
    const tx = this.m.ox + this.pad.l + x + (vertical ? 1 : size), ty = this.m.oy + this.pad.t + y + (vertical ? size : 1);
    s.setProperty("--clio-sb-px", `${mod(tx, 8)}px`); s.setProperty("--clio-sb-py", `${mod(ty, 8)}px`);
    p.bar.classList.toggle("clio-sb-smart", smart);
    p.bar.classList.toggle("clio-sb-near", near);   // both arrows at the near end (NeXTSTEP's horizontal bar)
    p.bar.classList.toggle("clio-sb-off", max <= 0);
    const ov = this.m.overlap;   // Platinum's box shares its end lines with the arrows'
    const arrows = this.m.arrow ? 2 * this.m.arrow + this.m.gap : 2 * size;
    // NeXTSTEP (--clio-scrollbar-arrow-length): the box keeps a margin (-overlap) from the lane's
    // far end only; the arrows' own cells hold the margin at the near one
    const track = this.m.arrow ? length - arrows + ov : length - arrows + 2 * ov;
    const thumb = Math.min(track, smart || near || this.m.together ? Math.max(this.m.len, Math.round(track * visible)) : this.m.len);
    const range = Math.max(0, track - thumb);
    const at = max > 0 ? Math.round(range * Math.min(1, pos / max)) : 0;
    Object.assign(p, { track: p.track, length: track, thumbLength: thumb, range, at, max });
    p.thumb.style[vertical ? "height" : "width"] = `${thumb}px`;
    p.thumb.style[vertical ? "minHeight" : "minWidth"] = "0";   // the browser bar's minimum is not the box's length
    // NeXTSTEP's horizontal bar keeps its 1px margin at the far end, so the box starts right
    // after the arrows' cells
    p.thumb.style[vertical ? "top" : "left"] = `${smart ? -ov : near ? (this.m.arrow ? arrows : arrows - ov) : size - ov}px`;
    p.thumb.style[vertical ? "width" : "height"] = "";
    if (!p.dragging) p.thumb.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`;
  }

  scrollBy(p: Part, d: number) { this.host.scrollBy(p.axis === "v" ? { top: d, behavior: "instant" } : { left: d, behavior: "instant" }); }
  scrollToThumb(p: Part, at: number) { const v = p.range > 0 ? Math.round(at / p.range * p.max) : 0; if (p.axis === "v") this.host.scrollTop = v; else this.host.scrollLeft = v; }

  press(p: Part, e: PointerEvent) {
    if (e.button !== 0 || p.bar.classList.contains("clio-sb-off")) return;
    e.preventDefault();
    const vertical = p.axis === "v", m = this.m;
    p.bar.setPointerCapture(e.pointerId);
    const r = p.bar.getBoundingClientRect();
    const along = (ev: PointerEvent) => (vertical ? ev.clientY - r.top : ev.clientX - r.left);
    const smart = p.bar.classList.contains("clio-sb-smart");
    const near = p.bar.classList.contains("clio-sb-near");
    const trackStart = smart ? -m.overlap : near ? (m.arrow ? 2 * m.arrow + m.gap : 2 * m.size - m.overlap) : m.size - m.overlap;
    const target = e.target;
    let timer = 0, stop: ((ev: PointerEvent) => void) | undefined;

    const repeat = (fn: () => void, test: () => boolean) => {
      fn();
      timer = setTimeout(function again() { if (test()) fn(); timer = setTimeout(again, REPEAT_EVERY); }, m.delay || REPEAT_EVERY);
    };

    if (target === p.dec || target === p.inc) {
      const button = target as HTMLDivElement, sign = button === p.dec ? -1 : 1;
      let over = true;
      button.classList.add("clio-held");
      const inButton = (ev: PointerEvent) => { const b = button.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX < b.right && ev.clientY >= b.top && ev.clientY < b.bottom; };
      play("sbap", this.host);
      let held = 0;   // the arrow held: its drag loop, after the first repeat
      p.onmove = (ev: PointerEvent) => { const now = inButton(ev); if (now !== over) play(now ? "sbae" : "sbax", this.host); over = now; button.classList.toggle("clio-held", over); };
      repeat(() => { this.scrollBy(p, sign * LINE); if (++held === 2) beginDrag(sign > 0 ? "sbai" : "sbad", this.host); }, () => over);
      stop = (ev: PointerEvent) => { button.classList.remove("clio-held"); if (held > 1) endDrag(true); if (over && ev.type === "pointerup") play("sbar", this.host); };
    } else if (target === p.thumb) {
      const grab = along(e) - trackStart - p.at;
      const live = m.live;
      p.dragging = true;
      beginDrag(live ? "sbth" : "sbgh", this.host);
      if (!live) {
        p.ghost = make("clio-sb-ghost", p.bar);
        p.ghost.style.cssText = vertical
          ? `left:1px;right:0;top:${m.size}px;height:${p.thumbLength}px`
          : `top:1px;bottom:0;left:${m.size}px;width:${p.thumbLength}px`;   // System 7.5.3: 14x16, the box's own size inside the lane line
      }
      let at = p.at;
      p.onmove = (ev: PointerEvent) => {
        dragMove();
        at = Math.max(0, Math.min(p.range, Math.round(along(ev) - trackStart - grab)));
        if (live) { this.scrollToThumb(p, at); p.thumb.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`; return; }
        const shift = `${-at}px`;
        p.ghost!.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`;
        p.ghost!.style.setProperty(vertical ? "--clio-sb-gy" : "--clio-sb-gx", shift);
      };
      p.onmove(e);
      stop = () => {
        endDrag();
        p.dragging = false;
        if (p.ghost) { p.ghost.remove(); p.ghost = null; this.scrollToThumb(p, at); }
        this.schedule();
      };
    } else {
      // The lane pages towards the pointer until the box reaches it.
      let point = along(e);
      const page = (vertical ? m.ch : m.cw) - LINE;
      p.onmove = (ev: PointerEvent) => { point = along(ev); };
      const beyond = () => { const a = trackStart + p.at; return point < a ? -1 : point >= a + p.thumbLength ? 1 : 0; };
      play("sbtp", this.host);
      let reached = false;   // the box reaching the pointer: the end of the track's paging
      repeat(() => { const d = beyond(); if (d) { this.scrollBy(p, d * page); reached = false; } else if (!reached) { reached = true; play("sbte", this.host); } }, () => !!beyond() || !reached);
    }

    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      clearTimeout(timer);
      p.bar.removeEventListener("pointermove", move);
      p.bar.removeEventListener("pointerup", up);
      p.bar.removeEventListener("pointercancel", up);
      p.onmove = null;
      if (stop) stop(ev);
    };
    const move = (ev: PointerEvent) => { if (ev.pointerId === e.pointerId && p.onmove) p.onmove(ev); };
    p.bar.addEventListener("pointermove", move);
    p.bar.addEventListener("pointerup", up);
    p.bar.addEventListener("pointercancel", up);
  }

  destroy() {
    this.ro.disconnect(); this.mo.disconnect();
    this.host.removeEventListener("scroll", this.schedule);
    this.anchor.remove();
    this.host.classList.remove("clio-sb-host", "clio-sb-x", "clio-sb-y");
    for (const v of ["pt", "pr", "pb", "pl"]) this.host.style.removeProperty(`--clio-sb-${v}`);
  }
}

const blockish = new Set(["block", "flow-root", "list-item"]);
export function scrollbars(root: Document | Element = document) {
  const found: Element[] = [];
  const list: HTMLElement[] = root instanceof Element && root.matches(HOSTS) ? [root as HTMLElement] : [];
  list.push(...(root.querySelectorAll ? root.querySelectorAll<HTMLElement>(HOSTS) : []));
  for (const el of list) {
    if (hosts.has(el) || optedOut(el) || el.closest("[data-clio-scrollbars=native]")) continue;
    const cs = getComputedStyle(el);
    if (!blockish.has(cs.display)) continue;   // flex and grid scrollers keep the browser's bar
    if (![cs.overflowX, cs.overflowY].some((o) => o === "auto" || o === "scroll")) continue;
    const bars = new Bars(el);
    hosts.set(el, bars);
    live.add(bars);
    found.push(el);
  }
  return found;
}

export function unscroll(el: Element): void { const b = hosts.get(el); if (b) { b.destroy(); hosts.delete(el); live.delete(b); } }
export function refresh(el: Element): void { const b = hosts.get(el); if (b) b.layout(); }
