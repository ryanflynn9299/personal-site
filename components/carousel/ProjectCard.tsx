"use client";

import Image from "next/image";
import { Github, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";

// Blur placeholder data URL - a tiny slate-800 colored image for blur effect
const BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAYSURBVHgB7cEBDQAAAMKg909tDwcUAAAAAOBvAQABAAElFTkSuQmCC";

export interface Project {
  title: string;
  description: string;
  imageUrl: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
}

export interface ProjectCardProps {
  project: Project;
  index: number;
}

/**
 * Project card component for use in carousels
 * Renders a project with image, title, description, tags, and action buttons
 */
export function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <div className="card-hover group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-slate-500 hover:shadow-2xl hover:shadow-sky-900/50">
      <div
        className="relative w-full overflow-hidden"
        style={{ aspectRatio: "16/9", minHeight: "192px" }}
      >
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          loading={index < 3 ? "eager" : "lazy"}
          priority={index === 0}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-heading text-lg font-semibold text-slate-50">
          {project.title}
        </h3>
        <p className="mt-2 flex-grow text-sm text-slate-300">
          {project.description}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-sky-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-4 flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View live demo of ${project.title}`}
            >
              Live Demo <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View source code for ${project.title}`}
            >
              <Github className="mr-2 h-4 w-4" /> Source
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
