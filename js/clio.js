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
 *   - the era's insertion point in text fields (XOR, measured blink)
 *   - optional Appearance sound sets and alert sounds you supply (clio.sounds.use)
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
    // the Appearance sounds: press, exit and enter while held, release inside
    controlSound(el, "p");
    const move = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      const off = !inside(ev);
      if (off !== el.hasAttribute(OFF)) controlSound(el, off ? "x" : "e");
      el.toggleAttribute(OFF, off);
    };
    const end = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      if (ev.type === "pointerup" && inside(ev)) controlSound(el, "r");
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
    controlSound(button, "p");
    setTimeout(() => { if (!had) button.classList.remove("active"); controlSound(button, "r"); button.click(); }, 8 * TICK);
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
  // lights. Leaving the item towards the submenu keeps it as the Menu Manager
  // did (System 6, 7 and Mac OS 9 ROMs: MenuDelay 8 ticks, MenuDrag 60 ticks).
  const BAR = ".menu-bar, [role=menubar], [role=menu-bar]";
  const MENU = ".menu, [role=menu]";
  const TITLE = ":scope > li > :is(button, a, span)";
  const BLINK = "data-clio-blink";
  const SUBMENU_DELAY = 9 * TICK;
  const DRAG_HOLD = 60 * TICK;   // MenuDrag: counted from leaving the item, never extended
  const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sticky = (el) => getComputedStyle(el).getPropertyValue("--clio-menu-sticky").trim() === "1";
  const usable = (li) => li && li.matches(`:is(${MENU}) > li`) && !li.matches(".disabled, [aria-disabled=true], .separator, [role=separator], .scroll-up, .scroll-down") && !li.querySelector(":scope > :is(a, button):is(:disabled, [aria-disabled=true])");
  const submenuOf = (li) => li && li.querySelector(`:scope > :is(${MENU})`);
  const control = (li) => li.querySelector(":scope > :is(a, button)") || li;

  let track = null;   // { bar, title, li, mode: "press" | "sticky", hot, timer, hold }

  function titleOf(li) { return li.querySelector(":scope > :is(button, a, span)"); }
  function openTitle(bar, li) {
    for (const other of bar.querySelectorAll(":scope > li.open")) if (other !== li) closeTitle(other);
    if (!li.classList.contains("open") && menuOf(li)) play("mnuo", li);
    li.classList.add("open");
    const t = titleOf(li); if (t && t.hasAttribute("aria-expanded")) t.setAttribute("aria-expanded", "true");
  }
  function closeTitle(li) {
    if (li.classList.contains("open") && menuOf(li) && !(track && track.mode === "blink")) play("mnuc", li);
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
    play("mnui", li);
    if (submenuOf(li)) track.timer = setTimeout(() => { li.classList.add("open"); }, SUBMENU_DELAY);
  }
  function closeSub(li) { li.classList.remove("open", "active"); for (const x of li.querySelectorAll("li.open, li.active")) x.classList.remove("open", "active"); }
  // Leaving an open parent item keeps its submenu while the pointer stays inside
  // the wedge from the last point in the item (the anchor) to the submenu's two
  // near corners, angles compared in whole degrees as AngleFromSlope gave them,
  // and never moves back away from the submenu.
  const degrees = (dx, dy) => Math.round(Math.atan2(Math.abs(dx), -dy) * 180 / Math.PI);
  function inWedge(parent, anchor, to) {
    const sub = submenuOf(parent); if (!sub || !parent.classList.contains("open")) return false;
    const r = sub.getBoundingClientRect();
    const right = r.left >= anchor.x, edge = right ? r.left : r.right;
    if (right ? to.x < anchor.x : to.x > anchor.x) return false;
    const a = degrees(to.x - anchor.x, to.y - anchor.y);
    return a >= degrees(edge - anchor.x, r.top - anchor.y) && a <= degrees(edge - anchor.x, r.bottom - anchor.y);
  }
  function itemAt(x, y) {
    const el = document.elementFromPoint(x, y);
    return el ? el.closest(`:is(${MENU}) > li`) : null;
  }
  function choose(li, after) {
    const done = () => {
      li.removeAttribute(BLINK); const c = control(li); c.removeAttribute(BLINK);
      closeAll();
      if (after) after();
      play("menu");      // the 0.11 name
      c.click();
    };
    track.mode = "blink";
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
    const li = el && el.closest(`:is(${MENU}) > li`);
    if (li && track.bar.contains(li) && usable(li) && !submenuOf(li)) {
      // the press and release were both on the item (a click-opened menu, or a tap): the
      // browser's own click follows and must not run the item a second time
      document.addEventListener("click", (c) => { if (c.isTrusted && c.target instanceof Node && li.contains(c.target)) { c.preventDefault(); c.stopPropagation(); } }, { capture: true, once: true });
      e.preventDefault(); choose(li); return;
    }
    const tli = el && el.closest(`:is(${BAR}) > li`);
    if (tli === track.li && track.fresh && !el.closest(MENU) && sticky(track.bar)) { track.mode = "sticky"; return; }   // Mac OS 8: a click leaves the menu open
    closeAll();
  }, true);

  // A click that ends a menu gesture must not reach the page.
  document.addEventListener("click", (e) => {
    if (e.isTrusted && e.target instanceof Element && e.target.closest(`:is(${BAR}) > li > :is(button, a, span)`) && !optedOut(e.target)) e.preventDefault();
  }, true);

  // Keyboard, as an application menu bar (WAI-ARIA APG): the bar is one Tab
  // stop (roving tabindex), focusing a title previews its menu, Left and Right
  // move between titles, Down/Return/Space/Home/End enter a menu, Up/Down/
  // Home/End move inside it, Right and Left open and close submenus or move
  // to the next title, Esc closes one level, Tab leaves and closes all. (Mac OS
  // 8 and 9 had no keyboard menus; this is the web's.) Command-key
  // equivalents (<kbd>⌘N</kbd>) work on menu bars marked data-clio-shortcuts.
  const items = (menu) => [...menu.children].filter(usable);
  const focusItem = (li) => { const c = control(li); if (c === li && !li.hasAttribute("tabindex")) li.tabIndex = -1; c.focus(); if (track) light(li); };
  const titlesOf = (bar) => [...bar.children].filter((li) => titleOf(li));
  const menuOf = (tli) => tli.querySelector(`:scope > :is(${MENU})`);
  let quiet = false;   // focus coming back to a title from its own menu: no preview
  function rove(bar, tli) { for (const li of titlesOf(bar)) { const t = titleOf(li); t.tabIndex = li === tli ? 0 : -1; } }
  function toTitle(bar, tli, opts = {}) {
    if (track) closeAll();
    rove(bar, tli);
    quiet = !!opts.quiet;
    const t = titleOf(tli); if (t) t.focus({ preventScroll: true });
    quiet = false;
  }
  function enter(bar, tli, last) {
    if (!track || track.li !== tli) { closeAll(); track = { bar, li: tli, mode: "sticky", hot: null, last: { x: 0, y: 0 } }; }
    openTitle(bar, tli);
    const m = menuOf(tli), list = m ? items(m) : [];
    if (list.length) focusItem(list[last ? list.length - 1 : 0]);
  }
  document.addEventListener("focusin", (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const tli = t && t.matches(`:is(${BAR}) > li > :is(button, a, span)`) ? t.parentElement : null;
    if (!tli || optedOut(tli) || quiet || (e.relatedTarget instanceof Node && tli.contains(e.relatedTarget))) return;
    if (track && track.mode !== "preview") return;   // a pointer gesture is under way
    const bar = tli.parentElement;
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
    const tli = f.closest(`:is(${BAR}) > li`);
    if (!tli || optedOut(tli)) return;
    const bar = tli.parentElement, titles = titlesOf(bar);
    const inMenu = f.closest(`:is(${MENU}) > li`);
    const go = (fn) => { e.preventDefault(); e.stopPropagation(); fn(); };
    const next = (d) => titles[(titles.indexOf(tli) + d + titles.length) % titles.length];
    if (!inMenu) {
      if (["ArrowDown", "Enter", " ", "Home"].includes(e.key)) return go(() => enter(bar, tli, false));
      if (e.key === "End" || e.key === "ArrowUp") return go(() => enter(bar, tli, true));
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") return go(() => toTitle(bar, next(e.key === "ArrowRight" ? 1 : -1)));
      if (e.key === "Escape" && track) return go(() => toTitle(bar, tli, { quiet: true }));
      return;
    }
    if (!track) track = { bar, li: tli, mode: "sticky", hot: null, last: { x: 0, y: 0 } };
    track.mode = track.mode === "preview" ? "sticky" : track.mode;
    const menu = inMenu.parentElement, list = items(menu), i = list.indexOf(inMenu);
    const parentItem = menu.parentElement.closest(`:is(${MENU}) > li`);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") return go(() => focusItem(list[(i + (e.key === "ArrowDown" ? 1 : list.length - 1)) % list.length]));
    if (e.key === "Home" || e.key === "End") return go(() => focusItem(list[e.key === "Home" ? 0 : list.length - 1]));
    if (e.key === "ArrowRight" && submenuOf(inMenu)) return go(() => { inMenu.classList.add("open"); const s = items(submenuOf(inMenu)); if (s[0]) focusItem(s[0]); });
    if (e.key === "ArrowRight") return go(() => toTitle(bar, next(1)));
    if ((e.key === "ArrowLeft" || e.key === "Escape") && parentItem) return go(() => { closeSub(parentItem); focusItem(parentItem); });
    if (e.key === "ArrowLeft") return go(() => toTitle(bar, next(-1)));
    if (e.key === "Escape") return go(() => toTitle(bar, tli, { quiet: true }));
    if ((e.key === "Enter" || e.key === " ") && usable(inMenu) && !submenuOf(inMenu)) return go(() => choose(inMenu, () => toTitle(bar, tli, { quiet: true })));
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
  const baseSelect = !!(window.CSS && CSS.supports && CSS.supports("appearance", "base-select")) && matchMedia("(pointer: fine)").matches;   // as the stylesheet: touch keeps the system picker
  // Drawing Board's menus need their pencil shade and corner pixels, which the
  // browser's picker cannot carry: with clio.js there, the stylesheet hands those
  // pop-ups back (data-clio-popups) and clio.js draws them as it does elsewhere.
  if (baseSelect) document.documentElement.setAttribute("data-clio-popups", "");
  const drawn = (sel) => baseSelect && getComputedStyle(sel).appearance === "base-select";
  const rowOf = (el) => px(getComputedStyle(el).getPropertyValue("--clio-menu-item-height")) || 16;
  const borderTop = (el) => px(getComputedStyle(el).getPropertyValue("--clio-menu-border-top-width")) || 1;
  const blink = (li, done) => {
    if (reduced()) return done();
    let n = 0;
    const step = () => { li.toggleAttribute(BLINK, n % 2 === 0); if (++n === 7) { li.removeAttribute(BLINK); return done(); } setTimeout(step, 3 * TICK); };
    step();
  };
  const alignPicker = (sel) => {
    const h = rowOf(sel), r = sel.getBoundingClientRect(), atTop = getComputedStyle(sel).getPropertyValue("--clio-popup-menu-align").trim() === "top";
    sel.style.setProperty("--clio-picker-shift", `${(atTop ? 0 : Math.round((r.height - h) / 2) - borderTop(sel)) - Math.max(0, sel.selectedIndex) * h}px`);
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
      // The menu hangs off the era's root, outside the select: carry each option's language
      // so :lang() gives a Chinese, Japanese or Korean item its font (96-cjk.css).
      const lang = o.closest("[lang]");
      if (lang) li.lang = lang.lang;
      li.dataset.index = o.index;
      if (o.disabled || (o.parentElement && o.parentElement.disabled)) li.classList.add("disabled");
      if (o.selected) li.classList.add("checked");
      menu.appendChild(li);
    }
    const host = sel.closest("[data-era]") || document.body;
    // Per era: the current item on the button's row (centred), or, Mac OS 9.0, the menu's
    // top on the button's with the current item there; as wide as the button less
    // --clio-popup-menu-trim (Mac OS 9.0: the arrows stay in sight).
    const cs = getComputedStyle(sel), trim = px(cs.getPropertyValue("--clio-popup-menu-trim")), atTop = cs.getPropertyValue("--clio-popup-menu-align").trim() === "top";
    const row = atTop ? Math.round(r.top) : Math.round(r.top + (r.height - h) / 2) - borderTop(sel);
    Object.assign(menu.style, { position: "fixed", left: `${Math.round(r.left)}px`, top: `${row - Math.max(0, sel.selectedIndex) * h}px`, minWidth: `${Math.round(r.width) - trim}px`, zIndex: "2147483000" });
    const phase = cs.getPropertyValue("--clio-db-phase").trim();   // the pens keep the button's place along them
    if (phase) menu.style.setProperty("--clio-db-phase", phase);
    host.appendChild(menu);
    sel.classList.add("clio-open");   // the button draws its arrows pressed while the menu is open
    play("popp", sel);
    // keep it on screen, as the Menu Manager does
    const m = menu.getBoundingClientRect();
    if (m.top < 0) menu.style.top = "0px";
    else if (m.bottom > innerHeight) menu.style.top = `${Math.max(0, innerHeight - m.height)}px`;
    popup = { sel, menu, mode: "press", hot: null, opened: performance.now(), moved: false, x: 0, y: 0 };
  }
  function closePopup() { if (popup) { popup.menu.remove(); popup.sel.classList.remove("clio-open"); popup = null; } }
  function lightPopup(li) {
    if (!popup || popup.hot === li) return;
    if (popup.hot) popup.hot.classList.remove("active");
    popup.hot = li && !li.classList.contains("disabled") ? li : null;
    if (popup.hot) { popup.hot.classList.add("active"); play("mnui", popup.sel); }
  }
  function choosePopup(li) {
    const { sel } = popup; popup.mode = "blink";
    play("mnus", sel);
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
    if (drawn(sel)) { alignPicker(sel); return; }
    if (e.pointerType === "touch") return;
    e.preventDefault();
    sel.focus({ preventScroll: true });
    openPopup(sel);
    popup.x = e.clientX; popup.y = e.clientY;
  }, true);
  document.addEventListener("keydown", (e) => {
    const f = document.activeElement;
    if (f instanceof Element && f.matches(POPUP) && drawn(f)) alignPicker(f);
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
    play("popr", popup.sel);
    closePopup();
  }, true);
  addEventListener("blur", closePopup);
  addEventListener("resize", closePopup);

  /* ---- Scroll bars -------------------------------------------------------- */
  const HOSTS = ".window-pane, div.listbox, div[role=listbox], ul[role=listbox], .clio-scroll";
  const LINE = 16;            // one step of an arrow: one row of the Finder's list (System 6.0.8)
  // A held arrow or lane steps at once, then after --clio-scrollbar-repeat-delay
  // (0 in System 6 and 7, whose TrackControl had none; 0.2 s in Mac OS 9's Finder).
  // The Mac then stepped as fast as the application could scroll: no fixed rate
  // existed, so this one is chosen.
  const REPEAT_EVERY = 50;
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
      const h = this.host, cs = getComputedStyle(h); let r;
      return {
        cw: h.clientWidth, ch: h.clientHeight, sw: h.scrollWidth, sh: h.scrollHeight, sl: h.scrollLeft, st: h.scrollTop,
        size: px(cs.getPropertyValue("--clio-scrollbar-size")) || 15,
        len: px(cs.getPropertyValue("--clio-scrollbar-thumb-length")) || 16,
        live: cs.getPropertyValue("--clio-scrollbar-thumb-tracking").trim() === "live",
        delay: parseFloat(cs.getPropertyValue("--clio-scrollbar-repeat-delay")) || 0,
        smart: !!h.closest('[data-clio-scrolling="smart"]'),
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
      // The lane's origin on the page (its line is the track's first pixel), as a pattern offset.
      const mod = (v, n) => ((Math.round(-v) % n) + n) % n;
      const tx = this.m.ox + this.pad.l + x + (vertical ? 1 : size), ty = this.m.oy + this.pad.t + y + (vertical ? size : 1);
      s.setProperty("--clio-sb-px", `${mod(tx, 8)}px`); s.setProperty("--clio-sb-py", `${mod(ty, 8)}px`);
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
        timer = setTimeout(function again() { if (test()) fn(); timer = setTimeout(again, REPEAT_EVERY); }, m.delay || REPEAT_EVERY);
      };

      if (target === p.dec || target === p.inc) {
        const button = target, sign = button === p.dec ? -1 : 1;
        let over = true;
        button.classList.add("clio-held");
        const inButton = (ev) => { const b = button.getBoundingClientRect(); return ev.clientX >= b.left && ev.clientX < b.right && ev.clientY >= b.top && ev.clientY < b.bottom; };
        play("sbap", this.host);
        let held = 0;   // the arrow held: its drag loop, after the first repeat
        p.onmove = (ev) => { const now = inButton(ev); if (now !== over) play(now ? "sbae" : "sbax", this.host); over = now; button.classList.toggle("clio-held", over); };
        repeat(() => { this.scrollBy(p, sign * LINE); if (++held === 2) beginDrag(sign > 0 ? "sbai" : "sbad", this.host); }, () => over);
        stop = (ev) => { button.classList.remove("clio-held"); if (held > 1) endDrag(true); if (over && ev.type === "pointerup") play("sbar", this.host); };
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
        p.onmove = (ev) => {
          dragMove();
          at = Math.max(0, Math.min(p.range, Math.round(along(ev) - trackStart - grab)));
          if (live) { this.scrollToThumb(p, at); p.thumb.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`; return; }
          const shift = `${-at}px`;
          p.ghost.style.transform = vertical ? `translateY(${at}px)` : `translateX(${at}px)`;
          p.ghost.style.setProperty(vertical ? "--clio-sb-gy" : "--clio-sb-gx", shift);
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
        p.onmove = (ev) => { point = along(ev); };
        const beyond = () => { const a = trackStart + p.at; return point < a ? -1 : point >= a + p.thumbLength ? 1 : 0; };
        play("sbtp", this.host);
        let reached = false;   // the box reaching the pointer: the end of the track's paging
        repeat(() => { const d = beyond(); if (d) { this.scrollBy(p, d * page); reached = false; } else if (!reached) { reached = true; play("sbte", this.host); } }, () => !!beyond() || !reached);
      }

      const up = (ev) => {
        if (ev.pointerId !== e.pointerId) return;
        clearTimeout(timer);
        p.bar.removeEventListener("pointermove", move);
        p.bar.removeEventListener("pointerup", up);
        p.bar.removeEventListener("pointercancel", up);
        p.onmove = null;
        if (stop) stop(ev);
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

  const claimBar = (b) => {
    if (optedOut(b) || b.hasAttribute("data-clio-menus")) return;
    b.setAttribute("data-clio-menus", "");
    const ts = titlesOf(b), cur = ts.find((li) => titleOf(li).tabIndex === 0 && titleOf(li).hasAttribute("tabindex")) || ts[0];
    if (cur) rove(b, cur);   // one Tab stop for the whole bar
    for (const c of b.querySelectorAll(`:is(${MENU}) > li > :is(a, button)`)) if (!c.hasAttribute("tabindex")) c.tabIndex = -1;   // items are reached with the arrows
  };
  const claimBars = (root) => { for (const b of (root.querySelectorAll ? root.querySelectorAll(BAR) : [])) claimBar(b); if (root instanceof Element && root.matches(BAR)) claimBar(root); };
  function start() {
    liveRegion = document.createElement("div");
    liveRegion.className = "clio-live"; liveRegion.setAttribute("aria-live", "polite");
    document.body.appendChild(liveRegion);
    claimWindows(document);
    scrollbars(document);
    claimBars(document);   // clio.js opens these menus; focus alone no longer does
    queueCentre();
    new MutationObserver((records) => {
      for (const r of records) for (const n of r.addedNodes) if (n instanceof Element && !n.classList.contains("clio-sb-anchor") && !n.closest(".clio-sb-anchor")) { scrollbars(n); claimBars(n); if (!n.classList.contains("clio-move-menu") && !n.classList.contains("clio-outline") && !n.classList.contains("clio-live")) claimWindows(n); }
    }).observe(document.documentElement, { childList: true, subtree: true });
    // An era or Smart Scrolling switched anywhere: the bars' sizes come from the era.
    new MutationObserver(() => { queueCentre(); for (const b of live) if (b.host.isConnected) b.schedule(); })
      .observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ["data-era", "data-clio-scrolling"] });
  }

  /* ---- Windows: dragged outline, zoom rects, collapse -------------------- */
  // Dragging a title bar moves a grey outline (QuickDraw's DragGrayRgn: 1px in
  // System 7.5.3, a 2px band in Mac OS 9.0, both measured) and the window
  // follows when the button comes up. Only windows positioned absolute or
  // fixed, or marked data-clio-drag, move.
  const outlineBox = (r, width, margin = 0) => {
    const d = document.createElement("div");
    d.className = "clio-outline";
    d.setAttribute("aria-hidden", "true");
    Object.assign(d.style, { left: `${Math.round(r.left)}px`, top: `${Math.round(r.top)}px`, width: `${Math.round(r.width)}px`, height: `${Math.round(r.height)}px`, padding: `${width + margin}px` });
    grayPhase(d, Math.round(r.left), Math.round(r.top));
    return d;
  };
  // QuickDraw's gray kept to the screen as the outline moved: keep it to the page (a fixed
  // background would not survive the transform that moves the outline).
  const grayPhase = (d, x, y) => { d.style.backgroundPosition = `${Math.round(x + y + scrollX + scrollY) & 1}px 0`; };
  const outlineWidth = (el) => px(getComputedStyle(el).getPropertyValue("--clio-drag-outline-width")) || 1;
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const bar = e.target.closest(".window > .title-bar");
    if (!bar || e.target.closest("button, a, input, select, .close, .close-box, .resize, .resize-box, .zoom, .shade, .shade-box, .collapse") || optedOut(bar)) return;
    const win = bar.parentElement, cs = getComputedStyle(win);
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
    const move = (ev) => { if (ev.pointerId !== e.pointerId) return; dragMove(); dx = Math.round(ev.clientX - x0); dy = Math.round(ev.clientY - y0); /* a finger reports fractions */ o.style.transform = `translate(${dx}px, ${dy}px)`; grayPhase(o, Math.round(r.left) + dx, Math.round(r.top) + dy); };
    const up = (ev) => {
      if (ev.pointerId !== e.pointerId) return;
      document.removeEventListener("pointermove", move, true); document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true);
      endDrag(ev.type === "pointercancel");
      o.remove();
      if (ev.type === "pointercancel" || (!dx && !dy)) return;
      moveBy(win, dx, dy);
    };
    document.addEventListener("pointermove", move, true); document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
  });

  // One way to move, for the pointer, the keyboard and the move menu: kept
  // inside the viewport (fixed) or the window's container (absolute).
  function moveBy(win, dx, dy, say) {
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
  const windowName = (win) => { const t = win.querySelector(":scope > .title-bar :is(.title, h1, h2, h3)"); return (t && t.textContent.trim()) || "Window"; };
  // A polite live region, there from the start so screen readers register it.
  let liveRegion = null;
  function announce(text) {
    if (!liveRegion) return;
    liveRegion.textContent = text;
    clearTimeout(announce.t); announce.t = setTimeout(() => { liveRegion.textContent = ""; }, 1000);
  }
  // The keyboard and single-pointer way: a move button at the start of each
  // movable window's title bar, out of sight until it has keyboard focus.
  // Arrow keys move the window 16px (Shift: 1px); Return, Space, a click or a
  // right click on the title bar open a menu of moves.
  const STEP = 16;
  const MOVES = [["Move left", -1, 0, "moved left"], ["Move right", 1, 0, "moved right"], ["Move up", 0, -1, "moved up"], ["Move down", 0, 1, "moved down"]];
  function handleFor(win) {
    const bar = win.querySelector(":scope > .title-bar");
    if (!bar || bar.querySelector(":scope > .clio-move")) return;
    bar.classList.add("clio-drag-bar");   // a finger on it drags the window, not the page
    const b = document.createElement("button");
    b.type = "button"; b.className = "clio-move";
    b.setAttribute("aria-haspopup", "menu"); b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-label", `Move ${windowName(win)}. Arrow keys move it.`);
    bar.prepend(b);
  }
  const movable = (win) => { const p = getComputedStyle(win).position; return p === "absolute" || p === "fixed" || win.hasAttribute("data-clio-drag"); };
  function claimWindows(root) {
    const list = root instanceof Element && root.matches(".window") ? [root] : [];
    if (root.querySelectorAll) list.push(...root.querySelectorAll(".window"));
    for (const w of list) if (!optedOut(w) && movable(w)) handleFor(w);
  }
  let moveMenu = null;
  function closeMoveMenu(refocus) {
    if (!moveMenu) return;
    const { menu, handle } = moveMenu; moveMenu = null;
    menu.remove(); handle.setAttribute("aria-expanded", "false");
    if (refocus) handle.focus({ preventScroll: true });
  }
  function openMoveMenu(win, at) {
    closeMoveMenu(false);
    const handle = win.querySelector(":scope > .title-bar > .clio-move");
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
    menu.querySelector("button").focus({ preventScroll: true });
    menu.addEventListener("keydown", (e) => {
      const bs = [...menu.querySelectorAll("button")], i = bs.indexOf(document.activeElement);
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); bs[(i + (e.key === "ArrowDown" ? 1 : bs.length - 1)) % bs.length].focus(); }
      else if (e.key === "Home" || e.key === "End") { e.preventDefault(); bs[e.key === "Home" ? 0 : bs.length - 1].focus(); }
      else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); closeMoveMenu(true); }
      else if (e.key === "Tab") closeMoveMenu(false);
    });
    menu.addEventListener("focusout", (e) => { if (!(e.relatedTarget instanceof Node && menu.contains(e.relatedTarget))) setTimeout(() => { if (moveMenu && !moveMenu.menu.contains(document.activeElement)) closeMoveMenu(false); }); });
  }
  document.addEventListener("keydown", (e) => {
    const h = e.target instanceof Element ? e.target.closest(".clio-move") : null;
    if (!h || e.defaultPrevented) return;
    const m = { ArrowLeft: [-1, 0, "moved left"], ArrowRight: [1, 0, "moved right"], ArrowUp: [0, -1, "moved up"], ArrowDown: [0, 1, "moved down"] }[e.key];
    if (!m) return;
    e.preventDefault();
    const step = e.shiftKey ? 1 : STEP;
    moveBy(h.closest(".window"), m[0] * step, m[1] * step, m[2]);
  });
  document.addEventListener("click", (e) => {
    const h = e.target instanceof Element ? e.target.closest(".clio-move") : null;
    if (h) { if (moveMenu && moveMenu.handle === h) closeMoveMenu(true); else openMoveMenu(h.closest(".window")); }
  });
  document.addEventListener("contextmenu", (e) => {
    const bar = e.target instanceof Element ? e.target.closest(".window > .title-bar") : null;
    if (!bar || !bar.querySelector(":scope > .clio-move") || e.target.closest("button:not(.clio-move)")) return;
    e.preventDefault();
    openMoveMenu(bar.parentElement, { left: e.clientX, top: e.clientY, height: 0 });
  });
  addEventListener("resize", () => requestAnimationFrame(() => { for (const h of document.querySelectorAll(".clio-move")) { const w = h.closest(".window"); if (w) moveBy(w, 0, 0); } }));

  // Zoom rects (the Finder opening a folder, measured frame by frame): one
  // outline per tick. System 7.5.3: 8, each edge eased by 1.6^k, the last four on
  // screen at once. Mac OS 9.0: 6 in a 2px band at 1.4^(k-7) of the way, all kept
  // until the window draws. clio.zoomRects(from, to) with elements or rects;
  // { closing: true } runs it backwards. Opacity only; none under reduced motion.
  function zoomRects(from, to, opts = {}) {
    const rect = (x) => (x instanceof Element ? x.getBoundingClientRect() : x);
    const a = rect(from), b = rect(to);
    if (!a || !b || reduced()) return Promise.resolve();
    const host = (to instanceof Element && to.closest("[data-era]")) || (from instanceof Element && from.closest("[data-era]")) || document.body;
    // Per era (tokens): N outlines, the k-th at (r^k - c) / (r^M - c) of the way, `keep` on
    // screen at once (0: all, until the last is gone), drawn with the drag outline's width.
    const cs = getComputedStyle(host), num = (n, d) => { const v = parseFloat(cs.getPropertyValue(n)); return Number.isFinite(v) ? v : d; };
    const N = num("--clio-zoom-count", 8), M = num("--clio-zoom-steps", N), Q = num("--clio-zoom-ratio", 1.6), C = num("--clio-zoom-offset", 1), keep = num("--clio-zoom-keep", 4) || Infinity;
    const boxes = [];
    for (let k = 1; k <= N; k++) {
      const p = (Q ** k - C) / (Q ** M - C), l = (u, v) => u + (v - u) * p;
      const o = outlineBox({ left: l(a.left, b.left), top: l(a.top, b.top), width: l(a.width, b.width), height: l(a.height, b.height) }, outlineWidth(host));
      o.style.setProperty("--clio-drag-outline-extra", "0px");   // a plain rectangle
      o.style.opacity = "0";
      host.appendChild(o); boxes.push(o);
    }
    if (opts.closing) boxes.reverse();
    return new Promise((done) => {
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
  function collapse(win, on = !win.classList.contains("collapsed")) {
    win.classList.toggle("collapsed", on);
    const box = win.querySelector(":scope > .title-bar > :is(.shade, .shade-box, .collapse)");
    if (box) box.setAttribute("aria-expanded", String(!on));
    play(on ? "collapse" : "expand");   // the 0.11 names
    play(on ? (isUtility(win) ? "ucol" : "wcol") : (isUtility(win) ? "uexp" : "wexp"), win);
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

  /* ---- Split bar drag ----------------------------------------------------- */
  // While a split bar is dragged, the split line's place is shown as a 3-row grey
  // band across the split view (Inside Macintosh: Windows; HIG 1992, "Splitting a
  // Window"). The application's own splitter still owns the actual split.
  (() => {
    let band = null;
    const start = (e) => {
      if (e.button !== 0 || !(e.target instanceof Element)) return;
      const bar = e.target.closest(".split-bar");
      if (!bar || optedOut(bar)) return;
      const view = bar.closest(".split-view") || bar.parentElement;
      if (!view) return;
      const r = view.getBoundingClientRect();
      band = document.createElement("div");
      band.className = "clio-split-outline";
      band.setAttribute("aria-hidden", "true");
      Object.assign(band.style, { left: `${Math.round(r.left)}px`, width: `${Math.round(r.width)}px`, top: `${Math.round(e.clientY - 1)}px` });
      document.body.appendChild(band);
      e.preventDefault();
    };
    const move = (e) => { if (band) band.style.top = `${Math.round(e.clientY - 1)}px`; };
    const end = () => { if (band) { band.remove(); band = null; } };
    document.addEventListener("pointerdown", start, true);
    window.addEventListener("pointermove", move, true);
    window.addEventListener("pointerup", end, true);
  })();

  /* ---- Centred labels ----------------------------------------------------- */
  // QuickDraw centred a label at floor(spare / 2); a browser centres at spare / 2
  // and, when the spare width is odd, puts the text on a half pixel, which each
  // engine then rounds its own way (Chromium down, WebKit blends, Firefox up).
  // Where a label's text starts on a half pixel, one more pixel at its end makes
  // the spare even: buttons take it as padding, a title as margin. Measured when
  // fonts load, on resize and when the page changes, never per frame; all reads
  // come before all writes. data-clio-centre="off" (or data-clio-js="off") leaves
  // a label alone.
  const CENTRED = "button, .btn, .btn-default, .standard-button, .bevel, [role=tab], .title-bar > :is(.title, h1, h2, h3)";
  const nudged = new Map();   // element -> the inline value it had
  const isTitle = (el) => el.matches(".title-bar > *");
  let centreQueued = false;
  function centre() {
    centreQueued = false;
    // undo, so each label is measured as the stylesheet lays it out
    for (const [el, was] of nudged) { if (isTitle(el)) el.style.marginRight = was; else el.style.paddingRight = was; }
    nudged.clear();
    const todo = [];
    for (const el of document.querySelectorAll(CENTRED)) {
      if (optedOut(el) || el.closest('[data-clio-centre="off"]') || !el.firstChild || !el.getClientRects().length) continue;
      const cs = getComputedStyle(el);
      if (cs.whiteSpace !== "nowrap" && el.getClientRects().length > 1) continue;
      const range = document.createRange(); range.selectNodeContents(el);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      const frac = (r.left + scrollX) % 1;
      if (Math.abs(frac - 0.5) < 0.26) todo.push([el, cs]);
    }
    for (const [el, cs] of todo) {
      if (isTitle(el)) { nudged.set(el, el.style.marginRight); el.style.marginRight = `${(parseFloat(cs.marginRight) || 0) + 1}px`; }
      else { nudged.set(el, el.style.paddingRight); el.style.paddingRight = `${(parseFloat(cs.paddingRight) || 0) + 1}px`; }
    }
  }
  const queueCentre = () => { if (!centreQueued) { centreQueued = true; requestAnimationFrame(centre); } };
  if (document.fonts) document.fonts.ready.then(queueCentre);
  addEventListener("resize", queueCentre);
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 3 || (n instanceof Element && !n.closest(".clio-sb-anchor, .clio-outline, .clio-popup-menu, .clio-live"))) return queueCentre();
    for (const r of records) if (r.type === "characterData") return queueCentre();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });

  /* ---- Insertion point ---------------------------------------------------- */
  // TextEdit's caret: a 1px line drawn in XOR (black on white, white on black)
  // as tall as the line, on for GetCaretTime() ticks and off as long: 32 in
  // System 6 and 7, about 48 in Mac OS 8 and 9 (--clio-caret-ticks; measured). clio.js draws it in text fields inside .window; the
  // browser's own caret comes back while text is selected or an input method is
  // composing, and the caret stays lit under reduced motion. Its place is
  // measured when the text, the selection, a scroll or the size change, never
  // per frame. data-clio-caret="off" (or data-clio-js="off") keeps the browser's.
  const FIELD = "input:is([type=text], [type=search], [type=password], [type=email], [type=url], [type=tel], [type=number], :not([type])), textarea";
  const MIRROR = ["boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontStretch", "letterSpacing", "wordSpacing", "lineHeight", "textTransform", "textIndent", "tabSize"];
  let caretEl = null, caretField = null, caretTimer = 0, composing = false, caretQueued = false;
  const caretWanted = (f) => f instanceof HTMLElement && f.matches(FIELD) && !!f.closest(".window") && !optedOut(f) && !f.closest('[data-clio-caret="off"]') && !f.readOnly && !f.disabled;
  function caretStop() {
    clearInterval(caretTimer); caretTimer = 0;
    if (caretEl) caretEl.remove();
    if (caretField) caretField.classList.remove("clio-caret-field");
    caretEl = caretField = null;
  }
  function caretUpdate() {
    caretQueued = false;
    const f = document.activeElement;
    if (!caretWanted(f) || composing || f.selectionStart == null || f.selectionStart !== f.selectionEnd) return caretStop();
    // reads: the field, and a hidden copy of it holding the text before the caret
    const cs = getComputedStyle(f), r = f.getBoundingClientRect(), area = f.tagName === "TEXTAREA";
    const m = document.createElement("div");
    for (const k of MIRROR) m.style[k] = cs[k];
    Object.assign(m.style, { position: "absolute", visibility: "hidden", left: "-9999px", top: "0", borderStyle: "solid", whiteSpace: area ? "pre-wrap" : "pre", overflowWrap: area ? "break-word" : "normal", height: "auto" });
    const text = f.type === "password" ? "•".repeat(f.value.length) : f.value;
    m.textContent = text.slice(0, f.selectionStart);
    const mark = document.createElement("span"); mark.textContent = "​"; m.appendChild(mark);
    document.body.appendChild(m);
    const mx = mark.offsetLeft, my = mark.offsetTop, glyph = mark.offsetHeight;
    m.remove();
    // the caret is a line tall, and TextEdit drew it in the pixel left of the character
    const h = px(cs.getPropertyValue("--clio-caret-height")) || Math.round(parseFloat(cs.lineHeight)) || glyph;
    const bt = parseFloat(cs.borderTopWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0;
    const y = area ? my - Math.round((h - glyph) / 2) - f.scrollTop : bt + Math.floor((r.height - bt - bb - h) / 2);
    const x = mx - 1 - f.scrollLeft;
    const inside = x >= 0 && x <= r.width && y + h > 0 && y < r.height;
    // writes
    if (!inside) { if (caretEl) caretEl.hidden = true; return; }
    if (caretField !== f) { caretStop(); caretField = f; f.classList.add("clio-caret-field"); }
    if (!caretEl) { caretEl = document.createElement("div"); caretEl.className = "clio-caret"; caretEl.setAttribute("aria-hidden", "true"); document.body.appendChild(caretEl); }
    caretEl.hidden = false;
    Object.assign(caretEl.style, { left: `${Math.round(r.left + scrollX + x)}px`, top: `${Math.round(r.top + scrollY + y)}px`, height: `${h}px` });
    // each move shows the caret and starts the blink again (TEBlink after TEKey/TEClick)
    caretEl.classList.remove("clio-caret-off");
    clearInterval(caretTimer); caretTimer = 0;
    const ticks = px(cs.getPropertyValue("--clio-caret-ticks")) || 32;
    if (!reduced()) caretTimer = setInterval(() => caretEl && caretEl.classList.toggle("clio-caret-off"), ticks * TICK);
  }
  const queueCaret = () => { if (!caretQueued) { caretQueued = true; requestAnimationFrame(caretUpdate); } };
  // (Firefox fires no selectionchange for a field's own selection: a click or a key moves it too)
  for (const t of ["focusin", "selectionchange", "input", "keyup", "pointerup", "select"]) document.addEventListener(t, queueCaret);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (caretField) queueCaret(); });
  document.addEventListener("focusout", () => requestAnimationFrame(() => { if (!caretWanted(document.activeElement)) caretStop(); }));
  document.addEventListener("compositionstart", () => { composing = true; caretStop(); });
  document.addEventListener("compositionend", () => { composing = false; queueCaret(); });
  addEventListener("scroll", () => { if (caretField) queueCaret(); }, { capture: true, passive: true });
  addEventListener("resize", () => { if (caretField) queueCaret(); });

  /* ---- Sounds ------------------------------------------------------------- */
  // The Appearance Manager's sound tracks (Mac OS 8.5-9) and each era's alert sound.
  // None ship: they are Apple's and the sets' authors'. tooling/soundset.py turns your
  // own copies into WAV files and a manifest; clio.sounds.use(url) loads one and
  // decodes every sound into Web Audio buffers up front. Nothing plays until a page
  // loads one. A sound set plays for the Appearance eras (Drawing Board, Platinum:
  // System 6 and 7 had no interface sounds, only the alert sound); an alert list plays
  // for the eras its manifest names. One-shots overlap, as PlayThemeSound's did;
  // exactly one drag loop runs at a time (BeginThemeDragSound/EndThemeDragSound).
  // data-clio-sounds="menus windows controls finder" on <html> keeps those classes
  // (Appearance > Sound's check boxes; absent: all four, "none": silent);
  // clio.sounds.muted silences the page; nothing plays while the page is hidden.
  // Every sound played is announced as a clio:sound event on the document.
  const CLASS_BITS = { windows: 1, menus: 2, controls: 4, finder: 8 };
  const APPEARANCE_ERAS = ["drawingboard", "platinum"];
  const snd = { ctx: null, out: null, sets: [], alerts: [], drag: null, muted: false, volume: 1, alert: {} };
  const legacy = {};   // clio.sounds.alert = "beep.wav": the 0.11 interface, still honoured
  const eraOf = (el) => { const h = el instanceof Element ? el.closest("[data-era]") : document.documentElement.closest("[data-era]"); return (h && h.getAttribute("data-era")) || "system6"; };
  function classesOn() {
    const v = document.documentElement.getAttribute("data-clio-sounds");
    if (v == null || !v.trim()) return 15;
    let m = 0; for (const t of v.toLowerCase().split(/\s+/)) m |= CLASS_BITS[t] || 0;
    return m;
  }
  const silent = () => snd.muted || document.hidden;
  function audio() {
    if (snd.ctx) return snd.ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    snd.ctx = new AC();
    snd.out = snd.ctx.createGain(); snd.out.gain.value = snd.volume; snd.out.connect(snd.ctx.destination);
    // A context made before any gesture starts suspended (autoplay policy): the first
    // press or key wakes it; the sounds that press makes then play.
    const wake = () => { if (snd.ctx.state === "suspended" && !document.hidden) snd.ctx.resume().catch(() => {}); };
    for (const t of ["pointerdown", "keydown", "touchend"]) document.addEventListener(t, wake, true);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) { endDrag(true); snd.ctx.suspend().catch(() => {}); } else wake();
    });
    return snd.ctx;
  }
  // WAV (PCM 8-bit unsigned or 16-bit, any channels) to an AudioBuffer at the sound's
  // own rate, read here so the 'snd ' header's exact rate (11127.27 Hz, not the WAV's
  // whole 11127) is kept and no decoder resamples on the way.
  function wavBuffer(ctx, data, rate) {
    const v = new DataView(data); let p = 12, fmt = null, at = 0, len = 0;
    while (p + 8 <= v.byteLength) {
      const id = String.fromCharCode(v.getUint8(p), v.getUint8(p + 1), v.getUint8(p + 2), v.getUint8(p + 3)), n = v.getUint32(p + 4, true);
      if (id === "fmt ") fmt = { ch: v.getUint16(p + 10, true), rate: v.getUint32(p + 12, true), bits: v.getUint16(p + 22, true) };
      else if (id === "data") { at = p + 8; len = Math.min(n, v.byteLength - at); }
      p += 8 + n + (n & 1);
    }
    if (!fmt || !len) throw new Error("not a PCM WAV");
    const step = fmt.bits / 8, frames = Math.floor(len / (step * fmt.ch));
    const buf = ctx.createBuffer(fmt.ch, Math.max(1, frames), rate || fmt.rate);
    for (let c = 0; c < fmt.ch; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < frames; i++) {
        const o = at + (i * fmt.ch + c) * step;
        d[i] = fmt.bits === 8 ? (v.getUint8(o) - 128) / 128 : v.getInt16(o, true) / 32768;
      }
    }
    return buf;
  }
  async function use(url, opts = {}) {
    const ctx = audio();
    if (!ctx) return null;
    const base = new URL(url, document.baseURI);
    const man = await (await fetch(base)).json();
    const files = new Map();
    const want = new Map();   // file -> exact rate
    const add = (r) => { if (r && r.file && man.sounds && man.sounds[r.sound]) want.set(r.file, man.sounds[r.sound].rate); };
    if (man.alerts) for (const a of Object.values(man.alerts)) want.set(a.file, a.rate);
    for (const e of Object.values(man.events || {})) add(e.play);
    for (const e of Object.values(man.loops || {})) for (const r of Object.values(e.roles || {})) add(r);
    await Promise.all([...want].map(async ([file, rate]) => {
      const res = await fetch(new URL(file, base));
      if (res.ok) files.set(file, wavBuffer(ctx, await res.arrayBuffer(), rate));
    }));
    const eras = opts.era ? [].concat(opts.era) : man.eras || (man.alerts ? null : APPEARANCE_ERAS);
    const entry = { url: String(base), man, files, eras };
    if (man.alerts) { snd.alerts = snd.alerts.filter((x) => x.url !== entry.url); snd.alerts.push(entry); if (opts.alert) for (const e of eras || []) snd.alert[e] = opts.alert; }
    else { snd.sets = snd.sets.filter((x) => x.url !== entry.url); snd.sets.push(entry); }
    return { name: man.name || man.source, sounds: files.size };
  }
  const setFor = (era) => { for (let i = snd.sets.length - 1; i >= 0; i--) { const s = snd.sets[i]; if (!s.eras || s.eras.includes("*") || s.eras.includes(era)) return s; } return null; };
  const alertsFor = (era) => { for (let i = snd.alerts.length - 1; i >= 0; i--) { const s = snd.alerts[i]; if (!s.eras || s.eras.includes("*") || s.eras.includes(era)) return s; } return null; };
  function startSound(set, ref, opts = {}) {
    const buf = ref && ref.file && set.files.get(ref.file);
    if (!buf || silent()) return null;
    const ctx = snd.ctx, src = ctx.createBufferSource(), g = ctx.createGain();
    src.buffer = buf; g.gain.value = ref.gain == null ? 1 : ref.gain;
    if (opts.loop) {
      src.loop = true;
      if (ref.loop) { src.loopStart = ref.loop[0] / buf.sampleRate; src.loopEnd = ref.loop[1] / buf.sampleRate; }
    }
    src.connect(g).connect(snd.out);
    src.start();
    src.onended = () => g.disconnect();
    return { src, g };
  }
  const announceSound = (code, kind, era, el) => document.dispatchEvent(new CustomEvent("clio:sound", { detail: { code, kind, era, target: el instanceof Element ? el : null } }));
  // clio.play(code[, element]): an Appearance sound kind ('mnuo', 'btnp', 'ftrs', ...) from
  // the set for the element's era, or "alert" for the era's alert sound.
  function play(code, el) {
    if (typeof legacy[code] === "string") {   // the 0.11 interface: a URL per name
      if (!document.documentElement.hasAttribute("data-clio-sounds") || silent()) return;
      try { const a = new Audio(legacy[code]); a.play().catch(() => {}); } catch {}
      return;
    }
    if (!snd.ctx || silent()) return;
    const era = eraOf(el);
    if (code === "alert") {
      const list = alertsFor(era); if (!list) return;
      const name = snd.alert[era] || list.man.selected, a = list.man.alerts[name];
      if (a && startSound(list, { file: a.file, gain: 1 })) announceSound("alert", "alert", era, el);
      return;
    }
    const set = setFor(era); if (!set) return;
    const e = set.man.events && set.man.events[code];
    if (!e || !e.play || !(e.class & classesOn())) return;
    if (startSound(set, e.play)) announceSound(code, "one-shot", era, el);
  }
  // Drag loops: attack once, then the moving loop while the pointer moves and the idle
  // loop while it holds still (measured, Platinum's window drag), the release sound at
  // the end. Starting another drag ends the one running.
  const IDLE_AFTER = 6 * TICK;
  function beginDrag(code, el) {
    endDrag(true);
    if (!snd.ctx || silent()) return;
    const era = eraOf(el), set = setFor(era); if (!set) return;
    const e = set.man.loops && set.man.loops[code];
    if (!e || !e.roles || !(e.class & classesOn())) return;
    snd.drag = { code, era, el, set, roles: e.roles, mode: null, node: null, timer: 0 };
    startSound(set, e.roles.attack);
    loopMode("idle");
    announceSound(code, "loop-start", era, el);
  }
  function loopMode(mode) {
    const d = snd.drag; if (!d || d.mode === mode) return;
    if (d.node) { try { d.node.src.stop(); } catch {} d.node = null; }
    d.mode = mode; d.node = startSound(d.set, d.roles[mode], { loop: true });
  }
  function dragMove() {
    const d = snd.drag; if (!d) return;
    loopMode("moving");
    clearTimeout(d.timer); d.timer = setTimeout(() => loopMode("idle"), IDLE_AFTER);
  }
  function endDrag(quiet) {
    const d = snd.drag; if (!d) return;
    snd.drag = null; clearTimeout(d.timer);
    if (d.node) { try { d.node.src.stop(); } catch {} }
    if (!quiet) startSound(d.set, d.roles.release);
    announceSound(d.code, "loop-stop", d.era, d.el);
  }

  // Which sound kind a pressed control is: [prefix] + p (press), e (enter), x (exit), r (release).
  const isUtility = (el) => !!el.closest(".window.utility");
  function controlKind(el) {
    const tb = el.closest(".title-bar > *");
    if (tb && tb.parentElement.parentElement && tb.parentElement.parentElement.matches(".window")) {
      const u = isUtility(tb) ? "u" : "w";
      if (tb.matches(".close, .close-box")) return u + "cl";
      if (tb.matches(".zoom, .resize, .resize-box")) return u + "zm";
      if (tb.matches(".shade, .shade-box, .collapse")) return u + "co";
      return null;
    }
    if (el.matches("input[type=checkbox]")) return "chk";
    if (el.matches("input[type=radio]")) return "rad";
    if (el.matches(".bevel")) return "bev";
    if (el.matches(".disclosure")) return "dsc";
    if (el.matches('[role="tab"]')) return "tab";
    if (el.matches(".little-arrows > *")) return "la";
    if (el.matches(".control-strip-module, .control-strip-scroll")) return null;
    if (el.matches(DEFAULT)) return "dbt";
    if (el.matches(CANCEL)) return "cbt";
    return "btn";
  }
  function controlSound(el, phase) {
    const k = el && controlKind(el); if (!k) return;
    if (k === "la") {   // little arrows: up and down press and release apart, enter and exit shared
      const up = el.matches(".up, :first-child");
      return play(phase === "p" ? (up ? "laup" : "ladp") : phase === "r" ? (up ? "laur" : "ladr") : phase === "e" ? "lare" : "larx", el);
    }
    play(k + phase, el);
  }

  // Windows, dialogs, alerts and balloons appearing and going: an observer, so pages need
  // no calls. A window that loses .inactive is activated.
  const ALERT = ".alert-box, [role=alertdialog]";
  const OPENABLE = ".window, .modal-dialog, .standard-dialog, .modeless-dialog, .alert-box, dialog, [role=dialog], [role=alertdialog], .balloon";
  const visible = (el) => el.isConnected && el.getClientRects().length > 0;
  function openKind(el, open) {
    if (el.matches(".balloon")) return open ? "blno" : "blnc";
    if (el.matches(ALERT)) return open ? "aopn" : "altc";
    if (el.matches(".modal-dialog, .standard-dialog, .modeless-dialog, dialog, [role=dialog]") && !el.matches(".window")) return open ? "dopn" : "dlgc";
    if (el.matches(".window.modal-dialog, .window.movable-modal")) return open ? "dopn" : "dlgc";
    return (isUtility(el) ? "u" : "w") + (open ? "opn" : "cls");
  }
  function opened(el) {
    if (optedOut(el)) return;
    if (el.matches(ALERT) || (el.querySelector && el.querySelector(ALERT))) play("alert", el);
    play(openKind(el, true), el);
  }
  const gone = (el, parent) => { if (!optedOut(parent || el)) play(openKind(el, false), parent || document.documentElement); };
  new MutationObserver((records) => {
    if (!snd.ctx && !Object.keys(legacy).length) return;
    for (const r of records) {
      if (r.type === "attributes") {
        const el = r.target;
        if (!el.matches(OPENABLE)) continue;
        if (r.attributeName === "class") {
          if (el.matches(".window") && (r.oldValue || "").split(/\s+/).includes("inactive") && !el.classList.contains("inactive")) play(isUtility(el) ? "uact" : "wact", el);
          continue;
        }
        const now = visible(el) && !el.hidden, was = r.attributeName === "open" ? r.oldValue !== null : r.oldValue === null;
        if (now && !was) opened(el); else if (!now && was) gone(el, el);
        continue;
      }
      for (const n of r.addedNodes) if (n instanceof Element && !n.closest(".clio-sb-anchor, .clio-outline, .clio-live, .clio-popup-menu, .clio-move-menu")) {
        const el = n.matches(OPENABLE) ? n : n.querySelector(OPENABLE);
        if (el && visible(el)) opened(el);
      }
      for (const n of r.removedNodes) if (n instanceof Element && n.matches(OPENABLE) && !n.hidden) gone(n, r.target instanceof Element ? r.target : null);
    }
  }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ["open", "hidden", "class"] });

  // Sliders (input[type=range]): the press, the thumb's drag loop (live), the end of the track.
  document.addEventListener("pointerdown", (e) => {
    const r = e.button === 0 && e.target instanceof Element && e.target.closest("input[type=range]");
    if (!r || r.disabled || optedOut(r) || !snd.ctx) return;
    play("sltp", r); beginDrag("slth", r);
    let last = r.value;
    const atEnd = () => r.value === r.max || r.value === r.min || (r.max === "" && r.value === "100") || (r.min === "" && r.value === "0");
    const move = (ev) => { if (ev.pointerId !== e.pointerId) return; dragMove(); if (r.value !== last) { last = r.value; if (atEnd()) play("slte", r); } };
    const up = (ev) => { if (ev.pointerId !== e.pointerId) return; document.removeEventListener("pointermove", move, true); document.removeEventListener("pointerup", up, true); document.removeEventListener("pointercancel", up, true); endDrag(); };
    document.addEventListener("pointermove", move, true); document.addEventListener("pointerup", up, true); document.addEventListener("pointercancel", up, true);
  }, true);

  const sounds = {
    use,
    play,
    beginDrag,
    dragMove,
    endDrag: () => endDrag(false),
    get muted() { return snd.muted; },
    set muted(v) { snd.muted = !!v; if (v) endDrag(true); },
    get volume() { return snd.volume; },
    set volume(v) { snd.volume = Math.max(0, Math.min(1, +v || 0)); if (snd.out) snd.out.gain.value = snd.volume; },
    // the alert sound by name, per era: clio.sounds.alertSound("platinum", "Sosumi")
    alertSound(era, name) { if (name === undefined) { const l = alertsFor(era); return snd.alert[era] || (l && l.man.selected) || null; } snd.alert[era] = name; },
    get loaded() { return { sets: snd.sets.map((s) => ({ name: s.man.name, eras: s.eras })), alerts: snd.alerts.map((s) => ({ name: s.man.source, eras: s.eras, list: s.man.list })) }; },
  };
  const soundsApi = new Proxy(sounds, {   // the 0.11 interface: clio.sounds.alert = "url"
    set(t, k, v) { if (k in t) { t[k] = v; return true; } legacy[k] = v; return true; },
    get(t, k) { return k in t ? t[k] : legacy[k]; },
  });

  /* ---- The watch: seven frames, four ticks each ----------------------------
     The System's 'acur' resource (-6078, Mac OS 9.0) lists eight CURS frames and a
     delay of 4 ticks; the fork carries seven of them (-6078..-6072, the same pixels
     as -20721..-20715). CSS cannot animate cursor:, so while an [aria-busy="true"]
     element exists clio.js rewrites its --clio-cursor-wait from the computed value
     (whose URLs are already absolute) every 4 ticks. */
  const watch = (() => {
    const root = document.documentElement;
    let frames = null, timer = 0, at = 0;
    const base = () => getComputedStyle(root).getPropertyValue("--clio-cursor-wait");
    const count = () => parseInt(getComputedStyle(root).getPropertyValue("--clio-cursor-watch-count"), 10) || 7;
    const build = () => {
      const v = base();
      const m = v.match(/watch(6?)\.png/);
      if (!m) return null;
      const stem = `watch${m[1]}`;
      const n = m[1] ? count() : 7;
      return Array.from({ length: n }, (_, i) => v.replace(`${stem}.png`, `${stem}-${i + 1}.png`).replace(`${stem}-2x.png`, `${stem}-${i + 1}-2x.png`).replace(`${stem}-3x.png`, `${stem}-${i + 1}-3x.png`));
    };
    const busy = () => document.querySelectorAll('[aria-busy="true"]');
    const stop = () => { clearInterval(timer); timer = 0; };
    const step = () => {
      const els = busy();
      if (!els.length) { stop(); return; }
      if (!frames) frames = build();
      if (!frames) { stop(); return; }
      at = (at + 1) % frames.length;
      for (const el of els) el.style.setProperty("--clio-cursor-wait", frames[at]);
    };
    const kick = () => {
      const on = busy().length > 0;
      if (on && !timer) { if (!frames) frames = build(); if (!frames) return; timer = setInterval(step, 4 * TICK); }
      else if (!on) { stop(); for (const el of document.querySelectorAll("[style*='--clio-cursor-wait']")) el.style.removeProperty("--clio-cursor-wait"); }
    };
    if (typeof MutationObserver !== "undefined") new MutationObserver(kick).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-busy"] });
    return { kick };
  })();

  window.clio = {
    version: "0.11.0-dev",
    zoomRects,
    collapse,
    sounds: soundsApi,
    play,
    scrollbars,
    unscroll(el) { const b = hosts.get(el); if (b) { b.destroy(); hosts.delete(el); live.delete(b); } },
    refresh(el) { const b = hosts.get(el); if (b) b.layout(); },
    centre,   // align centred labels again (after a change clio.js cannot see)
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
