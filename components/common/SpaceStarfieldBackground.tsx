/**
 * Animated starfield backdrop shared by space-themed status pages.
 */
export function SpaceStarfieldBackground() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="stars stars-1" />
      <div className="stars stars-2" />
      <div className="stars stars-3" />
    </div>
  );
}
