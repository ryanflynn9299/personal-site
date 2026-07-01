# Environment Variables Reference

> **Source of truth** for the personal-site environment variable system.

## Architecture

The config system lives in `lib/config/` with three modules:

| Module       | Import                | Purpose                                                     |
| ------------ | --------------------- | ----------------------------------------------------------- |
| `schemas.ts` | — (internal)          | Zod validation schemas; the ONLY file reading `process.env` |
| `index.ts`   | `@/lib/config`        | Public `config` + derived `runtime` policies                |
| `server.ts`  | `@/lib/config/server` | Server-only secrets (guarded by `server-only` package)      |

```typescript
// Client or Server Component
import { config, runtime } from "@/lib/config";

// Server Component, Action, or Middleware ONLY
import { serverConfig } from "@/lib/config/server";
```

## Runtime Modes

Set via `RUNTIME_MODE` (auto-detected if unset):

| Mode          | Services | Preview Features | Use Case                    |
| ------------- | -------- | ---------------- | --------------------------- |
| `production`  | Required | Off              | Live deployment             |
| `live-dev`    | Required | On (default)     | Dev with services connected |
| `offline-dev` | Disabled | On (default)     | Frontend-only development   |
| `test`        | Disabled | Off              | Automated tests             |

## Variable Reference

### Application Runtime

| Variable                  | Scope  | Default                 | Description                   |
| ------------------------- | ------ | ----------------------- | ----------------------------- |
| `RUNTIME_MODE`            | Server | `offline-dev`           | Application runtime mode      |
| `ENABLE_PREVIEW_FEATURES` | Server | Mode-dependent          | Show unreleased UI features   |
| `NEXT_PUBLIC_SITE_URL`    | Public | `http://localhost:3000` | Canonical site URL            |
| `LOG_PRETTY_PRINT`        | Server | `false`                 | Enable pino-pretty log output |

### Directus CMS

| Variable                   | Scope  | Description                               |
| -------------------------- | ------ | ----------------------------------------- |
| `NEXT_PUBLIC_DIRECTUS_URL` | Public | Browser-accessible CMS URL                |
| `DIRECTUS_INTERNAL_URL`    | Server | Server-side CMS URL (Docker service name) |
| `DIRECTUS_KEY`             | Docker | Directus application key                  |
| `DIRECTUS_SECRET`          | Docker | Directus application secret               |
| `DIRECTUS_ADMIN_EMAIL`     | Docker | Initial admin email                       |
| `DIRECTUS_ADMIN_PASSWORD`  | Docker | Initial admin password                    |
| `DIRECTUS_PUBLIC_URL`      | Docker | Public URL for CORS/assets                |

### Admin Dashboard

| Variable                  | Scope  | Description                            |
| ------------------------- | ------ | -------------------------------------- |
| `ADMIN_PASSCODE`          | Server | Dashboard login passcode               |
| `ADMIN_SESSION_SECRET`    | Server | Session cookie signing secret          |
| `ADMIN_REQUIRE_TAILSCALE` | Server | Require Tailscale VPN for admin routes |

### SMTP Email

| Variable    | Scope  | Description                   |
| ----------- | ------ | ----------------------------- |
| `SMTP_HOST` | Server | SMTP server hostname          |
| `SMTP_PORT` | Server | SMTP server port              |
| `SMTP_FROM` | Server | Sender email address          |
| `SMTP_TO`   | Server | Recipient email address       |
| `SMTP_USER` | Server | SMTP auth username (optional) |
| `SMTP_PASS` | Server | SMTP auth password (optional) |

### Matomo Analytics

| Variable                     | Scope  | Description                   |
| ---------------------------- | ------ | ----------------------------- |
| `NEXT_PUBLIC_MATOMO_URL`     | Public | Matomo instance URL           |
| `NEXT_PUBLIC_MATOMO_SITE_ID` | Public | Matomo site ID                |
| `MATOMO_DB_PASSWORD`         | Docker | Matomo database password      |
| `MATOMO_DB_ROOT_PASSWORD`    | Docker | Matomo database root password |

### Cloudflare

| Variable                  | Scope  | Description                         |
| ------------------------- | ------ | ----------------------------------- |
| `CF_TUNNEL_ENABLED`       | Server | Enable Cloudflare tunnel (live-dev) |
| `CF_ACCESS_CLIENT_ID`     | Server | Cloudflare Access client ID         |
| `CF_ACCESS_CLIENT_SECRET` | Server | Cloudflare Access client secret     |
| `CF_TUNNEL_TOKEN`         | Docker | Cloudflare tunnel token             |

### Database

| Variable      | Scope  | Description       |
| ------------- | ------ | ----------------- |
| `DB_PORT`     | Docker | PostgreSQL port   |
| `DB_NAME`     | Docker | Database name     |
| `DB_USER`     | Docker | Database user     |
| `DB_PASSWORD` | Docker | Database password |
