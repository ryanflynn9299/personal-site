'use client';

import type { Quote } from '@/app/(portfolio)/quotes/config';

interface HyperCompassViewProps {
  quotes: Quote[];
}

export function HyperCompassView({ quotes }: HyperCompassViewProps) {
  return (
    <div className="min-h-screen bg-purple-900/20 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-purple-500/30 bg-purple-950/40 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-purple-200">
            Rendering: Hyper Compass
          </h2>
          <p className="text-purple-300">
            {quotes.length} quote(s) loaded
          </p>
        </div>
      </div>
    </div>
  );
}

