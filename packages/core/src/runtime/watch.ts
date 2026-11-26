/* ---- The watch: seven frames, four ticks each ----------------------------
   The System's 'acur' resource (-6078, Mac OS 9.0) lists eight CURS frames and a
   delay of 4 ticks; the fork carries seven of them (-6078..-6072, the same pixels
   as -20721..-20715). CSS cannot animate cursor:, so while an [aria-busy="true"]
   element exists clio.js rewrites its --clio-cursor-wait from the computed value
   (whose URLs are already absolute) every 4 ticks. */

import { TICK } from "./shared.ts";

export function install(): void {
  const root = document.documentElement;
  let frames: string[] | null = null, timer = 0, at = 0;
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
  const busy = () => document.querySelectorAll<HTMLElement>('[aria-busy="true"]');
  const stop = () => { clearInterval(timer); timer = 0; };
  const step = () => {
    const els = busy();
    if (!els.length) { stop(); return; }
    if (!frames) frames = build();
    if (!frames) { stop(); return; }
    at = (at + 1) % frames.length;
    for (const el of els) el.style.setProperty("--clio-cursor-wait", frames[at]!);
  };
  const kick = () => {
    const on = busy().length > 0;
    if (on && !timer) { if (!frames) frames = build(); if (!frames) return; timer = setInterval(step, 4 * TICK); }
    else if (!on) { stop(); for (const el of document.querySelectorAll<HTMLElement>("[style*='--clio-cursor-wait']")) el.style.removeProperty("--clio-cursor-wait"); }
  };
  if (typeof MutationObserver !== "undefined") new MutationObserver(kick).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-busy"] });
}
