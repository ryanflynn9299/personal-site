#!/bin/bash
# Entrypoint script - chooses between polling and webhook mode

MODE="${SYNC_MODE:-poll}"  # 'poll' or 'webhook'

case "$MODE" in
    poll)
        echo "Starting in POLLING mode..."
        exec /app/sync.sh
        ;;
    webhook)
        echo "Starting in WEBHOOK mode..."
        exec python3 /app/webhook-server.py
        ;;
    *)
        echo "ERROR: Unknown SYNC_MODE: $MODE"
        echo "Valid modes: 'poll' or 'webhook'"
        exit 1
        ;;
esac

