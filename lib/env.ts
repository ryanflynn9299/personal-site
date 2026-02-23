/**
 * Environment Variable Configuration System
 *
 * This module provides a centralized, type-safe way to access environment variables
 * and determine application behavior across different modes:
 *
 * 1. Production - .env with live secrets for docker stack on home server
 * 2. Live Dev - .env is live but frontend on different computer, should mirror production
 * 3. Offline Dev - no services connected, pure frontend development
 * 4. Test - e2e/unit tests should never access services, easy test context
 *
 * Additionally, DEV_MODE_UI is a separate toggle for UI features (unreleased features)
 * that can be enabled/disabled independently of service connectivity.
 */

/**
 * Application modes
 */
export type AppMode = "production" | "live-dev" | "offline-dev" | "test";

/**
 * Determines the current application mode based on environment variables.
 * Priority order:
 * 1. Explicit APP_MODE env var
 * 2. NODE_ENV=test -> test mode
 * 3. NODE_ENV=production -> production mode
 * 4. Default: offline-dev (safest for development)
 */
function getAppMode(): AppMode {
  // Explicit mode override (highest priority)
  const explicitMode = process.env.APP_MODE;
  if (
    explicitMode === "production" ||
    explicitMode === "live-dev" ||
    explicitMode === "offline-dev" ||
    explicitMode === "test"
  ) {
    return explicitMode;
  }

  // Test mode detection (multiple indicators)
  const isTest =
    process.env.NODE_ENV === "test" ||
    process.env.VITEST === "true" ||
    process.env.PLAYWRIGHT_TEST === "true" ||
    process.env.NEXT_PUBLIC_PLAYWRIGHT_TEST === "true" ||
    process.env.CI === "true";

  if (isTest) {
    return "test";
  }

  // Production mode
  if (process.env.NODE_ENV === "production") {
    return "production";
  }

  // Default: offline-dev (safest default for development)
  return "offline-dev";
}

/**
 * Determines if dev mode UI features should be enabled.
 * This is separate from service connectivity and allows toggling unreleased features.
 *
 * Policy:
 * - Production: Always disabled
 * - Live-dev: Enabled by default (dev mode), can be disabled via DEV_MODE_UI=false
 * - Offline-dev: Enabled by default (dev mode), can be disabled via DEV_MODE_UI=false
 * - Test: Always disabled
 */
function getDevModeUI(): boolean {
  const appMode = getAppMode();

  // Never enable in production or test
  if (appMode === "production" || appMode === "test") {
    return false;
  }

  // In dev modes (live-dev, offline-dev), default to true unless explicitly disabled
  const explicitDevMode = process.env.DEV_MODE_UI;
  if (explicitDevMode === "false") {
    return false;
  }

  // Default: true in dev modes
  return true;
}

/**
 * Determines if services (Directus, SMTP, etc.) should be connected.
 *
 * Policy:
 * - production: Services MUST be configured and connected (errors are real errors)
 * - live-dev: Services MUST be configured and connected (behaves like production)
 * - offline-dev: Services are IGNORED - no service calls made regardless of .env
 * - test: Services are disabled - no service calls made
 */
function shouldConnectToServices(): boolean {
  const appMode = getAppMode();
  // Only production and live-dev connect to services
  // offline-dev and test make NO service calls
  return appMode === "production" || appMode === "live-dev";
}

/**
 * Determines if service errors should be treated as genuine errors.
 * In production and live-dev, services are expected to be configured properly.
 * Service connection failures are real errors that should be logged and shown in UI.
 */
export function shouldTreatServiceErrorsAsReal(): boolean {
  const appMode = getAppMode();
  return appMode === "production" || appMode === "live-dev";
}

/**
 * Environment configuration object
 * Provides type-safe access to all environment-related settings
 */
