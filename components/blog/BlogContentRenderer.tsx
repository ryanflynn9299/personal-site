"use client";

import Image from "next/image";
import React, { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { formatPlaintext } from "@/lib/policy-utils/plaintext-formatter";
import {
  extractHeadings,
  resolveContentFormat,
  type ContentFormat,
  type TocHeading,
} from "@/lib/blog/toc";

export type { ContentFormat };

interface BlogContentRendererProps {
  content: string;
  format?: ContentFormat;
  className?: string;
}

function createHeadingComponents(headings: TocHeading[]) {
  let queueIndex = 0;

  const consumeId = (level: 2 | 3 | 4): string | undefined => {
    if (queueIndex < headings.length && headings[queueIndex].level === level) {
      const id = headings[queueIndex].id;
      queueIndex += 1;
      return id;
    }
    return undefined;
  };

  return {
    h1: ({ children }: { children?: React.ReactNode }) => (
      <h1 className="font-heading text-4xl font-bold text-slate-50 mb-4">
        {children}
      </h1>
    ),
    h2: ({ children }: { children?: React.ReactNode }) => (
      <h2
        id={consumeId(2)}
        className="font-heading text-3xl font-semibold text-slate-100 mb-3 mt-8 scroll-mt-28"
      >
        {children}
      </h2>
    ),
    h3: ({ children }: { children?: React.ReactNode }) => (
      <h3
        id={consumeId(3)}
        className="font-heading text-2xl font-semibold text-slate-200 mb-2 mt-6 scroll-mt-28"
      >
        {children}
      </h3>
    ),
    h4: ({ children }: { children?: React.ReactNode }) => (
      <h4
        id={consumeId(4)}
        className="font-heading text-xl font-semibold text-slate-200 mb-2 mt-4 scroll-mt-28"
      >
        {children}
      </h4>
    ),
    a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
      <a
        href={href}
        className="text-sky-400 hover:text-sky-300 underline transition-colors"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    ),
    code: ({
      className,
      children,
      ...props
    }: {
      className?: string;
      children?: React.ReactNode;
    }) => {
      const isInline = !className;
      return isInline ? (
        <code
          className="rounded bg-slate-800 px-1.5 py-0.5 text-sm text-sky-300"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }: { children?: React.ReactNode }) => (
      <pre className="rounded-lg bg-slate-900 border border-slate-700 p-4 overflow-x-auto">
        {children}
      </pre>
    ),
    blockquote: ({ children }: { children?: React.ReactNode }) => (
      <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-300 my-4">
        {children}
      </blockquote>
    ),
    ul: ({ children }: { children?: React.ReactNode }) => (
      <ul className="list-disc list-inside space-y-2 text-slate-300 my-4">
        {children}
      </ul>
    ),
    ol: ({ children }: { children?: React.ReactNode }) => (
      <ol className="list-decimal list-inside space-y-2 text-slate-300 my-4">
        {children}
      </ol>
    ),
    p: ({ children }: { children?: React.ReactNode }) => (
      <p className="text-slate-300 leading-7 my-4">{children}</p>
    ),
    img: ({ src, alt }: { src?: string | Blob; alt?: string }) => {
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
          className="rounded-lg my-4 max-w-full h-auto"
          unoptimized={imageSrc.startsWith("http")}
        />
      );
    },
  };
}

export function BlogContentRenderer({
  content,
  format = "auto",
  className = "",
}: BlogContentRendererProps) {
  const actualFormat = resolveContentFormat(content, format);
  const headings = useMemo(
    () => extractHeadings(content, format),
    [content, format]
  );
  const markdownComponents = useMemo(
    () => createHeadingComponents(headings),
    [headings]
  );

  if (actualFormat === "markdown") {
    return (
      <div className={`prose prose-invert max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  if (actualFormat === "html") {
    return (
      <div className={`prose prose-invert max-w-none ${className}`}>
        <ReactMarkdown
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  return (
    <div
      className={`text-slate-300 leading-7 whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: formatPlaintext(content) }}
    />
  );
}
