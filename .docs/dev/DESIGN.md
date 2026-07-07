# Design direction

**Type:** Guidance — broad, generally applicable  
**Scope:** Product posture, UX, UI, visual theme, typography, spacing principles

This document states **principles and patterns**, not feature-specific behavior. For a particular page, component, or flow, read the **feature doc** for that area ([PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md) § Documentation index).

Related: [AI_GUARDRAILS.md](../prompting/AI_GUARDRAILS.md) § UX supremacy · [.cursor/rules/ux-and-ui.mdc](../../.cursor/rules/ux-and-ui.mdc)

---

## 1. Product posture

The site is a **credible professional presence** — not a marketing landing page or a SaaS dashboard.

| Goal          | Design implication                                           |
| ------------- | ------------------------------------------------------------ |
| **Trust**     | Honest system state; no fake success, no hidden failures     |
| **Clarity**   | One primary task per view; predictable navigation            |
| **Craft**     | Cohesive palette and typography; restrained thematic accents |
| **Longevity** | Patterns that scale as content grows without redesign churn  |

Non-goals: engagement bait, dark patterns, decorative chrome that competes with content, emoji used as generic UI decoration.

---

## 2. UX principles

UX is **paramount** — see [AI_GUARDRAILS.md](../prompting/AI_GUARDRAILS.md). When a request conflicts with UX, push back and propose a compliant alternative.

### Core commitments

1. **Honest feedback** — Users know what happened: saved vs sent vs failed vs loading. Uncertainty beats false success.
2. **Predictable navigation** — Back actions go up the hierarchy; primary nav stays stable; destructive actions are explicit.
3. **Accessibility** — Keyboard operable, visible focus, labels on controls, sufficient contrast.
4. **Proportionate friction** — Confirm irreversible work; do not add steps to routine reading or browsing.
5. **Recovery** — Errors suggest a next step (retry, go back, alternative path).

### Gestalt and spacing (Laws of UX)

Apply when grouping and spacing any UI:

| Principle         | Application                                                                |
| ----------------- | -------------------------------------------------------------------------- |
| **Proximity**     | Related items sit tight; unrelated regions get more separation.            |
| **Common Region** | Borders, cards, and section rules signal “belongs together.”               |
| **Similarity**    | Peer items (grid cells, nav links, list rows) share equal gaps and style.  |
| **Prägnanz**      | One spacing scale and one accent system — avoid arbitrary one-off margins. |

Feature areas may **codify tokens** in code; the principles above still govern new work.

---

## 3. Visual theme

### Neutral core (default)

Baseline for most pages:

| Element        | Treatment                                                |
| -------------- | -------------------------------------------------------- |
| **Background** | Dark slate surfaces, slightly elevated panels            |
| **Borders**    | Muted slate, one step lighter than background            |
| **Text**       | High-contrast headings; body one step softer; meta muted |
| **Accent**     | Sky family for links, hover, and focus rings             |
| **Headings**   | Display/heading font; weight by level                    |
| **Body**       | Default sans; comfortable line height in long prose      |

Match **existing Tailwind usage** in the file and view you are editing before introducing new color or type choices.

### Thematic undertones

Optional **space** and **coding** layers add character — starfields, cosmic copy, mono path chrome, comment-style epithets, etc.

| Level          | Rule                                                                                      |
| -------------- | ----------------------------------------------------------------------------------------- |
| **Subtle**     | Default on primary content flows: palette only, at most one quiet hint                    |
| **Foreground** | Only when the surface’s UX goal warrants it — document in that surface’s **feature spec** |

Do not spread foreground theme treatment to unrelated pages. When adding a new foreground-themed surface, record it in the relevant feature documentation.

---

## 4. Typography & hierarchy

### Match the view, not a template

Read **sibling components on the same page** before adding classes. The codebase is the second source of truth after this doc.

### Roles

| Role                 | Intent                                                 |
| -------------------- | ------------------------------------------------------ |
| **Page title**       | Largest heading weight; establishes the view           |
| **Section title**    | Heading font, semibold, readable size — not meta-sized |
| **Body**             | Comfortable reading size and color                     |
| **Meta / secondary** | Smaller, muted — dates, counts, hints                  |
| **Interactive**      | Accent color; hover/focus states consistent with site  |

### Avoid

