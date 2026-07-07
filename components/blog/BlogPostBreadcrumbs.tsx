import Link from "next/link";
import type { BlogBreadcrumbItem } from "@/lib/blog/breadcrumbs";

interface BlogPostBreadcrumbsProps {
  items: BlogBreadcrumbItem[];
}

export function BlogPostBreadcrumbs({ items }: BlogPostBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-y-1 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isLink = Boolean(item.href) && !isLast;

          return (
            <li
              key={`${item.label}-${index}`}
              className="inline-flex items-center"
            >
              {index > 0 && (
                <span aria-hidden="true" className="mx-2 text-slate-600">
                  /
                </span>
              )}
              {isLink ? (
                <Link
                  href={item.href!}
                  className="text-sky-300 transition-colors hover:text-sky-200"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className="max-w-[14rem] truncate text-slate-400 sm:max-w-xs md:max-w-md"
                  aria-current={isLast ? "page" : undefined}
                  title={item.label}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
