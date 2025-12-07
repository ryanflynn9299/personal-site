# Component Architecture: Server vs Client Components

## Overview

This Next.js 15 project uses the **App Router** architecture, which defaults to **Server Components** for better performance. Components are only marked as Client Components when they need:

- Browser APIs (window, document, localStorage, etc.)
- React hooks (useState, useEffect, useRef, etc.)
- Event handlers (onClick, onChange, etc.)
- Third-party libraries that require client-side JavaScript

## Summary

- **Total Components**: ~40 React components
- **Server Components**: ~20 (default, no 'use client')
- **Client Components**: ~20 (explicitly marked with 'use client')
- **Architecture Pattern**: Hybrid - Server Components for data fetching/rendering, Client Components for interactivity

---

## 📁 App Directory (Pages & Layouts)

### Server Components (Default)

#### Root Layout

- **`app/layout.tsx`** ⚙️ **SERVER COMPONENT**
  - Root layout for entire application
  - Exports `metadata` (server-only feature)
  - Configures fonts (Next.js font optimization)
  - Composes Header, Footer, and children
  - Uses client components (MatomoProvider, ToastProvider) as children
  - **Why Server**: Layouts are always server components in App Router

#### Portfolio Routes

- **`app/(portfolio)/page.tsx`** ⚙️ **SERVER COMPONENT**
  - Homepage
  - Composes multiple home section components
  - No data fetching, just composition
  - **Why Server**: Static content, no interactivity needed

- **`app/(portfolio)/blog/page.tsx`** ⚙️ **SERVER COMPONENT**
  - Blog listing page
  - Uses `async function` to fetch data from Directus
  - Exports `metadata` and `revalidate` (server-only features)
  - Fetches posts server-side, passes to client component
  - **Why Server**: Data fetching happens server-side, better performance

- **`app/(portfolio)/blog/[slug]/page.tsx`** ⚙️ **SERVER COMPONENT**
  - Individual blog post page
  - Uses `async function` for data fetching
  - Exports `generateMetadata()` and `generateStaticParams()` (server-only)
  - Fetches post data from Directus
  - Uses client components (BlogPostTracker) for tracking
  - **Why Server**: SEO benefits, server-side data fetching, static generation

- **`app/(portfolio)/vitae/page.tsx`** ⚙️ **SERVER COMPONENT**
  - Resume/CV page
  - Exports `metadata` (server-only)
  - Uses static data from `@/data/work_experience`
  - Uses client component (DownloadButton) for download tracking
  - **Why Server**: Static content, metadata generation

- **`app/not-found.tsx`** ⚙️ **SERVER COMPONENT**
  - 404 error page
  - Static content, no interactivity
  - **Why Server**: Static error page

#### Admin Routes

- **`app/(admin)/layout.tsx`** ⚙️ **SERVER COMPONENT**
  - Admin section layout
  - Wraps admin pages with custom styling
  - **Why Server**: Layout component, no client-side needs

- **`app/(admin)/dashboard/page.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - Admin dashboard page
  - **Why Server**: Likely server-rendered admin interface

- **`app/(admin)/dashboard/login/page.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - Login page
  - **Why Server**: Likely server-rendered form

### Client Components (Explicit)

- **`app/(portfolio)/blog/BlogPageClient.tsx`** 🖥️ **CLIENT COMPONENT**
  - Client wrapper for blog listing page
  - Uses `useState` and `useEffect` hooks
  - Handles keyboard shortcuts (Cmd/Ctrl+K for search)
  - Manages search dialog state
  - **Why Client**: Interactive search, keyboard event handling, state management

- **`app/(portfolio)/about/page.tsx`** 🖥️ **CLIENT COMPONENT**
  - About page with animations
  - Uses `framer-motion` for animations
  - **Why Client**: Animation library requires client-side JavaScript

- **`app/(portfolio)/contact/page.tsx`** 🖥️ **CLIENT COMPONENT**
  - Contact form page
  - Uses `useState` for form state
  - Handles form submission with `async` event handler
  - Uses `framer-motion` for animations
  - **Why Client**: Form state management, user interactions, animations

---

## 🧩 Components Directory

### Server Components (Default)

#### Layout Components

- **`components/Header.tsx`** ⚙️ **SERVER COMPONENT**
  - Site navigation header
  - Uses Next.js `Link` component
  - Static navigation structure
  - **Why Server**: Static content, no interactivity

