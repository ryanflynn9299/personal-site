# Blog: Features & Scalability

**Type:** Feature — blog-specific behavior, UI, and tokens

Developer reference for blog behavior beyond basic CMS wiring (which lives in [DIRECTUS.md](../DIRECTUS.md)). Design **principles** live in [DESIGN.md](./DESIGN.md); this doc is authoritative for blog implementation.

Related: [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md), [THEMED_SURFACES.md](./THEMED_SURFACES.md), [SEO.md](./SEO.md) (`ENABLE_BLOG_SEO` flag), [MARKDOWN_CONTENT.md](./MARKDOWN_CONTENT.md) (shared markdown pipeline).

---

## Spacing system

**Source of truth (code):** `lib/blog/spacing.ts` — import `blogSpacing` in blog and post-author components; do not invent one-off `mt-*` / `gap-*` values.

Spacing follows [Laws of UX](https://lawsofux.com/) gestalt principles:

| Law               | Application on blog                                                                                                                    |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Proximity**     | Related items share tight tokens (`groupTight` 16px, `groupInner` 8px): breadcrumb→title, title→byline, ToC label→links                |
| **Common Region** | Major regions separated by `regionMajor` (48px) or ToC exit zone; functional breaks use `sectionBreak` (`mt-12` + `border-t` + `pt-8`) |
| **Similarity**    | Peer items use equal gaps: `peerGapLg` (32px) card grid, `peerGapXl` (48px) index stacks                                               |
| **Prägnanz**      | One scale, few tokens — avoids arbitrary `mt-10` / `mt-16` mix                                                                         |

### Token map

| Token                                      | Tailwind                                | Use                                               |
| ------------------------------------------ | --------------------------------------- | ------------------------------------------------- |
| `pagePaddingY` / `pagePaddingX`            | `py-16`, responsive `px-*`              | Page shell (index + post)                         |
| `groupStack`                               | `gap-4`                                 | Index title + subtext block                       |
| `breadcrumbToTitle`                        | `mb-4`                                  | Breadcrumbs → `<h1>`                              |
| `groupTight`                               | `mt-4`                                  | Title → byline                                    |
| `groupSubsection`                          | `mt-6`                                  | Byline → ToC                                      |
| `groupInner`                               | `mt-2`                                  | ToC heading → link list                           |
| `tocExitZone` / `tocExitRule`              | `h-20 sm:h-24` + centered gradient      | Header block → main content (when ToC shown)      |
| `regionContent`                            | `mt-8`                                  | Header → hero or body when **no** ToC exit spacer |
| `regionMajor`                              | `mt-12`                                 | Index intro → grid; author footer card            |
| `sectionBreak`                             | `mt-12 border-t pt-8`                   | Prev/next post nav                                |
| `sectionBreakSoft`                         | `border-t pt-8` (inside `gap-12` stack) | Pagination bar                                    |
| `peerGapLg` / `peerGapXl`                  | `gap-8` / `gap-12`                      | Card grid / vertical stacks                       |
| `cardBodyPadding`                          | `p-6`                                   | Post card body                                    |
| `cardTitleToSummary` / `cardSummaryToMeta` | `mt-3` / `mt-6`                         | Post card innards                                 |

### Post page regions (top → bottom)

1. **Header group** — breadcrumbs, title, byline, optional ToC (+ ToC exit zone)
2. **Media** — hero image (`mb-8`; `mt-8` only if no ToC exit)
3. **Article body** — `BlogContentRenderer` (`mt-8` only if no ToC and no hero)
4. **Author footer** — `regionMajor`
5. **Prev/next** — `sectionBreak`

Do **not** stack `my-8` on the hero when the ToC exit zone already separates header from content.

---

## Pagination & search

`getPublishedPosts()` (in `lib/services/directus/blogs.ts`, exported from the barrel) accepts optional query options and returns a `total` count via Directus `meta: ["filter_count"]`:

```typescript
export interface GetPostsOptions {
  limit?: number; // posts per page
  page?: number; // page offset
  search?: string; // full-text search query
}
```

Options are strictly optional — plain `getPublishedPosts()` calls keep fetching everything, which is fine at current scale.

### Page usage pattern

```tsx
// e.g. app/(portfolio)/blog/page.tsx, from searchParams
const limit = 9;
const page = params?.page ? parseInt(params.page) : 1;

const { posts, total } = await getPublishedPosts({ limit, page });
const totalPages = Math.ceil((total || 0) / limit);
```

### Search

Directus's `search` option performs full-text search across the collection's string fields (title, summary, content, tags) natively in the database — pass a `?q=` search param through to `getPublishedPosts({ search })`.

---

## Adjacent-post navigation (future optimization)

`getAdjacentPosts()` currently fetches **all** published posts and sorts server-side to find prev/next. Fine at current scale; refactor when post count grows by asking Directus for exactly two records:

```typescript
// Next post
filter: {
  _or: [
    { publication_date: { _gt: currentPostDate } },
    { _and: [
        { publication_date: { _eq: currentPostDate } },
        { id: { _lt: currentPostId } }, // tie-breaker
    ]},
  ],
},
limit: 1,
sort: ["publication_date"]

// Previous post: mirror with _lt / _gt and sort: ["-publication_date"]
```

---

## Table of contents

Client-side, deterministic ToC rendered **above the article body** on all viewports.

### Eligibility

| Condition            | ToC shown? |
| -------------------- | ---------- |
| Plaintext content    | No         |
| ≤ 2 headings (h2–h4) | No         |
| **≥ 3 headings**     | **Yes**    |

Markdown h1 is excluded — it usually duplicates the page title.

### Behavior

- **Parse:** `lib/markdown/headings.ts` + `lib/blog/toc.ts` read raw `content` + `format` and produce the same IDs as the rendered headings
- **Placement:** inside the post `<header>`, directly under the byline (before hero image and body)
- **Presentation:** compact “Contents” block — left rail (`border-l`), numbered top-level sections; `groupSubsection` from byline, `groupInner` to links; `tocExitZone` with centered gradient rule before hero or body
- **Long lists:** scrollable nav (`max-h`) only when **> 8** headings; h3+ subsections collapse when > 10 total items
- **Empty:** no UI, no errors, layout unchanged

### Files

| Path                                      | Role                                   |
| ----------------------------------------- | -------------------------------------- |
| `lib/blog/spacing.ts`                     | Spacing tokens (vertical rhythm)       |
| `lib/blog/toc.ts`                         | Extract, slugify, evaluate, tree build |
| `components/blog/BlogTableOfContents.tsx` | Nav UI + scroll spy                    |
| `components/blog/BlogContentRenderer.tsx` | Injects matching `id` on h2–h4         |
| `components/blog/BlogPostArticle.tsx`     | Wires ToC above content                |

Tests: `tests/unit/toc.test.ts`, `tests/unit/blog-spacing.test.ts`.

---

## Breadcrumb navigation

Post pages show compact wayfinding above the title — not a repeat of the full heading.

### Behavior

| Element             | Role                                                                                                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Back button**     | Primary action. Links to the immediate parent (`← Blog Home` on a normal post; `← Parent` when subarticle chains exist). Matches prev/next nav styling (`ArrowLeft`, sky accent). |
| **Trail**           | Secondary context. Short labels only — full titles live in the `<h1>`.                                                                                                            |
| **`/` separators**  | Always shown between crumbs (`font-mono`, `text-slate-600`). Coding undertone — see [THEMED_SURFACES.md](./THEMED_SURFACES.md). Not interactive.                                  |
| **Current page**    | Non-link crumb (`text-slate-200`, `font-medium`). Full title kept in `title` for hover + screen readers when shortened.                                                           |
| **Blog root label** | **`Blog Home`** in breadcrumbs only — global nav and copy elsewhere stay **Blog**.                                                                                                |

For a simple **Blog Home → post** path: `← Blog Home / Current`. Deeper ancestor chains: `← Parent / Blog Home / Parent / Current` (full short trail with dividers).

### Path divider implementation

- One `BreadcrumbDivider` element with symmetric horizontal padding (`px-2`) on the `/` span.
- Do **not** combine flex `gap-x-*` on the parent with horizontal margin on dividers — the first separator after the back button will look wider than separators between trail crumbs.
- Data/helpers: `lib/blog/breadcrumbs.ts` (`BLOG_HOME_CRUMB_LABEL`, trail builders). Presentation: `components/blog/BlogPostBreadcrumbs.tsx`.

### Files

| Path                                      | Role                                                     |
| ----------------------------------------- | -------------------------------------------------------- |
| `lib/blog/breadcrumbs.ts`                 | Build items, shorten labels, back target + trail helpers |
| `components/blog/BlogPostBreadcrumbs.tsx` | Back button + compact trail UI                           |
| `components/blog/BlogPostArticle.tsx`     | Wires breadcrumbs in the post header                     |

Tests: `tests/unit/blog-breadcrumbs.test.ts`, `tests/components/BlogPostBreadcrumbs.test.tsx`.

### Offline ToC fixture

With `offlineDummyBlogs` enabled, open `/blog/toc-smoke-test` (`data/dummy-posts.ts`) to smoke-test ToC rendering without Directus.
