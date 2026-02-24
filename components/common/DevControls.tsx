"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";
import { useQuoteViewStore } from "@/components/quotes/store/useQuoteViewStore";
import { useDevControlsStore } from "./store/useDevControlsStore";
import { env } from "@/lib/env";
import type {
  NormalVariant,
  ConstellationVariant,
} from "@/app/(portfolio)/quotes/config";

/**
 * Global Dev Controls Component
 *
 * Route-aware component that shows different controls based on the current page.
 * Available on all pages for testing and development features.
 * Features collapsible functionality with premium glassmorphic styling.
 */
export function DevControls() {
  const pathname = usePathname();
  // Default to true so it is hidden on load
  const [isCollapsed, setIsCollapsed] = useState(true);

  // Only show if dev mode UI is enabled and not in test mode
  if (!env.devModeUI || env.isTest) {
    return null;
  }

  // Route-specific controls
  let ControlsComponent: React.ComponentType | null = null;
  let title = "";

  if (pathname === "/quotes") {
    ControlsComponent = QuotesControls;
    title = "View Controls";
  } else if (pathname === "/") {
    ControlsComponent = HomePageControls;
    title = "Home Controls";
  }

  // No controls for this route
  if (!ControlsComponent) {
    return null;
  }

  return (
    <CollapsibleControls
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      title={title}
    >
      <ControlsComponent />
    </CollapsibleControls>
  );
}

/**
 * Collapsible Controls Wrapper
 * Provides premium collapse/expand functionality with fluid glassmorphism
 */
