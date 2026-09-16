#!/bin/sh
# Restart contract for the Grok preview. Idempotent: start npm run dev only if :8080 is down.
set -eu
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
cd /workspace
npm run dev >/tmp/zarin-dev.log 2>&1 &
# Wait until the preview port answers or 20s, whichever first.
i=0
while [ "$i" -lt 40 ]; do
  if curl -sf -o /dev/null --max-time 1 http://127.0.0.1:8080/; then
    exit 0
  fi
  i=$((i + 1))
  sleep 0.5
done
exit 0
