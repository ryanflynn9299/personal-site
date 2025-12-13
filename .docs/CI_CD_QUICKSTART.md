# CI/CD Pipeline Quick Start Guide

This guide provides a quick overview and starting point for implementing the CI/CD pipeline. For detailed information, see [CI_CD_STRATEGY.md](CI_CD_STRATEGY.md).

## 📋 Overview

This CI/CD pipeline provides:
- ✅ Automated testing on `dev-main` branch
- ✅ Production builds and deployments on `main`/`master` branch
- ✅ Multiple deployment strategies (blue/green, stop/start, rolling, canary)
- ✅ Security scanning
- ✅ Comprehensive monitoring

**Deployment Strategy Options:**
- **Blue/Green**: Zero-downtime deployments (recommended for production)
- **Stop/Start**: Simple deployments with brief downtime (good for low-traffic sites)
- **Rolling**: Gradual updates with multiple instances
- **Canary**: Risk-minimized gradual rollouts

See [Alternative Deployment Strategies](CI_CD_STRATEGY.md#alternative-deployment-strategies) for detailed comparison and implementation guides.

## 🚀 Quick Start (5 Steps)

### Step 1: Review Strategy Document
Read the full [CI_CD_STRATEGY.md](CI_CD_STRATEGY.md) to understand the complete architecture.

### Step 2: Set Up GitHub Secrets
Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

```
HOME_SERVER_HOST=your-server-ip-or-domain
HOME_SERVER_USER=your-ssh-username
HOME_SERVER_SSH_KEY=your-private-ssh-key
HOME_SERVER_PORT=22 (optional)
```

### Step 3: Set Up Home Server

1. **Create directory structure:**
   ```bash
   mkdir -p /home/user/deployments/{blue,green}
   ```

2. **Copy deployment scripts:**
   ```bash
   # From your local machine
   scp docs/deployment-scripts/* user@server:/home/user/deployments/
   chmod +x /home/user/deployments/*.sh
   ```

3. **Set up Docker Compose files:**
   
   **For Blue/Green Deployment:**
   - Copy `docker-compose.yml` to both `blue/` and `green/` directories
   - Create `.env` files in each directory
   - Update port mappings (3001 for blue, 3002 for green)
   
   **For Stop/Start Deployment (Simpler):**
   - Copy `docker-compose.yml` to `production/` directory
   - Create `.env` file
   - Use single port (3000)

4. **Configure Nginx:**
   
   **For Blue/Green Deployment:**
   ```bash
   sudo cp docs/nginx/nginx-blue-green.conf /etc/nginx/sites-available/personal-site
   # Edit and update domain name
   sudo nano /etc/nginx/sites-available/personal-site
   ```
   
   **For Stop/Start Deployment:**
   ```bash
   # Use simplified Nginx config (no upstream switching needed)
   # Point directly to localhost:3000
   ```
   
   **Complete setup:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/personal-site /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Step 4: Enable GitHub Actions Workflows

The workflow files are already in `.github/workflows/`:
- `dev-pipeline.yml` - Runs on `dev-main` branch
- `production-pipeline.yml` - Runs on `main`/`master` branch

Just push to the respective branches to trigger them!

### Step 5: Test the Pipeline

1. **Test dev pipeline:**
   ```bash
   git checkout dev-main
   git push origin dev-main
   # Check GitHub Actions tab
   ```

2. **Test production pipeline:**
   ```bash
   git checkout main
   git push origin main
   # Or use manual workflow dispatch
   ```

## 📁 File Structure

```
personal-site/
├── .github/
│   └── workflows/
│       ├── dev-pipeline.yml          # Dev branch CI/CD
│       ├── production-pipeline.yml    # Production CI/CD
│       └── README.md                  # Workflow documentation
├── docs/
│   ├── CI_CD_STRATEGY.md              # Complete strategy document
│   ├── CI_CD_QUICKSTART.md            # This file
│   ├── deployment-scripts/
│   │   ├── deploy.sh                  # Main deployment script
│   │   ├── rollback.sh                # Rollback script
│   │   └── README.md                  # Script documentation
│   └── nginx/
│       ├── nginx-blue-green.conf      # Nginx configuration
│       └── README.md                  # Nginx setup guide
```

## 🔧 Configuration Checklist

### GitHub Repository
- [ ] GitHub Actions enabled
- [ ] Secrets configured (HOME_SERVER_*, etc.)
- [ ] Branch protection rules set (optional)
- [ ] Environment protection for production (optional)

### Home Server
- [ ] Docker and Docker Compose installed
- [ ] SSH access configured
- [ ] Blue/green directories created
- [ ] Deployment scripts copied and executable
- [ ] Docker Compose files configured
- [ ] Environment files (`.env`) created
- [ ] Nginx installed and configured
- [ ] SSL certificate obtained (Let's Encrypt)
- [ ] Firewall configured (ports 80, 443, 22)

### Docker Setup
- [ ] Blue environment on port 3001
- [ ] Green environment on port 3002
- [ ] Both environments use same docker-compose.yml
- [ ] Environment variables configured
- [ ] Health checks working

### Nginx Setup
- [ ] Configuration file created
- [ ] Domain name updated
- [ ] SSL certificate configured
- [ ] Upstream pointing to blue (port 3001)
- [ ] Configuration tested (`nginx -t`)
- [ ] Nginx reloaded

## 🧪 Testing the Setup

### 1. Test Local Build
```bash
npm run validate
npm run test
npm run test:e2e
docker build -t test-image .
```

### 2. Test Deployment Script
```bash
# On home server
cd /home/user/deployments
./deploy.sh latest blue
```

### 3. Test Nginx Switch
```bash
# Switch to green
sudo nano /etc/nginx/sites-available/personal-site
# Uncomment green, comment blue
sudo nginx -t && sudo systemctl reload nginx
```

### 4. Test Rollback
```bash
cd /home/user/deployments
./rollback.sh blue
```

## 📊 Pipeline Flow

### Dev Pipeline (`dev-main`)
```
Push to dev-main
    ↓
Validate (lint, type-check)
    ↓
Test (unit, integration)
    ↓
E2E Tests
    ↓
Build Docker Image
    ↓
Push to Registry (optional)
```

### Production Pipeline (`main`/`master`)
```
Push to main/master
    ↓
Validate
    ↓
Test
    ↓
Security Scan
    ↓
Build Production Image
    ↓
Scan Image
    ↓
Deploy to Home Server
    ↓
Health Check
    ↓
Monitor
```

## 🎯 Next Steps

1. **Customize workflows** - Adjust to your specific needs
2. **Set up monitoring** - Add Prometheus, Grafana, or Uptime Kuma
3. **Configure notifications** - Add Discord/Slack webhooks
4. **Set up backups** - Database and file backups
5. **Document runbooks** - Document common procedures
6. **Test rollback** - Practice rollback procedures
7. **Set up staging** - Optional staging environment

## 🆘 Troubleshooting

### GitHub Actions Issues
- Check Actions tab for error messages
- Verify secrets are set correctly
- Check workflow file syntax

### Deployment Issues
- Verify SSH key is correct
- Check server connectivity
- Review deployment script logs
- Verify Docker containers are running

### Nginx Issues
- Test configuration: `sudo nginx -t`
- Check error logs: `sudo tail -f /var/log/nginx/error.log`
- Verify ports are not in use
- Check SSL certificate validity

### Application Issues
- Check container logs: `docker compose logs`
- Verify health endpoint: `curl http://localhost:3001/api/health`
- Check database connectivity
- Review application logs

## 📚 Additional Resources

- [Full Strategy Document](CI_CD_STRATEGY.md) - Complete implementation guide
- [Deployment Scripts README](../docs/deployment-scripts/README.md) - Script documentation
- [Nginx README](../docs/nginx/README.md) - Nginx setup guide
- [Workflows README](../.github/workflows/README.md) - GitHub Actions guide

## 💡 Tips

1. **Start small** - Implement dev pipeline first, then production
2. **Test locally** - Test scripts and configs before deploying
3. **Monitor closely** - Watch first few deployments carefully
4. **Document changes** - Keep notes on customizations
5. **Regular updates** - Keep dependencies and tools updated
6. **Backup first** - Always backup before major changes
7. **Practice rollback** - Know how to rollback before you need to

## 🎉 Success Criteria

You'll know the pipeline is working when:
- ✅ Pushes to `dev-main` trigger automated tests
- ✅ Pushes to `main` trigger full pipeline and deployment
- ✅ Deployments complete without downtime
- ✅ Health checks pass after deployment
- ✅ Rollback works when needed
- ✅ Monitoring shows healthy application

---

**Ready to start?** Begin with Step 1 and work through each step methodically. Don't hesitate to refer back to the full strategy document for detailed explanations.

Good luck! 🚀

