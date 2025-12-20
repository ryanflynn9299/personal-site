'use client';

import { useQuoteViewStore } from './store/useQuoteViewStore';
import type { Quote } from '@/app/(portfolio)/quotes/config';
import { MissionControlView } from './normal/mission-control/MissionControlView';
import { HyperCompassView } from './normal/hyper-compass/HyperCompassView';
import { JewelBoxView } from './constellation/jewel-box/JewelBoxView';
import { ChromaticOrreryView } from './constellation/chromatic-orrery/ChromaticOrreryView';
import { DarkHullView } from './constellation/dark-hull/DarkHullView';

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
  if (viewMode === 'normal') {
    switch (activeNormalVariant) {
      case 'mission_control':
        return <MissionControlView quotes={quotes} />;
      case 'hyper_compass':
        return <HyperCompassView quotes={quotes} />;
      default:
        return <MissionControlView quotes={quotes} />;
    }
  }

  // Constellation mode variants
  // Note: Mapping folder names to variant types
  // 'constellation' -> jewel-box, 'solar_system' -> chromatic-orrery, 'hex_grid' -> dark-hull
  switch (activeConstellationVariant) {
    case 'constellation':
      return <JewelBoxView quotes={quotes} />;
    case 'solar_system':
      return <ChromaticOrreryView quotes={quotes} />;
    case 'hex_grid':
      return <DarkHullView quotes={quotes} />;
    default:
      return <JewelBoxView quotes={quotes} />;
  }
}

