/*! clio.js — optional behaviour for clio.css | MIT | https://surfine.github.io/clio.css/
 * Load after clio.css; nothing in clio.css needs it. It adds what CSS cannot do:
 *   - a pressed control lets go while the pointer is off it and presses again on return
 *   - Return/Enter clicks a dialog's default button, Esc or Cmd-. its cancel button,
 *     each after flashing it pressed
 *   - scroll bars with the era's fixed-size scroll box, arrows that repeat while held,
 *     paging from the lane, and System 6/7's dragged outline (Mac OS 8/9 drag live)
 *   - menus that track the pointer (drag and release, blink, submenus, keys) and
 *     <select> opening as the era's pop-up menu
 *   - window dragging with a grey outline, the collapse box, clio.zoomRects()
 *   - optional sounds you supply (clio.sounds, data-clio-sounds)
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
    if (!el || el.disabled || optedOut(el) || el.closest(".clio-sb-anchor, .menu-bar, [role=menubar], [role=menu-bar], .menu, [role=menu]")) return;
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

  /* ---- Menus -------------------------------------------------------------- */
  // Press a title and drag: the menu follows the pointer and the item under it
  // is chosen when the button comes up, blinking first. Mac OS 8 and 9 also
  // keep a clicked menu open (--clio-menu-sticky: 1). Measured in Mac OS 9.0:
  // 3 blinks of 3 ticks off and 3 on; a submenu opens 9 ticks after its item
  // lights and survives a move towards it for up to about 1.2 s.
  const BAR = ".menu-bar, [role=menubar], [role=menu-bar]";
  const MENU = ".menu, [role=menu]";
  const TITLE = ":scope > li > :is(button, a, span)";
  const BLINK = "data-clio-blink";
  const SUBMENU_DELAY = 9 * TICK;
  const DRAG_HOLD = 1200;
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sticky = (el) => getComputedStyle(el).getPropertyValue("--clio-menu-sticky").trim() === "1";
  const usable = (li) => li && li.matches(`:is(${MENU}) > li`) && !li.matches(".disabled, [aria-disabled=true], .separator, [role=separator], .scroll-up, .scroll-down") && !li.querySelector(":scope > :is(a, button):is(:disabled, [aria-disabled=true])");
  const submenuOf = (li) => li && li.querySelector(`:scope > :is(${MENU})`);
  const control = (li) => li.querySelector(":scope > :is(a, button)") || li;

  let track = null;   // { bar, title, li, mode: "press" | "sticky", hot, timer, hold }

  function titleOf(li) { return li.querySelector(":scope > :is(button, a, span)"); }
  function openTitle(bar, li) {
    for (const other of bar.querySelectorAll(":scope > li.open")) if (other !== li) closeTitle(other);
    li.classList.add("open");
    const t = titleOf(li); if (t && t.hasAttribute("aria-expanded")) t.setAttribute("aria-expanded", "true");
  }
  function closeTitle(li) {
    li.classList.remove("open");
    const t = titleOf(li); if (t && t.hasAttribute("aria-expanded")) t.setAttribute("aria-expanded", "false");
    for (const x of li.querySelectorAll("li.open, li.active")) x.classList.remove("open", "active");
  }
  function closeAll() {
    if (!track) return;
    clearTimeout(track.timer); clearTimeout(track.hold);
    for (const li of track.bar.querySelectorAll(":scope > li.open")) closeTitle(li);
    if (document.activeElement && track.bar.contains(document.activeElement)) document.activeElement.blur();
    track = null;
  }
  // Light an item; open its submenu after the delay, close siblings' submenus.
  function light(li) {
    if (!track || track.hot === li) return;
    const menu = li ? li.parentElement : null;
    if (menu) for (const sib of menu.children) if (sib !== li) { sib.classList.remove("active"); if (sib.classList.contains("open")) closeSub(sib); }
    if (track.hot && track.hot !== li && (!li || !track.hot.contains(li))) track.hot.classList.remove("active");
    track.hot = li;
    clearTimeout(track.timer);
    if (!li || !usable(li)) return;
    li.classList.add("active");
    if (submenuOf(li)) track.timer = setTimeout(() => { li.classList.add("open"); }, SUBMENU_DELAY);
  }
  function closeSub(li) { li.classList.remove("open", "active"); for (const x of li.querySelectorAll("li.open, li.active")) x.classList.remove("open", "active"); }
  // Moving from an open parent item towards its submenu keeps it (a cone from
  // the pointer to the submenu's near edge), for up to DRAG_HOLD.
  function towardsSub(parent, from, to) {
    const sub = submenuOf(parent); if (!sub || !parent.classList.contains("open")) return false;
    const r = sub.getBoundingClientRect();
    const right = r.left >= from.x, edge = right ? r.left : r.right;
    const dx = to.x - from.x;
    if (right ? dx <= 0 : dx >= 0) return false;
    const k = Math.abs(dx) / Math.abs(edge - from.x || 1);
    return to.y >= from.y + (r.top - from.y) * k - 1 && to.y <= from.y + (r.bottom - from.y) * k + 1;
  }
  function itemAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest(`:is(${MENU}) > li`) : null;
  }
  function choose(li) {
    const done = () => {
      li.removeAttribute(BLINK); const c = control(li); c.removeAttribute(BLINK);
      closeAll();
      play("menu");
      c.click();
    };
    track.mode = "blink";
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

  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const target = e.target;
    if (track && track.mode === "sticky") {
      const li = target.closest(`:is(${MENU}) > li`);
      const tli = target.closest(`:is(${BAR}) > li`);
      if (li && track.bar.contains(li)) { track.mode = "press"; e.preventDefault(); return; }
      if (tli && tli.parentElement === track.bar && !li) { e.preventDefault(); if (tli.classList.contains("open")) { closeAll(); return; } openTitle(track.bar, tli); track.li = tli; track.mode = "press"; track.fresh = false; return; }
      closeAll(); e.preventDefault(); e.stopPropagation();
      document.addEventListener("click", (c) => { c.preventDefault(); c.stopPropagation(); }, { capture: true, once: true });
      return;
    }
    const tli = target.closest(`:is(${BAR}) > li`);
    if (!tli || optedOut(tli) || target.closest(MENU)) return;
    e.preventDefault();   // the title neither takes focus nor starts a selection
    const bar = tli.parentElement;
    track = { bar, li: tli, mode: "press", hot: null, fresh: true, last: { x: e.clientX, y: e.clientY } };
    openTitle(bar, tli);
  }, true);

  document.addEventListener("pointermove", (e) => {
    if (!track || track.mode === "blink") return;
    const at = { x: e.clientX, y: e.clientY };
    const from = track.last; track.last = at;
    const el = document.elementFromPoint(at.x, at.y);
    if (!el) return;
    const tli = el.closest(`:is(${BAR}) > li`);
    if (tli && tli.parentElement === track.bar && !el.closest(MENU) && tli !== track.li && (track.mode === "press" || track.mode === "sticky")) {
      openTitle(track.bar, tli); track.li = tli; track.fresh = false; light(null); return;
    }
    const li = el.closest(`:is(${MENU}) > li`);
    if (li && !track.bar.contains(li)) return;
    // keep a parent's submenu while heading for it
    const parent = track.hot && submenuOf(track.hot) ? track.hot : null;
    if (parent && li !== parent && !(li && parent.contains(li)) && towardsSub(parent, from, at)) {
      clearTimeout(track.hold);
      track.hold = setTimeout(() => { if (track) light(itemAt(track.last.x, track.last.y)); }, DRAG_HOLD);
      return;
    }
    clearTimeout(track.hold);
    if (li) light(li);
    else if (track.hot && !submenuOf(track.hot)) light(null);
  }, true);

  document.addEventListener("pointerup", (e) => {
    if (!track || track.mode !== "press" || e.button !== 0) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el && el.closest(`:is(${MENU}) > li`);
    if (li && track.bar.contains(li) && usable(li) && !submenuOf(li)) { e.preventDefault(); choose(li); return; }
    const tli = el && el.closest(`:is(${BAR}) > li`);
    if (tli === track.li && track.fresh && !el.closest(MENU) && sticky(track.bar)) { track.mode = "sticky"; return; }   // Mac OS 8: a click leaves the menu open
    closeAll();
  }, true);

  // A click that ends a menu gesture must not reach the page.
  document.addEventListener("click", (e) => {
    if (e.isTrusted && e.target instanceof Element && e.target.closest(`:is(${BAR}) > li > :is(button, a, span)`) && !optedOut(e.target)) e.preventDefault();
  }, true);

  // Keyboard: arrows move between titles and items, Return/Space chooses,
  // Esc closes. Command-key equivalents (<kbd>⌘N</kbd>) work on menu bars
  // marked data-clio-shortcuts, the title lighting while the item runs.
  const items = (menu) => [...menu.children].filter(usable);
  const focusItem = (li) => { const c = control(li); if (c === li && !li.hasAttribute("tabindex")) li.tabIndex = -1; c.focus(); if (track) light(li); };
  document.addEventListener("keydown", (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    const f = document.activeElement instanceof Element ? document.activeElement : null;
    if (e.metaKey || e.ctrlKey) return shortcut(e);
    if (!f) return;
    const tli = f.closest(`:is(${BAR}) > li`);
    if (!tli || optedOut(tli)) return;
    const bar = tli.parentElement;
    const inMenu = f.closest(`:is(${MENU}) > li`);
    const titles = [...bar.children];
    const go = (fn) => { e.preventDefault(); fn(); };
    if (!inMenu) {
      if (["ArrowDown", "Enter", " "].includes(e.key)) return go(() => { track = { bar, li: tli, mode: "sticky", hot: null, last: { x: 0, y: 0 } }; openTitle(bar, tli); const m = tli.querySelector(`:scope > :is(${MENU})`); if (m && items(m)[0]) focusItem(items(m)[0]); });
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") return go(() => { const i = titles.indexOf(tli); const n = titles[(i + (e.key === "ArrowRight" ? 1 : titles.length - 1)) % titles.length]; const t = titleOf(n); if (t) t.focus(); });
      return;
    }
    if (!track) track = { bar, li: tli, mode: "sticky", hot: null, last: { x: 0, y: 0 } };
    const menu = inMenu.parentElement, list = items(menu), i = list.indexOf(inMenu);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") return go(() => focusItem(list[(i + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]));
    if (e.key === "ArrowRight" && submenuOf(inMenu)) return go(() => { inMenu.classList.add("open"); const s = items(submenuOf(inMenu)); if (s[0]) focusItem(s[0]); });
    if (e.key === "ArrowLeft" && menu.parentElement.closest(`:is(${MENU}) > li`)) return go(() => { const p = menu.parentElement; closeSub(p); focusItem(p); });
    if (e.key === "Escape") return go(() => { const t = titleOf(tli); closeAll(); if (t) t.focus(); });
    if ((e.key === "Enter" || e.key === " ") && usable(inMenu) && !submenuOf(inMenu)) return go(() => choose(inMenu));
  }, true);

  function shortcut(e) {
    if (e.altKey || e.key.length !== 1) return;
    const key = e.key.toLowerCase();
    for (const bar of document.querySelectorAll(`:is(${BAR})[data-clio-shortcuts]`)) {
      for (const kbd of bar.querySelectorAll(`:is(${MENU}) > li kbd`)) {
        const m = kbd.textContent.trim().match(/^(⇧?)\s*⌘\s*(.)$/u);   // "⌘N", "⇧⌘S"
        const li = kbd.closest(`:is(${MENU}) > li`);
        if (!m || m[2].toLowerCase() !== key || !!m[1] !== e.shiftKey || !usable(li)) continue;
        e.preventDefault();
        const tli = li.closest(`:is(${BAR}) > li`), t = titleOf(tli);
        if (t) t.classList.add("active");
        setTimeout(() => { if (t) t.classList.remove("active"); }, 8 * TICK);
        control(li).click();
        return;
      }
    }
  }

  /* ---- Pop-up menus (<select>) ------------------------------------------ */
  // The open menu lies over the button with the current item on the button's
  // row. Where the browser draws it (appearance: base-select) clio.js only
  // lines it up; elsewhere it draws the era's .menu itself and tracks it like
  // the menu bar's. Touch keeps the system's picker.
  const POPUP = "select:not([multiple]):not([size]), select[size='1']";
  const baseSelect = !!(window.CSS && CSS.supports && CSS.supports("appearance", "base-select"));
  const rowOf = (el) => px(getComputedStyle(el).getPropertyValue("--clio-menu-item-height")) || 16;
  const borderTop = (el) => px(getComputedStyle(el).getPropertyValue("--clio-menu-border-top-width")) || 1;
  const blink = (li, done) => {
    if (reduced()) return done();
    let n = 0;
    const step = () => { li.toggleAttribute(BLINK, n % 2 === 0); if (++n === 7) { li.removeAttribute(BLINK); return done(); } setTimeout(step, 3 * TICK); };
    step();
  };
  const alignPicker = (sel) => {
    const h = rowOf(sel), r = sel.getBoundingClientRect();
    sel.style.setProperty("--clio-picker-shift", `${Math.round((r.height - h) / 2) - borderTop(sel) - Math.max(0, sel.selectedIndex) * h}px`);
  };
  let popup = null;   // { sel, menu, mode, hot, opened }

  function openPopup(sel) {
    const r = sel.getBoundingClientRect(), h = rowOf(sel);
    const menu = document.createElement("ul");
    menu.className = "menu clio-popup-menu";
    menu.setAttribute("role", "menu");
    for (const o of sel.options) {
      const li = document.createElement("li");
      li.textContent = o.label || o.text;
      li.dataset.index = o.index;
      if (o.disabled || (o.parentElement && o.parentElement.disabled)) li.classList.add("disabled");
      if (o.selected) li.classList.add("checked");
      menu.appendChild(li);
    }
    const host = sel.closest("[data-era]") || document.body;
    Object.assign(menu.style, { position: "fixed", left: `${Math.round(r.left)}px`, top: `${Math.round(r.top + (r.height - h) / 2) - borderTop(sel) - Math.max(0, sel.selectedIndex) * h}px`, minWidth: `${Math.round(r.width)}px`, zIndex: "2147483000" });
    host.appendChild(menu);
    // keep it on screen, as the Menu Manager does
    const m = menu.getBoundingClientRect();
    if (m.top < 0) menu.style.top = "0px";
    else if (m.bottom > innerHeight) menu.style.top = `${Math.max(0, innerHeight - m.height)}px`;
    popup = { sel, menu, mode: "press", hot: null, opened: performance.now(), moved: false, x: 0, y: 0 };
  }
  function closePopup() { if (popup) { popup.menu.remove(); popup = null; } }
  function lightPopup(li) {
    if (!popup || popup.hot === li) return;
    if (popup.hot) popup.hot.classList.remove("active");
    popup.hot = li && !li.classList.contains("disabled") ? li : null;
    if (popup.hot) popup.hot.classList.add("active");
  }
  function choosePopup(li) {
    const { sel } = popup; popup.mode = "blink";
    blink(li, () => {
      closePopup();
      const i = +li.dataset.index;
      if (sel.selectedIndex !== i) {
        sel.selectedIndex = i;
        sel.dispatchEvent(new Event("input", { bubbles: true }));
        sel.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  }

  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    if (popup) {
      const li = e.target.closest(".clio-popup-menu > li");
      e.preventDefault();
      if (li && popup.menu.contains(li) && popup.mode === "sticky") { popup.mode = "press"; popup.moved = true; lightPopup(li); return; }
      if (popup.mode !== "blink") closePopup();
      return;
    }
    const sel = e.target.closest(POPUP);
    if (!sel || sel.disabled || optedOut(sel)) return;
    if (baseSelect) { alignPicker(sel); return; }
    if (e.pointerType === "touch") return;
    e.preventDefault();
    sel.focus({ preventScroll: true });
    openPopup(sel);
    popup.x = e.clientX; popup.y = e.clientY;
  }, true);
  document.addEventListener("keydown", (e) => {
    const f = document.activeElement;
    if (baseSelect && f instanceof Element && f.matches(POPUP)) alignPicker(f);
    if (popup && e.key === "Escape") { e.preventDefault(); closePopup(); }
  }, true);
  document.addEventListener("pointermove", (e) => {
    if (!popup || popup.mode === "blink") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el && el.closest(".clio-popup-menu > li");
    if (Math.abs(e.clientX - popup.x) + Math.abs(e.clientY - popup.y) > 3) popup.moved = true;
    lightPopup(li && popup.menu.contains(li) ? li : null);
  }, true);
  document.addEventListener("pointerup", (e) => {
    if (!popup || popup.mode !== "press") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el && el.closest(".clio-popup-menu > li");
    const click = !popup.moved;   // a click, not a drag: the item under the pointer is just the current one
    if (li && popup.menu.contains(li) && !li.classList.contains("disabled") && !click) return choosePopup(li);
    if ((el && el.closest(POPUP) === popup.sel) || (li && click)) {
      if (sticky(popup.sel)) { popup.mode = "sticky"; return; }
    }
    closePopup();
  }, true);
  addEventListener("blur", closePopup);
  addEventListener("resize", closePopup);

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

  const claimBars = (root) => { for (const b of (root.querySelectorAll ? root.querySelectorAll(BAR) : [])) if (!optedOut(b)) b.setAttribute("data-clio-menus", ""); if (root instanceof Element && root.matches(BAR) && !optedOut(root)) root.setAttribute("data-clio-menus", ""); };
  function start() {
    scrollbars(document);
    claimBars(document);   // clio.js opens these menus; focus alone no longer does
    new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) if (n instanceof Element && !n.classList.contains("clio-sb-anchor") && !n.closest(".clio-sb-anchor")) { scrollbars(n); claimBars(n); }
    }).observe(document.documentElement, { childList: true, subtree: true });
    // An era or Smart Scrolling switched anywhere: the bars' sizes come from the era.
    new MutationObserver(() => { for (const b of live) if (b.host.isConnected) b.schedule(); })
      .observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-era", "data-clio-scrolling"] });
  }

  /* ---- Windows: dragged outline, zoom rects, collapse -------------------- */
  // Dragging a title bar moves a grey outline (QuickDraw's DragGrayRgn: 1px in
  // System 7.5.3, a 2px band in Mac OS 9.0, both measured) and the window
  // follows when the button comes up. Only windows positioned absolute or
  // fixed, or marked data-clio-drag, move.
  const outlineBox = (r, width) => {
    const d = document.createElement("div");
    d.className = "clio-outline";
    d.setAttribute("aria-hidden", "true");
    Object.assign(d.style, { left: `${Math.round(r.left)}px`, top: `${Math.round(r.top)}px`, width: `${Math.round(r.width)}px`, height: `${Math.round(r.height)}px`, padding: `${width}px` });
    return d;
  };
  const outlineWidth = (el) => px(getComputedStyle(el).getPropertyValue("--clio-drag-outline-width")) || 1;
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const bar = e.target.closest(".window > .title-bar");
    if (!bar || e.target.closest("button, a, input, select, .close, .close-box, .resize, .resize-box, .zoom, .shade, .shade-box, .collapse") || optedOut(bar)) return;
    const win = bar.parentElement, cs = getComputedStyle(win);
    if (!(cs.position === "absolute" || cs.position === "fixed" || win.hasAttribute("data-clio-drag"))) return;
    e.preventDefault();
    const r = win.getBoundingClientRect(), o = outlineBox(r, outlineWidth(win));
    (win.closest("[data-era]") || document.body).appendChild(o);
    const x0 = e.clientX, y0 = e.clientY; let dx = 0, dy = 0;
    const move = (ev) => { if (ev.pointerId !== e.pointerId) return; dx = ev.clientX - x0; dy = ev.clientY - y0; o.style.transform = `translate(${dx}px, ${dy}px)`; };
    const up = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      document.removeEventListener("pointermove", move, true); document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true);
      o.remove();
      if (ev.type === "pointercancel" || (!dx && !dy)) return;
      const left = px(cs.left), top = px(cs.top);
      win.style.left = `${Math.round(left + dx)}px`; win.style.top = `${Math.round(top + dy)}px`;
      win.dispatchEvent(new CustomEvent("clio:move", { bubbles: true, detail: { dx, dy } }));
    };
    document.addEventListener("pointermove", move, true); document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
  });

  // Zoom rects (the Finder opening a folder, System 7.5.3, measured frame by
  // frame): 8 outlines, one per tick, each edge eased by 1.6^k, the last four
  // on screen at once. clio.zoomRects(from, to) with elements or rects;
  // { closing: true } runs it backwards. Opacity only; none under reduced motion.
  function zoomRects(from, to, opts = {}) {
    const rect = (x) => (x instanceof Element ? x.getBoundingClientRect() : x);
    const a = rect(from), b = rect(to);
    if (!a || !b || reduced()) return Promise.resolve();
    const N = 8, Q = 1.6, host = (to instanceof Element && to.closest("[data-era]")) || document.body;
    const boxes = [];
    for (let k = 1; k <= N; k++) {
      const p = (Q ** k - 1) / (Q ** N - 1), l = (u, v) => u + (v - u) * p;
      const o = outlineBox({ left: l(a.left, b.left), top: l(a.top, b.top), width: l(a.width, b.width), height: l(a.height, b.height) }, 1);
      o.style.opacity = "0";
      host.appendChild(o); boxes.push(o);
    }
    if (opts.closing) boxes.reverse();
    return new Promise((done) => {
      let t = 0;
      const step = () => {
        boxes.forEach((o, i) => { o.style.opacity = i <= t && i > t - 4 ? "1" : "0"; });
        if (++t < N + 3) setTimeout(step, TICK); else { boxes.forEach((o) => o.remove()); done(); }
      };
      step();
    });
  }

  // The collapse box (WindowShade) folds a window to its title bar; with
  // data-clio-shade="dblclick" on the window or an ancestor a double click on
  // the title bar does too (Appearance > Options; off by default in Mac OS 9.0).
  function collapse(win, on = !win.classList.contains("collapsed")) {
    win.classList.toggle("collapsed", on);
    const box = win.querySelector(":scope > .title-bar > :is(.shade, .shade-box, .collapse)");
    if (box) box.setAttribute("aria-expanded", String(!on));
    play(on ? "collapse" : "expand");
    win.dispatchEvent(new CustomEvent("clio:collapse", { bubbles: true, detail: { collapsed: on } }));
  }
  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Element)) return;
    const box = e.target.closest(".window > .title-bar > :is(.shade, .shade-box, .collapse)");
    if (box && !optedOut(box) && !e.defaultPrevented) collapse(box.closest(".window"));
  });
  document.addEventListener("dblclick", (e) => {
    if (!(e.target instanceof Element)) return;
    const bar = e.target.closest(".window > .title-bar");
    if (!bar || e.target.closest("button") || optedOut(bar)) return;
    const opt = bar.closest("[data-clio-shade]");
    if (opt && /\bdblclick\b/.test(opt.getAttribute("data-clio-shade"))) collapse(bar.parentElement);
  });

  /* ---- Sounds ------------------------------------------------------------- */
  // None ship (the Mac's are Apple's recordings). Give clio.sounds a URL per
  // name and put data-clio-sounds on <html>: "alert" plays when an alert box
  // appears, "menu" when a menu item is chosen, "collapse" and "expand" with
  // the collapse box. clio.play(name) plays one yourself.
  const sounds = {};
  function play(name) {
    const url = sounds[name];
    if (!url || !document.documentElement.hasAttribute("data-clio-sounds")) return;
    try { const a = new Audio(url); a.play().catch(() => {}); } catch {}
  }
  const ALERT = ".alert-box, [role=alertdialog]";
  const visible = (el) => el.isConnected && el.getClientRects().length > 0;
  new MutationObserver((records) => {
    if (!document.documentElement.hasAttribute("data-clio-sounds")) return;
    for (const r of records) {
      const els = r.type === "attributes" ? [r.target] : [...r.addedNodes].filter((n) => n instanceof Element);
      for (const el of els) if ((el.matches(ALERT) || el.querySelector(ALERT)) && visible(el.matches(ALERT) ? el : el.querySelector(ALERT))) return play("alert");
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "hidden"] });

  window.clio = {
    version: "0.11.0-dev",
    zoomRects,
    collapse,
    sounds,
    play,
    scrollbars,
    unscroll(el) { const b = hosts.get(el); if (b) { b.destroy(); hosts.delete(el); live.delete(b); } },
    refresh(el) { const b = hosts.get(el); if (b) b.layout(); },
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
