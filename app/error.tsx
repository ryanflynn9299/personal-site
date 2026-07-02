"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/primitives/Button";
import { Home, BookOpen, RefreshCw } from "lucide-react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error(error);
    }
  }, [error]);

  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-slate-900 text-center">
      <div className="absolute inset-0">
        <div className="stars stars-1" />
        <div className="stars stars-2" />
        <div className="stars stars-3" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-4">
        <h1 className="font-mono text-6xl font-bold text-amber-400 md:text-7xl">
          500
        </h1>
        <p className="mt-4 font-heading text-2xl font-semibold text-slate-50 md:text-3xl">
          Something went off course.
        </p>
        <p className="mt-2 max-w-md text-slate-300">
          An unexpected error occurred while loading this page. You can try
          again or return to a known sector.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button type="button" size="lg" onClick={reset}>
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/">
              <Home className="mr-2 h-5 w-5" />
              Return to Home Base
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/blog">
              <BookOpen className="mr-2 h-5 w-5" />
              Explore the Blog
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
