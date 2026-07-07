"use client";

import { useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { formatPlaintext } from "@/lib/policy-utils/plaintext-formatter";
import {
  extractHeadings,
  resolveContentFormat,
  type ContentFormat,
} from "@/lib/markdown/headings";
import {
  markdownRehypePlugins,
  markdownRemarkPlugins,
} from "@/lib/markdown/plugins";
import type { PolicyColorTheme } from "@/types/policies";
import { createPolicyMarkdownComponents } from "@/components/policies/policy-markdown-components";

export type { ContentFormat };

interface PolicyContentRendererProps {
  content: string;
  format?: ContentFormat;
  className?: string;
  theme: PolicyColorTheme;
}

export function PolicyContentRenderer({
  content,
  format = "markdown",
  className = "prose prose-invert max-w-none prose-lg",
  theme,
}: PolicyContentRendererProps) {
  const headingIndexRef = useRef(0);
  headingIndexRef.current = 0;

  const actualFormat = resolveContentFormat(content, format);
  const headings = useMemo(
    () => extractHeadings(content, format, { minLevel: 1, maxLevel: 4 }),
    [content, format]
  );
  const markdownComponents = useMemo(
    () =>
      createPolicyMarkdownComponents({
        theme,
        headings,
        headingIndexRef,
      }),
    [theme, headings]
  );

  if (actualFormat === "markdown") {
    return (
      <div className={className}>
        <ReactMarkdown
          remarkPlugins={markdownRemarkPlugins}
          rehypePlugins={markdownRehypePlugins}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  if (actualFormat === "html") {
    return (
      <div className={className}>
        <ReactMarkdown
          rehypePlugins={markdownRehypePlugins}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div
      className={`text-slate-300 leading-relaxed whitespace-pre-wrap font-sans ${className}`}
      dangerouslySetInnerHTML={{ __html: formatPlaintext(content) }}
    />
  );
}
