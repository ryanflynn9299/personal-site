"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles, AlertTriangle } from "lucide-react";
import { useQuoteViewStore } from "@/components/quotes/store/useQuoteViewStore";
import { useDevControlsStore } from "./store/useDevControlsStore";
import { runtime } from "@/lib/config";
import { shouldShowVariantSection } from "@/lib/dev-tooling/dev-controls-utils";
import { PREVIEW_TRIGGER_ERROR_ROUTE } from "@/lib/dev-tooling/preview-routes";

type ControlsComponentType = React.ComponentType;

interface RouteControlsConfig {
  Controls: ControlsComponentType;
  title: string;
}

function getRouteControlsConfig(pathname: string): RouteControlsConfig | null {
  if (pathname === "/quotes") {
    return { Controls: QuotesControls, title: "View Controls" };
  }
  if (pathname === "/") {
    return { Controls: HomePageControls, title: "Home Controls" };
  }
  if (pathname === "/about") {
    return { Controls: AboutPageControls, title: "About Page Controls" };
  }
  return null;
}

/**
 * Whether dev controls should appear on this route.
 * Diagnostics are available on all public routes when preview features are on.
 */
export function hasDevControlsForPathname(pathname: string): boolean {
  return !pathname.startsWith("/admin");
}

interface DevControlsProps {
  /** When true, parent dock handles fixed positioning. */
  embedded?: boolean;
}

/**
 * Global Dev Controls Component
 *
 * Route-aware component that shows different controls based on the current page.
 * Sections with only one variant option are omitted; if nothing remains, the
 * component renders nothing.
 */
export function DevControls({ embedded = false }: DevControlsProps) {
  const pathname = usePathname();
  const { showDevControls } = useDevControlsStore();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const routeConfig = getRouteControlsConfig(pathname);
  const title = routeConfig?.title ?? "Dev Controls";

  if (
    !mounted ||
    !runtime.previewFeatures ||
    runtime.isTest ||
    !showDevControls ||
    !hasDevControlsForPathname(pathname)
  ) {
    return null;
  }

  return (
    <CollapsibleControls
      isCollapsed={isCollapsed}
      onToggle={() => setIsCollapsed(!isCollapsed)}
      title={title}
      embedded={embedded}
    >
      <DevControlsContent pathname={pathname} />
    </CollapsibleControls>
  );
}

function DevControlsContent({ pathname }: { pathname: string }) {
  const routeConfig = getRouteControlsConfig(pathname);
  const RouteControls = routeConfig?.Controls;

  return (
    <div className="w-full max-h-[65vh] overflow-y-auto pr-1 space-y-6">
      <DiagnosticsControls />
      {RouteControls && <RouteControls />}
    </div>
  );
}

function DiagnosticsControls() {
  const router = useRouter();

  return (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
      <SectionLabel>Diagnostics</SectionLabel>
      <button
        type="button"
        onClick={() => router.push(PREVIEW_TRIGGER_ERROR_ROUTE)}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 transition-all hover:bg-amber-500/20 active:scale-[0.98] font-inter"
      >
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
        Trigger error page
      </button>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-500">
        Opens a dev-only route that crashes on purpose. Retype the URL or pick a
        new page to continue normally.
      </p>
    </div>
  );
}

interface PageControlsProps {
  onEmpty?: () => void;
}

function CollapsibleControls({
  isCollapsed,
  onToggle,
  title,
  embedded,
  children,
}: {
  isCollapsed: boolean;
  onToggle: () => void;
  title: string;
  embedded?: boolean;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={
        embedded ? "w-[300px]" : "fixed bottom-6 right-6 z-50 w-[300px]"
      }
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
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/50 to-transparent" />

        <AnimatePresence mode="popLayout" initial={false}>
          {isCollapsed ? (
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

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500/80 font-inter">
      {children}
    </label>
  );
}

function ControlsVariantSection<T extends string>({
  label,
  options,
  value,
  onChange,
  formatLabel = (v) => v.replace(/_/g, " "),
}: {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  formatLabel?: (value: T) => string;
}) {
  if (!shouldShowVariantSection(options.length)) {
    return null;
  }

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <VariantButton
            key={option}
            active={value === option}
            onClick={() => onChange(option)}
          >
            <span className="capitalize">{formatLabel(option)}</span>
          </VariantButton>
        ))}
      </div>
    </div>
  );
}

