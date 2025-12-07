# Code Sync Service

A Docker service that automatically syncs code from GitHub to your server. Can run independently of your main application stack and supports pause/resume functionality.

## Features

- ✅ **Independent Operation**: Runs separately from main stack, can sync code even when app is down
- ✅ **Pause/Resume**: Easy on/off control for maintenance
- ✅ **Two Modes**: Polling (works with restrictive firewalls) or Webhook (real-time)
- ✅ **Future-Proof**: Easy to extend with additional features

## Architecture

The sync service operates in one of two modes:

### Polling Mode (Default - Recommended for Restrictive Firewalls)

- Service polls GitHub API every 5 minutes (configurable)
- No inbound ports required
- Works with Tailscale + restrictive firewall
- Server initiates all connections (outbound only)

### Webhook Mode (Future - Real-time)

- Listens for GitHub webhooks on port 8080
- Real-time code sync when changes are pushed
- Requires webhook endpoint to be accessible
- Can be exposed via Nginx Proxy Manager on Tailscale network

## Setup

### 1. Add Environment Variables

Add to your `.env` file:

```bash
# GitHub repository (required)
GITHUB_REPO=your-username/personal-site

# Sync configuration (optional)
SYNC_MODE=poll              # 'poll' or 'webhook'
SYNC_BRANCH=main            # Branch to sync
POLL_INTERVAL=300           # Polling interval in seconds (default: 300 = 5 min)

# Webhook configuration (only needed for webhook mode)
# See SECRETS.md for how to generate these securely
WEBHOOK_SECRET=your-secret-token
SYNC_ADMIN_TOKEN=your-admin-token  # For pause/resume API
```

**Generating Secrets:** See `SECRETS.md` for detailed instructions on generating secure `WEBHOOK_SECRET` and `SYNC_ADMIN_TOKEN` values. Quick method:

```bash
# Generate both secrets
./sync-service/generate-secrets.sh

# Or manually:
openssl rand -hex 32  # For WEBHOOK_SECRET
openssl rand -hex 32  # For SYNC_ADMIN_TOKEN (use different value!)
```

### 2. Start the Service

**Start independently (recommended for maintenance):**

```bash
docker compose up -d ps-sync
```

**Start with main stack:**

```bash
docker compose up -d
```

**Check status:**

```bash
docker compose ps ps-sync
docker compose logs -f ps-sync
```

## Usage

### Pause Sync Service

**Method 1: Create pause flag file**

```bash
# SSH into server
docker exec ps-sync touch /app/flags/.sync-paused
echo "Database migration in progress" | docker exec -i ps-sync tee /app/flags/.sync-paused
```

**Method 2: Stop the service**

```bash
docker compose stop ps-sync
```

**Method 3: Via API (webhook mode only)**

```bash
curl -X POST http://your-server:8080/pause \
  -H "Authorization: Bearer $SYNC_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"reason": "Maintenance window"}'
```

### Resume Sync Service

**Method 1: Remove pause flag**

```bash
docker exec ps-sync rm /app/flags/.sync-paused
```

**Method 2: Start the service**

```bash
docker compose start ps-sync
```

**Method 3: Via API (webhook mode only)**

```bash
curl -X POST http://your-server:8080/resume \
  -H "Authorization: Bearer $SYNC_ADMIN_TOKEN"
```

### Check Sync Status

**View logs:**

```bash
docker compose logs -f ps-sync
```

**Check if paused:**

```bash
docker exec ps-sync test -f /app/flags/.sync-paused && echo "PAUSED" || echo "ACTIVE"
```

**View sync log:**

```bash
docker exec ps-sync cat /app/flags/sync.log
```

**Check health (webhook mode):**

```bash
curl http://your-server:8080/health
```

## Event Flow

### Polling Mode Flow

```
┌─────────────┐
│  Developer  │
│  pushes to  │
│    main     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  GitHub         │
│  (stores code)  │
└─────────────────┘
       │
       │ (Every 5 min)
       ▼
┌─────────────────┐
│  ps-sync        │
│  (Polling)      │
│                 │
│  1. Check API   │
│  2. Compare     │
│  3. git pull    │
│  4. Log result  │
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  Code synced    │
│  (ready for     │
│   manual deploy)│
└─────────────────┘
```

### Webhook Mode Flow (Future)

