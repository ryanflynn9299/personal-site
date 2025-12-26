# CI Pipeline Complete Guide

**Last Updated:** Initial implementation  
**Status:** ✅ CI pipeline is active and configured  
**Location:** `.github/workflows/ci.yml`

---

## Table of Contents

1. [Overview & Current Status](#overview--current-status)
2. [Architecture & Setup](#architecture--setup)
3. [Environment Variables](#environment-variables)
4. [Pipeline Jobs Explained](#pipeline-jobs-explained)
5. [Branch Strategy & Implementation](#branch-strategy--implementation)
6. [Status Badges](#status-badges)
7. [Code Coverage (Future)](#code-coverage-future)
8. [Maintenance & Monitoring](#maintenance--monitoring)
9. [Public vs Private Repository Considerations](#public-vs-private-repository-considerations)
10. [Core Takeaways & Critical Reminders](#core-takeaways--critical-reminders)
11. [Troubleshooting](#troubleshooting)
12. [Future Enhancements](#future-enhancements)

---

## Overview & Current Status

### What Is This?

A complete Continuous Integration (CI) pipeline that automatically validates your code quality, runs tests, and ensures your application builds successfully before code reaches production. This is implemented using **GitHub Actions**.

### Current Implementation Status

✅ **CI Pipeline:** Fully configured and active in `.github/workflows/ci.yml`  
✅ **Environment Variables:** Configured with minimal required set  
✅ **Four Jobs:** Lint/Type Check, Unit Tests, E2E Tests, Build  
✅ **Branch Triggers:** Configured for `main`, `master`, and `dev-main`  
⚠️ **Code Coverage:** Not currently enabled (see section below for how to add)  
✅ **Status Badge:** Can be added to README (see Status Badges section)

### Why CI Matters

- **Catches bugs early** before they reach production
- **Enforces code quality** standards automatically
- **Validates builds** work in a clean environment
- **Provides confidence** that code is ready to deploy
- **Documents** what passes/fails over time

---

## Architecture & Setup

### Platform: GitHub Actions

**Why GitHub Actions?**
- ✅ Native integration with GitHub (no external accounts needed)
- ✅ Free for public repositories (unlimited minutes)
- ✅ 2,000 free minutes/month for private repositories
- ✅ Easy YAML-based configuration
- ✅ Built-in secrets management
- ✅ Excellent documentation and community support

**Alternative Options (Not Currently Used):**
- GitLab CI/CD - If using GitLab
- CircleCI - 6,000 free minutes/month
- Jenkins - Self-hosted (more complex)
- Drone CI - Self-hosted, container-based

### Pipeline Structure

The CI pipeline consists of **4 parallel jobs** that run automatically:

1. **Lint & Type Check** - Code quality validation
2. **Unit Tests** - Component and utility testing
3. **E2E Tests** - End-to-end browser testing
4. **Build** - Production build verification

All jobs run in parallel to minimize total CI time (~5-10 minutes total).

### When CI Runs

**Current Configuration (Phase 1 - Initial Testing):**
- ✅ **On push to:** `main`, `master`, `dev-main`
- ✅ **On pull requests to:** `main`, `master`, `dev-main`

**Future Configuration (Phase 2 - After Testing):**
- ✅ **On push to:** `main`, `master` only
- ✅ **On pull requests to:** `main`, `master`, `dev-main`

**Why the change?** See [Branch Strategy](#branch-strategy--implementation) section.

---

## Environment Variables

### Current Configuration

The CI pipeline uses a **minimal set of environment variables** to ensure it works without external dependencies:

```yaml
env:
  # Site URL - Required for Next.js build and SEO metadata
  NEXT_PUBLIC_SITE_URL: "https://www.ryanflynn.org"
  
  # Directus URLs - Empty strings are fine (app gracefully handles missing Directus)
  # These are set to empty to ensure CI works without a database connection
  DIRECTUS_URL_SERVER_SIDE: ""
  NEXT_PUBLIC_DIRECTUS_URL: ""
```

### Why These Variables?

#### `NEXT_PUBLIC_SITE_URL` (Required)

**Why it's needed:**
- Next.js uses this for SEO metadata generation during build
- Required for proper sitemap and robots.txt generation
- Used in JSON-LD structured data
- Must be set to your actual production site URL

**What happens if missing:**
- Build may fail or generate incorrect metadata
- SEO tags may be incomplete
- Sitemap may have wrong URLs

**Current value:** `https://www.ryanflynn.org` (set in workflow file)

#### `DIRECTUS_URL_SERVER_SIDE` and `NEXT_PUBLIC_DIRECTUS_URL` (Empty Strings)

**Why they're empty:**
- Your application gracefully handles missing Directus (see `lib/directus.ts`)
- The `isDirectusConfigured()` function returns `false` when URLs are empty
- App returns empty arrays instead of crashing
- E2E tests are designed to work with or without Directus

**What happens with empty values:**
- ✅ Build succeeds (no database connection needed)
- ✅ Unit tests use MSW mocks (no real API calls)
- ✅ E2E tests check for posts OR empty state (both are valid)
- ✅ No errors or failures

**Why not use a test database?**
- Not necessary - app handles missing Directus gracefully
- Adds complexity (database setup, credentials, cleanup)
- Slower CI runs (database connection overhead)
- Your tests already work without it

### Job-Specific Environment Variables

Each job also sets `NODE_ENV`:

- **Lint & Type Check:** `NODE_ENV: "test"`
- **Unit Tests:** `NODE_ENV: "test"`
- **E2E Tests:** `NODE_ENV: "test"`
- **Build:** `NODE_ENV: "production"` (simulates production build)

### Optional Environment Variables (Not Currently Used)

These are **not configured** but could be added if needed:

**For Email Service Testing:**
```yaml
SMTP_HOST: ""
SMTP_PORT: ""
SMTP_FROM: ""
SMTP_TO: ""
```
**Note:** Contact form tests work without these (app handles missing email service gracefully).

**For Analytics Testing:**
```yaml
NEXT_PUBLIC_MATOMO_URL: ""
NEXT_PUBLIC_MATOMO_SITE_ID: ""
```
**Note:** Analytics is optional and doesn't block builds.

### Secrets Management

**Current Secrets:** None required for basic CI operation

**Future Secrets (if needed):**
- `CODECOV_TOKEN` - Only if you enable code coverage (see Code Coverage section)
- `SMTP_*` - Only if you want to test actual email sending
- `DEPLOY_WEBHOOK_SECRET` - Only if you add deployment automation

**How to Add Secrets:**
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add name and value
5. Secret is available as `${{ secrets.SECRET_NAME }}` in workflow

**⚠️ CRITICAL:** Never commit secrets to the repository. Always use GitHub Secrets.

---

## Pipeline Jobs Explained

### Job 1: Lint & Type Check (`lint-and-typecheck`)

**Purpose:** Validate code quality and type safety

**What it does:**
1. Checks out code from repository
2. Sets up Node.js 20 with npm caching
3. Installs dependencies (`npm ci`)
4. Runs Prettier formatting check (`npm run lint`)
5. Runs ESLint for code quality (`npm run eslint`)
6. Runs TypeScript type checking (`npm run type-check`)

**Why it's important:**
- Catches formatting inconsistencies before merge
- Identifies potential bugs through static analysis
- Ensures type safety across the codebase
- Enforces consistent code style

**What failure means:**
- Code doesn't meet style guidelines (Prettier)
- Code quality issues detected (ESLint)
- Type errors exist (TypeScript)
- Must fix before merging

**Typical duration:** 2-3 minutes

### Job 2: Unit Tests (`unit-tests`)

**Purpose:** Validate component logic and utilities work correctly

**What it does:**
1. Checks out code from repository
2. Sets up Node.js 20 with npm caching
3. Installs dependencies (`npm ci`)
4. Runs Vitest unit tests (`npm run test`)
5. Generates coverage reports (optional, for Codecov)

**Why it's important:**
- Validates component logic works as expected
- Ensures utilities and helpers function correctly
- Prevents regressions when code changes
- Catches bugs in isolated unit tests

**What failure means:**
- Tests are failing (logic errors)
- Code changes broke existing functionality
- Must fix tests or code before merging

**Test Environment:**
- Uses MSW (Mock Service Worker) to mock Directus API
- No real database connection needed
- Tests run in jsdom environment (simulated browser)

**Typical duration:** 1-2 minutes

### Job 3: E2E Tests (`e2e-tests`)

**Purpose:** Validate user workflows work end-to-end across browsers

**What it does:**
1. Checks out code from repository
2. Sets up Node.js 20 with npm caching
3. Installs dependencies (`npm ci`)
4. Installs Playwright browsers (Chromium, Firefox, WebKit)
5. Starts development server (`npm run dev`)
6. Runs Playwright E2E tests (`npm run test:e2e`)
7. Generates HTML test report

**Why it's important:**
- Validates complete user workflows
- Tests across different browsers (Chrome, Firefox, Safari)
- Catches integration issues
- Ensures UI works as expected

**What failure means:**
- User-facing functionality is broken
- Browser compatibility issues
- Integration problems between components
- Must fix before merging

**Test Strategy:**
- Tests are designed to work with OR without Directus
- Checks for blog posts OR empty state (both valid)
- Tests navigation, forms, and page structure
- Runs across Chromium, Firefox, and WebKit

**Typical duration:** 3-5 minutes (includes browser installation on first run)

### Job 4: Build (`build`)

**Purpose:** Verify production build succeeds

**What it does:**
1. Checks out code from repository
2. Sets up Node.js 20 with npm caching
3. Installs dependencies (`npm ci`)
4. Builds Next.js application (`npm run build`)
5. Uploads build artifacts (for debugging if needed)

**Why it's important:**
- Ensures production build works
- Catches build-time errors
- Validates all configuration is correct
- Confirms dependencies are compatible

**What failure means:**
- Build configuration is broken
- Dependencies are incompatible
- Environment variables missing or incorrect
- Type errors that only appear during build
- Must fix before deploying

**Build Environment:**
- Uses `NODE_ENV: "production"` (simulates production)
- Builds with Turbopack (Next.js 16 default)
- Generates optimized production bundle
- Validates all static generation works

**Typical duration:** 2-4 minutes

---

## Branch Strategy & Implementation

### Current Phase: Initial Testing (Phase 1)

**Configuration:**
```yaml
on:
  push:
    branches: [main, master, dev-main]  # ← dev-main temporarily enabled
  pull_request:
    branches: [main, master, dev-main]
```

**Why `dev-main` is enabled on push:**
- **Gathering baseline timing data** for all jobs
- **Verifying CI works correctly** on all branches
- **Establishing performance benchmarks** for future optimization
- **Identifying any branch-specific issues** early

**Duration:** 1-2 weeks (or ~10-20 commits to `dev-main`)

**What to monitor during this phase:**
- Average CI duration per job
- Total CI minutes used per week
- Frequency of `dev-main` commits
- Any flaky tests or issues
- Build success/failure rates

### Future Phase: Optimization (Phase 2)

**Recommended Configuration:**
```yaml
on:
  push:
    branches: [main, master]  # ← dev-main removed
  pull_request:
    branches: [main, master, dev-main]  # ← Still validates PRs
```

**Why remove `dev-main` from push triggers:**
- **Saves CI minutes** (important for private repos with 2,000/month limit)
- **Reduces noise** (fewer CI runs for development commits)
- **Still validates via PRs** (better workflow - catches issues before merge)
- **Focuses CI on production-ready code** (main/master branches)

**Result:**
- CI still runs on PRs to `dev-main` (validates before merge)
- CI runs on every push to `main`/`master` (production branches)
- Saves CI minutes on frequent `dev-main` commits
- Encourages PR workflow (better code review)

### CI Minutes Usage Analysis

#### Current Setup (With `dev-main` on Push)

**Estimated Usage:**
- Each full CI run: ~5-10 minutes
- If you push to `dev-main` 5x/day: 25-50 minutes/day
- Weekly: 175-350 minutes/week
- Monthly: 700-1400 minutes/month

**GitHub Actions Limits:**
- **Public repos:** ✅ Unlimited (no concern)
- **Private repos:** 2,000 minutes/month (could be tight if very active)

#### After Removing `dev-main` from Push

**Estimated Usage:**
- Each full CI run: ~5-10 minutes
- Pushes to `main`: Typically 1-3x/week = 5-30 minutes/week
- PRs to `dev-main`: Validates before merge = same quality, less frequent
- Monthly: ~50-200 minutes/month (much lower)

### Decision Matrix

| Scenario | Keep `dev-main` on Push? | Reason |
|----------|---------------------------|--------|
| **Public repo** | ✅ Yes (optional) | Unlimited minutes, no cost concern |
| **Private repo, active dev** | ❌ No (after testing) | Save minutes for important runs |
| **Private repo, occasional commits** | ✅ Maybe | Low usage, convenience may be worth it |
| **Need timing data** | ✅ Yes (temporarily) | Gather metrics first |
| **Want to catch issues early** | ⚠️ PRs are better | PR validation catches issues before merge |

### How to Remove `dev-main` from Push Triggers

**When:** After 1-2 weeks of data collection

**Steps:**
1. Open `.github/workflows/ci.yml`
2. Find line 10: `branches: [main, master, dev-main]`
3. Change to: `branches: [main, master]`
4. Commit and push

**Result:** CI still runs on PRs to `dev-main`, but not on direct pushes.

### Best Practices

**Production branches (`main`, `master`):**
- ✅ Always run CI on push (critical for deployment confidence)
- ✅ Run CI on PRs (validate before merge)

**Development branches (`dev-main`):**
- ✅ Run CI on PRs (validates before merge)
- ❌ Don't run on every push (saves minutes)
- ✅ Still catches issues before they reach `main`

**Feature branches:**
- ✅ Run CI on PRs only
- ❌ Never run on push (too frequent)

---

## Status Badges

### Adding a CI Status Badge to README

**Basic Badge:**
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
```

**Branch-Specific Badge:**
```markdown
![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg?branch=main)
```

**Custom Badge (using shields.io):**
```markdown
![CI](https://img.shields.io/github/actions/workflow/status/YOUR_USERNAME/YOUR_REPO/ci.yml?branch=main&label=CI)
```

**How to Get Your Badge URL:**
1. Go to your GitHub repository
2. Click "Actions" tab
3. Click on the "CI" workflow
4. Click the "..." menu → "Create status badge"
5. Copy the markdown code
6. Paste into your README.md

**Multiple Badges Example:**
```markdown
# Personal Site

![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
```

---

## Code Coverage (Future)

### Current Status

**Code coverage is NOT currently enabled.** The CI pipeline includes a Codecov upload step, but it's optional and won't fail if the token isn't set.

### Why Not Enabled?

- Focus on getting CI working first
- Coverage tracking adds complexity
- Not critical for initial setup
- Can be added later without breaking existing CI

### How to Enable Code Coverage (If You Decide To)

**Step 1: Sign Up for Codecov**
1. Go to [codecov.io](https://codecov.io)
2. Sign up with your GitHub account
3. Add your repository
4. Copy your repository token

**Step 2: Add GitHub Secret**
1. Go to GitHub repository
2. Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `CODECOV_TOKEN`
5. Value: Paste your Codecov token
6. Click "Add secret"

**Step 3: Verify Coverage Generation**

The CI pipeline already includes coverage generation in the unit tests job:
```yaml
- name: Run unit tests
  run: npm run test  # This generates coverage automatically
```

Verify coverage is generated:
```bash
npm run test:coverage
# Should create coverage/ directory with reports
```

**Step 4: Add Coverage Badge to README**

```markdown
![codecov](https://codecov.io/gh/YOUR_USERNAME/YOUR_REPO/branch/main/graph/badge.svg)
```

**Step 5: Verify It Works**

1. Push a commit
2. Check GitHub Actions - Codecov upload should succeed
3. Check Codecov dashboard - should show coverage data
4. Badge should update with coverage percentage

### Coverage Goals (If You Enable It)

- **Aim for >80% coverage** on critical paths
- **Focus on utilities and business logic** (not UI components)
- **Don't obsess over 100%** - some code is hard to test meaningfully
- **Review coverage quarterly** - add tests for new features

### Current Coverage Setup

The workflow already includes:
```yaml
- name: Upload coverage reports
  uses: codecov/codecov-action@v4
  if: always()
  with:
    files: ./coverage/coverage-final.json
    fail_ci_if_error: false  # Won't fail if token missing
    token: ${{ secrets.CODECOV_TOKEN }}
```

**This step:**
- ✅ Only runs if `CODECOV_TOKEN` secret is set
- ✅ Won't fail CI if token is missing
- ✅ Uploads coverage data if configured
- ✅ Safe to leave in workflow even if not using Codecov

---

## Maintenance & Monitoring

### Regular Maintenance Tasks

#### 1. Update Dependencies (Monthly)

```bash
# Check for outdated packages
npm outdated

# Update dependencies
npm update

# Test after updates
npm run validate
npm run test:all
```

**Why:** Security patches, bug fixes, and new features

#### 2. Review CI Failures (As Needed)

- Check GitHub Actions tab regularly
- Fix failing tests promptly (within 24 hours)
- Update tests when requirements change
- Investigate flaky tests

#### 3. Update CI Workflow (Quarterly)

- Review GitHub Actions versions (check for updates)
- Update Node.js version if needed (currently 20)
- Add new test types as project grows
- Optimize slow jobs

**Example update:**
```yaml
# Check for newer versions
uses: actions/checkout@v4  # Check for v5, v6, etc.
uses: actions/setup-node@v4  # Check for v5, etc.
```

#### 4. Monitor Build Times (Monthly)

- Track CI duration in GitHub Actions
- Identify slow jobs
- Optimize slow tests
- Consider parallelization improvements
- Review caching effectiveness

#### 5. Review Test Coverage (Quarterly - If Enabled)

```bash
npm run test:coverage
```

- Aim for >80% coverage on critical paths
- Add tests for new features
- Remove obsolete tests
- Review coverage reports

### Maintenance Checklist

- [ ] Dependencies updated monthly
- [ ] CI failures addressed within 24 hours
- [ ] Test coverage reviewed quarterly (if enabled)
- [ ] CI workflow updated quarterly
- [ ] Build times monitored monthly
- [ ] Security alerts reviewed weekly (GitHub Dependabot)
- [ ] Branch strategy reviewed after testing phase

### Monitoring CI Health

**What to Watch:**
- **Flaky tests** - Tests that fail randomly (investigate and fix)
- **Slow builds** - Jobs taking >10 minutes (optimize)
- **High CI minutes usage** - Approaching limits (optimize branch strategy)
- **Dependency vulnerabilities** - Dependabot alerts (review weekly)

**Where to Check:**
- GitHub Actions tab - See all runs and durations
- Repository Insights - See CI minutes usage
- Dependabot alerts - Security vulnerabilities
- Actions logs - Detailed job output

---

## Public vs Private Repository Considerations

### Public Repository (Current Assumption)

**GitHub Actions Limits:**
- ✅ **Unlimited CI minutes** - No cost concerns
- ✅ **Unlimited storage** - No artifact storage limits
- ✅ **All features free** - No restrictions

**Implications:**
- Can run CI on every commit to any branch
- No need to optimize for CI minutes
- Can enable all optional features (Codecov, etc.)
- Can keep `dev-main` on push triggers if desired

**Recommendation:**
- Still remove `dev-main` from push after testing (better workflow)
- But not critical for minutes usage
- Focus on code quality over minutes optimization

### Private Repository

**GitHub Actions Limits:**
- ⚠️ **2,000 minutes/month free** - Must monitor usage
- ⚠️ **500 MB storage** - Limited artifact storage
- ⚠️ **Some features may be paid** - Check pricing

**Implications:**
- Must optimize CI minutes usage
- Should remove `dev-main` from push after testing
- Monitor monthly usage closely
- Consider alternatives if exceeding limits

**Optimization Strategies:**
1. **Remove `dev-main` from push triggers** (saves ~700-1400 min/month)
2. **Use PR-only validation** for development branches
3. **Cache dependencies aggressively** (already done)
4. **Skip optional jobs** if not needed
5. **Consider self-hosted runners** if consistently over limit

**Decision Matrix for Private Repos:**

| Usage Level | Action |
|------------|--------|
| <500 min/month | No optimization needed |
| 500-1500 min/month | Monitor, optimize if growing |
| 1500-2000 min/month | Remove `dev-main` from push, optimize |
| >2000 min/month | Consider self-hosted runners or paid plan |

### How to Check Your Repository Type

1. Go to GitHub repository
2. Look at repository settings
3. If you see "Change visibility" → It's private
4. If you don't see that option → It's public

### Switching Between Public/Private

**If you switch from public to private:**
- CI minutes become limited (2,000/month)
- Should optimize branch strategy
- Monitor usage closely
- Consider removing `dev-main` from push

**If you switch from private to public:**
- CI minutes become unlimited
- Can be more liberal with CI runs
- Still recommended to use PR validation workflow

---

## Core Takeaways & Critical Reminders

### ⚠️ NEVER FORGET THESE

#### 1. Environment Variables

**Required:**
- ✅ `NEXT_PUBLIC_SITE_URL` - Must be your actual site URL
- ✅ `DIRECTUS_URL_SERVER_SIDE` - Can be empty (app handles it)
- ✅ `NEXT_PUBLIC_DIRECTUS_URL` - Can be empty (app handles it)

**Why empty Directus URLs work:**
- Your app gracefully degrades when Directus is unavailable
- `isDirectusConfigured()` returns `false` when URLs are empty
- Tests use MSW mocks (no real API needed)
- E2E tests check for posts OR empty state (both valid)

**Never commit:**
- ❌ Real API keys
- ❌ Database passwords
- ❌ SMTP credentials
- ❌ Any secrets (use GitHub Secrets instead)

#### 2. Branch Strategy

**Current (Testing Phase):**
- CI runs on push to `main`, `master`, `dev-main`
- CI runs on PRs to all branches

**Future (After Testing):**
- Remove `dev-main` from push triggers
- Keep PR validation for all branches
- Saves CI minutes (important for private repos)

**Action Required:**
- After 1-2 weeks, edit `.github/workflows/ci.yml` line 10
- Change `branches: [main, master, dev-main]` to `branches: [main, master]`

#### 3. CI Pipeline Location

**File:** `.github/workflows/ci.yml`

**Never:**
- ❌ Delete this file (CI will stop working)
- ❌ Commit secrets to this file
- ❌ Hardcode environment-specific values

**Always:**
- ✅ Use GitHub Secrets for sensitive data
- ✅ Test workflow changes in a branch first
- ✅ Keep workflow file in version control

#### 4. Test Strategy

**Unit Tests:**
- Use MSW to mock Directus API
- No real database connection needed
- Run in jsdom environment

**E2E Tests:**
- Work with OR without Directus
- Check for posts OR empty state
- Test across multiple browsers

**Build:**
- Works without Directus (empty URLs are fine)
- Validates production build succeeds
- Catches build-time errors

#### 5. Maintenance Schedule

**Monthly:**
- Update dependencies
- Monitor build times
- Review security alerts

**Quarterly:**
- Update CI workflow (action versions, Node.js)
- Review test coverage (if enabled)
- Optimize slow jobs

**As Needed:**
- Fix CI failures promptly
- Investigate flaky tests
- Add tests for new features

#### 6. Public vs Private Repo

**Public Repo:**
- Unlimited CI minutes
- Can be more liberal with CI runs
- Still recommended to optimize workflow

**Private Repo:**
- 2,000 minutes/month limit
- Must optimize branch strategy
- Monitor usage closely
- Remove `dev-main` from push after testing

#### 7. Code Coverage

**Current Status:** Not enabled

**To Enable:**
1. Sign up for Codecov
2. Add `CODECOV_TOKEN` to GitHub Secrets
3. Badge will automatically update
4. Review coverage quarterly

**The workflow already includes Codecov upload step** - just needs the token.

#### 8. Status Badges

**How to Add:**
1. Go to Actions tab → CI workflow → "..." menu → "Create status badge"
2. Copy markdown
3. Add to README.md

**Why It Matters:**
- Shows CI status at a glance
- Builds confidence in code quality
- Professional appearance

#### 9. Secrets Management

**Never commit secrets:**
- ❌ API keys
- ❌ Passwords
- ❌ Tokens
- ❌ Credentials

**Always use GitHub Secrets:**
- ✅ Settings → Secrets and variables → Actions
- ✅ Access as `${{ secrets.SECRET_NAME }}`
- ✅ Rotate secrets regularly

#### 10. CI Failure Response

**When CI fails:**
1. Check GitHub Actions tab for details
2. Review job logs to identify issue
3. Fix the problem (code, tests, or config)
4. Push fix and verify CI passes
5. Don't merge PRs with failing CI

**Response Time:**
- Critical failures: Fix within 24 hours
- Non-critical: Fix within a week
- Flaky tests: Investigate and fix root cause

---

## Troubleshooting

### Common Issues

#### 1. CI Fails Locally But Passes in CI

**Possible Causes:**
- Node.js version mismatch
- Environment variables not set locally
- Cache issues

**Solutions:**
- Verify Node.js version matches (20)
- Check environment variables are set
- Use `npm ci` instead of `npm install` (cleans install)
- Clear local cache: `npm run clean`

#### 2. Tests Pass Locally But Fail in CI

**Possible Causes:**
- Timeout issues (CI is slower)
- Race conditions
- Test isolation problems
- Environment differences

**Solutions:**
- Increase test timeouts if needed
- Verify tests are isolated (no shared state)
- Check for race conditions
- Review CI logs for specific errors

#### 3. Build Fails in CI

**Possible Causes:**
- Missing environment variables
- Platform-specific issues
- Dependency problems
- Type errors only visible during build

**Solutions:**
- Verify all required env vars are set
- Check build logs for specific errors
- Test build locally: `npm run build`
- Verify `package-lock.json` is committed

#### 4. Slow CI Runs

**Possible Causes:**
- Large dependency installation
- Slow tests
- No caching
- Too many sequential jobs

**Solutions:**
- Caching is already enabled (npm cache)
- Consider caching Playwright browsers
- Optimize slow tests
- Jobs already run in parallel (optimized)

#### 5. E2E Tests Flaky

**Possible Causes:**
- Timing issues
- Network delays
- Browser-specific problems
- Test isolation issues

**Solutions:**
- Increase timeouts
- Use `waitForLoadState('networkidle')`
- Check for race conditions
- Review Playwright best practices

#### 6. Codecov Upload Fails

**Possible Causes:**
- `CODECOV_TOKEN` not set (expected if not using Codecov)
- Coverage file not generated
- Network issues

**Solutions:**
- If not using Codecov: This is expected, ignore the warning
- If using Codecov: Verify token is set in GitHub Secrets
- Check that `npm run test` generates coverage
- Verify `coverage/coverage-final.json` exists

#### 7. Environment Variable Issues

**Possible Causes:**
- Variable not set in workflow
- Wrong variable name
- Missing in specific job

**Solutions:**
- Check workflow file for env vars
- Verify variable names match exactly
- Check job-specific env vars
- Review environment variable section above

---

## Future Enhancements

### Phase 2: Full Deployment Pipeline

**Current:** CI only (build and test)  
**Future:** CI/CD (build, test, and deploy)

**Potential Steps:**
1. Build and test (current)
2. Build Docker image (optional)
3. Deploy to staging environment
4. Run smoke tests
5. Deploy to production (on `production` branch)

**See:** `.docs/CI_CD_APPROACH.md` for deployment strategies

### Advanced Features

**Matrix Testing:**
- Test across multiple Node.js versions
- Test across multiple operating systems

**Security Scanning:**
- npm audit in CI
- Snyk vulnerability scanning
- Dependabot automated updates

**Performance Testing:**
- Lighthouse CI for performance metrics
- Bundle size monitoring
- Load testing

**Visual Regression:**
- Screenshot comparison tests
- Visual diff detection
- Automated visual reviews

### Staging Environment

**Future Setup:**
- `main` branch → Staging deployment
- `production` branch → Production deployment
- Preview deployments for pull requests

### Blue-Green Deployments

**Zero-downtime deployments:**
- Deploy to new environment
- Run health checks
- Switch traffic
- Keep old environment for rollback

---

## Quick Reference

### File Locations

- **CI Workflow:** `.github/workflows/ci.yml`
- **This Documentation:** `.docs/dev/CI_PIPELINE.md`
- **Deployment Guide:** `.docs/CI_CD_APPROACH.md`

### Key Commands

```bash
# Run all validation locally
npm run validate

# Run all tests locally
npm run test:all

# Check CI would pass
npm run lint && npm run eslint && npm run type-check && npm run test && npm run build

# View coverage (if enabled)
npm run test:coverage
```

### Important URLs

- **GitHub Actions:** `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
- **Workflow File:** `https://github.com/YOUR_USERNAME/YOUR_REPO/blob/main/.github/workflows/ci.yml`
- **GitHub Secrets:** `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

### Environment Variables Summary

| Variable | Required? | Current Value | Purpose |
|----------|-----------|---------------|---------|
| `NEXT_PUBLIC_SITE_URL` | ✅ Yes | `https://www.ryanflynn.org` | Site URL for SEO/build |
| `DIRECTUS_URL_SERVER_SIDE` | ❌ No | `""` (empty) | Directus server URL |
| `NEXT_PUBLIC_DIRECTUS_URL` | ❌ No | `""` (empty) | Directus public URL |
| `NODE_ENV` | ✅ Yes | `test`/`production` | Node environment |

### Branch Strategy Summary

| Branch | Push CI? | PR CI? | Notes |
|--------|----------|-------|-------|
| `main` | ✅ Yes | ✅ Yes | Production branch |
| `master` | ✅ Yes | ✅ Yes | Production branch |
| `dev-main` | ⚠️ Temporary | ✅ Yes | Remove from push after testing |

---

## Conclusion

Your CI pipeline is **fully configured and ready to use**. The setup uses minimal environment variables, works without external dependencies, and is optimized for both public and private repositories.

**Key Points to Remember:**
1. ✅ CI is active and working
2. ✅ Environment variables are minimal and configured
3. ⚠️ Remove `dev-main` from push after 1-2 weeks of testing
4. ✅ Code coverage can be added later (workflow already supports it)
5. ✅ App gracefully handles missing Directus (empty URLs are fine)

**Next Steps:**
1. Monitor first few CI runs
2. Gather timing data
3. After 1-2 weeks, optimize branch strategy
4. Add status badge to README
5. Consider code coverage if desired

**Questions or Issues?**
- Check Troubleshooting section
- Review GitHub Actions logs
- Consult this documentation

---

**Last Updated:** Initial implementation  
**Maintained By:** You  
**Review Schedule:** Quarterly

