# Testing Strategy

How this project tests, what deserves a test, and how to keep the suite honest. E2E-specific practice is included here (this doc absorbed the former `dev/e2e-testing.md`).

Philosophy summary also lives in `.cursor/rules/testing.mdc`; repo-specific mocking pitfalls in [DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §1–2.

---

## Stack (installed and configured)

| Layer              | Tool                                              | Config                                  |
| ------------------ | ------------------------------------------------- | --------------------------------------- |
| Unit / integration | Vitest (+ jsdom)                                  | `vitest.config.ts`                      |
| Component          | React Testing Library + @testing-library/jest-dom | `tests/setup.tsx`                       |
| API mocking        | MSW                                               | `tests/mocks/`                          |
| E2E                | Playwright                                        | `playwright.config.ts`                  |
| Coverage           | @vitest/coverage-v8                               | `vitest.config.ts` → `output/coverage/` |

### Suite layout

```
tests/
├── unit/           # Pure logic: config, services, middleware, transforms
├── components/     # Component behavior (RTL)
├── integration/    # Server actions + service orchestration
├── e2e/            # Playwright specs
├── mocks/          # MSW handlers, shared mock factories
└── setup.tsx       # Global setup (server-only mock, cleanup, next/* mocks)
```

### Commands

```bash
pnpm run test            # Vitest, single run
pnpm run test:watch      # watch mode
pnpm run test:coverage   # coverage → output/coverage/index.html
pnpm run test:e2e        # Playwright (builds + starts app in prod-like mode)
pnpm run test:all        # both
```

---

## Philosophy: requirements, happy path first

Tests should codify **what the system must do**, not how it is implemented today.

**Default:** one clear happy-path test per behavior — "valid submission succeeds", "invalid email rejected". Test user-visible outcomes and public contracts (server actions, API shapes, UI states).

**Add depth only when it earns its keep:**

| Add           | Examples                                                           |
| ------------- | ------------------------------------------------------------------ |
| Edge cases    | Empty input, malformed input, boundary values                      |
| Failure modes | Directus down, partial success (stored but email failed)           |
| Security      | Honeypot, rate limits, auth middleware, session token verification |
| Regression    | A bug that shipped once — comment why the test exists              |

**Avoid:**

- Tests that duplicate TypeScript's job
- Assertions on CSS classes or internal call order
- Coverage-padding tests (`toBeInTheDocument()` with no behavior assertion)
- Testing third-party library internals (React, Next.js, Directus SDK, Framer Motion)

If a small feature change forces widespread test rewrites, the tests were too implementation-specific — refactor toward behavior-level assertions.

---

## What to test here vs not

**Test in this repo:** server actions (`app/actions/`), service layer (`lib/services/`), utilities (`lib/`), component interactions, form validation, middleware routing/auth, data transforms.

**Do not test here:** third-party internals, Docker/infra configuration, the Next.js build system, real external calls (mock Directus with MSW; mock the email service; assert analytics events are _triggered_, not delivered).

### Mocking boundaries

- Mock **external services** (Directus, SMTP), never your own pure utilities.
- Global `server-only` mock lives in `tests/setup.tsx` — required because many core modules import it.
- `lib/config` objects are **frozen**; mock with plain objects using **getters**, never Proxies ([DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §1).
- Directus query modules initialize their client at module load; use `vi.resetModules()` + dynamic imports when testing them (see [DIRECTUS.md](./DIRECTUS.md) § Testing patterns).

---

## E2E practice (Playwright)

### Core principles

- **Zero hard delays.** Use auto-waiting: `await expect(locator).toBeVisible()`, never `page.waitForTimeout()`.
- **Infrastructure over content.** Assert that components render, navigation works, and services interact — not exact copy that changes weekly.
- **Environment agnostic.** Tests must pass with or without `.env` services; the app's empty states are valid outcomes. Mock service responses with `page.route` when determinism matters.
- **Prod-like runtime.** The Playwright `webServer` runs the built app with `RUNTIME_MODE=production` and `APP_MODE=test`, so middleware gating (admin, preview routes) is exercised realistically.

### Browsers

- **Local:** Chromium, Firefox, WebKit (all three before committing cross-browser-sensitive UI).
- **CI:** Chromium only, sharded 4 ways for speed (see [CI_PIPELINE.md](./dev/CI_PIPELINE.md)).

### Lightweight navigation checks

For "site is up and routes resolve" coverage, prefer HTTP status + URL assertions with `waitUntil: "commit"` over DOM-heavy checks, and parameterize route lists in arrays so adding a page is a one-line change.

### Flakiness protocol

1. Reproduce locally: `pnpm exec playwright test tests/e2e/<spec> --repeat-each 20`
2. Inspect traces (`trace: "on-first-retry"`) for timing/race issues
3. Ensure test isolation — no reliance on prior test side effects
4. CI uses `retries: 2` for transient infrastructure noise; failures that survive retries are bugs, not flakes

---

## Coverage policy

- Focus coverage on business logic and critical paths; UI polish code does not need exhaustive coverage.
- Coverage report: `pnpm run test:coverage` → `output/coverage/index.html`.
- No CI threshold today. Open TODOs: add a coverage check to `main`, and 0%-coverage files are a dead-code signal worth investigating.

---

## CI integration

The full pipeline (lint, unit tests, dependency audit, build, sharded E2E) is documented in [CI_PIPELINE.md](./dev/CI_PIPELINE.md). Key policy: E2E always runs on `main`; `dev` merges run no automatic CI (run locally or trigger the manual workflow).

---

## Related documentation

| Topic                       | Doc                                                                |
| --------------------------- | ------------------------------------------------------------------ |
| Mocking pitfalls            | [DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) |
| CI pipeline                 | [dev/CI_PIPELINE.md](./dev/CI_PIPELINE.md)                         |
| Periodic health review      | [dev/CODE_HEALTH_SCORECARD.md](./dev/CODE_HEALTH_SCORECARD.md)     |
| Contact form security tests | [dev/CONTACT_FORM_SECURITY.md](./dev/CONTACT_FORM_SECURITY.md)     |
