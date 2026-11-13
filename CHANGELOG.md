# Changelog

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
