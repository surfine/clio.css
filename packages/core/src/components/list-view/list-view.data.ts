// List view: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "list-view",
  name: "List view",
  summary: "The Finder's list view: column headers with the sorted column marked, and rows of names and details.",
  selectors: [".list-view", ".list-view th[aria-sort]", ".list-view th.sort-direction", ".list-view td.sorted"],
  tokens: ["--clio-list-view-row", "--clio-list-view-header-height", "--clio-list-view-sorted-bg"],
  accessibility: "A real <table>: give the sorted header aria-sort, keep scope on headers; the disclosure buttons need labels.",
  html: `<table class="list-view" style="width: 340px">
  <thead><tr><th aria-sort="ascending">Name</th><th>Date Modified</th><th class="sort-direction" aria-label="Sort direction"></th></tr></thead>
  <tbody>
    <tr><td class="sorted"><button class="disclosure" aria-expanded="false" aria-label="Show"></button> Developer</td><td colspan="2">Thu, Apr 14, 2022</td></tr>
    <tr><td class="sorted"><button class="disclosure" aria-expanded="false" aria-label="Show"></button> Games</td><td colspan="2">Thu, Apr 14, 2022</td></tr>
  </tbody>
</table>`,
  evidence: [
    { era: "system7", claim: "Headers in the small font on the window's white, the sorted one underlined, a double rule (black, white, black) below", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frames in .fidelity/hig/system7), frame list", upstream: "Finder, View by Name" },
    { era: "system6", claim: "System 6's list views have System 7's headers", status: "inferred", source: "clio.css", upstream: "not captured" },
    { era: "platinum", claim: "21px bevelled headers: #666 above, white light, #ccc, #888 shade, a #333 rule; the sorted header sunk dark (#111/#444 frame, #555/#aaa bevel, #888); #666 dividers; a sort-direction cell with its mark; rows #eee, the sorted column #ddd, 19px", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frame list", upstream: "100% identical (labels left out: Geneva 10 is not among clio.css's fonts)" },
    { era: "drawingboard", claim: "#cdc6bd headers and a #9f9a94 sorted one, each line in its dominant colour; the theme draws these lines with pattern pens, not reproduced", status: "adapted", source: "clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity/hig/drawingboard), frame list-open", upstream: "Finder list view" },
  ],
};

export default component;
