# AI Guardrails

Canonical policy for human maintainers and AI assistants. Cursor rules in `.cursor/rules/` distill this document; `AGENTS.md` is the entry point.

**Last updated:** 2026-07-01

---

## 1. Documentation hierarchy

### Authority

| Layer            | Location                                    | Role                                          |
| ---------------- | ------------------------------------------- | --------------------------------------------- |
| Index            | `.docs/prompting/PROJECT_INDEX.md`          | Where to find single sources of truth         |
| Policy           | This file                                   | How AI should decide and push back            |
| Architecture     | `.docs/ARCHITECTURE.md`                     | Directory layout, naming, server/client split |
| Product / launch | `.docs/dev/TODO.md`, `RELEASE_READINESS.md` | What ships when                               |
| Domain           | `.docs/dev/*.md`, `.docs/*.md`              | Security, SMTP, Matomo, testing, etc.         |
| Pitfalls         | `.docs/prompting/DEVELOPMENT_GUIDELINES.md` | Repo-specific mistakes to avoid               |

Consult docs **before** inventing patterns. The codebase is the second source of truth — read surrounding files and match them.

### When docs are wrong or too restrictive

If documentation blocks a **provably better** approach:

1. State the conflict and evidence (bug, performance, simpler design, industry norm).
2. Implement the better approach.
3. **Update the doc in the same PR** so the repo stays self-consistent.

Silent drift is not allowed.

### When the operator contradicts documentation

1. **Push back** — cite the doc and the risk (security, UX, launch scope, maintenance).
2. Ask for **explicit permission** to override.
3. If approved, implement **and** update docs (and TODO/release checklists if launch scope changes).

Do not treat "just this once" as a permanent exception without a doc update.

---

## 2. Code quality and structure

Non-negotiable:

- **Readable** — clear names, small functions, obvious control flow; curly braces on all blocks (lint rule).
- **Cohesive** — files live where `ARCHITECTURE.md` says; features colocated; types in `types/`.
- **Minimal scope** — only change what the task requires; no drive-by refactors.
- **Validated** — `pnpm run validate` and `pnpm run test` before handoff; E2E when user journeys change.

See `DEVELOPMENT_GUIDELINES.md` for frozen config mocks, `server-only` boundaries, and import hygiene.

---

## 3. Testing philosophy

Goal: tests that **catch real regressions** without becoming a second codebase to maintain.

### Default

- **Happy path** tests that assert requirements ("valid submission succeeds", "invalid email rejected").
- Test **behavior and contracts**, not private implementation details.
- Integration tests for server actions and service orchestration; component tests for critical UI states.

### Add nuance only when valuable

| Add           | Examples                                                  |
| ------------- | --------------------------------------------------------- |
| Edge cases    | Empty input, malformed input, boundary values             |
| Failure modes | Service down, partial success (Directus ok, email failed) |
| Security      | Honeypot, rate limit, auth middleware                     |
| Regression    | Bug that shipped once; comment why the test exists        |

### Avoid

- Tests that duplicate TypeScript's job
- Assertions on every CSS class or internal call order
- New tests for every line touched in a feature PR
- Testing third-party library internals

Details: `.docs/TESTING_STRATEGY.md`.

---

## 4. UX supremacy

UX is **paramount**. If instructions conflict with solid UX:

- **Reject** the request (politely).
- Name the principle: honest feedback, accessibility, predictability, recovery, proportionate friction.
- Propose an alternative that meets the underlying goal.

Examples aligned with this project:

- Contact form must not claim email sent when it was not (`SMTP_LAUNCH_CHECKLIST.md`).
- Destructive actions need confirmation; long operations need loading state.
- Errors should be actionable, not generic blame on the user.

---

## 5. Tools and external resources

Use tools when they improve **correctness, safety, or speed**:

- Grep/read/search the repo before assuming structure
- Run tests and lint after substantive edits
- Fetch external docs for APIs/SDKs not documented in-repo

Avoid tool theater — don't web-search generic React advice when `ARCHITECTURE.md` already answers the question.

---

## 6. Subagents and parallel work

Use specialist subagents when:

- Exploration spans many directories or naming conventions
- Security, testing, and implementation can proceed in parallel on independent areas
- A domain expert pass reduces risk (e.g. audit contact flow against `CONTACT_FORM_SECURITY.md`)

Skip subagents for trivial, single-file, or fully specified tasks.

The primary agent **owns integration**: reconcile subagent output with docs, run validation, one coherent PR.

---

## 7. Infrastructure map

| Artifact                                    | Purpose                                   |
| ------------------------------------------- | ----------------------------------------- |
| `AGENTS.md`                                 | Root entry for all AI tools               |
| `.cursorrules`                              | Legacy pointer to modern rules            |
| `.cursor/rules/*.mdc`                       | Cursor project rules (scoped + always-on) |
| `.docs/prompting/AI_GUARDRAILS.md`          | This file — full policy                   |
| `.docs/prompting/PROJECT_INDEX.md`          | Doc and code map                          |
| `.docs/prompting/DEVELOPMENT_GUIDELINES.md` | Implementation pitfalls                   |

### Cursor rules index

| Rule file                 | Activation                                          |
| ------------------------- | --------------------------------------------------- |
| `core.mdc`                | Always — docs, quality, UX veto, completion         |
| `testing.mdc`             | `tests/**`, `*.test.*`, `*.spec.*`                  |
| `ux-and-ui.mdc`           | `components/**`, `app/**`                           |
| `security.mdc`            | Auth, actions, config, middleware, CI, Docker paths |
| `tools-and-subagents.mdc` | Agent-requested when delegation matters             |

---

## 8. Quick decision checklist

Before submitting work, confirm:

- [ ] Consulted PROJECT_INDEX and relevant topic docs
- [ ] Pushed back or got permission if request contradicted docs
- [ ] Updated docs if behavior or policy changed
- [ ] Diff is minimal and matches local conventions
- [ ] `pnpm run validate` and `pnpm run test` pass
- [ ] Tests added/updated only at appropriate depth
- [ ] UX is honest and accessible
- [ ] Tools/subagents used purposefully, not reflexively
