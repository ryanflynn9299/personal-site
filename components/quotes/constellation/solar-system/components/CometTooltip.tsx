import type { Quote } from "@/app/(portfolio)/quotes/config";

interface CometTooltipProps {
  quote: Quote;
}

export function CometTooltip({ quote }: CometTooltipProps) {
  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-900/95 border border-slate-700 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[90]">
      <p className="text-xs text-slate-200 leading-relaxed">{quote.text}</p>
      {(quote.author || quote.source) && (
        <p className="mt-2 text-xs text-slate-400 font-mono">
          {quote.author && `— ${quote.author}`}
          {quote.author && quote.source && " • "}
          {quote.source}
        </p>
      )}
    </div>
  );
}
