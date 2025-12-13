import React from "react";

interface IconProps {
  className?: string;
}

// Header Icons
export function SatelliteIcon({ className = "w-6 h-6" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

export function PlanetIcon({ className = "w-5 h-5" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

export function StarIcon({ className = "w-4 h-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// List Bullet Icons
export function SmallStarIcon({ className = "w-2 h-2" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2L12 17l-6 4.2 2.4-7.2-6-4.8h7.6L12 2z" />
    </svg>
  );
}

export function AsteroidIcon({ className = "w-2.5 h-2.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      <circle cx="8" cy="8" r="1.5" />
      <circle cx="16" cy="8" r="1.5" />
      <circle cx="12" cy="16" r="1.5" />
    </svg>
  );
}

// Link Icon
export function RocketIcon({ className = "w-3 h-3" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

// Code Block Frame (Terminal/Window)
export function TerminalWindowIcon({ className = "w-full" }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <circle cx="6" cy="8" r="1" fill="currentColor" />
      <circle cx="9" cy="8" r="1" fill="currentColor" />
      <circle cx="12" cy="8" r="1" fill="currentColor" />
      <path d="M6 14h12" />
    </svg>
  );
}

// Horizontal Rule (Constellation Line)
export function ConstellationLineIcon({ className = "w-full h-1" }: IconProps) {
  return (
    <svg viewBox="0 0 100 4" fill="none" className={className}>
      <line
        x1="0"
        y1="2"
        x2="100"
        y2="2"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <circle cx="10" cy="2" r="1" fill="currentColor" />
      <circle cx="30" cy="2" r="1" fill="currentColor" />
      <circle cx="50" cy="2" r="1" fill="currentColor" />
      <circle cx="70" cy="2" r="1" fill="currentColor" />
      <circle cx="90" cy="2" r="1" fill="currentColor" />
    </svg>
  );
}
