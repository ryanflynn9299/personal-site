"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { env } from "@/lib/env";
import type {
  ViewMode,
  NormalVariant,
  ConstellationVariant,
} from "@/app/(portfolio)/quotes/config";

interface QuoteViewState {
  viewMode: ViewMode;
  activeNormalVariant: NormalVariant;
  activeConstellationVariant: ConstellationVariant;
  hexSurgeEnabled: boolean;
  isZoomed: boolean;
  hexSurgeTriggerCallback: (() => void) | null;
  cometTriggerCallback: (() => void) | null;
  setViewMode: (mode: ViewMode) => void;
  setActiveNormalVariant: (variant: NormalVariant) => void;
  setActiveConstellationVariant: (variant: ConstellationVariant) => void;
  setHexSurgeEnabled: (enabled: boolean) => void;
  setIsZoomed: (zoomed: boolean) => void;
  setHexSurgeTriggerCallback: (callback: (() => void) | null) => void;
  setCometTriggerCallback: (callback: (() => void) | null) => void;
  triggerHexSurge: () => void;
  triggerComet: () => void;
}

// Storage key for localStorage
const STORAGE_KEY = "quote-view-state";

// Default state
const defaultState = {
  viewMode: "normal" as ViewMode,
  activeNormalVariant: "mission_control" as NormalVariant,
  activeConstellationVariant: "constellation" as ConstellationVariant,
  hexSurgeEnabled: true,
  isZoomed: false,
  hexSurgeTriggerCallback: null as (() => void) | null,
  cometTriggerCallback: null as (() => void) | null,
};

// Create a no-op storage for production (doesn't persist)
const noOpStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Check if we should persist state (use dev mode UI toggle)
const getStorage = () => {
  if (typeof window === "undefined") {
    return noOpStorage;
  }
  // Only persist in development modes with dev UI enabled
  return env.devModeUI ? localStorage : noOpStorage;
};

export const useQuoteViewStore = create<QuoteViewState>()(
  persist(
    (set, get) => ({
      ...defaultState,
      triggerHexSurge: () => {
        const state = get();
        if (state.hexSurgeTriggerCallback) {
          state.hexSurgeTriggerCallback();
        }
      },
      triggerComet: () => {
        const state = get();
        if (state.cometTriggerCallback) {
          state.cometTriggerCallback();
        }
      },
      setViewMode: (mode) => set({ viewMode: mode }),
      setActiveNormalVariant: (variant) =>
        set({ activeNormalVariant: variant }),
      setActiveConstellationVariant: (variant) =>
        set({ activeConstellationVariant: variant }),
      setHexSurgeEnabled: (enabled) => set({ hexSurgeEnabled: enabled }),
      setIsZoomed: (zoomed) => set({ isZoomed: zoomed }),
      setHexSurgeTriggerCallback: (callback) =>
        set({ hexSurgeTriggerCallback: callback }),
      setCometTriggerCallback: (callback) =>
        set({ cometTriggerCallback: callback }),
    }),
    {
      name: STORAGE_KEY,
      // Only persist in development environment
      storage: createJSONStorage(() => getStorage()),
      // Only persist these fields (exclude callback functions)
      partialize: (state) => ({
        viewMode: state.viewMode,
        activeNormalVariant: state.activeNormalVariant,
        activeConstellationVariant: state.activeConstellationVariant,
        hexSurgeEnabled: state.hexSurgeEnabled,
      }),
    }
  )
);
