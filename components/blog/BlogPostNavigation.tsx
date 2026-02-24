import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Post } from "@/types";

interface BlogPostNavigationProps {
  prev: Post | null;
  next: Post | null;
}

export function BlogPostNavigation({ prev, next }: BlogPostNavigationProps) {
  if (!prev && !next) {return null;}

  return (
    <nav className="mt-16 flex flex-col justify-between gap-6 border-t border-slate-700 pt-8 sm:flex-row sm:items-center sm:gap-4 lg:mx-auto">
      {/* Previous Post */}
      <div className="flex-1">
        {prev && (
          <Link
            href={`/blog/${prev.slug}`}
            className="group flex flex-col items-start gap-1 text-slate-400 transition-colors hover:text-sky-300"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              <span>Previous Post</span>
            </div>
            <span className="font-heading text-lg font-semibold text-slate-50 line-clamp-1 group-hover:text-sky-300">
              {prev.title}
            </span>
          </Link>
        )}
      </div>

      {/* Next Post */}
      <div className="flex-1 sm:text-right">
        {next && (
          <Link
            href={`/blog/${next.slug}`}
            className="group flex flex-col items-start sm:items-end gap-1 text-slate-400 transition-colors hover:text-sky-300"
          >
            <div className="flex items-center gap-2 text-sm font-medium">
              <span>Next Post</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
            <span className="font-heading text-lg font-semibold text-slate-50 line-clamp-1 group-hover:text-sky-300">
              {next.title}
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
}
