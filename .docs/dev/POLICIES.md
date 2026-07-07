# Policies viewer

**Type:** Feature — legal document UI, markdown rendering, and per-policy themes  
**Guidance parent:** [DESIGN.md](./DESIGN.md) § Thematic undertones

Developer reference for Privacy Policy and Terms of Service on `/policies`. Design **principles** live in [DESIGN.md](./DESIGN.md); this doc is authoritative for policy implementation.

Related: [THEMED_SURFACES.md](./THEMED_SURFACES.md), [SEO.md](./SEO.md), [MARKDOWN_CONTENT.md](./MARKDOWN_CONTENT.md), `data/policies/README.md`.

---

## Architecture

| Layer               | Path                                                                                 | Role                                                                  |
| ------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| **Data**            | `data/policies/*.md`                                                                 | Markdown + YAML frontmatter (`title`, `lastUpdated`)                  |
| **Loader**          | `lib/policy-utils/policy-loader.ts`                                                  | Server-only read + frontmatter parse                                  |
| **Themes**          | `data/policy-colors.ts`, `lib/policy-utils/policy-colors.ts`                         | Per-policy accent colors (tabs, icons, links)                         |
| **Shared markdown** | `lib/markdown/headings.ts`, `lib/markdown/plugins.ts`, `lib/markdown/heading-ids.ts` | Heading extraction, GFM + sanitize plugins, hydration-safe anchor IDs |
| **Renderer**        | `components/policies/PolicyContentRenderer.tsx`                                      | Client markdown shell (format resolution, ref reset)                  |
| **Presentation**    | `components/policies/policy-markdown-components.tsx`, `PolicyHeading.tsx`            | Space-themed element mapping + outline headings                       |
| **Page shell**      | `components/policies/PoliciesPage.tsx`                                               | Tabbed viewer, starfield chrome, document panel                       |

Blog posts reuse the same shared markdown layer via `BlogContentRenderer` — see [BLOG.md](./BLOG.md).

---

## Markdown rendering

### Pipeline

1. **Parse headings offline** — `extractHeadings(content, format, { minLevel: 1, maxLevel: 4 })` produces stable slug IDs (includes h1 for long legal sections).
2. **Reset cursor each render** — `headingIndexRef.current = 0` before ReactMarkdown runs (avoids Strict Mode / hydration ID drift — same pattern as blog).
3. **Assign IDs in document order** — `createHeadingIdConsumer` maps rendered h1–h4 to precomputed slugs sequentially.
4. **Sanitize** — `rehype-raw` + `rehype-sanitize` via `lib/markdown/plugins.ts`.

### Space-themed presentation

**Section outline (headings)** — `lib/policies/heading-styles.ts`, `components/policies/PolicyHeading.tsx`

| Level  | Treatment                                                                                         |
| ------ | ------------------------------------------------------------------------------------------------- |
| **h1** | Full-width document title band — bottom rule only                                                 |
| **h2** | Primary accent rail (`border-l-4`) at column 0                                                    |
| **h3** | One **24px guide column** (neutral vertical line) + accent rail (`border-l-2`)                    |
| **h4** | Two guide columns — ancestor line + **branch tick** at cap height — then accent rail (`border-l`) |

Guide columns use neutral `slate-600/40` lines; accent rails use the active policy theme. Body paragraphs stay full width.

List items keep star/asteroid markers; links retain a subtle rocket on hover. Links use Tailwind theme classes only — no inline `style` or mouse handlers. List bullet type uses `PolicyListContext` (ordered vs unordered) instead of inspecting AST `node.parent`.

### Routes

| Route                   | Behavior                                                |
| ----------------------- | ------------------------------------------------------- |
| `/policies`             | Tabbed viewer; default tab from `?tab=` or first policy |
| `/policies?tab=privacy` | Privacy Policy                                          |
| `/policies?tab=terms`   | Terms of Service                                        |
| `/privacy`, `/terms`    | Redirect to `/policies?tab=…`                           |

---

## Spacing system

**Source of truth (code):** `lib/policies/spacing.ts` — import `policySpacing` in policy components.

| Token                           | Tailwind                  | Use                         |
| ------------------------------- | ------------------------- | --------------------------- |
| `pagePaddingX` / `pagePaddingY` | responsive `px-*`, `py-8` | Page shell                  |
| `layoutGap`                     | `gap-6`                   | Sidebar ↔ document panel   |
| `sidebarTitleToTabs`            | `mb-4`                    | “Policies” label → tab list |
| `tabGap`                        | `gap-2`                   | Tab buttons                 |
| `documentHeaderPadding`         | `px-6 py-4`               | Document chrome header      |
| `documentMetaTop`               | `mt-1`                    | “Last Updated” line         |
| `documentHeaderToBody`          | `px-6 py-8`               | Scrollable markdown body    |

Global motion/chrome for the document panel: `.policy-document-panel` in `app/globals.css` (legacy alias `.pseudo-markdown-editor` retained).

---

## Adding a policy

1. Add `data/policies/{id}.md` with frontmatter (`title`, `lastUpdated`).
2. Add a color entry in `data/policy-colors.ts`.
3. Wire tab mapping in `PoliciesPage` and `mapTabToPolicyId` if query-param routing is needed.
4. Update [THEMED_SURFACES.md](./THEMED_SURFACES.md) if the surface treatment changes.

---

## Tests

| Area                        | File                                              |
| --------------------------- | ------------------------------------------------- |
| Heading extraction (shared) | `tests/unit/markdown-headings.test.ts`            |
| Policy renderer IDs         | `tests/components/PolicyContentRenderer.test.tsx` |
| Color themes                | `tests/unit/policy-colors.test.ts`                |
| Loader                      | `tests/unit/policy-loader.test.ts`                |
| E2E tabs + redirects        | `tests/e2e/policies.spec.ts`                      |
