// Pull-down list (NeXTSTEP): markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "pull-down",
  eras: ["nextstep"],
  name: "Pull-down list (NeXTSTEP)",
  summary: "A button that opens a list of commands; its title stays the same. NeXTSTEP only.",
  selectors: [".pull-down"],
  tokens: ["--clio-button-bg"],
  accessibility: "A <button class=\"pull-down\" aria-haspopup=\"menu\" aria-expanded=\"false\"> that opens a role=menu list.",
  html: "<button class=\"pull-down\" aria-haspopup=\"menu\" aria-expanded=\"false\">Operations</button>",
  evidence: [
    { era: "nextstep", claim: "A push button with the menu's arrow at its right, title at the left", status: "inferred", source: "NeXTSTEP User Interface Guidelines, Release 3, ch. 7 (pop-up and pull-down lists)", upstream: "not captured" },
  ],
};

export default component;
