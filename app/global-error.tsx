"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import "./globals.css";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  useEffect(() => {
    console.error("Global application error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-200 antialiased">
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden text-center">
          <div className="absolute inset-0" aria-hidden="true">
            <div className="stars stars-1" />
            <div className="stars stars-2" />
            <div className="stars stars-3" />
          </div>

          <div className="relative z-10 flex flex-col items-center px-4">
            <h1 className="font-heading text-2xl font-semibold text-slate-50 md:text-3xl">
              Oops! Something went wrong
            </h1>
            <p className="mt-2 max-w-md text-slate-300">
              A critical system fault interrupted the application. Try reloading
              — if the problem persists, return later.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 inline-flex h-11 items-center justify-center rounded-md bg-sky-600 px-8 text-sm font-medium text-white transition-colors hover:bg-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Reload Application
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
