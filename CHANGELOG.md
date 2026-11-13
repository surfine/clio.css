# Changelog

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
