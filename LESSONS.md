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
  (scroll repeat, app launch) cannot be measured. The watch cursor can: `film` a crop round
  the pointer while double-clicking a Finder folder (System 7.5.3 and Mac OS 9.0). Tick-based timers
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
- Rare controls live in sample code: Infinite HD > Developer > Appearance SDK > Appearance
  Sample Code > CodeWarrior Pro > Appearance Sample runs in Mac OS 8.5 and 9.0, and its CDEF
  Tester draws any Appearance control on demand (placards came from it). The Calculator is
  the one rounded-corner window in every era.
- A driver started with a plain `&` inside an agent's shell dies when that command ends:
  start it with `nohup … & disown`. Drawing Board's scripted install is position-dependent;
  by hand: drop the theme on the System Folder, OK, Special > Restart, Appearance's pop-up.
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

## 7½. Telling smoothing from offset

A 2x specimen that fails is not necessarily blurred. List the failing pixels' colours: if
every one exists in the reference, the drawing is sharp and only shifted (a layout position
on a fraction of a pixel); new, in-between colours mean smoothing. In this phase Firefox's
"smoothed" 2x specimens were shifted by the test page's own default font; only two SVG
patterns embedding pictures were really smoothed (fix: `image-rendering` on the `<image>`).
Check a cause against the real context (clio.css's windows) before changing the product,
and keep a timebox: what does not fit goes to the next patch with its measurements written
down.

## 7¾. Chinese, Japanese and Korean (2026-11-15)

- **Where to measure.** Infinite Mac has one localized system, KanjiTalk 7.5.3. Chinese and
  Korean come from the Mac OS 9.0 install CD in its CD-ROM library (Software Installers >
  Language Kits), installed into the Mac OS 9.0 machine (`tooling/emulator/measure-cjk.sh`;
  `pageshot`/`pclick` drive the library's own buttons). The disk's 55,730K holds the two
  Chinese kits (25,511K) but not Korean too (the three need 56,825K): for Korean, trash the
  Internet and Applications folders first. Installs live only as long as the driver: write
  every measurement down before anything can kill it.
- **Getting CJK on screen.** The Finder's rename keeps the Chinese keyboards dimmed; Stickies
  takes them (Traditional Chinese starts in Cangjie: `l` 中, `yk` 文). The Text control
  panel's Script pop-up lists 繁體中文 and 简体中文: a standard pop-up menu with CJK rows,
  the cheapest specimen there is.
- **What was found.** CJK draws at the Roman geometry (rows, baselines; kanji ink from 10px
  above the baseline to 1px below). A localized system's system font is the script's font:
  KanjiTalk draws Latin chrome in Osaka, which is why the CJK fonts lead every stack.
- **Comparing a stand-in font honestly.** Glyphs that are not Apple's cannot match pixel for
  pixel: an `ink` box in `tooling/fidelity.mjs` leaves a run out of the pixel count and checks
  the rows that carry ink instead. Specimens must force the stand-in (`--clio-font-cjk`):
  current macOS has an Osaka, which the stack rightly takes first.
- **Metrics of a fallback font move the baseline.** WebKit and Firefox took the stand-in as
  the line's first font and set CJK a pixel low with its 13px ascent; Chromium did not.
  Give any font that can lead a stack Clio's metrics (ascent 11, descent 3 at 12px) in the
  file (`tooling/cjk-fonts.py`), not only in CSS.
- **Load per language.** A face is fetched only when text in its `unicode-range` meets a stack
  that names it, so naming the families only in `--clio-font-cjk` under `:lang()` keeps every
  other page at zero bytes (`tooling/behaviour.mjs` checks it). A frequency-sliced
  `unicode-range` would have cost about 100 KB of CSS; the national character set per file
  is both period-true and small (170–320 KB).
- **clio.js menus hang off the era's root**, outside the `<select>`: copy any attribute CSS
  needs (`lang`) onto the rows it draws.
- **Open:** Korean and Chinese on System 7 unmeasured; CJK in 9px small text (KanjiTalk drew
  8px kanji); Mac OS 9's lit top line on a highlighted first pop-up item (masked in
  `p9-zh-popup-open`).

## 7¾. Reading the ROMs (timings the emulator cannot settle)

The owner allowed reading Mac OS's own code for numbers and rules only; nothing of it
enters the repo (ROMs, dumps and disassembly stay in a scratch folder).

- The ROMs Infinite Mac boots are its assets: the page's network log names them
  (`Mac-IIx` for System 6, `Quadra-650` for 7.5.3, `Power-Macintosh-9500` for 8.5,
  `New-World` for 9.0). The New World file is compressed: `pip install tbxi`, then
  `tbxi dump` gives `Mac68KROM.src/MainCode` (68k) and `Rsrc/` (CURS, …).
- Old-world ROMs list their resources from the table at offset $1A (CURS 4 is the watch,
  MDEF 0, CDEF 0/1). Disassemble with capstone's M68K mode; name your scripts so they do not
  shadow the standard library (a `dis.py` breaks capstone's import) and run Python with -I.
- Find code by its trap sequence rather than by symbol: MenuSelect's submenu rule is the
  only place with DeltaPoint, FixRatio, AngleFromSlope (`A94F A869 A8C4`); the Dialog
  Manager's default-button flash is `A95D, Delay(8), A95D`; factory parameter RAM is a
  20-byte table starting `A8 00 00`; InitUtil turns it into CaretTime, DoubleTime and the
  key repeat globals.
- The same Toolbox code ran from System 6 to Mac OS 9 (the IIx, Quadra and New World ROMs
  agree byte for byte in the parts used): read once, then check each era in the emulator.
- The emulator adds 0.14–0.26 s of input lag and samples the pointer at its own rate:
  compare a held case with an immediate one in the same run, and do not try to find an
  angle boundary by probing; read it from the code.
- A caret in a busy application blinks irregularly; time it in System 6, or in General
  Controls' own preview (Mac OS 9's middle setting is about 48 ticks, not CaretTime's 32).

## 8. Process

- Never run `tooling/build.mjs` while a pixel or behaviour run is going: the run reads `dist/`
  mid-way and its numbers mix two builds. Run checks in the background, edit only files the run
  does not read, and rerun after any build.
- When several sessions share one checkout, `git fetch` before merging and expect conflicts only in
  generated files: rebuild them, and reconcile a value two sessions measured differently from its
  primary source (the ROM's CaretTime beat an emulator average).
- Read a misses file's column order before reasoning from it (`[x, y, ref rgb, clio rgb]`); reading
  it backwards sent one fix the wrong way.
- An absolutely placed `::after` counts its offsets from the padding box, inside the border:
  `right: -1px` still lands on the frame's own column.
- A specimen's backdrop belongs in the markup, not in a mask: wrap it (`beside()` in
  `fidelity.mjs`) with the colour or pattern beside the window, and give the wrapper room for the
  shadow. A data-URI picture inside a `style="..."` attribute must be fully percent-encoded and
  unquoted.
- A driving script that clicks by coordinates breaks when the emulator restores windows elsewhere:
  take a screenshot after each step that moves windows, and fall back to doing it by hand.

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
