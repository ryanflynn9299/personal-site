# CI/CD Pipeline Strategy Document

## Executive Summary

This document outlines a comprehensive CI/CD strategy for automated building, testing, and deployment of the personal-site Next.js application. The pipeline uses GitHub Actions for CI/CD orchestration and implements blue/green deployment to a home server for zero-downtime releases.

---

## Table of Contents

1. [Pipeline Architecture](#pipeline-architecture)
2. [Branch Strategy](#branch-strategy)
3. [Pipeline Stages](#pipeline-stages)
4. [Tooling Recommendations](#tooling-recommendations)
5. [Home Server Setup](#home-server-setup)
6. [Blue/Green Deployment Strategy](#bluegreen-deployment-strategy)
7. [Alternative Deployment Strategies](#alternative-deployment-strategies)
8. [Security Considerations](#security-considerations)
9. [Monitoring & Observability](#monitoring--observability)
10. [Rollback Procedures](#rollback-procedures)
11. [Implementation Roadmap](#implementation-roadmap)

---

## Pipeline Architecture

### Overview

```
┌─────────────────┐
│   Developer     │
│   Push/PR       │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│           GitHub Actions Workflows              │
│  ┌──────────────┐      ┌──────────────────┐    │
│  │ dev-main     │      │ master/main      │    │
│  │ Workflow     │      │ Workflow         │    │
│  └──────┬───────┘      └────────┬─────────┘    │
│         │                       │              │
│         ▼                       ▼              │
│  ┌──────────────┐      ┌──────────────────┐    │
│  │ Build & Test │      │ Build & Test     │    │
│  │ (Dev)        │      │ (Production)     │    │
│  └──────────────┘      └────────┬─────────┘    │
│                                  │              │
│                                  ▼              │
│                          ┌──────────────────┐   │
│                          │ Deploy to Home   │   │
│                          │ Server (B/G)     │   │
│                          └──────────────────┘   │
└─────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────┐
│              Home Server                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Blue    │  │  Green   │  │  Load    │    │
│  │  Env     │  │  Env     │  │ Balancer │    │
│  └──────────┘  └──────────┘  └──────────┘    │
└─────────────────────────────────────────────────┘
```

### Key Components

1. **GitHub Actions**: Primary CI/CD orchestration
2. **Docker Registry**: Container image storage (GitHub Container Registry or Docker Hub)
3. **Home Server**: Deployment target with blue/green environments
4. **Reverse Proxy**: Nginx/Traefik for traffic routing
5. **Container Orchestration**: Docker Compose or Docker Swarm

---

## Branch Strategy

### Branch Naming Convention

- **`dev-main`**: Development branch (triggers dev pipeline)
- **`main`** or **`master`**: Production branch (triggers production pipeline)
- **Feature branches**: `feature/*`, `fix/*`, `chore/*` (optional PR workflows)

### Promotion Flow

```
feature/fix-123 → dev-main → main/master
     │              │            │
     │              │            │
     ▼              ▼            ▼
   PR Tests    Dev Pipeline  Prod Pipeline
```

### Trigger Conditions

#### `dev-main` Branch
- **Trigger**: Push to `dev-main` or merge PR into `dev-main`
- **Actions**:
  - Build Docker image (tagged as `dev-<commit-sha>`)
  - Run unit tests (Vitest)
  - Run integration tests
  - Run E2E tests (Playwright)
  - Push image to registry (optional, for dev testing)
  - Optional: Deploy to dev environment

#### `main`/`master` Branch
- **Trigger**: Push to `main`/`master` or merge PR into `main`/`master`
- **Actions**:
  - Build production Docker image (tagged as `v<semver>` or `<commit-sha>`)
  - Run full test suite
  - Run security scans
  - Build production artifacts
  - Deploy to home server (blue/green)

---

## Pipeline Stages

### Stage 1: Code Quality & Validation

**Tools**: ESLint, Prettier, TypeScript Compiler

**Actions**:
- Lint code (`npm run lint`)
- Format check (`npm run format:check`)
- Type checking (`npm run type-check`)
- ESLint validation (`npm run eslint`)

**Failure Criteria**: Any validation failure blocks pipeline

**Considerations**:
- Cache node_modules for faster runs
- Run in parallel where possible
- Consider using `lint-staged` for pre-commit hooks

### Stage 2: Unit & Integration Testing

**Tools**: Vitest, MSW (Mock Service Worker)

**Actions**:
- Run unit tests (`npm run test`)
- Run with coverage (`npm run test:coverage`)
- Generate coverage reports
- Upload coverage to Codecov or similar (optional)

**Failure Criteria**: Test failures or coverage below threshold

**Considerations**:
- Set minimum coverage threshold (e.g., 80%)
- Use test matrix for multiple Node.js versions (if needed)
- Cache test results

### Stage 3: E2E Testing

**Tools**: Playwright

**Actions**:
- Run E2E tests (`npm run test:e2e`)
- Run against built application (if possible)
- Generate test reports and screenshots

**Failure Criteria**: E2E test failures

**Considerations**:
- Use Playwright's built-in retry mechanism
- Consider running E2E tests in parallel
- Store test artifacts (screenshots, videos) for debugging

### Stage 4: Security Scanning

**Tools**: 
- **Snyk** or **GitHub Dependabot** (dependency scanning)
- **Trivy** or **Grype** (container image scanning)
- **CodeQL** (code security analysis)

**Actions**:
- Scan dependencies for vulnerabilities
- Scan Docker image for CVEs
- Check for secrets in code
- Validate Dockerfile security best practices

**Failure Criteria**: Critical or high-severity vulnerabilities

**Considerations**:
- Allow exceptions for false positives
- Set up automated dependency updates
- Review and update security policies regularly

### Stage 5: Build Stage

#### Development Build (`dev-main`)
- Build Docker image with `dev-<commit-sha>` tag
- Use `--target builder` for faster dev builds (optional)
- Push to registry (optional, for testing)

#### Production Build (`main`/`master`)
- Build optimized Docker image
- Tag with semantic version or commit SHA
- Tag as `latest` (optional, use with caution)
- Push to container registry
- Generate build artifacts (if needed)

**Considerations**:
- Use Docker layer caching
- Build multi-platform images (if needed)
- Sign images for security (optional)
- Use BuildKit for faster builds

### Stage 6: Pre-Deployment Validation (Production Only)

**Actions**:
- Smoke tests against built image
- Health check validation
- Environment variable validation
- Database migration dry-run (if applicable)

### Stage 7: Deployment (Production Only)

**Actions**:
- Deploy to inactive environment (blue or green)
- Run health checks
- Run smoke tests
- Switch traffic (blue/green swap)
- Monitor for errors
- Clean up old environment

---

## Tooling Recommendations

### CI/CD Orchestration

#### Primary: GitHub Actions
**Pros**:
- Native GitHub integration
- Free for public repos, generous free tier for private
- Extensive marketplace of actions
- YAML-based configuration (version controlled)
- Built-in secrets management

**Cons**:
- Limited customization compared to self-hosted
- Runner limitations on free tier

**Recommended Actions**:
- `actions/checkout@v4`
- `actions/setup-node@v4`
- `docker/build-push-action@v5`
- `docker/login-action@v3`
- `playwright-community/playwright-github-action@v1`

#### Alternative: Jenkins (Home Server)
**Use Case**: If you need more control or complex workflows

**Pros**:
- Highly customizable
- Extensive plugin ecosystem
- Can run on home server
- Free and open source

**Cons**:
- Requires maintenance
- More complex setup
- Resource intensive

**Recommendation**: Start with GitHub Actions, consider Jenkins only if you need features GitHub Actions doesn't provide.

### Container Registry

#### Option 1: GitHub Container Registry (ghcr.io)
**Pros**:
- Integrated with GitHub
- Free for public repos
- No additional account needed
- Good for private repos

**Recommendation**: Best choice for GitHub-based workflows

#### Option 2: Docker Hub
**Pros**:
- Widely supported
- Free tier available
- Good documentation

**Cons**:
- Rate limits on free tier
- Separate account management

#### Option 3: Self-Hosted Registry
**Use Case**: If you want complete control and privacy

**Tools**: Harbor, Portus, or Docker Registry

### Container Orchestration

#### Option 1: Docker Compose (Recommended for Start)
**Pros**:
- Simple setup
- Already in use
- Good for single-server deployments
- Easy to manage blue/green

**Cons**:
- Limited scalability
- No built-in load balancing

#### Option 2: Docker Swarm
**Pros**:
- Built into Docker
- Native load balancing
- Service discovery
- Rolling updates

**Cons**:
- More complex than Compose
- Less popular than Kubernetes

#### Option 3: Kubernetes (Overkill for Single Server)
**Use Case**: Only if you plan to scale to multiple servers

### Reverse Proxy / Load Balancer

#### Option 1: Nginx (Recommended)
**Pros**:
- Lightweight
- Excellent documentation
- Great for blue/green switching
- SSL/TLS termination
- Rate limiting

**Configuration**: Use upstream blocks to switch between blue/green

#### Option 2: Traefik
**Pros**:
- Automatic SSL with Let's Encrypt
- Service discovery
- Modern UI
- Good Docker integration

**Cons**:
- More resource intensive than Nginx

#### Option 3: Caddy
**Pros**:
- Automatic HTTPS
- Simple configuration
- Modern features

### Monitoring & Observability

#### Application Monitoring
- **Prometheus + Grafana**: Metrics and dashboards
- **Loki**: Log aggregation
- **Uptime Kuma**: Uptime monitoring
- **Healthcheck.io**: External health checks

#### Logging
- **Docker logs**: Built-in, use with log rotation
- **Loki + Promtail**: Centralized logging
- **ELK Stack**: If you need advanced log analysis

### Notification

- **GitHub Notifications**: Built-in
- **Discord/Slack Webhooks**: For team notifications
- **Email**: For critical failures
- **PagerDuty**: For production alerts (if needed)

---

## Home Server Setup

### Infrastructure Requirements

#### Minimum Specifications
- **CPU**: 2+ cores
- **RAM**: 4GB+ (8GB recommended)
- **Storage**: 50GB+ SSD
- **Network**: Stable internet connection
- **OS**: Linux (Ubuntu Server 22.04 LTS recommended)

#### Software Stack
- Docker & Docker Compose
- Git
- SSH server
- Firewall (UFW or similar)
- Nginx or Traefik
- Optional: Jenkins (if using)

### Network Architecture

```
Internet
   │
   ▼
[Router/Firewall]
   │
   ▼
[Home Server]
   │
   ├── [Nginx/Traefik] (Port 80/443)
   │       │
   │       ├── Blue Environment (Port 3001)
   │       └── Green Environment (Port 3002)
   │
   ├── [Docker Compose - Blue]
   └── [Docker Compose - Green]
```

### Directory Structure

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
└── nginx/
    └── nginx.conf
```

### Security Considerations

1. **SSH Access**:
   - Use SSH keys, disable password auth
   - Change default SSH port (optional)
   - Use fail2ban
   - Limit SSH access by IP (if possible)

2. **Firewall**:
   - Only expose necessary ports (80, 443, 22)
   - Block all other ports
   - Use UFW or iptables

3. **Docker Security**:
   - Run containers as non-root users (already in Dockerfile)
   - Use Docker secrets for sensitive data
   - Regularly update Docker images
   - Scan images before deployment

4. **Network Security**:
   - Use VPN for server access (optional but recommended)
   - Consider Cloudflare Tunnel for secure access
   - Use SSL/TLS for all services

---

## Blue/Green Deployment Strategy

### Concept

Blue/Green deployment maintains two identical production environments:
- **Blue**: Currently serving traffic
- **Green**: Standby, receives new deployments

On deployment:
1. Deploy new version to inactive environment (Green)
2. Run health checks and smoke tests
3. Switch traffic from Blue to Green
4. Monitor Green environment
5. Keep Blue as rollback option
6. Clean up old Blue after successful deployment

### Implementation

#### Step 1: Initial Setup

1. Create two identical directory structures:
   ```bash
   /home/user/deployments/blue/
   /home/user/deployments/green/
   ```

2. Each contains:
   - `docker-compose.yml`
   - `.env` file
   - Data volumes (shared or separate)

#### Step 2: Nginx Configuration

```nginx
# /etc/nginx/sites-available/personal-site

upstream app_backend {
    # Switch this between blue and green
    server localhost:3001;  # Blue
    # server localhost:3002;  # Green (uncomment to switch)
}

server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://app_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Step 3: Deployment Script

Create a deployment script that:
1. Determines active environment (blue or green)
2. Deploys to inactive environment
3. Waits for health checks
4. Updates Nginx config
5. Reloads Nginx
6. Monitors for errors
7. Handles rollback if needed

#### Step 4: GitHub Actions Deployment Job

```yaml
deploy:
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to Home Server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.HOME_SERVER_HOST }}
        username: ${{ secrets.HOME_SERVER_USER }}
        key: ${{ secrets.HOME_SERVER_SSH_KEY }}
        script: |
          cd /home/user/deployments
          ./deploy.sh green  # or blue, depending on current active
```

### Traffic Switching Strategies

#### Strategy 1: Instant Switch (Recommended)
- Update Nginx config
- Reload Nginx (zero downtime)
- Fastest, simplest

#### Strategy 2: Gradual Rollout
- Use Nginx `weight` parameter
- Gradually shift traffic (10% → 50% → 100%)
- More complex but safer

#### Strategy 3: Canary Deployment
- Deploy to small subset of users first
- Monitor metrics
- Gradually increase traffic

### Health Checks

Implement health checks before switching:
- HTTP endpoint: `GET /api/health`
- Database connectivity
- External service connectivity (Directus)
- Response time checks

### Rollback Procedure

1. Revert Nginx config to previous environment
2. Reload Nginx
3. Investigate issues in failed environment
4. Fix and redeploy

---

## Alternative Deployment Strategies

While blue/green deployment is recommended for zero-downtime deployments, there are several alternative strategies that may be more suitable depending on your requirements, infrastructure constraints, or simplicity needs.

### Strategy Comparison

| Strategy | Downtime | Complexity | Resource Usage | Rollback Speed | Best For |
|----------|----------|------------|----------------|----------------|----------|
| **Blue/Green** | Zero | Medium | 2x (temporary) | Instant | Production, high availability |
| **Stop/Start** | Yes (seconds) | Low | 1x | Fast | Low traffic, simple setups |
| **Rolling** | Minimal | Medium | 1.5x | Medium | Container orchestration |
| **Canary** | Zero | High | 1.1-1.5x | Instant | Large deployments, risk reduction |

### 1. Stop/Start Deployment (Simple Replacement)

#### Overview

Stop/Start deployment is the simplest deployment strategy: stop the current application, update it, and start it again. This approach has brief downtime but requires minimal infrastructure.

#### When to Use

- **Low traffic applications**: Personal sites, internal tools, development environments
- **Simple infrastructure**: Single server, limited resources
- **Acceptable downtime**: Brief outages (5-30 seconds) are acceptable
- **Cost constraints**: Cannot afford to run duplicate environments
- **Quick setup**: Need to deploy immediately with minimal configuration

#### Implementation Changes

**Infrastructure Requirements:**
- Single deployment directory (no blue/green needed)
- Single Docker Compose setup
- No Nginx upstream switching required

**Directory Structure:**
```
/home/user/deployments/
├── production/
│   ├── docker-compose.yml
│   ├── .env
│   └── data/
└── nginx/
    └── nginx.conf
```

**Nginx Configuration:**
```nginx
# Simplified - no upstream switching needed
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;  # Single port
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Deployment Script Changes:**

The deployment script becomes much simpler:

```bash
#!/bin/bash
# deploy-stop-start.sh

set -e

IMAGE_TAG=${1:-latest}
REGISTRY="ghcr.io"
REPO_NAME="your-username/personal-site"
IMAGE="${REGISTRY}/${REPO_NAME}:${IMAGE_TAG}"
DEPLOY_DIR="/home/user/deployments/production"

echo "Deploying ${IMAGE}..."

cd "$DEPLOY_DIR"

# Step 1: Pull new image
echo "Pulling Docker image..."
docker compose pull

# Step 2: Update environment file
sed -i.bak "s|IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|g" "$DEPLOY_DIR/.env"
sed -i.bak "s|IMAGE=.*|IMAGE=${IMAGE}|g" "$DEPLOY_DIR/.env"

# Step 3: Stop current containers
echo "Stopping current containers..."
docker compose down

# Step 4: Start new containers
echo "Starting new containers..."
docker compose up -d

# Step 5: Wait for health check
echo "Waiting for health check..."
MAX_WAIT=120
WAIT_TIME=0

while [ $WAIT_TIME -lt $MAX_WAIT ]; do
    if curl -f -s "http://localhost:3000/api/health" > /dev/null 2>&1; then
        echo "Health check passed!"
        exit 0
    fi
    echo -n "."
    sleep 5
    WAIT_TIME=$((WAIT_TIME + 5))
done

echo "Health check failed!"
docker compose logs
exit 1
```

**GitHub Actions Changes:**

The deployment job remains similar but calls the simpler script:

```yaml
deploy:
  name: Deploy to Production
  needs: build
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to home server
      uses: appleboy/ssh-action@v1.0.3
      with:
        host: ${{ secrets.HOME_SERVER_HOST }}
        username: ${{ secrets.HOME_SERVER_USER }}
        key: ${{ secrets.HOME_SERVER_SSH_KEY }}
        script: |
          cd /home/user/deployments
          ./deploy-stop-start.sh ${{ needs.build.outputs.image-tag }}
```

#### Considerations

**Pros:**
- ✅ Simple to implement and maintain
- ✅ Lower resource usage (no duplicate environments)
- ✅ Easier to understand and debug
- ✅ Faster initial setup
- ✅ Lower infrastructure costs

**Cons:**
- ❌ Brief downtime during deployment (5-30 seconds typically)
- ❌ No instant rollback (must redeploy previous version)
- ❌ Users may see errors during deployment
- ❌ No ability to test new version before switching traffic
- ❌ Riskier for high-traffic applications

**Downtime Mitigation:**
- Deploy during low-traffic periods
- Use maintenance mode page (optional)
- Optimize container startup time
- Pre-pull images before stopping
- Use health checks to minimize downtime window

**Rollback Strategy:**
1. Keep previous image tag available
2. Redeploy previous version using same script
3. Consider maintaining last 2-3 versions in registry

### 2. Rolling Deployment

#### Overview

Rolling deployment updates containers one at a time, maintaining service availability throughout the process. This works best with multiple container instances.

#### When to Use

- **Multiple instances**: Running 2+ containers of the same service
- **Container orchestration**: Docker Swarm, Kubernetes
- **Gradual updates**: Want to update incrementally
- **Resource efficiency**: Can't run full duplicate environment

#### Implementation Changes

**Docker Compose with Multiple Instances:**
```yaml
services:
  ps-frontend:
    image: ${IMAGE}
    deploy:
      replicas: 3  # Run 3 instances
      update_config:
        parallelism: 1  # Update one at a time
        delay: 10s     # Wait 10s between updates
        failure_action: rollback
    ports:
      - "3000-3002:3000"  # Multiple ports for load balancing
```

**Nginx Configuration:**
```nginx
upstream app_backend {
    least_conn;  # Load balancing method
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

**Deployment Process:**
1. Start new container with new version
2. Wait for health check
3. Add to load balancer
4. Remove old container
5. Repeat for each instance

#### Considerations

**Pros:**
- ✅ Zero downtime
- ✅ Gradual rollout reduces risk
- ✅ Can monitor each instance
- ✅ Automatic rollback on failure (with orchestration)

**Cons:**
- ❌ More complex than stop/start
- ❌ Requires multiple instances
- ❌ Temporary version mixing
- ❌ More complex debugging

### 3. Canary Deployment

#### Overview

Canary deployment routes a small percentage of traffic to the new version first, gradually increasing if metrics look good.

#### When to Use

- **Large user base**: Want to minimize impact of bad releases
- **Risk mitigation**: Critical applications requiring careful rollout
- **A/B testing**: Testing new features with real users
- **Metrics-driven**: Have comprehensive monitoring

#### Implementation Changes

**Nginx Configuration with Weighted Routing:**
```nginx
upstream app_backend {
    # 90% to stable, 10% to canary
    server localhost:3000 weight=9;
    server localhost:3001 weight=1;
}
```

**Gradual Rollout Script:**
```bash
# Phase 1: 10% traffic
update_nginx_weights 9 1

# Monitor for 5 minutes
sleep 300

# Phase 2: 50% traffic
update_nginx_weights 5 5

# Monitor for 5 minutes
sleep 300

# Phase 3: 100% traffic
update_nginx_weights 0 10
```

#### Considerations

**Pros:**
- ✅ Lowest risk deployment
- ✅ Real-world testing before full rollout
- ✅ Easy rollback (just adjust weights)
- ✅ Can test with actual users

**Cons:**
- ❌ Most complex to implement
- ❌ Requires sophisticated monitoring
- ❌ Longer deployment process
- ❌ Need to handle version differences

### 4. Comparison: Choosing the Right Strategy

#### Decision Matrix

**Choose Stop/Start if:**
- ✅ Downtime of 5-30 seconds is acceptable
- ✅ Low traffic (< 1000 requests/day)
- ✅ Limited server resources
- ✅ Need quick, simple setup
- ✅ Personal or internal application

**Choose Blue/Green if:**
- ✅ Zero downtime is required
- ✅ Medium to high traffic
- ✅ Can afford 2x resources temporarily
- ✅ Want instant rollback capability
- ✅ Production application with users

**Choose Rolling if:**
- ✅ Running multiple container instances
- ✅ Using container orchestration
- ✅ Want gradual updates
- ✅ Have load balancing infrastructure

**Choose Canary if:**
- ✅ High-traffic production application
- ✅ Need to minimize risk
- ✅ Have comprehensive monitoring
- ✅ Want to test with real users
- ✅ Complex application with many dependencies

### 5. Migration Between Strategies

#### From Stop/Start to Blue/Green

1. Create second directory structure (`green/`)
2. Update deployment script to support blue/green
3. Modify Nginx config to use upstream
4. Test deployment to inactive environment
5. Switch traffic gradually

#### From Blue/Green to Stop/Start

1. Choose one environment to keep (e.g., `blue`)
2. Update Nginx to point directly to single port
3. Simplify deployment script
4. Remove unused environment directory
5. Update documentation

### 6. Hybrid Approaches

You can combine strategies:

**Blue/Green with Canary:**
- Deploy to green environment
- Route 10% traffic to green
- Monitor and gradually increase
- Full switch when confident

**Stop/Start with Maintenance Window:**
- Show maintenance page during deployment
- Deploy during scheduled downtime
- Better user experience than unexpected downtime

### 7. Cost Considerations

| Strategy | Monthly Cost Impact | Notes |
|----------|---------------------|-------|
| **Stop/Start** | $0 | No additional resources |
| **Blue/Green** | +50-100% (temporary) | Double resources during deployment |
| **Rolling** | +50% (permanent) | Need multiple instances always |
| **Canary** | +10-50% (temporary) | Additional instance during rollout |

**For Home Server:**
- Stop/Start: No additional cost
- Blue/Green: Temporary 2x CPU/RAM during deployment (minutes)
- Rolling: Permanent 1.5-2x resources
- Canary: Temporary 1.1-1.5x resources

### 8. Implementation Checklist by Strategy

#### Stop/Start Deployment
- [ ] Single deployment directory
- [ ] Simplified Nginx config (no upstream)
- [ ] Stop/start deployment script
- [ ] Health check endpoint
- [ ] Previous version rollback procedure
- [ ] Deployment timing strategy (low traffic periods)

#### Blue/Green Deployment
- [ ] Two deployment directories (blue/green)
- [ ] Nginx upstream configuration
- [ ] Blue/green deployment script
- [ ] Traffic switching mechanism
- [ ] Health checks before switch
- [ ] Rollback script

#### Rolling Deployment
- [ ] Multiple container instances
- [ ] Load balancer configuration
- [ ] Rolling update script
- [ ] Health checks per instance
- [ ] Container orchestration (optional)
- [ ] Instance monitoring

#### Canary Deployment
- [ ] Two environments (stable/canary)
- [ ] Weighted load balancing
- [ ] Metrics collection
- [ ] Gradual rollout script
- [ ] Monitoring dashboards
- [ ] Automatic rollback triggers

---

## Security Considerations

### Secrets Management

#### GitHub Secrets
Store sensitive data in GitHub Secrets:
- `HOME_SERVER_HOST`
- `HOME_SERVER_USER`
- `HOME_SERVER_SSH_KEY`
- `DOCKER_REGISTRY_TOKEN`
- `DATABASE_PASSWORD`
- `DIRECTUS_SECRET`

#### Home Server Secrets
- Use Docker secrets or `.env` files (not in git)
- Encrypt secrets at rest
- Rotate secrets regularly
- Use different secrets for blue/green

### Container Security

1. **Image Scanning**: Scan all images before deployment
2. **Non-root Users**: Already implemented in Dockerfile
3. **Minimal Base Images**: Use Alpine Linux
4. **Regular Updates**: Keep base images updated
5. **No Secrets in Images**: Use environment variables

### Network Security

1. **HTTPS Only**: Use Let's Encrypt for SSL certificates
2. **Rate Limiting**: Implement in Nginx
3. **DDoS Protection**: Use Cloudflare (optional)
4. **WAF**: Web Application Firewall (optional)

### Access Control

1. **GitHub Branch Protection**: Require PR reviews
2. **Deployment Permissions**: Limit who can deploy
3. **Audit Logging**: Log all deployments
4. **2FA**: Enable on GitHub and server

---

## Monitoring & Observability

### Metrics to Monitor

#### Application Metrics
- Response time (p50, p95, p99)
- Error rate
- Request rate
- Database connection pool
- Memory usage
- CPU usage

#### Infrastructure Metrics
- Server CPU/Memory/Disk
- Docker container health
- Network traffic
- SSL certificate expiration

#### Business Metrics
- Page views
- User sessions
- API usage
- Error types

### Alerting

Set up alerts for:
- Deployment failures
- High error rates (>1%)
- Slow response times (>2s p95)
- Server resource exhaustion
- SSL certificate expiration (<30 days)
- Health check failures

### Logging Strategy

1. **Application Logs**: Use structured logging (Pino)
2. **Access Logs**: Nginx access logs
3. **Error Logs**: Centralized error logging
4. **Deployment Logs**: Track all deployments
5. **Retention**: Keep logs for 30-90 days

### Tools

- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Loki**: Log aggregation
- **Uptime Kuma**: Uptime monitoring
- **Sentry**: Error tracking (optional)

---

## Rollback Procedures

### Automatic Rollback

Implement automatic rollback if:
- Health checks fail after deployment
- Error rate exceeds threshold
- Response time degrades significantly

### Manual Rollback

1. **Quick Rollback** (Nginx switch):
   ```bash
   # Switch Nginx config back
   sudo nginx -s reload
   ```

2. **Full Rollback** (Redeploy previous version):
   - Tag previous working version
   - Trigger deployment workflow with previous tag
   - Deploy to inactive environment
   - Switch traffic

3. **Database Rollback** (if needed):
   - Restore from backup
   - Run migration rollback scripts

### Rollback Testing

- Test rollback procedure regularly
- Document rollback steps
- Keep previous versions available
- Maintain deployment history

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1-2)

- [ ] Set up GitHub Actions workflows for `dev-main`
- [ ] Configure linting and type checking
- [ ] Set up unit and integration tests
- [ ] Configure test coverage reporting
- [ ] Set up Docker image building
- [ ] Configure GitHub Container Registry

### Phase 2: Testing Pipeline (Week 2-3)

- [ ] Add E2E tests to pipeline
- [ ] Configure Playwright in CI
- [ ] Set up test result reporting
- [ ] Add security scanning (Trivy, Dependabot)
- [ ] Configure code quality gates

### Phase 3: Production Pipeline (Week 3-4)

- [ ] Create production workflow for `main` branch
- [ ] Add production build optimizations
- [ ] Set up semantic versioning
- [ ] Configure production image tagging
- [ ] Add pre-deployment validation

### Phase 4: Home Server Setup (Week 4-5)

- [ ] Set up blue/green directory structure
- [ ] Configure Nginx for blue/green switching
- [ ] Create deployment scripts
- [ ] Set up SSH access from GitHub Actions
- [ ] Test manual deployment

### Phase 5: Automated Deployment (Week 5-6)

- [ ] Integrate deployment into GitHub Actions
- [ ] Implement health checks
- [ ] Add smoke tests post-deployment
- [ ] Configure monitoring and alerts
- [ ] Test full deployment cycle

### Phase 6: Optimization & Hardening (Week 6+)

- [ ] Optimize build times (caching)
- [ ] Add deployment notifications
- [ ] Implement automatic rollback
- [ ] Set up comprehensive monitoring
- [ ] Document procedures
- [ ] Train team (if applicable)

---

## Example GitHub Actions Workflows

### Dev-Main Workflow

```yaml
name: Dev Pipeline

on:
  push:
    branches: [dev-main]
  pull_request:
    branches: [dev-main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run eslint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

  build:
    needs: [validate, test, e2e]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:dev-${{ github.sha }}
            ghcr.io/${{ github.repository }}:dev-latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### Production Workflow

```yaml
name: Production Pipeline

on:
  push:
    branches: [main, master]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run eslint

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:e2e

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
      - name: Upload Trivy results to GitHub Security
        uses: github/codeql-action/upload-sarif@v2
        with:
          sarif_file: 'trivy-results.sarif'

  build:
    needs: [validate, test, security]
    runs-on: ubuntu-latest
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - name: Generate version tag
        id: version
        run: echo "tag=v$(date +%Y%m%d)-${GITHUB_SHA::7}" >> $GITHUB_OUTPUT
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      - name: Login to GitHub Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=raw,value=${{ steps.version.outputs.tag }}
            type=sha,prefix={{branch}}-
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to home server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOME_SERVER_HOST }}
          username: ${{ secrets.HOME_SERVER_USER }}
          key: ${{ secrets.HOME_SERVER_SSH_KEY }}
          script: |
            cd /home/user/deployments
            ./deploy.sh ${{ steps.version.outputs.tag }}
      - name: Health check
        run: |
          sleep 30
          curl -f https://your-domain.com/api/health || exit 1
```

---

## Cost Considerations

### GitHub Actions
- **Free Tier**: 2,000 minutes/month for private repos
- **Estimated Usage**: 
  - Dev pipeline: ~10-15 minutes per run
  - Prod pipeline: ~15-20 minutes per run
- **Cost**: Likely within free tier for personal projects

### Container Registry
- **GitHub Container Registry**: Free for public, 500MB free for private
- **Docker Hub**: 1 private repo free, unlimited public

### Home Server
- **Hardware**: One-time cost
- **Electricity**: ~$5-20/month depending on hardware
- **Internet**: Existing cost
- **Domain**: ~$10-15/year

### Total Estimated Monthly Cost
- **Free to $20/month** (mostly electricity and domain)

---

## Best Practices

1. **Always test in dev before production**
2. **Use semantic versioning for releases**
3. **Keep deployment scripts version controlled**
4. **Document all manual steps**
5. **Monitor deployments closely**
6. **Test rollback procedures regularly**
7. **Keep secrets secure and rotated**
8. **Use infrastructure as code principles**
9. **Maintain deployment runbooks**
10. **Review and update pipeline regularly**

---

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Docker layer caching
   - Verify dependencies are up to date
   - Check build logs for specific errors

2. **Test Failures**
   - Review test output
   - Check for flaky tests
   - Verify test environment setup

3. **Deployment Failures**
   - Check SSH connectivity
   - Verify server resources
   - Check Docker daemon status
   - Review deployment logs

4. **Health Check Failures**
   - Verify application is running
   - Check database connectivity
   - Review application logs
   - Check network configuration

---

## Conclusion

This CI/CD strategy provides a robust, automated pipeline for your personal site with:
- Automated testing and validation
- Secure container builds
- Zero-downtime blue/green deployments
- Comprehensive monitoring
- Easy rollback procedures

Start with Phase 1 and gradually implement each phase. Adjust the strategy based on your specific needs and constraints.

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx Blue/Green Deployment](https://www.nginx.com/blog/blue-green-deployments-with-nginx/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Playwright CI/CD](https://playwright.dev/docs/ci)

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-27  
**Author**: CI/CD Strategy Team

