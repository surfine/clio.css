# Lessons from the Classic Mac OS phase

How clio.css took System 6, System 7, Mac OS 8.5 Drawing Board and Mac OS 9 Platinum from
"close" to pixel-identical (0.8 → 0.11, November 2026), written down so the Mac OS X phase
starts from the method, not from memory. What is still open is in [ROADMAP.md](ROADMAP.md).

## 1. The rule that made it work

Every value is either measured from the real system or labelled as something else.
`components/index.mjs` records each claim with a status: **measured** (read from real
pixels or real timing), **inferred** (reasoned from documents or a neighbouring era),
**adapted** (a deliberate change for the web: focus rings, touch sizes, keyboard menus),
**third-party**. EVIDENCE.md and COVERAGE.md are generated from it. When a value cannot
be measured, say so in the row; do not round an inference up to a measurement.

## 2. Measuring

### The emulator

Infinite Mac (infinitemac.org) runs the real systems in the browser: System 6.0.8,
System 7.5.3, Mac OS 8.5 (with the 8.5b6 Drawing Board theme dropped in), Mac OS 9.0.
`tooling/emulator/drive.mjs` keeps one Playwright page on it and reads commands from a
file, so a measurement is a short script of moves, clicks and shots
(`tooling/emulator/d.sh`). The canvas is read 1:1 with `toDataURL`, never a screenshot of
the page.

- **Stills**: `shot NAME`. Dump the crop as characters (one letter per colour) to read
  geometry; that found every off-by-one in this phase.
- **Timing**: `rec x y w h ms` hashes a crop every animation frame and logs the times
  it changes. Menu blinking (3 × 3 ticks), the submenu delay (9 ticks) and the zoom rects
  (one per tick) came from this. Screenshots 100 ms apart are too slow.
- **Animations**: `film …` saves every changed frame; diff each against the frame before
  the action to get the rectangles drawn.
- **XOR drawing** (drag outlines, zoom rects): take `before`, then `during`, and diff.
  The changed pixels are the outline; their pattern (every other pixel, a 2px band) is
  the measurement.
- **Cursors**: Infinite Mac draws the pointer into the framebuffer. Park it on a flat
  colour and read the black and white pixels; the hot spot is where the move landed.

Emulator quirks that cost time:

- Infinite Mac's Mac OS 9.0 has **Smart Scrolling on**; Apple's own 9.0 screenshots
  (GUIdebook) show it off. Check a setting's factory default before taking a frame as
  "the" look.
- The emulator runs **faster than the hardware**: rates that depend on CPU speed
  (scroll repeat, app launch, the watch cursor) cannot be measured. Tick-based timers
  (blink, delays) can, because the Mac clock runs in real time.
- A double click that is too slow selects instead of opening: use `cmd o`.
- Installing the Drawing Board theme needed a slow drag (`slowdrag`) and a restart.
- The built-in browser pane cannot reach localhost or file URLs; drive everything from
  Playwright.

### The pixel check

`tooling/fidelity.mjs` renders each specimen and compares a crop with the same crop of a
captured frame: **same** (identical pixels) is the target, **exact** (≤ 8/255) is not
enough. Masks remove the pointer from held-state frames. `FIDELITY_DPR=2|3` renders at
that ratio and compares with the reference magnified by nearest neighbour;
`FIDELITY_ONLY=regex` runs a few specimens without rewriting the report; `act` holds a
state (a pressed arrow, a dragged box, an open menu) for the shot. 127 specimens, all but
Drawing Board's open pop-up identical at 1x in Chromium.

`tooling/behaviour.mjs` (`npm run behaviour`) drives clio.js in all three engines: 145 checks
of held controls, keys, menus, pop-ups, scroll bars, window moves, cursors, sounds.
A behaviour test must look at the result the user sees: a test that only read
`--clio-picker-shift` passed while the open picker sat in the page's corner.

## 3. Drawing what was measured

- **Art from pixels, never screenshots.** Scripts (`tooling/*-art.py`) redraw each part
  from the frame: fixed parts with the backdrop cleared from the edges inward, nine-slice
  frames for `border-image`, strips for animations, pixel maps for cursors. Screens and
  crops are never shipped; `.fidelity/` is git-ignored.
