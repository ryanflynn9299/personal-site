"use client";

import { Code, AlertCircle } from "lucide-react";

/**
 * Dev Mode Indicator Component
 * 
 * Shows a banner indicating that the application is running in development mode
 * and that certain services (like Directus) are unavailable.
 * Only displays in development environment.
 */
export function DevModeIndicator() {
  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2">
      <div className="container mx-auto flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:gap-2 sm:text-sm">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span className="font-bold text-amber-300">Dev Mode Active</span>
        </div>
        <span className="hidden text-slate-400 sm:inline">•</span>
        <span className="text-xs text-slate-400 sm:text-sm">
          Content service unavailable (Directus not configured)
        </span>
      </div>
    </div>
  );
}

/**
 * Service Unavailable with Dev Mode Context
 * 
 * Enhanced version of ServiceUnavailable that includes dev mode information
 * when running in development.
 */
export function ServiceUnavailableWithDevMode() {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-12 text-center">
      <AlertCircle className="h-12 w-12 text-amber-400" />
      <h3 className="mt-4 font-semibold text-slate-50">
        Content Service Unavailable
      </h3>
      <p className="mt-2 text-slate-400">
        {isDev
          ? "Directus CMS is not configured. Set DIRECTUS_URL_SERVER_SIDE and NEXT_PUBLIC_DIRECTUS_URL in your .env file to enable blog functionality."
          : "There was a problem connecting to the content service. Please try again later."}
      </p>
      {isDev && (
        <div className="mt-4 rounded-md bg-slate-800/50 p-3 text-left text-xs text-slate-300">
          <p className="font-semibold mb-1">Quick Setup:</p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Copy <code className="bg-slate-700 px-1 rounded">.env.example</code> to <code className="bg-slate-700 px-1 rounded">.env</code></li>
            <li>Update Directus URLs in <code className="bg-slate-700 px-1 rounded">.env</code></li>
            <li>Start Directus service: <code className="bg-slate-700 px-1 rounded">docker compose up ps-directus</code></li>
          </ol>
        </div>
      )}
    </div>
  );
}

