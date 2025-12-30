# Tests

This directory contains all test files organized by type.

## Structure

```
tests/
├── setup.ts           # Global test setup and mocks for Vitest
├── unit/              # Unit tests for utilities and pure functions
├── components/        # Component tests for React components
├── integration/       # Integration tests for server actions and data flow
├── e2e/               # End-to-end tests (Playwright)
├── mocks/             # Mock data and functions
└── README.md          # This file
```

## Running Tests

```bash
# Run all unit/integration tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with UI
pnpm run test:ui

# Run tests with coverage
pnpm run test:coverage

# Run E2E tests
pnpm run test:e2e
```

## Test Organization

- **Unit tests** (`tests/unit/`): Test individual functions, utilities, and pure logic
  - Example: `tests/unit/utils.test.ts` tests the `cn()` utility function
- **Component tests** (`tests/components/`): Test React components in isolation
  - Example: `tests/components/Button.test.tsx` tests the Button component
- **Integration tests** (`tests/integration/`): Test how multiple units work together
  - Example: Server actions with mocked dependencies, data fetching flows
- **E2E tests** (`tests/e2e/`): Test complete user flows in a real browser environment
  - Example: Full user journeys, navigation, form submissions

## Writing Tests

### Unit Test Example

```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });
});
```

### Component Test Example

```typescript
// tests/components/Button.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/primitives/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
```

## Path Aliases

All tests use the `@/` path alias to import from the project root:

- `@/lib/utils` → `lib/utils.ts`
- `@/components/Button` → `components/Button.tsx`
