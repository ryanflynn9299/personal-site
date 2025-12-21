"use client";

import type { Quote } from "@/app/(portfolio)/quotes/config";

interface ConstellationViewProps {
  quotes: Quote[];
}

export function ConstellationView({ quotes }: ConstellationViewProps) {
  return (
    <div className="min-h-screen bg-amber-900/20 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-amber-500/30 bg-amber-950/40 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-amber-200">
            Rendering: Constellation
          </h2>
          <p className="text-amber-300">{quotes.length} quote(s) loaded</p>
        </div>
      </div>
    </div>
  );
}
