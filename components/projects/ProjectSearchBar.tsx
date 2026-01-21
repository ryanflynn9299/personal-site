"use client";

import React, { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { useHasMounted } from "@/lib/hooks/useHasMounted";

interface ProjectSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
  onFocus?: () => void;
}

export function ProjectSearchBar({
  value,
  onChange,
  resultCount,
  onFocus,
}: ProjectSearchBarProps) {
  const hasMounted = useHasMounted();
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd/Ctrl+K to focus search
  useEffect(() => {
    if (!hasMounted || typeof window === "undefined") {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasMounted]);

  const handleClear = () => {
    onChange("");
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="relative mb-8">
      <div className="relative flex items-center">
        <div className="absolute left-4 text-slate-500">
          <Search className="h-5 w-5" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search projects by name, description, or tags..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900 py-3 pl-12 pr-12 font-mono text-sm text-slate-200 placeholder:text-slate-500 focus:border-sky-300/50 focus:outline-none focus:ring-2 focus:ring-sky-300/20 transition-all"
          aria-label="Search projects"
        />
        {value && (
          <button
            onClick={handleClear}
            className="absolute right-4 rounded p-1 text-slate-400 transition-colors hover:text-slate-200 hover:bg-slate-800"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {value && resultCount !== undefined && (
        <div className="mt-2 text-right">
          <span className="font-mono text-xs text-slate-500">
            {resultCount} {resultCount === 1 ? "result" : "results"}
          </span>
        </div>
      )}
    </div>
  );
}
