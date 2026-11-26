// Placard: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "placard",
  name: "Placard",
  summary: "A framed strip for status or a small control at the foot of a window, beside the horizontal scroll bar.",
  selectors: [".placard", ".placard[aria-disabled=true]"],
  tokens: [],
  accessibility: "A status placard that changes is a live region (role=status); a placard that acts is a <button class=\"placard\">.",
  html: "<span class=\"placard\" role=\"status\" style=\"width: 64px\">Page 1</span>",
  evidence: [
    { era: "platinum", claim: "1px black, white light on the top and left, #aaa shade on the right and the bottom (the corners they would share left #ddd), a #ddd face. Disabled: a #555 frame on #eee", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the Appearance SDK's CDEF Tester (CDEF Tester > Placard, 100x50, and Disable), frames placard and placard-disabled", upstream: "specimens p9-placard and p9-placard-disabled 100% identical; held not shown by the tester" },
    { era: "drawingboard", claim: "A #cebdb5 face in the pencil line (its commonest shade, #555; it drifts from #333 to #888); disabled, #cdc6bd with a faint #b6ada5 line along the top only", status: "adapted", source: "clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the CDEF Tester, frames placard and placard-disabled", upstream: "faces 100% identical (db-placard-face, -disabled-face); the drifting pencil drawn flat" },
    { era: "both", claim: "The text in the era's small font, 4px in", status: "inferred", source: "clio.css", upstream: "the tester's placard is empty" },
    { era: "system7", claim: "Before the Appearance Manager there was no placard control (applications drew their own); a 1px frame on the paper", status: "adapted", source: "clio.css", upstream: "Mac OS 8 Human Interface Guidelines (1997), ch. 2 (placards)" },
    { era: "system6", claim: "Likewise System 6", status: "adapted", source: "clio.css", upstream: "—" },
  ],
};

export default component;
