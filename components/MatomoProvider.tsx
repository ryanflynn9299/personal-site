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
    // Silently fail in production, log warning in development
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Matomo analytics not configured. Set NEXT_PUBLIC_MATOMO_URL and NEXT_PUBLIC_MATOMO_SITE_ID"
      );
    }
    return null;
  }

  return <Matomo matomoUrl={matomoUrl} siteId={siteId} />;
}
