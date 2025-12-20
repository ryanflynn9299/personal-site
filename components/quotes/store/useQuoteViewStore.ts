'use client';

import { create } from 'zustand';
import type {
  ViewMode,
  NormalVariant,
  ConstellationVariant,
} from '@/app/(portfolio)/quotes/config';

interface QuoteViewState {
  viewMode: ViewMode;
  activeNormalVariant: NormalVariant;
  activeConstellationVariant: ConstellationVariant;
  setViewMode: (mode: ViewMode) => void;
  setActiveNormalVariant: (variant: NormalVariant) => void;
  setActiveConstellationVariant: (variant: ConstellationVariant) => void;
}

export const useQuoteViewStore = create<QuoteViewState>((set) => ({
  viewMode: 'normal',
  activeNormalVariant: 'mission_control',
  activeConstellationVariant: 'constellation',
  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveNormalVariant: (variant) => set({ activeNormalVariant: variant }),
  setActiveConstellationVariant: (variant) =>
    set({ activeConstellationVariant: variant }),
}));

