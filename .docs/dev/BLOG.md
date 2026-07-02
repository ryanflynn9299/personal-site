# Blog: Features & Scalability

Developer reference for blog behavior beyond basic CMS wiring (which lives in [DIRECTUS.md](../DIRECTUS.md)). This doc absorbed the former `BLOG_SCALABILITY.md` and `BLOG_TABLE_OF_CONTENTS.md`.

Related: [AUTHOR_PROFILES.md](./AUTHOR_PROFILES.md) (author popup/footer card spec), [SEO.md](./SEO.md) (`ENABLE_BLOG_SEO` flag).

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

- **Parse:** `lib/blog/toc.ts` reads raw `content` + `format` and produces the same IDs as the rendered headings
- **Placement:** top of the post body (after hero image); never a sidebar
- **Long lists:** scrollable nav (`max-h`); h3+ subsections collapse when > 10 total items
- **Empty:** no UI, no errors, layout unchanged

### Files

| Path                                      | Role                                   |
| ----------------------------------------- | -------------------------------------- |
| `lib/blog/toc.ts`                         | Extract, slugify, evaluate, tree build |
| `components/blog/BlogTableOfContents.tsx` | Nav UI + scroll spy                    |
| `components/blog/BlogContentRenderer.tsx` | Injects matching `id` on h2–h4         |
| `components/blog/BlogPostArticle.tsx`     | Wires ToC above content                |

Tests: `tests/unit/toc.test.ts`.
