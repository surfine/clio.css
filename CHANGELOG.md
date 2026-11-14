# Changelog

## Unreleased

The Classic final batch: the last pixel tails, the dimmed pop-up menu and TextEdit's
insertion point, each measured in Infinite Mac.

- **Platinum's window shadow** is a 1px line from the frame's third row and column, a notch
  at both corners (`::after` border lines; a box-shadow could only start 1px in), #555 behind
  another window. System 7's shaded window is 19px: the title bar's bottom line is the foot.
  The title bar and collapsed specimens no longer mask anything (100% in all three engines).
- **Drawing Board's dragged outline** matches all 1349 pixels and inverts none more: the
  structure region's top-left and bottom-left pieces lie 1px right of the drawn pieces
  (fitted in `tooling/db-outline.py`; `tooling/outline-check.mjs` allows nothing now).
- **Drawing Board's Smart Scrolling pair held**, measured in Mac OS 8.5: each arrow lights
  alone (specimens `db-js-smart-held-left`, `-right`).
- **System 6/7 dimmed pop-up menus**: the whole control drawn through the 50% gray (System
  7.5.3, Memory's Select Hard Disk); browsers no longer fade a disabled `<select>`. The arrow
  is centred at `floor(spare / 2)`. WebKit ignores `mask-clip: no-clip`, so its dimmed pop-up
  has no shadow.
- **clio.js draws the insertion point** in text fields inside a `.window`: a 1px line that
  inverts what is under it, 16px tall (`--clio-caret-height`), in the pixel left of the
  character, blinking every `--clio-caret-ticks` (32 in System 6/7, 48 in Mac OS 8/9). The
  browser's caret returns while text is selected or an input method composes; lit and still
  under reduced motion; the system's in forced colours; `data-clio-caret="off"` keeps the
  browser's. Specimen `s7-js-caret` identical in all three engines.
- **clio.js centres labels on whole pixels**: where a button, tab or window title's text
  would start on a half pixel, one more pixel at its end gives QuickDraw's `floor(spare / 2)`
  in every engine (measured on font load and resize, `data-clio-centre="off"`).
- **Colour fonts declared twice** (the Plain file alone, then with `tech(color-COLRv1)`), so a
  browser that cannot parse `tech()` keeps the font instead of losing it.
- **Touch bench**: `docs/touch.html`, twelve checks with expected results and an automatic
  environment report, for the owner's iPhone SE (iOS 15.8.8) and iPhone 18 Pro (iOS 27.3).
- README: the unpkg example names 0.12.0; clio.js's caret and centring are documented.

### Timings from the ROMs

Timings read from the Mac OS ROMs and checked in the emulator (ROADMAP 7–9 closed). The
values come from the Menu, Control and Dialog Manager code in the Mac IIx, Quadra 650 and
New World ROMs; no Apple code or resources are in the repository.

- Submenus: clio.js follows the Menu Manager's rule. Leaving the parent item, the submenu
  stays while the pointer is inside the wedge from the last point in the item to the
  submenu's two near corners, for 60 ticks (MenuDrag) from leaving the item; further moves
  do not extend it, and moving back away switches at once. Before, a cone from the previous
  pointer position, re-armed on every move.
- Scroll bars: a held arrow or lane repeats with no pause in System 6 and 7 (TrackControl
  had none) and after about 0.2 s in Mac OS 8 and 9 (`--clio-scrollbar-repeat-delay`).
- The watch cursor (System 7.5.3 and Mac OS 9.0, identical) for `aria-busy="true"`
  (`--clio-cursor-wait`).
- Evidence: the default button's 8-tick flash and the insertion point's 32 ticks (Mac OS 9's
  default about 48) measured.

Safari and Firefox, checked: `CLIO_ENGINE=webkit|firefox` runs the pixel check and
`npm run behaviour` in Playwright's WebKit and Firefox as well as Chromium.

- Pixel check: Chromium 129 of 131 identical, WebKit 127 of 131, Firefox 119 of 126 (FIDELITY.md;
  the two Chromium misses are Drawing Board's open pop-up menu, 96.2%, text over the paper). What
  still differs is a centred label whose text starts on a half pixel: the Mac and Chromium
  round it down, WebKit blends it, Firefox rounds it up. Behaviour checks: 145 in Chromium
  and WebKit, 143 in Firefox (the two base-select checks do not apply).
- Fixed for WebKit: group boxes (WebKit's fieldset padding box starts below the whole
  legend, so the dotted frame filled the band under the title); Platinum title-bar ridges
  and System 7's close and zoom boxes (WebKit dithers a tiled or translucent gradient
  layer by one step).
- Fixed for Safari's COLRv0 font file: Drawing Board's menu and dimmed menu text get
  their edge levels in #313131 and #8c8c8c, not black.
- Fixed for Firefox: sliders (`::-moz-range-track`, `::-moz-range-thumb`, the thumb
  brought onto the track); Clio Sans '84 and '97 drawn without the grey fringe Firefox
  adds on macOS (`-moz-osx-font-smoothing: grayscale`); slider tick spacing is a whole
  number of pixels, so every engine puts the ticks in the same place.
- Drawing Board scroll bars drawn by clio.js: the arrow art no longer sits a pixel low and
  the grip shows on the theme's 15px scroll box (it now lies over the box's ends,
  `(length − 2) / 2` rounded down from the start, as the Themes tab shows).
