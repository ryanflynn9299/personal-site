"use client";

import { useQuoteViewStore } from "./store/useQuoteViewStore";
import type { Quote } from "@/app/(portfolio)/quotes/config";
import { MissionControlView } from "./normal/mission-control/MissionControlView";
import { TesseractView } from "./normal/tesseract/TesseractView";
import { ConstellationView } from "./constellation/constellation/ConstellationView";
import { SolarSystemView } from "./constellation/solar-system/SolarSystemView";
import { HexArrayView } from "./constellation/hex-array/HexArrayView";

interface QuoteViewRendererProps {
  quotes: Quote[];
}

/**
 * Dynamically renders the correct view component based on the current store state.
 * Maps variant names to their corresponding view components.
 */
export function QuoteViewRenderer({ quotes }: QuoteViewRendererProps) {
  const { viewMode, activeNormalVariant, activeConstellationVariant } =
    useQuoteViewStore();

  // Normal mode variants
  if (viewMode === "normal") {
    switch (activeNormalVariant) {
      case "mission_control":
        return <MissionControlView quotes={quotes} />;
      case "tesseract":
        return <TesseractView quotes={quotes} />;
      default:
        return <MissionControlView quotes={quotes} />;
    }
  }

  // Constellation mode variants
  switch (activeConstellationVariant) {
    case "constellation":
      return <ConstellationView quotes={quotes} />;
    case "solar_system":
      return <SolarSystemView quotes={quotes} />;
    case "hex_array":
      return <HexArrayView quotes={quotes} />;
    default:
      return <ConstellationView quotes={quotes} />;
  }
}
