"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { PanelRightClose, Sparkles } from "lucide-react";
import { BackToTop, useBackToTopVisible } from "@/components/common/BackToTop";
import {
  DevControls,
  hasDevControlsForPathname,
} from "@/components/common/DevControls";
import { useMinMdViewport } from "@/hooks/useMinMdViewport";
import { runtime } from "@/lib/config";
import { cn } from "@/lib/utils";

const dockSpring = { type: "spring" as const, stiffness: 420, damping: 34 };

const dockPositionClassName = "fixed bottom-6 right-6 z-50";

/**
 * Coordinates back-to-top and dev controls in one dock bar (md+ viewports only).
 *
 * The bar stays compact (back-to-top slot slides in on scroll). Dev controls
 * expand upward as a popover.
 */
export function FloatingUtilityDock() {
  const pathname = usePathname();
  const [dockMinimized, setDockMinimized] = useState(false);
  const backToTopVisible = useBackToTopVisible();
  const isMdViewport = useMinMdViewport();
  const devControlsActive =
    runtime.previewFeatures && hasDevControlsForPathname(pathname);

  if (!isMdViewport) {
    return null;
  }

  if (!devControlsActive) {
    return <BackToTop />;
  }

  return (
    <div className={dockPositionClassName}>
      {dockMinimized ? (
        <button
          type="button"
          onClick={() => setDockMinimized(false)}
          aria-label="Show page tools"
          className={cn(
            "flex h-11 items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-4 text-xs font-medium text-slate-200 shadow-lg shadow-slate-950/40 backdrop-blur-sm hover:border-sky-400/50 hover:bg-slate-800 hover:text-white",
            backToTopVisible ? "opacity-100" : "opacity-80"
          )}
        >
          <Sparkles className="h-4 w-4 text-sky-400" aria-hidden="true" />
          <span>Page tools</span>
        </button>
      ) : (
        <motion.div
          layout
          data-testid="floating-utility-dock"
          className="flex items-center rounded-2xl border border-white/10 bg-black/60 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl"
          transition={{ layout: dockSpring }}
        >
          <div className="flex h-14 items-center gap-1.5 overflow-hidden border-r border-white/10 px-2">
            <button
              type="button"
              onClick={() => setDockMinimized(true)}
              aria-label="Hide page tools"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-600/80 bg-slate-900/90 text-slate-400 shadow-md backdrop-blur-sm transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200"
              title="Hide page tools"
            >
              <PanelRightClose className="h-4 w-4" aria-hidden="true" />
            </button>

            <AnimatePresence initial={false} mode="popLayout">
              {backToTopVisible && (
                <motion.div
                  key="back-to-top-slot"
                  layout
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 40, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={dockSpring}
                  className="overflow-hidden"
                >
                  <BackToTop embedded />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <DevControls embedded embeddedInDock />
        </motion.div>
      )}
    </div>
  );
}
