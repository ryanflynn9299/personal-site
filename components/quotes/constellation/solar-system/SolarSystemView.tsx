"use client";

import type { Quote } from "@/app/(portfolio)/quotes/config";

interface SolarSystemViewProps {
  quotes: Quote[];
}

export function SolarSystemView({ quotes }: SolarSystemViewProps) {
  return (
    <div className="min-h-screen bg-rose-900/20 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-lg border border-rose-500/30 bg-rose-950/40 p-8 backdrop-blur-sm">
          <h2 className="mb-4 text-2xl font-bold text-rose-200">
            Rendering: Solar System
          </h2>
          <p className="text-rose-300">{quotes.length} quote(s) loaded</p>
        </div>
      </div>
    </div>
  );
}
