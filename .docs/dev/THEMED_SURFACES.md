# Themed surfaces (feature inventory)

**Type:** Feature — specific UI surfaces and how sub-themes apply  
**Guidance parent:** [DESIGN.md](./DESIGN.md) § Thematic undertones

This doc records **where** space and coding undertones are foreground today. It is not a style guide — principles live in DESIGN.md.

When you add or change a foreground-themed surface, update this inventory in the same PR.

---

## Sub-theme reference

| Sub-theme  | Signals (when foreground)                                            |
| ---------- | -------------------------------------------------------------------- |
| **Space**  | Starfields, cosmic copy, planet/star motifs, glassy overlays         |
| **Coding** | Mono type, path separators, comment epithets, status-code typography |

**Site-wide subtle hint (coding):** header epithet `// Building Scalable Systems` in `components/common/Header.tsx` — not foreground; one quiet undertone on core chrome.

---

## Foreground surfaces

| Surface                                                   | Theme  | Rationale                                 | Feature doc                          |
| --------------------------------------------------------- | ------ | ----------------------------------------- | ------------------------------------ |
| Error / status pages (`SpaceThemedStatusPage`)            | Space  | Disorientation → playful recovery         | —                                    |
| Policies viewer (`PoliciesPage`, `PolicyContentRenderer`) | Space  | Long-form “mission document” reading mode | [POLICIES.md](./POLICIES.md)         |
| Blog breadcrumbs (`BlogPostBreadcrumbs`)                  | Coding | Path-style wayfinding                     | [BLOG.md](./BLOG.md)                 |
| Dev mode / admin chrome                                   | Coding | Operator tooling                          | [ADMIN_ACCESS.md](./ADMIN_ACCESS.md) |
| Quotes constellation / solar system                       | Space  | Interactive delight; theme is the feature | —                                    |
| Vitae work timeline (`VitaeExperienceSection`)            | Space  | Planet bullets; rare random twinkle       | `lib/vitae/twinkle.ts`               |

Adjacent UI should match the **undertone level** of the surface it sits on — not the loudest themed page on the site.

---

## Cross-feature implementation notes

These patterns appear in feature-owned components; details stay in feature docs.

| Pattern                          | Owner | Notes                                                                                                                           |
| -------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------- |
| Path `/` dividers in breadcrumbs | Blog  | Symmetric padding on divider element; no flex `gap-x` + divider margin stack — see [BLOG.md](./BLOG.md) § Breadcrumb navigation |
| Breadcrumb data vs UI split      | Blog  | `lib/blog/breadcrumbs.ts` vs `BlogPostBreadcrumbs.tsx`                                                                          |
