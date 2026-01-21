"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { env } from "@/lib/env";
import type {
  ViewMode,
  NormalVariant,
  ConstellationVariant,
} from "@/app/(portfolio)/quotes/config";
import {
  PRODUCTION_QUOTE_CONFIG,
  isVariantAllowedInProduction,
} from "@/app/(portfolio)/quotes/production-config";

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

// Get initial state based on environment
// In production, use production config; otherwise use defaults
const getInitialState = () => {
  const isProduction = env.isProduction;

  return {
    viewMode: "normal" as ViewMode,
    activeNormalVariant: (isProduction
      ? PRODUCTION_QUOTE_CONFIG.normalVariant
      : "mission_control") as NormalVariant,
    activeConstellationVariant: (isProduction
      ? PRODUCTION_QUOTE_CONFIG.constellationVariant
      : "constellation") as ConstellationVariant,
    hexSurgeEnabled: true,
    isZoomed: false,
    hexSurgeTriggerCallback: null as (() => void) | null,
    cometTriggerCallback: null as (() => void) | null,
  };
};

// Default state
const defaultState = getInitialState();

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
    (set, get) => {
      const isProduction = env.isProduction;

      return {
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
        setViewMode: (mode: ViewMode) => {
          // In production, only allow switching between the two configured modes
          // This is allowed since both modes are configured for production
          if (isProduction) {
            // In production, we can switch between normal and constellation
            // but the variants are locked
            set({ viewMode: mode });
          } else {
            // In dev, allow any mode
            set({ viewMode: mode });
          }
        },
        setActiveNormalVariant: (variant: NormalVariant) => {
          // In production, only allow the configured variant
          if (isProduction) {
            if (isVariantAllowedInProduction(variant, "normal")) {
              set({ activeNormalVariant: variant });
            }
            // Silently ignore invalid variants in production
          } else {
            // In dev, allow any variant
            set({ activeNormalVariant: variant });
          }
        },
        setActiveConstellationVariant: (variant: ConstellationVariant) => {
          // In production, only allow the configured variant
          if (isProduction) {
            if (isVariantAllowedInProduction(variant, "constellation")) {
              set({ activeConstellationVariant: variant });
            }
            // Silently ignore invalid variants in production
          } else {
            // In dev, allow any variant
            set({ activeConstellationVariant: variant });
          }
        },
        setHexSurgeEnabled: (enabled: boolean) =>
          set({ hexSurgeEnabled: enabled }),
        setIsZoomed: (zoomed: boolean) => set({ isZoomed: zoomed }),
        setHexSurgeTriggerCallback: (callback: (() => void) | null) =>
          set({ hexSurgeTriggerCallback: callback }),
        setCometTriggerCallback: (callback: (() => void) | null) =>
          set({ cometTriggerCallback: callback }),
      };
    },
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
      // In production, merge persisted state with production config to enforce restrictions
      merge: (persistedState: any, currentState: any) => {
        if (env.isProduction) {
          // Override with production config in production
          return {
            ...currentState,
            ...persistedState,
            activeNormalVariant: PRODUCTION_QUOTE_CONFIG.normalVariant,
            activeConstellationVariant:
              PRODUCTION_QUOTE_CONFIG.constellationVariant,
          };
        }
        // In dev, use persisted state as normal
        return { ...currentState, ...persistedState };
      },
    }
  )
);