- **`components/PostCard.tsx`** ⚙️ **SERVER COMPONENT**
  - Blog post card component
  - Displays post data (title, summary, date, image)
  - Uses Next.js `Link` and `Image` components
  - **Why Server**: Presentational component, no interactivity

- **`components/JsonLd.tsx`** ⚙️ **SERVER COMPONENT**
  - Structured data (JSON-LD) for SEO
  - Generates schema.org markup
  - **Why Server**: SEO optimization, no client-side needs

#### Home Page Components

- **`components/home/HeroSection.tsx`** ⚙️ **SERVER COMPONENT**
  - Hero section on homepage
  - Uses client component (AnimatedText) for animations
  - **Why Server**: Mostly static, delegates animation to client component

- **`components/home/AboutMe1.tsx`** ⚙️ **SERVER COMPONENT**
  - About section variant 1
  - Static content presentation
  - **Why Server**: Static content

- **`components/home/AboutMe2.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - About section variant 2
  - **Why Server**: Likely static content

- **`components/home/BlogHighlight.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - Blog highlight section
  - **Why Server**: Likely static content

- **`components/home/BlogHighlight4.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - Blog highlight variant 4
  - **Why Server**: Likely static content

### Client Components (Explicit)

#### Analytics Components

- **`components/Matomo.tsx`** 🖥️ **CLIENT COMPONENT**
  - Matomo analytics tracking
  - Uses `useEffect` and `usePathname` hooks
  - Accesses `window` object
  - **Why Client**: Browser APIs, route change tracking

- **`components/MatomoProvider.tsx`** 🖥️ **CLIENT COMPONENT**
  - Wrapper for Matomo in server components
  - Reads environment variables client-side
  - **Why Client**: Needs to access `process.env` client-side

- **`components/BlogPostTracker.tsx`** 🖥️ **CLIENT COMPONENT**
  - Tracks blog post views
  - Uses `useEffect` hook
  - **Why Client**: Side effects, analytics tracking

- **`components/DownloadButton.tsx`** 🖥️ **CLIENT COMPONENT**
  - Download button with tracking
  - Handles click events
  - **Why Client**: Event handlers, analytics tracking

#### Interactive UI Components

- **`components/Footer.tsx`** 🖥️ **CLIENT COMPONENT**
  - Site footer
  - Uses `useToast` hook from context
  - **Why Client**: Uses React context (ToastContext)

- **`components/ui/Toast.tsx`** 🖥️ **CLIENT COMPONENT**
  - Toast notification component
  - Uses animations and state
  - **Why Client**: Animations, state management

- **`components/ui/SearchButton.tsx`** 🖥️ **CLIENT COMPONENT**
  - Search button component
  - Handles click events
  - **Why Client**: Event handlers

- **`components/ui/AnimatedText.tsx`** 🖥️ **CLIENT COMPONENT**
  - Animated text component
  - Uses animations and effects
  - **Why Client**: Animations, DOM manipulation

- **`components/ui/BentoCard.tsx`** 🖥️ **CLIENT COMPONENT**
  - Bento grid card component
  - Interactive card component
  - **Why Client**: Likely has hover effects or interactions

- **`components/ui/MagicBento2.tsx`** 🖥️ **CLIENT COMPONENT** (assumed)
  - Magic bento grid variant 2
  - **Why Client**: Likely interactive

- **`components/ui/MagicBento3.tsx`** 🖥️ **CLIENT COMPONENT**
  - Magic bento grid variant 3
  - **Why Client**: Interactive grid component

- **`components/ui/Button.tsx`** ⚙️ **SERVER COMPONENT** (but used in client components)
  - Button component using Radix UI
  - Uses `class-variance-authority` for styling
  - Can be used in both server and client components
  - **Note**: This is a server component but often used within client components

- **`components/ui/ServiceUnavailable.tsx`** 🖥️ **CLIENT COMPONENT** (assumed)
  - Error/fallback component
  - **Why Client**: Likely has interactive elements

#### Home Page Interactive Components

- **`components/home/TechStack.tsx`** 🖥️ **CLIENT COMPONENT**
  - Tech stack display
  - **Why Client**: Likely has animations or interactions

- **`components/home/TechStack2.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - Tech stack variant 2
  - **Why Server**: If no interactivity

- **`components/home/TechStack3.tsx`** ⚙️ **SERVER COMPONENT** (assumed)
  - Tech stack variant 3
  - **Why Server**: If no interactivity

- **`components/home/ProjectCarousel.tsx`** 🖥️ **CLIENT COMPONENT**
  - Project carousel/slider
  - **Why Client**: Carousel requires interactivity, state management

