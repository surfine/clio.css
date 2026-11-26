// Tabs: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "tabs",
  name: "Tabs",
  summary: "A tab strip over a panel. Native in Platinum; an adaptation in System 6, which had no tab control.",
  selectors: ["[role=tablist]", "[role=tab]", "[aria-selected=true]", "[role=tabpanel]", ".tabs", ".tab-panel"],
  tokens: ["--clio-tab-height", "--clio-tab-panel-bg", "--clio-tab-panel-border"],
  accessibility: "Use role=tablist, role=tab with aria-selected and aria-controls, and role=tabpanel; arrow keys between tabs are up to your script.",
  html: `<div style="width: 320px">
  <div role="tablist" aria-label="Appearance">
    <button role="tab" aria-selected="true">Appearance</button>
    <button role="tab" aria-selected="false">Fonts</button>
    <button role="tab" aria-selected="false">Sound</button>
  </div>
  <div role="tabpanel">
    <div class="field-row"><label for="clio-theme">Theme:</label>
      <select id="clio-theme"><option>Mac OS Default</option></select>
    </div>
  </div>
</div>`,
  evidence: [
    { era: "system7", claim: "System 7 had no tab control; the System 6 adaptation is used", status: "adapted", source: "clio.css", upstream: "System 7.5.3" },
    { era: "system6", claim: "Boxed labels that join the panel", status: "adapted", source: "clio.css", upstream: "System 6 had no tab control" },
    { era: "platinum", claim: "Tab art: sloped caps, #ccc tabs, the front tab #eee and 2px taller, drawn by tooling/tab-art.py from the measured geometry", status: "measured", source: "tooling/tab-art.py, from AI System 6 specimen selected-tab (GUIdebook Mac OS 9.0 Appearance)", upstream: "95.7% identical against GUIdebook (selected-tab)" },
    { era: "drawingboard", claim: "Tabs: the theme's left end (6px) and right end (17px, 2px taller) with the right end's first column stretched between; the front tab is the content colour and opens into the panel", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "NTabLeft and NTabRight found 1:1 at (244,96) and (327,94)" },
    { era: "nextstep", claim: "NeXTSTEP 3.3 had no tab control; tabs take the button's bevel", status: "adapted", source: "clio.css", upstream: "NeXTSTEP User Interface Guidelines, Release 3 has no tab view" },
  ],
};

export default component;
