# Roadmap

**Mission** (owner, 2026-11-15): one appearance engine for AI System 6, its site
(aisystem6.aaronlau.me) and Aaron Lau's blog (aaronlau.me), ending three separately
maintained looks and the duplicated work between them. clio.css is that engine; every era
it adds must serve the three.

Eras, in order (owner's decisions): System 6, System 7, Mac OS 8.5 Drawing Board, Mac OS 9
Platinum (done to the level below), then Mac OS X 10.0–10.4 and NeXTSTEP. Only eras that
can be measured in an emulator. Launch posts wait until Aqua is done. Method:
[LESSONS.md](LESSONS.md).

## Classic Mac OS: state at 0.12.0, the Classic final (2026-11-15)

- Every control and window in the 1987 and 1992 HIGs, Inside Macintosh: Toolbox
  Essentials and the Mac OS 8 HIG is drawn, except the five in "Not drawn" below
  (COVERAGE.md).
- 131 pixel specimens. Chromium: 129 identical (the two others are Drawing Board's open
  pop-up menu, 96.2%: text antialiased over the paper). WebKit 127 of 131, Firefox 119 of
  126 (+5 that do not apply): the rest are centred labels on a half pixel. 2x and 3x: 121.
- Behaviour: 154 checks in Chromium and WebKit, 152 in Firefox (no base-select), with
  `dist/clio.js` and `dist/clio.min.js`; `tooling/outline-check.mjs`: dragged outlines
  pixel for pixel in System 6, 7 and Mac OS 9, 1333 of 1349 in Drawing Board;
  `tooling/min-check.mjs`: minified builds parse to the same rules.
- clio.js behaviour measured in all four eras: `tooling/emulator/measure-classic.sh`;
  the timings the emulator could not settle (submenu rule, MenuDelay and MenuDrag, caret,
  default button, scroll repeat) read from the Menu, Control and Dialog Manager code in the
  Mac IIx, Quadra 650 and New World ROMs (numbers and rules only).

## Classic Mac OS: the "must close" items (all closed)

1. **Safari and Firefox.** `CLIO_ENGINE=webkit|firefox` for the pixel and behaviour checks.
   Left as an engine difference: centred text on a half pixel (CSS cannot read text widths).
   Touch: see "Waiting" (docs/touch.html on the owner's phones).
2. **System 6 behaviour**, measured: window outline round the shadow, gray on odd pixels;
   scroll-box outline XOR dkGray; lanes kept to the screen; menus blink 3 x 3 ticks and close
   on button up; cursors as System 7.
3. **Drawing Board behaviour**, measured: fixed 15px scroll box (Smart Scrolling off by
   default), Smart Scrolling's arrow pair, drag outline (frame, shadow and the pieces'
   overrun; all 1349 pixels since the final batch), menu blinking, zoom rects, the collapsed
   window.
4. **Platinum and System 7 details**: Mac OS 9 zoom rects, collapsed window, open pop-up
   menu and its pressed arrows (clio.js and base-select), held scroll arrow, slider ends;
   System 7's horizontal bar, Black & White highlight, WindowShade (Off in Infinite Mac; the
   control panel's factory setting not checked), collapsed window.
5. **Drawing Board pop-up**: clio.js draws Drawing Board pop-ups in every browser
   (`data-clio-popups`); without clio.js, base-select draws them without the paper and pens.
6. **Size** (owner, 2026-11-14): new eras ship as single-era files (`clio.aqua.css` and on);
   `clio.css` keeps the four Classic eras with a 220 KB budget for `clio.min.css` (now
   202.4 KB, gzip about 33 KB); `dist/clio.min.js` added (31 KB, gzip 10 KB).

### Can wait

Empty (owner, 2026-11-14: close everything for the Classic final, 0.12.0).

### Closed in the Classic final batch (2026-11-15)

- **The window shadow's notch**: Platinum's shadow is drawn as two 1px lines from the frame's
  third row and column (#555 behind another window); System 7's shaded window is 19px. The
  titlebar and collapsed specimens no longer mask it.
- **Drawing Board's held Smart Scrolling arrows**: measured with held frames in Mac OS 8.5
  (each arrow lights alone; the resource-order guess was right).
- **Drawing Board's dragged outline**: all 1349 pixels, none extra, in all three engines (the
  region's top-left and bottom-left pieces lie 1px right of the drawn ones, fitted to the frame).
- **System 6/7 disabled pop-ups**: measured in System 7.5.3 (the whole control through the 50%
  gray) and no longer faded by browsers. WebKit ignores `mask-clip: no-clip`, so its dimmed
  pop-up has no shadow (an engine difference, FIDELITY.md).
- **The insertion point**: clio.js draws TextEdit's (1px XOR, 16px, 32 ticks in System 6/7 and
  48 in Mac OS 8/9), the browser's during selection and input methods, an opt-out.
- **Centred labels on a half pixel**: clio.js adds the pixel QuickDraw's `floor(spare / 2)` left.
- **Watch cursor, submenu rule, timings** (items 7–9 below).
- **Docs**: the README's unpkg example names 0.12.0.
- **Rare controls**, found in software in Infinite Mac: the Calculator's rounded-corner
  window (`.rounded-window`) in all four eras; the Appearance SDK's sample application for
  the side-title utility window (`.window.utility.side`) and placards (`.placard`) in Mac OS
  9.0 and 8.5; BBEdit 5.1's split bar (`.split-bar`, `.split-line`) in Mac OS 9.0. Drawn from
  HIG92 (inferred): the System 6/7 split bar, which no application found had. A dial is a
  slider (HIG92). Not drawn: Drawing Board's own side-window pieces (it shares the top-title
  utility window's mixture), a held placard (the tester does not track it).

- **CJK fonts and Chinese layout**: merged (97eae6d): period stacks, Fusion Pixel stand-ins,
  measured geometry (CHANGELOG).
- **Retina, the real smoothing**: the two tiled SVG patterns (Drawing Board's menu and title
  underlines) embedded PNGs that browsers smoothed at 2x; their `<image>` is now pixelated,
  and `db-menu-underline` is identical at 2x in all three engines.

### Owner's steps

- **Touch on the owner's phones**: `docs/touch.html` (iPhone SE on iOS 15.8.8, iPhone 18 Pro
  on iOS 27.3); the owner sends the screenshots. Checked in the iOS 27 Simulator only. What
  they find goes into 0.12.1.
