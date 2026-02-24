import React from "react";
import Image from "next/image";
import { Github, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/primitives/Button";
import { projects } from "@/data/projects";

type Project = (typeof projects)[0];

// The individual card component for a project
export function ProjectCard2({ project }: { project: Project }) {
  return (
    <div className="card-hover group relative flex h-full flex-col overflow-hidden rounded-lg border border-slate-700 bg-slate-800 transition-all duration-300 hover:border-slate-500 hover:shadow-2xl hover:shadow-sky-900/50">
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-heading text-xl font-semibold text-slate-50">
          {project.title}
        </h3>
        <p className="mt-3 flex-grow text-slate-300">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-sky-300"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mt-6 flex items-center space-x-4">
          <Button asChild variant="outline" size="sm">
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer">
              Live Demo <ArrowUpRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button asChild variant="ghost" size="sm">
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="mr-2 h-4 w-4" /> Source
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
