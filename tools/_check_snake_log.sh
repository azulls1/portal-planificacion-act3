#!/usr/bin/env bash
LOGDIR=$(ls -d /tmp/delfi-snake-* 2>/dev/null | head -1)
echo "Found dir: $LOGDIR"
if [[ -n "$LOGDIR" && -d "$LOGDIR" ]]; then
  ls -la "$LOGDIR"
  echo "---HEAD-LOG---"
  head -40 "$LOGDIR/stdout.log" 2>/dev/null
  echo "---TAIL-LOG---"
  tail -80 "$LOGDIR/stdout.log" 2>/dev/null
  echo "---PRESERVE-LOG---"
  cp "$LOGDIR/stdout.log" /root/snake-p01-stdout.log
  echo "  saved to /root/snake-p01-stdout.log"
else
  echo "No delfi-snake-* dir found in /tmp"
fi
