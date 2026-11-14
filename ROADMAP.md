# Roadmap

Eras, in order (owner's decisions): System 6, System 7, Mac OS 8.5 Drawing Board, Mac OS 9
Platinum (done to the level below), then Mac OS X 10.0–10.4 and NeXTSTEP. Only eras that
can be measured in an emulator. Launch posts wait until Aqua is done. Method:
[LESSONS.md](LESSONS.md).

## Classic Mac OS: state after the close (2026-11-14, unreleased)

- Every control and window in the 1987 and 1992 HIGs, Inside Macintosh: Toolbox
  Essentials and the Mac OS 8 HIG is drawn, except the five in "Not drawn" below
  (COVERAGE.md).
- 127 pixel specimens. Chromium: 125 identical (the two others are Drawing Board's open
  pop-up menu, 96.2%: text antialiased over the paper). WebKit 123 of 127, Firefox 116 of
  123 (+4 that do not apply): the rest are centred labels on a half pixel. 2x and 3x: 119.
- Behaviour: 145 checks in Chromium and WebKit, 143 in Firefox (no base-select);
  `tooling/outline-check.mjs`: dragged outlines pixel for pixel in all four eras;
  `tooling/min-check.mjs`: minified builds parse to the same rules.
- clio.js behaviour measured in all four eras: `tooling/emulator/measure-classic.sh`.

## Classic Mac OS: the "must close" items

1. **Safari and Firefox: closed.** `CLIO_ENGINE=webkit|firefox` for the pixel and behaviour
   checks. Fixed: WebKit fieldsets, dithered gradient tiles, Safari's picker corners and
   COLRv0 palettes for Drawing Board menu text; Firefox sliders (thumb, travel), font
   smoothing, and its scroll bars through clio.js. Left as engine differences: centred text on
   a half pixel (CSS cannot read text widths). Not done: a real iPhone for touch.
2. **System 6 behaviour: closed** (measured). Window outline round the shadow, gray on odd
   pixels; scroll-box outline XOR dkGray; lanes kept to the screen; menus blink 3 x 3 ticks
   and close on button up; cursors as System 7.
3. **Drawing Board behaviour: closed, two parts left.** Measured: fixed 15px scroll box
   (Smart Scrolling off by default), Smart Scrolling's arrow pair, drag outline, menu
   blinking, zoom rects. Left: (a) the collapsed window: the theme draws the title bar over a
   7-row band of the frame's foot (frame drawingboard/collapsed); clio.css's frame, made of
   fixed corner pictures, needs its own collapsed composition; (b) the drag outline's sketch
   overshoots (87 of 1349 pixels).
4. **Platinum and System 7 details: closed, one part left.** Mac OS 9 zoom rects (6 in the 2px
   band, all kept), collapsed window, open pop-up menu (identical, clio.js and base-select),
   held scroll arrow, slider ends; System 7's horizontal bar, highlight colour (Black &
   White), WindowShade (Off in Infinite Mac; the control panel's factory setting not checked),
   collapsed window. Left: the pop-up button's arrows drawn pressed while its menu is open
   (frame platinum9/fonts-popup-open).
5. **Drawing Board pop-up: closed.** clio.js draws Drawing Board pop-ups in every browser
   (`data-clio-popups`); without clio.js, base-select draws them without the paper and pens.
6. **Size: decision needed (owner).** `clio.min.css` is 198.5 KB of 200 KB (gzip 32.4 KB,
   brotli 24.9 KB); `clio.js` 52.1 KB (gzip 14.8 KB). Options, with today's numbers:
   - A. New eras as single-era files only (`clio.aqua.css`); `clio.css` stays the four
     Classic eras. Classic keeps 1.5 KB of headroom under the 200 KB budget.
   - B. Split: `clio.classic.css` (today's all-eras file) and `clio.css` becoming all eras
     including Aqua (about 330 KB, judging by Platinum's 135 KB alone). Breaks no link
     only if `clio.css` keeps every era.
   - C. Budget on transfer size instead of bytes: for example 40 KB gzip for the all-eras
     file (today 32.4 KB).
   - D. A minified `dist/clio.min.js` (esbuild 0.28: 31.1 KB, gzip 9.8 KB), independent of A-C.

### Can wait (recorded, not blocking)

- **The window shadow's notch.** Platinum's drop shadow starts 2px in from the top-right
  and bottom-left corners; clio.css's box-shadow starts 1px in (one pixel at each corner;
  the specimens mask it).
- **Drawing Board's held Smart Scrolling arrows**: which held picture belongs to which arrow
  is read from the resource order, not a held frame.

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
from LESSONS.md. Today: 1, 2 and 5 closed; 3 and 4 closed but for the parts listed (the owner
may defer them); 6 waits for the owner's choice. The Mac OS X plan is [ROADMAP-MACOSX.md](ROADMAP-MACOSX.md).
