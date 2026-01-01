# Personal Site - TODO List

## 🎯 Next Actions (Priority Order)

_Start here - these are the most important items to tackle next_

### Before Next promotion

- [x] Fix slug in metadata
- [x] Design and implement quotes page
- [x] Fix planet featured view
- [x] Consider removing `dangerouslyAllowsSVGs` from next.config.ts
- [x] Finish sitemap and robots.ts
- [x] Consolidate colors
- [x] clean up command output directories (check build out too)

### Next promotion

- [ ] Script for .env sync
- [ ] Deep dive on Matomo
- [ ] Add a config for production quotes setup
- [ ] Formalize dev mode (with and without services)
- [ ] Configure secrets for dev mode/local testing
- [ ] Fix missing author from Directus call
- [ ] Organize and slightly refine vitae details
- [ ] connect counter to database
- [ ] Add navigation between blog posts (prev/next)
- [ ] Add loading states/screens for API calls
- [ ] Update site metadata (title, description, favicon)
- [ ] Make client-primary
- [ ] Flesh out project file cabinet idea
- [ ] establish baseline code coverage
- [ ] add coverage check to main branch
- [ ] pre-commit check script (validate, test, compare coverage, build)
- [ ] Improve pre-commit checks for PR (PR naming conventions, etc)
- [ ] Reduce build time for PR pipeline
- [ ] Mandatory approvers to master/main
- [ ] Establish CD pipeline

### Before Launch - After UI reviewers

- [ ] Add professional headshot/profile images
- [ ] images for about page
- [ ] Ensure responsive design works on mobile devices
- [ ] Figure out scalability for blog
- [ ] Add pagination for blog listing page
- [ ] make about page UX optimized
- [ ] Finish quotes page and make final selection
- [ ] See my latest LinkedIn posts??
- [ ] Enable SEO for blogs in lib/seo.ts
- [ ] Versioning system/methodology
- [ ] Implement Terms and Privacy Policies wrt Matomo analytics

### First promote after launch

- [ ] Add author bio section for posts (with popup card)
- [ ] Add "Back to top" button for long pages
- [ ] Matomo analytics page on dashboard
- [ ] Set up VSCode server and connect cursor for remote development pipeline
- [ ] Set up remote teardown command
- [ ] add slug hashing

### After Launch (Future)

- [ ] add christmas mode
- [ ] Add twilio for build notis
- [ ] Create backup strategy for content
- [ ] Review and optimize bundle size

---

## 🐛 Bug Fixes

- [x] UNABLE_TO_GET_ISSUER_CERT_LOCALLY (SSL certificate issue)

---

## 📋 Backlog by Category

### Content & Features

- [ ] Add blog post categories/tags system
- [ ] Create draft preview functionality
- [ ] Add blog post excerpt/summary display
- [ ] Add code syntax highlighting for technical posts (terminal theme)
- [ ] Implement table of contents for long posts
- [ ] Add related posts suggestions
- [ ] Create post series/collections

### User Experience

- [ ] Implement smooth scrolling navigation
- [ ] Add reading time estimates for blog posts
- [ ] Create breadcrumb navigation
- [x] Improve toasts styling and limit
- [x] Stylize toasts to space theme

### Performance & SEO

- [x] Optimize images with Next.js Image component
- [ ] Add proper meta tags for social sharing
- [x] Implement structured data for blog posts
- [x] Set up Google Analytics or similar

### Development & Infrastructure

- [x] Create deployment pipeline (CI/CD)
- [x] Complete successful CI run
- [ ] Set up error monitoring (Sentry)
- [ ] Audit accessibility compliance
- [ ] Refactor repetitive code patterns
- [ ] Set up automated testing (Jest/Cypress)

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
- [ ] Create admin dashboard for quick edits
- [ ] Add content scheduling functionality
- [ ] Implement A/B testing for different layouts

### Documentation

- [ ] Create UI style guide for consistent design
- [ ] Consolidate and refine documentation
- [ ] Write deployment instructions
- [ ] Document Directus schema and relationships
- [ ] Create troubleshooting guide
- [ ] Add to README:
  - Toasts and error handling
  - Animations
  - Download resume

### Content Ideas

- [ ] Write about the tech stack choices
- [ ] Create tutorial series on web development
- [ ] Document lessons learned from projects
- [ ] Share productivity tips and tools
- [ ] Write about career journey and experiences

### Miscellaneous Ideas

- [ ] Implement hidden sections revealed by URL manipulation or sessions for gemini links and other organizational nonsense

---

## ✅ Completed Tasks

_Recently completed items (for reference)_

### Core Functionality

- [x] Make featured projects a carousel
- [x] Support skills tags on projects in vitae
- [x] Add a blog post
- [x] Placeholder images
- [x] Update about page with more content
- [x] Update vitae information
- [x] Attach real resume
- [x] Implement blog post detail pages
- [x] Add search for blogs
- [x] Create proper 404 page for missing blog posts
- [x] Implement proper error boundaries

### Bug Fixes

- [x] Fix TypeScript error in `readItems` call for posts collection
- [x] Verify all Directus API calls handle errors properly
- [x] Test blog post rendering with actual content
- [x] Fix any console errors in development

### Content & Setup

- [x] Add actual blog posts to Directus CMS
- [x] Write and publish first blog post
- [x] Set up production environment variables
- [x] Add 3 blog posts to home screen
- [x] Support markdown blogs

### Development & Maintenance

- [x] Make sure no ENV variables are hardcoded in the codebase
- [x] Add code formatting with Prettier
- [x] Clean up code and comments
- [x] Clean up files and directories
- [x] Add tests
- [x] Clean up unused dependencies
- [x] Update to latest framework versions

### Portfolio Features

- [x] Add resume/CV download functionality
- [x] Implement contact form

### Future Items (Completed)

- [x] Implement blog post search functionality

---

## 📝 Notes

- Last organized: 2026-01-XX
- Focus on Next Actions section for immediate work
- Move items to Completed section when done
- Archive old completed items periodically
