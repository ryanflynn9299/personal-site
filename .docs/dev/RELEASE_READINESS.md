# Release Readiness

Central index for shipping the personal site. Updated March 2026.

## Branch Strategy

| Branch     | Role                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| **`main`** | Production — release PRs merge here                                            |
| **`dev`**  | Staging — feature branches merge here first; synced with `main` after releases |

**Workflow:** `feature/*` → PR to **`dev`** (no CI) → PR to **`main`** when ready to release (full CI required).

**CI policy:**

| Target         | Auto CI | When                                                    |
| -------------- | ------- | ------------------------------------------------------- |
| **`dev`**      | No      | Merge freely; run checks locally if you want            |
| **`main`**     | Yes     | Every push and every PR (required for release)          |
| **Any branch** | Manual  | Actions → CI → Run workflow (pick branch; E2E optional) |

## Pre-Release Checklist

### Security (must complete)

| Item                             | Status      | Doc                                                    |
| -------------------------------- | ----------- | ------------------------------------------------------ |
| Admin middleware wired           | ✅ Done     | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                   |
| Contact honeypot                 | ✅ Done     | [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md) |
| Contact rate limiting            | ✅ Done     | [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md) |
| Configure Tailscale for admin    | ⬜ TODO     | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                   |
| Real SMTP email delivery         | ⬜ TODO     | [SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md) |
| Directus/Matomo admin not public | ⬜ Operator | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                   |

### Launch configuration

| Item                          | Status            | Doc                                                        |
| ----------------------------- | ----------------- | ---------------------------------------------------------- |
| Privacy + Terms policies      | ✅ Done           | `data/policies/`                                           |
| Matomo live at launch         | ⬜ Operator tasks | [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md) |
| Docker prod env wired         | ✅ Done           | `docker-compose.yml`, `.env.example`                       |
| Quotes dev-only in production | ✅ Done           | middleware + sitemap + robots                              |
| OG image + social URLs        | ⬜ TODO           | [SEO_METADATA_CHECKLIST.md](./SEO_METADATA_CHECKLIST.md)   |
| Blog SEO (`ENABLE_BLOG_SEO`)  | ⬜ When ready     | `lib/site/seo.ts`                                          |

### Verification commands

```bash
pnpm run validate
pnpm run test
pnpm run build
pnpm run start   # smoke test against prod-like .env
```

## Preview / Dev-Only Features

Blocked in production unless `ENABLE_PREVIEW_FEATURES=true`:

- `/quotes`
- `/projects-cabinet`

Footer nav already hides these links in production.

## Documentation Map

| Topic                    | File                                                       |
| ------------------------ | ---------------------------------------------------------- |
| Architecture             | [ARCHITECTURE.md](../ARCHITECTURE.md)                      |
| Environment variables    | [ENV_VARIABLES.md](./ENV_VARIABLES.md)                     |
| Admin access + Tailscale | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                       |
| Contact security         | [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)     |
| Matomo launch            | [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md) |
| SMTP launch              | [SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md)     |
| Analytics integration    | [ANALYTICS.md](../ANALYTICS.md)                            |
| Directus CMS             | [DIRECTUS.md](../DIRECTUS.md)                              |
| Testing                  | [TESTING_STRATEGY.md](../TESTING_STRATEGY.md)              |
| Active TODOs             | [TODO.md](./TODO.md)                                       |

## Post-Launch (defer)

See **After Launch** and **Backlog** sections in [TODO.md](./TODO.md). Do not expand scope before ship.
