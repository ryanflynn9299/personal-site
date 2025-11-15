#!/bin/bash
# Helper script to control sync service (pause/resume)
# Usage: ./control.sh [pause|resume|status]

CONTAINER_NAME="ps-sync"
PAUSE_FLAG="/app/flags/.sync-paused"

case "${1:-status}" in
    pause)
        REASON="${2:-Maintenance}"
        echo "Pausing sync service..."
        docker exec "$CONTAINER_NAME" sh -c "echo '$REASON' > $PAUSE_FLAG"
        echo "✅ Sync service paused: $REASON"
        ;;
    resume)
        echo "Resuming sync service..."
        docker exec "$CONTAINER_NAME" rm -f "$PAUSE_FLAG"
        echo "✅ Sync service resumed"
        ;;
    status)
        if docker exec "$CONTAINER_NAME" test -f "$PAUSE_FLAG" 2>/dev/null; then
            REASON=$(docker exec "$CONTAINER_NAME" cat "$PAUSE_FLAG" 2>/dev/null || echo "Unknown")
            echo "Status: PAUSED"
            echo "Reason: $REASON"
        else
            echo "Status: ACTIVE"
        fi
        ;;
    logs)
        docker compose logs -f "$CONTAINER_NAME"
        ;;
    *)
        echo "Usage: $0 [pause|resume|status|logs]"
        echo ""
        echo "Commands:"
        echo "  pause [reason]  - Pause sync service (optional reason)"
        echo "  resume          - Resume sync service"
        echo "  status          - Check if sync is paused"
        echo "  logs            - View sync service logs"
        exit 1
        ;;
esac

