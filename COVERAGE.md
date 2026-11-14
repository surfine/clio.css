# Coverage against Apple's guidelines

Every interface element the classic Mac OS guidelines define, and where clio.css draws it.
Sources:

- **HIG87**: *Human Interface Guidelines: The Apple Desktop Interface* (Apple, 1987), System 6.
- **HIG92**: *Macintosh Human Interface Guidelines* (Apple, 1992), System 7.
- **IM-TE**: *Inside Macintosh: Macintosh Toolbox Essentials* (Apple, 1992): window, control,
  dialog item and menu types.
- **HIG8**: *Mac OS 8 Human Interface Guidelines* (Apple, 1997), chapter 2 "Control Guidelines",
  and the *Mac OS 8 Toolbox Reference* control and window definition IDs (Appearance Manager).
  Drawing Board is an Appearance theme: it has the same controls as Platinum, drawn with
  its own art.

Status: **yes** (in clio.css, measured from that era's screens), **inferred** (in
clio.css, drawn from documents or other parts because no captured screen shows it),
**adapted** (the era did not have it; clio.css lends it another era's, so a page
keeps working when it switches era), **—** (not in clio.css, or not in that era).
Era columns: S6 = System 6, S7 = System 7, DB = Mac OS 8.5 Drawing Board,
P = Mac OS 8/9 Platinum. 0.10.0 added every row marked new in CHANGELOG.md.

