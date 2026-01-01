# Matomo Apache Configuration

This directory contains custom Apache configuration files for the Matomo Docker container.

## Files

### `apache-port-8181.conf`

This file overrides the default Apache `ports.conf` to make Matomo listen on port 8181 instead of the default port 80.

**Why?**

- Port 80 may be in use by another service (e.g., Nginx Proxy Manager)
- Port 8080 may also be in use by other services
- Avoids port conflicts on the host system
- Allows Matomo to run alongside other web services

**How it works:**

- The file is mounted into the container at `/etc/apache2/ports.conf`
- It changes the `Listen` directive from `80` to `8181`
- Apache will then listen on port 8181 inside the container

**Usage:**

- This file is automatically mounted by `docker-compose.yml`
- No additional configuration needed
- Matomo will be accessible at `http://ps-matomo:8181` from other Docker containers

## Troubleshooting

If Matomo doesn't start after changing the port:

1. **Check Apache logs:**

   ```bash
   docker compose logs ps-matomo
   ```

2. **Verify the port is correct:**

   ```bash
   docker exec ps-matomo cat /etc/apache2/ports.conf
   ```

3. **Test connectivity:**

   ```bash
   docker exec ps-matomo curl -f http://localhost:8181
   ```

4. **Check if port 8181 is in use:**
   ```bash
   docker compose ps ps-matomo
   ```

## Notes

- The VirtualHost configuration in Matomo should automatically adapt to the port change
- If you need to customize the VirtualHost, you can create additional configuration files
- The configuration is mounted as read-only (`:ro`) to prevent accidental modifications
