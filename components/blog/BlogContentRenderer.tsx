"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import {
  formatPlaintext,
  isLikelyMarkdown,
  isLikelyHTML,
} from "@/lib/plaintext-formatter";

export type ContentFormat = "markdown" | "html" | "plaintext" | "auto";

interface BlogContentRendererProps {
  /**
   * The content to render
   */
  content: string;

  /**
   * The format of the content. If "auto", will attempt to detect the format.
   * @default "auto"
   */
  format?: ContentFormat;

  /**
   * Custom CSS classes for the content container
   */
  className?: string;
}

/**
 * BlogContentRenderer - Renders blog post content in various formats
 *
 * Supports:
 * - Markdown (with GFM extensions)
 * - HTML (sanitized)
 * - Plaintext (formatted with line breaks and links)
 * - Auto-detection based on content
 */
export function BlogContentRenderer({
  content,
  format = "auto",
  className = "",
}: BlogContentRendererProps) {
  // Determine the actual format to use
  let actualFormat: "markdown" | "html" | "plaintext" = "plaintext";

  if (format === "auto") {
    // Auto-detect format
    if (isLikelyMarkdown(content)) {
      actualFormat = "markdown";
    } else if (isLikelyHTML(content)) {
      actualFormat = "html";
    } else {
      actualFormat = "plaintext";
    }
  } else {
    actualFormat = format;
  }

  // Render based on format
  if (actualFormat === "markdown") {
    return (
      <div className={`prose prose-invert max-w-none ${className}`}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw, rehypeSanitize]}
          components={{
            // Customize heading styles
            h1: ({ children }) => (
              <h1 className="font-heading text-4xl font-bold text-slate-50 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-heading text-3xl font-semibold text-slate-100 mb-3 mt-8">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-heading text-2xl font-semibold text-slate-200 mb-2 mt-6">
                {children}
              </h3>
            ),
            // Customize link styles
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-sky-400 hover:text-sky-300 underline transition-colors"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                  href?.startsWith("http") ? "noopener noreferrer" : undefined
                }
              >
                {children}
              </a>
            ),
            // Customize code block styles
            code: ({ className, children, ...props }) => {
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
            pre: ({ children }) => (
              <pre className="rounded-lg bg-slate-900 border border-slate-700 p-4 overflow-x-auto">
                {children}
              </pre>
            ),
            // Customize blockquote styles
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-300 my-4">
                {children}
              </blockquote>
            ),
            // Customize list styles
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 text-slate-300 my-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 text-slate-300 my-4">
                {children}
              </ol>
            ),
            // Customize paragraph styles
            p: ({ children }) => (
              <p className="text-slate-300 leading-7 my-4">{children}</p>
            ),
            // Customize image styles
            img: ({ src, alt }) => (
              <Image
                src={src || ""}
                alt={alt || ""}
                width={800}
                height={600}
                className="rounded-lg my-4 max-w-full h-auto"
                unoptimized={src?.startsWith("http") || false}
              />
            ),
          }}
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
          components={{
            h1: ({ children }) => (
              <h1 className="font-heading text-4xl font-bold text-slate-50 mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-heading text-3xl font-semibold text-slate-100 mb-3 mt-8">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-heading text-2xl font-semibold text-slate-200 mb-2 mt-6">
                {children}
              </h3>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-sky-400 hover:text-sky-300 underline transition-colors"
                target={href?.startsWith("http") ? "_blank" : undefined}
                rel={
                  href?.startsWith("http") ? "noopener noreferrer" : undefined
                }
              >
                {children}
              </a>
            ),
            code: ({ className, children, ...props }) => {
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
            pre: ({ children }) => (
              <pre className="rounded-lg bg-slate-900 border border-slate-700 p-4 overflow-x-auto">
                {children}
              </pre>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-300 my-4">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2 text-slate-300 my-4">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 text-slate-300 my-4">
                {children}
              </ol>
            ),
            p: ({ children }) => (
              <p className="text-slate-300 leading-7 my-4">{children}</p>
            ),
            img: ({ src, alt }) => (
              <Image
                src={src || ""}
                alt={alt || ""}
                width={800}
                height={600}
                className="rounded-lg my-4 max-w-full h-auto"
                unoptimized={src?.startsWith("http") || false}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    );
  }

  // Plaintext format
  return (
    <div
      className={`text-slate-300 leading-7 whitespace-pre-wrap ${className}`}
      dangerouslySetInnerHTML={{ __html: formatPlaintext(content) }}
    />
  );
}
