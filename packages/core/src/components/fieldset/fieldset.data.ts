// Group box: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "fieldset",
  name: "Group box",
  summary: "A <fieldset> with a <legend>, for grouping controls.",
  selectors: ["fieldset", "legend"],
  tokens: ["--clio-group-border", "--clio-group-shadow"],
  accessibility: "A fieldset's legend names the group for screen readers.",
  html: `<fieldset style="width: 260px">
  <legend>Sound</legend>
  <div class="field-row"><label><input type="checkbox" checked> Play system alerts</label></div>
</fieldset>`,
  evidence: [
    { era: "system7", claim: "Native group box: a 1px grey line with the legend on it; the original alternates #777 and #888, drawn #777 here", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frames general-controls and numbers", upstream: "System 7.5.3 control panels" },
    { era: "system6", claim: "System 6 had no group box; clio.css draws a 1px ink frame with the legend on paper", status: "adapted", source: "clio.css", upstream: "Control Panel divides its panes with plain 1px rules (clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame control-panel)" },
    { era: "platinum", claim: "Etched: #888 line with a white line inside and below", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:909 (P20)", upstream: "Mac OS 9 native group box" },
    { era: "drawingboard", claim: "Group boxes: a 1px #777 line (#888 on the bottom and right edge), no bevel", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame general-controls", upstream: "Desktop group" },
    { era: "platinum", claim: "Secondary group box (fieldset.secondary): one #888 line, no light", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/hig/platinum9), frame sound (Settings for selected device)", upstream: "—" },
    { era: "both", claim: "A check box or pop-up menu can title a group box from inside the legend", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/platinum9), frame date-time (Use a Network Time Server)", upstream: "—" },
    { era: "nextstep", claim: "Box: a #555555 outline with a white one drawn over it a pixel down and right", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame prefsapp-moved (Preferences, Mouse), the Menu Button box)", upstream: "fidelity nx-box-corner" },
    { era: "nextstep", claim: "The box's title centred across its top line, the lines broken round it", status: "inferred", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame prefsapp-moved (Preferences, Mouse))", upstream: "the title is Helvetica and is not compared" },
  ],
};

export default component;
