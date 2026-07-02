import type { Metadata } from "next";
import { Suspense } from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ActiveHomeSections } from "@/components/sections/ActiveHomeSections";
import { generatePageMetadata } from "@/lib/site/seo";
import { BlogHighlightSkeleton } from "@/components/skeletons/BlogHighlightSkeleton";

// Import all sections to pass them as Server Components
import { AboutMe } from "@/components/sections/AboutMe";
import { ProjectCarousel } from "@/components/sections/ProjectCarousel";
import { TechStack3 } from "@/components/sections/TechStack3";
import { TechStack4 } from "@/components/sections/TechStack4";
import { BlogHighlight } from "@/components/sections/BlogHighlight";

export const metadata: Metadata = generatePageMetadata({
  title: "Ryan Flynn | Software Engineer & Tech Enthusiast",
  description:
    "Portfolio of Ryan Flynn - Software Engineer, Tech Enthusiast. Explore projects, read blog posts, and learn about my journey in technology.",
  path: "/",
});

// Revalidate the page every hour to fetch new blog posts
export const revalidate = 3600;

export default async function HomePage() {
  return (
    <>
      <HeroSection />

      {/* Dev Controls orchestrator resolving selected component states */}
      <ActiveHomeSections
        aboutMe={<AboutMe />}
        projectCarousel={<ProjectCarousel />}
        standardTechStack={<TechStack3 />}
        animatedTechStack={<TechStack4 />}
        blogHighlight={
          <Suspense fallback={<BlogHighlightSkeleton />}>
            <BlogHighlight />
          </Suspense>
        }
      />

      <FinalCTA />
    </>
  );
}
