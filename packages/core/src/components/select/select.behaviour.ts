import { play } from "../../runtime/sounds.ts";
import { BLINK, sticky } from "../menu/menu.behaviour.ts";
import { TICK, optedOut, px, reduced } from "../../runtime/shared.ts";

interface Popup { sel: HTMLSelectElement; menu: HTMLElement; mode: "press" | "sticky" | "blink"; hot: HTMLElement | null; opened: number; moved: boolean; x: number; y: number }

/* ---- Pop-up menus (<select>) ------------------------------------------ */
// The open menu lies over the button with the current item on the button's
// row. Where the browser draws it (appearance: base-select) clio.js only
// lines it up; elsewhere it draws the era's .menu itself and tracks it like
// the menu bar's. Touch keeps the system's picker.
const POPUP = "select:not([multiple]):not([size]), select[size='1']";
let baseSelect = false;   // set by install(), once the page is known to be a browser
const drawn = (sel: Element) => baseSelect && getComputedStyle(sel).appearance === "base-select";
const rowOf = (el: Element) => px(getComputedStyle(el).getPropertyValue("--clio-menu-item-height")) || 16;
const borderTop = (el: Element) => px(getComputedStyle(el).getPropertyValue("--clio-menu-border-top-width")) || 1;
const blink = (li: Element, done: () => void) => {
  if (reduced()) return done();
  let n = 0;
  const step = () => { li.toggleAttribute(BLINK, n % 2 === 0); if (++n === 7) { li.removeAttribute(BLINK); return done(); } setTimeout(step, 3 * TICK); };
  step();
};
const alignPicker = (sel: HTMLSelectElement) => {
  const h = rowOf(sel), r = sel.getBoundingClientRect(), atTop = getComputedStyle(sel).getPropertyValue("--clio-popup-menu-align").trim() === "top";
  sel.style.setProperty("--clio-picker-shift", `${(atTop ? 0 : Math.round((r.height - h) / 2) - borderTop(sel)) - Math.max(0, sel.selectedIndex) * h}px`);
};
let popup: Popup | null = null;   // { sel, menu, mode, hot, opened }

function openPopup(sel: HTMLSelectElement) {
  const r = sel.getBoundingClientRect(), h = rowOf(sel);
  const menu = document.createElement("ul");
  menu.className = "menu clio-popup-menu";
  menu.setAttribute("role", "menu");
  for (const o of sel.options) {
    const li = document.createElement("li");
    li.textContent = o.label || o.text;
    // The menu hangs off the era's root, outside the select: carry each option's language
    // so :lang() gives a Chinese, Japanese or Korean item its font (96-cjk.css).
    const lang = o.closest<HTMLElement>("[lang]");
    if (lang) li.lang = lang.lang;
    li.dataset.index = o.index as unknown as string;   // the DOM writes it as a string
    if (o.disabled || (o.parentElement && (o.parentElement as HTMLOptGroupElement).disabled)) li.classList.add("disabled");
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
function lightPopup(li: HTMLElement | null) {
  if (!popup || popup.hot === li) return;
  if (popup.hot) popup.hot.classList.remove("active");
  popup.hot = li && !li.classList.contains("disabled") ? li : null;
  if (popup.hot) { popup.hot.classList.add("active"); play("mnui", popup.sel); }
}
function choosePopup(li: HTMLElement) {
  const { sel } = popup!; popup!.mode = "blink";
  play("mnus", sel);
  blink(li, () => {
    closePopup();
    const i = +li.dataset.index!;
    if (sel.selectedIndex !== i) {
      sel.selectedIndex = i;
      sel.dispatchEvent(new Event("input", { bubbles: true }));
      sel.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
}

export function install(): void {
  baseSelect = !!(window.CSS && CSS.supports && CSS.supports("appearance", "base-select")) && matchMedia("(pointer: fine)").matches;   // as the stylesheet: touch keeps the system picker
  // Drawing Board's menus need their pencil shade and corner pixels, which the
  // browser's picker cannot carry: with clio.js there, the stylesheet hands those
  // pop-ups back (data-clio-popups) and clio.js draws them as it does elsewhere.
  if (baseSelect) document.documentElement.setAttribute("data-clio-popups", "");

  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    if (popup) {
      const li = e.target.closest<HTMLElement>(".clio-popup-menu > li");
      e.preventDefault();
      if (li && popup.menu.contains(li) && popup.mode === "sticky") { popup.mode = "press"; popup.moved = true; lightPopup(li); return; }
      if (popup.mode !== "blink") closePopup();
      return;
    }
    const sel = e.target.closest<HTMLSelectElement>(POPUP);
    if (!sel || sel.disabled || optedOut(sel)) return;
    if (drawn(sel)) { alignPicker(sel); return; }
    if (e.pointerType === "touch") return;
    e.preventDefault();
    sel.focus({ preventScroll: true, focusVisible: false });   // a pressed pop-up draws no keyboard ring (popup-open)
    openPopup(sel);
    (popup as Popup | null)!.x = e.clientX; (popup as Popup | null)!.y = e.clientY;   // openPopup set it
  }, true);

  document.addEventListener("keydown", (e) => {
    const f = document.activeElement;
    if (f instanceof Element && f.matches(POPUP) && drawn(f)) alignPicker(f as HTMLSelectElement);
    if (popup && e.key === "Escape") { e.preventDefault(); closePopup(); }
  }, true);

  document.addEventListener("pointermove", (e) => {
    if (!popup || popup.mode === "blink") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el && el.closest<HTMLElement>(".clio-popup-menu > li");
    if (Math.abs(e.clientX - popup.x) + Math.abs(e.clientY - popup.y) > 3) popup.moved = true;
    lightPopup(li && popup.menu.contains(li) ? li : null);
  }, true);

  document.addEventListener("pointerup", (e) => {
    if (!popup || popup.mode !== "press") return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const li = el && el.closest<HTMLElement>(".clio-popup-menu > li");
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
}
