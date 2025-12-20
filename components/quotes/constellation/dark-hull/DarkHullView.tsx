'use client';

import type { Quote } from '@/app/(portfolio)/quotes/config';

interface DarkHullViewProps {
  quotes: Quote[];
}

export function DarkHullView({ quotes }: DarkHullViewProps) {
  return (
    <div className="min-h-screen bg-slate-900/40 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-slate-500/30 bg-slate-950/60 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-slate-200">
            Rendering: Dark Hull (Hex Grid)
          </h2>
          <p className="text-slate-300">
            {quotes.length} quote(s) loaded
          </p>
        </div>
      </div>
    </div>
  );
}

