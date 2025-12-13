# Nginx Configuration Files

This directory contains Nginx configuration files for different deployment strategies.

## Files

### `nginx-blue-green.conf`

Nginx configuration for blue/green deployment (zero-downtime) with:
- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers
- Rate limiting
- Health check endpoint
- Static file caching
- WebSocket support

### `nginx-simple.conf`

Simplified Nginx configuration for stop/start deployment with:
- Direct proxy to single port (no upstream switching)
- HTTP to HTTPS redirect
- SSL/TLS configuration
- Security headers
- Rate limiting
- Health check endpoint
- Static file caching
- WebSocket support

**Use this for:** Stop/start deployments where brief downtime is acceptable.

## Setup Instructions

### 1. Install Nginx

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# Verify installation
nginx -v
```

### 2. Install SSL Certificate

Using Let's Encrypt with Certbot:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal (should be set up automatically)
sudo certbot renew --dry-run
```

### 3. Copy Configuration

**For Blue/Green Deployment:**
```bash
# Copy blue/green configuration
sudo cp nginx-blue-green.conf /etc/nginx/sites-available/personal-site
```

**For Stop/Start Deployment:**
```bash
# Copy simple configuration
sudo cp nginx-simple.conf /etc/nginx/sites-available/personal-site
```

**Then edit and update domain name:**
```bash
sudo nano /etc/nginx/sites-available/personal-site
```

### 4. Update Configuration

Before using, update:

1. **Domain name**: Replace `your-domain.com` with your actual domain
2. **SSL certificate paths**: Update if using different certificate location
3. **Port numbers**: Verify ports match your Docker Compose setup (3001 for blue, 3002 for green)

### 5. Enable Site

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/personal-site /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## Switching Between Blue and Green

### Method 1: Manual Edit

1. Edit the configuration file:
   ```bash
   sudo nano /etc/nginx/sites-available/personal-site
   ```

2. Comment/uncomment the appropriate upstream server:
   ```nginx
   upstream app_backend {
       # server localhost:3001;  # Blue (comment to disable)
       server localhost:3002;     # Green (uncomment to enable)
   }
   ```

3. Test and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

### Method 2: Using Deployment Script

The deployment script (`deploy.sh`) automatically switches the configuration:

```bash
./deploy.sh v20250127-abc1234 green
```

The script uses `sed` to update the configuration automatically.

### Method 3: Using a Switch Script

Create a simple switch script:

```bash
#!/bin/bash
# switch-env.sh

ENV=$1
CONFIG="/etc/nginx/sites-available/personal-site"

if [ "$ENV" == "blue" ]; then
    sed -i 's|server localhost:3002|server localhost:3001|g' $CONFIG
    sed -i 's|# server localhost:3001|server localhost:3001|g' $CONFIG
    sed -i 's|server localhost:3002|# server localhost:3002|g' $CONFIG
elif [ "$ENV" == "green" ]; then
    sed -i 's|server localhost:3001|server localhost:3002|g' $CONFIG
    sed -i 's|# server localhost:3002|server localhost:3002|g' $CONFIG
    sed -i 's|server localhost:3001|# server localhost:3001|g' $CONFIG
else
    echo "Usage: $0 [blue|green]"
    exit 1
fi

nginx -t && systemctl reload nginx
```

Usage:
```bash
sudo ./switch-env.sh green
```

## Configuration Options

### Rate Limiting

Adjust rate limits in the configuration:

```nginx
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
```

- `10m`: Memory size for storing IP addresses
- `10r/s`: Rate limit (requests per second)
- `burst=20`: Allow bursts up to 20 requests

### Timeouts

Adjust timeout values:

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

### Caching

Static file caching is enabled by default. Adjust cache duration:

```nginx
proxy_cache_valid 200 1d;  # Cache successful responses for 1 day
expires 1d;                 # Set browser cache to 1 day
```

### SSL Configuration

Update SSL protocols and ciphers as needed. The current configuration uses:
- TLS 1.2 and 1.3
- Modern cipher suites
- OCSP stapling

## Health Checks

The configuration includes a health check endpoint at `/nginx-health`. You can use this for:
- Uptime monitoring
- Load balancer health checks
- External monitoring services

## Logging

Logs are written to:
- Access logs: `/var/log/nginx/personal-site-access.log`
- Error logs: `/var/log/nginx/personal-site-error.log`

Rotate logs regularly:

```bash
# Install logrotate (if not already installed)
sudo apt install logrotate

# Create logrotate config
sudo nano /etc/logrotate.d/personal-site
```

Add:
```
/var/log/nginx/personal-site-*.log {
    daily
    rotate 14
    compress
    delaycompress
    notifempty
    missingok
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

## Troubleshooting

### Nginx won't start
```bash
# Check configuration syntax
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Check if port is already in use
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### SSL certificate issues
```bash
# Check certificate expiration
sudo certbot certificates

# Renew certificate manually
sudo certbot renew

# Check certificate files
sudo ls -la /etc/letsencrypt/live/your-domain.com/
```

### Upstream connection errors
```bash
# Check if Docker containers are running
docker ps

# Check container ports
docker port ps-frontend

# Test connection from server
curl http://localhost:3001
curl http://localhost:3002
```

### 502 Bad Gateway
- Verify Docker containers are running
- Check container health
- Verify port numbers match
- Check firewall rules
- Review application logs

## Security Best Practices

1. **Keep Nginx updated**: `sudo apt update && sudo apt upgrade nginx`
2. **Use strong SSL configuration**: Keep TLS 1.2+ and modern ciphers
3. **Enable security headers**: Already configured in the template
4. **Rate limiting**: Adjust based on your needs
5. **Hide Nginx version**: Add `server_tokens off;` to main nginx.conf
6. **Regular log review**: Monitor access and error logs
7. **Firewall**: Only expose ports 80 and 443

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [SSL Labs SSL Test](https://www.ssllabs.com/ssltest/) - Test your SSL configuration