- **System 6.0.8 and System 7.5.3 behaviour, measured** in Infinite Mac
  (`tooling/emulator/measure-classic.sh`):
  - A dragged window's grey outline goes round the window *and its shadow*, and inverts
    the pixels whose x + y is odd wherever it is (QuickDraw kept the gray to the screen;
    clio.js keeps it to the page). `tooling/outline-check.mjs` compares the inverted pixels
    with the real drag: System 6 365 of 365, System 7 614 of 614, in all three engines.
  - System 6's dragged scroll box leaves its frame XORed with dkGray, solid black over the
    lane (it was a 50% dither); the box is 14px wide inside the bar's line (it covered the
    line). Specimen `s6-js-scroll-drag`.
  - Lane patterns keep to the screen: clio.js keeps them to the page (`--clio-sb-px/-py`).
  - Menus blink 3 times, about 3 ticks each, as in Mac OS 9; System 6 menus close when
    the button comes up; the cursors are the same arrow and I-beam.
  - System 7's horizontal scroll bar, its collapsed (WindowShade) window and its
    Black & White highlight colour checked against frames; new specimens
    `s7-scroll-left`, `s7-scroll-right`, `s7-hscroll-thumb`, `s7-js-hscroll-lane`,
    `s7-collapsed`.
- **Mac OS 9.0, measured**:
  - The dragged outline's 2px band follows the window's structure region, which steps
    in at the top-right and bottom-left corners where the shadow starts 2px in
    (`tooling/outline-check.mjs`: 1260 of 1260 pixels).
  - `clio.zoomRects()` per era: Mac OS 9 draws 6 outlines in the 2px band at
    1.4^(k−7) of the way and keeps them all until the window draws (`--clio-zoom-*`).
  - The collapsed window closes with the frame's shade and black line across the whole
    width; specimen `p9-collapsed`.
  - A held scroll arrow is #777 with a #555/#999 bevel (`--clio-scrollbar-button-bevel-on`).
  - The open pop-up menu: its top on the button's, as wide as the button less its arrows,
    framed all round with corners left #ddd, the shadow 2px in, the check mark 3px in
    and the text 20px, its text levels exact. clio.js and base-select draw it
    identically (`p9-js-popup-open`, `p9-popup-open`). The Platinum check mark is now
    10x8 (the old art had lost a column).
  - The slider's thumb stops 3px inside the track at both ends (Firefox now too).
- **Drawing Board (Mac OS 8.5 with the 8.5b6 theme), measured**: the dragged outline is the 2px
  band round the frame alone (no shadow); zoom rects, menu blinking and click-opened menus as
  Mac OS 9; the scroll box keeps its 15px whatever the content (Smart Scrolling off, the 8.5
  default). With Smart Scrolling the two arrows at the far end are the theme's one picture
  (new art `hpair`, `vpair`; specimen `db-js-smart-arrows`).
