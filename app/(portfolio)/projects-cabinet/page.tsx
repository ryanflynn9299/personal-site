import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { generatePageMetadata } from "@/lib/seo";

// Lazy load ProjectFileCabinet to reduce initial bundle size
// This component is heavy with lots of interactive logic
const ProjectFileCabinet = dynamic(
  () =>
    import("@/components/projects/ProjectFileCabinet").then((mod) => ({
      default: mod.ProjectFileCabinet,
    })),
  {
    ssr: false, // Client-side only component
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-600 border-t-sky-400 mx-auto" />
          <p className="text-slate-400">Loading project cabinet...</p>
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = generatePageMetadata({
  title: "Project File Cabinet",
  description:
    "Explore projects organized by category in an interactive file cabinet interface. Browse Ryan Flynn's portfolio of software engineering projects.",
  path: "/projects-cabinet",
});

export default function ProjectsCabinetPage() {
  return <ProjectFileCabinet />;
}
