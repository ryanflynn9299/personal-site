/**
 * Directus Client Initialization
 *
 * Singleton module responsible for creating and exposing the Directus SDK client.
 * Handles environment-aware initialization, Cloudflare Access tunnel headers,
 * and provides the `isDirectusConfigured` check used throughout the app.
 *
 * This is the ONLY module that interacts with the Directus SDK's `createDirectus`.
 * All other modules access Directus through the client exported here.
 *
 * @see .docs/DIRECTUS.md for architecture overview
 */

import { createDirectus, rest, type RestClient } from "@directus/sdk";
import type { DirectusSchema } from "@/types/directus";
import { createLogger } from "@/lib/dev-tooling/logger";
import {
  isDirectusConfigured as isDirectusEnabled,
  getDirectusUrl as getDirectusUrlFromConfig,
  config,
  runtime,
} from "@/lib/config";
import { serverConfig } from "@/lib/config/server";

const log = createLogger("ALL");

// ---------------------------------------------------------------------------
// Configuration Checks
// ---------------------------------------------------------------------------

/**
 * Checks if Directus is configured and available for the current environment.
 *
 * - **production / live-dev**: Directus MUST be configured. Returns false + logs error if not.
 * - **offline-dev / test**: Always returns false (services are disabled, no calls are made).
 */
export function isDirectusConfigured(): boolean {
  if (!runtime.connectToServices) {
    return false;
  }

  const enabled = isDirectusEnabled();

  if (runtime.treatServiceErrorsAsReal && !enabled) {
    log.error(
      {
        mode: runtime.mode,
        serverUrl: serverConfig.directus.internalUrl,
        publicUrl: config.directus.publicUrl,
      },
      "Directus is not configured but is required in production/live-dev mode"
    );
  }

  return enabled;
}

/**
 * Returns the Directus URL for the current environment, or null if unconfigured.
 */
export const getDirectusUrl = (): string | null => {
  return getDirectusUrlFromConfig();
};

/**
 * Builds a public asset URL from a Directus file ID.
 * Always uses the public URL since asset URLs are consumed by the browser.
 *
 * @param fileId - The Directus file ID
 * @returns Full public URL to the asset, or null if unconfigured
 */
export function getAssetUrl(fileId: string | null | undefined): string | null {
  if (!fileId) {
    return null;
  }

  const publicUrl = getDirectusUrlFromConfig();
  if (!publicUrl) {
    log.error(
      { fileId },
      "Cannot create asset URL: Directus is not configured or services are disabled"
    );
    return null;
  }

  return `${publicUrl}/assets/${fileId}`;
}

// ---------------------------------------------------------------------------
// Client Initialization (Singleton)
// ---------------------------------------------------------------------------

/**
 * The Directus REST client instance.
 *
 * The Directus SDK's generic typing for composed clients (rest + auth + etc.)
 * produces deeply nested conditional types that are impractical to express
 * statically. We type this as `RestClient<DirectusSchema>` for the best
 * balance of type safety and practicality — callers get typed collection
 * access without fighting SDK internals.
 */
let directusClient: RestClient<DirectusSchema> | null = null;

try {
  if (runtime.connectToServices) {
    const url = getDirectusUrl();

    if (url) {
      const isDevMode = runtime.mode === "live-dev";
      const useTunnel = serverConfig.directus.cfTunnelEnabled && isDevMode;

      if (useTunnel) {
        log.info(
          { clientId: serverConfig.directus.cfAccessClientId },
          "Initializing Directus with Cloudflare Access headers"
        );

        directusClient = createDirectus<DirectusSchema>(url, {
          globals: {
            fetch: createCloudflareFetch(),
          },
        }).with(rest()) as unknown as RestClient<DirectusSchema>;
      } else {
        directusClient = createDirectus<DirectusSchema>(url).with(
          rest()
        ) as unknown as RestClient<DirectusSchema>;
      }
    } else if (runtime.treatServiceErrorsAsReal) {
      log.error(
        {
          mode: runtime.mode,
          serverUrl: serverConfig.directus.internalUrl,
          publicUrl: config.directus.publicUrl,
        },
        "CRITICAL: Directus URL not available but required in production/live-dev mode"
      );
    }
  }
} catch (error) {
  if (runtime.treatServiceErrorsAsReal) {
    log.error(
      { error, mode: runtime.mode, url: getDirectusUrl() },
      "CRITICAL: Failed to initialize Directus client in production/live-dev mode"
    );
  } else {
    log.error(
      { error, url: getDirectusUrl() },
      "Failed to initialize Directus client"
    );
  }
  directusClient = null;
}

/**
 * Returns the initialized Directus client, or null if services are disabled.
 */
export function getDirectusClient(): RestClient<DirectusSchema> | null {
  return directusClient;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Creates a custom fetch function that injects Cloudflare Access headers.
 * Used only when `CF_TUNNEL_ENABLED=true` in live-dev mode.
 */
function createCloudflareFetch(): typeof fetch {
  return (input: RequestInfo | URL, init?: RequestInit) => {
    const headers = new Headers(init?.headers);

    if (serverConfig.directus.cfAccessClientId) {
      headers.set(
        "CF-Access-Client-Id",
        serverConfig.directus.cfAccessClientId
      );
    }
    if (serverConfig.directus.cfAccessClientSecret) {
      headers.set(
        "CF-Access-Client-Secret",
        serverConfig.directus.cfAccessClientSecret
      );
    }

    return fetch(input, { ...init, headers });
  };
}
