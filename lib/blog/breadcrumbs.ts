/** Breadcrumb-only label for `/blog` — nav elsewhere stays "Blog". */
export const BLOG_HOME_CRUMB_LABEL = "Blog Home";

export interface BlogBreadcrumbItem {
  /** Short label shown in the trail. */
  label: string;
  /** Full text for tooltips and screen readers when the label is shortened. */
  title?: string;
  /** Omit on the current page crumb. */
  href?: string;
}

const DEFAULT_MAX_LABEL_LENGTH = 28;

/**
 * Shortens breadcrumb text at a word boundary so trails stay scannable.
 * Full titles belong in the page heading, not the breadcrumb bar.
 */
export function shortenBreadcrumbLabel(
  text: string,
  maxLength = DEFAULT_MAX_LABEL_LENGTH
): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }

  const truncated = trimmed.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");
  const cut =
    lastSpace > Math.floor(maxLength * 0.4)
      ? truncated.slice(0, lastSpace)
      : truncated;

  return `${cut.trimEnd()}…`;
}

/**
 * Parent destination for the back button — the penultimate crumb when it has an href.
 */
export function getBreadcrumbBackTarget(
  items: BlogBreadcrumbItem[]
): { href: string; label: string; title?: string } | null {
  if (items.length < 2) {
    return null;
  }

  const parent = items[items.length - 2];
  if (!parent.href) {
    return null;
  }

  return {
    href: parent.href,
    label: parent.label,
    title: parent.title,
  };
}

/**
 * Trail items shown beside the back button.
 * For a simple Blog Home → post path, only the current page is shown in the trail;
 * the back button carries Blog Home and a leading `/` divider always follows it.
 */
export function getBreadcrumbTrailItems(
  items: BlogBreadcrumbItem[]
): BlogBreadcrumbItem[] {
  if (items.length <= 2) {
    return items.slice(-1);
  }

  return items;
}

/**
 * Builds breadcrumb items for a blog post page.
 * Pass optional `ancestors` for future parent/subarticle chains
 * (each ancestor should include `href`).
 */
export function buildBlogPostBreadcrumbs(
  post: Pick<{ title: string }, "title">,
  ancestors: BlogBreadcrumbItem[] = []
): BlogBreadcrumbItem[] {
  const shortTitle = shortenBreadcrumbLabel(post.title);

  return [
    { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
    ...ancestors.map((ancestor) => ({
      ...ancestor,
      label: shortenBreadcrumbLabel(ancestor.label),
      title: ancestor.title ?? ancestor.label,
    })),
    {
      label: shortTitle,
      title: post.title,
    },
  ];
}
