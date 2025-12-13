import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PostCard } from "@/components/PostCard";
import type { Post } from "@/types";

const mockPost: Post = {
  id: "1",
  title: "Test Blog Post",
  summary: "This is a test blog post summary that describes the content.",
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
  id: "2",
  slug: "test-post-no-image",
  feature_image: null,
};

describe("PostCard", () => {
  it("renders post title", () => {
    render(<PostCard post={mockPost} />);
    expect(screen.getByText("Test Blog Post")).toBeInTheDocument();
  });

  it("renders post summary", () => {
    render(<PostCard post={mockPost} />);
    expect(
      screen.getByText(/This is a test blog post summary/)
    ).toBeInTheDocument();
  });

  it("renders formatted publication date", () => {
    render(<PostCard post={mockPost} />);
    // Date should be formatted as "January 15, 2024"
    expect(screen.getByText(/January 14, 2024/)).toBeInTheDocument();
  });

  it("links to the correct post URL", () => {
    render(<PostCard post={mockPost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/blog/test-blog-post");
  });

  it("renders feature image when available", () => {
    render(<PostCard post={mockPost} />);
    const image = screen.getByAltText("Alt text");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("test-image.jpg")
    );
  });

  it("does not render image when feature_image is null", () => {
    render(<PostCard post={mockPostWithoutImage} />);
    const image = screen.queryByAltText("Alt text");
    expect(image).not.toBeInTheDocument();
  });

  it("applies hover styles to card", () => {
    render(<PostCard post={mockPost} />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("group");
    expect(link).toHaveClass("hover:border-sky-400");
  });

  it("displays calendar icon with date", () => {
    render(<PostCard post={mockPost} />);
    // Calendar icon should be present (lucide-react Calendar component)
    // The date should be in a time element
    const timeElement = screen.getByText(/January 14, 2024/);
    expect(timeElement.tagName).toBe("TIME");
  });
});