- **Drawing Board pop-up menus**: with clio.js loaded, clio.js draws them in every browser
  (`data-clio-popups` hands them back from base-select, whose picker cannot carry the theme's
  shade and corner pixels), now laid like the real one: top on the button's, as wide as the
  button less its arrows, the top pen in the button's phase, text and check placed as measured.
  clio.js passes the select's `--clio-db-phase` to the menu it draws.
- **The last Classic gaps** (owner's call: fix before Aqua):
  - Platinum: while a pop-up's menu is open its arrows are drawn pressed (clio.js marks the
    select `.clio-open`; base-select uses `select:open`).
  - Drawing Board: the collapsed window, the frame drawn as the theme draws it (the bottom
    corners and shadow under the title bar); the window edges tile from SVG patterns.
  - Drawing Board: the dragged outline follows the frame and shadow and the pieces' overrun
    (corner patches from `tooling/db-outline.py`): 1333 of 1349 pixels (was 1275).
- **Touch** (iOS Simulator, Safari, iPhone 18 Pro): `<select>` keeps the system picker;
  menus open and choose with taps; scroll areas scroll under a finger with their clio.js bars
  following. Fixed: a chosen menu item ran twice when press and release were both on it (a
  tap, or a click in a click-opened Mac OS 8/9 menu: the browser's own click followed
  clio.js's); a finger on a movable window's title bar now drags the window instead of the
  page (`touch-action: none` on `.clio-drag-bar`). Not tested on a physical iPhone.
- **`dist/clio.min.js`** (esbuild, 31 KB; the package exports `./js` and `./js.min`);
  `CLIO_JS=min npm run behaviour` checks it. **Budget**: `clio.min.css` may grow to 220 KB
  (owner, 2026-11-14); Mac OS X eras will ship as files of their own.
- Size: the minifier shortens `#aabbcc` to `#abc` and drops spaces around `>` and after a
  declaration's colon (`tooling/min-check.mjs` checks the minified builds parse to the same rules
  in all three engines); shared bevel token `--clio-p9-bevel`.
- Tooling: the specimen pages declare UTF-8 (WebKit read "…" as Latin-1), crops snap to
  the pixel the box was drawn on, and fonts are waited for after layout.

## 0.11.0 — 2026-11-14

Behaviour and details, measured where the emulators allow. The new optional
`dist/clio.js` adds what a stylesheet cannot do; clio.css works without it.

- **Windows** (clio.js): title-bar dragging with the grey outline (1px in System 7.5.3, a
  2px band in Mac OS 9.0, both measured), the collapse box, an opt-in double click, and
  `clio.zoomRects()` (8 outlines one per tick, eased by 1.6^k, measured).
- **Cursors**: the Mac's arrow and I-beam, on by default, at 1x/2x/3x.
- **Sounds** (clio.js): an interface only, silent unless you give it files.
- Menu bars follow the web's application-menu-bar keyboard model (one Tab stop, preview
  on focus, arrows between menus, Home/End, Tab out closes); the open `<select>` picker is
  placed with `position-area` (the `anchor()` insets left it in the page corner) and is
  used only with a fine pointer, so touch screens keep the system picker.
- Movable windows can be moved without dragging: a move button (hidden until it has
  keyboard focus) takes arrow keys and opens a menu of moves, as does a right click on
  the title bar; moves stay inside the page and are announced. `npm run behaviour`: 145.

- **Menus** (clio.js): press-drag-release and Mac OS 8/9 click-to-open menus, the chosen
  item blinking 3 times (3 ticks each, measured in Mac OS 9.0), submenus after 9 ticks
  (measured) that survive a move towards them, arrow keys, Return, Esc, and opt-in
  Command keys (`data-clio-shortcuts`). Without clio.js nothing changes; with it a menu
  no longer opens just because focus sits on its title.
- **Pop-up menus**: `appearance: base-select` draws the open `<select>` as the era's menu
  (Chrome 135, Safari 27); clio.js lines the current item up with the button there and
  draws the menu itself in other browsers. `npm run behaviour`: 111 checks.

- **clio.js** (optional, `dist/clio.js`): held controls let go off the pointer; Return,
  Esc and Cmd-. press the dialog's default and cancel buttons; scroll bars drawn as
  elements with each era's fixed-length scroll box, held arrows that repeat, paging from
  the lane, System 6/7's dragged outline and Mac OS 8/9's live drag and Smart Scrolling.
  The element bars take every `::-webkit-scrollbar` rule (the build copies them), so the
  two never drift; with both thumbs hidden they are pixel-identical in all four eras.
  `npm run behaviour` checks the behaviour in Chromium (68 checks).
