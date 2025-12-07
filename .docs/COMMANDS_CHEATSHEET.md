# Commands Cheatsheet

> **Quick Reference**: All available commands for the personal-site project.  
> **Last Updated**: 2025-01-XX  
> **Purpose**: Reorientation guide for future-you who remembers nothing about this project.

---

## 🚀 Quick Start (Most Common)

```bash
# Install dependencies (first time or after package.json changes)
npm install

# Start development server (auto-reloads on file changes)
npm run dev
# → Opens at http://localhost:3000

# Build for production
npm run build

# Run production build locally
npm run start
```

---

## 📦 NPM Scripts

> **Note on Linting**: This project uses **Prettier** as the primary linter. The `npm run lint` command runs Prettier formatting checks. ESLint is available separately via `npm run eslint` for code quality rules.

### Development

| Command              | Purpose                      | When to Use           |
| -------------------- | ---------------------------- | --------------------- |
| `npm run dev`        | Start Next.js dev server     | Daily development     |
| `npm run build`      | Build production bundle      | Before deployment     |
| `npm run start`      | Run production build locally | Test production build |
| `npm run lint`       | Check Prettier formatting    | Before committing     |
| `npm run lint:fix`   | Auto-fix Prettier formatting | When formatting fails |
| `npm run eslint`     | Check ESLint rules           | Code quality checks   |
| `npm run eslint:fix` | Auto-fix ESLint issues       | When ESLint fails     |

### Code Quality

| Command                | Purpose                                     | When to Use           |
| ---------------------- | ------------------------------------------- | --------------------- |
| `npm run format`       | Format all files with Prettier              | Before committing     |
| `npm run format:check` | Check formatting (no changes)               | CI/CD pipelines       |
| `npm run type-check`   | TypeScript type checking                    | Before committing     |
| `npm run validate`     | Run all checks (type-check + lint + eslint) | Pre-commit validation |

### Maintenance

| Command           | Purpose                                    | When to Use              |
| ----------------- | ------------------------------------------ | ------------------------ |
| `npm run clean`   | Remove build artifacts (.next, out, cache) | When build is broken     |
| `npm run analyze` | Bundle size analysis                       | Performance optimization |
| `npm run prepare` | Runs automatically after `npm install`     | Auto-validation hook     |

---

## 🐳 Docker Commands

### Service Management

```bash
# Start all services (frontend, backend, database, analytics, sync)
docker compose up -d

# Start specific service
docker compose up -d ps-frontend
docker compose up -d ps-directus
docker compose up -d ps-sync

# Stop all services
docker compose down

# Stop specific service
docker compose stop ps-frontend

# Restart service
docker compose restart ps-frontend

# View running services
docker compose ps

# View service status
docker compose ps ps-frontend
```

### Logs

```bash
# View logs for all services
docker compose logs -f

# View logs for specific service
docker compose logs -f ps-frontend
docker compose logs -f ps-directus
docker compose logs -f ps-sync

# View last 100 lines
docker compose logs --tail=100 ps-frontend

# View logs without following
docker compose logs ps-frontend
```

### Database

```bash
# Access PostgreSQL database
docker exec -it ps-database psql -U <DB_USER> -d <DB_NAME>

# Backup database
docker exec ps-database pg_dump -U <DB_USER> <DB_NAME> > backup.sql

# Restore database
docker exec -i ps-database psql -U <DB_USER> <DB_NAME> < backup.sql
```

### Maintenance

```bash
# Rebuild specific service (after code changes)
docker compose build ps-frontend
docker compose up -d ps-frontend

# Rebuild all services
docker compose build
docker compose up -d

# View service health
docker compose ps

# Execute command in container
docker exec -it ps-frontend sh
docker exec -it ps-directus sh

# Remove all containers and volumes (⚠️ DESTRUCTIVE)
docker compose down -v
```

### Network

```bash
# Create backend network (required before first start)
docker network create backend-net

# Check network exists
docker network ls | grep backend-net
```

---

## 🔄 Sync Service Commands

The sync service automatically pulls code from GitHub. Use these commands to control it.

### Control Script (Recommended)

```bash
# Check sync status
./sync-service/control.sh status

# Pause sync (with optional reason)
./sync-service/control.sh pause "Database migration"
./sync-service/control.sh pause "Maintenance window"

# Resume sync
./sync-service/control.sh resume

# View sync logs
./sync-service/control.sh logs
```

### Direct Docker Commands

```bash
# Pause sync (create flag file)
docker exec ps-sync sh -c 'echo "Maintenance" > /app/flags/.sync-paused'

# Resume sync (remove flag file)
docker exec ps-sync rm /app/flags/.sync-paused

# Check if paused
docker exec ps-sync test -f /app/flags/.sync-paused && echo "PAUSED" || echo "ACTIVE"

# View sync logs
docker compose logs -f ps-sync

# Check sync service status
docker compose ps ps-sync
```

### Secret Generation

```bash
# Generate webhook secrets (if using webhook mode)
./sync-service/generate-secrets.sh

# Or manually generate
openssl rand -hex 32  # For WEBHOOK_SECRET
openssl rand -hex 32  # For SYNC_ADMIN_TOKEN (use different value!)
```

