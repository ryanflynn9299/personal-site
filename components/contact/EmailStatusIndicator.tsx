"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { getContactStatusTooltip } from "@/lib/site/contact";

interface EmailStatusIndicatorProps {
  /**
   * Whether the email service is configured and available
   */
  emailServiceAvailable: boolean;
}

export function EmailStatusIndicatorWithStatus({
  emailServiceAvailable,
}: EmailStatusIndicatorProps) {
  const [isHovered, setIsHovered] = useState(false);

  if (emailServiceAvailable) {
    return null;
  }

  const tooltipText = getContactStatusTooltip();

  return (
    <div className="relative inline-flex items-center">
      <div
        className="flex items-center justify-center cursor-help"
        role="status"
        aria-label={tooltipText}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <AlertCircle className="h-4 w-4 text-amber-400" />
      </div>

      {isHovered && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-50 pointer-events-none w-[min(20rem,calc(100vw-2rem))]">
          <div className="relative">
            <div className="rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-200 shadow-lg border border-slate-950 w-full h-auto min-h-[1.5rem]">
              <p className="whitespace-normal leading-relaxed break-words">
                {tooltipText}
              </p>
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="h-2 w-2 rotate-45 border-b border-r border-slate-800 bg-slate-950"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
