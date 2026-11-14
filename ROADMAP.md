# Roadmap

Eras, in order (owner's decisions): System 6, System 7, Mac OS 8.5 Drawing Board, Mac OS 9
Platinum (done to the level below), then Mac OS X 10.0–10.4 and NeXTSTEP. Only eras that
can be measured in an emulator. Launch posts wait until Aqua is done. Method:
[LESSONS.md](LESSONS.md).

## Classic Mac OS: state after the close (2026-11-14, unreleased)

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

### Waiting (part of 0.12.0)

- **Rare controls** (`rDocProc` and side-title windows, placards, split bars, dials): measured
  in the emulator on branch `rare-controls`.
- **CJK fonts and Chinese layout**: branches `cjk-fonts` (font stacks and an OFL pixel stand-in)
  and the Chinese-system measurements.
- **Touch on the owner's phones**: `docs/touch.html` (iPhone SE on iOS 15.8.8, iPhone 18 Pro
  on iOS 27.3); the owner sends the screenshots. Checked here in the iOS 27 Simulator only.
- **Retina residue**: Chromium 129 and WebKit 120 of 135 identical at 3x; Firefox scales the
  art pictures smoothly at 2x and 3x (84 of 130), as before this batch.
- **npm**: 0.10.0 to 0.12.0 are published by the owner.

7. **Closed: the watch cursor.** Captured opening a Finder folder in System 7.5.3 and Mac OS 9.0 (identical); `aria-busy="true"` shows its first frame. Not drawn: the animation; not captured: System 6.
8. **Closed: the submenu rule.** Read from the Menu Manager in the System 6, 7 and Mac OS 9 ROMs and checked in the emulator: a wedge from the last point in the item to the submenu's near corners, MenuDelay 8 ticks, MenuDrag 60 ticks from leaving the item.
9. **Closed: timings.** Default button flash 8 ticks and insertion point 32 ticks (System 6/7; Mac OS 9 about 48) from the ROMs and the emulator; held arrows repeat with no pause in System 6/7 (TrackControl) and 0.2 s in Mac OS 9. No fixed repeat rate existed (as fast as the application scrolled), so clio.js's 50 ms stays a choice; clio.js draws the insertion point with these values.

## Gate to Mac OS X

Start Aqua when items 1–6 are closed or explicitly deferred by the owner, the pixel and
behaviour checks pass in all three engines, and the task note for the new phase starts
from LESSONS.md. Today: all six closed. The Mac OS X plan is [ROADMAP-MACOSX.md](ROADMAP-MACOSX.md).
