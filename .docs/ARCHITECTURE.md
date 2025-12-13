# Architecture Overview

## What is This Project?

This is a **Next.js 15** personal portfolio website built with **TypeScript** and **Tailwind CSS**. It uses **Directus** as a headless CMS for blog content management and follows modern web development best practices with a focus on performance, SEO, and maintainability.

## Technology Stack

### Next.js 15 (App Router)

Next.js is a React framework that provides server-side rendering, routing, and optimization out of the box. This project uses the **App Router** architecture (introduced in Next.js 13), which is the current recommended approach.

**Why App Router?**

- **Server Components by default**: Components render on the server unless explicitly marked as client components, resulting in smaller JavaScript bundles and faster initial page loads
- **File-based routing**: The folder structure in `app/` directly maps to URLs, making routing intuitive
- **Built-in optimizations**: Automatic code splitting, image optimization, font optimization, and more
- **Better data fetching**: Server Components can directly access databases and APIs without exposing credentials to the browser

### TypeScript

TypeScript adds static type checking to JavaScript, catching errors before code runs and providing better IDE support.

**Why TypeScript?**

- **Type safety**: Prevents common bugs by catching type mismatches at compile time
- **Better developer experience**: Autocomplete, refactoring tools, and inline documentation
- **Self-documenting code**: Types serve as documentation for what data structures are expected

### Tailwind CSS

Tailwind is a utility-first CSS framework that provides low-level utility classes instead of pre-built components.

**Why Tailwind?**

- **Rapid development**: Write styles directly in JSX without switching to separate CSS files
- **Consistent design**: Predefined spacing, colors, and typography scales ensure design consistency
- **Small bundle size**: Only the CSS classes you actually use are included in the final bundle
- **Responsive by default**: Built-in breakpoint system for mobile-first design

### Directus (Headless CMS)

Directus is a self-hosted headless CMS that provides a database and admin interface for managing content.

**Why Directus?**

- **Self-hosted**: Full control over your data and infrastructure
- **Type-safe SDK**: The Directus SDK provides TypeScript types for your content models
- **Flexible content model**: Easy to add new content types or fields
- **REST API**: Standard REST API makes it easy to fetch content from Server Components

## Architecture Patterns

### Server Components vs Client Components

This project follows Next.js's **Server-First** architecture pattern. Components are Server Components by default and only become Client Components when they need browser-specific features.

#### Server Components (Default)

Server Components render on the server and send HTML to the browser. They never include JavaScript in the client bundle unless they use Client Components as children.

**When to use Server Components:**

- Data fetching (databases, APIs, file system)
- Accessing backend resources (API keys, secrets)
- Large dependencies that would bloat the client bundle
- Static content that doesn't need interactivity
- Components that need to export metadata for SEO

**Benefits:**

- **Smaller bundle size**: No JavaScript sent to the browser for Server Components
- **Better performance**: Rendering happens on the server with faster access to data sources
- **Improved SEO**: Fully rendered HTML is sent to search engines
- **Security**: API keys and secrets never leave the server
- **Direct data access**: Can directly query databases without exposing endpoints

**Example:**

```typescript
// app/(portfolio)/blog/page.tsx - Server Component
export default async function BlogPage() {
  // Direct database access - no API endpoint needed
  const posts = await getPublishedPosts();
  return <BlogPageClient posts={posts} />;
}
```

#### Client Components (Explicit)

Client Components render in the browser and include JavaScript in the client bundle. They're marked with the `'use client'` directive at the top of the file.

**When to use Client Components:**

- Interactive features (buttons, forms, animations)
- Browser APIs (localStorage, window, document)
- React hooks (useState, useEffect, useContext)
- Event handlers (onClick, onChange, onSubmit)
- Third-party libraries that require client-side JavaScript (e.g., animation libraries)

**Benefits:**

- **Interactivity**: Can respond to user actions in real-time
- **Browser APIs**: Access to browser-specific features
- **State management**: Can maintain component state across renders

**Example:**

```typescript
// components/DownloadButton.tsx - Client Component
'use client';
export function DownloadButton() {
  const handleClick = () => {
    // Browser API access
    trackDownload('resume.pdf');
  };
  return <button onClick={handleClick}>Download</button>;
}
```

#### Composition Pattern

Server Components can import and use Client Components, but Client Components cannot directly import Server Components. This creates a clear boundary and allows for optimal composition.

