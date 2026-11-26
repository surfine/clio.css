// Browser (NeXTSTEP): markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "browser",
  eras: ["nextstep"],
  name: "Browser (NeXTSTEP)",
  summary: "NeXTSTEP's column browser: lists side by side, each item that leads further marked with an arrow. NeXTSTEP only (clio.nextstep.css).",
  selectors: [".browser", ".browser > .listbox", ".browser .branch"],
  tokens: ["--clio-browser-column", "--clio-browser-row"],
  accessibility: "Each column is a listbox; mark the selected item with aria-selected and give branches aria-haspopup or the class branch. Arrow keys between columns are up to your script.",
  html: `<div class="browser" style="width: 302px">
  <ul class="listbox" role="listbox" aria-label="Disk" style="height: 96px">
    <li role="option" class="branch" aria-selected="true">Apps</li>
    <li role="option" class="branch">Library</li>
    <li role="option">Welcome!</li>
  </ul>
  <ul class="listbox" role="listbox" aria-label="Apps" style="height: 96px">
    <li role="option">Edit.app</li>
    <li role="option">Mail.app</li>
  </ul>
</div>`,
  evidence: [
    { era: "nextstep", claim: "A sunken box (#555555 then black at the top and left, #555555 then white at the bottom); columns 145px wide on #aaaaaa, each with its scroller at its left behind a black line; 15px rows, the first starting 4px above the column; a branch carries the menu's arrow 4px from the right and 4px down", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frames browser and browser-small (the File Viewer in browser view)", upstream: "fidelity nx-browser" },
    { era: "nextstep", claim: "The selected row is white across the column; its arrow's light edge turns #aaaaaa", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame browser (\"me\")", upstream: "fidelity nx-browser" },
    { era: "nextstep", claim: "The box's right edge", status: "inferred", source: "clio.css (the bottom's colours)", upstream: "covered by a panel on the captured frames" },
  ],
};

export default component;
