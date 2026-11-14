#!/bin/bash
# panel.sh DIR Y NAME : quit the front app, open Apple > Control Panels > item at Y, screenshot NAME
S=$(dirname $0); D=$1
$S/d.sh $D "cmd q" "wait 2500" "click 18 9" "wait 1000" "move 60 104" "wait 1200" "move 230 104" "move 260 104" "move 260 $2" "wait 500" "click 260 $2" "wait 9000" "move 600 590" "wait 800" "shot $3" | grep ERR
