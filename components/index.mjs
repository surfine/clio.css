// The component index: one source for the docs site, components.json,
// llms.txt, llms-full.txt and EVIDENCE.md. Edit here, then `npm run build`.
//
// status: "measured"    value read from real pixels of the era
//         "inferred"    reasoned from documentation or behaviour, not measured
//         "adapted"     a deliberate departure for the web (touch, focus, contrast)
//         "third-party" art or font from a named, licensed project
//
// source: where the value lives in AI System 6 (github.com/surfine/AI-System-6,
// private development tree at commit b75cd4ed). Evidence images the measurements
// were taken from are named in `upstream`; clio.css never ships them.

export const AIS6 = "AI System 6 @b75cd4ed";

export const components = [
  {
    id: "window",
    bare: true,
    name: "Window",
    summary: "A document window: frame, title bar with close and zoom boxes (plus the WindowShade box in Platinum), an optional details bar and a scrolling pane. System 7 adds colour to the frame and title bar.",
    selectors: [".window", ".window.inactive", ".title-bar", ".title-bar > .title", ".title-bar > .close", ".title-bar > .resize", ".title-bar > .shade", ".details-bar", ".window-pane", ".status-bar", ".separator", ".inactive-title-bar"],
    aliases: { "system.css": [".title-bar button.close", ".title-bar button.resize", ".inactive-title-bar", ".window-pane", ".details-bar", ".separator"], "AI System 6": [".close-box", ".resize-box", ".shade-box", ".title-bar h1", ".title-bar h2"] },
    tokens: ["--clio-window-bg", "--clio-window-border", "--clio-window-shadow", "--clio-titlebar-height", "--clio-titlebar-bg", "--clio-box-size", "--clio-box-inset", "--clio-box-isolation", "--clio-pane-bg"],
    accessibility: "Give each box an aria-label (Close, Zoom, Collapse). The title is a real heading; pick the level that fits your page (h1 for a full-screen app window). Buttons keep a visible focus ring. On touch screens each box gets a 45px hit area while its art stays 11px.",
    html: `<div class="window" style="width: 300px">
  <div class="title-bar">
    <button class="close" aria-label="Close"></button>
    <h3 class="title">Macintosh HD</h3>
    <button class="resize" aria-label="Zoom"></button>
  </div>
  <div class="details-bar">
    <span>12 items</span>
    <span>232K in disk</span>
    <span>167K available</span>
  </div>
  <div class="window-pane" style="height: 96px">
    <p>A window pane scrolls with the era's scroll bars.</p>
  </div>
</div>`,
    variants: [
      {
        name: "Inactive window",
        note: "A background window keeps its title but erases its stripes and boxes.",
        html: `<div class="window inactive" style="width: 300px">
  <div class="title-bar">
    <button class="close" aria-label="Close"></button>
    <h3 class="title">Untitled</h3>
    <button class="resize" aria-label="Zoom"></button>
  </div>
  <div class="window-pane" style="height: 48px"></div>
</div>`
      },
      {
        name: "With a WindowShade box",
        note: "Platinum draws the collapse box at the far right. System 6 had none, so the box is hidden there.",
        html: `<div class="window" style="width: 300px">
  <div class="title-bar">
    <button class="close" aria-label="Close"></button>
    <h3 class="title">Appearance</h3>
    <button class="resize" aria-label="Zoom"></button>
    <button class="shade" aria-label="Collapse"></button>
  </div>
  <div class="window-pane" style="height: 48px"></div>
</div>`
      }
    ],
    evidence: [
      { era: "system7", claim: "Title bar: System 6's rows on #eee with six #777 stripes, #ccf light on the top and left inside edges and #99c shade on the bottom and right (the shade owns the corners)", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame hd-window", upstream: "99.1% identical; agrees with AI System 6 internal/evidence/drafts/system-7-reference" },
      { era: "system7", claim: "Close and zoom boxes: 11px, sunk #336/#ccf outer ring, raised #ccf/#336 inner ring, #aaa centre, 1px #eee gap; zoom adds a 5px #336 square; held: black square, #99c face and the starburst", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frames hd-window, held-close, held-zoom", upstream: "System 7.5.3 Finder window Infinite HD" },
      { era: "system7", claim: "Background window: #555 frame, plain white title bar, #888 title, black drop shadow", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame folder-window", upstream: "99.98% identical" },
      { era: "system6", claim: "Title bar: 19 rows from the frame to the rule; 3 rows of paper, six 1px ink stripes on a 2px period, 3 rows of paper, the 1px rule", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame hd-window rows 27–45", upstream: "agrees with AI System 6 apps/desktop/styles/00-foundation.css:906 (emulator, 2x)" },
      { era: "system6", claim: "Close and zoom boxes: 11px squares on the stripe band, 8px in from each inner edge, with 1px of paper between box and stripes (AI System 6 uses 3px)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame hd-window", upstream: "System 6.0.8 Finder window Macintosh HD" },
      { era: "system6", claim: "Title cut-out: about 6px of paper either side of the name (7px left, 5px right including the glyph's side bearing)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame hd-window", upstream: "System 6.0.8 Finder window" },
      { era: "system6", claim: "Zoom box: an inner square of 7 of the frame's 11 pixels sharing its top-left corner", status: "measured", source: "apps/desktop/styles/10-windows.css:1059", upstream: "System 6 zoom box, 7:11" },
      { era: "system6", claim: "An inactive window draws a plain white title strip with its name; no stripes, close box or zoom box", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert (Macintosh HD behind the alert)", upstream: "agrees with AI System 6 apps/desktop/styles/00-foundation.css:951" },
      { era: "system6", claim: "A held close or zoom box draws the same starburst: eight 3px rays and a centre dot inside the frame", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), mouse held on each box", upstream: "the cursor covered the lower half; it is drawn as the mirror of the upper half" },
      { era: "system6", claim: "The window frame has a 1px ink drop shadow on the right and bottom", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame hd-window x=239, y=152", upstream: "AI System 6 sets no window shadow" },
      { era: "system6", claim: "Finder info line: 17 rows of Geneva 9, text 15px in, closed by 1px ink, 1px paper, 1px ink", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame hd-window rows 46–65", upstream: "System 6.0.8 Finder window" },
      { era: "platinum", claim: "Frame: 1px black line, a raised 4px strip (white top/left, #999 bottom/right), the black content line; 2px 5px 5px padding", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:1744 (P14)", upstream: "Mac OS 8/9 window captures 16 and 21" },
      { era: "platinum", claim: "Title bar 19px: #ccc, six white/#777 ridge pairs from row 1, #999 shadow row, black rule; #ccc covers behind the boxes", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:104", upstream: "GUIdebook Mac OS 9.0 Appearance window (Theme Lab specimen active-titlebar)" },
      { era: "platinum", claim: "Title in bold Charcoal; on other systems Asap at width 123 shifted (-1px, -1px), the metrics the title bar was measured with", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:1803", upstream: "GUIdebook Mac OS 9.0 Appearance window" },
      { era: "platinum", claim: "Boxes: 11px, #222 frame, #999 to white gradient, #888 bevel above-left and white below-right; pressed #444 to #bbb", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:1820", upstream: "GUIdebook Mac OS 9.0 captures" },
      { era: "platinum", claim: "Zoom mark: a six-pixel lower-left corner; WindowShade mark: two nine-pixel rules at y=4 and y=6", status: "measured", source: "apps/desktop/styles/65-platinum-utility.css:725, :738", upstream: "GUIdebook Mac OS 9, 1x pixels" },
      { era: "platinum", claim: "Background window: #555 frame and drop, flat controls, #777 title, boxes erased", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:1757 (N1, P26)", upstream: "Mac OS 9 native capture 53; GUIdebook active/inactive" },
      { era: "drawingboard", claim: "Window frame: 1px #222 outline, a 4px #cdc6bd frame, a #555 line round the content, #e7ded6 content; right and bottom a 6px #777 pencil band closed by a 1px #333 line", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance", upstream: "Appearance control panel window; columns 161-166 and 631-643" },
      { era: "drawingboard", claim: "Title bar: 20px on the frame colour then the #555 rule; close and collapse boxes 11px, 4px below the bar's top, flush with the content line", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance", upstream: "close box 1:1 at (166,73), collapse box 1:1 at (621,73)" },
      { era: "drawingboard", claim: "Close, zoom and collapse box art, normal and held", status: "measured", source: "the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "WindowLargeCloseBox, WindowLargeZoom, WindowLargeCollapse; each found 1:1 in the capture" },
      { era: "drawingboard", claim: "Frame and title bar paper texture and the sketch lines that overrun the boxes are not reproduced; surfaces use the dominant measured colour", status: "adapted", source: "clio.css", upstream: "the theme's ppat 7065/7115 and Doc Window pixmaps are Apple artwork, not control parts" },
    ]
  },
  {
    id: "menu",
    bare: true,
    name: "Menu bar and menus",
    summary: "The menu bar across the top of the screen and its pull-down menus: items, keyboard shortcuts, check marks, separators, disabled items and submenus.",
    selectors: [".menu-bar", "[role=menubar]", ".menu", "[role=menu]", ".menu > li", "li.separator", "li.checked", "li.disabled", "kbd"],
    aliases: { "system.css": ["ul[role=menu-bar]", "[role=menu-item]", "li.divider"] },
    tokens: ["--clio-menubar-height", "--clio-menubar-bg", "--clio-menu-bg", "--clio-menu-shadow", "--clio-menu-item-height", "--clio-menu-item-active-bg", "--clio-menu-separator"],
    accessibility: "Use role=menubar, role=menu and role=menuitem with aria-haspopup and aria-expanded on titles. A menu opens while its title has aria-expanded=true, while its <li> has the class open, or while focus is inside it, so it works from the keyboard without script. Arrow-key movement between items is up to your script.",
    html: `<ul class="menu-bar" role="menubar" aria-label="Menu bar">
  <li role="none" class="open">
    <button role="menuitem" aria-haspopup="true" aria-expanded="true">File</button>
    <ul class="menu" role="menu">
      <li role="none"><button role="menuitem">New Folder <kbd>⌘N</kbd></button></li>
      <li role="none"><button role="menuitem">Open <kbd>⌘O</kbd></button></li>
      <li role="none"><button role="menuitem" aria-disabled="true">Print</button></li>
      <li role="none"><button role="menuitem">Close <kbd>⌘W</kbd></button></li>
      <li role="separator"></li>
      <li role="none"><button role="menuitemcheckbox" aria-checked="true">Show Clipboard</button></li>
    </ul>
  </li>
  <li role="none"><button role="menuitem" aria-haspopup="true" aria-expanded="false">Edit</button></li>
  <li role="none"><button role="menuitem" aria-haspopup="true" aria-expanded="false">View</button></li>
  <li role="none"><button role="menuitem" aria-haspopup="true" aria-expanded="false">Special</button></li>
</ul>`,
    reserveHeight: 150,
    evidence: [
      { era: "system7", claim: "Menus keep System 6's rows and black highlight; disabled items and the separator are solid #888 instead of a dither", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame file-menu", upstream: "separator row 100% identical" },
      { era: "system6", claim: "Menu bar: 20 rows with the rule on the last; an open title inverts rows 1–18, about 9px either side of the word", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "System 6.0.8 Finder File menu" },
      { era: "system6", claim: "Menu: hangs from the bar's rule with no top line; 1px ink frame and 1px drop shadow; 16px rows; text 15px in; the highlighted row inverts", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "System 6.0.8 Finder File menu" },
      { era: "system6", claim: "Separator: a full 16px row with a 1-on 1-off dotted rule on its ninth line", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu rows 164–179", upstream: "System 6.0.8 Finder File menu" },
      { era: "system6", claim: "Check mark: the Chicago check glyph, 9×8, 3px in from the frame", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), Apple menu Finder item", upstream: "redrawn as pixels in tooling/s6-art.py" },
      { era: "system6", claim: "Disabled items are drawn through a 50% grey dither; clio.css uses solid #696969", status: "adapted", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "a dither blurs under browser scaling; solid grey keeps 5.6:1" },
      { era: "platinum", claim: "Menu bar: #ddd, white top line, #999 bottom line, 1px black rule, 20px; open title #333399 with #6666cc/#000088 lines", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:298, :45", upstream: "Mac OS 9 native menu bar captures 02/04" },
      { era: "platinum", claim: "Menu: no top rule, white/#999 inner bevel, #222 1px drop; 16px rows at weight 600; highlight #333399 with #6666cc/#000088 side columns", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:912 (P21), :917 (P24)", upstream: "GUIdebook Mac OS 9.0 Apple menu (Theme Lab specimen apple-menu)" },
      { era: "platinum", claim: "Separator: #888 over white, in an 8px row", status: "inferred", source: "apps/desktop/styles/65-appearance-themes.css (separator #888/white)", upstream: "the line pair is measured; the 8px row height is not" },
      { era: "platinum", claim: "Menu check mark and submenu arrow art", status: "third-party", source: "classic-stylesheets macos9/checkmark.svg, menu-right.svg (MIT)", upstream: "nielssp/classic-stylesheets @9ebd2d8" },
      { era: "drawingboard", claim: "Menu bar: 22px of #cec6b5 with no rule under it; menus #ddd with a #333 outline and 18px items; the separator is a 1px pencil line fading #888 to #b6ada5", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame file-menu", upstream: "menu bar rows 0-21; File menu" },
      { era: "drawingboard", claim: "The chosen menu title and item are underlined in pencil instead of inverted", status: "measured", source: "the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "Menu_Title_Underline_Center, Menu_Item_underline_center; the title underline is visible under File in the capture" },
      { era: "drawingboard", claim: "Menu paper grain (pink, peach and green flecks on #ddd) is not reproduced", status: "adapted", source: "clio.css", upstream: "texture, not a control part" },
    ]
  },
  {
    id: "button",
    name: "Push button",
    summary: "Push buttons, the default button with its ring, the pressed state and the disabled state. Styles <button>, .btn and input buttons.",
    selectors: ["button", ".btn", ".default", ".btn-default", "button:active", "button.active", "button:disabled", "input[type=submit]"],
    aliases: { "system.css": [".btn", ".btn-default", ".standard-button"], "AI System 6": [".btn.default"] },
    tokens: ["--clio-button-bg", "--clio-button-border", "--clio-button-radius", "--clio-button-shadow", "--clio-button-active-bg", "--clio-button-default-width", "--clio-button-default-radius", "--clio-control-height"],
    accessibility: "Hover never changes a button: it is pressed only by pointer-down, Space or Enter. Keyboard focus draws a dotted frame (System 6) or a 2px #6666cc ring (Platinum), separate from the default ring.",
    html: `<div class="field-row" style="gap: 16px">
  <button>Cancel</button>
  <button class="default">OK</button>
  <button class="active">Pressed</button>
  <button disabled>Eject</button>
</div>`,
    evidence: [
      { era: "system7", claim: "Push buttons and the default ring stay black and white, as in System 6", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame page-setup (OK)", upstream: "93.8% identical; a few ring corner pixels differ" },
      { era: "system6", claim: "Push button: 20px tall, 1px ink round rectangle with corners of about 4px, paper face, Chicago 12 (AI System 6 uses 7px corners)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert, OK button 60×20", upstream: "System 6.0.8 stop alert" },
      { era: "system6", claim: "Pressed: the whole button inverts to ink with paper text", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame button-pressed (Cancel held in a TeachText alert)", upstream: "System 6.0.8" },
      { era: "system6", claim: "Disabled: the frame stays solid ink and the label is dithered 50% grey; clio.css draws the label solid #696969", status: "adapted", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame save-dialog (Eject)", upstream: "a dither blurs under browser scaling" },
      { era: "system6", claim: "Default button: a 1px gap then a 3px ring (68×28 around a 60×20 button)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert", upstream: "agrees with Inside Macintosh, Dialog Manager: PenSize(3,3), InsetRect(-4,-4), FrameRoundRect(16,16)" },
      { era: "system6", claim: "Hovering over a button changes nothing; only a press inverts it", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames locked-alert and button-hover", upstream: "agrees with docs/design/CLASSIC_PLATINUM_FIDELITY.md:210" },
      { era: "platinum", claim: "Hover never changes a push button; pressed only on pointer-down, Space or Enter", status: "inferred", source: "docs/design/CLASSIC_PLATINUM_FIDELITY.md:210", upstream: "AI System 6 owner ruling: Platinum carries no hover state" },
      { era: "system6", claim: "Keyboard focus: a 1px dotted frame 2px out", status: "adapted", source: "apps/desktop/styles/00-foundation.css:519", upstream: "System 6 had no button focus; a dotted frame cannot be read as the default ring" },
      { era: "platinum", claim: "#ddd face, 1px black border, 3px corners, bevel white/#ddd over #777/#aaa", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:236", upstream: "GUIdebook Mac OS 9.0 About dialog (Theme Lab specimen default-ok)" },
      { era: "platinum", claim: "Pressed: #666 face, white text, #444/#555 top-left over #888/#777 bottom-right", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:933 (P29)", upstream: "Infinite Mac Mac OS 9.0 capture" },
      { era: "platinum", claim: "Default ring: 1px black, a #aaa band with #ddd/#777 edges, 1px gap", status: "measured", source: "apps/desktop/styles/65-platinum-utility.css:773", upstream: "GUIdebook Mac OS 9.0 (default-ok specimen)" },
      { era: "platinum", claim: "Disabled: #888 border, flat #ddd, #777 text; the default ring goes #888", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css (N5)", upstream: "GUIdebook Open dialog Eject button (button-disabled specimen)" },
      { era: "drawingboard", claim: "Push buttons: 20px; #cec6b5 face; pencil outline #777 top and left, #333 right, #111 bottom; a 2px #555 shade on the right and #777 below; the hatched ButtonFaceCorner (image 0) in the lower right of the face", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame themes-tab; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "\"Save Theme…\" button; the face matches pixel for pixel, the hatch 394 of 432 pixels (the rest under the label)" },
      { era: "drawingboard", claim: "Default button: a second pencil line (#555 left and top, #111 right, #333 below) 2px out on the left and top, outside the shade on the right and below, with a #9f9a94 line between", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame energy-saver-alert", upstream: "\"Close Message\" in Energy Saver's start-up notice" },
      { era: "drawingboard", claim: "Pressed buttons: a #9f9a94 face", status: "inferred", source: "clio.css", upstream: "ButtonFaceCorner images 1-3 are probably the pressed faces; no pressed button captured" },
      { era: "drawingboard", claim: "Disabled buttons: #8c8c8c label on the same face", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame date-time", upstream: "\"Server Options…\"" },
      { era: "drawingboard", claim: "The pencil overruns at the button corners (ButtonTopLeft, ButtonTopRight…) are not drawn", status: "adapted", source: "clio.css", upstream: "sketch decoration outside the control's box" },
    ]
  },
  {
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
    ]
  },
  {
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
    ]
  },
  {
    id: "text-field",
    name: "Text field",
    summary: "Single-line inputs and <textarea>.",
    selectors: ["input[type=text]", "input[type=search]", "input[type=email]", "input[type=password]", "input[type=number]", "textarea"],
    tokens: ["--clio-field-bg", "--clio-field-border", "--clio-field-shadow", "--clio-field-padding", "--clio-field-height"],
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
      { era: "platinum", claim: "White field, 1px black frame, #888 shadow above-left and white etch below-right", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:935 (P30)", upstream: "Infinite Mac Mac OS 9.0 capture" },
      { era: "platinum", claim: "Focus: a 2px #6666cc ring", status: "measured", source: "apps/desktop/styles/65-platinum-utility.css:38", upstream: "Mac OS 9 capture platinum-native/10b-fonts-tab" },
      { era: "drawingboard", claim: "Edit text: a 1px pencil line (#555 left, #888 top and right, #9f9a94 bottom), 1px of the panel colour inside it, then the white field", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame date-time", upstream: "the date field" },
    ]
  },
  {
    id: "select",
    name: "Pop-up menu",
    summary: "A <select> drawn as the era's pop-up menu; <select multiple> or size>1 becomes a list box.",
    selectors: ["select", "select[multiple]", "select[size]"],
    tokens: ["--clio-popup-bg", "--clio-popup-border", "--clio-popup-shadow", "--clio-popup-arrow"],
    accessibility: "Native <select>, so the open list is the browser's own and works everywhere.",
    html: `<div class="field-row">
  <label for="clio-font">Font:</label>
  <select id="clio-font">
    <option>Chicago</option>
    <option selected>Geneva</option>
    <option>New York</option>
  </select>
</div>`,
    evidence: [
      { era: "system7", claim: "An 18px box with an 11×6 black triangle 5px from the right edge, label 15px in, and a 1px shadow that starts 3px in from the corner", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame numbers (Number Format)", upstream: "100% identical; the triangle is System 7's addition" },
      { era: "system6", claim: "An 18px rectangle with a 1px frame and a 1px drop shadow and no arrow; the shadow is what marks it as a menu; held, it inverts", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames save-dialog and popup-held (Standard File folder menu)", upstream: "the down triangle arrived with System 7" },
      { era: "platinum", claim: "#ddd, 3px corners, white/#aaa bevel, bold label, a separate bevelled arrow part with the 7x10 arrow", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:1916 (P31)", upstream: "GUIdebook Mac OS 9.0 (popup-normal specimen), native 09b" },
      { era: "platinum", claim: "The arrow part is drawn with background layers, approximating the measured bevel", status: "inferred", source: "clio.css", upstream: "select has no ::after in CSS" },
      { era: "platinum", claim: "Arrow art", status: "third-party", source: "classic-stylesheets macos9/dropdown.svg (MIT)", upstream: "nielssp/classic-stylesheets @9ebd2d8" },
      { era: "drawingboard", claim: "Pop-up menu: 20px, 1px pencil outline, #cec6b5 face; the 7x9 double arrow 5px from the right and 4px down; the hatched ButtonFaceCorner (image 2) ends 19px from the right, on the bottom edge", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "the Appearance pop-up; arrow and hatch found 1:1 in the capture" },
    ]
  },
  {
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
      { era: "system7", claim: "As System 6: a selected row inverts across the list", status: "inferred", source: "seen in the Keyboard control panel during capture; not pixel-checked", upstream: "System 7.5.3" },
      { era: "system6", claim: "White list, 1px ink frame, 16px rows; a selected row inverts across the whole list width", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames save-dialog and list-selected (Standard File)", upstream: "System 6.0.8 TeachText Save As" },
      { era: "platinum", claim: "Selection is lavender #ccccff with black text", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:128", upstream: "GUIdebook Mac OS 9.0 Open dialog (open-list-scrollbar specimen)" },
      { era: "platinum", claim: "Rows carry no divider", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:860 (P10)", upstream: "Mac OS 9 native list capture 21" },
      { era: "drawingboard", claim: "List boxes: white with a 1px #555 outline, no bevel", status: "inferred", source: "clio.css", upstream: "not captured" },
    ]
  },
  {
    id: "scrollbar",
    bare: true,
    name: "Scroll bar",
    summary: "The era's scroll bar on every scroll area clio.css owns, on any element with .clio-scroll, or on the whole page with <html class=\"clio-scrollbars\">.",
    selectors: [".window-pane", ".clio-scroll", "html.clio-scrollbars", "::-webkit-scrollbar"],
    tokens: ["--clio-scrollbar-size", "--clio-scrollbar-track", "--clio-scrollbar-thumb-bg", "--clio-scrollbar-button-bg"],
    accessibility: "Native scrolling is untouched: wheel, keyboard and touch scroll as usual.",
    html: `<div class="clio clio-scroll" style="width: 220px; height: 96px; overflow: scroll; border: 1px solid; background: var(--clio-pane-bg); font-family: var(--clio-font-text)">
  <p style="width: 360px; margin: 8px">The lane, the scroll box and both arrow boxes come from the era. Firefox has no scroll-bar parts, so it gets the era's colours only.</p>
  <p style="margin: 8px">Scroll me.</p>
</div>`,
    evidence: [
      { era: "system7", claim: "Arrow boxes and grow box redrawn from the captured pixels (#ddd face, white light, #777 shade, #99c arrows outlined #336)", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame folder-window → tooling/s7-art.py", upstream: "100% identical" },
      { era: "system7", claim: "Lane: ltGray pattern in #ddd and #777; scroll box #aaa with #ccf/#336 bevel, a #555 leading edge and a 6×10 grip 3px from it", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame folder-window", upstream: "the real box is a fixed 16 rows; the browser sizes it to the content, so only its first 16 rows match" },
      { era: "system6", claim: "Lane: a 1px line and 14px inside; the window frame closes it, so the bar is 15px in CSS", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame system-folder", upstream: "AI System 6 uses a 16px lane" },
      { era: "system6", claim: "Active lane pattern is QuickDraw's ltGray (one dot in four, rows offset by two), not 50% grey; an empty lane is white", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames system-folder and hd-window", upstream: "AI System 6 draws a 50% checker" },
      { era: "system6", claim: "Scroll box: a white square with a 1px frame filling the lane, 16 rows tall", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame system-folder", upstream: "System 6.0.8 Finder list view" },
      { era: "system6", claim: "Up and down arrows: hollow, 13 wide and 11 tall in the 14px box, a 45° head and a 7px stem", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames hd-window and system-folder", upstream: "redrawn as pixels in tooling/s6-art.py" },
      { era: "system6", claim: "Left and right arrows: the up arrow turned, apex in the box's first column, tip in its last", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame hd-window (horizontal scroll bar)", upstream: "redrawn as pixels in tooling/s6-art.py" },
      { era: "system6", claim: "Grow box: a 7×7 square over a 9×9 square in the 14px corner", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame system-folder", upstream: "redrawn as pixels in tooling/s6-art.py" },
      { era: "both", claim: "The scroll box grows with the visible fraction instead of a fixed 16px square", status: "adapted", source: "clio.css", upstream: "browsers size ::-webkit-scrollbar-thumb themselves" },
      { era: "platinum", claim: "Lane #aaa with a double bevel; lavender #9999ff scroll box with #ccf/#66c bevel and grip ridges; #ddd arrow boxes with stepped 2/4/6/8 arrows", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:336 (P16), :351 (P17), :364 (P27)", upstream: "Mac OS 9 native capture 16; GUIdebook Open dialog" },
      { era: "drawingboard", claim: "Scroll arrows: the theme's 16x16 boxes, normal, held and disabled, flush with the bar; the grow box is NoGrowBoxRight", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame themes-tab; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "left and right arrows found 1:1 at (192,297) and (570,297)" },
      { era: "drawingboard", claim: "Track: #ece6e4 with a #aaa edge, a two-pixel pencil rail (#888, #555) through the middle and a #777 far edge; scroll box from the theme's ends, stretch and grip", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame themes-tab; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "theme list scroll bar; HThumbLeft/Right/Center/Stretch found in place. Chromium will not draw a scroll box shorter than its own minimum, where the theme's is 15px" },
    ]
  },
  {
    id: "dialog",
    bare: true,
    name: "Dialogs and alerts",
    summary: "The modal dialog frame, the alert layout with an icon, and the plain shadowed box.",
    selectors: [".modal-dialog", ".alert-box", ".standard-dialog", ".modeless-dialog", ".alert-icon", ".dialog-buttons"],
    aliases: { "system.css": [".modal-dialog", ".alert-box", ".standard-dialog", ".outer-border", ".inner-border", ".modal-contents"] },
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
</div>`
      }
    ],
    evidence: [
      { era: "system7", claim: "Alert frame: 1px black, a raised #ccf/#669 ring, #bbb, a sunken #669/#ccf ring, 1px black (5px, as in System 6)", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame page-setup", upstream: "100% identical. An alert without a colour table keeps System 6's black frame (Monitors & Sound alert); clio.css draws the colour one" },
      { era: "system6", claim: "Modal frame: 1px ink, 2px paper, 2px ink, and no drop shadow", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert", upstream: "AI System 6 has two recipes, both off (84-clio-write.css:210 has a 1px gap)" },
      { era: "system6", claim: "Plain box: 1px ink frame and a 2px drop shadow", status: "inferred", source: "not measured", upstream: "altDBoxProc; none of the 6.0.8 Finder and TeachText dialogs opened for capture (alerts, Standard File, About the Finder) uses it" },
      { era: "both", claim: "The alert icon is drawn here, not Apple's", status: "adapted", source: "clio.css", upstream: "no Apple icons are shipped" },
      { era: "platinum", claim: "1px black frame over #ddd, inner bevel of three white steps inside #555/#999/#aaa, 1px black drop", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:840 (P06)", upstream: "GUIdebook Mac OS 9.0 About application (about-alert specimen)" },
      { era: "drawingboard", claim: "Alerts: a 1px brown pencil frame (#996633 top and left with #cc9966 outside, #993333 right and bottom) on #e7ded6, and a #777 band 7px wide on the right and 8px deep below", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame energy-saver-alert", upstream: "Energy Saver's start-up notice; the frame's shade drifts along the pencil line, which a flat colour does not follow" },
      { era: "drawingboard", claim: "Modal and plain dialogs: the same geometry framed in grey (#333 with #999 outside on the left)", status: "inferred", source: "the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "Modal_Left (#555/#999) and Modal_Right pixmaps; no modal dialog in the captures" },
    ]
  },
  {
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
    ]
  },
  {
    id: "progress",
    name: "Progress bar",
    summary: "The native <progress> element as the era's thermometer.",
    selectors: ["progress"],
    tokens: ["--clio-progress-height", "--clio-progress-bg", "--clio-progress-fill", "--clio-progress-shadow"],
    accessibility: "Native <progress>; give it a label or aria-label.",
    html: `<div class="field-row-stacked" style="width: 260px">
  <label for="clio-copy">Copying “System Folder”…</label>
  <progress id="clio-copy" max="100" value="62">62%</progress>
</div>`,
    evidence: [
      { era: "system7", claim: "11px, 1px black frame, #ccf track, #444 fill", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame copy-progress", upstream: "100% identical" },
      { era: "system6", claim: "12px tall, 1px ink frame, white track, fill in QuickDraw dkGray (one white dot in four)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame copy-progress (Finder duplicating System Folder)", upstream: "redrawn as a pattern tile in tooling/s6-art.py" },
      { era: "platinum", claim: "Barber-pole fill: ten 1px hard stops from #333399 through #eee to #000055", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:937 (P32)", upstream: "Mac OS 9 native progress bar" },
      { era: "platinum", claim: "#bbb track with white/#aaa outer and #888/#ddd inner bevel", status: "inferred", source: "apps/desktop/styles/65-appearance-themes.css:592", upstream: "AI System 6 token, not tagged as measured" },
      { era: "drawingboard", claim: "Progress bars keep Platinum's drawing; the theme's own ends and fill (ProgressLeftEnd, ProgressRightEnd) are not yet used", status: "inferred", source: "clio.css", upstream: "not captured" },
    ]
  },
  {
    id: "tabs",
    name: "Tabs",
    summary: "A tab strip over a panel. Native in Platinum; an adaptation in System 6, which had no tab control.",
    selectors: ["[role=tablist]", "[role=tab]", "[aria-selected=true]", "[role=tabpanel]", ".tabs", ".tab-panel"],
    tokens: ["--clio-tab-height", "--clio-tab-panel-bg", "--clio-tab-panel-border"],
    accessibility: "Use role=tablist, role=tab with aria-selected and aria-controls, and role=tabpanel; arrow keys between tabs are up to your script.",
    html: `<div style="width: 320px">
  <div role="tablist" aria-label="Appearance">
    <button role="tab" aria-selected="true">Appearance</button>
    <button role="tab" aria-selected="false">Fonts</button>
    <button role="tab" aria-selected="false">Sound</button>
  </div>
  <div role="tabpanel">
    <div class="field-row"><label for="clio-theme">Theme:</label>
      <select id="clio-theme"><option>Mac OS Default</option></select>
    </div>
  </div>
</div>`,
    evidence: [
      { era: "system7", claim: "System 7 had no tab control; the System 6 adaptation is used", status: "adapted", source: "clio.css", upstream: "System 7.5.3" },
      { era: "system6", claim: "Boxed labels that join the panel", status: "adapted", source: "clio.css", upstream: "System 6 had no tab control" },
      { era: "platinum", claim: "Tab art: sloped caps, #ccc tabs, the front tab #eee and 2px taller", status: "third-party", source: "classic-stylesheets macos9/tab*.svg (MIT)", upstream: "nielssp/classic-stylesheets @9ebd2d8; AI System 6 measured a 21-row tab (P01, 65-appearance-themes.css:742)" },
      { era: "drawingboard", claim: "Tabs: the theme's left end (6px) and right end (17px, 2px taller) with the right end's first column stretched between; the front tab is the content colour and opens into the panel", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "NTabLeft and NTabRight found 1:1 at (244,96) and (327,94)" },
    ]
  },
  {
    id: "control-strip",
    name: "Control Strip",
    summary: "The Control Strip of System 7.5 to Mac OS 9: module buttons with menu triangles, scroll arrows and a tab that folds it away. Markup matches AI System 6's.",
    selectors: [".control-strip", ".control-strip.is-collapsed", ".control-strip-scroll", ".control-strip-scroll-back", ".control-strip-scroll-forward", ".control-strip-modules", ".control-strip-module-track", ".control-strip-module", ".control-strip-handle"],
    tokens: ["--clio-strip-height", "--clio-strip-bg", "--clio-strip-line", "--clio-strip-cell-shadow", "--clio-strip-sunken-shadow", "--clio-strip-pressed-bg", "--clio-strip-pressed-shadow", "--clio-strip-module-width", "--clio-strip-handle"],
    accessibility: "role=toolbar on .control-strip-modules with an aria-label; every module and arrow is a <button> with an aria-label; a module that opens a menu carries aria-haspopup=\"menu\" and aria-expanded. Disable the scroll arrows when there is nothing to scroll. Folding (.is-collapsed) and positioning are up to your script.",
    html: `<div class="control-strip">
  <button class="control-strip-scroll control-strip-scroll-back" disabled aria-label="Scroll back"></button>
  <div class="control-strip-modules" role="toolbar" aria-label="Control Strip">
    <div class="control-strip-module-track">
      <button class="control-strip-module" aria-haspopup="menu" aria-expanded="false" aria-label="Monitor bit depth"><svg viewBox='0 0 16 16' aria-hidden='true'><rect x='2' y='3' width='12' height='9' fill='none' stroke='currentColor'/><rect x='4' y='5' width='8' height='5' fill='#ff0000'/><rect x='6' y='12' width='4' height='2' fill='currentColor'/></svg></button>
      <button class="control-strip-module" aria-haspopup="menu" aria-expanded="false" aria-label="Sound volume"><svg viewBox='0 0 16 16' aria-hidden='true'><rect x='2' y='3' width='12' height='9' fill='none' stroke='currentColor'/><rect x='4' y='5' width='8' height='5' fill='currentColor'/><rect x='6' y='12' width='4' height='2' fill='currentColor'/></svg></button>
      <button class="control-strip-module" aria-haspopup="menu" aria-expanded="false" aria-label="File sharing"><svg viewBox='0 0 16 16' aria-hidden='true'><rect x='2' y='3' width='12' height='9' fill='none' stroke='currentColor'/><rect x='4' y='5' width='8' height='5' fill='#3366cc'/><rect x='6' y='12' width='4' height='2' fill='currentColor'/></svg></button>
    </div>
  </div>
  <button class="control-strip-scroll control-strip-scroll-forward" disabled aria-label="Scroll forward"></button>
  <button class="control-strip-handle" aria-label="Collapse Control Strip"></button>
</div>`,
    variants: [
      { name: "Folded", note: "With .is-collapsed only the tab shows.", html: `<div class="control-strip is-collapsed"><button class="control-strip-handle" aria-label="Expand Control Strip"></button></div>` },
    ],
    evidence: [
      { era: "platinum", claim: "24px: 1px black lines round every cell; #c0c0c0 cells with a #c0c0c0 then white light and a #a0a0a0 then #808080 shade; an end cap, 13px scroll cells (sunken while there is nothing to scroll), 30px modules with the 16px icon 2px in and a 4x7 menu triangle 3px from the right, then 2px of black and the tab", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame strip-expanded", upstream: "Finder desktop; start of the strip 89.5% identical" },
      { era: "platinum", claim: "Held module: #808080 face, 2px #404040 light and 2px #c0c0c0 shade", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame strip-slider", upstream: "Sound module held" },
      { era: "platinum", claim: "End-cap icon, scroll arrows, menu triangle, the tab and the folded tab", status: "measured", source: "tooling/p9-art.py, redrawn from frames strip-expanded and strip-collapsed", upstream: "tab and folded tab 100% identical" },
      { era: "drawingboard", claim: "The Control Strip is not themed: Mac OS 8.5 under Drawing Board draws it exactly as Mac OS 9 does", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame finder", upstream: "same cells, bevels and tab, other modules" },
      { era: "system6", claim: "System 6 had no Control Strip: drawn at the Mac OS 9 geometry in ink and paper, with 1-bit arrows, triangle and tab drawn for clio.css", status: "adapted", source: "clio.css", upstream: "AI System 6 shows its Control Strip in every era" },
      { era: "system7", claim: "Uses the System 6 drawing; System 7.5's colour Control Strip is not yet captured", status: "inferred", source: "clio.css", upstream: "Control Strip shipped with System 7.5 PowerBooks" },
    ]
  },
  {
    id: "desktop",
    bare: true,
    name: "Desktop and icons",
    summary: "The desktop pattern and desktop icons with their name labels. Bring your own icon images; clio.css ships no Apple icons.",
    selectors: [".desktop", ".icon", ".icon > img", ".icon > figcaption", ".icon.selected"],
    tokens: ["--clio-desktop", "--clio-label-bg", "--clio-label-selected-bg", "--clio-icon-selected-filter"],
    accessibility: "Make each icon a <button> (or give it role=button and tabindex=0) with its name as the label.",
    html: `<div class="desktop" style="min-height: 0; padding: 16px; display: flex; gap: 12px">
  <button class="icon" aria-pressed="false">
    <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4" y="6" width="24" height="20" fill="#fff" stroke="#000"/><rect x="7" y="9" width="18" height="11" fill="#000"/></svg>
    <span>Macintosh HD</span>
  </button>
  <button class="icon selected" aria-pressed="true">
    <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5 9h9l2 2h11v15H5z" fill="#fff" stroke="#000"/></svg>
    <span>Documents</span>
  </button>
</div>`,
    evidence: [
      { era: "system7", claim: "The desktop is a 1px #666/#aaa checker", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), every frame", upstream: "agrees with AI System 6 system-7-reference" },
      { era: "system6", claim: "The desktop is a 1px 50% checker", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), every frame", upstream: "AI System 6 draws an 8px stipple" },
      { era: "system6", claim: "Icon names: Geneva 9 on a white tag; a selected icon and its tag invert", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), desktop (Macintosh HD selected, Welcome! not)", upstream: "System 6.0.8 Finder" },
      { era: "platinum", claim: "70% white tag with no edge; selected: black tag, white name, artwork darkened", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:882 (P12, P13)", upstream: "Mac OS 9 native capture 02" },
      { era: "platinum", claim: "Desktop colour #4a71ab", status: "inferred", source: "apps/desktop/styles/65-appearance-themes.css:85", upstream: "base colour of AI System 6's azul tile, generated from a 512 Pixels capture; the tile is not shipped" },
      { era: "drawingboard", claim: "Desktop and icons are unchanged from Platinum; the theme's desktop pictures are not reproduced", status: "adapted", source: "clio.css", upstream: "scen 'Drawing Board on a Grid' / 'on Parchment' are Apple artwork" },
    ]
  },
  {
    id: "typography",
    name: "Type and tokens",
    summary: "The fonts, the palette and every --clio-* custom property you can override.",
    selectors: [".clio", ".text", ".heading", "[data-era=system6]", "[data-era=platinum]"],
    tokens: ["--clio-ink", "--clio-paper", "--clio-font-chrome", "--clio-font-text", "--clio-font-size", "--clio-selection-bg", "--clio-focus-outline"],
    accessibility: "Text colours keep at least 4.5:1 on their grounds; disabled text keeps 3:1 or more.",
    html: `<div class="clio" style="padding: 12px; background: var(--clio-pane-bg)">
  <h2 class="heading">Clio Sans '84 is the system font</h2>
  <p class="text">Clio Text '84 (Geneva) is the application font. Every value is a --clio-* custom property you can override on any element.</p>
</div>`,
    evidence: [
      { era: "system7", claim: "System 7 keeps System 6's fonts: Clio Sans '84 for chrome, Clio Text '84 for text", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), title bar text", upstream: "the title Infinite HD matches pixel for pixel" },
      { era: "system6", claim: "Chrome text is Clio Sans '84: Chicago 12 rebuilt pixel for pixel (104 Key Caps characters, space, |, ⌘ and ✓), ascent 11, descent 3, drawn without antialiasing", status: "measured", source: "clio.css capture, System 6.0.8 Key Caps (npm run capture:keycaps → tooling/extract-glyphs.py → fonts-src/clio-sans-84.txt)", upstream: "title bar 100% and default OK button 99.7% identical to the real screen" },
      { era: "system6", claim: "Application text is Clio Text '84 (Geneva 12) and small text Clio Text '84 9 (Geneva 9: info line, icon names, status), rebuilt the same way and drawn without antialiasing", status: "measured", source: "clio.css capture, System 6.0.8 Key Caps (Geneva 12) and Get Info comments (Geneva 9) → fonts-src/clio-text-84.txt, clio-text-84-9.txt", upstream: "TeachText's first line and the Finder info line are 100% identical to the real screen" },
      { era: "system6", claim: "ChicagoFLF stays in the stack as the outline fallback for sizes that are not multiples of 12px", status: "third-party", source: "vendor/system.css-reference/fonts/ChicagoFLF.woff2", upstream: "Robin Casady's ChicagoFLF (public domain), as shipped by system.css" },
      { era: "platinum", claim: "Charcoal when installed; otherwise Asap (OFL) at width 113 for text and 123 for titles, weights 400/600/700", status: "measured", source: "apps/desktop/assets/fonts/platinum/README.md; 65-appearance-themes.css:25", upstream: "Asap matched to a measured Charcoal sample's x-height and advance width" },
      { era: "platinum", claim: "Palette #fff #ddd #ccc #999 #777 #000, accent #333399, lavender #ccccff", status: "measured", source: "tooling/classic-platinum-fidelity-contract.json (platinum.palette)", upstream: "Mac OS 9 captures" },
      { era: "system6", claim: "Disabled text #696969 instead of a 50% dither", status: "adapted", source: "apps/desktop/styles/00-foundation.css (shade-dark)", upstream: "5.6:1 on white; a dither blurs under browser scaling" },
      { era: "drawingboard", claim: "Chrome text is #313131; titles and labels are Charcoal, as in Platinum", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance", upstream: "tab and title text ink" },
    ]
  }
];
