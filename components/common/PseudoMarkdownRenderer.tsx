"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  SatelliteIcon,
  PlanetIcon,
  StarIcon,
  SmallStarIcon,
  AsteroidIcon,
  RocketIcon,
  ConstellationLineIcon,
} from "@/components/common/SpaceMarkdownIcons";
import type { PolicyColorTheme } from "@/types/policies";

interface PseudoMarkdownRendererProps {
  content: string;
  className?: string;
  themeColor?: PolicyColorTheme;
}

export function PseudoMarkdownRenderer({
  content,
  className = "prose prose-invert max-w-none prose-lg",
  themeColor,
}: PseudoMarkdownRendererProps) {
  // Default to sky colors if no theme provided
  const theme = themeColor || {
    icon: "text-sky-400",
    link: "text-sky-400",
    linkHover: "hover:text-sky-300",
    codeBorder: "border-sky-500/30",
    blockquoteBorder: "border-sky-500/50",
    constellation: "text-sky-400/50",
    linkColor: "#38bdf8",
    linkHoverColor: "#7dd3fc",
  };
  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headers with space-themed icons
          h1: ({ node: _node, ...props }) => (
            <h1 className="font-sans text-4xl font-bold mt-8 mb-4 text-slate-50 flex items-center gap-3 space-icon-header">
              <SatelliteIcon
                className={`w-8 h-8 ${theme.icon} flex-shrink-0`}
              />
              <span {...props} />
            </h1>
          ),
          h2: ({ node: _node, ...props }) => (
            <h2 className="font-sans text-3xl font-bold mt-6 mb-3 text-slate-50 flex items-center gap-3 space-icon-header">
              <PlanetIcon className={`w-6 h-6 ${theme.icon} flex-shrink-0`} />
              <span {...props} />
            </h2>
          ),
          h3: ({ node: _node, ...props }) => (
            <h3 className="font-sans text-2xl font-bold mt-4 mb-2 text-slate-50 flex items-center gap-2 space-icon-header">
              <StarIcon className={`w-5 h-5 ${theme.icon} flex-shrink-0`} />
              <span {...props} />
            </h3>
          ),
          h4: ({ node: _node, ...props }) => (
            <h4 className="font-sans text-xl font-bold mt-4 mb-2 text-slate-50 flex items-center gap-2 space-icon-header">
              <StarIcon className={`w-4 h-4 ${theme.icon} flex-shrink-0`} />
              <span {...props} />
            </h4>
          ),

          // Paragraphs
          p: ({ node: _node, ...props }) => (
            <p
              className="mb-4 text-slate-300 leading-relaxed font-sans"
              {...props}
            />
          ),

          // Lists with space-themed bullets
          ul: ({ node: _node, ...props }) => (
            <ul
              className="space-bullet-list list-none space-y-2 my-4 text-slate-300"
              {...props}
            />
          ),
          ol: ({ node: _node, ...props }) => (
            <ol
              className="list-none space-y-2 my-4 text-slate-300"
              {...props}
            />
          ),
          li: ({ node, ...props }: any) => {
            // Check if parent is ordered list by examining the node structure
            const isOrdered = node?.parent?.tagName === "ol";
            return (
              <li className="flex items-start gap-2 ml-0 text-slate-300 font-sans">
                <span className="flex-shrink-0 mt-1.5">
                  {isOrdered ? (
                    <AsteroidIcon className={`w-2.5 h-2.5 ${theme.icon}`} />
                  ) : (
                    <SmallStarIcon className={`w-2 h-2 ${theme.icon}`} />
                  )}
                </span>
                <span {...props} />
              </li>
            );
          },

          // Blockquotes with space-themed border
          blockquote: ({ node: _node, ...props }) => (
            <blockquote
              className={`border-l-4 ${theme.blockquoteBorder} pl-4 my-4 italic text-slate-400 bg-slate-800/30 py-2 rounded-r font-sans`}
              {...props}
            />
          ),

          // Code blocks with terminal window aesthetic
          code: ({ node: _node, inline, ...props }: any) =>
            inline ? (
              <code
                className={`bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono border ${theme.codeBorder}`}
                style={{ color: "inherit" }}
                {...props}
              />
            ) : (
              <div className="relative my-4">
                <div className="absolute -top-1 left-0 right-0 h-8 bg-slate-900/50 border border-slate-700 rounded-t-lg flex items-center gap-2 px-3">
                  <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
                  <div className="w-2 h-2 rounded-full bg-green-500/50"></div>
                </div>
                <code
                  className="block bg-slate-900/80 p-4 rounded-lg text-sm text-slate-200 font-mono overflow-x-auto border border-slate-700 pt-12"
                  {...props}
                />
              </div>
            ),
          pre: ({ node: _node, ...props }) => (
            <pre className="my-4" {...props} />
          ),

          // Links with rocket icon
          a: ({ node: _node, ...props }: any) => (
            <a
              className={`${theme.link} ${theme.linkHover} underline inline-flex items-center gap-1 transition-all hover:gap-2 group`}
              style={{
                color: theme.linkColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = theme.linkHoverColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = theme.linkColor;
              }}
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              <span>{props.children}</span>
              <RocketIcon
                className={`w-3 h-3 ${theme.icon} opacity-0 group-hover:opacity-100 transition-opacity`}
              />
            </a>
          ),

          // Images
          img: ({ node: _node, ...props }: any) => (
            <img
              className="rounded-lg my-4 max-w-full h-auto border border-slate-700"
              alt={props.alt || ""}
              {...props}
            />
          ),

          // Horizontal rules with constellation line
          hr: ({ node: _node, ..._props }) => (
            <div className="my-8 flex items-center justify-center">
              <ConstellationLineIcon
                className={`w-full max-w-md h-1 ${theme.constellation}`}
              />
            </div>
          ),

          // Tables
          table: ({ node: _node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table
                className="min-w-full border-collapse border border-slate-600"
                {...props}
              />
            </div>
          ),
          th: ({ node: _node, ...props }) => (
            <th
              className="border border-slate-600 px-4 py-2 bg-slate-700 font-bold text-left text-slate-50 font-sans"
              {...props}
            />
          ),
          td: ({ node: _node, ...props }) => (
            <td
              className="border border-slate-600 px-4 py-2 text-slate-300 font-sans"
              {...props}
            />
          ),

          // Strong (bold) with subtle glow
          strong: ({ node: _node, ...props }) => (
            <strong className="font-bold text-slate-100 font-sans" {...props} />
          ),

          // Emphasis (italic)
          em: ({ node: _node, ...props }) => (
            <em className="italic text-slate-300 font-sans" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
