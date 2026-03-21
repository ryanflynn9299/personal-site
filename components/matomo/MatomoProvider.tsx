"use client";

import { Matomo } from "./Matomo";
import { config } from "@/lib/config";
import { createLogger } from "@/lib/dev-tooling/logger";

const log = createLogger("ALL");

/**
 * Client-side wrapper for Matomo analytics
 * This allows us to use Matomo in the server component root layout
 */
export function MatomoProvider() {
  const matomoUrl = config.matomo.url;
  const siteId = config.matomo.siteId;

  // Check if Matomo is explicitly disabled or not configured
  // "DISABLED" is the placeholder used in .env.example for intentional disabling
  if (matomoUrl === "DISABLED" || siteId === "DISABLED") {
    // Intentionally disabled, no need to log at all or just debug
    log.debug("Matomo analytics explicitly disabled");
    return null;
  }

  if (!matomoUrl || !siteId) {
    // Log debug about missing Matomo configuration to avoid console spam
    log.debug(
      "Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID"
    );
    return null;
  }

  return <Matomo matomoUrl={matomoUrl} siteId={siteId} />;
}
