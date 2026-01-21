"use client";

import { Carousel } from "@/components/carousel/Carousel";
import { ProjectCard, Project } from "@/components/carousel/ProjectCard";
import { SectionHeader } from "@/components/sections/SectionHeader";
import { projects } from "@/data/projects";
import { useHasMounted } from "@/lib/hooks/useHasMounted";

/**
 * Featured Projects Carousel Section
 * 
 * A section component that displays featured projects in a carousel format.
 * Uses the generic Carousel component for maximum reusability and flexibility.
 */
export function ProjectCarousel() {
  const hasMounted = useHasMounted();

  if (!hasMounted) {
    return (
      <section className="relative">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <SectionHeader
              title="Featured Projects"
              subtitle="A selection of projects that showcase my skills and passion for building things."
            />
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <ProjectCard key={project.title} project={project} index={index} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="py-6">
          <SectionHeader
            title="Featured Projects"
            subtitle="A selection of projects that showcase my skills and passion for building things."
          />
        </div>

        {/* Carousel */}
        <div className="mt-12">
          <Carousel<Project>
            items={projects}
            renderCard={(project, index) => (
              <ProjectCard project={project} index={index} />
            )}
            breakpoints={{
              mobile: 1,
              tablet: 2,
              desktop: 3,
            }}
            showNavigation={true}
            showDots={true}
            navigationLabels={{
              previous: "Previous project",
              next: "Next project",
            }}
            ariaLabel="Featured projects carousel"
            cardGap="0.5rem"
          />
        </div>
      </div>
    </section>
  );
}
