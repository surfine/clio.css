// Rounded-corner window: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "rounded-window",
  name: "Rounded-corner window",
  summary: "The desk accessory's window (rDocProc): rounded corners and a black title bar, as the Calculator draws it in every Classic era.",
  selectors: [".rounded-window", ".rounded-window.inactive", ".rounded-title", ".rounded-title > .close", ".rounded-title > h2"],
  tokens: ["--clio-rounded-bg", "--clio-art-rdoc-mask-tl", "--clio-art-rdoc-frame-tl"],
  accessibility: "Label the close box (aria-label=\"Close\") and keep the title a real heading. The corners are a mask: keep content 6px clear of them.",
  html: `<div class="rounded-window" style="width: 160px; height: 90px">
  <div class="rounded-title">
    <button class="close" aria-label="Close"></button>
    <h3>Calculator</h3>
  </div>
</div>`,
  evidence: [
    { era: "system6", claim: "A 1px black frame whose corners step in 5, 3, 2, 1, 1 pixels (the frame follows the same curve one pixel in); a 17-row black title bar ruled below; an 11px white close box at (9,4); the title in white, centred right of the close box. In the background: a white bar, a black title, no close box", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the Calculator (Apple menu), frames rdoc-calc and rdoc-calc-inactive; tooling/rare-art.py", upstream: "specimens s6-rdoc-title, -title-inactive, -left, -bottom-left 100% identical" },
    { era: "system7", claim: "The same window in System 7.5.3", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the Calculator, frame rdoc-calc", upstream: "specimens s7-rdoc-title and s7-rdoc-left 100% identical" },
    { era: "platinum", claim: "Mac OS 9.0 draws the old window unchanged, its title in the system font antialiased (white on black; black on white in the background)", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the Calculator, frames rdoc-calc and rdoc-calc-inactive; levels in tooling/aa-palettes.py", upstream: "specimens p9-rdoc-title and -title-inactive 100% identical but for ten faint title pixels the font lacks (masked); the title's place fitted to this capture" },
    { era: "drawingboard", claim: "Drawing Board leaves it as Platinum does", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the Calculator, frame rdoc-calc", upstream: "specimen db-rdoc-title 100% identical (the same ten pixels masked)" },
    { era: "both", claim: "The Calculator's heavy right and bottom edge (3px) is its own drawing, not the window's", status: "inferred", source: "Inside Macintosh: Macintosh Toolbox Essentials (1992), ch. 4 (rDocProc drawn with a plain frame)", upstream: "the left edge is 1px in the same frames; no other rDocProc window was found" },
  ],
};

export default component;
