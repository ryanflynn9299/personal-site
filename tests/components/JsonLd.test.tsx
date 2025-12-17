import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { JsonLd } from "@/components/JsonLd";
import type { Post } from "@/types";

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

  it("renders a script tag with type application/ld+json", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeInTheDocument();
  });

  it("includes correct schema.org context", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("BlogPosting");
  });

  it("includes post headline", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.headline).toBe("Test Blog Post");
  });

  it("includes post publish date", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.datePublished).toBe("2024-01-15T00:00:00Z");
  });

  it("includes author information", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.author["@type"]).toBe("Person");
    expect(jsonLd.author.name).toBe("John Doe");
  });

  it("includes publisher information", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.publisher["@type"]).toBe("Person");
    expect(jsonLd.publisher.name).toBe("John Doe");
  });

  it("includes image URL when feature_image is present", () => {
    vi.stubEnv("NEXT_PUBLIC_DIRECTUS_URL", "https://api.example.com");

    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.image).toContain("/assets/123");

    vi.unstubAllEnvs();
  });

  it("excludes image when feature_image is null", () => {
    const { container } = render(<JsonLd post={mockPostWithoutImage} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.image).toBeUndefined();
  });

  it("includes mainEntityOfPage with correct structure", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const jsonLd = JSON.parse(script?.innerHTML || "{}");

    expect(jsonLd.mainEntityOfPage["@type"]).toBe("WebPage");
    expect(jsonLd.mainEntityOfPage["@id"]).toContain("/blog/test-blog-post");
  });

  it("generates valid JSON", () => {
    const { container } = render(<JsonLd post={mockPost} />);
    const script = container.querySelector('script[type="application/ld+json"]');

    expect(() => JSON.parse(script?.innerHTML || "")).not.toThrow();
  });
});

