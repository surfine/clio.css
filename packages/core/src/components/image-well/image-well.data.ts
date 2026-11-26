// Image well: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "image-well",
  name: "Image well",
  summary: "A sunken well holding a picture or an icon.",
  selectors: [".image-well"],
  tokens: ["--clio-image-well-bg", "--clio-field-border", "--clio-field-shadow"],
  accessibility: "Describe the picture with alt text; a well that accepts drops needs a keyboard alternative.",
  html: "<div class=\"image-well\" style=\"width: 48px; height: 48px\">◆</div>",
  evidence: [
    { era: "both", claim: "Drawn like the era's text field frame round a white face", status: "inferred", source: "clio.css", upstream: "no image well was on the captured screens (the Appearance desktop preview is a picture, not a well)" },
  ],
};

export default component;
