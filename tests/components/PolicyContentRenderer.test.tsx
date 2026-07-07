import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PolicyContentRenderer } from "@/components/policies/PolicyContentRenderer";
import { extractHeadings } from "@/lib/markdown/headings";
import { getPolicyColorTheme } from "@/lib/policy-utils/policy-colors";

const fixtureContent = `
# Privacy Architecture Report

Intro paragraph.

## Data collection

Collection copy.

### Matomo

Nested detail.

#### Retention window

Minor detail.

## Your rights

Rights copy.
`;

describe("PolicyContentRenderer", () => {
  it("assigns stable heading ids on initial and subsequent renders", () => {
    const theme = getPolicyColorTheme("privacy-policy");
    const headings = extractHeadings(fixtureContent, "markdown", {
      minLevel: 1,
      maxLevel: 4,
    });
    const { container, rerender } = render(
      <PolicyContentRenderer
        content={fixtureContent}
        format="markdown"
        theme={theme}
      />
    );

    const assertIds = () => {
      const h1 = container.querySelector("h1");
      const h2s = container.querySelectorAll("h2");
      const h3s = container.querySelectorAll("h3");
      const h4s = container.querySelectorAll("h4");

      expect(h1).toHaveAttribute("id", headings[0].id);
      expect(h2s[0]).toHaveAttribute("id", headings[1].id);
      expect(h3s[0]).toHaveAttribute("id", headings[2].id);
      expect(h4s[0]).toHaveAttribute("id", headings[3].id);
      expect(h2s[1]).toHaveAttribute("id", headings[4].id);
    };

    assertIds();
    rerender(
      <PolicyContentRenderer
        content={fixtureContent}
        format="markdown"
        theme={theme}
      />
    );
    assertIds();
  });

  it("applies the outline gutter framework on nested section headings", () => {
    const theme = getPolicyColorTheme("privacy-policy");
    const { container } = render(
      <PolicyContentRenderer
        content={fixtureContent}
        format="markdown"
        theme={theme}
      />
    );

    const h1 = container.querySelector("h1");
    const h2 = container.querySelector("h2");
    const h3 = container.querySelector("h3");

    expect(h1?.className).toContain("border-b");
    expect(h1?.className).not.toContain("border-l");

    expect(h2?.className).toContain("border-l-4");
    expect(h2?.className).not.toContain("ml-6");

    expect(h3?.className).toContain("border-l-2");
    expect(h3?.className).not.toContain("ml-6");
    expect(h3?.parentElement?.childElementCount).toBe(2);

    const h4Wrapper = container.querySelector("h4")?.parentElement;
    expect(h4Wrapper?.childElementCount).toBe(3);
    expect(h4Wrapper?.children[1]?.className).toContain("before:");
  });
});
