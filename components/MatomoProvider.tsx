"use client";

import { Matomo } from "./Matomo";

/**
 * Client-side wrapper for Matomo analytics
 * This allows us to use Matomo in the server component root layout
 */
export function MatomoProvider() {
  const matomoUrl = process.env.NEXT_PUBLIC_MATOMO_URL;
  const siteId = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;

  // Check if Matomo is explicitly disabled or not configured
  // "DISABLED" is the placeholder used in .env.example for intentional disabling
  if (
    !matomoUrl ||
    !siteId ||
    matomoUrl === "DISABLED" ||
    siteId === "DISABLED"
  ) {
    // Only log in development, and not in test/CI environments
    const shouldLog =
      process.env.NODE_ENV === "development" &&
      !process.env.CI &&
      !process.env.VITEST &&
      !process.env.PLAYWRIGHT_TEST_BASE_URL;

    if (shouldLog) {
      console.info(
        "Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID"
      );
    }
    return null;
  }

  return <Matomo matomoUrl={matomoUrl} siteId={siteId} />;
}
