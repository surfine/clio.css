/*! clio.js — optional behaviour for clio.css | MIT | https://surfine.github.io/clio.css/
 * Load after clio.css; nothing in clio.css needs it. It adds what CSS cannot do:
 *   - a pressed control lets go while the pointer is off it and presses again on return
 *   - Return/Enter clicks a dialog's default button, Esc or Cmd-. its cancel button,
 *     each after flashing it pressed
 *   - scroll bars with the era's fixed-size scroll box, arrows that repeat while held,
 *     paging from the lane, and System 6/7's dragged outline (Mac OS 8/9 drag live)
 * Opt out per element with data-clio-js="off". */
(() => {
  "use strict";
  if (typeof document === "undefined" || window.clio) return;

  const TICK = 1000 / 60;
  const OFF = "data-clio-off";
  const optedOut = (el) => !!el.closest('[data-clio-js="off"]');

  /* ---- Held controls: let go off the control, press again on return ------- */
  // The Control Manager tracks a press until the button comes up and draws the
  // control pressed only while the pointer is inside it (Inside Macintosh:
  // Macintosh Toolbox Essentials, TrackControl). Browsers keep :active wherever
  // the pointer goes; clio.css's held rules skip [data-clio-off].
  const PRESSABLE = [
    "button", "input[type=button]", "input[type=submit]", "input[type=reset]",
    "input[type=checkbox]", "input[type=radio]", '[role="button"]', '[role="tab"]',
    ".title-bar > *", ".bevel", ".little-arrows > *", ".control-strip-module", ".control-strip-scroll",
  ].join(",");

  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const el = e.target.closest(PRESSABLE);
    if (!el || el.disabled || optedOut(el) || el.closest(".clio-sb-anchor")) return;
    const r = el.getBoundingClientRect();   // once per press; the control does not move while held
    const inside = (ev) => ev.clientX >= r.left && ev.clientX < r.right && ev.clientY >= r.top && ev.clientY < r.bottom;
    const move = (ev) => { if (ev.pointerId === e.pointerId) el.toggleAttribute(OFF, !inside(ev)); };
    const end = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      el.removeAttribute(OFF);
      document.removeEventListener("pointermove", move, true);
      document.removeEventListener("pointerup", end, true);
      document.removeEventListener("pointercancel", end, true);
    };
    document.addEventListener("pointermove", move, true);
    document.addEventListener("pointerup", end, true);
    document.addEventListener("pointercancel", end, true);
  }, true);

  /* ---- Default and cancel buttons from the keyboard ----------------------- */
  // Return or Enter is the default button; Esc and Cmd-. are Cancel. The button
  // shows pressed for 8 ticks first, as the Dialog Manager flashes it.
  const DIALOG = ".modal-dialog, .alert-box, .standard-dialog, .modeless-dialog, .window.movable-modal, dialog, [role=dialog], [role=alertdialog]";
  const DEFAULT = ".default:not(:disabled), .btn-default:not(:disabled), [data-clio-default]:not(:disabled)";
  const CANCEL = "[data-clio-cancel]:not(:disabled), button[value=cancel]:not(:disabled), .cancel:not(:disabled)";
  const flash = (button) => {
    const had = button.classList.contains("active");
    button.classList.add("active");
    setTimeout(() => { if (!had) button.classList.remove("active"); button.click(); }, 8 * TICK);
  };
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.isComposing || e.repeat) return;
    const enter = (e.key === "Enter") && !e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey;
    const cancel = e.key === "Escape" || (e.key === "." && (e.metaKey || e.ctrlKey));
    if (!enter && !cancel) return;
    const focus = document.activeElement instanceof Element ? document.activeElement : null;
    const scope = (focus && focus.closest(DIALOG)) || [...document.querySelectorAll("dialog[open]")].pop();
    if (!scope || optedOut(scope)) return;
    if (enter && focus && (focus.matches("textarea, button, select, [role=button], [contenteditable], a[href], summary") || focus.isContentEditable)) return;
    const button = scope.querySelector(enter ? DEFAULT : CANCEL);
    if (!button) return;
    e.preventDefault();
    flash(button);
  });

  /* ---- Scroll bars -------------------------------------------------------- */
  const HOSTS = ".window-pane, div.listbox, div[role=listbox], ul[role=listbox], .clio-scroll";
  const LINE = 16;            // one step of an arrow (inferred; applications chose their own)
  const REPEAT_DELAY = 200;   // Mac OS 9.0 Finder: one step, about 0.2 s, then steps until the button comes up
  const REPEAT_EVERY = 50;    // inferred: the emulator runs faster than the hardware did
  const px = (v) => parseFloat(v) || 0;
  const make = (cls, parent) => { const d = document.createElement("div"); d.className = cls; parent.appendChild(d); return d; };
  const hosts = new WeakMap();
  const live = new Set();   // every Bars, to measure again when an era changes

  class Bars {
    constructor(host) {
      this.host = host;
      const cs = getComputedStyle(host);
      for (const [v, side] of [["pt", "Top"], ["pr", "Right"], ["pb", "Bottom"], ["pl", "Left"]]) host.style.setProperty(`--clio-sb-${v}`, cs[`padding${side}`]);
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

    bar(axis) {
      const b = make(`clio-sb clio-sb-${axis}`, this.anchor);
      const parts = { bar: b, axis, track: make("clio-sb-track", b), dec: make("clio-sb-button clio-sb-dec", b), inc: make("clio-sb-button clio-sb-inc", b), thumb: make("clio-sb-thumb", b), ghost: null };
      b.addEventListener("pointerdown", (e) => this.press(parts, e));
      return parts;
    }

    read() {
      const h = this.host, cs = getComputedStyle(h);
      return {
        cw: h.clientWidth, ch: h.clientHeight, sw: h.scrollWidth, sh: h.scrollHeight, sl: h.scrollLeft, st: h.scrollTop,
        size: px(cs.getPropertyValue("--clio-scrollbar-size")) || 15,
        len: px(cs.getPropertyValue("--clio-scrollbar-thumb-length")) || 16,
        live: cs.getPropertyValue("--clio-scrollbar-thumb-tracking").trim() === "live",
        smart: !!h.closest('[data-clio-scrolling="smart"]'),
        overlap: px(cs.getPropertyValue("--clio-scrollbar-thumb-overlap")),
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
      this.place(this.v, this.need.y, cw - size - this.pad.l, -this.pad.t, ch - (this.need.x ? size : 0), m.st, m.sh - ch, ch / m.sh, smart);
      this.place(this.h, this.need.x, -this.pad.l, ch - size - this.pad.t, cw - (this.need.y ? size : 0), m.sl, m.sw - cw, cw / m.sw, smart);
      const c = this.corner.style;
      c.display = this.need.x && this.need.y ? "block" : "none";
      c.left = `${cw - size - this.pad.l}px`; c.top = `${ch - size - this.pad.t}px`; c.width = c.height = `${size}px`;
    }

    place(p, on, x, y, length, pos, max, visible, smart) {
      const s = p.bar.style, { size } = this.m, vertical = p.axis === "v";
      s.display = on ? "block" : "none";
      if (!on) return;
      s.left = `${x}px`; s.top = `${y}px`;
      s.width = `${vertical ? size : length}px`; s.height = `${vertical ? length : size}px`;
      p.bar.classList.toggle("clio-sb-smart", smart);
      p.bar.classList.toggle("clio-sb-off", max <= 0);
      const ov = this.m.overlap;   // Platinum's box shares its end lines with the arrows'
      const track = length - 2 * size + 2 * ov;
      const thumb = Math.min(track, smart ? Math.max(this.m.len, Math.round(track * visible)) : this.m.len);
      const range = Math.max(0, track - thumb);
      const at = max > 0 ? Math.round(range * Math.min(1, pos / max)) : 0;
      Object.assign(p, { track: p.track, length: track, thumbLength: thumb, range, at, max });
      p.thumb.style[vertical ? "height" : "width"] = `${thumb}px`;
      p.thumb.style[vertical ? "minHeight" : "minWidth"] = "0";   // the browser bar's minimum is not the box's length
      p.thumb.style[vertical ? "top" : "left"] = `${(smart ? 0 : size) - ov}px`;
      p.thumb.style[vertical ? "width" : "height"] = "";
      if (!p.dragging) p.thumb.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`;
    }

    scrollBy(p, d) { this.host.scrollBy(p.axis === "v" ? { top: d, behavior: "instant" } : { left: d, behavior: "instant" }); }
    scrollToThumb(p, at) { const v = p.range > 0 ? Math.round(at / p.range * p.max) : 0; if (p.axis === "v") this.host.scrollTop = v; else this.host.scrollLeft = v; }

    press(p, e) {
      if (e.button !== 0 || p.bar.classList.contains("clio-sb-off")) return;
      e.preventDefault();
      const vertical = p.axis === "v", m = this.m;
      p.bar.setPointerCapture(e.pointerId);
      const r = p.bar.getBoundingClientRect();
      const along = (ev) => (vertical ? ev.clientY - r.top : ev.clientX - r.left);
      const smart = p.bar.classList.contains("clio-sb-smart");
      const trackStart = (smart ? 0 : m.size) - m.overlap;
      const target = e.target;
      let timer = 0, stop;

      const repeat = (fn, test) => {
        fn();
        timer = setTimeout(function again() { if (test()) fn(); timer = setTimeout(again, REPEAT_EVERY); }, REPEAT_DELAY);
      };

      if (target === p.dec || target === p.inc) {
        const button = target, sign = button === p.dec ? -1 : 1;
        let over = true;
        button.classList.add("clio-held");
        const inButton = (ev) => { const b = button.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX < b.right && ev.clientY >= b.top && ev.clientY < b.bottom; };
        p.onmove = (ev) => { over = inButton(ev); button.classList.toggle("clio-held", over); };
        repeat(() => this.scrollBy(p, sign * LINE), () => over);
        stop = () => button.classList.remove("clio-held");
      } else if (target === p.thumb) {
        const grab = along(e) - trackStart - p.at;
        const live = m.live;
        p.dragging = true;
        if (!live) {
          p.ghost = make("clio-sb-ghost", p.bar);
          p.ghost.style.cssText = vertical
            ? `left:1px;right:0;top:${m.size}px;height:${p.thumbLength}px`
            : `top:1px;bottom:0;left:${m.size}px;width:${p.thumbLength}px`;   // System 7.5.3: 14x16, the box's own size inside the lane line
        }
        let at = p.at;
        p.onmove = (ev) => {
          at = Math.max(0, Math.min(p.range, Math.round(along(ev) - trackStart - grab)));
          if (live) { this.scrollToThumb(p, at); p.thumb.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`; return; }
          const shift = `${-at}px`;
          p.ghost.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`;
          p.ghost.style.setProperty(vertical ? "--clio-sb-gy" : "--clio-sb-gx", shift);
        };
        p.onmove(e);
        stop = () => {
          p.dragging = false;
          if (p.ghost) { p.ghost.remove(); p.ghost = null; this.scrollToThumb(p, at); }
          this.schedule();
        };
      } else {
        // The lane pages towards the pointer until the box reaches it.
        let point = along(e);
        const page = (vertical ? m.ch : m.cw) - LINE;
        p.onmove = (ev) => { point = along(ev); };
        const beyond = () => { const a = trackStart + p.at; return point < a ? -1 : point >= a + p.thumbLength ? 1 : 0; };
        repeat(() => { const d = beyond(); if (d) this.scrollBy(p, d * page); }, () => !!beyond());
      }

      const up = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        clearTimeout(timer);
        p.bar.removeEventListener("pointermove", move);
        p.bar.removeEventListener("pointerup", up);
        p.bar.removeEventListener("pointercancel", up);
        p.onmove = null;
        if (stop) stop();
      };
      const move = (ev) => { if (ev.pointerId === e.pointerId && p.onmove) p.onmove(ev); };
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
  function scrollbars(root = document) {
    const found = [];
    const list = root instanceof Element && root.matches(HOSTS) ? [root] : [];
    list.push(...(root.querySelectorAll ? root.querySelectorAll(HOSTS) : []));
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

  function start() {
    scrollbars(document);
    new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) if (n instanceof Element && !n.classList.contains("clio-sb-anchor") && !n.closest(".clio-sb-anchor")) scrollbars(n);
    }).observe(document.documentElement, { childList: true, subtree: true });
    // An era or Smart Scrolling switched anywhere: the bars' sizes come from the era.
    new MutationObserver(() => { for (const b of live) if (b.host.isConnected) b.schedule(); })
      .observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-era", "data-clio-scrolling"] });
  }

  window.clio = {
    version: "0.11.0-dev",
    scrollbars,
    unscroll(el) { const b = hosts.get(el); if (b) { b.destroy(); hosts.delete(el); live.delete(b); } },
    refresh(el) { const b = hosts.get(el); if (b) b.layout(); },
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