- Platinum scroll bars re-measured from the Mac OS 9.0 Finder: 15px (a black line and
  14px; the window frame closes it), not 16px; arrow and box bevels a pixel short of the
  far corners; the lane shaded along the top, left and right only; the disabled bar flat
  #eee. Four new specimens, all identical (110 in all).
- System 7's scroll box keeps its black lane line in the corner (one blended pixel before).

- Retina: at 2x, 3x and 4x the art scales by nearest neighbour (crisp Mac pixels); the
  page's own images, video and canvas keep smoothing. At 2x 103 of 110 specimens are
  identical to the magnified reference (37 of 106 before) (`FIDELITY_DPR=2 npm run fidelity`).

## 0.10.0 — 2026-11-14

Every control the classic guidelines define is now in clio.css. COVERAGE.md checks the
Apple Desktop Interface (1987), the Macintosh Human Interface Guidelines (1992), Inside
Macintosh: Toolbox Essentials and the Mac OS 8 Human Interface Guidelines with its
Appearance Manager control list, row by row, era by era.

New, measured from System 7.5.3, Mac OS 8.5 Drawing Board and Mac OS 9.0 in Infinite Mac
(frames taken by hand this time, `tooling/hig-art.py` for the art):

- **Disclosure triangles** (`.disclosure`, `<details>`), **list views** (`.list-view`:
  column headers, the sorted column, the sort-direction mark).
- **Sliders** with tick marks (`input[type=range]`), **little arrows** (`.little-arrows`),
  so a clock or number field can be built.
- **Bevel buttons** (`.bevel`, as a toggle or a menu), the **help button**, **chasing
  arrows** (turned by a transform; still under reduced motion), **separator lines**,
  **image wells**, **secondary group boxes**.
- **Utility windows** (`.window.utility`), **movable modal windows**
  (`.window.movable-modal`), the Platinum **keyboard focus ring**.
- **Help balloons** (`.balloon`), **scrolling menus**, menu bar **extras** (Help and
  Application menus) and **menu item icons**.
- 16 new pixel specimens (106 in all), every one 100% identical (FIDELITY.md); what
  is inferred or lent from another era says so in EVIDENCE.md.
- `clio.min.css` may now grow to 200 KB (it is 168 KB).


## 0.9.3 — 2026-11-14

Reverts 0.9.2's OpenType-SVG levels: on real iPhones Safari drew no Platinum or Drawing
Board text at all (the iOS simulator drew it). Safari is back to 0.9.1's plain outlines.

## 0.9.2 — 2026-11-14

**Safari smooths Charcoal as Mac OS 9 does.** The Plain files Safari loads now carry the 16
antialiasing levels as OpenType-SVG glyphs (squares in the text colour at each level's
opacity), so iPhone and Mac Safari show the same grey edges as Chrome, in any text colour.
Browsers with neither COLRv1 nor OpenType-SVG still draw the outlines.

## 0.9.1 — 2026-11-14

**Safari**: Clio Sans '97 draws its antialiasing as COLRv1 colour layers, which Safari
paints solid, so Platinum and Drawing Board text turned into blocks on iPhone and Mac.
Each Clio Sans '97 face now lists a Plain file (outlines only, 3 KB) after the colour one,
chosen with `tech(color-COLRv1)`.

## 0.9.0 — 2026-11-14

Classic Mac OS at 100%: all 90 pixel-check specimens of System 6, System 7, Drawing Board and
Platinum are now identical to the real screen, pixel for pixel (FIDELITY.md gains a **same**
column: identical pixels, no tolerance), with the masks each specimen states (the mouse
pointer, text clio.css does not draw, what lies behind the control).

**Drawing Board is drawn with the theme's own art.** The owner chose to ship it: the
`pxm#` pictures and `ppat` patterns of Apple's 8.5b6 theme, re-encoded by `tooling/db-art.py`
into `dist/art/drawingboard/` (165 small PNGs, 57 KB) and placed as Mac OS places them.

