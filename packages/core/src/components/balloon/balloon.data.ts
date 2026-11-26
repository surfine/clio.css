// Help balloon: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "balloon",
  name: "Help balloon",
  summary: "Balloon Help: a white balloon with a tail pointing at what it describes.",
  selectors: [".balloon"],
  tokens: ["--clio-art-balloon", "--clio-art-balloon-tail"],
  accessibility: "role=tooltip, referenced by aria-describedby from the thing it explains; show it on focus as well as hover.",
  html: "<div class=\"balloon\" role=\"tooltip\" style=\"margin-top: 24px\">Hard disk<br><br>A hard disk is a device that stores large numbers of files and folders.</div>",
  evidence: [
    { era: "platinum", claim: "A rounded outline with a 2px drop on the right and below (10px corners), a tail rising from the top edge near the right", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frame balloon (Infinite HD)", upstream: "top and bottom corners 100% identical; the tail's tip was under the pointer (inferred)" },
    { era: "system7", claim: "The same balloon in System 7 and Drawing Board", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frames in .fidelity/hig/system7), frame balloon (Trash); clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity/hig/drawingboard), frame balloon", upstream: "compared by eye, not pixel by pixel" },
    { era: "system6", claim: "System 6 had no Balloon Help; it uses the later balloon", status: "adapted", source: "clio.css", upstream: "Macintosh Human Interface Guidelines (1992), ch. 11" },
  ],
};

export default component;
