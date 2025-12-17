import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";

// Mock fs module
vi.mock("fs");
vi.mock("path", async () => {
  const actual = await vi.importActual<typeof path>("path");
  return {
    ...actual,
    join: vi.fn((...args: string[]) => args.join("/")),
  };
});

describe("policy-loader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock process.cwd()
    vi.spyOn(process, "cwd").mockReturnValue("/app");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("loadPolicyDocument", () => {
    it("loads a policy document with frontmatter", async () => {
      const mockContent = `---
title: Privacy Policy
lastUpdated: 2024-01-15
---

# Privacy Policy

This is the content.`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      // Dynamic import to get fresh module with mocks
      const { loadPolicyDocument } = await import("@/lib/policy-loader");
      
      const result = loadPolicyDocument("privacy-policy.md");

      expect(result.metadata.title).toBe("Privacy Policy");
      expect(result.metadata.lastUpdated).toBe("2024-01-15");
      expect(result.content).toContain("# Privacy Policy");
    });

    it("throws error when file does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const { loadPolicyDocument } = await import("@/lib/policy-loader");

      expect(() => loadPolicyDocument("nonexistent.md")).toThrow(
        "Policy document not found"
      );
    });

    it("handles documents without frontmatter", async () => {
      const mockContent = "# Policy\n\nJust content, no frontmatter.";

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      const { loadPolicyDocument } = await import("@/lib/policy-loader");
      
      const result = loadPolicyDocument("simple.md");

      expect(result.metadata.title).toBe("Policy Document"); // Default
      expect(result.content).toContain("# Policy");
    });

    it("uses default title when not in frontmatter", async () => {
      const mockContent = `---
lastUpdated: 2024-01-15
---

Content here`;

      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readFileSync).mockReturnValue(mockContent);

      const { loadPolicyDocument } = await import("@/lib/policy-loader");
      
      const result = loadPolicyDocument("test.md");

      expect(result.metadata.title).toBe("Policy Document");
    });
  });

  describe("getAvailablePolicies", () => {
    it("returns list of policy filenames without .md extension", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "privacy-policy.md",
        "terms-of-service.md",
        "README.md",
      ] as unknown as fs.Dirent[]);

      const { getAvailablePolicies } = await import("@/lib/policy-loader");
      
      const result = getAvailablePolicies();

      expect(result).toContain("privacy-policy");
      expect(result).toContain("terms-of-service");
      expect(result).not.toContain("README"); // Excluded
    });

    it("returns empty array when policies directory does not exist", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const { getAvailablePolicies } = await import("@/lib/policy-loader");
      
      const result = getAvailablePolicies();

      expect(result).toEqual([]);
    });

    it("filters out non-markdown files", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "privacy-policy.md",
        "image.png",
        "data.json",
      ] as unknown as fs.Dirent[]);

      const { getAvailablePolicies } = await import("@/lib/policy-loader");
      
      const result = getAvailablePolicies();

      expect(result).toEqual(["privacy-policy"]);
    });
  });

  describe("loadAllPolicies", () => {
    it("loads all policies with formatted names", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "privacy-policy.md",
        "terms-of-service.md",
      ] as unknown as fs.Dirent[]);
      
      vi.mocked(fs.readFileSync).mockImplementation((filePath) => {
        if (String(filePath).includes("privacy-policy")) {
          return `---
title: Privacy Policy
lastUpdated: 2024-01-15
---

Privacy content`;
        }
        return `---
title: Terms of Service
lastUpdated: 2024-01-20
---

Terms content`;
      });

      const { loadAllPolicies } = await import("@/lib/policy-loader");
      
      const result = loadAllPolicies();

      expect(result).toHaveLength(2);
      
      const privacy = result.find((p) => p.id === "privacy-policy");
      expect(privacy?.name).toBe("Privacy Policy");
      expect(privacy?.metadata.title).toBe("Privacy Policy");

      const terms = result.find((p) => p.id === "terms-of-service");
      expect(terms?.name).toBe("Terms Of Service");
    });

    it("converts kebab-case to Title Case for names", async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        "cookie-policy.md",
      ] as unknown as fs.Dirent[]);
      
      vi.mocked(fs.readFileSync).mockReturnValue(`---
title: Cookie Policy
---

Content`);

      const { loadAllPolicies } = await import("@/lib/policy-loader");
      
      const result = loadAllPolicies();

      expect(result[0].name).toBe("Cookie Policy");
    });
  });
});

