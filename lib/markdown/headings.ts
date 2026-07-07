import {
  isLikelyHTML,
  isLikelyMarkdown,
} from "@/lib/policy-utils/plaintext-formatter";

export type ContentFormat = "markdown" | "html" | "plaintext" | "auto";
export type ResolvedContentFormat = "markdown" | "html" | "plaintext";
export type HeadingLevel = 1 | 2 | 3 | 4;

export interface DocumentHeading {
  id: string;
  text: string;
  level: HeadingLevel;
}

export interface ExtractHeadingsOptions {
  minLevel?: HeadingLevel;
  maxLevel?: HeadingLevel;
}

export function resolveContentFormat(
  content: string,
  format: ContentFormat = "auto"
): ResolvedContentFormat {
  if (format !== "auto") {
    return format;
  }
  if (isLikelyMarkdown(content)) {
    return "markdown";
  }
  if (isLikelyHTML(content)) {
    return "html";
  }
  return "plaintext";
}

export function slugifyHeading(text: string): string {
  const normalized = text
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return normalized || "section";
}

export function assignHeadingId(text: string, usedIds: Set<string>): string {
  const base = slugifyHeading(text);
  let id = base;
  let suffix = 1;

  while (usedIds.has(id)) {
    id = `${base}-${suffix}`;
    suffix += 1;
  }

  usedIds.add(id);
  return id;
}

export function extractHeadings(
  content: string,
  format: ContentFormat = "auto",
  options: ExtractHeadingsOptions = {}
): DocumentHeading[] {
  const minLevel = options.minLevel ?? 2;
  const maxLevel = options.maxLevel ?? 4;
  const resolvedFormat = resolveContentFormat(content, format);

  if (resolvedFormat === "plaintext") {
    return [];
  }

  const headings =
    resolvedFormat === "markdown"
      ? extractMarkdownHeadings(content, minLevel, maxLevel)
      : extractHtmlHeadings(content, minLevel, maxLevel);

  return headings;
}

function extractMarkdownHeadings(
  content: string,
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel
): DocumentHeading[] {
  const usedIds = new Set<string>();
  const headings: DocumentHeading[] = [];

  for (const line of content.split("\n")) {
    const match = /^(#{1,4})\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }

    const level = match[1].length as HeadingLevel;
    if (level < minLevel || level > maxLevel) {
      continue;
    }

    const text = stripInlineMarkdown(match[2].trim());
    if (!text) {
      continue;
    }

    headings.push({
      id: assignHeadingId(text, usedIds),
      text,
      level,
    });
  }

  return headings;
}

function extractHtmlHeadings(
  content: string,
  minLevel: HeadingLevel,
  maxLevel: HeadingLevel
): DocumentHeading[] {
  const usedIds = new Set<string>();
  const headings: DocumentHeading[] = [];
  const pattern = /<h([1-4])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null = pattern.exec(content);

  while (match !== null) {
    const level = Number(match[1]) as HeadingLevel;
    if (level >= minLevel && level <= maxLevel) {
      const text = stripHtml(match[2]).trim();
      if (text) {
        headings.push({
          id: assignHeadingId(text, usedIds),
          text,
          level,
        });
      }
    }
    match = pattern.exec(content);
  }

  return headings;
}

function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`~]/g, "")
    .trim();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}
