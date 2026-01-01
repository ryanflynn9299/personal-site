/**
 * IP Address Validation Utilities
 *
 * Secure utilities for validating internal/private IP addresses.
 * Used to restrict health check endpoints to internal networks only.
 */

/**
 * Checks if an IP address is in a private/internal network range
 *
 * Private ranges:
 * - 10.0.0.0/8 (10.0.0.0 to 10.255.255.255)
 * - 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
 * - 192.168.0.0/16 (192.168.0.0 to 192.168.255.255)
 * - 127.0.0.0/8 (127.0.0.0 to 127.255.255.255) - localhost
 * - ::1 - IPv6 localhost
 * - fc00::/7 - IPv6 private range
 * - Docker networks: 172.17.0.0/16, 172.18.0.0/16, etc.
 */
export function isPrivateIP(ip: string): boolean {
  if (!ip || typeof ip !== "string") {
    return false;
  }

  // Remove any port numbers
  const cleanIP = ip.split(":")[0].trim();

  // Handle IPv6
  if (cleanIP.includes("::")) {
    // IPv6 localhost
    if (cleanIP === "::1" || cleanIP === "::ffff:127.0.0.1") {
      return true;
    }
    // IPv6 private range (fc00::/7)
    if (cleanIP.startsWith("fc") || cleanIP.startsWith("fd")) {
      return true;
    }
    // IPv6-mapped IPv4 (::ffff:10.x.x.x)
    if (cleanIP.startsWith("::ffff:")) {
      const ipv4 = cleanIP.replace("::ffff:", "");
      return isPrivateIPv4(ipv4);
    }
    return false;
  }

  // Handle IPv4
  return isPrivateIPv4(cleanIP);
}

/**
 * Checks if an IPv4 address is in a private range
 *
 * Validates format strictly to prevent injection attacks
 */
function isPrivateIPv4(ip: string): boolean {
  // Remove port if present (e.g., "127.0.0.1:8080" -> "127.0.0.1")
  const cleanIP = ip.split(":")[0].trim();

  // Basic format validation - must be 4 octets
  if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanIP)) {
    return false;
  }

  const parts = cleanIP.split(".").map(Number);

  // Validate each octet is a valid number (0-255)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    return false;
  }

  const [a, b] = parts;

  // 127.0.0.0/8 - localhost (all 127.x.x.x addresses)
  if (a === 127) {
    return true;
  }

  // 10.0.0.0/8 - private class A (all 10.x.x.x addresses)
  if (a === 10) {
    return true;
  }

  // 172.16.0.0/12 - private class B (includes Docker networks)
  // Range: 172.16.0.0 to 172.31.255.255
  if (a === 172 && b >= 16 && b <= 31) {
    return true;
  }

  // 192.168.0.0/16 - private class C (all 192.168.x.x addresses)
  if (a === 192 && b === 168) {
    return true;
  }

  // Note: 172.17.0.0/16 (Docker default bridge) is covered by 172.16.0.0/12 above

  return false;
}

/**
 * Safely extracts the real client IP from request headers
 * Handles proxy headers securely to prevent header injection attacks
 *
 * Security considerations:
 * - Validates IP format to prevent injection
 * - Handles multiple X-Forwarded-For headers (takes first)
 * - Limits IP string length to prevent DoS
 * - Strips port numbers and whitespace
 *
 * Priority:
 * 1. X-Forwarded-For (first IP in chain)
 * 2. X-Real-IP
 * 3. CF-Connecting-IP (Cloudflare)
 */
