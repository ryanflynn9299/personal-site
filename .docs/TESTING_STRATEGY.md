# Testing Strategy

This document outlines the comprehensive testing strategy for the personal-site project, including test frameworks, test types, CI/CD preparation, and production readiness checks.

## Table of Contents

1. [Test Frameworks & Tools](#test-frameworks--tools)
2. [Test Types & What to Test](#test-types--what-to-test)
3. [What to Test Here vs Elsewhere](#what-to-test-here-vs-elsewhere)
4. [CI/CD Preparation](#cicd-preparation)
5. [Additional Production Checks](#additional-production-checks)
6. [Implementation Roadmap](#implementation-roadmap)

---

## Test Frameworks & Tools

### Recommended Testing Stack

#### 1. **Vitest** (Unit & Integration Tests)
**Why Vitest?**
- ✅ Native ESM support (works great with Next.js 16)
- ✅ Fast execution (powered by Vite)
- ✅ Jest-compatible API (easy migration path)
- ✅ Built-in TypeScript support
- ✅ Excellent Next.js integration
- ✅ Watch mode with instant feedback
- ✅ Coverage reporting built-in

**Installation:**
```bash
npm install -D vitest @vitest/ui @vitest/coverage-v8
```

#### 2. **React Testing Library** (Component Tests)
**Why React Testing Library?**
- ✅ Encourages testing user behavior, not implementation
- ✅ Accessible queries (getByRole, getByLabelText, etc.)
- ✅ Works seamlessly with Vitest
- ✅ Industry standard for React testing

**Installation:**
```bash
npm install -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

#### 3. **Playwright** (E2E Tests)
**Why Playwright?**
- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Built-in auto-waiting and retries
- ✅ Excellent debugging tools
- ✅ Network interception and mocking
- ✅ Screenshot and video recording
- ✅ Better than Cypress for Next.js App Router

**Installation:**
```bash
npm install -D @playwright/test
```

#### 4. **MSW (Mock Service Worker)** (API Mocking)
**Why MSW?**
- ✅ Intercepts requests at the network level
- ✅ Works in both Node.js and browser environments
- ✅ Perfect for mocking Directus API calls
- ✅ Realistic request/response handling

**Installation:**
```bash
npm install -D msw
```

#### 5. **Testing Utilities**
- **@testing-library/jest-dom**: Custom matchers for DOM assertions
- **@vitest/coverage-v8**: Code coverage reporting
- **jsdom**: DOM environment for tests (via Vitest)

---

## Test Types & What to Test

### 1. Unit Tests

**Purpose:** Test individual functions, utilities, and pure logic in isolation.

**What to Test:**
- ✅ Utility functions (`lib/utils.ts`)
- ✅ Data transformation functions
- ✅ Validation logic
- ✅ Error handling functions
- ✅ Type guards and type checking
- ✅ Configuration helpers

**Example Areas:**
```typescript
// lib/utils.ts
- cn() function (class name merging)
- Date formatting utilities
- String manipulation helpers

// lib/directus.ts
- isDirectusConfigured()
- getDirectusUrl()
- classifyDirectusError()
- getAssetURL()

// lib/email-service.ts
- isEmailServiceConfigured()
- Email validation logic

// app/actions/contact.ts
- Form validation logic
- Email regex validation
- Error state generation
```

**Test Structure:**
```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });
  
  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
  });
});
```

### 2. Component Tests

**Purpose:** Test React components in isolation, focusing on user interactions and rendering.

**What to Test:**
- ✅ Component rendering
- ✅ User interactions (clicks, form submissions, typing)
- ✅ Conditional rendering
- ✅ Props handling
- ✅ Event handlers
- ✅ Accessibility (ARIA attributes, keyboard navigation)

**Example Components to Test:**
```typescript
// components/primitives/Button.tsx
- Renders with correct text
- Handles click events
- Applies correct variants/styles
- Disabled state

// components/contact/ContactPageClient.tsx
- Form renders all fields
- Form validation displays errors
- Form submission calls server action
- Success/error states display correctly
- Loading states

// components/blog/PostCard.tsx
- Displays post title, summary, date
- Links to correct post URL
- Handles missing image gracefully
- Displays tags correctly

// components/Header.tsx
- Navigation links render
- Mobile menu toggle works
- Active route highlighting
```

**Test Structure:**
```typescript
// components/Button.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole('button'));
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### 3. Integration Tests

**Purpose:** Test how multiple units work together, including server actions, API calls, and data flow.

