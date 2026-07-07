import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogPostBreadcrumbs } from "@/components/blog/BlogPostBreadcrumbs";

describe("BlogPostBreadcrumbs", () => {
  it("renders blog link and current title with separators", () => {
    render(
      <BlogPostBreadcrumbs
        items={[{ label: "Blog", href: "/blog" }, { label: "My Post Title" }]}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();

    const blogLink = screen.getByRole("link", { name: "Blog" });
    expect(blogLink).toHaveAttribute("href", "/blog");
    expect(blogLink).toHaveClass("text-sky-300");

    expect(screen.getByText("My Post Title")).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByText("/")).toHaveClass("text-slate-600");
  });

  it("renders ancestor links for multi-level trails", () => {
    render(
      <BlogPostBreadcrumbs
        items={[
          { label: "Blog", href: "/blog" },
          { label: "Parent Article", href: "/blog/parent" },
          { label: "Subarticle" },
        ]}
      />
    );

    expect(screen.getByRole("link", { name: "Blog" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Parent Article" })
    ).toHaveAttribute("href", "/blog/parent");
    expect(
      screen.queryByRole("link", { name: "Subarticle" })
    ).not.toBeInTheDocument();
    expect(screen.getByText("Subarticle")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });
});
