# Archived components

**Frozen reference code — do not modify, import, or delete without explicit operator approval.**

This directory holds superseded or unused UI kept for historical reference and design comparison. It is intentionally excluded from the active application bundle (nothing in `app/` or active `components/` imports from here).

## Policy

| Rule              | Detail                                                                                 |
| ----------------- | -------------------------------------------------------------------------------------- |
| **Do not import** | Never add `import … from "@/components/archived/…"` (or relative paths) in active code |
| **Do not edit**   | Do not refactor, fix lint, or “clean up” archived files during routine work            |
| **Do not delete** | Removal requires explicit operator sign-off (see `.docs/dev/TODO.md`)                  |
| **AI agents**     | Skip archived paths unless the task explicitly targets this directory                  |

Active replacements live alongside this folder — see the inventory below.

## Inventory

| Path                                | Notes                                                                     |
| ----------------------------------- | ------------------------------------------------------------------------- |
| `MagicBento2.tsx`, `TechStack2.tsx` | Earlier bento grid; replaced by `MagicBento3` / `MagicBento4`             |
| `ProjectCarousel.tsx`               | Earlier carousel; replaced by `components/sections/ProjectCarousel.tsx`   |
| `primitives/misc/Particle.tsx`      | React Bits particle background; unused                                    |
| `primitives/misc/Masonry.tsx`       | Masonry layout demo; unused                                               |
| `primitives/misc/SafeSVGImage.tsx`  | SVG sanitization helper; unused (active code: `lib/site/svg-security.ts`) |
| `primitives/misc/hyperspeed/`       | WebGL hyperspeed demo; unused (`HyperspeedTransition` remains active)     |

## See also

- [.docs/prompting/DEVELOPMENT_GUIDELINES.md](../../.docs/prompting/DEVELOPMENT_GUIDELINES.md) — archived component policy
- [.docs/prompting/PROJECT_INDEX.md](../../.docs/prompting/PROJECT_INDEX.md) — project structure map
