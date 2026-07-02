/**
 * Directus Error Classification
 *
 * Pure utility module for classifying errors from the Directus SDK into
 * actionable types. No dependencies on the Directus client or other service modules.
 *
 * @see .docs/DIRECTUS.md for error handling patterns
 */

/** Discriminated error types for structured error handling */
export type DirectusErrorType =
  | "not_configured"
  | "network_error"
  | "authentication_error"
  | "not_found"
  | "validation_error"
  | "server_error"
  | "unknown_error";

/** Structured error info returned by classifyDirectusError */
export interface DirectusErrorInfo {
  type: DirectusErrorType;
  message: string;
  originalError?: unknown;
  statusCode?: number;
}

/**
 * Classifies a raw error from the Directus SDK into a structured DirectusErrorInfo.
 *
 * Classification priority:
 * 1. HTTP status codes (from SDK error objects with a `status` property)
 * 2. Network errors (from fetch/connection failures)
 * 3. Unknown (fallback)
 */
export function classifyDirectusError(error: unknown): DirectusErrorInfo {
  // 1. Check for HTTP status codes (Directus SDK attaches `status` or `statusCode` to errors)
  if (
    error &&
    typeof error === "object" &&
    ("status" in error || "statusCode" in error)
  ) {
    const statusCode =
      (error as { status?: number; statusCode?: number }).status ||
      (error as { status?: number; statusCode?: number }).statusCode;

    if (statusCode) {
      if (statusCode === 401 || statusCode === 403) {
        return {
          type: "authentication_error",
          message: "Authentication failed when accessing Directus",
          originalError: error,
          statusCode,
        };
      }

      if (statusCode === 404) {
        return {
          type: "not_found",
          message: "Resource not found in Directus",
          originalError: error,
          statusCode,
        };
      }

      if (statusCode === 400 || statusCode === 422) {
        return {
          type: "validation_error",
          message: "Invalid request to Directus",
          originalError: error,
          statusCode,
        };
      }

      if (statusCode >= 500) {
        return {
          type: "server_error",
          message: "Directus server error",
          originalError: error,
          statusCode,
        };
      }
    }
  }

  // 2. Check for network/connection errors
  if (error instanceof Error) {
    const networkPatterns = ["fetch", "network", "ECONNREFUSED", "ETIMEDOUT"];
    if (networkPatterns.some((pattern) => error.message.includes(pattern))) {
      return {
        type: "network_error",
        message: `Network error connecting to Directus: ${error.message}`,
        originalError: error,
      };
    }
  }

  // 3. Fallback: unknown error
  return {
    type: "unknown_error",
    message: error instanceof Error ? error.message : "Unknown error occurred",
    originalError: error,
  };
}
