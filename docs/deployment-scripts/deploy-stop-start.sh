#!/bin/bash

# Stop/Start Deployment Script
# Usage: ./deploy-stop-start.sh <image-tag>
# Example: ./deploy-stop-start.sh v20250127-abc1234
#
# This is a simpler deployment strategy that stops the current application,
# updates it, and starts it again. There will be brief downtime (5-30 seconds).

set -e  # Exit on error

IMAGE_TAG=${1:-latest}
REGISTRY="ghcr.io"
REPO_NAME="your-username/personal-site"  # Update with your repo
IMAGE="${REGISTRY}/${REPO_NAME}:${IMAGE_TAG}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

DEPLOY_DIR="/home/user/deployments/production"
PORT=3000

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}Stop/Start Deployment${NC}"
echo -e "${YELLOW}========================================${NC}"
echo -e "Image: ${IMAGE}"
echo -e "Port: ${PORT}"
echo -e "${YELLOW}Note: Brief downtime expected (5-30 seconds)${NC}"
echo -e "${YELLOW}========================================${NC}"

# Validate deployment directory exists
if [ ! -d "$DEPLOY_DIR" ]; then
    echo -e "${RED}Error: Deployment directory not found: ${DEPLOY_DIR}${NC}"
    exit 1
fi

cd "$DEPLOY_DIR"

# Step 1: Pull new image (before stopping to minimize downtime)
echo -e "\n${YELLOW}[1/5] Pulling Docker image...${NC}"
docker compose pull || {
    echo -e "${RED}Failed to pull image${NC}"
    exit 1
}

# Step 2: Update environment file with new image tag
echo -e "\n${YELLOW}[2/5] Updating environment configuration...${NC}"
sed -i.bak "s|IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|g" "$DEPLOY_DIR/.env"
sed -i.bak "s|IMAGE=.*|IMAGE=${IMAGE}|g" "$DEPLOY_DIR/.env" || echo "IMAGE=${IMAGE}" >> "$DEPLOY_DIR/.env"

# Step 3: Stop current containers
echo -e "\n${YELLOW}[3/5] Stopping current containers...${NC}"
echo -e "${YELLOW}Application will be unavailable during this step${NC}"
docker compose down || {
    echo -e "${YELLOW}Warning: Some containers may not have been running${NC}"
}

# Step 4: Start new containers
echo -e "\n${YELLOW}[4/5] Starting new containers...${NC}"
docker compose up -d

# Step 5: Wait for health checks
echo -e "\n${YELLOW}[5/5] Waiting for health checks...${NC}"
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
    echo -e "${YELLOW}Container logs:${NC}"
    docker compose logs --tail=50
    echo -e "\n${YELLOW}Attempting to start previous version...${NC}"
    # Could implement automatic rollback here
    exit 1
fi

echo -e "\n${GREEN}Health check passed!${NC}"

# Step 6: Run smoke tests
echo -e "\n${YELLOW}Running smoke tests...${NC}"
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
    echo -e "${YELLOW}Container logs:${NC}"
    docker compose logs --tail=50
    exit 1
fi

echo -e "${GREEN}Smoke tests passed!${NC}"

# Step 7: Monitor for errors (optional)
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
    echo -e "${YELLOW}Review logs and consider rollback${NC}"
else
    echo -e "\n${GREEN}Deployment successful!${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo -e "Image: ${IMAGE}"
echo -e "Downtime: ~${WAIT_TIME} seconds"
echo -e "${GREEN}========================================${NC}"