**Pattern: Server Wrapper + Client Content**

```typescript
// Server Component (page.tsx)
export const metadata = { title: 'About' }; // SEO metadata
export default function AboutPage() {
  return <AboutPageClient />; // Client Component for animations
}
```

This pattern allows pages to have SEO metadata (server-only feature) while still using client-side interactivity where needed.

### Data Fetching Patterns

#### Server-Side Data Fetching

Data fetching happens in Server Components using `async/await`. This is the recommended pattern because:

- **Direct access**: Can query databases or APIs directly without exposing endpoints
- **No client-side loading states**: Data is available immediately when the page renders
- **Better security**: API keys and credentials never leave the server
- **Smaller bundles**: Data fetching logic isn't included in client JavaScript

**Example:**

```typescript
// app/(portfolio)/blog/[slug]/page.tsx
export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug((await params).slug);
  // Post data is available immediately, no loading state needed
  return <article>{post.content}</article>;
}
```

#### Static Generation

Blog posts use static generation (`generateStaticParams`) to pre-render pages at build time. This means:

- **Faster page loads**: HTML is pre-generated, no server processing needed
- **Better SEO**: Search engines get fully rendered pages immediately
- **Reduced server load**: Pages are served as static files

**Example:**

```typescript
export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}
```

### Routing Architecture

Next.js App Router uses file-based routing. The folder structure in `app/` directly maps to URLs:

```
app/
├── layout.tsx              → Root layout (wraps all pages)
├── page.tsx                → Homepage (/)
├── (portfolio)/            → Route group (doesn't affect URL)
│   ├── about/
│   │   └── page.tsx        → /about
│   ├── blog/
│   │   ├── page.tsx        → /blog
│   │   └── [slug]/
│   │       └── page.tsx    → /blog/any-slug
│   └── contact/
│       └── page.tsx        → /contact
└── (admin)/                → Route group for admin section
    └── dashboard/
        └── page.tsx        → /dashboard
```

**Route Groups** (folders in parentheses like `(portfolio)`) organize routes without affecting URLs. They're useful for:

- Applying different layouts to different sections
- Organizing related routes together
- Separating public and admin sections

### Component Organization

Components are organized by purpose:

```
components/
├── Header.tsx              → Site navigation (Server Component)
├── Footer.tsx               → Site footer (Client Component - uses context)
├── PostCard.tsx            → Blog post card (Server Component)
├── Matomo.tsx              → Analytics tracking (Client Component)
├── home/                   → Homepage-specific components
│   ├── HeroSection.tsx
│   ├── AboutMe2.tsx
│   └── BlogHighlight4.tsx
└── ui/                     → Reusable UI components
    ├── Button.tsx
    ├── Toast.tsx
    └── SearchButton.tsx
```

**Naming Conventions:**

- Components use PascalCase (e.g., `BlogPost.tsx`)
- Client Components are explicitly marked with `'use client'`
- Server Components have no directive (default)

## Key Architectural Patterns

### 1. Server Data Fetching + Client Presentation

**Used in**: Blog pages

```typescript
// Server Component fetches data
export default async function BlogPage() {
  const posts = await getPublishedPosts();
  return <BlogPageClient posts={posts} />;
}

// Client Component handles interactivity
'use client';
export function BlogPageClient({ posts }) {
  const [searchQuery, setSearchQuery] = useState('');
  // Search, keyboard shortcuts, etc.
}
```

**Why this pattern?**

- Data fetching happens server-side (faster, more secure)
- Interactivity happens client-side (responsive user experience)
- Clear separation of concerns

### 2. Async Server Components

**Used in**: Blog highlights, blog posts

```typescript
export async function BlogHighlight4() {
  const { posts } = await getPublishedPosts();
  return <div>{/* render posts */}</div>;
}
```

**Why this pattern?**

- Data is fetched during server rendering
- No client-side loading states needed
- Better performance and SEO

### 3. Server Component Composition

**Used in**: Homepage, layouts

```typescript
// Server Component composes other components
export default function HomePage() {
  return (
    <>
      <HeroSection />           {/* Server Component */}
      <AboutMe2 />              {/* Client Component */}
      <ProjectCarousel />       {/* Client Component */}
      <TechStack3 />            {/* Server Component using Client child */}
    </>
  );
}
```

**Why this pattern?**

- Server Components can use Client Components seamlessly
- Minimal client-side JavaScript (only where needed)
- Optimal performance

