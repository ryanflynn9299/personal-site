import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { BlogContentRenderer } from "@/components/blog/BlogContentRenderer";
import { extractHeadings } from "@/lib/blog/toc";

const fixtureContent = `
# Table of Contents Smoke Test

Intro paragraph.

## Setup

Setup copy.

## Expected behavior

Behavior copy.

### Heading levels

Nested copy.

## Long-scroll check

Scroll copy.
`;

describe("BlogContentRenderer", () => {
  it("assigns stable heading ids on initial and subsequent renders", () => {
    const headings = extractHeadings(fixtureContent, "markdown");
    const { container, rerender } = render(
      <BlogContentRenderer content={fixtureContent} format="markdown" />
    );

    const assertIds = () => {
      const h2s = container.querySelectorAll("h2");
      const h3s = container.querySelectorAll("h3");

      expect(h2s[0]).toHaveAttribute("id", headings[0].id);
      expect(h2s[1]).toHaveAttribute("id", headings[1].id);
      expect(h3s[0]).toHaveAttribute("id", headings[2].id);
      expect(h2s[2]).toHaveAttribute("id", headings[3].id);
    };

    assertIds();
    rerender(
      <BlogContentRenderer content={fixtureContent} format="markdown" />
    );
    assertIds();
  });
});
