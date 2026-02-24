import type { Metadata } from "next";
import { HeroSection } from "@/components/sections/HeroSection";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { ActiveHomeSections } from "@/components/sections/ActiveHomeSections";
import { generatePageMetadata } from "@/lib/seo";

// Import all sections to pass them as Server Components
import { AboutMe2 } from "@/components/sections/AboutMe2";
import { ProjectCarousel2 } from "@/components/sections/ProjectCarousel2";
import { TechStack2 } from "@/components/sections/TechStack2";
import { TechStack3 } from "@/components/sections/TechStack3";
import { TechStack4 } from "@/components/sections/TechStack4";
import { BlogHighlight4 } from "@/components/sections/BlogHighlight4";

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
        aboutMe2={<AboutMe2 />}
        projectCarousel={<ProjectCarousel2 />}
        techStack2={<TechStack2 />}
        techStack3={<TechStack3 />}
        techStack4={<TechStack4 />}
        blogHighlight4={<BlogHighlight4 />}
      />

      <FinalCTA />
    </>
  );
}
