import {
  isLikelyHTML,
  isLikelyMarkdown,
} from "@/lib/policy-utils/plaintext-formatter";

export type ContentFormat = "markdown" | "html" | "plaintext" | "auto";
export type ResolvedContentFormat = "markdown" | "html" | "plaintext";
export type TocHeadingLevel = 2 | 3 | 4;

export interface TocHeading {
  id: string;
  text: string;
  level: TocHeadingLevel;
}

export interface TocTreeItem extends TocHeading {
  children: TocTreeItem[];
}

export type TocIneligibleReason =
  | "plaintext"
  | "no-headings"
  | "too-few-headings";

export interface TocEvaluation {
  show: boolean;
  reason: TocIneligibleReason | "eligible";
  headings: TocHeading[];
  tree: TocTreeItem[];
  collapseH3ByDefault: boolean;
  hiddenH3Count: number;
}

const MIN_HEADINGS_TO_SHOW = 3;
const COLLAPSE_H3_THRESHOLD = 10;

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
  format: ContentFormat = "auto"
): TocHeading[] {
  const resolvedFormat = resolveContentFormat(content, format);

  if (resolvedFormat === "plaintext") {
    return [];
  }

  if (resolvedFormat === "markdown") {
    return extractMarkdownHeadings(content);
  }

  return extractHtmlHeadings(content);
}

function extractMarkdownHeadings(content: string): TocHeading[] {
  const usedIds = new Set<string>();
  const headings: TocHeading[] = [];

  for (const line of content.split("\n")) {
    const match = /^(#{2,4})\s+(.+)$/.exec(line.trim());
    if (!match) {
      continue;
    }

    const level = match[1].length as TocHeadingLevel;
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

function extractHtmlHeadings(content: string): TocHeading[] {
  const usedIds = new Set<string>();
  const headings: TocHeading[] = [];
  const pattern = /<h([2-4])(?:\s[^>]*)?>([\s\S]*?)<\/h\1>/gi;
  let match: RegExpExecArray | null = pattern.exec(content);

  while (match !== null) {
    const level = Number(match[1]) as TocHeadingLevel;
    const text = stripHtml(match[2]).trim();
    if (text) {
      headings.push({
        id: assignHeadingId(text, usedIds),
        text,
        level,
      });
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

export function buildTocTree(headings: TocHeading[]): TocTreeItem[] {
  const tree: TocTreeItem[] = [];
  const h2Stack: TocTreeItem[] = [];
  const h3Stack: TocTreeItem[] = [];

  for (const heading of headings) {
    const item: TocTreeItem = { ...heading, children: [] };

    if (heading.level === 2) {
      tree.push(item);
      h2Stack.length = 0;
      h3Stack.length = 0;
      h2Stack.push(item);
      continue;
    }

    if (heading.level === 3) {
      const parent = h2Stack[h2Stack.length - 1];
      if (parent) {
        parent.children.push(item);
      } else {
        tree.push(item);
      }
      h3Stack.length = 0;
      h3Stack.push(item);
      continue;
    }

    const parent = h3Stack[h3Stack.length - 1] ?? h2Stack[h2Stack.length - 1];
    if (parent) {
      parent.children.push(item);
    } else {
      tree.push(item);
    }
  }

  return tree;
}

export function countSubsectionItems(tree: TocTreeItem[]): number {
  let count = 0;

  const walk = (items: TocTreeItem[]) => {
    for (const item of items) {
      if (item.level >= 3) {
        count += 1;
      }
      walk(item.children);
    }
  };

  walk(tree);
  return count;
}

export function countTocNavItems(tree: TocTreeItem[]): number {
  return tree.reduce((total, item) => {
    return total + 1 + countTocNavItems(item.children);
  }, 0);
}

export function evaluateToc(
  content: string,
  format: ContentFormat = "auto"
): TocEvaluation {
  const resolvedFormat = resolveContentFormat(content, format);
  const headings = extractHeadings(content, format);

  if (resolvedFormat === "plaintext") {
    return emptyEvaluation("plaintext", headings);
  }

  if (headings.length === 0) {
    return emptyEvaluation("no-headings", headings);
  }

  if (headings.length <= 2) {
    return emptyEvaluation("too-few-headings", headings);
  }

  const tree = buildTocTree(headings);
  const totalItems = countTocNavItems(tree);
  const hiddenH3Count = countSubsectionItems(tree);

  return {
    show: true,
    reason: "eligible",
    headings,
    tree,
    collapseH3ByDefault: totalItems > COLLAPSE_H3_THRESHOLD,
    hiddenH3Count,
  };
}

function emptyEvaluation(
  reason: TocIneligibleReason,
  headings: TocHeading[]
): TocEvaluation {
  return {
    show: false,
    reason,
    headings,
    tree: [],
    collapseH3ByDefault: false,
    hiddenH3Count: 0,
  };
}
