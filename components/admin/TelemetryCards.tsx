"use client";

import { Globe, Database, BarChart3, Server } from "lucide-react";

const TELEMETRY_PLACEHOLDERS = [
  {
    title: "Site Traffic",
    value: "—",
    unit: "Not connected",
    trend: "Matomo pending",
    icon: Globe,
    color: "cyan" as const,
  },
  {
    title: "Core Database",
    value: "—",
    unit: "Not connected",
    trend: "Directus pending",
    icon: Database,
    color: "emerald" as const,
  },
  {
    title: "Analytics Node",
    value: "—",
    unit: "Not connected",
    trend: "Awaiting setup",
    icon: BarChart3,
    color: "purple" as const,
  },
  {
    title: "Server Latency",
    value: "—",
    unit: "Not connected",
    trend: "No live probe",
    icon: Server,
    color: "amber" as const,
  },
];

/**
 * Telemetry Cards Component
 * Honest placeholders until Matomo / live metrics are wired.
 */
export function TelemetryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {TELEMETRY_PLACEHOLDERS.map((card) => (
        <TelemetryCard key={card.title} {...card} />
      ))}
    </div>
  );
}

interface TelemetryCardProps {
  title: string;
  value: string;
  unit: string;
  trend: string;
  icon: typeof Globe;
  color: "cyan" | "emerald" | "purple" | "amber";
}

function TelemetryCard({
  title,
  value,
  unit,
  trend,
  icon: Icon,
  color,
}: TelemetryCardProps) {
  const colors: Record<string, string> = {
    cyan: "text-sky-400",
    emerald: "text-emerald-400",
    purple: "text-purple-400",
    amber: "text-amber-400",
  };

  return (
    <div className="relative group p-5 border border-white/10 rounded-2xl bg-slate-800/40 backdrop-blur-md overflow-hidden hover:border-white/20 transition-all">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {title}
        </h4>
        <Icon
          className={`h-4 w-4 ${colors[color] || "text-slate-400"} opacity-60`}
        />
      </div>

      <div className="relative space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl font-bold tracking-tight text-slate-400">
            {value}
          </span>
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            {unit}
          </span>
        </div>
        <div className="text-[10px] font-bold uppercase flex items-center gap-1.5 text-slate-600">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-600" />
          {trend}
        </div>
      </div>
    </div>
  );
}
