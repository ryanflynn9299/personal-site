import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogTableOfContents } from "@/components/blog/BlogTableOfContents";
import { evaluateToc } from "@/lib/blog/toc";

const fixtureContent = `
# Table of Contents Smoke Test

## Setup

## Expected behavior

### Heading levels

## Long-scroll check

## Cleanup
`;

describe("BlogTableOfContents", () => {
  it("indents subsection entries under their parent", () => {
    const toc = evaluateToc(fixtureContent, "markdown");

    render(
      <BlogTableOfContents
        tree={toc.tree}
        collapseH3ByDefault={false}
        hiddenH3Count={0}
      />
    );

    const subsectionLink = screen.getByRole("link", { name: "Heading levels" });
    const nestedList = subsectionLink.closest("ul");

    expect(nestedList).toHaveClass("pl-4", "border-l", "border-slate-700/50");
  });
});
