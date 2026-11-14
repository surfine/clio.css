#!/bin/bash
# d.sh DIR cmd... : send commands to the driver, wait for them, print results
D=$1; shift
n0=$(grep -c "" $D/log 2>/dev/null)
k=0; for c in "$@"; do echo "$c" >> $D/cmd; k=$((k+1)); done
for i in $(seq 1 600); do n=$(grep -c "" $D/log); [ $((n - n0)) -ge $k ] && break; sleep 0.5; done
tail -n $k $D/log
