"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { cn } from "@/lib/utils";

const SCROLL_THRESHOLD_PX = 400;

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label="Back to top"
      onClick={scrollToTop}
      className={cn(
        "fixed bottom-6 right-6 z-50 border-slate-600 bg-slate-900/90 text-slate-100 shadow-lg shadow-slate-950/40 backdrop-blur-sm transition-all duration-300 hover:border-sky-400 hover:bg-slate-800",
        isVisible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0"
      )}
    >
      <ArrowUp className="h-5 w-5" aria-hidden="true" />
    </Button>
  );
}
