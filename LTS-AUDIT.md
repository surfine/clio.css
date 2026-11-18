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
| A2 | System 6's watch cursor | EVIDENCE.md "Cursors: the watch" | Capture System 6.0.8 opening a folder |
| A3 | ~~Movable modal's right end~~ | EVIDENCE.md "Movable modal window" | **Closed 2026-11-18**: the capture ends the ridges 4px before the right edge over solid #cccccc; the CSS now sets `--clio-tb-shade: 3px`, a 1px right margin and the #999 line at the edge. Raw match 99.8%; the two junction cells (the #999 line's first row and the rule's last column) are masked in `p9-movable-modal-right`, which passes 100% beside the left end. |
| A4 | Menu bar extras positions not compared pixel by pixel | EVIDENCE.md "Menu bar and menus" | Compare the Help/Application menu extras against the captures |
| A5 | Insertion point shape outside System 7 not measured | EVIDENCE.md "Text field" | Capture the caret in System 6/8/9 and compare |
| A6 | System 6 plain box dialog (altDBoxProc) inferred, not measured | EVIDENCE.md "Dialogs and alerts: System 6" | Capture a 6.0.8 altDBoxProc dialog |
| A7 | Control Strip's held module in System 7 inferred | EVIDENCE.md "Control Strip: System 7" | Capture a held module in 7.5.3 |
| A8 | System 6 list view headers inferred | EVIDENCE.md "List view: System 6" | Capture System 6's list view |
| A9 | ~~Slider tick mark placement~~ | EVIDENCE.md "Slider: All eras" | **Closed 2026-11-18**: the Mouse control panel's slider (114px track, 3 ticks at 102/150/199) confirms (width − run)/(count − 1) with the first tick 9px in |
| A10 | Drawing Board slider ticks not reproduced | EVIDENCE.md "Slider: Drawing Board" | Decode the theme's tick drawing and place them |
| A11 | Help button's held state not captured (Drawing Board) | EVIDENCE.md "Help button: Drawing Board" | Capture the held button in 8.5 |
| A12 | Side-title utility window: theme's own pieces (6194–6209) captured, not drawn | EVIDENCE.md "Side-title utility window: Drawing Board" | Compose the side frame from the pieces and ship `.window.utility.side` |
| A13 | Split bar's dragged 3-row grey outline not drawn | EVIDENCE.md "Split bar: Platinum" | Capture it in BBEdit 5.1 and draw it |
| A14 | Held placard not tracked | ROADMAP "Rare controls" | Capture a held placard and add the state |
| A15 | Drawing Board side-window pieces not reproduced | ROADMAP "Rare controls" | Same as A12 |
| A16 | ~~Drawing Board utility frame's rule second row~~ | ROADMAP 0.12.1 | **Closed 2026-11-18**: ppat 7099's one-row pencil line from x=8 (100% over x8–157) |
| A17 | System 6/7 split bar drawn from HIG92 (no application found) | COVERAGE.md note | Search more 6/7 software for a split bar, or leave labelled inferred |
| A18 | ~~Menu sounds' `'snd '` IDs~~ | SOUND-SETS.md §8 | **Closed 2026-11-18**: `mnuo` (515, 135.7 ms) and `mnuc` (516, 132.8 ms) by event code and burst durations (120–130 ms); correlation inconclusive |

## B. Labelled by design (a web rendering cannot measure these away)

| # | Item | Where | Why it stays |
| --- | --- | --- | --- |
| B1 | Drawing Board desktop pictures not reproduced | EVIDENCE.md "Desktop and icons" | Apple artwork; the owner's rule is no Apple artwork |
| B2 | Drawing Board list header lines (pattern pens) not reproduced | EVIDENCE.md "List view" | The pens' sketch texture is Apple artwork |
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
