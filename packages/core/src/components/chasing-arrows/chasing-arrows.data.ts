// Chasing arrows: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "chasing-arrows",
  name: "Chasing arrows",
  summary: "The asynchronous progress indicator: two arrows chasing round a circle.",
  selectors: [".chasing-arrows"],
  tokens: ["--clio-art-chasing-arrows", "--clio-chasing-arrows-frames"],
  accessibility: "Give it role=status and a label saying what is going on; it stands still under prefers-reduced-motion.",
  html: "<span class=\"chasing-arrows\" role=\"status\" aria-label=\"Looking for servers\"></span> Looking for servers…",
  evidence: [
    { era: "platinum", claim: "16x16, three frames read 0.7s apart (their order is not known); turned by a transform, not repainted", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frames netb-0..2 (Network Browser)", upstream: "first frame 100% identical" },
    { era: "drawingboard", claim: "The theme's six frames (390)", status: "measured", source: "the theme file's pxm# and ppat resources (tooling/db-art.py)", upstream: "not on screen in the capture" },
    { era: "system7", claim: "Earlier eras showed a spinning watch cursor instead; they use Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
    { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
  ],
};

export default component;
