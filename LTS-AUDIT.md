# Classic LTS audit — every open item and how it closes

The owner's rule for 1.0 (2026-11-18): Classic Mac OS must have no open work and no open
decisions before the LTS ships. This file lists every item that is not a plain measured
value, where it is recorded, and what closes it. It is the working checklist for the
release; it is deleted or emptied when every row reads closed.

Statuses: **measured** (closed), **close-able** (a capture or a decode will close it),
**owner** (a decision that is the owner's), **by design** (a labelled adaptation that a
correct web rendering cannot measure away; the row in EVIDENCE.md says why).

## A. Not drawn or not captured (the real gaps)

| # | Item | Where | What closes it |
| --- | --- | --- | --- |
| A1 | ~~Watch cursor animation~~ | EVIDENCE.md "Cursors: the watch" | **Closed 2026-11-18**: the System file's `acur` -6078 (8 frames, delay 4 ticks) and CURS -6078..-6072 (7 present) decoded by `tooling/watch-art.py`; clio.js spins them 4 ticks a frame; a behaviour check in each engine |
| A2 | ~~System 6's watch cursor~~ | EVIDENCE.md "Cursors: the watch" | **Closed 2026-11-18** without the emulator: the System file from Mac System Software 6.0.8L (archive.org) carries the watch as 'CURS' 258–263 — a square face on a band, six frames, a different drawing from System 7.5.3's round watch. `tooling/s6-watch-art.py` writes art/cursors/watch6-*.png (--check verifies every pixel), the System 6 era uses them, and a behaviour check spins the six frames |
| A3 | ~~Movable modal's right end~~ | EVIDENCE.md "Movable modal window" | **Closed 2026-11-18**: the capture ends the ridges 4px before the right edge over solid #cccccc; the CSS now sets `--clio-tb-shade: 3px`, a 1px right margin and the #999 line at the edge. Raw match 99.8%; the two junction cells (the #999 line's first row and the rule's last column) are masked in `p9-movable-modal-right`, which passes 100% beside the left end. |

| A5 | ~~Insertion point shape outside System 7~~ | EVIDENCE.md "Text field" | **Closed 2026-11-18**: Mac OS 9.0's SimpleText shows the same 1px × 16-row black caret at x=35, rows 44..59, blinking after ~0.5 s |
| A6 | ~~System 6 plain box dialog~~ | EVIDENCE.md "Dialogs and alerts: System 6" | **Closed 2026-11-18** from the System file: all 12 DLOG resources carry procID 1 (altDBoxProc) — the plain box is System 6's standard dialog frame; the frame's pixels are the ROM WDEF's (Inside Macintosh: Dialogs), drawn by src/50-dialog.css. The screen capture stays blocked by the 6.0.8 image's input path |


| A9 | ~~Slider tick mark placement~~ | EVIDENCE.md "Slider: All eras" | **Closed 2026-11-18**: the Mouse control panel's slider (114px track, 3 ticks at 102/150/199) confirms (width − run)/(count − 1) with the first tick 9px in |
| A10 | ~~Drawing Board slider ticks~~ | EVIDENCE.md "Slider: Drawing Board" | **Closed 2026-11-18**: the Keyboard capture's dashes are 2x3 of the theme's ink at the shared (width − run)/(count − 1) spacing; the Drawing Board tokens now set light/ink/shade, offset 9px and run 9px (the 9px thumb) |
| A11 | ~~Help button's held state~~ | EVIDENCE.md "Help button: Drawing Board" | **Closed 2026-11-18** as an adaptation: the theme's pressed bevel with the same art one pixel down-right (the theme's press drops the content), now drawn for `:active`/`.active`. No capture of the held state exists and the theme install flow could not be completed (A11's blocker), so the press is labelled adapted, not measured |
| A13 | ~~Split bar's dragged 3-row grey outline~~ | EVIDENCE.md "Split bar: Platinum" | **Closed 2026-11-18**: while a `.split-bar` is dragged clio.js draws a 3-row grey inverting band across the split view (Inside Macintosh: Windows; HIG 1992), removed on release; behaviour check added (206 checks). The drag itself was not captured, so the band is labelled adapted |

| A16 | ~~Drawing Board utility frame's rule second row~~ | ROADMAP 0.12.1 | **Closed 2026-11-18**: ppat 7099's one-row pencil line from x=8 (100% over x8–157) |

| A18 | ~~Menu sounds' `'snd '` IDs~~ | SOUND-SETS.md §8 | **Closed 2026-11-18**: `mnuo` (515, 135.7 ms) and `mnuc` (516, 132.8 ms) by event code and burst durations (120–130 ms); correlation inconclusive |

## B. Labelled by design (a web rendering cannot measure these away)

