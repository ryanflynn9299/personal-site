"use client";

import { useFormStatus } from "react-dom";
import { login } from "@/app/actions/auth";
import { useState } from "react";
import { ShieldAlert, Lock, Zap, ArrowRight } from "lucide-react";

/**
 * Clean & Professional Admin Access Page
 */
export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
    }
  }

  return (
    <main className="flex grow items-center justify-center p-6 relative">
      <div className="w-full max-w-md">
        {/* Logo / Branding Area */}
        <div className="flex items-center justify-center gap-5 mb-10 pl-1">
          <div className="flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl bg-sky-500/10 border border-white/10 shadow-sm transition-transform hover:scale-105 duration-300">
            <Lock className="h-5 w-5 text-sky-400" />
          </div>
          <div className="flex flex-col">
            <h1 className="font-heading text-2xl font-bold tracking-tight text-white uppercase tracking-wider leading-tight">
              Mission Control
            </h1>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] leading-tight mt-1">
              Administrative Access Required
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1"
              >
                Access Passcode
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Zap className="h-4 w-4 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoFocus
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-slate-700 bg-slate-900/50 px-12 py-3.5 text-sm text-white placeholder:text-slate-600 focus:border-sky-500/50 focus:outline-none focus:ring-1 focus:ring-sky-500/50 transition-all"
                />
              </div>
            </div>

            <LoginButton />

            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 transition-all animate-in fade-in slide-in-from-top-2">
                <ShieldAlert className="h-5 w-5 text-red-500 flex-shrink-0" />
                <p className="text-xs font-medium text-red-400 leading-tight">
                  {error}
                </p>
              </div>
            )}
          </form>
        </div>

        {/* Footer info */}
        <p className="mt-8 text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest">
          Authorized Personnel Only // Biometric Monitoring Active
        </p>
      </div>
    </main>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full group relative flex items-center justify-center gap-2 rounded-xl bg-sky-600 py-3.5 font-bold text-sm text-white hover:bg-sky-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-sky-900/20"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <div className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Verifying...
        </span>
      ) : (
        <>
          Engage Systems
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}
