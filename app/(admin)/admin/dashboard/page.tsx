import { AdminHeader } from "@/components/admin/AdminHeader";
import { TelemetryCards } from "@/components/admin/TelemetryCards";
import { ControlConsole } from "@/components/admin/ControlConsole";
import { SubspaceMessagesPanel } from "@/components/admin/SubspaceMessagesPanel";
import { LayoutDashboard, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-slate-900/40">
      {/* Refined Header */}
      <AdminHeader />

      {/* Main Mission Control Interface */}
      <main className="flex-grow flex flex-col md:flex-row gap-8 p-8 overflow-hidden">
        {/* Left Column: Communications */}
        <section className="w-full md:w-[320px] flex flex-col gap-8">
          <SubspaceMessagesPanel />
        </section>

        {/* Center Column: Global Telemetry */}
        <section className="flex-1 flex flex-col gap-8 overflow-y-auto custom-scrollbar pr-1">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-5 w-5 text-sky-400" />
            <h2 className="font-heading text-xl font-bold tracking-tight text-white uppercase">
              Global Telemetry Hub
            </h2>
          </div>

          <TelemetryCards />

          <div className="flex-1 border border-white/10 rounded-2xl bg-slate-800/20 backdrop-blur-sm p-8 flex flex-col items-center justify-center border-dashed">
            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-6">
              Tactical Visualization Offline
            </div>
            <button className="px-6 py-2 rounded-xl border border-sky-500/30 bg-sky-500/5 text-sky-400 text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500/10 transition-all">
              Initialize Orbital Map
            </button>
          </div>
        </section>

        {/* Right Column: Sector Commands */}
        <aside className="w-full md:w-[350px] flex flex-col gap-8">
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-sky-400" />
            <h2 className="font-heading text-xl font-bold tracking-tight text-white uppercase">
              Sector Commands
            </h2>
          </div>

          <ControlConsole />

          <div className="mt-auto p-5 border border-amber-500/20 rounded-2xl bg-amber-500/5 backdrop-blur-md">
            <div className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest mb-2 leading-none flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Emergency Overrides
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              Sector locking should only be used during critical data
              instability.
            </p>
          </div>
        </aside>
      </main>

      {/* Persistence Status Bar */}
      <footer className="h-10 border-t border-white/5 bg-slate-950/40 flex items-center justify-between px-8">
        <div className="flex items-center gap-6 text-[9px] font-bold text-slate-600 uppercase tracking-widest font-mono">
          <span className="flex items-center gap-2">
            CORE_VERSION: <span className="text-sky-400/60">2.1.0-STABLE</span>
          </span>
          <span className="flex items-center gap-2">
            LATENCY: <span className="text-emerald-500/60">12ms</span>
          </span>
          <span className="text-sky-500/40 font-black">
            SECURE_TUNNEL: ACTIVE
          </span>
        </div>
        <div className="text-[9px] font-bold text-slate-700 uppercase tracking-widest font-mono">
          © 2026 FLYNN SYSTEMS // ALL RIGHTS RESERVED
        </div>
      </footer>
    </div>
  );
}
