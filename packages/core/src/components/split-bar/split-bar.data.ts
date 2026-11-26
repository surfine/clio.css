// Split bar: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "split-bar",
  name: "Split bar",
  summary: "The bar above a vertical scroll bar that splits a window into panes, and the split line between two panes.",
  selectors: [".split-view", ".split-bar", ".split-line"],
  tokens: ["--clio-split-bar-height", "--clio-split-line-1", "--clio-split-bg", "--clio-split-ink"],
  accessibility: "role=separator. If your script lets people move it, make it focusable with aria-valuenow and arrow keys; clio.css only draws it.",
  html: `<div class="split-view" style="width: 220px; height: 120px">
  <div class="split-bar" role="separator" aria-label="Split"></div>
  <div style="flex: 1; padding: 0 8px">Opening paragraphs…</div>
  <div class="split-line" role="separator"></div>
  <div style="flex: 1; padding: 4px 8px">…and the conclusion.</div>
</div>`,
  evidence: [
    { era: "platinum", claim: "7 rows of black across the scroll bar's width, at its top; split, the bar tops the lower pane's scroll bar and the split line runs across the content as two black lines on its fourth and sixth rows", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): BBEdit 5.1 (Developer folder), frames split-bar and split-line", upstream: "specimens p9-split-bar and p9-split-line 100% identical; the dragged 3-row grey outline is not drawn" },
    { era: "drawingboard", claim: "The same (the bar is the application's drawing, not the theme's)", status: "inferred", source: "clio.css", upstream: "BBEdit 5.1 not opened in Drawing Board" },
    { era: "system7", claim: "A control 5 pixels high by the width of the scroll bar at its top; the split line two lines with a one-pixel space", status: "inferred", source: "Macintosh Human Interface Guidelines (1992), ch. 5: Splitting a Window", upstream: "BBEdit 2.1.3 in System 7.5.3 has no split bar; no other application with one was found" },
    { era: "system6", claim: "The same as System 7", status: "inferred", source: "Macintosh Human Interface Guidelines (1992), ch. 5", upstream: "—" },
  ],
};

export default component;
