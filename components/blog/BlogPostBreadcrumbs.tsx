import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BlogBreadcrumbItem } from "@/lib/blog/breadcrumbs";
import { blogSpacing } from "@/lib/blog/spacing";
import {
  getBreadcrumbBackTarget,
  getBreadcrumbTrailItems,
} from "@/lib/blog/breadcrumbs";

interface BlogPostBreadcrumbsProps {
  items: BlogBreadcrumbItem[];
}

function BreadcrumbDivider() {
  return (
    <span
      aria-hidden="true"
      className="px-2 select-none font-mono text-slate-600"
    >
      /
    </span>
  );
}

export function BlogPostBreadcrumbs({ items }: BlogPostBreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  const backTarget = getBreadcrumbBackTarget(items);
  const trailItems = getBreadcrumbTrailItems(items);

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        blogSpacing.breadcrumbToTitle,
        "flex flex-wrap items-center gap-y-1"
      )}
    >
      {backTarget && (
        <Link
          href={backTarget.href}
          className="group inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-sky-300 transition-colors hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label={`Back to ${backTarget.title ?? backTarget.label}`}
        >
          <ArrowLeft
            aria-hidden="true"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
          />
          <span>{backTarget.label}</span>
        </Link>
      )}

      {trailItems.length > 0 && (
        <ol className="flex min-w-0 flex-wrap items-center text-sm">
          {trailItems.map((item, index) => {
            const isLast = index === trailItems.length - 1;
            const isLink = Boolean(item.href) && !isLast;
            const accessibleName = item.title ?? item.label;
            const showLeadingDivider = index === 0 && Boolean(backTarget);

            return (
              <li
                key={`${item.label}-${index}`}
                className="inline-flex min-w-0 items-center"
              >
                {(showLeadingDivider || index > 0) && <BreadcrumbDivider />}
                {isLink ? (
                  <Link
                    href={item.href!}
                    className="truncate text-slate-500 transition-colors hover:text-sky-300"
                    title={accessibleName}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="truncate font-medium text-slate-200"
                    aria-current={isLast ? "page" : undefined}
                    title={accessibleName}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}
