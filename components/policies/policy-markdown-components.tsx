"use client";

import Image from "next/image";
import {
  createContext,
  useContext,
  type MutableRefObject,
  type ReactNode,
} from "react";
import type { Components } from "react-markdown";
import {
  SmallStarIcon,
  AsteroidIcon,
  RocketIcon,
  ConstellationLineIcon,
} from "@/components/primitives/misc/SpaceMarkdownIcons";
import type { PolicyColorTheme } from "@/types/policies";
import { createHeadingIdConsumer } from "@/lib/markdown/heading-ids";
import type { DocumentHeading } from "@/lib/markdown/headings";
import { PolicyHeading } from "@/components/policies/PolicyHeading";
import { cn } from "@/lib/utils";

const PolicyListContext = createContext(false);

interface CreatePolicyMarkdownComponentsOptions {
  theme: PolicyColorTheme;
  headings: DocumentHeading[];
  headingIndexRef: MutableRefObject<number>;
}

function PolicyListItem({
  children,
  theme,
}: {
  children?: ReactNode;
  theme: PolicyColorTheme;
}) {
  const isOrdered = useContext(PolicyListContext);

  return (
    <li className="ml-0 flex items-start gap-2 font-sans text-slate-300">
      <span className="mt-1.5 flex-shrink-0" aria-hidden="true">
        {isOrdered ? (
          <AsteroidIcon className={cn("h-2.5 w-2.5", theme.icon)} />
        ) : (
          <SmallStarIcon className={cn("h-2 w-2", theme.icon)} />
        )}
      </span>
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  );
}

export function createPolicyMarkdownComponents({
  theme,
  headings,
  headingIndexRef,
}: CreatePolicyMarkdownComponentsOptions): Components {
  const consumeHeadingId = createHeadingIdConsumer(headings, headingIndexRef);

  return {
    h1: ({ children }) => (
      <PolicyHeading level="h1" id={consumeHeadingId()} theme={theme}>
        {children}
      </PolicyHeading>
    ),
    h2: ({ children }) => (
      <PolicyHeading level="h2" id={consumeHeadingId()} theme={theme}>
        {children}
      </PolicyHeading>
    ),
    h3: ({ children }) => (
      <PolicyHeading level="h3" id={consumeHeadingId()} theme={theme}>
        {children}
      </PolicyHeading>
    ),
    h4: ({ children }) => (
      <PolicyHeading level="h4" id={consumeHeadingId()} theme={theme}>
        {children}
      </PolicyHeading>
    ),
    p: ({ children }) => (
      <p className="mb-4 text-slate-300 leading-relaxed font-sans">
        {children}
      </p>
    ),
    ul: ({ children }) => (
      <PolicyListContext.Provider value={false}>
        <ul className="space-bullet-list list-none space-y-2 my-4 text-slate-300">
          {children}
        </ul>
      </PolicyListContext.Provider>
    ),
    ol: ({ children }) => (
      <PolicyListContext.Provider value={true}>
        <ol className="list-none space-y-2 my-4 text-slate-300">{children}</ol>
      </PolicyListContext.Provider>
    ),
    li: ({ children }) => (
      <PolicyListItem theme={theme}>{children}</PolicyListItem>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          "border-l-4 pl-4 my-4 italic text-slate-400 bg-slate-800/30 py-2 rounded-r font-sans",
          theme.blockquoteBorder
        )}
      >
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      const isInline = !className;

      if (isInline) {
        return (
          <code
            className={cn(
              "rounded bg-slate-800 px-1.5 py-0.5 text-sm font-mono border",
              theme.codeBorder
            )}
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <div className="relative my-4">
          <div className="absolute -top-1 left-0 right-0 flex h-8 items-center gap-2 rounded-t-lg border border-slate-700 bg-slate-900/50 px-3">
            <div className="h-2 w-2 rounded-full bg-red-500/50" />
            <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
            <div className="h-2 w-2 rounded-full bg-green-500/50" />
          </div>
          <code
            className="block overflow-x-auto rounded-lg border border-slate-700 bg-slate-900/80 p-4 pt-12 text-sm font-mono text-slate-200"
            {...props}
          >
            {children}
          </code>
        </div>
      );
    },
    pre: ({ children }) => <pre className="my-4">{children}</pre>,
    a: ({ href, children }) => (
      <a
        href={href}
        className={cn(
          "inline-flex items-center gap-1 underline transition-all group",
          theme.link,
          theme.linkHover
        )}
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        <span>{children}</span>
        <RocketIcon
          className={cn(
            "h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100",
            theme.icon
          )}
          aria-hidden="true"
        />
      </a>
    ),
    img: ({ src, alt }) => {
      const imageSrc = typeof src === "string" ? src : "";
      if (!imageSrc) {
        return null;
      }

      return (
        <Image
          src={imageSrc}
          alt={alt || ""}
          width={800}
          height={600}
          className="my-4 h-auto max-w-full rounded-lg border border-slate-700"
          unoptimized={imageSrc.startsWith("http")}
        />
      );
    },
    hr: () => (
      <div className="my-8 flex items-center justify-center" role="separator">
        <ConstellationLineIcon
          className={cn("h-1 w-full max-w-md", theme.constellation)}
          aria-hidden="true"
        />
      </div>
    ),
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto">
        <table className="min-w-full border-collapse border border-slate-600">
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th className="border border-slate-600 px-4 py-2 bg-slate-700 text-left font-bold text-slate-50 font-sans">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-slate-600 px-4 py-2 text-slate-300 font-sans">
        {children}
      </td>
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-slate-100 font-sans">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-slate-300 font-sans">{children}</em>
    ),
  };
}
