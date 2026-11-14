#!/bin/bash
S=$(dirname $0); D=$1
$S/d.sh $D "cmd w" "wait 2000" "move 18 10" "wait 300" "down" "wait 1200" "move 60 100" "move 60 150" "wait 1200" "move 150 150" "move 230 151" "wait 1000" "move 240 $2" "wait 800" "up" "wait 9000" "move 600 590" "wait 800" "shot $3" | grep ERR
