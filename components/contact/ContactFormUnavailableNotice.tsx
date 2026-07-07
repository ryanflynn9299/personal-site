"use client";

import { AlertTriangle } from "lucide-react";

interface ContactFormUnavailableNoticeProps {
  message: string;
}

export function ContactFormUnavailableNotice({
  message,
}: ContactFormUnavailableNoticeProps) {
  return (
    <div
      role="status"
      className="mt-4 flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
    >
      <AlertTriangle
        className="mt-0.5 h-5 w-5 shrink-0 text-amber-400"
        aria-hidden="true"
      />
      <p>{message}</p>
    </div>
  );
}
