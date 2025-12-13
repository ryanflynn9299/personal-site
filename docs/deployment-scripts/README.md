# Deployment Scripts

This directory contains deployment scripts for different deployment strategies.

## Deployment Strategies

### Blue/Green Deployment (Recommended for Production)

Zero-downtime deployment using two identical environments. See `deploy.sh` and `rollback.sh`.

**Best for:** Production applications, high availability requirements, zero-downtime needs.

### Stop/Start Deployment (Simple Alternative)

Simple deployment that stops the current application, updates it, and starts it again. See `deploy-stop-start.sh`.

**Best for:** Low-traffic applications, personal sites, simple setups, acceptable brief downtime (5-30 seconds).

For detailed comparison of deployment strategies, see [Alternative Deployment Strategies](../CI_CD_STRATEGY.md#alternative-deployment-strategies) in the main strategy document.

## Scripts

### `deploy.sh`

Main deployment script that handles blue/green deployments (zero-downtime).

**Usage:**
```bash
./deploy.sh <image-tag> [environment]
```

**Examples:**
```bash
# Auto-determine target environment
./deploy.sh v20250127-abc1234

# Deploy to specific environment
./deploy.sh v20250127-abc1234 green
```

**What it does:**
1. Pulls the specified Docker image
2. Updates environment configuration
3. Stops existing containers
4. Starts new containers
5. Waits for health checks
6. Runs smoke tests
7. Switches Nginx traffic
8. Monitors for errors
9. Optionally cleans up old environment

### `deploy-stop-start.sh`

Simple stop/start deployment script (brief downtime).

**Usage:**
```bash
./deploy-stop-start.sh <image-tag>
```

**Examples:**
```bash
# Deploy latest image
./deploy-stop-start.sh v20250127-abc1234

# Deploy specific tag
./deploy-stop-start.sh latest
```

**What it does:**
1. Pulls the specified Docker image
2. Updates environment configuration
3. Stops current containers (brief downtime)
4. Starts new containers
5. Waits for health checks
6. Runs smoke tests
7. Monitors for errors

**Note:** This strategy has brief downtime (5-30 seconds) but is simpler to set up and maintain.

### `rollback.sh`

Quick rollback script to switch traffic back to the previous environment (blue/green only).

**Usage:**
```bash
./rollback.sh [environment]
```

**Examples:**
```bash
# Auto-rollback to other environment
./rollback.sh

# Rollback to specific environment
./rollback.sh blue
```

**Note:** For stop/start deployments, rollback requires redeploying the previous version using `deploy-stop-start.sh` with the previous image tag.

## Setup Instructions

1. **Copy scripts to home server:**
   ```bash
   scp deploy.sh rollback.sh user@home-server:/home/user/deployments/
   ```

2. **Make scripts executable:**
   ```bash
   chmod +x /home/user/deployments/deploy.sh
   chmod +x /home/user/deployments/rollback.sh
   ```

3. **Update configuration:**
   - Edit `deploy.sh` and update:
     - `REGISTRY` variable
     - `REPO_NAME` variable
     - Domain name in health check URLs

4. **Test scripts:**
   ```bash
   # Test deployment (dry-run)
   ./deploy.sh latest blue --dry-run
   ```

## Prerequisites

- Docker and Docker Compose installed
- Nginx installed and configured
- SSH access to home server
- Blue/green directory structure set up
- Environment files (`.env`) in each directory

## Directory Structure

### Blue/Green Deployment

```
/home/user/deployments/
├── blue/
│   ├── docker-compose.yml
│   ├── .env
│   └── data/
├── green/
│   ├── docker-compose.yml
│   ├── .env
│   └── data/
├── deploy.sh
└── rollback.sh
```

### Stop/Start Deployment

```
/home/user/deployments/
├── production/
│   ├── docker-compose.yml
│   ├── .env
│   └── data/
└── deploy-stop-start.sh
```

## Environment Variables

Each environment directory should have a `.env` file with:

```bash
IMAGE_TAG=latest
IMAGE=ghcr.io/username/repo:latest
NEXT_PUBLIC_DIRECTUS_URL=http://ps-directus:8055
DIRECTUS_URL_SERVER_SIDE=http://ps-directus:8055
# ... other environment variables
```

## Troubleshooting

### Script fails to pull image
- Check Docker login: `docker login ghcr.io`
- Verify image tag exists
- Check network connectivity

### Health checks fail
- Check container logs: `docker compose logs`
- Verify port is correct
- Check application is responding

### Nginx reload fails
- Test config: `nginx -t`
- Check permissions
- Verify Nginx is running

### Rollback doesn't work
- Verify old environment containers are running
- Check Nginx config syntax
- Review container logs

## Security Notes

- Scripts should be owned by deployment user
- Use SSH keys, not passwords
- Restrict script permissions: `chmod 750 deploy.sh`
- Don't commit secrets to version control
- Use environment variables for sensitive data

