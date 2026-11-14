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
`FIDELITY_ONLY=regex` runs a few specimens without rewriting the report. 110 specimens,
all identical at 1x.

`tooling/behaviour.mjs` (`npm run behaviour`) drives clio.js in Chromium: 145 checks
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

## 6. Process

- Work in batches that each end pushed and green: build, `npm test`, the pixel check, the
  behaviour check, then push and wait for GitHub Pages to serve the new file.
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