**What to Test:**
- ✅ Server Actions with mocked dependencies
- ✅ Directus integration (with MSW mocks)
- ✅ Form submission flow
- ✅ Data fetching and transformation
- ✅ Error handling across layers

**Example Areas:**
```typescript
// app/actions/contact.ts
- Full form submission flow
- Email service integration
- Error handling and state management

// lib/directus.ts
- getPublishedPosts() with mocked API
- getPostBySlug() with mocked API
- Error scenarios (network errors, 404s, etc.)

// Blog page data flow
- Fetching posts from Directus
- Transforming data
- Rendering posts
- Handling empty states
```

**Test Structure:**
```typescript
// app/actions/contact.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitContactForm } from './contact';
import * as emailService from '@/lib/email-service';

vi.mock('@/lib/email-service');

describe('submitContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates required fields', async () => {
    const formData = new FormData();
    formData.set('name', '');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello');

    const result = await submitContactForm(formData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('All fields are required');
  });

  it('validates email format', async () => {
    const formData = new FormData();
    formData.set('name', 'John');
    formData.set('email', 'invalid-email');
    formData.set('message', 'Hello');

    const result = await submitContactForm(formData);
    
    expect(result.success).toBe(false);
    expect(result.error).toBe('Please enter a valid email address');
  });

  it('handles missing email service', async () => {
    vi.mocked(emailService.isEmailServiceConfigured).mockReturnValue(false);
    
    const formData = new FormData();
    formData.set('name', 'John');
    formData.set('email', 'test@example.com');
    formData.set('message', 'Hello');

    const result = await submitContactForm(formData);
    
    expect(result.success).toBe(true);
    expect(result.emailSent).toBe(false);
  });
});
```

### 4. End-to-End (E2E) Tests

**Purpose:** Test complete user flows across the entire application in a real browser environment.

**What to Test:**
- ✅ Critical user journeys
- ✅ Navigation between pages
- ✅ Form submissions end-to-end
- ✅ Blog post reading flow
- ✅ Responsive design (mobile/tablet/desktop)
- ✅ Cross-browser compatibility

**Example E2E Scenarios:**
```typescript
// Critical Paths:
1. Homepage → About → Contact → Submit form
2. Homepage → Blog → Read post → Navigate back
3. Navigation menu works on all pages
4. Mobile menu toggle and navigation
5. Blog search functionality (if implemented)
6. Footer links work correctly
7. 404 page displays for invalid routes
```

**Test Structure:**
```typescript
// e2e/homepage.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('loads and displays main content', async ({ page }) => {
    await page.goto('/');
    
    // Check hero section
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check navigation
    await expect(page.getByRole('link', { name: /about/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /blog/i })).toBeVisible();
  });

  test('navigates to about page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /about/i }).click();
    
    await expect(page).toHaveURL('/about');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('About');
  });
});

// e2e/contact-form.spec.ts
test.describe('Contact Form', () => {
  test('submits form successfully', async ({ page }) => {
    await page.goto('/contact');
    
    await page.getByLabel(/name/i).fill('John Doe');
    await page.getByLabel(/email/i).fill('john@example.com');
    await page.getByLabel(/message/i).fill('Test message');
    
    await page.getByRole('button', { name: /send/i }).click();
    
    // Wait for success message
    await expect(page.getByText(/thank you/i)).toBeVisible({ timeout: 10000 });
  });

  test('displays validation errors', async ({ page }) => {
    await page.goto('/contact');
    
    await page.getByRole('button', { name: /send/i }).click();
    
    await expect(page.getByText(/required/i)).toBeVisible();
  });
});
```

### 5. Visual Regression Tests (Optional)

**Purpose:** Catch unintended visual changes using screenshot comparisons.

**Tools:**
- **Playwright** (built-in screenshot comparison)
- **Percy** or **Chromatic** (cloud-based, recommended for CI)

**What to Test:**
- ✅ Component visual states
- ✅ Page layouts
- ✅ Responsive breakpoints
- ✅ Dark mode (if implemented)

---

## What to Test Here vs Elsewhere

### Test in This Repository

✅ **Application Logic**
- Server Actions (`app/actions/`)
- Utility functions (`lib/`)
- Component behavior and interactions
- Form validation
- Data transformation
- Error handling

✅ **Integration Points**
- Directus API integration (with mocks)
- Email service integration (with mocks)
- Next.js routing and page rendering

✅ **User-Facing Features**
- Component rendering
- User interactions
- Form submissions
- Navigation flows

### Test Elsewhere / Don't Test

❌ **Third-Party Libraries**
- Don't test React, Next.js, or Directus SDK internals
- Don't test Framer Motion, GSAP, or other library functionality
- Trust that these libraries work as documented

