/**
 * Admin login abuse protection: per-IP failed-attempt rate limiting.
 *
 * Same in-memory pattern as the contact form (see contact-protection.ts).
 * Clients without a resolvable IP (e.g. local dev without proxy headers)
 * share a single "unidentified" bucket so the limit still applies without
 * locking out local development entirely.
 *
 * @see .docs/SECURITY.md
 */

const failedAttempts = new Map<string, { count: number; resetAt: number }>();

/** Max failed login attempts per IP within the window */
export const LOGIN_RATE_LIMIT_MAX = 5;
/** Rate-limit window in milliseconds (15 minutes) */
export const LOGIN_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

function bucketKey(clientIp: string | null): string {
  return clientIp && clientIp !== "unknown" ? clientIp : "unidentified";
}

/**
 * Returns true when the client has exceeded the failed-attempt limit.
 */
export function isLoginRateLimited(clientIp: string | null): boolean {
  const record = failedAttempts.get(bucketKey(clientIp));
  if (!record || record.resetAt < Date.now()) {
    return false;
  }
  return record.count >= LOGIN_RATE_LIMIT_MAX;
}

/**
 * Records a failed login attempt for the client.
 */
export function registerFailedLogin(clientIp: string | null): void {
  const now = Date.now();

  if (failedAttempts.size > 1000) {
    for (const [key, value] of failedAttempts.entries()) {
      if (value.resetAt < now) {
        failedAttempts.delete(key);
      }
    }
  }

  const key = bucketKey(clientIp);
  const record = failedAttempts.get(key);

  if (!record || record.resetAt < now) {
    failedAttempts.set(key, {
      count: 1,
      resetAt: now + LOGIN_RATE_LIMIT_WINDOW_MS,
    });
    return;
  }

  record.count++;
}

/**
 * Clears failed attempts for the client (called after successful login).
 */
export function clearLoginFailures(clientIp: string | null): void {
  failedAttempts.delete(bucketKey(clientIp));
}

/** Reset rate-limit state (tests only) */
export function resetLoginRateLimitForTests(): void {
  failedAttempts.clear();
}
