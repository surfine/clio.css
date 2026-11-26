// Disclosure triangle: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "disclosure",
  name: "Disclosure triangle",
  summary: "The triangle that shows and hides a list's or a dialog's details. A <details> summary gets it too.",
  selectors: [".disclosure", ".disclosure[aria-expanded=true]", "details > summary", "details[open] > summary"],
  tokens: ["--clio-disclosure-size", "--clio-art-disclosure", "--clio-art-disclosure-open"],
  accessibility: "Use a <button> with aria-expanded and aria-controls, or <details>/<summary>, which keyboards and screen readers already understand.",
  html: `<details open>
  <summary>Control Panels &amp; Extensions</summary>
  <p style="margin: 4px 0 0 17px">Appearance</p>
</details>
<button class="disclosure" aria-expanded="false" aria-label="Show Developer"></button> Developer`,
  evidence: [
    { era: "system7", claim: "11px, a black outline with a blue and white checker inside, closed and open", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frames in .fidelity/hig/system7), frames list and list-open (Finder, View by Name)", upstream: "Control Panels & Extensions" },
    { era: "system6", claim: "System 6 had no disclosure triangle; it uses System 7's", status: "adapted", source: "clio.css", upstream: "Macintosh Human Interface Guidelines (1992), ch. 7 (outline triangles)" },
    { era: "platinum", claim: "13px with its shadow, closed and open (the Finder list view)", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frames list and list-open; tooling/hig-art.py", upstream: "100% identical, both states" },
    { era: "drawingboard", claim: "The theme's 11px pictures, closed (340) and open (343, drawn through 16 bits)", status: "measured", source: "the theme file's pxm# and ppat resources (tooling/db-art.py)", upstream: "both found 1:1 in the Finder list view" },
  ],
};

export default component;
