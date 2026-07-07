import { describe, it, expect } from "vitest";
import { blogSpacing } from "@/lib/blog/spacing";

describe("blogSpacing", () => {
  it("exposes stable tokens for page shell and section breaks", () => {
    expect(blogSpacing.pagePaddingY).toBe("py-16");
    expect(blogSpacing.sectionBreak).toContain("mt-12");
    expect(blogSpacing.sectionBreak).toContain("pt-8");
  });
});
