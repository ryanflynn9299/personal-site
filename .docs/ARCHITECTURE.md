# Project Architecture & File Organization Guidelines

This document defines the file organization standards for this Next.js 15 project. Follow these guidelines when creating, organizing, or refactoring files.

## Core Principles

1. **Separation of Concerns**: Server components, client components, data, types, and utilities are clearly separated
2. **Feature Co-location**: Related files are grouped by feature/domain
3. **Consistent Naming**: Use consistent naming patterns across the codebase
4. **Type Safety**: All TypeScript types are centralized in `types/`
5. **Reusability**: Shared code lives in appropriate shared directories

---

## Directory Structure

### `app/` - Next.js App Router

**Purpose**: Server-side route definitions and metadata

**Structure**:

```
app/
├── (route-groups)/          # Route groups for organization (e.g., (portfolio), (admin))
│   └── [feature]/
│       └── page.tsx         # Server component, exports metadata, renders client component
├── actions/                 # Server actions (use "use server" directive)
│   └── [feature].ts         # Named after the feature (e.g., contact.ts)
├── layout.tsx               # Root layout
├── globals.css              # Global styles
└── [config files]           # robots.ts, sitemap.ts, etc.
```

**Rules**:

- `page.tsx` files are **always** server components
- `page.tsx` files export `metadata` and render a corresponding `*PageClient` component
- Server actions go in `app/actions/` with descriptive names
- Route groups use parentheses: `(portfolio)`, `(admin)`
- Dynamic routes use brackets: `[slug]`, `[id]`

**Example**:

```tsx
// app/(portfolio)/about/page.tsx
import type { Metadata } from "next";
import { AboutPageClient } from "@/components/about/AboutPageClient";

export const metadata: Metadata = {
  title: "About Me",
  description: "...",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
```

---

### `components/` - React Components

**Purpose**: All React components organized by scope and purpose

**Structure**:

```
components/
├── [feature]/                    # Feature-specific components
│   ├── [Feature]PageClient.tsx   # Main client component for a page
│   └── [Feature]SubComponent.tsx # Supporting components for that feature
├── sections/                     # Reusable page sections (HeroSection, TechStack, etc.)
├── common/                       # Shared utility components (DevModeIndicator, etc.)
├── primitives/                    # Base UI components (Button, Toast, BentoCard)
├── ui/                           # Additional UI component library (if needed)
└── [standalone].tsx              # Standalone components used across features
```

**Naming Conventions**:

- **Page Client Components**: `[Feature]PageClient.tsx` (PascalCase, "PageClient" suffix)
  - Example: `AboutPageClient.tsx`, `ContactPageClient.tsx`
- **Feature Components**: `[Feature][Purpose].tsx` (PascalCase, descriptive)
  - Example: `SearchButton.tsx`, `EmailStatusIndicator.tsx`
- **Sections**: `[SectionName].tsx` (PascalCase, descriptive)
  - Example: `HeroSection.tsx`, `TechStack3.tsx`
- **Common Components**: `[ComponentName].tsx` (PascalCase)
  - Example: `DevModeIndicator.tsx`, `AnimatedText.tsx`
- **Primitives**: `[ComponentName].tsx` (PascalCase, base UI)
  - Example: `Button.tsx`, `Toast.tsx`

**Rules**:

- All client components must have `"use client"` directive at the top
- Page client components are paired with `app/` page files
- Feature-specific components live in `components/[feature]/`
- Reusable sections go in `components/sections/`
- Base UI primitives go in `components/primitives/`
- Shared utility components go in `components/common/`
- Use PascalCase for all component file names
- Export components as named exports: `export function ComponentName() {}`

**Example**:

```tsx
// components/about/AboutPageClient.tsx
"use client";

export function AboutPageClient() {
  // Component implementation
}
```

---

### `data/` - Static Data & Content

**Purpose**: Static data files, content, and markdown resources

**Structure**:

```
data/
├── [feature].ts              # TypeScript data files (arrays, objects, constants)
├── constants.ts             # Shared constants
├── [feature]-colors.ts      # Color configurations (if feature-specific)
└── policies/                # Markdown policy documents
    ├── privacy-policy.md
    ├── terms-of-service.md
    └── README.md
```

**Naming Conventions**:

- Data files: `[feature].ts` (kebab-case, singular or plural as appropriate)
  - Example: `about.ts`, `projects.ts`, `quotes.ts`, `skills.ts`
