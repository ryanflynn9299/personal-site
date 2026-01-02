"use client";

import { useState, useCallback } from "react";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { Check, Copy } from "lucide-react";
import { createLogger } from "@/lib/logger";

const log = createLogger("ALL");

interface MissionControlViewProps {
  quotes: Quote[];
}

/**
 * Mission Control View - Deep Space Terminal Interface
 *
 * A pristine, read-only data stream that evokes a high-fidelity
 * "Deep Space Terminal" interface with HUD Plate aesthetic.
 */
export function MissionControlView({ quotes }: MissionControlViewProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Get the first quote as "Transmission of the Day"
  const transmissionOfTheDay = quotes[0] || null;
  const remainingQuotes = quotes.slice(1);

  const handleCopy = useCallback(async (quote: Quote) => {
    const textToCopy = quote.text + (quote.author ? ` — ${quote.author}` : "");

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(quote.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      log.error({ error: err }, "Failed to copy quote to clipboard");
    }
  }, []);

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Transmission of the Day Hero Section */}
        {transmissionOfTheDay && (
          <section className="mb-16 border-b border-slate-800 pb-12">
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-xs font-medium text-slate-500 animate-pulse">
                {"// TRANSMISSION_RECEIVED"}
              </span>
            </div>
            <div className="space-y-6">
              <blockquote className="font-inter text-4xl font-bold leading-tight text-slate-50 md:text-5xl lg:text-6xl">
                {transmissionOfTheDay.text}
              </blockquote>
              {transmissionOfTheDay.author && (
                <div className="flex items-center gap-4 font-mono text-sm text-slate-400">
                  <span className="text-slate-600">—</span>
                  <span>{transmissionOfTheDay.author}</span>
                  {transmissionOfTheDay.source && (
                    <>
                      <span className="text-slate-600">{"//"}</span>
                      <span className="text-slate-500">
                        {transmissionOfTheDay.source}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Bento Box Grid */}
        <section>
          <div className="mb-8 flex items-center gap-3">
            <span className="font-mono text-xs font-medium text-slate-600">
              {"// ARCHIVE_ACCESS"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {remainingQuotes.map((quote) => {
              const isHighPriority = quote.priority === "high";
              const isCopied = copiedId === quote.id;

              return (
                <button
                  key={quote.id}
                  onClick={() => handleCopy(quote)}
                  className={`group relative overflow-hidden border bg-slate-950/80 p-6 text-left transition-colors hover:border-slate-600 ${
                    isHighPriority
                      ? "col-span-1 border-slate-800 md:col-span-2"
                      : "col-span-1 border-slate-800"
                  }`}
                  aria-label={`Copy quote: ${quote.text}`}
                >
                  {/* HUD Plate Content */}
                  <div className="space-y-4">
                    {/* Quote Text */}
                    <p className="font-inter text-lg font-medium leading-relaxed text-slate-100 group-hover:text-slate-50">
                      {quote.text}
                    </p>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-slate-500">
                      {quote.author && (
                        <>
                          <span className="text-slate-600">AUTHOR:</span>
                          <span className="text-slate-400">{quote.author}</span>
                        </>
                      )}
                      {quote.source && (
                        <>
                          <span className="text-slate-600">{"//"}</span>
                          <span className="text-slate-500">{quote.source}</span>
                        </>
                      )}
                    </div>

                    {/* Tags */}
                    {quote.tags && quote.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {quote.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="font-mono text-xs text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Copy Feedback Indicator */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {isCopied ? (
                        <>
                          <Check className="h-3 w-3 text-slate-400" />
                          <span className="font-mono text-xs text-slate-500">
                            COPIED
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 text-slate-600" />
                          <span className="font-mono text-xs text-slate-600">
                            COPY
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Subtle hover effect on border */}
                  <div className="pointer-events-none absolute inset-0 border border-slate-800 opacity-0 transition-opacity group-hover:border-slate-600 group-hover:opacity-100" />
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
