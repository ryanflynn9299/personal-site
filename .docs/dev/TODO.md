# Personal Site - TODO List

Active work lives **above** the divider; completed work is **below**. Launch gate: [RELEASE_READINESS.md](./RELEASE_READINESS.md).

---

## Next actions (priority order)

### Before launch — code

Merge to `dev`, then `main` for release.

- [ ] Ensure responsive design works on mobile devices (manual sign-off)

### Before launch — operator (home server / deploy day)

- [ ] **Admin is Tailscale-only** — unlist `/admin` from the public domain; access via Tailscale IP/MagicDNS; set `ADMIN_REQUIRE_TAILSCALE=true`; verify public URL dead-ends off-tailnet. Checklist: [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)
- [ ] Lock down Directus + Matomo admin at reverse proxy (not public internet)
- [ ] Complete Matomo launch tasks — [ANALYTICS.md](../ANALYTICS.md#launch-checklist)
- [ ] Production `.env` + Docker rebuild + smoke test — [RELEASE_READINESS.md](./RELEASE_READINESS.md)
- [ ] Set `NEXT_PUBLIC_SITE_URL` to production domain — [SEO.md](./SEO.md)

### Before launch — polish (optional, non-blocking)

- [ ] Add professional headshot/profile images
- [ ] Deep dive on Matomo (analytics tuning beyond install checklist)
- [ ] **LinkedIn posts on site** — clarify scope (embed vs manual curation vs remove); no spec yet

### First promote after launch

- [ ] **Matomo typed** `window._paq` globals — replace `(window as any)._paq` in `components/matomo/Matomo.tsx` with `types/matomo.d.ts`
- [ ] **Implement real SMTP email delivery** — [EMAIL.md](./EMAIL.md); `email-service.ts` still mock in production
- [ ] Enable blog SEO — `ENABLE_BLOG_SEO` in `lib/site/seo.ts` when content is ready
- [ ] Add Vitest coverage threshold + fail CI on `main` when below baseline
- [ ] Pre-commit check script (validate, test, coverage compare, build)
- [ ] Improve pre-commit checks for PR (naming conventions, etc.)
- [ ] Matomo analytics on admin dashboard — replace hardcoded telemetry in `TelemetryCards.tsx`
- [ ] Add slug hashing
- [ ] Clean up env variables and secrets (dev and local)
- [ ] Add blog post categories/tags system
- [ ] Set up VSCode server + Cursor remote development pipeline
- [ ] Set up remote teardown command
- [ ] **Wire admin Subspace Messages to Directus** `contact_messages` — panel shows hardcoded empty state
- [ ] **Admin dashboard version from SSOT** — replace hardcoded `CORE_VERSION: 2.1.0-STABLE` with `lib/site/version.ts`
- [ ] **Fix CI env var name** — `ci.yml` sets `DIRECTUS_URL_SERVER_SIDE`; schema reads `DIRECTUS_INTERNAL_URL`

### Post-launch — features & content

- [ ] Add related posts suggestions
- [ ] Create post series/collections
- [ ] Add blog post excerpt/summary display
- [ ] Add code syntax highlighting for technical posts (terminal theme)
- [ ] Connect counter to database — `counter.ts` random 1000–9999; `funCounter` hidden; Directus `counters` not created — [DIRECTUS.md](../DIRECTUS.md)
- [ ] Add photos gallery to About page
- [ ] Add books commentary page or component
- [ ] Add social links to About page
- [ ] Add more projects to vitae page

### Post-launch — admin & ops

- [ ] Add admin dashboard for quick edits
- [ ] Add content scheduling functionality
- [ ] Create draft preview functionality
- [ ] Wire maintenance mode toggle — `ControlConsole.tsx` "Shields" is disabled no-op
- [ ] Replace "Tactical Visualization Offline" placeholder on admin dashboard

### Post-launch — infrastructure & integrations

- [ ] Establish CD pipeline
- [ ] Add Twilio for build notifications — [.docs/features/TWILIO_SMS_NOTIFICATIONS.md](../features/TWILIO_SMS_NOTIFICATIONS.md)
- [ ] Create backup strategy for content
- [ ] Review and optimize bundle size
- [ ] Set up error monitoring (Sentry)
- [ ] Connect with GitHub API for project data
- [ ] Add LinkedIn integration
- [ ] Implement Twitter/X card previews
- [ ] Connect with email marketing service
- [ ] Add calendar booking integration (e.g. Calendly)

### Post-launch — backlog & ideas

- [ ] Add christmas mode
- [ ] Add duck animation easter eggs
- [ ] Add Spotify integration
- [ ] Add comment system for blog posts
- [ ] Implement newsletter signup
- [ ] Create interactive project demos
- [ ] Add social media integration
- [ ] Implement full-text search across all content
- [ ] Add RSS feed generation
- [ ] Write deployment instructions
- [ ] Refactor repetitive code patterns
- [ ] Audit accessibility compliance (beyond E2E heading/alt checks)

**Quotes (future):** admin dashboard to add quotes; load from DB; cache for common reads.

**Content ideas:** tech stack choices, tutorial series, lessons learned, productivity tips, career journey, Salsa and Pretzels.

**UI experiments (react bits):** star border, tilted card, animate navbar, spotlight card, dark veil/aurora, decrypted text; promote `valuesGridRedesign` and `techStackPremium` from `dev-only` when ready.

---

## Code gaps (audit 2026-07-02)

Incomplete implementations in source — not all are launch blockers.

| Severity                    | Location                               | Gap                                                                                                 |
| --------------------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Blocker (post-launch email) | `lib/services/email-service.ts`        | SMTP `sendEmail()` mock; refuses send in production                                                 |
| Blocker (feature)           | `app/actions/counter.ts`               | Random counter; no Directus `counters` collection                                                   |
| Important                   | `components/admin/TelemetryCards.tsx`  | Hardcoded fake metrics ("4.2k Hits", "98.4% Uptime")                                                |
| Important                   | `app/(admin)/admin/dashboard/page.tsx` | Subspace Messages not wired to Directus                                                             |
| Important                   | `public/images/og-default.png`         | File missing; `DEFAULT_OG_IMAGE` references broken URL                                              |
| Important                   | `lib/site/seo.ts`                      | `SOCIAL_PROFILES` are bare domain roots without handles                                             |
| Minor                       | `lib/site/seo.ts`                      | `ENABLE_BLOG_SEO = false` (intentional until content ready)                                         |
| Minor                       | `components/sections/AboutMe.tsx`      | Bio text marked `TODO: revise this text`                                                            |
| Minor                       | `components/common/Header.tsx`         | Brand icon is lucide `Atom` placeholder; custom SVG TODO                                            |
| Minor                       | `components/matomo/Matomo.tsx`         | `(window as any)._paq`; no `types/matomo.d.ts`                                                      |
| Minor                       | `app/manifest.ts`                      | PNG PWA icons commented out; `app/icon.png` / `app/apple-icon.png` missing                          |
| Minor                       | `lib/dev-tooling/features.ts`          | `offlineDummyBlogs`, `valuesGridRedesign`, `techStackPremium` still `dev-only`                      |
| Ops (deploy day)            | Operator checklist                     | Tailscale admin, Matomo install, production `.env` — [RELEASE_READINESS.md](./RELEASE_READINESS.md) |

---

## Polish backlog (open)

High-impact UX, a11y, SEO, and tests — ordered by priority.

### High

| Area      | Task                                                       | File(s)                                           |
| --------- | ---------------------------------------------------------- | ------------------------------------------------- |
| SEO       | Create `public/images/og-default.png` (1200×630)           | `lib/site/seo.ts`, `public/images/`               |
| SEO       | Fill in real social profile URLs                           | `lib/site/seo.ts`, `components/common/Footer.tsx` |
| UX        | Add `app/error.tsx` and `app/global-error.tsx`             | `app/`                                            |
| UX / perf | Parallelize blog post Directus fetches                     | `app/(portfolio)/blog/[slug]/page.tsx`            |
| UX        | Add `loading.tsx` skeletons for `/blog` and `/blog/[slug]` | `app/(portfolio)/blog/`                           |
| a11y      | Remove `role="dialog"` from mobile `<nav>` in Header       | `components/common/Header.tsx`                    |

### Medium

| Area      | Task                                                                 | File(s)                                                       |
| --------- | -------------------------------------------------------------------- | ------------------------------------------------------------- |
| a11y      | Add `aria-current="page"` to active nav links                        | `components/common/Header.tsx`                                |
| a11y      | `AnimatedText`: `aria-label` on h1, hide child spans, reduced motion | `components/primitives/misc/AnimatedText.tsx`                 |
| a11y      | Toast dismiss `aria-label` + `aria-live="polite"` on container       | `components/primitives/Toast.tsx`, `context/ToastContext.tsx` |
| a11y      | `EmailStatusIndicator` tooltip keyboard-accessible                   | `components/contact/EmailStatusIndicator.tsx`                 |
| a11y      | Footer social links: `focus-visible:ring`                            | `components/common/Footer.tsx`                                |
| UX / a11y | Blog search `Dialog.Title` — use `sr-only` title                     | `components/blog/BlogPageClient.tsx`                          |
| Admin UX  | Replace fake telemetry with "—" / "Not connected" until Matomo wired | `components/admin/TelemetryCards.tsx`                         |
| Tests     | Add `/vitae`, `/policies` to E2E accessibility page list             | `tests/e2e/accessibility.spec.ts`                             |
| Tests     | Component tests for `BlogPageClient` error / empty / grid branches   | `tests/components/`                                           |
| SEO       | Remove `/privacy` and `/terms` redirect URLs from sitemap            | `app/sitemap.ts`                                              |
| Docs      | Move floating TODO comment from About page to this file              | `components/about/AboutPageClient.tsx`                        |

### Low

| Area  | Task                                                            | File(s)                                    |
| ----- | --------------------------------------------------------------- | ------------------------------------------ |
| a11y  | Make contact form labels visually visible (not only `sr-only`)  | `components/contact/ContactPageClient.tsx` |
| UX    | Enrich blog empty state (icon, styled container, optional CTA)  | `components/blog/BlogPageClient.tsx`       |
| SEO   | Stable `lastModified` in sitemap (not `new Date()` every build) | `app/sitemap.ts`                           |
| SEO   | Consider `ENABLE_BLOG_SEO` as env var                           | `lib/site/seo.ts`                          |
| Code  | Remove commented-out SVG code in `Header.tsx`                   | `components/common/Header.tsx`             |
| Code  | Extract inline map callback types in vitae page                 | `app/(portfolio)/vitae/page.tsx`           |
| Tests | Toast a11y regression tests                                     | `tests/components/Toast.test.tsx`          |
| Tests | E2E: blog prev/next nav, author byline, reading time            | `tests/e2e/blog.spec.ts`                   |
| Tests | 404 page structural assertions                                  | `tests/e2e/error-pages.spec.ts`            |

### Performance & SEO (not required for launch)

- [ ] Add proper meta tags for social sharing (structures exist; assets/URLs incomplete)
- [ ] Evaluate time to first load

### User experience (remaining)

- [ ] Global error boundaries (`error.tsx`, `global-error.tsx`) — also in polish high table
- [ ] Route-level loading skeletons for blog
- [ ] Blog post page: parallel Directus fetches

---

## Documented, not yet tracked

Items from topic docs that belong on this list.

### [SEO.md](./SEO.md)

- [ ] Create `app/icon.png` (512×512) and `app/apple-icon.png` (180×180)
- [ ] Uncomment PNG icons in `app/manifest.ts` once assets exist
- [ ] Additional JSON-LD: `Person`, `WebSite` with search action, `BreadcrumbList`
- [ ] Per-page custom OG images for key landing pages
- [ ] Search Console / Bing verification meta tags

### [BLOG.md](./BLOG.md)

- [ ] Refactor `getAdjacentPosts()` to server-side Directus filtering (scalability)

### [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md) (v2+ deferred)

- [ ] Author avatar images (`avatar` field)
- [ ] `bio_long` markdown for dedicated author page
- [ ] Social link rows per author
- [ ] Multi-author UX (filters, bylines on post cards)
- [ ] Dedicated `/authors/[slug]` page
- [ ] Directus `authors` collection + M2O migration

### [CONTACT_FORM_OPTIONS.md](../features/CONTACT_FORM_OPTIONS.md)

- [ ] Auto-delete contact submissions after 90 days (optional)
- [ ] reCAPTCHA v3 (optional)

### [ANALYTICS.md](../ANALYTICS.md)

- [ ] Matomo goals, custom dimensions, email reports (post-launch tuning)

---

# ✅ Completed

---

## Launch & release

- [x] Wire admin middleware (`middleware.ts`)
- [x] Contact form honeypot + rate limiting — [CONTACT_FORM_SECURITY.md](./CONTACT_FORM_SECURITY.md)
- [x] Contact form: warn when SMTP unavailable — honest UI in production — [EMAIL.md](./EMAIL.md)
- [x] Fix contact page `mailto:` typo — `NEXT_PUBLIC_CONTACT_EMAIL` via `lib/site/contact.ts`
- [x] Matomo client cleanup (`config.matomo.enabled`)
- [x] Docker prod env wiring (SMTP, admin, Matomo build args)
- [x] Implement Terms and Privacy Policies wrt Matomo analytics
- [x] Quotes page — dev-only at launch (middleware + sitemap + robots)
- [x] Clean up documentation — [RELEASE_READINESS.md](./RELEASE_READINESS.md)
- [x] CI: no auto checks on `dev`; full CI on `main`; manual dispatch
- [x] Branch sync: `dev` staging, `main` production
- [x] AI guardrails — `AGENTS.md`, `.cursor/rules/`, `AI_GUARDRAILS.md`
- [x] Versioning system — [VERSIONING.md](./VERSIONING.md)
- [x] Remove unused components; rename and archive out-of-use code
- [x] Fix slug in metadata
- [x] Finish sitemap and `robots.ts`
- [x] Mandatory approvers to `main`
- [x] Cloudflared

## Blog & reading experience

- [x] Table of contents for long posts — [BLOG.md](./BLOG.md)
- [x] Breadcrumb navigation — [BLOG.md](./BLOG.md)
- [x] Reading time estimates
- [x] Author bio section with popup card — [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md)
- [x] Consolidate `BlogHighlight` inline `PostCard` — unified `PostCard.tsx` with `instance` API
- [x] Navigation between blog posts (prev/next)
- [x] Pagination for blog listing
- [x] Figure out blog scalability (documented in BLOG.md)
- [x] Add loading states for API calls

## Policies & markdown content

- [x] Policy viewer markdown rework — shared `lib/markdown/`, outline headings — [POLICIES.md](./POLICIES.md), [MARKDOWN_CONTENT.md](./MARKDOWN_CONTENT.md)

## Documentation & design system

- [x] UI style guide — [DESIGN.md](./DESIGN.md) (guidance); feature UI in domain docs
- [x] Documentation taxonomy — guidance vs feature — [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md)
- [x] Blog spacing tokens — `lib/blog/spacing.ts`

## UX & components

- [x] "Back to top" button for long pages
- [x] Smooth scrolling navigation
- [x] Improve and stylize toasts (space theme)
- [x] Design and implement quotes page
- [x] About page CTA(s); images; UX pass
- [x] Make about page client-primary
- [x] Flesh out project file cabinet
- [x] Fix planet featured view
- [x] Magic bento (react bits)
- [x] Dot grid background
- [x] Consolidate colors
- [x] Organize and refine vitae details

## Admin, CI & infrastructure

- [x] Create deployment pipeline (CI/CD)
- [x] Complete successful CI run
- [x] Reduce PR pipeline build time
- [x] Set up automated testing (Vitest + Playwright)
- [x] Establish baseline code coverage
- [x] Stabilize E2E tests
- [x] Add complete E2E suite; improve unit coverage
- [x] Clean up eslint warnings
- [x] Global logging
- [x] Clean up dev tooling
- [x] Script for `.env` sync
- [x] Formalize dev mode (with and without services)
- [x] Fix missing author from Directus call
- [x] Clean up command output directories
- [x] Consider removing `dangerouslyAllowsSVG` from `next.config.ts`

## Bug fixes

- [x] `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` (SSL certificate issue)
- [x] Contact page `mailto:` href typo (see Launch & release)

---

## Notes

- **Last organized:** 2026-07-07
- **Launch gate:** [RELEASE_READINESS.md](./RELEASE_READINESS.md)
- **Branch workflow:** `cursor/*` → `dev` (no CI) → `main` (full CI)
- **Author profiles:** v1 (static fallback) shipped; Directus `authors` collection deferred — [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md)
- **Social previews:** `og-default.png` and real social URLs are optional for launch per RELEASE_READINESS, but previews break if shipped without them
