#!/bin/bash
# Library catalogue maintenance script.
# Runs once per minute via /etc/cron.d/library-cleanup.
#
#   1. Wipes any file/dir inside the QA helper directory that isn't the
#      original metadata_processor.py. This includes the player's uploaded
#      payload (e.g. requests.py) and any __pycache__ entries Python may
#      have written next to it.
#   2. Hits the Flask health endpoint; if unhealthy, asks supervisord to
#      restart the worker. The Flask process itself is not the import-hijack
#      target (the helper is a fresh subprocess), so the restart is just
#      general resilience, not part of the security model.

set -u

LOG=/var/log/library-cleanup.log
DEBUG_DIR=/app/code/debug
HEALTH_URL=http://127.0.0.1:5000/health

# Files that legitimately belong in the helper directory. Anything else is
# transient (uploaded payload, __pycache__, leftover *.pyc) and gets removed.
ALLOWED=(metadata_processor.py)

ts() { date '+%Y-%m-%dT%H:%M:%S%z'; }

is_allowed() {
    local name=$1
    local a
    for a in "${ALLOWED[@]}"; do
        [ "$name" = "$a" ] && return 0
    done
    return 1
}

# --- 1. clean uploads ---
if [ -d "$DEBUG_DIR" ]; then
    shopt -s nullglob dotglob
    for entry in "$DEBUG_DIR"/*; do
        name=$(basename "$entry")
        if ! is_allowed "$name"; then
            if rm -rf -- "$entry" 2>/dev/null; then
                echo "$(ts) cleaned $entry" >> "$LOG"
            else
                echo "$(ts) failed to clean $entry" >> "$LOG"
            fi
        fi
    done
    shopt -u nullglob dotglob
fi

# --- 2. health check + restart ---
# If the worker is unresponsive, kill gunicorn. supervisord's autorestart=true
# brings it back. We rely on that rather than supervisorctl so we don't need
# the rpcinterface plugin loaded.
if ! curl -fsS -m 5 -o /dev/null "$HEALTH_URL"; then
    echo "$(ts) health check failed for $HEALTH_URL -- killing gunicorn for restart" >> "$LOG"
    pkill -f "gunicorn.*app:app" >> "$LOG" 2>&1 || true
fi

exit 0
