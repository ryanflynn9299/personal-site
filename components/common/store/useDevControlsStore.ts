"use client";

import { create } from "zustand";

// Home page controls
export type HomePageSection =
  | "aboutMe1"
  | "aboutMe2"
  | "projectCarousel"
  | "featuredProjects"
  | "bentoGrid"
  | "techStack"
  | "techStack2"
  | "techStack3"
  | "blogHighlight"
  | "blogHighlight4";

interface HomePageState {
  selectedAboutMe: "aboutMe1" | "aboutMe2";
  selectedProjects: "projectCarousel" | "featuredProjects" | "bentoGrid";
  selectedTechStack: "techStack" | "techStack2" | "techStack3";
  selectedBlogHighlight: "blogHighlight" | "blogHighlight4";
  setSelectedAboutMe: (variant: "aboutMe1" | "aboutMe2") => void;
  setSelectedProjects: (
    variant: "projectCarousel" | "featuredProjects" | "bentoGrid"
  ) => void;
  setSelectedTechStack: (
    variant: "techStack" | "techStack2" | "techStack3"
  ) => void;
  setSelectedBlogHighlight: (
    variant: "blogHighlight" | "blogHighlight4"
  ) => void;
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

// Combined dev controls state
interface DevControlsState extends HomePageState, QuoteViewState {}

export const useDevControlsStore = create<DevControlsState>((set, get) => ({
  // Home page state
  selectedAboutMe: "aboutMe2",
  selectedProjects: "projectCarousel",
  selectedTechStack: "techStack3",
  selectedBlogHighlight: "blogHighlight4",
  setSelectedAboutMe: (variant) => set({ selectedAboutMe: variant }),
  setSelectedProjects: (variant) => set({ selectedProjects: variant }),
  setSelectedTechStack: (variant) => set({ selectedTechStack: variant }),
  setSelectedBlogHighlight: (variant) =>
    set({ selectedBlogHighlight: variant }),

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
  setActiveNormalVariant: (variant) => set({ activeNormalVariant: variant }),
  setActiveConstellationVariant: (variant) =>
    set({ activeConstellationVariant: variant }),
  setHexSurgeEnabled: (enabled) => set({ hexSurgeEnabled: enabled }),
  setHexSurgeTriggerCallback: (callback) =>
    set({ hexSurgeTriggerCallback: callback }),
}));
