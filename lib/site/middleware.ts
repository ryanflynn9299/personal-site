import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { runtime } from "@/lib/config";
import { serverConfig } from "@/lib/config/server";

const SESSION_COOKIE_NAME = "admin_session";

/**
 * Middleware to protect admin routes
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only run middleware for admin routes
  if (pathname.startsWith("/admin")) {
    // Allow access to login page without a session
    if (pathname.includes("/login")) {
      return NextResponse.next();
    }

    // Check for admin session cookie
    const session = request.cookies.get(SESSION_COOKIE_NAME);
    const sessionSecret = serverConfig.admin.sessionSecret;

    // Verify session exists and matches our secret
    if (!session || !sessionSecret || session.value !== sessionSecret) {
      // Redirect to login if no valid session found
      const url = request.nextUrl.clone();
      url.pathname = "/admin/dashboard/login";
      return NextResponse.redirect(url);
    }

    // [Optional] Tailscale IP Check
    const clientIP =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      "127.0.0.1";
    const isDevelopment = runtime.isDevelopment;
    const isTailscale = clientIP?.startsWith("100.");

    if (!isDevelopment && !isTailscale && serverConfig.admin.requireTailscale) {
      return new NextResponse(
        "Subspace Access Denied: Tailscale Connection Required",
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// Matching Paths
export const config = {
  matcher: ["/admin/:path*"],
};
