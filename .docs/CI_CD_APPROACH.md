# CI/CD Pipeline Approach Guide

## Overview

This guide outlines the approach for setting up a CI/CD pipeline that automatically builds, tests, and deploys code to your home server when changes are pushed to the `main` branch. The pipeline will ensure code quality through automated checks before deployment.

## Architecture Overview

**Current Setup (Phase 1):**

- Push to `main` → Trigger CI/CD pipeline
- Build and test → Validate code quality
- Deploy to server → Server pulls latest code from GitHub
- Manual deployment → You manually redeploy when ready

**Future Setup (Phase 2):**

- `production` branch → Full automated deployment
- `main` branch → Staging/preview deployment
- Automated deployment → No manual intervention needed

## Platform Selection

**Recommended: GitHub Actions**

- Native integration with GitHub repositories
- Free for public repositories and generous limits for private repos
- Easy to configure with YAML files
- Built-in secrets management
- Excellent documentation and community support

**Alternative Options:**

- **GitLab CI/CD** - If using GitLab
- **Jenkins** - Self-hosted option (more complex setup)
- **CircleCI** - Cloud-based alternative

## Pipeline Structure

### Phase 1: Build & Test Pipeline (Current)

**Workflow Steps:**

1. **Checkout Code** - Pull latest code from repository
2. **Setup Node.js** - Install Node.js 20 LTS (matches Dockerfile)
3. **Install Dependencies** - Run `pnpm install` (or `npm install`)
4. **Lint Code** - Run `npm run lint` to catch code quality issues
5. **Type Check** - Run `tsc --noEmit` to verify TypeScript compilation
6. **Build Application** - Run `npm run build` to ensure production build succeeds
7. **Trigger Server Pull** - Notify server to pull latest code (webhook/SSH)

**Pipeline Triggers:**

- Push to `main` branch
- Pull requests to `main` (optional, for validation)

### Phase 2: Full Deployment (Future)

**Additional Steps:**

- Run automated tests (when test suite is added)
- Build Docker image (optional)
- Deploy to staging environment
- Run smoke tests
- Deploy to production (on `production` branch)

## Server Deployment Strategy

### Option 1: Server Pulls from GitHub (Recommended for Phase 1)

**How it works:**

1. CI pipeline completes successfully
2. Pipeline sends webhook/SSH command to your server
3. Server executes `git pull origin main` in project directory
4. Server rebuilds Docker containers (if using Docker)
5. Latest code is ready for manual deployment

**Implementation:**

```bash
# On your server, create a deployment script
#!/bin/bash
cd /path/to/personal-site
git pull origin main
docker compose build ps-frontend
# Manual restart: docker compose up -d ps-frontend
```

**Security:**

- Use GitHub webhook with secret token
- Or use SSH key stored in GitHub Secrets
- Restrict webhook endpoint to your server IP

### Option 2: CI Pushes to Server (Alternative)

**How it works:**

1. CI pipeline builds and validates code
2. Pipeline uses `rsync` or `scp` to copy files to server
3. Server rebuilds/restarts containers

**Pros:**

- More control over what gets deployed
- Can deploy only built artifacts

**Cons:**

- Requires server credentials in CI
- More complex setup

## Implementation Steps

### Step 1: Create GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches:
      - main
  pull_request:
    branches:
      - main

jobs:
  build-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "pnpm"

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Run linter
        run: pnpm run lint

      - name: Type check
        run: pnpm exec tsc --noEmit

      - name: Build application
        run: pnpm run build
        env:
          NEXT_PUBLIC_DIRECTUS_URL: ${{ secrets.NEXT_PUBLIC_DIRECTUS_URL }}

      - name: Notify server (webhook)
        if: github.ref == 'refs/heads/main' && github.event_name == 'push'
        run: |
          curl -X POST \
            -H "Authorization: Bearer ${{ secrets.DEPLOY_WEBHOOK_SECRET }}" \
            https://your-server.com/webhook/deploy
```

### Step 2: Set Up Server Webhook Endpoint

**Option A: Simple Webhook Script**

```bash
# /path/to/webhook/deploy.sh
#!/bin/bash
cd /path/to/personal-site
git pull origin main
# Log the deployment
echo "$(date): Deployed commit $(git rev-parse HEAD)" >> /var/log/deployments.log
```

**Option B: Using a Webhook Server (webhook, node-webhook, etc.)**

- More robust error handling
- Better logging
- Can handle multiple projects

### Step 3: Configure GitHub Secrets

In GitHub repository settings → Secrets and variables → Actions, add:

- `NEXT_PUBLIC_DIRECTUS_URL` - Your Directus URL (for build)
- `DEPLOY_WEBHOOK_SECRET` - Secret token for webhook authentication
- `SERVER_SSH_KEY` - (If using SSH deployment) Private SSH key

### Step 4: Set Up Server-Side Webhook

**Using a simple HTTP server:**

```python
# webhook_server.py (example)
from flask import Flask, request
import subprocess
import hmac
import hashlib

app = Flask(__name__)
WEBHOOK_SECRET = "your-secret-token"

@app.route('/webhook/deploy', methods=['POST'])
def deploy():
    # Verify webhook signature
    signature = request.headers.get('X-Hub-Signature-256', '')
    payload = request.get_data()

    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(f"sha256={expected}", signature):
        return "Unauthorized", 401

    # Execute deployment
    subprocess.run(['/path/to/deploy.sh'])
    return "Deployment triggered", 200
