/**
 * Contact form abuse protection: honeypot and in-memory rate limiting.
 *
 * @see .docs/dev/CONTACT_FORM_SECURITY.md
 */

const HONEYPOT_FIELD = "website";

const requestCounts = new Map<string, { count: number; resetAt: number }>();

/** Max submissions per IP within the rate-limit window */
export const CONTACT_RATE_LIMIT_MAX = 5;
/** Rate-limit window in milliseconds (15 minutes) */
export const CONTACT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

export type ContactProtectionResult =
  | { allowed: true }
  | { allowed: false; reason: "honeypot" | "rate_limit" };

/**
 * Returns true when the honeypot field was filled (likely a bot).
 */
export function isHoneypotTriggered(formData: FormData): boolean {
  const value = formData.get(HONEYPOT_FIELD);
  if (typeof value !== "string") {
    return false;
  }
  return value.trim().length > 0;
}

/**
 * Checks whether the client IP is within the contact form rate limit.
 */
export function checkContactRateLimit(clientIp: string | null): boolean {
  if (!clientIp || clientIp === "unknown") {
    return false;
  }

  const now = Date.now();

  if (requestCounts.size > 1000) {
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetAt < now) {
        requestCounts.delete(key);
      }
    }
  }

  const record = requestCounts.get(clientIp);

  if (!record || record.resetAt < now) {
    requestCounts.set(clientIp, {
      count: 1,
      resetAt: now + CONTACT_RATE_LIMIT_WINDOW_MS,
    });
    return true;
  }

  if (record.count >= CONTACT_RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Validates honeypot and rate limit for a contact submission.
 */
export function validateContactSubmission(
  formData: FormData,
  clientIp: string | null
): ContactProtectionResult {
  if (isHoneypotTriggered(formData)) {
    return { allowed: false, reason: "honeypot" };
  }

  if (!checkContactRateLimit(clientIp)) {
    return { allowed: false, reason: "rate_limit" };
  }

  return { allowed: true };
}

/** Honeypot field name for the contact form markup */
export const CONTACT_HONEYPOT_FIELD = HONEYPOT_FIELD;

/** Reset rate-limit state (tests only) */
export function resetContactRateLimitForTests(): void {
  requestCounts.clear();
}
