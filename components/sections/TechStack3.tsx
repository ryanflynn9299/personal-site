"use client";

import dynamic from "next/dynamic";
import { SectionHeader } from "@/components/sections/SectionHeader";

// Lazy load BentoGrid as it may contain heavy components
const BentoGrid = dynamic(
  () =>
    import("@/components/sections/MagicBento3").then((mod) => ({
      default: mod.BentoGrid,
    })),
  {
    ssr: false, // Avoid hydration mismatches from animated client-only UI
    loading: () => (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-800" />
        ))}
      </div>
    ),
  }
);

// Modified Magic Bento component with personal info
export function TechStack3() {
  return (
    <section className="py-16 md:py-24 my-8 border-t border-slate-800 bg-slate-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader
          title="My Tech Stack"
          subtitle="The tools and technologies I use to bring ideas to life."
        />
        <BentoGrid />
      </div>
    </section>
  );
}
