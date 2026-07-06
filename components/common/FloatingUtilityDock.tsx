"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { PanelRightClose, Sparkles } from "lucide-react";
import { BackToTop, useBackToTopVisible } from "@/components/common/BackToTop";
import {
  DevControls,
  hasDevControlsForPathname,
} from "@/components/common/DevControls";
import { runtime } from "@/lib/config";
import { cn } from "@/lib/utils";

/**
 * Coordinates back-to-top and dev controls so they never overlap.
 *
 * When dev controls are available, back-to-top sits to their left and both
 * share a dock minimize control that hides the entire cluster.
 */
export function FloatingUtilityDock() {
  const pathname = usePathname();
  const [dockMinimized, setDockMinimized] = useState(false);
  const backToTopVisible = useBackToTopVisible();
  const devControlsActive =
    runtime.isDevelopment && hasDevControlsForPathname(pathname);

  if (!devControlsActive) {
    return <BackToTop />;
  }

  if (dockMinimized) {
    return (
      <button
        type="button"
        onClick={() => setDockMinimized(false)}
        aria-label="Show page tools"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-11 items-center gap-2 rounded-full border border-white/10 bg-slate-900/90 px-4 text-xs font-medium text-slate-200 shadow-lg shadow-slate-950/40 backdrop-blur-sm transition-all hover:border-sky-400/50 hover:bg-slate-800 hover:text-white",
          backToTopVisible ? "opacity-100" : "opacity-80"
        )}
      >
        <Sparkles className="h-4 w-4 text-sky-400" aria-hidden="true" />
        <span>Page tools</span>
      </button>
    );
  }

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
      data-testid="floating-utility-dock"
    >
      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => setDockMinimized(true)}
          aria-label="Hide page tools"
          className="mb-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-600/80 bg-slate-900/90 text-slate-400 shadow-md backdrop-blur-sm transition-colors hover:border-slate-500 hover:bg-slate-800 hover:text-slate-200"
          title="Hide page tools"
        >
          <PanelRightClose className="h-4 w-4" aria-hidden="true" />
        </button>
        <BackToTop embedded />
      </div>
      <DevControls embedded />
    </div>
  );
}
