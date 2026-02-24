"use client";

import { useDevControlsStore } from "@/components/common/store/useDevControlsStore";
import type { ReactNode } from "react";

interface ActiveHomeSectionsProps {
  aboutMe2: ReactNode;
  projectCarousel: ReactNode;
  techStack2: ReactNode;
  techStack3: ReactNode;
  techStack4: ReactNode;
  blogHighlight4: ReactNode;
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
    selectedTechStack,
    selectedBlogHighlight,
  } = useDevControlsStore();

  return (
    <>
      {/* About Me */}
      {selectedAboutMe === "aboutMe2" && props.aboutMe2}

      {/* Projects */}
      {selectedProjects === "projectCarousel" && props.projectCarousel}

      {/* Tech Stack */}
      {selectedTechStack === "techStack2" && props.techStack2}
      {selectedTechStack === "techStack3" && props.techStack3}
      {selectedTechStack === "techStack4" && props.techStack4}

      {/* Blog Highlight */}
      {selectedBlogHighlight === "blogHighlight4" && props.blogHighlight4}
    </>
  );
}
