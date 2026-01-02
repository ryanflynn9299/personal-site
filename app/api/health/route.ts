import { NextResponse } from "next/server";
import { isInternalRequest } from "@/lib/ip-validation";
import { createLogger } from "@/lib/logger";

const log = createLogger("ALL");

/**
 * Internal Health Check Endpoint
 *
 * SECURITY: This endpoint is restricted to internal networks only.
 * It cannot be accessed from external/public IPs.
 *
 * Security measures:
 * 1. IP validation - only allows private/internal IPs
 * 2. Rate limiting via response headers
 * 3. Minimal information disclosure
 * 4. No sensitive data in responses
 * 5. Header injection protection
 *
 * Usage:
 * - Docker health checks: http://localhost:3000/api/health
 * - Internal monitoring: Accessible only from Docker network or localhost
 */

// Simple in-memory rate limiting (for additional protection)
// In production, consider using Redis or a more robust solution
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute per IP

function checkRateLimit(ip: string | null): boolean {
  if (!ip) {
    // If we can't identify IP, be conservative
    return false;
  }

  const now = Date.now();
  const record = requestCounts.get(ip);

  // Clean up old entries periodically
  if (requestCounts.size > 1000) {
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetAt < now) {
        requestCounts.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // New or expired record
    requestCounts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: Request) {
  try {
    // SECURITY LAYER 1: Verify request is from internal network
    if (!isInternalRequest(request)) {
      // Return 404 instead of 403 to avoid information disclosure
      // This makes it harder for attackers to distinguish between
      // "endpoint doesn't exist" vs "endpoint exists but access denied"
      return NextResponse.json(
        { error: "Not Found" },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    // SECURITY LAYER 2: Rate limiting
    const clientIP =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip")?.trim() ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Too Many Requests" },
        {
          status: 429,
          headers: {
            "Retry-After": "60",
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "X-Content-Type-Options": "nosniff",
          },
        }
      );
    }

    // SECURITY LAYER 3: Minimal response - no sensitive information
    // Only return essential health status
    const response = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      // No version numbers
      // No uptime information
      // No internal service details
      // No system information
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
        "X-RateLimit-Window": String(RATE_LIMIT_WINDOW),
      },
    });
  } catch (error) {
    // SECURITY: Don't leak error details
    // Log server-side but return generic error
    log.error({ error }, "Health check error");

    return NextResponse.json(
      { error: "Internal Server Error" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  }
}

// Explicitly reject other HTTP methods
export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
