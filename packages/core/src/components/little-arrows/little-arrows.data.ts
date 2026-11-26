// Little arrows: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "little-arrows",
  name: "Little arrows",
  summary: "The up and down pair beside a number or a clock field.",
  selectors: [".little-arrows", ".little-arrows > .up", ".little-arrows > .down", ".little-arrows[aria-disabled=true]"],
  tokens: ["--clio-little-arrows-width", "--clio-little-arrows-height", "--clio-art-little-arrows"],
  accessibility: "Two real buttons with labels; keep the field itself editable and announce the new value.",
  html: `<input type="text" value="32K" style="width: 60px" aria-label="Cache size">
<span class="little-arrows" role="group" aria-label="Cache size">
  <button class="up" aria-label="Increase"></button><button class="down" aria-label="Decrease"></button>
</span>`,
  evidence: [
    { era: "system7", claim: "15x25, an outlined rounded box with two outlined arrows", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frames in .fidelity/hig/system7), frame memory (Cache Size)", upstream: "held and dimmed states not on screen; they keep the normal picture" },
    { era: "platinum", claim: "13x23, normal while its field is edited and dimmed otherwise", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frames date-time-edit and date-time", upstream: "both 100% identical; held states were under the pointer" },
    { era: "drawingboard", claim: "The theme's 13x21 pictures (350): normal, up held, down held, dimmed, through 16 bits", status: "measured", source: "the theme file's pxm# and ppat resources (tooling/db-art.py)", upstream: "dimmed found 1:1 in Date & Time" },
    { era: "system6", claim: "System 6 had none; it uses System 7's", status: "adapted", source: "clio.css", upstream: "—" },
  ],
};

export default component;