---

## 🔧 Git Commands

### Basic Workflow

```bash
# Check status
git status

# View changes
git diff

# Stage all changes
git add .

# Stage specific file
git add path/to/file.tsx

# Commit changes
git commit -m "Description of changes"

# Push to remote
git push origin main

# Pull latest changes
git pull origin main
```

### Branch Management

```bash
# Create and switch to new branch
git checkout -b feature/new-feature

# Switch branch
git checkout main

# List branches
git branch

# Merge branch
git checkout main
git merge feature/new-feature

# Delete branch
git branch -d feature/new-feature
```

### Useful Git Commands

```bash
# View commit history
git log --oneline

# View file history
git log --follow path/to/file.tsx

# Undo uncommitted changes
git restore path/to/file.tsx
git restore .

# Undo last commit (keep changes)
git reset --soft HEAD~1

# View remote URL
git remote -v
```

---

## 🛠️ Development Workflows

### Daily Development

```bash
# 1. Start development
npm run dev

# 2. Make changes to files

# 3. Before committing, validate code
npm run validate

# 4. If validation fails, fix issues
npm run lint:fix      # Fix Prettier formatting
npm run eslint:fix    # Fix ESLint issues
npm run format        # Format code (same as lint:fix)
npm run type-check    # Check types

# 5. Commit and push
git add .
git commit -m "Your message"
git push
```

### Adding New Dependencies

```bash
# Install package
npm install package-name

# Install dev dependency
npm install --save-dev package-name

# Install TypeScript types (if needed)
npm install --save-dev @types/package-name

# Update package-lock.json
npm install
```

### Before Deployment

```bash
# 1. Validate everything
npm run validate

# 2. Build production bundle
npm run build

# 3. Test production build locally
npm run start

# 4. Check for issues
npm run lint          # Check Prettier formatting
npm run eslint        # Check ESLint rules
npm run type-check    # Check TypeScript types

# 5. Commit and push
git add .
git commit -m "Ready for deployment"
git push
```

### Troubleshooting Build Issues

```bash
# 1. Clean build artifacts
npm run clean

# 2. Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Rebuild
npm run build

# 4. If still failing, check logs
npm run build 2>&1 | tee build.log
```

### Docker Development Workflow

```bash
# 1. Make code changes locally

# 2. Rebuild Docker image
docker compose build ps-frontend

# 3. Restart service
docker compose restart ps-frontend

# 4. Check logs
docker compose logs -f ps-frontend
```

---

## 🌐 Environment & Configuration

### Environment Variables

```bash
# Check environment variables (in container)
docker exec ps-frontend env | grep NEXT_PUBLIC

# View .env file (local)
cat .env
cat .env.local

# Test environment variable
echo $NEXT_PUBLIC_DIRECTUS_URL
```

### Directus Access

```bash
# Directus admin URL (when running locally)
http://localhost:8055

# Directus admin URL (in Docker)
http://ps-directus:8055  # Internal network
# Or via Nginx Proxy Manager (configured domain)
```

### Matomo Access

```bash
# Matomo URL (when running locally)
http://localhost:80

# Matomo URL (in Docker)
http://ps-matomo:80  # Internal network
# Or via Nginx Proxy Manager (configured domain)
```

---

## 🔍 Debugging & Inspection

### TypeScript

```bash
# Check types without building
npm run type-check

# View TypeScript config
cat tsconfig.json
```

### Next.js

```bash
# View Next.js config
cat next.config.ts

# Check Next.js version
npm list next

# Clear Next.js cache
rm -rf .next
```

### Docker Debugging

```bash
# Inspect container
docker inspect ps-frontend

# View container environment
docker exec ps-frontend env

# Execute shell in container
docker exec -it ps-frontend sh

# View container resource usage
docker stats ps-frontend

# View all Docker images
docker images

# View all Docker volumes
docker volume ls
```

### Network Debugging

```bash
# Test connectivity between containers
docker exec ps-frontend ping ps-directus
docker exec ps-frontend curl http://ps-directus:8055/server/info

# Check network
docker network inspect backend-net
```

---

## 📊 Monitoring & Analysis

### Bundle Analysis

```bash
# Analyze bundle size (requires @next/bundle-analyzer)
npm run analyze
```

### Log Analysis

```bash
# Search logs for errors
docker compose logs | grep -i error

# Search logs for specific service
docker compose logs ps-frontend | grep -i error

# View logs with timestamps
docker compose logs -t ps-frontend
```

### Performance

```bash
# Check container resource usage
docker stats

# Check specific container
docker stats ps-frontend ps-directus ps-database
```

---

## 🧹 Cleanup Commands

### Local Cleanup

```bash
# Remove build artifacts
npm run clean

# Remove node_modules (full clean)
rm -rf node_modules package-lock.json
npm install

# Remove all generated files
rm -rf .next out node_modules/.cache
```

### Docker Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes (⚠️ DESTRUCTIVE)
docker volume prune

