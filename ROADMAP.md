# Roadmap

Eras, in order (owner's decisions): System 6, System 7, Mac OS 8.5 Drawing Board, Mac OS 9
Platinum (done to the level below), then Mac OS X 10.0–10.4 and NeXTSTEP. Only eras that
can be measured in an emulator. Launch posts wait until Aqua is done. Method:
[LESSONS.md](LESSONS.md).

## Classic Mac OS: state at 0.11.0 (2026-11-14)

- Every control and window in the 1987 and 1992 HIGs, Inside Macintosh: Toolbox
  Essentials and the Mac OS 8 HIG is drawn, except the five in "Not drawn" below
  (COVERAGE.md).
- 110 pixel specimens, all identical at 1x; 103 at 2x and 100 at 3x.
- clio.js: held controls, dialog keys, element scroll bars, menu tracking, pop-up menus,
  window dragging and moving, zoom rects, collapse, cursors, sounds; 145 behaviour checks.
- Checked in Chromium only.

## Classic Mac OS: still open

Each item says how it can be closed. **M** = can be measured in Infinite Mac;
**B** = browser work; **D** = a decision for the owner.

### Must close before Mac OS X

1. **B: Safari and Firefox.** Run the pixel check and `npm run behaviour` in WebKit and
   Firefox (Playwright has both). Neither has been run for anything in 0.11: base-select
   in Safari 27, the clio.js fallback pop-up in Firefox, COLRv0 fonts with clio.js,
   `image-set()` cursors, `mask-composite` outlines. Real iPhone for touch.
2. **M: System 6 behaviour.** Everything clio.js does in System 6 is inferred from
   System 7: the scroll-box outline (its dither), the window drag outline, menu blinking
   and holding, cursors. System 6.0.8 runs in Infinite Mac.
3. **M: Drawing Board behaviour.** Fixed scroll-box length (15px is the theme's minimum,
   not a measured fixed box), Smart Scrolling's look, drag outline, menu blinking, the
   collapsed window. Mac OS 8.5 with the theme runs in Infinite Mac.
4. **M: Remaining Platinum and System 7 details.** Mac OS 9 zoom rects (only System 7's
   were measured); the collapsed window compared with a capture; the open pop-up menu
   compared pixel for pixel (frame `platinum9/cl-font-popup` exists); System 7's
   horizontal scroll bar, selection colour and WindowShade control panel (double click
   on by default?); the held Platinum scroll arrow.
5. **B: Drawing Board pop-up drawn by the browser** (base-select) lacks the theme's paper
   and pens; the element menu clio.js draws has them. Either draw them in
   `::picker(select)` or let clio.js draw Drawing Board pop-ups everywhere.
6. **D: Size.** `clio.min.css` is 193 KB of its 200 KB budget; `clio.js` is 39 KB
   (11.5 KB gzip) with no minified build. Mac OS X will not fit the all-eras file. Decide
   before Aqua: single-era files only for new eras, a split `clio.classic.css`, or a new
   budget; and add a minified clio.js.

### Can wait (recorded, not blocking)

7. **M: The watch cursor.** Never stayed on screen long enough; try a long Finder copy.
8. **M: The submenu direction rule.** Measured holds of about 1.2 s, but not which moves
   count as "towards the submenu"; clio.js uses a cone.
9. **Inferred for good: rates that depend on CPU speed** (scroll repeat step and rate,
   paging), and the insertion point (drawn by the browser; CSS cannot set its blink).
10. **Not drawn**: rounded-corner (`rDocProc`) and side-title windows, placards, split
    bars, dials. No captured screen shows one; draw them only if a page needs them.
11. **B: Retina residue.** Seven specimens differ at 2x by one device pixel where layout
    lands on half a pixel (centred text with an odd spare width).
12. **B: System 6/7 disabled pop-ups** are faded by browsers without base-select (the Mac
    did not fade them).
13. **Docs**: the README's unpkg example still pins 0.8.0.
14. **npm**: 0.10.0 and 0.11.0 are not published (the owner publishes).

## Gate to Mac OS X

Start Aqua when items 1–6 are closed or explicitly deferred by the owner, the pixel and
behaviour checks pass in all three engines, and the task note for the new phase starts
from LESSONS.md.
