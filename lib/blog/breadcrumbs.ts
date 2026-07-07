export interface BlogBreadcrumbItem {
  label: string;
  /** Omit on the current page crumb. */
  href?: string;
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
  return [
    { label: "Blog", href: "/blog" },
    ...ancestors,
    { label: post.title },
  ];
}
