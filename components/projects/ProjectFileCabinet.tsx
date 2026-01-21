"use client";

import React, {
  useState,
  useMemo,
  useRef,
  useEffect,
  useTransition,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Folder from "@/components/primitives/misc/Folder";
import { projects } from "@/data/projects";
import { ProjectModal } from "./ProjectModal";
import { projects as projectColors } from "@/constants/theme";
import { ProjectSearchBar } from "./ProjectSearchBar";
import {
  searchProjects,
  type Project as SearchProject,
} from "@/lib/project-search";
import { env } from "@/lib/env";
import { ProjectListView } from "./ProjectListView";

// Search feature toggle - must be true AND dev mode enabled for search to show
const isSearchEnabled = false;

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
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [, startTransition] = useTransition();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [focusedFolderIndex, setFocusedFolderIndex] = useState<number | null>(
    null
  );
  const folderRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<CategoryName | null>(
    null
  );

  // Initialize folder refs array
  useEffect(() => {
    const categoryCount = Object.keys(CATEGORIES).length;
    folderRefs.current = folderRefs.current.slice(0, categoryCount);
  }, []);

  // Handle view all and back to folders
  const handleViewAll = (categoryName: CategoryName) => {
    setExpandedCategory(categoryName);
    // Clear folder focus when expanding
    setFocusedFolderIndex(null);
  };

  const handleBackToFolders = () => {
    setExpandedCategory(null);
  };

  // Debounce search query (500ms delay)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      startTransition(() => {
        setDebouncedSearchQuery(searchQuery);
      });
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, startTransition]);

  // Filter projects based on search query
  const filteredProjects = useMemo<Project[]>(() => {
    if (!debouncedSearchQuery.trim()) {
      return projects; // Return all if no search
    }
    const results = searchProjects(
      projects as SearchProject[],
      debouncedSearchQuery.trim()
    );
    return results.map((result) => result.project);
  }, [debouncedSearchQuery]);

  // Categorize filtered projects
  const categorizedProjects = useMemo<CategorizedProjects>(() => {
    const categorized: CategorizedProjects = {};

    filteredProjects.forEach((project) => {
      const category = categorizeProject(project);
      if (!categorized[category]) {
        categorized[category] = [];
      }
      categorized[category].push(project);
    });

    return categorized;
  }, [filteredProjects]);

  // Clear expanded view when search results change and expanded category has no results
  useEffect(() => {
    if (expandedCategory && debouncedSearchQuery.trim()) {
      const categoryProjects = categorizedProjects[expandedCategory] || [];
      if (categoryProjects.length === 0) {
        setExpandedCategory(null);
      }
    }
  }, [debouncedSearchQuery, expandedCategory, categorizedProjects]);

  const handlePaperClick = (project: Project, categoryColor: string) => {
    setSelectedProject(project);
    setSelectedProjectColor(categoryColor);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  // Arrow key navigation handler for folders
  const handleFolderKeyDown = (e: React.KeyboardEvent, index: number) => {
    const totalFolders = Object.keys(CATEGORIES).length;
    let newIndex = index;

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      newIndex = (index + 1) % totalFolders;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      newIndex = (index - 1 + totalFolders) % totalFolders;
    } else if (e.key === "Home") {
      e.preventDefault();
      newIndex = 0;
    } else if (e.key === "End") {
      e.preventDefault();
      newIndex = totalFolders - 1;
    }

    if (newIndex !== index) {
      setFocusedFolderIndex(newIndex);
      // Focus will be handled by the ref callback
      setTimeout(() => {
        folderRefs.current[newIndex]?.focus();
        folderRefs.current[newIndex]?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 0);
    }
  };

  // Background effect variant - default to sunburst to match main app
  const backgroundVariant: "vignette" | "sunburst" = "sunburst";

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

      {/* Background Effect - Vignette or Sunburst */}
      <div
        className="fixed inset-0 pointer-events-none z-[1]"
        style={{
          background:
            backgroundVariant === "sunburst"
              ? "radial-gradient(ellipse at top, rgba(30, 41, 59, 0.3), rgba(15, 23, 42, 0.5) 50%, rgba(0, 0, 0, 0.3) 100%)"
              : "radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, 0.25) 100%)",
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

        {/* Search Bar - Dev Mode Only */}
        {isSearchEnabled && env.devModeUI && (
          <>
            <ProjectSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={
                debouncedSearchQuery.trim()
                  ? filteredProjects.length
                  : undefined
              }
            />

            {/* No Results State */}
            {debouncedSearchQuery.trim() && filteredProjects.length === 0 && (
              <div className="mb-12 text-center">
                <p className="font-mono text-lg text-slate-400">
                  No projects found matching '{debouncedSearchQuery}'
                </p>
              </div>
            )}
          </>
        )}

        {/* Conditional Rendering: Folder Grid or Expanded View */}
        <AnimatePresence mode="wait">
          {expandedCategory ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ExpandedProjectsView
                categoryName={expandedCategory}
                projects={categorizedProjects[expandedCategory] || []}
                categoryColor={
                  CATEGORIES[expandedCategory]?.color || projectColors.default
                }
                onProjectClick={(project) => {
                  const category = categorizeProject(project);
                  handlePaperClick(
                    project,
                    CATEGORIES[category]?.color || projectColors.default
                  );
                }}
                onBack={handleBackToFolders}
              />
            </motion.div>
          ) : (
            <motion.div
              key="folders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <section
                role="region"
                aria-label="Project file cabinet"
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
              >
                {Object.entries(CATEGORIES).map(
                  ([categoryName, category], index) => {
                    const categoryProjects =
                      categorizedProjects[categoryName] || [];

                    return (
                      <ProjectFolder
                        key={categoryName}
                        categoryName={categoryName}
                        color={category.color}
                        projects={categoryProjects}
                        onPaperClick={(project) =>
                          handlePaperClick(project, category.color)
                        }
                        folderIndex={index}
                        folderRef={(el) => {
                          folderRefs.current[index] = el;
                        }}
                        onKeyDown={(e) => handleFolderKeyDown(e, index)}
                        isFocused={focusedFolderIndex === index}
                        onFocus={() => setFocusedFolderIndex(index)}
                        onViewAll={
                          categoryProjects.length > 3 &&
                          categoryProjects.length > 0
                            ? () => handleViewAll(categoryName as CategoryName)
                            : undefined
                        }
                      />
                    );
                  }
                )}
              </section>
            </motion.div>
          )}
        </AnimatePresence>
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
  folderIndex: number;
  folderRef: (el: HTMLDivElement | null) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isFocused: boolean;
  onFocus: () => void;
  onViewAll?: (categoryName: string) => void;
}

function ProjectFolder({
  categoryName,
  color,
  projects,
  onPaperClick,
  folderIndex,
  folderRef,
  onKeyDown,
  isFocused,
  onFocus,
  onViewAll,
}: ProjectFolderProps) {
  const [isFolderOpen, setIsFolderOpen] = useState(false);

  // Get up to 3 projects for the folder papers
  const displayProjects = projects.filter(Boolean).slice(0, 3);

  // Create paper items as a collection of equitable items
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

  const projectCountId = `folder-${folderIndex}-count`;
  const projectCount = projects.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <div className="mb-8 text-center">
        <h3 className="text-sm font-semibold text-slate-300">{categoryName}</h3>
        <p id={projectCountId} className="text-xs text-slate-500">
          {projectCount} project{projectCount !== 1 ? "s" : ""}
        </p>
      </div>
      <div
        ref={folderRef}
        role="button"
        tabIndex={0}
        aria-label={`${categoryName} folder, ${projectCount} project${projectCount !== 1 ? "s" : ""}`}
        aria-expanded={isFolderOpen}
        aria-describedby={projectCountId}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-lg transition-all"
      >
        <Folder
          color={color}
          size={1.2}
          items={paperItems}
          onOpenChange={setIsFolderOpen}
        />
      </div>
      {/* View All Button - appears when folder is open and has more than 3 projects */}
      {isFolderOpen && projects.length > 3 && onViewAll && (
        <button
          onClick={() => onViewAll(categoryName)}
          className="mt-2 flex items-center gap-1 font-mono text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          style={{
            color: color,
          }}
          aria-label={`View all ${projects.length} projects in ${categoryName}`}
        >
          View All →
        </button>
      )}
    </motion.div>
  );
}

