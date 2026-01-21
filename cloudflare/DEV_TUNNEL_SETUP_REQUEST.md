# Cloudflare Dev Tunnel Setup Request for Directus Backend

## Context and Objective

I am setting up a Cloudflare Tunnel (cloudflared) to expose my Directus CMS backend service running in a Docker Compose stack for development purposes. I have already begun the setup process and have some infrastructure in place, but I need comprehensive guidance to complete the configuration correctly using the latest Cloudflare tooling and best practices as of 2025.

**Primary Goal:** Configure a Cloudflare Tunnel that securely exposes my Directus backend service (running on port 8055 internally) so that I can access it from my development machine when the Docker stack is running on a remote server.

**Secondary Goal:** Understand the complete end-to-end setup process, including all necessary Cloudflare dashboard configurations, Docker Compose settings, environment variables, and any additional security or routing considerations.

## Current Infrastructure State

### Docker Compose Stack

I have a multi-service Docker Compose setup with the following services:

**Main Stack (`docker-compose.yml`):**

- **ps-frontend**: Next.js frontend application (port 3000, internal)
- **ps-directus**: Directus CMS backend (port 8055, internal) - **THIS IS THE TARGET SERVICE**
- **ps-database**: PostgreSQL database for Directus
- **ps-matomo**: Matomo analytics (port 8181, internal)
- **ps-matomo-db**: MariaDB for Matomo

All services run on a shared Docker network called `backend-net` (external network, must be created manually).

**Cloudflare Tunnel Stack (`docker-compose.cloudflare.yml`):**

- **ps-cloudflared**: Cloudflare Tunnel service using `cloudflare/cloudflared:latest` image
- Configured to use the same `backend-net` network
- Supports both token-based authentication (`TUNNEL_TOKEN` env var) and config file-based authentication
- Has a persistent volume `ps-cloudflared-data` mounted at `/etc/cloudflared`

### Current Cloudflare Configuration Files

**Location:** `./cloudflare/` directory

**Files Present:**

1. `config.yml.example` - Example configuration with:
   - Placeholder tunnel ID: `YOUR_TUNNEL_ID`
   - Credentials file path: `/etc/cloudflared/credentials.json`
   - Ingress rules configured for frontend (`www.ryanflynn.org` → `http://ps-frontend:3000`)
   - Directus ingress rule is **commented out** (needs to be enabled)
   - Catch-all rule for 404 responses

2. `credentials.json.example` - Example with placeholders:
   - `AccountTag`
   - `TunnelSecret`
   - `TunnelID`
   - `TunnelName`

**Files in `.gitignore` (not committed):**

- `cloudflare/config.yml` (actual config with secrets)
- `cloudflare/credentials.json` (actual credentials)

### Environment Configuration

The application uses a centralized environment system (`lib/env.ts`) with the following relevant variables:

**Directus URLs:**

- `DIRECTUS_URL_SERVER_SIDE`: Internal Docker network URL (e.g., `http://ps-directus:8055`)
- `NEXT_PUBLIC_DIRECTUS_URL`: Public URL accessible from browser (currently needs to point to tunnel URL)

**Application Modes:**

- `APP_MODE=live-dev`: Mode where services must be connected (this is the target mode for tunnel usage)
- The system distinguishes between server-side (internal Docker network) and client-side (public URL) access

### What I've Already Done

1. ✅ Created `docker-compose.cloudflare.yml` with cloudflared service definition
2. ✅ Created example configuration files (`config.yml.example`, `credentials.json.example`)
3. ✅ Set up Docker network structure (`backend-net`)
4. ✅ Configured volume mounting for cloudflared data persistence
5. ✅ Added Cloudflare config files to `.gitignore` for security
6. ✅ Created basic README documentation in `cloudflare/` directory
7. ✅ Set up health checks for cloudflared container

### What I Need Help With

1. **Cloudflare Dashboard Setup:**
   - How to create/configure a tunnel in Cloudflare Zero Trust dashboard (2025 interface)
   - Whether to use a named tunnel or quick tunnel
   - How to obtain tunnel token vs. credentials file
   - DNS configuration for the Directus subdomain
   - Any required Cloudflare account settings or permissions

