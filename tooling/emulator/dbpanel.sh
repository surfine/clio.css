#!/bin/bash
S=$(dirname $0); D=$1
$S/d.sh $D "cmd q" "wait 3000" "click 18 9" "wait 1500" "move 60 120" "move 60 194" "wait 1500" "move 150 194" "move 240 195" "wait 1200" "move 260 $2" "wait 600" "click 260 $2" "wait 10000" "move 600 590" "wait 800" "shot $3" | grep ERR
