import { optedOut } from "./shared.ts";

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
const nudged = new Map<HTMLElement, string>();   // element -> the inline value it had
const isTitle = (el: Element) => el.matches(".title-bar > *");
let centreQueued = false;
export function centre() {
  centreQueued = false;
  // undo, so each label is measured as the stylesheet lays it out
  for (const [el, was] of nudged) { if (isTitle(el)) el.style.marginRight = was; else el.style.paddingRight = was; }
  nudged.clear();
  const todo: [HTMLElement, CSSStyleDeclaration][] = [];
  for (const el of document.querySelectorAll<HTMLElement>(CENTRED)) {
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
export const queueCentre = () => { if (!centreQueued) { centreQueued = true; requestAnimationFrame(centre); } };

export function install(): void {
  if (document.fonts) document.fonts.ready.then(queueCentre);
  addEventListener("resize", queueCentre);
  new MutationObserver((records) => {
    for (const r of records) for (const n of r.addedNodes) if (n.nodeType === 3 || (n instanceof Element && !n.closest(".clio-sb-anchor, .clio-outline, .clio-popup-menu, .clio-live"))) return queueCentre();
    for (const r of records) if (r.type === "characterData") return queueCentre();
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
}
