// Side-title utility window: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "side-utility-window",
  name: "Side-title utility window",
  summary: "A floating window whose title bar runs down its left side (kWindowFloatSide*): close box at the top, collapse box at the foot.",
  selectors: [".window.utility.side", ".window.utility.side.inactive"],
  tokens: [],
  accessibility: "The title is not drawn but stays in the markup for assistive technology; label both boxes.",
  html: `<div class="window utility side" style="width: 200px; height: 80px">
  <div class="title-bar">
    <button class="close" aria-label="Close"></button>
    <h3 class="title">Tools</h3>
    <button class="collapse" aria-label="Collapse"></button>
  </div>
  <div class="window-pane"></div>
</div>`,
  evidence: [
    { era: "platinum", claim: "The utility window's frame (1px black, white light top and left, #999 shade right and bottom, the drop from the second row and column); a 10px #ccc bar down the left with the 10x10 close box at its top, the dot pattern from 12px below it to 12px above the foot, and the collapse box turned on its diagonal at the foot; no title. In the background: #555 frame and drop on flat #ddd", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the Appearance SDK's sample (Developer > Appearance SDK > Appearance Sample, Examples > Side Utility Window), frame side-utility; tooling/rare-art.py", upstream: "specimens p9-side-bar, -top, -right, -bottom, -inactive 100% identical" },
    { era: "both", claim: "Without a collapse box the dot pattern keeps the same 12px from the foot", status: "inferred", source: "clio.css", upstream: "the sample's window has both boxes" },
    { era: "drawingboard", claim: "The theme's own frame as its 'layo' 138 (ActiveSideFloatingWindow) lays it out: a 14px column (the small system font's 9px height plus 5) of the Util LSide pieces 6205-6209 clipped to it, the content 18px in and 9px down, the utility pieces 6192-6204 and 6213/6214 round it, the close box (201) 6px in and 8px down, the collapse box upright (211's third picture) 7px above the foot", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity, see tooling/fidelity.ts): the same sample, frame side3 in the rc8 run; tooling/theme-layout.py decodes the theme's 'layo' resources and draws them from the pieces", upstream: "the drawing matches the capture's 4123 frame pixels 100% (theme-layout.py --check); specimens db-side-bar, -top, -right, -bottom 100% identical" },
    { era: "drawingboard", claim: "In the background: the same frame and no boxes", status: "inferred", source: "clio.css — the theme's 'layo' 139 (InactiveSideFloatingWindow): the same pieces, whose inactive pictures are identical, and no box parts", upstream: "no capture of a background side window (the rc8 run's background utility window is half-drawn)" },
    { era: "drawingboard", claim: "A pressed box shows its second picture", status: "inferred", source: "clio.css — pxm 201 and 211 carry two pictures per box, as the document window's 200/210/220 (normal, pressed)", upstream: "the capture has no pressed box" },
    { era: "drawingboard", claim: "The content keeps the utility window's #ccc", status: "adapted", source: "clio.css", upstream: "the application draws the content" },
    { era: "system7", claim: "System 7 had no side-title window in the Toolbox; the class keeps System 7's top-title utility window", status: "adapted", source: "clio.css", upstream: "Mac OS 8 Toolbox Reference: kWindowFloatSideProc came with the Appearance Manager" },
    { era: "system6", claim: "Likewise System 6", status: "adapted", source: "clio.css", upstream: "—" },
  ],
};

export default component;
