import { describe, it, expect } from "vitest";
import { buildBlogPostBreadcrumbs } from "@/lib/blog/breadcrumbs";

describe("buildBlogPostBreadcrumbs", () => {
  it("returns Blog link and current post title", () => {
    expect(buildBlogPostBreadcrumbs({ title: "Hello World" })).toEqual([
      { label: "Blog", href: "/blog" },
      { label: "Hello World" },
    ]);
  });

  it("supports ancestor crumbs for future subarticles", () => {
    expect(
      buildBlogPostBreadcrumbs({ title: "Part Two" }, [
        { label: "Series Intro", href: "/blog/series-intro" },
      ])
    ).toEqual([
      { label: "Blog", href: "/blog" },
      { label: "Series Intro", href: "/blog/series-intro" },
      { label: "Part Two" },
    ]);
  });
});
