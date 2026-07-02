"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/primitives/Button";
import { Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-200 antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="font-heading text-3xl font-bold text-slate-50">
            Critical system error
          </h1>
          <p className="mt-3 max-w-md text-slate-400">
            The application encountered an unrecoverable error. Please try
            reloading the page.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={reset}>
              Reload
            </Button>
            <Button asChild variant="outline">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Home
              </Link>
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
