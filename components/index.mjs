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

import hig from "./hig.mjs";

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
      { era: "system7", claim: "clio.js: dragging the title bar moves a 1px grey outline around the window and its 1px shadow (the structure region); the gray inverts the pixels whose x + y is odd, kept to the page as QuickDraw kept it to the screen, and the window follows on release", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, Infinite HD dragged by 80,116 (frames before and during, diffed); tooling/outline-check.mjs: the same 614 pixels inverted in Chromium, WebKit and Firefox", upstream: "QuickDraw DragGrayRgn of the window's structure region" },
      { era: "system6", claim: "clio.js: as System 7: a 1px grey outline around the window and its shadow, the gray on the odd pixels", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac, Macintosh HD dragged by 80,113 (frames before and during, diffed); tooling/outline-check.mjs: the same 365 pixels in all three engines", upstream: "QuickDraw DragGrayRgn" },
      { era: "platinum", claim: "clio.js: the dragged outline is a 2px band of the grey pattern (the odd pixels) round the window and its shadow; the shadow starts 2px in from the top-right and bottom-left corners, so the band steps in there", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Infinite HD dragged by 80,116 (frames before and during, diffed); tooling/outline-check.mjs: the same 1260 pixels in Chromium, WebKit and Firefox", upstream: "Drawing Board assumed the same (inferred)" },
      { era: "drawingboard", claim: "clio.js: the dragged outline is the same 2px band of the gray, round the frame and its shadow (7px across, 8px down), following the structure region's overrun near the corners (patches written by tooling/db-outline.py from the theme's pieces; the region's top-left and bottom-left pieces lie 1px right of the drawn ones, and the grey outer column's last row is region)", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac, Infinite HD dragged by 80,116 (frames before and during, diffed); tooling/outline-check.mjs: all 1349 of the Mac's pixels and no others in Chromium and WebKit", upstream: "the 1px offset of the region pieces is fitted to this one frame (the inverted gray shows only every other pixel of the region), not read from the theme's region data" },
      { era: "system7", claim: "clio.zoomRects(): 8 outlines, one per tick, each edge eased by 1.6^k, the last four on screen at once", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, the Finder opening the Infinite HD icon, every animation frame recorded (rectangle edges per frame)", upstream: "opacity only; none under prefers-reduced-motion" },
      { era: "platinum", claim: "clio.zoomRects(): 6 outlines in the 2px gray band, one per tick, at 1.4^(k-7) of the way from the icon to the window, all kept until the window draws", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Games opened from Infinite HD, every changed frame recorded (outlines at 393-477 ms, the window at 493 ms)", upstream: "each edge within a pixel of the fit (the Finder's rounding is not known); opacity only, none under prefers-reduced-motion" },
      { era: "drawingboard", claim: "clio.zoomRects(): as Mac OS 9: 6 outlines in the 2px band, one per tick, at about 1.4^(k-7) of the way", status: "measured", source: "clio.css capture, Mac OS 8.5 with the theme in Infinite Mac, Developer opened, every changed frame recorded (outlines at 530-613 ms, the window at 646 ms)", upstream: "the Finder of 8.5 and 9.0 agree" },
      { era: "both", claim: "clio.js: on a touch screen a finger on a movable window's title bar drags the window (touch-action: none there), and a tapped menu item runs once", status: "adapted", source: "iOS Simulator (iPhone 18 Pro, Safari), driven by touch events", upstream: "not checked on a physical iPhone" },
      { era: "both", claim: "clio.js: a movable window can be moved without dragging: a move button at the start of the title bar (hidden until it has keyboard focus, the title bar then ringed) takes arrow keys (16px, Shift 1px) and opens a menu of moves, as does a right click on the title bar; moves stay inside the page and a polite live region names them", status: "adapted", source: "modern-web-guidance drag guide; WCAG 2.5.7 Dragging Movements", upstream: "the Mac moved windows only by dragging" },
      { era: "platinum", claim: "clio.js: the collapse box folds the window to its title bar; a double click on the title bar does only with data-clio-shade=\"dblclick\"", status: "measured", source: "Mac OS 9.0 in Infinite Mac, Appearance > Options: \"Double-click title bar to collapse windows\" off", upstream: "the collapsed look: the title bar, then the frame's #999 shade and black line across the whole width (frame collapsed; specimen p9-collapsed 100% identical in all three engines, the title and the desktop beside the shadow masked)" },
      { era: "system7", claim: "clio.js, data-clio-shade=\"dblclick\": WindowShade folds the window to its title bar, closed by the frame and shadow; there is no collapse box", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac: WindowShade control panel set to 2 clicks, Infinite HD double-clicked (frame shaded); specimen s7-collapsed 100% identical in Chromium, WebKit and Firefox", upstream: "Infinite Mac's WindowShade is set to Off clicks with sounds off, so the double click stays opt-in; the control panel's factory setting was not checked" },
      { era: "drawingboard", claim: "Collapsed: the box is the title bar and the foot's black line; the bottom corners and the shadow lie under the title bar, which is drawn last", status: "measured", source: "clio.css capture, Mac OS 8.5 with the theme in Infinite Mac, Infinite HD's collapse box clicked (frame collapsed)", upstream: "specimens db-collapsed-left and db-collapsed-right 100% identical in all three engines (the box and its shadow; a window behind is masked)" },
      { era: "both", claim: "Cursors: the arrow (11x16, white outline, hot spot 1,1) and the I-beam (7x16, black, no cross bar, hot spot 3,4), redrawn at 1x, 2x and 3x; links and buttons in clio.css windows keep the arrow (the Mac had no pointing hand)", status: "measured", source: "clio.css capture, System 7.5.3 and Mac OS 9.0 in Infinite Mac (identical arrows), Mac OS 9.0 Stickies (I-beam), System 6.0.8 (the same arrow on the desktop and the same I-beam in Find File); tooling/cursor-art.py", upstream: "System 6 and Drawing Board assumed the same (inferred); the watch was not captured" },
      { era: "both", claim: "Cursors: the watch (11x16, first frame of the spinning watch, hot spot 8,8) for aria-busy=\"true\", redrawn at 1x, 2x and 3x; its crown's two inverting pixels drawn black", status: "measured", source: "clio.css capture, System 7.5.3 and Mac OS 9.0 in Infinite Mac opening a Finder folder (identical frames; four of eight hand positions seen); tooling/cursor-art.py", upstream: "the animation is not drawn; System 6's watch not captured" },
      { era: "system7", claim: "Title bar: System 6's rows on #eee with six #777 stripes, #ccf light on the top and left inside edges and #99c shade on the bottom and right (the shade owns the corners)", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame hd-window", upstream: "99.1% identical; agrees with AI System 6 internal/evidence/drafts/system-7-reference" },
      { era: "system7", claim: "Close and zoom boxes: 11px, sunk #336/#ccf outer ring, raised #ccf/#336 inner ring, #aaa centre, 1px #eee gap; zoom adds a 5px #336 square; held: black square, #99c face and the starburst", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frames hd-window, held-close, held-zoom", upstream: "System 7.5.3 Finder window Infinite HD" },
      { era: "system7", claim: "Background window: #555 frame, plain white title bar, #888 title, black drop shadow", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame folder-window", upstream: "99.98% identical" },
      { era: "platinum", claim: "Drop shadow: a 1px black line down the right from the frame's third row and along the foot from its third column (a notch at both corners); behind another window the same line in #555", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames appearance, collapsed; GUIdebook Appearance and Web Sharing)", upstream: "specimens active-titlebar, inactive-titlebar, p9-titlebar and p9-collapsed 100% identical without a mask; drawn with border lines on ::after, as a box-shadow could only start 1px in" },
      { era: "system7", claim: "Shaded (WindowShade) window: 19px, the title bar's bottom line serving as the frame's foot, the shadow 1px in under it", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frame shaded)", upstream: "specimen s7-collapsed 100% identical" },
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
      { era: "drawingboard", claim: "Window frame: the theme's nine Doc Window pictures (6176-6184, active and inactive) round the outline, placed as Mac OS 8.5 places them, the edges tiled from their ends; content on the window paper (ppat 7120) from the content's top-left; the frame is 6px inside the outline on each side", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames date-time and appearance; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "every piece found 1:1 round the Appearance and Date & Time windows; paper origin agrees in Date & Time and Finder Preferences" },
      { era: "drawingboard", claim: "Title bar: 20px on the frame colour then the #555 rule; close and collapse boxes 11px, 4px below the bar's top, flush with the content line", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance", upstream: "close box 1:1 at (166,73), collapse box 1:1 at (621,73)" },
      { era: "drawingboard", claim: "Close, zoom and collapse box art, normal and held", status: "measured", source: "the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "WindowLargeCloseBox, WindowLargeZoom, WindowLargeCollapse; each found 1:1 in the capture" },
      { era: "drawingboard", claim: "Mac OS sometimes starts a 128px pattern half a tile (64px) earlier, depending on where the window or control sits on screen (the Appearance window, the File menu, the Energy Saver alert, the first Date & Time field, the Themes list's scroll bar); clio.css starts it at the element and offers --clio-db-phase: 64px to match a given screen", status: "adapted", source: "clio.css", upstream: "the rule behind the shift was not found from these captures" },
      { era: "platinum", claim: "Utility window (.window.utility): 1px black outline and drop from the second row, white light, #999 shade, a 13-row title bar with a 3px dot pattern (the run right of the title from the right end), 10x10 boxes, a #999 rule", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/hig/platinum9), frame switcher (Application Switcher)", upstream: "both ends of the title bar 100% identical" },
      { era: "drawingboard", claim: "Utility windows take Platinum's drawing; the theme's floating-window pieces (boxes 201/211/221, frame 6195-6214) were found but its title bar pieces were not matched", status: "inferred", source: "clio.css", upstream: "Application Switcher, Mac OS 8.5" },
      { era: "system7", claim: "Utility windows are the document window's parts at a 13px title bar", status: "inferred", source: "clio.css", upstream: "Macintosh Human Interface Guidelines (1992), ch. 5: floating windows; none on the captured screens" },
      { era: "platinum", claim: "Movable modal window (.window.movable-modal): no close box, ridges from the fourth column, a black rule across the whole width, a dialog body (white light, #999/#555 shade) with no frame band", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/hig/platinum9), frame nav (Navigation Services Open)", upstream: "left end 100% identical; the right end not compared" },
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
      { era: "platinum", claim: "clio.js: a chosen item blinks 3 times, 3 ticks dark and 3 lit, before the menu closes and the command runs", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Apple menu, each animation frame of the emulator's canvas recorded (release at 30 ms; dark at 59, 159, 276 ms; gone at 375 ms)", upstream: "General Controls' default Menu Blinking" },
      { era: "drawingboard", claim: "clio.js: as Mac OS 9: 3 blinks of about 3 ticks; a menu opened with a click stays open", status: "measured", source: "clio.css capture, Mac OS 8.5 with the theme in Infinite Mac, Edit > Show Clipboard released (changes at 59, 126, 177, 227, 277, 327 ms; gone at 376 ms)", upstream: "Appearance > Options in 8.5: Smart Scrolling and double-click collapse both off" },
      { era: "system6", claim: "clio.js: as Mac OS 9: the chosen item blinks 3 times, about 3 ticks dark and 3 lit", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac, File > Get Info released, each animation frame recorded (dark at 109, 193, 293 ms; gone at 392 ms)", upstream: "MenuFlash 3" },
      { era: "system7", claim: "clio.js: as Mac OS 9: 3 blinks of about 3 ticks", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, Edit > Show Clipboard released (dark at 63, 147, 246 ms; gone at 346 ms)", upstream: "MenuFlash 3" },
      { era: "both", claim: "clio.js: a submenu opens 9 ticks after its item lights (MenuDelay 8 ticks, polled)", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Apple menu > Control Panels (150 ms in two runs); MenuDelay's default read from the Menu Manager in the Mac IIx, Quadra 650 and New World ROMs (extended PRAM $7E, 8 ticks when zero)", upstream: "the same code in System 6, System 7 and Mac OS 9" },
      { era: "both", claim: "clio.js: leaving a parent item keeps its submenu while the pointer stays in the wedge from the last point inside the item to the submenu's two near corners (whole degrees) and does not move back away from it, for 60 ticks from leaving the item, not extended by further moves; outside the wedge the item under the pointer lights at once", status: "measured", source: "the Menu Manager's MenuSelect in the Mac IIx, Quadra 650 and New World ROMs (MenuDrag: extended PRAM $7F, 60 ticks when zero; DeltaPoint, FixRatio, AngleFromSlope); clio.css capture, System 7.5.3 in Infinite Mac (into the wedge: held 1.18-1.53 s; down or left: switched in 0.19-0.27 s, the emulator's input lag) and Mac OS 9.0 (held 1.42-1.46 s; outside 0.14-0.52 s)", upstream: "replaces the cone from the previous pointer position, re-armed on every move (0.11.0)" },
      { era: "platinum", claim: "clio.js: a menu opened with a click stays open until the next click (Mac OS 8 and 9); in System 6 and 7 it closes when the button comes up", status: "measured", source: "clio.css capture scripts for Mac OS 9.0 (click opens the Apple menu) and System 7.5.3 (menus must be held); System 6.0.8 in Infinite Mac: a click on File leaves no menu open", upstream: "--clio-menu-sticky" },
      { era: "both", claim: "clio.js: from the keyboard the bar is an application menu bar: one Tab stop (roving tabindex), a title's menu previewed on focus, Left/Right between menus, Down/Home/End into a menu, Esc one level at a time, Tab out closes all; Command-key equivalents from <kbd>⌘N</kbd> on menu bars marked data-clio-shortcuts, the title lit for 8 ticks", status: "adapted", source: "WAI-ARIA Authoring Practices, menubar pattern (via modern-web-guidance app-menus and menu)", upstream: "Mac OS 8 and 9 had no keyboard menu navigation; Command keys are opt-in so a page's demo menus never take the browser's shortcuts" },
      { era: "system7", claim: "Menus keep System 6's rows and black highlight; disabled items and the separator are solid #888 instead of a dither", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame file-menu", upstream: "separator row 100% identical" },
      { era: "system6", claim: "Menu bar: 20 rows with the rule on the last; an open title inverts rows 1–18, about 9px either side of the word", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "System 6.0.8 Finder File menu" },
      { era: "system6", claim: "Menu: hangs from the bar's rule with no top line; 1px ink frame and 1px drop shadow; 16px rows; text 13px in; the highlighted row inverts", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "System 6.0.8 Finder File menu" },
      { era: "system6", claim: "Separator: a full 16px row with a 1-on 1-off dotted rule on its ninth line", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu rows 164–179", upstream: "System 6.0.8 Finder File menu" },
      { era: "system6", claim: "Check mark: the Chicago check glyph, 9×8, 3px in from the frame", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), Apple menu Finder item", upstream: "redrawn as pixels in tooling/s6-art.py" },
      { era: "system6", claim: "Disabled items are drawn through QuickDraw's 50% gray pattern, aligned to the screen (ink kept where x + y is odd); clio.css clips the same 2px pattern, fixed to the viewport, to the text (solid #696969 only where background-clip: text is missing)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "\"Print\" 100% identical (s6-menu-disabled); set --clio-disabled-dither: none for solid #696969" },
      { era: "platinum", claim: "Menu bar: #ddd, white top line, #999 bottom line, 1px black rule, 20px; open title #333399 with #6666cc/#000088 lines", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:298, :45", upstream: "Mac OS 9 native menu bar captures 02/04" },
      { era: "platinum", claim: "Menu: no top rule, white/#999 inner bevel, #222 1px drop; 16px rows at weight 600; highlight #333399 with #6666cc/#000088 side columns", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:912 (P21), :917 (P24)", upstream: "GUIdebook Mac OS 9.0 Apple menu (Theme Lab specimen apple-menu)" },
      { era: "platinum", claim: "Separator: a 6px row with #888 on its third line and white on its fourth, the full width of the menu", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame file-menu", upstream: "between Close Window and Get Info" },
      { era: "platinum", claim: "Menu check mark (10x8, antialiased, read black on #ddd from an open pop-up menu; the 9x8 recovered before from the white-on-#339 chosen item had lost the tip's last column) and the 6x11 submenu arrow, redrawn from Mac OS 9.0", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frames popup-open and file-menu; tooling/p9-art.py", upstream: "replaces the classic-stylesheets art used before 0.8.0" },
      { era: "drawingboard", claim: "Menu bar: the theme's 630x27 picture (pxm 6104) tiled from the screen's left, 22 rows shown; menus: paper (ppat 7125) from the inside top-left in a frame of pattern pens (ppat 129-133) tiled from the menu's corner, a 2px pencil shade, fixed pencil pixels where the pens meet; 18px items; the separator is ppat 133", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames file-menu, edit-menu and control-panels-menu; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "File, Edit, Apple and Control Panels menus agree" },
      { era: "drawingboard", claim: "The chosen menu title and item are underlined in pencil instead of inverted", status: "measured", source: "the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "Menu_Title_Underline_Center, Menu_Item_underline_center; the title underline is visible under File in the capture" },
      { era: "drawingboard", claim: "Menu item underline: left 16px in, right 15px in, its middle piece tiled (the Appearance pop-up's ends 16px from both sides)", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames control-panels-menu and popup-open", upstream: "Energy Saver in the Control Panels menu" },
      { era: "system7", claim: "A menu longer than the screen ends in a scroll arrow row (11x6, black, 5px in); the up arrow is the down arrow turned over", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, frame hig/system7/cp", upstream: "Control Panels submenu; the up arrow inferred" },
      { era: "drawingboard", claim: "Menu scroll arrows are the theme's 364 (down) and 389 (up)", status: "measured", source: "the theme file's pxm#", upstream: "the down arrow found in the Control Panels submenu" },
      { era: "both", claim: "Menu bar extras (li.menu-extras: the Help and Application menus) sit at the right; a 16px icon can lead a title or an item", status: "measured", source: "clio.css captures, frames hig/*/app-menu, help-menu, apple-menu, cp", upstream: "positions not compared pixel by pixel" },
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
      { era: "both", claim: "clio.js: a held button draws pressed only while the pointer is on it; released elsewhere it does nothing", status: "inferred", source: "Inside Macintosh: Macintosh Toolbox Essentials (1992), TrackControl", upstream: "data-clio-off turns the held look off; browsers already click only on release over the button" },
      { era: "both", claim: "clio.js: Return or Enter presses the default button, Esc or Cmd-. the Cancel button, after showing it pressed for 8 ticks", status: "measured", source: "the Dialog Manager in the Mac IIx, Quadra 650 and New World ROMs (HiliteControl, Delay(8), HiliteControl); clio.css capture, System 7.5.3 in Infinite Mac, Find File's Find button after Return (dark at 76 ms, back at 211 ms)", upstream: "Esc and Cmd-. from the Macintosh Human Interface Guidelines (1992), ch. 6" },
      { era: "system7", claim: "Push buttons and the default ring stay black and white, as in System 6", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame page-setup (OK)", upstream: "93.8% identical; a few ring corner pixels differ" },
      { era: "system6", claim: "Push button: 20px tall, 1px ink round rectangle with corners of about 4px, paper face, Chicago 12 (AI System 6 uses 7px corners)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert, OK button 60×20", upstream: "System 6.0.8 stop alert" },
      { era: "system6", claim: "Pressed: the whole button inverts to ink with paper text", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame button-pressed (Cancel held in a TeachText alert)", upstream: "System 6.0.8" },
      { era: "system6", claim: "Disabled: the frame stays solid ink and the label is drawn through the 50% gray pattern (the menu's pattern, clipped to the label)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame save-dialog (Eject)", upstream: "Eject; at fractional zoom the pattern can blur, set --clio-disabled-dither: none for solid grey" },
      { era: "system6", claim: "Default button: a 1px gap then a 3px ring (68×28 around a 60×20 button)", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame alert", upstream: "agrees with Inside Macintosh, Dialog Manager: PenSize(3,3), InsetRect(-4,-4), FrameRoundRect(16,16)" },
      { era: "system6", claim: "Hovering over a button changes nothing; only a press inverts it", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames locked-alert and button-hover", upstream: "agrees with docs/design/CLASSIC_PLATINUM_FIDELITY.md:210" },
      { era: "platinum", claim: "Hover never changes a push button; pressed only on pointer-down, Space or Enter", status: "inferred", source: "docs/design/CLASSIC_PLATINUM_FIDELITY.md:210", upstream: "AI System 6 owner ruling: Platinum carries no hover state" },
      { era: "system6", claim: "Keyboard focus: a 1px dotted frame 2px out", status: "adapted", source: "apps/desktop/styles/00-foundation.css:519", upstream: "System 6 had no button focus; a dotted frame cannot be read as the default ring" },
      { era: "platinum", claim: "#ddd face, 1px black border, 3px corners, bevel white/#ddd over #777/#aaa", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:236", upstream: "GUIdebook Mac OS 9.0 About dialog (Theme Lab specimen default-ok)" },
      { era: "platinum", claim: "Pressed: #666 face, white text, #444/#555 top-left over #888/#777 bottom-right", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:933 (P29)", upstream: "Infinite Mac Mac OS 9.0 capture" },
      { era: "platinum", claim: "Default ring: 1px black, a #aaa band with #ddd/#777 edges, 1px gap", status: "measured", source: "apps/desktop/styles/65-platinum-utility.css:773", upstream: "GUIdebook Mac OS 9.0 (default-ok specimen)" },
      { era: "platinum", claim: "Disabled: #888 border, flat #ddd, #777 text; the default ring goes #888", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css (N5)", upstream: "GUIdebook Open dialog Eject button (button-disabled specimen)" },
      { era: "drawingboard", claim: "Push buttons: four pattern pens (ppat 7070-7072, 7079) tiled so their pixel 0 is on the last column and row, the corner pixels they leave, the hatched ButtonFaceCorner (image 0) flush in the lower right of the #cec6b5 face, and a 1px pencil shade right and below; the label 1px lower than Platinum's", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames themes-tab and energy-saver-alert; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "\"Save Theme…\" and \"Specify Settings\" agree" },
      { era: "drawingboard", claim: "Default button: a 3px band of pattern pens (ppat 7085 rows, 7086 columns) whose inner line is the box's edge, plus its corner pixels", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame energy-saver-alert; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "\"Close Message\"" },
      { era: "drawingboard", claim: "Held buttons lose the hatch; the foot and right side take other pens (ppat 7126, 7127) tiled from the second column and row", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame button-held; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "\"Save Theme…\" held" },
      { era: "drawingboard", claim: "Disabled buttons: #8c8c8c label on the same face", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame date-time", upstream: "\"Server Options…\"" },
      { era: "drawingboard", claim: "The pencil overruns at a button's corners: ButtonTopLeft, ButtonTopRight, Button_BotRight, ButtonBotLeft round a plain button and the four *Default pieces round the default one, drawn outside the box", status: "measured", source: "the theme's pxm# pixmaps (tooling/db-art.py); positions from frames themes-tab and energy-saver-alert", upstream: "each piece found 1:1 round \"Save Theme…\" and \"Close Message\"" },
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
      { era: "both", claim: "Open pop-up menu: the era's menu laid over the button, the current item on the button's row, checked", status: "inferred", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, SimpleText Text Style (frame platinum9/cl-size-popup)", upstream: "drawn with appearance: base-select where supported (Chrome 135, Safari 27; clio.js lines it up), by clio.js elsewhere; the row alignment is checked by npm run behaviour, not against pixels" },
      { era: "platinum", claim: "Open pop-up menu: its top on the button's top (the current item there), as wide as the button less its 20px of arrows, framed all round in black with the white and #999 bevel, the shadow starting 2px in; check mark 3px in, text 20px, each antialiasing level as the screen shows it", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Appearance > Fonts, Large System Font held with the pointer off the menu (frame fonts-popup-open)", upstream: "specimens p9-js-popup-open (clio.js, all three engines) and p9-popup-open (base-select, Chromium and WebKit) 100% identical" },
      { era: "platinum", claim: "While its menu is open the pop-up button's arrows are drawn pressed: #444 top row, #555 then a #666 face, white arrows, #777 and #888 below and right, the frame's corners to match", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frame fonts-popup-open); tooling/p9-art.py and frame-art.py", upstream: "specimens p9-js-popup-open-arrows and p9-popup-open-arrows (select:open) 100% identical" },
      { era: "system7", claim: "An 18px box with an 11×6 black triangle 5px from the right edge, label 15px in, and a 1px shadow that starts 3px in from the corner", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame numbers (Number Format)", upstream: "100% identical; the triangle is System 7's addition" },
      { era: "system6", claim: "An 18px rectangle with a 1px frame and a 1px drop shadow and no arrow; the shadow is what marks it as a menu; held, it inverts", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames save-dialog and popup-held (Standard File folder menu)", upstream: "the down triangle arrived with System 7" },
      { era: "system7", claim: "Dimmed: the whole control (frame, shadow, title, arrow) drawn through the 50% gray, ink kept where x + y is odd, the pattern from the control's corner (QuickDraw kept it to the screen); browsers do not fade it; the arrow centred at floor(spare / 2)", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, Memory control panel with virtual memory off (Select Hard Disk; frame memory)", upstream: "specimen s7-popup-disabled 100% identical in Chromium and Firefox; WebKit ignores mask-clip: no-clip, so the dimmed shadow is not drawn there" },
      { era: "system6", claim: "Dimmed: as System 7, the control through the 50% gray", status: "inferred", source: "the System 7 measurement; no dimmed pop-up menu found in System 6.0.8's control panels and Finder", upstream: "dimmed buttons and items use the same pattern there (measured)" },
      { era: "platinum", claim: "#ddd, 3px corners, white/#aaa bevel, bold label, a separate bevelled arrow part with the 7x10 arrow", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:1916 (P31)", upstream: "GUIdebook Mac OS 9.0 (popup-normal specimen), native 09b" },
      { era: "platinum", claim: "The arrow part, drawn with background layers: a #aaa divider 20px from the right, a raised box with a white left and top edge and a #aaa then #777 shade, the arrows 7px from the right and 4px down; the field has a white top line and #aaa foot", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame appearance-tab", upstream: "\"Apple platinum\" pop-up, 96.7% identical (p9-popup-end)" },
      { era: "platinum", claim: "Arrow art (7x10), black, and #888 when disabled", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frames appearance-tab and appearance; tooling/p9-art.py", upstream: "replaces classic-stylesheets dropdown.svg" },
      { era: "drawingboard", claim: "Pop-up menu: 20px, four pattern pens (ppat 7095-7098; disabled: their other rows) tiled from the last column and row, the corner pixels they leave, #cec6b5 face; the 7x9 double arrow 5px from the right and 4px down; the hatched ButtonFaceCorner (image 2, disabled image 3) ends 19px from the right", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "Appearance, Highlight Color and Variation pop-ups" },
      { era: "drawingboard", claim: "Open pop-up menu: drawn by clio.js wherever it runs (the browser's picker cannot carry the theme's shade and corner pixels; without clio.js, base-select draws it plain): its top on the button's, as wide as the button less 20px of arrows, the top pen shifted with the button's phase, text 18px in and a pixel higher than in pull-down menus, the check 1px in, the underline on the item's last rows", status: "measured", source: "clio.css capture, Mac OS 8.5 with the theme in Infinite Mac, Appearance > Appearance held (frame popup-open)", upstream: "specimens db-js-popup-open and db-popup-open 96.2% same, 98.9% within 8/255: the text's edge levels over the paper differ by a step" },
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
      { era: "system7", claim: "As System 6: a selected row inverts across the list", status: "inferred", source: "seen in the Keyboard control panel during capture; the Color control panel's highlight colour is Black & White (System 7.5.3 in Infinite Mac); the row itself not pixel-checked", upstream: "System 7.5.3" },
      { era: "system6", claim: "White list, 1px ink frame, 16px rows; a selected row inverts across the whole list width", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frames save-dialog and list-selected (Standard File)", upstream: "System 6.0.8 TeachText Save As" },
      { era: "platinum", claim: "Selection is lavender #ccccff with black text", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:128", upstream: "GUIdebook Mac OS 9.0 Open dialog (open-list-scrollbar specimen)" },
      { era: "platinum", claim: "Rows carry no divider", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:860 (P10)", upstream: "Mac OS 9 native list capture 21" },
      { era: "drawingboard", claim: "List boxes: a 2px olive #9c9c63 line, 1px of whatever is behind inside it (the pane's paper), white rows, the chosen row #ccf with black text", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame desktop-tab", upstream: "pattern list, lower-left corner" },
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
      { era: "both", claim: "Without clio.js the scroll box grows with the visible fraction instead of keeping its fixed length", status: "adapted", source: "clio.css", upstream: "browsers size ::-webkit-scrollbar-thumb themselves; load dist/clio.js for the fixed box" },
      { era: "system7", claim: "clio.js: the scroll box is the #555 line and 15 rows, 16 in all, right after the arrow's black line; dragged, it leaves a 14x16 outline in which the lane's #ddd turns black and its #777 dots stay, and the content scrolls on release", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (frames hig/system7/finder-scroll and finder-thumb-drag)", upstream: "specimen s7-js-scroll-top 100% identical" },
      { era: "system6", claim: "clio.js: the scroll box is 14x16 inside the bar's line; dragged, it leaves its frame XORed with dkGray, which over the ltGray lane comes out solid black, and the content scrolls on release", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac, System Folder list, the box pressed and held 56px lower (frame scroll-box-drag)", upstream: "specimen s6-js-scroll-drag 100% identical in Chromium, WebKit and Firefox (the pointer masked)" },
      { era: "both", claim: "clio.js: the lane's pattern is kept to the page, as QuickDraw kept it to the screen; the browser's own bar starts it at the lane", status: "measured", source: "clio.css capture, System 6.0.8 (System Folder) and System 7.5.3 (Infinite HD narrowed): the lane's dots fall on the same screen columns wherever the bar is", upstream: "specimen s7-js-hscroll-lane 100% identical; without clio.js the dots may sit one step along (adapted)" },
      { era: "system7", claim: "Horizontal bar: the vertical bar turned, its box the #555 line and 15 columns after the left arrow's black line", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, Infinite HD narrowed until it scrolls sideways (frame hbar)", upstream: "specimens s7-scroll-left, s7-scroll-right, s7-hscroll-thumb 100% identical" },
      { era: "platinum", claim: "clio.js: a 15-row box between black lines that it shares with the arrows; the bar is a black line and 14px, the window's frame closing it; lane shaded #777/#888 along the top and left and #bbb/#ccc down the right, and again just past the box; arrow and box bevels stop a pixel short of the far corners; dragged live", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac with Smart Scrolling off (frames hig/platinum9/finder-scroll-fixed, finder-thumb-drag)", upstream: "specimen p9-js-scroll-fixed 100% identical; the 16px bar before 0.11 was a pixel too wide and tall" },
      { era: "platinum", claim: "clio.js, data-clio-scrolling=\"smart\": both arrows at the far end, the up arrow first with its black line on the lane's side; the box sized to the visible share", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Appearance > Options > Smart Scrolling on (frame hig/platinum9/finder-scroll-smart)", upstream: "specimen p9-js-scroll-smart 100% identical; off by default, as in Apple's own Mac OS 9.0 screenshots" },
      { era: "platinum", claim: "clio.js: with nothing to scroll the lane is flat #eee, the arrows dimmed, the lines beside them #555", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frame hig/platinum9/finder-scroll-fixed, horizontal bar)", upstream: "specimen p9-js-scroll-off-h 100% identical" },
      { era: "both", claim: "clio.js: a held arrow or lane steps at once and keeps stepping while held, with no pause in System 6 and 7 and a pause of about 0.2 s after the first step in Mac OS 8 and 9 (--clio-scrollbar-repeat-delay)", status: "measured", source: "TrackControl in the Mac IIx and Quadra 650 ROMs calls the action procedure on every pass while the button is down; clio.css capture, Mac OS 9.0 Finder in Infinite Mac (held down arrow)", upstream: "Drawing Board assumed as Mac OS 9 (inferred)" },
      { era: "both", claim: "clio.js: an arrow step is 16px and a lane step the visible height less 16px; repeats every 50 ms", status: "adapted", source: "clio.css capture, System 6.0.8 Finder list in Infinite Mac: one click scrolled one 16px row; the Mac stepped as fast as the application could scroll (no fixed rate in the Toolbox), so the rate is chosen", upstream: "applications chose their own step and page" },
      { era: "platinum", claim: "A held scroll arrow: #777 face, #555 along the top and left, #999 along the bottom and right, the other two corners #777", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, Finder, the down arrow held at its corner (frame arrow-held)", upstream: "specimen p9-js-scroll-arrow-held 100% identical in all three engines (the pointer masked)" },
      { era: "platinum", claim: "Lane #aaa with a double bevel; lavender #9999ff scroll box with #ccf/#66c bevel and grip ridges; #ddd arrow boxes with stepped 2/4/6/8 arrows", status: "measured", source: "apps/desktop/styles/65-appearance-themes.css:336 (P16), :351 (P17), :364 (P27)", upstream: "Mac OS 9 native capture 16; GUIdebook Open dialog" },
      { era: "drawingboard", claim: "Scroll arrows: the theme's 16x16 boxes, normal, held and disabled, flush with the bar; the grow box is NoGrowBoxRight", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame themes-tab; the theme file's pxm# pixmaps, decoded by tooling/theme-resources.py and redrawn by tooling/db-art.py", upstream: "left and right arrows found 1:1 at (192,297) and (570,297)" },
      { era: "drawingboard", claim: "Track: #ece6e4 ruled by pattern pens (ppat 7045-7049: the edges and a double centre line) tiled from the track's start; scroll box from the theme's ends, stretch and grip, whose colours Mac OS passes through 16 bits (5 per channel); the grip lies over the ends at (length − 2) / 2 rounded down, so the 15px box shows 6px of its start, the grip and 7px of its end", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frames themes-tab and desktop-tab; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "the Themes list's horizontal bar and the pattern list's vertical bar" },
      { era: "drawingboard", claim: "clio.js: the scroll box keeps the theme's 15px whatever share of the content shows (Smart Scrolling off, the 8.5 default)", status: "measured", source: "clio.css capture, Mac OS 8.5 with the theme in Infinite Mac, Infinite HD at three sizes: the horizontal box 15px in each", upstream: "the browser's own bar sizes it by the share (adapted)" },
      { era: "drawingboard", claim: "clio.js, data-clio-scrolling=\"smart\": both arrows at the far end are one theme picture (ScrollArrowsDbl, pxm# 334 and 324), each button showing its half; held, only that arrow lights (state 4 for the first, 1 for the second); dimmed from the same resource", status: "measured", source: "clio.css capture, Mac OS 8.5 with the theme, Smart Scrolling on (frames smart-scroll, smart-held-left, smart-held-right); the theme file's pxm#", upstream: "specimens db-js-smart-arrows, db-js-smart-held-left and -right 100% identical in all three engines (the pointer on the held arrow masked); the vertical pair held matches the same way (frames only, no specimen); the dimmed state is still read from the resource order" },
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
      { era: "drawingboard", claim: "Alerts: the theme's eight Alert pictures (6127-6134) round the outline, edges tiled from their ends, on the window paper from 4px inside", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame energy-saver-alert; the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "every piece found 1:1 round Energy Saver's start-up notice" },
      { era: "drawingboard", claim: "Movable modal dialogs (.modeless-dialog, which is a .window) draw the document window's frame: #222 outline, 4px #cdc6bd frame, #777 inner line, 20px title bar over a #555 rule, the #777 band right and below", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame copy-progress-5", upstream: "Finder copy window; Movable_Modal pixmaps found 1:1" },
      { era: "drawingboard", claim: "Modal dialogs: the Modal pictures (6135-6142), which have the alert's sizes, placed the same way", status: "inferred", source: "the theme file's ppat and pxm# resources, decoded by tooling/theme-resources.py, written by tooling/db-art.py and tooling/db-pens.py", upstream: "no modal dialog was on screen in the captures" },
      { era: "platinum", claim: "Separator line (.separator, <hr class=separator>): etched, #888 then white one row lower and one column further right", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac, frame hig/platinum9/mouse", upstream: "100% identical" },
      { era: "system7", claim: "Separator line: a 3px band of QuickDraw's 50% grey, aligned to the screen", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac, frame hig/system7/memory", upstream: "—" },
      { era: "system6", claim: "Separator line: 1px of ink", status: "inferred", source: "clio.css", upstream: "—" },
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
      { era: "platinum", claim: "Secondary group box (fieldset.secondary): one #888 line, no light", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/hig/platinum9), frame sound (Settings for selected device)", upstream: "—" },
      { era: "both", claim: "A check box or pop-up menu can title a group box from inside the legend", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (frames in .fidelity/platinum9), frame date-time (Use a Network Time Server)", upstream: "—" },
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
      { era: "platinum", claim: "Frame: 1px black, #aaa outside on the top and left and white on the bottom and right, 10px inside; an indeterminate bar repeats a 16px period of blue and grey stripes", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame copy-progress-5; tooling/p9-art.py", upstream: "Finder copy window, Preparing to copy…" },
      { era: "platinum", claim: "The unfilled track, #bbb with an #888/#ddd inner bevel", status: "inferred", source: "apps/desktop/styles/65-appearance-themes.css:592", upstream: "AI System 6 token, not tagged as measured" },
      { era: "drawingboard", claim: "12px, a #756f66 pencil line with #333 on the left, #ddd6c5 inside; indeterminate bars carry the theme's Indeterminate_Progress_Arrows", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame copy-progress-5; the theme's pxm#", upstream: "Finder copy window, \"Preparing to copy…\"; the arrows found 1:1" },
      { era: "drawingboard", claim: "The determinate fill stays Platinum's", status: "inferred", source: "clio.css", upstream: "the copy ran too fast to show a determinate bar" },
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
      { era: "platinum", claim: "Tab art: sloped caps, #ccc tabs, the front tab #eee and 2px taller, drawn by tooling/tab-art.py from the measured geometry", status: "measured", source: "tooling/tab-art.py, from AI System 6 specimen selected-tab (GUIdebook Mac OS 9.0 Appearance)", upstream: "95.7% identical against GUIdebook (selected-tab)" },
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
      { era: "platinum", claim: "24px: 1px black lines round every cell; #c0c0c0 cells with a #c0c0c0 then white light and a #a0a0a0 then #808080 shade; an end cap, 13px scroll cells (sunken while there is nothing to scroll), 30px modules with the 16px icon 2px in and a 4x7 menu triangle 4px from the right, then 2px of black and the tab", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame strip-expanded", upstream: "Finder desktop; start of the strip 89.5% identical" },
      { era: "platinum", claim: "Held module: #808080 face, 2px #404040 light and 2px #c0c0c0 shade", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:platinum), frame strip-slider", upstream: "Sound module held" },
      { era: "platinum", claim: "End-cap icon, scroll arrows, menu triangle, the tab and the folded tab", status: "measured", source: "tooling/p9-art.py, redrawn from frames strip-expanded and strip-collapsed", upstream: "tab and folded tab 100% identical" },
      { era: "drawingboard", claim: "The Control Strip is not themed: Mac OS 8.5 under Drawing Board draws it exactly as Mac OS 9 does", status: "measured", source: "clio.css capture, Mac OS 8.5 with Drawing Board (npm run capture:drawingboard), frame finder", upstream: "same cells, bevels and tab, other modules" },
      { era: "system6", claim: "System 6 had no Control Strip: drawn at the Mac OS 9 geometry in ink and paper, with 1-bit arrows, triangle and tab drawn for clio.css", status: "adapted", source: "clio.css", upstream: "AI System 6 shows its Control Strip in every era" },
      { era: "system7", claim: "System 7.5.3 draws the Mac OS 9 strip in System 7 greys: #ccc cells, white light, #aaa then #888 shade, idle scroll cells sunken #888/white; end cap, arrows, triangle and tab identical pixel for pixel", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), frame folder-window", upstream: "Finder desktop" },
      { era: "system7", claim: "Held module in System 7 greys (#888 face, #555 light, #ccc shade)", status: "inferred", source: "clio.css, from Mac OS 9's held module", upstream: "not captured in 7.5.3" },
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
  ...hig,
  {
    id: "typography",
    name: "Type and tokens",
    summary: "The fonts, the palette and every --clio-* custom property you can override.",
    selectors: [".clio", ".text", ".heading", ".display", "[data-era=system6]", "[data-era=platinum]"],
    tokens: ["--clio-ink", "--clio-paper", "--clio-font-chrome", "--clio-font-text", "--clio-font-display", "--clio-font-size", "--clio-selection-bg", "--clio-focus-outline"],
    accessibility: "Text colours keep at least 4.5:1 on their grounds; disabled text keeps 3:1 or more.",
    html: `<div class="clio" style="padding: 12px; background: var(--clio-pane-bg)">
  <h2 class="heading">Clio Sans '84 is the system font</h2>
  <p class="text">Clio Text '84 (Geneva) is the application font. Every value is a --clio-* custom property you can override on any element.</p>
  <p class="display" style="font-size: 28px; line-height: 34px; margin: 0">Display: any other size</p>
</div>`,
    evidence: [
      { era: "system7", claim: "System 7 keeps System 6's fonts: Clio Sans '84 for chrome, Clio Text '84 for text", status: "measured", source: "clio.css capture, System 7.5.3 in Infinite Mac (npm run capture:system7), title bar text", upstream: "the title Infinite HD matches pixel for pixel" },
      { era: "system6", claim: "Chrome text is Clio Sans '84: Chicago 12 rebuilt pixel for pixel (104 Key Caps characters, space, |, ⌘ and ✓), ascent 11, descent 3, drawn without antialiasing", status: "measured", source: "clio.css capture, System 6.0.8 Key Caps (npm run capture:keycaps → tooling/extract-glyphs.py → fonts-src/clio-sans-84.txt)", upstream: "title bar 100% and default OK button 99.7% identical to the real screen" },
      { era: "system6", claim: "Application text is Clio Text '84 (Geneva 12) and small text Clio Text '84 9 (Geneva 9: info line, icon names, status), rebuilt the same way and drawn without antialiasing", status: "measured", source: "clio.css capture, System 6.0.8 Key Caps (Geneva 12) and Get Info comments (Geneva 9) → fonts-src/clio-text-84.txt, clio-text-84-9.txt", upstream: "TeachText's first line and the Finder info line are 100% identical to the real screen" },
      { era: "system6", claim: "ChicagoFLF stays in the stack as the outline fallback for sizes that are not multiples of 12px", status: "third-party", source: "vendor/system.css-reference/fonts/ChicagoFLF.woff2", upstream: "Robin Casady's ChicagoFLF (public domain), as shipped by system.css" },
      { era: "platinum", claim: "Charcoal when installed; Asap (OFL) as the last fallback at width 113 for text and 123 for titles, weights 400/600/700", status: "measured", source: "apps/desktop/assets/fonts/platinum/README.md; 65-appearance-themes.css:25", upstream: "Asap matched to a measured Charcoal sample's x-height and advance width" },
      { era: "platinum", claim: "Clio Sans '97 Display (.display, --clio-font-display): Charcoal's outlines traced with potrace from Mac OS 9.0 drawing every character at 72 points in Stickies, for sizes other than 12px and its multiples", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:charcoal-large → tooling/trace-outline.py)", upstream: "at 72px the ink overlaps the capture's by 90.3% (the rest is antialiased edge)" },
      { era: "platinum", claim: "Clio Sans '97: Charcoal 12 rebuilt pixel for pixel from Mac OS 9.0 Key Caps (107 glyphs, 3px space from the Finder title and the Apple menu, command key from the File menu), used when Charcoal is not installed, drawn unsmoothed", status: "measured", source: "clio.css capture, Mac OS 9.0 in Infinite Mac (npm run capture:keycaps -- charcoal), fonts-src/clio-sans-97.txt", upstream: "GUIdebook selected tab 80.5% to 95.7%, disabled button 88.2% to 96.9%" },
      { era: "platinum", claim: "Palette #fff #ddd #ccc #999 #777 #000, accent #333399, lavender #ccccff", status: "measured", source: "tooling/classic-platinum-fidelity-contract.json (platinum.palette)", upstream: "Mac OS 9 captures" },
      { era: "system6", claim: "Disabled text (menu items, button and control labels) through the screen-aligned 50% gray pattern", status: "measured", source: "clio.css capture, System 6.0.8 in Infinite Mac (npm run capture:system6), frame file-menu", upstream: "--clio-disabled-dither: none gives solid #696969 (5.6:1 on white)" },
      { era: "drawingboard", claim: "Chrome text is #313131; titles and labels are Charcoal, as in Platinum", status: "measured", source: "clio.css capture, Mac OS 8.5 with the 8.5b6 Drawing Board theme in Infinite Mac (npm run capture:drawingboard), frame appearance", upstream: "tab and title text ink" },
      { era: "both", claim: "Window titles and push button labels: each of Charcoal's 16 antialiasing levels takes the exact colour the real screen shows for that text colour on that background (Platinum titles on #ccc, buttons on #ddd, held buttons white on #666, disabled; Drawing Board buttons #333 on #cec6b5 with #313131 solid pixels), via Clio Sans '97 Exact palettes", status: "measured", source: "clio.css captures of Mac OS 9.0 and Mac OS 8.5 in Infinite Mac; tooling/aa-palettes.py", upstream: "Appearance title bar, Set Desktop normal and held, Save Theme…" },
    ]
  }
];
