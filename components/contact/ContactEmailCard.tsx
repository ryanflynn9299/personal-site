"use client";

import { useState, useCallback } from "react";
import { Mail, Check, Copy } from "lucide-react";
import { Button } from "@/components/primitives/Button";

interface ContactEmailCardProps {
  email: string;
  mailtoHref: string;
}

export function ContactEmailCard({ email, mailtoHref }: ContactEmailCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      setCopied(false);
    }
  }, [email]);

  return (
    <div className="group flex items-center gap-4 rounded-lg bg-slate-800 p-4 transition-colors hover:bg-slate-700">
      <a href={mailtoHref} className="flex min-w-0 flex-1 items-center gap-4">
        <Mail className="h-8 w-8 shrink-0 text-sky-300" />
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-100 group-hover:text-sky-300">
            Email
          </h3>
          <p className="truncate text-sm text-slate-400">{email}</p>
        </div>
      </a>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? "Email copied" : "Copy email address"}
        className="shrink-0"
      >
        {copied ? (
          <>
            <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Copied
          </>
        ) : (
          <>
            <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
