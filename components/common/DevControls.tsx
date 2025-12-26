"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useQuoteViewStore } from "@/components/quotes/store/useQuoteViewStore";
import { useDevControlsStore } from "./store/useDevControlsStore";
import type {
  NormalVariant,
  ConstellationVariant,
} from "@/app/(portfolio)/quotes/config";

/**
 * Global Dev Controls Component
 *
 * Route-aware component that shows different controls based on the current page.
 * Available on all pages for testing and development features.
 * Features collapsible functionality with smooth animations.
 */
export function DevControls() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
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
    title = "Home Page Controls";
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
 * Provides collapse/expand functionality with smooth animations
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
      className="fixed bottom-4 right-4 z-50 w-[280px]"
      initial={false}
      layout
    >
      <motion.div
        layout
        className="w-full rounded-lg border border-slate-700/50 bg-slate-900/95 backdrop-blur-sm shadow-lg overflow-hidden"
        animate={{
          scale: isCollapsed ? 1 : 1,
        }}
        transition={{
          layout: {
            type: "spring",
            stiffness: 400,
            damping: 30,
          },
          duration: 0.3,
        }}
      >
        {isCollapsed ? (
          // Collapsed state: thin bar
          <motion.div
            layout
            initial={false}
            animate={{
              padding: "0.625rem 1rem", // py-2.5 px-4
            }}
            transition={{
              layout: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              },
            }}
          >
            <button
              onClick={onToggle}
              className="flex w-full items-center justify-between text-slate-300 transition-colors hover:bg-slate-800/50 rounded"
              aria-label="Expand controls"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xs font-medium font-inter"
              >
                {title}
              </motion.span>
              <motion.div
                animate={{ rotate: 180 }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </button>
          </motion.div>
        ) : (
          // Expanded state: full controls
          <motion.div
            layout
            initial={false}
            animate={{
              padding: "1.5rem", // p-6
            }}
            transition={{
              layout: {
                type: "spring",
                stiffness: 400,
                damping: 30,
              },
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.1,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className="mb-4 flex items-center justify-between"
            >
              <h3 className="text-sm font-semibold text-slate-200 font-inter">
                {title}
              </h3>
              <button
                onClick={onToggle}
                className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
                aria-label="Collapse controls"
              >
                <motion.div
                  animate={{ rotate: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                  }}
                >
                  <ChevronDown className="h-4 w-4" />
                </motion.div>
              </button>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
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
    <div className="w-full font-inter">
      {/* Mode Toggle */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400 font-inter">
          Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("normal")}
            className={`rounded px-3 py-1 text-xs transition-colors font-inter ${
              viewMode === "normal"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Normal
          </button>
          <button
            onClick={() => setViewMode("constellation")}
            className={`rounded px-3 py-1 text-xs transition-colors font-inter ${
              viewMode === "constellation"
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            Constellation
          </button>
        </div>
      </div>

      {/* Normal Variants */}
      {viewMode === "normal" && (
        <div className="mb-4">
          <label className="mb-1 block text-xs text-slate-400 font-inter">
            Normal Variant
          </label>
          <div className="flex flex-col gap-1">
            {(["mission_control", "tesseract"] as NormalVariant[]).map(
              (variant) => (
                <button
                  key={variant}
                  onClick={() => setActiveNormalVariant(variant)}
                  className={`rounded px-2 py-1 text-left text-xs transition-colors font-inter capitalize ${
                    activeNormalVariant === variant
                      ? "bg-purple-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {variant.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* Constellation Variants */}
      {viewMode === "constellation" && (
        <div className="mb-4">
          <label className="mb-1 block text-xs text-slate-400 font-inter">
            Constellation Variant
          </label>
          <div className="flex flex-col gap-1">
            {(
              [
                "constellation",
                "solar_system",
                "hex_array",
              ] as ConstellationVariant[]
            ).map((variant) => (
              <button
                key={variant}
                onClick={() => setActiveConstellationVariant(variant)}
                className={`rounded px-2 py-1 text-left text-xs transition-colors font-inter capitalize ${
                  activeConstellationVariant === variant
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {variant.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Hex Surge Controls - Only show when hex_array is selected */}
      {isHexArraySelected && (
        <div className="mt-4 border-t border-slate-700/50 pt-4">
          <div className="mb-3 flex items-center gap-2">
            <input
              type="checkbox"
              id="hex-surge-enabled"
              checked={hexSurgeEnabled}
              onChange={(e) => setHexSurgeEnabled(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            />
            <label
              htmlFor="hex-surge-enabled"
              className="cursor-pointer text-xs font-medium text-slate-300 font-inter"
            >
              Enable hex surge
            </label>
          </div>
          <button
            onClick={triggerHexSurge}
            disabled={!hexSurgeEnabled}
            className={`w-full rounded px-3 py-2 text-xs font-medium transition-all font-inter ${
              hexSurgeEnabled
                ? "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
                : "cursor-not-allowed bg-slate-700 text-slate-500 opacity-50"
            }`}
          >
            Trigger Surge
          </button>
        </div>
      )}

      {/* Comet Trigger Controls - Only show when solar_system is selected */}
      {isSolarSystemSelected && (
        <div className="mt-4 border-t border-slate-700/50 pt-4">
          <button
            onClick={triggerComet}
            className="w-full rounded px-3 py-2 text-xs font-medium transition-all font-inter bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
          >
            Trigger Comet
          </button>
        </div>
      )}
    </div>
  );
}

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
    <div className="w-full max-h-[80vh] overflow-y-auto font-inter">
      {/* About Me Section */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400 font-inter">
          About Me
        </label>
        <div className="flex flex-col gap-1">
          {(["aboutMe1", "aboutMe2"] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => setSelectedAboutMe(variant)}
              className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                selectedAboutMe === variant
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {variant.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400 font-inter">
          Projects
        </label>
        <div className="flex flex-col gap-1">
          {(["projectCarousel", "featuredProjects", "bentoGrid"] as const).map(
            (variant) => (
              <button
                key={variant}
                onClick={() => setSelectedProjects(variant)}
                className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                  selectedProjects === variant
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {variant.replace(/([A-Z])/g, " $1").trim()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Tech Stack Section */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400 font-inter">
          Tech Stack
        </label>
        <div className="flex flex-col gap-1">
          {(["techStack", "techStack2", "techStack3"] as const).map(
            (variant) => (
              <button
                key={variant}
                onClick={() => setSelectedTechStack(variant)}
                className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                  selectedTechStack === variant
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
              >
                {variant.replace(/([A-Z])/g, " $1").trim()}
              </button>
            )
          )}
        </div>
      </div>

      {/* Blog Highlight Section */}
      <div className="mb-4">
        <label className="mb-1 block text-xs text-slate-400 font-inter">
          Blog Highlight
        </label>
        <div className="flex flex-col gap-1">
          {(["blogHighlight", "blogHighlight4"] as const).map((variant) => (
            <button
              key={variant}
              onClick={() => setSelectedBlogHighlight(variant)}
              className={`rounded px-2 py-1 text-left text-xs transition-colors ${
                selectedBlogHighlight === variant
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {variant.replace(/([A-Z])/g, " $1").trim()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