- Constants: `constants.ts` or `[feature]-constants.ts`
- Markdown: `[name].md` (kebab-case)

**Rules**:

- Export data as named exports: `export const featureData = [...]`
- Use TypeScript interfaces/types from `types/` for data structures
- Markdown files go in feature-specific subdirectories when appropriate
- Keep data files pure (no side effects, no imports of components)

**Example**:

```ts
// data/quotes.ts
import type { Quote } from "@/app/(portfolio)/quotes/config";

export const dummyQuotes: Quote[] = [{ id: "1", text: "...", author: "..." }];
```

---

### `types/` - TypeScript Type Definitions

**Purpose**: Centralized TypeScript type definitions organized by domain

**Structure**:

```
types/
├── index.ts                 # Re-exports all types for convenience
├── [domain].ts              # Domain-specific types
│   ├── components.ts        # Component prop types
│   ├── data.ts             # Data structure types
│   ├── forms.ts            # Form-related types
│   ├── animations.ts       # Animation types
│   └── policies.ts         # Policy-related types
```

**Naming Conventions**:

- Type files: `[domain].ts` (kebab-case, domain name)
- Types: PascalCase (e.g., `FormState`, `Post`, `Quote`)
- Interfaces: PascalCase, descriptive (e.g., `AboutPageData`, `Value`)

**Rules**:

- All types are exported from `types/index.ts` for easy importing
- Group related types in domain-specific files
- Use descriptive names that indicate purpose
- Prefer `interface` for object shapes, `type` for unions/intersections
- Export types as named exports

**Example**:

```ts
// types/forms.ts
export interface FormState {
  success: boolean;
  error?: string;
  message?: string;
}

// types/index.ts
export * from "./forms";
export * from "./data";
```

---

### `lib/` - Utility Functions & Services

**Purpose**: Reusable utility functions, services, and helpers

**Structure**:

```
lib/
├── utils.ts                 # General utility functions (cn, getBlogPostUrl, etc.)
├── [service].ts             # Service modules (email-service, directus, logger)
└── [helper].ts              # Helper functions (delay, formatters, loaders)
```

**Naming Conventions**:

- Utility files: `[purpose].ts` (kebab-case, descriptive)
  - Example: `utils.ts`, `email-service.ts`, `directus.ts`, `logger.ts`
- Functions: camelCase, descriptive
  - Example: `cn()`, `getBlogPostUrl()`, `isEmailServiceConfigured()`

**Rules**:

- Pure functions preferred (no side effects when possible)
- Services handle external integrations (email, CMS, etc.)
- Utilities are framework-agnostic when possible
- Export functions as named exports
- Use JSDoc comments for public functions

**Example**:

```ts
// lib/utils.ts
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// lib/email-service.ts
export function isEmailServiceConfigured(): boolean {
  // Implementation
}
```

---

### `constants/` - Configuration Constants

**Purpose**: Application-wide constants and configuration values

**Structure**:

```
constants/
├── animations.ts            # Animation variants and configs
└── ui.ts                    # UI-related constants
```

**Naming Conventions**:

- Constant files: `[domain].ts` (kebab-case)
- Constants: UPPER_SNAKE_CASE for true constants, camelCase for config objects
  - Example: `DECODE_CHARS`, `containerVariants`

**Rules**:

- Export constants as named exports
- Group related constants in domain-specific files
- Use descriptive names

**Example**:

```ts
// constants/animations.ts
export const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};
```

---

### `context/` - React Context Providers

**Purpose**: React Context providers for global state

**Structure**:

```
context/
└── [Feature]Context.tsx    # Context provider component
```

**Naming Conventions**:

- Context files: `[Feature]Context.tsx` (PascalCase, "Context" suffix)
  - Example: `ToastContext.tsx`

**Rules**:

- Export provider component and hook
- Use descriptive names for context and hooks
- Keep context focused on a single concern

**Example**:

```tsx
// context/ToastContext.tsx
export function ToastProvider({ children }: { children: ReactNode }) {
  // Implementation
}

export function useToast() {
  // Hook implementation
}
```

---

## File Organization Rules

### What Goes Where

