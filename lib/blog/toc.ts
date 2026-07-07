import type { DocumentHeading, HeadingLevel } from "@/lib/markdown/headings";
import {
  extractHeadings as extractDocumentHeadings,
  resolveContentFormat,
  type ContentFormat,
} from "@/lib/markdown/headings";

export type { ContentFormat };
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

const COLLAPSE_H3_THRESHOLD = 10;

export {
  resolveContentFormat,
  slugifyHeading,
  assignHeadingId,
} from "@/lib/markdown/headings";

export function extractHeadings(
  content: string,
  format: ContentFormat = "auto"
): TocHeading[] {
  return extractDocumentHeadings(content, format, {
    minLevel: 2,
    maxLevel: 4,
  }) as TocHeading[];
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

// Preserve export surface for callers that need document-level headings.
export type { DocumentHeading, HeadingLevel };
