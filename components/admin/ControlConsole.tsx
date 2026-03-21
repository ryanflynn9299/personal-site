"use client";

import { useDevControlsStore } from "@/components/common/store/useDevControlsStore";
import { config } from "@/lib/config";
import {
  LucideIcon,
  Eye,
  EyeOff,
  Shield,
  Rocket,
  Terminal,
  Layers,
} from "lucide-react";

/**
 * Control Console Component
 * Central hub for site-wide administrative overrides.
 */
export function ControlConsole() {
  const {
    showDevControls,
    setShowDevControls,
    isTechStackPremium,
    setTechStackPremium,
  } = useDevControlsStore();

  return (
    <div className="space-y-6">
      <Section title="Subsystem Overrides" icon={Terminal}>
        <div className="space-y-4">
          <ControlToggle
            label="Developer Tools Visibility"
            description="Toggles the floating dev controls panel across all sectors."
            active={showDevControls}
            onToggle={() => setShowDevControls(!showDevControls)}
            icon={showDevControls ? Eye : EyeOff}
          />

          <ControlToggle
            label="Shields (Maintenance Mode)"
            description="Restricts public access to the main landing page."
            active={false}
            onToggle={() => {}} // Placeholder
            icon={Shield}
            disabled
          />

          <ControlToggle
            label="Animated Tech Stack (v4)"
            description="Enables the high-performance kinetic bento grid for the technology showcase."
            active={isTechStackPremium}
            onToggle={() => setTechStackPremium(!isTechStackPremium)}
            icon={Layers}
          />
        </div>
      </Section>

      <Section title="Navigation Systems" icon={Rocket}>
        <div className="grid grid-cols-1 gap-3">
          <ServiceLink
            name="Directus CMS"
            href={config.directus.publicUrl || "#"}
            description="Orbital content management"
          />
          <ServiceLink
            name="Matomo Analytics"
            href={config.matomo.url || "#"}
            description="Deep space telemetry"
          />
        </div>
      </Section>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}

function Section({ title, icon: Icon, children }: SectionProps) {
  return (
    <div className="border border-white/10 rounded-2xl bg-slate-800/40 backdrop-blur-md overflow-hidden">
      <div className="px-5 py-3 border-b border-white/5 bg-white/5 flex items-center gap-3">
        <Icon className="h-4 w-4 text-sky-400" />
        <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-200">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

interface ControlToggleProps {
  label: string;
  description: string;
  active: boolean;
  onToggle: () => void;
  icon: LucideIcon;
  disabled?: boolean;
}

function ControlToggle({
  label,
  description,
  active,
  onToggle,
  icon: Icon,
  disabled = false,
}: ControlToggleProps) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50" : ""}`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <Icon
            className={`h-4 w-4 ${active ? "text-sky-400" : "text-slate-500"}`}
          />
          <span className="text-sm font-bold text-slate-200">{label}</span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed font-medium">
          {description}
        </p>
      </div>
      <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          active ? "bg-sky-600" : "bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            active ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

interface ServiceLinkProps {
  name: string;
  href: string;
  description: string;
}

function ServiceLink({ name, href, description }: ServiceLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:bg-slate-900/60 hover:border-sky-500/30 transition-all shadow-sm"
    >
      <div>
        <div className="text-xs font-bold text-slate-200 group-hover:text-sky-400 transition-colors uppercase tracking-wider">
          {name}
        </div>
        <div className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-widest">
          {description}
        </div>
      </div>
      <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-white/5 group-hover:bg-sky-500/20 transition-colors border border-white/5">
        <Rocket className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-transform group-hover:scale-110" />
      </div>
    </a>
  );
}
