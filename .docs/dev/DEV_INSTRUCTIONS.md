# Developer Onboarding & Development Guide

> **Purpose**: Complete guide for onboarding new developers and understanding all development tools, procedures, and workflows used in this project.  
> **Last Updated**: 2025-01-XX  
> **Audience**: New developers, future-you, team members

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Development Tools Overview](#development-tools-overview)
3. [Linting & Code Quality](#linting--code-quality)
4. [Testing](#testing)
5. [Code Coverage](#code-coverage)
6. [Bundle Size Analysis](#bundle-size-analysis)
7. [Promotion & Deployment](#promotion--deployment)
8. [Command Cheatsheet Reference](#command-cheatsheet-reference)
9. [Additional Documentation](#additional-documentation)

---

## Quick Start

### Prerequisites

- **Node.js**: v20+ (check with `node --version`)
- **pnpm**: v10.0.0+ (check with `pnpm --version`)
- **Git**: Latest version
- **Docker** (optional): For running services locally

### Initial Setup

```bash
# 1. Clone the repository
git clone <repository-url>
cd personal-site

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env.local  # If available
# Edit .env.local with your configuration

# 4. Start development server
pnpm run dev

# 5. Open browser
# http://localhost:3000
```

### First Day Checklist

- [ ] Run `pnpm install` successfully
- [ ] Run `pnpm run dev` and see the site
- [ ] Run `pnpm run validate` (should pass)
- [ ] Run `pnpm run test` (should pass)
- [ ] Review [Command Cheatsheet](../COMMANDS_CHEATSHEET.md)
- [ ] Read relevant sections of this document

---

## Development Tools Overview

This project uses a comprehensive set of tools for code quality, testing, and optimization:

| Tool                      | Purpose            | Configuration File              |
| ------------------------- | ------------------ | ------------------------------- |
| **TypeScript**            | Type checking      | `tsconfig.json`                 |
| **ESLint**                | Code quality rules | `eslint.config.mjs`             |
| **Prettier**              | Code formatting    | `.prettierrc` (or package.json) |
| **Vitest**                | Unit testing       | `vitest.config.ts`              |
| **Playwright**            | E2E testing        | `playwright.config.ts`          |
| **@vitest/coverage-v8**   | Code coverage      | `vitest.config.ts`              |
| **@next/bundle-analyzer** | Bundle analysis    | `next.config.ts`                |

---

## Linting & Code Quality

### Overview

This project uses a **two-tier linting system**:

1. **Prettier** - Code formatting (spacing, quotes, semicolons, etc.)
2. **ESLint** - Code quality rules (best practices, potential bugs, etc.)

### Prettier (Formatting)

**Purpose**: Ensures consistent code formatting across the codebase.

**Configuration**: Formatting rules are defined in `package.json` or `.prettierrc`.

**Commands**:

```bash
# Check formatting (no changes)
pnpm run lint
# or
pnpm run format:check

# Auto-fix formatting issues
pnpm run lint:fix
# or
pnpm run format
```

**When to Use**:

- Before committing code
- When code review requests formatting fixes
- As part of pre-commit hooks

**What It Checks**:

- Indentation (spaces/tabs)
- Quote style (single/double)
- Semicolon usage
- Line length
- Trailing commas
- File extensions: `.js`, `.jsx`, `.ts`, `.tsx`, `.json`, `.css`, `.scss`, `.md`, `.mdx`

### ESLint (Code Quality)

**Purpose**: Enforces code quality rules and catches potential bugs.

**Configuration**: `eslint.config.mjs`

**Commands**:

```bash
# Check for ESLint issues
pnpm run eslint

# Auto-fix ESLint issues (when possible)
pnpm run eslint:fix
```

**When to Use**:

- Before committing code
- When investigating code quality issues
- As part of CI/CD pipeline

**What It Checks**:

- TypeScript best practices
- React best practices
- Next.js best practices
- Unused variables
- Potential bugs
- Code complexity

**Configuration Highlights**:

- Uses TypeScript ESLint parser
- Includes React and React Hooks plugins
- Includes Next.js plugin
- Ignores build artifacts (`.next/`, `out/`, `node_modules/`)

### TypeScript Type Checking

**Purpose**: Validates TypeScript types without building.

**Commands**:

```bash
# Check types
pnpm run type-check
```

**When to Use**:

- Before committing code
- When IDE doesn't catch type errors
- As part of CI/CD pipeline

**Configuration**: `tsconfig.json`

### Validation Workflow

**Complete Validation** (runs all checks):

```bash
pnpm run validate
```

This command runs:

1. TypeScript type checking (`type-check`)
2. Prettier formatting check (`lint`)
3. ESLint code quality check (`eslint`)

**Recommended Workflow**:

```bash
# 1. Make code changes

# 2. Run validation
pnpm run validate

# 3. If validation fails, fix issues:
pnpm run lint:fix      # Fix formatting
pnpm run eslint:fix    # Fix code quality
pnpm run type-check     # Check types (fix manually)

# 4. Re-run validation
pnpm run validate

# 5. Commit when validation passes
git add .
git commit -m "Your message"
```

### Pre-commit Hooks

The `prepare` script in `package.json` reminds you to run validation:

```json
"prepare": "echo 'Run pnpm run validate before committing'"
```

**Best Practice**: Run `pnpm run validate` before every commit, or set up a pre-commit hook (see [Future Enhancements](#future-enhancements)).

---

## Testing

### Overview

This project uses a **two-tier testing strategy**:

1. **Unit Tests** (Vitest) - Fast, isolated component/utility tests
2. **E2E Tests** (Playwright) - Full browser integration tests

### Unit Testing with Vitest

**Purpose**: Test individual components, utilities, and functions in isolation.

**Configuration**: `vitest.config.ts`

**Test Location**: `tests/` directory

- `tests/components/` - Component tests
- `tests/unit/` - Utility function tests
- `tests/integration/` - Integration tests

**Commands**:

```bash
# Run all unit tests once
pnpm run test

# Run tests in watch mode (auto-rerun on changes)
pnpm run test:watch

# Run tests with UI (interactive)
pnpm run test:ui

# Run tests with coverage
pnpm run test:coverage
```

**When to Use**:

- When writing new components or utilities
- Before committing code
- When debugging specific functionality
- As part of CI/CD pipeline

**Test Structure**:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**Setup File**: `tests/setup.tsx` - Configures testing environment, mocks, and global test utilities.

### E2E Testing with Playwright

**Purpose**: Test full user workflows in real browsers.

**Configuration**: `playwright.config.ts`

**Test Location**: `tests/e2e/` directory

**Commands**:

```bash
# Run all E2E tests
pnpm run test:e2e

# Run E2E tests with UI (interactive)
pnpm run test:e2e:ui

# Run E2E tests in debug mode
pnpm run test:e2e:debug
```

**When to Use**:

- When testing complete user flows
- Before major releases
- When verifying critical functionality
- As part of CI/CD pipeline

**Browsers Tested**:

- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

**Test Reports**: Generated in `output/playwright-report/` (HTML format)

### Running All Tests

```bash
# Run both unit and E2E tests
pnpm run test:all
```

**Recommended Workflow**:

```bash
# 1. Write/update tests
# Edit files in tests/

# 2. Run unit tests in watch mode
pnpm run test:watch

# 3. Run E2E tests when ready
pnpm run test:e2e

# 4. Run all tests before committing
pnpm run test:all
```

---

## Code Coverage

### Overview

Code coverage measures how much of your codebase is executed by tests. This helps identify untested code and ensures test quality.

**Tool**: `@vitest/coverage-v8` (V8 coverage provider)

**Configuration**: `vitest.config.ts`

### Running Coverage

```bash
# Generate coverage report
pnpm run test:coverage
```

**Output Location**: `output/coverage/`

**Report Formats**:

- **Text**: Terminal output (summary)
- **JSON**: `output/coverage/coverage-summary.json`
- **HTML**: `output/coverage/index.html` (open in browser)

### Viewing Coverage Reports

**Terminal Output**:
After running `pnpm run test:coverage`, you'll see a summary:

```
File      | % Stmts | % Branch | % Funcs | % Lines
----------|---------|----------|---------|--------
All files |   85.23 |    78.45 |   82.10 |   84.56
```

**HTML Report** (Recommended):

```bash
# Open in browser
open output/coverage/index.html
# or
npx serve output/coverage
```

The HTML report shows:

- Line-by-line coverage
- File-level statistics
- Branch coverage
- Function coverage

### Coverage Metrics Explained

- **Statements (% Stmts)**: Percentage of code statements executed
- **Branches (% Branch)**: Percentage of conditional branches executed (if/else, switch)
- **Functions (% Funcs)**: Percentage of functions called
- **Lines (% Lines)**: Percentage of lines executed

### Coverage Configuration

**Excluded from Coverage** (in `vitest.config.ts`):

- `node_modules/`
- `tests/`
- `**/*.d.ts` (TypeScript declaration files)
- `**/*.config.*` (Config files)
- `.next/`
- `playwright.config.ts`
- `vitest.config.ts`

**To Modify Exclusions**: Edit `coverage.exclude` in `vitest.config.ts`

### Coverage Best Practices

1. **Aim for 80%+ coverage** on critical code paths
2. **Focus on business logic** over UI components (some UI is hard to test)
3. **Don't chase 100%** - focus on meaningful tests
4. **Review coverage reports regularly** to identify gaps
5. **Use coverage to find dead code** (0% coverage might indicate unused code)

### Coverage in CI/CD

Currently, coverage is **not enforced in CI**. To add coverage thresholds:

```typescript
// vitest.config.ts
coverage: {
  thresholds: {
    lines: 80,
    functions: 80,
    branches: 75,
    statements: 80,
  },
}
```

---

## Bundle Size Analysis

### Overview

Bundle size analysis helps identify large dependencies and optimize your application's performance. Smaller bundles mean faster load times.

**Tool**: `@next/bundle-analyzer`

**Note**: This tool needs to be installed. Run:

```bash
pnpm add -D @next/bundle-analyzer
```

### Running Bundle Analysis

```bash
# Analyze bundle size
pnpm run analyze
```

This command:

1. Builds the production bundle
2. Analyzes bundle composition
3. Opens interactive visualization in browser

### Understanding Bundle Analysis

The analyzer shows:

- **Total bundle size** (in KB/MB)
- **Individual chunk sizes**
- **Dependency sizes** (which packages are largest)
- **Duplicate dependencies** (same package in multiple chunks)

### Minimizing Bundle Size

#### 1. Identify Large Dependencies

Look for:

- Large icon libraries (import only what you need)
- Heavy animation libraries
- Unused dependencies

#### 2. Use Dynamic Imports

```typescript
// Instead of:
import HeavyComponent from '@/components/HeavyComponent';

// Use:
const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});
```

#### 3. Tree Shaking

Ensure you're importing only what you need:

```typescript
// Bad: Imports entire library
import * as Icons from "@heroicons/react";

// Good: Imports only what you need
import { HomeIcon } from "@heroicons/react/24/outline";
```

#### 4. Remove Unused Dependencies

```bash
# Check for unused dependencies
pnpm why <package-name>

# Remove unused dependencies
pnpm remove <package-name>
```

#### 5. Optimize Images

- Use Next.js `Image` component (automatic optimization)
- Use WebP format when possible
- Lazy load images below the fold

#### 6. Code Splitting

Next.js automatically code-splits by route. For additional splitting:

```typescript
// Use React.lazy for component-level splitting
const LazyComponent = React.lazy(() => import("./LazyComponent"));
```

### Bundle Size Targets

**Recommended Targets**:

- **Initial JS bundle**: < 200 KB (gzipped)
- **Total JS bundle**: < 500 KB (gzipped)
- **Individual route**: < 100 KB (gzipped)

**Note**: These are guidelines. Actual targets depend on your application's needs.

### Monitoring Bundle Size

**In CI/CD** (Future Enhancement):

- Set up bundle size monitoring
- Fail builds if bundle exceeds threshold
- Track bundle size over time

---

## Promotion & Deployment

### Overview

"Promotion" refers to moving code from development → staging → production. This project uses a deployment workflow that may include multiple environments.

### Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All tests pass (`pnpm run test:all`)
- [ ] Code validation passes (`pnpm run validate`)
- [ ] Production build succeeds (`pnpm run build`)
- [ ] Production build runs locally (`pnpm run start`)
- [ ] Bundle size is acceptable (`pnpm run analyze`)
- [ ] Environment variables are configured
- [ ] Database migrations are applied (if applicable)

### Deployment Workflow

#### 1. Local Validation

```bash
# Run all checks
pnpm run validate
pnpm run test:all

# Build production bundle
pnpm run build

# Test production build
pnpm run start
# Visit http://localhost:3000 and test manually
```

#### 2. Commit & Push

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 3. CI/CD Pipeline

The CI pipeline (`.github/workflows/ci.yml`) automatically:

- Validates code quality
- Runs tests
- Builds production bundle
- (Future: Deploys to staging/production)

#### 4. Manual Deployment

If using manual deployment:

```bash
# Build for production
pnpm run build

# Deploy (method depends on hosting)
# Examples:
# - Vercel: Automatic on push
# - Docker: Build and push image
# - Server: Copy files to server
```

### Environment-Specific Configuration

**Development**:

- Uses `.env.local` (gitignored)
- Hot reload enabled
- Debug tools enabled

**Production**:

- Uses production environment variables
- Optimized builds
- Debug tools disabled

### Docker Deployment

If deploying with Docker:

```bash
# Build Docker image
docker build -t personal-site:latest .

# Run container
docker run -p 3000:3000 personal-site:latest
```

See `Dockerfile` for production build configuration.

### Rollback Procedure

If deployment fails:

1. **Identify the issue** (check logs, CI/CD status)
2. **Revert the commit**:
   ```bash
   git revert <commit-hash>
   git push
   ```
3. **Or rollback to previous version** (method depends on hosting)

---

## Command Cheatsheet Reference

For a complete list of all available commands, see:

**[📋 Commands Cheatsheet](../COMMANDS_CHEATSHEET.md)**

The cheatsheet includes:

- Quick start commands
- All npm/pnpm scripts
- Docker commands
- Git workflows
- Debugging commands
- And more!

**Key Commands Summary**:

```bash
# Development
pnpm run dev              # Start dev server
pnpm run build            # Build for production
pnpm run start            # Run production build

# Code Quality
pnpm run validate         # Run all checks
pnpm run lint:fix         # Fix formatting
pnpm run eslint:fix       # Fix code quality

# Testing
pnpm run test             # Run unit tests
pnpm run test:watch       # Watch mode
pnpm run test:coverage    # With coverage
pnpm run test:e2e         # E2E tests
pnpm run test:all         # All tests

# Analysis
pnpm run analyze          # Bundle analysis
pnpm run type-check       # Type checking
```

---

## Additional Documentation

### Documentation Index

The `.docs/dev/` directory contains additional documentation:

| Document                                                                     | Purpose                                |
| ---------------------------------------------------------------------------- | -------------------------------------- |
| **[DEV_INSTRUCTIONS.md](./DEV_INSTRUCTIONS.md)**                             | This document - complete dev guide     |
| **[CI_PIPELINE.md](./CI_PIPELINE.md)**                                       | CI/CD pipeline configuration and usage |
| **[COMMANDS_CHEATSHEET.md](../COMMANDS_CHEATSHEET.md)**                      | Quick reference for all commands       |
| **[SECURITY_SVG.md](./SECURITY_SVG.md)**                                     | SVG security best practices            |
| **[CONTACT_FORM_OPTIONS.md](./CONTACT_FORM_OPTIONS.md)**                     | Contact form implementation options    |
| **[SELF_HOSTED_EMAIL_SETUP.md](./SELF_HOSTED_EMAIL_SETUP.md)**               | Self-hosted email setup guide          |
| **[TWILIO_SMS_NOTIFICATIONS.md](./TWILIO_SMS_NOTIFICATIONS.md)**             | Twilio SMS integration guide           |
| **[SEO_METADATA_CHECKLIST.md](./SEO_METADATA_CHECKLIST.md)**                 | SEO metadata implementation checklist  |
| **[METADATA_POLISH_GUIDE.md](./METADATA_POLISH_GUIDE.md)**                   | Metadata polish and optimization       |
| **[HEX_ARRAY_PULSE_IMPLEMENTATION.md](./HEX_ARRAY_PULSE_IMPLEMENTATION.md)** | Hex array pulse feature implementation |
| **[README_BADGES.md](./README_BADGES.md)**                                   | README badge ideas and implementation  |
| **[TODO.md](./TODO.md)**                                                     | Project TODO list and priorities       |

### Root Documentation

Additional documentation in `.docs/`:

- **TESTING_STRATEGY.md** - Comprehensive testing strategy
- **ARCHITECTURE_REVIEW.md** - Architecture overview
- **COMPONENT_ARCHITECTURE.md** - Component structure

---

## Troubleshooting

### Common Issues

#### Validation Fails

```bash
# Run individual checks to identify issue
pnpm run type-check   # Type errors?
pnpm run lint         # Formatting issues?
pnpm run eslint       # Code quality issues?

# Fix issues
pnpm run lint:fix
pnpm run eslint:fix
```

#### Tests Fail

```bash
# Run tests with more verbose output
pnpm run test -- --reporter=verbose

# Run specific test file
pnpm run test tests/components/Button.test.tsx

# Check test setup
cat tests/setup.tsx
```

#### Build Fails

```bash
# Clean build artifacts
pnpm run clean

# Reinstall dependencies
rm -rf node_modules
pnpm install

# Try building again
pnpm run build
```

#### Coverage Not Generating

```bash
# Ensure @vitest/coverage-v8 is installed
pnpm list @vitest/coverage-v8

# Check vitest.config.ts coverage configuration
cat vitest.config.ts
```

#### Bundle Analyzer Not Working

```bash
# Ensure @next/bundle-analyzer is installed
pnpm add -D @next/bundle-analyzer

# Check next.config.ts configuration
cat next.config.ts
```

---

## Future Enhancements

### Planned Improvements

- [ ] **Pre-commit hooks** - Automatically run validation before commits
- [ ] **Coverage thresholds** - Enforce minimum coverage in CI
- [ ] **Bundle size monitoring** - Track bundle size over time
- [ ] **Automated dependency updates** - Dependabot/Renovate
- [ ] **Performance budgets** - Fail builds if bundle exceeds limits
- [ ] **Visual regression testing** - Screenshot comparison tests

### Contributing

When adding new tools or procedures:

1. **Update this document** with new information
2. **Update [COMMANDS_CHEATSHEET.md](../COMMANDS_CHEATSHEET.md)** with new commands
3. **Update relevant config files** with proper configuration
4. **Document in appropriate section** of this guide

---

## Getting Help

### Resources

- **Project README**: `/README.md`
- **Command Cheatsheet**: `/.docs/COMMANDS_CHEATSHEET.md`
- **CI Pipeline Guide**: `/.docs/dev/CI_PIPELINE.md`
- **Testing Strategy**: `/.docs/TESTING_STRATEGY.md`

### Questions?

- Check the documentation index above
- Review the command cheatsheet
- Check CI/CD logs for build issues
- Review test output for test failures

---

**Last Updated**: 2025-01-XX  
**Maintained By**: Development Team
