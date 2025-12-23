import type { Quote } from "@/app/(portfolio)/quotes/config";

interface QuoteCardProps {
  quote: Quote;
  entityColor: string;
}

/**
 * Quote Card for Masonry Grid
 */
export function QuoteCard({ quote, entityColor }: QuoteCardProps) {
  return (
    <article
      className="border-2 bg-slate-950/80 p-6 transition-colors hover:bg-slate-900"
      style={{
        borderColor: `${entityColor}60`,
      }}
    >
      <blockquote className="font-inter text-lg font-semibold leading-relaxed text-slate-50">
        {quote.text}
      </blockquote>

      {(quote.author || quote.source) && (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-slate-800 pt-4 font-mono text-xs text-slate-400">
          {quote.author && (
            <>
              <span className="text-slate-600">AUTHOR:</span>
              <span>{quote.author}</span>
            </>
          )}
          {quote.source && (
            <>
              <span className="text-slate-600">//</span>
              <span className="text-slate-500">{quote.source}</span>
            </>
          )}
        </div>
      )}

      {quote.tags && quote.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
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
    </article>
  );
}

