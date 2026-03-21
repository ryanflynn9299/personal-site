# Environment Variable Migration Guide

This guide documents the variable renames introduced in the config system overhaul.
Use this to update your production `.env` file before deploying.

## Automated Migration

```bash
# Preview what will change (no files modified)
python3 scripts/migrate-env.py .env --dry-run

# Migrate in-place (creates .env.backup automatically)
python3 scripts/migrate-env.py .env

# Or write to a new file
python3 scripts/migrate-env.py .env --output .env.new
```

## Manual Mapping

| Old Name                         | New Name                  |
| -------------------------------- | ------------------------- |
| `APP_MODE`                       | `RUNTIME_MODE`            |
| `NEXT_PUBLIC_APP_MODE`           | `RUNTIME_MODE`            |
| `DEV_MODE_UI`                    | `ENABLE_PREVIEW_FEATURES` |
| `NEXT_PUBLIC_DEV_MODE_UI`        | `ENABLE_PREVIEW_FEATURES` |
| `ENABLE_PINO_PRETTY`             | `LOG_PRETTY_PRINT`        |
| `NEXT_PUBLIC_ENABLE_PINO_PRETTY` | `LOG_PRETTY_PRINT`        |
| `DIRECTUS_URL_SERVER_SIDE`       | `DIRECTUS_INTERNAL_URL`   |
| `ADMIN_EMAIL`                    | `DIRECTUS_ADMIN_EMAIL`    |
| `ADMIN_PW`                       | `DIRECTUS_ADMIN_PASSWORD` |
| `HTTP_DOMAIN_NAME`               | `DIRECTUS_PUBLIC_URL`     |
| `DASHBOARD_PASSCODE`             | `ADMIN_PASSCODE`          |
| `ENFORCE_TAILSCALE`              | `ADMIN_REQUIRE_TAILSCALE` |
| `USE_CLOUDFLARE_TUNNEL`          | `CF_TUNNEL_ENABLED`       |
| `CLOUDFLARE_TUNNEL_TOKEN`        | `CF_TUNNEL_TOKEN`         |
| `GITHUB_REPO`                    | `SYNC_GITHUB_REPO`        |

## Unchanged Variables

These variables keep their existing names:

- `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_DIRECTUS_URL`
- `DIRECTUS_KEY`, `DIRECTUS_SECRET`
- All `SMTP_*` variables
- All `NEXT_PUBLIC_MATOMO_*` variables
- All `MATOMO_DB_*` variables
- All `CF_ACCESS_*` variables
- All `DB_*` variables
- `ADMIN_SESSION_SECRET`

## New Variables

These variables are new (add them to your `.env` if not present):

| Variable                  | Default | Purpose                                |
| ------------------------- | ------- | -------------------------------------- |
| `ADMIN_PASSCODE`          | —       | Passcode for admin dashboard login     |
| `ADMIN_SESSION_SECRET`    | —       | Session cookie signing secret          |
| `ADMIN_REQUIRE_TAILSCALE` | `false` | Require Tailscale VPN for admin access |
