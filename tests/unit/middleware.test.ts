import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { NextRequest } from "next/server";
import { createSessionToken } from "@/lib/auth/session-token";

const TEST_SECRET = "test-secret-0123456789abcdef0123456789abcdef";

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
    const response = await middleware(createRequest("/quotes"));

    expect(response.status).toBe(404);
  });

  it("allows preview routes when ENABLE_PREVIEW_FEATURES is true", async () => {
    vi.stubEnv("RUNTIME_MODE", "production");
    vi.stubEnv("ENABLE_PREVIEW_FEATURES", "true");

    const middleware = await loadMiddleware();
    const response = await middleware(createRequest("/quotes"));

    expect(response.status).toBe(200);
  });

  it("redirects unauthenticated admin requests to login", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", TEST_SECRET);

    const middleware = await loadMiddleware();
    const response = await middleware(createRequest("/admin/dashboard"));

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/admin/dashboard/login"
    );
  });

  it("allows authenticated admin requests with a valid signed session token", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", TEST_SECRET);

    const middleware = await loadMiddleware();
    const token = await createSessionToken(TEST_SECRET);
    const response = await middleware(
      createRequest("/admin/dashboard", {
        cookies: { admin_session: token },
      })
    );

    expect(response.status).toBe(200);
  });

  // Regression: the cookie used to store the raw ADMIN_SESSION_SECRET.
  // Presenting the secret itself must no longer grant a session.
  it("rejects the raw session secret as a cookie value", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", TEST_SECRET);

    const middleware = await loadMiddleware();
    const response = await middleware(
      createRequest("/admin/dashboard", {
        cookies: { admin_session: TEST_SECRET },
      })
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/admin/dashboard/login"
    );
  });

  it("rejects a token signed with a different secret", async () => {
    vi.stubEnv("ADMIN_SESSION_SECRET", TEST_SECRET);

    const middleware = await loadMiddleware();
    const forged = await createSessionToken("wrong-secret-abcdef0123456789abcdef012345");
    const response = await middleware(
      createRequest("/admin/dashboard", {
        cookies: { admin_session: forged },
      })
    );

    expect(response.status).toBe(307);
  });

  it("allows admin login route without authentication", async () => {
    const middleware = await loadMiddleware();
    const response = await middleware(createRequest("/admin/dashboard/login"));

    expect(response.status).toBe(200);
  });
});