| Element | Defined in | clio.css | S6 | S7 | DB | P |
| --- | --- | --- | --- | --- | --- | --- |
| Desktop and icons | HIG87 p.40; HIG92 ch. 8 | `.desktop`, `.icon` | yes | yes | yes | yes |
| Document window: title bar, close, zoom, collapse (WindowShade) boxes, size box | HIG87 p.42-46; HIG92 ch. 5; IM-TE `documentProc`, `zoomDocProc` | `.window`, `.title-bar` | yes | yes | yes | yes |
| Window without size box / zoom only (`noGrowDocProc`, `zoomNoGrow`) | IM-TE ch. 4 | `.window` (leave the boxes out) | yes | yes | yes | yes |
| Rounded-corner window (`rDocProc`, desk accessories) | IM-TE ch. 4 | — | — | — | — | — |
| Utility (floating) window | HIG92 ch. 5; HIG8 ch. 5; `kWindowFloat*` | `.window.utility` | inferred | inferred | inferred | yes |
| Side-title utility window (`kWindowFloatSide*`) | Toolbox Ref. | — | — | — | — | — |
| Modal dialog (`dBoxProc`), plain box, shadowed box | HIG87 p.58; IM-TE ch. 4/6 | `.modal-dialog`, `.standard-dialog` | yes | yes | yes | yes |
| Movable modal dialog (`movableDBoxProc`) | HIG92 ch. 6; HIG8 ch. 3 | `.window.movable-modal` | inferred | inferred | inferred | yes |
| Alert: note, caution, stop | HIG87 p.60; IM-TE ch. 6 | `.alert-box`, `.alert-icon.note/.caution/.stop` | yes | yes | yes | yes |
| Modeless dialog | HIG92 ch. 6; HIG8 ch. 2 | `.modeless-dialog` | yes | yes | yes | yes |
| Push button, default button | HIG87 p.56; IM-TE `pushButProc` | `button`, `.default` | yes | yes | yes | yes |
| Check box (incl. mixed), radio button | HIG87 p.56; HIG8 ch. 2 | `input[type=checkbox]`, `input[type=radio]` | yes | yes | yes | yes |
| Pop-up menu button | HIG92 ch. 4; IM-TE `popupMenuProc` | `select` | yes | yes | yes | yes |
| Scroll bar, scroll arrows, scroll box, size box | HIG87 p.49; IM-TE `scrollBarProc` | `::-webkit-scrollbar`, `.clio-scroll` | yes | yes | yes | yes |
| Text field (edit text), static text, password | HIG87 p.120; HIG8 ch. 2 | `input`, `textarea`, `label` | yes | yes | yes | yes |
| Keyboard focus ring | HIG8 ch. 3 | `:focus-visible` on fields and lists | inferred | inferred | inferred | yes |
| List box | HIG92 ch. 7; HIG8 ch. 2 | `.listbox`, `select[multiple]` | yes | yes | yes | yes |
| List view: column headers, sorted column, sort direction | HIG8 (window headers); Finder | `.list-view` | inferred | yes | adapted | yes |
| Disclosure (outline) triangle | HIG92 ch. 7; HIG8 ch. 2 | `.disclosure`, `details > summary` | adapted | yes | yes | yes |
| Slider and tick marks | HIG92 ch. 7; HIG8 ch. 2 | `input[type=range]`, `.ticks` | adapted | adapted | yes | yes |
| Little arrows | HIG92 ch. 7; HIG8 ch. 2 | `.little-arrows` | adapted | yes | yes | yes |
| Clock control (date, time) | HIG8 ch. 2 | a text field with `.little-arrows` | adapted | yes | yes | yes |
| Bevel button (push, toggle, menu) | HIG8 ch. 2 | `.bevel`, `.bevel.menu` | adapted | adapted | inferred | yes |
| Tab control | HIG8 ch. 2 | `[role=tablist]`, `[role=tabpanel]` | adapted | adapted | yes | yes |
| Group box (primary, secondary, titled by a check box or pop-up) | HIG8 ch. 2 | `fieldset`, `fieldset.secondary` | yes | yes | yes | yes |
| Separator line | HIG8 ch. 2 | `.separator`, `hr.separator` | inferred | yes | inferred | yes |
| Placard | HIG8 ch. 2 | — | — | — | — | — |
| Image well | HIG8 ch. 2 | `.image-well` | inferred | inferred | inferred | inferred |
| Window header (Finder info line) | HIG8 ch. 2 | `.details-bar` | yes | yes | yes | yes |
| Progress bar, determinate and indeterminate | HIG8 ch. 2 | `progress` | yes | yes | yes | yes |
| Chasing (asynchronous) arrows | HIG8 ch. 2 | `.chasing-arrows` | adapted | adapted | yes | yes |
| Help button | HIG8 ch. 3 | `.help-button` | adapted | adapted | yes | yes |
| Help balloon (Balloon Help) | HIG92 ch. 11 | `.balloon` | adapted | yes | yes | yes |
| Menu bar, pull-down menus, check marks, dividers, disabled items, keyboard equivalents | HIG87 p.65-72; IM-TE ch. 3 | `.menu-bar`, `.menu` | yes | yes | yes | yes |
| Hierarchical menu | HIG87 p.87; IM-TE ch. 3 | nested `.menu` | yes | yes | yes | yes |
| Pop-up menu (open) | HIG87 p.88 | `.menu` under a `select` | yes | yes | yes | yes |
| Scrolling menu (scroll arrows) | HIG92 ch. 4; IM-TE ch. 3 | `li.scroll-down`, `li.scroll-up` | inferred | yes | yes | inferred |
| Menu item icons; Help, Keyboard and Application menus | HIG92 ch. 4; IM-TE ch. 3 | `img` in items, `li.menu-extras` | yes | yes | yes | yes |
| Contextual menu | HIG8 ch. 4 | `.menu` on its own | — | — | yes | yes |
| Tear-off menu / palette | HIG87 p.90-91; HIG92 ch. 4 | `.window.utility` | inferred | inferred | inferred | yes |
| Control Strip | Mac OS 7.5-9 | `.control-strip` | — | yes | yes | yes |
| Split window / split bar, panels, dial | HIG87 p.53-57 | — | — | — | — | — |
| Cursors: arrow, I-beam | HIG87 p.93 | `--clio-cursor-arrow`, `--clio-cursor-text` (on by default) | inferred | yes | inferred | yes |
| Cursor: watch | HIG87 p.93 | — (the browser's busy cursor) | — | — | — | — |
| Window dragging (grey outline), zoom rects, collapse | HIG92 ch. 5; HIG8 ch. 5 | clio.js | inferred | yes | inferred | yes |

Not drawn (—): the rounded-corner and side-title windows, placards, split bars and
dials are rare enough that no captured screen shows one; the watch cursor never stayed on
screen long enough in the emulator to be captured. Evidence for every row is
in EVIDENCE.md; the pixel checks are in FIDELITY.md.
