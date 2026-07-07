# Personal Site - TODO List

## 🎯 Next Actions (Priority Order)

_Start here — see also [RELEASE_READINESS.md](./RELEASE_READINESS.md) for the full launch gate._

### Before Launch — code (merge to `dev`, then `main` for release)

- [x] **Contact form: warn when SMTP unavailable** — never report mock success in production; show honest warning UI if email cannot be sent (see [EMAIL.md](./EMAIL.md))
- [ ] Ensure responsive design works on mobile devices (manual sign-off)
- [x] Remove unused components and rename, archive out of use
- [x] **Fix contact page `mailto:` typo** — single `NEXT_PUBLIC_CONTACT_EMAIL` via `lib/site/contact.ts`; mailto, copy, and display use the same address

### Before Launch — operator (home server / deploy day)

- [ ] **DECIDED — Admin is Tailscale-only: unlist `/admin` from the public domain.**
      Remove/never add the NPM route for `/admin`; access via Tailscale
      IP/MagicDNS only; set `ADMIN_REQUIRE_TAILSCALE=true` as backstop;
      verify from an off-tailnet network that the public URL dead-ends at
      the proxy. Full checklist: [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)
- [ ] **Lock down Directus + Matomo admin** at reverse proxy (not public internet)
- [ ] **Complete Matomo launch tasks** (see [ANALYTICS.md](../ANALYTICS.md#launch-checklist))
- [ ] **Production `.env` + Docker rebuild + smoke test** (see [RELEASE_READINESS.md](./RELEASE_READINESS.md))
- [ ] **Set `NEXT_PUBLIC_SITE_URL` to production domain** in `.env` (see [SEO.md](./SEO.md))

### Before Launch — polish (optional, won't block ship)

- [ ] Add professional headshot/profile images
- [ ] Deep dive on Matomo (analytics tuning beyond install checklist)
- [x] Versioning system/methodology — see [VERSIONING.md](./VERSIONING.md)
- [ ] **LinkedIn posts on site** — clarify scope (embed vs manual curation vs remove item); no spec exists yet

### Release blockers — done

- [x] Wire admin middleware (`middleware.ts`)
- [x] Contact form honeypot + rate limiting (see [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md))
- [x] Matomo client cleanup (`config.matomo.enabled`)
- [x] Docker prod env wiring (SMTP, admin, Matomo build args)
- [x] Implement Terms and Privacy Policies wrt Matomo analytics
- [x] Quotes page — dev-only at launch (middleware + sitemap + robots)
- [x] Clean up documentation (see [RELEASE_READINESS.md](./RELEASE_READINESS.md))
- [x] CI: no auto checks on `dev`; full CI on `main`; manual dispatch
- [x] Branch sync: `dev` staging, `main` production
- [x] AI guardrails (`AGENTS.md`, `.cursor/rules/`, `AI_GUARDRAILS.md`)

### First promote after launch

- [x] **Consolidate `BlogHighlight` inline `PostCard`** — unified on `components/blog/PostCard.tsx` with `instance` API for future layouts
- [ ] **Matomo typed `window._paq` globals** — replace `(window as any)._paq` in `components/matomo/Matomo.tsx` with a `types/matomo.d.ts` ambient declaration. See PR notes for tradeoffs before implementing.
- [ ] **Implement real SMTP email delivery** (see [EMAIL.md](./EMAIL.md)) — `lib/services/email-service.ts` still returns mock / "not yet implemented" in production
- [ ] Enable SEO for blogs in `lib/site/seo.ts` (`ENABLE_BLOG_SEO`) when content is ready
- [ ] Add coverage threshold to `vitest.config.ts` and fail CI on `main` when below baseline
- [ ] Pre-commit check script (validate, test, compare coverage, build)
- [ ] Improve pre-commit checks for PR (PR naming conventions, etc.)
- [ ] Matomo analytics page on dashboard — replace hardcoded telemetry in `components/admin/TelemetryCards.tsx`
- [x] Add author bio section for posts (with popup card) — see [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md)
- [x] Add "Back to top" button for long pages
- [ ] Add slug hashing
- [ ] Clean up env variables and secrets (including dev and local)
- [ ] Add blog post categories/tags system
- [ ] Set up VSCode server and connect cursor for remote development pipeline
- [ ] Set up remote teardown command
- [ ] **Wire admin "Subspace Messages" to Directus `contact_messages`** — panel exists but shows hardcoded empty state (`app/(admin)/admin/dashboard/page.tsx`)
- [ ] **Admin dashboard version from SSOT** — replace hardcoded `CORE_VERSION: 2.1.0-STABLE` with `lib/site/version.ts`
- [ ] **Fix CI env var name** — `ci.yml` sets `DIRECTUS_URL_SERVER_SIDE` but schema reads `DIRECTUS_INTERNAL_URL` (harmless today, misleading)

### After Launch (Future)

- [ ] Add christmas mode
- [ ] Establish CD pipeline
- [ ] Add Twilio for build notifications (see [.docs/features/TWILIO_SMS_NOTIFICATIONS.md](../features/TWILIO_SMS_NOTIFICATIONS.md))
- [ ] Create backup strategy for content
- [ ] Review and optimize bundle size
- [ ] Add photos gallery to About Page
- [ ] Add some kind of books commentary page or component
- [ ] Add duck animation easter eggs
- [ ] Add spotify integration
- [ ] Add socials links to About page
- [ ] Add more projects to vitae page
- [ ] Add code syntax highlighting for technical posts (terminal theme)
- [x] Implement table of contents for long posts — see [BLOG.md](./BLOG.md)
- [ ] Add related posts suggestions
- [ ] Create post series/collections
- [ ] Add blog post excerpt/summary display
- [x] Add reading time estimates for blog posts
- [ ] Connect counter to database — `app/actions/counter.ts` returns random 1000–9999; `funCounter` feature flag is `hidden` until done; Directus `counters` collection not created (see [DIRECTUS.md](../DIRECTUS.md))

## Post-launch admin-oriented tasks

- [ ] Add admin dashboard for quick edits
- [ ] Add content scheduling functionality
- [ ] Create draft preview functionality
- [ ] Wire maintenance mode toggle — `ControlConsole.tsx` "Shields" toggle is disabled no-op
- [ ] Replace "Tactical Visualization Offline" placeholder on admin dashboard

---

## 🔍 Code Gaps (audit 2026-07-02)

_Incomplete implementations found in source — not all are launch blockers._

| Severity                    | Location                               | Gap                                                                                                     |
| --------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Blocker (post-launch email) | `lib/services/email-service.ts`        | SMTP `sendEmail()` mock; refuses send in production                                                     |
| Blocker (feature)           | `app/actions/counter.ts`               | Random counter; no Directus `counters` collection                                                       |
| Important                   | `components/admin/TelemetryCards.tsx`  | Hardcoded fake metrics ("4.2k Hits", "98.4% Uptime")                                                    |
| Important                   | `app/(admin)/admin/dashboard/page.tsx` | Subspace Messages not wired to Directus                                                                 |
| Important                   | `public/images/og-default.png`         | File missing; `DEFAULT_OG_IMAGE` references broken URL                                                  |
| Important                   | `lib/site/seo.ts`                      | `SOCIAL_PROFILES` are bare domain roots without handles                                                 |
| Minor                       | `lib/site/seo.ts`                      | `ENABLE_BLOG_SEO = false` (intentional until content ready)                                             |
| Minor                       | `components/sections/AboutMe.tsx`      | Bio text marked `TODO: revise this text`                                                                |
| Minor                       | `components/common/Header.tsx`         | Brand icon is lucide `Atom` placeholder; custom SVG TODO                                                |
| Minor                       | `components/matomo/Matomo.tsx`         | `(window as any)._paq`; no `types/matomo.d.ts`                                                          |
| Minor                       | `app/manifest.ts`                      | PNG PWA icons commented out; `app/icon.png` / `app/apple-icon.png` missing                              |
| Minor                       | `lib/dev-tooling/features.ts`          | `offlineDummyBlogs`, `valuesGridRedesign`, `techStackPremium` still `dev-only`                          |
| Ops (deploy day)            | Operator checklist                     | Tailscale admin, Matomo install, production `.env` — see [RELEASE_READINESS.md](./RELEASE_READINESS.md) |

---

## ✨ Polish Backlog (prioritized audit 2026-07-02)

_High-impact UX, a11y, SEO, and test polish — ordered by priority._

### High priority

| Area      | Task                                                                     | File(s)                                           | Effort |
| --------- | ------------------------------------------------------------------------ | ------------------------------------------------- | ------ |
| Bug       | ~~Fix `mailto:` href typo + test assertion~~                             | `lib/site/contact.ts`, `ContactPageClient.tsx`    | Done   |
| SEO       | Create `public/images/og-default.png` (1200×630)                         | `lib/site/seo.ts`, `public/images/`               | Small  |
| SEO       | Fill in real social profile URLs                                         | `lib/site/seo.ts`, `components/common/Footer.tsx` | Small  |
| UX        | Add `app/error.tsx` and `app/global-error.tsx` branded boundaries        | `app/`                                            | Small  |
| UX / perf | Parallelize blog post Directus fetches; avoid double `getPublishedPosts` | `app/(portfolio)/blog/[slug]/page.tsx`            | Medium |
| UX        | Add `loading.tsx` skeletons for `/blog` and `/blog/[slug]`               | `app/(portfolio)/blog/`                           | Medium |
| a11y      | Remove `role="dialog"` from mobile `<nav>` in Header                     | `components/common/Header.tsx`                    | Small  |

### Medium priority

| Area      | Task                                                                                   | File(s)                                                       | Effort |
| --------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------ |
| a11y      | Add `aria-current="page"` to active nav links                                          | `components/common/Header.tsx`                                | Small  |
| a11y      | `AnimatedText`: `aria-label` on h1, hide child spans, respect `prefers-reduced-motion` | `components/primitives/misc/AnimatedText.tsx`                 | Small  |
| a11y      | Toast dismiss button `aria-label` + `aria-live="polite"` on container                  | `components/primitives/Toast.tsx`, `context/ToastContext.tsx` | Small  |
| a11y      | `EmailStatusIndicator` tooltip keyboard-accessible (`onFocus`/`onBlur`)                | `components/contact/EmailStatusIndicator.tsx`                 | Small  |
| a11y      | Footer social links: `focus-visible:ring`                                              | `components/common/Footer.tsx`                                | Small  |
| UX / a11y | Blog search `Dialog.Title` has empty content — use `sr-only` title                     | `components/blog/BlogPageClient.tsx`                          | Small  |
| Admin UX  | Replace fake telemetry with "—" / "Not connected" until Matomo wired                   | `components/admin/TelemetryCards.tsx`                         | Small  |
| Tests     | Add `/vitae`, `/policies` to E2E accessibility page list                               | `tests/e2e/accessibility.spec.ts`                             | Small  |
| Tests     | Component tests for `BlogPageClient` error / empty / grid branches                     | `tests/components/`                                           | Small  |
| SEO       | Remove `/privacy` and `/terms` redirect URLs from sitemap                              | `app/sitemap.ts`                                              | Small  |
| Docs      | Move floating TODO comment from About page to this file                                | `components/about/AboutPageClient.tsx`                        | Small  |

### Low priority

| Area  | Task                                                                | File(s)                                    | Effort |
| ----- | ------------------------------------------------------------------- | ------------------------------------------ | ------ |
| a11y  | Make contact form labels visually visible (not only `sr-only`)      | `components/contact/ContactPageClient.tsx` | Small  |
| UX    | Enrich blog empty state (icon, styled container, optional CTA)      | `components/blog/BlogPageClient.tsx`       | Small  |
| SEO   | Use stable `lastModified` in sitemap (not `new Date()` every build) | `app/sitemap.ts`                           | Small  |
| SEO   | Consider `ENABLE_BLOG_SEO` as env var for toggle without redeploy   | `lib/site/seo.ts`                          | Small  |
| Code  | Remove commented-out SVG code in `Header.tsx`                       | `components/common/Header.tsx`             | Small  |
| Code  | Extract inline map callback types in vitae page                     | `app/(portfolio)/vitae/page.tsx`           | Small  |
| Tests | Toast a11y regression tests (`aria-live`, dismiss label)            | `tests/components/Toast.test.tsx`          | Small  |
| Tests | E2E: blog post prev/next nav, author byline, reading time           | `tests/e2e/blog.spec.ts`                   | Small  |
| Tests | 404 page structural assertions                                      | `tests/e2e/error-pages.spec.ts`            | Small  |

---

## 📚 Documented but not yet tracked

_Items from topic docs that should be tracked here._

### From [SEO.md](./SEO.md)

- [ ] Create `app/icon.png` (512×512) and `app/apple-icon.png` (180×180) for App Router file-based icons
- [ ] Uncomment PNG icons in `app/manifest.ts` once assets exist
- [ ] Additional JSON-LD: `Person`, `WebSite` with search action, `BreadcrumbList`
- [ ] Per-page custom OG images for key landing pages
- [ ] Search Console / Bing verification meta tags

### From [BLOG.md](./BLOG.md)

- [ ] Refactor `getAdjacentPosts()` to server-side Directus filtering (scalability when post count grows)

### From [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md) (v2+ deferred)

- [ ] Author avatar images (`avatar` field)
- [ ] `bio_long` markdown for dedicated author page
- [ ] Social link rows per author (github, linkedin, twitter)
- [ ] Multi-author UX (filters, bylines on post cards)
- [ ] Dedicated `/authors/[slug]` page
- [ ] Directus `authors` collection + M2O migration (Phase 0 uses static fallback)

### From [CONTACT_FORM_OPTIONS.md](../features/CONTACT_FORM_OPTIONS.md)

- [ ] Auto-delete contact submissions after 90 days (optional)
- [ ] reCAPTCHA v3 (optional enhancement)

### From [ANALYTICS.md](../ANALYTICS.md)

- [ ] Matomo goals, custom dimensions, email reports (post-launch tuning)

---

## 🐛 Bug Fixes

- [x] UNABLE_TO_GET_ISSUER_CERT_LOCALLY (SSL certificate issue)
- [x] Contact page `mailto:` href typo — fixed via `NEXT_PUBLIC_CONTACT_EMAIL` SSOT

---

## 📋 Backlog by Category

### Performance & SEO (not required for launch)

- [ ] Add proper meta tags for social sharing (structures exist; assets/URLs incomplete)
- [ ] Create `og-default.png` and wire Open Graph image
- [ ] Update social profile URLs in `lib/site/seo.ts`
- [ ] Sitemap: remove redirect-only URLs; stable `lastModified` dates

### User Experience

- [x] Implement smooth scrolling navigation
- [x] Create breadcrumb navigation
- [x] Improve toasts styling and limit
- [x] Stylize toasts to space theme
- [ ] Global error boundaries (`error.tsx`, `global-error.tsx`)
- [ ] Route-level loading skeletons for blog
- [ ] Blog post page: parallel Directus fetches

### Development & Infrastructure

- [x] Create deployment pipeline (CI/CD)
- [x] Complete successful CI run
- [x] Reduce build time for PR pipeline
- [ ] Set up error monitoring (Sentry)
- [ ] Audit accessibility compliance (beyond E2E heading/alt checks)
- [ ] Refactor repetitive code patterns
- [x] Set up automated testing (Vitest + Playwright)
- [ ] Fix `DIRECTUS_URL_SERVER_SIDE` → `DIRECTUS_INTERNAL_URL` in CI workflow

### Interactive Elements & UI Components

- [ ] Star border from react bits
- [x] Magic bento react bits
- [ ] Tilted card react bits
- [ ] Animate navbar
- [ ] Spotlight card react bits
- [ ] Dark veil or aurora react bits
- [x] Dot grid background
- [ ] Decrypted text react bits
- [ ] Promote `valuesGridRedesign` and `techStackPremium` from `dev-only` when ready

### Integrations

- [ ] Connect with GitHub API for project data
- [ ] Add LinkedIn integration
- [ ] Implement Twitter/X card previews
- [ ] Connect with email marketing service
- [ ] Add calendar booking integration (maybe Calendly)
- [ ] Twilio SMS for CI failure notifications (see feature doc)

### Advanced Features

- [ ] Add comment system for blog posts
- [ ] Implement newsletter signup
- [ ] Create interactive project demos
- [ ] Add social media integration
- [ ] Implement full-text search across all content
- [ ] Add RSS feed generation

### Documentation

- [ ] Create UI style guide for consistent design
- [ ] Write deployment instructions

### Content Ideas

- [ ] Write about the tech stack choices
- [ ] Create tutorial series on web development
- [ ] Document lessons learned from projects
- [ ] Share productivity tips and tools
- [ ] Write about career journey and experiences
- [ ] Salsa and Pretzels

### Miscellaneous Ideas

---

## ✅ Completed Tasks

### Core release infrastructure

- [x] Fix slug in metadata
- [x] Design and implement quotes page
- [x] Finish sitemap and robots.ts
- [x] Consolidate colors
- [x] Organize and slightly refine vitae details
- [x] Script for .env sync
- [x] Add About page CTA(s)
- [x] Formalize dev mode (with and without services)
- [x] Fix missing author from Directus call
- [x] Add navigation between blog posts (prev/next)
- [x] Add loading states/screens for API calls
- [x] Make client-primary
- [x] Flesh out project file cabinet idea
- [x] Establish baseline code coverage
- [x] Mandatory approvers to master/main
- [x] Global logging
- [x] Cloudflared
- [x] Clean up dev tooling
- [x] Images for about page
- [x] Make about page UX optimized
- [x] Figure out scalability for blog
- [x] Add pagination for blog listing page
- [x] Clean up eslint warnings
- [x] Add complete suite of e2e tests and improve unit test coverage
- [x] Stabilize e2e tests
- [x] Consider removing `dangerouslyAllowsSVGs` from next.config.ts
- [x] Fix planet featured view
- [x] Clean up command output directories

---

## 📝 Notes

- Last organized: 2026-07-02 (expanded from code + docs audit)
- Launch gate: [RELEASE_READINESS.md](./RELEASE_READINESS.md)
- Feature workflow: `cursor/*` → `dev` (no CI) → `main` (full CI)
- `dev` synced from `main`: 2026-07-02 — already up to date (dev is 15 commits ahead of main)
- Author profiles v1 (static fallback) is done; Directus `authors` collection deferred to v2 — see [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md)
- `og-default.png` and social URLs are explicitly "not required for launch" per RELEASE_READINESS but break social previews if shipped without them
