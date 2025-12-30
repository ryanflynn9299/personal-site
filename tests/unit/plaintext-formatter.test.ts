import { describe, it, expect } from "vitest";
import {
  formatPlaintext,
  isLikelyMarkdown,
  isLikelyHTML,
} from "@/lib/plaintext-formatter";

describe("formatPlaintext", () => {
  describe("basic formatting", () => {
    it("returns empty string for empty input", () => {
      expect(formatPlaintext("")).toBe("");
      expect(formatPlaintext("   ")).toBe("");
    });

    it("wraps plain text in paragraph tags", () => {
      const result = formatPlaintext("Hello world");
      expect(result).toBe("<p>Hello world</p>");
    });

    it("handles multiple paragraphs separated by blank lines", () => {
      const input = "First paragraph\n\nSecond paragraph";
      const result = formatPlaintext(input);
      expect(result).toContain("<p>First paragraph</p>");
      expect(result).toContain("<p>Second paragraph</p>");
    });
  });

  describe("HTML escaping", () => {
    it("escapes HTML special characters", () => {
      const result = formatPlaintext("Use <script> & tags");
      expect(result).toContain("&lt;script&gt;");
      expect(result).toContain("&amp;");
      expect(result).not.toContain("<script>");
    });

    it("escapes angle brackets", () => {
      const result = formatPlaintext("a < b > c");
      expect(result).toContain("&lt;");
      expect(result).toContain("&gt;");
    });
  });

  describe("inline formatting", () => {
    it("converts **text** to bold", () => {
      const result = formatPlaintext("This is **bold** text");
      expect(result).toContain("<strong>bold</strong>");
    });

    it("converts __text__ to bold", () => {
      const result = formatPlaintext("This is __bold__ text");
      expect(result).toContain("<strong>bold</strong>");
    });

    it("converts *text* to italic", () => {
      const result = formatPlaintext("This is *italic* text");
      expect(result).toContain("<em>italic</em>");
    });

    it("converts _text_ to italic", () => {
      const result = formatPlaintext("This is _italic_ text");
      expect(result).toContain("<em>italic</em>");
    });
  });

  describe("headers", () => {
    it("converts # to h1", () => {
      const result = formatPlaintext("# Header 1");
      expect(result).toContain("<h1");
      expect(result).toContain("Header 1</h1>");
    });

    it("converts ## to h2", () => {
      const result = formatPlaintext("## Header 2");
      expect(result).toContain("<h2");
      expect(result).toContain("Header 2</h2>");
    });

    it("converts ### to h3", () => {
      const result = formatPlaintext("### Header 3");
      expect(result).toContain("<h3");
      expect(result).toContain("Header 3</h3>");
    });

    it("handles headers up to h6", () => {
      const result = formatPlaintext("###### Header 6");
      expect(result).toContain("<h6");
      expect(result).toContain("Header 6</h6>");
    });
  });

  describe("bullet lists", () => {
    it("converts - items to unordered list", () => {
      const input = "- Item 1\n- Item 2\n- Item 3";
      const result = formatPlaintext(input);
      expect(result).toContain("<ul");
      expect(result).toContain("<li>Item 1</li>");
      expect(result).toContain("<li>Item 2</li>");
      expect(result).toContain("<li>Item 3</li>");
      expect(result).toContain("</ul>");
    });

    it("converts * items to unordered list", () => {
      const input = "* Item 1\n* Item 2";
      const result = formatPlaintext(input);
      expect(result).toContain("<ul");
      expect(result).toContain("<li>Item 1</li>");
    });

    it("converts • items to unordered list", () => {
      const input = "• Item 1\n• Item 2";
      const result = formatPlaintext(input);
      expect(result).toContain("<ul");
      expect(result).toContain("<li>Item 1</li>");
    });

    it("closes list when paragraph follows", () => {
      const input = "- Item 1\n- Item 2\n\nParagraph after";
      const result = formatPlaintext(input);
      expect(result).toContain("</ul>");
      expect(result).toContain("<p>Paragraph after</p>");
    });
  });

  describe("numbered lists", () => {
    it("converts numbered items to ordered list", () => {
      const input = "1. First\n2. Second\n3. Third";
      const result = formatPlaintext(input);
      expect(result).toContain("<ol");
      expect(result).toContain("<li>First</li>");
      expect(result).toContain("<li>Second</li>");
      expect(result).toContain("<li>Third</li>");
      expect(result).toContain("</ol>");
    });

    it("handles numbered items with parenthesis", () => {
      const input = "1) First\n2) Second";
      const result = formatPlaintext(input);
      expect(result).toContain("<ol");
      expect(result).toContain("<li>First</li>");
    });
  });

  describe("URL linkification", () => {
    it("converts URLs to links by default", () => {
      const result = formatPlaintext("Visit https://example.com for more");
      expect(result).toContain('<a href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="noopener noreferrer"');
    });

    it("can disable URL linkification", () => {
      const result = formatPlaintext("Visit https://example.com", {
        linkifyUrls: false,
      });
      expect(result).not.toContain("<a href");
      expect(result).toContain("https://example.com");
    });

    it("handles multiple URLs", () => {
      const result = formatPlaintext("Check https://a.com and https://b.com");
      expect(result).toContain('href="https://a.com"');
      expect(result).toContain('href="https://b.com"');
    });
  });

  describe("options", () => {
    it("respects custom bullet characters", () => {
      const result = formatPlaintext("+ Custom bullet", {
        bulletChars: ["+"],
      });
      expect(result).toContain("<ul");
      expect(result).toContain("<li>Custom bullet</li>");
    });
  });
});

