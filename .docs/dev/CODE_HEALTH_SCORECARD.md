# Code Health Scorecard

**Purpose:** A periodic review framework for evaluating how maintainable, correct, and clean the codebase is — not a gate for every feature PR.

**When to use**

| Use this                                  | Do not use this                                    |
| ----------------------------------------- | -------------------------------------------------- |
| Quarterly hygiene reviews                 | Every bug fix or small feature                     |
| Before a major release or large refactor  | As a substitute for `pnpm run validate` on each PR |
| After significant architectural changes   | To block merges on subjective “cleanliness” scores |
| When onboarding a new maintainer or agent | To demand 100% coverage on all code                |

**Recommended cadence:** once per quarter, or before promoting `dev` → `main` for a significant release.

---

## Quick start: automated audit

Run the scripted checks (automated tier only):

```bash
pnpm run health:audit
```

Full audit including E2E and production build (use before releases):

```bash
pnpm run health:audit:full
```

**Standard audit** runs `validate`, unit tests, and static policy checks. **Full audit** adds E2E and `next build`.

Reports are written to `logs/code-health-YYYY-MM-DD.md` and summarized in the terminal.

The script measures **objective signals** (lint pass, test count, boundary violations, etc.). It does **not** replace the manual scorecard below — combine both for a thorough review.

---

## Scoring model

Rate each dimension **0–3**:

| Score | Meaning                                                    |
| ----- | ---------------------------------------------------------- |
| **0** | Broken or actively harmful — fix before shipping           |
| **1** | Fragile — works today but high change cost or hidden risk  |
| **2** | Acceptable — meets project standards with minor known debt |
| **3** | Strong — would hold up as an example for new contributors  |

**Total:** 8 dimensions × 3 = **24 points maximum**

| Band             | Score   | Interpretation                                |
| ---------------- | ------- | --------------------------------------------- |
| Production-grade | 20–24   | Healthy; address only targeted debt           |
| Workable         | 14–19   | Ship features; schedule top 3 debt items      |
| At risk          | &lt; 14 | Pause feature work; focus on structural fixes |