❌ **Infrastructure**
- Docker configuration (test in deployment environment)
- CI/CD pipelines (test the pipeline itself, not application code)
- Server configuration (nginx, etc.)

❌ **External Services**
- Don't make real API calls to Directus in tests (use MSW)
- Don't send real emails in tests (mock email service)
- Don't test external analytics (Matomo) - test that events are triggered

❌ **Build System**
- Next.js build process (trust Next.js)
- TypeScript compilation (covered by type-check script)
- Webpack/Turbopack bundling

### Testing Boundaries

**Mock External Dependencies:**
```typescript
// ✅ Mock Directus API calls
vi.mock('@/lib/directus', () => ({
  getPublishedPosts: vi.fn(),
  getPostBySlug: vi.fn(),
}));

// ✅ Mock email service
vi.mock('@/lib/email-service', () => ({
  isEmailServiceConfigured: vi.fn(),
  sendEmail: vi.fn(),
}));

// ✅ Mock environment variables
vi.stubEnv('DIRECTUS_URL_SERVER_SIDE', 'http://localhost:8055');
```

**Don't Mock:**
```typescript
// ❌ Don't mock React hooks (test with real hooks)
// ❌ Don't mock Next.js router (use Next.js testing utilities)
// ❌ Don't mock your own utilities (test them directly)
```

---

## CI/CD Preparation

### 1. Test Scripts in package.json

Add the following scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:all": "npm run test && npm run test:e2e"
  }
}
```

### 2. Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.next', 'out', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/**',
        '.next/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

### 3. Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### 4. Test Setup File

Create `tests/setup.ts`:

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: (props: any) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));
```

### 5. GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run type check
        run: npm run type-check
      
      - name: Run linter
        run: npm run lint
      
      - name: Run ESLint
        run: npm run eslint
      
      - name: Run unit tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install --with-deps
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### 6. Pre-commit Hooks (Optional but Recommended)

Install Husky and lint-staged:

```bash
npm install -D husky lint-staged
```

Create `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

Update `package.json`:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,css,md}": [
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "bash -c 'npm run type-check'"
    ]
  }
}
```

---

## Additional Production Checks

### 1. Code Quality Checks

#### TypeScript Type Checking
```bash
npm run type-check
```
- ✅ Already implemented
- ✅ Should run in CI before tests
- ✅ Catches type errors early

#### ESLint
```bash
npm run eslint
```
- ✅ Already implemented
- ✅ Enforces code quality rules
- ✅ Should fail CI on errors

#### Prettier
```bash
npm run lint  # Check
npm run lint:fix  # Fix
```
- ✅ Already implemented
- ✅ Enforces consistent formatting
- ✅ Should run in pre-commit hooks

### 2. Security Checks

#### npm audit
```json
{
  "scripts": {
    "audit": "npm audit --audit-level=moderate",
    "audit:fix": "npm audit fix"
  }
}
```

#### Snyk (Optional)
```bash
npm install -g snyk
snyk test
```

#### Dependabot / Renovate
- Enable GitHub Dependabot for automatic dependency updates
- Configure Renovate for more control

### 3. Build Verification

#### Build Success Check
```json
{
  "scripts": {
    "build:verify": "npm run build && npm run start & sleep 5 && curl -f http://localhost:3000 || exit 1"
  }
}
```

#### Bundle Size Analysis
```json
{
  "scripts": {
    "analyze": "ANALYZE=true next build"
  }
}
```
- ✅ Already implemented
- ✅ Monitor bundle size in CI
- ✅ Set size limits with `@next/bundle-analyzer`

### 4. File Quality Checks

#### No Console.logs in Production
Add to ESLint config:
```javascript
{
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
  }
}
```

#### No Debugger Statements
```javascript
{
  rules: {
    'no-debugger': 'error',
  }
}
```

#### No TODO Comments (Optional)
```bash
npm install -D eslint-plugin-no-todo
```

#### Check for Large Files
```json
{
  "scripts": {
    "check:large-files": "find . -type f -size +500k ! -path './node_modules/*' ! -path './.next/*' -exec ls -lh {} \\;"
  }
}
```

### 5. Environment Variable Validation

Create `lib/env-validation.ts`:

