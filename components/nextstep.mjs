// NeXTSTEP 3.3 (D14): the evidence rows for the shared components, keyed by
// component id, and the components only NeXTSTEP has. index.mjs merges both.
// Sources:
//   NX30   NeXTStep 3.0 running in Infinite Mac (the Previous emulator), its 1120x832
//          canvas read 1:1 by tooling/emulator/drive.mjs; frames stay in .fidelity/ns30.
//          Infinite Mac has no 3.3; 3.0 is the nearest real 3.x system it runs, so a
//          row measured there names 3.0.
//   AIS6   AI System 6's 69-nextstep-appearance.css, ported as is: AI System 6 never
//          had a native 3.3 frame, so every value from it is inferred.
//   NXUG   NeXTSTEP User Interface Guidelines, Release 3 (NeXT, 1992-1993).

const NX30 = "clio.css capture, NeXTStep 3.0 in Infinite Mac (frames in .fidelity/ns30)";
const AIS6 = "AI System 6 69-nextstep-appearance.css";
const NXUG = "NeXTSTEP User Interface Guidelines, Release 3";
const row = (claim, status, source, upstream) => ({ era: "nextstep", claim, status, source, upstream });

export const rows = {
  window: [
    row("Title bar: 22 rows inside the 1px black frame: a 1px highlight on the top and left, 19 rows of face, a #555555 row and column on the bottom and right, a black line", "measured", NX30 + ", frame boot1 (File Viewer)", "agrees with AI System 6's P12"),
    row("Key window: black face, #aaaaaa highlight, white Helvetica Bold 12 title centred on the bar", "measured", NX30 + ", frame boot1 (File Viewer, the key window)", NXUG + ", ch. 4 (key and main windows)"),
    row("Main window that is not key: #555555 face, white highlight, white title (.window.main)", "inferred", AIS6 + " (.is-nextstep-main)", NXUG + ", ch. 4"),
    row("Inactive window: #aaaaaa face, white highlight, black title; the buttons stay", "inferred", AIS6 + " (P13)", NXUG + ", ch. 4"),
    row("Miniaturize button: 15x15, white top and left, #aaaaaa face, #555555 then black bottom and right, a black window outline inside; 2px in from the highlight, centred on the 19 rows", "measured", NX30 + ", frame boot1 (File Viewer, x 156-170, y 16-30); tooling/nx-art.py check", "the grid equals the frame's 225 pixels"),
    row("Close button: the same box with an embossed X; an edited document's X is broken in the middle", "inferred", AIS6 + " (P16, N12; assets/themes/nextstep/chrome)", "no close button on the captured frames yet"),
    row("A held title-bar button's face turns white", "inferred", AIS6 + " (P15)", "not captured"),
    row("Same DOM: the collapse box draws the miniaturize button at the left, the close box moves to the right, the zoom box (NeXT has none) is hidden and marks the window as resizable", "adapted", "clio.css", NXUG + ", ch. 4: miniaturize and close are the title bar's only buttons"),
    row("Resize bar: 9 rows under a resizable window, its two ends 28px wide, bevelled", "inferred", AIS6 + " (.nextstep-resize-strip, P19)", "geometry not yet measured"),
    row("No window shadow: the window is its 1px black frame", "inferred", AIS6 + " (P18)", NXUG + ", ch. 4"),
    row("Window and pane background #aaaaaa", "measured", NX30 + ", frame boot1", "File Viewer"),
    row("On touch screens each title-bar button gets a 45px hit area; its art stays 15px", "adapted", "clio.css", "AI System 6's coarse-pointer rule"),
  ],
  menu: [
    row("The menu bar is drawn as NeXT's main menu: a vertical panel 93px wide at the screen's top left, titled by its aria-label; a title opens its submenu to the right", "adapted", "clio.css (same DOM as the Classic menu bar)", NXUG + ", ch. 6 (the main menu)"),
    row("Menu title: 22 rows, black face, white Helvetica Bold 12 at x=5, a white highlight top and left, #555555 then black below", "measured", NX30 + ", frame boot1 (Workspace main menu)", "rows 0-21"),
    row("Menu cell: 20 rows: white top row and left column, 17 rows of #aaaaaa, a #555555 row and column, a black row and column; Helvetica 12 at x=5", "measured", NX30 + ", frame boot1 (Workspace main menu, Info to Log Out)", "every cell the same"),
    row("Submenu arrow: 7x7, a black upright and an embossed point (#555555 above, white below), 6px from the right", "measured", NX30 + ", frame boot1 (Info row, x 80-86); tooling/nx-art.py check", "the grid equals the frame"),
    row("Key equivalents: the plain letter at the cell's right (h, q)", "measured", NX30 + ", frame boot1 (Hide, Log Out)", NXUG + ", ch. 6"),
    row("A highlighted cell turns white", "inferred", AIS6 + " (--menu-item-active-bg)", "not captured"),
    row("No dividers and no check marks in NeXT menus; a separator item is not drawn", "inferred", NXUG + ", ch. 6", "the captured menus have none"),
    row("A torn-off submenu (.torn-off) carries a close button in its title bar; an attached one has none", "inferred", NXUG + ", ch. 6; " + AIS6 + " reference notes", "not captured"),
    row("clio.js: a clicked menu stays up; a press dragged through it chooses on release", "inferred", NXUG + ", ch. 6", "AI System 6 reference notes (Menus)"),
  ],
  button: [
    row("Push button: #aaaaaa face, no outline, a bevel of white top and left, black then #555555 bottom and right; Helvetica 12; 24px tall", "inferred", AIS6 + " (P31, --btn-shadow)", "AI System 6 Theme Lab default-ok (authored)"),
    row("Pressed: the face turns white, the bevel sinks (#555555 top and left, white bottom and right)", "inferred", AIS6 + " (--btn-active-*)", "not captured"),
    row("Default button: no ring; the return mark after the label", "inferred", AIS6 + " (NS04, --btn-default-return-mark)", NXUG + ", ch. 7 (buttons)"),
    row("Disabled: the label #555555, the bevel kept", "inferred", AIS6 + " (--system-disabled-fg)", "not captured"),
    row("Keyboard focus: a 1px dotted frame 2px out", "adapted", "clio.css", "NeXTSTEP 3.3 had no control focus; OPENSTEP's dotted frame is the family's mark"),
    row("Minimum width 82px", "inferred", AIS6 + " (--theme-button-min-width)", "AI System 6 reference widths"),
  ],
  checkbox: [
    row("Switch: a 12px raised square (#555555 border, white and #555555 bevel) on #aaaaaa; on, a black check", "inferred", AIS6 + " (P38, --choice-*)", "AI System 6 Theme Lab checkbox-checked (authored)"),
  ],
  radio: [
    row("Radio button: a 12px sunken ring, a black dot when on", "inferred", AIS6 + " (P38, --radio-image)", "not captured"),
  ],
  "text-field": [
    row("Text field: a white well, no border, #555555 two pixels on the top and left, white then #aaaaaa on the bottom and right; 21px tall", "inferred", AIS6 + " (P32, --field-shadow)", "not captured"),
    row("Keyboard focus: the dotted frame", "adapted", "clio.css", "NeXT marked the key field with its blinking caret only"),
  ],
  select: [
    row("Pop-up list: a push button with the raised 11x8 bar mark 5px from its right; no frame of its own", "inferred", AIS6 + " (P33, --system-select-arrow-bg)", "AI System 6 Theme Lab popup-normal (authored)"),
  ],
  listbox: [
    row("Lists: white, 1px black frame, 16px rows; a selected row is white on a light-grey cell in a browser, light grey in a plain list", "inferred", AIS6, "not captured"),
  ],
  scrollbar: [
    row("Scroller: an 18px lane of #555555 and #aaaaaa dots and a black line on the content's side (19px)", "inferred", AIS6 + " (P20, --window-frame-track-*)", "AI System 6 Theme Lab scroll-thumb (authored)"),
    row("Knob: a raised #aaaaaa square, at least as long as it is wide, with a 6x6 dimple in the middle", "inferred", AIS6 + " (P21, ns-knob-dimple-6.svg)", NXUG + ", ch. 7 (scrollers)"),
    row("Arrow buttons: 16x16 raised buttons with a black triangle, both at the bottom of a vertical scroller and at the left of a horizontal one", "inferred", AIS6 + " (ns-scroll-up-16.svg, C9)", NXUG + ", ch. 7, figure 14"),
    row("The browser's own scroll bar stays on the right (a page cannot move it); clio.js draws NeXT's on the left", "adapted", "clio.css", NXUG + ", ch. 7: the vertical scroller is on the left"),
  ],
  dialog: [
    row("Alert panel: #aaaaaa, the 1px black frame, a 22-row title bar with no buttons, no shadow; the application's icon instead of a symbol", "inferred", AIS6 + " (P30, --alert-icon-display: none)", NXUG + ", ch. 4 (panels) and ch. 8 (attention panels)"),
  ],
  fieldset: [
    row("Box: a #555555 line with a white line inside and below, the title on the box's line", "inferred", NXUG + ", ch. 7 (boxes)", "not captured"),
  ],
  progress: [
    row("Progress: a sunken #aaaaaa well filled with #555555, 18px", "inferred", AIS6 + " (--progress-*)", "not captured"),
  ],
  tabs: [
    row("NeXTSTEP 3.3 had no tab control; tabs take the button's bevel", "adapted", "clio.css", NXUG + " has no tab view"),
  ],
  desktop: [
    row("Workspace background #555555", "inferred", AIS6 + " (--desktop)", "NeXTStep 3.0 on a colour NeXT shows #555577 (frame boot1)"),
    row("Icon labels: Helvetica 12, black; a selected label on white", "inferred", AIS6 + " (--desktop-label-*)", "frame boot1 shows the selected home icon on white"),
  ],
  typography: [
    row("Helvetica 12 for chrome and text, Helvetica Bold 12 for window and menu titles, set without antialiasing", "measured", NX30 + ", frame boot1 (menu and title text: black and white pixels only)", NXUG + ", ch. 9 (fonts)"),
    row("Helvetica is named only as a local font; elsewhere Clio Sans NX (Liberation Sans 2, OFL, renamed) has Helvetica's advance widths", "third-party", "fonts/ClioSansNX*.woff2 (tooling/nx-font.py); THIRD-PARTY.md", "D3: a local name plus a fitted OFL fallback"),
  ],
  slider: [
    row("Slider: a sunken #555555 well, a raised square knob with the dimple", "inferred", NXUG + ", ch. 7 (sliders)", "not captured"),
  ],
};

