import type { Metadata } from "next";
import { Download } from "lucide-react";
import Link from "next/link";
import { vitaeData } from "@/data/work_experience";
import { DownloadButton } from "@/components/common/DownloadButton";

export const metadata: Metadata = {
  title: "Vitae",
  description:
    "A comprehensive Curriculum Vitae for Ryan Flynn, detailing work experience, projects, skills, and education.",
};

// Bullet point colors
const colorPalette = [
  { ring: "ring-sky-500", bg: "bg-sky-500" }, // A cool blue gas giant
  { ring: "ring-rose-500", bg: "bg-rose-500" }, // A terrestrial red planet
  { ring: "ring-amber-400", bg: "bg-amber-400" }, // A sandy, golden world
  { ring: "ring-teal-400", bg: "bg-teal-400" }, // An oceanic, green-blue planet
  { ring: "ring-indigo-400", bg: "bg-indigo-400" }, // A deep violet nebula
  { ring: "ring-lime-400", bg: "bg-lime-400" }, // An acidic, gaseous planet
  { ring: "ring-fuchsia-500", bg: "bg-fuchsia-500" }, // An exotic, vibrant star
  { ring: "ring-emerald-500", bg: "bg-emerald-500" }, // A lush, temperate world
];

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
        {/* Work Experience Section */}
        <section>
          <h2 className="border-b border-slate-700 pb-2 font-heading text-2xl font-semibold text-slate-100">
            Work Experience
          </h2>
          <div className="mt-6 space-y-8">
            {vitaeData.experience.map((job: any, index: number) => (
              <div key={index}>
                <div className="flex justify-between items-baseline">
                  <h3 className="text-lg font-semibold text-sky-300">
                    {job.role}
                  </h3>
                  <p className="text-sm text-slate-400">{job.period}</p>
                </div>
                <p className="text-md font-medium text-slate-200">
                  {job.company}
                </p>
                <ul className="mt-4 space-y-2">
                  {job.description.map((item: any, itemIndex: number) => {
                    // Mix up the colors of the bullet points sufficiently
                    const colors =
                      colorPalette[
                        (8 - index + itemIndex + 1) % colorPalette.length
                      ];
                    const isLastItem = itemIndex === job.description.length - 1;

                    return (
                      <li
                        key={itemIndex}
                        className="relative flex gap-x-4 items-start"
                      >
                        {/* Vertical Line element. */}
                        {/* It is only rendered if it's NOT the last item in the list. */}
                        {!isLastItem && (
                          <div className="absolute left-2 h-full top-4 bottom-0 w-px bg-slate-700" />
                        )}

                        {/* Dot: appears on top of the line due to DOM order. */}
                        <div className="relative mt-2 flex h-4 w-4 flex-none items-center justify-center">
                          <div
                            className={`absolute h-full w-full rounded-full bg-slate-800 ring-1 ${colors.ring}`}
                          />
                          <div
                            className={`relative h-1.5 w-1.5 rounded-full ${colors.bg}`}
                          />
                        </div>

                        {/* Text Content: Add padding-bottom to ensure there's space for the line to draw into. */}
                        <p
                          className={`flex-auto text-slate-300 ${!isLastItem ? "pb-4" : ""}`}
                        >
                          {item}
                        </p>
                      </li>
                    );
                  })}
                </ul>
                {/** Fallback implementation: use > or // as simple text bullet points **/}
                {/*<ul className="mt-2 space-y-1.5 text-slate-300">*/}
                {/*    {job.description.map((item, itemIndex) => (*/}
                {/*        <li key={itemIndex} className="flex gap-x-2">*/}
                {/*            <span className="font-mono text-slate-500">{">"}</span>*/}
                {/*            <span>{item}</span>*/}
                {/*        </li>*/}
                {/*    ))}*/}
                {/*</ul>*/}
                {/** Non-list implementation: **/}
                {/*<p className="mt-2 text-slate-300">{job.description}</p>*/}
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section>
          <h2 className="border-b border-slate-700 pb-2 font-heading text-2xl font-semibold text-slate-100">
            Projects
          </h2>
          {/* FIX 2: The mapping logic is now safe. It uses structured data
                      and will render correctly without runtime errors.
                    */}
          <div className="mt-6 space-y-6">
            {vitaeData.projects.map((project: any, index: number) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-sky-300 hover:underline">
                  <Link href={project.link}>{project.name}</Link>
                </h3>
                <p className="mt-1 text-slate-300">{project.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section>
          <h2 className="border-b border-slate-700 pb-2 font-heading text-2xl font-semibold text-slate-100">
            Skills
          </h2>
          {/* FIX 2 (cont.): The skills data is now a populated array of strings. */}
          <div className="mt-6 flex flex-wrap gap-2">
            {vitaeData.skills.map((skill: any) => (
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