- **Drawing Board** ships the theme's own `pxm#`/`ppat` resources, decoded from the theme
  file (`tooling/theme-resources.py`, `db-art.py`, `db-pens.py`). Mac OS passed some
  pixmaps through a 16-bit buffer: quantise to 5 bits per channel. 128px patterns are
  sometimes started half a tile along: `--clio-db-phase`.
- **Fonts**: Clio Sans '84/'97 are the Mac's bitmap fonts rebuilt as outlines with the
  16 antialiasing levels as COLRv1 layers; the "Exact" faces carry palette entries
  measured per foreground/background pair. Safari draws COLRv0 only: the Plain files
  carry the same levels as COLRv0, recoloured with `@font-palette-values`.
- **One rule set for two renderings.** The scroll bars clio.js draws as elements take
  every `::-webkit-scrollbar` rule: the build copies each rule onto `.clio-sb-*`, mapping
  each pseudo-class to one class so relative specificity holds. With the boxes hidden,
  the two bars are pixel-identical in all four eras.
- **Gating a state without changing specificity**: every `:active` became
  `:active:where(:not([data-clio-off]))`; menu highlights got
  `:where(:not([data-clio-blink]))`.
- **Era-only rules**: a rule that must not reach Drawing Board goes in
  `src/91-platinum-only.css`, which the build leaves out of `clio.drawingboard.css`.
- **Retina**: `image-rendering: pixelated` on the root at 2/3/4 dppx, handed back to
  smoothing for the page's own images. What still differs at 2x is layout on half
  pixels (centred text with an odd spare width), which 1x rounds away.

## 4. CSS traps met in this phase

- An absolutely positioned grid item uses its grid area as the containing block:
  `grid-area: auto`.
- A custom property holding `var()` resolves where it is declared: put per-element values
  in rules, not tokens.
- `border-image` with `fill` paints over the background; a `z-index: -1` pseudo-element
  in an isolated box paints above the box's background.
- Two 1px borders of different colours split their shared corner into a blend: draw one
  of the lines as an inset `box-shadow`.
- `appearance: base-select` lays the closed button out as a centred inline-flex box (text
  a pixel off), and `top: anchor(top)` on `::picker(select)` did not resolve in Chromium:
  use `position-area: span-block-end span-inline-end`. Opting in replaces the phone's
  own picker, so it is limited to `(pointer: fine)`.
- `scrollbar-width: none` with element bars: reserve the bar in `padding`, and make the
  scroller `border-box`, or a content-box scroller grows by the bar.
- `position: sticky` inside a scroller keeps a zero-size first child at the corner, a
  host for overlay parts that need no wrapper around the author's content.
- A focus-opened menu (`:focus-within`) and a script-opened one fight: let the script
  mark the bar (`data-clio-menus`) and switch the CSS path off.

## 5. Behaviour (clio.js)

- Optional and separate: clio.css never needs it; every behaviour checks
  `data-clio-js="off"`.
- Era differences come from CSS custom properties read at run time
  (`--clio-scrollbar-thumb-tracking`, `--clio-menu-sticky`, `--clio-drag-outline-width`),
  so single-era builds and era switches need no script changes.
- Motion is opacity and transform only, and none under `prefers-reduced-motion`.
- Keyboard and assistive technology follow the web's patterns where the Mac had none
  (APG menu bar; a move button and menu for windows; a polite live region). Record
  those as **adapted**.
- Run modern-web-guidance before and after web work. The first check after 0.11.0 found
  the picker in the page's corner, base-select taking over touch pickers, and a menu bar
  that was not one Tab stop.

## 6. Three engines

