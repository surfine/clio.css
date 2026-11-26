import { controlSound } from "../../runtime/sounds.ts";
import { OFF, optedOut, type Ctl } from "../../runtime/shared.ts";

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

export function install(): void {
  document.addEventListener("pointerdown", (e) => {
    if (e.button !== 0 || !(e.target instanceof Element)) return;
    const el = e.target.closest<Ctl>(PRESSABLE);
    if (!el || el.disabled || optedOut(el) || el.closest(".clio-sb-anchor, .menu-bar, [role=menubar], [role=menu-bar], .menu, [role=menu]")) return;
    const r = el.getBoundingClientRect();   // once per press; the control does not move while held
    const inside = (ev: PointerEvent) => ev.clientX >= r.left && ev.clientX < r.right && ev.clientY >= r.top && ev.clientY < r.bottom;
    // the Appearance sounds: press, exit and enter while held, release inside
    controlSound(el, "p");
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== e.pointerId) return;
      const off = !inside(ev);
      if (off !== el.hasAttribute(OFF)) controlSound(el, off ? "x" : "e");
      el.toggleAttribute(OFF, off);
    };
    const end = (ev: PointerEvent) => {
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
}
