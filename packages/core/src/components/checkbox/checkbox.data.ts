// Check box: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "checkbox",
  name: "Check box",
  summary: "A check box drawn on the native <input type=checkbox>; no extra label markup needed.",
  selectors: ["input[type=checkbox]", "label > input[type=checkbox]", ".field-row"],
  tokens: ["--clio-check-size", "--clio-check-bg", "--clio-check-border", "--clio-check-shadow", "--clio-check-mark"],
  accessibility: "Native input, so keyboard, form and screen-reader behaviour are the browser's. In forced-colours mode the control returns to the system's own drawing.",
  html: `<div class="field-row-stacked">
  <label><input type="checkbox" checked> Show warnings</label>
  <label><input type="checkbox"> Use small icons</label>
  <label><input type="checkbox" checked disabled> Locked</label>
</div>`,
  evidence: [
    { era: "system7", claim: "Identical to System 6: 12px, X when checked", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame general-controls", upstream: "100% identical, on and off" },
    { era: "system6", claim: "A 12px box with a 1px frame; held, the frame thickens to 2px", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame get-info (Locked)", upstream: "AI System 6 uses 13px" },
    { era: "system6", claim: "Checked draws an X from corner to corner of the box", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame get-info-checked (Locked)", upstream: "the art is system.css's checkmark.svg (MIT), which matches" },
    { era: "system6", claim: "X art", status: "third-party", source: "apps/desktop/assets/themes/classic/controls/checkmark.svg", upstream: "system.css icon/checkmark.svg (MIT, Sakun Acharige)" },
    { era: "platinum", claim: "12px #ddd well, 1px black frame, white top-left and #888 bottom-right bevel", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:897 (P18)", upstream: "GUIdebook Mac OS 9.0 Appearance Options tab (checkbox specimens)" },
    { era: "platinum", claim: "Check mark: Mac OS 9's grey-shaded mark inside the frame, overhanging its right edge by two pixels", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame general-controls; redrawn by tooling/p9-art.py", upstream: "Show Desktop when in background; 96.4% identical (the frame 98.6%)" },
    { era: "drawingboard", claim: "Check box: the theme's 14x11 pictures; image 0 off, 1 on, 3 mixed, 4/5 pressed, 8/9 disabled", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames general-controls and date-time; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "off, on and disabled found 1:1 (Show Desktop, Show Launcher, Daylight-Saving Time is in effect)" },
    { era: "nextstep", claim: "Switch: a 15x15 raised square (white top and left, #555555 then black bottom and right); on, an embossed check", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame prefs-dock (Workspace Manager Preferences, Dock), the Dock list's switches); tooling/nx-art.py check", upstream: "fidelity nx-switch-on, nx-switch-off; AI System 6's 12px switch corrected" },
  ],
};

export default component;
