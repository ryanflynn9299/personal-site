"use client";

import React from "react";
import { motion } from "framer-motion";
import { useHasMounted } from "@/lib/hooks/useHasMounted";

// Project type based on the data structure
interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
}

interface ProjectListViewProps {
  projects: Project[];
  categoryColor: string;
  onProjectClick: (project: Project) => void;
  focusedProjectIndex?: number | null;
  onProjectRef?: (index: number, el: HTMLDivElement | null) => void;
}

/**
 * Project List View Component
 * Container-agnostic styled list that can be dropped in anywhere
 */
export function ProjectListView({
  projects,
  categoryColor,
  onProjectClick,
  focusedProjectIndex,
  onProjectRef,
}: ProjectListViewProps) {
  const hasMounted = useHasMounted();

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="font-mono text-lg text-slate-400">No projects found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => {
        const handleKeyDown = (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onProjectClick(project);
          }
        };

        const projectCard = (
          <div
            key={project.title}
            ref={(el) => onProjectRef?.(index, el)}
            role="button"
            tabIndex={0}
            aria-label={`View ${project.title} project details`}
            onClick={() => onProjectClick(project)}
            onKeyDown={handleKeyDown}
            className="group relative w-full cursor-pointer rounded-lg border-2 bg-slate-900/50 p-4 transition-all hover:border-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            style={{
              borderColor: `${categoryColor}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = categoryColor;
              e.currentTarget.style.boxShadow = `0 0 20px ${categoryColor}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${categoryColor}40`;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className="mb-2 font-mono text-base font-semibold"
                  style={{ color: categoryColor }}
                >
                  {project.title}
                </h3>
                {project.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-2 py-0.5 text-xs font-mono"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-400">{project.description}</p>
              </div>
            </div>
          </div>
        );

        if (!hasMounted) {
          return projectCard;
        }

        return (
          <motion.div
            key={project.title}
            ref={(el) => onProjectRef?.(index, el)}
            role="button"
            tabIndex={0}
            aria-label={`View ${project.title} project details`}
            onClick={() => onProjectClick(project)}
            onKeyDown={handleKeyDown}
            className="group relative w-full cursor-pointer rounded-lg border-2 bg-slate-900/50 p-4 transition-all hover:border-opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            style={{
              borderColor: `${categoryColor}40`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = categoryColor;
              e.currentTarget.style.boxShadow = `0 0 20px ${categoryColor}40`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = `${categoryColor}40`;
              e.currentTarget.style.boxShadow = "none";
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3
                  className="mb-2 font-mono text-base font-semibold"
                  style={{ color: categoryColor }}
                >
                  {project.title}
                </h3>
                {project.tags.length > 0 && (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded px-2 py-0.5 text-xs font-mono"
                        style={{
                          backgroundColor: `${categoryColor}20`,
                          color: categoryColor,
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-400">{project.description}</p>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
