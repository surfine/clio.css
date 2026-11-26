// Control Strip: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "control-strip",
  name: "Control Strip",
  summary: "The Control Strip of System 7.5 to Mac OS 9: module buttons with menu triangles, scroll arrows and a tab that folds it away. Markup matches AI System 6's.",
  selectors: [".control-strip", ".control-strip.is-collapsed", ".control-strip-scroll", ".control-strip-scroll-back", ".control-strip-scroll-forward", ".control-strip-modules", ".control-strip-module-track", ".control-strip-module", ".control-strip-handle"],
  tokens: ["--clio-strip-height", "--clio-strip-bg", "--clio-strip-line", "--clio-strip-cell-shadow", "--clio-strip-sunken-shadow", "--clio-strip-pressed-bg", "--clio-strip-pressed-shadow", "--clio-strip-module-width", "--clio-strip-handle"],
  accessibility: "role=toolbar on .control-strip-modules with an aria-label; every module and arrow is a <button> with an aria-label; a module that opens a menu carries aria-haspopup=\"menu\" and aria-expanded. Disable the scroll arrows when there is nothing to scroll. Folding (.is-collapsed) and positioning are up to your script.",
  html: `<div class="control-strip">
  <button class="control-strip-scroll control-strip-scroll-back" disabled aria-label="Scroll back"></button>
  <div class="control-strip-modules" role="toolbar" aria-label="Control Strip">
    <div class="control-strip-module-track">
      <button class="control-strip-module" aria-haspopup="menu" aria-expanded="false" aria-label="Monitor bit depth"><svg viewBox='0 0 16 16' aria-hidden='true'><rect x='2' y='3' width='12' height='9' fill='none' stroke='currentColor'/><rect x='4' y='5' width='8' height='5' fill='#ff0000'/><rect x='6' y='12' width='4' height='2' fill='currentColor'/></svg></button>
      <button class="control-strip-module" aria-haspopup="menu" aria-expanded="false" aria-label="Sound volume"><svg viewBox='0 0 16 16' aria-hidden='true'><rect x='2' y='3' width='12' height='9' fill='none' stroke='currentColor'/><rect x='4' y='5' width='8' height='5' fill='currentColor'/><rect x='6' y='12' width='4' height='2' fill='currentColor'/></svg></button>
      <button class="control-strip-module" aria-haspopup="menu" aria-expanded="false" aria-label="File sharing"><svg viewBox='0 0 16 16' aria-hidden='true'><rect x='2' y='3' width='12' height='9' fill='none' stroke='currentColor'/><rect x='4' y='5' width='8' height='5' fill='#3366cc'/><rect x='6' y='12' width='4' height='2' fill='currentColor'/></svg></button>
    </div>
  </div>
  <button class="control-strip-scroll control-strip-scroll-forward" disabled aria-label="Scroll forward"></button>
  <button class="control-strip-handle" aria-label="Collapse Control Strip"></button>
</div>`,
  variants: [
    { name: "Folded", note: "With .is-collapsed only the tab shows.", html: "<div class=\"control-strip is-collapsed\"><button class=\"control-strip-handle\" aria-label=\"Expand Control Strip\"></button></div>" },
  ],
  evidence: [
    { era: "platinum", claim: "24px: 1px black lines round every cell; #c0c0c0 cells with a #c0c0c0 then white light and a #a0a0a0 then #808080 shade; an end cap, 13px scroll cells (sunken while there is nothing to scroll), 30px modules with the 16px icon 2px in and a 4x7 menu triangle 4px from the right, then 2px of black and the tab", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame strip-expanded", upstream: "Finder desktop; start of the strip 89.5% identical" },
    { era: "platinum", claim: "Held module: #808080 face, 2px #404040 light and 2px #c0c0c0 shade", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame strip-slider", upstream: "Sound module held" },
    { era: "platinum", claim: "End-cap icon, scroll arrows, menu triangle, the tab and the folded tab", status: "measured", source: "tooling/p9-art.py, redrawn from frames strip-expanded and strip-collapsed", upstream: "tab and folded tab 100% identical" },
    { era: "drawingboard", claim: "The Control Strip is not themed: Mac OS 8.5 under Drawing Board draws it exactly as Mac OS 9 does", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame finder", upstream: "same cells, bevels and tab, other modules" },
    { era: "system6", claim: "System 6 had no Control Strip: drawn at the Mac OS 9 geometry in ink and paper, with 1-bit arrows, triangle and tab drawn for clio.css", status: "adapted", source: "clio.css", upstream: "AI System 6 shows its Control Strip in every era" },
    { era: "system7", claim: "System 7.5.3 draws the Mac OS 9 strip in System 7 greys: #ccc cells, white light, #aaa then #888 shade, idle scroll cells sunken #888/white; end cap, arrows, triangle and tab identical pixel for pixel", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame folder-window", upstream: "Finder desktop" },
    { era: "system7", claim: "Held module in System 7 greys (#888 face, #555 light, #ccc shade)", status: "inferred", source: "clio.css, from Mac OS 9's held module", upstream: "not captured in 7.5.3" },
  ],
};

export default component;