- **Windows, alerts and modal dialogs**: the nine frame pictures round the outline, edges
  tiled from their ends, on the theme's paper from the content's corner.
- **Menu bar and menus**: the menu bar picture; menus on their own paper in a frame of
  pattern pens with a 2px pencil shade; the chosen item's underline tiled, not stretched.
- **Push buttons, default buttons, held buttons, pop-up menus and text fields**: Drawing
  Board draws their pencil lines with pattern pens. `tooling/db-pens.py` finds which pattern
  row draws each line and from where it is tiled (the control's last column and row; a held
  button's foot from its second), and reads the few corner pixels the pens leave.
- **List boxes and text fields** show what is behind them through the 1px inside their line.
- **Scroll bars**: tracks ruled by pattern pens; the scroll box keeps 5 bits per channel,
  as Mac OS draws it through a 16-bit buffer.
- Mac OS sometimes starts a 128px pattern half a tile along, depending on screen position;
  `--clio-db-phase: 64px` matches that case (README).
- The stylesheets reference only art files; `clio.min.css` is 139 KB (was 143 KB).

**Platinum**: the held push button, recaptured with the pointer clear of its corners, its
frame and dark face cut from Mac OS 9.0.

**Antialiasing as Mac OS blends it.** For a given text colour on a given background Mac OS
turns each of Charcoal's 16 coverage levels into one exact colour, which browser alpha
compositing misses by one step on some edge pixels. New **Clio Sans '97 Exact** and **Clio
Sans '97 Title Exact** paint each level from a palette entry, and `@font-palette-values`
(`tooling/aa-palettes.py`) give the levels read from the screens for Platinum window titles,
Platinum push buttons (normal, held, disabled) and Drawing Board push buttons. A page that
recolours those sets `--clio-font-window-title` or `--clio-font-button` to a stack without
"Exact".

## 0.8.0 — 2026-11-14

Classic Mac OS debts paid before Mac OS X.

**Clio Sans '97 Display**: Charcoal's outlines, traced with potrace from Mac OS 9.0 drawing
every character at 72 points (`npm run capture:charcoal-large`, `tooling/trace-outline.py`),
for every size the 12px bitmap does not cover. Use `.display` or `--clio-font-display`;
at 72px its ink overlaps the real screen's by 90%. No open-licence Charcoal outline exists
(a FontStruct pixel clone is CC BY-SA, Virtue states no redistribution terms), so clio.css
traces its own.

- **System 6 disabled text** is drawn through QuickDraw's 50% gray pattern, screen-aligned
  (menu items, button and control labels): "Print" in the File menu is now 100% identical.
  Menu items sit 13px in, not 15px (measured).
- **Platinum**, re-measured against Mac OS 9.0: the pop-up menu's raised arrow box (96.7%),
  the menu separator (a 6px row), the held radio button and check box, and the menu check
  mark, submenu arrow and pop-up arrows redrawn from the real screen. No classic-stylesheets
  art ships any more.
- **Drawing Board**: held buttons (the hatch goes, 84%), the pencil overruns at button
  corners (default ring 84%), list boxes (olive frame, 87.5%), the list scroll bar, the
  progress bar and its indeterminate arrows, the movable modal frame.
- **Control Strip**: System 7.5.3 measured (its own greys, same art); the end cap is drawn
  whole with its rounded corner (95.1% in both eras); the menu triangle sits 4px in.
- What stays adapted or inferred is listed in EVIDENCE.md: the Drawing Board paper and
  sketch textures (Apple artwork, owner's call), a few states that were not on screen in any
  capture, and web necessities (focus rings, proportional scroll boxes).

## 0.7.0 — 2026-11-14

**Clio Sans '97**: Charcoal 12, the Mac OS 8 and 9 system font, rebuilt pixel for pixel from
Mac OS 9.0 in Infinite Mac (`npm run capture:keycaps -- charcoal`, 107 glyphs, 3 KB).
Platinum and Drawing Board chrome now use it when Charcoal is not installed, drawn without
smoothing; Asap stays as the fallback.

- Measured, not assumed: Charcoal's space is 3px (the Finder title "Infinite HD" and the
  Apple menu's "About This Computer" agree); the "|" it was typed between is 2px wide.
- Platinum pixel check against GUIdebook: selected tab 80.5% to 95.7%, disabled button
  88.2% to 96.9%, default OK 92.4% to 95.2%, title bars 94.3% and 89.5% to 95.7% and 91.8%.

## 0.6.0 — 2026-11-14

**Control Strip** (`.control-strip`), with AI System 6's markup, so the same HTML styles in
both: module buttons with menu triangles, scroll arrows, the tab, `.is-collapsed` and
`data-edge="right"`.

- Measured from Mac OS 9.0 in Infinite Mac (`npm run capture:platinum`, new): 24px, black
  lines round every cell, #c0c0c0 cells with a white light and #a0a0a0/#808080 shade, 13px
  scroll cells that sink while idle, 30px modules, the held module, the tab and the folded
  tab (redrawn by `tooling/p9-art.py`; tab 100% identical). Mac OS 8.5 under Drawing Board
  draws the same strip. System 6 gets an ink-and-paper version (adapted).

**Platinum re-measured** against Mac OS 9.0 in Infinite Mac (new FIDELITY.md table):
title bar ends 96–97%, button face identical, check box frame 98.6%.

- Check mark and radio buttons are now Mac OS 9's own (mark 96.4%, radio 100%; against the
  older GUIdebook reference the checked box rises from 84.7% to 95.8%), replacing
  the classic-stylesheets check and the CSS-drawn ball.
- Disabled pop-up menus: #888 frame, flat face, grey arrow, no browser fade (95.6%);
  Drawing Board's own disabled pop-up measured too.

## 0.5.0 — 2026-11-14

**Drawing Board** (Mac OS 8.5b6, the appearance theme Apple shipped in the 8.5 betas and
withdrew): `data-era="drawingboard"` or `dist/clio.drawingboard.css`.

- Measured from Mac OS 8.5 in Infinite Mac with the theme installed
  (`npm run capture:drawingboard`, which installs the theme from the archive you supply and
  opens Appearance, the Finder, Date & Time, General Controls and Energy Saver): the pencil
  window frame (1px #222 outline, 4px #cdc6bd frame, #555 content line, the 6px #777 band
  on the right and bottom), the 20px title bar, the 22px menu bar, 18px menu items and the
  pencil underline that marks the chosen item, push buttons and the default ring, the
  brown alert frame, edit text, group boxes, the scroll bar track, the pop-up menu and tabs.
- Control art is the theme's own: `tooling/theme-resources.py` reads its resource fork
  (`ppat` pixel patterns and the undocumented `pxm#` pixmap lists, decoded here), and
  `tooling/db-art.py` re-encodes the close, zoom and collapse boxes, check boxes, radio
  buttons, scroll arrows, pop-up arrow, hatched button corner, tab ends and menu
  underlines. Each part was found 1:1 in the capture.
- The paper and sketch textures are not reproduced; surfaces use their dominant colour.
- Shares the Platinum layer (`90-platinum.css` now matches either era) and overrides it.
- Pixel check (`npm run fidelity`, 20 Drawing Board specimens): close and collapse boxes,
  check boxes and radio buttons 100%; pop-up end 90%; scroll track 83%; default ring 78%.
  Most of what remains is the paper grain and pencil variation that flat colours do not follow.
- The minified all-era build grows by about 31 KB (budget now 116 KB); the System 6,
  System 7 and Platinum single-era builds are unchanged.

## 0.4.1 — 2026-11-14

System 7 made solid: its controls captured in 7.5.3 (General Controls, Numbers, Finder copy).

- Pop-up menu: System 7's 11×6 triangle and the shadow that starts 3px in (100% identical).
- Progress bar: 11px, #ccf track, #444 fill (100%).
- Menus: disabled items and separators are solid #888 (separator 100%).
- Native group box: a grey 1px line.
- Check boxes, radio buttons and edit text confirmed identical to System 6.
- `capture:system7` now also takes General Controls, Numbers and the copy progress.

## 0.4.0 — 2026-11-14

**System 7** (colour, 7.5.3): `data-era="system7"` or `dist/clio.system7.css`.

- Measured from System 7.5.3 in Infinite Mac (800×600 canvas read 1:1,
  `npm run capture:system7`): the #eee/#777 title bar with its #ccf light and #99c shade,
  the bevelled close and zoom boxes and their held state, the #555 background window,
  the colour scroll bar (arrow boxes, grow box and grip redrawn from pixels by
  `tooling/s7-art.py`), the 1px #666/#aaa desktop and the colour alert frame.
- Geometry, fonts and black-and-white controls are System 6's, as in System 7.
- Pixel check: title bar 99.1%, inactive title bar 99.98%, arrow boxes, grow box and
  alert frame 100%.

## 0.3.1 — 2026-11-14

- **Clio Text '84** (Geneva 12) and **Clio Text '84 9** (Geneva 9), rebuilt from System 6.0.8
  the same way as Clio Sans '84 (Key Caps; Get Info comments for 9-point). They are the
  System 6 application and small text fonts. TeachText's first line and the Finder info line
  now match the real screen 100%.
- New token `--clio-font-small`; `npm run capture:keycaps -- geneva|geneva9`.

## 0.3.0 — 2026-11-13

- **Clio Sans '84**: Chicago 12 rebuilt pixel for pixel from System 6.0.8 (Key Caps), 108
  glyphs including ⌘ and ✓, 2.9 KB. It is now the System 6 chrome font, drawn without
  antialiasing so it stays 1-bit on half pixels. The System 6 title bar matches the real
  screen 100%, the default OK button 99.7%.
- The default button's ring is drawn as its own 8px-radius round rectangle, as Inside
  Macintosh's FrameRoundRect(16,16) does.
- `npm run capture:keycaps` and `npm run build:font` rebuild the font from the emulator.

## 0.2.1 — 2026-11-13

The rest of System 6, measured from System 6.0.8 in Infinite Mac.

- Pop-up menus: an 18px box with a 1px frame and shadow and no arrow (the triangle was a
  System 7 addition); held, it inverts.
- Progress bar fill: QuickDraw dkGray, not solid black.
- Push-button corners: 4.5px, which steps 3, 1, 1 pixels like the real ones.
- Left and right scroll arrows redrawn from the real pixels (1px left of a plain rotation).
- Confirmed: checked X, pressed button inverts, hover changes nothing, list selection
  inverts the full row, disabled buttons keep a solid frame.
- Group box is now labelled adapted: System 6 had none.
- capture:system6 takes 14 frames and checks its selections; the pixel check has 15
  System 6 specimens. Evidence: 57 of 78 rows measured.

## 0.2.0 — 2026-11-13

System 6 measured from System 6.0.8 running in Infinite Mac (canvas read 1:1).

- Title-bar boxes cut 1px of paper out of the stripes, not 3px.
- Held close and zoom boxes both draw the starburst, now with its centre dot.
- Push buttons have 4px corners (were 7px); the default ring is confirmed 1px gap + 3px.
- Alerts and modal dialogs: 1px ink, 2px paper, 2px ink (the gap was 1px).
- Finder info line: Geneva 9 in 17 rows.
- Menus hang from the menu bar's rule with no top line; an open title leaves the bar's top
  row white; text is 15px in; the separator rule sits on the ninth line of its row; the
  check mark is the Chicago glyph.
- Scroll bars: 15px (the window frame is the 16th line), QuickDraw ltGray lane, arrows and
  grow box redrawn from the real pixels.
- Edit text insets 3px.
- `npm run capture:system6` and System 6 specimens in `npm run fidelity`.
- Evidence: 50 of 77 rows measured (was 29 of 69).

## 0.1.0 — unreleased

First version, extracted from AI System 6.

- Eras: Macintosh System 6 (default) and Mac OS 8/9 Platinum (`data-era="platinum"`),
  plus single-era builds.
- Components: window, menu bar and menus, push button, check box, radio button, text
  field, pop-up menu, list box, scroll bar, dialogs and alerts, group box, progress bar,
  tabs, desktop and icons.
- Accepts system.css markup.
- 69 evidence rows (EVIDENCE.md); Platinum pixel check against GUIdebook Mac OS 9.0
  captures (FIDELITY.md).
- Docs site with live examples, JSON-LD and Open Graph; llms.txt, llms-full.txt and
  components.json for agents.
