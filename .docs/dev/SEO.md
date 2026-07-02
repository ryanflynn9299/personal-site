# SEO & Metadata

Single source of truth for SEO/metadata state and remaining work. (This doc absorbed the former `SEO_METADATA_CHECKLIST.md` and `METADATA_POLISH_GUIDE.md` — both in git history.)

**Code SSOT:** `lib/site/seo.ts` — site constants, `defaultMetadata`, `generatePageMetadata()`, and the `ENABLE_BLOG_SEO` flag.

---

## Implemented (verified)

### Infrastructure

- **Centralized config** in `lib/site/seo.ts`; root layout applies `defaultMetadata` (title template `%s | Ryan Flynn`, description, keywords, authors/creator/publisher, `metadataBase`, `applicationName`, `formatDetection`, `referrer`, `category`).
- **`generatePageMetadata()`** used by all portfolio pages for per-page title/description/OG/Twitter/canonical. Blog posts use their own dynamic `generateMetadata()` in `app/(portfolio)/blog/[slug]/page.tsx`.
- **Viewport / theme color / color scheme** are exported via the `viewport` export in `app/layout.tsx` (Next.js App Router pattern), not `defaultMetadata`.
- **Sitemap** — `app/sitemap.ts`: static routes always; blog posts only when `ENABLE_BLOG_SEO` is true.
- **Robots** — `app/robots.ts`: disallows `/admin/`, `/api/`, and preview routes (`/quotes/`, `/projects-cabinet/`); references the sitemap.
- **Canonical URLs** on all pages; `lang="en"` on `<html>`; `app/favicon.ico` + `public/apple-touch-icon.svg` wired through `defaultMetadata.icons`.
- **Open Graph + Twitter Card** structures complete (`summary_large_image`).
- **JSON-LD** — `components/common/JsonLd.tsx` renders `BlogPosting` structured data on blog posts, gated by `ENABLE_BLOG_SEO`; `<` escaped as `\u003c` per [SECURITY.md](../SECURITY.md) §3.

### Blog SEO flag

`ENABLE_BLOG_SEO` in `lib/site/seo.ts` is **`false`** by design until blog content is ready. Flipping it enables blog posts in the sitemap and JSON-LD emission. Tracked in [TODO.md](./TODO.md).

---

## Remaining work

### Critical (before SEO matters in production)

- [ ] **Create `public/images/og-default.png`** (1200×630) — the path is already configured as `DEFAULT_OG_IMAGE` but **the file does not exist**, so social shares currently have a broken image
- [ ] **Replace placeholder social profiles** in `lib/site/seo.ts` → `SOCIAL_PROFILES` (currently bare `https://twitter.com`, `https://github.com`, `https://linkedin.com`) — also fixes the Twitter `creator` field
- [ ] **Set `NEXT_PUBLIC_SITE_URL`** in the production `.env` (falls back to the default otherwise)

### High priority

- [ ] `app/icon.png` (512×512) and `app/apple-icon.png` (180×180) — App Router file-based icons
- [ ] `app/manifest.ts` for PWA metadata (a commented placeholder exists in `defaultMetadata`)
- [ ] Enable `ENABLE_BLOG_SEO` when content is ready

### Nice to have

- [ ] Additional JSON-LD schemas: `Person`, `WebSite` (with search action), `BreadcrumbList`
- [ ] Per-page custom OG images
- [ ] Search Console / Bing verification meta tags
- [ ] RSS feed (tracked in TODO backlog — not implemented)

---

## Conventions

- Titles under ~60 chars; descriptions 120–155 chars; unique per page via `generatePageMetadata()`.
- New public pages: add to `app/sitemap.ts` and pass a `path` to `generatePageMetadata()` so the canonical URL is correct.
- Preview/dev-only routes must be disallowed in `app/robots.ts` and excluded from the sitemap (pattern already established for `/quotes` and `/projects-cabinet`).

## Validation tools

[Google Rich Results Test](https://search.google.com/test/rich-results) · [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) · [Schema.org Validator](https://validator.schema.org/) · verify `/sitemap.xml` and `/robots.txt` resolve in production.
