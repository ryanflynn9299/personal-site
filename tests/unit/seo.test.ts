import {
  generatePageMetadata,
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  SITE_URL,
} from "../../lib/site/seo";
import { describe, it, expect } from "vitest";

describe("SEO Utilities", () => {
  describe("generatePageMetadata", () => {
    it("should generate correct metadata with all parameters provided", () => {
      const result = generatePageMetadata({
        title: "Test Page",
        description: "Test Description",
        path: "/test-path",
        image: "https://example.com/image.jpg",
        type: "article",
        publishedTime: "2024-01-01T00:00:00Z",
        modifiedTime: "2024-01-02T00:00:00Z",
      });

      expect(result.title).toBe("Test Page");
      expect(result.description).toBe("Test Description");
      expect(result.openGraph.title).toBe("Test Page");
      expect(result.openGraph.description).toBe("Test Description");
      expect(result.openGraph.url).toBe(SITE_URL + "/test-path");
      expect(result.openGraph.siteName).toBe(SITE_NAME);
      expect(result.openGraph.images[0].url).toBe(
        "https://example.com/image.jpg"
      );
      expect(result.openGraph.images[0].width).toBe(1200);
      expect(result.openGraph.images[0].height).toBe(630);
      expect(result.openGraph.images[0].alt).toBe("Test Page");
      expect(result.openGraph.type).toBe("article");
      expect(result.openGraph.publishedTime).toBe("2024-01-01T00:00:00Z");
      expect(result.openGraph.modifiedTime).toBe("2024-01-02T00:00:00Z");

      expect(result.twitter.card).toBe("summary_large_image");
      expect(result.twitter.title).toBe("Test Page");
      expect(result.twitter.description).toBe("Test Description");
      expect(result.twitter.images[0]).toBe("https://example.com/image.jpg");

      expect(result.alternates.canonical).toBe(SITE_URL + "/test-path");
    });

    it("should generate correct metadata with default fallbacks", () => {
      const result = generatePageMetadata({
        title: "Default Page",
        description: "Default Description",
        path: "/default-path",
      });

      expect(result.openGraph.type).toBe("website");
      expect(result.openGraph.images[0].url).toBe(DEFAULT_OG_IMAGE);
      expect(result.twitter.images[0]).toBe(DEFAULT_OG_IMAGE);
      expect(result.openGraph.publishedTime).toBeUndefined();
      expect(result.openGraph.modifiedTime).toBeUndefined();
    });
  });
});
