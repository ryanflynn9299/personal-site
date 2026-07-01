# Project Index: Single Sources of Truth

This document serves as the definitive map for identifying the core configuration and logic files for various project systems. AI agents should consult this file first to ensure they are modifying the correct "Single Source of Truth."

**AI entry points:** [AGENTS.md](../../AGENTS.md) · [AI_GUARDRAILS.md](./AI_GUARDRAILS.md) · [.cursor/rules/](../../.cursor/rules/)

## 0. Project Structure & Root Hygiene

### Core Directories

- `app/`: Next.js App Router (pages, layouts, and API routes).
- `components/`: Reusable UI components.
- `lib/`: Business logic, services, and system configuration.
- `tests/`: E2E (Playwright) and Unit (Vitest) test suites.
- `.docs/`: High-level strategy, architecture, and development guidelines.
- `.cursor/rules/`: Cursor project rules (`.mdc`); see `AI_GUARDRAILS.md`.
- `infrastructure/`: Environment/provider-specific configs (Docker, Cloudflare).
- `logs/`: Persistent failure reports and debugging artifacts.

### Root Hygiene Policy (Industry Standards)

| **Belongs at Root ✅**                                                                                                  | **Does NOT Belong at Root ❌**                             |
| :---------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| Core tool configs (`package.json`, `tsconfig.json`, `next.config.ts`, `playwright.config.ts`, `vitest.config.ts`, etc.) | Temporary debug scripts or "scratch" files.                |
| Configuration for styling/linting (`tailwind.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.prettierrc`).     | Failure reports or logs (`*.txt`, `failures/`).            |
| Environment templates (`.env`, `.env.example`).                                                                         | Provider-specific infra files (move to `infrastructure/`). |
| Standard project metadata (`README.md`, `LICENSE`, `.gitignore`, `Dockerfile`).                                         | Documentation files (move to `.docs/`).                    |

---

## 1. Configuration & Environment

| System              | Source of Truth         | Description                                                     |
| :------------------ | :---------------------- | :-------------------------------------------------------------- |
| **Runtime Config**  | `lib/config/index.ts`   | Centralized, frozen configuration object used across the app.   |
| **Env Schemas**     | `lib/config/schemas.ts` | Zod schemas and validation logic for all environment variables. |
| **Deployment Info** | `package.json`          | Node.js metadata, dependencies, and build scripts.              |

## 2. Site Metadata & Brand

| System             | Source of Truth   | Description                                                 |
| :----------------- | :---------------- | :---------------------------------------------------------- |
| **Site Constants** | `lib/site/seo.ts` | Site name, version, SEO defaults, and primary social links. |
| **Version Number** | `lib/site/seo.ts` | The `SITE_VERSION` constant (synced with `package.json`).   |
| **Navigation Map** | `app/sitemap.ts`  | Logical map of all searchable/public routes.                |

## 3. Feature Management & Tooling

| System            | Source of Truth               | Description                                                         |
| :---------------- | :---------------------------- | :------------------------------------------------------------------ |
| **Feature Flags** | `lib/dev-tooling/features.ts` | Flags for enabling/hiding experimental or dev-only features.        |
| **Logging**       | `lib/dev-tooling/logger.ts`   | Primary, centralized PINO logger configuration and utility helpers. |

## 4. Services & Integrations

| System               | Source of Truth                      | Description                                                  |
| :------------------- | :----------------------------------- | :----------------------------------------------------------- |
| **Directus CMS**     | `lib/services/directus/index.ts`     | Entry point for all CMS data fetching and transforms.        |
| **Email Service**    | `lib/services/email-service.ts`      | Logic for transactional emails and contact form submissions. |
| **Contact Security** | `lib/services/contact-protection.ts` | Honeypot and rate limiting for contact form.                 |
| **Admin Middleware** | `middleware.ts`                      | Route protection for `/admin` and preview routes.            |

## 5. Core Documentation (Strategy)

| Topic                 | Source of Truth                             |
| :-------------------- | :------------------------------------------ |
| **AI policy**         | `.docs/prompting/AI_GUARDRAILS.md`          |
| **Release Readiness** | `.docs/dev/RELEASE_READINESS.md`            |
| **Architecture**      | `.docs/ARCHITECTURE.md`                     |
| **Testing Strategy**  | `.docs/TESTING_STRATEGY.md`                 |
| **Dev Guidelines**    | `.docs/prompting/DEVELOPMENT_GUIDELINES.md` |
| **Admin Access**      | `.docs/dev/ADMIN_ACCESS.md`                 |
| **Contact Security**  | `.docs/dev/CONTACT_FORM_SECURITY.md`        |
| **Matomo Launch**     | `.docs/dev/MATOMO_LAUNCH_CHECKLIST.md`      |
| **SMTP Launch**       | `.docs/dev/SMTP_LAUNCH_CHECKLIST.md`        |
| **Security**          | `.docs/SECURITY_HEALTH_CHECK.md`            |

## 6. AI Infrastructure

| Artifact           | Path                               | Purpose                                      |
| :----------------- | :--------------------------------- | :------------------------------------------- |
| **Agent entry**    | `AGENTS.md`                        | First read for any AI assistant              |
| **Legacy pointer** | `.cursorrules`                     | Redirects to modern rules                    |
| **Cursor rules**   | `.cursor/rules/*.mdc`              | Scoped guardrails (core, testing, UX, tools) |
| **Full AI policy** | `.docs/prompting/AI_GUARDRAILS.md` | Docs authority, pushback, UX, testing        |

## 7. Testing Infrastructure

| Type                 | Directory / Config                            |
| :------------------- | :-------------------------------------------- |
| **E2E (Playwright)** | `tests/e2e/` + `playwright.config.ts`         |
| **Unit (Vitest)**    | `tests/` (excluding e2e) + `vitest.config.ts` |
