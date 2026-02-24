import { describe, it, expect, vi, beforeEach } from "vitest";
import { cn, getBlogPostUrl } from "@/lib/utils";

// Mock logger to avoid console output during tests
vi.mock("@/lib/logger", () => {
  const mockLogger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => mockLogger),
    log: mockLogger,
    prodLog: mockLogger,
    devLog: mockLogger,
    default: mockLogger,
  };
});

describe("cn", () => {
  it("merges class names correctly", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("foo", false && "bar", "baz")).toBe("foo baz");
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("foo", true && "bar", "baz")).toBe("foo bar baz");
  });

  it("handles undefined and null values", () => {
    expect(cn("foo", undefined, "bar", null, "baz")).toBe("foo bar baz");
  });

  it("handles arrays of classes", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });

  it("handles objects with boolean values", () => {
    expect(cn({ foo: true, bar: false, baz: true })).toBe("foo baz");
  });

  it("merges Tailwind classes intelligently", () => {
    // tailwind-merge should handle conflicting classes
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });

  it("handles mixed inputs", () => {
    expect(cn("foo", ["bar", "baz"], { qux: true, quux: false })).toBe(
      "foo bar baz qux"
    );
  });

  it("handles empty inputs", () => {
    expect(cn()).toBe("");
    expect(cn("")).toBe("");
    expect(cn("", undefined, null)).toBe("");
  });
});

describe("getBlogPostUrl", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct URL for valid slug", () => {
    expect(getBlogPostUrl("my-blog-post")).toBe("/blog/my-blog-post");
    expect(getBlogPostUrl("another-post")).toBe("/blog/another-post");
  });

  it("trims whitespace from slug", () => {
    expect(getBlogPostUrl("  my-post  ")).toBe("/blog/my-post");
  });

  it("returns /blog for null slug", () => {
    expect(getBlogPostUrl(null)).toBe("/blog");
  });

  it("returns /blog for undefined slug", () => {
    expect(getBlogPostUrl(undefined)).toBe("/blog");
  });

  it("returns /blog for empty string", () => {
    expect(getBlogPostUrl("")).toBe("/blog");
  });

  it("returns /blog for whitespace-only slug", () => {
    expect(getBlogPostUrl("   ")).toBe("/blog");
  });

  it("logs error for invalid slug using logger", async () => {
    // Import the mocked logger module
    const loggerModule = await import("@/lib/logger");
    const mockLog = vi.mocked(loggerModule.log);

    // Clear any previous calls
    vi.clearAllMocks();

    getBlogPostUrl(null);

    // Verify logger.error was called with appropriate arguments
    expect(mockLog.error).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: null,
        fallback: "/blog",
      }),
      expect.stringContaining("[getBlogPostUrl]")
    );
  });
});
