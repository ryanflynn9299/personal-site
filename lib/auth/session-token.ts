/**
 * Admin Session Tokens
 *
 * Signed, expiring session tokens for the admin dashboard. The cookie stores
 * an HMAC-SHA256 token derived from ADMIN_SESSION_SECRET — never the secret
 * itself — so a leaked cookie cannot be replayed after expiry and the
 * long-lived secret never leaves the server.
 *
 * Token format: `<expiresAtMs>.<hmacSha256Hex(secret, expiresAtMs)>`
 *
 * Uses only the Web Crypto API so it runs in both the Node.js runtime
 * (server actions) and the Edge runtime (middleware). Do NOT import
 * `server-only` or Node built-ins here.
 *
 * @see .docs/dev/ADMIN_ACCESS.md
 */

export const SESSION_COOKIE_NAME = "admin_session";

/** Session lifetime: 24 hours */
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24;

const encoder = new TextEncoder();

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  return bufferToHex(signature);
}

function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Constant-time string comparison. Avoids leaking the position of the first
 * mismatching character through response timing.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Creates a signed session token that expires after SESSION_MAX_AGE_SECONDS.
 */
export async function createSessionToken(
  secret: string,
  nowMs: number = Date.now()
): Promise<string> {
  const expiresAt = String(nowMs + SESSION_MAX_AGE_SECONDS * 1000);
  const signature = await hmacSha256Hex(secret, expiresAt);
  return `${expiresAt}.${signature}`;
}

/**
 * Verifies a session token: signature must match and expiry must be in the
 * future. Returns false for missing, malformed, tampered, or expired tokens.
 */
export async function verifySessionToken(
  secret: string | undefined,
  token: string | undefined
): Promise<boolean> {
  if (!secret || !token) {
    return false;
  }

  const separatorIndex = token.indexOf(".");
  if (separatorIndex <= 0) {
    return false;
  }

  const payload = token.slice(0, separatorIndex);
  const signature = token.slice(separatorIndex + 1);

  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return false;
  }

  const expected = await hmacSha256Hex(secret, payload);
  return timingSafeEqual(signature, expected);
}

/**
 * Constant-time equality check for secrets (e.g. passcodes). Both values are
 * hashed first so length differences do not short-circuit the comparison.
 */
export async function secretsEqual(
  provided: string,
  expected: string
): Promise<boolean> {
  const [providedHash, expectedHash] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(provided)),
    crypto.subtle.digest("SHA-256", encoder.encode(expected)),
  ]);
  return timingSafeEqual(bufferToHex(providedHash), bufferToHex(expectedHash));
}
