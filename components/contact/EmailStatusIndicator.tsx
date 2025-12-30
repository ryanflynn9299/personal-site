"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";

/**
 * Email Status Indicator Component
 *
 * Shows a minimal status indicator when email service is unavailable.
 * Only displays when email service is not configured.
 * Includes a hover tooltip explaining the status.
 *
 * This component accepts the email service status as a prop,
 * which should be checked on the server side using isEmailServiceConfigured().
 */
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

  // Only show when email service is unavailable
  if (emailServiceAvailable) {
    return null;
  }

  const isDev = process.env.NODE_ENV === "development";
  const tooltipText = isDev
    ? "Email service not configured. Emails will not be sent. Set SMTP environment variables to enable email delivery."
    : "Email service is currently unavailable. Emails will not be sent.";

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

      {/* Tooltip */}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 z-50 pointer-events-none w-[400px]">
          <div className="relative">
            <div className="rounded-md bg-slate-950 px-3 py-2 text-xs text-slate-200 shadow-lg border border-slate-950 w-full h-auto min-h-[1.5rem]">
              <p className="whitespace-normal leading-relaxed break-words">
                {tooltipText}
              </p>
            </div>
            {/* Tooltip arrow */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px">
              <div className="h-2 w-2 rotate-45 border-b border-r border-slate-800 bg-slate-950"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
