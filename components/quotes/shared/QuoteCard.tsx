"use client";

import type { Quote } from "@/app/(portfolio)/quotes/config";

interface QuoteCardProps {
  quote: Quote;
}

/**
 * Shared quote card component that can be used across different view variants
 */
export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
      <p className="text-slate-200">{quote.text}</p>
      {quote.author && (
        <p className="mt-2 text-sm text-slate-400">— {quote.author}</p>
      )}
      {quote.source && (
        <p className="mt-1 text-xs text-slate-500">{quote.source}</p>
      )}
    </div>
  );
}
