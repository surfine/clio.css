// Desktop and icons: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "desktop",
  bare: true,
  name: "Desktop and icons",
  summary: "The desktop pattern and desktop icons with their name labels. Bring your own icon images; clio.css ships no Apple icons.",
  selectors: [".desktop", ".icon", ".icon > img", ".icon > figcaption", ".icon.selected"],
  tokens: ["--clio-desktop", "--clio-label-bg", "--clio-label-selected-bg", "--clio-icon-selected-filter"],
  accessibility: "Make each icon a <button> (or give it role=button and tabindex=0) with its name as the label.",
  html: `<div class="desktop" style="min-height: 0; padding: 16px; display: flex; gap: 12px">
  <button class="icon" aria-pressed="false">
    <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000"/><rect x="7" y="9" width="18" height="11" fill="#000"/></svg>
    <span>Macintosh HD</span>
  </button>
  <button class="icon selected" aria-pressed="true">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 9h9l2 2h11v15H5z" fill="#fff" stroke="#000"/></svg>
    <span>Documents</span>
  </button>
</div>`,
  evidence: [
    { era: "system7", claim: "The desktop is a 1px #666/#aaa checker", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), every frame", upstream: "agrees with AI System 6 system-7-reference" },
    { era: "system6", claim: "The desktop is a 1px 50% checker", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), every frame", upstream: "AI System 6 draws an 8px stipple" },
    { era: "system6", claim: "Icon names: Geneva 9 on a white tag; a selected icon and its tag invert", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), desktop (Macintosh HD selected, Welcome! not)", upstream: "System 6.0.8 Finder" },
    { era: "platinum", claim: "70% white tag with no edge; selected: black tag, white name, artwork darkened", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:882 (P12, P13)", upstream: "Mac OS 9 native capture 02" },
    { era: "platinum", claim: "Desktop colour #4a71ab", status: "inferred", source: "apps/desktop/styles/65-appearance-themes.css:85", upstream: "base colour of AI System 6's azul tile, generated from a 512 Pixels capture; the tile is not shipped" },
    { era: "drawingboard", claim: "Desktop and icons are unchanged from Platinum; the theme's desktop pictures are not reproduced", status: "adapted", source: "clio.css", upstream: "scen 'Drawing Board on a Grid' / 'on Parchment' are Apple artwork" },
    { era: "nextstep", claim: "Cursors: NeXT's arrow, the Mac's but for its last row, and its I-beam, 7x16, black only, its crossbar on the hot spot's row (3, 8)", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frames ns30b/edited (the arrow over the workspace) and ns30c/ibeam (over Edit's text); tooling/cursor-art.py", upstream: "the arrow's hot spot (1, 1) is inferred from the Mac's" },
    { era: "nextstep", claim: "data-clio-depth=\"2bit\": a black-and-white MegaPixel NeXT's workspace, flat #555555 (the screen's four greys)", status: "inferred", source: "clio.css design choice (2026-11-26)", upstream: "Infinite Mac runs only a colour NeXT" },
    { era: "nextstep", claim: "On touch screens the menu cells grow to 32px, buttons to 36px, fields to 40px; the arrows and marks stay centred", status: "adapted", source: "clio.css (95-adapt.css's coarse-pointer sizes)", upstream: "checked at 375px wide: no sideways scroll" },
    { era: "nextstep", claim: "Workspace background #555577, flat", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame boot1 (the desktop round the File Viewer)", upstream: "chosen 2026-11-26 over AI System 6's #555555, the 2-bit grey" },
    { era: "nextstep", claim: "Icon labels: Helvetica 12, black on the window's grey; a selected label on white", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame boot1 (the File Viewer's shelf, \"me\" selected)", upstream: "the label's padding is inferred" },
  ],
};

export default component;