```
┌─────────────┐
│  Developer  │
│  pushes to  │
│    main     │
└──────┬──────┘
       │
       ▼
┌─────────────────┐      ┌──────────────────┐
│ GitHub Actions  │      │  GitHub          │
│                 │      │  (sends webhook) │
│ 1. Build        │      └────────┬─────────┘
│ 2. Test         │               │
│ 3. ✅ Success   │               │ (webhook)
└─────────────────┘               ▼
                         ┌─────────────────┐
                         │  ps-sync        │
                         │  (Webhook)      │
                         │                 │
                         │  1. Verify      │
                         │  2. git pull    │
                         │  3. Log result  │
                         └─────────────────┘
```

## Maintenance Workflow

### Before Maintenance

1. **Pause sync service:**

   ```bash
   docker exec ps-sync sh -c 'echo "Maintenance: $(date)" > /app/flags/.sync-paused'
   ```

2. **Verify it's paused:**

   ```bash
   docker compose logs ps-sync | tail -5
   # Should see: "Sync is PAUSED: Maintenance: ..."
   ```

3. **Stop main stack if needed:**
   ```bash
   docker compose stop ps-frontend ps-directus ps-database
   ```

### During Maintenance

- Sync service remains paused
- Code won't be pulled during maintenance
- You can work on the codebase without interference

### After Maintenance

1. **Resume sync service:**

   ```bash
   docker exec ps-sync rm /app/flags/.sync-paused
   ```

2. **Restart main stack:**

   ```bash
   docker compose up -d
   ```

3. **Verify sync is active:**
   ```bash
   docker compose logs -f ps-sync
   # Should see: "Code is up to date" or "New commit detected"
   ```

## Configuration

### Polling Interval

Adjust how often the service checks for updates:

```bash
# In .env file
POLL_INTERVAL=600  # 10 minutes
POLL_INTERVAL=180  # 3 minutes
POLL_INTERVAL=60   # 1 minute (not recommended, too frequent)
```

### Repository Path

The service mounts the current directory (`.`) to `/app/repo` in the container. This means:

- Code is synced directly to your project directory
- The service has read/write access to pull code
- No separate clone needed

### Persistent State

The `sync-flags` volume persists:

- Pause flag (`.sync-paused`)
- Sync logs (`sync.log`)
- Rebuild notification (`.rebuild-needed`)

This means pause state survives container restarts.

## Troubleshooting

### Sync Not Working

1. **Check service is running:**

   ```bash
   docker compose ps ps-sync
   ```

2. **Check logs:**

   ```bash
   docker compose logs ps-sync
   ```

3. **Verify environment variables:**

   ```bash
   docker exec ps-sync env | grep -E "GITHUB_REPO|SYNC_MODE"
   ```

4. **Check if paused:**
   ```bash
   docker exec ps-sync test -f /app/flags/.sync-paused && echo "PAUSED"
   ```

### Code Not Pulling

1. **Verify GitHub repo is accessible:**

   ```bash
   docker exec ps-sync curl -s "https://api.github.com/repos/$GITHUB_REPO/commits/main" | head -20
   ```

2. **Check git credentials:**
   - Ensure repository is cloned on server
   - Verify git remote is configured
   - Check if authentication is needed (SSH keys, tokens)

3. **Manual test:**
   ```bash
   docker exec ps-sync /app/sync.sh
   ```

### Service Keeps Restarting

1. **Check logs for errors:**

   ```bash
   docker compose logs ps-sync
   ```

2. **Verify required environment variables are set:**
   ```bash
   docker exec ps-sync env | grep GITHUB_REPO
   ```

## Future Enhancements

- [ ] Automatic Docker rebuild trigger
- [ ] Slack/email notifications on sync
- [ ] Support for multiple branches
- [ ] Pre-sync hooks (backup, validation)
- [ ] Post-sync hooks (notifications, deployments)
- [ ] Webhook mode with Tailscale integration
- [ ] Health check endpoint improvements
- [ ] Metrics and monitoring

## Security Notes

- **Polling Mode**: Only makes outbound HTTPS requests to GitHub API (public, read-only)
- **Webhook Mode**: Requires secret verification, should be behind authentication
- **Pause Flag**: Anyone with Docker exec access can pause/resume (consider access controls)
- **Admin Token**: Use strong, random token for webhook mode API endpoints
