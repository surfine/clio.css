// List box: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "listbox",
  bare: true,
  name: "List box",
  summary: "A scrolling list with one or more selected rows, as in the Open dialog.",
  selectors: [".listbox", "[role=listbox]", "[role=option]", "[aria-selected=true]", ".selected"],
  tokens: ["--clio-list-bg", "--clio-list-border", "--clio-list-shadow", "--clio-list-row", "--clio-selection-bg", "--clio-selection-fg"],
  accessibility: "Use role=listbox and role=option with aria-selected; move focus with your script (roving tabindex).",
  html: `<ul class="listbox" role="listbox" aria-label="Documents" style="width: 220px; height: 82px">
  <li role="option" aria-selected="true">Apple DVD Player</li>
  <li role="option">Apple Video Player</li>
  <li role="option">AppleCD Audio Player</li>
  <li role="option">QuickTime</li>
  <li role="option">Security</li>
  <li role="option">SimpleText</li>
</ul>`,
  evidence: [
    { era: "system7", claim: "As System 6: a selected row inverts across the list", status: "inferred", source: "seen in the Keyboard control panel during capture; the Color control panel's highlight colour is Black & White (System 7.5.3 in Infinite Mac); the row itself not pixel-checked", upstream: "System 7.5.3" },
    { era: "system6", claim: "White list, 1px ink frame, 16px rows; a selected row inverts across the whole list width", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames save-dialog and list-selected (Standard File)", upstream: "System 6.0.8 TeachText Save As" },
    { era: "platinum", claim: "Selection is lavender #ccccff with black text", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:128", upstream: "GUIdebook Mac OS 9.0 Open dialog (open-list-scrollbar specimen)" },
    { era: "platinum", claim: "Rows carry no divider", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:860 (P10)", upstream: "Mac OS 9 native list capture 21" },
    { era: "drawingboard", claim: "List boxes: a 2px olive #9c9c63 line, 1px of whatever is behind inside it (the pane's paper), white rows, the chosen row #ccf with black text", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame desktop-tab", upstream: "pattern list, lower-left corner" },
    { era: "nextstep", claim: "Lists: white, 1px black frame, 16px rows; a selected row is white on a light-grey cell in a browser, light grey in a plain list", status: "inferred", source: "AI System 6 69-nextstep-appearance.css", upstream: "not captured" },
  ],
};

export default component;
