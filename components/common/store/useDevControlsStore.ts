import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { runtime } from "@/lib/config";
import { isFeatureEnabled } from "@/lib/dev-tooling/features";

// Home page controls
export type HomePageSection =
  | "aboutMe"
  | "projectCarousel"
  | "techStack3"
  | "techStack4"
  | "blogHighlight"
  | "valuesGridFlat"
  | "valuesGridPremium"
  | "ctaPremium"
  | "ctaFlat";

interface HomePageState {
  selectedAboutMe: "aboutMe";
  selectedProjects: "projectCarousel";
  isTechStackPremium: boolean;
  selectedBlogHighlight: "blogHighlight";
  selectedAboutValuesGrid: "valuesGridFlat" | "valuesGridPremium";
  selectedAboutCTA: "ctaPremium" | "ctaFlat";
  setSelectedAboutMe: (variant: "aboutMe") => void;
  setSelectedProjects: (variant: "projectCarousel") => void;
  setTechStackPremium: (enabled: boolean) => void;
  setSelectedBlogHighlight: (variant: "blogHighlight") => void;
  setSelectedAboutValuesGrid: (
    variant: "valuesGridFlat" | "valuesGridPremium"
  ) => void;
  setSelectedAboutCTA: (variant: "ctaPremium" | "ctaFlat") => void;
}

// Quotes page controls (from existing store)
interface QuoteViewState {
  viewMode: "normal" | "constellation";
  activeNormalVariant: "mission_control" | "tesseract";
  activeConstellationVariant: "constellation" | "solar_system" | "hex_array";
  hexSurgeEnabled: boolean;
  hexSurgeTriggerCallback: (() => void) | null;
  setViewMode: (mode: "normal" | "constellation") => void;
  setActiveNormalVariant: (variant: "mission_control" | "tesseract") => void;
  setActiveConstellationVariant: (
    variant: "constellation" | "solar_system" | "hex_array"
  ) => void;
  setHexSurgeEnabled: (enabled: boolean) => void;
  setHexSurgeTriggerCallback: (callback: (() => void) | null) => void;
  triggerHexSurge: () => void;
}

// Global UI visibility state
interface DevUIState {
  showDevControls: boolean;
  setShowDevControls: (show: boolean) => void;
}

// Combined dev controls state
interface DevControlsState extends HomePageState, QuoteViewState, DevUIState {}

// Storage key for localStorage
const STORAGE_KEY = "dev-controls-state";

// Create a no-op storage for production (doesn't persist)
const noOpStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

// Check if we should persist state
const getStorage = () => {
  if (typeof window === "undefined") {
    return noOpStorage;
  }
  // Only persist in development modes
  return runtime.isDevelopment ? localStorage : noOpStorage;
};

export const useDevControlsStore = create<DevControlsState>()(
  persist(
    (set, get) => ({
      // Global UI state
      showDevControls: true,
      setShowDevControls: (show) => set({ showDevControls: show }),

      // Home page state
      selectedAboutMe: "aboutMe",
      selectedProjects: "projectCarousel",
      isTechStackPremium: isFeatureEnabled("techStackPremium"),
      selectedBlogHighlight: "blogHighlight",
      selectedAboutValuesGrid: "valuesGridFlat",
      selectedAboutCTA: "ctaPremium",
      setSelectedAboutMe: (variant) => set({ selectedAboutMe: variant }),
      setSelectedProjects: (variant) => set({ selectedProjects: variant }),
      setTechStackPremium: (enabled) => set({ isTechStackPremium: enabled }),
      setSelectedBlogHighlight: (variant) =>
        set({ selectedBlogHighlight: variant }),
      setSelectedAboutValuesGrid: (variant) =>
        set({ selectedAboutValuesGrid: variant }),
      setSelectedAboutCTA: (variant) => set({ selectedAboutCTA: variant }),

      // Quotes page state
      viewMode: "normal",
      activeNormalVariant: "mission_control",
      activeConstellationVariant: "constellation",
      hexSurgeEnabled: true,
      hexSurgeTriggerCallback: null,
      triggerHexSurge: () => {
        const state = get();
        if (state.hexSurgeTriggerCallback) {
          state.hexSurgeTriggerCallback();
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
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => getStorage()),
      // Only persist these fields
      partialize: (state) => ({
        showDevControls: state.showDevControls,
        selectedAboutMe: state.selectedAboutMe,
        selectedProjects: state.selectedProjects,
        isTechStackPremium: state.isTechStackPremium,
        selectedAboutValuesGrid: state.selectedAboutValuesGrid,
        selectedAboutCTA: state.selectedAboutCTA,
        viewMode: state.viewMode,
        activeNormalVariant: state.activeNormalVariant,
        activeConstellationVariant: state.activeConstellationVariant,
        hexSurgeEnabled: state.hexSurgeEnabled,
      }),
    }
  )
);
