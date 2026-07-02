# Development Guide

Onboarding, tooling, command reference, and troubleshooting for the personal-site project — a helper guide for future-you who remembers nothing about this project. This is the single dev-workflow doc: it replaces the former `DEV_INSTRUCTIONS.md` and `COMMANDS_CHEATSHEET.md` (see git history if you need the originals).

---

## Quick start

### Prerequisites

- **Node.js** ≥ 20 (check with `node --version`)
- **pnpm** 10 (`packageManager` is pinned in `package.json`; check with `pnpm --version`)
- **Git**
- **Docker** (optional — only needed for the Directus/Matomo service stack)

### Setup

```bash
git clone <repository-url> && cd personal-site
pnpm install
cp .env.example .env      # then edit; see .docs/dev/ENV_VARIABLES.md
pnpm run dev              # http://localhost:3000
```

Without any `.env` configuration the app runs in `offline-dev` mode: no external services, dummy content where applicable. That is the expected first-run state, not an error.

### First-day checklist

- [ ] `pnpm install` succeeds
- [ ] `pnpm run dev` serves the site at http://localhost:3000
- [ ] `pnpm run validate` passes
- [ ] `pnpm run test` passes
- [ ] Read [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md) for the code/doc map

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
pnpm run lint:fix      # fix Prettier formatting
pnpm run eslint:fix    # fix auto-fixable ESLint issues
pnpm run type-check    # type errors must be fixed manually
```

There is no enforced pre-commit hook — the `prepare` script only prints a reminder. Running `validate` + `test` before every commit is on you.

Branch workflow and CI policy live in [RELEASE_READINESS.md](./RELEASE_READINESS.md); CI details in [CI_PIPELINE.md](./CI_PIPELINE.md).

### Adding dependencies

```bash
pnpm add <package>              # runtime dependency
pnpm add -D <package>           # dev dependency
pnpm add -D @types/<package>    # types, if the package doesn't ship them
pnpm why <package>              # find out why something is in the tree
pnpm remove <package>           # remove an unused dependency
```

---

## Command reference

All project commands are `pnpm run <script>`, defined in `package.json`.

### Dev servers & builds

| Command         | Purpose                                           | When to use                                             |
| --------------- | ------------------------------------------------- | ------------------------------------------------------- |
| `dev`           | Start dev server (Turbopack, hot reload)          | Daily development                                       |
| `build`         | Production build (Turbopack)                      | Before deployment; verifying a change builds            |
| `build:webpack` | Production build without Turbopack                | When you suspect a Turbopack-specific build issue       |
| `start`         | Serve the production build locally                | Manual smoke test of the real build (after `build`)     |
| `clean`         | Remove `.next`, `out`, `.turbo`, caches, `output` | Build behaving strangely; before a from-scratch rebuild |

### Code quality

| Command                 | Purpose                                                          | When to use                            |
| ----------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| `lint` / `format:check` | Prettier check (no changes)                                      | Before committing; CI                  |
| `lint:fix` / `format`   | Prettier write                                                   | When the formatting check fails        |
| `eslint` / `eslint:fix` | ESLint check / auto-fix                                          | Code-quality issues; before committing |
| `type-check`            | TypeScript, no emit                                              | When the IDE misses type errors; CI    |
| `validate`              | **The gate:** `type-check` + `lint` + `eslint` + `version:check` | Before every commit                    |

> **Naming gotcha:** in this repo `lint` means **Prettier** (formatting); ESLint is its own script. `validate` runs both, plus type checking and the CHANGELOG/version consistency check.

### Testing

| Command                          | Purpose                                  | When to use                             |
| -------------------------------- | ---------------------------------------- | --------------------------------------- |
| `test`                           | Vitest suite, single run                 | Before committing; CI                   |
| `test:watch`                     | Vitest watch mode (rerun on change)      | While writing tests                     |
| `test:ui`                        | Vitest interactive browser UI            | Debugging a confusing test failure      |
| `test:coverage`                  | Coverage report → `output/coverage/`     | Checking coverage of new business logic |
| `test:e2e`                       | Playwright E2E (builds + starts the app) | Before releases; after touching routes  |
| `test:e2e:ui` / `test:e2e:debug` | Interactive / step-through E2E           | Debugging E2E failures                  |
| `test:all`                       | Unit + E2E                               | Pre-release full sweep                  |

Useful variations:

```bash
pnpm run test tests/unit/some-file.test.ts   # run a single test file
pnpm run test -- --reporter=verbose          # more detailed output
```

Notes:

- Unit tests live in `tests/` (`components/`, `unit/`, `integration/`); shared setup is `tests/setup.tsx`.
- E2E tests live in `tests/e2e/`. Locally, `test:e2e` builds and starts the production server itself (so it takes a few minutes cold) and runs Chromium, Firefox, and WebKit; CI runs Chromium only.
- Playwright HTML reports land in `output/playwright-report/`; traces/artifacts in `output/test-results/`.

What to test and how: [TESTING_STRATEGY.md](../TESTING_STRATEGY.md).

### Versioning & changelog

| Command                                             | Purpose                                             | When to use                          |
| --------------------------------------------------- | --------------------------------------------------- | ------------------------------------ |
| `version:check`                                     | Verify `CHANGELOG.md` documents the current version | Runs inside `validate`; rarely alone |
| `version:patch` / `version:minor` / `version:major` | Bump `package.json` version                         | When preparing a release             |

The bump scripts only change `package.json` — you still write the `CHANGELOG.md` entry yourself, and `version:check` (part of `validate`) fails until you do. Policy: [VERSIONING.md](./VERSIONING.md). Release gate: [RELEASE_READINESS.md](./RELEASE_READINESS.md).

### Coverage

```bash
pnpm run test:coverage
# Summary prints to the terminal; full reports in output/coverage/
open output/coverage/index.html        # HTML report (line-by-line)
# JSON summary: output/coverage/coverage-summary.json
```

Guidance: aim for strong coverage on business logic (`lib/`, `app/actions/`), don't chase 100%, and don't write coverage-padding tests — see [TESTING_STRATEGY.md](../TESTING_STRATEGY.md). Coverage can also flag dead code (0% files are worth a look). Exclusions are configured under `coverage.exclude` in `vitest.config.ts`. Coverage is not currently enforced in CI; adding a threshold gate on `main` is an open TODO (thresholds would go in `vitest.config.ts` under `coverage.thresholds`).

### Bundle analysis

```bash
pnpm run analyze    # ANALYZE=true next build → interactive treemap
```

When to use: after adding a heavy dependency, or when pages feel slow to load. Watch for:

- Oversized dependencies (icon libraries are a classic — import individual icons, not `import *`)
- Duplicate libraries across chunks
- Client bundles pulling in server-only tooling (e.g. the pino logger)

Prefer `next/dynamic` for heavy, below-the-fold client components.

### Health audit

| Command             | Purpose                                               | When to use                     |
| ------------------- | ----------------------------------------------------- | ------------------------------- |
| `health:audit`      | Scripted code-health checks (validate, tests, policy) | Quarterly, or when things drift |
| `health:audit:full` | Adds E2E + production build                           | Before major releases           |

Not intended for every PR. Framework: [CODE_HEALTH_SCORECARD.md](./CODE_HEALTH_SCORECARD.md). Reports land in `logs/`.

---

## Docker stack

The full production-like stack is defined in `docker-compose.yml`. All services attach to an **external** Docker network `backend-net` and only `expose` ports internally (a reverse proxy — Nginx Proxy Manager — routes public traffic to them; nothing is published on the host directly).

| Service        | Role                     | Internal address    | Notes                                         |
| -------------- | ------------------------ | ------------------- | --------------------------------------------- |
| `ps-frontend`  | Next.js app              | `ps-frontend:3000`  | Built from the repo `Dockerfile`              |
| `ps-directus`  | Directus CMS             | `ps-directus:8055`  | Depends on healthy `ps-database`              |
| `ps-database`  | PostgreSQL 15 (Directus) | `ps-database:5432`  | Data volume `ps-db-data`; init SQL `init-db/` |
| `ps-matomo`    | Matomo analytics         | `ps-matomo:8181`    | Custom Apache port config (8181, not 80)      |
| `ps-matomo-db` | MariaDB 10 (Matomo)      | `ps-matomo-db:3306` | Data volume `ps-matomo-db-data`               |

A `ps-sync` code-sync service exists in `infrastructure/sync-service/` but is **disabled** (commented out in `docker-compose.yml`). If reviving it, see `infrastructure/sync-service/README.md` — it has its own `control.sh` for pause/resume. Cloudflare tunnel config lives in `infrastructure/` (`docker-compose.cloudflare.yml`).

### Start / stop

```bash
docker network create backend-net             # first time only
docker compose up -d                          # start everything
docker compose up -d ps-directus ps-database  # CMS only (common for local dev)
docker compose down                           # stop and remove containers
docker compose stop ps-frontend               # stop one service
docker compose restart ps-frontend            # restart one service
docker compose ps                             # status + health of all services
```

### Logs

```bash
docker compose logs -f                    # follow all services
docker compose logs -f ps-frontend       # follow one service
docker compose logs --tail=100 ps-frontend
docker compose logs -t ps-directus       # with timestamps
docker compose logs | grep -i error      # error hunting
```

### Rebuild after code changes

```bash
docker compose build ps-frontend && docker compose up -d ps-frontend
```

> **Env gotcha:** `NEXT_PUBLIC_*` values are baked into the frontend at **build** time (they're passed as build args in `docker-compose.yml`). Changing them requires an image rebuild, not just a restart.

### Database access, backup, restore

```bash
# psql shell
docker exec -it ps-database psql -U "$DB_USER" -d "$DB_NAME"