| Content Type             | Location                                       | Example                                  |
| ------------------------ | ---------------------------------------------- | ---------------------------------------- |
| Server route/page        | `app/(group)/[feature]/page.tsx`               | `app/(portfolio)/about/page.tsx`         |
| Server action            | `app/actions/[feature].ts`                     | `app/actions/contact.ts`                 |
| Page client component    | `components/[feature]/[Feature]PageClient.tsx` | `components/about/AboutPageClient.tsx`   |
| Feature component        | `components/[feature]/[Component].tsx`         | `components/blog/SearchButton.tsx`       |
| Reusable section         | `components/sections/[Section].tsx`            | `components/sections/HeroSection.tsx`    |
| Base UI component        | `components/primitives/[Component].tsx`        | `components/primitives/Button.tsx`       |
| Shared utility component | `components/common/[Component].tsx`            | `components/common/DevModeIndicator.tsx` |
| Static data              | `data/[feature].ts`                            | `data/projects.ts`                       |
| Type definitions         | `types/[domain].ts`                            | `types/forms.ts`                         |
| Utility functions        | `lib/[purpose].ts`                             | `lib/utils.ts`                           |
| Service modules          | `lib/[service].ts`                             | `lib/email-service.ts`                   |
| Constants                | `constants/[domain].ts`                        | `constants/animations.ts`                |
| Context provider         | `context/[Feature]Context.tsx`                 | `context/ToastContext.tsx`               |
| Markdown content         | `data/[feature]/[file].md`                     | `data/policies/privacy-policy.md`        |

### What Doesn't Go Where

**DO NOT**:

- Put client components in `app/` (except route files)
- Put server components in `components/` (except when needed for composition)
- Put types inline in component files (use `types/`)
- Put data directly in component files (use `data/`)
- Put utility functions in component files (use `lib/`)
- Mix concerns (data + types + components in one file)
- Create deeply nested component directories (max 2-3 levels)
- Use default exports for components (use named exports)

---

## Import Path Conventions

Use absolute imports with `@/` alias:

```tsx
// ✅ Good
import { Button } from "@/components/primitives/Button";
import { dummyQuotes } from "@/data/quotes";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { cn } from "@/lib/utils";

// ❌ Bad
import { Button } from "../../../components/primitives/Button";
import { dummyQuotes } from "./data/quotes";
```

---

## Special Cases

### Feature Modules (e.g., Quotes)

For complex features with multiple variants/sub-components:

```
components/quotes/
├── QuotesPageClient.tsx          # Main page client
├── QuoteViewRenderer.tsx         # View orchestrator
├── ViewDevControls.tsx            # Feature-specific controls
├── normal/                        # Feature sub-category
│   └── [variant]/
│       └── [Variant]View.tsx
├── constellation/                 # Feature sub-category
│   └── [variant]/
│       └── [Variant]View.tsx
├── shared/                        # Feature-specific shared components
│   └── QuoteCard.tsx
└── store/                         # Feature-specific state (Zustand)
    └── useQuoteViewStore.ts
```

**Rules**:

- Feature config types can live in `app/(portfolio)/[feature]/config.ts` if feature-specific
- Feature-specific stores go in `components/[feature]/store/`
- Feature-specific shared components go in `components/[feature]/shared/`

---

## Testing

**Structure**:

```
tests/
├── components/           # Component unit tests
├── e2e/                 # End-to-end tests (Playwright)
├── integration/         # Integration tests
├── unit/                # Unit tests for utilities
└── mocks/               # Test mocks and fixtures
```

**Naming**: `[file].test.tsx` or `[file].spec.ts` (match source file name)

---

## Summary Checklist

When creating a new file, ask:

1. **Is it a route?** → `app/(group)/[feature]/page.tsx`
2. **Is it a server action?** → `app/actions/[feature].ts`
3. **Is it a page client component?** → `components/[feature]/[Feature]PageClient.tsx`
4. **Is it a feature component?** → `components/[feature]/[Component].tsx`
5. **Is it a reusable section?** → `components/sections/[Section].tsx`
6. **Is it a base UI component?** → `components/primitives/[Component].tsx`
7. **Is it static data?** → `data/[feature].ts`
8. **Is it a type definition?** → `types/[domain].ts`
9. **Is it a utility function?** → `lib/[purpose].ts`
10. **Is it a constant?** → `constants/[domain].ts`
11. **Is it a context provider?** → `context/[Feature]Context.tsx`

---

## Future-Proofing Notes

- This structure scales well for features of any size
- New features follow the same patterns
- Complex features can have subdirectories within `components/[feature]/`
- Types remain centralized and discoverable
- Utilities remain reusable and testable
- Clear separation makes code reviews and refactoring easier
