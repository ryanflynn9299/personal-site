"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import { useQuoteViewStore } from "./store/useQuoteViewStore";
import type { Quote } from "@/app/(portfolio)/quotes/config";

function ViewLoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-slate-400">
      Loading view…
    </div>
  );
}

const MissionControlView = dynamic(
  () =>
    import("./normal/mission-control/MissionControlView").then((mod) => ({
      default: mod.MissionControlView,
    })),
  { loading: () => <ViewLoadingFallback /> }
);

const TesseractView = dynamic(
  () =>
    import("./normal/tesseract/TesseractView").then((mod) => ({
      default: mod.TesseractView,
    })),
  { loading: () => <ViewLoadingFallback />, ssr: false }
);

const ConstellationView = dynamic(
  () =>
    import("./constellation/constellation/ConstellationView").then((mod) => ({
      default: mod.ConstellationView,
    })),
  { loading: () => <ViewLoadingFallback />, ssr: false }
);

const SolarSystemView = dynamic(
  () =>
    import("./constellation/solar-system/SolarSystemView").then((mod) => ({
      default: mod.SolarSystemView,
    })),
  { loading: () => <ViewLoadingFallback />, ssr: false }
);

const HexArrayView = dynamic(
  () =>
    import("./constellation/hex-array/HexArrayView").then((mod) => ({
      default: mod.HexArrayView,
    })),
  { loading: () => <ViewLoadingFallback />, ssr: false }
);

interface QuoteViewRendererProps {
  quotes: Quote[];
}

/**
 * Dynamically renders the correct view component based on the current store state.
 * Maps variant names to their corresponding view components.
 */
export function QuoteViewRenderer({ quotes }: QuoteViewRendererProps) {
  const {
    viewMode,
    activeNormalVariant,
    activeConstellationVariant,
    setIsZoomed,
  } = useQuoteViewStore();

  // Reset zoomed state when view changes
  useEffect(() => {
    setIsZoomed(false);
  }, [viewMode, activeNormalVariant, activeConstellationVariant, setIsZoomed]);

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
