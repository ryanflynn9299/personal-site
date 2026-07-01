# AI Agent Instructions

This repository uses documented standards. Read this file first, then follow linked sources.

## Start here

1. **[.docs/prompting/PROJECT_INDEX.md](.docs/prompting/PROJECT_INDEX.md)** — map of single sources of truth (config, services, docs).
2. **[.docs/prompting/AI_GUARDRAILS.md](.docs/prompting/AI_GUARDRAILS.md)** — full policy: docs authority, pushback, UX, testing, tools, subagents.
3. **[.docs/prompting/DEVELOPMENT_GUIDELINES.md](.docs/prompting/DEVELOPMENT_GUIDELINES.md)** — repo-specific pitfalls (frozen config mocks, `server-only`, lint rules).

## Non-negotiables

| Area | Rule |
|------|------|
| **Documentation** | Treat `.docs/` as authority for product, architecture, design, and style. Contradicting requests require pushback or explicit operator permission — then update docs in the same change. |
| **Code quality** | Cohesive structure ([ARCHITECTURE.md](.docs/ARCHITECTURE.md)), match local conventions, minimal scope. Run `pnpm run validate` and `pnpm run test` before finishing. |
| **Testing** | Happy-path requirements tests by default. Add edge/security/regression tests only when they earn their keep. |
| **UX** | Paramount. Reject directions that violate core UX principles; explain and propose a better path. |
| **Tools** | Use tools and external resources when they materially improve the outcome — not by default. |
| **Subagents** | Delegate focused domain work (explore, tests, security review) to specialist subagents when scope warrants it. |

## Cursor-specific rules

Project rules live in [`.cursor/rules/`](.cursor/rules/). Legacy [`.cursorrules`](.cursorrules) points here.

## Branch workflow

`cursor/*` or feature branches → **`dev`** (staging, no auto CI) → **`main`** (production, full CI). See [.docs/dev/RELEASE_READINESS.md](.docs/dev/RELEASE_READINESS.md).
