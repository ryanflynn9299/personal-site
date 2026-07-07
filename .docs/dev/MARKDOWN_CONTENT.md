# Markdown content rendering

**Type:** Feature — shared pipeline for client-side markdown in blog posts and policy documents  
**Guidance parent:** [DESIGN.md](./DESIGN.md) § Content surfaces, § Hierarchical outlines

Cross-feature reference for how markdown is parsed, sanitized, and rendered. **Blog-specific** behavior: [BLOG.md](./BLOG.md). **Policy-specific** presentation: [POLICIES.md](./POLICIES.md).

---

## Shared layer (`lib/markdown/`)

| Module           | Role                                                                                   |
| ---------------- | -------------------------------------------------------------------------------------- |
| `headings.ts`    | Format resolution, slugify, `extractHeadings(content, format, { minLevel, maxLevel })` |
| `heading-ids.ts` | `createHeadingIdConsumer` — hydration-safe sequential ID assignment                    |
| `plugins.ts`     | Shared `remark-gfm` + `rehype-raw` + `rehype-sanitize` plugin arrays                   |

Import these from feature renderers — do not duplicate heading slug logic or plugin lists.

---

## Renderer architecture

Each content surface splits into **shell** + **presentation**:

| Layer            | Responsibility                                                          | Examples                                                 |
| ---------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| **Shell**        | Format resolution, heading pre-parse, ref reset, `ReactMarkdown` wiring | `BlogContentRenderer`, `PolicyContentRenderer`           |
| **Presentation** | Element mapping (headings, lists, links, theme)                         | `policy-markdown-components.tsx`, inline blog components |

Feature-specific spacing and outline tokens live in `lib/{feature}/` (e.g. `lib/blog/spacing.ts`, `lib/policies/heading-styles.ts`), not in the shared markdown layer.

---

## Hydration-safe heading IDs

**Problem:** A mutable index inside a `useMemo`'d ReactMarkdown `components` object advances across React Strict Mode double-renders → server/client ID mismatch.

**Pattern:**

1. Pre-compute headings with `extractHeadings` (same order as rendered h\* elements).
2. Hold cursor in a **ref**; set `ref.current = 0` at the **start of every render** (before children).
3. Pass ref into `createHeadingIdConsumer` — sequential assignment in document order.
4. Do **not** store a `let queueIndex` closure inside memoized component factories.

Add a component test that **renders twice** (initial + `rerender`) and asserts IDs unchanged.

---

## Heading extraction options

| Surface     | Typical `minLevel` | Notes                                                |
| ----------- | ------------------ | ---------------------------------------------------- |
| Blog posts  | `2` (default)      | h1 excluded from ToC — usually duplicates page title |
| Policy docs | `1`                | Long legal bodies need h1 anchors                    |

Blog re-exports h2–h4 extraction via `lib/blog/toc.ts`; policies call `extractHeadings` directly with `minLevel: 1`.

---

## Adding a new markdown surface

1. Reuse `lib/markdown/*` — no forked slug or sanitize logic.
2. Create `{Feature}ContentRenderer` shell following blog/policy pattern.
3. Put visual tokens in `lib/{feature}/` and document in that feature's `.docs/dev/*.md`.
4. Record foreground theme in [THEMED_SURFACES.md](./THEMED_SURFACES.md) if applicable.
5. Test: heading ID stability + one happy-path render assertion.

---

## Tests

| Area                 | File                                                                                          |
| -------------------- | --------------------------------------------------------------------------------------------- |
| Heading extraction   | `tests/unit/markdown-headings.test.ts`, `tests/unit/toc.test.ts`                              |
| Blog IDs             | `tests/components/BlogContentRenderer.test.tsx`                                               |
| Policy IDs + outline | `tests/components/PolicyContentRenderer.test.tsx`, `tests/unit/policy-heading-styles.test.ts` |

---

## Learnings (why this shape)

- **One markdown pipeline** prevents blog/policy drift on sanitize rules and slug collisions.
- **Ref-reset cursor** fixes hydration without disabling Strict Mode.
- **Shell vs presentation** keeps theme experiments out of parsing logic.
- **Pre-computed headings + sequential consume** beats matching heading level at render time (remark order is document order; level-matching failed under double render).
