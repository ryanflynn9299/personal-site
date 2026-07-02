# Personal Site - TODO List

## 🎯 Next Actions (Priority Order)

_Start here — see also [RELEASE_READINESS.md](./RELEASE_READINESS.md) for the full launch gate._

### Before Launch — code (merge to `dev`, then `main` for release)

- [x] **Contact form: warn when SMTP unavailable** — never report mock success in production; show honest warning UI if email cannot be sent (see [SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md))
- [ ] Ensure responsive design works on mobile devices (manual sign-off)
- [x] Remove unused components and rename, archive out of use

### Before Launch — operator (home server / deploy day)

- [ ] **DECIDED — Admin is Tailscale-only: unlist `/admin` from the public domain.**
      Remove/never add the NPM route for `/admin`; access via Tailscale
      IP/MagicDNS only; set `ADMIN_REQUIRE_TAILSCALE=true` as backstop;
      verify from an off-tailnet network that the public URL dead-ends at
      the proxy. Full checklist: [ADMIN_ACCESS.md](./ADMIN_ACCESS.md)
- [ ] **Lock down Directus + Matomo admin** at reverse proxy (not public internet)
- [ ] **Complete Matomo launch tasks** (see [MATOMO_LAUNCH_CHECKLIST.md](./MATOMO_LAUNCH_CHECKLIST.md))
- [ ] **Production `.env` + Docker rebuild + smoke test** (see [RELEASE_READINESS.md](./RELEASE_READINESS.md))

### Before Launch — polish (optional, won't block ship)

- [ ] Add professional headshot/profile images
- [ ] Deep dive on Matomo (analytics tuning beyond install checklist)
- [ ] Versioning system/methodology
- [ ] See my latest LinkedIn posts??

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

- [ ] **Consolidate `BlogHighlight` inline `PostCard`** — `components/sections/BlogHighlight.tsx` defines a private `PostCard` that duplicates `components/blog/PostCard.tsx` (different markup, no reading time, untested). Review whether to reuse the shared component with a `variant="compact"` prop or extract a shared base. _Added during code health pass — awaiting operator review._
- [ ] **Matomo typed `window._paq` globals** — replace `(window as any)._paq` in `components/matomo/Matomo.tsx` with a `types/matomo.d.ts` ambient declaration. See PR notes for tradeoffs before implementing.
- [ ] **Implement real SMTP email delivery** (see [SMTP_LAUNCH_CHECKLIST.md](./SMTP_LAUNCH_CHECKLIST.md))
- [ ] Enable SEO for blogs in `lib/site/seo.ts` (`ENABLE_BLOG_SEO`) when content is ready
- [ ] add coverage check to main branch
- [ ] pre-commit check script (validate, test, compare coverage, build)
- [ ] Improve pre-commit checks for PR (PR naming conventions, etc.)
- [ ] Matomo analytics page on dashboard
- [x] Add author bio section for posts (with popup card) — see [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md)
- [x] Add "Back to top" button for long pages
- [ ] add slug hashing
- [ ] Clean up env variables and secrets (including dev and local)
- [ ] Add blog post categories/tags system
- [ ] Set up VSCode server and connect cursor for remote development pipeline
- [ ] Set up remote teardown command

### After Launch (Future)

- [ ] add christmas mode
- [ ] Establish CD pipeline
- [ ] Add twilio for build notis
- [ ] Create backup strategy for content
- [ ] Review and optimize bundle size
- [ ] Add photos gallery to About Page
- [ ] Add some kind of books commentary page or component
- [ ] Add duck animation easter eggs
- [ ] Add spotify integration
- [ ] Add socials links to About page
- [ ] Add more projects to vitae page
- [ ] Add code syntax highlighting for technical posts (terminal theme)
- [ ] Implement table of contents for long posts
- [ ] Add related posts suggestions
- [ ] Create post series/collections
- [ ] Add blog post excerpt/summary display
- [x] Add reading time estimates for blog posts
- [ ] connect counter to database

## Post-launch admin-oriented tasks

- [ ] Add admin dashboard for quick edits
- [ ] Add content scheduling functionality
- [ ] Create draft preview functionality

---

## 🐛 Bug Fixes

- [x] UNABLE_TO_GET_ISSUER_CERT_LOCALLY (SSL certificate issue)

---

## 📋 Backlog by Category

### Performance & SEO (not required for launch)

- [ ] Add proper meta tags for social sharing
- [ ] Create `og-default.png` and wire Open Graph image
- [ ] Update social profile URLs in `lib/site/seo.ts`

### User Experience

- [x] Implement smooth scrolling navigation
- [x] Create breadcrumb navigation
- [x] Improve toasts styling and limit
- [x] Stylize toasts to space theme

### Development & Infrastructure

- [x] Create deployment pipeline (CI/CD)
- [x] Complete successful CI run
- [x] Reduce build time for PR pipeline
- [ ] Set up error monitoring (Sentry)
- [ ] Audit accessibility compliance
- [ ] Refactor repetitive code patterns
- [x] Set up automated testing (Vitest + Playwright)

### Interactive Elements & UI Components

- [ ] Star border from react bits
- [x] Magic bento react bits
- [ ] Tilted card react bits
- [ ] Animate navbar
- [ ] Spotlight card react bits
- [ ] Dark veil or aurora react bits
- [x] Dot grid background
- [ ] Decrypted text react bits

### Integrations

- [ ] Connect with GitHub API for project data
- [ ] Add LinkedIn integration
- [ ] Implement Twitter/X card previews
- [ ] Connect with email marketing service
- [ ] Add calendar booking integration (maybe Calendly)
- [ ] Add twilio for build notis

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
- [x] establish baseline code coverage
- [x] Mandatory approvers to master/main
- [x] global logging
- [x] cloudflared
- [x] clean up dev tooling
- [x] images for about page
- [x] make about page UX optimized
- [x] Figure out scalability for blog
- [x] Add pagination for blog listing page
- [x] clean up eslint warnings
- [x] Add complete suite of e2e tests and improve unit test coverage
- [x] Stabilize e2e tests
- [x] Consider removing `dangerouslyAllowsSVGs` from next.config.ts
- [x] Fix planet featured view
- [x] clean up command output directories

---

## 📝 Notes

- Last organized: 2026-07-01
- Launch gate: [RELEASE_READINESS.md](./RELEASE_READINESS.md)
- Feature workflow: `cursor/*` → `dev` (no CI) → `main` (full CI)
