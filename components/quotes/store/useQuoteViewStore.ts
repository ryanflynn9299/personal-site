"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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
  hexSurgeTriggerCallback: (() => void) | null;
  cometTriggerCallback: (() => void) | null;
  setViewMode: (mode: ViewMode) => void;
  setActiveNormalVariant: (variant: NormalVariant) => void;
  setActiveConstellationVariant: (variant: ConstellationVariant) => void;
  setHexSurgeEnabled: (enabled: boolean) => void;
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
  hexSurgeTriggerCallback: null as (() => void) | null,
  cometTriggerCallback: null as (() => void) | null,
};

// Create a no-op storage for production (doesn't persist)
const noOpStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Check if we're in development environment (at runtime)
const getStorage = () => {
  if (typeof window === "undefined") return noOpStorage;
  const isDev = process.env.NODE_ENV === "development";
  return isDev ? localStorage : noOpStorage;
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
