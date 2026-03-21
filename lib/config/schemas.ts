/**
 * Config Validation Schemas
 *
 * Zod schemas that validate environment variables at startup.
 * Bad values crash immediately with clear error messages instead of
 * silently propagating through the application.
 *
 * This module is the ONLY place that touches `process.env` directly.
 * All other modules consume validated, typed config objects.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Runtime Mode
// ---------------------------------------------------------------------------

export const runtimeModes = [
  "production",
  "live-dev",
  "offline-dev",
  "test",
] as const;

export type RuntimeMode = (typeof runtimeModes)[number];

/**
 * Resolves the runtime mode from environment variables.
 * Priority: RUNTIME_MODE > NODE_ENV=test > NODE_ENV=production > offline-dev
 */
export function resolveRuntimeMode(): RuntimeMode {
  const explicit = process.env.RUNTIME_MODE;
  if (explicit && runtimeModes.includes(explicit as RuntimeMode)) {
    return explicit as RuntimeMode;
  }

  // Auto-detect from test runners
  const isTest =
    process.env.NODE_ENV === "test" ||
    process.env.VITEST === "true" ||
    process.env.PLAYWRIGHT_TEST === "true" ||
    process.env.CI === "true";
  if (isTest) {
    return "test";
  }

  if (process.env.NODE_ENV === "production") {
    return "production";
  }
  return "offline-dev";
}

// ---------------------------------------------------------------------------
// Public Config Schema (Client + Server safe)
// ---------------------------------------------------------------------------

export const publicConfigSchema = z.object({
  runtimeMode: z.enum(runtimeModes),
  previewFeatures: z.boolean(),
  siteUrl: z.string().default("http://localhost:3000"),
  logPrettyPrint: z.boolean(),

  directus: z.object({
    publicUrl: z.string().optional(),
  }),

  matomo: z.object({
    url: z.string().optional(),
    siteId: z.string().optional(),
    enabled: z.boolean(),
  }),
});

export type PublicConfig = z.infer<typeof publicConfigSchema>;

/**
 * Parses public config from `process.env`.
 * Throws with a clear message if validation fails.
 */
export function parsePublicConfig(): PublicConfig {
  const mode = resolveRuntimeMode();

  const raw = {
    runtimeMode: mode,
    previewFeatures:
      process.env.ENABLE_PREVIEW_FEATURES === "true" || mode === "offline-dev",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    logPrettyPrint: process.env.LOG_PRETTY_PRINT === "true",

    directus: {
      publicUrl: process.env.NEXT_PUBLIC_DIRECTUS_URL || undefined,
    },

    matomo: {
      url: process.env.NEXT_PUBLIC_MATOMO_URL || undefined,
      siteId: process.env.NEXT_PUBLIC_MATOMO_SITE_ID || undefined,
      enabled:
        !!process.env.NEXT_PUBLIC_MATOMO_URL &&
        process.env.NEXT_PUBLIC_MATOMO_URL !== "DISABLED",
    },
  };

  const result = publicConfigSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid environment configuration:\n${errors}\n\nCheck your .env file and ensure all required variables are set.`
    );
  }

  return Object.freeze(result.data) as PublicConfig;
}

// ---------------------------------------------------------------------------
// Server Config Schema (Secrets — never reaches client)
// ---------------------------------------------------------------------------

export const serverConfigSchema = z.object({
  directus: z.object({
    internalUrl: z.string().optional(),
    cfTunnelEnabled: z.boolean(),
    cfAccessClientId: z.string().optional(),
    cfAccessClientSecret: z.string().optional(),
  }),

  smtp: z.object({
    host: z.string().optional(),
    port: z.string().optional(),
    from: z.string().optional(),
    to: z.string().optional(),
    user: z.string().optional(),
    pass: z.string().optional(),
  }),

  admin: z.object({
    passcode: z.string().optional(),
    sessionSecret: z.string().optional(),
    requireTailscale: z.boolean(),
  }),

  nodeEnv: z.string().optional(),
  runtimeMode: z.string().optional(),
});

export type ServerConfig = z.infer<typeof serverConfigSchema>;

/**
 * Parses server config from `process.env`.
 * Throws with a clear message if validation fails.
 */
export function parseServerConfig(): ServerConfig {
  const raw = {
    directus: {
      internalUrl: process.env.DIRECTUS_INTERNAL_URL || undefined,
      cfTunnelEnabled: process.env.CF_TUNNEL_ENABLED === "true",
      cfAccessClientId: process.env.CF_ACCESS_CLIENT_ID || undefined,
      cfAccessClientSecret: process.env.CF_ACCESS_CLIENT_SECRET || undefined,
    },

    smtp: {
      host: process.env.SMTP_HOST || undefined,
      port: process.env.SMTP_PORT || undefined,
      from: process.env.SMTP_FROM || undefined,
      to: process.env.SMTP_TO || undefined,
      user: process.env.SMTP_USER || undefined,
      pass: process.env.SMTP_PASS || undefined,
    },

    admin: {
      passcode: process.env.ADMIN_PASSCODE || undefined,
      sessionSecret: process.env.ADMIN_SESSION_SECRET || undefined,
      requireTailscale: process.env.ADMIN_REQUIRE_TAILSCALE === "true",
    },

    nodeEnv: process.env.NODE_ENV || undefined,
    runtimeMode: process.env.RUNTIME_MODE || undefined,
  };

  const result = serverConfigSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid server environment configuration:\n${errors}\n\nCheck your .env file and ensure all server variables are set.`
    );
  }

  return Object.freeze(result.data) as ServerConfig;
}
