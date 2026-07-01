#!/bin/bash
# Code sync script - polls GitHub and pulls latest code

set -e

REPO_PATH="${REPO_PATH:-/app/repo}"
GITHUB_REPO="${GITHUB_REPO:-}"
BRANCH="${BRANCH:-main}"
POLL_INTERVAL="${POLL_INTERVAL:-300}"  # 5 minutes default
PAUSE_FLAG="/app/flags/.sync-paused"
LOG_FILE="/app/flags/sync.log"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Check if sync is paused
check_paused() {
    if [ -f "$PAUSE_FLAG" ]; then
        local reason=$(cat "$PAUSE_FLAG" 2>/dev/null || echo "Maintenance")
        log "Sync is PAUSED: $reason"
        return 0
    fi
    return 1
}

# Sync code from GitHub
sync_code() {
    cd "$REPO_PATH" || {
        log "ERROR: Cannot access repo path: $REPO_PATH"
        return 1
    }

    # Get latest commit from GitHub API
    if [ -z "$GITHUB_REPO" ]; then
        log "ERROR: GITHUB_REPO not set"
        return 1
    fi

    log "Checking for updates..."
    LATEST_COMMIT=$(curl -s "https://api.github.com/repos/$GITHUB_REPO/commits/$BRANCH" | jq -r '.sha // empty')
    
    if [ -z "$LATEST_COMMIT" ] || [ "$LATEST_COMMIT" = "null" ]; then
        log "WARNING: Could not fetch latest commit from GitHub"
        return 1
    fi

    LOCAL_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "")

    if [ -z "$LOCAL_COMMIT" ]; then
        log "WARNING: Cannot determine local commit. Repository may not be initialized."
        return 1
    fi

    if [ "$LATEST_COMMIT" != "$LOCAL_COMMIT" ]; then
        log "New commit detected: $LATEST_COMMIT (local: $LOCAL_COMMIT)"
        log "Pulling latest code..."
        
        # Pull latest code
        if git pull origin "$BRANCH"; then
            log "✅ Code synced successfully to commit: $(git rev-parse HEAD)"
            
            # Optional: Trigger rebuild notification
            touch /app/flags/.rebuild-needed 2>/dev/null || true
            
            return 0
        else
            log "ERROR: Failed to pull code"
            return 1
        fi
    else
        log "Code is up to date (commit: $LOCAL_COMMIT)"
        return 0
    fi
}

# Handle --once flag for one-time sync
if [ "${1:-}" = "--once" ]; then
    if ! check_paused; then
        sync_code
    fi
    exit 0
fi

# Main loop
main() {
    log "Starting code sync service..."
    log "Repository: $GITHUB_REPO"
    log "Branch: $BRANCH"
    log "Poll interval: ${POLL_INTERVAL}s"
    log "Repo path: $REPO_PATH"
    
    # Verify repo exists and is a git repository
    if [ ! -d "$REPO_PATH/.git" ]; then
        log "ERROR: $REPO_PATH is not a git repository"
        log "Please ensure the repository is cloned before starting sync service"
        exit 1
    fi
    
    # Initial sync
    if ! check_paused; then
        sync_code
    fi
    
    # Polling loop
    while true; do
        sleep "$POLL_INTERVAL"
        
        if ! check_paused; then
            sync_code
        fi
    done
}

# Run main function
main

