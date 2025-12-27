"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Folder from "@/components/primitives/misc/Folder";
import { projects } from "@/data/projects";
import { ProjectModal } from "./ProjectModal";
import { projects as projectColors } from "@/constants/theme";

// Project type based on the data structure
interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
}

// Category definitions with colors matching vitae bullet point palette
const CATEGORIES = {
  "Web Development": {
    color: projectColors.webDev, // sky-500 - A cool blue gas giant
    keywords: [
      "react",
      "next.js",
      "typescript",
      "tailwind",
      "javascript",
      "html",
      "css",
      "npm",
      "directus",
      "docker",
    ],
  },
  "ML/AI": {
    color: projectColors.mlAi, // fuchsia-500 - An exotic, vibrant star
    keywords: [
      "python",
      "sklearn",
      "ai/ml",
      "pytorch",
      "data science",
      "nlp",
      "xgboost",
    ],
  },
  Systems: {
    color: projectColors.systems, // amber-400 - A sandy, golden world
    keywords: [
      "c",
      "golang",
      "go",
      "linux",
      "bash",
      "concurrency",
      "systems programming",
    ],
  },
  "Tools & Automation": {
    color: projectColors.tools, // emerald-500 - A lush, temperate world
    keywords: [
      "python",
      "webscraping",
      "automation",
      "bs4",
      "mongodb",
      "file generation",
      "nlp",
      "html",
      "apis",
      "json",
    ],
  },
  Other: {
    color: projectColors.other, // indigo-400 - A deep violet nebula
    keywords: [],
  },
} as const;

type CategoryName = keyof typeof CATEGORIES;

interface CategorizedProjects {
  [key: string]: Project[];
}

/**
 * Categorizes projects based on their tags and description
 */
function categorizeProject(project: Project): CategoryName {
  const searchText =
    `${project.title} ${project.description} ${project.tags.join(" ")}`.toLowerCase();

  for (const [categoryName, category] of Object.entries(CATEGORIES)) {
    if (categoryName === "Other") {
      continue;
    }

    if (
      category.keywords.some((keyword) =>
        searchText.includes(keyword.toLowerCase())
      )
    ) {
      return categoryName as CategoryName;
    }
  }

  return "Other";
}

/**
 * Main Project File Cabinet Component
 * Displays projects organized in folders by category
 */
export function ProjectFileCabinet() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedProjectColor, setSelectedProjectColor] = useState<string>(
    projectColors.default
  );

  // Categorize projects
  const categorizedProjects = useMemo<CategorizedProjects>(() => {
    const categorized: CategorizedProjects = {};

    projects.forEach((project) => {
      const category = categorizeProject(project);
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(project);
    });

    return categorized;
  }, []);

  const handlePaperClick = (project: Project, categoryColor: string) => {
    setSelectedProject(project);
    setSelectedProjectColor(categoryColor);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 py-16">
      {/* Graph Paper Grid Background - Can be replaced with DotGrid component in the future */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(100, 116, 139, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          backgroundPosition: "0 0",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="font-heading text-4xl font-bold text-slate-50 md:text-5xl">
            Project File Cabinet
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-300">
            Explore my projects organized by category. Click folders to open,
            then click papers to view details.
          </p>
        </div>

        {/* File Cabinet Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(CATEGORIES).map(([categoryName, category]) => {
            const categoryProjects = categorizedProjects[categoryName] || [];

            return (
              <ProjectFolder
                key={categoryName}
                categoryName={categoryName}
                color={category.color}
                projects={categoryProjects}
                onPaperClick={(project) =>
                  handlePaperClick(project, category.color)
                }
              />
            );
          })}
        </div>
      </div>

      {/* Project Detail Modal */}
      {selectedProject && (
        <ProjectModal
          key={selectedProject.title}
          project={selectedProject}
          isOpen={true}
          onClose={handleCloseModal}
          accentColor={selectedProjectColor}
        />
      )}
    </div>
  );
}

/**
 * Project Folder Component
 * Wraps the Folder component with project-specific logic
 */
interface ProjectFolderProps {
  categoryName: string;
  color: string;
  projects: Project[];
  onPaperClick: (project: Project, categoryColor: string) => void;
}

function ProjectFolder({
  categoryName,
  color,
  projects,
  onPaperClick,
}: ProjectFolderProps) {
  // Get up to 3 projects for the folder papers (only actual projects, no empty items)
  const displayProjects = projects.filter(Boolean).slice(0, 3);

  // Create paper items based on count and position requirements:
  // 3 items: [0, 1, 2] -> positions [0, 1, 2]
  // 2 items: [0, 1] -> positions [0, null, 2] (first and third)
  // 1 item: [0] -> positions [null, 1, null] (second only)
  // Note: index here refers to the paper position (0=image, 1=title, 2=tags), not array index
  const paperItems: (React.ReactNode | null)[] = [];

  if (displayProjects.length === 3) {
    paperItems.push(
      <ProjectPaper
        key={displayProjects[0].title}
        project={displayProjects[0]}
        index={0}
        onClick={() => onPaperClick(displayProjects[0], color)}
      />,
      <ProjectPaper
        key={displayProjects[1].title}
        project={displayProjects[1]}
        index={1}
        onClick={() => onPaperClick(displayProjects[1], color)}
      />,
      <ProjectPaper
        key={displayProjects[2].title}
        project={displayProjects[2]}
        index={2}
        onClick={() => onPaperClick(displayProjects[2], color)}
      />
    );
  } else if (displayProjects.length === 2) {
    paperItems.push(
      <ProjectPaper
        key={displayProjects[0].title}
        project={displayProjects[0]}
        index={0}
        onClick={() => onPaperClick(displayProjects[0], color)}
      />,
      null,
      <ProjectPaper
        key={displayProjects[1].title}
        project={displayProjects[1]}
        index={2}
        onClick={() => onPaperClick(displayProjects[1], color)}
      />
    );
  } else if (displayProjects.length === 1) {
    paperItems.push(
      null,
      <ProjectPaper
        key={displayProjects[0].title}
        project={displayProjects[0]}
        index={1}
        onClick={() => onPaperClick(displayProjects[0], color)}
      />,
      null
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="mb-8 text-center">
        <h3 className="text-sm font-semibold text-slate-300">{categoryName}</h3>
        <p className="text-xs text-slate-500">
          {projects.length} project{projects.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="cursor-pointer">
        <Folder color={color} size={1.2} items={paperItems} />
      </div>
    </motion.div>
  );
}

/**
 * Project Paper Component
 * Individual project representation inside a folder
 */
interface ProjectPaperProps {
  project: Project;
  index: number;
  onClick: () => void;
}

function ProjectPaper({ project, index, onClick }: ProjectPaperProps) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="flex h-full w-full flex-col items-center justify-center gap-1 p-2 text-center transition-all hover:scale-105"
    >
      {index === 0 && project.imageUrl && (
        <img
          src={project.imageUrl}
          alt={project.title}
          className="h-8 w-8 rounded object-contain"
        />
      )}
      {index === 1 && (
        <span className="text-xs font-semibold text-slate-800 line-clamp-2">
          {project.title}
        </span>
      )}
      {index === 2 && (
        <div className="flex flex-wrap gap-1 justify-center">
          {project.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
