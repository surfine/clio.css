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
- Behaviour: 145 checks in Chromium and WebKit, 143 in Firefox (no base-select), with
  `dist/clio.js` and `dist/clio.min.js`; `tooling/outline-check.mjs`: dragged outlines
  pixel for pixel in System 6, 7 and Mac OS 9, 1333 of 1349 in Drawing Board;
  `tooling/min-check.mjs`: minified builds parse to the same rules.
- clio.js behaviour measured in all four eras: `tooling/emulator/measure-classic.sh`.

## Classic Mac OS: the "must close" items (all closed)

1. **Safari and Firefox.** `CLIO_ENGINE=webkit|firefox` for the pixel and behaviour checks.
   Left as an engine difference: centred text on a half pixel (CSS cannot read text widths).
   Touch: see "Can wait" (simulator).
2. **System 6 behaviour**, measured: window outline round the shadow, gray on odd pixels;
   scroll-box outline XOR dkGray; lanes kept to the screen; menus blink 3 x 3 ticks and close
   on button up; cursors as System 7.
3. **Drawing Board behaviour**, measured: fixed 15px scroll box (Smart Scrolling off by
   default), Smart Scrolling's arrow pair, drag outline (frame, shadow and the pieces'
   overrun; 35 pixels of 1349 left, see below), menu blinking, zoom rects, the collapsed
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

### Can wait (recorded, not blocking)

- **The window shadow's notch.** Platinum's drop shadow starts 2px in from the top-right
  and bottom-left corners; clio.css's box-shadow starts 1px in (one pixel at each corner;
  the specimens mask it).
- **Drawing Board's held Smart Scrolling arrows**: which held picture belongs to which arrow
  is read from the resource order, not a held frame.
- **Drawing Board's dragged outline, 35 pixels**: the close box's cross overrunning above
  the frame (clio.css does not draw that overrun either) and a line below the bottom-left
  corner 2px along.
- **Touch**: checked in the iOS Simulator's Safari, not on a real iPhone (see CHANGELOG).

7. **M: The watch cursor.** Never stayed on screen long enough; try a long Finder copy.
8. **M: The submenu direction rule.** Measured holds of about 1.2 s, but not which moves
   count as "towards the submenu"; clio.js uses a cone.
9. **Inferred for good: rates that depend on CPU speed** (scroll repeat step and rate,
   paging), and the insertion point (drawn by the browser; CSS cannot set its blink).
10. **Not drawn**: rounded-corner (`rDocProc`) and side-title windows, placards, split
    bars, dials. No captured screen shows one; draw them only if a page needs them.
11. **B: Retina residue.** Six specimens differ at 2x and 3x by one device pixel where layout
    lands on half a pixel (centred text with an odd spare width), plus Drawing Board's open
    pop-up menu.
12. **B: System 6/7 disabled pop-ups** are faded by browsers without base-select (the Mac
    did not fade them).
13. **Docs**: the README's unpkg example still pins 0.8.0.
14. **npm**: 0.10.0 and 0.11.0 are not published (the owner publishes).

## Gate to Mac OS X

Start Aqua when items 1–6 are closed or explicitly deferred by the owner, the pixel and
behaviour checks pass in all three engines, and the task note for the new phase starts
from LESSONS.md. Today: all six closed. The Mac OS X plan is [ROADMAP-MACOSX.md](ROADMAP-MACOSX.md).