- Run everything in WebKit and Firefox too (`CLIO_ENGINE`). What they taught:
  - WebKit dithers a *tiled* gradient layer and one with a hard stop to `transparent` by one
    step: give solid gradient layers `no-repeat` and an explicit size.
  - WebKit's fieldset padding box starts below the whole legend; WebKit rounds
    `::picker(select)`; Safari's COLRv0 file paints edge levels from the palette, so every
    non-black text colour needs one.
  - Firefox thickens pixel fonts on macOS unless `-moz-osx-font-smoothing: grayscale`; its
    range thumb travels the whole content box and is centred in it.
  - Chromium refuses a `::-webkit-scrollbar-thumb` shorter than 26px; WebKit honours the
    min-width.
  - A fixed background does not survive a transform: set the pattern's phase in script.
  - Centred text on a half pixel: the Mac and Chromium round down, WebKit blends, Firefox
    rounds up. CSS cannot fix it (it cannot read the text's width).
- Test harness traps: declare UTF-8 in generated pages; crop at the pixel the box snapped
  to; wait for fonts after layout; never sample a fast animation by polling afterwards
  (record it in the page as it happens); a Tab-order test needs a field, not a button, in
  Safari.

## 7. Behaviour measurements of the close (System 6 to Mac OS 9)

- QuickDraw's patterns keep to the *screen*: lanes, the drag gray. Keep them to the page.
- A dragged outline is the frame of the window's structure region: the frame and the drop
  shadow, notches included (the shadow starting 2px in makes Platinum's band step in).
  Compare outlines as sets of inverted pixels (`tooling/outline-check.mjs`), not as crops.
- Read every frame you would compare as XOR: the System 6 scroll box outline is dkGray
  XOR, which over the ltGray lane comes out solid black.
- Theme files have pictures for states you may not think of (Drawing Board's paired Smart
  Scrolling arrows): dump them all (`theme-resources.py pxm`) and match before drawing.
- **Never overwrite a capture frame.** Name every new frame for what it shows; a frame a
  script reads (p9-art.py read `popup-open`) can only be restored by recapturing it with
  the capture script's exact step and checking the script's output is unchanged.
- Infinite Mac: hold the mouse a moment before a menu press or it misses; in Drawing Board
  the Apple menu rows are 20px and the Control Panels submenu starts at y=37; quitting
  Appearance with Command-Q froze Mac OS 8.5 once (close its window instead).

- A shape fitted to inverted gray shows only every other pixel of the region: fit offsets
  against the measured set (Python, no browser) and say in the evidence that it is a fit.
- A dimmed control in System 7 is the control drawn and then grayed as a whole, shadow
  included; check what a CSS mask clips (the shadow lies outside the border box, and WebKit
  does not honour `mask-clip: no-clip`).
- Use the era's 2x2 pattern picture for masks, not a conic gradient: Firefox smooths a
  gradient at 2x and 3x.
- Before keeping a measured rate, look for the ROM's constant: a 567 ms blink in the
  emulator is CaretTime's 32 ticks (PRAM $88), and the emulator's ticks run a little slow.
- Name the screenshot moment: a blinking thing photographed late is "off"; specimens pin
  the lit state (reduced motion) rather than racing the timer.
- An emulator driver's `ready` line can be stale from an earlier run in the same folder:
  start each run in a fresh folder or clear the log first.
- Firefox fires no `selectionchange` for a field's own selection: listen to pointerup,
  keyup and select as well.

## 8. Process

- Work in batches that each end pushed and green: build, `npm test`, the pixel check and
  `npm run behaviour` in all three engines, `tooling/outline-check.mjs`, then push and wait
  for GitHub Pages to serve the new file.
- Keep a task note (`.notes/`, git-ignored) with each measurement as it is taken; the
  conversation will be compacted, the note will not.
- Generated files (`dist/`, `docs/`, `EVIDENCE.md`, `llms*.txt`) conflict on every rebase:
  rebuild from sources instead of merging them. Merge another session's branch by
  cherry-picking its commits, not the branch, when it sits on rewritten history; drop
  stray files (a `node_modules` symlink) on the way.
- Measure before deciding: half the "known" Mac behaviours checked in the emulator
  differed in a detail (Platinum's bar is 15px, not 16; the System 7 box is 16 rows,
  not 17; the I-beam has no cross bar).
- Ask the owner only for what changes the outcome; record decisions in memory and
  ROADMAP.md.
