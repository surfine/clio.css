#!/bin/bash
# CJK measurements (2026-11-14). Infinite Mac has one localized system, KanjiTalk 7.5.3;
# Chinese and Korean come from the Language Kits on the Mac OS 9.0 install CD in
# Infinite Mac's CD-ROM library, installed into the Mac OS 9.0 machine's own disk.
#   node tooling/emulator/drive.ts "https://infinitemac.org/1999/Mac%20OS%209.0" .fidelity/cjk9 &
#   tooling/emulator/measure-cjk.sh lk-install .fidelity/cjk9
#   node tooling/emulator/drive.ts "https://infinitemac.org/1996/KanjiTalk%207.5.3" .fidelity/cjkt &
# Frames stay in the run folder (git-ignored). Coordinates are Infinite Mac's 800x600 screen
# (pclick: the 1200x900 page).
S=$(dirname $0); D=$2
case $1 in
lk-install)
  # CD-ROMs > "Mac OS 9" > Mac OS 9.0: the CD mounts and opens its window
  $S/d.sh $D "pclick 565 886" "wait 2000" "pclick 990 470" "type Mac OS 9" "wait 1500" "pclick 175 595" "wait 60000" "shot cd"
  # Software Installers > Language Kits > Install Language Kits
  $S/d.sh $D "click 380 33" "wait 3000" "click 56 280" "wait 400" "cmd o" "wait 5000" "click 348 240" "wait 400" "cmd o" "wait 5000" "click 85 135" "wait 400" "cmd o" "wait 25000" "shot lk-installer"
  # The installer took 25-40 s to open; if lk-installer shows no window, open it again
  # (click the Language Kits window, select Install Language Kits, cmd o) before ticking.
  # Custom Install list scrolled to the end; tick Chinese (simplified) and (traditional):
  # the three CJK kits (42,982K) do not fit the disk's 55,730K with the installer's margin
  $S/d.sh $D "click 619 340" "wait 300" "click 619 340" "wait 300" "click 619 340" "wait 300" "click 619 340" "wait 300" "click 619 340" "wait 300" "click 619 340" "wait 300" "click 619 340" "wait 800" "click 182 324" "wait 800" "click 182 340" "wait 1000" "shot lk-ticked" ;;
lk-go)
  $S/d.sh $D "click 551 420" "wait 2000" "shot lk-going" ;;
*) echo "usage: $0 lk-install|lk-go DIR"; exit 2 ;;
esac
