/**
 * Public Configuration
 *
 * Safe for both Client Components and Server Components.
 * Contains NO secrets — only public URLs, feature flags, and runtime policies.
 *
 * Usage:
 *   import { config, runtime } from "@/lib/config";
 *
 *   config.runtimeMode      // "production" | "live-dev" | "offline-dev" | "test"
 *   config.directus.publicUrl
 *   config.matomo.enabled
 *
 *   runtime.isProduction    // derived boolean
 *   runtime.connectToServices
 *   runtime.previewFeatures
 *
 * @see .docs/dev/ENV_VARIABLES.md for full variable documentation
 */

import {
  parsePublicConfig,
  type PublicConfig,
  type RuntimeMode,
} from "./schemas";

// ---------------------------------------------------------------------------
// Validated Config
// ---------------------------------------------------------------------------

/**
 * Zod-validated, frozen public configuration object.
 * Crashes at startup if env vars are invalid — no silent failures.
 */
export const config: PublicConfig = parsePublicConfig();

// ---------------------------------------------------------------------------
// Derived Runtime Policies
// ---------------------------------------------------------------------------

/**
 * Runtime policy flags computed once from the validated mode.
 * These replace the scattered `env.isProduction`, `env.connectToServices`, etc.
 */
export const runtime = {
  /** Current runtime mode */
  mode: config.runtimeMode,

  /** True when running in production deployment */
  isProduction: config.runtimeMode === "production",

  /** True in live-dev or offline-dev */
  isDevelopment:
    config.runtimeMode === "live-dev" || config.runtimeMode === "offline-dev",

  /** True in live-dev mode specifically */
  isLiveDev: config.runtimeMode === "live-dev",

  /** True in offline-dev mode specifically */
  isOfflineDev: config.runtimeMode === "offline-dev",

  /** True when running in test context */
  isTest: config.runtimeMode === "test",

  /** Whether external services (Directus, SMTP) should be called */
  connectToServices:
    config.runtimeMode === "production" || config.runtimeMode === "live-dev",

  /** Whether service errors should be treated as real failures */
  treatServiceErrorsAsReal:
    config.runtimeMode === "production" || config.runtimeMode === "live-dev",

  /** Whether unreleased preview features should be visible */
  previewFeatures: config.previewFeatures,
} as const;

// ---------------------------------------------------------------------------
// Service Configuration Helpers
// ---------------------------------------------------------------------------

/** Placeholder patterns that indicate an env var is not actually configured */
const PLACEHOLDER_PATTERNS = [
  "your-",
  "example.com",
  "DISABLED",
  "ps-directus:8055",
  "localhost:8055",
];

/**
 * Checks if a URL is genuinely configured (not a placeholder or empty).
 */
export function isServiceUrlConfigured(url: string | undefined): boolean {
  if (!url || url.trim() === "") {
    return false;
  }
  return !PLACEHOLDER_PATTERNS.some((pattern) => url.includes(pattern));
}

/**
 * Checks if Directus is configured and services are enabled.
 */
export function isDirectusConfigured(): boolean {
  if (!runtime.connectToServices) {
    return false;
  }
  return isServiceUrlConfigured(config.directus.publicUrl);
}

/**
 * Returns the Directus public URL, or null if not configured.
 */
export function getDirectusUrl(): string | null {
  if (!isServiceUrlConfigured(config.directus.publicUrl)) {
    return null;
  }
  return config.directus.publicUrl || null;
}

// ---------------------------------------------------------------------------
// Re-exports
// ---------------------------------------------------------------------------

export type { RuntimeMode, PublicConfig };