2. **Docker Configuration:**
   - Complete `config.yml` structure for Directus service
   - Proper ingress rule syntax for Directus backend
   - Whether to use token-based or config-based authentication (and why)
   - Network connectivity verification between cloudflared and ps-directus containers
   - Health check configuration validation

3. **Environment Variables:**
   - Required `.env` variables for tunnel operation
   - How to set `NEXT_PUBLIC_DIRECTUS_URL` to point to the tunnel endpoint
   - Any Directus-specific environment variables that need adjustment for tunnel access

4. **Security Considerations:**
   - Best practices for exposing Directus via tunnel (authentication, access control)
   - Whether to use Cloudflare Access policies
   - CORS configuration for Directus when accessed via tunnel
   - Any firewall or network security implications

5. **Testing and Verification:**
   - How to verify tunnel is working correctly
   - How to test Directus connectivity through the tunnel
   - Troubleshooting common issues
   - Log analysis and debugging techniques

6. **Operational Considerations:**
   - How to start/stop the tunnel service
   - How to update tunnel configuration
   - How to handle tunnel reconnection/recovery
   - Monitoring and logging best practices

## Requested Output Format

Please provide a **comprehensive, step-by-step tutorial** that:

1. **Overlaps with existing setup** - Acknowledge and reference the files and configurations I've already created, ensuring the tutorial builds upon them rather than replacing them.

2. **Uses 2025 Cloudflare tooling** - Research and use the latest Cloudflare Tunnel features, dashboard interface, and best practices as of 2025.

3. **Provides complete coverage** - Include every step from Cloudflare account setup through final verification, leaving no gaps.

4. **Explains decisions** - For each configuration choice, explain why it's recommended (e.g., token-based vs. config-based auth, named tunnel vs. quick tunnel).

5. **Includes verification steps** - After each major configuration step, include how to verify it's working correctly.

6. **Addresses edge cases** - Cover common pitfalls, troubleshooting scenarios, and how to handle errors.

7. **References my specific setup** - Use my actual service names (`ps-directus`, `ps-cloudflared`), network names (`backend-net`), and file paths where relevant.

## Specific Questions to Address

1. Should I use a **named tunnel** or **quick tunnel** for this use case? What are the trade-offs?

2. What is the **recommended authentication method** (token vs. credentials file) for a Docker-based setup in 2025?

3. What **DNS configuration** is needed? Do I need to create a subdomain (e.g., `cms.ryanflynn.org` or `directus.ryanflynn.org`) or can I use a different approach?

4. How should I configure **Directus CORS settings** to work with the tunnel? The current config has:
   - `CORS_ENABLED=true`
   - `CORS_ORIGIN=true`
   - `CORS_ALLOWED_HEADERS=Content-Type,Authorization`

5. Should I use **Cloudflare Access** to add authentication layers, or is the tunnel itself sufficient for development purposes?

6. What are the **performance implications** of routing Directus through a Cloudflare Tunnel vs. direct access?

7. How do I handle **WebSocket connections**? Directus has `WEBSOCKETS_ENABLED=true` - does the tunnel support this?

8. What **logging and monitoring** should I set up to ensure the tunnel is working correctly?

## Expected Deliverable

A complete, actionable tutorial document that I can follow step-by-step to:

- Set up the Cloudflare Tunnel in the dashboard
- Configure the tunnel to expose Directus
- Update my Docker Compose and environment configuration
- Verify the setup is working
- Understand how to maintain and troubleshoot the tunnel

The tutorial should be formatted for easy reading and execution, with clear section headers, code blocks, and verification steps throughout.

## Additional Context

- **Domain:** `ryanflynn.org` (managed in Cloudflare)
- **Target Service:** Directus CMS on port 8055
- **Use Case:** Development access to Directus backend from a different machine
- **Security Level:** Development environment (not production, but should follow security best practices)
- **Docker Version:** Latest (2025)
- **Cloudflare Account:** Active account with domain already configured

---

**Note:** This document is designed to be passed as input to an LLM (like Claude, GPT-4, etc.) to generate the comprehensive tutorial. The LLM should research current Cloudflare documentation, analyze the Docker stack configuration, and produce a detailed, accurate step-by-step guide.
