# Personal Portfolio Website

![CI Status](https://github.com/ryanflynn9299/personal-site/workflows/CI/badge.svg)
![Node.js Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)
![pnpm Version](https://img.shields.io/badge/pnpm-10.0.0-orange)
![Next.js Version](https://img.shields.io/badge/Next.js-16.0.7-black)
![TypeScript Version](https://img.shields.io/badge/TypeScript-5.5.4-blue)
![License](https://img.shields.io/badge/license-All%20Rights%20Reserved-red)
![Test Coverage](https://img.shields.io/badge/coverage-60%25+-green)

A modern, full-stack personal web application built with Next.js, TypeScript, and a headless CMS.

> **Note:** This project is currently a work in progress.

## Overview

This project represents my personal corner of the internet—a dedicated space to curate my work, share thoughts, and experiment with new technologies. It serves two primary purposes:

1.  **A Professional Showcase**: Communicating my background, experience, and projects in a clear, accessible format.
2.  **A Technical Playground**: A vertically integrated laboratory where I can implement architectural patterns, try new libraries, and refine my understanding of the modern web stack in a production-like environment.

The codebase prioritizes readability, strict type safety, and maintainability to ensure the project can grow and evolve over time.

## Architecture

### Framework & Core Technologies

The application is built on **Next.js 16** using the App Router architecture, providing server-side rendering, static site generation, and API routes. The choice of Next.js enables optimal performance through automatic code splitting, image optimization, and efficient data fetching strategies.

**Key architectural decisions:**

- **App Router**: Leverages React Server Components for improved performance and reduced client-side JavaScript
- **TypeScript**: Full type safety across the application with strict mode enabled
- **Component Architecture**: Clear separation between server components (routing, data fetching) and client components (interactivity, animations)
- **Modular Design**: Feature-based organization with shared primitives, utilities, and common components

### Project Structure

```
app/                          # Next.js App Router
├── (portfolio)/             # Public-facing routes
│   ├── page.tsx             # Homepage
│   ├── about/               # About page
│   ├── blog/                # Blog listing and dynamic posts
│   ├── contact/             # Contact form
│   ├── vitae/               # Resume/CV page
│   ├── quotes/              # Interactive quote visualizations
│   └── projects-cabinet/    # Project showcase
├── (admin)/                 # Admin routes (under development)
├── actions/                 # Server actions
└── layout.tsx               # Root layout with metadata

components/                   # React components
├── primitives/              # Base UI components (Button, Toast, etc.)
├── sections/                # Reusable page sections
├── common/                  # Shared utility components
└── [feature]/               # Feature-specific components

lib/                         # Utilities and services
├── env.ts                   # Environment configuration & validation
├── directus.ts              # CMS client integration
├── email-service.ts         # Email service abstraction
├── seo.ts                   # SEO metadata management
└── utils.ts                 # General utilities

tests/                       # Test suite
├── unit/                    # Unit tests (Vitest)
├── components/              # Component tests
├── integration/             # Integration tests
├── e2e/                     # End-to-end tests (Playwright)
└── mocks/                   # MSW handlers and setup
```

### Technology Stack

**Core Framework:**

- Next.js 16.1.1 (App Router, Turbopack)
- React 19.2.1
- TypeScript 5.5.4

**Styling & UI:**

- Tailwind CSS 3.4.17 (utility-first CSS)
- Framer Motion 12.19.1 (animations)
- Radix UI (accessible primitives)
- Custom design system with consistent color palettes and typography

**Content Management:**

- Directus 16.1.0 (headless CMS for blog content)
- React Markdown with rehype/remark plugins for content rendering

**State Management:**

- Zustand (lightweight state management for client-side state)
- React Context (toast notifications, theme)

**Animation Libraries:**

- Framer Motion (React component animations)
- GSAP 3.13.0 (advanced timeline-based animations)
- Three.js (WebGL-based 3D visualizations)

**Testing:**

- Vitest (unit and integration tests)
- React Testing Library (component testing)
- Playwright (end-to-end testing)
- MSW (Mock Service Worker for API mocking)

**Development Tools:**

- ESLint 9.39.2 (code quality)
- Prettier (code formatting)
- TypeScript (type checking)
- pnpm 10.0.0 (package management)

## Key Features & Implementation

### Blog System

The blog is powered by Directus CMS, providing a headless content management solution. Blog posts are fetched server-side at build time for static generation, with dynamic routes for individual posts. The implementation includes:

- Server-side data fetching with proper error handling
- Markdown and HTML content rendering with sanitization
- SEO optimization with structured data (JSON-LD)
- Image optimization using Next.js Image component
- Content format detection (markdown, HTML, plaintext)

### Interactive Quote Visualizations

A sophisticated quote display system with multiple visualization modes:

- **Normal Mode**: Traditional list views with variants (Mission Control, Tesseract 3D)
- **Constellation Mode**: Interactive WebGL visualizations (Constellation, Solar System, Hex Array)
- State management via Zustand for view mode and variant selection
- Responsive design with mobile-optimized layouts
- Keyboard navigation and accessibility features

### Contact Form

Server action-based contact form with:

- Client-side validation
- Server-side processing with error handling
- Email service abstraction (configurable backend)
- Toast notifications for user feedback
- Rate limiting considerations

### Project Showcase

Interactive project display with:

- File cabinet visualization component
- Modal-based project details
- Category-based organization
- Responsive grid layouts

## Development Practices

### Testing Strategy

The project maintains a comprehensive testing suite:

- **Unit Tests**: Utility functions, pure logic, and data transformations
- **Component Tests**: React components with user interaction testing
- **Integration Tests**: Server actions, API integrations, and data flow
- **E2E Tests**: Critical user journeys across multiple browsers (Chromium, Firefox, WebKit)

Test coverage focuses on user-facing behavior and critical paths rather than exhaustive edge cases, maintaining a balance between thoroughness and maintainability.

### Code Quality

- **TypeScript**: Strict mode enabled with comprehensive type definitions
- **ESLint**: Custom configuration with Next.js, React, and TypeScript rules
- **Prettier**: Consistent code formatting
- **Pre-commit Validation**: Automated checks for type errors, linting, and formatting

### CI/CD Pipeline

GitHub Actions workflow includes:

- Linting and type checking
- Unit and integration test execution
- End-to-end test suite (Playwright)
- Production build verification
- Automated dependency caching for faster builds

The pipeline runs on all pushes and pull requests, ensuring code quality before merging.

### Performance Optimizations

- **Image Optimization**: Next.js Image component with automatic format conversion and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Static Generation**: Blog posts and static pages pre-rendered at build time
- **Server Components**: Reduced client-side JavaScript bundle size
- **Turbopack**: Faster development builds and hot module replacement

## Build & Deployment

### Development

```bash
# Install dependencies
pnpm install

# Start development server (Turbopack)
pnpm run dev

# Run type checking
pnpm run type-check

# Run tests
pnpm run test
pnpm run test:e2e
```

### Production Build

The application builds to a standalone output optimized for containerized deployment:

```bash
pnpm run build
```

The build process:

- Compiles TypeScript
- Optimizes images and assets
- Generates static pages where possible
- Creates server-side rendering bundles
- Outputs to `.next/standalone` for Docker deployment

### Docker Deployment

The project includes Docker configuration for containerized deployment:

- Multi-stage Dockerfile for optimized image size
- Docker Compose setup for local development with CMS
- Standalone Next.js output mode for production containers

### Environment Configuration

The application uses environment variables for configuration:

- CMS connection settings (Directus)
- Email service configuration
- Analytics (optional Matomo integration)
- Site metadata and URLs

The application gracefully handles missing optional services, allowing it to function with core features even when external services aren't configured.

## Technical Highlights

### Type Safety

Comprehensive TypeScript usage throughout:

- Strict type checking enabled
- Custom type definitions for all data structures
- Type-safe API client integration
- Proper handling of nullable/optional values

### Configuration Management

- **Centralized Environment Handling**: All environment variables are accessed through a typed interface (`lib/env.ts`) which validates configuration at runtime.
- **Mode-Based Logic**: Explicit handling for different application states (Production, Live-Dev, Offline-Dev, Test) to ensure safety across environments.

### Component Architecture

Clear separation of concerns:

- **Server Components**: Data fetching, metadata generation, static content
- **Client Components**: Interactivity, animations, browser APIs
- **Shared Primitives**: Reusable base components with consistent APIs
- **Feature Components**: Domain-specific components organized by feature

### State Management

Appropriate state management for different use cases:

- React Server Components for server-side state
- React hooks for component-local state
- Zustand for cross-component client state
- React Context for application-wide UI state (toasts)

### Accessibility

Accessibility considerations:

- Semantic HTML structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader considerations
- Focus management

### SEO

Built-in SEO optimizations:

- Dynamic metadata generation per page
- Structured data (JSON-LD) for blog posts
- Sitemap generation
- Robots.txt configuration
- Open Graph and Twitter Card support

## Project Philosophy

This project balances practical engineering with creative exploration. It demonstrates:

- **Production-Ready Practices**: Testing, CI/CD, type safety, error handling
- **Modern Tooling**: Latest stable versions of frameworks and libraries
- **Maintainability**: Clear structure, documentation, and consistent patterns
- **Performance Awareness**: Optimization strategies without premature optimization
- **Learning Through Practice**: Experimentation with new technologies and patterns

The codebase is structured to be understandable by others (and my future self) while allowing flexibility for experimentation and iteration.



---

_This README provides a technical overview of the project structure and implementation. For setup instructions or detailed development guidelines, see the project's internal documentation._
