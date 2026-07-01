import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";

describe("middleware", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  async function loadMiddleware() {
    const { middleware } = await import("@/middleware");
    return middleware;
  }

  function createRequest(
    pathname: string,
    options?: {
      cookies?: Record<string, string>;
      headers?: Record<string, string>;
    }
  ) {
    const request = new NextRequest(`http://localhost:3000${pathname}`, {
      headers: options?.headers,
    });

    if (options?.cookies) {
      for (const [name, value] of Object.entries(options.cookies)) {
        request.cookies.set(name, value);
      }
    }

    return request;
  }

  it("returns 404 for preview routes in production when preview features are disabled", async () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("ENABLE_PREVIEW_FEATURES", "false");

    const middleware = await loadMiddleware();
    const response = middleware(createRequest("/quotes"));

    expect(response.status).toBe(404);
  });

  it("allows preview routes when ENABLE_PREVIEW_FEATURES is true", async () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("ENABLE_PREVIEW_FEATURES", "true");

    const middleware = await loadMiddleware();
    const response = middleware(createRequest("/quotes"));

    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated admin requests to login", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret");

    const middleware = await loadMiddleware();
    const response = middleware(createRequest("/admin/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/admin/dashboard/login"
    );
  });

  it("allows authenticated admin requests with a valid session cookie", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", "test-secret");

    const middleware = await loadMiddleware();
    const response = middleware(
      createRequest("/admin/dashboard", {
        cookies: { admin_session: "test-secret" },
      })
    );

    expect(response.status).toBe(200);
  });

  it("allows admin login route without authentication", async () => {
    const middleware = await loadMiddleware();
    const response = middleware(createRequest("/admin/dashboard/login"));

    expect(response.status).toBe(200);
  });
});
