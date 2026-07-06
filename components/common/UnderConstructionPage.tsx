import { HardHat, Home } from "lucide-react";
import { SpaceThemedStatusPage } from "@/components/common/SpaceThemedStatusPage";

/**
 * Standalone construction placeholder — not wired to any route.
 * Import and render when a feature is temporarily offline.
 */
export function UnderConstructionPage() {
  return (
    <SpaceThemedStatusPage
      title="Pardon our galactic dust"
      description="This sector is under construction. We're re-aligning the stars and will have something stellar here soon."
      actions={[
        {
          label: "Return to Home Base",
          href: "/",
          icon: Home,
        },
        {
          label: "Explore the Blog",
          href: "/blog",
          variant: "outline",
          icon: HardHat,
        },
      ]}
    />
  );
}
