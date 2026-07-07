import { describe, it, expect } from "vitest";
import {
  assignHeadingId,
  extractHeadings,
  slugifyHeading,
} from "@/lib/markdown/headings";

describe("lib/markdown/headings", () => {
  it("extracts markdown h2-h4 by default", () => {
    const content = `# Title\n\n## Section One\n\n### Sub A\n\n## Section Two`;
    const headings = extractHeadings(content, "markdown");

    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({
      text: "Section One",
      level: 2,
      id: "section-one",
    });
  });

  it("includes h1 when minLevel is 1", () => {
    const content = `# Document Title\n\n## Section`;
    const headings = extractHeadings(content, "markdown", {
      minLevel: 1,
      maxLevel: 4,
    });

    expect(headings).toHaveLength(2);
    expect(headings[0]).toMatchObject({ level: 1, id: "document-title" });
  });

  it("deduplicates duplicate heading slugs", () => {
    const content = "## Intro\n\n## Intro\n\n## Intro";
    const headings = extractHeadings(content, "markdown");

    expect(headings.map((heading) => heading.id)).toEqual([
      "intro",
      "intro-1",
      "intro-2",
    ]);
  });

  it("slugifyHeading normalizes punctuation", () => {
    expect(slugifyHeading("Hello, World!")).toBe("hello-world");
  });

  it("assignHeadingId avoids collisions", () => {
    const used = new Set<string>();
    expect(assignHeadingId("Intro", used)).toBe("intro");
    expect(assignHeadingId("Intro", used)).toBe("intro-1");
  });
});
