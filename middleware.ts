import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "admin_session";

/** Preview-only routes — blocked in production unless ENABLE_PREVIEW_FEATURES=true */
const PREVIEW_ONLY_ROUTES = ["/quotes", "/projects-cabinet"];

function isProductionDeployment(): boolean {
  const mode = process.env.RUNTIME_MODE;
  if (mode === "production") {
    return true;
  }
  if (mode === "live-dev" || mode === "offline-dev" || mode === "test") {
    return false;
  }
  return process.env.NODE_ENV === "production";
}

function previewFeaturesEnabled(): boolean {
  return process.env.ENABLE_PREVIEW_FEATURES === "true";
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() ?? "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isTailscaleIp(ip: string): boolean {
  const parts = ip.split(".").map(Number);
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return false;
  }
  return parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127;
}

/**
 * Middleware: admin auth, optional Tailscale gate, preview-route blocking.
 * @see .docs/dev/ADMIN_ACCESS.md
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    isProductionDeployment() &&
    !previewFeaturesEnabled() &&
    PREVIEW_ONLY_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    )
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith("/admin")) {
    if (pathname.includes("/login")) {
      return NextResponse.next();
    }

    const session = request.cookies.get(SESSION_COOKIE_NAME);
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    if (!session || !sessionSecret || session.value !== sessionSecret) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard/login";
      return NextResponse.redirect(url);
    }

    const requireTailscale = process.env.ADMIN_REQUIRE_TAILSCALE === "true";
    if (requireTailscale && isProductionDeployment()) {
      const clientIP = getClientIp(request);
      if (!isTailscaleIp(clientIP)) {
        return new NextResponse(
          "Subspace Access Denied: Tailscale Connection Required",
          { status: 403 }
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/quotes/:path*",
    "/quotes",
    "/projects-cabinet/:path*",
    "/projects-cabinet",
  ],
};