- **npm**: 0.10.0 to 0.12.0 are published by the owner.

### 0.12.1 (timeboxed out of 0.12.0, owner 2026-11-15)

- **Appearance sound sets** (owner, 2026-11-15): done (CHANGELOG Unreleased). Mac OS 8.5's
  alert list measured 2026-11-15 (6 sounds, Sosumi selected; SOUND-SETS.md §8) and Drawing
  Board now uses it. Push buttons and the delay field re-measured on a light-load emulator
  (SOUND-SETS.md §8): menus play on press and on release, Set Desktop stayed silent, the menu
  sounds' IDs were not identified — still open. Also left: serve Apple's four sets and the
  alerts from R2 to both sites behind an Appearance-style toggle, off by default.
- **Drawing Board's own cursors**: done — the theme's `crsr` 128 (arrow, 16x16, hot spot 0,0)
  decoded by `tooling/db-cursor.py`; 129-131 are drag badges (copy, alias, document), not used.

- **Drawing Board's utility windows** (top-title and side-title) still use Platinum's frame.
  The theme has them (`pxm#` 6187–6214); the pieces are decoded (`tooling/db-art.py --files`,
  committed) and the 2026-11-18 re-check with template matching confirms, at the offsets in
  `.notes/behaviour-0.11.md`: the left/right edge pieces and the bottom corners match **100%**
  of their opaque pixels, the rule ends 97/93%, the top-left cap 100% once the close box is
  masked, the bottom-left corner 100%; the 256-wide top and bottom pieces are **placed and
  clipped** (top from 625,215; bottom from 626,301), not tiled. Still open: the left and right
  edges show a 20px span between the 5x10 top piece and the 5x33 bottom piece that neither
  tiles nor stretches from either piece (65%/53% and 46%/23%), and the theme's `frme` resources
  (the likely owner of the stretch rule) do not carry the `pxm#` ids in their first 96 bytes.
  Next: read `frme` properly (the "middle of each side stretches" model) or find a second
  reference at another window height. **2026-11-18:** the Appearance Manager itself is now
  reachable — the 9.0 System file exports through The Outside World (Uploads), its data fork
  carries the AppearanceLib symbol table (`PlayThemeSound`, `PlayThemeControlSound`,
  `BeginThemeDragSound`, `DrawThemeListBoxFrame`, `DrawThemeWindowHeader`, … at 0x1e1b32) —
  so the frame and sound rules can be read from the code instead of guessed. The PEF
  containers parse (`tooling/pef.py`): AppearanceLib is the container at 0x25b810 in the 9.0
  System file (code 263,588 B, pattern data 50,148 B compressed), its 218 exports map
  `PlayThemeSound` → code 0x161f0, `PlayThemeControlSound` → 0x16230, `BeginThemeDragSound` →
  0x16270 (via TVectors in the decompressed data section), and the sound-map lookup at
  0x14498 confirms the entry layout (0x14 bytes for 8.5b6, 0x2c for the release sets: code +0,
  class +4, flags +6, delay +8, four slots from +0xc). The LTS decision: the utility window
  keeps Platinum's frame unless this is closed before 1.0.
- **Firefox at 2x and 3x** (111 and 105 of 150): fixed as a harness problem. The specimens'
  wrappers used the page's default font (Times 16px), so inline controls sat on quarter-pixel
  baselines in Firefox; each wrapper now carries Clio's metrics, except three progress bars
  whose wrappers keep the default (with the metrics WebKit put them on half pixels at 2x).
  Firefox is now 142 and 130 of 150; 1x is unchanged (Chromium 152/155, WebKit 152/155,
  Firefox 149/150) and so is 2x/3x in the other engines (Chromium 150/155 and 150/155,
  WebKit 147/155 and 142/155). What still differs in Firefox is specimens WebKit also misses
  (the Drawing Board collapsed windows, its pop-up, the chasing arrows, the grouped box).

7. **Closed: the watch cursor.** Captured opening a Finder folder in System 7.5.3 and Mac OS 9.0 (identical); `aria-busy="true"` shows its first frame. Not drawn: the animation; not captured: System 6.
8. **Closed: the submenu rule.** Read from the Menu Manager in the System 6, 7 and Mac OS 9 ROMs and checked in the emulator: a wedge from the last point in the item to the submenu's near corners, MenuDelay 8 ticks, MenuDrag 60 ticks from leaving the item.
9. **Closed: timings.** Default button flash 8 ticks and insertion point 32 ticks (System 6/7; Mac OS 9 about 48) from the ROMs and the emulator; held arrows repeat with no pause in System 6/7 (TrackControl) and 0.2 s in Mac OS 9. No fixed repeat rate existed (as fast as the application scrolled), so clio.js's 50 ms stays a choice; clio.js draws the insertion point with these values.

## Gate to Mac OS X

Start Aqua when items 1–6 are closed or explicitly deferred by the owner, the pixel and
behaviour checks pass in all three engines, and the task note for the new phase starts
from LESSONS.md. Today: all six closed. The Mac OS X plan is [ROADMAP-MACOSX.md](ROADMAP-MACOSX.md).
