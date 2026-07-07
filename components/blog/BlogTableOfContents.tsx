"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TocTreeItem } from "@/lib/blog/toc";
import { blogSpacing } from "@/lib/blog/spacing";
import { cn } from "@/lib/utils";

interface BlogTableOfContentsProps {
  tree: TocTreeItem[];
  collapseH3ByDefault: boolean;
  hiddenH3Count: number;
}

const SCROLL_THRESHOLD = 8;

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
  ordered?: boolean;
  depth?: number;
}

function TocList({
  items,
  activeId,
  showH3,
  onNavigate,
  ordered = true,
  depth = 0,
}: TocListProps) {
  const ListTag = ordered ? "ol" : "ul";
  const isTopLevel = depth === 0 && ordered;

  return (
    <ListTag
      className={cn(
        "space-y-0.5",
        isTopLevel &&
          "list-decimal list-outside pl-5 marker:text-slate-600 marker:font-normal",
        !isTopLevel && "list-none",
        depth > 0 && "mt-0.5 border-l border-slate-700/50 pl-4"
      )}
    >
      {items.map((item) => {
        const isH3 = item.level === 3;
        const isH4 = item.level === 4;

        if ((isH3 || isH4) && !showH3 && ordered) {
          return null;
        }

        const childItems = showH3
          ? item.children
          : item.children.filter(
              (child) => child.level !== 3 && child.level !== 4
            );
        const isActive = activeId === item.id;
        const isNested = depth > 0 || item.level > 2;

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.id);
              }}
              className={cn(
                "inline py-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900",
                isNested ? "text-sm" : "text-[0.9375rem]",
                isActive
                  ? "font-medium text-sky-300"
                  : "text-slate-400 hover:text-slate-200"
              )}
              aria-current={isActive ? "location" : undefined}
            >
              {item.text}
            </a>
            {childItems.length > 0 && (
              <TocList
                items={childItems}
                activeId={activeId}
                showH3={showH3}
                onNavigate={onNavigate}
                ordered={false}
                depth={depth + 1}
              />
            )}
          </li>
        );
      })}
    </ListTag>
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

  const isScrollable = headingIds.length > SCROLL_THRESHOLD;

  return (
    <div className={blogSpacing.groupSubsection}>
      <nav
        aria-label="Table of contents"
        className="border-l-2 border-slate-700/80 pl-4"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <p
            id="blog-toc-heading"
            className="font-heading text-base font-semibold text-slate-200"
          >
            Contents
          </p>
          {collapseH3ByDefault && hiddenH3Count > 0 && (
            <button
              type="button"
              onClick={() => setShowH3((current) => !current)}
              className="inline-flex items-center gap-1 text-xs text-slate-500 transition-colors hover:text-slate-300"
              aria-expanded={showH3}
              aria-controls="blog-toc-list"
            >
              {showH3
                ? "Hide subsections"
                : `Show ${hiddenH3Count} subsection${hiddenH3Count === 1 ? "" : "s"}`}
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  showH3 && "rotate-180"
                )}
                aria-hidden="true"
              />
            </button>
          )}
        </div>

        <div
          id="blog-toc-list"
          aria-labelledby="blog-toc-heading"
          className={cn(
            blogSpacing.groupInner,
            isScrollable && "max-h-[min(70vh,20rem)] overflow-y-auto pr-1"
          )}
        >
          <TocList
            items={tree}
            activeId={activeId}
            showH3={showH3}
            onNavigate={onNavigate}
          />
        </div>
      </nav>

      <div className={blogSpacing.tocExitZone} aria-hidden="true">
        <div className={blogSpacing.tocExitRule} />
      </div>
    </div>
  );
}
