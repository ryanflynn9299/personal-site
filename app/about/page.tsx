import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
    title: "About Me",
    description: "Learn more about John Doe's passions, interests, and professional journey.",
};

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <h1 className="font-heading text-4xl font-bold text-slate-50">About Me</h1>
            <p className="mt-4 text-lg text-slate-300">
                Beyond the code, here's a little more about who I am.
            </p>

            <div className="mt-16 space-y-24">
                {/* Section 1: Text Left, Image Right */}
                <section className="flex flex-col items-center gap-12 md:flex-row">
                    <div className="md:w-1/2">
                        <h2 className="font-heading text-2xl font-semibold text-slate-100">My Philosophy</h2>
                        <p className="mt-4 text-slate-300">
                            I believe in the power of technology to solve real-world problems. My approach to software development is rooted in craftsmanship, continuous learning, and a deep commitment to user-centric design. I strive to write code that is not only functional but also clean, maintainable, and elegant.
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Image
                            src="https://placehold.co/600x400/0f172a/7dd3fc" // Placeholder
                            alt="A symbolic image of a development philosophy"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </section>

                {/* Section 2: Image Left, Text Right */}
                <section className="flex flex-col items-center gap-12 md:flex-row-reverse">
                    <div className="md:w-1/2">
                        <h2 className="font-heading text-2xl font-semibold text-slate-100">Interests & Hobbies</h2>
                        <p className="mt-4 text-slate-300">
                            When I'm not at my keyboard, you can find me exploring the great outdoors, hiking through mountain trails, or experimenting with landscape photography. I'm also an avid reader of science fiction and a lifelong learner, always picking up new skills, from playing the guitar to learning a new language.
                        </p>
                    </div>
                    <div className="md:w-1/2">
                        <Image
                            src="https://placehold.co/600x400/0f172a/e2e8f0" // Placeholder
                            alt="A photo representing hobbies like hiking or photography"
                            width={600}
                            height={400}
                            className="rounded-lg shadow-lg"
                        />
                    </div>
                </section>
            </div>
        </div>
    );
}