describe("isLikelyMarkdown", () => {
  it("returns false for empty content", () => {
    expect(isLikelyMarkdown("")).toBe(false);
  });

  it("detects headers", () => {
    expect(isLikelyMarkdown("# Header")).toBe(true);
    expect(isLikelyMarkdown("## Subheader")).toBe(true);
  });

  it("detects code blocks", () => {
    expect(isLikelyMarkdown("```\ncode\n```")).toBe(true);
  });

  it("detects markdown links", () => {
    expect(isLikelyMarkdown("[text](url)")).toBe(true);
  });

  it("detects markdown images", () => {
    expect(isLikelyMarkdown("![alt](image.png)")).toBe(true);
  });

  it("detects bullet lists", () => {
    expect(isLikelyMarkdown("- item")).toBe(true);
    expect(isLikelyMarkdown("* item")).toBe(true);
    expect(isLikelyMarkdown("+ item")).toBe(true);
  });

  it("detects numbered lists", () => {
    expect(isLikelyMarkdown("1. item")).toBe(true);
  });

  it("detects inline code", () => {
    expect(isLikelyMarkdown("Use `code` here")).toBe(true);
  });

  it("detects blockquotes", () => {
    expect(isLikelyMarkdown("> quote")).toBe(true);
  });

  it("detects tables", () => {
    expect(isLikelyMarkdown("| a | b | c |")).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isLikelyMarkdown("Just plain text")).toBe(false);
  });
});

describe("isLikelyHTML", () => {
  it("returns false for empty content", () => {
    expect(isLikelyHTML("")).toBe(false);
  });

  it("detects HTML tags", () => {
    expect(isLikelyHTML("<p>text</p>")).toBe(true);
    expect(isLikelyHTML("<div>content</div>")).toBe(true);
    expect(isLikelyHTML("<br>")).toBe(true);
    expect(isLikelyHTML("<br/>")).toBe(true);
  });

  it("detects HTML with attributes", () => {
    expect(isLikelyHTML('<a href="url">link</a>')).toBe(true);
    expect(isLikelyHTML('<img src="image.png" alt="alt">')).toBe(true);
  });

  it("returns false for plain text", () => {
    expect(isLikelyHTML("Just plain text")).toBe(false);
  });

  it("returns false for markdown", () => {
    expect(isLikelyHTML("# Header")).toBe(false);
    expect(isLikelyHTML("[link](url)")).toBe(false);
  });
});