- Shrinking real section titles to meta styling (reads as placeholder or broken).
- Uppercase tracked labels on in-content section headings (dashboard tone).
- Narrowing intro copy with max-width utilities when the surrounding page uses full container width — unless that page already establishes a centered/narrow layout.

### Hierarchical outlines

When UI expresses depth (nested headings, trees, indented nav):

| Rule                      | Rationale                                                                                                                                          |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Visible framework**     | Measured columns, guides, or branch connectors — not bare `margin-left` alone. Empty offset reads as a misplaced element, not intentional nesting. |
| **Structure vs emphasis** | Neutral guides for ancestry; theme accent only on the **current** level's active rail or marker.                                                   |
| **Equal depth steps**     | One grid increment per tier (e.g. 24px). Predictable beats ad hoc `pl-4` / `pl-8` / `pl-12` with no connecting grammar.                            |
| **Restrained decoration** | No looping animation on long-form professional prose. Motion belongs in interactive surfaces, not static reading.                                  |
| **Fixed marker columns**  | If using prefix symbols, shared width and baseline alignment — or omit symbols and rely on rails + type scale.                                     |

Feature-specific outline implementations live in feature docs ([MARKDOWN_CONTENT.md](./MARKDOWN_CONTENT.md) index).

---

## 5. Spacing & rhythm

1. **Within a group** — tight spacing between label and control, title and subtitle.
2. **Between sections on one page** — moderate gap before a new functional block.
3. **Major region breaks** — larger margin, often with a top rule and padding, before footer nav or pagination-style bars.
4. **Removing box chrome** — tighten vertical rhythm; do not replace inner padding with excessive outer margin.
5. **Scroll areas** — only when content volume requires it, not by default on short lists.

When the same spacing repeats across multiple features, extract shared tokens in code and document them in the **feature doc** that owns that UI.

---

## 6. UI patterns

### Structure

- Follow [ARCHITECTURE.md](../ARCHITECTURE.md) for route and client/server split.
- Reuse `components/primitives/` before new controls.
- Prefer lightweight overlays (dialog pattern) over heavy modal chrome unless the task demands more.

### Navigation

- Global header: sticky, primary routes, stable labels.
- Hierarchical content: wayfinding (back, breadcrumbs, or equivalent) that moves up the tree — specified per feature.

### Forms & actions

- Validate early; inline errors where possible.
- Loading and disabled states on uncertain operations.
- Primary action visually clear; destructive actions distinct and confirmed when irreversible.

### Content surfaces

- Long prose: shared renderers; heading hierarchy consistent with in-page navigation when present. Shared markdown pipeline: [MARKDOWN_CONTENT.md](./MARKDOWN_CONTENT.md).
- Cards: consistent border, hover, and internal padding within a feature.

### Copy & voice

- Direct and human — not corporate or over-polished.
- Microcopy states what will happen; buttons name the action.
- Honest scope in introductory copy — do not invent a niche the content does not support.

---

## 7. Implementation checklist

Before shipping UI:

1. Read this doc for principles.
2. Read the **feature doc** for the area you are changing.
3. Match sibling components on the same page.
4. Reuse primitives and existing patterns in files you touch.
5. Verify honest states, keyboard focus, and responsive layout.
6. If you introduce a new foreground-themed surface or spacing token set, update the **feature doc** (not this file).

### Common mistakes (general)

| Mistake                               | Instead                                          |
| ------------------------------------- | ------------------------------------------------ |
| Generic max-width on full-width pages | Match the page’s established layout              |
| Box removal → excessive outer margin  | Tighter section breaks                           |
| Meta styling on section titles        | Heading weight and readable size                 |
| Foreground theme on every page        | Neutral core; theme only where feature doc says  |
| One-off spacing values                | Reuse tokens or sibling patterns                 |
| Bare margin for nested hierarchy      | Visible outline framework (guides, equal steps)  |
| Mutable render state in `useMemo`     | Ref reset per render; see MARKDOWN_CONTENT.md    |
| Decorative animation on legal/prose   | Typography + static rails; motion on interaction |

---

## 8. Where feature detail lives

This file does **not** list routes, components, labels, or token files. Use [PROJECT_INDEX.md](../prompting/PROJECT_INDEX.md):

- **Guidance** — principles like this doc, architecture, testing strategy, security posture.
- **Feature** — blog, author profiles, contact, themed surface inventory, CMS wiring, etc.

When guidance and a feature doc appear to conflict, **guidance wins** unless the operator explicitly overrides and updates docs in the same change.
