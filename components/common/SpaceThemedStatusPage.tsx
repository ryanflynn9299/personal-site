import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { SpaceStarfieldBackground } from "@/components/common/SpaceStarfieldBackground";

export interface SpaceThemedStatusAction {
  label: string;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
  icon?: LucideIcon;
}

interface SpaceThemedStatusPageProps {
  code?: string;
  title: string;
  description: string;
  actions: SpaceThemedStatusAction[];
}

export function SpaceThemedStatusPage({
  code,
  title,
  description,
  actions,
}: SpaceThemedStatusPageProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden bg-slate-900 text-center">
      <SpaceStarfieldBackground />

      <div className="relative z-10 flex flex-col items-center px-4">
        {code && (
          <p className="font-mono text-8xl font-bold text-sky-300 md:text-9xl">
            {code}
          </p>
        )}
        <h1
          className={`font-heading text-2xl font-semibold text-slate-50 md:text-3xl ${code ? "mt-4" : ""}`}
        >
          {title}
        </h1>
        <p className="mt-2 max-w-md text-slate-300">{description}</p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          {actions.map((action) => {
            const Icon = action.icon;

            if (action.href) {
              return (
                <Button
                  key={action.label}
                  asChild
                  size="lg"
                  variant={action.variant ?? "default"}
                >
                  <Link href={action.href}>
                    {Icon && <Icon className="mr-2 h-5 w-5" />}
                    {action.label}
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                key={action.label}
                type="button"
                size="lg"
                variant={action.variant ?? "default"}
                onClick={action.onClick}
              >
                {Icon && <Icon className="mr-2 h-5 w-5" />}
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
