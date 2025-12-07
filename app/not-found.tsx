import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-slate-900 text-center">
      {/* Animated Starfield Background */}
      <div className="absolute inset-0">
        <div className="stars stars-1"></div>
        <div className="stars stars-2"></div>
        <div className="stars stars-3"></div>
      </div>

      {/* Page Content */}
      <div className="relative z-10 flex flex-col items-center px-4">
        <h1 className="font-mono text-8xl font-bold text-sky-300 md:text-9xl">
          404
        </h1>
        <p className="mt-4 font-heading text-2xl font-semibold text-slate-50 md:text-3xl">
          Oops! You're lost in space.
        </p>
        <p className="mt-2 max-w-md text-slate-300">
          The page you're looking for might have been moved, deleted, or maybe
          it never existed in this galaxy.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <Button asChild size="lg">
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