## Project Structure

```
personal-site/
├── app/                      # Next.js App Router (pages & layouts)
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   ├── (portfolio)/         # Public routes
│   │   ├── about/
│   │   ├── blog/
│   │   ├── contact/
│   │   └── vitae/
│   └── (admin)/             # Admin routes
├── components/              # React components
│   ├── home/               # Homepage components
│   └── ui/                 # Reusable UI components
├── lib/                    # Utility functions & API clients
│   ├── directus.ts         # Directus SDK client
│   └── utils.ts           # Helper functions
├── data/                   # Static data files
├── public/                 # Static assets (images, etc.)
├── types/                  # TypeScript type definitions
└── .docs/                  # Documentation
```

## Best Practices Alignment

### Server-Side Rendering (SSR)

This project uses server-side rendering extensively because:

- **Better SEO**: Search engines receive fully rendered HTML
- **Faster initial load**: HTML is ready immediately, no waiting for JavaScript to render
- **Better performance on slow devices**: Rendering happens on powerful servers, not user devices
- **Improved Core Web Vitals**: Better scores for Largest Contentful Paint (LCP) and First Input Delay (FID)

### Static Generation Where Possible

Blog posts are statically generated at build time because:

- **Optimal performance**: Pre-rendered HTML is served instantly
- **Reduced server costs**: No server processing needed for each request
- **Better caching**: Static files can be cached at CDN edge locations
- **Improved reliability**: Fewer moving parts means fewer failure points

### Minimal Client-Side JavaScript

The project minimizes client-side JavaScript by:

- Using Server Components by default
- Only marking components as Client when necessary
- Keeping client components focused on interactivity, not data fetching

**Benefits:**

- Smaller bundle sizes
- Faster page loads
- Better performance on mobile devices
- Lower bandwidth usage

### Type Safety

TypeScript is used throughout for:

- **Compile-time error checking**: Catch bugs before deployment
- **Better IDE support**: Autocomplete and refactoring tools
- **Self-documenting code**: Types serve as inline documentation
- **Safer refactoring**: TypeScript catches breaking changes

## Active Components

### Core Components

- **`MatomoProvider`** (`components/MatomoProvider.tsx`) - Client wrapper for analytics, reads environment variables
- **`Matomo`** (`components/Matomo.tsx`) - Main tracking component, initializes Matomo and tracks page views
- **`BlogPostTracker`** (`components/BlogPostTracker.tsx`) - Tracks individual blog post views
- **`DownloadButton`** (`components/DownloadButton.tsx`) - Tracks file download events

### Implementation Details

The tracking implementation uses Matomo's JavaScript API (`_paq`). The `Matomo` component:

1. Loads the Matomo tracking script dynamically
2. Configures the tracker URL and site ID from environment variables
3. Automatically tracks page views on route changes
4. Provides utility functions (`trackMatomoEvent`, `trackDownload`, `trackBlogSearch`, `trackBlogPostView`) for custom event tracking

Custom events are tracked by calling these utility functions from various components throughout the application.

## Future Enhancements (Optional)

The following features are not currently implemented but could be added if needed:

### Server Actions for Forms

**Current state**: Contact form is a placeholder with simulated submission.

**Why not implemented**: The form doesn't have a backend yet. When implementing form submission, Next.js Server Actions would be the recommended approach because they:

- Provide type-safe form handling
- Run on the server (secure, no API endpoints needed)
- Integrate seamlessly with React Server Components
- Support progressive enhancement (works without JavaScript)

**Priority**: Low - Only needed when implementing actual form functionality.

### React Suspense for Streaming

**Current state**: Data fetching is blocking (waits for all data before rendering).

**Why not implemented**: The current data fetching is fast enough that streaming wouldn't provide noticeable benefits. Suspense would be useful if:

- Data fetching takes longer (multiple seconds)
- You want to show partial content while waiting for other data
- You have multiple independent data sources

**Priority**: Low - Current performance is sufficient, streaming is an optimization for slower data sources.

### CSS Animations for Simple Effects

**Current state**: Some simple animations use framer-motion.

**Why not implemented**: While CSS animations would reduce bundle size slightly, framer-motion is already in the bundle for more complex animations. The performance difference is negligible, and framer-motion provides better developer experience and more animation options.

**Priority**: Very Low - Marginal benefit, not worth the refactoring effort.

## References

- [Next.js 15 App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