# Full cleanup (⚠️ DESTRUCTIVE - removes everything)
docker system prune -a --volumes
```

---

## 🔐 Security & Secrets

### Secret Management

```bash
# Generate secrets for sync service
./sync-service/generate-secrets.sh

# Generate random secret
openssl rand -hex 32

# Check .env file permissions
ls -la .env
```

### Access Control

```bash
# Check who can access Docker
docker ps  # Should require sudo or docker group

# View Docker group members
getent group docker
```

---

## 📝 File Locations Reference

| File/Directory        | Purpose                       |
| --------------------- | ----------------------------- |
| `package.json`        | Dependencies and scripts      |
| `.env` / `.env.local` | Environment variables         |
| `next.config.ts`      | Next.js configuration         |
| `tsconfig.json`       | TypeScript configuration      |
| `tailwind.config.ts`  | Tailwind CSS configuration    |
| `docker-compose.yml`  | Docker services configuration |
| `app/`                | Next.js pages and routes      |
| `components/`         | React components              |
| `lib/`                | Utility functions             |
| `public/`             | Static assets                 |
| `.next/`              | Build output (generated)      |
| `node_modules/`       | Dependencies (generated)      |

---

## 🚨 Emergency Procedures

### Service Won't Start

```bash
# 1. Check logs
docker compose logs ps-frontend

# 2. Check health
docker compose ps

# 3. Restart service
docker compose restart ps-frontend

# 4. Rebuild if needed
docker compose build ps-frontend
docker compose up -d ps-frontend
```

### Database Issues

```bash
# 1. Check database logs
docker compose logs ps-database

# 2. Check database health
docker compose ps ps-database

# 3. Restart database
docker compose restart ps-database

# 4. Access database directly
docker exec -it ps-database psql -U <DB_USER> -d <DB_NAME>
```

### Build Fails

```bash
# 1. Clean everything
npm run clean
rm -rf node_modules

# 2. Reinstall
npm install

# 3. Check for errors
npm run validate

# 4. Try building again
npm run build
```

### Sync Service Issues

```bash
# 1. Check if paused
./sync-service/control.sh status

# 2. View logs
./sync-service/control.sh logs

# 3. Restart service
docker compose restart ps-sync

# 4. Check environment variables
docker exec ps-sync env | grep GITHUB_REPO
```

---

## 🔄 Common Workflow Patterns

### Pattern 1: Local Development

```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Make changes, validate
npm run validate
git add .
git commit -m "Changes"
git push
```

### Pattern 2: Docker Development

```bash
# Start all services
docker compose up -d

# Make code changes
# ... edit files ...

# Rebuild and restart
docker compose build ps-frontend
docker compose restart ps-frontend

# Check logs
docker compose logs -f ps-frontend
```

### Pattern 3: Pre-Deployment Checklist

```bash
# 1. Validate code
npm run validate

# 2. Build production
npm run build

# 3. Test production build
npm run start
# Visit http://localhost:3000 and test

# 4. Check Docker services
docker compose ps

# 5. Commit and push
git add .
git commit -m "Production ready"
git push
```

### Pattern 4: Maintenance Window

```bash
# 1. Pause sync service
./sync-service/control.sh pause "Maintenance: $(date)"

# 2. Stop services (if needed)
docker compose stop ps-frontend ps-directus

# 3. Perform maintenance
# ... do work ...

# 4. Restart services
docker compose start

# 5. Resume sync
./sync-service/control.sh resume
```

---

## 📚 Additional Resources

- **Project README**: `/README.md` - Full project documentation
- **Architecture Docs**: `/.docs/ARCHITECTURE_REVIEW.md`
- **Component Docs**: `/.docs/COMPONENT_ARCHITECTURE.md`
- **Sync Service Docs**: `/sync-service/README.md`

---

## 🎯 Quick Command Reference

```bash
# Development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run start                  # Run production build

# Code Quality
npm run lint                   # Check Prettier formatting
npm run lint:fix               # Fix Prettier formatting
npm run eslint                 # Check ESLint rules
npm run eslint:fix             # Fix ESLint issues
npm run format                 # Format code (same as lint:fix)
npm run format:check           # Check formatting (same as lint)
npm run type-check             # Check TypeScript
npm run validate               # Run all checks

# Docker
docker compose up -d           # Start all services
docker compose down            # Stop all services
docker compose logs -f         # View logs
docker compose ps              # View status

# Sync Service
./sync-service/control.sh status   # Check sync status
./sync-service/control.sh pause    # Pause sync
./sync-service/control.sh resume   # Resume sync

# Git
git status                     # Check status
git add .                      # Stage changes
git commit -m "Message"        # Commit
git push                       # Push to remote
```

---

## 📝 Notes for Future Updates

When adding new commands or workflows:

1. **Add to appropriate section** - Keep related commands together
2. **Update Quick Reference** - Add to bottom section if commonly used
3. **Document context** - Explain when/why to use the command
4. **Include examples** - Show actual usage with parameters
5. **Mark destructive commands** - Use ⚠️ for commands that delete data

---

**Last Updated**: 2025-01-XX  
**Maintained By**: Future-you (hopefully with better memory)