```typescript
// Validate required environment variables at startup
const requiredEnvVars = {
  // Add required vars here
};

export function validateEnv() {
  const missing: string[] = [];
  
  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!process.env[key] || process.env[key] === value) {
      missing.push(key);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

### 6. Accessibility Checks

#### ESLint Plugin
```bash
npm install -D eslint-plugin-jsx-a11y
```

#### Playwright Accessibility Tests
```typescript
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('homepage is accessible', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page);
});
```

### 7. Performance Checks

#### Lighthouse CI
```bash
npm install -D @lhci/cli
```

Create `lighthouserc.js`:
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      startServerCommand: 'npm run start',
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
};
```

### 8. Database/API Health Checks

#### Directus Health Check
```typescript
// tests/health/directus.test.ts
test('Directus is accessible', async () => {
  const response = await fetch(`${process.env.DIRECTUS_URL}/server/health`);
  expect(response.ok).toBe(true);
});
```

### 9. Docker Build Verification

```json
{
  "scripts": {
    "docker:test": "docker build -t personal-site-test . && docker run --rm personal-site-test npm run validate"
  }
}
```

### 10. Git Hooks & Commit Quality

#### Commit Message Linting
```bash
npm install -D @commitlint/cli @commitlint/config-conventional
```

Create `commitlint.config.js`:
```javascript
module.exports = {
  extends: ['@commitlint/config-conventional'],
};
```

#### Branch Protection Rules (GitHub)
- Require pull request reviews
- Require status checks to pass
- Require branches to be up to date
- Do not allow force pushes
- Require linear history

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
1. ✅ Install testing dependencies
2. ✅ Set up Vitest configuration
3. ✅ Set up Playwright configuration
4. ✅ Create test setup files
5. ✅ Write first unit test (utility function)
6. ✅ Write first component test

### Phase 2: Core Testing (Week 2-3)
1. ✅ Test all utility functions
2. ✅ Test server actions (contact form)
3. ✅ Test Directus integration (with mocks)
4. ✅ Test key components (Button, PostCard, etc.)
5. ✅ Set up MSW for API mocking

### Phase 3: E2E Testing (Week 4)
1. ✅ Write critical path E2E tests
2. ✅ Test form submissions end-to-end
3. ✅ Test navigation flows
4. ✅ Test responsive design

### Phase 4: CI/CD Integration (Week 5)
1. ✅ Set up GitHub Actions workflow
2. ✅ Configure test coverage reporting
3. ✅ Add pre-commit hooks
4. ✅ Set up branch protection rules

### Phase 5: Production Hardening (Week 6)
1. ✅ Add security checks (npm audit)
2. ✅ Add accessibility testing
3. ✅ Add performance monitoring
4. ✅ Add environment variable validation
5. ✅ Document test coverage goals

### Phase 6: Maintenance (Ongoing)
1. ✅ Maintain test coverage above 80%
2. ✅ Update tests when features change
3. ✅ Review and refactor tests quarterly
4. ✅ Monitor test execution time
5. ✅ Keep dependencies updated

---

## Test Coverage Goals

### Minimum Coverage Targets

- **Unit Tests**: 80%+ coverage
- **Component Tests**: 70%+ coverage (focus on user interactions)
- **Integration Tests**: Critical paths only (contact form, blog fetching)
- **E2E Tests**: All critical user journeys

### Coverage Exclusions

- Configuration files
- Type definitions
- Mock data
- Build artifacts
- Third-party library code

---

## Best Practices

### 1. Test Organization
```
tests/
├── unit/           # Unit tests
├── components/     # Component tests
├── integration/    # Integration tests
├── e2e/           # E2E tests
├── mocks/         # Mock data and functions
└── setup.ts       # Test setup file
```

### 2. Naming Conventions
- Test files: `*.test.ts` or `*.spec.ts`
- Test descriptions: Use descriptive names
- Group related tests with `describe` blocks

### 3. Test Data
- Use factories for test data
- Keep test data close to tests
- Use MSW handlers for API mocks

### 4. Test Maintenance
- Update tests when features change
- Remove obsolete tests
- Refactor tests for clarity
- Keep tests fast (< 5 seconds for unit tests)

### 5. Debugging Tests
- Use `test.only()` to run single test
- Use `console.log` in tests (it's okay!)
- Use Playwright's `--debug` mode
- Use Vitest's `--ui` mode for interactive testing

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Playwright Documentation](https://playwright.dev/)
- [MSW Documentation](https://mswjs.io/)
- [Next.js Testing Guide](https://nextjs.org/docs/app/building-your-application/testing)

---

## Questions or Issues?

If you encounter issues with testing setup or have questions about the strategy, please:
1. Check the framework documentation
2. Review existing test examples
3. Consult the team (if applicable)
4. Update this document with solutions

---

**Last Updated:** 2025-01-27
**Maintained By:** Development Team

