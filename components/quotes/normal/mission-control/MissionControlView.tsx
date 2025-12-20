'use client';

import type { Quote } from '@/app/(portfolio)/quotes/config';

interface MissionControlViewProps {
  quotes: Quote[];
}

export function MissionControlView({ quotes }: MissionControlViewProps) {
  return (
    <div className="min-h-screen bg-blue-900/20 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-blue-500/30 bg-blue-950/40 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-blue-200">
            Rendering: Mission Control
          </h2>
          <p className="text-blue-300">
            {quotes.length} quote(s) loaded
          </p>
        </div>
      </div>
    </div>
  );
}

