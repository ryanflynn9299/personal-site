import { describe, it, expect } from "vitest";
import {
  getPolicyHeadingClassName,
  getPolicyHeadingWrapperClassName,
} from "@/lib/policies/heading-styles";
import { getPolicyColorTheme } from "@/lib/policy-utils/policy-colors";

describe("getPolicyHeadingClassName", () => {
  const theme = getPolicyColorTheme("privacy-policy");

  it("gives h1 a full-width title band without a left rail", () => {
    const className = getPolicyHeadingClassName("h1", theme);
    expect(className).toContain("border-b");
    expect(className).not.toContain("border-l");
  });

  it("gives h2 a primary accent rail without margin indent", () => {
    const className = getPolicyHeadingClassName("h2", theme);
    expect(className).toContain("border-l-4");
    expect(className).not.toContain("ml-6");
  });

  it("gives nested headings accent rails without ml offsets (gutter handles depth)", () => {
    expect(getPolicyHeadingClassName("h3", theme)).toContain("border-l-2");
    expect(getPolicyHeadingClassName("h3", theme)).not.toContain("ml-6");

    expect(getPolicyHeadingClassName("h4", theme)).toContain("border-l");
    expect(getPolicyHeadingClassName("h4", theme)).not.toContain("ml-12");
  });
});

describe("getPolicyHeadingWrapperClassName", () => {
  it("applies vertical rhythm on h3 and h4 outline wrappers", () => {
    expect(getPolicyHeadingWrapperClassName("h3")).toContain("mt-8");
    expect(getPolicyHeadingWrapperClassName("h4")).toContain("mt-6");
  });
});
