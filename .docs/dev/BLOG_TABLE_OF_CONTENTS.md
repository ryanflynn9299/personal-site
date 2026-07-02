# Blog Table of Contents

**Status:** Active  
**Last updated:** 2026-07-02

Client-side, deterministic ToC for blog posts. Rendered **above article body** on all viewports.

---

## Eligibility

| Condition             | ToC shown? |
| --------------------- | ---------- |
| Plaintext content     | No         |
| Zero headings (h2–h4) | No         |
| **≤ 2** headings      | No         |
| **≥ 3** headings      | Yes        |

Markdown `#` (h1) is excluded — it usually duplicates the page title.

---

## Behavior

- **Parse:** `lib/blog/toc.ts` reads raw `content` + `format` (same IDs as rendered headings)
- **Placement:** Top of post body (after hero image), never sidebar
- **Long lists:** Scrollable nav (`max-h`); h3+ subsections collapsed when &gt; 10 total items
- **Empty:** No UI, no errors — layout unchanged

---

## Files

| Path                                      | Role                                   |
| ----------------------------------------- | -------------------------------------- |
| `lib/blog/toc.ts`                         | Extract, slugify, evaluate, tree build |
| `components/blog/BlogTableOfContents.tsx` | Nav UI + scroll spy                    |
| `components/blog/BlogContentRenderer.tsx` | Injects matching `id` on h2–h4         |
| `components/blog/BlogPostArticle.tsx`     | Wires ToC above content                |

---

## Tests

`tests/unit/toc.test.ts`
