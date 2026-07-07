"use client";

import { Search } from "lucide-react";

interface SearchButtonProps {
  onClick: () => void;
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Search blog posts"
      className="group flex h-10 w-10 shrink-0 items-center justify-center gap-0 overflow-hidden rounded-full border border-slate-600 bg-slate-800 text-slate-300 transition-[width,gap,padding,background-color,border-color] duration-300 ease-in-out hover:w-[9rem] hover:justify-start hover:gap-2 hover:border-sky-300/50 hover:bg-slate-700 hover:px-3"
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
      <span className="min-w-0 max-w-0 overflow-hidden whitespace-nowrap font-mono text-sm opacity-0 transition-[max-width,opacity] duration-300 ease-in-out group-hover:max-w-[6rem] group-hover:opacity-100">
        // Search
      </span>
    </button>
  );
}
