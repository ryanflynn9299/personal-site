"use client";

import { Matomo } from "./Matomo";
import { env } from "@/lib/env";

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
    // Only log in development, and not in test/CI environments
    const shouldLog = env.isDevelopment && !env.isTest;

    if (shouldLog) {
      console.warn(
        "Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID"
      );
    }
    return null;
  }

  return <Matomo matomoUrl={matomoUrl} siteId={siteId} />;
}
