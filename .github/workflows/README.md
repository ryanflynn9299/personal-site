# GitHub Actions Workflows

This directory contains GitHub Actions workflow files for CI/CD automation.

## Workflows

### `dev-pipeline.yml`

Runs on pushes and pull requests to `dev-main` branch.

**Jobs:**
1. **validate**: Type checking, linting, ESLint
2. **test**: Unit and integration tests with coverage
3. **e2e**: End-to-end tests with Playwright
4. **build**: Builds and pushes Docker image to GitHub Container Registry

**Image Tags:**
- `dev-<commit-sha>`
- `dev-latest`
- `dev-<short-sha>`

### `production-pipeline.yml`

Runs on pushes to `main` or `master` branch, or manual workflow dispatch.

**Jobs:**
1. **validate**: Code validation
2. **test**: Unit and integration tests
3. **e2e**: End-to-end tests
4. **security**: Security scanning with Trivy
5. **build**: Builds production Docker image
6. **deploy**: Deploys to home server

**Image Tags:**
- `v<date>-<short-sha>` (e.g., `v20250127-abc1234`)
- `<branch>-<short-sha>`
- `latest`

## Setup Instructions

### 1. Required GitHub Secrets

Add these secrets in your GitHub repository settings (Settings → Secrets and variables → Actions):

#### Home Server Secrets
- `HOME_SERVER_HOST`: Your home server IP or domain
- `HOME_SERVER_USER`: SSH username
- `HOME_SERVER_SSH_KEY`: Private SSH key for server access
- `HOME_SERVER_PORT`: SSH port (optional, defaults to 22)

#### Optional Secrets
- `CODECOV_TOKEN`: Token for code coverage reporting (optional)

### 2. Environment Protection

Set up environment protection for production:

1. Go to Settings → Environments
2. Create `production` environment
3. Add required reviewers (optional)
4. Add deployment branches (main, master)

### 3. Update Configuration

Before using these workflows, update:

1. **Domain name** in `production-pipeline.yml`:
   ```yaml
   url: https://your-domain.com
   ```

2. **Health check URL** in deployment job:
   ```yaml
   if curl -f -s https://your-domain.com/api/health
   ```

3. **Repository name** (if different):
   - The workflows use `${{ github.repository }}` which should work automatically
   - If you need a different registry path, update `IMAGE_NAME` in env section

### 4. SSH Key Setup

Generate SSH key pair for GitHub Actions:

```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions_deploy

# Copy public key to home server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub user@home-server

# Copy private key content to GitHub secret
cat ~/.ssh/github_actions_deploy
# Copy the output to HOME_SERVER_SSH_KEY secret
```

### 5. Test Workflows

1. **Test dev pipeline:**
   - Push to `dev-main` branch
   - Check Actions tab for workflow run

2. **Test production pipeline:**
   - Use manual workflow dispatch
   - Or push to `main`/`master` branch

## Workflow Features

### Caching
- Node modules cached for faster builds
- Docker layer caching using GitHub Actions cache

### Security
- Trivy scanning for vulnerabilities
- Image scanning before deployment
- SARIF uploads to GitHub Security tab

### Notifications
- Add webhook notifications in deploy job
- Configure Discord/Slack webhooks for deployment status

### Manual Deployment

You can manually trigger production deployment:

1. Go to Actions tab
2. Select "Production Pipeline"
3. Click "Run workflow"
4. Optionally specify image tag
5. Click "Run workflow"

## Troubleshooting

### Workflow fails at validation
- Check Node.js version compatibility
- Verify all dependencies are installed
- Review linting errors

### Build fails
- Check Dockerfile syntax
- Verify registry permissions
- Check build logs for specific errors

### Deployment fails
- Verify SSH key is correct
- Check home server connectivity
- Verify deployment script exists and is executable
- Check server logs

### Health check fails
- Verify application is running
- Check health endpoint exists
- Verify domain DNS is correct
- Check firewall rules

## Customization

### Add More Tests
Add additional test jobs:
```yaml
integration-tests:
  name: Integration Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    # ... test steps
```

### Add Notifications
Add notification step:
```yaml
- name: Notify Discord
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
```

### Multi-Platform Builds
Update build job to build for multiple platforms:
```yaml
platforms: linux/amd64,linux/arm64
```

### Add Deployment Gates
Use environment protection rules:
- Required reviewers
- Wait timer
- Deployment branches

## Best Practices

1. **Never commit secrets** - Always use GitHub Secrets
2. **Use environment protection** - Protect production environment
3. **Review deployments** - Set up required reviewers
4. **Monitor workflows** - Check Actions tab regularly
5. **Test changes** - Test in dev pipeline first
6. **Keep workflows updated** - Update action versions regularly
7. **Document changes** - Update this README when modifying workflows

