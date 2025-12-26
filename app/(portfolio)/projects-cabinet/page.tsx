import type { Metadata } from "next";
import { ProjectFileCabinet } from "@/components/projects/ProjectFileCabinet";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Project File Cabinet",
  description:
    "Explore projects organized by category in an interactive file cabinet interface. Browse Ryan Flynn's portfolio of software engineering projects.",
  path: "/projects-cabinet",
});

export default function ProjectsCabinetPage() {
  return <ProjectFileCabinet />;
}

