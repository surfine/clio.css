// Dialogs and alerts: markup, selectors, tokens and evidence (statuses: AGENTS.md). Edit here, then `npm run build`.
import type { Component } from "../../types.ts";

const component: Component = {
  id: "dialog",
  bare: true,
  name: "Dialogs and alerts",
  summary: "The modal dialog frame, the alert layout with an icon, and the plain shadowed box.",
  selectors: [".modal-dialog", ".alert-box", ".standard-dialog", ".modeless-dialog", ".alert-icon", ".dialog-buttons"],
  aliases: {
    "system.css": [".modal-dialog", ".alert-box", ".standard-dialog", ".outer-border", ".inner-border", ".modal-contents"],
  },
  tokens: ["--clio-dialog-bg", "--clio-modal-border", "--clio-modal-frame", "--clio-plain-dialog-shadow"],
  accessibility: "Put the classes on a native <dialog> opened with showModal() to get focus trapping and Escape; label it with aria-labelledby.",
  html: `<div class="alert-box" role="alertdialog" aria-labelledby="clio-alert-msg" style="width: 340px">
  <span class="alert-icon caution" aria-hidden="true"></span>
  <p id="clio-alert-msg">Save changes to the document “Untitled” before closing?</p>
  <div class="dialog-buttons">
    <button>Don’t Save</button>
    <button>Cancel</button>
    <button class="default">Save</button>
  </div>
</div>`,
  variants: [
    {
      name: "Plain box",
      note: "The shadowed box, for a message with no frame of its own.",
      html: `<div class="standard-dialog" style="width: 280px">
  <p style="margin: 0">Welcome to Macintosh.</p>
</div>`,
    },
  ],
  evidence: [
    { era: "system7", claim: "Alert frame: 1px black, a raised #ccf/#669 ring, #bbb, a sunken #669/#ccf ring, 1px black (5px, as in System 6)", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame page-setup", upstream: "100% identical. An alert without a colour table keeps System 6's black frame (Monitors & Sound alert); clio.css draws the colour one" },
    { era: "system6", claim: "Modal frame: 1px ink, 2px paper, 2px ink, and no drop shadow", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert", upstream: "AI System 6 has two recipes, both off (84-clio-write.css:210 has a 1px gap)" },
    { era: "system6", claim: "Plain box: 1px ink frame and a 2px drop shadow", status: "inferred", source: "not measured", upstream: "altDBoxProc; none of the 6.0.8 Finder and TeachText dialogs opened for capture (alerts, Standard File, About the Finder) uses it" },
    { era: "both", claim: "The alert icon is drawn here, not Apple's", status: "adapted", source: "clio.css", upstream: "no Apple icons are shipped" },
    { era: "platinum", claim: "1px black frame over #ddd, inner bevel of three white steps inside #555/#999/#aaa, 1px black drop", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:840 (P06)", upstream: "GUIdebook Mac OS 9.0 About application (about-alert specimen)" },
    { era: "drawingboard", claim: "Alerts: the theme's eight Alert pictures (6127-6134) round the outline, edges tiled from their ends, on the window paper from 4px inside", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame energy-saver-alert; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "every piece found 1:1 round Energy Saver's start-up notice" },
    { era: "drawingboard", claim: "Movable modal dialogs (.modeless-dialog, which is a .window) draw the document window's frame: #222 outline, 4px #cdc6bd frame, #777 inner line, 20px title bar over a #555 rule, the #777 band right and below", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame copy-progress-5", upstream: "Finder copy window; Movable_Modal pixmaps found 1:1" },
    { era: "drawingboard", claim: "Modal dialogs: the Modal pictures (6135-6142), which have the alert's sizes, placed the same way", status: "inferred", source: "the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "no modal dialog was on screen in the captures" },
    { era: "platinum", claim: "Separator line (.separator, <hr class=separator>): etched, #888 then white one row lower and one column further right", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, frame hig/platinum9/mouse", upstream: "100% identical" },
    { era: "system7", claim: "Separator line: a 3px band of QuickDraw's 50% grey, aligned to the screen", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, frame hig/system7/memory", upstream: "—" },
    { era: "system6", claim: "Separator line: 1px of ink", status: "inferred", source: "clio.css", upstream: "—" },
    { era: "nextstep", claim: "A panel (Info): a window with the key title bar and a close button, no resize bar; its details in a box with no title", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame ns30b/infopanel (Workspace's Info panel, 380x264)", upstream: "fidelity nx-panel-top, nx-panel-foot, nx-box-plain" },
    { era: "nextstep", claim: "Attention panel: #aaaaaa, the 1px black frame, the key window's title bar with no title and no buttons, no shadow; a groove (#555555 over white) 86 rows in; the buttons 8px from the lower right and 8px apart", status: "measured", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame logout-alert (Workspace's Log Out panel, 364x185)", upstream: "fidelity nx-alert-titlebar, nx-alert-groove, nx-alert-buttons" },
    { era: "nextstep", claim: "Above the groove the application's 48px icon and the panel's title (its aria-label) in Helvetica 18; the message centred below", status: "inferred", source: "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30), frame logout-alert (positions read from the frame; text and icon are not compared)", upstream: "NeXTSTEP User Interface Guidelines, Release 3 p.84-87" },
    { era: "nextstep", claim: "The application's icon, not a symbol: without one the slot stays empty", status: "inferred", source: "NeXTSTEP User Interface Guidelines, Release 3 p.84", upstream: "AI System 6 shows none either" },
  ],
};

export default component;
