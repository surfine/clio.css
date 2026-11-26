// Text field: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "text-field",
  name: "Text field",
  summary: "Single-line inputs and <textarea>.",
  selectors: ["input[type=text]", "input[type=search]", "input[type=email]", "input[type=password]", "input[type=number]", "textarea"],
  tokens: ["--clio-field-bg", "--clio-field-border", "--clio-field-shadow", "--clio-field-padding", "--clio-field-height", "--clio-caret-height"],
  accessibility: "Keyboard focus draws a ring around the field in addition to the caret.",
  html: `<div class="field-row-stacked" style="width: 240px">
  <label for="clio-name">Name:</label>
  <input id="clio-name" type="text" value="Untitled" style="width: 100%">
  <label for="clio-notes">Notes:</label>
  <textarea id="clio-notes" rows="3" style="width: 100%">Text areas scroll with the era's scroll bar.</textarea>
</div>`,
  evidence: [
    { era: "system7", claim: "As System 6: a 1px black frame with the text 3px in", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame numbers (Currency Symbol)", upstream: "System 7.5.3" },
    { era: "system6", claim: "1px ink frame, white, text inset 3px", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame control-panel (RAM Cache field), get-info (comments)", upstream: "System 6.0.8" },
    { era: "system7", claim: "clio.js: the insertion point in a field inside a window is TextEdit's: a 1px XOR line 16px tall (--clio-caret-height), in the pixel left of the character, shown at once after each move; the browser's caret while text is selected or an input method composes; lit and still under reduced motion; none in forced colours; data-clio-caret=\"off\" opts out", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, Find File's field (frame caret: 1px at the field's third column, rows 2-17 of a 20px field)", upstream: "specimen s7-js-caret 100% identical in all three engines; npm run behaviour checks the blink, the hand-over and the opt-out" },
    { era: "both", claim: "clio.js: the same insertion point shape in every era (System 6, Mac OS 8 and 9 use TextEdit's)", status: "inferred", source: "the System 7 measurement", upstream: "the shape not measured outside System 7.5.3; the blink is (row below)" },
    { era: "platinum", claim: "White field, 1px black frame, #888 shadow above-left and white etch below-right", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:935 (P30)", upstream: "Infinite Mac Mac OS 9.0 capture" },
    { era: "platinum", claim: "Focus: a 2px #6666cc ring", status: "measured", source: "apps/desktop/styles/65-platinum-utility.css:38", upstream: "Mac OS 9 capture platinum-native/10b-fonts-tab" },
    { era: "drawingboard", claim: "Edit text: a 1px line of pattern pens (ppat 7003-7006), the rows tiled from the white's left edge, the left column from its top and the right column from 1px higher; 1px of whatever is behind inside it, then white", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame date-time; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "both Date & Time fields agree" },
    { era: "platinum", claim: "Keyboard focus: a 2px ring of #6666cc (Purple highlight) round the field, its outer corners left out; list boxes take it too", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/hig/platinum9), frame date-time-edit", upstream: "100% identical" },
    { era: "both", claim: "The insertion point blinks every 32 ticks (CaretTime) in System 6 and 7; Mac OS 9's General Controls default blinks about every 48 ticks", status: "measured", source: "clio.css capture in Infinite Mac: System 6.0.8 Find File (mean 533 ms over 15 changes), System 7.5.3 Find File (516-634 ms), Mac OS 9.0 General Controls' preview at its middle setting (731-867 ms, mean 795 ms); CaretTime = (PRAM misc & 15) x 4 with factory misc $88, Mac IIx and Quadra 650 ROMs", upstream: "clio.js blinks its insertion point at --clio-caret-ticks: 32 in System 6 and 7, 48 in Mac OS 8 and 9 (Drawing Board inferred from Mac OS 9)" },
    { era: "nextstep", claim: "Text field: a white well 21px tall, no border: two #555555 lines top and left, #aaaaaa then white bottom and right; the top lines run to the right edge, the bottom ones from the left", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame open-panel (Edit's Open panel, the Name field, 241x21)", upstream: "fidelity nx-field-left, nx-field-right" },
    { era: "nextstep", claim: "Keyboard focus: the dotted frame", status: "adapted", source: "clio.css", upstream: "NeXT marked the key field with its blinking caret only" },
  ],
};

export default component;
