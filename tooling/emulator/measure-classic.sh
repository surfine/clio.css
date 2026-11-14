#!/bin/bash
# The behaviour measurements of the Classic phase's close (2026-11-14), as driver
# commands. Start a driver per system, wait for its desktop, then run that section:
#   node tooling/emulator/drive.mjs "https://infinitemac.org/1991/System%206.0.8" .fidelity/m6 &
#   tooling/emulator/measure-classic.sh system6 .fidelity/m6
# Frames land in the run folder (git-ignored); copy the ones a specimen names into
# .fidelity/<era>/ (named in the comments). Coordinates are Infinite Mac's screens.
S=$(dirname $0); D=$2
case $1 in
system6)
  # Macintosh HD: window drag (system6/window-drag-before, window-drag)
  $S/d.sh $D "click 472 50" "wait 600" "cmd o" "wait 3000" "move 200 37" "wait 300" "shot drag-before" "down" "wait 400" "move 280 150" "wait 800" "shot drag-during" "up" "wait 2500"
  # System Folder list: the scroll box dragged 56px (system6/scroll-box-drag)
  $S/d.sh $D "click 145 205" "wait 800" "cmd o" "wait 4000" "move 421 124" "wait 300" "shot th-before" "down" "wait 400" "move 421 180" "wait 800" "shot th-during" "up" "wait 2500"
  # Menu blink: File > Get Info released (rec.json)
  $S/d.sh $D "move 53 9" "down" "wait 900" "move 70 123" "wait 700" "rec 36 116 140 15 1500 up" "wait 2500"
  # Cursors: the arrow on the menu bar, the I-beam in Find File's field
  $S/d.sh $D "move 300 3" "wait 600" "shot cur-arrow" "move 16 9" "down" "wait 900" "move 60 100" "move 60 155" "wait 500" "up" "wait 4000" "move 250 108" "wait 800" "shot cur-ibeam" ;;
system7)
  # Infinite HD: window drag (system7/window-drag-before, window-drag)
  $S/d.sh $D "click 300 64" "wait 800" "move 300 64" "wait 300" "shot wd-before" "down" "wait 400" "move 380 180" "wait 800" "shot wd-during" "up" "wait 2500"
  # Narrowed until it scrolls sideways (system7/hbar)
  $S/d.sh $D "click 300 395" "wait 500" "slowdrag 478 402 330 402" "wait 1500" "move 600 560" "wait 500" "shot hbar"
  # Menu blink: Edit > Show Clipboard released (rec.json)
  $S/d.sh $D "move 90 9" "wait 600" "down" "wait 1200" "move 100 100" "move 110 155" "wait 700" "rec 72 147 120 16 1500 up" "wait 2000" "cmd w"
  # Control Panels > WindowShade (scrolled to the end of the menu), clicks set to 2, the window double-clicked (system7/shaded)
  $S/d.sh $D "move 18 9" "wait 600" "down" "wait 1500" "move 60 100" "move 60 150" "wait 1500" "move 150 150" "move 230 151" "wait 1000" "move 230 400" "move 230 578" "wait 3000" "move 230 579" "wait 500" "up" "wait 8000" "shot windowshade"
  $S/d.sh $D "click 250 92" "wait 800" "cmd w" "wait 1500" "click 260 180" "wait 800" "dbl 260 180" "wait 2500" "move 600 560" "wait 600" "shot shaded" ;;
platinum)
  # Infinite HD: window drag (platinum9/window-drag-before, window-drag)
  $S/d.sh $D "click 300 61" "wait 800" "move 300 61" "wait 300" "shot wd-before" "down" "wait 400" "move 380 177" "wait 800" "shot wd-during" "up" "wait 2500"
  # Games opened: every changed frame (platinum9/zoom-film/)
  $S/d.sh $D "move 435 230" "wait 500" "film 0 0 800 600 4000 dbl 435 230" "wait 1500" "move 600 560" "wait 500"
  # Games' collapse box (platinum9/collapsed)
  $S/d.sh $D "click 414 78" "wait 1500" "move 600 560" "wait 600" "shot collapsed"
  # Infinite HD made small, its down arrow held at the corner (platinum9/arrow-held)
  $S/d.sh $D "click 300 177" "wait 800" "slowdrag 480 404 400 330" "wait 1500" "move 402 317" "wait 400" "down" "wait 1200" "shot arrow-held" "move 600 560" "wait 200" "up"
  # Mouse: Mouse Tracking dragged to each end (platinum9/slider-min, slider-max)
  $S/panel.sh $D 403 mouse-cp
  $S/d.sh $D "click 128 52" "wait 1000" "slowdrag 139 133 30 133" "move 600 560" "wait 500" "shot slider-min" "slowdrag 62 133 260 133" "move 600 560" "wait 500" "shot slider-max"
  # Appearance > Fonts, Large System Font held, the pointer off the menu (platinum9/fonts-popup-open)
  $S/d.sh $D "cmd q" "wait 2000"; $S/panel.sh $D 83 appearance
  $S/d.sh $D "click 372 110" "wait 2500" "move 420 152" "wait 400" "down" "wait 1200" "move 700 152" "wait 800" "shot fonts-popup-open" "move 700 400" "up" ;;
*) echo "usage: $0 system6|system7|platinum|drawingboard DIR"; exit 2 ;;
esac
