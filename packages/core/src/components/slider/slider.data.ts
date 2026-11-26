// Slider: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "slider",
  name: "Slider",
  summary: "<input type=range> as the Appearance slider, with optional tick marks.",
  selectors: ["input[type=range]", "input[type=range].ticks"],
  tokens: ["--clio-slider-height", "--clio-art-slider-track", "--clio-art-slider-thumb", "--clio-slider-tick-count"],
  accessibility: "Native range input: label it, and say the value with aria-valuetext when the number alone means little.",
  html: `<label for="clio-rate">Key Repeat Rate</label>
<input id="clio-rate" type="range" class="ticks" min="0" max="4" value="2" style="width: 120px; --clio-slider-tick-count: 5">`,
  evidence: [
    { era: "platinum", claim: "A 7-row track (light, black, three grey, black, white), a 15x16 thumb pointing down, tick marks of white, black and #888", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), frame mouse (Mouse Tracking); tooling/hig-art.py", upstream: "track and thumb 100% identical; the held thumb was not captured" },
    { era: "platinum", claim: "The thumb stops 3px inside the track at both ends (Firefox's thumb is held there by padding)", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (driven by hand, frames in .fidelity/hig/platinum9), Mouse Tracking dragged to each end (frames slider-min, slider-max)", upstream: "specimens p9-slider-min and p9-slider-max 100% identical in Chromium, WebKit and Firefox" },
    { era: "both", claim: "Tick marks fall on whole pixels, (width - run) / (count - 1) rounded", status: "adapted", source: "clio.css", upstream: "each browser rounded a fractional spacing its own way; the Mac's tick placement was not measured" },
    { era: "drawingboard", claim: "The theme's 9x16 thumb (1106, through 16 bits) on a 1px pencil track (ppat 7024)", status: "measured", source: "the theme file's pxm# and ppat resources (tooling/db-art.py); clio.css capture, Mac OS 8.5 with Drawing Board in Infinite Mac (frames in .fidelity/hig/drawingboard), frame keyboard", upstream: "thumb and track pen found 1:1; ticks not reproduced" },
    { era: "system7", claim: "System 7 had no slider in the Toolbox (each control panel drew its own); it uses Platinum's", status: "adapted", source: "clio.css", upstream: "Macintosh Human Interface Guidelines (1992), ch. 7: Controls Not Supported by the Toolbox" },
    { era: "system6", claim: "System 6 had none; it uses Platinum's", status: "adapted", source: "clio.css", upstream: "—" },
    { era: "both", claim: "A dial is a slider: the 1992 guidelines' \"slider (sometimes called a dial)\", HIG87's indicator that shows and sets a value", status: "inferred", source: "Macintosh Human Interface Guidelines (1992), ch. 7: Sliders", upstream: "no other dial control was found in any era" },
    { era: "nextstep", claim: "Slider: a 16px lane of the scroller's dots, black at the top and left, white at the bottom and right; the 20x14 knob, a raised bevel with a groove down its middle and a #555555 shadow on its right", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame prefs3 (Preferences, Display, Automatic Dimming, 170x16); tooling/nx-art.py check", upstream: "fidelity nx-slider, identical in Chromium, WebKit and Firefox" },
  ],
};

export default component;
