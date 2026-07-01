"use client";

import { Matomo } from "./Matomo";
import { config } from "@/lib/config";

/**
 * Client-side wrapper for Matomo analytics.
 * Renders tracking only when both URL and site ID are configured (see config.matomo.enabled).
 */
export function MatomoProvider() {
  if (!config.matomo.enabled) {
    return null;
  }

  const { url: matomoUrl, siteId } = config.matomo;
  if (!matomoUrl || !siteId) {
    return null;
  }

  return <Matomo matomoUrl={matomoUrl} siteId={siteId} />;
}
