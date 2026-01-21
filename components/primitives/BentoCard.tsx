"use client";

import { motion } from "framer-motion";
import { useHasMounted } from "@/lib/hooks/useHasMounted";
import type { BentoCardProps } from "@/types/components";

export function BentoCard({
  name,
  category,
  Icon,
  description,
  className,
  onClick,
}: BentoCardProps) {
  const hasMounted = useHasMounted();
  // Determine if this is a small container (col-span-1) to apply min-width
  const isSmallContainer = className?.includes("col-span-1");
  
  if (!hasMounted) {
    return (
      <button
        onClick={onClick}
        type="button"
        aria-label={`${name} skills`}
        className={`relative flex flex-col justify-between p-6 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer text-left
                   transition-all duration-300 hover:border-sky-300/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-900/50
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/80
                   ${isSmallContainer ? "min-w-[200px]" : ""}
                   ${className}`}
      >
      <div className="flex-grow min-w-0">
        <Icon className="h-8 w-8 text-sky-300 mb-4 flex-shrink-0" />
        <h3 className="font-heading text-xl font-semibold text-slate-50 break-words">
          {name}
        </h3>
        <p className="text-slate-400 text-sm mt-2 break-words">{description}</p>
      </div>
      <p className="text-xs font-mono text-slate-500 mt-4">{category}</p>
    </button>
  );
  }
  
  return (
    <motion.button
      layoutId={`card-${name}`}
      onClick={onClick}
      type="button"
      aria-label={`${name} skills`}
      // Apply the passed className here for grid layout control
      className={`relative flex flex-col justify-between p-6 rounded-lg bg-slate-800 border border-slate-700 cursor-pointer text-left
                 transition-all duration-300 hover:border-sky-300/80 hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-900/50
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300/80
                 ${isSmallContainer ? "min-w-[200px]" : ""}
                 ${className}`}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex-grow min-w-0">
        <Icon className="h-8 w-8 text-sky-300 mb-4 flex-shrink-0" />
        <h3 className="font-heading text-xl font-semibold text-slate-50 break-words">
          {name}
        </h3>
        <p className="text-slate-400 text-sm mt-2 break-words">{description}</p>
      </div>
      <p className="text-xs font-mono text-slate-500 mt-4">{category}</p>
    </motion.button>
  );
}
