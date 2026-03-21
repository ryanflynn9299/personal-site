"use client";

import { LucideIcon, Server, Globe, Database, BarChart3 } from "lucide-react";

/**
 * Telemetry Cards Component
 * Shows high-level site stats and status.
 */
export function TelemetryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <TelemetryCard
        title="Site Traffic"
        value="4.2k"
        unit="Hits / 24h"
        trend="+12%"
        icon={Globe}
        color="cyan"
      />
      <TelemetryCard
        title="Core Database"
        value="98.4%"
        unit="Uptime"
        trend="Nominal"
        icon={Database}
        color="emerald"
      />
      <TelemetryCard
        title="Analytics Node"
        value="Active"
        unit="Telemetry"
        trend="Synced"
        icon={BarChart3}
        color="purple"
      />
      <TelemetryCard
        title="Server Latency"
        value="24ms"
        unit="Avg RTT"
        trend="-2ms"
        icon={Server}
        color="amber"
      />
    </div>
  );
}

interface TelemetryCardProps {
  title: string;
  value: string;
  unit: string;
  trend: string;
  icon: LucideIcon;
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
          <span className="font-heading text-3xl font-bold tracking-tight text-white">
            {value}
          </span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {unit}
          </span>
        </div>
        <div
          className={`text-[10px] font-bold uppercase flex items-center gap-1.5 ${trend.includes("+") ? "text-emerald-500" : trend === "Nominal" ? "text-sky-400" : "text-slate-500"}`}
        >
          <div
            className={`w-1.5 h-1.5 rounded-full ${trend.includes("+") ? "bg-emerald-500 animate-pulse" : trend === "Nominal" ? "bg-sky-400" : "bg-slate-500"} `}
          />
          {trend}
        </div>
      </div>
    </div>
  );
}
