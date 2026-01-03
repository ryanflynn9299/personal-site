"use client";

import { useEffect } from "react";
import { useQuoteViewStore } from "./store/useQuoteViewStore";
import { env } from "@/lib/env";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { MissionControlView } from "./normal/mission-control/MissionControlView";
import { TesseractView } from "./normal/tesseract/TesseractView";
import { ConstellationView } from "./constellation/constellation/ConstellationView";
import { SolarSystemView } from "./constellation/solar-system/SolarSystemView";
import { HexArrayView } from "./constellation/hex-array/HexArrayView";
import {
  PRODUCTION_QUOTE_CONFIG,
  isVariantAllowedInProduction,
} from "@/app/(portfolio)/quotes/production-config";

interface QuoteViewRendererProps {
  quotes: Quote[];
}

/**
 * Dynamically renders the correct view component based on the current store state.
 * Maps variant names to their corresponding view components.
 *
 * In production, enforces the production config to ensure only configured variants are rendered.
 */
export function QuoteViewRenderer({ quotes }: QuoteViewRendererProps) {
  const {
    viewMode,
    activeNormalVariant,
    activeConstellationVariant,
    setIsZoomed,
  } = useQuoteViewStore();

  const isProduction = env.isProduction;

  // Reset zoomed state when view changes
  useEffect(() => {
    setIsZoomed(false);
  }, [viewMode, activeNormalVariant, activeConstellationVariant, setIsZoomed]);

  // In production, validate and enforce production config
  // This is a safety measure in case the store somehow gets an invalid state
  let effectiveNormalVariant = activeNormalVariant;
  let effectiveConstellationVariant = activeConstellationVariant;

  if (isProduction) {
    // Ensure we're using the production variant for normal mode
    if (
      viewMode === "normal" &&
      !isVariantAllowedInProduction(activeNormalVariant, "normal")
    ) {
      effectiveNormalVariant = PRODUCTION_QUOTE_CONFIG.normalVariant;
    }
    // Ensure we're using the production variant for constellation mode
    if (
      viewMode === "constellation" &&
      !isVariantAllowedInProduction(activeConstellationVariant, "constellation")
    ) {
      effectiveConstellationVariant =
        PRODUCTION_QUOTE_CONFIG.constellationVariant;
    }
  }

  // Normal mode variants
  if (viewMode === "normal") {
    switch (effectiveNormalVariant) {
      case "mission_control":
        return <MissionControlView quotes={quotes} />;
      case "tesseract":
        return <TesseractView quotes={quotes} />;
      default:
        // Fallback to production config in production, or mission_control in dev
        return isProduction ? (
          PRODUCTION_QUOTE_CONFIG.normalVariant === "mission_control" ? (
            <MissionControlView quotes={quotes} />
          ) : (
            <TesseractView quotes={quotes} />
          )
        ) : (
          <MissionControlView quotes={quotes} />
        );
    }
  }

  // Constellation mode variants
  switch (effectiveConstellationVariant) {
    case "constellation":
      return <ConstellationView quotes={quotes} />;
    case "solar_system":
      return <SolarSystemView quotes={quotes} />;
    case "hex_array":
      return <HexArrayView quotes={quotes} />;
    default:
      // Fallback to production config in production, or constellation in dev
      return isProduction ? (
        PRODUCTION_QUOTE_CONFIG.constellationVariant === "constellation" ? (
          <ConstellationView quotes={quotes} />
        ) : PRODUCTION_QUOTE_CONFIG.constellationVariant === "solar_system" ? (
          <SolarSystemView quotes={quotes} />
        ) : (
          <HexArrayView quotes={quotes} />
        )
      ) : (
        <ConstellationView quotes={quotes} />
      );
  }
}
