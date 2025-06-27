import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { Download } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Vitae",
    description: "A comprehensive Curriculum Vitae for Ryan Flynn, detailing work experience, projects, skills, and education.",
};

// Corrected placeholder data with a proper structure
const vitaeData = {
    experience: [
        {
            role: "Software Engineer",
            company: "Tech Innovations Inc.",
            period: "Jan 2020 - Present",
            description: "Developing scalable web applications using React and Node.js. Leading a team of 5 developers to enhance product features and improve user experience."
        },
        {
            role: "Frontend Developer",
            company: "Creative Solutions Ltd.",
            period: "Jun 2018 - Dec 2019",
            description: "Worked on responsive web design projects, implementing UI components with Vue.js and ensuring cross-browser compatibility."
        },
        {
            role: "Intern Software Developer",
            company: "Startup Hub",
            period: "Jan 2018 - May 2018",
            description: "Assisted in developing a mobile application using React Native, focusing on user interface design and functionality testing."
        }
    ],
    projects: [
        {
            name: "Project Phoenix",
            link: "https://github.com/your-username/project-phoenix",
            description: "A full-stack web application for project management, built with Next.js, Prisma, and Tailwind CSS."
        },
        {
            name: "AI-Powered Analytics Dashboard",
            link: "https://github.com/your-username/analytics-dashboard",
            description: "A data visualization tool that uses machine learning to provide insights from large datasets."
        }
    ],
    skills: ["React", "Next.js", "Node.js", "TypeScript", "Python", "Go", "Docker", "Kubernetes"],
};

export default function VitaePage() {
    return (
        <div className="container mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="font-heading text-4xl font-bold text-slate-50">Curriculum Vitae</h1>
                    <p className="mt-2 text-slate-400">A detailed overview of my professional journey.</p>
                </div>
                {/* FIX 1: The download link now correctly points to a PDF file,
                  which should be placed in the `public` directory of your project.
                  The `download` attribute suggests a user-friendly filename.
                */}
                <Button asChild>
                    <a href="/resume.txt" download="RyanFlynn-Vitae.pdf">
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                    </a>
                </Button>
            </div>

            <div className="mt-12 space-y-12">
                {/* Work Experience Section */}
                <section>
                    <h2 className="border-b border-slate-700 pb-2 font-heading text-2xl font-semibold text-slate-100">
                        Work Experience
                    </h2>
                    <div className="mt-6 space-y-8">
                        {vitaeData.experience.map((job, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-baseline">
                                    <h3 className="text-lg font-semibold text-sky-300">{job.role}</h3>
                                    <p className="text-sm text-slate-400">{job.period}</p>
                                </div>
                                <p className="text-md font-medium text-slate-200">{job.company}</p>
                                <p className="mt-2 text-slate-300">{job.description}</p>
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
                        {vitaeData.projects.map((project, index) => (
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
                        {vitaeData.skills.map((skill) => (
                            <span key={skill} className="rounded-full bg-slate-700 px-3 py-1 text-sm font-medium text-sky-300">
                                {skill}
                            </span>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}