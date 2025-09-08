# Personal Site 3 - Technical Documentation

## Core Architecture Overview

This is a **Next.js 14** personal portfolio website built with **TypeScript** and **Tailwind CSS**, using **Directus** as a headless CMS for blog content management.

### Technology Stack & Why Each Matters

**Next.js 14** - React framework that handles:
- Server-side rendering (pages load faster)
- File-based routing (folders = URL paths)
- Built-in optimization for images, fonts, etc.
- Production builds and deployment

**TypeScript** - JavaScript with type checking:
- Catches errors before runtime
- Better IDE support with autocomplete
- All `.tsx` files are TypeScript React components
- Configuration in `tsconfig.json`

**Tailwind CSS** - Utility-first CSS framework:
- Classes like `bg-slate-900` instead of custom CSS
- Configuration in `tailwind.config.ts`
- No separate CSS files needed for styling

**Directus** - Headless CMS:
- Manages blog posts via admin interface
- Provides REST API for fetching content
- SDK handles API calls with type safety

## Project Structure & File Organization

```
personal-site3/
├── app/                    # Next.js App Router (v13+)
│   ├── layout.tsx         # Root layout (wraps all pages)
│   ├── layout.tsx           # Homepage (/)
│   ├── globals.css        # Global styles
│   └── [folders]/         # Each folder = route
├── components/            # Reusable React components
├── lib/                   # Utility functions & API calls
├── public/               # Static assets (images, etc.)
├── package.json          # Dependencies & scripts
├── tailwind.config.ts    # Tailwind customization
├── tsconfig.json         # TypeScript configuration
└── next.config.ts        # Next.js configuration
```

### Key Files Explained

**`app/layout.tsx`** - The wrapper for every page:
- Loads fonts (Montserrat, Open Sans)
- Sets up HTML structure
- Includes Header and Footer components
- Defines site metadata (title, description)

**`package.json`** - Project configuration:
- Lists all dependencies (libraries used)
- Defines scripts (`npm run dev`, `npm run build`, etc.)
- Version information

**`tailwind.config.ts`** - Styling configuration:
- Custom color palette (slate, sky colors)
- Font family definitions
- Responsive breakpoints

## Development Workflow

### Prerequisites
- **Node.js** installed (JavaScript runtime)
- **npm** (package manager, comes with Node.js)

### Daily Development Commands

```bash
# Install dependencies (run once, or when package.json changes)
npm install

# Start development server (auto-reloads on changes)
npm run dev
# Site runs at http://localhost:3000

# Check for code issues
npm run lint

# Build for production
npm run build

# Run production build locally
npm run start
```

### Making Changes

1. **Styling**: Use Tailwind classes in JSX
    - `className="bg-slate-900 text-white p-4"`
    - Colors defined in `tailwind.config.ts`

2. **New Pages**: Create folders in `app/`
    - `app/about/layout.tsx` → `/about` URL
    - `app/blog/[slug]/layout.tsx` → `/blog/any-slug` URL

3. **Components**: Create in `components/`
    - Export as `export function ComponentName() {}`
    - Import as `import { ComponentName } from "@/components/ComponentName"`

4. **API Calls**: Add to `lib/` folder
    - Use Directus SDK for CMS data
    - Handle errors with try/catch

## Content Management (Directus)

### Environment Setup
Create `.env.local` file:
```
NEXT_PUBLIC_DIRECTUS_URL=your-directus-instance-url
```

### Blog Post Structure
Posts in Directus must have these fields:
- `id` (string)
- `status` ('published' | 'draft' | 'archived')
- `title` (string)
- `slug` (string) - URL-friendly version
- `publish_date` (string)
- `summary` (string)
- `content` (string) - HTML content
- `feature_image` (optional image)
- `author` (relation to users)

### API Functions
Located in `lib/directus.ts`:
- `getPublishedPosts()` - Fetch all published posts
- `getPostBySlug(slug)` - Fetch single post by URL slug

## Deployment & Production

### Build Process
```bash
npm run build
```
This creates `.next/` folder with optimized files.

### Environment Variables
Production needs:
- `NEXT_PUBLIC_DIRECTUS_URL` - Your Directus instance URL

### Hosting Options
- **Vercel** (recommended for Next.js)
- **Netlify**
- Any Node.js hosting service

## Common Tasks & Solutions

### Adding New Dependencies
```bash
npm install package-name
# For TypeScript types:
npm install @types/package-name --save-dev
```

### Styling Patterns
- Dark theme: `bg-slate-900 text-slate-200`
- Accent colors: `text-sky-400`, `bg-sky-600`
- Typography: `font-heading` (Montserrat), `font-sans` (Open Sans)

### TypeScript Errors
- Missing types: Install `@types/package-name`
- Import errors: Check file paths use `@/` prefix
- API errors: Ensure Directus schema matches interface definitions

### Performance Optimization
- Images: Use Next.js `<Image>` component
- Fonts: Already optimized with `next/font/google`
- CSS: Tailwind purges unused styles automatically

## Troubleshooting

### Development Server Won't Start
1. Delete `node_modules/` and `.next/`
2. Run `npm install`
3. Run `npm run dev`

### Build Failures
- Check TypeScript errors: `npm run lint`
- Verify all imports are correct
- Ensure environment variables are set

### Styling Issues
- Check Tailwind classes are spelled correctly
- Verify custom colors in `tailwind.config.ts`
- Use browser dev tools to inspect applied styles

## Future Enhancement Areas

### Content
- Add more post fields (tags, categories)
- Implement search functionality
- Add pagination for blog posts

### Features
- Contact form
- Newsletter signup
- Social media integration
- Comments system

### Performance
- Image optimization
- Caching strategies
- SEO improvements

### Technical
- Add testing framework
- Implement CI/CD pipeline
- Add analytics tracking

---

## Quick Reference

**Start Development**: `npm run dev`
**Build for Production**: `npm run build`
**Component Path**: `@/components/ComponentName`
**Styling**: Tailwind classes in `className`
**CMS**: Directus at `process.env.NEXT_PUBLIC_DIRECTUS_URL`
**Routes**: Folders in `app/` directory
```


This README is structured to give you the foundational knowledge first, then drill down into specifics. The hierarchical approach means you can quickly understand what technologies are involved and why, then dive into the practical details of development and deployment.

The key insight here is that this is a modern React-based website where:
- **Next.js** handles the framework and routing
- **TypeScript** provides type safety
- **Tailwind** handles all styling
- **Directus** manages your blog content

Everything is configured to work together, so you can focus on content and features rather than setup and configuration.
