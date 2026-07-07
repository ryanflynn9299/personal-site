import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogPostBreadcrumbs } from "@/components/blog/BlogPostBreadcrumbs";
import { BLOG_HOME_CRUMB_LABEL } from "@/lib/blog/breadcrumbs";

describe("BlogPostBreadcrumbs", () => {
  it("renders a back link, a path divider, and a compact current-page crumb", () => {
    render(
      <BlogPostBreadcrumbs
        items={[
          { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
          { label: "My Post" },
        ]}
      />
    );

    const nav = screen.getByRole("navigation", { name: "Breadcrumb" });
    expect(nav).toBeInTheDocument();

    const backLink = screen.getByRole("link", {
      name: `Back to ${BLOG_HOME_CRUMB_LABEL}`,
    });
    expect(backLink).toHaveAttribute("href", "/blog");
    expect(backLink).toHaveClass("text-sky-300");

    expect(
      screen.queryByRole("link", { name: BLOG_HOME_CRUMB_LABEL })
    ).not.toBeInTheDocument();

    const currentPage = screen.getByText("My Post");
    expect(currentPage).toHaveAttribute("aria-current", "page");
    expect(currentPage).toHaveClass("text-slate-200");
    expect(screen.getByText("/")).toHaveClass("font-mono", "text-slate-600");
  });

  it("renders ancestor links for multi-level trails", () => {
    render(
      <BlogPostBreadcrumbs
        items={[
          { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
          { label: "Parent Article", href: "/blog/parent" },
          { label: "Subarticle" },
        ]}
      />
    );

    expect(
      screen.getByRole("link", { name: "Back to Parent Article" })
    ).toHaveAttribute("href", "/blog/parent");

    expect(
      screen.getByRole("link", { name: BLOG_HOME_CRUMB_LABEL })
    ).toHaveAttribute("href", "/blog");
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
    expect(screen.getAllByText("/")[0]).toHaveClass(
      "font-mono",
      "text-slate-600"
    );
  });

  it("exposes the full title on shortened current crumbs", () => {
    render(
      <BlogPostBreadcrumbs
        items={[
          { label: BLOG_HOME_CRUMB_LABEL, href: "/blog" },
          {
            label: "A Complete Guide to…",
            title:
              "A Complete Guide to Building Scalable Blog Navigation Patterns",
          },
        ]}
      />
    );

    expect(screen.getByText("A Complete Guide to…")).toHaveAttribute(
      "title",
      "A Complete Guide to Building Scalable Blog Navigation Patterns"
    );
  });
});
