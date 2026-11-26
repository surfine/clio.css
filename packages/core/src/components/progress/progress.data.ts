// Progress bar: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "progress",
  name: "Progress bar",
  summary: "The native <progress> element as the era's thermometer.",
  selectors: ["progress"],
  tokens: ["--clio-progress-height", "--clio-progress-bg", "--clio-progress-fill", "--clio-progress-shadow"],
  accessibility: "Native <progress>; give it a label or aria-label.",
  html: `<div class="field-row-stacked" style="width: 260px">
  <label for="clio-copy">Copying “System Folder”…</label>
  <progress id="clio-copy" max="100" value="62">62%</progress>
</div>`,
  evidence: [
    { era: "system7", claim: "11px, 1px black frame, #ccf track, #444 fill", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame copy-progress", upstream: "100% identical" },
    { era: "system6", claim: "12px tall, 1px ink frame, white track, fill in QuickDraw dkGray (one white dot in four)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame copy-progress (Finder duplicating System Folder)", upstream: "redrawn as a pattern tile in tooling/s6-art.py" },
    { era: "platinum", claim: "Barber-pole fill: ten 1px hard stops from #333399 through #eee to #000055", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:937 (P32)", upstream: "Mac OS 9 native progress bar" },
    { era: "platinum", claim: "Frame: 1px black, #aaa outside on the top and left and white on the bottom and right, 10px inside; an indeterminate bar repeats a 16px period of blue and grey stripes", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame copy-progress-5; tooling/p9-art.py", upstream: "Finder copy window, Preparing to copy…" },
    { era: "platinum", claim: "The unfilled track, #bbb with an #888/#ddd inner bevel", status: "inferred", source: "apps/desktop/styles/65-appearance-themes.css:592", upstream: "AI System 6 token, not tagged as measured" },
    { era: "drawingboard", claim: "12px, a #756f66 pencil line with #333 on the left, #ddd6c5 inside; indeterminate bars carry the theme's Indeterminate_Progress_Arrows", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame copy-progress-5; the theme's pxm#", upstream: "Finder copy window, \"Preparing to copy…\"; the arrows found 1:1" },
    { era: "drawingboard", claim: "The determinate fill stays Platinum's", status: "inferred", source: "clio.css", upstream: "the copy ran too fast to show a determinate bar" },
    { era: "nextstep", claim: "Progress: a sunken #aaaaaa well filled with #555555, 18px", status: "inferred", source: "AI System 6 69-nextstep-appearance.css (--progress-*)", upstream: "not captured" },
  ],
};

export default component;
