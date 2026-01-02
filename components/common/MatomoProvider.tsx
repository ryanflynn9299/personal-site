"use client";

import { Matomo } from "./Matomo";
import { env } from "@/lib/env";
import { createLogger } from "@/lib/logger";

const log = createLogger("ALL");

/**
 * Client-side wrapper for Matomo analytics
 * This allows us to use Matomo in the server component root layout
 */
export function MatomoProvider() {
  const matomoUrl = env.matomo.url;
  const siteId = env.matomo.siteId;

  // Check if Matomo is explicitly disabled or not configured
  // "DISABLED" is the placeholder used in .env.example for intentional disabling
  if (
    !matomoUrl ||
    !siteId ||
    matomoUrl === "DISABLED" ||
    siteId === "DISABLED"
  ) {
    // Log warning about missing Matomo configuration
    log.warn(
      "Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID"
    );
    return null;
  }

  return <Matomo matomoUrl={matomoUrl} siteId={siteId} />;
}
