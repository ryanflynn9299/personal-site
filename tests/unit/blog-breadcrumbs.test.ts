import { describe, it, expect } from "vitest";
import {
  BLOG_HOME_CRUMB_LABEL,
  buildBlogPostBreadcrumbs,
  getBreadcrumbBackTarget,
  getBreadcrumbTrailItems,
  shortenBreadcrumbLabel,
} from "@/lib/blog/breadcrumbs";

describe("shortenBreadcrumbLabel", () => {
  it("returns short text unchanged", () => {
    expect(shortenBreadcrumbLabel("Hello World")).toBe("Hello World");
  });

  it("truncates long text at a word boundary", () => {
    expect(
      shortenBreadcrumbLabel(
        "A Complete Guide to Building Scalable Blog Navigation Patterns"
      )
    ).toBe("A Complete Guide to…");
  });
});

describe("getBreadcrumbBackTarget", () => {
  it("returns the penultimate crumb when it has an href", () => {
    expect(
      getBreadcrumbBackTarget([
        { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
        { label: "Current" },
      ])
    ).toEqual({
      href: "/blog",
      label: BLOG_HOME_CRUMB_LABEL,
    });
  });

  it("returns null for a single crumb", () => {
    expect(
      getBreadcrumbBackTarget([{ label: BLOG_HOME_CRUMB_LABEL, href: "/blog" }])
    ).toBeNull();
  });
});

describe("getBreadcrumbTrailItems", () => {
  it("shows only the current page for a two-level trail", () => {
    expect(
      getBreadcrumbTrailItems([
        { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
        { label: "Current" },
      ])
    ).toEqual([{ label: "Current" }]);
  });

  it("shows the full trail for deeper paths", () => {
    expect(
      getBreadcrumbTrailItems([
        { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
        { label: "Parent", href: "/blog/parent" },
        { label: "Current" },
      ])
    ).toEqual([
      { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
      { label: "Parent", href: "/blog/parent" },
      { label: "Current" },
    ]);
  });
});

describe("buildBlogPostBreadcrumbs", () => {
  it("returns Blog Home link and a shortened current post title", () => {
    expect(buildBlogPostBreadcrumbs({ title: "Hello World" })).toEqual([
      { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
      { label: "Hello World", title: "Hello World" },
    ]);
  });

  it("shortens long post titles and keeps the full title for tooltips", () => {
    const title =
      "A Complete Guide to Building Scalable Blog Navigation Patterns";

    expect(buildBlogPostBreadcrumbs({ title })).toEqual([
      { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
      {
        label: "A Complete Guide to…",
        title,
      },
    ]);
  });

  it("supports ancestor crumbs for future subarticles", () => {
    expect(
      buildBlogPostBreadcrumbs({ title: "Part Two" }, [
        { label: "Series Intro", href: "/blog/series-intro" },
      ])
    ).toEqual([
      { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
      {
        label: "Series Intro",
        href: "/blog/series-intro",
        title: "Series Intro",
      },
      { label: "Part Two", title: "Part Two" },
    ]);
  });
});
