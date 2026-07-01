# Development Quality & Prompting Standards

This document serves as the single source of truth for maintainers and AI assistants working on the Personal Site project. Its intent is to ensure all code generation remains extremely high quality, following established patterns and avoiding common pitfalls encountered during systemic refactors.

**Policy and pushback rules:** [.docs/prompting/AI_GUARDRAILS.md](./AI_GUARDRAILS.md)  
**Doc map:** [.docs/prompting/PROJECT_INDEX.md](./PROJECT_INDEX.md)  
**Cursor rules:** `.cursor/rules/*.mdc`

## 1. Testing & Mocking Strategy

### Avoid Proxies on Frozen Objects

The configuration system (`lib/config`) uses `Object.freeze()` for runtime safety. JavaScript Proxies cannot change return values for non-configurable, read-only properties.

- **Mistake**: Using a `Proxy` to intercept `config` or `serverConfig` properties.
- **Guidance**: Use **Plain Objects with Getters** in your mocks. This allows dynamic resolution of environment variables without violating Proxy invariants.
  ```typescript
  vi.mock("@/lib/config", async () => {
    const actual = await vi.importActual("@/lib/config");
    return {
      ...actual,
      config: {
        ...actual.config,
        get runtimeMode() {
          return process.env.RUNTIME_MODE;
        },
      },
      runtime: {
        get mode() {
          return process.env.RUNTIME_MODE;
        },
      },
    };
  });
  ```

### Handling `server-only`

Many core modules use the `server-only` package. Vitest/JSDOM environments will crash when importing these.

- **Guidance**: Ensure `tests/setup.tsx` contains a global mock for `server-only` to bypass environment checks during unit tests.

### Type Safety in Mocks

- **Mistake**: Using `as any` in mocks, which triggers `@typescript-eslint/no-explicit-any`.
- **Guidance**: Use proper type casting or, if `any` is truly necessary for a complex mock, include the lint suppression: `// eslint-disable-next-line @typescript-eslint/no-explicit-any`.

## 2. Refactoring & System Sync

### Stale Test Mocks

When renaming environment variables or moving files, the test suite is the first thing to break.

- **Guidance**: Perform a global search for the old string (e.g., `APP_MODE` or `@/lib/logger`) specifically within the `tests/` directory. Mocks are often hardcoded strings that refactoring tools might miss.

### Internal Module Helpers

- **Mistake**: Mocking a module's variables but not its exported helper functions.
- **Guidance**: If a module contains functions like `isDirectusConfigured()` that rely on internal frozen variables, you must mock those functions explicitly in your test factory so they use the mocked state.

## 3. Linting & Code Style

### Explicit Logic Blocks

- **Mistake**: Using one-line `if` statements without curly braces.
- **Guidance**: Always use curly braces `{}` for `if`, `else`, `for`, and `while` loops. This complies with the `curly` lint rule and prevents logical errors during future edits.

### Clean Imports

- **Mistake**: Leaving behind unused imports like `config` or `LucideIcon` variants after logic changes.
- **Guidance**: Prioritize cleaning up the import block of every file you touch. Run `pnpm run validate` or `eslint .` frequently to catch these before submission.

## 4. Service Layer Isolation (Leaking `server-only`)

Next.js will crash the build if a Client Component imports a module that eventually pulls in `server-only` code (e.g., secrets or internal APIs).

- **Mistake**: A Client Component (like `DevModeIndicator`) importing a utility like `isDirectusConfigured` from the same file that initializes the `directusClient` singleton.
- **Guidance**: Keep "client-safe" configuration checks in `@/lib/config`. **NEVER** import from `@/lib/services/*` inside a file marked with `"use client"`.

## 5. Verification Workflow

Always run the full validation suite locally before considering a task complete:

1. `pnpm run type-check`: Ensure no regressions in TypeScript types.
2. `pnpm run lint:fix`: Auto-format and fix basic style issues.
3. `pnpm run test`: Verify all 270+ tests pass.
4. `pnpm run validate`: The final check for linting and formatting.

## 6. E2E Testing & Project Hygiene

### Lightweight Navigation Testing

To ensure the site is "up and reachable" without the flakiness of DOM-heavy assertions:

- **Guidance**: Use HTTP status code checks (`200 OK`) and URL pattern matching for core navigation tests.
- **Performance**: Use `waitUntil: 'commit'` in `page.goto()` to resolve immediately after the server response, skipping heavy asset hydration.
- **Maintenance**: Parameterize route lists in arrays. Adding a new top-level page should require only a one-line addition to a `PRIMARY_ROUTES` constant.

### Root Directory Hygiene

A cluttered project root slows down developer onboarding and AI context processing.

- **Guidance**: Only essential tool configurations (`package.json`, `next.config.ts`, `tsconfig.json`, etc.) belong at the root.
- **Action**:
  - Move failure/debug logs to `logs/`.
  - Move non-standard or provider-specific configs (e.g., Cloudflare-specific docker files) to `infrastructure/`.
  - Content docs belong in `.docs/`.
  - Ensure build artifacts like `*.tsbuildinfo` are explicitly gitignored.
