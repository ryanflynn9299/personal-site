"use client";

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
 * BlogContentRenderer
 *
 * A flexible content renderer that supports:
 * - Markdown (via react-markdown)
 * - HTML (via dangerouslySetInnerHTML with sanitization)
 * - Plaintext (via custom formatter)
 * - Auto-detection of content format
 *
 * This component provides a unified interface for rendering blog content
 * regardless of the source format.
 */
export function BlogContentRenderer({
  content,
  format = "auto",
  className = "prose prose-invert mx-auto mt-12 max-w-none prose-lg",
}: BlogContentRendererProps) {
  // Auto-detect format if needed
  const detectedFormat: ContentFormat =
    format === "auto"
      ? isLikelyHTML(content)
        ? "html"
        : isLikelyMarkdown(content)
          ? "markdown"
          : "plaintext"
      : format;

  // Render based on detected/selected format
  switch (detectedFormat) {
    case "markdown":
      return (
        <div className={className}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
            components={{
              // Customize markdown rendering with Tailwind classes
              h1: ({ node: _node, ...props }) => (
                <h1
                  className="font-heading text-4xl font-bold mt-8 mb-4 text-slate-50"
                  {...props}
                />
              ),
              h2: ({ node: _node, ...props }) => (
                <h2
                  className="font-heading text-3xl font-bold mt-6 mb-3 text-slate-50"
                  {...props}
                />
              ),
              h3: ({ node: _node, ...props }) => (
                <h3
                  className="font-heading text-2xl font-bold mt-4 mb-2 text-slate-50"
                  {...props}
                />
              ),
              h4: ({ node: _node, ...props }) => (
                <h4
                  className="font-heading text-xl font-bold mt-4 mb-2 text-slate-50"
                  {...props}
                />
              ),
              p: ({ node: _node, ...props }) => (
                <p className="mb-4 text-slate-300 leading-relaxed" {...props} />
              ),
              ul: ({ node: _node, ...props }) => (
                <ul
                  className="list-disc list-inside space-y-2 my-4 text-slate-300"
                  {...props}
                />
              ),
              ol: ({ node: _node, ...props }) => (
                <ol
                  className="list-decimal list-inside space-y-2 my-4 text-slate-300"
                  {...props}
                />
              ),
              li: ({ node: _node, ...props }) => (
                <li className="ml-4 text-slate-300" {...props} />
              ),
              blockquote: ({ node: _node, ...props }) => (
                <blockquote
                  className="border-l-4 border-slate-500 pl-4 my-4 italic text-slate-400"
                  {...props}
                />
              ),
              code: ({ node: _node, inline, ...props }: any) =>
                inline ? (
                  <code
                    className="bg-slate-800 px-1.5 py-0.5 rounded text-sm text-slate-200 font-mono"
                    {...props}
                  />
                ) : (
                  <code
                    className="block bg-slate-800 p-4 rounded-lg text-sm text-slate-200 font-mono overflow-x-auto my-4"
                    {...props}
                  />
                ),
              pre: ({ node: _node, ...props }) => (
                <pre
                  className="bg-slate-800 p-4 rounded-lg overflow-x-auto my-4"
                  {...props}
                />
              ),
              a: ({ node: _node, ...props }: any) => (
                <a
                  className="text-blue-400 hover:text-blue-300 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              img: ({ node: _node, ...props }: any) => (
                <img
                  className="rounded-lg my-4 max-w-full h-auto"
                  alt={props.alt || ""}
                  {...props}
                />
              ),
              hr: ({ node: _node, ...props }) => (
                <hr className="my-8 border-slate-600" {...props} />
              ),
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
                  className="border border-slate-600 px-4 py-2 bg-slate-700 font-bold text-left text-slate-50"
                  {...props}
                />
              ),
              td: ({ node: _node, ...props }) => (
                <td
                  className="border border-slate-600 px-4 py-2 text-slate-300"
                  {...props}
                />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      );

    case "html":
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      );

    case "plaintext":
      const formattedPlaintext = formatPlaintext(content, {
        preserveLineBreaks: true,
        linkifyUrls: true,
      });
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: formattedPlaintext }}
        />
      );

    default:
      // Fallback to plaintext
      const fallbackFormatted = formatPlaintext(content, {
        preserveLineBreaks: true,
        linkifyUrls: true,
      });
      return (
        <div
          className={className}
          dangerouslySetInnerHTML={{ __html: fallbackFormatted }}
        />
      );
  }
}