function CollapsibleControls({
  isCollapsed,
  onToggle,
  title,
  children,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 w-[300px]"
      initial={false}
      layout
      style={{
        pointerEvents: isCollapsed ? "none" : "auto",
      }}
    >
      <motion.div
        layout
        className="w-full relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl shadow-2xl ring-1 ring-white/5"
        animate={{ scale: 1 }}
        transition={{
          layout: { type: "spring", stiffness: 400, damping: 30 },
          duration: 0.3,
        }}
      >
        {/* Subtle accent gradient peeking from the top edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />

        <AnimatePresence mode="popLayout" initial={false}>
          {isCollapsed ? (
            // Collapsed state: Elegant floating action bar
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, padding: "0.75rem 1.25rem" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                onClick={onToggle}
                className="group flex w-full items-center justify-between transition-all"
                aria-label="Expand controls"
                style={{ pointerEvents: "auto" }}
              >
                <div className="flex items-center gap-2 text-slate-300 group-hover:text-white transition-colors">
                  <Sparkles className="h-4 w-4 text-sky-400 group-hover:text-sky-300 transition-colors" />
                  <span className="text-xs font-medium font-inter tracking-wide">
                    {title}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: 180 }}
                  className="rounded-full bg-white/5 p-1 group-hover:bg-white/10 transition-colors"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <ChevronDown className="h-4 w-4 text-slate-400 group-hover:text-white" />
                </motion.div>
              </button>
            </motion.div>
          ) : (
            // Expanded state: Premium controls panel
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, padding: "1.5rem" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-5 flex items-center justify-between border-b border-white/10 pb-3"
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-slate-700/50 to-slate-800/50 shadow-sm border border-white/10">
                    <Sparkles className="h-3 w-3 text-sky-300" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 font-inter tracking-wide uppercase mt-0.5">
                    {title}
                  </h3>
                </div>

                <button
                  onClick={onToggle}
                  className="rounded-full bg-slate-800/50 p-1.5 text-slate-400 transition-all hover:bg-slate-700 hover:text-white"
                  aria-label="Collapse controls"
                >
                  <motion.div
                    animate={{ rotate: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.div>
                </button>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="custom-scrollbar"
              >
                {children}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/**
 * Aesthetic Button for Control Selections
 */
function VariantButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-3 py-2 text-left text-xs font-medium transition-all font-inter shadow-sm ${
        active
          ? "bg-sky-500/20 text-sky-200 border border-sky-500/30 shadow-sky-500/10"
          : "bg-white/5 text-slate-300 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

/**
 * Section Label Component
 */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500/80 font-inter">
      {children}
    </label>
  );
}

/**
 * Quotes Page Controls
 */
function QuotesControls() {
  const {
    viewMode,
    activeNormalVariant,
    activeConstellationVariant,
    hexSurgeEnabled,
    triggerHexSurge,
    triggerComet,
    setViewMode,
    setActiveNormalVariant,
    setActiveConstellationVariant,
    setHexSurgeEnabled,
  } = useQuoteViewStore();

  const isHexArraySelected =
    viewMode === "constellation" && activeConstellationVariant === "hex_array";
  const isSolarSystemSelected =
    viewMode === "constellation" &&
    activeConstellationVariant === "solar_system";

  return (
    <div className="w-full space-y-5">
      {/* Mode Toggle */}
      <div>
        <SectionLabel>Rendering Mode</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <VariantButton
            active={viewMode === "normal"}
            onClick={() => setViewMode("normal")}
          >
            Normal
          </VariantButton>
          <VariantButton
            active={viewMode === "constellation"}
            onClick={() => setViewMode("constellation")}
          >
            Constellation
          </VariantButton>
        </div>
      </div>

      {/* Normal Variants */}
      {viewMode === "normal" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SectionLabel>Normal Architecture</SectionLabel>
          <div className="flex flex-col gap-2">
            {(["mission_control", "tesseract"] as NormalVariant[]).map(
              (variant) => (
                <VariantButton
                  key={variant}
                  active={activeNormalVariant === variant}
                  onClick={() => setActiveNormalVariant(variant)}
                >
                  <span className="capitalize">
                    {variant.replace("_", " ")}
                  </span>
                </VariantButton>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Constellation Variants */}
      {viewMode === "constellation" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <SectionLabel>Constellation Topology</SectionLabel>
          <div className="flex flex-col gap-2">
            {(
              [
                "constellation",
                "solar_system",
                "hex_array",
              ] as ConstellationVariant[]
            ).map((variant) => (
              <VariantButton
                key={variant}
                active={activeConstellationVariant === variant}
                onClick={() => setActiveConstellationVariant(variant)}
              >
                <span className="capitalize">{variant.replace("_", " ")}</span>
              </VariantButton>
            ))}
          </div>
        </motion.div>
      )}

      {/* Hex Surge Controls */}
      {isHexArraySelected && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3"
        >
          <div className="mb-3 flex items-center justify-between">
            <label
              htmlFor="hex-surge-enabled"
              className="cursor-pointer text-xs font-medium text-slate-300 font-inter"
            >
              Enable Hex Surge
            </label>
            <input
              type="checkbox"
              id="hex-surge-enabled"
              checked={hexSurgeEnabled}
              onChange={(e) => setHexSurgeEnabled(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-black/50 text-sky-500 focus:ring-sky-500/50"
            />
          </div>
          <button
            onClick={triggerHexSurge}
            disabled={!hexSurgeEnabled}
            className={`w-full rounded-lg px-3 py-2 text-xs font-semibold transition-all font-inter shadow-sm ${
              hexSurgeEnabled
                ? "bg-sky-600/80 text-white hover:bg-sky-500 active:scale-95 shadow-sky-500/20 border border-sky-500/50"
                : "cursor-not-allowed bg-slate-800/80 text-slate-500 border border-white/5"
            }`}
          >
            Trigger Kinetic Surge
          </button>
        </motion.div>
      )}

      {/* Comet Trigger Controls */}
      {isSolarSystemSelected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <button
            onClick={triggerComet}
            className="w-full rounded-lg bg-gradient-to-r from-orange-500/80 to-red-500/80 hover:from-orange-500 hover:to-red-500 px-3 py-2 text-xs font-semibold text-white shadow-xl shadow-orange-500/20 border border-orange-400/30 transition-all active:scale-95 font-inter"
          >
            Summon Comet
          </button>
        </motion.div>
      )}
    </div>
  );
}

/**
 * Formatting util for camelCase rendering
 */
const formatVariantName = (variant: string) => {
  const spaced = variant.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/**
 * Home Page Controls
 */
function HomePageControls() {
  const {
    selectedAboutMe,
    selectedProjects,
    selectedTechStack,
    selectedBlogHighlight,
    setSelectedAboutMe,
    setSelectedProjects,
    setSelectedTechStack,
    setSelectedBlogHighlight,
  } = useDevControlsStore();

  return (
    <div className="w-full max-h-[65vh] overflow-y-auto pr-1 space-y-6">
      {/* About Me Section */}
      <div>
        <SectionLabel>About Me Module</SectionLabel>
        <div className="flex flex-col gap-2">
          {(["aboutMe2"] as const).map((variant) => (
            <VariantButton
              key={variant}
              active={selectedAboutMe === variant}
              onClick={() => setSelectedAboutMe(variant)}
            >
              {formatVariantName(variant)}
            </VariantButton>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div>
        <SectionLabel>Projects Showcase</SectionLabel>
        <div className="flex flex-col gap-2">
          {(["projectCarousel"] as const).map((variant) => (
            <VariantButton
              key={variant}
              active={selectedProjects === variant}
              onClick={() => setSelectedProjects(variant)}
            >
              {formatVariantName(variant)}
            </VariantButton>
          ))}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div>
        <SectionLabel>Technology Grid</SectionLabel>
        <div className="flex flex-col gap-2">
          {(["techStack2", "techStack3", "techStack4"] as const).map(
            (variant) => (
              <VariantButton
                key={variant}
                active={selectedTechStack === variant}
                onClick={() => setSelectedTechStack(variant)}
              >
                {formatVariantName(variant)}
              </VariantButton>
            )
          )}
        </div>
      </div>

      {/* Blog Highlight Section */}
      <div>
        <SectionLabel>Blog Highlighting</SectionLabel>
        <div className="flex flex-col gap-2">
          {(["blogHighlight4"] as const).map((variant) => (
            <VariantButton
              key={variant}
              active={selectedBlogHighlight === variant}
              onClick={() => setSelectedBlogHighlight(variant)}
            >
              {formatVariantName(variant)}
            </VariantButton>
          ))}
        </div>
      </div>
    </div>
  );
}
