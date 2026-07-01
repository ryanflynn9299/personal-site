"use client";

import { useDevControlsStore } from "@/components/common/store/useDevControlsStore";
import type { ReactNode } from "react";

interface ActiveHomeSectionsProps {
  aboutMe: ReactNode;
  projectCarousel: ReactNode;
  standardTechStack: ReactNode;
  animatedTechStack: ReactNode;
  blogHighlight: ReactNode;
}

/**
 * Acts as the dynamic orchestrator for the Home Page layout by receiving
 * pre-rendered Server Components as props and deciding which to mount.
 * This circumvents "uncached promise" errors since the "use client"
 * boundary properly awaits the async server-side payloads.
 */
export function ActiveHomeSections(props: ActiveHomeSectionsProps) {
  const {
    selectedAboutMe,
    selectedProjects,
    isTechStackPremium,
    selectedBlogHighlight,
  } = useDevControlsStore();

  return (
    <>
      {/* About Me */}
      {selectedAboutMe === "aboutMe" && props.aboutMe}

      {/* Projects */}
      {selectedProjects === "projectCarousel" && props.projectCarousel}

      {/* Tech Stack */}
      {isTechStackPremium ? props.animatedTechStack : props.standardTechStack}

      {/* Blog Highlight */}
      {selectedBlogHighlight === "blogHighlight" && props.blogHighlight}
    </>
  );
}
