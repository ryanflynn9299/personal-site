# Environment Variables Documentation

This document describes the environment variable system for the personal-site project.

## Overview

The application uses a centralized environment variable system (`lib/env.ts`) that separates:

- **Service connectivity** (whether to connect to services like Directus, SMTP)
- **Dev mode UI** (whether to show unreleased features)
- **Test mode** (whether we're in tests)

## Application Modes

The application supports four modes controlled by `APP_MODE`:

### 1. Production (`APP_MODE=production`)

- **Services MUST be configured** - connection errors are treated as genuine errors
- Service errors are logged as CRITICAL and shown in UI
- Production behavior
- Dev mode UI disabled
- Used for live production deployment

### 2. Live Dev (`APP_MODE=live-dev`)

- **Services MUST be configured** - behaves like production
- Service errors are treated as genuine errors (logged and shown in UI)
- Development environment/configuration
- Dev mode UI enabled by default (can be disabled with `DEV_MODE_UI=false`)
- Used when developing with services connected (e.g., frontend on different computer than server)

### 3. Offline Dev (`APP_MODE=offline-dev`)

- **Services are IGNORED** - no service calls made regardless of .env values
- Service environment variables are completely ignored
- Development behavior
- Dev mode UI enabled by default (can be disabled with `DEV_MODE_UI=false`)
- Used for pure frontend development without service dependencies
- **This is the default mode** when `APP_MODE` is not set and `NODE_ENV !== "production"`

### 4. Test (`APP_MODE=test`)

- **Services are disabled** - no service calls made
- Test behavior
- Dev mode UI disabled
- Automatically set in test environments (vitest, playwright)

## Mode Detection Priority

1. Explicit `APP_MODE` env var (highest priority)
2. `NODE_ENV=test` → test mode
3. `NODE_ENV=production` → production mode
4. Default → offline-dev mode

## Dev Mode UI Toggle

`DEV_MODE_UI` controls whether unreleased UI features are visible:

- `true`: Show dev-only features (dev controls, unreleased pages, etc.)
- `false`: Hide dev-only features (production-like view)

**Policy:**

- Production: Always `false` (cannot be overridden)
- Live-dev: Defaults to `true`, can be set to `false` to see production view
- Offline-dev: Defaults to `true`, can be set to `false` to see production view
- Test: Always `false` (cannot be overridden)

This is **separate** from service connectivity. You can have:

- Services connected + dev UI disabled (see production view with live data)
- Services disabled + dev UI enabled (see dev features without services)

## Environment Variables

### Application Mode

```bash
# Application mode (optional - auto-detected if not set)
APP_MODE=offline-dev  # Options: production, live-dev, offline-dev, test

# Dev mode UI toggle (optional - defaults based on mode)
DEV_MODE_UI=true  # Options: true, false
```

### Site Configuration

```bash
# Base URL for the site (used for SEO, sitemap, etc.)
NEXT_PUBLIC_SITE_URL=https://www.ryanflynn.org
```

### Directus CMS

```bash
# Internal URL for server-side requests (Docker service name or localhost)
DIRECTUS_URL_SERVER_SIDE=http://ps-directus:8055

# Public URL for client-side requests (must be accessible from browser)
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055
```

### SMTP Email

```bash
# SMTP server configuration
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_FROM=contact@example.com
SMTP_TO=your-email@example.com

# Optional authentication
SMTP_USER=your-username
SMTP_PASS=your-password
```

### Matomo Analytics

```bash
# Matomo analytics configuration
NEXT_PUBLIC_MATOMO_URL=https://your-matomo-domain.com
NEXT_PUBLIC_MATOMO_SITE_ID=1

# Set to "DISABLED" to explicitly disable
NEXT_PUBLIC_MATOMO_URL=DISABLED
NEXT_PUBLIC_MATOMO_SITE_ID=DISABLED
```

### Development Tools

```bash
# Enable pretty-printed logs in development
ENABLE_PINO_PRETTY=false
```

## Usage Examples

### Production Deployment

```bash
APP_MODE=production
DEV_MODE_UI=false  # Automatically false in production
DIRECTUS_URL_SERVER_SIDE=http://ps-directus:8055
NEXT_PUBLIC_DIRECTUS_URL=https://api.ryanflynn.org
SMTP_HOST=smtp.example.com
# ... other production config
```

### Live Dev (Frontend on Different Computer)

```bash
APP_MODE=live-dev
DEV_MODE_UI=true  # Default, can set to false to see production view
DIRECTUS_URL_SERVER_SIDE=http://your-server-ip:8055  # Or Tailscale URL
NEXT_PUBLIC_DIRECTUS_URL=https://api.ryanflynn.org  # Public URL
# ... other service configs
```

### Offline Dev (Pure Frontend Development)

```bash
APP_MODE=offline-dev  # Or omit (this is the default)
DEV_MODE_UI=true  # Default
# Services will be disabled regardless of .env values
# No need to configure services
```

### Testing

```bash
# Automatically set in test environments
APP_MODE=test  # Set automatically by test setup
# Services are disabled automatically
# Dev mode UI is disabled automatically
```

## Service Connectivity Rules

**Strict Policy:**

1. **Production/Live-dev modes:**
   - Services MUST be configured properly
   - Service connection errors are treated as **genuine errors**
   - Errors are logged as CRITICAL and shown in UI
   - Services are expected to be available and working

2. **Offline-dev mode:**
   - Services are **completely ignored**
   - No service calls are made regardless of .env values
   - Service environment variables are not checked
   - Used for pure frontend development

3. **Test mode:**
   - Services are disabled
   - No service calls are made
   - Test mocks are used instead

## Migration from Old System

The old system used `NODE_ENV` checks throughout the codebase. The new system:

- Still respects `NODE_ENV` for Next.js built-in behavior
- Adds `APP_MODE` for explicit control
- Adds `DEV_MODE_UI` for UI feature toggling
- Centralizes all environment logic in `lib/env.ts`

To migrate:

1. Replace `process.env.NODE_ENV === "development"` with `env.isDevelopment` or `env.devModeUI`
2. Replace `process.env.NODE_ENV === "production"` with `env.isProduction`
3. Use `env.connectToServices` to check if services should be connected
4. Use `env.devModeUI` to check if dev UI features should be shown

## Debugging

Use the `getEnvSummary()` function to see current environment configuration:

```typescript
import { getEnvSummary } from "@/lib/env";

console.log(getEnvSummary());
// {
//   mode: "offline-dev",
//   devModeUI: true,
//   connectToServices: false,
//   directusEnabled: false,
//   emailEnabled: false,
//   ...
// }
```