export const components = [
  {
    id: "browser",
    eras: ["nextstep"],
    name: "Browser (NeXTSTEP)",
    summary: "NeXTSTEP's column browser: lists side by side, each item that leads further marked with an arrow. NeXTSTEP only (clio.nextstep.css).",
    selectors: [".browser", ".browser > .listbox", ".browser .branch"],
    tokens: ["--clio-browser-column", "--clio-browser-row"],
    accessibility: "Each column is a listbox; mark the selected item with aria-selected and give branches aria-haspopup or the class branch. Arrow keys between columns are up to your script.",
    html: `<div class="browser" style="width: 302px">
  <ul class="listbox" role="listbox" aria-label="Disk" style="height: 96px">
    <li role="option" class="branch" aria-selected="true">Apps</li>
    <li role="option" class="branch">Library</li>
    <li role="option">Welcome!</li>
  </ul>
  <ul class="listbox" role="listbox" aria-label="Apps" style="height: 96px">
    <li role="option">Edit.app</li>
    <li role="option">Mail.app</li>
  </ul>
</div>`,
    evidence: [
      row("Columns of 16px rows, white, divided by black lines; a branch carries the menu's arrow", "inferred", NXUG + ", ch. 7 (browsers)", "AI System 6 finder-columns.js"),
      row("Selected item: a raised light-grey cell", "inferred", NXUG + ", ch. 7", "not captured"),
    ],
  },
  {
    id: "pull-down",
    eras: ["nextstep"],
    name: "Pull-down list (NeXTSTEP)",
    summary: "A button that opens a list of commands; its title stays the same. NeXTSTEP only.",
    selectors: [".pull-down"],
    tokens: ["--clio-button-bg"],
    accessibility: "A <button class=\"pull-down\" aria-haspopup=\"menu\" aria-expanded=\"false\"> that opens a role=menu list.",
    html: `<button class="pull-down" aria-haspopup="menu" aria-expanded="false">Operations</button>`,
    evidence: [
      row("A push button with the menu's arrow at its right, title at the left", "inferred", NXUG + ", ch. 7 (pop-up and pull-down lists)", "not captured"),
    ],
  },
  {
    id: "dock",
    eras: ["nextstep"],
    name: "Workspace dock (NeXTSTEP)",
    summary: "The column of 64px application tiles at the screen's right edge; a docked application that is not running shows three dots. NeXTSTEP only.",
    selectors: [".dock", ".dock > li", ".dock > .not-running"],
    tokens: ["--clio-dock-tile", "--clio-dock-tile-bg"],
    accessibility: "A list of buttons labelled with the application's name; say whether it is running in the label.",
    html: `<ul class="dock" aria-label="Dock">
  <li><button class="icon" aria-label="Workspace (running)" style="width: 64px"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="8" width="32" height="32" fill="#000"/></svg></button></li>
  <li class="not-running"><button class="icon" aria-label="Edit (not running)" style="width: 64px"><svg viewBox="0 0 48 48" aria-hidden="true"><rect x="12" y="8" width="24" height="32" fill="#fff" stroke="#000"/></svg></button></li>
</ul>`,
    evidence: [
      row("Tiles 64x64 stacked edge to edge at the screen's right edge: two white rows and columns top and left, a dark then a black line bottom and right", "measured", NX30 + ", frame boot1 (dock x 1053-1116, y 0-63 and 64-127)", "five tiles and the recycler"),
      row("The tile's face is flat #aaaaaa: on a colour NeXT it is a texture, which clio.css does not reproduce", "adapted", "clio.css", "frame boot1"),
      row("A docked application that is not running: three dots at the tile's lower left", "inferred", NXUG + ", ch. 1 (the dock)", "frame boot1 shows the dots; their pixels are not yet measured"),
    ],
  },
];