```

## Testing Strategy

### Current (Phase 1)

- **Linting**: Catches code style and common errors
- **Type Checking**: Ensures TypeScript compiles correctly
- **Build Validation**: Confirms production build succeeds

### Future (Phase 2)

- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Test API calls and data flow
- **E2E Tests**: Playwright or Cypress for critical user flows
- **Visual Regression**: Screenshot comparison tests

## Security Considerations

1. **Secrets Management**
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate secrets regularly

2. **Webhook Security**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Restrict webhook access by IP if possible

3. **Server Access**
   - Use SSH keys instead of passwords
   - Limit SSH key permissions
   - Use separate deployment user with minimal privileges

4. **Build Environment**
   - Don't expose build artifacts publicly
   - Clean up temporary files after build
   - Use Docker secrets for sensitive runtime variables

## Monitoring & Logging

**CI/CD Pipeline:**

- GitHub Actions provides built-in logs
- Set up email/Slack notifications for failures
- Track build times and success rates

**Server Deployment:**

- Log all deployments with timestamps
- Monitor container health after deployment
- Set up alerts for deployment failures

## Future Enhancements

### Production Branch Workflow

```yaml
# Separate workflow for production
on:
  push:
    branches:
      - production

jobs:
  deploy-production:
    # Full automated deployment
    # - Build Docker image
    # - Push to registry
    # - Deploy to server
    # - Run health checks
    # - Rollback on failure
```

### Staging Environment

- Deploy `main` branch to staging automatically
- Deploy `production` branch to production
- Preview deployments for pull requests

### Advanced Features

- Blue-green deployments (zero downtime)
- Canary releases (gradual rollout)
- Automated rollback on health check failures
- Performance testing in CI
- Security scanning (Snyk, Dependabot)

## Troubleshooting

**Build Fails in CI:**

- Check Node.js version matches local
- Verify all environment variables are set
- Ensure lockfile is committed (package-lock.json or pnpm-lock.yaml)

**Server Not Pulling Updates:**

- Verify webhook is receiving requests
- Check server logs for errors
- Ensure git credentials are configured on server
- Verify network connectivity

**Deployment Issues:**

- Check Docker container logs
- Verify environment variables on server
- Ensure database migrations are handled
- Check disk space on server

## Recommended Implementation: Docker Sync Service

For servers with restrictive firewalls (Tailscale + minimal open ports), a **Docker-based sync service** is recommended.

### Architecture

A separate Docker service (`ps-sync`) that:

- Runs **independently** of your main application stack
- Can sync code **even when Docker stack is offline**
- Supports **pause/resume** for maintenance
- Works with **restrictive firewalls** (polling mode, outbound only)
- Can be extended to **webhook mode** in the future

### Key Features

1. **Independent Operation**
   - No `depends_on` in docker-compose
   - Can run: `docker compose up -d ps-sync` separately
   - Syncs code even when `ps-frontend`, `ps-directus`, `ps-database` are down

2. **Pause/Resume Control**
   - Pause: `docker exec ps-sync sh -c 'echo "Maintenance" > /app/flags/.sync-paused'`
   - Resume: `docker exec ps-sync rm /app/flags/.sync-paused`
   - State persists across container restarts

3. **Two Modes**
   - **Polling Mode** (default): Polls GitHub API every 5 minutes, no inbound ports
   - **Webhook Mode** (future): Listens on port 8080 for real-time updates

### Setup

1. **Add to `.env`:**

   ```bash
   GITHUB_REPO=your-username/personal-site
   SYNC_MODE=poll
   POLL_INTERVAL=300
   ```

2. **Start service:**

   ```bash
   docker compose up -d ps-sync
   ```

3. **Control sync:**

   ```bash
   # Pause for maintenance
   docker exec ps-sync sh -c 'echo "Maintenance" > /app/flags/.sync-paused'

   # Resume
   docker exec ps-sync rm /app/flags/.sync-paused

   # Check status
   docker compose logs ps-sync
   ```

### Event Flow (Polling Mode)

```
Push to main → GitHub Actions (build/test) → GitHub API
                                              ↓
                                    ps-sync polls every 5 min
                                              ↓
                                    Detects new commit
                                              ↓
                                    git pull origin main
                                              ↓
                                    Code ready for manual deploy
```

### Benefits for Your Environment

- ✅ **No inbound ports**: Server only makes outbound HTTPS requests
- ✅ **Works with Tailscale**: No network configuration needed
- ✅ **Maintenance-friendly**: Easy pause/resume
- ✅ **Independent**: Syncs code even when app is down
- ✅ **Future-proof**: Can switch to webhook mode later

See `sync-service/README.md` for complete documentation.

## Quick Start Checklist

- [ ] Create `.github/workflows/deploy.yml`
- [ ] Add GitHub Secrets (NEXT_PUBLIC_DIRECTUS_URL, etc.)
- [ ] Set up sync service (see `sync-service/README.md`)
- [ ] Add `GITHUB_REPO` to `.env` file
- [ ] Start sync service: `docker compose up -d ps-sync`
- [ ] Test pipeline with a small change
- [ ] Verify sync service pulls code
- [ ] Test pause/resume functionality
- [ ] Test manual deployment after code pull
- [ ] Document server deployment process
- [ ] Set up monitoring/alerting
