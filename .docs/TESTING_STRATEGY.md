# Testing Strategy

How this project tests, what deserves a test, how to write a new one of each type, and how to keep the suite honest. E2E-specific practice lives here too — this doc absorbed the former `dev/e2e-testing.md`.

The philosophy summary also lives in `.cursor/rules/testing.mdc` (Cursor rule form). Repo-specific mocking pitfalls are documented in [DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §1–2; this doc references them rather than duplicating them.

---

## 1. Stack and layout

All tools below are installed and configured — nothing here is aspirational.

| Layer              | Tool                                              | Config                                  |
| ------------------ | ------------------------------------------------- | --------------------------------------- |
| Unit / integration | Vitest (+ jsdom)                                  | `vitest.config.ts`                      |
| Component          | React Testing Library + @testing-library/jest-dom | `tests/setup.tsx`                       |
| API mocking        | MSW (`msw/node` in Vitest)                        | `tests/mocks/`                          |
| E2E                | Playwright                                        | `playwright.config.ts`                  |
| Coverage           | @vitest/coverage-v8                               | `vitest.config.ts` → `output/coverage/` |

### Suite layout

```
tests/
├── unit/           # Pure logic: config, services, middleware, transforms, security helpers
├── components/     # Component behavior (React Testing Library)
├── integration/    # Server actions + service orchestration across layers
├── e2e/            # Playwright specs (excluded from Vitest via config)
├── mocks/          # MSW handlers + shared mock factories (see §7)
├── setup.tsx       # Global Vitest setup: server-only mock, MSW lifecycle, next/* mocks
└── README.md       # Quick orientation for the tests directory
```

Vitest picks up `tests/**/*.{test,spec}.*` and excludes `tests/e2e`; Playwright's `testDir` is `tests/e2e`. Keep that separation — a `.spec.ts` in the wrong directory will be picked up by the wrong runner.

### Commands

Always pnpm, never npm:

```bash
pnpm run test            # Vitest, single run (unit + component + integration)
pnpm run test:watch      # Vitest watch mode
pnpm run test:ui         # Vitest interactive UI
pnpm run test:coverage   # coverage → output/coverage/index.html
pnpm run test:e2e        # Playwright (locally: builds + starts app first)
pnpm run test:e2e:ui     # Playwright interactive UI mode
pnpm run test:e2e:debug  # Playwright inspector / step-through
pnpm run test:all        # Vitest run, then Playwright
```

Definition of done for any change: `pnpm run validate` **and** `pnpm run test` pass. Run E2E when you touched routes, navigation, middleware, or user flows.

### Runtime modes and tests

The app resolves a `RUNTIME_MODE` of `production | live-dev | offline-dev | test` (`lib/config/schemas.ts`), and much test behavior hinges on it:

- **Vitest** runs with `RUNTIME_MODE=test` (set in `tests/setup.tsx`): services are disabled, so the default path under test is graceful degradation. Tests that need the "connected" path stub `RUNTIME_MODE=live-dev` and re-import modules (§6).
- **Playwright** runs the built app with `RUNTIME_MODE=production` + `APP_MODE=test`: production middleware behavior, but no real service connections.

If a test asserts service-dependent behavior, be explicit about which mode it runs in — a test that accidentally runs in `test` mode will see services disabled and pass or fail for the wrong reason.

---

## 2. Philosophy: requirements first, happy path first

Tests codify **what the system must do**, not how it happens to be implemented today.

**Default:** one clear happy-path test per behavior — "valid submission succeeds", "invalid email rejected", "published posts render". Test user-visible outcomes and public contracts: server actions, API shapes, UI states, route behavior.

**Add depth only when it earns its keep:**

| Add           | When / examples                                                                 |
| ------------- | ------------------------------------------------------------------------------- |
| Edge cases    | Empty input, malformed input, boundary values that a user can actually produce  |
| Failure modes | Directus unreachable; partial success (message stored but email failed to send) |
| Security      | Honeypot fields, rate limiting, auth middleware, session token verification     |
| Regression    | A bug that shipped once — add a test with a one-line comment saying why         |

**No test theater.** Avoid:

- Tests that duplicate TypeScript's job (asserting a typed value has its type)
- Assertions on CSS classes, internal call order, or private implementation details
- Coverage-padding tests — a bare `toBeInTheDocument()` with no behavior assertion
- Testing third-party internals (React, Next.js, Directus SDK, Framer Motion, MSW itself)

**Maintenance signal:** if a small feature change forces widespread test rewrites, the tests were too implementation-specific. Refactor toward behavior-level assertions instead of patching each one.

---

## 3. What to test here vs not

**Test in this repo:**

- Server actions (`app/actions/`) — validation, protection, orchestration
- Service layer (`lib/services/`) — Directus queries, email sending, protection logic
- Utilities and pure logic (`lib/`) — transforms, formatters, SEO helpers, config resolution
- Component interactions — rendering, clicks, form state, conditional UI
- Middleware — routing, admin gating, auth behavior
- Complete user flows in the browser (E2E)

**Do not test here:**

- Third-party library internals — trust them or replace them
- Docker/infra configuration and the Next.js build system
- Real external calls — mock Directus with MSW, mock the email transport, and assert analytics events are _triggered_, never delivered
- `components/archived/` — reference code, off-limits to tests and refactors alike ([DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §6)

---

## 4. Unit tests (`tests/unit/`)

**Scope:** individual functions and modules in isolation — config helpers, Directus error classification and transforms, email service checks, middleware logic, session tokens, rate-limit/honeypot protection, SEO and sitemap generation, formatters.

**Conventions:**

- One file per module under test, named after it: `tests/unit/session-token.test.ts` tests `lib/auth/session-token.ts`.
- Import via the `@/` alias (`@/lib/utils`), never relative paths out of `tests/`.
- Vitest globals are enabled, but existing tests import `describe/it/expect/vi` explicitly — match that.

**Writing a new unit test:**

1. **Pure functions** (transforms, formatters, error classifiers): import directly and assert input → output. No mocking.
2. **Modules with config or environment dependence:** use `vi.stubEnv()` to set env vars, `vi.resetModules()` + dynamic `await import(...)` to re-evaluate module-load-time state, and `vi.unstubAllEnvs()` in `afterEach`. This is required for anything touching `lib/config` or the Directus client, because those resolve at module load.
3. **Modules that log:** mock the logger so test output stays clean. Use the shared factory:

   ```typescript
   import { loggerModuleMock } from "../mocks/logger";
   vi.mock("@/lib/dev-tooling/logger", () => loggerModuleMock);
   ```

**Repo-specific pitfalls** (full detail in [DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §1):

- `lib/config` objects are **frozen**. Never mock them with a Proxy — JS Proxy invariants break on frozen properties. Use plain objects with **getters**, or better, the shared factories in `tests/mocks/config.ts` (§7).
- Many modules import `server-only`, which throws outside Next.js. The global mock in `tests/setup.tsx` handles this — never add per-file `server-only` mocks.
- Modules exposing helpers like `isDirectusConfigured()` read internal frozen state; mock the helper explicitly in your factory, not just the variables it reads.

---

## 5. Component tests (`tests/components/`)

**Scope:** React component behavior — rendering with props, user interactions, conditional UI, form states, accessibility roles. Client components primarily; server components are usually better covered by unit tests of their data logic plus E2E of the rendered route.

**Conventions:**

- `tests/components/<ComponentName>.test.tsx`, one component per file.
- Query by role, label, or visible text (`getByRole`, `getByLabelText`, `getByText`) — the same accessible queries a user relies on. Avoid `container.querySelector` and class-name assertions.
- Simulate interaction with `@testing-library/user-event`, not raw `fireEvent`, for anything beyond trivial cases.

**What `tests/setup.tsx` already gives you** (do not re-mock these per file):

- `server-only` globally stubbed
- `next/navigation` (`useRouter`, `usePathname`, `useSearchParams`) mocked with no-op functions
- `next/image` → plain `<img>`; `next/link` → plain `<a>`
- RTL `cleanup()` after every test
- MSW server listening with `onUnhandledRequest: "error"` — an unmocked network call **fails the test**, by design

**Writing a new component test:** render with realistic props, assert the user-visible outcome (text appears, button disables, error message shows). If the component calls a server action, mock the action module with `vi.mock` and assert it was called with the expected payload — don't re-test the action's internals here; that's integration territory.

**Avoid:** snapshot tests (none exist; they assert implementation, not requirements), asserting Tailwind classes, and mocking React hooks.

---

## 6. Integration tests (`tests/integration/`)

**Scope:** multiple units working together across a boundary — a server action through validation, protection, storage, and email; the Directus service layer with the SDK mocked; graceful degradation when services are unconfigured.

**Conventions:** `tests/integration/<flow>.test.ts`, e.g. `contact-action.test.ts`, `directus.test.ts`.

**Writing a new integration test:**

1. Decide the boundary: mock the **external edge** (Directus SDK, SMTP transport, network via MSW) and run everything inside that edge for real.
2. Control runtime mode via env: `vi.stubEnv("RUNTIME_MODE", "test")` (services disabled — verifies graceful degradation) or `"live-dev"` (services enabled — verifies the connected path against mocks).
3. Because service clients initialize at module load, follow the reset pattern: stub envs → `vi.resetModules()` → dynamic `await import(...)` inside the test. See [DIRECTUS.md](./DIRECTUS.md) § Testing patterns.
4. Assert the **contract**: the returned action state, the stored payload, the classified error — not internal call sequences.

Integration tests are where "partial success" branches live (e.g. contact message stored but email failed). Those are documented product behaviors and deserve explicit tests; see [dev/CONTACT_FORM_SECURITY.md](./dev/CONTACT_FORM_SECURITY.md) for the security-relevant set.

---

## 7. Mocking strategy

**Boundary rule:** mock **external services** (Directus, SMTP, analytics), never your own pure utilities. If you're mocking your own transform function, the test is checking the mock.

**Mock at the network level with MSW when possible.** MSW intercepts real `fetch` calls, so the entire request-building path in your code runs for real. Reserve `vi.mock` for module-level concerns (SDK clients, loggers, config).

### Shared mock inventory (`tests/mocks/`)

| File          | Provides                                                                                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handlers.ts` | MSW request handlers for the Directus API (`*/items/blogs` etc.) with canned fixtures                                                                                 |
| `server.ts`   | `setupServer(...handlers)` for Node — wired into `tests/setup.tsx` lifecycle                                                                                          |
| `browser.ts`  | `setupWorker(...handlers)` for browser contexts, if ever needed                                                                                                       |
| `config.ts`   | `createDynamicConfigMock()` / `createDynamicServerConfigMock()` — getter-based mocks of `@/lib/config` and `@/lib/config/server` that resolve env vars at access time |
| `logger.ts`   | `createMockLogger()` / `loggerModuleMock` for silencing `@/lib/dev-tooling/logger`                                                                                    |

**Use the factories.** For config, prefer:

```typescript
import { createDynamicConfigMock } from "../mocks/config";
vi.mock("@/lib/config", async () => createDynamicConfigMock());
```

over hand-rolling a mock — the factories already handle the frozen-object/getter problem, runtime-mode resolution, and `isDirectusConfigured` consistency.

**Per-test MSW overrides:** add or override handlers inside a test with `server.use(...)`; `tests/setup.tsx` resets handlers after each test, so overrides never leak. New shared Directus fixtures belong in `handlers.ts`; one-off responses belong in the test file.

**Don't mock:** React hooks, `next/*` beyond what `setup.tsx` provides, or your own pure functions. **Don't** use `as any` to force a mock's shape — type it properly or add the documented eslint suppression ([DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §1).

**When refactoring:** mocks contain hardcoded strings (module paths, env var names) that rename tools miss. After renaming anything, grep `tests/` for the old name ([DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) §2).

---

## 8. E2E practice (Playwright)

This section is the single source of truth for E2E practice (it replaced `dev/e2e-testing.md`).

### Runtime model

`pnpm run test:e2e` is fully self-contained: the Playwright `webServer` builds (locally) and starts the app, and the process exits with the right status code. Key properties of the test server (see `playwright.config.ts`):

- **Prod-like:** `RUNTIME_MODE=production`, `NODE_ENV=production` — middleware gating (admin routes, preview features) behaves as in production.
- **Services disabled:** `APP_MODE=test` — the app runs without Directus/SMTP, exercising empty states and graceful degradation.
- **Dev chrome hidden:** `PLAYWRIGHT_TEST` / `NEXT_PUBLIC_PLAYWRIGHT_TEST` hide DevControls so they can't interfere with selectors.
- **Local reuse:** locally the server is reused if already running (`reuseExistingServer`); in CI it never is, and CI starts from a downloaded `.next` build artifact (`pnpm run start` only).

### Current suite

The specs in `tests/e2e/` map to routes and cross-cutting concerns; new specs should follow the same one-file-per-route-or-concern shape:

- **Route specs** — `homepage`, `about`, `blog`, `contact`, `projects-cabinet`, `quotes`, `vitae`, `policies`: page renders, key interactions, empty-state behavior without services.
- **`navigation.spec.ts`** — parameterized route-list reachability checks (see "Lightweight navigation checks" below).
- **`error-pages.spec.ts`** — 404 and error handling.
- **`accessibility.spec.ts`** — cross-page a11y invariants: exactly one `h1` per page, accessible navigation landmark, no generic link text, `alt` present on all images. When adding a public page, add it to this spec's page list.

### Projects and browsers

- **Local:** Chromium, Firefox, and WebKit projects all run. Run all three before committing UI changes that could be cross-browser sensitive.
- **CI:** Chromium only (the other projects are excluded when `CI` is set), sharded 4 ways.

### Core principles

1. **Zero hard delays.** Use auto-waiting assertions: `await expect(locator).toBeVisible()`. Never `page.waitForTimeout()` — it is both slow and flaky.
2. **User-facing selectors.** Prefer `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText` — the same accessibility-first policy as component tests. No CSS/XPath selectors tied to markup structure; `data-testid` is a last resort for elements with no accessible identity.
3. **Infrastructure over content.** Assert that components render, navigation works, and services interact — not exact marketing copy that changes weekly. `getByRole("heading", { level: 1 })` beats matching a full headline string.
4. **Environment agnostic.** Tests must pass with or without `.env` services configured. The app's empty states are valid, assertable outcomes. When a test needs deterministic data, intercept at the browser edge:

   ```typescript
   await page.route("**/items/blogs*", (route) =>
     route.fulfill({ json: [{ id: "1", title: "Test Post" }] })
   );
   ```

5. **Test isolation.** No test may depend on a prior test's side effects. Use `beforeEach` for state; every spec must pass alone and in any shard.

### Lightweight navigation checks

For "site is up and routes resolve" coverage, prefer HTTP status + URL assertions with `page.goto(url, { waitUntil: "commit" })` over DOM-heavy checks — resolves at server response, skipping hydration. Parameterize route lists in arrays (e.g. a `PRIMARY_ROUTES` constant) so adding a page is a one-line change. See `tests/e2e/navigation.spec.ts`.

### When does a flow deserve an E2E test?

E2E tests are the most expensive to run and maintain. Add one when:

- The behavior spans **middleware + route + client interaction** (admin gating, redirects, error pages) — nothing below E2E exercises that stack together.
- It's a **critical user journey**: landing → navigate → contact form submission; blog list → post; 404 handling.
- The behavior depends on the **production build** (route blocking, headers, hydration).

Don't add one when a unit or integration test covers the same requirement — validation logic belongs in the action's integration test; the E2E only needs to prove the form wires up to it (e.g. HTML5 validation blocks empty submission). One E2E per journey, not per input permutation.

### Flakiness protocol

1. Reproduce locally: `pnpm exec playwright test tests/e2e/<spec> --repeat-each 20`
2. Inspect traces (`trace: "on-first-retry"`) for timing issues, race conditions, or intermittent service behavior.
3. Verify isolation — no reliance on prior test side effects or shared server state.
4. CI uses `retries: 2` for transient infrastructure noise only. A failure that survives retries is a bug, not a flake — fix it, don't bump retries.

### Debugging failed runs

- **Local:** HTML report at `output/playwright-report/` (open with `pnpm exec playwright show-report output/playwright-report`); traces and screenshots in `output/test-results/`. Use `pnpm run test:e2e:debug` for step-through or `test:e2e:ui` for interactive mode.
- **CI:** each shard uploads a blob report; the `merge-reports` job merges them into a single `playwright-report` artifact (30-day retention) downloadable from the workflow run. Failure annotations also appear inline via the `github` reporter.
- **Simulate CI locally:** `CI=true pnpm run test:e2e` (Chromium only, no server reuse, retries on).

---

## 9. Coverage policy

- Run: `pnpm run test:coverage` → HTML report at `output/coverage/index.html` (plus text and JSON reporters).
- **Focus coverage on business logic and critical paths** — services, actions, middleware, transforms. UI polish code does not need exhaustive line coverage, and no test should exist purely to move the number.
- Config files, type declarations, `tests/`, and E2E specs are excluded (see `vitest.config.ts`).
- **No CI threshold today.** The unit-tests job uploads to Codecov when a token is configured, but nothing fails on coverage. Open TODOs: add a coverage check on `main`; treat 0%-coverage files as a dead-code signal worth investigating, not a prompt to write filler tests.

---

## 10. CI integration

Full pipeline documentation: [dev/CI_PIPELINE.md](./dev/CI_PIPELINE.md). The testing-relevant shape of `.github/workflows/ci.yml`:

| Job                  | Runs                                                        | Notes                                               |
| -------------------- | ----------------------------------------------------------- | --------------------------------------------------- |
| `lint-and-typecheck` | Prettier check, ESLint, `tsc`                               | Skippable via `[skip lint]` off protected branches  |
| `unit-tests`         | `pnpm run test` (all Vitest suites)                         | Skippable via `[skip tests]` off protected branches |
| `dependency-audit`   | `pnpm audit` (prod: any severity; all deps: high+)          | Blocking security gate                              |
| `build`              | `pnpm run build`, uploads `.next/` artifact                 | E2E depends on this artifact                        |
| `e2e-tests`          | `pnpm run test:e2e --shard=N/4` in the Playwright container | 4 shards, Chromium only, reuses the build artifact  |
| `merge-reports`      | Merges shard blob reports into one HTML report artifact     | 30-day retention                                    |

Policy essentials:

- CI triggers on push/PR to `main`/`master` and manual `workflow_dispatch`. **`dev` merges run no automatic CI** — run the suite locally or trigger the manual workflow.
- **Skip patterns (`[skip ci]`, `[skip tests]`, `[skip e2e]`, …) are ignored on protected branches.** Nothing reaches `main` without the full pipeline, E2E included.
- CI runs with empty Directus URLs — the suite must pass with no services, which is exactly what the environment-agnostic E2E principle guarantees.

---

## 11. Checklist: adding tests with a feature

1. Identify the **requirement** the feature must satisfy; write the happy-path test at the lowest level that can prove it (unit → component → integration → E2E).
2. Reach for shared infrastructure first: `tests/setup.tsx` globals, `tests/mocks/` factories and MSW handlers.
3. Add depth (edge/failure/security/regression) only per the §2 criteria — comment regression tests with why they exist.
4. If you touched routes, middleware, or a user flow: run `pnpm run test:e2e` locally (all three browsers).
5. `pnpm run validate` && `pnpm run test` green before done.
6. If testing behavior or policy changed, update this doc in the same change.

---

## Related documentation

| Topic                                                        | Doc                                                                          |
| ------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| Mocking pitfalls (frozen config, `server-only`, stale mocks) | [prompting/DEVELOPMENT_GUIDELINES.md](./prompting/DEVELOPMENT_GUIDELINES.md) |
| Directus service testing patterns                            | [DIRECTUS.md](./DIRECTUS.md)                                                 |
| CI pipeline detail                                           | [dev/CI_PIPELINE.md](./dev/CI_PIPELINE.md)                                   |
| Contact form security test set                               | [dev/CONTACT_FORM_SECURITY.md](./dev/CONTACT_FORM_SECURITY.md)               |
| Periodic health review                                       | [dev/CODE_HEALTH_SCORECARD.md](./dev/CODE_HEALTH_SCORECARD.md)               |
| Testing policy (Cursor rule)                                 | `.cursor/rules/testing.mdc`                                                  |
