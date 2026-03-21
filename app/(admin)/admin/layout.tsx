import { ReactNode } from "react";
import { StarfieldBackground, HUDOverlay } from "@/components/admin/SpaceTheme";

// This layout wraps all pages inside the admin section.
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-slate-900 text-slate-200 min-h-screen relative font-sans overflow-x-hidden">
      {/* Background Starfield - maintained for "Mission Control" feel */}
      <StarfieldBackground />

      {/* Refined HUD Elements */}
      <HUDOverlay />

      {/* Main Administrative Interface */}
      <div className="relative z-10 w-full h-full min-h-screen flex flex-col">
        {children}
      </div>

      {/* Subspace Glow Effects - matched to site accents */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-sky-500/5 blur-[120px] -z-10 rounded-full" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/5 blur-[120px] -z-10 rounded-full" />
    </div>
  );
}
