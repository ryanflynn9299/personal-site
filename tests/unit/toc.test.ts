import { describe, it, expect } from "vitest";
import {
  assignHeadingId,
  buildTocTree,
  evaluateToc,
  extractHeadings,
  slugifyHeading,
} from "@/lib/blog/toc";

describe("extractHeadings", () => {
  it("extracts markdown h2-h4 in order", () => {
    const content = `# Title\n\n## Section One\n\n### Sub A\n\n## Section Two`;
    const headings = extractHeadings(content, "markdown");

    expect(headings).toHaveLength(3);
    expect(headings[0]).toMatchObject({
      text: "Section One",
      level: 2,
      id: "section-one",
    });
    expect(headings[1]).toMatchObject({ text: "Sub A", level: 3 });
    expect(headings[2]).toMatchObject({ text: "Section Two", level: 2 });
  });

  it("returns empty array for plaintext", () => {
    expect(extractHeadings("Just a paragraph.", "plaintext")).toEqual([]);
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
});

describe("evaluateToc", () => {
  it("hides toc for two or fewer headings", () => {
    const twoHeadings = "## One\n\n## Two";
    const result = evaluateToc(twoHeadings, "markdown");

    expect(result.show).toBe(false);
    expect(result.reason).toBe("too-few-headings");
  });

  it("shows toc when more than two headings", () => {
    const content = "## One\n\n## Two\n\n### Nested\n";
    const result = evaluateToc(content, "markdown");

    expect(result.show).toBe(true);
    expect(result.reason).toBe("eligible");
    expect(result.tree).toHaveLength(2);
    expect(result.tree[1]?.children).toHaveLength(1);
    expect(result.tree[1]?.children[0]?.text).toBe("Nested");
  });

  it("hides toc for unstructured plaintext", () => {
    const result = evaluateToc(
      "Single paragraph with no headings.",
      "plaintext"
    );

    expect(result.show).toBe(false);
    expect(result.reason).toBe("plaintext");
  });

  it("collapses h3 by default for long lists", () => {
    const sections = Array.from(
      { length: 8 },
      (_, index) => `## Section ${index + 1}\n\n### Detail ${index + 1}`
    ).join("\n\n");
    const result = evaluateToc(sections, "markdown");

    expect(result.show).toBe(true);
    expect(result.collapseH3ByDefault).toBe(true);
    expect(result.hiddenH3Count).toBe(8);
  });
});

describe("buildTocTree", () => {
  it("nests h3 under preceding h2", () => {
    const headings = extractHeadings("## Parent\n\n### Child", "markdown");
    const tree = buildTocTree(headings);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.children[0]?.text).toBe("Child");
  });
});

describe("slugifyHeading", () => {
  it("normalizes punctuation and whitespace", () => {
    expect(slugifyHeading("Hello, World!")).toBe("hello-world");
  });

  it("assignHeadingId avoids collisions", () => {
    const used = new Set<string>();
    expect(assignHeadingId("Intro", used)).toBe("intro");
    expect(assignHeadingId("Intro", used)).toBe("intro-1");
  });
});
