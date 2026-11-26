import { TICK, optedOut, px, reduced } from "../../runtime/shared.ts";

type Field = HTMLInputElement | HTMLTextAreaElement;

/* ---- Insertion point ---------------------------------------------------- */
// TextEdit's caret: a 1px line drawn in XOR (black on white, white on black)
// as tall as the line, on for GetCaretTime() ticks and off as long: 32 in
// System 6 and 7, about 48 in Mac OS 8 and 9 (--clio-caret-ticks; measured). clio.js draws it in text fields inside .window; the
// browser's own caret comes back while text is selected or an input method is
// composing, and the caret stays lit under reduced motion. Its place is
// measured when the text, the selection, a scroll or the size change, never
// per frame. data-clio-caret="off" (or data-clio-js="off") keeps the browser's.
const FIELD = "input:is([type=text], [type=search], [type=password], [type=email], [type=url], [type=tel], [type=number], :not([type])), textarea";
const MIRROR = ["boxSizing", "width", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopWidth", "borderRightWidth", "borderBottomWidth", "borderLeftWidth", "fontFamily", "fontSize", "fontWeight", "fontStyle", "fontStretch", "letterSpacing", "wordSpacing", "lineHeight", "textTransform", "textIndent", "tabSize"] as const;
let caretEl: HTMLDivElement | null = null, caretField: Field | null = null, caretTimer = 0, composing = false, caretQueued = false;
const caretWanted = (f: Element | null): f is Field => f instanceof HTMLElement && f.matches(FIELD) && !!f.closest(".window") && !optedOut(f) && !f.closest('[data-clio-caret="off"]') && !(f as Field).readOnly && !(f as Field).disabled;
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

export function install(): void {
  // (Firefox fires no selectionchange for a field's own selection: a click or a key moves it too)
  for (const t of ["focusin", "selectionchange", "input", "keyup", "pointerup", "select"]) document.addEventListener(t, queueCaret);
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener("change", () => { if (caretField) queueCaret(); });
  document.addEventListener("focusout", () => requestAnimationFrame(() => { if (!caretWanted(document.activeElement)) caretStop(); }));
  document.addEventListener("compositionstart", () => { composing = true; caretStop(); });
  document.addEventListener("compositionend", () => { composing = false; queueCaret(); });
  addEventListener("scroll", () => { if (caretField) queueCaret(); }, { capture: true, passive: true });
  addEventListener("resize", () => { if (caretField) queueCaret(); });
}