# Backup
docker exec ps-database pg_dump -U "$DB_USER" "$DB_NAME" > backup.sql

# Restore / import a SQL dump
docker exec -i ps-database psql -U "$DB_USER" -d "$DB_NAME" < backup.sql
```

### Directus data migration

```bash
# Import a SQL dump into the Directus database
docker exec -i ps-database psql -U "$DB_USER" -d "$DB_NAME" < your_migration.sql

# Schema snapshots (versionable schema state)
npx directus schema snapshot ./snapshot.yaml
npx directus schema apply ./snapshot.yaml
```

Directus setup, collections, and the service layer: [DIRECTUS.md](../DIRECTUS.md).

### Debugging containers

```bash
docker exec -it ps-frontend sh                    # shell inside a container
docker exec ps-frontend env | grep NEXT_PUBLIC   # check env inside container
docker inspect ps-frontend                       # full container config
docker stats                                     # resource usage
docker network inspect backend-net               # who's on the network

# Test connectivity between containers (use service names, not localhost)
docker exec ps-frontend ping ps-directus
docker exec ps-frontend curl http://ps-directus:8055/server/info
```

### Docker cleanup

```bash
docker container prune              # remove stopped containers
docker image prune                  # remove dangling images
docker volume prune                 # ⚠️ DESTRUCTIVE — removes unused volumes (databases!)
docker compose down -v              # ⚠️ DESTRUCTIVE — removes this stack's volumes
docker system prune -a --volumes    # ⚠️ DESTRUCTIVE — removes everything unused
```

Back up the database before any command marked destructive.

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
| `sync-env.mjs` / `.sh`  | Sync `.env` against `.env.example`                                                     |
| `migrate-env.py`        | One-time env var rename migration ([ENV_VARIABLES.md](./ENV_VARIABLES.md) § Migration) |
| `dev-server-e2e.js`     | Dev-server wrapper for E2E (filters connection-reset noise)                            |
| `code-health-audit.mjs` | Automated health audit (behind `health:audit`)                                         |

### Key file locations

| File/Directory                      | Purpose                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `app/`                              | Next.js routes, pages, server actions                              |
| `components/`                       | React components                                                   |
| `lib/`                              | Services, config, utilities (server logic here)                    |
| `tests/`                            | Unit/integration tests; `tests/e2e/` for E2E                       |
| `public/`                           | Static assets                                                      |
| `.env` (from `.env.example`)        | Environment variables — see [ENV_VARIABLES.md](./ENV_VARIABLES.md) |
| `next.config.ts`                    | Next.js config, CSP/security headers                               |
| `docker-compose.yml` / `Dockerfile` | Service stack / frontend image                                     |
| `infrastructure/`                   | Cloudflare tunnel, Matomo config, sync service                     |
| `output/`                           | Generated: coverage, Playwright reports                            |
| `logs/`                             | Generated: health-audit reports                                    |

---

## Pre-deployment checklist

Full release gate: [RELEASE_READINESS.md](./RELEASE_READINESS.md). The local short version:

- [ ] `pnpm run validate` passes
- [ ] `pnpm run test:all` passes (unit + E2E)
- [ ] `pnpm run build` succeeds; `pnpm run start` works at http://localhost:3000
- [ ] Bundle size acceptable if dependencies changed (`pnpm run analyze`)
- [ ] Version bumped and CHANGELOG updated (`version:check` enforces this)
- [ ] Env vars configured for the target environment ([ENV_VARIABLES.md](./ENV_VARIABLES.md))

Deployment is via the Docker stack (`docker compose build ps-frontend && docker compose up -d ps-frontend`). If a deploy goes bad, revert the commit (`git revert <hash> && git push`) and rebuild the image from the reverted state.

---

## Troubleshooting

Quick triage table, then recipes below.

| Symptom                           | First moves                                                                                                         |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `validate` fails                  | `pnpm run lint:fix && pnpm run eslint:fix`; fix type errors manually                                                |
| Build broken                      | `pnpm run clean`, then `rm -rf node_modules && pnpm install`, then rebuild                                          |
| Tests fail after refactor         | Search `tests/` for stale mock strings — see [DEVELOPMENT_GUIDELINES.md](../prompting/DEVELOPMENT_GUIDELINES.md) §2 |
| Coverage not generating           | `pnpm list @vitest/coverage-v8`; check `coverage` config in `vitest.config.ts`                                      |
| Container won't start             | `docker compose logs <service>`, `docker compose ps`, then restart/rebuild                                          |
| Containers can't reach each other | `docker network inspect backend-net`; use service names (`ps-directus:8055`), not `localhost`                       |
| Env vars ignored in container     | `NEXT_PUBLIC_*` values are baked at **build** time — rebuild the frontend image                                     |

### Validation fails

```bash
# Run individual checks to isolate the failure
pnpm run type-check   # type errors? fix manually
pnpm run lint         # formatting? → pnpm run lint:fix
pnpm run eslint       # code quality? → pnpm run eslint:fix
pnpm run version:check  # CHANGELOG missing the current version?
```

### Tests fail

```bash
pnpm run test -- --reporter=verbose         # more detail
pnpm run test tests/unit/thing.test.ts      # narrow to one file
```

If failures appeared right after a refactor, the usual culprit is a mock or fixture in `tests/` still referencing the old name/path — grep `tests/` for the old string.

### Build fails

```bash
pnpm run clean
rm -rf node_modules
pnpm install
pnpm run build
# Still failing? Capture the log:
pnpm run build 2>&1 | tee build.log
# Rule out Turbopack:
pnpm run build:webpack
```

### Service won't start (Docker)

```bash
docker compose logs <service>     # 1. read the actual error
docker compose ps                 # 2. check health status of dependencies
docker compose restart <service>  # 3. restart
docker compose build <service> && docker compose up -d <service>  # 4. rebuild
```

Startup order matters: `ps-frontend` waits for `ps-directus` to be healthy, which waits for `ps-database`. If the frontend "won't start", the root cause is often further down the chain — check the database first.

### Database issues

```bash
docker compose logs ps-database
docker compose ps ps-database                             # health status
docker compose restart ps-database
docker exec -it ps-database psql -U "$DB_USER" -d "$DB_NAME"   # poke at it directly
```

Init scripts in `init-db/` only run when the `ps-db-data` volume is **empty** — they will not re-run on restart.

---

## Related documentation

| Topic                  | Doc                                                                 |
| ---------------------- | ------------------------------------------------------------------- |
| Doc & code map         | [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md)                   |
| Repo-specific pitfalls | [DEVELOPMENT_GUIDELINES.md](../prompting/DEVELOPMENT_GUIDELINES.md) |
| Architecture & layout  | [ARCHITECTURE.md](../ARCHITECTURE.md)                               |
| Environment variables  | [ENV_VARIABLES.md](./ENV_VARIABLES.md)                              |
| Directus CMS           | [DIRECTUS.md](../DIRECTUS.md)                                       |
| Testing                | [TESTING_STRATEGY.md](../TESTING_STRATEGY.md)                       |
| Security               | [SECURITY.md](../SECURITY.md)                                       |
| CI                     | [CI_PIPELINE.md](./CI_PIPELINE.md)                                  |
| Release & branches     | [RELEASE_READINESS.md](./RELEASE_READINESS.md)                      |
| Versioning policy      | [VERSIONING.md](./VERSIONING.md)                                    |
| Code health            | [CODE_HEALTH_SCORECARD.md](./CODE_HEALTH_SCORECARD.md)              |