function useNotifyWhenEmpty(hasVisibleSections: boolean, onEmpty?: () => void) {
  useEffect(() => {
    if (!hasVisibleSections) {
      onEmpty?.();
    }
  }, [hasVisibleSections, onEmpty]);
}

function QuotesControls({ onEmpty }: PageControlsProps) {
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

  const hasVisibleSections =
    shouldShowVariantSection(2) ||
    (viewMode === "normal" && shouldShowVariantSection(2)) ||
    (viewMode === "constellation" && shouldShowVariantSection(3)) ||
    isHexArraySelected ||
    isSolarSystemSelected;

  useNotifyWhenEmpty(hasVisibleSections, onEmpty);

  if (!hasVisibleSections) {
    return null;
  }

  return (
    <div className="w-full space-y-5">
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

      {viewMode === "normal" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ControlsVariantSection
            label="Normal Architecture"
            options={["mission_control", "tesseract"] as const}
            value={activeNormalVariant}
            onChange={setActiveNormalVariant}
          />
        </motion.div>
      )}

      {viewMode === "constellation" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <ControlsVariantSection
            label="Constellation Topology"
            options={["constellation", "solar_system", "hex_array"] as const}
            value={activeConstellationVariant}
            onChange={setActiveConstellationVariant}
          />
        </motion.div>
      )}

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

const formatVariantName = (variant: string) => {
  const spaced = variant.replace(/([A-Z])/g, " $1").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

function HomePageControls({ onEmpty }: PageControlsProps) {
  const {
    selectedAboutMe,
    selectedProjects,
    selectedBlogHighlight,
    setSelectedAboutMe,
    setSelectedProjects,
    setSelectedBlogHighlight,
  } = useDevControlsStore();

  const aboutOptions = ["aboutMe"] as const;
  const projectOptions = ["projectCarousel"] as const;
  const blogOptions = ["blogHighlight"] as const;

  const sections = [
    shouldShowVariantSection(aboutOptions.length) ? (
      <ControlsVariantSection
        key="about"
        label="About Me Module"
        options={aboutOptions}
        value={selectedAboutMe}
        onChange={setSelectedAboutMe}
        formatLabel={formatVariantName}
      />
    ) : null,
    shouldShowVariantSection(projectOptions.length) ? (
      <ControlsVariantSection
        key="projects"
        label="Projects Showcase"
        options={projectOptions}
        value={selectedProjects}
        onChange={setSelectedProjects}
        formatLabel={formatVariantName}
      />
    ) : null,
    shouldShowVariantSection(blogOptions.length) ? (
      <ControlsVariantSection
        key="blog"
        label="Blog Highlighting"
        options={blogOptions}
        value={selectedBlogHighlight}
        onChange={setSelectedBlogHighlight}
        formatLabel={formatVariantName}
      />
    ) : null,
  ].filter(Boolean);

  const hasVisibleSections = sections.length > 0;

  useNotifyWhenEmpty(hasVisibleSections, onEmpty);

  if (!hasVisibleSections) {
    return null;
  }

  return (
    <div className="w-full max-h-[65vh] overflow-y-auto pr-1 space-y-6">
      {sections}
    </div>
  );
}

function AboutPageControls({ onEmpty }: PageControlsProps) {
  const {
    selectedAboutValuesGrid,
    setSelectedAboutValuesGrid,
    selectedAboutCTA,
    setSelectedAboutCTA,
  } = useDevControlsStore();

  const sections = [
    <ControlsVariantSection
      key="values"
      label="Values Grid Styling"
      options={["valuesGridFlat", "valuesGridPremium"] as const}
      value={selectedAboutValuesGrid}
      onChange={setSelectedAboutValuesGrid}
      formatLabel={formatVariantName}
    />,
    <ControlsVariantSection
      key="cta"
      label="CTA Styling"
      options={["ctaPremium", "ctaFlat"] as const}
      value={selectedAboutCTA}
      onChange={setSelectedAboutCTA}
      formatLabel={formatVariantName}
    />,
  ].filter(Boolean);

  const hasVisibleSections = sections.length > 0;

  useNotifyWhenEmpty(hasVisibleSections, onEmpty);

  if (!hasVisibleSections) {
    return null;
  }

  return (
    <div className="w-full max-h-[65vh] overflow-y-auto pr-1 space-y-6">
      {sections}
    </div>
  );
}
