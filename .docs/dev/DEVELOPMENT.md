# Development Guide

Onboarding, tooling, and command reference for the personal-site project. This is the single dev-workflow doc — it replaces the former `DEV_INSTRUCTIONS.md` and `COMMANDS_CHEATSHEET.md` (see git history if you need them).

---

## Quick start

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** 10 (`packageManager` is pinned in `package.json`)
- **Docker** (optional — only needed for Directus/Matomo services)

### Setup

```bash
git clone <repository-url> && cd personal-site
pnpm install
cp .env.example .env      # then edit; see .docs/dev/ENV_VARIABLES.md
pnpm run dev              # http://localhost:3000
```

Without any `.env` configuration the app runs in `offline-dev` mode: no external services, dummy content where applicable. That is the expected first-run state.

### First-day checklist

- [ ] `pnpm install` succeeds
- [ ] `pnpm run dev` serves the site
- [ ] `pnpm run validate` passes
- [ ] `pnpm run test` passes
- [ ] Read [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md) for the code/doc map

---

## Command reference

All commands are `pnpm run <script>` (defined in `package.json`).

### Development & build

| Command         | Purpose                                           |
| --------------- | ------------------------------------------------- |
| `dev`           | Start dev server (Turbopack)                      |
| `build`         | Production build (runs `prebuild` env sync first) |
| `build:webpack` | Production build without Turbopack                |
| `start`         | Serve the production build locally                |
| `clean`         | Remove `.next`, `out`, and caches                 |
| `analyze`       | Bundle-size analysis (`@next/bundle-analyzer`)    |

### Code quality

| Command                 | Purpose                                                          |
| ----------------------- | ---------------------------------------------------------------- |
| `lint` / `format:check` | Prettier check (no changes)                                      |
| `lint:fix` / `format`   | Prettier write                                                   |
| `eslint` / `eslint:fix` | ESLint check / auto-fix                                          |
| `type-check`            | TypeScript, no emit                                              |
| `validate`              | **The gate:** `type-check` + `lint` + `eslint` + `version:check` |

> Note: in this repo `lint` means **Prettier**; ESLint is its own script. `validate` runs both.

### Testing

| Command                          | Purpose                                  |
| -------------------------------- | ---------------------------------------- |
| `test`                           | Vitest suite, single run                 |
| `test:watch` / `test:ui`         | Watch mode / interactive UI              |
| `test:coverage`                  | Coverage report → `output/coverage/`     |
| `test:e2e`                       | Playwright E2E (builds + starts the app) |
| `test:e2e:ui` / `test:e2e:debug` | Interactive / step-through E2E           |
| `test:all`                       | Unit + E2E                               |

See [TESTING_STRATEGY.md](../TESTING_STRATEGY.md) for what to test and how.

### Versioning & release

| Command                                             | Purpose                                             |
| --------------------------------------------------- | --------------------------------------------------- |
| `version:check`                                     | Verify `CHANGELOG.md` documents the current version |
| `version:patch` / `version:minor` / `version:major` | Bump `package.json` (you still edit CHANGELOG)      |

Policy: [VERSIONING.md](./VERSIONING.md). Release gate: [RELEASE_READINESS.md](./RELEASE_READINESS.md).

### Health audit

| Command             | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| `health:audit`      | Scripted code-health checks (validate, tests, policy) |
| `health:audit:full` | Adds E2E + production build (pre-release)             |

Framework: [CODE_HEALTH_SCORECARD.md](./CODE_HEALTH_SCORECARD.md). Reports land in `logs/`.

---

## Everyday workflow

```bash
# 1. Branch from dev (feature branches merge to dev; releases go dev → main)
git checkout dev && git pull origin dev
git checkout -b cursor/my-feature

# 2. Develop with the dev server running
pnpm run dev

# 3. Before committing
pnpm run validate
pnpm run test

# 4. If validation fails
pnpm run lint:fix
pnpm run eslint:fix
```

Branch workflow and CI policy live in [RELEASE_READINESS.md](./RELEASE_READINESS.md); CI details in [CI_PIPELINE.md](./CI_PIPELINE.md).

---

## Tooling map

