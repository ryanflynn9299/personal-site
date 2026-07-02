# CI Pipeline

Reference for the GitHub Actions pipeline. Source of truth for behavior is the workflow files themselves — this doc explains the intent and policy.

| Workflow | File                           | Purpose                                |
| -------- | ------------------------------ | -------------------------------------- |
| CI       | `.github/workflows/ci.yml`     | Lint, tests, audit, build, sharded E2E |
| CodeQL   | `.github/workflows/codeql.yml` | SAST on `main` pushes/PRs + weekly     |

---

## When CI runs

| Trigger                        | Behavior                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------- |
| Push / PR to `main` (`master`) | Full pipeline; E2E always runs; skip patterns are **ignored**                          |
| Merges to `dev`                | **No automatic CI** — merge freely, validate locally                                   |
| Any branch, manually           | Actions → CI → _Run workflow_ (choose branch; `run_e2e` input toggles E2E, default on) |

This matches the branch strategy in [RELEASE_READINESS.md](./RELEASE_READINESS.md): `dev` is a low-friction staging branch; `main` is production and fully gated.

---

## Jobs

Jobs run in parallel after `check-commit-message`, except E2E which needs the build artifact.

| Job                     | What it does                                                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `check-commit-message`  | Parses commit message / PR title+body for skip patterns; detects protected branch                                                         |
| `lint-and-typecheck`    | `pnpm run lint` (Prettier) + `pnpm run eslint` + `pnpm run type-check`                                                                    |
| `dependency-audit`      | `pnpm audit --prod` (fails on **any** severity) + `pnpm audit --audit-level=high` (all deps). **Blocking security gate — do not weaken.** |
| `unit-tests`            | `pnpm run test`; optional Codecov upload (no-op unless `CODECOV_TOKEN` secret exists)                                                     |
| `build`                 | `pnpm run build` with `NODE_ENV=production`; uploads `.next/` artifact                                                                    |
| `e2e-tests` (×4 shards) | Playwright in the official container image, Chromium only, reusing the build artifact                                                     |
| `merge-reports`         | Merges shard blob reports into one HTML Playwright report (30-day artifact)                                                               |

Environment: CI sets `NEXT_PUBLIC_SITE_URL` and leaves Directus URLs empty — the app degrades gracefully without services, and unit/E2E tests treat empty states as valid.

---

## Skip patterns

Case-insensitive tags in the commit message (push) or PR title/description (PRs). **All patterns are ignored on `main`/`master`** — nothing reaches production without the full pipeline.

| Pattern                              | Effect                                 |
| ------------------------------------ | -------------------------------------- |
| `[skip ci]` / `[ci skip]`            | Skip everything                        |
| `[skip lint]` / `[skip type-check]`  | Skip lint & type-check job             |
| `[skip tests]` / `[skip unit-tests]` | Skip unit tests                        |
| `[skip e2e]` / `[skip e2e-tests]`    | Skip E2E (non-protected branches only) |
| `[skip build]`                       | Skip build                             |
| `[run e2e]` / `[e2e]`                | Opt in to E2E where it defaults off    |

Use for docs-only changes; never for code headed to release.

---

## Secrets

None required for the pipeline to pass. Optional: `CODECOV_TOKEN` enables coverage upload. Workflows run with least-privilege `permissions: contents: read` — keep it that way, and never echo secrets in steps (see [SECURITY.md](../SECURITY.md) §3).

---

## Maintenance

- **Action versions:** review `actions/*` and `pnpm/action-setup` pins occasionally; the Playwright container tag must match the installed `@playwright/test` version.
- **Flaky E2E:** follow the protocol in [TESTING_STRATEGY.md](../TESTING_STRATEGY.md) § Flakiness.
- **Audit failures:** a new CVE fails `dependency-audit` — patch via update or same-major `pnpm.overrides`; never silence the gate ([SECURITY.md](../SECURITY.md) §4).
- **Future work (tracked in [TODO.md](./TODO.md)):** CD pipeline, coverage gate on `main`, failure notifications (e.g. Twilio SMS — design doc: [features/TWILIO_SMS_NOTIFICATIONS.md](../features/TWILIO_SMS_NOTIFICATIONS.md)).
