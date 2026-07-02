# Release Readiness

Central index for shipping the personal site. Updated July 2026.

## Branch Strategy

| Branch     | Role                                                                           |
| ---------- | ------------------------------------------------------------------------------ |
| **`main`** | Production — release PRs merge here                                            |
| **`dev`**  | Staging — feature branches merge here first; synced with `main` after releases |

**Workflow:** `feature/*` → PR to **`dev`** (no CI) → PR to **`main`** when ready to release (full CI required). **Bump version** per [VERSIONING.md](./VERSIONING.md) on each `dev` → `main` release PR.

**CI policy:**

| Target         | Auto CI | When                                                    |
| -------------- | ------- | ------------------------------------------------------- |
| **`dev`**      | No      | Merge freely; run checks locally if you want            |
| **`main`**     | Yes     | Every push and every PR (required for release)          |
| **Any branch** | Manual  | Actions → CI → Run workflow (pick branch; E2E optional) |

## Pre-Launch Checklist

### Code (before `dev` → `main` release PR)

| Item                                    | Status  | Doc                                                        |
| --------------------------------------- | ------- | ---------------------------------------------------------- |
| Admin middleware wired                  | ✅ Done | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                       |
| Contact honeypot + rate limiting        | ✅ Done | [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)     |
| **Contact: warn when SMTP unavailable** | ✅ Done | [SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md)     |
| Matomo client + Docker build args       | ✅ Done | [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md) |
| Quotes dev-only in production           | ✅ Done | `middleware.ts`, sitemap, robots                           |
| Privacy + Terms policies                | ✅ Done | `data/policies/`                                           |
| Versioning policy + CHANGELOG           | ✅ Done | [VERSIONING.md](./VERSIONING.md)                           |

### Operator (deploy day — home server)

| Item                                              | Status  | Doc                                                        |
| ------------------------------------------------- | ------- | ---------------------------------------------------------- |
| Configure Tailscale for admin                     | ⬜ TODO | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                       |
| Lock down Directus + Matomo admin                 | ⬜ TODO | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                       |
| Matomo live (URL, site ID, install)               | ⬜ TODO | [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md) |
| Production `.env` + Docker rebuild                | ⬜ TODO | `.env.example`, `docker-compose.yml`                       |
| Smoke test (`validate`, `test`, `build`, `start`) | ⬜ TODO | below                                                      |

### Not required for launch

- Open Graph image (`og-default.png`)
- Social profile URLs in `lib/site/seo.ts`
- Blog SEO (`ENABLE_BLOG_SEO` — keep `false` until post-launch)
- Real SMTP delivery (post-launch; use Directus storage + honest warning until then)

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
| Active TODOs             | [TODO.md](./TODO.md)                                       |
| Versioning               | [VERSIONING.md](./VERSIONING.md)                           |
| Admin access + Tailscale | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)                       |
| Contact security         | [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)     |
| Matomo launch            | [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md) |
| SMTP launch              | [SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md)     |
| Analytics integration    | [ANALYTICS.md](../ANALYTICS.md)                            |
| Directus CMS             | [DIRECTUS.md](../DIRECTUS.md)                              |
| Environment variables    | [ENV_VARIABLES.md](./ENV_VARIABLES.md)                     |
| Testing                  | [TESTING_STRATEGY.md](../TESTING_STRATEGY.md)              |
| Architecture             | [ARCHITECTURE.md](../ARCHITECTURE.md)                      |

## Post-Launch (defer)

See **First promote after launch** and **Backlog** in [TODO.md](./TODO.md).
