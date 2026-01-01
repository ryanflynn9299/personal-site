import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/common/JsonLd";
import type { Post } from "@/types";

// Mock the seo module to enable blog SEO for tests
vi.mock("@/lib/seo", () => ({
  SITE_URL: "https://www.ryanflynn.org",
  SITE_AUTHOR: "Ryan Flynn",
  ENABLE_BLOG_SEO: true, // Enable for tests
}));

// Mock the env module to ensure it reads from process.env at runtime
// The env.directus.publicUrl property is set at module load time, so we need to
// intercept access to make it read from process.env dynamically
vi.mock("@/lib/env", async () => {
  const actual = await vi.importActual<typeof import("@/lib/env")>("@/lib/env");
  // Create a Proxy that intercepts access to the directus property
  // to read from process.env at runtime instead of module load time
  return {
    ...actual,
    env: new Proxy(actual.env, {
      get(target, prop) {
        // Intercept directus property to read from process.env dynamically
        if (prop === "directus") {
          return {
            serverUrl: process.env.DIRECTUS_URL_SERVER_SIDE,
            publicUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
          };
        }
        // For all other properties (including getters), access normally
        return Reflect.get(target, prop, target);
      },
    }),
  };
});

describe("JsonLd", () => {
  const mockPost: Post = {
    id: "1",
    title: "Test Blog Post",
    summary: "A test blog post summary",
    slug: "test-blog-post",
    status: "published",
    publish_date: "2024-01-15T00:00:00Z",
    author: {
      first_name: "John",
      last_name: "Doe",
    },
    feature_image: {
      id: 123,
      filename: "test-image.jpg",
    },
    content: "<p>Test content</p>",
    tags: ["test", "blog"],
  };

  const mockPostWithoutImage: Post = {
    ...mockPost,
    feature_image: null,
  };

  beforeEach(() => {
    // Set a default Directus URL for all tests
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders a script tag with type application/ld+json", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    expect(script).toBeInTheDocument();
  });

  it("includes correct schema.org context", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BlogPosting");
  });

  it("includes post headline", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.headline).toBe("Test Blog Post");
  });

  it("includes post publish date", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    // toISOString() includes milliseconds, so we check it starts with the expected date
    expect(jsonLd.datePublished).toMatch(/^2024-01-15T00:00:00/);
  });

  it("includes author information", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.author["@type"]).toBe("Person");
    expect(jsonLd.author.name).toBe("John Doe");
  });

  it("includes publisher information", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.publisher["@type"]).toBe("Person");
    expect(jsonLd.publisher.name).toBe("Ryan Flynn"); // Publisher uses SITE_AUTHOR, not post author
  });

  it("includes image URL when feature_image is present", () => {
    // The URL is already set in beforeEach, but ensure it's set for this test
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.testdomain.com");

    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.image).toBeDefined();
    expect(jsonLd.image["@type"]).toBe("ImageObject");
    expect(jsonLd.image.url).toContain("/assets/123");
    expect(jsonLd.image.url).toBe("https://api.testdomain.com/assets/123");
  });

  it("excludes image when feature_image is null", () => {
    const { container } = render(<JsonLd post={mockPostWithoutImage} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.image).toBeUndefined();
  });

  it("includes mainEntityOfPage with correct structure", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.mainEntityOfPage["@type"]).toBe("WebPage");
    expect(jsonLd.mainEntityOfPage["@id"]).toContain("/blog/test-blog-post");
  });

  it("generates valid JSON", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector(
      'script[type="application/ld+json"]'
    );

    expect(() => JSON.parse(script?.innerHTML || "")).not.toThrow();
  });
});
