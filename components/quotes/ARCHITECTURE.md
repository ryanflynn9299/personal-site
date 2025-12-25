# Quotes Component Architecture & Design Document

## Table of Contents

1. [Overview](#overview)
2. [Project Organization](#project-organization)
3. [Architecture Patterns](#architecture-patterns)
4. [Design Decisions](#design-decisions)
5. [Z-Index Hierarchy](#z-index-hierarchy)
6. [Component Structure](#component-structure)
7. [State Management](#state-management)
8. [Data Flow](#data-flow)
9. [Key Features](#key-features)
10. [Development Guidelines](#development-guidelines)

---

## Overview

The Quotes component system is a sophisticated, multi-view visualization system for displaying quotes in various interactive formats. It supports two main view modes (`normal` and `constellation`), each with multiple variants, providing users with diverse ways to explore and interact with quote collections.

### Core Principles

- **Modularity**: Each view variant is self-contained and independently developed
- **Consistency**: Shared components and patterns ensure consistent UX across views
- **Performance**: Optimized rendering with proper memoization and animation techniques
- **Accessibility**: Keyboard navigation and screen reader support where applicable
- **Extensibility**: Easy to add new view variants without modifying existing code

---

## Project Organization

```
components/quotes/
├── index.ts                          # Public exports
├── QuoteViewRenderer.tsx             # Main router component
├── QuotesPageClient.tsx              # Page-level client component
├── QuoteModalTitle.tsx               # Shared modal title component
├── QuoteModeToggle.tsx               # View mode switcher
├── ViewDevControls.tsx               # Development controls
│
├── store/
│   └── useQuoteViewStore.ts          # Zustand state management
│
├── shared/
│   ├── index.ts
│   └── QuoteCard.tsx                 # Shared quote card component
│
├── normal/                           # Normal view mode variants
│   ├── mission-control/
│   │   └── MissionControlView.tsx
│   └── tesseract/
│       ├── TesseractView.tsx
│       └── Tesseract3D.tsx
│
└── constellation/                    # Constellation view mode variants
    ├── constellation/
    │   ├── ConstellationView.tsx
    │   └── constellationPositions.ts
    │
    ├── solar-system/                 # Solar System View (Most Complex)
    │   ├── SolarSystemView.tsx       # Main orchestrator
    │   ├── buildEntities.ts          # Entity/quote distribution logic
    │   ├── useComets.ts              # Comet animation hook
    │   ├── utils.ts                  # Position calculations
    │   ├── constants.ts              # Configuration constants
    │   ├── types.ts                  # TypeScript interfaces
    │   └── components/
    │       ├── Entity.tsx            # Planet entity component
    │       ├── Sun.tsx               # Sun entity component
    │       ├── Comet.tsx             # Comet/rocket component
    │       ├── EntityShape.tsx       # Shape renderer
    │       ├── EntityTooltip.tsx     # Planet tooltip (deprecated)
    │       ├── CometTooltip.tsx      # Comet tooltip (deprecated)
    │       ├── OrbitLine.tsx         # Orbit visualization
    │       ├── QuoteCard.tsx         # Quote display card
    │       └── CommandConsole.tsx    # Quote detail drawer
    │
    └── hex-array/
        ├── HexArrayView.tsx
        ├── HexPulse.tsx
        ├── SurgePath.tsx
        ├── usePulseScheduler.ts
        ├── useSurgeSpawner.ts
        ├── pathfinding.ts
        ├── vertexGraph.ts
        ├── constants.ts
        ├── pulseConstants.ts
        └── types.ts
```

---

## Architecture Patterns

### 1. View Router Pattern

The `QuoteViewRenderer` component acts as a router, dynamically rendering the appropriate view based on global state:

```typescript
viewMode: "normal" | "constellation"
  ├── normal → activeNormalVariant
  │   ├── "mission_control"
  │   └── "tesseract"
  └── constellation → activeConstellationVariant
      ├── "constellation"
      ├── "solar_system"
      └── "hex_array"
```

### 2. Component Composition

Views are composed of:
- **Container Components**: Orchestrate state and data flow (e.g., `SolarSystemView`)
- **Presentation Components**: Render UI based on props (e.g., `Entity`, `Comet`)
- **Custom Hooks**: Encapsulate complex logic (e.g., `useComets`, `usePulseScheduler`)
- **Utility Functions**: Pure functions for calculations (e.g., `getEntityPosition`)

### 3. State Management

- **Global State**: Zustand store for view mode and variant selection
- **Local State**: React hooks for view-specific state (hover, selection, animations)
- **Derived State**: Computed values via `useMemo` for performance

### 4. Animation Strategy

- **Framer Motion**: Primary animation library for transitions and gestures
- **CSS Animations**: For simple, performant animations (e.g., star backgrounds)
- **RequestAnimationFrame**: For custom animation loops (orbits, comets)

---

## Design Decisions

### 1. Quote Distribution Strategy

**Solar System View** implements a sophisticated quote distribution system:

- **Entity Limit**: Maximum 3 quotes per entity (sun/planet)
- **Quote Bank**: All unused quotes collected into a bank for comets/rockets
- **Priority System**: High-priority quotes prioritized for sun assignment
- **Category-Based**: Quotes grouped by tags for planet assignment

### 2. Tooltip Architecture

**Two-Layer Tooltip System**:

- **Category 1 (Focal) Tooltips**: Sun/Planets - `z-[100]` (highest)
- **Category 2 (Transient) Tooltips**: Comets/Rockets - `z-[90]`
- **Delayed Hide**: 400ms delay before hiding to prevent flicker
- **Separate Rendering**: Tooltips rendered in dedicated layers, not as children of entities

### 3. Entity Categorization

Entities are categorized into two types:

- **Focal Entities** (`entityCategory: "focal"`): Sun and Planets
  - Fixed positions/orbits
  - Zoomable and selectable
  - Detailed tooltips with entity info
  - Quote collections (max 3)

- **Transient Entities** (`entityCategory: "transient"`): Comets and Rockets
  - Dynamic spawning and movement
  - Simple quote-only tooltips
  - No zoom/selection
  - Random quote selection from bank

### 4. Development vs Production Behavior

- **Dev Mode**: Shows "No quotes available" tooltips for empty comets
- **Production**: Hides tooltips entirely when no quotes available
- **State Persistence**: Only persists in development environment

### 5. Performance Optimizations

- **Memoization**: Heavy computations cached with `useMemo`
- **Refs for Animation**: `useRef` for animation state to avoid re-renders
- **CSS Optimizations**: `will-change`, `backfaceVisibility` for smooth animations
- **Transition Disabling**: `transition: { duration: 0 }` on motion components to prevent trails

---

## Z-Index Hierarchy

**Critical Reference**: This hierarchy must be maintained to ensure proper layering across all views.

### Global Z-Index Scale

| Z-Index | Layer | Components | Notes |
|---------|-------|------------|-------|
| `z-[100]` | **Highest** | Category 1 Tooltips (Sun/Planets) | Above all other elements |
| `z-50` | **High** | Modals, Command Console, Dev Controls | Interactive overlays |
| `z-40` | **High** | QuoteModalTitle | Modal title component |
| `z-[90]` | **High** | Category 2 Tooltips (Comets) | Below Category 1 tooltips |
| `z-30` | **Medium-High** | Category 2 Entities (Comets/Rockets) | Above focal entities |
| `z-20` | **Medium** | Category 1 Entities (Sun/Planets) | Focal entities |
| `z-10` | **Low** | Visual elements, overlays, backgrounds | Within entity containers |

### Detailed Breakdown by View

#### Solar System View

```
z-[100]  → Category 1 Tooltips Layer (Sun/Planet tooltips)
z-50     → CommandConsole (quote detail drawer)
z-40     → QuoteModalTitle (instructions modal)
z-[90]   → Category 2 Tooltips Layer (Comet tooltips)
z-30     → Comet entities (rockets/asteroids)
z-20     → Entity containers (Sun/Planets)
z-10     → Orbit lines, visual elements within entities
```

#### Constellation View

```
z-50     → Quote detail modal
z-40     → QuoteModalTitle
z-10     → Background stars, constellation lines
```

#### Hex Array View

```
z-50     → Quote detail modal
z-10     → Hex grid, instructions modal
```

#### Global Components

```
z-50     → ViewDevControls (development controls)
z-10     → QuoteModeToggle (view switcher)
z-10     → Hyperspeed transition overlay
```

### Z-Index Rules

1. **Tooltips Always Highest**: Category 1 tooltips (`z-[100]`) must be above all entities
2. **Modals Above Content**: Interactive modals use `z-50`
3. **Title Above Background**: `QuoteModalTitle` at `z-40` ensures visibility
4. **Entities by Category**: Category 2 entities (`z-30`) above Category 1 (`z-20`)
5. **Visual Elements Lowest**: Backgrounds and decorative elements at `z-10`

### Adding New Components

When adding new components, follow this decision tree:

1. **Is it a tooltip?**
   - Category 1 (focal) → `z-[100]`
   - Category 2 (transient) → `z-[90]`

2. **Is it a modal/overlay?**
   - Interactive modal → `z-50`
   - Title/instructions → `z-40`

3. **Is it an entity?**
   - Transient (comet/rocket) → `z-30`
   - Focal (sun/planet) → `z-20`

4. **Is it decorative?**
   - Background/visual → `z-10`

---

## Component Structure

### Solar System View (Most Complex)

#### Main Orchestrator: `SolarSystemView.tsx`

**Responsibilities**:
- Entity/quote distribution via `buildEntities`
- Animation loop management
- Pan/zoom state
- Tooltip hover state with delay
- Comet generation coordination

**Key State**:
```typescript
- selectedEntity: Entity | null
- isZoomed: boolean
- panState: { x, y, scale }
- hoveredEntityId: string | null
- hoveredCometId: string | null
```

#### Entity Building: `buildEntities.ts`

**Function**: `buildEntities(quotes: Quote[])`

**Returns**:
```typescript
{
  entities: Entity[];           // Planet entities (max 3 quotes each)
  sunEntity: Entity | null;    // Sun entity (max 3 quotes)
  usedQuoteIds: Set<string>;   // Tracked quote IDs
  quoteBank: Quote[];          // Leftover quotes for comets
}
```

**Logic**:
1. Prioritize high-priority quotes for sun (up to 3)
2. Group remaining quotes by tags/categories
3. Assign up to 3 quotes per planet category
4. Collect unused quotes into `quoteBank`

#### Comet System: `useComets.ts`

**Hook**: `useComets(quotes, containerRef, isZoomed, setCometTriggerCallback)`

**Features**:
- Initial comet generation (3 comets)
- Periodic spawning (every 2s, 30% chance)
- Movement animation via `requestAnimationFrame`
- Off-screen cleanup
- Max 5 comets at once

**Quote Selection**:
- Random selection from `quoteBank`
- `null` in production if no quotes
- "No quotes available" in dev mode

#### Position Calculations: `utils.ts`

**Functions**:
- `getEntityPosition()`: Calculate current orbital position
- `getEntityClickPosition()`: Position for click handlers

**Algorithm**:
- Elliptical orbits with eccentricity
- 35° tilt compression for 3D effect
- Real-time angle updates

---

## State Management

### Global Store: `useQuoteViewStore`

**Technology**: Zustand with persistence middleware

**State**:
```typescript
{
  viewMode: "normal" | "constellation"
  activeNormalVariant: "mission_control" | "tesseract"
  activeConstellationVariant: "constellation" | "solar_system" | "hex_array"
  hexSurgeEnabled: boolean
  hexSurgeTriggerCallback: (() => void) | null
  cometTriggerCallback: (() => void) | null
}
```

**Persistence**:
- Only in development environment
- Excludes callback functions
- Uses localStorage

**Actions**:
- `setViewMode()`, `setActiveNormalVariant()`, `setActiveConstellationVariant()`
- `triggerHexSurge()`, `triggerComet()` - Cross-component triggers

### Local State Patterns

**View-Specific State**:
- Managed within view components
- Not persisted
- Reset on view change

**Animation State**:
- Stored in `useRef` to avoid re-renders
- Updated via `requestAnimationFrame`
- Cleaned up on unmount

---

## Data Flow

### Quote Data Flow

```
QuotesPageClient
  └── QuoteViewRenderer
      └── [Selected View Component]
          ├── buildEntities() [Solar System only]
          │   ├── entities (max 3 quotes each)
          │   ├── sunEntity (max 3 quotes)
          │   └── quoteBank (remaining quotes)
          │
          └── [Entity Components]
              └── QuoteCard / CommandConsole
```

### User Interaction Flow

```
User Action
  ├── Hover → setHoveredEntityId → Tooltip Layer (z-[100])
  ├── Click → setSelectedEntity → CommandConsole (z-50)
  └── Mode Change → useQuoteViewStore → QuoteViewRenderer → New View
```

### Animation Flow

```
Animation Loop (requestAnimationFrame)
  ├── Update entity.angle
  ├── Calculate new positions
  ├── Update comet positions
  └── Trigger re-render
```

---

## Key Features

### 1. Multi-View System

- **Normal Mode**: Traditional list/grid views
- **Constellation Mode**: Interactive visualizations

### 2. Solar System View Features

- **Orbital Mechanics**: Realistic elliptical orbits with eccentricity
- **Entity Categories**: Focal (sun/planets) vs Transient (comets)
- **Quote Distribution**: Intelligent assignment with quote bank
- **Tooltip System**: Two-layer system with delayed hide
- **Zoom & Pan**: Click-to-zoom with pan/scale animations
- **Command Console**: Bottom drawer for quote details

### 3. Tooltip System

- **Delayed Hide**: 400ms delay (configurable via `TOOLTIP_HIDE_DELAY`)
- **Separate Layers**: Tooltips rendered independently for proper z-indexing
- **Environment-Aware**: Different behavior in dev vs production

### 4. Performance Features

- **Memoization**: Heavy computations cached
- **Animation Optimization**: Refs for animation state
- **CSS Optimizations**: Hardware acceleration hints
- **Transition Control**: Disabled transitions to prevent visual artifacts

---

## Development Guidelines

### Adding a New View Variant

1. **Create View Component**:
   ```typescript
   // components/quotes/[mode]/[variant]/[Variant]View.tsx
   export function VariantView({ quotes }: VariantViewProps) {
     // Implementation
   }
   ```

2. **Add to Router**:
   ```typescript
   // QuoteViewRenderer.tsx
   case "new_variant":
     return <NewVariantView quotes={quotes} />;
   ```

3. **Update Types**:
   ```typescript
   // app/(portfolio)/quotes/config.ts
   export type ConstellationVariant = "constellation" | "solar_system" | "hex_array" | "new_variant";
   ```

4. **Follow Z-Index Rules**: Use appropriate z-index values from hierarchy

### Adding New Entities (Solar System)

1. **Update `buildEntities.ts`**: Add entity creation logic
2. **Create Component**: Follow `Entity.tsx` or `Comet.tsx` patterns
3. **Add to Types**: Update `types.ts` interfaces
4. **Update Z-Index**: Ensure proper layering

### Modifying Tooltips

1. **Check Category**: Determine if Category 1 (focal) or Category 2 (transient)
2. **Update Z-Index**: Use `z-[100]` or `z-[90]` accordingly
3. **Maintain Delay**: Keep `TOOLTIP_HIDE_DELAY` behavior
4. **Test Layering**: Verify tooltips appear above entities

### Performance Considerations

- Use `useMemo` for expensive calculations
- Use `useRef` for animation state
- Avoid inline object/array creation in render
- Use `will-change` and `backfaceVisibility` for animations
- Disable transitions on frequently-updated elements

### Testing Checklist

- [ ] Z-index hierarchy maintained
- [ ] Tooltips appear above entities
- [ ] Animations smooth (60fps)
- [ ] No visual artifacts (trails, flicker)
- [ ] State persists correctly (dev only)
- [ ] Responsive on mobile
- [ ] Accessibility (keyboard navigation)

---

## Constants Reference

### Solar System Constants

**Location**: `components/quotes/constellation/solar-system/constants.ts`

| Constant | Value | Purpose |
|----------|-------|---------|
| `MAX_QUOTES_PER_ENTITY` | 3 | Maximum quotes per sun/planet |
| `TOOLTIP_HIDE_DELAY` | 400ms | Delay before hiding tooltip |
| `COMET_INITIAL_COUNT` | 3 | Initial comets on load |
| `COMET_MAX_COUNT` | 5 | Maximum concurrent comets |
| `COMET_SPAWN_CHANCE` | 0.3 | Probability of spawning new comet |
| `COMET_SPAWN_INTERVAL` | 2000ms | Interval between spawn checks |

---

## Future Considerations

### Potential Enhancements

1. **Accessibility**: ARIA labels, keyboard navigation
2. **Mobile Optimization**: Touch gestures, responsive layouts
3. **Performance**: Virtual scrolling for large quote sets
4. **Theming**: Dark/light mode support
5. **Export**: PDF/image export of views
6. **Search**: Full-text search across quotes
7. **Filtering**: Tag-based filtering

### Technical Debt

- [ ] Consolidate tooltip components (currently deprecated but still referenced)
- [ ] Standardize animation patterns across views
- [ ] Create shared animation utilities
- [ ] Improve TypeScript strictness
- [ ] Add comprehensive error boundaries

---

## Changelog

### Recent Changes

- **2024**: Added tooltip delay system (400ms)
- **2024**: Limited quotes to 3 per entity
- **2024**: Implemented quote bank system
- **2024**: Added dev/prod tooltip behavior differentiation
- **2024**: Moved `QuoteModalTitle` to `z-40`

---

**Last Updated**: 2024  
**Maintainer**: Development Team  
**Status**: Active Development

