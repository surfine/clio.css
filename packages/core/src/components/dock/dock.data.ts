// Workspace dock (NeXTSTEP): markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "dock",
  eras: ["nextstep"],
  name: "Workspace dock (NeXTSTEP)",
  summary: "The column of 64px application tiles at the screen's right edge; a docked application that is not running shows three dots. NeXTSTEP only.",
  selectors: [".dock", ".dock > li", ".dock > .not-running"],
  tokens: ["--clio-dock-tile", "--clio-dock-tile-bg"],
  accessibility: "A list of buttons labelled with the application's name; say whether it is running in the label.",
  html: `<ul class="dock" aria-label="Dock">
  <li><button class="icon" aria-label="Workspace (running)" style="width: 64px"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="32" height="32" fill="#000"/></svg></button></li>
  <li class="not-running"><button class="icon" aria-label="Edit (not running)" style="width: 64px"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="8" width="24" height="32" fill="#fff" stroke="#000"/></svg></button></li>
</ul>`,
  evidence: [
    { era: "nextstep", claim: "Tiles 64x64 stacked edge to edge at the screen's right edge: two white rows and columns top and left, a dark then a black line bottom and right", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame boot1 (dock x 1053-1116, y 0-63 and 64-127)", upstream: "five tiles and the recycler" },
    { era: "nextstep", claim: "The tile's face is flat #aaaaaa: on a colour NeXT it is a texture, which clio.css does not reproduce", status: "adapted", source: "clio.css", upstream: "frame boot1" },
    { era: "nextstep", claim: "A docked application that is not running: three 3x2 marks 4px from the tile's lower left, 5px apart", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame boot1 (the mail tile); tooling/nx-art.py check", upstream: "NeXTSTEP User Interface Guidelines, Release 3 p.6" },
  ],
};

export default component;