export const env = {
  /**
   * Current application mode
   */
  get mode(): AppMode {
    return getAppMode();
  },

  /**
   * Whether dev mode UI features are enabled
   */
  get devModeUI(): boolean {
    return getDevModeUI();
  },

  /**
   * Whether services should be connected
   */
  get connectToServices(): boolean {
    return shouldConnectToServices();
  },

  /**
   * Whether we're in production mode
   */
  get isProduction(): boolean {
    return this.mode === "production";
  },

  /**
   * Whether we're in test mode
   */
  get isTest(): boolean {
    return this.mode === "test";
  },

  /**
   * Whether we're in development (any dev mode)
   */
  get isDevelopment(): boolean {
    return this.mode === "live-dev" || this.mode === "offline-dev";
  },

  /**
   * Whether we're in live dev mode (services enabled)
   */
  get isLiveDev(): boolean {
    return this.mode === "live-dev";
  },

  /**
   * Whether we're in offline dev mode (services disabled)
   */
  get isOfflineDev(): boolean {
    return this.mode === "offline-dev";
  },

  /**
   * Whether service errors should be treated as genuine errors
   * (production and live-dev expect services to be configured)
   */
  get treatServiceErrorsAsReal(): boolean {
    return shouldTreatServiceErrorsAsReal();
  },

  /**
   * Directus configuration
   */
  directus: {
    serverUrl: process.env.DIRECTUS_URL_SERVER_SIDE,
    publicUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL,
    useCloudflareTunnel: process.env.USE_CLOUDFLARE_TUNNEL === "true",
    cloudflareClientId: process.env.CF_ACCESS_CLIENT_ID,
    cloudflareClientSecret: process.env.CF_ACCESS_CLIENT_SECRET,
  },

  /**
   * SMTP configuration
   */
  smtp: {
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    from: process.env.SMTP_FROM,
    to: process.env.SMTP_TO,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  /**
   * Matomo analytics configuration
   */
  matomo: {
    url: process.env.NEXT_PUBLIC_MATOMO_URL,
    siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID,
  },

  /**
   * Site URL
   */
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://www.ryanflynn.org",

  /**
   * Logger configuration
   */
  logger: {
    enablePinoPretty: process.env.ENABLE_PINO_PRETTY === "true",
  },
} as const;

/**
 * Helper to check if a service URL is configured (not placeholder)
 */
function isServiceUrlConfigured(url: string | undefined): boolean {
  if (!url || url.trim() === "") {
    return false;
  }

  // Check for placeholder patterns
  const placeholderPatterns = [
    "your-",
    "localhost",
    "example.com",
    "http://ps-directus:8055", // Default placeholder
    "http://localhost:8055", // Default placeholder
    "DISABLED",
  ];

  return !placeholderPatterns.some((pattern) => url.includes(pattern));
}

/**
 * Check if Directus is configured and should be used
 *
 * Policy:
 * - offline-dev/test: Always returns false (services disabled, no checks made)
 * - production/live-dev: Returns true only if properly configured
 */
export function isDirectusEnabled(): boolean {
  // If services are disabled (offline-dev/test), return false immediately
  // Do NOT check env variables at all - they are ignored
  if (!env.connectToServices) {
    return false;
  }

  // Only check URLs if services should be connected (production/live-dev)
  const hasServerUrl = isServiceUrlConfigured(env.directus.serverUrl);
  const hasPublicUrl = isServiceUrlConfigured(env.directus.publicUrl);

  // If Cloudflare tunnel is enabled, we also need the access credentials
  if (env.directus.useCloudflareTunnel && env.mode === "live-dev") {
    const hasClientId = !!env.directus.cloudflareClientId;
    const hasClientSecret = !!env.directus.cloudflareClientSecret;
    return hasServerUrl && hasPublicUrl && hasClientId && hasClientSecret;
  }

  return hasServerUrl && hasPublicUrl;
}

/**
 * Check if email service is configured and should be used
 *
 * Policy:
 * - offline-dev/test: Always returns false (services disabled, no checks made)
 * - production/live-dev: Returns true only if properly configured
 */
export function isEmailServiceEnabled(): boolean {
  // If services are disabled (offline-dev/test), return false immediately
  // Do NOT check env variables at all - they are ignored
  if (!env.connectToServices) {
    return false;
  }

  // Only check SMTP config if services should be connected (production/live-dev)
  const { host, port, from, to } = env.smtp;

  // Check if all required variables are set and not placeholders
  const hasHost = isServiceUrlConfigured(host);
  const hasPort = port && !isNaN(Number(port)) && Number(port) > 0;
  const hasFrom =
    from &&
    from.includes("@") &&
    !from.includes("your-") &&
    from !== "contact@example.com";
  const hasTo =
    to &&
    to.includes("@") &&
    !to.includes("your-") &&
    to !== "your-email@example.com";

  return !!(hasHost && hasPort && hasFrom && hasTo);
}

/**
 * Get Directus URL for current context (server or client)
 *
 * Policy:
 * - offline-dev/test: Always returns null (no service calls)
 * - production/live-dev: Returns URL if configured, null otherwise
 */
export function getDirectusUrl(): string | null {
  // If services are disabled (offline-dev/test), return null immediately
  // Do NOT check configuration - services are ignored
  if (!env.connectToServices) {
    return null;
  }

  // If Directus is not enabled, return null
  if (!isDirectusEnabled()) {
    return null;
  }

  // Server-side
  if (typeof window === "undefined") {
    return env.directus.serverUrl || null;
  }

  // Client-side
  return env.directus.publicUrl || null;
}

/**
 * Debug helper: Get current environment configuration summary
 * Useful for debugging and understanding current mode
 */
export function getEnvSummary() {
  return {
    mode: env.mode,
    devModeUI: env.devModeUI,
    connectToServices: env.connectToServices,
    directusEnabled: isDirectusEnabled(),
    emailEnabled: isEmailServiceEnabled(),
    nodeEnv: process.env.NODE_ENV,
    explicitAppMode: process.env.APP_MODE,
    explicitDevModeUI: process.env.DEV_MODE_UI,
  };
}
