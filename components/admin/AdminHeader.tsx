"use client";

import { useState, useEffect } from "react";
import { logout } from "@/app/actions/auth";
import { LogOut, Activity, Zap, ShieldCheck } from "lucide-react";

export function AdminHeader() {
  const [time, setTime] = useState(new Date());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="border-b border-white/10 bg-slate-900/60 backdrop-blur-xl px-8 py-5 flex items-center justify-between relative">
      <div className="flex items-center gap-6">
        <div className="flex flex-col">
          <h1 className="font-heading text-xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="h-5 w-5 text-sky-400" />
            MISSION CONTROL{" "}
            <span className="text-slate-600 font-light text-sm tracking-widest pl-2">
              SECTOR 7G
            </span>
          </h1>
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1.5">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-amber-500" /> System: Nominal
            </span>

            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> Auth:
              Verified
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-10">
        <div className="hidden md:flex flex-col items-end min-w-[150px]">
          {mounted ? (
            <>
              <div className="text-sm font-bold text-sky-400 font-mono tracking-wider tabular-nums">
                {time.toISOString().split("T")[1].split(".")[0]}{" "}
                <span className="text-slate-600 text-[10px] ml-1">UTC</span>
              </div>
              <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                {time.toLocaleDateString(undefined, {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </>
          ) : (
            <div className="h-10 w-32 animate-pulse bg-white/5 rounded-lg" />
          )}
        </div>

        <button
          onClick={() => logout()}
          className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 transition-all flex items-center gap-2 group"
          title="Terminate Session"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-[10px] font-bold uppercase tracking-widest hidden sm:inline">
            Abort Session
          </span>
        </button>
      </div>
    </header>
  );
}
