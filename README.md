# Personal Site - Technical Documentation

![CI](https://github.com/YOUR_USERNAME/YOUR_REPO/workflows/CI/badge.svg)

A modern personal portfolio website built with Next.js, TypeScript, and Tailwind CSS, featuring a headless CMS integration for blog content management.

> **Note:** Replace `YOUR_USERNAME` and `YOUR_REPO` in the badge URL above with your actual GitHub username and repository name after pushing to GitHub.

## Technology Stack

### Core Framework

- **Next.js 16.0.7** - React framework with App Router, server-side rendering, and file-based routing
- **React 19.2.1** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 3.4.17** - Utility-first CSS framework

### Content Management

- **Directus SDK 16.1.0** - Headless CMS for blog content management

### UI & Animation Libraries

- **Framer Motion 12.19.1** - Animation library for React
- **GSAP 3.13.0** - Advanced animation library
- **Radix UI** - Accessible component primitives
- **Embla Carousel 8.6.0** - Carousel component library
- **Lucide React** - Icon library

### Content Processing

- **React Markdown 10.1.0** - Markdown rendering
- **Rehype** - HTML processing plugins (raw, sanitize)
- **Remark GFM** - GitHub Flavored Markdown support

### Utilities

- **Pino 10.0.0** - Structured logging
- **Class Variance Authority** - Component variant management
- **Tailwind Merge** - Merge Tailwind classes intelligently

## Version Requirements

### Runtime

- **Node.js**: 18.17+ (Next.js 16 requires 18.17 or later; 20.x LTS recommended)
- **npm**: 9.8+ (comes with Node.js)

### Build Tools

- **Next.js**: 16.0.7
- **TypeScript**: 5.x
- **Turbopack**: Enabled by default (Next.js 16's new bundler)

## Project Structure

```
personal-site/
├── app/                          # Next.js App Router pages
│   ├── (admin)/                  # Admin routes group
│   │   └── dashboard/            # Admin dashboard
│   ├── (portfolio)/              # Public portfolio routes group
│   │   ├── about/                # About page
│   │   ├── blog/                 # Blog listing and posts
│   │   │   └── [slug]/           # Dynamic blog post pages
│   │   ├── contact/              # Contact page
│   │   ├── vitae/                # CV/resume page
│   │   ├── policies/             # Policies page
│   │   ├── privacy/              # Privacy policy
│   │   ├── terms/                # Terms of service
│   │   └── page.tsx              # Homepage
│   ├── actions/                  # Server actions
│   │   └── contact.ts            # Contact form handler
│   ├── layout.tsx                # Root layout
│   ├── globals.css               # Global styles
│   ├── not-found.tsx             # 404 page
│   ├── robots.ts                 # Robots.txt generator
│   └── sitemap.ts                # Sitemap generator
│
├── components/                   # React components
│   ├── about/                    # About page components
│   ├── blog/                     # Blog components
│   ├── contact/                  # Contact page components
│   ├── common/                   # Shared components
│   ├── primitives/               # Base UI components
│   ├── sections/                 # Page sections
│   ├── Header.tsx                # Site header
│   ├── Footer.tsx                # Site footer
│   └── [other components]        # Various feature components
│
├── lib/                          # Utility functions and services
│   ├── directus.ts              # Directus CMS client
│   ├── email-service.ts         # Email sending service
│   ├── logger.ts                # Logging utility
│   └── utils.ts                 # General utilities
│
├── data/                         # Static data files
│   ├── about.ts                 # About page data
│   ├── projects.ts              # Project data
│   ├── skills.ts                # Skills data
│   ├── work_experience.ts       # Work experience data
│   └── policies/                # Policy markdown files
│
├── types/                        # TypeScript type definitions
│   ├── animations.ts            # Animation types
│   ├── components.ts            # Component types
│   ├── data.ts                  # Data types
│   └── index.ts                 # Type exports
│
├── constants/                    # Application constants
│   ├── animations.ts            # Animation constants
│   └── ui.ts                    # UI constants
│
├── context/                      # React contexts
│   └── ToastContext.tsx         # Toast notification context
│
├── public/                       # Static assets
│   ├── images/                  # Image assets
│   └── [other static files]     # PDFs, SVGs, etc.
│
├── sync-service/                 # Content sync service
│   ├── webhook-server.py        # Webhook server
│   └── [sync scripts]           # Sync utilities
│
├── docker-compose.yml            # Docker Compose configuration
├── Dockerfile                    # Docker build configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Common Commands

### Development

```bash
# Install dependencies
npm install

# Start development server (with Turbopack)
npm run dev
# Runs at http://localhost:3000

# Start development server (with Webpack - legacy)
npm run build:webpack
```

### Code Quality

```bash
# Check code formatting (Prettier)
npm run lint

# Fix formatting issues
npm run lint:fix
# or
npm run format

# Check formatting without fixing
npm run format:check

# Run ESLint
npm run eslint

# Fix ESLint issues
npm run eslint:fix

# Type checking
npm run type-check

# Run all validation checks
npm run validate
```

### Build & Production

```bash
# Build for production (with Turbopack)
npm run build

# Build for production (with Webpack - legacy)
npm run build:webpack

# Start production server
npm run start

# Analyze bundle size
npm run analyze
```

### Maintenance

```bash
# Clean build artifacts and cache
npm run clean
```

## Environment Setup

### Required Environment Variables

Create a `.env.local` file in the project root:

```env
# Directus CMS Configuration
DIRECTUS_URL_SERVER_SIDE=http://ps-directus:8055  # Internal server-side URL
NEXT_PUBLIC_DIRECTUS_URL=http://localhost:8055    # Public client-side URL

# Email Service (if using contact form)
# Add your email service configuration here
```

### Environment-Specific Notes

- **Development**: Uses localhost URLs for Directus
- **Docker**: Uses service names (e.g., `ps-directus`) for container-to-container communication
- **Production**: Update URLs to your production Directus instance

## Core Infrastructure

### Directus CMS Integration

The site uses Directus as a headless CMS for blog content:

- **Location**: `lib/directus.ts`
- **Functions**:
  - `getPublishedPosts()` - Fetch all published blog posts
  - `getPostBySlug(slug)` - Fetch a single post by slug
  - `isDirectusConfigured()` - Check if Directus is configured

**Blog Post Schema** (expected in Directus):

- `id` (string)
- `title` (string)
- `slug` (string) - URL-friendly identifier
- `summary` (string)
- `content` (string) - HTML content
- `publication_date` (date)
- `status` ('published' | 'draft' | 'archived')
- `feature_image` (file/image)
- `author` (relation to users)
- `blog_tags` (array)

### Animation System

The site uses multiple animation libraries:

- **Framer Motion**: Page transitions and component animations
- **GSAP**: Advanced timeline-based animations
- **Animation Constants**: Defined in `constants/animations.ts`
- **Animation Types**: Defined in `types/animations.ts`

### Styling System

- **Tailwind CSS**: Primary styling framework
- **Custom Colors**: Slate and Sky color palettes (see `tailwind.config.ts`)
- **Typography**: Montserrat (headings) and Open Sans (body)
- **Typography Plugin**: `@tailwindcss/typography` for markdown content

### Logging

- **Pino**: Structured logging library
- **Location**: `lib/logger.ts`
- **Usage**: Server-side logging with structured JSON output

### Component Architecture

- **Primitives**: Base components in `components/primitives/`
- **Sections**: Reusable page sections in `components/sections/`
- **Feature Components**: Feature-specific components organized by domain
- **Radix UI**: Accessible component primitives for complex UI elements

## Development Workflow

### Making Changes

1. **New Pages**: Create folders in `app/` directory
   - `app/new-page/page.tsx` → `/new-page` URL
   - Use route groups `(folder)` for organization without affecting URLs

2. **New Components**: Add to `components/` directory
   - Export: `export function ComponentName() {}`
   - Import: `import { ComponentName } from "@/components/ComponentName"`

3. **Styling**: Use Tailwind utility classes
   - Custom colors: `bg-slate-900`, `text-sky-400`
   - Typography: `font-heading` (Montserrat), `font-sans` (Open Sans)

4. **API/Data**: Add utilities to `lib/` directory
   - Use Directus SDK for CMS operations
   - Handle errors gracefully with try/catch

### TypeScript Paths

The project uses path aliases:

- `@/*` maps to project root
- Example: `import { Post } from "@/types"`

## CI/CD Pipeline

This project includes a complete CI/CD pipeline configured with GitHub Actions. See [CI/CD Setup Guide](.docs/dev/CI_CD_SETUP.md) for:

- Pipeline configuration and steps
- Status badge setup
- Maintenance requirements
- Tooling recommendations (free external tools vs home server)
- Advanced configuration options

## Deployment

### Build Process

```bash
npm run build
```

This creates an optimized `.next/` folder with:

- Server-side rendered pages
- Static assets
- API routes
- Standalone output (configured for Docker)

### Docker Deployment

The project includes Docker configuration:

- `Dockerfile` - Production build
- `docker-compose.yml` - Multi-container setup
- Uses Next.js standalone output mode

### Production Considerations

1. **Environment Variables**: Set all required variables in your hosting platform
2. **Directus URL**: Update to production Directus instance URL
3. **Image Domains**: Configured in `next.config.ts` under `images.remotePatterns`
4. **Build Optimization**: Turbopack is used by default for faster builds

## Troubleshooting

### Development Server Issues

```bash
# Clean and reinstall
npm run clean
rm -rf node_modules
npm install
npm run dev
```

### Build Failures

1. Run validation: `npm run validate`
2. Check TypeScript errors: `npm run type-check`
3. Check formatting: `npm run lint`
4. Check code quality: `npm run eslint`
5. Verify environment variables are set

### Directus Connection Issues

- Verify environment variables are set correctly
- Check Directus instance is running and accessible
- Review `lib/directus.ts` for connection logic
- Check server-side vs client-side URL configuration

### Styling Issues

- Verify Tailwind classes are spelled correctly
- Check custom colors in `tailwind.config.ts`
- Use browser dev tools to inspect applied styles
- Ensure content paths in `tailwind.config.ts` include your files

## Maintenance Notes

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update all dependencies
npm update

# Update specific package
npm install package-name@latest
```

### Code Quality Before Committing

The project includes a `prepare` script that reminds you to run validation:

```bash
npm run validate
```

This runs:

- Type checking
- Formatting checks
- ESLint checks

### Content Updates

- **Blog Posts**: Managed through Directus CMS admin interface
- **Static Content**: Edit files in `data/` directory
- **Policies**: Edit markdown files in `data/policies/`

### Performance Monitoring

- Use `npm run analyze` to check bundle sizes
- Monitor build times (Turbopack should be faster)
- Check Next.js build output for optimization suggestions

## Quick Reference

| Task                  | Command              |
| --------------------- | -------------------- |
| Start development     | `npm run dev`        |
| Build for production  | `npm run build`      |
| Run validation        | `npm run validate`   |
| Fix formatting        | `npm run format`     |
| Type check            | `npm run type-check` |
| Clean build artifacts | `npm run clean`      |

**Key Paths**:

- Components: `@/components/ComponentName`
- Utilities: `@/lib/utilityName`
- Types: `@/types`
- Data: `@/data`

**Styling**: Tailwind classes in `className` prop
**CMS**: Directus configured via environment variables
**Routes**: File-based routing in `app/` directory

---

## Codebase Metrics

Track project size over time with these commands (requires [cloc](https://github.com/AlDanial/cloc)):

**All project code:**

```bash
cloc . \
  --exclude-dir=node_modules,.next,playwright-report,test-results,.git,.docs \
  --not-match-f="(package-lock\.json|pnpm-lock\.yaml|tsconfig\.tsbuildinfo)"
```

**Source code only (excludes tests):**

```bash
cloc . \
  --exclude-dir=node_modules,.next,playwright-report,test-results,.git,.docs,tests \
  --not-match-f="(package-lock\.json|pnpm-lock\.yaml|tsconfig\.tsbuildinfo|\.test\.|\.spec\.)"
```