- **`components/home/FeaturedProjects.tsx`** 🖥️ **CLIENT COMPONENT**
  - Featured projects display
  - **Why Client**: Likely has hover effects or interactions

- **`components/home/FinalCTA.tsx`** 🖥️ **CLIENT COMPONENT**
  - Final call-to-action section
  - **Why Client**: Likely has animations or interactions

---

## 🔄 Context & Utilities

### Client Components

- **`context/ToastContext.tsx`** 🖥️ **CLIENT COMPONENT**
  - Toast notification context provider
  - Uses `useState` and `useContext`
  - **Why Client**: React Context API, state management

---

## 📊 Data & Configuration Files

### Server-Side Only (Not Components)

- **`data/work_experience.ts`** - Static data
- **`data/projects.ts`** - Static data
- **`data/skills.ts`** - Static data
- **`lib/directus.ts`** - Server-side API client
- **`lib/utils.ts`** - Utility functions
- **`lib/logger.ts`** - Server-side logging
- **`types/index.ts`** - TypeScript type definitions
- **`app/sitemap.ts`** - Server-side sitemap generation
- **`app/robots.ts`** - Server-side robots.txt generation

---

## 🎯 Key Patterns & Best Practices

### 1. **Server-First Architecture**

- Default to Server Components
- Only use Client Components when necessary
- Server Components can import and use Client Components

### 2. **Data Fetching Pattern**

```typescript
// Server Component (app/(portfolio)/blog/page.tsx)
export default async function BlogIndexPage() {
  const postsResponse = await getPublishedPosts(); // Server-side fetch
  return <BlogPageClient posts={postsResponse.posts} />; // Pass to client
}
```

### 3. **Client Component Wrapper Pattern**

```typescript
// Server Component uses Client Component
<MatomoProvider /> // Client component in server layout
<DownloadButton /> // Client component in server page
```

### 4. **Hybrid Components**

- Server Components can compose Client Components
- Client Components cannot import Server Components directly
- Use composition to mix server and client functionality

### 5. **Metadata & SEO**

- Server Components can export `metadata`
- Client Components cannot export `metadata`
- Use Server Components for pages that need SEO

---

## 🔍 Identifying Server vs Client Components

### Server Component Indicators:

- ✅ No `'use client'` directive
- ✅ Exports `metadata`
- ✅ Uses `async function` for data fetching
- ✅ Exports `generateMetadata()`, `generateStaticParams()`
- ✅ Uses server-only APIs (Directus SDK, file system, etc.)
- ✅ No React hooks
- ✅ No event handlers
- ✅ No browser APIs

### Client Component Indicators:

- ✅ Has `'use client'` directive at top
- ✅ Uses React hooks (`useState`, `useEffect`, `useContext`, etc.)
- ✅ Uses browser APIs (`window`, `document`, `localStorage`, etc.)
- ✅ Has event handlers (`onClick`, `onChange`, `onSubmit`, etc.)
- ✅ Uses third-party libraries requiring client-side JS (framer-motion, etc.)
- ✅ Uses React Context API

---

## 📝 Notes

1. **Button Component**: While `Button.tsx` is technically a Server Component, it's often used within Client Components. This is fine - Server Components can be used in Client Components.

2. **TechStack Variants**: `TechStack2.tsx` and `TechStack3.tsx` are likely Server Components if they don't have interactivity, but `TechStack.tsx` is explicitly Client Component.

3. **Blog Architecture**: The blog uses a smart pattern:
   - Server Component (`blog/page.tsx`) fetches data
   - Client Component (`BlogPageClient.tsx`) handles interactivity
   - This separates concerns effectively

4. **Analytics Integration**: Matomo tracking is implemented as Client Components because it needs browser APIs and route change detection.

5. **Form Handling**: Contact form is a Client Component because it needs state management and event handling.

---

## 🚀 Performance Benefits

### Server Components:

- ✅ Rendered on server (faster initial load)
- ✅ Smaller JavaScript bundle (no client-side code)
- ✅ Direct database/API access
- ✅ Better SEO (fully rendered HTML)
- ✅ Secure (API keys, secrets stay on server)

### Client Components:

- ✅ Interactive user experience
- ✅ Real-time updates
- ✅ Client-side routing
- ✅ Browser API access
- ⚠️ Larger bundle size
- ⚠️ Slower initial load (if overused)

---

## 📚 References

- [Next.js 15 App Router Documentation](https://nextjs.org/docs/app)
- [Server Components vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [When to Use Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
