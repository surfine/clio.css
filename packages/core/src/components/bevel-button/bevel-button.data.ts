// Bevel button: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "bevel-button",
  name: "Bevel button",
  summary: "A square bevelled button for an icon or a short label: push button, toggle (aria-pressed) or menu (class menu).",
  selectors: [".bevel", ".bevel.menu", ".bevel[aria-pressed=true]", ".bevel:active"],
  tokens: ["--clio-art-bevel", "--clio-art-bevel-held", "--clio-bevel-slice"],
  accessibility: "A real button: label icon-only ones; a menu bevel needs aria-haspopup and aria-expanded.",
  html: `<button class="bevel menu" style="width: 36px; height: 27px" aria-label="Shortcuts" aria-haspopup="menu">☞</button>
<button class="bevel" aria-pressed="true" style="width: 36px; height: 27px">B</button>`,
  evidence: [
    { era: "platinum", claim: "#666/#333 outline, white light, #ccc face, #999/#777 shade, 3px corners; held dark; a 3x2 menu arrow 5px from the right and 4px up", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frames nav and nav-bevel-held (Navigation Services)", upstream: "normal with its menu arrow 100% identical; the held frame's bottom row was under the opened menu and is the right edge's #444 (inferred)" },
    { era: "drawingboard", claim: "Drawn as the theme's push button (pens, corner pixels, hatch)", status: "inferred", source: "clio.css", upstream: "the Navigation Services bevel buttons were not matched pen for pen" },
    { era: "system7", claim: "Earlier eras had none; they use Platinum's", status: "adapted", source: "clio.css", upstream: "Mac OS 8 Human Interface Guidelines (1997), ch. 2 (Bevel Buttons)" },
    { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
  ],
};

export default component;
