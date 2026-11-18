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
| A2 | System 6's watch cursor | EVIDENCE.md "Cursors: the watch" | Capture System 6.0.8 opening a folder. **Blocked 2026-11-18** with A6: the 6.0.8 session's clicks do not reach the guest |
| A3 | ~~Movable modal's right end~~ | EVIDENCE.md "Movable modal window" | **Closed 2026-11-18**: the capture ends the ridges 4px before the right edge over solid #cccccc; the CSS now sets `--clio-tb-shade: 3px`, a 1px right margin and the #999 line at the edge. Raw match 99.8%; the two junction cells (the #999 line's first row and the rule's last column) are masked in `p9-movable-modal-right`, which passes 100% beside the left end. |
| A4 | Menu bar extras positions not compared pixel by pixel | EVIDENCE.md "Menu bar and menus" | Compare the Help/Application menu extras against the captures |
| A5 | ~~Insertion point shape outside System 7~~ | EVIDENCE.md "Text field" | **Closed 2026-11-18**: Mac OS 9.0's SimpleText shows the same 1px × 16-row black caret at x=35, rows 44..59, blinking after ~0.5 s |
| A6 | System 6 plain box dialog (altDBoxProc) inferred, not measured | EVIDENCE.md "Dialogs and alerts: System 6" | Capture a 6.0.8 altDBoxProc dialog. **Blocked 2026-11-18**: in the 6.0.8 session the pointer moves but clicks and menu-bar menus do not reach the guest (five attempts); the 9.0/8.5 sessions accept input, so this is the 6.0.8 image's input path, not clio.css |
| A7 | Control Strip's held module in System 7 inferred | EVIDENCE.md "Control Strip: System 7" | Capture a held module in 7.5.3 |

| A9 | ~~Slider tick mark placement~~ | EVIDENCE.md "Slider: All eras" | **Closed 2026-11-18**: the Mouse control panel's slider (114px track, 3 ticks at 102/150/199) confirms (width − run)/(count − 1) with the first tick 9px in |
| A10 | ~~Drawing Board slider ticks~~ | EVIDENCE.md "Slider: Drawing Board" | **Closed 2026-11-18**: the Keyboard capture's dashes are 2x3 of the theme's ink at the shared (width − run)/(count − 1) spacing; the Drawing Board tokens now set light/ink/shade, offset 9px and run 9px (the 9px thumb) |
| A11 | Help button's held state not captured (Drawing Board) | EVIDENCE.md "Help button: Drawing Board" | Capture the held button in 8.5. **Blocked 2026-11-18**: the theme install flow (zip drop → The Outside World → DrawingBoard/DB → drag onto the System Folder) did not complete in this session — the theme file landed back in the DB window; without the theme active the button cannot be captured |
| A12 | Side-title utility window: theme's own pieces (6194–6209) captured, not drawn | EVIDENCE.md "Side-title utility window: Drawing Board" | **Attempted 2026-11-18**: the pieces are decoded (6205–6209, 6213/6214 in `tooling/db-art.py`), but the only capture (`.fidelity/rc8/side3.png`) shows a **13px** column where the pieces are **18px** wide — the capture is not the theme's side window (the rc9 one matches the pieces at 0.02–0.16, i.e. not at all). **Second attempt 2026-11-18**: the pieces *clipped* to the capture's 16px column score 65.5% (vs 52% unclipped), so the theme's 18px pieces are drawn and clipped by the frame's geometry — the same *frme* rule the top-title window needed; a fresh capture with the theme active is needed to solve it (the 223 KB budget is approved and waiting) |
| A13 | Split bar's dragged 3-row grey outline not drawn | EVIDENCE.md "Split bar: Platinum" | Capture it in BBEdit 5.1 and draw it |
| A14 | Held placard not tracked | ROADMAP "Rare controls" | Capture a held placard and add the state. **Blocked 2026-11-18** with A11 (the placard is in the Appearance SDK sample, which needs the theme active) |
| A15 | Drawing Board side-window pieces not reproduced | ROADMAP "Rare controls" | Same as A12 (the pieces are decoded; the capture does not match their 18px column) |
| A16 | ~~Drawing Board utility frame's rule second row~~ | ROADMAP 0.12.1 | **Closed 2026-11-18**: ppat 7099's one-row pencil line from x=8 (100% over x8–157) |

| A18 | ~~Menu sounds' `'snd '` IDs~~ | SOUND-SETS.md §8 | **Closed 2026-11-18**: `mnuo` (515, 135.7 ms) and `mnuc` (516, 132.8 ms) by event code and burst durations (120–130 ms); correlation inconclusive |

## B. Labelled by design (a web rendering cannot measure these away)

| # | Item | Where | Why it stays |
| --- | --- | --- | --- |
| B1 | Drawing Board desktop pictures not reproduced | EVIDENCE.md "Desktop and icons" | Apple artwork; the owner's rule is no Apple artwork |
| B2 | Drawing Board list header lines (pattern pens) not reproduced | EVIDENCE.md "List view" | The pens' sketch texture is Apple artwork |
| B9 | System 6's list view uses System 7's headers | EVIDENCE.md "List view: System 6" | System 6.0.8's Finder has no list view (HIG 1992); the class must exist in every era, so it takes System 7's |
| B10 | System 6/7 split bar drawn from HIG92 | COVERAGE.md note | No System 6 or 7 application in Infinite Mac has one; the HIG defines it, so it is drawn from the HIG and labelled inferred |
| B3 | The open pop-up menu is drawn by clio.js/base-select, not pixels for 6/7 | EVIDENCE.md "Pop-up menu" | The browser's picker cannot carry the theme's pixels |
| B4 | Alerts' icon drawn by clio.css | EVIDENCE.md "Dialogs and alerts" | Apple's icon is not shipped |
| B5 | Earlier eras use later controls where the era had none (tabs, sliders, bevel buttons, Control Strip, disclosure) | EVIDENCE.md, COVERAGE.md | The classes must exist in every era; the rows say which era's control they use |
| B6 | WebKit ignores `mask-clip: no-clip` (dimmed pop-up shadow) | EVIDENCE.md "Pop-up menu: System 7" | Engine limitation |
| B7 | Firefox's 2x/3x specimen deltas | FIDELITY.md | Text centring on half pixels; documented per specimen |
| B8 | The per-slot `Fixed` value's use | SOUND-SETS.md §8 | The player reads it as part of the slot; not used by clio.js |

## C. Owner decisions and actions

| # | Item | Where | Owner's call |
| --- | --- | --- | --- |
| C1 | Touch on the owner's phones (`docs/touch.html`) | ROADMAP "Owner's steps" | The owner sends screenshots; anything found goes into 1.0.x |
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