Record results in the [Review log template](#review-log-template) at the bottom of this file (or in a dated entry under `logs/`).

---

## Dimension 1: Correctness & honest UX

**Question:** Does behavior match documented intent, and do users see truthful system state?

### Automated signals (`health:audit`)

- `pnpm run validate` passes
- `pnpm run test` passes
- E2E pass (full audit only)

### Manual checklist

- [ ] Contact form never fakes email success when SMTP is unavailable ([SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md))
- [ ] Error and loading states are visible on slow or uncertain operations
- [ ] No silent failures in server actions or service integrations
- [ ] `.docs/` still describes actual behavior for areas touched since last review

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 2: Architecture & boundaries

**Question:** Are layers separated, and do dependencies flow the right way?

### Automated signals

- Zero client components importing `@/lib/services/*` (audit script)
- Zero active imports from `components/archived/` (audit script)
- `pnpm run build` succeeds (full audit)

### Manual checklist

- [ ] [ARCHITECTURE.md](../ARCHITECTURE.md) patterns still match reality (page → `*PageClient`, services in `lib/services/`)
- [ ] Config SSOT files in [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md) are still the files in use
- [ ] No new duplicate sources of truth (e.g. two `isDirectusConfigured` implementations)
- [ ] `components/archived/` remains frozen per [README](../../components/archived/README.md)

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 3: Test efficacy

**Question:** Do tests codify requirements, or just pad coverage?

### Automated signals

- Test file and test counts reported by audit script
- No test failures

### Manual checklist

- [ ] Each critical path in [TESTING_STRATEGY.md](../TESTING_STRATEGY.md) has at least one happy-path test
- [ ] No obvious duplicate tests across unit/integration (same behavior asserted twice)
- [ ] No “theater” tests (e.g. only `toBeInTheDocument()` with no behavior assertion)
- [ ] Mocks use getters for frozen `lib/config`, not Proxies ([DEVELOPMENT_GUIDELINES.md](../prompting/DEVELOPMENT_GUIDELINES.md) §1)
- [ ] Shared mock factories in `tests/mocks/` used where setup is duplicated

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 4: UX & accessibility

**Question:** Can users navigate, understand feedback, and use keyboard/screen readers?

### Automated signals

- `eslint-plugin-jsx-a11y` — zero **errors** in active code (part of `validate`)
- E2E accessibility spec passes (full audit)

### Manual checklist

- [ ] Skip link and main landmark present on primary layout
- [ ] Forms have labels, error announcements (`role="alert"` where appropriate)
- [ ] Icon-only controls have accessible names
- [ ] Keyboard pass on Header, contact form, and one blog flow
- [ ] Optional: Lighthouse accessibility ≥ 90 on `/`, `/contact`, `/blog`

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 5: Performance & bundle health

**Question:** Is client JavaScript justified and heavy UI deferred?

### Automated signals

- Audit reports count of `"use client"` files (trend over time)
- Heavy quote views use `next/dynamic` (manual spot-check if count grows)

### Manual checklist

- [ ] Homepage sections prefer server components where animation is cosmetic
- [ ] No duplicate animation libraries in `package.json`
- [ ] No client bundles pulling server-only tooling (e.g. Pino logger)
- [ ] Optional: `pnpm run analyze` — note largest chunks and any regressions since last review

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 6: Security & dependencies

**Question:** Are inputs validated, secrets server-side, and dependencies monitored?

### Automated signals

- `pnpm audit` summary (audit script; moderate+ reported)
- Contact protection tests pass (`tests/unit/contact-protection.test.ts`)

### Manual checklist

- [ ] [SECURITY_HEALTH_CHECK.md](../SECURITY_HEALTH_CHECK.md) items still accurate
- [ ] [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md) honeypot + rate limit unchanged or improved
- [ ] Admin middleware behavior matches [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)
- [ ] No high/critical `pnpm audit` findings without documented mitigation

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 7: Repository hygiene

**Question:** Is the repo easy to navigate for humans and AI?

### Automated signals

- Root clutter check (audit script flags non-policy files at root)
- Prettier check passes

### Manual checklist

- [ ] Provider configs live under `infrastructure/`, not repo root
- [ ] Docs live under `.docs/`, not scattered at root
- [ ] Open items in [TODO.md](./TODO.md) are still relevant; stale items closed
- [ ] `logs/` used for audit output and failure artifacts, not committed secrets

**Score (0–3):** \_\_\_

**Notes:**

---

## Dimension 8: Maintainability & change safety

**Question:** How expensive is a typical change?

### Automated signals

- File-level `eslint-disable` count in active code (audit script; exclude `components/archived/`)
- `(window as any)` / `as any` density in active `components/` and `app/` (audit script)

### Manual checklist

- [ ] Pick 3 representative files changed recently — were the right abstractions touched?
- [ ] No large copy-pasted components (e.g. duplicate `PostCard` implementations)
- [ ] File-level lint suppressions are rare and justified
- [ ] A small bug fix does not require wide test rewrites

**Score (0–3):** \_\_\_

**Notes:**

---

## Review log template

Copy this block into `logs/code-health-YYYY-MM-DD.md` after each review.

```markdown
# Code health review — YYYY-MM-DD

**Reviewer:**
**Branch / commit:**
**Audit command:** `pnpm run health:audit` | `pnpm run health:audit:full`

## Automated audit summary

(paste terminal summary or link to generated report)

## Scores

| Dimension                          | Score (0–3) |
| ---------------------------------- | ----------- |
| 1. Correctness & honest UX         |             |
| 2. Architecture & boundaries       |             |
| 3. Test efficacy                   |             |
| 4. UX & accessibility              |             |
| 5. Performance & bundle health     |             |
| 6. Security & dependencies         |             |
| 7. Repository hygiene              |             |
| 8. Maintainability & change safety |             |
| **Total**                          | **/ 24**    |

## Top 3 actions (next quarter)

1.
2.
3.

## Deferred / operator review

-
```

---

## Related documentation

- [DEVELOPMENT_GUIDELINES.md](../prompting/DEVELOPMENT_GUIDELINES.md) — daily standards and PR verification
- [TESTING_STRATEGY.md](../TESTING_STRATEGY.md) — what to test and what to skip
- [RELEASE_READINESS.md](./RELEASE_READINESS.md) — launch gate (overlaps with full audit timing)
- [SECURITY_HEALTH_CHECK.md](../SECURITY_HEALTH_CHECK.md) — security-focused checklist
- [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md) — single sources of truth

---

**Last updated:** 2026-07-01
