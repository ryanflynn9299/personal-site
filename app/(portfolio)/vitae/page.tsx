import type { Metadata } from "next";
import { Download, ArrowRight } from "lucide-react";
import Link from "next/link";
import { vitaeData } from "@/data/work_experience";
import { DownloadButton } from "@/components/primitives/DownloadButton";
import { VitaeExperienceSection } from "@/components/vitae/VitaeExperienceSection";
import { generatePageMetadata } from "@/lib/site/seo";
import { runtime } from "@/lib/config";

export const metadata: Metadata = generatePageMetadata({
  title: "Vitae",
  description:
    "A comprehensive Curriculum Vitae for Ryan Flynn, detailing work experience, projects, skills, and education. Download the PDF resume or explore online.",
  path: "/vitae",
});

export default function VitaePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-heading text-4xl font-bold text-slate-50">
            Curriculum Vitae
          </h1>
          <p className="mt-2 text-slate-400">
            A detailed overview of my professional journey.
          </p>
        </div>
        {/* FIX 1: The download link now correctly points to a PDF file,
                  which should be placed in the `public` directory of your project.
                  The `download` attribute suggests a user-friendly filename.
                */}
        <DownloadButton
          href="/Ryan_Flynn_Resume2025.pdf"
          download="RyanFlynn-Resume.pdf"
        >
          <Download className="mr-2 h-4 w-4" />
          Download My Resume
        </DownloadButton>
      </div>

      <div className="mt-12 space-y-12">
        <VitaeExperienceSection experience={vitaeData.experience} />

        {/* Projects Section */}
        <section>
          <div className="flex items-end gap-2 border-b border-slate-700 pb-2">
            <h2 className="font-heading text-2xl font-semibold text-slate-100">
              Projects
            </h2>
            {runtime.previewFeatures && (
              <Link
                href="/projects-cabinet"
                className="group flex items-center gap-1 rounded px-2 py-1 text-sm text-sky-300 transition-colors hover:bg-slate-800 hover:text-sky-300"
                title="View Project File Cabinet (Dev Only)"
              >
                {/*<span className="text-xs">File Cabinet</span>*/}
                <span className="text-xs font-semibold">More Projects</span>
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
          {/* FIX 2: The mapping logic is now safe. It uses structured data
                      and will render correctly without runtime errors.
                    */}
          <div className="mt-6 space-y-6">
            {vitaeData.projects.map(
              (
                project: { name: string; link: string; description: string },
                index: number
              ) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold text-sky-300 hover:underline">
                    <Link href={project.link}>{project.name}</Link>
                  </h3>
                  <p className="mt-1 text-slate-300">{project.description}</p>
                </div>
              )
            )}
          </div>
        </section>

        {/* Skills Section */}
        <section>
          <h2 className="border-b border-slate-700 pb-2 font-heading text-2xl font-semibold text-slate-100">
            Skills
          </h2>
          {/* FIX 2 (cont.): The skills data is now a populated array of strings. */}
          <div className="mt-6 flex flex-wrap gap-2">
            {vitaeData.skills.map((skill: string) => (
              <span
                key={skill}
                className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-sky-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
