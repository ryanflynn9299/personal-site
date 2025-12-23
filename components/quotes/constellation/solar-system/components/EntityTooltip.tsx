import type { Entity } from "../types";

interface EntityTooltipProps {
  entity: Entity;
  auDistance: string;
}

export function EntityTooltip({ entity, auDistance }: EntityTooltipProps) {
  return (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-4 bg-slate-900/95 border-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 backdrop-blur-xl"
      style={{
        borderColor: entity.color,
      }}
    >
      <p
        className="text-sm font-semibold text-slate-50 mb-2"
        style={{
          color: entity.color,
        }}
      >
        {entity.name}
      </p>
      <p className="text-xs text-slate-400 font-mono mb-2">
        {auDistance} AU
      </p>
      <p className="text-xs text-slate-300 leading-relaxed">
        Click to explore more quotes
      </p>
    </div>
  );
}

