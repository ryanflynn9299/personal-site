'use client';

import { Search } from 'lucide-react';

interface SearchButtonProps {
    onClick: () => void;
}

export function SearchButton({ onClick }: SearchButtonProps) {
    return (
        <button
            onClick={onClick}
            className="group flex items-center gap-2 rounded-full border border-slate-600 bg-slate-800 py-2 pl-3 pr-2
                 text-slate-300 transition-colors hover:border-sky-300/50 hover:bg-slate-700"
        >
            <Search className="h-4 w-4" />
            <div className="overflow-hidden transition-all duration-300 ease-in-out group-hover:max-w-[100px] max-w-0">
        <span className="whitespace-nowrap pr-2 font-mono text-sm">
          // Search
        </span>
            </div>
        </button>
    );
}