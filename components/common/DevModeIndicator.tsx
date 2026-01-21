"use client";

import { useState, useEffect } from "react";
import { Code, AlertCircle } from "lucide-react";
import { env, isDirectusEnabled } from "@/lib/env";

/**
 * Dev Mode Indicator Component
 *
 * Shows a banner indicating the current application mode and service status.
 * Only displays in development modes (live-dev or offline-dev).
 */
export function DevModeIndicator() {
  // Use state to prevent hydration mismatch
  const [modeLabel, setModeLabel] = useState<string>("Offline Dev");
  const [serviceStatus, setServiceStatus] =
    useState<string>("Services offline");
  const [isDevelopment, setIsDevelopment] = useState<boolean>(false);

  // Set values after mount to ensure server and client match
  useEffect(() => {
    setIsDevelopment(env.isDevelopment);
    setModeLabel(env.isLiveDev ? "Live Dev" : "Offline Dev");
    setServiceStatus(
      isDirectusEnabled() ? "Services connected" : "Services offline"
    );
  }, []);

  // Only show in development modes
  if (!isDevelopment) {
    return null;
  }

  return (
    <div className="border-b border-amber-500/20 px-4 py-2 relative z-10">
      {/* Solid backdrop to block grid background */}
      <div className="absolute inset-0 bg-slate-800 -z-10"></div>
      {/* Amber overlay to maintain original look */}
      <div className="absolute inset-0 bg-amber-500/5 -z-[5]"></div>
      <div className="container mx-auto flex flex-col items-center justify-center gap-1 text-center sm:flex-row sm:gap-2 sm:text-sm relative">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-amber-400 flex-shrink-0" />
          <span className="font-bold text-amber-300">
            {modeLabel} Mode Active
          </span>
        </div>
        <span className="hidden text-slate-400 sm:inline">•</span>
        <span className="text-xs text-slate-400 sm:text-sm">
          {serviceStatus}
        </span>
      </div>
    </div>
  );
}

/**
 * Service Unavailable with Mode Context
 *
 * Shows appropriate error message based on application mode:
 * - Production/Live-dev: Real error (service expected to be configured)
 * - Offline-dev: Informational (services intentionally disabled)
 */
export function ServiceUnavailableWithDevMode() {
  const isProduction = env.isProduction;
  const isLiveDev = env.isLiveDev;
  const isOfflineDev = env.isOfflineDev;

  // Production and live-dev: This is a real error
  if (isProduction || isLiveDev) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-red-500/50 bg-red-500/10 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-400" />
        <h3 className="mt-4 font-semibold text-slate-50">
          Content Service Error
        </h3>
        <p className="mt-2 text-slate-400">
          The content service is not available. This is a configuration error.
          Please check your Directus configuration and ensure services are
          running.
        </p>
        <div className="mt-4 rounded-md bg-slate-800/50 p-3 text-left text-xs text-slate-300 max-w-md">
          <p className="font-semibold mb-1">Required Configuration:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              Set{" "}
              <code className="bg-slate-700 px-1 rounded">
                DIRECTUS_URL_SERVER_SIDE
              </code>{" "}
              in .env
            </li>
            <li>
              Set{" "}
              <code className="bg-slate-700 px-1 rounded">
                NEXT_PUBLIC_DIRECTUS_URL
              </code>{" "}
              in .env
            </li>
            <li>Ensure Directus service is running and accessible</li>
          </ul>
        </div>
      </div>
    );
  }

  // Offline-dev: Informational message
  if (isOfflineDev) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-12 text-center">
        <AlertCircle className="h-12 w-12 text-amber-400" />
        <h3 className="mt-4 font-semibold text-slate-50">
          Services Disabled (Offline Dev Mode)
        </h3>
        <p className="mt-2 text-slate-400">
          Services are intentionally disabled in offline dev mode. Set{" "}
          <code className="bg-slate-700 px-1 rounded">APP_MODE=live-dev</code>{" "}
          to enable service connections.
        </p>
      </div>
    );
  }

  // Fallback (should not happen)
  return (
    <div className="mt-16 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-amber-500/50 bg-amber-500/10 p-12 text-center">
      <AlertCircle className="h-12 w-12 text-amber-400" />
      <h3 className="mt-4 font-semibold text-slate-50">
        Content Service Unavailable
      </h3>
      <p className="mt-2 text-slate-400">
        There was a problem connecting to the content service.
      </p>
    </div>
  );
}