| Tool                   | Purpose          | Config                 |
| ---------------------- | ---------------- | ---------------------- |
| TypeScript             | Type checking    | `tsconfig.json`        |
| ESLint 9 (flat config) | Code quality     | `eslint.config.mjs`    |
| Prettier               | Formatting       | `.prettierrc`          |
| Vitest                 | Unit/integration | `vitest.config.ts`     |
| Playwright             | E2E              | `playwright.config.ts` |
| @vitest/coverage-v8    | Coverage         | `vitest.config.ts`     |
| @next/bundle-analyzer  | Bundle analysis  | `next.config.ts`       |

### Utility scripts (`scripts/`)

| Script                  | Purpose                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------- |
| `bump-version.mjs`      | Version bump (behind `version:*` scripts)                                              |
| `version-check.mjs`     | CHANGELOG/version consistency (part of `validate`)                                     |
| `sync-env.mjs` / `.sh`  | Sync `.env` against `.env.example` (runs in `prebuild`)                                |
| `migrate-env.py`        | One-time env var rename migration ([ENV_VARIABLES.md](./ENV_VARIABLES.md) § Migration) |
| `dev-server-e2e.js`     | Dev-server wrapper for E2E (filters connection-reset noise)                            |
| `code-health-audit.mjs` | Automated health audit (behind `health:audit`)                                         |

---

## Coverage

```bash
pnpm run test:coverage
# HTML report: output/coverage/index.html
```

Guidance: aim for strong coverage on business logic (`lib/`, `app/actions/`), don't chase 100%, and don't write coverage-padding tests — see [TESTING_STRATEGY.md](../TESTING_STRATEGY.md). Coverage is not currently enforced in CI (adding a coverage gate on `main` is an open TODO).

---

## Bundle analysis

```bash
pnpm run analyze
```

Watch for: oversized dependencies, duplicate libraries, client bundles pulling in server-only tooling (e.g. the pino logger). Prefer `next/dynamic` for heavy, below-the-fold client components.

---

## Docker stack

Services defined in `docker-compose.yml` (external network `backend-net` required):

| Service        | Role                    |
| -------------- | ----------------------- |
| `ps-frontend`  | Next.js app             |
| `ps-directus`  | Directus CMS            |
| `ps-database`  | PostgreSQL for Directus |
| `ps-matomo`    | Matomo analytics        |
| `ps-matomo-db` | MariaDB for Matomo      |

A `ps-sync` code-sync service exists in `infrastructure/sync-service/` but is **disabled** (commented out in `docker-compose.yml`); see `infrastructure/sync-service/README.md` if reviving it.

```bash
docker network create backend-net          # first time only
docker compose up -d                       # start everything
docker compose up -d ps-directus ps-database  # CMS only (common for local dev)
docker compose logs -f ps-frontend         # follow logs
docker compose build ps-frontend && docker compose up -d ps-frontend  # rebuild after code changes
```

Database access and backups:

```bash
docker exec -it ps-database psql -U "$DB_USER" -d "$DB_NAME"
docker exec ps-database pg_dump -U "$DB_USER" "$DB_NAME" > backup.sql
```

---

## Troubleshooting

| Symptom                           | First moves                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `validate` fails                  | `pnpm run lint:fix && pnpm run eslint:fix`; fix type errors manually                                                |
| Build broken                      | `pnpm run clean`, then `rm -rf node_modules && pnpm install`, then rebuild                                          |
| Tests fail after refactor         | Search `tests/` for stale mock strings — see [DEVELOPMENT_GUIDELINES.md](../prompting/DEVELOPMENT_GUIDELINES.md) §2 |
| Container won't start             | `docker compose logs <service>`, `docker compose ps`, then restart/rebuild                                          |
| Containers can't reach each other | `docker network inspect backend-net`; use service names (`ps-directus:8055`), not `localhost`                       |
| Env vars ignored in container     | `NEXT_PUBLIC_*` values are baked at **build** time — rebuild the frontend image                                     |

---

## Related documentation

| Topic                  | Doc                                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| Doc & code map         | [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md)                   |
| Repo-specific pitfalls | [DEVELOPMENT_GUIDELINES.md](../prompting/DEVELOPMENT_GUIDELINES.md) |
| Architecture & layout  | [ARCHITECTURE.md](../ARCHITECTURE.md)                               |
| Environment variables  | [ENV_VARIABLES.md](./ENV_VARIABLES.md)                              |
| Testing                | [TESTING_STRATEGY.md](../TESTING_STRATEGY.md)                       |
| CI                     | [CI_PIPELINE.md](./CI_PIPELINE.md)                                  |
| Release & branches     | [RELEASE_READINESS.md](./RELEASE_READINESS.md)                      |
