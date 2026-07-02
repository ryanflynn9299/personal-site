import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("@/lib/dev-tooling/logger", () => {
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

vi.mock("@/lib/services/directus", () => ({
  isDirectusConfigured: vi.fn(() => false),
  getPublishedPosts: vi.fn(async () => ({ status: "error", posts: [] })),
}));

describe("sitemap", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("includes core static routes", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const routes = await sitemap();
    const urls = routes.map((route) => route.url);

    expect(urls).toContain("http://localhost:3000");
    expect(urls).toContain("http://localhost:3000/about");
    expect(urls).toContain("http://localhost:3000/blog");
    expect(urls).toContain("http://localhost:3000/contact");
    expect(urls).toContain("http://localhost:3000/policies");
  });

  it("does not include blog post URLs when Directus is unavailable", async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const routes = await sitemap();
    const blogPostRoutes = routes.filter((route) =>
      route.url.includes("/blog/")
    );

    expect(blogPostRoutes).toHaveLength(0);
  });
});
