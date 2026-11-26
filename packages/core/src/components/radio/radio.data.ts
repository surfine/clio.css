// Radio button: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "radio",
  name: "Radio button",
  summary: "A radio button drawn on the native <input type=radio>.",
  selectors: ["input[type=radio]"],
  tokens: ["--clio-radio-size", "--clio-radio-off", "--clio-radio-on"],
  accessibility: "Native input; group radios with the same name inside a fieldset with a legend.",
  html: `<fieldset>
  <legend>Highlight</legend>
  <div class="field-row-stacked">
    <label><input type="radio" name="hl" checked> Lavender</label>
    <label><input type="radio" name="hl"> Graphite</label>
    <label><input type="radio" name="hl" disabled> Other</label>
  </div>
</fieldset>`,
  evidence: [
    { era: "system7", claim: "Identical to System 6", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame general-controls", upstream: "100% identical, on and off" },
    { era: "system6", claim: "12px ring and 6px dot: the real pixels match system.css's art exactly", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame control-panel (Rate of Insertion Point Blinking)", upstream: "art from system.css icon/radio-border.svg, radio-dot.svg (MIT, Sakun Acharige)" },
    { era: "platinum", claim: "Radio button: Mac OS 9's shaded 12px ball, off and on; the held states are still drawn with CSS gradients", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame general-controls; redrawn by tooling/p9-art.py", upstream: "Documents group; off and on 100% identical" },
    { era: "drawingboard", claim: "Radio button: the theme's 16x12 pictures; image 0 off, 1 on, 2 pressed, 3/4 disabled", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames general-controls and date-time; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "off and on found 1:1 (Documents, Menu Bar Clock)" },
    { era: "nextstep", claim: "Radio button: a 15x15 ring, #555555 and black on the upper left, white on the lower right; on, a white disc inside it; the panel's grey round and inside the ring is left transparent", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame prefsapp-moved (Preferences, Mouse), Menu Button: Enabled on, Disabled off); tooling/nx-art.py check", upstream: "fidelity nx-radio-on, nx-radio-off; AI System 6's 12px ring corrected" },
  ],
};

export default component;
