#!/bin/bash

# Blue/Green Deployment Script
# Usage: ./deploy.sh <image-tag> [environment]
# Example: ./deploy.sh v20250127-abc1234 green

set -e  # Exit on error

IMAGE_TAG=${1:-latest}
TARGET_ENV=${2:-green}
REGISTRY="ghcr.io"
REPO_NAME="your-username/personal-site"  # Update with your repo
IMAGE="${REGISTRY}/${REPO_NAME}:${IMAGE_TAG}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

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

# Determine target environment based on current active
determine_target() {
    local active=$(get_active_env)
    if [ "$active" == "blue" ]; then
        echo "green"
    else
        echo "blue"
    fi
}

# If no target specified, auto-determine
if [ -z "$2" ]; then
    TARGET_ENV=$(determine_target)
fi

# Validate target environment
if [ "$TARGET_ENV" != "blue" ] && [ "$TARGET_ENV" != "green" ]; then
    echo -e "${RED}Error: Target environment must be 'blue' or 'green'${NC}"
    exit 1
fi

ACTIVE_ENV=$(get_active_env)
DEPLOY_DIR="/home/user/deployments/${TARGET_ENV}"
PORT=$([ "$TARGET_ENV" == "blue" ] && echo "3001" || echo "3002")

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Blue/Green Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Active Environment: ${ACTIVE_ENV}"
echo -e "Target Environment: ${TARGET_ENV}"
echo -e "Image: ${IMAGE}"
echo -e "Port: ${PORT}"
echo -e "${YELLOW}========================================${NC}"

# Step 1: Pull new image
echo -e "\n${YELLOW}[1/6] Pulling Docker image...${NC}"
cd "$DEPLOY_DIR"
docker compose pull || {
    echo -e "${RED}Failed to pull image${NC}"
    exit 1
}

# Step 2: Update environment file with new image tag
echo -e "\n${YELLOW}[2/6] Updating environment configuration...${NC}"
sed -i.bak "s|IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|g" "$DEPLOY_DIR/.env"
sed -i.bak "s|IMAGE=.*|IMAGE=${IMAGE}|g" "$DEPLOY_DIR/.env" || echo "IMAGE=${IMAGE}" >> "$DEPLOY_DIR/.env"

# Step 3: Stop existing containers (if any)
echo -e "\n${YELLOW}[3/6] Stopping existing containers...${NC}"
docker compose down || true

# Step 4: Start new containers
echo -e "\n${YELLOW}[4/6] Starting new containers...${NC}"
docker compose up -d

# Step 5: Wait for health checks
echo -e "\n${YELLOW}[5/6] Waiting for health checks...${NC}"
MAX_WAIT=120
WAIT_TIME=0
HEALTHY=false

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if curl -f -s "http://localhost:${PORT}/api/health" > /dev/null 2>&1; then
        HEALTHY=true
        break
    fi
    echo -n "."
    sleep 5
    WAIT_TIME=$((WAIT_TIME + 5))
done

if [ "$HEALTHY" = false ]; then
    echo -e "\n${RED}Health check failed after ${MAX_WAIT}s${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    docker compose down
    exit 1
fi

echo -e "\n${GREEN}Health check passed!${NC}"

# Step 6: Run smoke tests
echo -e "\n${YELLOW}[6/6] Running smoke tests...${NC}"
SMOKE_TESTS_PASSED=true

# Test homepage
if ! curl -f -s "http://localhost:${PORT}" > /dev/null; then
    echo -e "${RED}Smoke test failed: Homepage not accessible${NC}"
    SMOKE_TESTS_PASSED=false
fi

# Test API endpoint (if exists)
if ! curl -f -s "http://localhost:${PORT}/api/health" > /dev/null; then
    echo -e "${RED}Smoke test failed: Health endpoint not accessible${NC}"
    SMOKE_TESTS_PASSED=false
fi

if [ "$SMOKE_TESTS_PASSED" = false ]; then
    echo -e "${RED}Smoke tests failed${NC}"
    echo -e "${YELLOW}Rolling back...${NC}"
    docker compose down
    exit 1
fi

echo -e "${GREEN}Smoke tests passed!${NC}"

# Step 7: Switch traffic (update Nginx config)
echo -e "\n${YELLOW}[7/7] Switching traffic to ${TARGET_ENV}...${NC}"

NGINX_CONFIG="/etc/nginx/sites-available/personal-site"
NGINX_BACKUP="${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"

# Backup current config
cp "$NGINX_CONFIG" "$NGINX_BACKUP"

# Update Nginx config
if [ "$TARGET_ENV" == "blue" ]; then
    sed -i 's|server localhost:3002|server localhost:3001|g' "$NGINX_CONFIG"
else
    sed -i 's|server localhost:3001|server localhost:3002|g' "$NGINX_CONFIG"
fi

# Test Nginx config
if ! nginx -t; then
    echo -e "${RED}Nginx config test failed. Restoring backup...${NC}"
    cp "$NGINX_BACKUP" "$NGINX_CONFIG"
    exit 1
fi

# Reload Nginx
systemctl reload nginx || service nginx reload

echo -e "${GREEN}Traffic switched to ${TARGET_ENV}!${NC}"

# Step 8: Monitor for errors (optional, run in background)
echo -e "\n${YELLOW}Monitoring deployment for 60 seconds...${NC}"
sleep 60

ERROR_COUNT=0
for i in {1..12}; do
    if ! curl -f -s "https://your-domain.com/api/health" > /dev/null 2>&1; then
        ERROR_COUNT=$((ERROR_COUNT + 1))
    fi
    sleep 5
    echo -n "."
done

if [ $ERROR_COUNT -gt 2 ]; then
    echo -e "\n${RED}High error rate detected (${ERROR_COUNT} errors)${NC}"
    echo -e "${YELLOW}Consider rolling back${NC}"
else
    echo -e "\n${GREEN}Deployment successful!${NC}"
fi

# Step 9: Cleanup old environment (optional, after successful deployment)
read -p "Clean up old ${ACTIVE_ENV} environment? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    OLD_DEPLOY_DIR="/home/user/deployments/${ACTIVE_ENV}"
    echo -e "${YELLOW}Cleaning up ${ACTIVE_ENV} environment...${NC}"
    cd "$OLD_DEPLOY_DIR"
    docker compose down -v
    echo -e "${GREEN}Cleanup complete${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Active Environment: ${TARGET_ENV}"
echo -e "Previous Environment: ${ACTIVE_ENV}"
echo -e "Image: ${IMAGE}"
echo -e "${GREEN}========================================${NC}"

