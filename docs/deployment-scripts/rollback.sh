#!/bin/bash

# Rollback Script
# Usage: ./rollback.sh [environment]
# Example: ./rollback.sh blue

set -e

TARGET_ENV=${1}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Determine which environment is active
get_active_env() {
    if grep -q "server localhost:3001" /etc/nginx/sites-available/personal-site; then
        echo "blue"
    elif grep -q "server localhost:3002" /etc/nginx/sites-available/personal-site; then
        echo "green"
    else
        echo "unknown"
    fi
}

# If no target specified, switch to the other environment
if [ -z "$TARGET_ENV" ]; then
    ACTIVE_ENV=$(get_active_env)
    if [ "$ACTIVE_ENV" == "blue" ]; then
        TARGET_ENV="green"
    else
        TARGET_ENV="blue"
    fi
fi

ACTIVE_ENV=$(get_active_env)
PORT=$([ "$TARGET_ENV" == "blue" ] && echo "3001" || echo "3002")

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Rollback Procedure${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Current Active: ${ACTIVE_ENV}"
echo -e "Rolling back to: ${TARGET_ENV}"
echo -e "${YELLOW}========================================${NC}"

# Check if target environment is running
DEPLOY_DIR="/home/user/deployments/${TARGET_ENV}"
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}Error: Target environment directory not found${NC}"
    exit 1
fi

cd "$DEPLOY_DIR"

# Check if containers are running
if ! docker compose ps | grep -q "Up"; then
    echo -e "${YELLOW}Starting ${TARGET_ENV} environment...${NC}"
    docker compose up -d
    
    # Wait for health check
    echo -e "${YELLOW}Waiting for health check...${NC}"
    sleep 10
    MAX_WAIT=60
    WAIT_TIME=0
    
    while [ $WAIT_TIME -lt $MAX_WAIT ]; do
        if curl -f -s "http://localhost:${PORT}/api/health" > /dev/null 2>&1; then
            break
        fi
        echo -n "."
        sleep 5
        WAIT_TIME=$((WAIT_TIME + 5))
    done
fi

# Switch Nginx config
NGINX_CONFIG="/etc/nginx/sites-available/personal-site"
NGINX_BACKUP="${NGINX_CONFIG}.backup.rollback.$(date +%Y%m%d_%H%M%S)"

cp "$NGINX_CONFIG" "$NGINX_BACKUP"

if [ "$TARGET_ENV" == "blue" ]; then
    sed -i 's|server localhost:3002|server localhost:3001|g' "$NGINX_CONFIG"
else
    sed -i 's|server localhost:3001|server localhost:3002|g' "$NGINX_CONFIG"
fi

# Test and reload Nginx
if nginx -t; then
    systemctl reload nginx || service nginx reload
    echo -e "${GREEN}Rollback complete! Traffic switched to ${TARGET_ENV}${NC}"
else
    echo -e "${RED}Nginx config test failed. Restoring backup...${NC}"
    cp "$NGINX_BACKUP" "$NGINX_CONFIG"
    exit 1
fi

