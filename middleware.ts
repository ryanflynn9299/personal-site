import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  SESSION_COOKIE_NAME,
  verifySessionToken,
} from "@/lib/auth/session-token";
import {
  isPreviewOnlyPathname,
  PREVIEW_ONLY_ROUTES,
} from "@/lib/dev-tooling/preview-routes";

const ADMIN_LOGIN_PATH = "/admin/dashboard/login";

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
 *
 * Runs in the Edge runtime, so it reads `process.env` directly instead of
 * importing the Node-only server config (documented exception).
 *
 * @see .docs/dev/ADMIN_ACCESS.md
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    isProductionDeployment() &&
    !previewFeaturesEnabled() &&
    isPreviewOnlyPathname(pathname)
  ) {
    return new NextResponse(null, { status: 404 });
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === ADMIN_LOGIN_PATH) {
      return NextResponse.next();
    }

    const session = request.cookies.get(SESSION_COOKIE_NAME);
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;

    const sessionValid = await verifySessionToken(
      sessionSecret,
      session?.value
    );
    if (!sessionValid) {
      const url = request.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
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
    ...PREVIEW_ONLY_ROUTES.flatMap((route) => [route, `${route}/:path*`]),
  ],
};
