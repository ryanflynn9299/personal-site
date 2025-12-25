import type { Metadata } from "next";
import { ProjectFileCabinet } from "@/components/projects/ProjectFileCabinet";

export const metadata: Metadata = {
  title: "Project File Cabinet",
  description: "Explore projects organized by category in an interactive file cabinet interface.",
};

export default function ProjectsCabinetPage() {
  return <ProjectFileCabinet />;
}