/**
 * Project Paper Component
 * Individual project card inside a folder
 */
interface ProjectPaperProps {
  project: Project;
  index: number;
  onClick: () => void;
}

function ProjectPaper({ project, onClick }: ProjectPaperProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`View ${project.title} project details`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={handleKeyDown}
      className="flex h-full w-full flex-col items-center justify-center transition-all hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-1 rounded"
    >
      <span className="font-mono text-[10px] font-semibold text-slate-800 text-center px-2 leading-tight select-none pointer-events-none">
        {project.title}
      </span>
    </div>
  );
}

/**
 * Expanded Projects View Component
 * Two-pane layout: left pane shows folder, right pane shows scrollable project list
 */
interface ExpandedProjectsViewProps {
  categoryName: CategoryName;
  projects: Project[];
  categoryColor: string;
  onProjectClick: (project: Project) => void;
  onBack: () => void;
}

function ExpandedProjectsView({
  categoryName,
  projects,
  categoryColor,
  onProjectClick,
  onBack,
}: ExpandedProjectsViewProps) {
  const [focusedProjectIndex, setFocusedProjectIndex] = useState<number | null>(
    null
  );
  const projectRefs = useRef<(HTMLDivElement | null)[]>([]);
  const backButtonRef = useRef<HTMLButtonElement | null>(null);

  // Initialize project refs
  useEffect(() => {
    projectRefs.current = projectRefs.current.slice(0, projects.length);
  }, [projects.length]);

  // Focus back button on mount
  useEffect(() => {
    backButtonRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onBack();
      return;
    }

    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex =
        focusedProjectIndex === null
          ? 0
          : (focusedProjectIndex + 1) % projects.length;
      setFocusedProjectIndex(nextIndex);
      setTimeout(() => {
        projectRefs.current[nextIndex]?.focus();
      }, 0);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      const prevIndex =
        focusedProjectIndex === null
          ? projects.length - 1
          : (focusedProjectIndex - 1 + projects.length) % projects.length;
      setFocusedProjectIndex(prevIndex);
      setTimeout(() => {
        projectRefs.current[prevIndex]?.focus();
      }, 0);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedProjectIndex(0);
      setTimeout(() => {
        projectRefs.current[0]?.focus();
      }, 0);
    } else if (e.key === "End") {
      e.preventDefault();
      const lastIndex = projects.length - 1;
      setFocusedProjectIndex(lastIndex);
      setTimeout(() => {
        projectRefs.current[lastIndex]?.focus();
      }, 0);
    }
  };

  const handleBackKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onBack();
    }
  };

  // Create paper items for the folder display in sidebar
  const paperItems: (React.ReactNode | null)[] = [];
  const displayProjects = projects.filter(Boolean).slice(0, 3);

  if (displayProjects.length === 3) {
    paperItems.push(
      <ProjectPaper
        key={displayProjects[0].title}
        project={displayProjects[0]}
        index={0}
        onClick={() => {}}
      />,
      <ProjectPaper
        key={displayProjects[1].title}
        project={displayProjects[1]}
        index={1}
        onClick={() => {}}
      />,
      <ProjectPaper
        key={displayProjects[2].title}
        project={displayProjects[2]}
        index={2}
        onClick={() => {}}
      />
    );
  } else if (displayProjects.length === 2) {
    paperItems.push(
      <ProjectPaper
        key={displayProjects[0].title}
        project={displayProjects[0]}
        index={0}
        onClick={() => {}}
      />,
      null,
      <ProjectPaper
        key={displayProjects[1].title}
        project={displayProjects[1]}
        index={2}
        onClick={() => {}}
      />
    );
  } else if (displayProjects.length === 1) {
    paperItems.push(
      null,
      <ProjectPaper
        key={displayProjects[0].title}
        project={displayProjects[0]}
        index={1}
        onClick={() => {}}
      />,
      null
    );
  }

  return (
    <div className="w-full bg-slate-950 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pt-8">
      <section
        role="region"
        aria-label={`All projects in ${categoryName} category`}
        className="flex w-full min-h-[calc(100vh-12rem)]"
        onKeyDown={handleKeyDown}
      >
        {/* Left Container - Folder Display (30% width on medium+ screens) */}
        <div className="w-full md:w-[30%] flex flex-col pr-0 md:pr-8 border-r-0 md:border-r border-slate-800 min-h-[calc(100vh-12rem)]">
          <div className="flex-1 flex items-center justify-center">
            <div className="pointer-events-none opacity-75">
              <Folder
                color={categoryColor}
                size={1.2}
                items={paperItems}
                ariaExpanded={true}
                defaultOpen={true}
              />
            </div>
          </div>
        </div>

        {/* Right Container - Title, Back Button, and List View (70% width on medium+ screens) */}
        <div className="w-full md:w-[70%] overflow-y-auto pl-0 md:pl-8">
          {/* Header with back button */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              className="font-heading text-2xl font-bold md:text-3xl"
              style={{ color: categoryColor }}
            >
              {categoryName}
            </h2>
            <button
              ref={backButtonRef}
              onClick={onBack}
              onKeyDown={handleBackKeyDown}
              className="flex items-center gap-2 rounded-lg border-2 px-4 py-2 font-mono text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              style={{
                borderColor: categoryColor,
                color: categoryColor,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${categoryColor}20`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Back to folder view"
            >
              ← Back
            </button>
          </div>

          {/* Projects List - Narrower width, using ProjectListView */}
          <div className="max-w-2xl">
            <ProjectListView
              projects={projects}
              categoryColor={categoryColor}
              onProjectClick={onProjectClick}
              focusedProjectIndex={focusedProjectIndex}
              onProjectRef={(index, el) => {
                projectRefs.current[index] = el;
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
