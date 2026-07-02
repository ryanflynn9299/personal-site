"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocTreeItem } from "@/lib/blog/toc";
import { cn } from "@/lib/utils";

interface BlogTableOfContentsProps {
  tree: TocTreeItem[];
  collapseH3ByDefault: boolean;
  hiddenH3Count: number;
}

function scrollToHeading(id: string) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });

  if (window.history.replaceState) {
    window.history.replaceState(null, "", `#${id}`);
  }
}

interface TocListProps {
  items: TocTreeItem[];
  activeId: string | null;
  showH3: boolean;
  onNavigate: (id: string) => void;
  depth?: number;
}

function TocList({
  items,
  activeId,
  showH3,
  onNavigate,
  depth = 0,
}: TocListProps) {
  return (
    <ol
      className={cn(
        depth > 0 && "mt-1 space-y-1 border-l border-slate-700 pl-3"
      )}
    >
      {items.map((item) => {
        const isH3 = item.level === 3;
        const isH4 = item.level === 4;

        if ((isH3 || isH4) && !showH3 && depth === 0) {
          return null;
        }

        const childItems = showH3
          ? item.children
          : item.children.filter(
              (child) => child.level !== 3 && child.level !== 4
            );

        return (
          <li key={item.id} className={cn(depth === 0 && "space-y-1")}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
              className={cn(
                "block rounded-md px-2 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                depth === 0 ? "text-slate-200" : "text-slate-400",
                activeId === item.id
                  ? "bg-slate-700/80 text-sky-300"
                  : "hover:bg-slate-800 hover:text-sky-300"
              )}
              aria-current={activeId === item.id ? "location" : undefined}
            >
              {item.text}
            </a>
            {childItems.length > 0 && (
              <TocList
                items={childItems}
                activeId={activeId}
                showH3={showH3}
                onNavigate={onNavigate}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function BlogTableOfContents({
  tree,
  collapseH3ByDefault,
  hiddenH3Count,
}: BlogTableOfContentsProps) {
  const headingIds = useMemo(() => {
    const ids: string[] = [];
    const walk = (items: TocTreeItem[]) => {
      for (const item of items) {
        ids.push(item.id);
        walk(item.children);
      }
    };
    walk(tree);
    return ids;
  }, [tree]);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [showH3, setShowH3] = useState(!collapseH3ByDefault);

  const onNavigate = useCallback((id: string) => {
    scrollToHeading(id);
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (headingIds.length === 0) {
      return;
    }

    const elements = headingIds
      .map((id) => document.getElementById(id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible.length > 0 && visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        rootMargin: "-20% 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [headingIds]);

  if (tree.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="On this page"
      className="my-8 rounded-lg border border-slate-700 bg-slate-800/50 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-heading text-sm font-semibold uppercase tracking-wider text-slate-400">
          On this page
        </p>
        {collapseH3ByDefault && hiddenH3Count > 0 && (
          <button
            type="button"
            onClick={() => setShowH3((current) => !current)}
            className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition-colors hover:text-sky-300"
            aria-expanded={showH3}
          >
            {showH3
              ? "Hide subsections"
              : `Show subsections (${hiddenH3Count})`}
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                showH3 && "rotate-180"
              )}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className="mt-3 max-h-[min(70vh,20rem)] overflow-y-auto pr-1">
        <TocList
          items={tree}
          activeId={activeId}
          showH3={showH3}
          onNavigate={onNavigate}
        />
      </div>
    </nav>
  );
}
