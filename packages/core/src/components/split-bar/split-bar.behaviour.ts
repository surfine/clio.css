import { optedOut } from "../../runtime/shared.ts";

/* ---- Split bar drag ----------------------------------------------------- */
// While a split bar is dragged, the split line's place is shown as a 3-row grey
// band across the split view (Inside Macintosh: Windows; HIG 1992, "Splitting a
// Window"). The application's own splitter still owns the actual split.

let band: HTMLDivElement | null = null;
const start = (e: PointerEvent) => {
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
const move = (e: PointerEvent) => { if (band) band.style.top = `${Math.round(e.clientY - 1)}px`; };
const end = () => { if (band) { band.remove(); band = null; } };

export function install(): void {
  document.addEventListener("pointerdown", start, true);
  window.addEventListener("pointermove", move, true);
  window.addEventListener("pointerup", end, true);
}