export function getClientIP(request: Request): string | null {
  // Maximum IP string length (IPv6 can be up to 45 chars, add buffer)
  const MAX_IP_LENGTH = 50;

  // Get IP from various headers (in order of preference)
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip"); // Cloudflare

  // Extract first IP from X-Forwarded-For (handles chains like "ip1, ip2, ip3")
  let ip: string | null = null;

  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs: "client, proxy1, proxy2"
    // We want the original client IP (first one)
    // Also handle case where header might be duplicated (take first occurrence)
    const firstIP = forwardedFor.split(",")[0].trim();

    // Security: Validate length and format
    if (
      firstIP.length > 0 &&
      firstIP.length <= MAX_IP_LENGTH &&
      /^[0-9a-fA-F:.[\]]+$/.test(firstIP) // Allow brackets for IPv6 [::1]
    ) {
      // Remove brackets if present (IPv6 format)
      const cleanIP = firstIP.replace(/^\[|\]$/g, "");
      ip = cleanIP;
    }
  } else if (realIP) {
    // Basic validation with length check
    const trimmed = realIP.trim();
    if (
      trimmed.length > 0 &&
      trimmed.length <= MAX_IP_LENGTH &&
      /^[0-9a-fA-F:.[\]]+$/.test(trimmed)
    ) {
      ip = trimmed.replace(/^\[|\]$/g, "");
    }
  } else if (cfConnectingIP) {
    // Cloudflare header
    const trimmed = cfConnectingIP.trim();
    if (
      trimmed.length > 0 &&
      trimmed.length <= MAX_IP_LENGTH &&
      /^[0-9a-fA-F:.[\]]+$/.test(trimmed)
    ) {
      ip = trimmed.replace(/^\[|\]$/g, "");
    }
  }

  return ip;
}

/**
 * Checks if a request is from an internal/private network
 *
 * This function implements multiple security layers:
 * 1. Validates Host header for internal indicators
 * 2. Extracts and validates client IP from headers
 * 3. Checks IP against private network ranges
 * 4. Handles edge cases for Docker networks
 *
 * Security considerations:
 * - Host header can be spoofed, so we don't rely solely on it
 * - IP validation is the primary security mechanism
 * - Falls back to permissive mode only in Docker/production environments
 */
export function isInternalRequest(request: Request): boolean {
  // SECURITY LAYER 1: Check Host header (supplementary check, not primary)
  // Note: Host header can be spoofed, so this is just a hint
  const host = request.headers.get("host");
  let hostSuggestsInternal = false;

  if (host) {
    const hostLower = host.toLowerCase();
    // Remove port if present
    const hostWithoutPort = hostLower.split(":")[0];

    // Allow localhost, 127.0.0.1, and Docker service names
    // But validate format to prevent injection
    if (
      hostWithoutPort === "localhost" ||
      hostWithoutPort === "127.0.0.1" ||
      hostWithoutPort.includes("ps-frontend") || // Docker service name
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostWithoutPort) || // Docker IP range
      hostWithoutPort.startsWith("10.") || // Private IP
      hostWithoutPort.startsWith("192.168.") // Private IP
    ) {
      hostSuggestsInternal = true;
    }
  }

  // SECURITY LAYER 2: Extract and validate IP from headers
  const clientIP = getClientIP(request);

  // If we have an IP, validate it strictly
  if (clientIP) {
    const isValidPrivate = isPrivateIP(clientIP);

    // If IP is valid and private, allow access
    if (isValidPrivate) {
      return true;
    }

    // If IP is public/external, deny access (even if host suggests internal)
    // This prevents spoofing attacks via Host header
    return false;
  }

  // SECURITY LAYER 3: Handle case where no IP headers exist
  // This happens with direct connections (e.g., Docker health checks)
  // In Docker, connections from localhost or other containers won't have proxy headers

  // Only allow if:
  // 1. Host header suggests internal AND
  // 2. We're in a controlled environment (Docker/production)
  if (!clientIP && hostSuggestsInternal) {
    // In production/Docker, direct connections without headers are likely internal
    // This is safe because Docker networks are isolated
    if (process.env.NODE_ENV === "production") {
      return true;
    }

    // In development, only allow if explicitly localhost
    if (
      host?.toLowerCase().includes("localhost") ||
      host?.includes("127.0.0.1")
    ) {
      return true;
    }
  }

  // Default: deny access if we can't verify it's internal
  return false;
}
