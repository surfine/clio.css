// Help button: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "help-button",
  name: "Help button",
  summary: "The square button with the help icon in a dialog's lower left.",
  selectors: [".help-button"],
  tokens: ["--clio-art-help-button"],
  accessibility: "aria-label=\"Help\"; it should open help about the dialog.",
  html: "<button class=\"help-button\" aria-label=\"Help\"></button>",
  evidence: [
    { era: "platinum", claim: "21x20, a small bevel button with the help icon", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frame keyboard", upstream: "100% identical" },
    { era: "drawingboard", claim: "As the Keyboard control panel draws it", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity/hig/drawingboard), frame keyboard", upstream: "the held state was not captured" },
    { era: "system7", claim: "Earlier eras used a Help push button; they use Platinum's", status: "adapted", source: "clio.css", upstream: "Mac OS 8 Human Interface Guidelines (1997), ch. 2 (Help Button Layout)" },
    { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
  ],
};

export default component;
