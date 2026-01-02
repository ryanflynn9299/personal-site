# Cloudflare Tunnel Configuration

This directory contains configuration files for the Cloudflare Tunnel service.

## Files

- `config.yml.example` - Example configuration file (committed to git)
- `credentials.json.example` - Example credentials file (committed to git)
- `config.yml` - Your actual configuration (not committed to git, contains secrets)
- `credentials.json` - Your actual credentials (not committed to git, contains secrets)

## Setup Options

### Option 1: Token-Based Authentication (Recommended)

1. Go to [Cloudflare Zero Trust Dashboard](https://one.dash.cloudflare.com/)
2. Navigate to **Networks** → **Tunnels**
3. Create a new tunnel or use an existing one
4. Copy the tunnel token
5. Add to your `.env` file:
   ```bash
   CLOUDFLARE_TUNNEL_TOKEN=your-token-here
   ```
6. Start the service:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d
   ```

### Option 2: Config File-Based Authentication

1. Copy the example config files:

   ```bash
   cp cloudflare/config.yml.example cloudflare/config.yml
   cp cloudflare/credentials.json.example cloudflare/credentials.json
   ```

2. Authenticate with Cloudflare (this will populate credentials.json):

   ```bash
   docker run --rm -v $(pwd)/cloudflare:/etc/cloudflared cloudflare/cloudflared:latest tunnel login
   ```

   This will open a browser to authenticate and automatically update `credentials.json`.

3. Edit `cloudflare/config.yml`:
   - Replace `YOUR_TUNNEL_ID` with your actual tunnel ID (from credentials.json or Cloudflare dashboard)
   - Configure ingress rules for your services
   - Customize hostnames and service URLs

4. Start the service:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.cloudflare.yml up -d
   ```

## Service URLs

The tunnel will expose services based on your configuration:

- **Frontend**: `www.ryanflynn.org` → `http://ps-frontend:3000`
- **Directus** (optional): `cms.ryanflynn.org` → `http://ps-directus:8055`
- **Matomo** (optional): `analytics.ryanflynn.org` → `http://ps-matomo:8181`

## Troubleshooting

### Check tunnel status:

```bash
docker exec ps-cloudflared cloudflared tunnel info
```

### View logs:

```bash
docker logs ps-cloudflared
```

### Restart tunnel:

```bash
docker compose -f docker-compose.cloudflare.yml restart ps-cloudflared
```

## Documentation

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Configuration Reference](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/configuration/)
