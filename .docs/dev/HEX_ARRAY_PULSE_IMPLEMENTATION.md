# Hex Array Pulse Implementation

## Overview

The Hex Array view (`components/quotes/constellation/hex-array/HexArrayView.tsx`) implements a pulsing hexagon animation system around active tiles. This document describes the requirements and implementation details.

## Requirements

### Visual Design

- **Shape**: Small hexagon-shaped pulses (using the same hexagon geometry as tiles)
- **Color**: Match the active tile's color (cyan, amber, or violet from `ACTIVE_COLORS`)
- **Thickness**: Thicker stroke (2.5px `strokeWidth`)
- **Opacity**: Less opaque (maximum 0.4 opacity)
- **Radius**: Small expansion - pulses should not radiate far from the tile
  - Start: `HEX_SIZE + 2` (slightly larger than tile)
  - End: Scale to 1.2x (20% expansion, not 50-60%)
  - Final radius: `(HEX_SIZE + 2) * 1.2`

### Animation Behavior

- **Single Pulse**: One smooth pulse per animation cycle (not multiple layered pulses)
- **Fade Out**: Must fade out completely when reaching end radius (opacity goes to 0)
- **Duration**: 1 second animation duration
- **Timing**: Smooth fade in, brief hold, fade out at end
  - Opacity curve: `[0, 0.4, 0.4, 0]`
  - Scale curve: `[0.95, 1.15, 1.2, 1.2]`
  - Times: `[0, 0.2, 0.6, 1]` (fade in quickly, hold briefly, fade out at end)

### Global Scheduler

- **Frequency**: One pulse scheduled globally every 3 seconds across all active tiles
- **Initial Delay**: 1 second delay before first pulse
- **Interval**: Exactly 3 seconds between pulses (not random)
- **Selection**: Randomly selects one active tile from all active tiles for each pulse
- **Coordination**: Only one tile pulses at a time (not all tiles independently)

### Implementation Details

#### State Management

- `pulsingTileId` state tracks which tile is currently pulsing
- Scheduler uses `useEffect` with proper cleanup

#### Scheduler Logic

```typescript
// Location: components/quotes/constellation/hex-array/HexArrayView.tsx
// Lines: ~573-592

useEffect(() => {
  const activeTiles = hexGrid.filter((tile) => tile.isActive);
  if (activeTiles.length === 0) return;

  let timeoutId: NodeJS.Timeout;
  let isMounted = true;

  const scheduleNextPulse = () => {
    if (!isMounted) return;

    // Randomly select one active tile to pulse
    const randomTile =
      activeTiles[Math.floor(Math.random() * activeTiles.length)];
    setPulsingTileId(randomTile.id);

    // Schedule next pulse in exactly 3 seconds
    timeoutId = setTimeout(scheduleNextPulse, 3000);
  };

  // Start first pulse after 1 second delay
  timeoutId = setTimeout(scheduleNextPulse, 1000);

  return () => {
    isMounted = false;
    if (timeoutId) clearTimeout(timeoutId);
  };
}, [hexGrid]);
```

#### Pulse Rendering

```typescript
// Location: components/quotes/constellation/hex-array/HexArrayView.tsx
// Lines: ~783-805

{pulsingTileId === tile.id && (
  <g transform={`translate(${tile.x}, ${tile.y})`}>
    <motion.path
      d={getHexPath(HEX_SIZE + 2)} // Smaller end radius - closer to tile
      fill="none"
      stroke={color}
      strokeWidth="2.5" // Thicker stroke
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{
        opacity: [0, 0.4, 0.4, 0], // Less opaque, fades out completely
        scale: [0.95, 1.15, 1.2, 1.2], // Smaller expansion - doesn't radiate as far
      }}
      transition={{
        duration: 1,
        times: [0, 0.2, 0.6, 1], // Fade in quickly, hold briefly, fade out at end
        ease: [0.4, 0, 0.2, 1], // Smooth ease out
      }}
      style={{
        filter: `drop-shadow(0 0 4px ${color})`,
        transformOrigin: "center center",
      }}
    />
  </g>
)}
```

## Key Files

- **Main Component**: `components/quotes/constellation/hex-array/HexArrayView.tsx`
  - Pulse scheduler: Lines ~573-592
  - Pulse rendering: Lines ~783-805
  - Hex path generation: `getHexPath()` function
  - Active tile colors: `ACTIVE_COLORS` constant

## Constants Used

- `HEX_SIZE`: 40 (hexagon radius)
- `ACTIVE_COLORS`: Object mapping color names to hex values
  - `cyan`: "#06b6d4"
  - `amber`: "#f59e0b"
  - `violet`: "#8b5cf6"

## Animation Timeline

1. **0s**: Pulse starts (opacity: 0, scale: 0.95)
2. **0.2s**: Fade in complete (opacity: 0.4, scale: 1.15)
3. **0.6s**: Hold at peak (opacity: 0.4, scale: 1.2)
4. **1.0s**: Fade out complete (opacity: 0, scale: 1.2)

## Scheduler Timeline

1. **0s**: Component mounts
2. **1s**: First pulse on random active tile
3. **4s**: Second pulse on random active tile (1s animation + 3s wait)
4. **7s**: Third pulse on random active tile
5. Continues every 3 seconds