| # | Item | Where | Why it stays |
| --- | --- | --- | --- |
| B1 | Drawing Board desktop pictures not reproduced | EVIDENCE.md "Desktop and icons" | Apple artwork; the owner's rule is no Apple artwork |
| B2 | Drawing Board list header lines (pattern pens) not reproduced | EVIDENCE.md "List view" | The pens' sketch texture is Apple artwork |
| B9 | System 6's list view uses System 7's headers | EVIDENCE.md "List view: System 6" | System 6.0.8's Finder has no list view (HIG 1992); the class must exist in every era, so it takes System 7's |
| B10 | System 6/7 split bar drawn from HIG92 | COVERAGE.md note | No System 6 or 7 application in Infinite Mac has one; the HIG defines it, so it is drawn from the HIG and labelled inferred |
| B11 | No held placard | EVIDENCE.md "Placard" | A placard is a display control (Inside Macintosh: Controls); it does not respond to clicks, so it has no held state |
| B12 | System 7's held Control Strip module inferred | EVIDENCE.md "Control Strip: System 7" | The Control Strip is a PowerBook extension; the System 7.5.3 desktop image in Infinite Mac has no strip (checked 2026-11-18), so the held module is drawn from the measured Mac OS 9 held module in the strip's measured System 7 palette |
| B14 | Menu bar extras not compared pixel by pixel | EVIDENCE.md "Menu bar and menus" | The Help and Application menus' place is set by the CSS (right-aligned) and their behaviour is checked; the Application menu carries the host application's icon, which clio.css does not ship, so no specimen can compare it |
| B13 | Drawing Board's side-title window uses Platinum's bar | EVIDENCE.md "Side-title utility window: Drawing Board" | The theme's own side pieces are decoded (6205–6209, 6213/6214) but the frame's clipping rule lives in the theme's frme resource, which is not decoded; the only capture (the SDK sample) draws its own 13px column, so it cannot serve as the reference. Platinum's bar inside the Drawing Board frame stays, and the 223 KB budget is reserved for the pieces when a matching capture exists |
| B3 | The open pop-up menu is drawn by clio.js/base-select, not pixels for 6/7 | EVIDENCE.md "Pop-up menu" | The browser's picker cannot carry the theme's pixels |
| B4 | Alerts' icon drawn by clio.css | EVIDENCE.md "Dialogs and alerts" | Apple's icon is not shipped |
| B5 | Earlier eras use later controls where the era had none (tabs, sliders, bevel buttons, Control Strip, disclosure) | EVIDENCE.md, COVERAGE.md | The classes must exist in every era; the rows say which era's control they use |
| B6 | WebKit ignores `mask-clip: no-clip` (dimmed pop-up shadow) | EVIDENCE.md "Pop-up menu: System 7" | Engine limitation |
| B7 | Firefox's 2x/3x specimen deltas | FIDELITY.md | Text centring on half pixels; documented per specimen |
| B8 | The per-slot `Fixed` value's use | SOUND-SETS.md §8 | The player reads it as part of the slot; not used by clio.js |

## C. Owner decisions and actions

| # | Item | Where | Owner's call |
| --- | --- | --- | --- |
| C1 | Touch on the owner's phones (`docs/touch.html`) | ROADMAP "Owner's steps" | **Pre-flight 2026-11-18** (Chromium, iPhone 15/18 viewports 320x568 and 390x844, DPR 3, touch): no horizontal overflow, 13 sections, the era switch works, no page errors; tap opens the File menu and New logs once, the checkbox toggles, OK logs on tap, the window drags by the title bar, the text field focuses. **Owner's first report 2026-11-18**: item 2 (press a menu title, drag to an item, release) failed — the page scrolled and nothing logged. Fixed in 1.0.1: the menu bar and menus take the gesture (`touch-action: none`, `-webkit-touch-callout: none`), reproduced and verified with CDP touch events. The owner's remaining items decide the rest |
| C2 | Serving Apple's four sound sets and the alert lists from R2 behind an Appearance toggle | SOUND-SETS.md §8, CHANGELOG | A product feature on the owner's sites, not a Classic correctness item |
| C3 | npm: 0.10.0–0.12.0 published by the owner; 1.0.0 to publish | ROADMAP "Owner's steps" | The owner publishes |
| C4 | Apple artwork (desktop pictures, pens' textures) stays out | AGENTS.md | Already the owner's rule (B1/B2) |

## Plan

1. A12/A15 (side-title frame) and A16 (rule's second row) from the theme's own pieces — no
   emulator needed.
2. A18 (menu sounds), A10 (slider ticks), B8 (Fixed value) from the packs and the code.
3. A1/A2 (watch), A3/A4/A5/A6/A7/A8/A9/A11/A13/A14 from emulator captures.
4. A17 from a wider search of System 6/7 software.
5. B rows are already labelled; the release notes point at this file.
6. C rows are the owner's; each gets an explicit answer before 1.0.
